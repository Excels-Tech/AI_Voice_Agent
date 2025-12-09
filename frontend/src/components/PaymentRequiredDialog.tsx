import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { AlertCircle, CreditCard } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
}

interface PaymentRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  onAddPaymentMethod: () => void;
}

export function PaymentRequiredDialog({ isOpen, onClose, selectedPlan, onAddPaymentMethod }: PaymentRequiredDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <DialogTitle className="text-center text-slate-900 dark:text-white">Payment Method Required</DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400">
            {selectedPlan ? (
              <>
                To switch to the <span className="font-semibold">{selectedPlan.name} Plan</span> (${selectedPlan.price.toFixed(2)}/{selectedPlan.interval}), you need to add a payment method first.
              </>
            ) : (
              'You need to add a payment method to change your plan.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 my-4">
          <h4 className="text-slate-900 dark:text-white mb-2 text-sm">What happens next?</h4>
          <ol className="text-slate-600 dark:text-slate-400 text-sm space-y-1 ml-4 list-decimal">
            <li>Add a payment method (Card, PayPal, or Payoneer)</li>
            <li>Confirm your plan change</li>
            <li>Start using your new plan immediately</li>
          </ol>
        </div>

        <DialogFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={onAddPaymentMethod}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CreditCard className="size-4 mr-2" />
            Add Payment Method
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}