import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationService } from './calculation.service';
import { BranchService } from './branch.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private calc: CalculationService, private branchService: BranchService) {}

  generateInvoice(type: 'Sale' | 'Sales' | 'Purchase' | 'SalesReturn' | 'PurchaseReturn' | 'PartyStatement', data: any) {
    try {
      console.log('Generating PDF for:', type, data);
      const doc = new jsPDF();
      
      if (type === 'PartyStatement') {
        this.renderStatement(doc, data);
        return;
      }

      const isSales = type === 'Sale' || type === 'Sales' || type === 'SalesReturn';
      const isReturn = type.includes('Return');
      
      let title = '';
      if (type === 'Sale' || type === 'Sales') title = 'Sales Invoice';
      else if (type === 'Purchase') title = 'Purchase Order';
      else if (type === 'SalesReturn') title = 'Sales Return Memo';
      else if (type === 'PurchaseReturn') title = 'Purchase Return Memo';

      const invoiceNo = isReturn ? (data.returnNo || data.invoiceNo || data.purchaseNo || 'N/A') : (isSales ? (data.invoiceNo || 'INV-' + data.salesId) : (data.purchaseNo || 'PO-' + data.purchaseId));
      const date = isReturn ? (data.returnDate || data.date) : (isSales ? data.salesDate : data.purchaseDate);
      const partyName = isSales 
        ? `${data.party?.fullName || data.customerName || 'Walk-in Customer'}` 
        : `${data.supplierName || data.party?.fullName || 'Unknown'}`;

      // Header with Branch Info & QR
      doc.setFontSize(22);
      doc.setTextColor(12, 99, 228); 
      doc.text('MediLogicPro ERP', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Branch: Dhaka Main Branch`, 14, 26);
      doc.text(`Doc Type: ${title}`, 14, 32);

      // Decorative QR Code Placeholder
      doc.setDrawColor(200);
      doc.rect(170, 12, 25, 25);
      doc.setFontSize(6);
      doc.text('SCAN FOR VERIFICATION', 170, 40);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Doc No: ${invoiceNo}`, 14, 45);
      doc.text(`Date: ${date ? new Date(date).toLocaleDateString() : 'N/A'}`, 14, 50);
      doc.text(`Party: ${partyName}`, 14, 55);

      // Items Table
      const items = isReturn ? (data.salesReturnDetails || data.purchaseReturnDetails || []) : (isSales ? data.salesDetails : data.purchaseDetails);
      const tableData = (items || []).map((item: any) => {
        const price = item.unitPrice || item.costPrice || item.mrp || 0;
        const qty = item.quantity || item.qty || 0;
        const retQty = item.returnedQuantity || 0;
        const subtotal = (qty - retQty) * price;
        return [
          item.productName || item.product?.productName || 'Product',
          (item.batchNumber === 'N/A' || !item.batchNumber) ? '-' : item.batchNumber,
          qty,
          `Tk. ${price.toFixed(2)}`,
          retQty,
          `Tk. ${subtotal.toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: 65,
        head: [['Product', 'Batch', 'Qty', 'Rate', 'Ret. Qty', 'Subtotal']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: type.includes('Return') ? [190, 18, 60] : (isSales ? [12, 99, 228] : [20, 30, 40]) 
        }
      });

      // Totals & Reconciliation
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalAmount = isReturn ? (data.totalReturnAmount || data.totalRefundAmount || data.totalAmount || 0) : (data.totalAmount || 0);
      const netAmount = data.netAmount || totalAmount || 0;

      // Aligned Totals Area (Right Aligned Values)
      const labelX = 140;
      const valueX = 190;

      doc.setFontSize(10);
      doc.text(`Total Amount:`, labelX, finalY);
      doc.text(`Tk. ${(totalAmount || 0).toFixed(2)}`, valueX, finalY, { align: 'right' });
      
      if (!isReturn) {
        doc.text(`Discount:`, labelX, finalY + 6);
        doc.text(`- Tk. ${(data.discount || 0).toFixed(2)}`, valueX, finalY + 6, { align: 'right' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Net Payable:`, labelX, finalY + 14);
        doc.text(`Tk. ${(netAmount || 0).toFixed(2)}`, valueX, finalY + 14, { align: 'right' });
        
        // RECONCILIATION LOGIC
        const recon = this.calc.getReconciliation(data);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Paid:`, labelX, finalY + 22);
        doc.text(`Tk. ${recon.paidAmount.toFixed(2)}`, valueX, finalY + 22, { align: 'right' });

        if (recon.isFullyPaid) {
          doc.setTextColor(22, 163, 74); // Green
          doc.setFont('helvetica', 'bold');
          doc.text(`Change Returned:`, labelX, finalY + 30);
          doc.text(`Tk. ${recon.changeReturned.toFixed(2)}`, valueX, finalY + 30, { align: 'right' });
          doc.text(`Status: FULLY PAID`, 105, finalY + 40, { align: 'center' });
        } else {
          doc.setTextColor(220, 38, 38); // Red
          doc.setFont('helvetica', 'bold');
          doc.text(`Unpaid Balance:`, labelX, finalY + 30);
          doc.text(`Tk. ${recon.dueAmount.toFixed(2)}`, valueX, finalY + 30, { align: 'right' });
          
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139); // Gray
          doc.setFont('helvetica', 'normal');
          doc.text(`Previous Ledger:`, labelX, finalY + 36);
          doc.text(`+ Tk. ${recon.previousDue.toFixed(2)}`, valueX, finalY + 36, { align: 'right' });
          
          doc.setFontSize(10);
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text(`Final Ledger Balance:`, labelX, finalY + 44);
          doc.text(`Tk. ${recon.finalBalance.toFixed(2)}`, valueX, finalY + 44, { align: 'right' });
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }

      // Finalize and Print
      doc.autoPrint();
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
    }
  }

  private renderStatement(doc: jsPDF, data: any) {
    doc.setFontSize(20);
    doc.text('Party Statement', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Party Name: ${data.party?.fullName || 'N/A'}`, 14, 35);
    
    autoTable(doc, {
      startY: 55,
      head: [['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance']],
      body: (data.transactions || []).map((t: any) => [
        new Date(t.transactionDate).toLocaleDateString(),
        t.type,
        t.referenceNo || '-',
        `Tk ${(t.debit || 0).toFixed(2)}`,
        `Tk ${(t.credit || 0).toFixed(2)}`,
        `Tk ${(t.balance || 0).toFixed(2)}`
      ])
    });
    doc.save(`Statement_${(data.party?.fullName || 'Party').replace(/\s+/g, '_')}.pdf`);
  }

  generatePartyStatement(party: any, transactions: any[]) {
    this.generateInvoice('PartyStatement', { party, transactions });
  }
}
