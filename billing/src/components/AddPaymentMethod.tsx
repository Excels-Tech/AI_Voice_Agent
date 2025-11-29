import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  ArrowLeft,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Key,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { upsertPaymentMethod, listWorkspaces } from '@/lib/api';

type PaymentMethodType = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiresApi: boolean;
};

type AddPaymentMethodProps = {
  onBack: () => void;
  onAdd: () => void;
};

export default function AddPaymentMethod({ onBack, onAdd }: AddPaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('credit-card');
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [form, setForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardholderName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const workspaces = await listWorkspaces();
        const active = workspaces?.find((w: any) => w.is_active) ?? workspaces?.[0];
        const wsId = active?.id ?? active?.workspace_id;
        if (wsId) setWorkspaceId(wsId);
      } catch {
        toast.error('Unable to load workspace for billing');
      }
    })();
  }, []);

  const paymentMethods: PaymentMethodType[] = [
    { id: 'credit-card', name: 'Credit/Debit Card', icon: <CreditCard className="w-6 h-6" />, description: 'Visa, Mastercard, American Express, Discover', requiresApi: false },
    { id: 'stripe', name: 'Stripe', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>, description: 'Accept payments through Stripe', requiresApi: true },
    { id: 'paypal', name: 'PayPal', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L9.096 7.58a.972.972 0 01.96-.817h4.86c1.415 0 2.6.094 3.543.334 1.064.27 1.902.746 2.608 1.38zM9.207 8.48c.082-.43.447-.748.883-.748h4.86c1.415 0 2.6.094 3.543.334.766.195 1.427.52 1.98.984-.214 1.376-.667 2.31-1.394 2.943-.93.81-2.222 1.174-3.826 1.174h-4.14c-.464 0-.86.334-.934.795l-.83 5.26a.484.484 0 01-.478.558H6.186a.483.483 0 01-.477-.558l2.498-11.242z"/></svg>, description: 'Link your PayPal account', requiresApi: true },
    { id: 'apple-pay', name: 'Apple Pay', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M15.337 4.819c.607-.77 1.018-1.84.906-2.909-.876.036-1.938.583-2.566 1.32-.561.653-1.053 1.697-.92 2.697.972.076 1.964-.494 2.58-1.108zM19.975 17.81c-.407 1.002-.604 1.449-1.128 2.334-.733 1.237-1.766 2.777-3.048 2.791-1.141.013-1.444-.75-2.996-.741-1.552.008-1.887.755-3.028.741-1.282-.013-2.251-1.396-2.984-2.633-2.054-3.464-2.27-7.527-.999-9.682.904-1.535 2.327-2.436 3.65-2.436 1.357 0 2.21.747 3.333.747 1.086 0 1.746-.748 3.313-.748 1.182 0 2.471.721 3.377 1.966-2.968 1.628-2.486 5.872.51 6.661z"/></svg>, description: 'Pay with Apple Pay', requiresApi: true },
    { id: 'google-pay', name: 'Google Pay', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>, description: 'Pay with Google Pay', requiresApi: true },
    { id: 'bank-account', name: 'Bank Account (ACH)', icon: <Building className="w-6 h-6" />, description: 'Direct bank account transfer', requiresApi: false },
    { id: 'square', name: 'Square', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4.01 0A4.01 4.01 0 000 4.01v15.98C0 22.21 1.79 24 4.01 24h15.98C22.21 24 24 22.21 24 19.99V4.01A4.01 4.01 0 0019.99 0H4.01zm13.45 5.45c.47 0 .85.38.85.85v7.6c0 2.27-1.45 4.2-3.47 4.93l-4.45 1.6a.85.85 0 01-.58-1.6l4.45-1.6c1.36-.49 2.3-1.79 2.3-3.23v-7.7c0-.47.38-.85.85-.85h.05zm-10.9 0c.47 0 .85.38.85.85v7.7c0 1.44.94 2.74 2.3 3.23l4.45 1.6a.85.85 0 01-.58 1.6l-4.45-1.6C6.91 17.9 5.46 15.97 5.46 13.7v-7.6c0-.47.38-.85.85-.85h.25z"/></svg>, description: 'Accept payments through Square', requiresApi: true },
    { id: 'venmo', name: 'Venmo', icon: <Smartphone className="w-6 h-6" />, description: 'Pay with Venmo', requiresApi: true },
    { id: 'crypto', name: 'Cryptocurrency', icon: <Wallet className="w-6 h-6" />, description: 'Bitcoin, Ethereum, USDC, and more', requiresApi: true },
  ];

  const selectedMethodData = paymentMethods.find((m) => m.id === selectedMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) {
      toast.error('No workspace found.');
      return;
    }
    if (selectedMethod !== 'credit-card') {
      toast.info('Use the main Billing screen to configure this provider.');
      return;
    }
    const last4Raw = form.cardNumber.replace(/\s+/g, '').slice(-4);
    if (last4Raw.length !== 4 || !/^[0-9]+$/.test(last4Raw)) {
      toast.error('Enter a valid card number (need last 4 digits).');
      return;
    }

    let expMonth = 0;
    let expYear = 0;
    if (form.expiry.includes('/')) {
      const [m, y] = form.expiry.split('/');
      expMonth = parseInt(m || '0', 10);
      const yearRaw = (y || '').trim();
      expYear = yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw || '0', 10);
    }
    if (expMonth < 1 || expMonth > 12 || expYear < new Date().getFullYear()) {
      toast.error('Enter a valid expiry (MM/YY).');
      return;
    }
    setIsSaving(true);
    try {
      await upsertPaymentMethod(workspaceId, {
        brand: 'Card',
        last4: last4Raw,
        exp_month: expMonth,
        exp_year: expYear,
        cardholder_name: form.cardholderName,
        provider: 'stripe',
        is_default: true,
      });
      toast.success('Payment method saved');
      onAdd();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save payment method');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Billing
        </button>

        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Add Payment Method</h1>
          <p className="text-gray-600">Choose a payment method and configure your integration</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Method Selection */}
          <div className="lg:col-span-1">
            <h3 className="text-gray-900 mb-4">Select Payment Type</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedMethod === method.id ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'}>
                    {method.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={selectedMethod === method.id ? 'text-blue-900' : 'text-gray-900'}>{method.name}</p>
                    {method.requiresApi && <p className="text-xs text-gray-500">Requires API setup</p>}
                  </div>
                  {selectedMethod === method.id && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {selectedMethodData?.icon}
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">{selectedMethodData?.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedMethodData?.description}</p>
                </div>
              </div>

              {selectedMethodData?.requiresApi && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 mb-1">API Configuration Required</p>
                    <p className="text-yellow-700 text-sm">
                      Enter credentials on the Billing screen for this provider. Use card entry here to add a default card.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Credit Card Form */}
                {selectedMethod === 'credit-card' && (
                  <>
                    <div>
                      <label className="block text-gray-900 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={form.cardNumber}
                        onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-900 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={form.expiry}
                          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-900 mb-2">CVC</label>
                        <input
                          type="text"
                          value={form.cvc}
                          onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-900 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={form.cardholderName}
                        onChange={(e) => setForm({ ...form, cardholderName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 mb-2">Billing Address</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="123 Main St"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="City"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <input
                          type="text"
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          placeholder="State"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <input
                        type="text"
                        value={form.zip}
                        onChange={(e) => setForm({ ...form, zip: e.target.value })}
                        placeholder="ZIP Code"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mt-3"
                      />
                    </div>
                  </>
                )}

                {/* API Configuration for provider (informational) */}
                {selectedMethodData?.requiresApi && (
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-gray-900 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        API Configuration
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowApiConfig(!showApiConfig)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {showApiConfig ? 'Hide' : 'Show'} Configuration
                      </button>
                    </div>
                    {showApiConfig && (
                      <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div>
                          <label className="block text-gray-900 mb-2 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            API Key / Publishable Key
                          </label>
                          <input
                            type="password"
                            placeholder={`Enter your ${selectedMethodData.name} API key`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-900 mb-2 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Secret Key
                          </label>
                          <input
                            type="password"
                            placeholder={`Enter your ${selectedMethodData.name} secret key`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-900 mb-2 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Webhook URL (optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://your-domain.com/webhooks"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                          />
                          <p className="text-gray-500 text-xs mt-1">Configure webhooks to receive payment notifications</p>
                        </div>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="environment" value="test" defaultChecked className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">Sandbox</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="environment" value="live" className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">Production</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isSaving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Add Payment Method'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gray-100 rounded-lg p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-900 mb-1">Secure Payment Processing</p>
                <p className="text-gray-600 text-sm">
                  Your payment information is encrypted and securely stored. We never store your full card details on our servers. All transactions are processed through PCI-DSS compliant payment processors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
