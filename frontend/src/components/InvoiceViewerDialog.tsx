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
  if (!invoice) return null;

  const handleDownload = () => {
    generateInvoicePDF(invoice, billingInfo);
    toast.success("Invoice downloaded successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 text-slate-100 border-slate-800">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2 text-white">Invoice Details</DialogTitle>
              <DialogDescription className="text-cyan-400 text-lg">
                {invoice.invoice}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full text-slate-300 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-400 text-sm mb-1">Invoice Number</p>
              <p className="text-white">{invoice.invoice}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Date Issued</p>
              <p className="text-white">{invoice.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-400 text-sm mb-2">Status</p>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40">
                {invoice.status}
              </Badge>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Payment Method</p>
              <p className="text-white/90">Visa •••• 4242</p>
            </div>
          </div>

          <Separator className="border-slate-800" />

          <div>
            <p className="text-slate-400 text-sm mb-2">Description</p>
            <p className="text-white/90">{invoice.description}</p>
          </div>

          <Separator className="border-slate-800" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-400">Subtotal</p>
              <p className="text-white">${invoice.amount.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-400">Tax (0%)</p>
              <p className="text-white">$0.00</p>
            </div>
            <Separator className="border-slate-800" />
            <div className="flex items-center justify-between text-lg">
              <p className="text-white">Total</p>
              <p className="text-white">${invoice.amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 border-slate-700 text-slate-200 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
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
