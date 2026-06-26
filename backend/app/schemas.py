from pydantic import BaseModel
from typing import List, Optional

class AdminUnitBase(BaseModel):
    geocode: str
    name_bn: str
    name_en: str
    level: str
    x: float
    y: float
    need: int
    fulfillment: int
    received: int
    beneficiaries: int
    parent_geocode: Optional[str] = None

class AdminUnitSchema(AdminUnitBase):
    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    id: str
    title_bn: str
    title_en: str
    type_bn: str
    type_en: str
    goal: float
    raised: float
    upazilas_total: int
    upazilas_reached: int
    status: str
    image: str
    needs_open: Optional[int] = None
    distributions: Optional[int] = None

class CampaignSchema(CampaignBase):
    class Config:
        from_attributes = True

class NationalTotalBase(BaseModel):
    crore: float
    items: int
    upazilas_reached: int
    upazilas_total: int
    beneficiaries: int
    donors: int

class NationalTotalSchema(NationalTotalBase):
    id: int
    class Config:
        from_attributes = True

class NeedBase(BaseModel):
    id: str
    geocode: str
    area_bn: str
    area_en: str
    kind: str
    quantity: int
    severity: int
    status: str
    verified: bool

class NeedSchema(NeedBase):
    class Config:
        from_attributes = True

class LedgerRowBase(BaseModel):
    id: str
    action: str
    ref: str
    amount: str
    area_bn: str
    area_en: str
    ts: str
    hash: str
    prev: str

class LedgerRowSchema(LedgerRowBase):
    class Config:
        from_attributes = True

class AllocationBase(BaseModel):
    id: str
    donation_bn: str
    donation_en: str
    need_bn: str
    need_en: str
    area_bn: str
    area_en: str
    qty: int
    distance: float
    rationale_bn: str
    rationale_en: str
    confidence: float

class AllocationSchema(AllocationBase):
    class Config:
        from_attributes = True

class AnomalyBase(BaseModel):
    id: str
    type_bn: str
    type_en: str
    ref: str
    severity: str
    explanation_bn: str
    explanation_en: str

class AnomalySchema(AnomalyBase):
    class Config:
        from_attributes = True

class MyDonationBase(BaseModel):
    id: str
    date: str
    kind: str
    summary_bn: str
    summary_en: str
    area_bn: str
    area_en: str
    campaign_bn: str
    campaign_en: str
    status: str
    zakat: bool

class MyDonationSchema(MyDonationBase):
    class Config:
        from_attributes = True

class FieldLogBase(BaseModel):
    id: str
    area_bn: str
    area_en: str
    volunteer_bn: str
    volunteer_en: str
    households: int
    items_bn: str
    items_en: str
    ts: str
    photo: str
    geo: bool
    status: str

class FieldLogSchema(FieldLogBase):
    class Config:
        from_attributes = True

class ManagedUserBase(BaseModel):
    id: str
    name_bn: str
    name_en: str
    role: str
    scope_bn: str
    scope_en: str
    status: str

class ManagedUserSchema(ManagedUserBase):
    class Config:
        from_attributes = True

# ---------- write payloads ----------

class DonationCreate(BaseModel):
    kind: str                       # money | food | clothes | medicine | water | shelter | other
    amount: Optional[float] = None  # taka, for money
    qty: Optional[int] = None       # units, for goods
    item: Optional[str] = None      # goods type label
    channel: Optional[str] = None   # bkash | nagad | rocket | card | dropoff | pickup
    target_geocode: Optional[str] = None
    zakat: bool = False

class DonationResult(BaseModel):
    id: str
    status: str
    ts: str
    hash: str
    tracking_url: str

class NeedCreate(BaseModel):
    geocode: str
    kind: str
    quantity: int
    severity: int

class ProofStepSchema(BaseModel):
    action: str
    ref: str
    amount: str
    area_bn: str
    area_en: str
    ts: str
    hash: str
    prev: str

class TrackResponse(BaseModel):
    id: str
    status: str
    chain: List[ProofStepSchema]


class InitializeResponse(BaseModel):
    divisions: List[AdminUnitSchema]
    upazilasByDivision: dict[str, List[AdminUnitSchema]]
    campaigns: List[CampaignSchema]
    nationalTotals: NationalTotalBase
    needs: List[NeedSchema]
    ledgerRows: List[LedgerRowSchema]
    proposedAllocations: List[AllocationSchema]
    anomalies: List[AnomalySchema]
    myDonations: List[MyDonationSchema]
    myImpact: dict # Too lazy to map, keeping dict
    fieldLogs: List[FieldLogSchema]
    managedUsers: List[ManagedUserSchema]
    managedCampaigns: List[CampaignSchema]
