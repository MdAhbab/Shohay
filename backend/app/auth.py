"""Phone-OTP auth (dev-grade).

A real deployment would deliver the OTP over an SMS gateway and persist sessions;
here the code is returned to the caller for the demo and tokens live in memory
(so they reset on restart). The flow and contracts are real: request a code for a
phone, verify it, receive a bearer token, resolve the token to a user.
"""
import secrets
import time

from . import models

OTP_TTL_SECONDS = 300
_otps: dict[str, tuple[str, float]] = {}     # phone -> (code, expires_at)
_tokens: dict[str, str] = {}                 # token -> auth_user.id


def request_otp(phone: str) -> str:
    code = f"{secrets.randbelow(900000) + 100000}"
    _otps[phone] = (code, time.time() + OTP_TTL_SECONDS)
    return code


def verify_otp(db, phone: str, code: str):
    rec = _otps.get(phone)
    if not rec or rec[0] != code or rec[1] < time.time():
        return None
    _otps.pop(phone, None)

    user = db.query(models.AuthUser).filter(models.AuthUser.phone == phone).first()
    if user is None:
        # Unknown numbers sign in as a citizen donor (the lowest-privilege role).
        user = models.AuthUser(
            id=f"U-{phone[-4:] or secrets.token_hex(2)}",
            name_bn="নাগরিক দাতা", name_en="Citizen donor",
            role="donor", org_bn="নাগরিক", org_en="Citizen",
            scope_bn="বাংলাদেশ", scope_en="Bangladesh", phone=phone,
        )
        db.add(user)
        db.commit()

    token = secrets.token_urlsafe(24)
    _tokens[token] = user.id
    return token, user


def user_for_token(db, token: str):
    uid = _tokens.get(token or "")
    if not uid:
        return None
    return db.query(models.AuthUser).filter(models.AuthUser.id == uid).first()


def revoke(token: str) -> None:
    _tokens.pop(token or "", None)
