import { Button } from "./ui/button";
import { CreditCard, Wallet, CheckCircle2, ArrowLeft, AlertCircle, Settings } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";

type PaymentType = 'card' | 'paypal' | 'payoneer';

interface PaymentMethodPageProps {
  onBack: () => void;
}

export function PaymentMethodPage({ onBack }: PaymentMethodPageProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('card');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const handleAddPaymentMethod = () => {
    if (selectedPaymentType === 'card') {
      if (!cardNumber || !expiryDate || !cvc || !cardholderName) {
        toast.error("Please fill in all card details");
        return;
      }
      toast.success("Payment method added successfully");
      onBack();
    } else {
      toast.info("Please complete API configuration to enable this payment method");
    }
  };

  const paymentTypes = [
    {
      id: 'card' as PaymentType,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      requiresSetup: false,
      description: 'Visa, Mastercard, Amex, etc.'
    },
    {
      id: 'paypal' as PaymentType,
      name: 'PayPal',
      icon: Wallet,
      requiresSetup: true,
      description: 'Requires API setup'
    },
    {
      id: 'payoneer' as PaymentType,
      name: 'Payoneer',
      icon: Wallet,
      requiresSetup: true,
      description: 'Requires API setup'
    }
  ];

  const selectedType = paymentTypes.find(t => t.id === selectedPaymentType);

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-8 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Billing
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 dark:text-white mb-2">Add Payment Method</h1>
        <p className="text-slate-600 dark:text-slate-400">Choose a payment method and configure your integration</p>
      </div>

      <div className="grid lg:grid-cols-[340px,1fr] gap-8">
        {/* Left Side - Payment Type Selection */}
        <div>
          <h3 className="text-slate-900 dark:text-white mb-4">Select Payment Type</h3>
          <div className="space-y-2">
            {paymentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedPaymentType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedPaymentType(type.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded ${isSelected ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Icon className={`size-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white text-sm">
                      {type.name}
                    </p>
                    {type.requiresSetup && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{type.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Selected Payment Details */}
        <div className="space-y-6">
          {/* Selected Payment Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            {selectedType && (
              <>
                <div className={`p-3 rounded-lg ${selectedPaymentType === 'card' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-100 dark:bg-blue-950/30'}`}>
                  <selectedType.icon className={`size-6 ${selectedPaymentType === 'card' ? 'text-slate-700 dark:text-slate-300' : 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white">{selectedType.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {selectedType.requiresSetup ? 'Requires API setup' : 'Pay with credit or debit card'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* API Configuration Warning (for non-card payments) */}
          {selectedPaymentType !== 'card' && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-900 dark:text-yellow-400 mb-1">API Configuration Required</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-500">
                  This payment method requires API credentials to connect. You'll need to configure your API keys below.
                </p>
              </div>
            </div>
          )}

          {/* Credit Card Form */}
          {selectedPaymentType === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-slate-700 dark:text-slate-300">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="text-slate-700 dark:text-slate-300">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cvc" className="text-slate-700 dark:text-slate-300">CVC</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cardholderName" className="text-slate-700 dark:text-slate-300">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* API Configuration Section (for non-card payments) */}
          {selectedPaymentType !== 'card' && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="size-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-900 dark:text-white text-sm">API Configuration</span>
                </div>
                <Button variant="link" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 p-0 h-auto text-sm">
                  Show Configuration
                </Button>
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="setAsDefault"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(!!checked)}
              />
              <Label htmlFor="setAsDefault" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as default payment method
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="saveForFuture"
                checked={saveForFuture}
                onCheckedChange={(checked) => setSaveForFuture(!!checked)}
              />
              <Label htmlFor="saveForFuture" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                Save for future use
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPaymentMethod}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Payment Method
            </Button>
          </div>

          {/* Secure Payment Processing */}
          <div className="flex items-center justify-center gap-2 pt-4 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
            <span>Secure Payment Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}