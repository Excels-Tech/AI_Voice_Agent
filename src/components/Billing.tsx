import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CreditCard, Download, Check, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  cancelSubscription,
  downloadInvoice,
  getPlans,
  getPaymentProviders,
  getPaymentMethod,
  getSubscription,
  getUsageStats,
  listInvoices,
  listWorkspaces,
  Plan,
  upgradeSubscription,
  upsertPaymentMethod,
  upsertPaymentProviders,
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

export function Billing() {
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
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
  // Mock helpers (replace with real APIs)
  const mockCheckEmailExists = async (email: string) => {
    await new Promise((r) => setTimeout(r, 400));
    return email.toLowerCase().includes("user");
  };
  const mockGetSavedProfiles = async () => {
    await new Promise((r) => setTimeout(r, 300));
    return [
      { id: "p1", label: "Acme Corp", email: "billing@acme.com", country: "United States" },
      { id: "p2", label: "Personal", email: "me@example.com", country: "Canada" },
    ];
  };
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
  const COUNTRIES = [
    "United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Uruguay",
    "United Kingdom", "Ireland", "Germany", "France", "Italy", "Spain", "Portugal", "Netherlands", "Belgium", "Switzerland",
    "Austria", "Sweden", "Norway", "Denmark", "Finland", "Iceland", "Poland", "Czech Republic", "Hungary", "Romania",
    "Bulgaria", "Greece", "Turkey", "Israel", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Egypt", "South Africa",
    "Nigeria", "Kenya", "Morocco", "India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "China", "Japan", "South Korea",
    "Singapore", "Malaysia", "Indonesia", "Philippines", "Thailand", "Vietnam", "Taiwan", "Hong Kong", "Australia", "New Zealand",
    "Russia", "Ukraine", "Belarus", "Estonia", "Latvia", "Lithuania", "Croatia", "Slovenia", "Slovakia", "Luxembourg",
    "United States Minor Outlying Islands" // placeholder to show we can extend list
  ];
  const [emailForPayment, setEmailForPayment] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "exists" | "new">("idle");
  const [continueAsGuest, setContinueAsGuest] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState("");
  const [expandedMethod, setExpandedMethod] = useState<string>("card");
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<{ id: string; label: string; email: string; country: string }[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileNote, setProfileNote] = useState<string>("");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<{ label: string; email: string; country: string }>({
    label: "",
    email: "",
    country: "",
  });
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    clientSecret: string;
    mode: "sandbox" | "live";
  }>({
    clientId: "",
    clientSecret: "",
    mode: "sandbox",
  });
  const [applePayConfig, setApplePayConfig] = useState<{
    merchantId: string;
    merchantName: string;
    domain: string;
    merchantCertificate: string;
    merchantPrivateKey: string;
    environment: "sandbox" | "live";
  }>({
    merchantId: "",
    merchantName: "",
    domain: "",
    merchantCertificate: "",
    merchantPrivateKey: "",
    environment: "sandbox",
  });
  const [gpayConfig, setGpayConfig] = useState<{
    merchantId: string;
    merchantName: string;
    gatewayMerchantId: string;
    environment: "TEST" | "PRODUCTION";
  }>({
    merchantId: "",
    merchantName: "",
    gatewayMerchantId: "",
    environment: "TEST",
  });
  const [providerSaving, setProviderSaving] = useState(false);
  const toggleMethod = (id: string) =>
    setExpandedMethod((prev) => (prev === id ? "" : id));

  const hydrateFromCache = () => {
    try {
      const raw = localStorage.getItem("billing_cache");
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (!cached) return;
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
    } catch {
      /* ignore cache errors */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        hydrateFromCache();
        setIsRefreshing(true);
        const workspaces = await listWorkspaces();
        if (!workspaces?.length) {
          toast.error("No workspace found. Create one to manage billing.");
          setIsRefreshing(false);
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
      }
    })();
  }, []);

  useEffect(() => {
    if (!showPaymentDialog) return;
    (async () => {
      try {
        const profiles = await mockGetSavedProfiles();
        setSavedProfiles(profiles);
        if (workspaceId) {
          const providers = await getPaymentProviders(workspaceId);
          if (providers?.paypal) {
            setPaypalConfig((prev) => ({
              ...prev,
              clientId: providers.paypal.clientId || "",
              clientSecret: providers.paypal.clientSecret || "",
              mode: providers.paypal.mode || "sandbox",
            }));
          }
          if (providers?.applepay) {
            setApplePayConfig((prev) => ({
              ...prev,
              merchantId: providers.applepay.merchantId || "",
              merchantName: providers.applepay.merchantName || "",
              domain: providers.applepay.domain || "",
              merchantCertificate: providers.applepay.merchantCertificate || "",
              merchantPrivateKey: providers.applepay.merchantPrivateKey || "",
              environment: providers.applepay.environment || "sandbox",
            }));
          }
          if (providers?.gpay) {
            setGpayConfig((prev) => ({
              ...prev,
              merchantId: providers.gpay.merchantId || "",
              gatewayMerchantId: providers.gpay.gatewayMerchantId || "",
              merchantName: providers.gpay.merchantName || "",
              environment: providers.gpay.environment || "TEST",
            }));
          }
        }
      } catch {
        setSavedProfiles([]);
      }
    })();
  }, [showPaymentDialog]);

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

  const handleSaveProvider = async (type: "paypal" | "applepay" | "gpay") => {
    if (!workspaceId) return;
    setProviderSaving(true);
    try {
      await upsertPaymentProviders(workspaceId, {
        paypal: paypalConfig,
        applepay: applePayConfig,
        gpay: gpayConfig,
      });
      toast.success(`${type === "paypal" ? "PayPal" : type === "applepay" ? "Apple Pay" : "Google Pay"} saved`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save provider credentials");
    } finally {
      setProviderSaving(false);
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
      // Note: We can't easily revoke the object URL here if we open it in a new tab, 
      // but browsers generally handle this cleanup when the document is unloaded.
      // For a more robust solution, we could use a timeout or a dedicated viewer route.
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

  if (!workspaceId) {
    return <p className="text-slate-600">No workspace available. Create one to manage billing.</p>;
  }

  if (showPaymentDialog) {
    return (
      <div className="min-h-screen bg-slate-50 page-fade">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Billing / Payment Methods</p>
              <h1 className="text-slate-900 text-xl font-semibold">Update payment method</h1>
              <p className="text-slate-700 text-sm">Keep your subscription active by adding a payment method.</p>
            </div>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Back to Billing
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-4 rounded-t-2xl text-white">
              <p className="text-lg font-semibold">Payment options</p>
              <p className="text-sm text-blue-100">Cards stay encrypted and secure.</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Email verification / profiles */}
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-slate-700">Billing email</Label>
                  {emailStatus === "exists" && (
                    <Badge className="bg-green-100 text-green-700" variant="outline">
                      Account found
                    </Badge>
                  )}
                  {emailStatus === "new" && (
                    <Badge className="bg-blue-100 text-blue-700" variant="outline">
                      New guest
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    value={emailForPayment}
                    onChange={async (e) => {
                      const next = e.target.value;
                      setEmailForPayment(next);
                      setEmailStatus("checking");
                      const exists = await mockCheckEmailExists(next);
                      setEmailStatus(exists ? "exists" : "new");
                    }}
                    placeholder="name@email.com"
                  />
                  <div className="flex items-center gap-2 flex-wrap text-sm text-slate-600">
                    {emailStatus === "exists" && (
                      <>
                        <span>Enter password to continue</span>
                        <Input
                          type="password"
                          value={paymentPassword}
                          onChange={(e) => setPaymentPassword(e.target.value)}
                          className="w-48"
                          placeholder="Password"
                        />
                        <Button variant="ghost" size="sm" onClick={() => setContinueAsGuest(true)}>
                          Continue as guest
                        </Button>
                      </>
                    )}
                    {emailStatus === "new" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateAccount((p) => !p)}
                      >
                        {createAccount ? "Skip account" : "Create account"}
                      </Button>
                    )}
                  </div>
                  {createAccount && (
                    <Input
                      type="password"
                      value={paymentPassword}
                      onChange={(e) => setPaymentPassword(e.target.value)}
                      className="w-56"
                      placeholder="Set password for new account"
                    />
                  )}
                </div>
                {savedProfiles.length > 0 && (
                  <div className="grid gap-2">
                    <Label className="text-slate-700">Saved billing profiles</Label>
                    <div className="flex flex-col gap-2">
                      {savedProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            setSelectedProfileId(profile.id);
                            setEmailForPayment(profile.email);
                            setSelectedCountry(profile.country);
                          }}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left ${
                            selectedProfileId === profile.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div>
                            <p className="text-slate-900 text-sm">{profile.label}</p>
                            <p className="text-slate-600 text-xs">{profile.email} · {profile.country}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </button>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          value={profileNote}
                          onChange={(e) => setProfileNote(e.target.value)}
                          placeholder="Add notes or label"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const id = `p-${Date.now()}`;
                            setSavedProfiles((prev) => [
                              ...prev,
                              { id, label: profileNote || "New profile", email: emailForPayment, country: selectedCountry || "United States" },
                            ]);
                            setProfileNote("");
                          }}
                        >
                          Add profile
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Country search */}
              <div className="grid gap-2">
                <Label className="text-slate-700">Country</Label>
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm text-slate-900 bg-white flex-1 min-w-[220px]"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.filter((c) =>
                      c.toLowerCase().includes(countryQuery.toLowerCase())
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Search country"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="bg-white flex-1 min-w-[220px] text-slate-900"
                  />
                </div>
              </div>

              {/* Payment methods */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <Label className="text-slate-700">Payment method</Label>
                  <p className="text-slate-500 text-xs">Select to expand its details</p>
                </div>
                <select
                  value={expandedMethod}
                  onChange={(e) => toggleMethod(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm text-slate-700 bg-white"
                >
                  <option value="card">Credit / Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="applepay">Apple Pay</option>
                  <option value="gpay">Google Pay</option>
                </select>
              </div>

              <div className="grid gap-3">
                {["card", "bank", "paypal", "applepay", "gpay"].map((methodId) => {
                  const meta = PAYMENT_METHODS.find((m) => m.id === methodId);
                  const open = expandedMethod === methodId;
                  return (
                    <div
                      key={methodId}
                      className={`rounded-xl border ${open ? "border-blue-400 shadow-sm" : "border-slate-200"} bg-white`}
                    >
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3"
                        onClick={() => toggleMethod(methodId)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <CreditCard className="size-5 text-slate-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-slate-900 font-medium">
                              {meta?.label || methodId.toUpperCase()}
                            </p>
                            <p className="text-slate-600 text-xs">
                              {meta?.description || "Payment option"}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-blue-600">
                          {open ? "Collapse" : "Expand"}
                        </span>
                      </button>
                      {open && methodId === "card" && (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {CARD_TEMPLATES.map((card) => (
                              <button
                                key={card.brand}
                                type="button"
                                onClick={() =>
                                  setPaymentForm({
                                    ...paymentForm,
                                    brand: card.brand,
                                    cardNumber: card.mask,
                                  })
                                }
                                className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition ${
                                  paymentForm.brand === card.brand
                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-blue-200"
                                }`}
                              >
                                {card.icon ? (
                                  <img src={card.icon} alt={card.brand} className="h-4 w-auto" />
                                ) : null}
                                <span>{card.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-slate-700">Cardholder Name</Label>
                            <Input
                              value={paymentForm.cardholderName}
                              onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                              placeholder="John Doe"
                              className="bg-white"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-slate-700">Card number</Label>
                            <Input
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                      placeholder="1234 1234 1234 1234"
                      className="bg-white text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label className="text-slate-700">Expiry month</Label>
                      <Input
                        value={paymentForm.expMonth}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expMonth: e.target.value })}
                        placeholder="MM"
                        className="bg-white text-slate-900"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700">Expiry year</Label>
                      <Input
                        value={paymentForm.expYear}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expYear: e.target.value })}
                        placeholder="YYYY"
                        className="bg-white text-slate-900"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700">Security code</Label>
                      <Input
                        value={paymentForm.cvc}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                        placeholder="CVC"
                        className="bg-white text-slate-900"
                      />
                    </div>
                  </div>
                        </div>
                      )}
                      {open && methodId === "bank" && (
                        <div className="px-4 pb-4 space-y-3 text-sm text-slate-700">
                          <p>Enter bank transfer details (placeholder — connect to your provider).</p>
                          <Input placeholder="Account holder name" className="bg-white text-slate-900" />
                          <Input placeholder="IBAN / Account number" className="bg-white text-slate-900" />
                          <Input placeholder="Routing / SWIFT" className="bg-white text-slate-900" />
                        </div>
                      )}
                      {open && methodId === "paypal" && (
                        <div className="px-4 pb-4 space-y-3 text-sm text-slate-700">
                          <p>Pay securely with PayPal.</p>
                          <ul className="list-disc list-inside text-slate-600 text-xs space-y-1">
                            <li>Get a REST app at PayPal Developer → Dashboard → My Apps & Credentials.</li>
                            <li>Copy Client ID and Secret for Sandbox/Live.</li>
                            <li>Ensure webhook/return URLs match your domain.</li>
                          </ul>
                          <div className="grid gap-3">
                            <Input
                              placeholder="PayPal Client ID"
                              value={paypalConfig.clientId}
                              onChange={(e) => setPaypalConfig((p) => ({ ...p, clientId: e.target.value }))}
                              className="bg-white text-slate-900"
                            />
                            <Input
                              placeholder="PayPal Client Secret"
                              type="password"
                              value={paypalConfig.clientSecret}
                              onChange={(e) => setPaypalConfig((p) => ({ ...p, clientSecret: e.target.value }))}
                              className="bg-white text-slate-900"
                            />
                            <select
                              value={paypalConfig.mode}
                              onChange={(e) => setPaypalConfig((p) => ({ ...p, mode: e.target.value as "sandbox" | "live" }))}
                              className="border rounded-md px-2 py-1 text-sm text-slate-900 bg-white"
                            >
                              <option value="sandbox">Sandbox</option>
                              <option value="live">Live</option>
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full bg-blue-50 text-blue-800 border-blue-200"
                              onClick={() => handleSaveProvider("paypal")}
                              disabled={providerSaving}
                            >
                              {providerSaving ? "Saving..." : "Save credentials"}
                            </Button>
                          </div>
                        </div>
                      )}
                      {open && (methodId === "applepay" || methodId === "gpay") && (
                        <div className="px-4 pb-4 space-y-3 text-sm text-slate-700">
                          {methodId === "applepay" && (
                            <>
                              <p>Configure Apple Pay (store credentials securely in your backend).</p>
                              <Input
                                value={applePayConfig.merchantId}
                                onChange={(e) => setApplePayConfig((p) => ({ ...p, merchantId: e.target.value }))}
                                placeholder="Apple Pay Merchant ID"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={applePayConfig.domain}
                                onChange={(e) => setApplePayConfig((p) => ({ ...p, domain: e.target.value }))}
                                placeholder="Merchant domain (e.g., pay.example.com)"
                                className="bg-white text-slate-900"
                              />
                              <Button size="sm" variant="outline" className="w-full bg-blue-50 text-blue-800 border-blue-200">
                                Save to backend (wire to provider)
                              </Button>
                            </>
                          )}
                          {methodId === "gpay" && (
                            <>
                              <p>Configure Google Pay (store credentials securely in your backend).</p>
                              <Input
                                value={gpayConfig.merchantId}
                                onChange={(e) => setGpayConfig((p) => ({ ...p, merchantId: e.target.value }))}
                                placeholder="Google Pay Merchant ID"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={gpayConfig.gatewayMerchantId}
                                onChange={(e) => setGpayConfig((p) => ({ ...p, gatewayMerchantId: e.target.value }))}
                                placeholder="Gateway merchant ID (Stripe/Adyen)"
                                className="bg-white text-slate-900"
                              />
                              <Button size="sm" variant="outline" className="w-full bg-blue-50 text-blue-800 border-blue-200">
                                Save to backend (wire to provider)
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Discount code */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-900 font-medium">Discount code</p>
                    <p className="text-slate-600 text-sm">Optional — reveal only when needed.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDiscountOpen((p) => !p)}>
                    {discountOpen ? "Hide" : "Add discount code"}
                  </Button>
                </div>
                {discountOpen && (
                  <div className="mt-3">
                    <Input placeholder="Enter discount code" className="bg-white" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePaymentMethod}
                  disabled={isSavingPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSavingPayment ? "Saving..." : "Save payment method"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div id="billing-header" className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-slate-900 mb-2">Billing & Usage</h1>
          <p className="text-slate-600">Manage your subscription and track usage</p>
        </div>
        {isRefreshing && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Updating...
          </Badge>
        )}
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-3">
                Current Plan
              </Badge>
              <h2 className="text-white mb-2">{currentPlanDetails?.name || currentPlan} Plan</h2>
              <p className="text-blue-100 mb-4">
                <span className="text-3xl">
                  ${currentPlanDetails ? priceForPlan(currentPlanDetails) : 0}
                </span>{" "}
                /{billingCycle}
              </p>
              <ul className="space-y-2">
                {currentPlanDetails?.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-blue-100">
                    <Check className="size-4" />
                    <span>{feature}</span>
                  </li>
                )) ?? <li className="text-blue-100 text-sm">No features listed</li>}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Change Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Minutes Used</CardTitle>
            <CardDescription>
              {usage.minutes.used.toLocaleString()} of {usage.minutes.total.toLocaleString()} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={usage.minutes.percentage} className="mb-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{usage.minutes.percentage.toFixed(1)}% used</span>
              {usage.minutes.percentage > 80 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  Near limit
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Total Calls</CardTitle>
            <CardDescription>{usage.calls.total.toLocaleString()} calls this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-500" />
              <span className="text-2xl text-slate-900">{usage.calls.total.toLocaleString()}</span>
            </div>
            <p className="text-slate-600 text-sm mt-2">Unlimited calls included</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Active Agents</CardTitle>
            <CardDescription>{usage.agents.active} agents deployed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-500" />
              <span className="text-2xl text-slate-900">{usage.agents.active}</span>
            </div>
            <p className="text-slate-600 text-sm mt-2">Unlimited agents included</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Payment Methods</CardTitle>
            <Button variant="outline" onClick={handleUpdatePaymentMethod}>
              Change payment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <CreditCard className="size-8 text-slate-400" />
            <div className="flex-1">
              <p className="text-slate-900 font-medium">
                {paymentMethod
                  ? `${paymentMethod.brand} ending ${paymentMethod.last4}`
                  : "No payment method on file"}
              </p>
              <p className="text-slate-600 text-sm">
                {paymentMethod
                  ? `Expires ${paymentMethod.exp_month.toString().padStart(2, "0")}/${paymentMethod.exp_year}`
                  : "Add a card to keep your subscription active"}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleUpdatePaymentMethod}>
              Update
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`rounded-2xl border ${
                  method.disabled ? "border-dashed border-slate-200" : "border-slate-200"
                } bg-white p-4 shadow-sm flex flex-col gap-3`}
              >
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    {method.icons?.[0] ? (
                      <img src={method.icons[0]} alt={method.label} className="h-5 w-auto" />
                    ) : (
                      <CreditCard className="size-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">{method.label}</p>
                    <p className="text-slate-600 text-xs">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {method.icons?.slice(1).map((icon, idx) => (
                    <img key={idx} src={icon} alt={method.label} className="h-4 w-auto" />
                  ))}
                </div>
                <Button
                  size="sm"
                  disabled={method.disabled}
                  className={
                    method.disabled
                      ? "bg-slate-100 text-slate-500"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
                  onClick={() => {
                    if (method.disabled) return;
                    handleUpdatePaymentMethod();
                  }}
                >
                  {method.cta}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Cancel Subscription</CardTitle>
          <CardDescription className="text-red-700">
            Permanently cancel your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-red-800">
              Your subscription will remain active until the end of the billing period.
            </p>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Invoice History</CardTitle>
            <Button variant="outline" size="sm" onClick={handleGenerateInvoice} disabled={!workspaceId || isGeneratingInvoice}>
              {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 max-h-[480px] overflow-y-auto">
          {invoices.length === 0 ? (
            <p className="text-slate-600 text-sm">No invoices yet. Billing will appear once generated.</p>
          ) : (
            <div className={`space-y-3 ${invoicesScrollable ? "max-h-80 overflow-y-auto pr-1" : ""}`}>
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div>
                    <p className="text-slate-900">{invoice.invoice_number}</p>
                    <p className="text-slate-600 text-sm">
                      {invoice.date}
                      {invoice.period ? ` • ${invoice.period}` : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-900">{invoice.amount}</span>
                    <Badge className={invoice.status === "paid" ? "bg-green-500" : "bg-amber-500"}>
                      {invoice.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                      >
                        <Download className="size-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPdf(invoice.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Plans */}
      <div
        id="plans-section"
        className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-10"
      >
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <p className="text-blue-600 font-semibold">Simple, Transparent Pricing</p>
          <h2 className="text-3xl md:text-4xl text-slate-900">Choose the plan that&apos;s right for you</h2>
          <p className="text-slate-600">
            Pick a plan and start building without surprises. All plans include secure billing and support.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm text-slate-600">Billing cycle</span>
            <div className="inline-flex rounded-full border border-blue-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1 text-sm rounded-full transition ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-700 hover:bg-blue-50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1 text-sm rounded-full transition ${
                  billingCycle === "annual"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-700 hover:bg-blue-50"
                }`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isFeatured = plan.id === "professional";
            const isSelected = selectedPlanId ? selectedPlanId === plan.id : isCurrent;
            return (
              <Card
                key={plan.id}
                className={`flex flex-col h-full w-full max-w-sm rounded-3xl border transition ${
                  isSelected
                    ? "border-blue-500 shadow-2xl ring-2 ring-blue-500/25"
                    : "border-slate-200 shadow-lg"
                } bg-white`}
              >
                <CardHeader className="text-center space-y-3 pb-2 pt-6 px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-900">{plan.name}</CardTitle>
                    {isCurrent && <Badge className="bg-green-500">Current</Badge>}
                  </div>
                  {isFeatured && (
                    <div className="flex justify-center">
                      <Badge className="bg-blue-600">Most Popular</Badge>
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl text-slate-900">${priceForPlan(plan)}</span>
                    <span className="text-slate-600">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-green-600 text-xs">Save up to 17% billed annually</p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col flex-1 px-6 pb-6">
                  <ul className="space-y-3 mb-6 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {isCurrent ? (
                      <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${
                          isFeatured
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          handleUpgrade(plan.id);
                        }}
                      >
                        {plan.id === "enterprise" ? "Contact Sales" : "Start Free Trial"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method Modal (custom center) */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 modal-fade">
          <div className="w-full max-w-[520px] rounded-3xl border border-slate-200 bg-white shadow-2xl max-h-[82vh] overflow-hidden modal-slide">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Add a payment method</p>
                <p className="text-sm text-blue-100">Cards stay encrypted and secure.</p>
              </div>
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="text-blue-50 hover:text-white text-xl leading-none"
                aria-label="Close payment modal"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto bg-slate-50">
              {/* Card option */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
                  <label className="flex items-center gap-3 text-slate-900 font-medium">
                    <input
                      type="radio"
                      name="paymentType"
                      value="card"
                      checked={selectedPaymentType === "card"}
                      onChange={() => setSelectedPaymentType("card")}
                      className="accent-blue-600"
                    />
                    Credit card
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={paymentForm.brand}
                      onChange={(e) => {
                        const brand = e.target.value;
                        setPaymentForm({ ...paymentForm, brand });
                      }}
                      className="border rounded-md px-2 py-1 text-sm text-slate-700 bg-white"
                    >
                      {CARD_TEMPLATES.map((c) => (
                        <option key={c.brand} value={c.brand}>
                          {c.brand}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 px-4 py-4">
                  {/* Email verification / profiles */}
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label className="text-slate-700">Billing email</Label>
                      {emailStatus === "exists" && (
                        <Badge className="bg-green-100 text-green-700" variant="outline">
                          Account found
                        </Badge>
                      )}
                      {emailStatus === "new" && (
                        <Badge className="bg-blue-100 text-blue-700" variant="outline">
                          New guest
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Input
                        value={emailForPayment}
                        onChange={async (e) => {
                          const next = e.target.value;
                          setEmailForPayment(next);
                          setEmailStatus("checking");
                          const exists = await mockCheckEmailExists(next);
                          setEmailStatus(exists ? "exists" : "new");
                        }}
                        placeholder="name@email.com"
                        disabled={selectedPaymentType !== "card"}
                      />
                      <div className="flex items-center gap-2 flex-wrap text-sm text-slate-600">
                        {emailStatus === "exists" && (
                          <>
                            <span>Enter password to continue</span>
                            <Input
                              type="password"
                              value={paymentPassword}
                              onChange={(e) => setPaymentPassword(e.target.value)}
                              className="w-48"
                              placeholder="Password"
                            />
                            <Button variant="ghost" size="sm" onClick={() => setContinueAsGuest(true)}>
                              Continue as guest
                            </Button>
                          </>
                        )}
                        {emailStatus === "new" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCreateAccount((p) => !p)}
                          >
                            {createAccount ? "Skip account" : "Create account"}
                          </Button>
                        )}
                      </div>
                      {createAccount && (
                        <Input
                          type="password"
                          value={paymentPassword}
                          onChange={(e) => setPaymentPassword(e.target.value)}
                          className="w-56"
                          placeholder="Set password for new account"
                        />
                      )}
                    </div>
                    {savedProfiles.length > 0 && (
                      <div className="grid gap-2">
                        <Label className="text-slate-700">Saved billing profiles</Label>
                        <div className="flex flex-col gap-2">
                          {savedProfiles.map((profile) => (
                            <div key={profile.id} className="rounded-lg border text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProfileId(profile.id);
                                  setEmailForPayment(profile.email);
                                  setSelectedCountry(profile.country);
                                  setEditingProfileId(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 ${
                                  selectedProfileId === profile.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div>
                                  <p className="text-slate-900 text-sm">{profile.label}</p>
                                  <p className="text-slate-600 text-xs">{profile.email} · {profile.country}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProfileId(profile.id);
                                    setEditingProfile({
                                      label: profile.label,
                                      email: profile.email,
                                      country: profile.country,
                                    });
                                  }}
                                >
                                  Edit
                                </Button>
                              </button>
                              {editingProfileId === profile.id && (
                                <div className="grid gap-2 border-t px-3 py-3 bg-white">
                                  <Input
                                    value={editingProfile.label}
                                    onChange={(e) =>
                                      setEditingProfile((prev) => ({ ...prev, label: e.target.value }))
                                    }
                                    placeholder="Label"
                                    className="bg-white"
                                  />
                                  <Input
                                    value={editingProfile.email}
                                    onChange={(e) =>
                                      setEditingProfile((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    placeholder="Email"
                                    className="bg-white"
                                  />
                                  <select
                                    value={editingProfile.country}
                                    onChange={(e) =>
                                      setEditingProfile((prev) => ({ ...prev, country: e.target.value }))
                                    }
                                    className="border rounded-md px-2 py-1 text-sm text-slate-800 bg-white"
                                  >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingProfileId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSavedProfiles((prev) =>
                                          prev.map((p) =>
                                            p.id === editingProfileId ? { ...p, ...editingProfile } : p
                                          )
                                        );
                                        setEditingProfileId(null);
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="flex items-center gap-2">
                            <Input
                              value={profileNote}
                              onChange={(e) => setProfileNote(e.target.value)}
                              placeholder="Add notes or label"
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const id = `p-${Date.now()}`;
                                setSavedProfiles((prev) => [
                                  ...prev,
                                  { id, label: profileNote || "New profile", email: emailForPayment, country: selectedCountry || "United States" },
                                ]);
                                setProfileNote("");
                              }}
                            >
                              Add profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Country search */}
                  <div className="grid gap-2">
                    <Label className="text-slate-700">Country</Label>
                    <div className="flex gap-3 flex-wrap">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm text-slate-900 bg-white flex-1 min-w-[220px]"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.filter((c) =>
                          c.toLowerCase().includes(countryQuery.toLowerCase())
                        ).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Search country"
                        value={countryQuery}
                        onChange={(e) => setCountryQuery(e.target.value)}
                        className="bg-white flex-1 min-w-[220px] text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Payment method selector (collapsible) */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <Label className="text-slate-700">Payment method</Label>
                <p className="text-slate-500 text-xs">Select to expand its details</p>
              </div>
              <select
                value={expandedMethod}
                onChange={(e) => toggleMethod(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm text-slate-700 bg-white"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="applepay">Apple Pay</option>
                <option value="gpay">Google Pay</option>
              </select>
            </div>
            {["card", "bank", "paypal", "applepay", "gpay"].map((methodId) => {
              const meta = PAYMENT_METHODS.find((m) => m.id === methodId);
              const open = expandedMethod === methodId;
              return (
                <div
                          key={methodId}
                          className={`rounded-xl border ${open ? "border-blue-400 shadow-sm" : "border-slate-200"} bg-white`}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3"
                            onClick={() => toggleMethod(methodId)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="size-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                <CreditCard className="size-5 text-slate-500" />
                              </div>
                              <div className="text-left">
                                <p className="text-slate-900 font-medium">
                                  {meta?.label || methodId.toUpperCase()}
                                </p>
                                <p className="text-slate-600 text-xs">
                                  {meta?.description || "Payment option"}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-blue-600">
                              {open ? "Collapse" : "Expand"}
                            </span>
                          </button>
                          {open && methodId === "card" && (
                            <div className="px-4 pb-4 space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {CARD_TEMPLATES.map((card) => (
                                  <button
                                    key={card.brand}
                                    type="button"
                                    onClick={() =>
                                      setPaymentForm({
                                        ...paymentForm,
                                        brand: card.brand,
                                        cardNumber: card.mask,
                                      })
                                    }
                                    className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition ${
                                      paymentForm.brand === card.brand
                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                        : "border-slate-200 bg-white hover:border-blue-200"
                                    }`}
                                  >
                                    {card.icon ? (
                                      <img src={card.icon} alt={card.brand} className="h-4 w-auto" />
                                    ) : null}
                                    <span>{card.label}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-slate-700">Cardholder Name</Label>
                                <Input
                                  value={paymentForm.cardholderName}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                                  placeholder="John Doe"
                                  className="bg-white"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-slate-700">Card number</Label>
                                <Input
                                  value={paymentForm.cardNumber}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                                  placeholder="1234 1234 1234 1234"
                                  className="bg-white"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="grid gap-2">
                                  <Label className="text-slate-700">Expiry month</Label>
                                  <Input
                                    value={paymentForm.expMonth}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, expMonth: e.target.value })}
                                    placeholder="MM"
                                    className="bg-white"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-slate-700">Expiry year</Label>
                                  <Input
                                    value={paymentForm.expYear}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, expYear: e.target.value })}
                                    placeholder="YYYY"
                                    className="bg-white"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-slate-700">Security code</Label>
                                  <Input
                                    value={paymentForm.cvc}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                                    placeholder="CVC"
                                    className="bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {open && methodId === "bank" && (
                            <div className="px-4 pb-4 space-y-3 text-sm text-slate-700">
                              <p>Enter bank transfer details (placeholder — connect to your provider).</p>
                              <Input placeholder="Account holder name" className="bg-white text-slate-900" />
                              <Input placeholder="IBAN / Account number" className="bg-white text-slate-900" />
                              <Input placeholder="Routing / SWIFT" className="bg-white text-slate-900" />
                            </div>
                          )}
                          {open && methodId === "paypal" && (
                            <div className="px-4 pb-4 space-y-3 text-sm text-slate-700">
                              <p>Pay securely with PayPal.</p>
                              <ul className="list-disc list-inside text-slate-600 text-xs space-y-1">
                                <li>Get a REST app at PayPal Developer → Dashboard → My Apps & Credentials.</li>
                                <li>Copy Client ID and Secret for the selected environment (Sandbox/Live).</li>
                                <li>Ensure your webhook/return URLs match your deployment domain.</li>
                              </ul>
                              <div className="grid gap-3">
                                <Input
                                  placeholder="PayPal Client ID"
                                  value={paypalConfig.clientId}
                                  onChange={(e) => setPaypalConfig((p) => ({ ...p, clientId: e.target.value }))}
                                  className="bg-white text-slate-900"
                                />
                                <Input
                                  placeholder="PayPal Client Secret"
                                  type="password"
                                  value={paypalConfig.clientSecret}
                                  onChange={(e) => setPaypalConfig((p) => ({ ...p, clientSecret: e.target.value }))}
                                  className="bg-white text-slate-900"
                                />
                                <select
                                  value={paypalConfig.mode}
                                  onChange={(e) => setPaypalConfig((p) => ({ ...p, mode: e.target.value as "sandbox" | "live" }))}
                                  className="border rounded-md px-2 py-1 text-sm text-slate-900 bg-white"
                                >
                                  <option value="sandbox">Sandbox</option>
                                  <option value="live">Live</option>
                                </select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full bg-blue-50 text-blue-800 border-blue-200"
                                  onClick={() => handleSaveProvider("paypal")}
                                  disabled={providerSaving}
                                >
                                  {providerSaving ? "Saving..." : "Save credentials"}
                                </Button>
                              </div>
                            </div>
                          )}
                          {open && (methodId === "applepay" || methodId === "gpay") && (
                            <div className="px-4 pb-4 space-y-3 text-sm text-slate-700">
                          {methodId === "applepay" && (
                            <>
                              <p>Configure Apple Pay (store credentials securely in your backend).</p>
                              <Input
                                value={applePayConfig.merchantId}
                                onChange={(e) => setApplePayConfig((p) => ({ ...p, merchantId: e.target.value }))}
                                placeholder="Apple Pay Merchant ID"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={applePayConfig.merchantName}
                                onChange={(e) => setApplePayConfig((p) => ({ ...p, merchantName: e.target.value }))}
                                placeholder="Merchant display name (shown to buyers)"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={applePayConfig.domain}
                                onChange={(e) => setApplePayConfig((p) => ({ ...p, domain: e.target.value }))}
                                placeholder="Merchant domain (e.g., pay.example.com)"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={applePayConfig.merchantCertificate}
                                onChange={(e) =>
                                  setApplePayConfig((p) => ({ ...p, merchantCertificate: e.target.value }))
                                }
                                placeholder="Merchant certificate (PEM) or vault ID"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                type="password"
                                value={applePayConfig.merchantPrivateKey}
                                onChange={(e) =>
                                  setApplePayConfig((p) => ({ ...p, merchantPrivateKey: e.target.value }))
                                }
                                placeholder="Merchant private key (keep secure)"
                                className="bg-white text-slate-900"
                              />
                              <select
                                value={applePayConfig.environment}
                                onChange={(e) =>
                                  setApplePayConfig((p) => ({ ...p, environment: e.target.value as "sandbox" | "live" }))
                                }
                                className="border rounded-md px-2 py-1 text-sm text-slate-900 bg-white"
                              >
                                <option value="sandbox">Sandbox</option>
                                <option value="live">Live</option>
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-blue-50 text-blue-800 border-blue-200"
                                onClick={() => handleSaveProvider("applepay")}
                                disabled={providerSaving}
                              >
                                {providerSaving ? "Saving..." : "Save to backend"}
                              </Button>
                            </>
                          )}
                          {methodId === "gpay" && (
                            <>
                              <p>Configure Google Pay (store credentials securely in your backend).</p>
                              <Input
                                value={gpayConfig.merchantId}
                                onChange={(e) => setGpayConfig((p) => ({ ...p, merchantId: e.target.value }))}
                                placeholder="Google Pay Merchant ID"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={gpayConfig.merchantName}
                                onChange={(e) => setGpayConfig((p) => ({ ...p, merchantName: e.target.value }))}
                                placeholder="Merchant display name"
                                className="bg-white text-slate-900"
                              />
                              <Input
                                value={gpayConfig.gatewayMerchantId}
                                onChange={(e) => setGpayConfig((p) => ({ ...p, gatewayMerchantId: e.target.value }))}
                                placeholder="Gateway merchant ID (Stripe/Adyen)"
                                className="bg-white text-slate-900"
                              />
                              <select
                                value={gpayConfig.environment}
                                onChange={(e) =>
                                  setGpayConfig((p) => ({
                                    ...p,
                                    environment: e.target.value as "TEST" | "PRODUCTION",
                                  }))
                                }
                                className="border rounded-md px-2 py-1 text-sm text-slate-900 bg-white"
                              >
                                <option value="TEST">Test</option>
                                <option value="PRODUCTION">Production</option>
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-blue-50 text-blue-800 border-blue-200"
                                onClick={() => handleSaveProvider("gpay")}
                                disabled={providerSaving}
                              >
                                {providerSaving ? "Saving..." : "Save to backend"}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {CARD_TEMPLATES.map((card) => (
                      <button
                        key={card.brand}
                        type="button"
                        onClick={() =>
                          setPaymentForm({
                            ...paymentForm,
                            brand: card.brand,
                            cardNumber: card.mask,
                          })
                        }
                        className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition ${
                          paymentForm.brand === card.brand
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-blue-200"
                        }`}
                      >
                        {card.icon ? (
                          <img src={card.icon} alt={card.brand} className="h-4 w-auto" />
                        ) : null}
                        <span>{card.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-slate-700">Cardholder Name</Label>
                    <Input
                      id="name"
                      value={paymentForm.cardholderName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                      placeholder="John Doe"
                      disabled={selectedPaymentType !== "card"}
                      className="bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="number" className="text-slate-700">Card number</Label>
                    <Input
                      id="number"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                      placeholder="1234 1234 1234 1234"
                      disabled={selectedPaymentType !== "card"}
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="month" className="text-slate-700">Expiry month</Label>
                      <Input
                        id="month"
                        value={paymentForm.expMonth}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expMonth: e.target.value })}
                        placeholder="MM"
                        disabled={selectedPaymentType !== "card"}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="year" className="text-slate-700">Expiry year</Label>
                      <Input
                        id="year"
                        value={paymentForm.expYear}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expYear: e.target.value })}
                        placeholder="YYYY"
                        disabled={selectedPaymentType !== "card"}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvc" className="text-slate-700">Security code</Label>
                      <Input
                        id="cvc"
                        value={paymentForm.cvc}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                        placeholder="CVC"
                        disabled={selectedPaymentType !== "card"}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="billingEmail" className="text-slate-700">Billing email</Label>
                    <Input
                      id="billingEmail"
                      value={paymentForm.billingEmail}
                      onChange={(e) => setPaymentForm({ ...paymentForm, billingEmail: e.target.value })}
                      placeholder="billing@email.com"
                      disabled={selectedPaymentType !== "card"}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* PayPal placeholder */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <label className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="radio"
                    name="paymentType"
                    value="paypal"
                    checked={selectedPaymentType === "paypal"}
                    onChange={() => setSelectedPaymentType("paypal")}
                    className="accent-blue-600"
                  />
                  <span className="text-slate-900 font-medium">PayPal</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4 bg-white">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSavePaymentMethod}
                disabled={isSavingPayment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSavingPayment ? "Saving..." : "Add"}
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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Invoice</span>
                <span className="font-medium text-slate-900">{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount</span>
                <span className="font-medium text-slate-900">
                  {selectedInvoice.amount} {selectedInvoice.currency || ""}
                </span>
              </div>
              {selectedInvoice.period && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Period</span>
                  <span className="font-medium text-slate-900">{selectedInvoice.period}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span className="font-medium text-slate-900 capitalize">{selectedInvoice.status}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Close
            </Button>
            {selectedInvoice && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    const match = invoices.find((inv) => inv.invoice_number === selectedInvoice.invoice_number);
                    if (match) handleViewPdf(match.id);
                  }}
                >
                  View PDF
                </Button>
                <Button
                  onClick={() => {
                    const match = invoices.find((inv) => inv.invoice_number === selectedInvoice.invoice_number);
                    if (match) handleDownloadInvoice(match.id, match.invoice_number);
                  }}
                >
                  Download
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
