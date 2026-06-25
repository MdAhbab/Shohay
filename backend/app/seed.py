import sys
import os

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app import models

def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    divisions = [
      { "geocode": "10", "name_bn": "ঢাকা", "name_en": "Dhaka", "level": "division", "x": 52, "y": 52, "need": 2, "fulfillment": 71, "received": 1840, "beneficiaries": 142000 },
      { "geocode": "20", "name_bn": "চট্টগ্রাম", "name_en": "Chattogram", "level": "division", "x": 74, "y": 70, "need": 4, "fulfillment": 48, "received": 1320, "beneficiaries": 98000 },
      { "geocode": "30", "name_bn": "খুলনা", "name_en": "Khulna", "level": "division", "x": 34, "y": 74, "need": 3, "fulfillment": 62, "received": 760, "beneficiaries": 54000 },
      { "geocode": "40", "name_bn": "রাজশাহী", "name_en": "Rajshahi", "level": "division", "x": 36, "y": 36, "need": 2, "fulfillment": 78, "received": 540, "beneficiaries": 41000 },
      { "geocode": "50", "name_bn": "বরিশাল", "name_en": "Barishal", "level": "division", "x": 48, "y": 82, "need": 5, "fulfillment": 33, "received": 410, "beneficiaries": 37000 },
      { "geocode": "55", "name_bn": "সিলেট", "name_en": "Sylhet", "level": "division", "x": 78, "y": 30, "need": 4, "fulfillment": 41, "received": 690, "beneficiaries": 61000 },
      { "geocode": "45", "name_bn": "রংপুর", "name_en": "Rangpur", "level": "division", "x": 44, "y": 16, "need": 3, "fulfillment": 57, "received": 480, "beneficiaries": 44000 },
      { "geocode": "60", "name_bn": "ময়মনসিংহ", "name_en": "Mymensingh", "level": "division", "x": 58, "y": 30, "need": 4, "fulfillment": 52, "received": 520, "beneficiaries": 49000 },
    ]
    for d in divisions:
        db.add(models.AdminUnit(**d))
        
    upazilas = {
      "20": [
        { "geocode": "2001", "name_bn": "সন্দ্বীপ", "name_en": "Sandwip", "level": "upazila", "x": 72, "y": 64, "need": 5, "fulfillment": 22, "received": 84, "beneficiaries": 9200 },
        { "geocode": "2002", "name_bn": "মিরসরাই", "name_en": "Mirsharai", "level": "upazila", "x": 76, "y": 60, "need": 4, "fulfillment": 45, "received": 120, "beneficiaries": 12000 },
        { "geocode": "2003", "name_bn": "ফটিকছড়ি", "name_en": "Fatikchhari", "level": "upazila", "x": 79, "y": 66, "need": 3, "fulfillment": 58, "received": 96, "beneficiaries": 7400 },
        { "geocode": "2004", "name_bn": "কক্সবাজার সদর", "name_en": "Cox's Bazar Sadar", "level": "upazila", "x": 80, "y": 84, "need": 5, "fulfillment": 31, "received": 140, "beneficiaries": 15800 },
      ],
      "50": [
        { "geocode": "5001", "name_bn": "ভোলা সদর", "name_en": "Bhola Sadar", "level": "upazila", "x": 48, "y": 80, "need": 5, "fulfillment": 28, "received": 64, "beneficiaries": 8800 },
        { "geocode": "5002", "name_bn": "মনপুরা", "name_en": "Monpura", "level": "upazila", "x": 50, "y": 86, "need": 5, "fulfillment": 19, "received": 38, "beneficiaries": 4200 },
        { "geocode": "5003", "name_bn": "চরফ্যাশন", "name_en": "Char Fasson", "level": "upazila", "x": 46, "y": 90, "need": 4, "fulfillment": 36, "received": 52, "beneficiaries": 6100 },
      ],
    }
    for div_id, ups in upazilas.items():
        for u in ups:
            db.add(models.AdminUnit(**u, parent_geocode=div_id))
            
    campaigns = [
      {
        "id": "flood-2026-noakhali",
        "title_bn": "নোয়াখালী-ফেনী বন্যা সহায়তা",
        "title_en": "Noakhali–Feni Flood Relief",
        "type_bn": "আকস্মিক বন্যা",
        "type_en": "Flash flood",
        "goal": 50,
        "raised": 32.4,
        "upazilas_total": 38,
        "upazilas_reached": 24,
        "status": "active",
        "image": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=70",
        "needs_open": 14,
        "distributions": 312
      },
      {
        "id": "cyclone-2026-bhola",
        "title_bn": "ভোলা ঘূর্ণিঝড় পুনর্বাসন",
        "title_en": "Bhola Cyclone Recovery",
        "type_bn": "ঘূর্ণিঝড়",
        "type_en": "Cyclone",
        "goal": 28,
        "raised": 9.1,
        "upazilas_total": 12,
        "upazilas_reached": 4,
        "status": "active",
        "image": "https://images.unsplash.com/photo-1583245177184-4ec1f6dd1f3c?w=800&q=70",
        "needs_open": 22,
        "distributions": 84
      },
      {
        "id": "erosion-2026-sirajganj",
        "title_bn": "সিরাজগঞ্জ নদীভাঙন সহায়তা",
        "title_en": "Sirajganj Riverbank Erosion",
        "type_bn": "নদীভাঙন",
        "type_en": "River erosion",
        "goal": 18,
        "raised": 14.6,
        "upazilas_total": 9,
        "upazilas_reached": 7,
        "status": "monitoring",
        "image": "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&q=70",
        "needs_open": 6,
        "distributions": 196
      },
    ]
    for c in campaigns:
        db.add(models.Campaign(**c))

    totals = {
      "crore": 71.2,
      "items": 184500,
      "upazilas_reached": 312,
      "upazilas_total": 495,
      "beneficiaries": 526000,
      "donors": 41280,
    }
    db.add(models.NationalTotal(**totals))
    
    needs = [
      { "id": "N-1042", "geocode": "5002", "area_bn": "মনপুরা, ভোলা", "area_en": "Monpura, Bhola", "kind": "water", "quantity": 4000, "severity": 5, "status": "open", "verified": True },
      { "id": "N-1043", "geocode": "2001", "area_bn": "সন্দ্বীপ, চট্টগ্রাম", "area_en": "Sandwip, Chattogram", "kind": "food", "quantity": 1200, "severity": 5, "status": "partially_met", "verified": True },
      { "id": "N-1044", "geocode": "5001", "area_bn": "ভোলা সদর", "area_en": "Bhola Sadar", "kind": "medicine", "quantity": 600, "severity": 4, "status": "open", "verified": False },
      { "id": "N-1045", "geocode": "2004", "area_bn": "কক্সবাজার সদর", "area_en": "Cox's Bazar Sadar", "kind": "shelter", "quantity": 320, "severity": 4, "status": "open", "verified": True },
      { "id": "N-1046", "geocode": "5003", "area_bn": "চরফ্যাশন, ভোলা", "area_en": "Char Fasson, Bhola", "kind": "clothes", "quantity": 900, "severity": 3, "status": "partially_met", "verified": True },
    ]
    for n in needs:
        db.add(models.Need(**n))
        
    ledger = [
      { "id": "L-90213", "action": "distribute", "ref": "D-5521", "amount": "খাদ্য ×৮০ / Food ×80", "area_bn": "মনপুরা", "area_en": "Monpura", "ts": "২৭ জুন ১৬:২৫", "hash": "f23a91", "prev": "7be004" },
      { "id": "L-90212", "action": "allocate", "ref": "A-3310", "amount": "৳ ১,২০,০০০", "area_bn": "মনপুরা", "area_en": "Monpura", "ts": "২৬ জুন ০৯:৪০", "hash": "7be004", "prev": "c4d277" },
      { "id": "L-90211", "action": "receive", "ref": "BK-7741", "amount": "৳ ৫,০০,০০০", "area_bn": "—", "area_en": "—", "ts": "২৫ জুন ১০:১৩", "hash": "c4d277", "prev": "a91f30" },
      { "id": "L-90210", "action": "pledge", "ref": "P-7740", "amount": "৳ ৫,০০,০০০", "area_bn": "ভোলা (নির্ধারিত)", "area_en": "Bhola (earmarked)", "ts": "২৫ জুন ১০:১২", "hash": "a91f30", "prev": "5d0c11" },
    ]
    for l in ledger:
        db.add(models.LedgerRow(**l))
        
    allocations = [
      { "id": "AP-01", "donation_bn": "খাদ্য প্যাকেজ ×২০০", "donation_en": "Food packs ×200", "need_bn": "মনপুরা — তীব্র খাদ্য সংকট", "need_en": "Monpura — acute food gap", "area_bn": "মনপুরা, ভোলা", "area_en": "Monpura, Bhola", "qty": 200, "distance": 12, "rationale_bn": "নিকটতম অপূর্ণ সর্বোচ্চ-তীব্রতা চাহিদা", "rationale_en": "Nearest unmet highest-severity need", "confidence": 0.92 },
      { "id": "AP-02", "donation_bn": "বিশুদ্ধ পানি ×৪০০০ লি", "donation_en": "Clean water ×4000 L", "need_bn": "চরফ্যাশন — পানি সংকট", "need_en": "Char Fasson — water gap", "area_bn": "চরফ্যাশন, ভোলা", "area_en": "Char Fasson, Bhola", "qty": 4000, "distance": 19, "rationale_bn": "type+proximity মিল; ০% কভারেজ এড়াতে", "rationale_en": "type+proximity match; avoids 0% coverage", "confidence": 0.86 },
      { "id": "AP-03", "donation_bn": "ঔষধ কিট ×৬০", "donation_en": "Medicine kits ×60", "need_bn": "ভোলা সদর — জরুরি ঔষধ", "need_en": "Bhola Sadar — urgent meds", "area_bn": "ভোলা সদর", "area_en": "Bhola Sadar", "qty": 60, "distance": 8, "rationale_bn": "চাহিদা যাচাই বাকি — মাঠ-পর্যায়ে নিশ্চিতকরণ", "rationale_en": "need pending verification — ground-truth", "confidence": 0.61 },
    ]
    for a in allocations:
        db.add(models.Allocation(**a))
        
    anomalies = [
      { "id": "FX-21", "type_bn": "সম্ভাব্য সদৃশ সুবিধাভোগী", "type_en": "Possible duplicate beneficiary", "ref": "B-8841 / B-9012", "severity": "med", "explanation_bn": "ফোন-হ্যাশ মিল ০.৮৪ — কেসওয়ার্কার পর্যালোচনা প্রয়োজন", "explanation_en": "Phone-hash match 0.84 — needs caseworker review" },
      { "id": "FX-22", "type_bn": "বিতরণ–বরাদ্দ অমিল", "type_en": "Distribution–allocation mismatch", "ref": "D-5519", "severity": "high", "explanation_bn": "বিতরণকৃত পরিমাণ বরাদ্দকে ছাড়িয়েছে", "explanation_en": "Distributed quantity exceeds allocation" },
      { "id": "FX-23", "type_bn": "ছবি যাচাই — নিম্ন আস্থা", "type_en": "Photo verification — low confidence", "ref": "D-5524", "severity": "low", "explanation_bn": "জিও-ট্যাগ অনুপস্থিত; পরামর্শমূলক ফ্ল্যাগ", "explanation_en": "Geo-tag missing; advisory flag only" },
    ]
    for an in anomalies:
        db.add(models.Anomaly(**an))
        
    my_donations = [
      { "id": "D-50231", "date": "২৭ জুন ২০২৬", "kind": "money", "summary_bn": "৳ ৫,০০০", "summary_en": "৳ 5,000", "area_bn": "ভোলা সদর", "area_en": "Bhola Sadar", "campaign_bn": "ভোলা ঘূর্ণিঝড়", "campaign_en": "Bhola Cyclone", "status": "distributed", "zakat": False },
      { "id": "D-49887", "date": "২০ জুন ২০২৬", "kind": "money", "summary_bn": "৳ ১০,০০০", "summary_en": "৳ 10,000", "area_bn": "যেখানে প্রয়োজন", "area_en": "Where needed", "campaign_bn": "নোয়াখালী বন্যা", "campaign_en": "Noakhali Flood", "status": "allocated", "zakat": True },
      { "id": "D-49120", "date": "১১ জুন ২০২৬", "kind": "clothes", "summary_bn": "শীতবস্ত্র ×৪০", "summary_en": "Warm clothes ×40", "area_bn": "সিরাজগঞ্জ", "area_en": "Sirajganj", "campaign_bn": "নদীভাঙন", "campaign_en": "River erosion", "status": "distributed", "zakat": False },
      { "id": "D-48004", "date": "২ জুন ২০২৬", "kind": "money", "summary_bn": "৳ ২,৫০০", "summary_en": "৳ 2,500", "area_bn": "মনপুরা", "area_en": "Monpura", "campaign_bn": "ভোলা ঘূর্ণিঝড়", "campaign_en": "Bhola Cyclone", "status": "received", "zakat": False },
    ]
    for md in my_donations:
        db.add(models.MyDonation(**md))
        
    field_logs = [
      { "id": "D-5524", "area_bn": "চরফ্যাশন, ভোলা", "area_en": "Char Fasson, Bhola", "volunteer_bn": "মো. রফিক", "volunteer_en": "Md. Rafiq", "households": 42, "items_bn": "খাদ্য প্যাকেজ ×৪২", "items_en": "Food packs ×42", "ts": "২৭ জুন ১৫:১০", "photo": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=60", "geo": False, "status": "pending" },
      { "id": "D-5525", "area_bn": "মনপুরা, ভোলা", "area_en": "Monpura, Bhola", "volunteer_bn": "সালমা বেগম", "volunteer_en": "Salma Begum", "households": 80, "items_bn": "বিশুদ্ধ পানি ×৮০", "items_en": "Clean water ×80", "ts": "২৭ জুন ১৬:২৫", "photo": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&q=60", "geo": True, "status": "pending" },
      { "id": "D-5521", "area_bn": "ভোলা সদর", "area_en": "Bhola Sadar", "volunteer_bn": "মো. রফিক", "volunteer_en": "Md. Rafiq", "households": 18, "items_bn": "ঔষধ কিট ×১৮", "items_en": "Medicine kits ×18", "ts": "২৭ জুন ১২:০০", "photo": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=60", "geo": True, "status": "verified" },
    ]
    for fl in field_logs:
        db.add(models.FieldLog(**fl))
        
    managed_users = [
      { "id": "U-2201", "name_bn": "মো. রফিক", "name_en": "Md. Rafiq", "role": "volunteer", "scope_bn": "ভোলা সদর", "scope_en": "Bhola Sadar", "status": "active" },
      { "id": "U-2202", "name_bn": "আবুল কালাম", "name_en": "Abul Kalam", "role": "moderator", "scope_bn": "ভোলা জেলা", "scope_en": "Bhola district", "status": "active" },
      { "id": "U-2203", "name_bn": "সালমা বেগম", "name_en": "Salma Begum", "role": "volunteer", "scope_bn": "মনপুরা", "scope_en": "Monpura", "status": "active" },
      { "id": "U-2204", "name_bn": "তানভীর হোসেন", "name_en": "Tanvir Hossain", "role": "moderator", "scope_bn": "নোয়াখালী", "scope_en": "Noakhali", "status": "pending" },
      { "id": "U-2205", "name_bn": "রওশন আরা", "name_en": "Roushan Ara", "role": "donor", "scope_bn": "ঢাকা", "scope_en": "Dhaka", "status": "active" },
    ]
    for mu in managed_users:
        db.add(models.ManagedUser(**mu))
        
    db.commit()
    db.close()

if __name__ == "__main__":
    init_db()
    seed_data()
    print("Database seeded successfully.")
