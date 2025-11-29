import React, { useEffect, useState } from 'react';
import {
  getSubscription,
  getUsageStats,
  listInvoices,
  getPaymentMethod,
  getPlans,
  listWorkspaces,
  upgradeSubscription,
  type Invoice as ApiInvoice,
  type Plan as ApiPlan,
} from '@/lib/api';
import { CreditCard, Download, Calendar, CheckCircle, AlertCircle, TrendingUp, Phone, Clock, Mic, Globe, Plus, Trash2, Check, Search, Filter, Eye, FileText, Receipt, ChevronLeft, ChevronRight, Zap, Shield, Headphones, Star, X } from 'lucide-react';
import Footer from './Footer';
import jsPDF from 'jspdf';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    calls: number;
    minutes: number;
    agents: number;
    phoneNumbers: number;
  };
  isPopular?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'stripe' | 'apple-pay' | 'google-pay' | 'crypto';
  last4: string;
  brand: string;
  expiryMonth?: number;
  expiryYear?: number;
  accountType?: 'checking' | 'savings' | 'current' | 'business';
  bankName?: string;
  isDefault: boolean;
}

interface UsageMetric {
  label: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
}

interface BillingPageProps {
  onNavigateToAddPayment?: () => void;
  refreshSignal?: number;
}

export default function BillingPage({ onNavigateToAddPayment, refreshSignal = 0 }: BillingPageProps) {
  const mapPlans = (apiPlans: ApiPlan[], interval: 'monthly' | 'yearly'): Plan[] =>
    apiPlans.map((p) => ({
      id: p.id,
      name: p.name,
      price:
        interval === 'monthly'
          ? p.price_monthly
          : p.price_annual ?? p.price_monthly * 10,
      interval,
      features: p.features || [],
      limits: {
        calls: -1,
        minutes: -1,
        agents: -1,
        phoneNumbers: -1,
      },
      isPopular: p.id === 'professional' || p.id === 'pro',
    }));
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditingBillingInfo, setIsEditingBillingInfo] = useState(false);
  const itemsPerPage = 5;

  // Customer/User data
  const [customerData, setCustomerData] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    address: {
      street: '456 Customer Lane',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    }
  });

  // Edit form data
  const [editFormData, setEditFormData] = useState(customerData);

  // Current subscription data
  const [currentPlan, setCurrentPlan] = useState({
    id: 'professional',
    name: 'Professional',
    price: 149,
    interval: 'monthly' as 'monthly' | 'yearly',
    nextBillingDate: '2025-12-29',
    status: 'active'
  });
  const [planCatalog, setPlanCatalog] = useState<ApiPlan[]>([]);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Plans data
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'starter',
      name: 'Starter',
      price: billingInterval === 'monthly' ? 49 : 470,
      interval: billingInterval,
      features: [
        '1,000 minutes/month',
        '500 calls/month',
        '3 AI voice agents',
        '2 phone numbers',
        '100+ voices',
        '20+ languages',
        'Email support',
        'Basic analytics',
        'CRM integrations'
      ],
      limits: {
        calls: 500,
        minutes: 1000,
        agents: 3,
        phoneNumbers: 2
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingInterval === 'monthly' ? 149 : 1430,
      interval: billingInterval,
      features: [
        '5,000 minutes/month',
        '2,500 calls/month',
        '10 AI voice agents',
        '5 phone numbers',
        '400+ voices',
        '40+ languages',
        'Priority support',
        'Advanced analytics',
        'All integrations',
        'Custom workflows',
        'Meeting integrations',
        'API access'
      ],
      limits: {
        calls: 2500,
        minutes: 5000,
        agents: 10,
        phoneNumbers: 5
      },
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingInterval === 'monthly' ? 499 : 4790,
      interval: billingInterval,
      features: [
        'Unlimited minutes',
        'Unlimited calls',
        'Unlimited agents',
        'Unlimited phone numbers',
        '400+ voices',
        '40+ languages',
        '24/7 dedicated support',
        'Advanced analytics',
        'White-label branding',
        'Custom integrations',
        'Multi-tenant workspaces',
        'SLA guarantee',
        'Custom AI training',
        'Dedicated infrastructure'
      ],
      limits: {
        calls: -1,
        minutes: -1,
        agents: -1,
        phoneNumbers: -1
      }
    }
  ]);

  // Usage metrics
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([
    {
      label: 'Calls This Month',
      current: 0,
      limit: 2500,
      unit: 'calls',
      icon: <Phone className="w-5 h-5" />
    },
    {
      label: 'Minutes Used',
      current: 0,
      limit: 5000,
      unit: 'minutes',
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Active Agents',
      current: 0,
      limit: 10,
      unit: 'agents',
      icon: <Mic className="w-5 h-5" />
    },
    {
      label: 'Phone Numbers',
      current: 0,
      limit: 5,
      unit: 'numbers',
      icon: <Globe className="w-5 h-5" />
    }
  ]);

  // Invoices
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);

  // Filter and search invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // Calculate total spent
  const totalSpent = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingText, setLoadingText] = useState("Loading billing...");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        setLoadingText("Loading workspace...");
        const workspaces = await listWorkspaces();
        const active = workspaces?.find((w: any) => w.is_active) ?? workspaces?.[0];
        const wsId = active?.id ?? active?.workspace_id;
        if (!wsId) {
          throw new Error("No workspace found. Create a workspace to manage billing.");
        }
        if (!mounted) return;
        setWorkspaceId(wsId);

        setLoadingText("Loading billing data...");
        const [subscription, usageStats, invoicesData, payment, planData] = await Promise.all([
          getSubscription(wsId),
          getUsageStats(wsId).catch(() => []),
          listInvoices(wsId).catch(() => []),
          getPaymentMethod(wsId).catch(() => null),
          getPlans().catch(() => ({ plans: [] })),
        ]);

        if (!mounted) return;

        if (planData?.plans?.length) {
          setPlanCatalog(planData.plans);
          setPlans(mapPlans(planData.plans, billingInterval));
        }

        if (subscription) {
          const planDetail = subscription.plan_details ?? planData?.plans?.find((p: ApiPlan) => p.id === subscription.plan);
          setCurrentPlan({
            id: subscription.plan,
            name: planDetail?.name || subscription.plan,
            price:
              billingInterval === 'monthly'
                ? planDetail?.price_monthly ?? 0
                : planDetail?.price_annual ?? planDetail?.price_monthly ?? 0,
            interval: billingInterval,
            nextBillingDate: subscription.current_period_end
              ? subscription.current_period_end.split('T')[0]
              : '',
            status: subscription.status || 'active',
          });
        }

        if (Array.isArray(usageStats)) {
          const minutes = usageStats.find((u: any) => u.metric === "minutes")?.value ?? 0;
          const calls = usageStats.find((u: any) => u.metric === "calls")?.value ?? 0;
          const agents = usageStats.find((u: any) => u.metric === "agents")?.value ?? 0;
          setUsageMetrics([
            { label: 'Calls This Month', current: calls, limit: 2500, unit: 'calls', icon: <Phone className="w-5 h-5" /> },
            { label: 'Minutes Used', current: minutes, limit: 5000, unit: 'minutes', icon: <Clock className="w-5 h-5" /> },
            { label: 'Active Agents', current: agents, limit: 10, unit: 'agents', icon: <Mic className="w-5 h-5" /> },
            { label: 'Phone Numbers', current: 0, limit: 5, unit: 'numbers', icon: <Globe className="w-5 h-5" /> },
          ]);
        }

        if (Array.isArray(invoicesData)) {
          setAllInvoices(
            invoicesData.map((inv: ApiInvoice) => ({
              id: inv.invoice_number,
              date: inv.created_at?.split('T')[0] ?? '',
              amount: inv.amount_cents / 100,
              status: (inv.status as Invoice["status"]) || 'paid',
              description: inv.description || `${inv.invoice_number}`,
              invoiceUrl: `/api/billing/invoices/${inv.id}/download`,
            }))
          );
        }

        if (payment) {
          setPaymentMethods([
            {
              id: String(payment.id),
              type: 'card',
              last4: payment.last4,
              brand: payment.brand,
              expiryMonth: payment.exp_month,
              expiryYear: payment.exp_year,
              isDefault: true,
            },
          ]);
        }
      } catch (err: any) {
        if (!mounted) return;
        setLoadError(err?.message || "Failed to load billing data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  useEffect(() => {
    if (planCatalog.length === 0) return;
    setPlans(mapPlans(planCatalog, billingInterval));
    setCurrentPlan((prev) => {
      const planDetail = planCatalog.find((p) => p.id === prev.id);
      return {
        ...prev,
        price:
          billingInterval === 'monthly'
            ? planDetail?.price_monthly ?? prev.price
            : planDetail?.price_annual ?? planDetail?.price_monthly ?? prev.price,
        interval: billingInterval,
      };
    });
  }, [billingInterval, planCatalog]);

  const handleChangePlan = async (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;
    
    const confirmMessage = currentPlan.id === planId && currentPlan.interval === selectedPlan.interval
      ? `You are already on the ${selectedPlan.name} plan.`
      : `Switch to ${selectedPlan.name} plan for ${formatCurrency(selectedPlan.price)}/${selectedPlan.interval}?`;
    
    if (currentPlan.id === planId && currentPlan.interval === selectedPlan.interval) {
      alert(confirmMessage);
      return;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    if (workspaceId) {
      try {
        await upgradeSubscription(workspaceId, selectedPlan.id);
        const refreshedInvoices = await listInvoices(workspaceId).catch(() => []);
        setAllInvoices(
          (refreshedInvoices || []).map((inv: ApiInvoice) => ({
            id: inv.invoice_number,
            date: inv.created_at?.split('T')[0] ?? '',
            amount: inv.amount_cents / 100,
            status: (inv.status as Invoice["status"]) || 'paid',
            description: inv.description || `${inv.invoice_number}`,
            invoiceUrl: `/api/billing/invoices/${inv.id}/download`,
          }))
        );
      } catch (err: any) {
        alert(err?.message || "Failed to change plan");
        return;
      }
    }

    // Calculate next billing date (30 days from now)
    const nextBilling = new Date();
    nextBilling.setDate(nextBilling.getDate() + 30);
    const nextBillingDate = nextBilling.toISOString().split('T')[0];

    setCurrentPlan({
      id: selectedPlan.id,
      name: selectedPlan.name,
      price: selectedPlan.price,
      interval: selectedPlan.interval,
      nextBillingDate: nextBillingDate,
      status: 'active'
    });

    alert(`Successfully switched to ${selectedPlan.name} plan! Your next billing date is ${nextBillingDate}.`);
  };

  const handleSetDefaultPayment = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(m => ({ ...m, isDefault: m.id === methodId }))
    );
  };

  const handleRemovePayment = (methodId: string) => {
    if (paymentMethods.length === 1) {
      alert('You must have at least one payment method');
      return;
    }
    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return (current / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (paymentMethods.length === 0) {
      alert('Add a payment method before downloading a receipt.');
      return;
    }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Get default payment method for invoice
    const defaultPayment = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
    
    // Modern gradient header with accent
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Accent stripe
    doc.setFillColor(147, 51, 234); // Purple-600
    doc.rect(0, 0, pageWidth, 3, 'F');
    
    // Company logo placeholder (circle)
    doc.setFillColor(255, 255, 255);
    doc.circle(30, 25, 8, 'F');
    doc.setFillColor(37, 99, 235);
    doc.circle(30, 25, 6, 'F');
    
    // Company name with modern font
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('VOICE AI PLATFORM', 43, 23);
    
    doc.setFontSize(9);
    doc.setTextColor(219, 234, 254); // Blue-100
    doc.text('Intelligent Voice Solutions', 43, 30);
    doc.text('123 AI Street, San Francisco, CA 94105', 43, 36);
    
    // Invoice badge on the right
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 65, 12, 50, 18, 3, 3, 'F');
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth - 40, 24, { align: 'center' });
    
    // Status badge
    let statusBgColor: [number, number, number];
    let statusTextColor: [number, number, number];
    if (invoice.status === 'paid') {
      statusBgColor = [220, 252, 231]; // Green-100
      statusTextColor = [22, 163, 74]; // Green-600
    } else if (invoice.status === 'pending') {
      statusBgColor = [254, 249, 195]; // Yellow-100
      statusTextColor = [202, 138, 4]; // Yellow-600
    } else {
      statusBgColor = [254, 226, 226]; // Red-100
      statusTextColor = [220, 38, 38]; // Red-600
    }
    
    doc.setFillColor(...statusBgColor);
    doc.roundedRect(pageWidth - 65, 33, 50, 8, 2, 2, 'F');
    doc.setTextColor(...statusTextColor);
    doc.setFontSize(8);
    doc.text(invoice.status.toUpperCase(), pageWidth - 40, 38, { align: 'center' });
    
    // Main content area with subtle background
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.rect(0, 55, pageWidth, pageHeight - 85, 'F');
    
    // Invoice details card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 70, pageWidth - 30, 48, 4, 4, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 70, pageWidth - 30, 48, 4, 4, 'S');
    
    // Bill To section
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text('BILL TO', 25, 79);
    
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.text(customerData.company ? customerData.company : customerData.name, 25, 88);
    
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    if (customerData.company) {
      doc.text(customerData.name, 25, 95);
    }
    
    doc.setTextColor(107, 114, 128);
    const emailY = customerData.company ? 101 : 95;
    doc.text(customerData.email, 25, emailY);
    doc.text(customerData.phone, 25, emailY + 6);
    doc.text(`${customerData.address.street}, ${customerData.address.city}, ${customerData.address.state} ${customerData.address.zip}`, 25, emailY + 12);
    
    // Vertical divider
    doc.setDrawColor(229, 231, 235);
    doc.line(pageWidth / 2, 75, pageWidth / 2, 113);
    
    // Invoice info section
    const rightCol = pageWidth / 2 + 10;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Invoice Number', rightCol, 79);
    doc.text('Issue Date', rightCol, 90);
    doc.text('Due Date', rightCol, 101);
    
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(invoice.id, pageWidth - 25, 79, { align: 'right' });
    doc.text(new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), pageWidth - 25, 90, { align: 'right' });
    const dueDate = new Date(invoice.date);
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), pageWidth - 25, 101, { align: 'right' });
    
    // Items table with modern design
    const tableTop = 130;
    
    // Table container with border
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, tableTop, pageWidth - 30, 60, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, tableTop, pageWidth - 30, 60, 3, 3, 'S');
    
    // Table header
    doc.setFillColor(37, 99, 235);
    doc.rect(15, tableTop, pageWidth - 30, 12, 'F');
    
    // Rounded top corners for header
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(15, tableTop, pageWidth - 30, 12, 3, 3, 'F');
    doc.rect(15, tableTop + 6, pageWidth - 30, 6, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Description', 25, tableTop + 8);
    doc.text('Qty', pageWidth - 65, tableTop + 8, { align: 'center' });
    doc.text('Amount', pageWidth - 25, tableTop + 8, { align: 'right' });
    
    // Item row
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    const descLines = doc.splitTextToSize(invoice.description, 100);
    doc.text(descLines, 25, tableTop + 22);
    doc.text('1', pageWidth - 65, tableTop + 22, { align: 'center' });
    doc.text(formatCurrency(invoice.amount), pageWidth - 25, tableTop + 22, { align: 'right' });
    
    // Horizontal separator line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, tableTop + 32, pageWidth - 20, tableTop + 32);
    
    // Summary rows inside table
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('Subtotal', pageWidth - 90, tableTop + 40);
    doc.setTextColor(17, 24, 39);
    doc.text(formatCurrency(invoice.amount), pageWidth - 25, tableTop + 40, { align: 'right' });
    
    // Tax
    doc.setTextColor(107, 114, 128);
    doc.text('Tax (0%)', pageWidth - 90, tableTop + 48);
    doc.setTextColor(17, 24, 39);
    doc.text('$0.00', pageWidth - 25, tableTop + 48, { align: 'right' });
    
    // Discount
    doc.setTextColor(107, 114, 128);
    doc.text('Discount', pageWidth - 90, tableTop + 56);
    doc.setTextColor(34, 197, 94);
    doc.text('-$0.00', pageWidth - 25, tableTop + 56, { align: 'right' });
    
    // Summary section position
    const summaryTop = tableTop + 60;
    
    // Total section with highlight
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.roundedRect(15, summaryTop + 8, pageWidth - 30, 16, 3, 3, 'F');
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.roundedRect(15, summaryTop + 8, pageWidth - 30, 16, 3, 3, 'S');
    
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text('TOTAL DUE', 25, summaryTop + 18);
    doc.setFontSize(15);
    doc.text(formatCurrency(invoice.amount), pageWidth - 25, summaryTop + 18, { align: 'right' });
    
    // Payment info card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, summaryTop + 32, pageWidth - 30, 18, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, summaryTop + 32, pageWidth - 30, 18, 3, 3, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('PAYMENT METHOD', 25, summaryTop + 38);
    
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    let paymentText = 'Not specified';
    if (defaultPayment) {
      if (defaultPayment.type === 'bank') {
        const bankName = defaultPayment.bankName || defaultPayment.brand;
        const accountType = defaultPayment.accountType ? ` (${defaultPayment.accountType.charAt(0).toUpperCase() + defaultPayment.accountType.slice(1)})` : '';
        paymentText = `${bankName}${accountType} ending in ${defaultPayment.last4}`;
      } else if (defaultPayment.type === 'paypal') {
        paymentText = `${defaultPayment.brand} - ${defaultPayment.last4}@email.com`;
      } else if (defaultPayment.type === 'apple-pay' || defaultPayment.type === 'google-pay') {
        paymentText = defaultPayment.brand;
      } else {
        paymentText = `${defaultPayment.brand} ending in ${defaultPayment.last4}`;
      }
    }
    doc.text(paymentText, 25, summaryTop + 45);
    
    // Footer with gradient
    const footerY = pageHeight - 30;
    doc.setFillColor(37, 99, 235);
    doc.rect(0, footerY, pageWidth, 30, 'F');
    
    // Footer accent
    doc.setFillColor(147, 51, 234);
    doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(219, 234, 254);
    doc.text('Questions? Email us at support@voiceai.com or call +1 (800) 123-4567', pageWidth / 2, footerY + 17, { align: 'center' });
    doc.text('www.voiceai.com', pageWidth / 2, footerY + 23, { align: 'center' });
    
    // Save the PDF
    doc.save(`${invoice.id}.pdf`);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <path d="M2 10h20M7 14h.01M11 14h2"/>
          </svg>
        );
      case 'paypal':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L9.096 7.58a.972.972 0 01.96-.817h4.86c1.415 0 2.6.094 3.543.334 1.064.27 1.902.746 2.608 1.38z"/>
          </svg>
        );
      case 'apple-pay':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.337 4.819c.607-.77 1.018-1.84.906-2.909-.876.036-1.938.583-2.566 1.32-.561.653-1.053 1.697-.92 2.697.972.076 1.964-.494 2.58-1.108zM19.975 17.81c-.407 1.002-.604 1.449-1.128 2.334-.733 1.237-1.766 2.777-3.048 2.791-1.141.013-1.444-.75-2.996-.741-1.552.008-1.887.755-3.028.741-1.282-.013-2.251-1.396-2.984-2.633-2.054-3.464-2.27-7.527-.999-9.682.904-1.535 2.327-2.436 3.65-2.436 1.357 0 2.21.747 3.333.747 1.086 0 1.746-.748 3.313-.748 1.182 0 2.471.721 3.377 1.966-2.968 1.628-2.486 5.872.51 6.661z"/>
          </svg>
        );
      case 'google-pay':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.88-11.49L17 12l-4.12 3.49V13h-3v3H8.5V8H9.88v2.5h3z"/>
          </svg>
        );
      case 'crypto':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-gray-900 mb-2">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your subscription, billing, and payment methods</p>
          </div>

          {/* Current Plan Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-blue-100 mb-2">Current Plan</p>
                <h2 className="text-white mb-1">{currentPlan.name}</h2>
                <p className="text-blue-100">
                  {formatCurrency(currentPlan.price)}/{currentPlan.interval}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="capitalize">{currentPlan.status}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="w-4 h-4" />
              <span>Next billing date: {new Date(currentPlan.nextBillingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Usage Metrics */}
          <div>
            <h3 className="text-gray-900 mb-4">Current Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {usageMetrics.map((metric, index) => {
                const percentage = getUsagePercentage(metric.current, metric.limit);
                const colorClass = getUsageColor(percentage);
                
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorClass} mb-4`}>
                      {metric.icon}
                    </div>
                    <p className="text-gray-600 mb-2">{metric.label}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-gray-900">{metric.current.toLocaleString()}</span>
                      <span className="text-gray-400">/ {metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}</span>
                    </div>
                    {metric.limit !== -1 && (
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            percentage >= 90 ? 'bg-red-600' : 
                            percentage >= 70 ? 'bg-orange-600' : 
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing Information */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900">Billing Information</h3>
              <button
                onClick={() => {
                  setEditFormData(customerData);
                  setIsEditingBillingInfo(true);
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Edit Information
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Customer Name</p>
                  <p className="text-gray-900">{customerData.name}</p>
                </div>
                {customerData.company && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Company Name</p>
                    <p className="text-gray-900">{customerData.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="text-gray-900">{customerData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Phone</p>
                  <p className="text-gray-900">{customerData.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-sm mb-1">Billing Address</p>
                  <p className="text-gray-900">
                    {customerData.address.street}<br />
                    {customerData.address.city}, {customerData.address.state} {customerData.address.zip}<br />
                    {customerData.address.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900">Payment Methods</h3>
              <button
                onClick={() => onNavigateToAddPayment?.()}
                disabled={!onNavigateToAddPayment}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  onNavigateToAddPayment
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {getPaymentIcon(method.type)}
                      </div>
                      <div>
                        <p className="text-gray-900">
                          {method.type === 'bank' && method.bankName ? method.bankName : method.brand} 
                          {method.type !== 'paypal' && method.type !== 'apple-pay' && method.type !== 'google-pay' && ` •••• ${method.last4}`}
                        </p>
                        {method.expiryMonth && method.expiryYear && (
                          <p className="text-gray-500 text-sm">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        )}
                        {method.type === 'bank' && method.accountType && (
                          <p className="text-gray-500 text-sm capitalize">
                            {method.accountType} Account
                          </p>
                        )}
                        {method.type === 'paypal' && (
                          <p className="text-gray-500 text-sm">
                            {method.last4}@email.com
                          </p>
                        )}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPayment(method.id)}
                        className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePayment(method.id)}
                      className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      disabled={method.isDefault}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-gray-900 mb-1">Billing History</h3>
                <p className="text-gray-600">
                  Total spent: <span className="text-gray-900">{formatCurrency(totalSpent)}</span> • {allInvoices.length} invoices
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-64"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none w-full sm:w-40"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-green-900">Total Paid</p>
                    <p className="text-green-600 text-sm">{allInvoices.filter(i => i.status === 'paid').length} invoices</p>
                  </div>
                </div>
                <p className="text-green-900">{formatCurrency(allInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0))}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-900">This Year</p>
                    <p className="text-blue-600 text-sm">2024</p>
                  </div>
                </div>
                <p className="text-blue-900">{formatCurrency(allInvoices.filter(i => i.date.includes('2024')).reduce((sum, inv) => sum + inv.amount, 0))}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-purple-900">Average Payment</p>
                    <p className="text-purple-600 text-sm">Per invoice</p>
                  </div>
                </div>
                <p className="text-purple-900">{formatCurrency(totalSpent / allInvoices.length)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {paginatedInvoices.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-4 text-gray-900">Invoice</th>
                          <th className="text-left px-6 py-4 text-gray-900">Date</th>
                          <th className="text-left px-6 py-4 text-gray-900">Description</th>
                          <th className="text-left px-6 py-4 text-gray-900">Amount</th>
                          <th className="text-left px-6 py-4 text-gray-900">Status</th>
                          <th className="text-right px-6 py-4 text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedInvoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{invoice.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                {new Date(invoice.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">{invoice.description}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-900">{formatCurrency(invoice.amount)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${
                                  invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : invoice.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {invoice.status === 'paid' ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : invoice.status === 'pending' ? (
                                  <Clock className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                )}
                                <span className="capitalize">{invoice.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedInvoice(invoice)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Download Invoice"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-gray-600 text-sm">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No invoices found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Detail Modal */}
          {selectedInvoice && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInvoice(null)}>
              <div className="bg-white rounded-xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-gray-900 mb-1">Invoice Details</h3>
                    <p className="text-gray-600">{selectedInvoice.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 mb-1">Invoice Number</p>
                      <p className="text-gray-900">{selectedInvoice.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Date Issued</p>
                      <p className="text-gray-900">
                        {new Date(selectedInvoice.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Status</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${
                          selectedInvoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : selectedInvoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span className="capitalize">{selectedInvoice.status}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Payment Method</p>
                      <p className="text-gray-900">Visa •••• 4242</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-600 mb-2">Description</p>
                    <p className="text-gray-900">{selectedInvoice.description}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax (0%)</span>
                      <span className="text-gray-900">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => {
                        handleDownloadInvoice(selectedInvoice);
                        setSelectedInvoice(null);
                      }}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usage-Based Pricing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-2">Usage-Based Pricing</h4>
                <p className="text-gray-600 mb-4">
                  Additional usage beyond your plan limits will be charged at the following rates:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>Additional calls: $0.10 per call</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>Additional minutes: $0.05 per minute</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>Additional phone numbers: $5.00 per number/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>Additional agents: $20.00 per agent/month</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Available Plans - Moved to the end */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-gray-900 mb-2">Choose Your Perfect Plan</h3>
              <p className="text-gray-600 mb-6">Flexible pricing that grows with your business</p>
              
              <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 p-1 shadow-sm">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-6 py-3 rounded-md transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                    billingInterval === 'yearly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className={`text-xs px-2.5 py-1 rounded font-medium ${billingInterval === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Comparison Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-blue-900">Lightning Fast</p>
                <p className="text-blue-600 text-sm">Sub-second response</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <p className="text-purple-900">Enterprise Security</p>
                <p className="text-purple-600 text-sm">SOC 2 Type II certified</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200">
                <Headphones className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-green-900">24/7 Support</p>
                <p className="text-green-600 text-sm">Always here to help</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center border border-orange-200">
                <Star className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <p className="text-orange-900">4.9/5 Rating</p>
                <p className="text-orange-600 text-sm">From 10,000+ users</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border-2 p-8 relative transition-all hover:shadow-xl ${
                    currentPlan.id === plan.id && currentPlan.interval === plan.interval
                      ? 'border-green-500 shadow-xl scale-105 z-10' 
                      : plan.isPopular 
                      ? 'border-blue-600 shadow-lg' 
                      : 'border-gray-200'
                  }`}
                >
                  {currentPlan.id === plan.id && currentPlan.interval === plan.interval ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full shadow-lg">
                      ✓ Current Plan
                    </div>
                  ) : plan.isPopular ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg">
                      ⭐ Most Popular
                    </div>
                  ) : null}
                  
                  <div className="mb-8">
                    <h4 className="text-gray-900 mb-3">{plan.name}</h4>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-gray-900">{formatCurrency(plan.price)}</span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>
                    {billingInterval === 'yearly' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-green-700 text-sm">
                          💰 {formatCurrency(plan.price / 12)}/month
                        </p>
                        <p className="text-green-600 text-xs">
                          Save {formatCurrency((plan.price / 0.8 - plan.price))} annually
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-600 mb-4">What's included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleChangePlan(plan.id)}
                    className={`w-full py-4 px-6 rounded-xl font-medium transition-all ${
                      currentPlan.id === plan.id && currentPlan.interval === plan.interval
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed opacity-90'
                        : plan.isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:shadow-md'
                    }`}
                    disabled={currentPlan.id === plan.id && currentPlan.interval === plan.interval}
                  >
                    {currentPlan.id === plan.id && currentPlan.interval === plan.interval ? '✓ Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade to ' + plan.name}
                  </button>

                  {plan.id === 'enterprise' && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Custom pricing for your needs
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <h4 className="text-gray-900 mb-6 text-center">Frequently Asked Questions</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-900 mb-2">Can I change plans anytime?</p>
                  <p className="text-gray-600 text-sm">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div>
                  <p className="text-gray-900 mb-2">What happens if I exceed my limits?</p>
                  <p className="text-gray-600 text-sm">You'll be charged for additional usage at our standard overage rates. We'll notify you before any charges.</p>
                </div>
                <div>
                  <p className="text-gray-900 mb-2">Is there a free trial?</p>
                  <p className="text-gray-600 text-sm">Yes! All plans come with a 14-day free trial. No credit card required to start.</p>
                </div>
                <div>
                  <p className="text-gray-900 mb-2">Do you offer refunds?</p>
                  <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Edit Billing Information Modal */}
      {isEditingBillingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-gray-900">Edit Billing Information</h3>
              <button
                onClick={() => setIsEditingBillingInfo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCustomerData(editFormData);
                  setIsEditingBillingInfo(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.company}
                      onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-gray-900 mb-4">Address</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.address.street}
                        onChange={(e) => setEditFormData({ 
                          ...editFormData, 
                          address: { ...editFormData.address, street: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.address.city}
                          onChange={(e) => setEditFormData({ 
                            ...editFormData, 
                            address: { ...editFormData.address, city: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.address.state}
                          onChange={(e) => setEditFormData({ 
                            ...editFormData, 
                            address: { ...editFormData.address, state: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          ZIP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.address.zip}
                          onChange={(e) => setEditFormData({ 
                            ...editFormData, 
                            address: { ...editFormData.address, zip: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.address.country}
                        onChange={(e) => setEditFormData({ 
                          ...editFormData, 
                          address: { ...editFormData.address, country: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingBillingInfo(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
