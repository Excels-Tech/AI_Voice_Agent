import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Download, X } from "lucide-react";
import { generateInvoicePDF } from "./InvoicePDFGenerator";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { Separator } from "./ui/separator";

interface InvoiceViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: number;
    date: string;
    description: string;
    amount: number;
    status: string;
    invoice: string;
  } | null;
  billingInfo: {
    customerName: string;
    companyName: string;
    email: string;
    phone: string;
    billingAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export function InvoiceViewerDialog({ open, onOpenChange, invoice, billingInfo }: InvoiceViewerDialogProps) {
  // Return early if invoice is null
  if (!invoice) {
    return null;
  }

  const handleDownload = () => {
    generateInvoicePDF(invoice, billingInfo);
    toast.success("Invoice downloaded successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">Invoice Details</DialogTitle>
              <DialogDescription className="text-blue-600 text-lg">
                {invoice.invoice}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="space-y-6 py-4">
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-600 text-sm mb-1">Invoice Number</p>
              <p className="text-slate-900">{invoice.invoice}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">Date Issued</p>
              <p className="text-slate-900">{invoice.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-600 text-sm mb-2">Status</p>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                {invoice.status}
              </Badge>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">Payment Method</p>
              <p className="text-slate-900">Visa •••• 4242</p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="text-slate-600 text-sm mb-2">Description</p>
            <p className="text-slate-900">{invoice.description}</p>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Subtotal</p>
              <p className="text-slate-900">${invoice.amount.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Tax (0%)</p>
              <p className="text-slate-900">$0.00</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg">
              <p className="text-slate-900">Total</p>
              <p className="text-slate-900">${invoice.amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleDownload}
          >
            <Download className="size-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}