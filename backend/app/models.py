from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from .database import Base

class AdminUnit(Base):
    __tablename__ = "admin_units"
    geocode = Column(String, primary_key=True, index=True)
    name_bn = Column(String)
    name_en = Column(String)
    level = Column(String) # "division" | "zila" | "upazila"
    x = Column(Float)
    y = Column(Float)
    need = Column(Integer)
    fulfillment = Column(Integer)
    received = Column(Integer)
    beneficiaries = Column(Integer)
    parent_geocode = Column(String, nullable=True) # Used for grouping upazilas by division

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(String, primary_key=True, index=True)
    title_bn = Column(String)
    title_en = Column(String)
    type_bn = Column(String)
    type_en = Column(String)
    goal = Column(Float)
    raised = Column(Float)
    upazilas_total = Column(Integer)
    upazilas_reached = Column(Integer)
    status = Column(String)
    image = Column(String)
    needs_open = Column(Integer, nullable=True)
    distributions = Column(Integer, nullable=True)

class NationalTotal(Base):
    __tablename__ = "national_totals"
    id = Column(Integer, primary_key=True)
    crore = Column(Float)
    items = Column(Integer)
    upazilas_reached = Column(Integer)
    upazilas_total = Column(Integer)
    beneficiaries = Column(Integer)
    donors = Column(Integer)

class Need(Base):
    __tablename__ = "needs"
    id = Column(String, primary_key=True, index=True)
    geocode = Column(String)
    area_bn = Column(String)
    area_en = Column(String)
    kind = Column(String)
    quantity = Column(Integer)
    severity = Column(Integer)
    status = Column(String)
    verified = Column(Boolean)

class LedgerRow(Base):
    __tablename__ = "ledger_rows"
    id = Column(String, primary_key=True, index=True)
    action = Column(String)
    ref = Column(String)
    amount = Column(String)
    area_bn = Column(String)
    area_en = Column(String)
    ts = Column(String)
    hash = Column(String)
    prev = Column(String)

class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(String, primary_key=True, index=True)
    donation_bn = Column(String)
    donation_en = Column(String)
    need_bn = Column(String)
    need_en = Column(String)
    area_bn = Column(String)
    area_en = Column(String)
    qty = Column(Integer)
    distance = Column(Float)
    rationale_bn = Column(String)
    rationale_en = Column(String)
    confidence = Column(Float)

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(String, primary_key=True, index=True)
    type_bn = Column(String)
    type_en = Column(String)
    ref = Column(String)
    severity = Column(String)
    explanation_bn = Column(String)
    explanation_en = Column(String)

class MyDonation(Base):
    __tablename__ = "my_donations"
    id = Column(String, primary_key=True, index=True)
    date = Column(String)
    kind = Column(String)
    summary_bn = Column(String)
    summary_en = Column(String)
    area_bn = Column(String)
    area_en = Column(String)
    campaign_bn = Column(String)
    campaign_en = Column(String)
    status = Column(String)
    zakat = Column(Boolean)

class FieldLog(Base):
    __tablename__ = "field_logs"
    id = Column(String, primary_key=True, index=True)
    area_bn = Column(String)
    area_en = Column(String)
    volunteer_bn = Column(String)
    volunteer_en = Column(String)
    households = Column(Integer)
    items_bn = Column(String)
    items_en = Column(String)
    ts = Column(String)
    photo = Column(String)
    geo = Column(Boolean)
    status = Column(String)

class ManagedUser(Base):
    __tablename__ = "managed_users"
    id = Column(String, primary_key=True, index=True)
    name_bn = Column(String)
    name_en = Column(String)
    role = Column(String)
    scope_bn = Column(String)
    scope_en = Column(String)
    status = Column(String)
