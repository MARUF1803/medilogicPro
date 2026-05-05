import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CalculationService } from '../../core/services/calculation.service';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="main-container animate-in">
      <div class="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl border shadow-sm">
        <h1 class="m-0 font-bold text-slate-800" style="font-size: 24px;">Sales History</h1>
        <div class="text-right">
           <span class="text-xs font-bold text-muted uppercase tracking-wider">Store Audit Logs</span>
        </div>
      </div>

      @if (loading) {
        <div class="text-center p-20"><div class="spinner mx-auto"></div></div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th style="padding-left: 24px;">Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th class="text-right">Net Amount</th>
                <th class="text-right">Paid</th>
                <th class="text-center">Balance</th>
                <th class="text-right" style="padding-right: 24px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (sale of sales; track sale.salesId) {
                <tr class="hover-row">
                  <td style="padding-left: 24px;">
                     <span class="font-bold text-primary">{{ sale.invoiceNo || 'INV-'+sale.salesId }}</span>
                  </td>
                  <td>{{ sale.salesDate | date:'mediumDate' }}</td>
                  <td>
                    <div class="font-bold">{{ sale.party?.fullName || 'Walk-In Customer' }}</div>
                    <div class="text-xs text-muted">{{ sale.party?.phoneNumber || 'Retail' }}</div>
                  </td>
                  <td class="text-right font-bold">{{ calc.formatCurrency(sale.netAmount) }}</td>
                  <td class="text-right text-success font-bold">{{ calc.formatCurrency(getSalePaid(sale)) }}</td>
                  <td class="text-center">
                    @if (getSaleDue(sale) > 0) {
                      <span class="badge bg-danger-light text-danger font-bold">{{ calc.formatCurrency(getSaleDue(sale)) }}</span>
                    } @else {
                      <span class="badge bg-success-light text-success font-bold">PAID ✓</span>
                    }
                  </td>
                  <td class="text-right" style="padding-right: 24px;">
                    <div class="flex gap-2 justify-end">
                      @if (getSaleDue(sale) > 0 && !isWalkIn(sale)) {
                        <button class="btn btn-sm btn-primary" (click)="openCollectDue(sale); $event.stopPropagation()">Collect</button>
                      }
                      <button class="btn btn-sm btn-ghost" (click)="previewSale(sale); $event.stopPropagation()">Details</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center p-20 text-muted">No sales records found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (selectedSale) {
        <app-global-preview-modal 
          [type]="'Sale'" 
          [data]="selectedSale" 
          (close)="selectedSale = null">
        </app-global-preview-modal>
      }

      @if (showCollectModal && collectSale) {
        <div class="modal-backdrop" (click)="showCollectModal = false">
          <div class="card animate-in p-8" (click)="$event.stopPropagation()" style="width: 450px;">
            <h3 class="mb-4 font-bold">Collect Due Amount</h3>
            <p class="text-sm text-muted mb-6">{{ collectSale.invoiceNo }} — {{ collectSale.party?.fullName }}</p>
            
            <div class="bg-danger-light p-6 rounded-xl mb-6 text-center">
              <div class="text-xs font-bold text-danger uppercase mb-1">Total Due</div>
              <div class="text-3xl font-black text-danger">{{ calc.formatCurrency(getSaleDue(collectSale)) }}</div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Payment Amount</label>
              <input type="number" [(ngModel)]="collectAmount" class="form-input text-right font-bold text-xl" />
            </div>

            <div class="form-group mb-6">
              <label class="form-label">Method</label>
              <select [(ngModel)]="collectMethod" class="form-input">
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Mobile">Mobile Banking</option>
              </select>
            </div>

            <div class="flex gap-4">
              <button class="btn btn-primary flex-1 h-12" (click)="submitCollection()" [disabled]="collectAmount <= 0 || submittingCollection">
                {{ submittingCollection ? 'Saving...' : 'Collect Payment' }}
              </button>
              <button class="btn btn-ghost" (click)="showCollectModal = false">Cancel</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1300px; margin: 0 auto; padding-top: 20px; }
    .bg-danger-light { background: #fee2e2 !important; }
    .bg-success-light { background: #dcfce7 !important; }
    .hover-row:hover { background: #f8fafc; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class SalesHistoryComponent implements OnInit {
  sales: any[] = [];
  loading = true;
  selectedSale: any = null;

  showCollectModal = false;
  collectSale: any = null;
  collectAmount = 0;
  collectMethod = 'Cash';
  submittingCollection = false;

  constructor(private api: ApiService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  isWalkIn(sale: any): boolean {
    const name = (sale.party?.fullName || '').toLowerCase();
    return !sale.partyId || name.includes('walking');
  }

  loadSales() {
    this.loading = true;
    this.api.get<any[]>('SalesHistory').subscribe({
      next: (data) => {
        this.sales = data.sort((a, b) => b.salesId - a.salesId);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getSalePaid(sale: any): number {
    if (!sale || !sale.salesPayments) return 0;
    return sale.salesPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  }

  getSaleDue(sale: any): number {
    if (!sale) return 0;
    return Math.max(0, (sale.netAmount || 0) - this.getSalePaid(sale));
  }

  previewSale(sale: any) {
    this.selectedSale = sale;
  }

  openCollectDue(sale: any) {
    this.collectSale = sale;
    this.collectAmount = this.getSaleDue(sale);
    this.showCollectModal = true;
  }

  submitCollection() {
    if (!this.collectSale || this.collectAmount <= 0) return;
    this.submittingCollection = true;
    const payload = [{ paymentMethod: this.collectMethod, amount: this.collectAmount, paymentStatus: 'Paid' }];
    this.api.post(`SalesHistory/AddPayment/${this.collectSale.salesId}`, payload).subscribe({
      next: () => {
        this.submittingCollection = false;
        this.showCollectModal = false;
        this.loadSales();
      },
      error: () => { this.submittingCollection = false; }
    });
  }
}
