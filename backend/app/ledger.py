"""Hash-linked, append-only proof chain.

Every state change (pledge, receive, allocate, distribute) appends an entry whose
hash is computed from the previous entry's hash plus this entry's content. That
makes the chain tamper-evident: altering any past row breaks every hash after it.
`verify_chain` re-walks the chain and reports the first break, if any.
"""
import hashlib
from datetime import datetime, timezone

from . import models

GENESIS = "000000"


def _digest(prev_hash: str, action: str, ref: str, amount: str, ts: str) -> str:
    payload = f"{prev_hash}|{action}|{ref}|{amount}|{ts}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:6]


def _next_ledger_id(db) -> str:
    n = db.query(models.LedgerRow).count()
    return f"L-{90000 + n + 1}"


def append_ledger(db, *, action: str, ref: str, amount: str,
                  area_bn: str = "—", area_en: str = "—",
                  ts: str | None = None) -> models.LedgerRow:
    """Append one entry, chaining its hash to the current head. Caller commits."""
    head = db.query(models.LedgerRow).order_by(models.LedgerRow.id.desc()).first()
    prev = head.hash if head else GENESIS
    if ts is None:
        ts = datetime.now(timezone.utc).strftime("%d %b %H:%M")
    entry = models.LedgerRow(
        id=_next_ledger_id(db),
        action=action,
        ref=ref,
        amount=amount,
        area_bn=area_bn,
        area_en=area_en,
        ts=ts,
        hash=_digest(prev, action, ref, amount, ts),
        prev=prev,
    )
    db.add(entry)
    db.flush()  # assign without committing, so the next append sees this head
    return entry


def verify_chain(db) -> dict:
    """Re-walk the chain in insertion order; report integrity + first break."""
    rows = db.query(models.LedgerRow).order_by(models.LedgerRow.id.asc()).all()
    prev = GENESIS
    for row in rows:
        if row.prev != prev:
            return {"valid": False, "broken_at": row.id, "reason": "prev mismatch"}
        expected = _digest(row.prev, row.action, row.ref, row.amount, row.ts)
        if row.hash != expected:
            return {"valid": False, "broken_at": row.id, "reason": "hash mismatch"}
        prev = row.hash
    return {"valid": True, "broken_at": None, "reason": None}
