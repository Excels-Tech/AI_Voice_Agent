export const generateInvoicePDF = (invoice: {
  invoice: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}, billingInfo: {
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}) => {
  // Create a new window for the PDF
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups for this site to download invoices');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 40px;
          color: #1e293b;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-number {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .invoice-date {
          color: #64748b;
          font-size: 14px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        
        .billing-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        
        .billing-info p {
          margin-bottom: 4px;
          line-height: 1.6;
        }
        
        .company-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        
        .invoice-table thead {
          background: #f8fafc;
        }
        
        .invoice-table th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .invoice-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .totals {
          margin-left: auto;
          width: 300px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .total-row.grand-total {
          font-size: 18px;
          font-weight: 700;
          border-top: 2px solid #1e293b;
          border-bottom: 2px solid #1e293b;
          margin-top: 8px;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        
        .footer p {
          margin-bottom: 4px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
        }

        .download-instructions {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #3b82f6;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          text-align: center;
        }

        @media print {
          .download-instructions {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="download-instructions">
        📥 Use Ctrl+P (Cmd+P on Mac) and select "Save as PDF" to download this invoice
      </div>
      
      <div class="invoice-container">
        <div class="header">
          <div>
            <div class="logo">VoiceAI</div>
            <p style="color: #64748b; margin-top: 4px;">AI Voice Agent Platform</p>
          </div>
          <div class="invoice-details">
            <div class="invoice-number">${invoice.invoice}</div>
            <div class="invoice-date">Date: ${invoice.date}</div>
            <div class="status-badge">${invoice.status}</div>
          </div>
        </div>
        
        <div class="billing-section">
          <div>
            <div class="section-title">From</div>
            <div class="billing-info">
              <p class="company-name">VoiceAI Inc.</p>
              <p>123 Tech Street</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
              <p style="margin-top: 8px;">support@voiceai.com</p>
              <p>+1 (555) 000-0000</p>
            </div>
          </div>
          
          <div>
            <div class="section-title">Bill To</div>
            <div class="billing-info">
              <p class="company-name">${billingInfo.companyName}</p>
              <p>${billingInfo.customerName}</p>
              <p>${billingInfo.billingAddress}</p>
              <p>${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}</p>
              <p>${billingInfo.country}</p>
              <p style="margin-top: 8px;">${billingInfo.email}</p>
              <p>${billingInfo.phone}</p>
            </div>
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right; width: 150px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 600; margin-bottom: 4px;">${invoice.description}</div>
                <div style="font-size: 14px; color: #64748b;">Subscription billing period</div>
              </td>
              <td style="text-align: right; font-weight: 600;">$${invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>$${invoice.amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>$${invoice.amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>For questions about this invoice, contact us at support@voiceai.com</p>
          <p style="margin-top: 12px; font-size: 12px;">VoiceAI Inc. • 123 Tech Street, San Francisco, CA 94105</p>
        </div>
      </div>

      <script>
        // Auto-trigger print dialog after page loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
        
        // Auto-close after print or cancel
        window.onafterprint = function() {
          setTimeout(function() {
            window.close();
          }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const viewInvoicePDF = (invoice: {
  invoice: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}, billingInfo: {
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}) => {
  // Create a new window for viewing the PDF
  const viewWindow = window.open('', '_blank');
  
  if (!viewWindow) {
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 40px;
          color: #1e293b;
          background: #f8fafc;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 60px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 8px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-number {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .invoice-date {
          color: #64748b;
          font-size: 14px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        
        .billing-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        
        .billing-info p {
          margin-bottom: 4px;
          line-height: 1.6;
        }
        
        .company-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        
        .invoice-table thead {
          background: #f8fafc;
        }
        
        .invoice-table th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .invoice-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .totals {
          margin-left: auto;
          width: 300px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .total-row.grand-total {
          font-size: 18px;
          font-weight: 700;
          border-top: 2px solid #1e293b;
          border-bottom: 2px solid #1e293b;
          margin-top: 8px;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        
        .footer p {
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div>
            <div class="logo">VoiceAI</div>
            <p style="color: #64748b; margin-top: 4px;">AI Voice Agent Platform</p>
          </div>
          <div class="invoice-details">
            <div class="invoice-number">${invoice.invoice}</div>
            <div class="invoice-date">Date: ${invoice.date}</div>
            <div class="status-badge">${invoice.status}</div>
          </div>
        </div>
        
        <div class="billing-section">
          <div>
            <div class="section-title">From</div>
            <div class="billing-info">
              <p class="company-name">VoiceAI Inc.</p>
              <p>123 Tech Street</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
              <p style="margin-top: 8px;">support@voiceai.com</p>
              <p>+1 (555) 000-0000</p>
            </div>
          </div>
          
          <div>
            <div class="section-title">Bill To</div>
            <div class="billing-info">
              <p class="company-name">${billingInfo.companyName}</p>
              <p>${billingInfo.customerName}</p>
              <p>${billingInfo.billingAddress}</p>
              <p>${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}</p>
              <p>${billingInfo.country}</p>
              <p style="margin-top: 8px;">${billingInfo.email}</p>
              <p>${billingInfo.phone}</p>
            </div>
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right; width: 150px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 600; margin-bottom: 4px;">${invoice.description}</div>
                <div style="font-size: 14px; color: #64748b;">Subscription billing period</div>
              </td>
              <td style="text-align: right; font-weight: 600;">$${invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>$${invoice.amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>$${invoice.amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>For questions about this invoice, contact us at support@voiceai.com</p>
          <p style="margin-top: 12px; font-size: 12px;">VoiceAI Inc. • 123 Tech Street, San Francisco, CA 94105</p>
        </div>
      </div>
    </body>
    </html>
  `;

  viewWindow.document.write(htmlContent);
  viewWindow.document.close();
};