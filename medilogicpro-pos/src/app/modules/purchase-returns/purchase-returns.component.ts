import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PdfService } from '../../core/services/pdf.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../core/services/branch.service';
import { CalculationService } from '../../core/services/calculation.service';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-purchase-returns',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="main-container animate-in" style="padding-top: 20px; padding-bottom: 60px;">
      
      <!-- Luxury Header -->
      <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border shadow-sm">
        <div class="flex items-center gap-4">
           <div style="padding: 12px; background: rgba(244, 63, 94, 0.1); border-radius: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><path d="m15 18-6-6 6-6"/><path d="M3 12h18"/></svg>
           </div>
           <div>
              <h1 class="m-0 font-black text-slate-800" style="font-size: 26px; letter-spacing: -1px;">Purchase Return History</h1>
              <p class="text-[10px] text-muted font-bold uppercase tracking-[2px] mt-1">Registry: Dhaka Main Branch | Credit Log</p>
           </div>
        </div>
        <!-- Button removed as requested -->
        <div class="text-right">
           <span class="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">Return Records</span>
           <span class="text-2xl font-black text-slate-800">{{ returns.length }} Entries</span>
        </div>
      </div>

      @if (loading) {
        <div class="text-center p-32"><div class="lazz-spinner"></div></div>
      } @else {
        <div class="card p-0 overflow-hidden shadow-xl" style="border-radius: 24px; border: 1px solid #e2e8f0;">
          <table class="data-table">
            <thead>
              <tr class="bg-slate-50">
                <th style="padding: 20px 24px;">Return No</th>
                <th>Date</th>
                <th>Supplier Name</th>
                <th class="text-right">Refund Amount</th>
                <th class="text-right" style="padding-right: 24px;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (ret of returns; track ret.purchaseReturnId) {
                <tr class="hover-row border-b border-slate-50">
                  <td style="padding: 18px 24px;">
                     <span class="font-black text-rose-600" style="font-size: 15px;">{{ ret.returnNo || 'PR-'+ret.purchaseReturnId }}</span>
                  </td>
                  <td>
                     <div class="font-bold text-slate-700">{{ ret.returnDate | date:'mediumDate' }}</div>
                     <div class="text-[10px] text-muted font-bold">{{ ret.returnDate | date:'shortTime' }}</div>
                  </td>
                  <td>
                     <div class="font-black text-slate-800">{{ ret.supplier?.fullName || ret.supplierName || 'Registry N/A' }}</div>
                     <div class="text-[10px] text-muted font-bold uppercase">Procurement Return</div>
                  </td>
                  <td class="text-right">
                     <div class="font-black text-rose-700" style="font-size: 16px;">{{ calc.formatCurrency(ret.totalReturnAmount) }}</div>
                  </td>
                  <td class="text-right" style="padding-right: 24px;">
                      <button class="btn-view-luxury" (click)="previewReturn(ret)">
                        View Breakdown
                      </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center p-32 text-slate-300 font-black uppercase tracking-[5px]">No procurement returns found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (selectedReturn) {
        <app-global-preview-modal 
          [type]="'PurchaseReturn'" 
          [data]="selectedReturn" 
          (close)="selectedReturn = null">
        </app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; }
    .hover-row { transition: all 0.2s; }
    .hover-row:hover { background: #fff1f2; cursor: default; }
    
    .btn-view-luxury { background: #fff; border: 2px solid #e2e8f0; color: #64748b; padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 12px; cursor: pointer; transition: 0.2s; }
    .btn-view-luxury:hover { background: #f43f5e; color: white; border-color: #f43f5e; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2); }

    .lazz-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #f43f5e; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-in { animation: slideUp 0.4s ease-out both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PurchaseReturnsComponent implements OnInit {
  loading = true;
  returns: any[] = [];
  selectedReturn: any = null;

  constructor(private api: ApiService, public branch: BranchService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns() {
    this.loading = true;
    this.api.get<any[]>('PurchaseReturn').subscribe({
      next: (data) => { 
        this.returns = data.sort((a, b) => b.purchaseReturnId - a.purchaseReturnId); 
        this.loading = false; 
      },
      error: () => { this.returns = []; this.loading = false; }
    });
  }

  previewReturn(ret: any) {
    this.api.get<any>(`PurchaseReturn/${ret.purchaseReturnId}`).subscribe({
      next: (res) => { this.selectedReturn = res; },
      error: () => alert('Failed to load return details')
    });
  }
}
