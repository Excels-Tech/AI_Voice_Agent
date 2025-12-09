import html2pdf from "html2pdf.js";

export const generateInvoicePDF = (
  invoice: {
    invoice: string;
    date: string;
    description: string;
    amount: number;
    status: string;
  },
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
  }
) => {
  const filename = `${invoice.invoice || "invoice"}.pdf`;

  // Build lightweight HTML in-memory to avoid popup windows that shake the UI
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "white";
  container.innerHTML = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 32px; background: white; width: 100%; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0;">
        <div>
          <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">VoiceAI</div>
          <div style="color: #64748b; margin-top: 6px;">AI Voice Agent Platform</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 600;">${invoice.invoice}</div>
          <div style="color: #64748b; font-size: 14px;">Date: ${invoice.date}</div>
          <div style="display: inline-block; padding: 4px 10px; margin-top: 8px; background: #dcfce7; color: #16a34a; border-radius: 6px; font-size: 12px; font-weight: 600;">
            ${invoice.status}
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
        <div>
          <div style="text-transform: uppercase; color: #64748b; font-size: 12px; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px;">From</div>
          <div style="line-height: 1.6;">
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">VoiceAI Inc.</div>
            <div>123 Tech Street</div>
            <div>San Francisco, CA 94105</div>
            <div>United States</div>
            <div style="margin-top: 8px;">support@voiceai.com</div>
            <div>+1 (555) 000-0000</div>
          </div>
        </div>
        <div>
          <div style="text-transform: uppercase; color: #64748b; font-size: 12px; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px;">Bill To</div>
          <div style="line-height: 1.6;">
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">${billingInfo.companyName}</div>
            <div>${billingInfo.customerName}</div>
            <div>${billingInfo.billingAddress}</div>
            <div>${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}</div>
            <div>${billingInfo.country}</div>
            <div style="margin-top: 8px;">${billingInfo.email}</div>
            <div>${billingInfo.phone}</div>
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead style="background: #f8fafc;">
          <tr>
            <th style="text-align: left; padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Description</th>
            <th style="text-align: right; width: 150px; padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0;">
              <div style="font-weight: 600; margin-bottom: 4px;">${invoice.description}</div>
              <div style="font-size: 14px; color: #64748b;">Subscription billing period</div>
            </td>
            <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">
              $${invoice.amount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-left: auto; width: 280px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
          <span>Subtotal</span>
          <span>$${invoice.amount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
          <span>Tax (0%)</span>
          <span>$0.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #1e293b; border-bottom: 2px solid #1e293b; margin-top: 6px; font-size: 17px; font-weight: 700;">
          <span>Total</span>
          <span>$${invoice.amount.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <div style="font-weight: 600; color: #1e293b; margin-bottom: 6px;">Thank you for your business!</div>
        <div>For questions about this invoice, contact us at support@voiceai.com</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const opts = {
    margin: 0,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // Small delay ensures layout is stable before rendering (avoids UI shake)
  setTimeout(() => {
    html2pdf()
      .from(container)
      .set(opts)
      .save()
      .finally(() => {
        container.remove();
      });
  }, 100);
};

export const viewInvoicePDF = generateInvoicePDF;
