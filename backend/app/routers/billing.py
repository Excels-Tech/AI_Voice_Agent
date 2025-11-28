from typing import List, Optional, Tuple
from datetime import datetime
import io
import calendar
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import Response
from sqlmodel import Session, select
from fpdf import FPDF

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership, Workspace
from app.models.billing import (
    Subscription,
    Invoice,
    InvoiceRead,
    InvoiceCreate,
    UsageStat,
    UsageStatRead,
    UsageStatCreate,
    PaymentMethod,
    PaymentMethodRead,
    PaymentMethodUpdate,
)
from app.models.notification import Notification

router = APIRouter()

# Shared plan catalog served to the UI
PLAN_CATALOG = {
    "starter": {
        "id": "starter",
        "name": "Starter",
        "price_monthly": 49,
        "price_annual": 490,  # 2 months free
        "features": [
            "Up to 3 agents",
            "1,000 minutes/month",
            "Basic analytics",
            "Email support",
        ],
    },
    "professional": {
        "id": "professional",
        "name": "Professional",
        "price_monthly": 199,
        "price_annual": 1990,
        "features": [
            "Up to 10 agents",
            "5,000 minutes/month",
            "Advanced analytics",
            "All integrations",
            "Priority support",
        ],
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "price_monthly": 499,
        "price_annual": 4990,
        "features": [
            "Unlimited agents",
            "20,000+ minutes/month",
            "Custom voice + SLA",
            "Dedicated CSM",
            "Custom integrations",
        ],
    },
}


@router.get("/plans")
async def list_plans(current_user: User = Depends(get_current_active_user)):
    """Return available plans for UI selection."""
    return {"plans": list(PLAN_CATALOG.values())}


def _require_membership(session: Session, workspace_id: int, user_id: int, owner_only: bool = False) -> WorkspaceMembership:
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == user_id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if owner_only and membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace owner can perform this action",
        )
    return membership


def _get_workspace(session: Session, workspace_id: int) -> Workspace:
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
    )
    return workspace


def _plan_amount_cents(plan: str, billing_cycle: str = "monthly") -> int:
    """Resolve the invoice amount in cents for a plan + cycle."""
    catalog = PLAN_CATALOG.get(plan)
    if not catalog:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported plan",
        )
    if billing_cycle == "annual" and catalog.get("price_annual"):
        return int(catalog["price_annual"] * 100)
    return int(catalog["price_monthly"] * 100)


def _current_period(billing_cycle: str = "monthly") -> Tuple[datetime, datetime]:
    """Return period_start/period_end based on cycle (defaults to current month)."""
    now = datetime.utcnow()
    if billing_cycle == "annual":
        period_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        period_end = period_start.replace(year=period_start.year + 1)
        return period_start, period_end

    # monthly
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_day = calendar.monthrange(period_start.year, period_start.month)[1]
    period_end = period_start.replace(day=last_day, hour=23, minute=59, second=59, microsecond=0)
    return period_start, period_end


def _create_invoice_record(
    session: Session,
    workspace_id: int,
    billed_to_user_id: int,
    plan: str,
    billing_cycle: str = "monthly",
    description: str | None = None,
) -> Invoice:
    """Create and persist an invoice row for the given workspace/user."""
    period_start, period_end = _current_period(billing_cycle)
    invoice_number = f"INV-{workspace_id}-{int(datetime.utcnow().timestamp())}"
    amount_cents = _plan_amount_cents(plan, billing_cycle)
    workspace = session.get(Workspace, workspace_id)
    invoice = Invoice(
        workspace_id=workspace_id,
        billed_to_user_id=billed_to_user_id,
        invoice_number=invoice_number,
        period_start=period_start,
        period_end=period_end,
        amount_cents=amount_cents,
        currency="usd",
        status="paid",  # placeholder; in production tie to provider status
        description=description or f"{plan.capitalize()} plan - {billing_cycle}",
        pdf_url=None,
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    invoice.pdf_url = f"/api/billing/invoices/{invoice.id}/download"
    session.add(invoice)
    # Drop a notification for billing events so the UI can surface it
    try:
        note = Notification(
            workspace_id=workspace_id,
            user_id=billed_to_user_id,
            type="billing",
            severity="low",
            title=f"Invoice {invoice.invoice_number} generated",
            message=f"{plan.capitalize()} plan ({billing_cycle}) for {workspace.name if workspace else 'workspace'} — ${amount_cents/100:.2f}",
            read=False,
        )
        session.add(note)
    except Exception:
        # Do not fail invoice creation if notification cannot be created
        pass
    session.commit()
    return invoice


def _render_invoice_pdf(invoice: Invoice, workspace: Workspace, billed_user: Optional[User]) -> bytes:
    """
    Render a structured, branded PDF for the invoice using FPDF.
    The layout mirrors a polished SaaS invoice with clear hierarchy and spacing.
    """
    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    brand_primary = (34, 98, 255)
    brand_dark = (15, 23, 42)
    brand_muted = (100, 116, 139)
    brand_light = (245, 247, 250)
    border_color = (226, 232, 240)

    def safe(text: str) -> str:
        """Remove characters not supported by core fonts (latin-1)."""
        if text is None:
            return ""
        try:
            return text.encode("latin-1", "ignore").decode("latin-1")
        except Exception:
            return str(text)

    def section_title(text: str):
        pdf.set_text_color(*brand_dark)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, safe(text), ln=1)

    def meta_card(x: float, title: str, value: str, width: float, align: str = "L"):
        pdf.set_draw_color(*border_color)
        pdf.set_fill_color(*brand_light)
        pdf.set_xy(x, 38)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(width, 20, "", border=1, ln=0, fill=True)
        pdf.set_xy(x + 6, 42)
        pdf.cell(width - 12, 6, safe(title), ln=1)
        pdf.set_font("Helvetica", "", 11)
        pdf.set_xy(x + 6, 52)
        pdf.cell(width - 12, 6, safe(value), ln=1, align=align)

    # Header band
    pdf.set_fill_color(*brand_primary)
    pdf.rect(0, 0, 210, 42, style="F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_xy(12, 10)
    pdf.cell(0, 9, "VoiceAI Invoice", ln=1)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, safe(workspace.name or "Workspace"), ln=1)

    # Meta row
    meta_card(12, "Invoice", invoice.invoice_number, 62)
    meta_card(80, "Status", invoice.status.capitalize(), 62)
    meta_card(148, "Total Due", f"${invoice.amount_cents / 100:.2f} {invoice.currency.upper()}", 50, align="R")

    pdf.set_xy(12, 70)
    pdf.set_text_color(*brand_dark)

    pdf.ln(6)
    section_title("Billing Summary")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, safe(f"Workspace: {workspace.name} (ID: {workspace.id})"), ln=1)
    pdf.cell(
        0,
        6,
        safe(f"Period: {invoice.period_start.strftime('%b %d, %Y')} - {invoice.period_end.strftime('%b %d, %Y')}"),
        ln=1,
    )
    if billed_user:
        pdf.cell(0, 6, safe(f"Billed To: {billed_user.name} ({billed_user.email})"), ln=1)
    pdf.cell(0, 6, safe(f"Generated: {invoice.created_at.strftime('%b %d, %Y')}"), ln=1)

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(95, 8, "Bill To", border=0)
    pdf.cell(0, 8, "From", border=0, ln=1)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(95, 6, safe(billed_user.name if billed_user else "Workspace Owner"), border=0)
    pdf.cell(0, 6, "VoiceAI Inc.", border=0, ln=1)
    pdf.cell(95, 6, safe(billed_user.email if billed_user and billed_user.email else ""), border=0)
    pdf.cell(0, 6, "billing@voiceai.app", border=0, ln=1)
    pdf.cell(95, 6, safe(f"Workspace: {workspace.name}"), border=0)
    pdf.cell(0, 6, "www.voiceai.app", border=0, ln=1)

    pdf.ln(12)
    pdf.set_fill_color(*brand_primary)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(95, 10, "Description", border=0, fill=True)
    pdf.cell(20, 10, "Qty", border=0, fill=True, align="C")
    pdf.cell(35, 10, "Price", border=0, fill=True, align="R")
    pdf.cell(30, 10, "Amount", border=0, ln=1, fill=True, align="R")

    pdf.set_text_color(*brand_dark)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_fill_color(*brand_light)
    pdf.set_draw_color(*border_color)

    description = invoice.description or f"{workspace.plan.capitalize()} plan"
    unit_price = invoice.amount_cents / 100
    line_y = pdf.get_y()
    pdf.rect(12, line_y, 186, 12, style="DF")
    pdf.set_xy(12, line_y + 2)
    pdf.cell(95, 8, safe(description), border=0)
    pdf.cell(20, 8, "1", border=0, align="C")
    pdf.cell(35, 8, safe(f"${unit_price:.2f}"), border=0, align="R")
    pdf.cell(30, 8, safe(f"${invoice.amount_cents / 100:.2f}"), border=0, ln=1, align="R")

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(150, 8, "Total", border=0, align="R")
    pdf.cell(36, 8, safe(f"${invoice.amount_cents / 100:.2f} {invoice.currency.upper()}"), border=0, ln=1, align="R")

    pdf.ln(10)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*brand_muted)
    pdf.multi_cell(
        0,
        5.5,
        safe(
            "Thank you for choosing VoiceAI. For billing questions, contact billing@voiceai.app. "
            "This invoice is generated for your records and reflects your current subscription."
        ),
    )
    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 5, safe(f"Downloaded: {datetime.utcnow().strftime('%b %d, %Y %H:%M UTC')}"), ln=1)

    pdf_bytes = pdf.output(dest="S")
    if isinstance(pdf_bytes, str):
        pdf_bytes = pdf_bytes.encode("latin-1", "ignore")
    else:
        pdf_bytes = bytes(pdf_bytes)
    return pdf_bytes


@router.get("/subscription")
async def get_subscription(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get current subscription details."""
    _require_membership(session, workspace_id, current_user.id)
    workspace = _get_workspace(session, workspace_id)

    # Get or create subscription
    subscription = session.exec(
        select(Subscription).where(Subscription.workspace_id == workspace_id)
    ).first()
    if not subscription:
        subscription = Subscription(
            workspace_id=workspace_id,
            plan=workspace.plan,
            status="active",
        )
        session.add(subscription)
        session.commit()
        session.refresh(subscription)

    return {
        "subscription_id": subscription.id,
        "plan": subscription.plan,
        "status": subscription.status,
        "current_period_start": subscription.current_period_start,
        "current_period_end": subscription.current_period_end,
        "cancel_at_period_end": subscription.cancel_at_period_end,
        "plan_details": PLAN_CATALOG.get(subscription.plan, PLAN_CATALOG["professional"]),
        "available_plans": list(PLAN_CATALOG.values()),
    }


@router.post("/subscription/upgrade")
async def upgrade_subscription(
    workspace_id: int = Query(...),
    new_plan: Optional[str] = Body(None, embed=True),
    new_plan_query: Optional[str] = Query(None, regex="^(starter|professional|enterprise)$"),
    billing_cycle: str = Body("monthly", embed=True),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Upgrade or change subscription plan."""
    _require_membership(session, workspace_id, current_user.id, owner_only=True)
    target_plan = new_plan or new_plan_query
    if not target_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="new_plan is required",
        )
    if target_plan not in PLAN_CATALOG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported plan",
        )
    
    workspace = session.get(Workspace, workspace_id)
    subscription = session.exec(
        select(Subscription).where(Subscription.workspace_id == workspace_id)
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    # Update plan
    old_plan = subscription.plan
    subscription.plan = target_plan
    subscription.updated_at = datetime.utcnow()
    
    workspace.plan = target_plan
    workspace.updated_at = datetime.utcnow()
    
    session.add(subscription)
    session.add(workspace)
    session.commit()

    # Record an invoice for the plan change so history is visible
    _create_invoice_record(
        session=session,
        workspace_id=workspace_id,
        billed_to_user_id=current_user.id,
        plan=target_plan,
        billing_cycle=billing_cycle or "monthly",
        description=f"Plan change to {target_plan}",
    )
    
    # TODO: Integrate with Stripe to update subscription
    
    return {
        "message": "Subscription updated successfully",
        "old_plan": old_plan,
        "new_plan": target_plan,
        "plan_details": PLAN_CATALOG[target_plan],
    }


@router.post("/subscription/cancel")
async def cancel_subscription(
    workspace_id: int = Query(...),
    immediate: bool = Body(False, embed=True),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Cancel subscription at end of billing period."""
    _require_membership(session, workspace_id, current_user.id, owner_only=True)
    
    subscription = session.exec(
        select(Subscription).where(Subscription.workspace_id == workspace_id)
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    if immediate:
        subscription.status = "canceled"
        subscription.current_period_end = datetime.utcnow()
        subscription.cancel_at_period_end = True
    else:
        subscription.cancel_at_period_end = True
    subscription.updated_at = datetime.utcnow()
    session.add(subscription)
    session.commit()
    
    return {
        "message": "Subscription will be cancelled at end of billing period",
        "cancel_at": subscription.current_period_end,
        "status": subscription.status,
    }


@router.get("/usage", response_model=List[UsageStatRead])
async def get_usage_stats(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get usage statistics."""
    _require_membership(session, workspace_id, current_user.id)
    
    usage_stats = session.exec(
        select(UsageStat)
        .where(UsageStat.workspace_id == workspace_id)
        .order_by(UsageStat.created_at.desc())
    ).all()
    
    return usage_stats


@router.post("/usage", response_model=UsageStatRead, status_code=status.HTTP_201_CREATED)
async def record_usage(
    workspace_id: int = Query(...),
    payload: UsageStatCreate = Body(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Record a usage event for billing/analytics."""
    _require_membership(session, workspace_id, current_user.id)

    if payload.value < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usage value cannot be negative",
        )

    usage = UsageStat(
        workspace_id=workspace_id,
        metric=payload.metric,
        value=payload.value,
        period=payload.period,
    )
    session.add(usage)
    session.commit()
    session.refresh(usage)
    return usage


@router.post("/invoices/generate", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
async def generate_invoice(
    workspace_id: int = Query(...),
    billing_cycle: str = Body("monthly", embed=True),
    description: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Generate an invoice for the current workspace plan and bill it to the requesting user.
    Useful for showing invoice history without a live payment provider.
    """
    membership = _require_membership(session, workspace_id, current_user.id)
    _get_workspace(session, workspace_id)
    plan = session.exec(
        select(Subscription.plan).where(Subscription.workspace_id == workspace_id)
    ).first() or PLAN_CATALOG["professional"]["id"]

    # Allow only owner/admin to generate invoices manually
    if membership.role not in {"owner", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners/admins can generate invoices",
        )

    # Prevent duplicate invoice for the same period/workspace
    period_start, _ = _current_period(billing_cycle or "monthly")
    existing = session.exec(
        select(Invoice).where(
            Invoice.workspace_id == workspace_id,
            Invoice.period_start >= period_start,
        )
    ).first()
    if existing:
        return existing

    invoice = _create_invoice_record(
        session=session,
        workspace_id=workspace_id,
        billed_to_user_id=current_user.id,
        plan=plan,
        billing_cycle=billing_cycle or "monthly",
        description=description,
    )
    return invoice


@router.get("/invoices", response_model=List[InvoiceRead])
async def list_invoices(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List all invoices."""
    _require_membership(session, workspace_id, current_user.id)
    
    invoices = session.exec(
        select(Invoice)
        .where(Invoice.workspace_id == workspace_id)
        .order_by(Invoice.created_at.desc())
    ).all()
    
    return invoices


@router.get("/invoices/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get invoice details."""
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )
    
    _require_membership(session, invoice.workspace_id, current_user.id)
    
    return invoice


@router.post("/invoices", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    workspace_id: int = Query(...),
    payload: InvoiceCreate = Body(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create an invoice record against a workspace (owner only)."""
    _require_membership(session, workspace_id, current_user.id, owner_only=True)

    if payload.period_end <= payload.period_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="period_end must be after period_start",
        )

    if payload.billed_to_user_id:
        billed_user = session.get(User, payload.billed_to_user_id)
        if not billed_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Billed user not found",
            )
        billed_membership = session.exec(
            select(WorkspaceMembership).where(
                WorkspaceMembership.workspace_id == workspace_id,
                WorkspaceMembership.user_id == payload.billed_to_user_id,
                WorkspaceMembership.status == "active",
            )
        ).first()
        if not billed_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Billed user is not part of this workspace",
            )

    invoice_number = payload.invoice_number or f"INV-{workspace_id}-{int(datetime.utcnow().timestamp())}"
    existing_invoice = session.exec(
        select(Invoice).where(Invoice.invoice_number == invoice_number)
    ).first()
    if existing_invoice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice number already exists",
        )

    invoice = Invoice(
        workspace_id=workspace_id,
        billed_to_user_id=payload.billed_to_user_id or current_user.id,
        invoice_number=invoice_number,
        period_start=payload.period_start,
        period_end=payload.period_end,
        amount_cents=payload.amount_cents,
        currency=payload.currency,
        status=payload.status,
        description=payload.description,
        pdf_url=payload.pdf_url,
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    return invoice


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Download a branded PDF invoice."""
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    _require_membership(session, invoice.workspace_id, current_user.id)

    workspace = session.get(Workspace, invoice.workspace_id)
    billed_user = session.get(User, invoice.billed_to_user_id) if invoice.billed_to_user_id else None
    pdf_bytes = _render_invoice_pdf(invoice, workspace, billed_user)
    headers = {"Content-Disposition": f'attachment; filename="{invoice.invoice_number}.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@router.get("/payment-method", response_model=Optional[PaymentMethodRead])
async def get_payment_method(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Return the default payment method for the workspace."""
    _require_membership(session, workspace_id, current_user.id)

    payment_method = session.exec(
        select(PaymentMethod)
        .where(PaymentMethod.workspace_id == workspace_id)
        .order_by(PaymentMethod.is_default.desc(), PaymentMethod.updated_at.desc())
    ).first()

    return payment_method


@router.put("/payment-method", response_model=PaymentMethodRead)
async def upsert_payment_method(
    workspace_id: int = Query(...),
    payload: PaymentMethodUpdate = Body(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Add or update the default payment method for a workspace."""
    _require_membership(session, workspace_id, current_user.id, owner_only=True)

    if len(payload.last4) != 4 or not payload.last4.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="last4 must be the final four digits of the card",
        )
    if payload.exp_month < 1 or payload.exp_month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="exp_month must be between 1 and 12",
        )
    if payload.exp_year < datetime.utcnow().year:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="exp_year cannot be in the past",
        )

    existing_default = session.exec(
        select(PaymentMethod).where(
            PaymentMethod.workspace_id == workspace_id,
            PaymentMethod.is_default.is_(True),
        )
    ).first()

    if payload.is_default:
        # Clear other defaults
        existing_methods = session.exec(
            select(PaymentMethod).where(PaymentMethod.workspace_id == workspace_id)
        ).all()
        for method in existing_methods:
            method.is_default = False
            session.add(method)

    if existing_default:
        # Update in-place
        existing_default.brand = payload.brand
        existing_default.last4 = payload.last4
        existing_default.exp_month = payload.exp_month
        existing_default.exp_year = payload.exp_year
        existing_default.cardholder_name = payload.cardholder_name
        existing_default.billing_email = payload.billing_email
        existing_default.provider = payload.provider
        existing_default.provider_method_id = payload.provider_method_id
        existing_default.is_default = payload.is_default
        existing_default.updated_at = datetime.utcnow()
        payment_method = existing_default
    else:
        payment_method = PaymentMethod(
            workspace_id=workspace_id,
            brand=payload.brand,
            last4=payload.last4,
            exp_month=payload.exp_month,
            exp_year=payload.exp_year,
            cardholder_name=payload.cardholder_name,
            billing_email=payload.billing_email,
            provider=payload.provider,
            provider_method_id=payload.provider_method_id,
            is_default=payload.is_default,
        )
        session.add(payment_method)

    session.commit()
    session.refresh(payment_method)
    return payment_method
