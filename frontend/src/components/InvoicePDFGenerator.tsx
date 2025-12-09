import jsPDF from "jspdf";

type InvoiceShape = {
  invoice: string;
  date: string;
  description: string;
  amount: number;
  status: string;
};

type BillingShape = {
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

/**
 * Generate and download a simple PDF invoice without opening new windows or shaking the UI.
 * Uses jsPDF to render text directly (no DOM capture).
 */
export const generateInvoicePDF = (invoice: InvoiceShape, billingInfo: BillingShape) => {
  const doc = new jsPDF();
  const filename = `${invoice.invoice || "invoice"}.pdf`;
  const lineHeight = 8;
  let y = 20;

  const addLine = (text: string, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, 15, y);
    y += lineHeight;
  };

  addLine("VoiceAI", 18, true);
  addLine("AI Voice Agent Platform", 11);
  y += 4;

  addLine(`Invoice: ${invoice.invoice}`, 14, true);
  addLine(`Date: ${invoice.date}`, 11);
  addLine(`Status: ${invoice.status}`, 11);
  y += 6;

  addLine("Bill To", 12, true);
  addLine(billingInfo.companyName || billingInfo.customerName || "Customer", 11);
  addLine(billingInfo.customerName, 11);
  addLine(billingInfo.billingAddress, 11);
  addLine(`${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}`, 11);
  addLine(billingInfo.country, 11);
  addLine(billingInfo.email, 11);
  addLine(billingInfo.phone, 11);
  y += 6;

  addLine("Description", 12, true);
  addLine(invoice.description, 11);
  y += 2;
  addLine(`Amount: $${invoice.amount.toFixed(2)}`, 12, true);
  y += 10;

  addLine("Thank you for your business!", 12, true);
  addLine("For questions about this invoice, contact support@voiceai.com", 10);

  doc.save(filename);
};

export const viewInvoicePDF = generateInvoicePDF;
