import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CalculationService } from '../../core/services/calculation.service';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GlobalPreviewModalComponent],
  template: `
    <div class="main-container animate-in" style="padding-top: 20px; padding-bottom: 60px;">
      
      <!-- Luxury Header -->
      <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border shadow-sm">
        <div class="flex items-center gap-4">
           <div style="padding: 12px; background: rgba(12, 99, 228, 0.1); border-radius: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0c63e4" stroke-width="2.5"><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><path d="M3 10h18"/></svg>
           </div>
           <div>
              <h1 class="m-0 font-black text-slate-800" style="font-size: 26px; letter-spacing: -1px;">Purchase Ledger</h1>
              <p class="text-[10px] text-muted font-bold uppercase tracking-[2px] mt-1">Dhaka Main Branch | Procurement Audit</p>
           </div>
        </div>
        <!-- Button removed as requested -->
        <div class="text-right">
           <span class="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">Total Entries</span>
           <span class="text-2xl font-black text-slate-800">{{ purchases.length }} Records</span>
        </div>
      </div>

      @if (loading) {
        <div class="text-center p-32"><div class="lazz-spinner"></div></div>
      } @else {
        <div class="card p-0 overflow-hidden shadow-xl" style="border-radius: 24px; border: 1px solid #e2e8f0;">
          <table class="data-table">
            <thead>
              <tr class="bg-slate-50">
                <th style="padding: 20px 24px;">PO Number</th>
                <th>Date</th>
                <th>Supplier Information</th>
                <th class="text-right">Net Payable</th>
                <th class="text-center">Status</th>
                <th class="text-right" style="padding-right: 24px;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (p of purchases; track p.purchaseId) {
                <tr class="hover-row border-b border-slate-50">
                  <td style="padding: 18px 24px;">
                     <span class="font-black text-[#0c63e4]" style="font-size: 15px;">#{{ p.purchaseNo || 'PO-'+p.purchaseId }}</span>
                  </td>
                  <td>
                     <div class="font-bold text-slate-700">{{ p.purchaseDate | date:'mediumDate' }}</div>
                     <div class="text-[10px] text-muted font-bold">{{ p.purchaseDate | date:'shortTime' }}</div>
                  </td>
                  <td>
                     <div class="font-black text-slate-800">{{ p.supplierName || 'Registry Unknown' }}</div>
                     <div class="text-[10px] text-muted font-bold uppercase tracking-wider">Branch: Dhaka Main</div>
                  </td>
                  <td class="text-right">
                     <div class="font-black text-slate-900" style="font-size: 16px;">{{ calc.formatCurrency(p.netAmount || p.totalAmount) }}</div>
                  </td>
                  <td class="text-center">
                    <span class="badge-luxury" [class.paid]="(p.netAmount - p.paidAmount) <= 0" [class.due]="(p.netAmount - p.paidAmount) > 0">
                      {{ (p.netAmount - p.paidAmount) <= 0 ? 'FULLY PAID' : 'PARTIAL DUE' }}
                    </span>
                  </td>
                  <td class="text-right" style="padding-right: 24px;">
                      <div class="flex gap-2 justify-end">
                        @if (getPurchaseDue(p) > 0) {
                          <button class="btn-view-luxury" style="background: #0ea5e9; color: white; border-color: #0ea5e9;" (click)="openPayDue(p)">
                             Pay Due
                          </button>
                        }
                        <button class="btn-view-luxury" (click)="previewPurchase(p)">
                          View Details
                        </button>
                      </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center p-32 text-slate-300 font-black uppercase tracking-[5px]">No procurement history found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (selectedPurchase) {
        <app-global-preview-modal 
          [type]="'Purchase'" 
          [data]="selectedPurchase" 
          (close)="selectedPurchase = null">
        </app-global-preview-modal>
      }

      @if (showPayModal && payPurchase) {
        <div class="modal-backdrop" (click)="showPayModal = false" style="position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:999; display:flex; align-items:center; justify-content:center;">
           <div class="card animate-in p-8" (click)="$event.stopPropagation()" style="width: 450px; background:#fff; border-radius:24px;">
              <h3 class="mb-4 font-black text-slate-800">Settle Supplier Due</h3>
              <p class="text-[10px] font-black text-muted uppercase tracking-widest mb-6">{{ payPurchase.purchaseNo }} — {{ payPurchase.supplierName }}</p>
              
              <div class="bg-rose-50 p-6 rounded-2xl mb-6 text-center border border-rose-100">
                 <div class="text-[10px] font-black text-rose-400 uppercase mb-1 tracking-widest">Outstanding Balance</div>
                 <div class="text-3xl font-black text-rose-600">{{ calc.formatCurrency(getPurchaseDue(payPurchase)) }}</div>
              </div>

              <div class="form-group mb-4">
                 <label class="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block">Payment Amount</label>
                 <input type="number" [(ngModel)]="payAmount" class="form-input text-right font-black text-xl h-14" style="background:#f8fafc; border-radius:12px;" />
              </div>

              <div class="form-group mb-8">
                 <label class="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block">Payment Method</label>
                 <select [(ngModel)]="payMethod" class="form-input h-14" style="background:#f8fafc; border-radius:12px; font-weight:900;">
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Mobile">Mobile Banking</option>
                    <option value="Supplier Credit">Supplier Credit</option>
                 </select>
              </div>

              <div class="flex gap-4">
                 <button class="btn btn-block h-14 font-black" style="background:#f1f5f9; color:#64748b; border-radius:12px;" (click)="showPayModal = false">Cancel</button>
                 <button class="btn btn-primary btn-block h-14 font-black" style="border-radius:12px;" [disabled]="submittingPayment || payAmount <= 0" (click)="submitPayment()">
                    {{ submittingPayment ? 'Processing...' : 'Confirm Payment' }}
                 </button>
              </div>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; }
    .hover-row { transition: all 0.2s; }
    .hover-row:hover { background: #f8fafc; cursor: default; }
    
    .badge-luxury { padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 950; letter-spacing: 0.5px; }
    .badge-luxury.paid { background: rgba(12, 99, 228, 0.1); color: #0c63e4; border: 1px solid rgba(12, 99, 228, 0.2); }
    .badge-luxury.due { background: #fff1f2; color: #f43f5e; border: 1px solid #ffe4e6; }

    .btn-view-luxury { background: #fff; border: 2px solid #e2e8f0; color: #64748b; padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 12px; cursor: pointer; transition: 0.2s; }
    .btn-view-luxury:hover { background: #0c63e4; color: white; border-color: #0c63e4; box-shadow: 0 4px 12px rgba(12, 99, 228, 0.2); }

    .lazz-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #0c63e4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-in { animation: slideUp 0.4s ease-out both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PurchaseHistoryComponent implements OnInit {
  loading = true;
  purchases: any[] = [];
  selectedPurchase: any = null;

  showPayModal = false;
  payPurchase: any = null;
  payAmount = 0;
  payMethod = 'Cash';
  submittingPayment = false;

  constructor(private api: ApiService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases() {
    this.loading = true;
    this.api.get<any[]>('Purchase').subscribe({
      next: (data) => { 
        this.purchases = data.sort((a, b) => b.purchaseId - a.purchaseId); 
        this.loading = false; 
      },
      error: () => { this.loading = false; }
    });
  }

  getPurchasePaid(p: any): number {
    if (!p || !p.payments) return 0;
    return p.payments.reduce((sum: number, pay: any) => sum + (pay.amount || 0), 0);
  }

  getPurchaseDue(p: any): number {
    if (!p) return 0;
    const net = p.netAmount || p.totalAmount || 0;
    return Math.max(0, net - this.getPurchasePaid(p));
  }

  openPayDue(p: any) {
    this.payPurchase = p;
    this.payAmount = this.getPurchaseDue(p);
    this.showPayModal = true;
  }

  submitPayment() {
    if (!this.payPurchase || this.payAmount <= 0) return;
    this.submittingPayment = true;
    const payload = [{ paymentMethod: this.payMethod, amount: this.payAmount, paymentStatus: 'Paid' }];
    
    this.api.post(`Purchase/AddPayment/${this.payPurchase.purchaseId}`, payload).subscribe({
      next: () => {
        this.submittingPayment = false;
        this.showPayModal = false;
        this.loadPurchases();
        alert('Payment recorded successfully!');
      },
      error: (err) => {
        this.submittingPayment = false;
        alert(err.error?.message || 'Failed to record payment');
      }
    });
  }

  previewPurchase(p: any) {
    this.api.get<any>(`Purchase/${p.purchaseId}`).subscribe({
      next: (fullData) => { this.selectedPurchase = fullData; },
      error: () => alert('Failed to load purchase details')
    });
  }
}
