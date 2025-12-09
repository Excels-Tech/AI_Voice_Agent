import { Button } from "./ui/button";
import { CreditCard, Wallet, CheckCircle2, ArrowLeft, AlertCircle, Mail, MoreVertical, Trash2, Edit, Calendar, Phone, Clock, Mic, Globe, Download, Eye, Search, Filter, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { ChangePlanModal } from "./ChangePlanModal";
import { PaymentRequiredDialog } from "./PaymentRequiredDialog";

type PaymentType = 'card' | 'paypal' | 'payoneer';
type BillingSection = 'payment-type' | 'payment-method' | 'billing-info' | 'current-plan';

interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'payoneer';
  isDefault: boolean;
  details: string;
  expiryDate?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

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
    numbers: number;
  };
  popular?: boolean;
}

interface AddPaymentMethodPanelProps {
  onClose: () => void;
}

export function AddPaymentMethodPanel({ onClose }: AddPaymentMethodPanelProps) {
  const [activeSection, setActiveSection] = useState<BillingSection>('payment-type');
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentRequired, setShowPaymentRequired] = useState(false);
  
  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalConfirmEmail, setPaypalConfirmEmail] = useState('');

  // Payoneer fields
  const [payoneerEmail, setPayoneerEmail] = useState('');
  const [payoneerConfirmEmail, setPayoneerConfirmEmail] = useState('');
  const [payoneerAccountId, setPayoneerAccountId] = useState('');

  // Saved payment methods
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      isDefault: true,
      details: 'Visa ending in 4242',
      expiryDate: '12/2025'
    },
    {
      id: '2',
      type: 'paypal',
      isDefault: false,
      details: 'john.doe@example.com'
    }
  ]);

  // Billing History
  const [billingHistory, setBillingHistory] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-001',
      date: '2023-10-01',
      description: 'Monthly Subscription',
      amount: 149.00,
      status: 'paid'
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      date: '2023-11-01',
      description: 'Monthly Subscription',
      amount: 149.00,
      status: 'pending'
    }
  ]);

  // Billing Information
  const [isEditingBillingInfo, setIsEditingBillingInfo] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    customerName: "John Smith",
    companyName: "Tech Solutions Inc.",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    billingAddress: "456 Customer Lane",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  });
  const [editedBillingInfo, setEditedBillingInfo] = useState(billingInfo);

  // Current Plan data
  const currentPlan: Plan = {
    id: '1',
    name: "Professional",
    price: 149.00,
    interval: "monthly",
    nextBillingDate: "December 29, 2025",
    status: "Active",
    features: [
      'Up to 2,500 calls per month',
      'Up to 5,000 minutes',
      '10 active AI agents',
      '5 phone numbers included',
      'Advanced analytics dashboard',
      'CRM integrations',
      'Priority email support',
      'Custom voice training',
      'API access'
    ],
    limits: {
      calls: 2500,
      minutes: 5000,
      agents: 10,
      numbers: 5
    },
    popular: true
  };

  const usageMetrics = [
    {
      label: "Calls This Month",
      current: 1847,
      max: 2500,
      icon: Phone,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50"
    },
    {
      label: "Minutes Used",
      current: 3621,
      max: 5000,
      icon: Clock,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50"
    },
    {
      label: "Active Agents",
      current: 7,
      max: 10,
      icon: Mic,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50"
    },
    {
      label: "Phone Numbers",
      current: 4,
      max: 5,
      icon: Globe,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50"
    }
  ];

  const handleAddPaymentMethod = () => {
    if (selectedPaymentType === 'card') {
      if (!cardNumber || !expiryDate || !cvc || !cardholderName || !billingAddress || !city || !state || !zipCode || !country) {
        toast.error("Please fill in all required card details");
        return;
      }
      const newMethod: SavedPaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        isDefault: setAsDefault,
        details: `Visa ending in ${cardNumber.slice(-4)}`,
        expiryDate: expiryDate
      };
      setSavedPaymentMethods([...savedPaymentMethods, newMethod]);
      toast.success("Credit/Debit card added successfully");
      
      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvc('');
      setCardholderName('');
      setBillingAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setCountry('');
      setSelectedPaymentType(null);
      setActiveSection('payment-method');
    } else if (selectedPaymentType === 'paypal') {
      if (!paypalEmail || !paypalConfirmEmail) {
        toast.error("Please enter and confirm your PayPal email address");
        return;
      }
      if (paypalEmail !== paypalConfirmEmail) {
        toast.error("Email addresses do not match");
        return;
      }
      const newMethod: SavedPaymentMethod = {
        id: Date.now().toString(),
        type: 'paypal',
        isDefault: setAsDefault,
        details: paypalEmail
      };
      setSavedPaymentMethods([...savedPaymentMethods, newMethod]);
      toast.success("PayPal account linked successfully");
      
      // Reset form
      setPaypalEmail('');
      setPaypalConfirmEmail('');
      setSelectedPaymentType(null);
      setActiveSection('payment-method');
    } else if (selectedPaymentType === 'payoneer') {
      if (!payoneerEmail || !payoneerConfirmEmail || !payoneerAccountId) {
        toast.error("Please fill in all Payoneer account details");
        return;
      }
      if (payoneerEmail !== payoneerConfirmEmail) {
        toast.error("Email addresses do not match");
        return;
      }
      const newMethod: SavedPaymentMethod = {
        id: Date.now().toString(),
        type: 'payoneer',
        isDefault: setAsDefault,
        details: payoneerEmail
      };
      setSavedPaymentMethods([...savedPaymentMethods, newMethod]);
      toast.success("Payoneer account linked successfully");
      
      // Reset form
      setPayoneerEmail('');
      setPayoneerConfirmEmail('');
      setPayoneerAccountId('');
      setSelectedPaymentType(null);
      setActiveSection('payment-method');
    }
  };

  const handleDeletePaymentMethod = (id: string) => {
    setSavedPaymentMethods(savedPaymentMethods.filter(m => m.id !== id));
    toast.success("Payment method removed");
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setSavedPaymentMethods(savedPaymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    toast.success("Default payment method updated");
  };

  const handleSaveBillingInfo = () => {
    setBillingInfo(editedBillingInfo);
    setIsEditingBillingInfo(false);
    toast.success("Billing information updated successfully");
  };

  const paymentTypes = [
    {
      id: 'card' as PaymentType,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex, Discover'
    },
    {
      id: 'paypal' as PaymentType,
      name: 'PayPal',
      icon: Wallet,
      description: 'Pay with your PayPal account'
    },
    {
      id: 'payoneer' as PaymentType,
      name: 'Payoneer',
      icon: Wallet,
      description: 'Pay with your Payoneer account'
    }
  ];

  const selectedType = paymentTypes.find(t => t.id === selectedPaymentType);

  const sidebarItems = [
    { label: 'Payment Type', icon: CreditCard, active: activeSection === 'payment-type', section: 'payment-type' as BillingSection },
    { label: 'Payment Method', icon: Wallet, active: activeSection === 'payment-method', section: 'payment-method' as BillingSection },
    { label: 'Billing Information', icon: Mail, active: activeSection === 'billing-info', section: 'billing-info' as BillingSection },
    { label: 'Current Plan', icon: CheckCircle2, active: activeSection === 'current-plan', section: 'current-plan' as BillingSection },
  ];

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 z-50 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white">Billing</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-6 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Billing
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-slate-900 dark:text-white mb-2">
              {activeSection === 'payment-type' && 'Add Payment Method'}
              {activeSection === 'payment-method' && 'Saved Payment Methods'}
              {activeSection === 'billing-info' && 'Billing Information'}
              {activeSection === 'current-plan' && 'Current Plan'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {activeSection === 'payment-type' && 'Choose a payment method to add to your account'}
              {activeSection === 'payment-method' && 'Manage your saved payment methods'}
              {activeSection === 'billing-info' && 'View and update your billing information'}
              {activeSection === 'current-plan' && 'View your current subscription plan and usage'}
            </p>
          </div>

          {/* Payment Type Section */}
          {activeSection === 'payment-type' && (
          <div className="space-y-6">
            <h3 className="text-slate-900 dark:text-white">Select Payment Type</h3>
            
            <div className="space-y-3">
              {paymentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedPaymentType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPaymentType(type.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left bg-white dark:bg-slate-900 ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Icon className={`size-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white">{type.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{type.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Configuration Section - Shows when a payment type is selected */}
            {selectedPaymentType && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  {/* Selected Payment Header */}
                  <div className="flex items-start gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                    {selectedType && (
                      <>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selectedPaymentType === 'card' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-100 dark:bg-blue-950/30'
                        }`}>
                          <selectedType.icon className={`size-6 ${
                            selectedPaymentType === 'card' ? 'text-slate-700 dark:text-slate-300' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-white mb-1">{selectedType.name}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {selectedPaymentType === 'card' 
                              ? 'Enter your card details to add this payment method'
                              : selectedPaymentType === 'paypal'
                              ? 'Link your PayPal account to make payments'
                              : 'Link your Payoneer account to make payments'
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Credit Card Form */}
                  {selectedPaymentType === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber" className="text-slate-700 dark:text-slate-300">
                          Card Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cardNumber"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1.5"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-slate-700 dark:text-slate-300">
                            Expiry Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="MM/YY"
                            className="mt-1.5"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-slate-700 dark:text-slate-300">
                            CVC <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cvc"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            placeholder="123"
                            className="mt-1.5"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardholderName" className="text-slate-700 dark:text-slate-300">
                          Cardholder Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cardholderName"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          placeholder="John Doe"
                          className="mt-1.5"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-slate-900 dark:text-white mb-4">Billing Address</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="billingAddress" className="text-slate-700 dark:text-slate-300">
                              Street Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="billingAddress"
                              value={billingAddress}
                              onChange={(e) => setBillingAddress(e.target.value)}
                              placeholder="123 Main Street"
                              className="mt-1.5"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city" className="text-slate-700 dark:text-slate-300">
                                City <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="New York"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state" className="text-slate-700 dark:text-slate-300">
                                State / Province <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="NY"
                                className="mt-1.5"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="zipCode" className="text-slate-700 dark:text-slate-300">
                                ZIP / Postal Code <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="zipCode"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="10001"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="country" className="text-slate-700 dark:text-slate-300">
                                Country <span className="text-red-500">*</span>
                              </Label>
                              <select
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full mt-1.5 px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                              >
                                <option value="">Select Country</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="GB">United Kingdom</option>
                                <option value="AU">Australia</option>
                                <option value="DE">Germany</option>
                                <option value="FR">France</option>
                                <option value="IT">Italy</option>
                                <option value="ES">Spain</option>
                                <option value="NL">Netherlands</option>
                                <option value="SE">Sweden</option>
                                <option value="NO">Norway</option>
                                <option value="DK">Denmark</option>
                                <option value="FI">Finland</option>
                                <option value="PL">Poland</option>
                                <option value="IN">India</option>
                                <option value="SG">Singapore</option>
                                <option value="JP">Japan</option>
                                <option value="BR">Brazil</option>
                                <option value="MX">Mexico</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal Account Form */}
                  {selectedPaymentType === 'paypal' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-900 mb-1">Link Your PayPal Account</p>
                          <p className="text-xs text-blue-700">
                            Enter the email address associated with your PayPal account. You'll be redirected to PayPal to authorize the connection.
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="paypalEmail" className="text-slate-700 dark:text-slate-300">
                          PayPal Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="paypalEmail"
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                          This must match your PayPal account email
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="paypalConfirmEmail" className="text-slate-700 dark:text-slate-300">
                          Confirm Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="paypalConfirmEmail"
                          type="email"
                          value={paypalConfirmEmail}
                          onChange={(e) => setPaypalConfirmEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Wallet className="size-4 mr-2" />
                          Connect PayPal Account
                        </Button>
                        <p className="text-slate-500 text-xs mt-2 text-center">
                          You'll be redirected to PayPal to complete the authorization
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payoneer Account Form */}
                  {selectedPaymentType === 'payoneer' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-900 mb-1">Link Your Payoneer Account</p>
                          <p className="text-xs text-blue-700">
                            Enter your Payoneer account details. You must have an active Payoneer account to use this payment method.
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="payoneerEmail" className="text-slate-700 dark:text-slate-300">
                          Payoneer Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="payoneerEmail"
                          type="email"
                          value={payoneerEmail}
                          onChange={(e) => setPayoneerEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                          This must match your Payoneer account email
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="payoneerConfirmEmail" className="text-slate-700 dark:text-slate-300">
                          Confirm Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="payoneerConfirmEmail"
                          type="email"
                          value={payoneerConfirmEmail}
                          onChange={(e) => setPayoneerConfirmEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="payoneerAccountId" className="text-slate-700 dark:text-slate-300">
                          Payoneer Account ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="payoneerAccountId"
                          value={payoneerAccountId}
                          onChange={(e) => setPayoneerAccountId(e.target.value)}
                          placeholder="Enter your Payoneer Account ID"
                          className="mt-1.5"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                          Find this in your Payoneer account settings
                        </p>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Wallet className="size-4 mr-2" />
                          Connect Payoneer Account
                        </Button>
                        <p className="text-slate-500 text-xs mt-2 text-center">
                          You'll be redirected to Payoneer to complete the authorization
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="setAsDefault"
                        checked={setAsDefault}
                        onCheckedChange={(checked) => setSetAsDefault(!!checked)}
                      />
                      <Label htmlFor="setAsDefault" className="text-slate-700 dark:text-slate-300 cursor-pointer text-sm">
                        Set as default payment method
                      </Label>
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="saveForFuture"
                        checked={saveForFuture}
                        onCheckedChange={(checked) => setSaveForFuture(!!checked)}
                      />
                      <Label htmlFor="saveForFuture" className="text-slate-700 dark:text-slate-300 cursor-pointer text-sm">
                        Save for future payments
                      </Label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddPaymentMethod}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {selectedPaymentType === 'card' ? 'Add Card' : 'Link Account'}
                    </Button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 bg-slate-100 rounded-lg p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-900 mb-1">Secure Payment Processing</p>
                    <p className="text-slate-600 text-sm">
                      Your payment information is encrypted and securely stored. We use industry-standard security measures and never store your full card details on our servers. All transactions are PCI-DSS compliant.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Payment Method Section */}
          {activeSection === 'payment-method' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white">Your Payment Methods</h3>
                <Button 
                  onClick={() => setActiveSection('payment-type')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CreditCard className="size-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              {savedPaymentMethods.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="size-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white mb-2">No Payment Methods</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">Add a payment method to get started</p>
                  <Button 
                    onClick={() => setActiveSection('payment-type')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {method.type === 'card' ? (
                          <CreditCard className="size-6 text-slate-700 dark:text-slate-300" />
                        ) : (
                          <Wallet className="size-6 text-slate-700 dark:text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-slate-900 dark:text-white">{method.details}</p>
                          {method.isDefault && (
                            <Badge variant="secondary" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900">
                              Default
                            </Badge>
                          )}
                        </div>
                        {method.expiryDate && (
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Expires {method.expiryDate}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Billing Information Section */}
          {activeSection === 'billing-info' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-900 dark:text-white">Billing Details</h3>
                  {!isEditingBillingInfo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedBillingInfo(billingInfo);
                        setIsEditingBillingInfo(true);
                      }}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Edit className="size-4 mr-2" />
                      Edit Information
                    </Button>
                  )}
                </div>

                {!isEditingBillingInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Customer Name</Label>
                        <p className="text-slate-900 dark:text-white mt-1">{billingInfo.customerName}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Company Name</Label>
                        <p className="text-slate-900 dark:text-white mt-1">{billingInfo.companyName}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Email Address</Label>
                        <p className="text-slate-900 dark:text-white mt-1">{billingInfo.email}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Phone Number</Label>
                        <p className="text-slate-900 dark:text-white mt-1">{billingInfo.phone}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <Label className="text-slate-500 dark:text-slate-400 text-sm mb-2 block">Billing Address</Label>
                      <p className="text-slate-900 dark:text-white">
                        {billingInfo.billingAddress}<br />
                        {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}<br />
                        {billingInfo.country}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName" className="text-slate-700 dark:text-slate-300">Customer Name</Label>
                        <Input
                          id="customerName"
                          value={editedBillingInfo.customerName}
                          onChange={(e) => setEditedBillingInfo({...editedBillingInfo, customerName: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyName" className="text-slate-700 dark:text-slate-300">Company Name</Label>
                        <Input
                          id="companyName"
                          value={editedBillingInfo.companyName}
                          onChange={(e) => setEditedBillingInfo({...editedBillingInfo, companyName: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedBillingInfo.email}
                          onChange={(e) => setEditedBillingInfo({...editedBillingInfo, email: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editedBillingInfo.phone}
                          onChange={(e) => setEditedBillingInfo({...editedBillingInfo, phone: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                      <h4 className="text-slate-900 dark:text-white">Billing Address</h4>
                      <div>
                        <Label htmlFor="editBillingAddress" className="text-slate-700 dark:text-slate-300">Street Address</Label>
                        <Input
                          id="editBillingAddress"
                          value={editedBillingInfo.billingAddress}
                          onChange={(e) => setEditedBillingInfo({...editedBillingInfo, billingAddress: e.target.value})}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editCity" className="text-slate-700 dark:text-slate-300">City</Label>
                          <Input
                            id="editCity"
                            value={editedBillingInfo.city}
                            onChange={(e) => setEditedBillingInfo({...editedBillingInfo, city: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editState" className="text-slate-700 dark:text-slate-300">State / Province</Label>
                          <Input
                            id="editState"
                            value={editedBillingInfo.state}
                            onChange={(e) => setEditedBillingInfo({...editedBillingInfo, state: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editZipCode" className="text-slate-700 dark:text-slate-300">ZIP / Postal Code</Label>
                          <Input
                            id="editZipCode"
                            value={editedBillingInfo.zipCode}
                            onChange={(e) => setEditedBillingInfo({...editedBillingInfo, zipCode: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editCountry" className="text-slate-700 dark:text-slate-300">Country</Label>
                          <Input
                            id="editCountry"
                            value={editedBillingInfo.country}
                            onChange={(e) => setEditedBillingInfo({...editedBillingInfo, country: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingBillingInfo(false);
                          setEditedBillingInfo(billingInfo);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveBillingInfo}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Plan Section */}
          {activeSection === 'current-plan' && (
            <div className="space-y-6">
              {/* Current Plan Card */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-slate-900 dark:text-white">{currentPlan.name} Plan</h3>
                        <Badge className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900">
                          {currentPlan.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        ${currentPlan.price.toFixed(2)}/{currentPlan.interval}
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={onClose}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Change Plan
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                    <Calendar className="size-4" />
                    <span>Next billing date: {currentPlan.nextBillingDate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Metrics */}
              <div>
                <h3 className="text-slate-900 dark:text-white mb-4">Current Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  {usageMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const percentage = (metric.current / metric.max) * 100;
                    return (
                      <Card key={index} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${metric.iconBg} dark:bg-orange-950/30`}>
                              <Icon className={`size-5 ${metric.iconColor} dark:text-orange-400`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-600 dark:text-slate-400 text-sm">{metric.label}</p>
                              <p className="text-slate-900 dark:text-white">
                                {metric.current.toLocaleString()} / {metric.max.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Plan Features */}
              <div>
                <h3 className="text-slate-900 dark:text-white mb-4">Plan Features</h3>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}