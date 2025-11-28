import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CreditCard, Download, Check, AlertCircle, TrendingUp, Zap, Shield, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import {
  cancelSubscription,
  downloadInvoice,
  getPlans,
  getPaymentMethod,
  getSubscription,
  getUsageStats,
  listInvoices,
  listWorkspaces,
  Plan,
  upgradeSubscription,
  upsertPaymentMethod,
  generateInvoice,
  type PaymentMethod,
} from "../lib/api";

type UsageState = {
  minutes: { used: number; total: number; percentage: number };
  calls: { total: number };
  agents: { active: number; total: number };
};

const DEFAULT_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price_monthly: 49,
    price_annual: 490,
    features: ["Up to 3 agents", "1,000 minutes/month", "Basic analytics", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    price_monthly: 199,
    price_annual: 1990,
    features: [
      "Up to 10 agents",
      "5,000 minutes/month",
      "Advanced analytics",
      "All integrations",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price_monthly: 499,
    price_annual: 4990,
    features: [
      "Unlimited agents",
      "20,000+ minutes/month",
      "Custom voice + SLA",
      "Dedicated CSM",
      "Custom integrations",
    ],
  },
];

function BillingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}

export function Billing() {
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(() => {
    if (typeof window === "undefined") return "monthly";
    try {
      const saved = localStorage.getItem("billing_cycle");
      return saved === "annual" ? "annual" : "monthly";
    } catch {
      return "monthly";
    }
  });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("selected_plan_id");
    } catch {
      return null;
    }
  });
  const [usage, setUsage] = useState<UsageState>({
    minutes: { used: 0, total: 5000, percentage: 0 },
    calls: { total: 0 },
    agents: { active: 0, total: 0 },
  });
  const [currentPlan, setCurrentPlan] = useState<string>("professional");
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [invoices, setInvoices] = useState<
    {
      id: number;
      invoice_number: string;
      date: string;
      amount: string;
      status: string;
      period?: string;
      currency?: string;
      raw?: any;
    }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"card" | "paypal">("card");
  const [paymentForm, setPaymentForm] = useState({
    brand: "Visa",
    cardNumber: "",
    expMonth: "12",
    expYear: String(new Date().getFullYear() + 2),
    cvc: "",
    cardholderName: "",
    billingEmail: "",
  });
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{
    invoice_number: string;
    amount: string;
    status: string;
    period?: string;
    currency?: string;
    created_at?: string;
  } | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const invoicesScrollable = invoices.length >= 5;
  const CARD_TEMPLATES = [
    { brand: "Visa", mask: "4242 4242 4242 4242", label: "Visa •••• 4242", icon: "/card-visa.svg" },
    { brand: "Mastercard", mask: "5454 5454 5454 5454", label: "Mastercard •••• 5454", icon: "/card-mastercard.svg" },
    { brand: "Amex", mask: "3434 343434 34343", label: "Amex •••• 3434", icon: "/card-amex.svg" },
    { brand: "Discover", mask: "6011 0000 0000 0000", label: "Discover •••• 6011", icon: "/card-discover.svg" },
  ];
  const PAYMENT_METHODS = [
    {
      id: "card",
      label: "Credit / Debit Card",
      description: "Visa, Mastercard, Amex, Discover",
      icons: ["/card-visa.svg", "/card-mastercard.svg", "/card-amex.svg", "/card-discover.svg"],
      cta: "Use card",
      disabled: false,
    },
    {
      id: "applepay",
      label: "Apple Pay",
      description: "Fast checkout on supported devices",
      icons: ["/apple-pay.svg"],
      cta: "Coming soon",
      disabled: true,
    },
    {
      id: "gpay",
      label: "Google Pay",
      description: "Tap to pay with Google",
      icons: ["/google-pay.svg"],
      cta: "Coming soon",
      disabled: true,
    },
  ];

  const hydrateFromCache = () => {
    try {
      const raw = localStorage.getItem("billing_cache");
      if (!raw) return false;
      const cached = JSON.parse(raw);
      if (!cached) return false;
      if (cached.subscription) setCurrentPlan(cached.subscription.plan);
      if (cached.plans) setPlans(cached.plans);
      if (Array.isArray(cached.invoices)) {
        setInvoices(
          cached.invoices.map((inv: any) => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            date: new Date(inv.created_at).toLocaleDateString(),
            amount: `$${(inv.amount_cents / 100).toFixed(2)}`,
            status: inv.status,
            period: `${new Date(inv.period_start).toLocaleDateString()} - ${new Date(
              inv.period_end
            ).toLocaleDateString()}`,
            currency: inv.currency?.toUpperCase?.() || "USD",
            raw: inv,
          }))
        );
      }
      if (cached.usageStats) {
        const minutesStat = cached.usageStats.find((u: any) => u.metric.includes("minutes"))?.value ?? 0;
        const callsStat = cached.usageStats.find((u: any) => u.metric.includes("calls"))?.value ?? 0;
        setUsage({
          minutes: {
            used: minutesStat,
            total: 5000,
            percentage: Math.min(100, (minutesStat / 5000) * 100),
          },
          calls: { total: callsStat },
          agents: { active: 0, total: 0 },
        });
      }
      if (cached.paymentMethod) setPaymentMethod(cached.paymentMethod);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const hasCache = hydrateFromCache();
        if (!hasCache) setIsLoading(true);
        
        setIsRefreshing(true);
        const workspaces = await listWorkspaces();
        if (!workspaces?.length) {
          toast.error("No workspace found. Create one to manage billing.");
          setIsRefreshing(false);
          setIsLoading(false);
          return;
        }
        const wsId = workspaces[0].id ?? workspaces[0].workspace_id ?? 1;
        setWorkspaceId(wsId);

        const [subscription, usageStats, invoiceList, pm, planCatalog] = await Promise.all([
          getSubscription(wsId),
          getUsageStats(wsId).catch(() => []),
          listInvoices(wsId).catch(() => []),
          getPaymentMethod(wsId).catch(() => null),
          getPlans().catch(() => ({ plans: DEFAULT_PLANS })),
        ]);

        setCurrentPlan(subscription.plan);
        setSelectedPlanId((prev) => prev || subscription.plan);
        setPlans(subscription.available_plans || planCatalog.plans || DEFAULT_PLANS);

        const minutesStat = usageStats.find((u) => u.metric.includes("minutes"))?.value ?? 0;
        const callsStat = usageStats.find((u) => u.metric.includes("calls"))?.value ?? 0;
        setUsage({
          minutes: {
            used: minutesStat,
            total: 5000,
            percentage: Math.min(100, (minutesStat / 5000) * 100),
          },
          calls: { total: callsStat },
          agents: { active: 0, total: 0 },
        });

        setInvoices(
          invoiceList.map((inv) => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            date: new Date(inv.created_at).toLocaleDateString(),
            amount: `$${(inv.amount_cents / 100).toFixed(2)}`,
            status: inv.status,
            period: `${new Date(inv.period_start).toLocaleDateString()} - ${new Date(
              inv.period_end
            ).toLocaleDateString()}`,
            currency: inv.currency?.toUpperCase?.() || "USD",
            raw: inv,
          }))
        );

        if (pm) {
          setPaymentMethod(pm);
        }

        // Cache for faster re-entry
        localStorage.setItem(
          "billing_cache",
          JSON.stringify({
            subscription,
            usageStats,
            invoices: invoiceList,
            paymentMethod: pm,
            plans: subscription.available_plans || planCatalog.plans || DEFAULT_PLANS,
          })
        );
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to load billing data");
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("billing_cycle", billingCycle);
    } catch {
      /* ignore storage errors */
    }
  }, [billingCycle]);

  useEffect(() => {
    try {
      if (selectedPlanId) localStorage.setItem("selected_plan_id", selectedPlanId);
    } catch {
      /* ignore storage errors */
    }
  }, [selectedPlanId]);

  const currentPlanDetails = useMemo(
    () => plans.find((p) => p.id === currentPlan) ?? DEFAULT_PLANS.find((p) => p.id === currentPlan),
    [plans, currentPlan]
  );

  const handleUpgrade = async (planId: string) => {
    if (!workspaceId) return;
    try {
      await upgradeSubscription(workspaceId, planId);
      const refreshed = await listInvoices(workspaceId).catch(() => []);
      setInvoices(
        refreshed.map((inv) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          date: new Date(inv.created_at).toLocaleDateString(),
          amount: `$${(inv.amount_cents / 100).toFixed(2)}`,
          status: inv.status,
          period: `${new Date(inv.period_start).toLocaleDateString()} - ${new Date(inv.period_end).toLocaleDateString()}`,
          currency: inv.currency?.toUpperCase?.() || "USD",
          raw: inv,
        }))
      );
      setCurrentPlan(planId);
      setSelectedPlanId(planId);
      toast.success(`Plan updated to ${planId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to change plan");
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelSubscription = async () => {
    if (!workspaceId) return;
    try {
      await cancelSubscription(workspaceId, false);
      toast.success("Subscription will cancel at period end");
      setShowCancelDialog(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel subscription");
    }
  };

  const handleGenerateInvoice = async () => {
    if (!workspaceId) return;
    try {
      setIsGeneratingInvoice(true);
      const invoice = await generateInvoice(workspaceId, { billing_cycle: billingCycle });
      setInvoices((prev) => [
        {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          date: new Date(invoice.created_at).toLocaleDateString(),
          amount: `$${(invoice.amount_cents / 100).toFixed(2)}`,
          status: invoice.status,
          period: `${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(
            invoice.period_end
          ).toLocaleDateString()}`,
          currency: invoice.currency?.toUpperCase?.() || "USD",
          raw: invoice,
        },
        ...prev,
      ]);
      toast.success("Invoice generated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleUpdatePaymentMethod = () => {
    if (paymentMethod) {
      setPaymentForm({
        brand: paymentMethod.brand,
        cardNumber: `**** **** **** ${paymentMethod.last4}`,
        expMonth: paymentMethod.exp_month.toString(),
        expYear: paymentMethod.exp_year.toString(),
        cvc: "",
        cardholderName: paymentMethod.cardholder_name || "",
        billingEmail: paymentMethod.billing_email || "",
      });
    } else {
      setPaymentForm({
        brand: "Visa",
        cardNumber: "",
        expMonth: "12",
        expYear: String(new Date().getFullYear() + 2),
        cvc: "",
        cardholderName: "",
        billingEmail: "",
      });
    }
    setSelectedPaymentType("card");
    setShowPaymentDialog(true);
  };

  const handleSavePaymentMethod = async () => {
    if (!workspaceId) return;
    if (selectedPaymentType !== "card") {
      toast.error("Only card payments are supported right now. Please select a card.");
      return;
    }
    setIsSavingPayment(true);
    try {
      let last4 = paymentForm.cardNumber.slice(-4);
      if (paymentForm.cardNumber.includes("*")) {
        last4 = paymentMethod?.last4 || "4242";
      } else if (!last4) {
        last4 = "4242";
      }

      const updated = await upsertPaymentMethod(workspaceId, {
        brand: paymentForm.brand,
        last4,
        exp_month: parseInt(paymentForm.expMonth),
        exp_year: parseInt(paymentForm.expYear),
        cardholder_name: paymentForm.cardholderName,
        billing_email: paymentForm.billingEmail,
        provider: "stripe",
        is_default: true,
      });

      setPaymentMethod(updated);
      toast.success("Payment method updated");
      setShowPaymentDialog(false);
    } catch (err: any) {
      console.error("Failed to update payment method:", err);
      toast.error(err?.message || "Failed to update payment method");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const blob = await downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message || "Failed to download invoice");
    }
  };

  const handleViewPdf = async (invoiceId: number) => {
    try {
      const blob = await downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to view invoice");
    }
  };

  const handleViewInvoice = (inv: typeof invoices[number]) => {
    setSelectedInvoice({
      invoice_number: inv.invoice_number,
      amount: inv.amount,
      status: inv.status,
      period: inv.period,
      currency: inv.currency,
      created_at: inv.raw?.created_at,
    });
    setShowInvoiceDialog(true);
  };

  const priceForPlan = (plan: Plan) =>
    billingCycle === "monthly" ? plan.price_monthly : plan.price_annual ?? plan.price_monthly * 10;

  if (isLoading) {
    return <BillingSkeleton />;
  }

  if (!workspaceId) {
    return <p className="text-slate-600">No workspace available. Create one to manage billing.</p>;
  }

  return (
    <div className="space-y-8 animate-slide-up max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div id="billing-header" className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Usage</h1>
          <p className="text-slate-500 mt-1 text-lg">Manage your subscription, payment methods, and track usage.</p>
        </div>
        {isRefreshing && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 animate-pulse">
            Syncing...
          </Badge>
        )}
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 border-0 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                  Current Plan
                </Badge>
                <span className="text-indigo-200 text-sm font-medium">
                  Renews on {new Date().toLocaleDateString()}
                </span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-1">{currentPlanDetails?.name || currentPlan} Plan</h2>
                <p className="text-indigo-100 text-lg opacity-90">
                  <span className="text-3xl font-bold">
                    ${currentPlanDetails ? priceForPlan(currentPlanDetails) : 0}
                  </span>{" "}
                  /{billingCycle}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {currentPlanDetails?.features.slice(0, 3).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-indigo-100">
                    <div className="bg-white/20 p-0.5 rounded-full">
                      <Check className="size-3" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={() =>
                  document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-semibold shadow-lg transition-transform hover:scale-105"
                size="lg"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 text-base font-medium">Minutes Used</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="size-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-3xl font-bold text-slate-900">{usage.minutes.used.toLocaleString()}</span>
              <span className="text-slate-500 ml-1">/ {usage.minutes.total.toLocaleString()}</span>
            </div>
            <Progress value={usage.minutes.percentage} className="h-2 mb-2 bg-slate-100" indicatorClassName={usage.minutes.percentage > 90 ? "bg-red-500" : "bg-blue-600"} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{usage.minutes.percentage.toFixed(1)}% used</span>
              {usage.minutes.percentage > 80 && (
                <Badge variant="destructive" className="flex items-center gap-1 h-5 px-1.5">
                  <AlertCircle className="size-3" />
                  Near limit
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 text-base font-medium">Total Calls</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="size-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-1">
              <span className="text-3xl font-bold text-slate-900">{usage.calls.total.toLocaleString()}</span>
            </div>
            <p className="text-slate-500 text-sm">Calls processed this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 text-base font-medium">Active Agents</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Zap className="size-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-1">
              <span className="text-3xl font-bold text-slate-900">{usage.agents.active}</span>
            </div>
            <p className="text-slate-500 text-sm">Active voice agents deployed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                  <CardDescription>Manage your payment details</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {paymentMethod ? (
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 shadow-lg max-w-md mx-auto md:mx-0">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Current Method</p>
                        <p className="font-semibold text-lg tracking-wide capitalize">{paymentMethod.brand}</p>
                      </div>
                      {paymentMethod.brand.toLowerCase() === 'visa' ? (
                        <img src="/card-visa.svg" alt="Visa" className="h-8 bg-white rounded px-1" />
                      ) : (
                        <CreditCard className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        </div>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        </div>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        </div>
                        <span className="font-mono text-xl tracking-widest">{paymentMethod.last4}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Card Holder</p>
                          <p className="font-medium tracking-wide">{paymentMethod.cardholder_name || "Valued Customer"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Expires</p>
                          <p className="font-medium tracking-wide">
                            {paymentMethod.exp_month.toString().padStart(2, "0")}/{paymentMethod.exp_year.toString().slice(-2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="bg-white p-3 rounded-full shadow-sm inline-flex mb-3">
                    <CreditCard className="size-6 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-medium">No payment method</p>
                  <p className="text-slate-500 text-sm mb-4">Add a card to ensure uninterrupted service</p>
                  <Button onClick={handleUpdatePaymentMethod}>Add Payment Method</Button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Accepted Payment Methods</h4>
                <div className="flex gap-3 flex-wrap">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        method.disabled ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200"
                      }`}
                    >
                      {method.icons?.[0] && <img src={method.icons[0]} alt={method.label} className="h-4 w-auto" />}
                      <span className="text-sm text-slate-700">{method.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice History */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Invoices</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleGenerateInvoice} disabled={!workspaceId || isGeneratingInvoice} className="h-8 text-xs">
                  {isGeneratingInvoice ? "..." : "Generate"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              {invoices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-slate-50 p-3 rounded-full mb-3">
                    <Download className="size-5 text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-sm">No invoices yet</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 max-h-[400px]">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <div>
                        <p className="text-slate-900 font-medium text-sm">{invoice.date}</p>
                        <p className="text-slate-500 text-xs">{invoice.invoice_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-900 font-medium text-sm">{invoice.amount}</p>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 h-5 ${invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Subscription */}
      <div className="flex justify-end">
        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancelSubscription}>
          Cancel Subscription
        </Button>
      </div>

      {/* All Plans */}
      <div
        id="plans-section"
        className="bg-slate-50 rounded-3xl border border-slate-200 p-8 md:p-12"
      >
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-3 py-1 text-sm">Pricing Plans</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose the plan that fits your needs</h2>
          <p className="text-slate-600 text-lg">
            Simple, transparent pricing. No hidden fees.
          </p>
          
          <div className="flex items-center justify-center mt-6">
            <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm inline-flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingCycle === "monthly"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingCycle === "annual"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Annual <span className="text-green-500 text-xs ml-1 font-bold">-17%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isFeatured = plan.id === "professional";
            const isSelected = selectedPlanId ? selectedPlanId === plan.id : isCurrent;
            
            return (
              <Card
                key={plan.id}
                className={`flex flex-col h-full relative transition-all duration-300 ${
                  isSelected
                    ? "border-blue-500 shadow-xl scale-105 z-10 ring-1 ring-blue-500"
                    : "border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1"
                } bg-white rounded-2xl overflow-hidden`}
              >
                {isFeatured && (
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                )}
                <CardHeader className="text-center pt-8 pb-4 px-6">
                  {isFeatured && (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 mb-4 mx-auto w-fit">
                      Most Popular
                    </Badge>
                  )}
                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-4xl font-bold text-slate-900">${priceForPlan(plan)}</span>
                    <span className="text-slate-500 font-medium">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    {billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 px-8 pb-8">
                  <div className="w-full h-px bg-slate-100 my-6" />
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 bg-green-50 p-0.5 rounded-full shrink-0">
                          <Check className="size-3.5 text-green-600" />
                        </div>
                        <span className="text-slate-600 text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    className={`w-full font-semibold shadow-sm ${
                      isCurrent
                        ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                        : isFeatured
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                    disabled={isCurrent}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      handleUpgrade(plan.id);
                    }}
                  >
                    {isCurrent ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method Modal */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 modal-fade">
          <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden modal-slide flex flex-col">
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Shield className="size-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Add Payment Method</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Encrypted & Secure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close payment modal"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6 overflow-y-auto bg-slate-50 flex-1">
              {/* Card option */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedPaymentType === "card"
                        ? "bg-white border-blue-500 text-blue-600 shadow-sm ring-1 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedPaymentType("card")}
                  >
                    <CreditCard className="size-4" />
                    Card
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedPaymentType === "paypal"
                        ? "bg-white border-blue-500 text-blue-600 shadow-sm ring-1 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedPaymentType("paypal")}
                  >
                    <span className="font-bold italic">Pay</span><span className="italic">Pal</span>
                  </button>
                </div>

                {selectedPaymentType === "card" && (
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-slate-700 text-xs uppercase font-semibold tracking-wider">Cardholder Name</Label>
                      <Input
                        id="name"
                        value={paymentForm.cardholderName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                        placeholder="John Doe"
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="number" className="text-slate-700 text-xs uppercase font-semibold tracking-wider">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="number"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                          placeholder="0000 0000 0000 0000"
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-10 font-mono"
                        />
                        <CreditCard className="absolute left-3 top-2.5 size-4 text-slate-400" />
                        <div className="absolute right-3 top-2.5 flex gap-1">
                          {CARD_TEMPLATES.map(c => (
                             <img key={c.brand} src={c.icon} alt={c.brand} className={`h-4 w-auto transition-opacity ${paymentForm.brand === c.brand ? 'opacity-100' : 'opacity-30'}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 text-xs uppercase font-semibold tracking-wider">Expiry Date</Label>
                        <div className="flex gap-2">
                          <Input
                            value={paymentForm.expMonth}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expMonth: e.target.value })}
                            placeholder="MM"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center"
                            maxLength={2}
                          />
                          <span className="text-slate-300 text-xl">/</span>
                          <Input
                            value={paymentForm.expYear}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expYear: e.target.value })}
                            placeholder="YY"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cvc" className="text-slate-700 text-xs uppercase font-semibold tracking-wider">CVC / CWW</Label>
                        <Input
                          id="cvc"
                          value={paymentForm.cvc}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                          placeholder="123"
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors font-mono"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPaymentType === "paypal" && (
                   <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                      <p className="text-blue-800 font-medium mb-2">Connect your PayPal account</p>
                      <p className="text-blue-600 text-sm">You will be redirected to PayPal to complete the setup.</p>
                   </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-white shrink-0">
              <Button variant="ghost" onClick={() => setShowPaymentDialog(false)} className="text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
              <Button
                onClick={handleSavePaymentMethod}
                disabled={isSavingPayment}
                className="bg-slate-900 hover:bg-slate-800 text-white min-w-[100px]"
              >
                {isSavingPayment ? "Saving..." : "Save Card"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Cancel Subscription</DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-700 leading-relaxed">
              Your subscription will remain active until the end of the current billing period.
              After that, you will lose access to premium features.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={confirmCancelSubscription}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice detail dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Invoice Details</DialogTitle>
            <DialogDescription className="text-slate-600">Review your invoice information.</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Invoice Number</span>
                <span className="font-mono font-medium text-slate-900">{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900 text-lg">
                  {selectedInvoice.amount}
                </span>
              </div>
              {selectedInvoice.period && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Billing Period</span>
                  <span className="font-medium text-slate-900">{selectedInvoice.period}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                <Badge className={selectedInvoice.status === "paid" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                  {selectedInvoice.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Close
            </Button>
            {selectedInvoice && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    const match = invoices.find((inv) => inv.invoice_number === selectedInvoice.invoice_number);
                    if (match) handleViewPdf(match.id);
                  }}
                >
                  View PDF
                </Button>
                <Button
                  className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => {
                    const match = invoices.find((inv) => inv.invoice_number === selectedInvoice.invoice_number);
                    if (match) handleDownloadInvoice(match.id, match.invoice_number);
                  }}
                >
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
