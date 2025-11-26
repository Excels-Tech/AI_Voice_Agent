from datetime import datetime, timedelta

from sqlmodel import Session, select

from .core.security import get_password_hash
from .models import (
    Agent,
    CallLog,
    Invoice,
    KnowledgeAsset,
    Integration,
    Notification,
    UsageStat,
    PaymentMethod,
    User,
    WebhookSubscription,
    Workspace,
    WorkspaceMembership,
    Workflow,
)


def seed_database(session: Session) -> None:
    """Populate the database with demo data so the frontend has something to consume."""
    has_users = session.exec(select(User).limit(1)).first()
    if has_users:
        return

    owner = User(
        name="Sarah Connor",
        email="sarah@voiceai.app",
        hashed_password=get_password_hash("changeme"),
        role="owner",
    )
    workspace = Workspace(
        name="VoiceAI Demo",
        slug="voiceai-demo",
        plan="professional",
        inbound_number="+1 (555) 123-4567",
        outbound_caller_id="+1 (555) 765-4321",
        language="en-US",
        voice="Nova",
        settings={
            "minutes": {"used": 3245, "total": 5000},
            "billingCycle": "monthly",
            "paymentMethod": {"brand": "Visa", "last4": "4242", "exp": "09/27"},
        },
    )
    session.add(owner)
    session.add(workspace)
    session.flush()

    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=owner.id,
        role="owner",
        status="active",
    )
    session.add(membership)

    payment_method = PaymentMethod(
        workspace_id=workspace.id,
        brand="Visa",
        last4="4242",
        exp_month=12,
        exp_year=datetime.utcnow().year + 2,
        cardholder_name=owner.name,
        billing_email=owner.email,
        provider="stripe",
        provider_method_id="pm_demo_4242",
        is_default=True,
    )
    session.add(payment_method)

    agents = [
        Agent(
            workspace_id=workspace.id,
            name="Sales Agent",
            description="Handles inbound demo requests and outbound follow-ups.",
            agent_type="sales",
            status="active",
            deployment_channels=["phone", "web-widget"],
            voice="Nova",
            language="en-US",
            script_summary="Qualify leads and book demos.",
            goal="Drive qualified demos for the sales team.",
            phone_number="+1 (555) 111-2222",
            average_handle_time=210,
            sentiment_score=0.82,
            capabilities={"languages": ["English"], "tasks": ["qualification", "scheduling"]},
        ),
        Agent(
            workspace_id=workspace.id,
            name="Support Agent",
            description="Level 1 support triage and FAQ resolution.",
            agent_type="support",
            status="active",
            deployment_channels=["phone"],
            voice="Alloy",
            language="en-GB",
            script_summary="Resolve tier-1 tickets and escalate incidents.",
            goal="Reduce mean time to resolution.",
            phone_number="+1 (555) 333-4444",
            average_handle_time=320,
            sentiment_score=0.74,
            capabilities={"channels": ["phone"], "integrations": ["Zendesk"]},
        ),
        Agent(
            workspace_id=workspace.id,
            name="Lead Qualifier",
            description="Outbound sequences to nurture inbound forms.",
            agent_type="marketing",
            status="paused",
            deployment_channels=["phone"],
            voice="Echo",
            language="es-ES",
            script_summary="Spanish-language qualification script.",
            goal="Improve LATAM coverage.",
            phone_number=None,
            average_handle_time=180,
            sentiment_score=0.7,
            capabilities={"languages": ["Spanish"], "tasks": ["discovery"]},
        ),
    ]
    session.add_all(agents)
    session.flush()

    now = datetime.utcnow()
    call_logs = [
        CallLog(
            workspace_id=workspace.id,
            agent_id=agents[0].id,
            caller_name="John Smith",
            caller_number="+1 (555) 888-1234",
            direction="inbound",
            status="completed",
            duration_seconds=204,
            sentiment="positive",
            transcript=[
                {"speaker": "agent", "text": "Thanks for calling VoiceAI, how can I help?"},
                {"speaker": "caller", "text": "I'd like to book a demo for next week."},
            ],
            summary="Qualified for Pro plan, sent calendar invite.",
            outcome="Demo scheduled",
            started_at=now - timedelta(hours=2),
            ended_at=now - timedelta(hours=2) + timedelta(seconds=204),
        ),
        CallLog(
            workspace_id=workspace.id,
            agent_id=agents[1].id,
            caller_name="Sarah Johnson",
            caller_number="+1 (555) 222-9876",
            direction="inbound",
            status="completed",
            duration_seconds=312,
            sentiment="neutral",
            transcript=[
                {"speaker": "agent", "text": "Opening support ticket #4832."},
                {"speaker": "caller", "text": "Our webhook stopped firing."},
            ],
            summary="Provided troubleshooting steps and escalated to Tier 2.",
            outcome="Escalated",
            started_at=now - timedelta(hours=5),
            ended_at=now - timedelta(hours=5) + timedelta(seconds=312),
        ),
        CallLog(
            workspace_id=workspace.id,
            agent_id=agents[2].id,
            caller_name="Miguel Lopez",
            caller_number="+34 600 123 456",
            direction="outbound",
            status="voicemail",
            duration_seconds=75,
            sentiment="neutral",
            transcript=[
                {"speaker": "agent", "text": "Hola Miguel, llamo de VoiceAI..."},
            ],
            summary="Left voicemail regarding onboarding session.",
            outcome="Voicemail",
            started_at=now - timedelta(days=1),
            ended_at=now - timedelta(days=1) + timedelta(seconds=75),
        ),
    ]
    session.add_all(call_logs)

    usage_stats = [
        UsageStat(
            workspace_id=workspace.id,
            metric="minutes_used",
            value=3245,
            period="monthly",
            created_at=now,
        ),
        UsageStat(
            workspace_id=workspace.id,
            metric="calls_this_month",
            value=1234,
            period="monthly",
            created_at=now,
        ),
    ]
    session.add_all(usage_stats)

    invoices = [
        Invoice(
            workspace_id=workspace.id,
            billed_to_user_id=owner.id,
            invoice_number="INV-2024-001",
            period_start=now - timedelta(days=60),
            period_end=now - timedelta(days=30),
            amount_cents=7900,
            currency="usd",
            status="paid",
            description="VoiceAI Professional - February",
        ),
        Invoice(
            workspace_id=workspace.id,
            billed_to_user_id=owner.id,
            invoice_number="INV-2024-002",
            period_start=now - timedelta(days=30),
            period_end=now,
            amount_cents=7900,
            currency="usd",
            status="paid",
            description="VoiceAI Professional - March",
        ),
    ]
    session.add_all(invoices)

    assets = [
        KnowledgeAsset(
            workspace_id=workspace.id,
            agent_id=agents[0].id,
            filename="Product_Catalog_2025.pdf",
            size_bytes=2_400_000,
            source_type="upload",
            status="processed",
            chunk_count=145,
            asset_metadata={"category": "product"},
        ),
        KnowledgeAsset(
            workspace_id=workspace.id,
            agent_id=agents[1].id,
            filename="FAQ_Document.docx",
            size_bytes=856_000,
            source_type="upload",
            status="processed",
            chunk_count=89,
            asset_metadata={"category": "support"},
        ),
    ]
    session.add_all(assets)

    integrations = [
        Integration(
            workspace_id=workspace.id,
            provider="google-calendar",
            name="Google Calendar",
            category="calendar",
            status="connected",
            settings={"account": "calendar@voiceai.app"},
        ),
        Integration(
            workspace_id=workspace.id,
            provider="slack",
            name="Slack",
            category="communication",
            status="connected",
            settings={"channel": "#agent-updates"},
        ),
        Integration(
            workspace_id=workspace.id,
            provider="zapier",
            name="Zapier",
            category="automation",
            status="connected",
            settings={"zaps": 3},
        ),
    ]
    session.add_all(integrations)

    notifications = [
        Notification(
            workspace_id=workspace.id,
            type="call",
            severity="low",
            title="New inbound call received",
            message="Sales Agent handled call from John Smith - 3:24 duration",
            read=False,
        ),
        Notification(
            workspace_id=workspace.id,
            type="alert",
            severity="high",
            title="Usage alert: 80% of minutes used",
            message="You've used 4,000 of 5,000 minutes this month",
            read=False,
        ),
    ]
    session.add_all(notifications)

    usage_stats = [
        UsageStat(workspace_id=workspace.id, metric="minutesUsed", value=3245),
        UsageStat(workspace_id=workspace.id, metric="minutesTotal", value=5000),
        UsageStat(workspace_id=workspace.id, metric="callsMonthToDate", value=1247),
        UsageStat(workspace_id=workspace.id, metric="activeAgents", value=8),
    ]
    session.add_all(usage_stats)

    invoices = [
        Invoice(
            workspace_id=workspace.id,
            invoice_number="INV-2025-001",
            period_start=datetime(2025, 1, 1),
            period_end=datetime(2025, 1, 31),
            amount_cents=7900,
            status="paid",
            pdf_url="https://example.com/invoices/INV-2025-001.pdf",
        ),
        Invoice(
            workspace_id=workspace.id,
            invoice_number="INV-2025-002",
            period_start=datetime(2025, 2, 1),
            period_end=datetime(2025, 2, 28),
            amount_cents=7900,
            status="paid",
        ),
    ]
    session.add_all(invoices)

    workflows = [
        Workflow(
            workspace_id=workspace.id,
            name="Demo Scheduling",
            trigger="call.completed",
            steps=[
                {"type": "check_sentiment", "threshold": "positive"},
                {"type": "create_calendar_event", "integration": "google-calendar"},
                {"type": "notify_slack", "channel": "#sales"},
            ],
        ),
        Workflow(
            workspace_id=workspace.id,
            name="Incident Escalation",
            trigger="call.tagged:incident",
            steps=[
                {"type": "create_ticket", "integration": "zendesk"},
                {"type": "notify_team", "channel": "#support-escalations"},
            ],
        ),
    ]
    session.add_all(workflows)

    webhooks = [
        WebhookSubscription(
            workspace_id=workspace.id,
            name="Call Started Webhook",
            url="https://hooks.voiceai.app/call-started",
            events=["call.started"],
            active=True,
        ),
        WebhookSubscription(
            workspace_id=workspace.id,
            name="Call Ended Webhook",
            url="https://hooks.voiceai.app/call-ended",
            events=["call.ended", "call.transcribed"],
            active=True,
        ),
    ]
    session.add_all(webhooks)

    session.commit()
