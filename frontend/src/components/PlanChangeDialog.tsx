import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface PlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: {
    name: string;
    price: number;
    interval: string;
  };
  newPlan: {
    name: string;
    price: number;
    interval: string;
  } | null;
  onConfirm: (plan: { name: string; price: number; interval: string }) => void;
  onNavigateToPayment?: () => void;
}

export function PlanChangeDialog({ open, onOpenChange, currentPlan, newPlan, onConfirm, onNavigateToPayment }: PlanChangeDialogProps) {
  const [processing, setProcessing] = useState(false);
  
  if (!newPlan) return null;
  
  const priceDifference = newPlan.price - currentPlan.price;
  const isUpgrade = priceDifference > 0;
  const isDowngrade = priceDifference < 0;

  const handleConfirm = async () => {
    setProcessing(true);
    
    // Close dialog first
    onOpenChange(false);
    
    // Small delay for smoother UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Navigate to payment page
    if (onNavigateToPayment) {
      onNavigateToPayment();
    }
    
    setProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Change"} Your Plan
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {isUpgrade 
              ? "You're upgrading to a higher tier plan" 
              : isDowngrade
              ? "You're downgrading to a lower tier plan"
              : "You're changing your billing interval"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Plan */}
            <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-2">Current Plan</div>
              <div className="text-slate-900 dark:text-white mb-1">{currentPlan.name}</div>
              <div className="text-2xl text-slate-900 dark:text-white">
                ${currentPlan.price}
                <span className="text-sm text-slate-600 dark:text-slate-400">/{currentPlan.interval}</span>
              </div>
            </div>

            {/* New Plan */}
            <div className="p-4 border-2 border-blue-500 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-blue-700 dark:text-blue-400 uppercase">New Plan</div>
                {isUpgrade && (
                  <Badge className="bg-blue-600 text-white text-xs">Upgrade</Badge>
                )}
                {isDowngrade && (
                  <Badge className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900 text-xs">
                    Downgrade
                  </Badge>
                )}
              </div>
              <div className="text-slate-900 dark:text-white mb-1">{newPlan.name}</div>
              <div className="text-2xl text-slate-900 dark:text-white">
                ${newPlan.price}
                <span className="text-sm text-slate-600 dark:text-slate-400">/{newPlan.interval}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {isUpgrade && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex items-start gap-3">
                <CreditCard className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white mb-1">
                    You will be charged ${Math.abs(priceDifference).toFixed(2)} today
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    The prorated amount for the remainder of your current billing period. Your next 
                    billing date will be adjusted accordingly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDowngrade && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white mb-1">
                    Your plan will change at the end of your current billing period
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    You'll continue to have access to {currentPlan.name} features until then. 
                    Your account will be credited ${Math.abs(priceDifference).toFixed(2)}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <CreditCard className="size-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white text-sm">Visa ending in 4242</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Expires 12/2026</p>
              </div>
            </div>
          </div>

          {/* What Changes */}
          <div>
            <p className="text-slate-900 dark:text-white mb-3">What changes with this plan:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Check className="size-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {isUpgrade ? "Increased" : "Updated"} call and minute limits
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="size-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  Access to {newPlan.name} tier features
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="size-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {isUpgrade ? "Priority" : "Standard"} support
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                {isUpgrade && `Pay $${Math.abs(priceDifference).toFixed(2)} & `}
                Confirm {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Change"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}