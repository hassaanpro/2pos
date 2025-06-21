import { ReceiptData } from '../lib/supabase';
import { formatCurrency } from './dateUtils';

/**
 * Generate a receipt for a sale
 */
export const generateReceipt = async (receiptData: ReceiptData): Promise<void> => {
  try {
    // Create a new window for the receipt
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      throw new Error('Unable to open receipt window. Please check your popup blocker settings.');
    }

    // Get store info from settings (in a real app, this would come from the database)
    const storeName = 'My Store';
    const storeAddress = 'Main Street, Karachi, Pakistan';
    const storePhone = '+92-300-1234567';
    const storeNTN = '1234567-8';
    const receiptFooter = 'Thank you for shopping with us!';

    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${receiptData.receipt_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .store-name {
            font-size: 18px;
            font-weight: bold;
          }
          .receipt-info {
            margin: 10px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
          }
          .items {
            width: 100%;
            border-collapse: collapse;
          }
          .items th, .items td {
            text-align: left;
            padding: 3px 0;
          }
          .items th:last-child, .items td:last-child {
            text-align: right;
          }
          .totals {
            margin-top: 10px;
            text-align: right;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
          }
          .bold {
            font-weight: bold;
          }
          .right {
            text-align: right;
          }
          .center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${storeName}</div>
          <div>${storeAddress}</div>
          <div>Phone: ${storePhone}</div>
          <div>NTN: ${storeNTN}</div>
        </div>
        
        <div class="receipt-info">
          <div><span class="bold">Receipt:</span> ${receiptData.receipt_number}</div>
          <div><span class="bold">Invoice:</span> ${receiptData.invoice_number}</div>
          <div><span class="bold">Date:</span> ${new Date(receiptData.sale_date).toLocaleString('en-PK')}</div>
          <div><span class="bold">Customer:</span> ${receiptData.customer?.name || 'Walk-in Customer'}</div>
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${receiptData.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div>Subtotal: ${formatCurrency(receiptData.subtotal)}</div>
          <div>Discount: -${formatCurrency(receiptData.discount_amount)}</div>
          <div>Tax: ${formatCurrency(receiptData.tax_amount)}</div>
          <div class="bold">Total: ${formatCurrency(receiptData.total_amount)}</div>
          <div>Payment: ${receiptData.payment_method.toUpperCase()}</div>
          <div>Status: ${receiptData.payment_status.replace('_', ' ').toUpperCase()}</div>
        </div>
        
        <div class="footer">
          <div>${receiptFooter}</div>
          <div>Receipt printed on ${new Date().toLocaleString('en-PK')}</div>
        </div>
      </body>
      </html>
    `;

    // Write the receipt HTML to the new window
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();

    // Print the receipt
    setTimeout(() => {
      receiptWindow.print();
      
      // Mark receipt as printed in the database
      // In a real app, this would call an API to update the database
      console.log('Receipt printed:', receiptData.receipt_number);
    }, 500);

  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};