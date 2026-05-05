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
  selector: 'app-sales-returns',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="main-container animate-in">
      <div class="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl border shadow-sm">
        <h1 class="m-0 font-bold text-slate-800" style="font-size: 24px;">Sales Return History</h1>
        <button class="btn btn-primary" routerLink="/sales-return-create">+ New Return</button>
      </div>

      @if (loading) {
        <div class="text-center p-20"><div class="spinner mx-auto"></div></div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th style="padding-left: 24px;">Return No</th>
                <th>Date</th>
                <th>Original Invoice</th>
                <th>Customer Name</th>
                <th class="text-right">Refund Amount</th>
                <th class="text-right" style="padding-right: 24px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ret of returns; track ret.salesReturnId) {
                <tr class="hover-row">
                  <td style="padding-left: 24px;">
                     <span class="font-bold text-danger">{{ ret.returnNo || 'SR-'+ret.salesReturnId }}</span>
                  </td>
                  <td>{{ ret.returnDate | date:'mediumDate' }}</td>
                  <td>#{{ ret.invoiceNo }}</td>
                  <td>{{ ret.customerName || 'Walk-in' }}</td>
                  <td class="text-right font-bold text-danger">{{ calc.formatCurrency(ret.totalReturnAmount) }}</td>
                  <td class="text-right" style="padding-right: 24px;">
                      <button class="btn btn-sm btn-ghost" (click)="previewReturn(ret)">View Details</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center p-20 text-muted">No sales returns found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (selectedReturn) {
        <app-global-preview-modal 
          [type]="'SalesReturn'" 
          [data]="selectedReturn" 
          (close)="selectedReturn = null">
        </app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1200px; margin: 0 auto; padding-top: 20px; }
    .hover-row:hover { background: #f8fafc; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class SalesReturnsComponent implements OnInit {
  loading = true;
  returns: any[] = [];
  selectedReturn: any = null;

  constructor(private api: ApiService, public branch: BranchService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns() {
    this.loading = true;
    this.api.get<any[]>('SalesHistory/GetAllReturns').subscribe({
      next: (data) => { 
        this.returns = data.sort((a, b) => b.salesReturnId - a.salesReturnId); 
        this.loading = false; 
      },
      error: () => { this.returns = []; this.loading = false; }
    });
  }

  previewReturn(ret: any) {
    const id = ret.salesReturnId || ret.id;
    this.api.get<any>(`SalesHistory/GetReturn/${id}`).subscribe({
      next: (fullRet) => { this.selectedReturn = fullRet; },
      error: () => alert('Failed to load return details')
    });
  }
}
