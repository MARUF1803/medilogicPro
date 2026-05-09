import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BranchService } from '../../core/services/branch.service';
import { CalculationService } from '../../core/services/calculation.service';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-sales-return-create',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="animate-in main-container" style="padding-bottom: 60px; padding-top: 20px;">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border">
        <div class="flex items-center gap-4">
           <div style="padding: 12px; background: rgba(244, 63, 94, 0.1); border-radius: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><path d="m15 18-6-6 6-6"/><path d="M3 12h18"/></svg>
           </div>
           <div>
              <h1 class="m-0 font-bold text-slate-800" style="font-size: 24px;">Sales Return Portal</h1>
              <p class="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Registry: Dhaka Main Branch</p>
           </div>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div class="flex items-center px-4 h-14 bg-white w-full sm:w-[320px]" style="border-radius: 16px; border: 2px solid #e2e8f0;">
              <div class="text-slate-400 mr-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input type="text" [(ngModel)]="invoiceNo" (keyup.enter)="searchInvoice()" placeholder="Invoice No (e.g. INV-1)..." class="form-input font-bold w-full" style="border: none; outline: none; box-shadow: none; background: transparent; padding: 0;" />
            </div>
            <button class="btn-lookup" (click)="searchInvoice()" [disabled]="loading">Lookup Invoice</button>
        </div>
      </div>

      @if (sale) {
        <div class="animate-in">
          <div class="flex gap-6 mb-8">
            <div class="card-info flex-1 p-6">
               <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Original Invoice</span>
               <h3 class="m-0 font-black text-slate-800 text-2xl">#{{ sale.invoiceNo }}</h3>
            </div>
            <div class="card-info flex-1 p-6">
               <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Name</span>
               <h3 class="m-0 font-black text-slate-800 text-2xl">{{ sale.customerName || 'Walk-In Customer' }}</h3>
            </div>
            <div class="card-info flex-1 p-6">
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Return Reason</label>
               <select class="form-input h-10 font-bold border-none bg-slate-50" [(ngModel)]="reason" style="width: 100%; border-radius: 8px;">
                  <option value="Damage">Product Damaged</option>
                  <option value="Expired">Medicine Expired</option>
                  <option value="Wrong Item">Incorrect Product</option>
                  <option value="Others">Customer Dissatisfied</option>
               </select>
            </div>
          </div>

          <div class="card p-0 overflow-hidden shadow-sm rounded-3xl border mb-8 bg-white">
            <table class="data-table">
              <thead>
                <tr class="bg-slate-50">
                  <th style="padding: 20px 24px;">Product</th>
                  <th class="text-center">Avail. Qty</th>
                  <th class="text-center" style="width: 180px;">Return Qty</th>
                  <th class="text-right">Unit Rate</th>
                  <th class="text-right" style="padding-right: 24px;">Refund Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (product of groupedDetails; track product.productId) {
                  <tr class="border-b border-slate-50">
                    <td style="padding: 15px 24px;">
                        <div class="font-black text-slate-800" style="font-size: 16px;">{{ product.productName }}</div>
                        <div class="text-[9px] text-muted font-black uppercase tracking-widest mt-1">Medicine ID: {{ product.productId }}</div>
                    </td>
                    <td class="text-center">
                        <span class="qty-chip">{{ product.totalAvailable }} Units</span>
                    </td>
                    <td>
                        <div class="flex justify-center p-2">
                           <input type="number" class="no-spinner return-qty-input" 
                             [max]="product.totalAvailable" min="0" 
                             [(ngModel)]="product.inputReturnQty" 
                             (ngModelChange)="onProductReturnQtyChange(product)" />
                        </div>
                    </td>
                    <td class="text-right text-slate-500 font-bold">{{ calc.formatCurrency(product.unitPrice) }}</td>
                    <td class="text-right font-black text-lg text-rose-600" style="padding-right: 24px;">{{ calc.formatCurrency((product.inputReturnQty || 0) * product.unitPrice) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex justify-end">
            <div class="card p-8 bg-slate-900 text-white shadow-2xl" style="width: 440px; border-radius: 40px; border: 1px solid rgba(255,255,255,0.1);">
                <div class="text-[10px] font-black uppercase tracking-[3px] opacity-60 mb-2 text-center">Total Refund Credit</div>
                <div class="text-6xl font-black text-white tracking-tighter text-center mb-8">{{ calc.formatCurrency(totalRefund) }}</div>
                <button class="ocean-finalize-btn" [disabled]="totalRefund === 0 || submitting" (click)="submitReturn()">
                  @if (submitting) { <div class="lazz-spinner"></div> } 
                  @else { <span class="flex items-center justify-center gap-3">Process Return & Refund <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17 4 12"/></svg></span> }
                </button>
            </div>
          </div>
        </div>
      }
      
      @if (showSuccessModal && lastReturnData) {
        <app-global-preview-modal [type]="'SalesReturn'" [data]="lastReturnData" (close)="onModalClose()"></app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; }
    .card-info { background: white; border: 1px solid #e2e8f0; border-radius: 20px; }
    .qty-chip { background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 8px; font-weight: 900; font-size: 11px; }
    .return-qty-input { width: 100px; height: 50px; text-align: center; font-size: 20px; font-weight: 950; background: #fff1f2; border: 2.5px solid #fecdd3; border-radius: 12px; color: #be123c; outline: none; transition: 0.2s; }
    .return-qty-input:focus { border-color: #f43f5e; box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1); }
    
    .btn-lookup { height: 56px; padding: 0 30px; background: #0c63e4; color: white; border: none; border-radius: 16px; font-weight: 950; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 20px -5px rgba(12, 99, 228, 0.3); }
    .btn-lookup:hover { transform: translateY(-2px); box-shadow: 0 12px 25px -5px rgba(12, 99, 228, 0.4); }
    
    .ocean-finalize-btn { width: 100%; height: 74px; background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; border: none; border-radius: 24px; font-weight: 950; font-size: 20px; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 30px -10px rgba(14, 165, 233, 0.5); }
    .ocean-finalize-btn:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 15px 40px -10px rgba(14, 165, 233, 0.6); }
    .ocean-finalize-btn:disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed; }

    .lazz-spinner { width: 30px; height: 30px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-in { animation: slideUp 0.4s ease-out both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SalesReturnCreateComponent {
  invoiceNo = '';
  loading = false;
  submitting = false;
  sale: any = null;
  returnDetails: any[] = [];
  groupedDetails: any[] = [];
  reason = 'Damage';
  totalRefund = 0;
  showSuccessModal = false;
  lastReturnData: any = null;

  constructor(private api: ApiService, public branch: BranchService, private router: Router, public calc: CalculationService) {}

  searchInvoice() {
    if (!this.invoiceNo) return;
    this.loading = true;
    this.api.get<any>(`SalesHistory/SearchInvoice/${this.invoiceNo}`).subscribe({
      next: (data) => { this.sale = data; this.returnDetails = (data.salesDetails || []).map((d: any) => ({ ...d, returnQuantity: 0 })); this.groupItemsByProduct(); this.calculateTotal(); this.loading = false; },
      error: () => { alert('Invoice not found'); this.loading = false; }
    });
  }

  groupItemsByProduct() {
    const groups: { [key: number]: any } = {};
    this.returnDetails.forEach(item => {
      if (!groups[item.productId]) { groups[item.productId] = { productId: item.productId, productName: item.productName, unitPrice: item.unitPrice, totalPurchased: 0, totalReturned: 0, totalAvailable: 0, inputReturnQty: 0, batches: [] }; }
      groups[item.productId].totalPurchased += item.quantity;
      groups[item.productId].totalReturned += item.alreadyReturnedQty;
      groups[item.productId].totalAvailable += item.availableForReturn;
      groups[item.productId].batches.push(item);
    });
    this.groupedDetails = Object.values(groups);
  }

  onProductReturnQtyChange(product: any) {
    product.inputReturnQty = Math.max(0, Math.min(product.totalAvailable, parseFloat(product.inputReturnQty as any) || 0));
    let remaining = product.inputReturnQty;
    product.batches.forEach((b: any) => { const take = Math.min(b.availableForReturn, remaining); b.returnQuantity = take; remaining -= take; });
    this.calculateTotal();
  }

  calculateTotal() { this.totalRefund = this.groupedDetails.reduce((sum, p) => sum + ((p.inputReturnQty || 0) * (p.unitPrice || 0)), 0); }

  submitReturn() {
    const allItems: any[] = [];
    this.groupedDetails.forEach(p => { p.batches.forEach((b: any) => { if (b.returnQuantity > 0) allItems.push(b); }); });
    if (allItems.length === 0) return;
    this.submitting = true;
    const payload = { 
        salesId: this.sale.salesId, 
        branchId: this.branch.activeBranchId(), 
        returnDate: new Date().toISOString(), 
        totalReturnAmount: this.totalRefund, 
        reason: this.reason, 
        salesReturnDetails: allItems.map(i => ({ productId: i.productId, productName: i.productName, batchNumber: i.batchNumber, quantity: i.returnQuantity, unitPrice: i.unitPrice })) 
    };
    this.api.post<any>('SalesHistory/CreateReturn', payload).subscribe({
      next: (res) => { 
        this.submitting = false; 
        const id = res.salesReturnId || res.id;
        this.api.get<any>(`SalesHistory/GetReturn/${id}`).subscribe(fullRet => { 
          this.lastReturnData = fullRet; 
          this.showSuccessModal = true; 
        }); 
      },
      error: () => { this.submitting = false; alert('Failed to process return'); }
    });
  }

  onModalClose() { this.showSuccessModal = false; this.router.navigate(['/sales-returns']); }
}
