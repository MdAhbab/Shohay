from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import engine, get_db, SessionLocal, Base
from .seed import seed_if_empty
from .ledger import append_ledger, verify_chain


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed demo data on first boot so a fresh clone works
    # without a manual migration/seed step (the DB file is gitignored).
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Shohay API", lifespan=lifespan)

# Credentials + "*" origin is rejected by browsers and is a needless attack
# surface; allow the local dev frontends explicitly. Override via env in prod.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data", response_model=schemas.InitializeResponse)
def get_all_data(db: Session = Depends(get_db)):
    divisions = db.query(models.AdminUnit).filter(models.AdminUnit.level == "division").all()
    upazilas = db.query(models.AdminUnit).filter(models.AdminUnit.level == "upazila").all()
    
    # group upazilas by parent division geocode
    upazilasByDivision = {}
    for u in upazilas:
        pid = u.parent_geocode
        if pid not in upazilasByDivision:
            upazilasByDivision[pid] = []
        upazilasByDivision[pid].append(u)
        
    campaigns = db.query(models.Campaign).all()
    nationalTotals = db.query(models.NationalTotal).first()
    needs = db.query(models.Need).all()
    ledgerRows = db.query(models.LedgerRow).all()
    proposedAllocations = db.query(models.Allocation).all()
    anomalies = db.query(models.Anomaly).all()
    myDonations = db.query(models.MyDonation).all()
    fieldLogs = db.query(models.FieldLog).all()
    managedUsers = db.query(models.ManagedUser).all()

    # Create managedCampaigns by merging data as expected
    # The DB stores needs_open and distributions inside Campaign
    
    return {
        "divisions": divisions,
        "upazilasByDivision": upazilasByDivision,
        "campaigns": campaigns,
        "nationalTotals": nationalTotals,
        "needs": needs,
        "ledgerRows": ledgerRows,
        "proposedAllocations": proposedAllocations,
        "anomalies": anomalies,
        "myDonations": myDonations,
        "myImpact": {
            "totalTaka": 17500,
            "donations": 4,
            "families": 96,
            "meals": 480,
            "upazilas": 4,
            "zakatTaka": 10000,
        },
        "fieldLogs": fieldLogs,
        "managedUsers": managedUsers,
        "managedCampaigns": campaigns
    }

# ---------------------------------------------------------------------------
# Documented read surface (per README §6) — real queries over the same tables.
# ---------------------------------------------------------------------------

@app.get("/api/geo/units", response_model=List[schemas.AdminUnitSchema])
def geo_units(level: str | None = None, parent: str | None = None,
              db: Session = Depends(get_db)):
    q = db.query(models.AdminUnit)
    if level:
        q = q.filter(models.AdminUnit.level == level)
    if parent:
        q = q.filter(models.AdminUnit.parent_geocode == parent)
    return q.all()


@app.get("/api/map/coverage")
def map_coverage(db: Session = Depends(get_db)):
    """Per-unit need / received / fulfillment for the choropleth."""
    units = db.query(models.AdminUnit).all()
    return [
        {
            "geocode": u.geocode,
            "level": u.level,
            "name_bn": u.name_bn,
            "name_en": u.name_en,
            "parent_geocode": u.parent_geocode,
            "need": u.need,
            "received": u.received,
            "fulfillment": u.fulfillment,
            "beneficiaries": u.beneficiaries,
        }
        for u in units
    ]


@app.get("/api/ledger", response_model=List[schemas.LedgerRowSchema])
def ledger_all(db: Session = Depends(get_db)):
    return db.query(models.LedgerRow).order_by(models.LedgerRow.id.desc()).all()


@app.get("/api/ledger/verify")
def ledger_verify(db: Session = Depends(get_db)):
    return verify_chain(db)


@app.get("/api/ledger/{ref}", response_model=List[schemas.LedgerRowSchema])
def ledger_for_ref(ref: str, db: Session = Depends(get_db)):
    rows = (
        db.query(models.LedgerRow)
        .filter(models.LedgerRow.ref == ref)
        .order_by(models.LedgerRow.id.asc())
        .all()
    )
    if not rows:
        raise HTTPException(status_code=404, detail="No ledger entries for that reference")
    return rows


@app.get("/api/donations/{donation_id}/track", response_model=schemas.TrackResponse)
def track_donation(donation_id: str, db: Session = Depends(get_db)):
    donation = db.query(models.MyDonation).filter(models.MyDonation.id == donation_id).first()
    chain = (
        db.query(models.LedgerRow)
        .filter(models.LedgerRow.ref == donation_id)
        .order_by(models.LedgerRow.id.asc())
        .all()
    )
    if donation is None and not chain:
        raise HTTPException(status_code=404, detail="Donation not found")
    return {
        "id": donation_id,
        "status": donation.status if donation else "pledged",
        "chain": chain,
    }


# ---------------------------------------------------------------------------
# Write surface — real persistence + an appended, hash-linked ledger entry.
# ---------------------------------------------------------------------------

def _area_labels(db: Session, geocode: str | None):
    if not geocode:
        return ("যেখানে প্রয়োজন", "Where needed")
    unit = db.query(models.AdminUnit).filter(models.AdminUnit.geocode == geocode).first()
    if unit:
        return (unit.name_bn, unit.name_en)
    return ("—", "—")


@app.post("/api/donations", response_model=schemas.DonationResult)
def create_donation(payload: schemas.DonationCreate, db: Session = Depends(get_db)):
    seq = db.query(models.MyDonation).count()
    donation_id = f"D-{50000 + seq + 1}"
    area_bn, area_en = _area_labels(db, payload.target_geocode)

    if payload.kind == "money":
        amount = payload.amount or 0
        summary_bn = f"৳ {amount:,.0f}"
        summary_en = f"৳ {amount:,.0f}"
    else:
        qty = payload.qty or 0
        summary_bn = f"{payload.item or payload.kind} ×{qty}"
        summary_en = f"{payload.item or payload.kind} ×{qty}"

    today = datetime.now(timezone.utc).strftime("%d %b %Y")
    donation = models.MyDonation(
        id=donation_id, date=today, kind=payload.kind,
        summary_bn=summary_bn, summary_en=summary_en,
        area_bn=area_bn, area_en=area_en,
        campaign_bn="—", campaign_en="—",
        status="pledged", zakat=payload.zakat,
    )
    db.add(donation)

    entry = append_ledger(
        db, action="pledge", ref=donation_id,
        amount=summary_en, area_bn=area_bn, area_en=area_en,
    )

    # Keep the public national counters honest as money flows in.
    totals = db.query(models.NationalTotal).first()
    if totals is not None:
        totals.donors = (totals.donors or 0) + 1
        if payload.kind == "money" and payload.amount:
            totals.crore = round((totals.crore or 0) + payload.amount / 1e7, 4)

    db.commit()
    return {
        "id": donation_id, "status": "pledged",
        "ts": entry.ts, "hash": entry.hash,
        "tracking_url": f"/track/{donation_id}",
    }


@app.post("/api/needs")
def create_need(payload: schemas.NeedCreate, db: Session = Depends(get_db)):
    seq = db.query(models.Need).count()
    need_id = f"N-{2000 + seq + 1}"
    area_bn, area_en = _area_labels(db, payload.geocode)
    need = models.Need(
        id=need_id, geocode=payload.geocode,
        area_bn=area_bn, area_en=area_en,
        kind=payload.kind, quantity=payload.quantity,
        severity=payload.severity, status="open", verified=False,
    )
    db.add(need)
    db.commit()
    return {"status": "ok", "id": need_id, "verified": False}


# Agent endpoints stay advisory/draft-only per AGENTS.md guardrails. The audit
# agent now returns a real, grounded integrity check instead of a canned string.
@app.post("/api/agents/needs-assess")
def agent_needs_assess():
    return {"status": "ok", "message": "Draft needs proposed", "drafted_needs": []}

@app.post("/api/agents/allocate")
def agent_allocate():
    return {"status": "ok", "message": "Proposed allocations generated"}

@app.post("/api/agents/audit")
def agent_audit(db: Session = Depends(get_db)):
    return {"status": "ok", "ledger": verify_chain(db)}

@app.post("/api/agents/assistant")
def agent_assistant():
    return {"status": "ok", "message": "I am Shohay assistant."}
