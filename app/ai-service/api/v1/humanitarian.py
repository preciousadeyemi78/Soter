"""
v1 humanitarian verification endpoint.
"""

import logging

from fastapi import APIRouter

from schemas.humanitarian import (
    HumanitarianVerificationRequest,
    HumanitarianVerificationResponse,
)
from services.humanitarian_verification import HumanitarianVerificationService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["humanitarian"])

_humanitarian_verification_service = HumanitarianVerificationService()


@router.post("/ai/humanitarian/verify", response_model=HumanitarianVerificationResponse)
async def verify_humanitarian_claim(request: HumanitarianVerificationRequest):
    """Verify an aid claim against standardised humanitarian criteria."""
    logger.info("Processing humanitarian verification request")

    try:
        result = _humanitarian_verification_service.verify_claim(
            aid_claim=request.aid_claim,
            supporting_evidence=request.supporting_evidence,
            context_factors=request.context_factors,
            provider_preference=request.provider_preference,
        )
        return HumanitarianVerificationResponse(success=True, **result)
    except Exception as e:
        logger.error("Humanitarian verification failed: %s", str(e), exc_info=True)
        return HumanitarianVerificationResponse(success=False, error=str(e))
