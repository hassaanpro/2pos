import { BnplPaymentConfirmationData } from '../lib/supabase';
import { formatCurrency } from './dateUtils';

/**
 * Generate a BNPL payment confirmation receipt
 */
export const generateBnplPaymentConfirmation = async (
  confirmationData: BnplPaymentConfirmationData
): Promise<void> => {
  try {
    // Create a new window for the confirmation
    const confirmationWindow = window.open('', '_blank');
    if (!confirmationWindow) {
      throw new Error('Unable to open confirmation window. Please check your popup blocker settings.');
    }

    // Generate confirmation number if not provided
    if (!confirmationData.confirmation_number) {
      confirmationData.confirmation_number = `BNPL-${Date.now().toString().slice(-8)}`;
    }

    // Get store info from settings (in a real app, this would come from the database)
    const storeName = 'My Store';
    const storeAddress = 'Main Street, Karachi, Pakistan';
    const storePhone = '+92-300-1234567';
    const storeNTN = '1234567-8';
    const receiptFooter = 'Thank you for your payment!';

    // Generate confirmation HTML
    const confirmationHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Confirmation #${confirmationData.confirmation_number}</title>
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
          .confirmation-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin: 10px 0;
            padding: 5px;
            border-bottom: 1px dashed #000;
          }
          .confirmation-info {
            margin: 10px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
          }
          .payment-details {
            margin-top: 10px;
          }
          .payment-summary {
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 5px;
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
        
        <div class="confirmation-title">
          PAYMENT CONFIRMATION
        </div>
        
        <div class="confirmation-info">
          <div><span class="bold">Confirmation #:</span> ${confirmationData.confirmation_number}</div>
          <div><span class="bold">Original Invoice:</span> ${confirmationData.original_sale_invoice}</div>
          <div><span class="bold">Original Receipt:</span> ${confirmationData.original_sale_receipt}</div>
          <div><span class="bold">Date:</span> ${new Date(confirmationData.payment_date).toLocaleString('en-PK')}</div>
          <div><span class="bold">Customer:</span> ${confirmationData.customer.name}</div>
          ${confirmationData.customer.phone ? `<div><span class="bold">Phone:</span> ${confirmationData.customer.phone}</div>` : ''}
        </div>
        
        <div class="payment-details">
          <div class="bold center">PAYMENT DETAILS</div>
          <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <span>Payment Amount:</span>
            <span>${formatCurrency(confirmationData.payment_amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Payment Method:</span>
            <span>${confirmationData.payment_method.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="payment-summary">
          <div style="display: flex; justify-content: space-between;">
            <span>Remaining Balance:</span>
            <span>${formatCurrency(confirmationData.remaining_amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Status:</span>
            <span>${confirmationData.transaction_status.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>${receiptFooter}</div>
          <div>Please keep this confirmation for your records.</div>
          <div>Payment confirmation printed on ${new Date().toLocaleString('en-PK')}</div>
        </div>
      </body>
      </html>
    `;

    // Write the confirmation HTML to the new window
    confirmationWindow.document.write(confirmationHTML);
    confirmationWindow.document.close();

    // Print the confirmation
    setTimeout(() => {
      confirmationWindow.print();
      console.log('BNPL payment confirmation printed:', confirmationData.confirmation_number);
    }, 500);

  } catch (error) {
    console.error('Error generating BNPL payment confirmation:', error);
    throw error;
  }
};