import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { CheckCircle2, X } from "lucide-react";
import { Badge } from "./ui/badge";

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

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: string;
  onSelectPlan: (plan: Plan) => void;
  hasPaymentMethod: boolean;
}

export function ChangePlanModal({ isOpen, onClose, currentPlanId, onSelectPlan, hasPaymentMethod }: ChangePlanModalProps) {
  const plans: Plan[] = [
    {
      id: '1',
      name: 'Starter',
      price: 49.00,
      interval: 'monthly',
      features: [
        'Up to 500 calls per month',
        'Up to 1,000 minutes',
        '3 active AI agents',
        '1 phone number included',
        'Basic analytics',
        'Email support'
      ],
      limits: {
        calls: 500,
        minutes: 1000,
        agents: 3,
        numbers: 1
      }
    },
    {
      id: '2',
      name: 'Professional',
      price: 149.00,
      interval: 'monthly',
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
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 499.00,
      interval: 'monthly',
      features: [
        'Unlimited calls',
        'Unlimited minutes',
        'Unlimited AI agents',
        'Unlimited phone numbers',
        'Advanced analytics & reporting',
        'All integrations',
        '24/7 priority support',
        'Custom voice training',
        'Full API access',
        'Dedicated account manager',
        'White-label options',
        'Custom SLAs'
      ],
      limits: {
        calls: 999999,
        minutes: 999999,
        agents: 999999,
        numbers: 999999
      }
    }
  ];

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      return;
    }
    onSelectPlan(plan);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Change Your Plan</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Select a new plan that best fits your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-6 ${
                  plan.popular 
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                    : isCurrentPlan
                    ? 'border-green-600 dark:border-green-500 bg-green-50/50 dark:bg-green-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white">
                    Current Plan
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl text-slate-900 dark:text-white">${plan.price.toFixed(0)}</span>
                    <span className="text-slate-600 dark:text-slate-400">/{plan.interval}</span>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full ${
                    isCurrentPlan 
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed' 
                      : plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </Button>
              </div>
            );
          })}
        </div>

        {!hasPaymentMethod && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-yellow-900 dark:text-yellow-400 mb-1">Payment Method Required</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-500">
                Please add a payment method before changing your plan. You'll be redirected to add one after selecting a plan.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}