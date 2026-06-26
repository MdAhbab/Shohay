from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import engine, get_db, SessionLocal, Base
from .seed import seed_if_empty


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

# Agent stubs from AGENTS.md
@app.post("/api/agents/needs-assess")
def agent_needs_assess():
    return {"status": "ok", "message": "Draft needs proposed"}

@app.post("/api/agents/allocate")
def agent_allocate():
    return {"status": "ok", "message": "Proposed allocations generated"}

@app.post("/api/agents/audit")
def agent_audit():
    return {"status": "ok", "message": "Reconciliation complete"}

@app.post("/api/agents/assistant")
def agent_assistant():
    return {"status": "ok", "message": "I am Shohay assistant."}

@app.post("/api/donations")
def create_donation():
    return {"status": "ok", "message": "Donation received"}

@app.post("/api/needs")
def create_need():
    return {"status": "ok", "message": "Need registered"}

@app.post("/api/allocations")
def create_allocation():
    return {"status": "ok", "message": "Allocation approved"}

@app.post("/api/distributions")
def create_distribution():
    return {"status": "ok", "message": "Distribution logged"}
