import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../../core/services/pdf.service';
import { CalculationService } from '../../../core/services/calculation.service';
import { BranchService } from '../../../core/services/branch.service';

@Component({
  selector: 'app-global-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop: Shifted to Left (flex-start) -->
    <div class="lazz-backdrop" (click)="close.emit()" style="position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.6)!important;z-index:9999999!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;padding-left:280px!important;">
      
      <!-- Modal: Significantly Slimmer (750px) -->
      <div class="lazz-modal-container animate-in" (click)="$event.stopPropagation()" style="width: 750px !important; max-height: 96vh !important; border-radius: 24px !important; background: #fff !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; box-shadow: 0 40px 80px rgba(0,0,0,0.4) !important;">
        
        <!-- Header: Standardized with QR Code & Branding -->
        <div class="lazz-header" [style.background]="getHeaderGradient()" style="padding: 15px 25px !important; flex-shrink: 0 !important; position: relative;">
          <div style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
            <div style="display: flex !important; gap: 15px !important; align-items: center !important;">
              <div style="padding: 8px !important; background: rgba(255,255,255,0.2) !important; border-radius: 12px !important; backdrop-filter: blur(4px);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 7 7 12l5 5 5-5-5-5Z"/></svg>
              </div>
              <div>
                <h1 style="color: #fff !important; margin: 0 !important; font-size: 22px !important; font-weight: 950 !important; line-height: 1 !important; letter-spacing: -0.5px;">{{ getTitle() }}</h1>
                <div style="display: flex !important; gap: 10px !important; margin-top: 4px !important; color: rgba(255,255,255,0.8) !important; font-size: 11px !important; font-weight: 700 !important; font-family: 'Poppins', sans-serif;">
                   <span>{{ getSubTitle() }}</span>
                   <span style="border-left: 1px solid rgba(255,255,255,0.3) !important; padding-left: 10px !important;">{{ getDate() | date:'mediumDate' }}</span>
                   <span style="border-left: 1px solid rgba(255,255,255,0.3) !important; padding-left: 10px !important; color: #fff; font-weight: 900;">Dhaka Main Branch</span>
                </div>
              </div>
            </div>

            <div style="display: flex !important; gap: 12px !important; align-items: center !important;">
               <!-- Mini QR Placeholder for Luxury Look -->
               <div style="width: 44px; height: 44px; background: #fff; border-radius: 8px; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="#000"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"/></svg>
               </div>
               
               <div style="background: rgba(0,0,0,0.15) !important; padding: 8px 15px !important; border-radius: 10px !important; border: 1.5px solid rgba(255,255,255,0.1) !important; text-align: right !important; backdrop-filter: blur(4px);">
                  <span style="display: block !important; font-size: 7px !important; font-weight: 950 !important; text-transform: uppercase !important; color: rgba(255,255,255,0.5) !important; letter-spacing: 1px;">TRANS REF</span>
                  <span style="color: #fff !important; font-size: 13px !important; font-weight: 950 !important; font-family: 'Inter', sans-serif;">{{ getReferenceNo() }}</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Body Content -->
        <div style="flex: 1 !important; display: flex !important; overflow: hidden !important; background: #fff !important;">
          
          <!-- Table Section -->
          <div style="flex: 1 !important; padding: 20px !important; overflow-y: auto !important; border-right: 1px solid #f1f5f9 !important;">
            <table style="width: 100% !important; border-collapse: collapse !important; margin-bottom: 30px;">
              <thead>
                <tr style="border-bottom: 2px solid #f1f5f9 !important;">
                  <th style="padding: 0 0 10px 0 !important; text-align: left !important; font-size: 9px !important; color: #94a3b8 !important; text-transform: uppercase !important; font-weight: 900; letter-spacing: 1px;">Medicine Description</th>
                  <th style="padding: 0 0 10px 0 !important; text-align: center !important; font-size: 9px !important; color: #94a3b8 !important; text-transform: uppercase !important; font-weight: 900; letter-spacing: 1px;">Batch No</th>
                  <th style="padding: 0 0 10px 0 !important; text-align: right !important; font-size: 9px !important; color: #94a3b8 !important; text-transform: uppercase !important; font-weight: 900; letter-spacing: 1px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of getItems()" style="border-bottom: 1px solid #fbfcfe !important;">
                  <td style="padding: 12px 0 !important;">
                    <div style="font-size: 14px !important; font-weight: 900 !important; color: #0f172a !important; font-family: 'Inter', sans-serif;">{{ getItemName(item) }}</div>
                    <div style="font-size: 9px !important; font-weight: 800 !important; color: #94a3b8 !important; text-transform: uppercase;">{{ item.strength }} <span style="margin: 0 4px; opacity: 0.5;">•</span> Qty: {{ item.quantity }}</div>
                  </td>
                  <td style="padding: 12px 0 !important; text-align: center !important;">
                     <span *ngIf="item.batchNumber && item.batchNumber !== 'N/A'" style="background: #f1f5f9 !important; color: #475569 !important; font-size: 10px !important; padding: 4px 8px !important; border-radius: 6px !important; font-weight: 900 !important; font-family: 'Poppins', sans-serif;">{{ item.batchNumber }}</span>
                     <span *ngIf="!item.batchNumber || item.batchNumber === 'N/A'" style="color: #cbd5e1; font-size: 10px;">—</span>
                  </td>
                  <td style="padding: 12px 0 !important; text-align: right !important; font-size: 14px !important; font-weight: 950 !important; color: #0f172a !important;">
                    {{ calc.formatCurrency((item.quantity || 0) * (item.unitPrice || 0)) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Transaction History Section (Dynamic) -->
            <div *ngIf="showHistory() && getHistory().length > 0" style="margin-top: 10px; padding-top: 20px; border-top: 1.5px dashed #e2e8f0;">
               <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                  <div style="width: 24px; height: 24px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                  </div>
                  <span style="font-size: 10px; font-weight: 950; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px;">Payment History Trail</span>
               </div>
               
               <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                     <tr style="background: #f8fafc; border-radius: 8px;">
                        <th style="padding: 10px; text-align: left; font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: 950;">Pay Date</th>
                        <th style="padding: 10px; text-align: center; font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: 950;">Method</th>
                        <th style="padding: 10px; text-align: right; font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: 950;">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr *ngFor="let p of getHistory()" style="border-bottom: 1px solid #f8fafc;">
                        <td style="padding: 10px; font-size: 11px; color: #475569; font-weight: 800;">{{ (p.paymentDate || p.PaymentDate || p.salesDate || p.purchaseDate) | date:'mediumDate' }}</td>
                        <td style="padding: 10px; text-align: center;">
                           <span style="background: #f1f5f9; color: #64748b; font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: 900; text-transform: uppercase; border: 1px solid #e2e8f0;">{{ p.paymentMethod || p.PaymentMethod }}</span>
                        </td>
                        <td style="padding: 10px; text-align: right; font-size: 12px; font-weight: 950; color: #0f172a;">{{ calc.formatCurrency(p.amount || p.Amount) }}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
          </div>

          <!-- Financial Sidebar (Rose card for Purchases) -->
          <div *ngIf="type !== 'Inventory' && recon" style="width: 250px !important; padding: 20px !important; background: #fcfdfe !important; display: flex !important; flex-direction: column !important; border-left: 1px solid #f1f5f9;">
            
            <div style="flex: 1 !important; display: flex !important; flex-direction: column !important; gap: 12px !important;">
              <div style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; font-weight: 800 !important; color: #64748b !important;">
                <span>Gross Amount</span>
                <span>{{ calc.formatCurrency(data.totalAmount || 0) }}</span>
              </div>
              
              <div *ngIf="getDiscount() > 0" style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; font-weight: 800 !important; color: #10b981 !important;">
                <span>Total Discount</span>
                <span>- {{ calc.formatCurrency(getDiscount()) }}</span>
              </div>

              <!-- Main Payable -->
              <div style="margin: 10px 0 !important; background: #f8fafc !important; border: 1.5px solid #e2e8f0 !important; padding: 15px !important; border-radius: 16px !important;">
                <span style="font-size: 9px !important; font-weight: 950 !important; color: #94a3b8 !important; text-transform: uppercase !important; letter-spacing: 1.5px; display: block; margin-bottom: 5px;">NET PAYABLE</span>
                <div style="color: #0c63e4 !important; font-size: 32px !important; font-weight: 950 !important; letter-spacing: -1.5px !important; line-height: 1 !important; font-family: 'Inter', sans-serif;">{{ calc.formatCurrency(recon.netAmount) }}</div>
              </div>

              <!-- Rose-colored Financial Card (For Paid & Due) -->
              <div style="background: #fff1f2 !important; border: 2px solid #ffe4e6 !important; padding: 15px !important; border-radius: 20px !important; display: flex !important; flex-direction: column !important; gap: 10px !important; box-shadow: 0 10px 20px rgba(244, 63, 94, 0.05);">
                <div style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
                  <span style="font-size: 8px !important; font-weight: 950 !important; color: #f43f5e !important; text-transform: uppercase !important; letter-spacing: 1px;">Paid Amount</span>
                  <span style="font-size: 14px !important; font-weight: 950 !important; color: #be123c !important;">{{ calc.formatCurrency(recon.paidAmount) }}</span>
                </div>
                
                <div style="height: 1.5px; background: rgba(244, 63, 94, 0.1); width: 100%;"></div>

                <div *ngIf="recon.dueAmount > 0" style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
                  <span style="font-size: 8px !important; font-weight: 950 !important; color: #f43f5e !important; text-transform: uppercase !important; letter-spacing: 1px;">Remaining Due</span>
                  <span style="font-size: 18px !important; font-weight: 950 !important; color: #be123c !important; font-family: 'Inter', sans-serif;">{{ calc.formatCurrency(recon.dueAmount) }}</span>
                </div>

                <div *ngIf="recon.changeReturned > 0" style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
                  <span style="font-size: 8px !important; font-weight: 950 !important; color: #10b981 !important; text-transform: uppercase !important; letter-spacing: 1px;">Change Amount</span>
                  <span style="font-size: 18px !important; font-weight: 950 !important; color: #059669 !important; font-family: 'Inter', sans-serif;">{{ calc.formatCurrency(recon.changeReturned) }}</span>
                </div>
              </div>

              <!-- Ledger Impact -->
              <div *ngIf="recon.dueAmount > 0" style="padding: 10px 15px !important; background: #fefce8 !important; border-radius: 12px !important; border: 1px solid #fef08a !important; margin-top: 5px;">
                 <div style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
                    <span style="font-size: 8px !important; font-weight: 900 !important; color: #a16207 !important; text-transform: uppercase;">Final Balance</span>
                    <span style="font-size: 13px !important; font-weight: 950 !important; color: #a16207 !important;">{{ calc.formatCurrency(recon.finalBalance) }}</span>
                 </div>
              </div>

            </div>
            
            <button (click)="print()" style="width: 100% !important; height: 54px !important; background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%) !important; color: #fff !important; border: none !important; border-radius: 16px !important; font-weight: 950 !important; font-size: 15px !important; cursor: pointer !important; margin-top: 20px !important; transition: transform 0.2s; box-shadow: 0 8px 20px rgba(12, 99, 228, 0.2);">
              Print Official Invoice
            </button>
          </div>
        </div>
        
        <div style="padding: 12px 25px !important; background: #f8fafc !important; border-top: 1px solid #f1f5f9 !important; display: flex !important; justify-content: flex-end !important; align-items: center; gap: 15px;">
          <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">MediLogicPro ERP System • Standard v2.0</span>
          <button (click)="close.emit()" style="padding: 8px 20px !important; background: #fff !important; border: 2px solid #e2e8f0 !important; border-radius: 10px !important; color: #64748b !important; font-weight: 950 !important; font-size: 12px !important; cursor: pointer !important;">Close Detail</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: popLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes popLeft { from { opacity: 0; transform: translateX(-60px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
    :host { font-family: 'Inter', 'Poppins', sans-serif !important; }
  `]
})
export class GlobalPreviewModalComponent implements OnInit {
  @Input() type: 'Sale' | 'Purchase' | 'SalesReturn' | 'PurchaseReturn' | 'Inventory' = 'Sale';
  @Input() data: any;
  @Output() close = new EventEmitter<void>();

  recon: any;

  constructor(public calc: CalculationService, private pdf: PdfService, public branchService: BranchService) {}

  ngOnInit() {
    if (this.type !== 'Inventory') {
      this.recon = this.calc.getReconciliation(this.data);
    }
  }

  getHeaderGradient(): string {
    switch (this.type) {
      case 'Sale': return 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)';
      case 'Purchase': return 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)';
      case 'SalesReturn':
      case 'PurchaseReturn': return 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)';
      case 'Inventory': return 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)';
      default: return 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)';
    }
  }

  getTitle(): string {
    if (this.type === 'Inventory') return this.data.productName || 'Product Info';
    return this.data.party?.fullName || this.data.customerName || this.data.supplierName || 'Walk-In Customer';
  }

  getSubTitle(): string {
    if (this.type === 'Inventory') return this.data.genericName || 'Category Registry';
    return this.data.party?.phoneNumber || this.data.phoneNumber || 'Contact Not Provided';
  }

  getDate(): string {
    return this.data.salesDate || this.data.SalesDate || this.data.purchaseDate || this.data.PurchaseDate || this.data.returnDate || this.data.ReturnDate || this.data.date || new Date();
  }

  getReferenceNo(): string {
    return this.data.invoiceNo || this.data.InvoiceNo || this.data.purchaseNo || this.data.PurchaseNo || this.data.returnNo || this.data.ReturnNo || 'REF-' + Date.now();
  }

  getStatusColor(): string {
    if (this.recon?.isFullyPaid) return '#059669';
    return '#f43f5e';
  }

  getItems(): any[] {
    if (this.type === 'Inventory') return [this.data];
    return this.data.salesDetails || this.data.SalesDetails || 
           this.data.purchaseDetails || this.data.PurchaseDetails || 
           this.data.salesReturnDetails || this.data.SalesReturnDetails || 
           this.data.purchaseReturnDetails || this.data.PurchaseReturnDetails || [];
  }
  
  getDiscount(): number {
    return Number(this.data.discount || this.data.Discount || 0);
  }

  getItemName(item: any): string {
    if (this.type === 'Inventory') return item.batchNumber || 'Batch Entry';
    return item.productName || item.product?.productName || 'Medicine Item';
  }

  isWalkIn(): boolean {
    if (this.type !== 'Sale') return false;
    const name = (this.data?.party?.fullName || this.data?.customerName || '').toLowerCase();
    return (!this.data?.partyId && !this.data?.PartyId) || name.includes('walking');
  }

  showHistory(): boolean {
    if (this.type === 'Inventory') return false;
    if (this.type === 'Sale' && this.isWalkIn()) return false;
    return true;
  }

  getHistory(): any[] {
    return this.data?.salesPayments || this.data?.SalesPayments || 
           this.data?.purchasePayments || this.data?.PurchasePayments || [];
  }

  print() {
    this.pdf.generateInvoice(this.type as any, this.data);
  }
}
