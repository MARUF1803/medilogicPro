import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { BranchService } from '../../core/services/branch.service';
import { CalculationService } from '../../core/services/calculation.service';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="main-container animate-in">
      <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border shadow-sm">
        <div class="flex items-center gap-4">
           <div style="padding: 12px; background: rgba(12, 99, 228, 0.1); border-radius: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0c63e4" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
           </div>
           <div>
              <h1 class="m-0 font-black text-slate-800" style="font-size: 26px; letter-spacing: -1px;">Inventory Stock List</h1>
              <p class="text-[10px] text-muted font-bold uppercase tracking-[2px] mt-1">Dhaka Main Branch | Master Ledger</p>
           </div>
        </div>
        <div class="flex gap-4">
           <input type="text" [(ngModel)]="searchTerm" (input)="filterData()" class="form-input h-14 pl-4 font-bold rounded-xl" placeholder="Search product..." style="width: 300px; border: 2px solid #e2e8f0; color: #0f172a;" />
           <button class="btn btn-primary h-14 px-6 rounded-xl font-black text-sm shadow-lg" (click)="isAddingProduct = true" style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); border: none;">+ New Product</button>
        </div>
      </div>

      @if (loading) {
        <div class="text-center p-20"><div class="spinner mx-auto"></div></div>
      } @else {
        <div class="card p-0 overflow-hidden shadow-xl" style="border-radius: 24px; border: 1px solid #e2e8f0;">
          <table class="data-table">
            <thead>
              <tr class="bg-slate-50">
                <th style="padding: 20px 24px;">Product Name</th>
                <th>Batch Number</th>
                <th>Expiry Date</th>
                <th>Purchase Price</th>
                <th>M.R.P</th>
                <th class="text-center">Stock</th>
                <th class="text-right" style="padding-right: 24px;">Details</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredInventory; track item.batchStockId) {
                <tr class="hover-row border-b border-slate-50">
                  <td style="padding: 18px 24px;">
                      <div class="font-black text-slate-800" style="font-size: 15px;">{{ item.productName || item.product?.productName }}</div>
                      <div class="text-[10px] text-muted font-bold uppercase tracking-wider">{{ item.strength || item.product?.strength }}</div>
                  </td>
                  <td><span class="badge-luxury" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;">{{ item.batchNumber }}</span></td>
                  <td>
                     <div class="font-bold text-slate-700">{{ item.expiryDate | date:'mediumDate' }}</div>
                  </td>
                  <td><div class="font-bold text-slate-700">{{ calc.formatCurrency(item.purchasePrice) }}</div></td>
                  <td><div class="font-black text-[#0c63e4]" style="font-size: 15px;">{{ calc.formatCurrency(item.mrp) }}</div></td>
                  <td class="text-center">
                      <span class="badge-luxury" [class.due]="item.currentBalance <= 0" [class.paid]="item.currentBalance > 0">
                         {{ item.currentBalance }} Units
                      </span>
                  </td>
                  <td class="text-right" style="padding-right: 24px;">
                      <button class="btn-view-luxury" (click)="showDetails(item)">View Detail</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center p-32 text-slate-300 font-black uppercase tracking-[5px]">No stock items found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Add Product Modal -->
      @if (isAddingProduct) {
        <div class="modal-backdrop" (click)="isAddingProduct = false">
          <div class="card animate-in p-8" (click)="$event.stopPropagation()" style="width: 500px; border-radius: 24px;">
            <h2 class="mb-6 font-bold">Register New Master Product</h2>
            <div class="form-group mb-4">
              <label class="form-label">Brand Name</label>
              <input type="text" class="form-input" [(ngModel)]="newProduct.productName" />
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Generic Name</label>
              <input type="text" class="form-input" [(ngModel)]="newProduct.genericName" />
            </div>
            <div class="flex gap-4 mb-6">
              <div class="form-group flex-1">
                <label class="form-label">Default Cost</label>
                <input type="number" class="no-spinner form-input" [(ngModel)]="newProduct.purchasePrice" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Default MRP</label>
                <input type="number" class="no-spinner form-input" [(ngModel)]="newProduct.salePrice" />
              </div>
            </div>
            <button class="btn btn-primary w-full h-14" (click)="submitProduct()" [disabled]="!newProduct.productName || submitting">
              {{ submitting ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </div>
      }

      @if (selectedItem) {
        <app-global-preview-modal 
          [type]="'Inventory'" 
          [data]="selectedItem" 
          (close)="selectedItem = null">
        </app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; padding-top: 20px; padding-bottom: 60px; }
    .hover-row { transition: all 0.2s; }
    .hover-row:hover { background: #f8fafc; cursor: default; }
    
    .badge-luxury { padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 950; letter-spacing: 0.5px; }
    .badge-luxury.paid { background: rgba(12, 99, 228, 0.1); color: #0c63e4; border: 1px solid rgba(12, 99, 228, 0.2); }
    .badge-luxury.due { background: #fff1f2; color: #f43f5e; border: 1px solid #ffe4e6; }

    .btn-view-luxury { background: #fff; border: 2px solid #e2e8f0; color: #64748b; padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 12px; cursor: pointer; transition: 0.2s; }
    .btn-view-luxury:hover { background: #0c63e4; color: white; border-color: #0c63e4; box-shadow: 0 4px 12px rgba(12, 99, 228, 0.2); }

    .no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    .no-spinner { -moz-appearance: textfield; }
    .lazz-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #0c63e4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-in { animation: slideUp 0.4s ease-out both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InventoryComponent implements OnInit {
  inventory: any[] = [];
  filteredInventory: any[] = [];
  loading = true;
  searchTerm = '';
  
  isAddingProduct = false;
  submitting = false;
  newProduct: any = { productName: '', genericName: '', purchasePrice: 0, salePrice: 0 };
  selectedItem: any = null;

  constructor(private api: ApiService, public branch: BranchService, public calc: CalculationService) {}
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.api.get<any[]>('BatchStock').subscribe({
      next: (data) => { 
        this.inventory = data; 
        this.filterData();
        this.loading = false; 
      },
      error: () => { this.loading = false; }
    });
  }

  filterData() {
    if (!this.searchTerm) {
      this.filteredInventory = this.inventory;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredInventory = this.inventory.filter(i => 
        (i.productName || i.product?.productName || '').toLowerCase().includes(term) ||
        (i.batchNumber || '').toLowerCase().includes(term)
      );
    }
  }

  showDetails(item: any) {
    this.selectedItem = item;
  }

  submitProduct() {
    if (!this.newProduct.productName) return;
    this.submitting = true;
    this.api.post('Product', this.newProduct).subscribe({
      next: () => {
        this.submitting = false;
        this.isAddingProduct = false;
        this.newProduct = { productName: '', genericName: '', purchasePrice: 0, salePrice: 0 };
        this.loadData();
      },
      error: () => { this.submitting = false; }
    });
  }
}
