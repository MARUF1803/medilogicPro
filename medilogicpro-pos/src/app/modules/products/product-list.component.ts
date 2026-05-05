import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { BranchService } from '../../core/services/branch.service';
import { CalculationService } from '../../core/services/calculation.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-in main-container" style="padding-bottom: 60px;">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-5">
           <div style="padding: 16px; background: rgba(14, 165, 233, 0.1); border-radius: 20px; border: 1px solid rgba(14, 165, 233, 0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
           </div>
           <div>
              <h1 class="m-0" style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #0f172a;">Medicine Master Registry</h1>
              <p style="color: #64748b; font-weight: 600; font-size: 13px; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">Manage global SKU database & Pharmaceutical catalog</p>
           </div>
        </div>
        <button class="btn btn-primary" (click)="isAdding = true" style="height: 52px; padding: 0 24px; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 20px -5px rgba(14, 165, 233, 0.4);">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
           Enroll New Medicine
        </button>
      </div>

      <!-- Product List Card -->
      <div class="card p-0 overflow-hidden shadow-premium border border-slate-100" style="border-radius: 28px; background: white;">
        <table class="data-table">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding-left: 32px;">Medication / Brand</th>
              <th>Scientific Formulation</th>
              <th>Base Valuation</th>
              <th>Market Price (MRP)</th>
              <th style="padding-right: 32px; text-align: right;">Protocol</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr><td colspan="5" class="text-center p-20"><div class="spinner mx-auto"></div></td></tr>
            } @else {
              @for (p of products; track p.productId; let idx = $index) {
                <tr class="hover-row animate-in" (click)="viewDetails(p)" style="animation-delay: {{ idx * 0.02 }}s">
                  <td style="padding-left: 32px;">
                    <div style="font-size: 16px; font-weight: 900; color: #0f172a;">{{ p.productName }}</div>
                    <div style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">{{ p.strength || 'Standard Dosage' }}</div>
                  </td>
                  <td>
                    <span style="padding: 6px 12px; background: #f1f5f9; color: #475569; border-radius: 10px; font-size: 12px; font-weight: 800;">{{ p.genericName || '—' }}</span>
                  </td>
                  <td style="font-weight: 700; color: #64748b;">{{ calc.formatCurrency(p.purchasePrice) }}</td>
                  <td style="font-size: 17px; font-weight: 950; color: var(--primary);">{{ calc.formatCurrency(p.salePrice) }}</td>
                  <td style="padding-right: 32px; text-align: right;">
                    <button class="btn-action" (click)="$event.stopPropagation(); editProduct(p)">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center p-20 text-slate-400 font-bold uppercase tracking-widest">No medicine records discovered.</td></tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Add Product Modal -->
      @if (isAdding) {
        <div class="modal-backdrop" (click)="isAdding = false">
          <div class="modal-content animate-in" (click)="$event.stopPropagation()" style="width: 520px; border-radius: 32px; background: white; border: none; box-shadow: var(--shadow-premium);">
            <div style="padding: 32px 40px; border-bottom: 1.5px solid #f1f5f9;">
               <div class="flex justify-between items-center">
                  <h2 style="font-size: 24px; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -0.5px;">Master Enrollment</h2>
                  <button class="btn-close" (click)="isAdding = false">&times;</button>
               </div>
            </div>

            <div style="padding: 40px;">
               <div class="form-group mb-6">
                 <label style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block;">Brand / Trade Name</label>
                 <input type="text" class="form-input-lg" [(ngModel)]="newProduct.productName" placeholder="e.g. Napa Extra 500mg" />
               </div>
               <div class="form-group mb-6">
                 <label style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block;">Generic / Molecule</label>
                 <input type="text" class="form-input-lg" [(ngModel)]="newProduct.genericName" placeholder="e.g. Paracetamol" />
               </div>
               <div class="form-group mb-6">
                 <label style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block;">Strength / Dosage</label>
                 <input type="text" class="form-input-lg" [(ngModel)]="newProduct.strength" placeholder="e.g. 500mg or 5ml" />
               </div>
               <div class="flex gap-6 mb-10">
                 <div class="form-group flex-1">
                   <label style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block;">Est. Cost</label>
                   <input type="number" class="form-input-lg" [(ngModel)]="newProduct.purchasePrice" />
                 </div>
                 <div class="form-group flex-1">
                   <label style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block;">Selling Price</label>
                   <input type="number" class="form-input-lg" [(ngModel)]="newProduct.salePrice" />
                 </div>
               </div>
               
               <button class="btn btn-primary w-full" style="height: 64px; border-radius: 20px; font-size: 18px; font-weight: 900;" [disabled]="!newProduct.productName || newProduct.salePrice <= 0 || submitting" (click)="saveProduct()">
                 @if (submitting) { <div class="spinner border-white" style="width: 24px; height: 24px;"></div> } @else { Commit Record }
               </button>
            </div>
          </div>
        </div>
      }

      <!-- Details Modal -->
      @if (selectedProduct) {
        <div class="modal-backdrop" (click)="selectedProduct = null">
          <div class="modal-content animate-in shadow-premium" (click)="$event.stopPropagation()" style="width: 900px; border-radius: 36px; background: white; overflow: hidden; border: none;">
             
             <!-- Premium Header -->
             <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 50px; color: #fff;">
                <div class="flex justify-between items-start">
                   <div class="flex items-center gap-6">
                      <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15);">
                         <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><path d="m10.5 22a7 7 0 1 1 7-7"/><path d="M14 15.51 20 9.5"/><path d="m9 9 3 3"/><path d="m19 6.41 1.45-1.45a.71.71 0 0 0 0-1l-10.9-10.9a.71.71 0 0 0-1 0L7 4.5"/><path d="M12.93 15.32 8.35 19.9a.71.71 0 0 1-1 0L4.7 17.25a.71.71 0 0 1 0-1l4.58-4.58"/></svg>
                      </div>
                      <div>
                         <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; opacity: 0.6; margin-bottom: 6px;">Product Specifications</div>
                         <h2 style="font-size: 32px; font-weight: 950; color: #fff; margin: 0; letter-spacing: -1px;">{{ selectedProduct.productName }}</h2>
                         <div style="font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.7); margin-top: 4px;">{{ selectedProduct.genericName }} • {{ selectedProduct.strength }}</div>
                      </div>
                   </div>
                   <button class="btn-close" style="background: rgba(255,255,255,0.1); color: #fff;" (click)="selectedProduct = null">&times;</button>
                </div>
             </div>

             <div style="padding: 50px;">
                <!-- Key Stats -->
                <div class="grid grid-cols-3 gap-8 mb-12">
                   <div class="p-6" style="background: rgba(14, 165, 233, 0.05); border-radius: 24px; border: 1px solid rgba(14, 165, 233, 0.1);">
                      <div style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Active Aggregate Stock</div>
                      <div style="font-size: 32px; font-weight: 950; color: var(--primary);">{{ detailsLoading ? '...' : totalStock }} <span style="font-size: 14px; opacity: 0.5;">UNITS</span></div>
                   </div>
                   <div class="p-6" style="background: #f8fafc; border-radius: 24px; border: 1px solid #e2e8f0;">
                      <div style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Standardized Cost</div>
                      <div style="font-size: 28px; font-weight: 900; color: #0f172a;">{{ calc.formatCurrency(selectedProduct.purchasePrice) }}</div>
                   </div>
                   <div class="p-6" style="background: rgba(16, 185, 129, 0.05); border-radius: 24px; border: 1px solid rgba(16, 185, 129, 0.1);">
                      <div style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Retail Ceiling (MRP)</div>
                      <div style="font-size: 28px; font-weight: 950; color: #10b981;">{{ calc.formatCurrency(selectedProduct.salePrice) }}</div>
                   </div>
                </div>

                <div class="flex items-center gap-3 mb-6">
                   <div style="width: 8px; height: 24px; background: var(--primary); border-radius: 4px;"></div>
                   <h3 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0;">Batch Distribution Audit</h3>
                </div>

                <div class="card p-0 overflow-hidden border border-slate-100" style="border-radius: 20px;">
                   <table class="data-table">
                      <thead>
                         <tr style="background: #f8fafc;">
                            <th style="padding-left: 24px;">Lot / Batch Identifier</th>
                            <th class="text-center">Expiration Matrix</th>
                            <th class="text-center">On-Hand Inventory</th>
                            <th style="padding-right: 24px; text-align: right;">Unit Value</th>
                         </tr>
                      </thead>
                      <tbody>
                         @if (detailsLoading) {
                            <tr><td colspan="4" class="text-center p-12"><div class="spinner mx-auto"></div></td></tr>
                         } @else {
                            @for (b of batches; track b.batchNumber; let bIdx = $index) {
                               <tr class="animate-in" style="animation-delay: {{ bIdx * 0.05 }}s">
                                  <td style="padding-left: 24px;"><span style="font-weight: 800; font-family: monospace; color: #475569;">#{{ b.batchNumber }}</span></td>
                                  <td class="text-center"><span style="font-weight: 800; color: #ef4444; background: #fff1f2; padding: 4px 10px; border-radius: 8px; font-size: 12px;">{{ b.expiryDate | date:'mediumDate' }}</span></td>
                                  <td class="text-center"><span style="font-weight: 950; color: #0f172a; font-size: 16px;">{{ b.currentBalance }}</span></td>
                                  <td style="padding-right: 24px; text-align: right; font-weight: 900; color: var(--primary);">{{ calc.formatCurrency(b.mrp) }}</td>
                               </tr>
                            } @empty {
                               <tr><td colspan="4" class="text-center p-12 text-slate-400 font-bold uppercase tracking-widest" style="font-size: 11px;">No active batches detected in local repository.</td></tr>
                            }
                         }
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; }
    .hover-row { cursor: pointer; transition: all 0.2s; border-bottom: 1.5px solid #f1f5f9; }
    .hover-row:hover { background: #f8fafc !important; transform: scale(1.002); }
    .btn-action { width: 44px; height: 44px; border-radius: 12px; border: none; background: #f8fafc; color: #64748b; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .hover-row:hover .btn-action { background: white; color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .spinner { width: 40px; height: 40px; border: 4px solid rgba(14, 165, 233, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
    .form-input-lg { width: 100%; height: 56px; border-radius: 16px; border: 2px solid #f1f5f9; background: #f8fafc; padding: 0 20px; font-size: 16px; font-weight: 800; outline: none; transition: all 0.2s; }
    .form-input-lg:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
    .btn-close { width: 40px; height: 40px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; font-size: 24px; font-weight: 300; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .animate-in { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .data-table th { padding: 24px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900; color: #64748b; }
  `]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  isAdding = false;
  submitting = false;
  newProduct = { productName: '', genericName: '', strength: '', purchasePrice: 0, salePrice: 0 };

  // Details
  selectedProduct: any = null;
  batches: any[] = [];
  detailsLoading = false;
  totalStock = 0;

  constructor(
    private api: ApiService,
    public branch: BranchService,
    public calc: CalculationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.api.get<any[]>('Product').subscribe({
      next: (data) => { this.products = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  saveProduct() {
    if (!this.newProduct.productName) return;
    this.submitting = true;
    this.api.post('Product', this.newProduct).subscribe({
      next: () => {
        this.submitting = false;
        this.isAdding = false;
        this.newProduct = { productName: '', genericName: '', strength: '', purchasePrice: 0, salePrice: 0 };
        this.loadProducts();
      },
      error: () => { this.submitting = false; alert('Error saving product'); }
    });
  }

  viewDetails(product: any) {
    this.selectedProduct = product;
    this.detailsLoading = true;
    this.batches = [];
    this.totalStock = 0;
    
    this.api.get<any[]>(`BatchStock/GetProductBatches/${product.productId}/${this.branch.activeBranchId()}`).subscribe({
      next: (data) => {
        this.batches = data;
        this.totalStock = data.reduce((sum, b) => sum + b.currentBalance, 0);
        this.detailsLoading = false;
      },
      error: () => { this.detailsLoading = false; }
    });
  }

  editProduct(product: any) {
    alert('Refinement Mode: Master data edits should be performed via the Administration Console.');
  }
}
