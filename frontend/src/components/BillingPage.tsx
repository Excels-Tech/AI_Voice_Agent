import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Phone, 
  Clock, 
  Mic, 
  Globe, 
  Plus, 
  Trash2, 
  Check, 
  Info,
  Settings,
  Shield,
  Building2,
  Receipt,
  Edit,
  User,
  Mail,
  MapPin,
  X,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Zap,
  Headphones,
  Star,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Plan {
  id: string;
  name: string;
  price: number;
  monthlyPrice: number;
  yearlyPrice: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    calls: number;
    minutes: number;
    agents: number;
    phoneNumbers: number;
  };
  isPopular?: boolean;
  badge?: string;
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
  type: 'visa' | 'mastercard' | 'paypal' | 'payoneer';
  last4?: string;
  email?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName?: string;
  bankName?: string;
  accountType?: string;
}

interface BillingInfo {
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UsageMetric {
  label: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
}

type PaymentProviderType = 'card' | 'paypal' | 'payoneer';

interface BillingPageProps {
  onNavigateToPaymentMethod?: () => void;
}

export default function BillingPage({ onNavigateToPaymentMethod }: BillingPageProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showEditBillingInfo, setShowEditBillingInfo] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProviderType>('card');
  const [cardType, setCardType] = useState<'visa' | 'mastercard'>('visa');
  const [searchInvoices, setSearchInvoices] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2024-12', date: '2024-12-01', amount: 149.00, status: 'paid', description: 'Professional Plan - December 2024' },
    { id: 'INV-2024-11', date: '2024-11-01', amount: 149.00, status: 'paid', description: 'Professional Plan - November 2024' },
    { id: 'INV-2024-10', date: '2024-10-01', amount: 149.00, status: 'paid', description: 'Professional Plan - October 2024' },
  ]);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddressLine, setBillingAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('checking');

  // Billing Information
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    customerName: 'John Smith',
    companyName: 'Tech Solutions Inc.',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    billingAddress: '456 Customer Lane',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  });

  // Current subscription data
  const currentPlan = {
    name: 'Professional',
    price: 149,
    interval: 'monthly',
    nextBillingDate: '2025-12-29',
    status: 'active'
  };

  // Plans data
  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingInterval === 'monthly' ? 49 : 470,
      monthlyPrice: 49,
      yearlyPrice: 470,
      interval: billingInterval,
      features: [
        '1,000 minutes/month',
        '500 calls/month',
        '3 AI voice agents',
        '2 phone numbers',
        '100+ voices',
        '20+ languages',
        'Email support',
        'Basic analytics'
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
      monthlyPrice: 149,
      yearlyPrice: 1430,
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
      monthlyPrice: 499,
      yearlyPrice: 4790,
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
        'SLA guarantee'
      ],
      limits: {
        calls: -1,
        minutes: -1,
        agents: -1,
        phoneNumbers: -1
      }
    }
  ];

  // Usage metrics
  const usageMetrics: UsageMetric[] = [
    {
      label: 'Calls This Month',
      current: 1847,
      limit: 2500,
      unit: 'calls',
      icon: <Phone className="w-5 h-5 text-orange-600" />
    },
    {
      label: 'Minutes Used',
      current: 3621,
      limit: 5000,
      unit: 'minutes',
      icon: <Clock className="w-5 h-5 text-orange-600" />
    },
    {
      label: 'Active Agents',
      current: 7,
      limit: 10,
      unit: 'agents',
      icon: <Mic className="w-5 h-5 text-orange-600" />
    },
    {
      label: 'Phone Numbers',
      current: 4,
      limit: 5,
      unit: 'numbers',
      icon: <Globe className="w-5 h-5 text-orange-600" />
    }
  ];



  // Calculate billing stats
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const thisYearTotal = invoices.filter(inv => inv.date.startsWith('2024')).reduce((sum, inv) => sum + inv.amount, 0);
  const averagePayment = invoices.length > 0 ? totalPaid / invoices.length : 0;

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1',
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
      holderName: 'John Smith'
    },
    {
      id: 'pm_2',
      type: 'mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2025,
      isDefault: false,
      holderName: 'John Smith'
    }
  ]);

  const handleChangePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      handlePlanUpgrade(plan);
    }
  };

  const handleSetDefaultPayment = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(m => ({ ...m, isDefault: m.id === methodId }))
    );
    toast.success('Default payment method updated');
  };

  const handleRemovePayment = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault && paymentMethods.length > 1) {
      toast.error('Please set another payment method as default before removing this one');
      return;
    }
    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
    toast.success('Payment method removed');
  };

  const handleAddPaymentMethod = () => {
    if (selectedPaymentProvider === 'card') {
      if (!cardNumber || !expiryDate || !cvc || !cardholderName) {
        toast.error('Please fill in all card details');
        return;
      }

      const [month, year] = expiryDate.split('/');
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: cardType,
        last4: cardNumber.slice(-4),
        expiryMonth: parseInt(month),
        expiryYear: parseInt('20' + year),
        isDefault: paymentMethods.length === 0,
        holderName: cardholderName
      };

      setPaymentMethods(methods => [...methods, newMethod]);
      toast.success('Card added successfully');
    } else if (selectedPaymentProvider === 'paypal') {
      if (!email) {
        toast.error('Please enter your PayPal email address');
        return;
      }

      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'paypal',
        email: email,
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods(methods => [...methods, newMethod]);
      toast.success('PayPal account added successfully');
    } else if (selectedPaymentProvider === 'payoneer') {
      if (!email || !cardholderName) {
        toast.error('Please fill in all Payoneer details');
        return;
      }

      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'payoneer',
        email: email,
        holderName: cardholderName,
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods(methods => [...methods, newMethod]);
      toast.success('Payoneer account added successfully');
    } else {
      toast.success(`${selectedPaymentProvider} integration will be configured (requires API setup)`);
    }

    // Reset form
    setCardNumber('');
    setExpiryDate('');
    setCvc('');
    setCardholderName('');
    setBillingAddressLine('');
    setCity('');
    setState('');
    setEmail('');
    setBankName('');
    setAccountNumber('');
    setShowAddPaymentMethod(false);

    // If this was a plan upgrade, complete the payment flow
    if (selectedPlanForUpgrade) {
      handleCompletePayment();
    }
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

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'paypal') {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">P</span>
        </div>
      );
    }
    if (method.type === 'payoneer') {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-sm">PY</span>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
        <CreditCard className="w-6 h-6 text-white" />
      </div>
    );
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchInvoices.toLowerCase()) ||
                         inv.description.toLowerCase().includes(searchInvoices.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceViewer(true);
  };

  const handlePlanUpgrade = (plan: any) => {
    setSelectedPlanForUpgrade(plan);
    setShowUpgradeConfirm(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlanForUpgrade) return;

    // Close the confirmation modal
    setShowUpgradeConfirm(false);

    // Open payment method modal
    setShowAddPaymentMethod(true);
  };

  const handleCompletePayment = () => {
    if (!selectedPlanForUpgrade) return;

    // Generate new invoice
    const newInvoiceId = `INV-2024-${String(invoices.length + 1).padStart(2, '0')}`;
    const newInvoice: Invoice = {
      id: newInvoiceId,
      date: new Date().toISOString().split('T')[0],
      amount: billingInterval === 'monthly' ? selectedPlanForUpgrade.monthlyPrice : selectedPlanForUpgrade.yearlyPrice,
      status: 'paid',
      description: `${selectedPlanForUpgrade.name} Plan - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    };

    // Add invoice to the list
    setInvoices([newInvoice, ...invoices]);

    // Close payment modal
    setShowAddPaymentMethod(false);

    // Show success message
    toast.success('Payment Successful!', {
      description: `Your plan has been upgraded to ${selectedPlanForUpgrade.name}. Invoice ${newInvoiceId} has been generated.`
    });

    // Auto-open the invoice viewer for the new invoice
    setTimeout(() => {
      setSelectedInvoice(newInvoice);
      setShowInvoiceViewer(true);
    }, 500);

    // Reset selected plan
    setSelectedPlanForUpgrade(null);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Create invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="color-scheme" content="light only">
          <title>Invoice ${invoice.id}</title>
          <style>
            * { color-scheme: light only; }
            html { background: #ffffff !important; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              color: #333 !important; 
              background: #ffffff !important;
              max-width: 800px; 
              margin: 0 auto; 
            }
            .header { border-bottom: 2px solid #cbd5e1; padding-bottom: 16px; margin-bottom: 30px; background: transparent; }
            .company-name { font-size: 24px; font-weight: bold; color: #3B82F6 !important; margin: 0; }
            .invoice-title { font-size: 32px; margin: 20px 0 8px 0; color: #1e293b !important; }
            .invoice-id { color: #64748b !important; font-size: 14px; }
            .info-section { display: flex; justify-content: space-between; margin: 30px 0; }
            .info-block { flex: 1; }
            .info-label { font-size: 11px; color: #64748b !important; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
            .info-value { font-size: 14px; color: #1e293b !important; margin-bottom: 4px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; background: transparent; }
            th { padding: 12px 0; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569 !important; border-bottom: 2px solid #cbd5e1; letter-spacing: 0.5px; background: transparent; }
            td { padding: 16px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b !important; background: transparent; }
            .total-section { text-align: right; margin-top: 30px; }
            .total-label { font-size: 14px; color: #64748b !important; margin-bottom: 8px; }
            .total-amount { font-size: 36px; font-weight: normal; color: #3B82F6 !important; margin-top: 5px; }
            .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; background: #D1FAE5 !important; color: #065F46 !important; }
            p { color: #666 !important; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="company-name">VoiceAI Platform</h1>
            <p style="margin: 5px 0 0 0; color: #666 !important;">AI Voice Agent Platform</p>
          </div>
          
          <div>
            <h2 class="invoice-title">INVOICE</h2>
            <p class="invoice-id">${invoice.id}</p>
          </div>

          <div class="info-section">
            <div class="info-block">
              <div class="info-label">Bill To:</div>
              <div class="info-value" style="font-weight: 500;">${billingInfo.customerName}</div>
              <div class="info-value">${billingInfo.companyName}</div>
              <div class="info-value">${billingInfo.billingAddress}</div>
              <div class="info-value">${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}</div>
              <div class="info-value">${billingInfo.country}</div>
              <div class="info-value" style="margin-top: 12px;">${billingInfo.email}</div>
              <div class="info-value">${billingInfo.phone}</div>
            </div>
            
            <div class="info-block" style="text-align: right;">
              <div class="info-label">Invoice Date:</div>
              <div class="info-value">${new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              
              <div class="info-label" style="margin-top: 20px;">Status:</div>
              <div class="info-value">
                <span class="status-badge">✓ PAID</span>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.description}</td>
                <td style="text-align: right;">${formatCurrency(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-label">Total Amount</div>
            <div class="total-amount">${formatCurrency(invoice.amount)}</div>
          </div>
        </body>
      </html>
    `;

    // Create a hidden container off-screen to prevent page shaking
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.innerHTML = invoiceHTML;
    document.body.appendChild(container);
    
    // Get the body element from the container
    const invoiceBody = container.querySelector('body');
    
    const opt = {
      margin: 0.5,
      filename: `invoice-${invoice.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        windowWidth: 800
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };
    
    // Show loading toast
    toast.loading('Generating PDF...', { id: 'pdf-gen' });
    
    // Generate and download PDF
    html2pdf()
      .set(opt)
      .from(invoiceBody || container)
      .save()
      .then(() => {
        toast.success('Invoice downloaded successfully', {
          id: 'pdf-gen',
          description: `${invoice.id}.pdf saved to your downloads`
        });
        // Remove the container after PDF is generated
        document.body.removeChild(container);
      })
      .catch((error: Error) => {
        console.error('PDF generation error:', error);
        toast.error('Failed to generate PDF', {
          id: 'pdf-gen',
          description: 'Please try again'
        });
        // Remove the container even on error
        document.body.removeChild(container);
      });
  };

  const paymentProviders = [
    { id: 'card' as PaymentProviderType, name: 'Credit/Debit Card', icon: CreditCard, selected: true },
    { id: 'paypal' as PaymentProviderType, name: 'PayPal', icon: null, label: 'P', subtitle: 'Requires API setup' },
    { id: 'payoneer' as PaymentProviderType, name: 'Payoneer', icon: null, label: 'PY', subtitle: 'Requires API setup' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">Billing & Subscription</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your subscription, billing, and payment methods</p>
        </div>

        {/* Current Plan Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-indigo-100 text-sm mb-2">Current Plan</p>
                <h2 className="text-white mb-2">{currentPlan.name}</h2>
                <p className="text-white text-2xl">{formatCurrency(currentPlan.price)}/monthly</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Next billing date: December 29, 2025</span>
            </div>
          </div>
        </div>

        {/* Current Usage */}
        <div>
          <h3 className="text-slate-900 dark:text-white mb-4">Current Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usageMetrics.map((metric, index) => {
              const percentage = getUsagePercentage(metric.current, metric.limit);
              
              return (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                    {metric.icon}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{metric.label}</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-slate-900 dark:text-white">{metric.current.toLocaleString()}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      / {metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}
                    </span>
                  </div>
                  {metric.limit !== -1 && (
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-orange-600 rounded-full transition-all duration-500"
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white">Billing Information</h3>
            <button 
              onClick={() => setShowEditBillingInfo(true)}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
            >
              Edit Information
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Customer Name</p>
                <p className="text-slate-900 dark:text-white">{billingInfo.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Company Name</p>
                <p className="text-slate-900 dark:text-white">{billingInfo.companyName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Email</p>
                <p className="text-slate-900 dark:text-white">{billingInfo.email}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Phone</p>
                <p className="text-slate-900 dark:text-white">{billingInfo.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Billing Address</p>
                <p className="text-slate-900 dark:text-white">
                  {billingInfo.billingAddress}<br/>
                  {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}<br/>
                  {billingInfo.country}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white">Payment Methods</h3>
            <button
              onClick={() => setShowAddPaymentMethod(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getPaymentMethodIcon(method)}
                    <div>
                      {method.type === 'visa' || method.type === 'mastercard' ? (
                        <>
                          <p className="text-slate-900 dark:text-white capitalize">
                            {method.type} •••• {method.last4}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </>
                      ) : method.type === 'bank' ? (
                        <>
                          <p className="text-slate-900 dark:text-white">
                            {method.bankName} •••• {method.last4}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{method.accountType}</p>
                        </>
                      ) : method.type === 'paypal' ? (
                        <>
                          <p className="text-slate-900 dark:text-white">PayPal</p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{method.email}</p>
                        </>
                      ) : method.type === 'payoneer' ? (
                        <>
                          <p className="text-slate-900 dark:text-white">Payoneer</p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{method.email}</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  {!method.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultPayment(method.id)}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <div></div>
                  )}
                  <button
                    onClick={() => handleRemovePayment(method.id)}
                    className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
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
          <div className="mb-6">
            <h3 className="text-slate-900 dark:text-white mb-1">Billing History</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Total spent: {formatCurrency(totalPaid)} • {invoices.length} invoices
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-emerald-900 dark:text-emerald-300 text-sm">Total Paid</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs">{invoices.length} invoices</p>
                </div>
              </div>
              <p className="text-emerald-900 dark:text-emerald-300 text-2xl">{formatCurrency(totalPaid)}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-900 dark:text-blue-300 text-sm">This Year</p>
                  <p className="text-blue-700 dark:text-blue-400 text-xs">2024</p>
                </div>
              </div>
              <p className="text-blue-900 dark:text-blue-300 text-2xl">{formatCurrency(thisYearTotal)}</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-purple-900 dark:text-purple-300 text-sm">Average Payment</p>
                  <p className="text-purple-700 dark:text-purple-400 text-xs">Per invoice</p>
                </div>
              </div>
              <p className="text-purple-900 dark:text-purple-300 text-2xl">{formatCurrency(averagePayment)}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchInvoices}
                onChange={(e) => setSearchInvoices(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-slate-900 dark:text-white text-sm">Invoice</th>
                    <th className="text-left px-6 py-3 text-slate-900 dark:text-white text-sm">Date</th>
                    <th className="text-left px-6 py-3 text-slate-900 dark:text-white text-sm">Description</th>
                    <th className="text-left px-6 py-3 text-slate-900 dark:text-white text-sm">Amount</th>
                    <th className="text-left px-6 py-3 text-slate-900 dark:text-white text-sm">Status</th>
                    <th className="text-right px-6 py-3 text-slate-900 dark:text-white text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-900 dark:text-white text-sm">{invoice.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(invoice.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{invoice.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900 dark:text-white text-sm">{formatCurrency(invoice.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            invoice.status === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : invoice.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {invoice.status === 'paid' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : invoice.status === 'pending' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{invoice.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
          </div>
        </div>

        {/* Choose Your Perfect Plan */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-slate-900 dark:text-slate-100 mb-2">Choose Your Perfect Plan</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Flexible pricing that grows with your business</p>
            
            <div className="inline-flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-8 py-2.5 rounded-lg transition-all duration-300 relative ${ 
                  billingInterval === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-8 py-2.5 rounded-lg transition-all duration-300 relative flex items-center gap-2 ${ 
                  billingInterval === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Yearly
                {billingInterval === 'yearly' && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">
                    Save 20%
                  </span>
                )}
                {billingInterval !== 'yearly' && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                    Save 20%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-900 text-sm">Lightning Fast</p>
              <p className="text-blue-700 text-xs">Sub-second response</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-purple-900 text-sm">Enterprise Security</p>
              <p className="text-purple-700 text-xs">SOC 2 Type II certified</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <Headphones className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-emerald-900 text-sm">24/7 Support</p>
              <p className="text-emerald-700 text-xs">Always here to help</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-amber-900 text-sm">4.9/5 Rating</p>
              <p className="text-amber-700 text-xs">From 10,000+ users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 transition-all duration-300 ${
                  currentPlan.name === plan.name
                    ? 'border-2 border-emerald-500 shadow-lg'
                    : 'border border-slate-200 dark:border-slate-700 hover:shadow-md'
                }`}
              >
                {currentPlan.name === plan.name && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white rounded-full text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Current Plan
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-slate-900 dark:text-white mb-3">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl text-slate-900 dark:text-white">{formatCurrency(plan.price)}</span>
                    <span className="text-slate-500 dark:text-slate-400">/{billingInterval === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleChangePlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-xl transition-all duration-300 ${
                    currentPlan.name === plan.name
                      ? 'bg-slate-100 text-slate-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={currentPlan.name === plan.name}
                >
                  {currentPlan.name === plan.name ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Billing Information Modal */}
      {showEditBillingInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-900 dark:text-white">Edit Billing Information</h3>
              <button
                onClick={() => setShowEditBillingInfo(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={billingInfo.customerName}
                    onChange={(e) => setBillingInfo({...billingInfo, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Company Name</label>
                  <input
                    type="text"
                    value={billingInfo.companyName}
                    onChange={(e) => setBillingInfo({...billingInfo, companyName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    value={billingInfo.phone}
                    onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Billing Address</label>
                <input
                  type="text"
                  value={billingInfo.billingAddress}
                  onChange={(e) => setBillingInfo({...billingInfo, billingAddress: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">City</label>
                  <input
                    type="text"
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">State</label>
                  <input
                    type="text"
                    value={billingInfo.state}
                    onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={billingInfo.zipCode}
                    onChange={(e) => setBillingInfo({...billingInfo, zipCode: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Country</label>
                <input
                  type="text"
                  value={billingInfo.country}
                  onChange={(e) => setBillingInfo({...billingInfo, country: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditBillingInfo(false)}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditBillingInfo(false);
                  toast.success('Billing information updated');
                }}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal with Sidebar */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex max-h-[90vh]">
            {/* Left Sidebar */}
            <div className="w-80 bg-slate-50 dark:bg-slate-900 p-6 rounded-l-2xl border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
              <div className="mb-6">
                <button
                  onClick={() => setShowAddPaymentMethod(false)}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Billing
                </button>
                <h3 className="text-slate-900 dark:text-white mb-1">Add Payment Method</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Choose a payment method and configure your integration</p>
              </div>

              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">Select Payment Type</p>
                {paymentProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedPaymentProvider(provider.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedPaymentProvider === provider.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {provider.icon ? (
                        <provider.icon className="w-5 h-5 text-slate-600" />
                      ) : (
                        <span className="text-slate-700">{provider.label}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-slate-900 dark:text-white text-sm">{provider.name}</p>
                      {provider.subtitle && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs">{provider.subtitle}</p>
                      )}
                    </div>
                    {selectedPaymentProvider === provider.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Form Area */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 dark:text-white">
                    {selectedPaymentProvider === 'card' && 'Credit/Debit Card'}
                    {selectedPaymentProvider === 'paypal' && 'PayPal'}
                    {selectedPaymentProvider === 'payoneer' && 'Payoneer'}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {selectedPaymentProvider === 'card' && 'Visa, Mastercard, American Express, Discover'}
                    {selectedPaymentProvider !== 'card' && 'Securely link your account'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPaymentMethod(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Form container with fixed min-height to prevent shaking */}
              <div className="min-h-[500px] transition-all duration-300 ease-in-out">
              {/* Card Form */}
              {selectedPaymentProvider === 'card' && (
                <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Billing Address</label>
                    <input
                      type="text"
                      placeholder="123 Main St"
                      value={billingAddressLine}
                      onChange={(e) => setBillingAddressLine(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Form */}
              {selectedPaymentProvider === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Bank Name</label>
                    <input
                      type="text"
                      placeholder="Chase Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Account Number</label>
                    <input
                      type="text"
                      placeholder="123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Account Type</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="checking">Checking Account</option>
                      <option value="savings">Savings Account</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PayPal Form */}
              {selectedPaymentProvider === 'paypal' && (
                <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">P</span>
                      </div>
                      <div>
                        <h4 className="text-slate-900 dark:text-white">Connect PayPal Account</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Securely link your PayPal account</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">PayPal Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                      Enter the email address associated with your PayPal account
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-900 dark:text-blue-300 text-sm mb-1">Payment Authorization</p>
                        <p className="text-blue-700 dark:text-blue-400 text-xs">
                          By adding this payment method, you authorize us to charge your PayPal account for subscription fees and usage charges. You can remove this method at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payoneer Form */}
              {selectedPaymentProvider === 'payoneer' && (
                <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                        <span className="text-white">PY</span>
                      </div>
                      <div>
                        <h4 className="text-slate-900 dark:text-white">Connect Payoneer Account</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Securely link your Payoneer account</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Payoneer Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                      Enter the email address associated with your Payoneer account
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Account Holder Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-2">
                      Enter the full name on your Payoneer account
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-900 text-sm mb-1">Payment Authorization</p>
                        <p className="text-orange-700 text-xs">
                          By adding this payment method, you authorize us to charge your Payoneer account for subscription fees and usage charges. You can remove this method at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddPaymentMethod(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {showInvoiceViewer && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h1 className="text-blue-600 text-xl mb-1">VoiceAI Platform</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">AI Voice Agent Platform</p>
                </div>
                <button
                  onClick={() => setShowInvoiceViewer(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Invoice Title */}
              <div className="mb-6">
                <h2 className="text-slate-900 dark:text-white text-3xl mb-1">INVOICE</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedInvoice.id}</p>
              </div>

              {/* Billing Info and Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Bill To:</p>
                  <div className="space-y-0.5">
                    <p className="text-slate-900">{billingInfo.customerName}</p>
                    <p className="text-slate-600 text-sm">{billingInfo.companyName}</p>
                    <p className="text-slate-600 text-sm">{billingInfo.billingAddress}</p>
                    <p className="text-slate-600 text-sm">
                      {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
                    </p>
                    <p className="text-slate-600 text-sm">{billingInfo.country}</p>
                    <div className="mt-3 space-y-0.5">
                      <p className="text-slate-600 text-sm">{billingInfo.email}</p>
                      <p className="text-slate-600 text-sm">{billingInfo.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Invoice Date:</p>
                    <p className="text-slate-900">
                      {new Date(selectedInvoice.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Status:</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-sm">
                      <CheckCircle className="w-4 h-4" />
                      PAID
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Items Table */}
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left pb-3 text-sm text-slate-700 uppercase tracking-wider">Description</th>
                      <th className="text-right pb-3 text-sm text-slate-700 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pt-3 pb-4 text-slate-900">{selectedInvoice.description}</td>
                      <td className="pt-3 pb-4 text-slate-900 text-right">
                        {formatCurrency(selectedInvoice.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-slate-600 text-sm mb-2">Total Amount</p>
                <p className="text-blue-600 text-4xl">{formatCurrency(selectedInvoice.amount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade Confirmation Modal */}
      {showUpgradeConfirm && selectedPlanForUpgrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">Upgrade to {selectedPlanForUpgrade.name}?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                You're about to upgrade your plan. You'll be charged immediately.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Plan</span>
                <span className="text-slate-900 dark:text-white">{selectedPlanForUpgrade.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Billing</span>
                <span className="text-slate-900 dark:text-white capitalize">{billingInterval}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-white">Total</span>
                  <span className="text-slate-900 dark:text-white text-xl">
                    {formatCurrency(billingInterval === 'monthly' ? selectedPlanForUpgrade.price : selectedPlanForUpgrade.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUpgradeConfirm(false);
                  setSelectedPlanForUpgrade(null);
                }}
                className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}