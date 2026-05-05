import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  /**
   * Calculates the payment reconciliation for an invoice.
   * Scenario A: Due exists (netAmount > paidAmount)
   * Scenario B: No due (paidAmount >= netAmount)
   */
  getReconciliation(data: any) {
    const netAmount = Number(data.netAmount || data.NetAmount || data.totalAmount || data.TotalAmount || 0);
    
    // Sum up payments if paidAmount isn't directly provided
    let paidAmount = Number(data.paidAmount || data.PaidAmount || 0);
    if (!paidAmount && (data.salesPayments || data.SalesPayments)) {
      const payments = data.salesPayments || data.SalesPayments;
      paidAmount = payments.reduce((s: number, p: any) => s + Number(p.amount || p.Amount || 0), 0);
    } else if (!paidAmount && (data.purchasePayments || data.PurchasePayments)) {
      const payments = data.purchasePayments || data.PurchasePayments;
      paidAmount = payments.reduce((s: number, p: any) => s + Number(p.amount || p.Amount || 0), 0);
    }

    const previousDue = Number(data.previousDue || data.party?.currentBalance || data.supplier?.currentBalance || 0);

    const isDue = netAmount > paidAmount;
    const dueAmount = isDue ? netAmount - paidAmount : 0;
    const changeReturned = !isDue ? paidAmount - netAmount : 0;
    
    // Final balance for the party ledger
    const finalBalance = previousDue + dueAmount;

    return {
      netAmount,
      paidAmount,
      previousDue,
      dueAmount,
      changeReturned,
      finalBalance,
      isFullyPaid: !isDue,
      status: isDue ? 'Partial Due' : 'Fully Paid'
    };
  }

  /**
   * Standardizes the display of currency (Taka)
   */
  formatCurrency(amount: number | string): string {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Tk ${ (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }`;
  }

  /**
   * Calculates Batch/Expiry/Costing breakdown for Inventory/History
   */
  getItemBreakdown(item: any, type: string) {
    const qty = Number(item.quantity || item.currentBalance || 0);
    const price = Number(item.unitPrice || item.mrp || item.costPrice || 0);
    const total = qty * price;

    return {
      qty,
      price,
      total,
      batch: item.batchNumber || item.batchNo || 'N/A',
      expiry: item.expiryDate || item.latestExpiry || null
    };
  }
}
