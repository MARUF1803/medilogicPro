import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BranchService } from '../../core/services/branch.service';
import { CalculationService } from '../../core/services/calculation.service';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-purchase-return-create',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="animate-in main-container" style="padding-bottom: 60px; padding-top: 20px;">
      <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border">
        <h1 class="m-0 font-bold" style="font-size: 24px;">Purchase Return Portal</h1>
        <div class="flex gap-4">
            <input type="text" [(ngModel)]="purchaseNo" (keyup.enter)="searchPurchase()" placeholder="PO Number..." class="form-input" style="width: 250px;" />
            <button class="btn btn-primary" (click)="searchPurchase()" [disabled]="loading">Lookup</button>
        </div>
      </div>

      @if (purchase) {
        <div class="animate-in">
          <div class="flex gap-6 mb-6">
            <div class="card flex-1 p-6">
               <span class="text-xs font-bold text-muted uppercase">Purchase Order</span>
               <h3 class="m-0">{{ purchase.purchaseNo }}</h3>
            </div>
            <div class="card flex-1 p-6">
               <span class="text-xs font-bold text-muted uppercase">Supplier</span>
               <h3 class="m-0">{{ purchase.supplier?.fullName || 'Unknown' }}</h3>
            </div>
            <div class="card flex-1 p-6">
               <label class="text-xs font-bold text-muted uppercase">Reason</label>
               <select class="form-input" [(ngModel)]="reason">
                  <option value="Damage">Damage</option>
                  <option value="Expired">Expired</option>
                  <option value="Wrong Product">Wrong Item</option>
                  <option value="Others">Others</option>
               </select>
            </div>
          </div>

          <div class="card p-0 overflow-hidden shadow-sm rounded-2xl border mb-6">
            <table class="data-table">
              <thead>
                <tr class="bg-slate-50">
                  <th style="padding-left: 24px;">Product & Batch</th>
                  <th class="text-center">Avail</th>
                  <th class="text-center" style="width: 150px;">Return Qty</th>
                  <th class="text-right">Cost</th>
                  <th class="text-right" style="padding-right: 24px;">Credit</th>
                </tr>
              </thead>
              <tbody>
                @for (item of returnDetails; track item.purchaseDetailId) {
                  <tr>
                    <td style="padding-left: 24px;">
                        <div class="font-bold text-slate-800">{{ item.product?.productName }}</div>
                        <div class="text-xs text-muted">BATCH: {{ item.batchNumber }}</div>
                    </td>
                    <td class="text-center font-bold text-primary">{{ item.maxReturn }}</td>
                    <td>
                        <input type="number" class="no-spinner form-input text-center font-black h-12" 
                          [max]="item.maxReturn" min="0" 
                          [(ngModel)]="item.returnQuantity" 
                          (ngModelChange)="onReturnQtyChange(item)" />
                    </td>
                    <td class="text-right text-muted">{{ calc.formatCurrency(item.unitPrice) }}</td>
                    <td class="text-right font-black" style="padding-right: 24px;">{{ calc.formatCurrency((item.returnQuantity || 0) * item.unitPrice) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex justify-end">
            <div class="card p-8 bg-danger text-white text-center" style="width: 400px; border-radius: 32px;">
                <div class="text-xs uppercase opacity-60 mb-2">Total Credit</div>
                <div class="text-4xl font-black mb-6">{{ calc.formatCurrency(totalRefund) }}</div>
                <button class="btn btn-block bg-white text-danger font-black h-14 rounded-2xl" [disabled]="totalRefund === 0 || submitting" (click)="submitReturn()">
                  {{ submitting ? 'Processing...' : 'Confirm Return' }}
                </button>
            </div>
          </div>
        </div>
      }
      
      @if (showSuccessModal && lastReturnData) {
        <app-global-preview-modal [type]="'PurchaseReturn'" [data]="lastReturnData" (close)="onModalClose()"></app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1300px; margin: 0 auto; }
    .no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    .no-spinner { -moz-appearance: textfield; }
    .animate-in { animation: slideUp 0.4s ease-out both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PurchaseReturnCreateComponent {
  purchaseNo = '';
  loading = false;
  submitting = false;
  purchase: any = null;
  returnDetails: any[] = [];
  reason = 'Damage';
  totalRefund = 0;
  showSuccessModal = false;
  lastReturnData: any = null;

  constructor(private api: ApiService, private branch: BranchService, private router: Router, public calc: CalculationService) {}

  searchPurchase() {
    if (!this.purchaseNo) return;
    this.loading = true;
    this.api.get<any[]>(`Purchase`).subscribe({
      next: (data) => {
        const found = data.find(p => p.purchaseNo === this.purchaseNo);
        if (!found) { alert('Purchase not found'); this.loading = false; return; }
        this.purchase = found;
        this.returnDetails = (found.purchaseDetails || []).map((d: any) => ({ ...d, maxReturn: (d.quantity || 0) - (d.returnedQuantity || 0), returnQuantity: 0 }));
        this.loading = false;
      },
      error: () => { alert('Failed to search'); this.loading = false; }
    });
  }

  onReturnQtyChange(item: any) {
    item.returnQuantity = Math.max(0, Math.min(item.maxReturn, parseFloat(item.returnQuantity as any) || 0));
    this.calculateTotal();
  }

  calculateTotal() { this.totalRefund = this.returnDetails.reduce((sum, item) => sum + ((item.returnQuantity || 0) * (item.unitPrice || 0)), 0); }

  submitReturn() {
    const items = this.returnDetails.filter(i => i.returnQuantity > 0);
    if (items.length === 0) return;
    this.submitting = true;
    const payload = { purchaseId: this.purchase.purchaseId, branchId: this.branch.activeBranchId(), supplierId: this.purchase.supplierId, returnDate: new Date().toISOString(), totalReturnAmount: this.totalRefund, reason: this.reason, purchaseReturnDetails: items.map(i => ({ productId: i.productId, batchNumber: i.batchNumber, quantity: i.returnQuantity, unitPrice: i.unitPrice })) };
    this.api.post<any>('PurchaseReturn', payload).subscribe({
      next: (res) => { this.submitting = false; this.api.get<any>(`PurchaseReturn/${res.purchaseReturnId}`).subscribe(fullRet => { this.lastReturnData = fullRet; this.showSuccessModal = true; }); },
      error: () => { this.submitting = false; alert('Failed to process return'); }
    });
  }

  onModalClose() { this.showSuccessModal = false; this.router.navigate(['/purchase-returns']); }
}
