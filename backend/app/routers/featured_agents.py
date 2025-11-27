from copy import deepcopy
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, SQLModel, Field, select

from app.core.deps import get_current_active_user
from app.db import get_session
from app.models.agent import Agent, AgentRead
from app.models.user import User
from app.models.workspace import WorkspaceMembership


class FeaturedAgentTemplate(SQLModel):
    agent_type: str
    voice: str
    language: str
    model: str
    script_summary: str
    goal: str
    deployment_channels: List[str] = Field(default_factory=list)
    voice_settings: Dict[str, Any] = Field(default_factory=dict)
    llm_settings: Dict[str, Any] = Field(default_factory=dict)
    capabilities: Dict[str, Any] = Field(default_factory=dict)
    personality: Dict[str, Any] = Field(default_factory=dict)
    status: Optional[str] = None


class FeaturedAgent(SQLModel):
    id: str
    name: str
    tagline: str
    description: str
    tier: str
    rating: float
    deployments: int
    features: List[str] = Field(default_factory=list)
    capabilities: Dict[str, Any] = Field(default_factory=dict)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    price: str
    accent_color: str
    template: FeaturedAgentTemplate


class FeaturedAgentDeployRequest(SQLModel):
    workspace_id: int
    name: Optional[str] = None
    description: Optional[str] = None
    agent_type: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = None
    model: Optional[str] = None
    script_summary: Optional[str] = None
    goal: Optional[str] = None
    deployment_channels: Optional[List[str]] = None
    voice_settings: Optional[Dict[str, Any]] = None
    llm_settings: Optional[Dict[str, Any]] = None
    capabilities: Optional[Dict[str, Any]] = None
    personality: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


def _featured_agents_seed() -> Dict[str, FeaturedAgent]:
    """Create the static catalog of featured agents."""
    data: List[Dict] = [
        {
            "id": "apex-sales-pro",
            "name": "Apex Sales Pro",
            "tagline": "Elite sales conversion specialist",
            "description": (
                "Our flagship sales agent with 95% conversion rate. Trained on millions of successful "
                "sales calls with advanced objection handling and closing techniques."
            ),
            "tier": "platinum",
            "rating": 4.9,
            "deployments": 12847,
            "features": [
                "Advanced objection handling",
                "Multi-language support (40+ languages)",
                "Real-time sentiment analysis",
                "CRM auto-sync",
                "Meeting integration (Zoom, Meet, Teams)",
                "Intelligent lead scoring",
                "A/B testing capability",
                "Custom pricing negotiation",
            ],
            "capabilities": {"phone": True, "video": True, "chat": True, "meetings": True},
            "metrics": {
                "avgConversion": "95%",
                "avgCallDuration": "6:32",
                "customerSatisfaction": "4.9/5",
                "responseTime": "0.3s",
            },
            "price": "Premium",
            "accent_color": "from-yellow-400 to-orange-500",
            "template": {
                "agent_type": "sales",
                "voice": "Nova",
                "language": "en-US",
                "model": "gpt-4",
                "script_summary": (
                    "Confident enterprise sales specialist focused on needs discovery, ROI storytelling, "
                    "and next-step commitments."
                ),
                "goal": "Convert qualified leads into booked demos or signed contracts with premium positioning.",
                "deployment_channels": ["phone", "video", "chat"],
                "voice_settings": {"tone": "confident", "pace": "dynamic", "energy": "high"},
                "llm_settings": {"temperature": 0.3, "top_p": 0.9, "memory_window": 12},
                "capabilities": {
                    "objectionHandling": True,
                    "pricingNegotiation": True,
                    "crmSync": True,
                    "meetingIntegration": True,
                },
                "personality": {
                    "traits": ["consultative", "strategic", "data-backed"],
                    "closingStyle": "assumptive-close",
                },
                "status": "active",
            },
        },
        {
            "id": "zenith-support",
            "name": "Zenith Support Agent",
            "tagline": "24/7 customer support excellence",
            "description": (
                "World-class support agent providing instant, accurate assistance. Handles complex queries, "
                "escalations, and maintains 98% customer satisfaction."
            ),
            "tier": "platinum",
            "rating": 4.8,
            "deployments": 18293,
            "features": [
                "24/7 availability",
                "Knowledge base integration",
                "Ticket auto-creation",
                "Escalation management",
                "Meeting integration (Zoom, Meet, Teams)",
                "Screen sharing support",
                "Multilingual support (45+ languages)",
                "Emotion detection & empathy",
            ],
            "capabilities": {"phone": True, "video": True, "chat": True, "meetings": True},
            "metrics": {
                "avgResolution": "92%",
                "avgResponseTime": "0.2s",
                "customerSatisfaction": "4.8/5",
                "escalationRate": "3%",
            },
            "price": "Premium",
            "accent_color": "from-blue-400 to-indigo-500",
            "template": {
                "agent_type": "support",
                "voice": "Alloy",
                "language": "en-US",
                "model": "gpt-4",
                "script_summary": (
                    "Empathetic tier-2 support agent that triages, troubleshoots, and resolves complex product cases."
                ),
                "goal": "Deliver instant, accurate answers while reducing escalations and maintaining CSAT > 4.8.",
                "deployment_channels": ["phone", "video", "chat"],
                "voice_settings": {"tone": "calm", "pace": "steady", "empathy": "enhanced"},
                "llm_settings": {"temperature": 0.25, "top_p": 0.85, "memory_window": 20},
                "capabilities": {
                    "knowledgeBase": True,
                    "ticketing": True,
                    "escalationRouting": True,
                    "multilingual": True,
                },
                "personality": {
                    "traits": ["reassuring", "patient", "solution-focused"],
                    "fallbackStrategy": "summarize-and-escalate",
                },
                "status": "active",
            },
        },
        {
            "id": "quantum-scheduler",
            "name": "Quantum Scheduler",
            "tagline": "Smart appointment & meeting coordinator",
            "description": (
                "AI-powered scheduling agent that integrates with all major calendar platforms. Handles complex "
                "scheduling, rescheduling, and meeting coordination seamlessly."
            ),
            "tier": "gold",
            "rating": 4.9,
            "deployments": 9432,
            "features": [
                "Calendar integration (Google, Outlook, Apple)",
                "Meeting platform integration (Zoom, Meet, Teams, Webex)",
                "Timezone intelligence",
                "Conflict resolution",
                "Automated reminders",
                "No-show reduction (85%)",
                "Group meeting coordination",
                "Video conferencing setup",
            ],
            "capabilities": {"phone": True, "video": False, "chat": True, "meetings": True},
            "metrics": {
                "calendarAccuracy": "99%",
                "avgBookingTime": "1.8 min",
                "noShowReduction": "85%",
                "autoReschedule": "92%",
            },
            "price": "Premium",
            "accent_color": "from-purple-400 to-pink-500",
            "template": {
                "agent_type": "operations",
                "voice": "Fable",
                "language": "en-US",
                "model": "gpt-4",
                "script_summary": (
                    "Logistics-focused meeting concierge that owns scheduling, reminders, and conflict resolution."
                ),
                "goal": "Maximize attendance and eliminate scheduling friction for busy teams.",
                "deployment_channels": ["phone", "chat"],
                "voice_settings": {"tone": "polished", "pace": "efficient"},
                "llm_settings": {"temperature": 0.35, "top_p": 0.9, "memory_window": 8},
                "capabilities": {
                    "calendarSync": True,
                    "meetingPlatforms": ["Zoom", "Teams", "Meet"],
                    "timezoneAwareness": True,
                    "reminderSequences": True,
                },
                "personality": {"traits": ["organized", "concise", "helpful"]},
                "status": "active",
            },
        },
        {
            "id": "summit-onboarding",
            "name": "Summit Onboarding Coach",
            "tagline": "Guided onboarding & implementation specialist",
            "description": (
                "White-glove onboarding agent that walks customers through setup, training, and adoption milestones "
                "with human-quality coaching."
            ),
            "tier": "gold",
            "rating": 4.8,
            "deployments": 6543,
            "features": [
                "Guided implementations",
                "Interactive walkthroughs",
                "Progress tracking",
                "Risk alerts",
                "Stakeholder updates",
                "Certification pathways",
                "Knowledge reinforcement",
                "Meeting follow-ups",
            ],
            "capabilities": {"phone": True, "video": True, "chat": True, "meetings": True},
            "metrics": {
                "onboardingCompletion": "93%",
                "timeToValue": "14 days",
                "adoptionScore": "4.7/5",
                "retentionBoost": "+18%",
            },
            "price": "Premium",
            "accent_color": "from-green-400 to-teal-500",
            "template": {
                "agent_type": "success",
                "voice": "Shimmer",
                "language": "en-US",
                "model": "gpt-4",
                "script_summary": (
                    "Implementation coach that tracks milestones, educates users, and drives adoption with accountability."
                ),
                "goal": "Accelerate customer time-to-value and ensure successful rollout.",
                "deployment_channels": ["phone", "video", "chat"],
                "voice_settings": {"tone": "supportive", "pace": "measured"},
                "llm_settings": {"temperature": 0.4, "top_p": 0.9, "memory_window": 14},
                "capabilities": {
                    "milestoneTracking": True,
                    "recapEmails": True,
                    "sentimentAlerts": True,
                },
                "personality": {"traits": ["coach-like", "structured", "motivational"]},
                "status": "active",
            },
        },
        {
            "id": "commerce-concierge",
            "name": "Commerce Concierge",
            "tagline": "E-commerce sales & support specialist",
            "description": (
                "Sophisticated shopping assistant that guides customers through purchase decisions, handles cart "
                "recovery, and provides post-purchase support."
            ),
            "tier": "gold",
            "rating": 4.7,
            "deployments": 11234,
            "features": [
                "Product recommendations",
                "Cart abandonment recovery",
                "Order tracking",
                "Returns & refunds handling",
                "Upsell & cross-sell",
                "Payment assistance",
                "Inventory checking",
                "Promotional campaigns",
            ],
            "capabilities": {"phone": True, "video": True, "chat": True, "meetings": False},
            "metrics": {
                "cartRecovery": "68%",
                "avgOrderValue": "+42%",
                "conversionRate": "23%",
                "customerSatisfaction": "4.7/5",
            },
            "price": "Standard",
            "accent_color": "from-orange-400 to-red-500",
            "template": {
                "agent_type": "sales",
                "voice": "Onyx",
                "language": "en-US",
                "model": "gpt-4",
                "script_summary": (
                    "Retail-focused specialist that guides buyers, recovers carts, and handles post-purchase care."
                ),
                "goal": "Increase average order value and reduce abandonment for commerce teams.",
                "deployment_channels": ["phone", "chat"],
                "voice_settings": {"tone": "friendly", "pace": "moderate"},
                "llm_settings": {"temperature": 0.4, "top_p": 0.9, "memory_window": 10},
                "capabilities": {
                    "productDiscovery": True,
                    "orderTracking": True,
                    "returnsHandling": True,
                    "promoDelivery": True,
                },
                "personality": {"traits": ["approachable", "solution-oriented"]},
                "status": "active",
            },
        },
    ]

    return {entry["id"]: FeaturedAgent(**entry) for entry in data}


FEATURED_AGENTS = _featured_agents_seed()
router = APIRouter()


@router.get("", response_model=List[FeaturedAgent])
async def list_featured_agents() -> List[FeaturedAgent]:
    """Return all featured agent templates."""
    return list(FEATURED_AGENTS.values())


@router.post("/{template_id}/deploy", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
async def deploy_featured_agent(
    template_id: str,
    request: FeaturedAgentDeployRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> Agent:
    """Instantiate a featured agent inside the caller's workspace."""
    template = FEATURED_AGENTS.get(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Featured agent template not found",
        )

    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == request.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workspace",
        )

    template_config = template.template
    voice_settings = deepcopy(template_config.voice_settings)
    if request.voice_settings:
        voice_settings.update(request.voice_settings)

    llm_settings = deepcopy(template_config.llm_settings)
    if request.llm_settings:
        llm_settings.update(request.llm_settings)

    capabilities = deepcopy(template_config.capabilities)
    if request.capabilities:
        capabilities.update(request.capabilities)

    personality = deepcopy(template_config.personality)
    if request.personality:
        personality.update(request.personality)

    agent = Agent(
        workspace_id=request.workspace_id,
        name=request.name or template.name,
        description=request.description or template.description,
        agent_type=request.agent_type or template_config.agent_type,
        voice=request.voice or template_config.voice,
        language=request.language or template_config.language,
        model=request.model or template_config.model,
        script_summary=request.script_summary or template_config.script_summary,
        goal=request.goal or template_config.goal,
        deployment_channels=request.deployment_channels or template_config.deployment_channels,
        voice_settings=voice_settings,
        llm_settings=llm_settings,
        capabilities=capabilities,
        personality=personality,
        status=request.status or template_config.status or "active",
        agent_metadata={
            "featured_template_id": template.id,
            "tier": template.tier,
            "tagline": template.tagline,
            "metrics": template.metrics,
            "price": template.price,
            "deployments": template.deployments,
            "source": "featured-agents",
        },
    )

    session.add(agent)
    session.commit()
    session.refresh(agent)

    return agent
