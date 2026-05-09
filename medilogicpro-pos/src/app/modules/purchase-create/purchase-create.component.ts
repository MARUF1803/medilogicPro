import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BranchService } from '../../core/services/branch.service';
import { CalculationService } from '../../core/services/calculation.service';
import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-purchase-create',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="pos-wrapper animate-in">
      
      <!-- Premium POS Header style applied to Purchase -->
      <div class="pos-header">
        <div class="header-left">
          <div class="header-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><path d="M3 10h18"/></svg>
          </div>
          <div class="header-info">
            <h1 class="header-title">New Purchase Entry</h1>
            <div class="header-meta">
              <span class="branch-tag">{{ branchService.activeBranch()?.branchName || 'Main Branch' }}</span>
              <span class="system-status">Procurement Registry</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <input type="date" [(ngModel)]="purchaseDate" class="table-cell-input" style="width: 160px; height: 40px; margin-right: 16px;" />
          <button class="btn-clear" (click)="resetCart()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset
          </button>
        </div>
      </div>

      <div class="pos-layout">
        <!-- Left Column: Search & Cart -->
        <div class="pos-left-panel">
          
          <div class="search-section">
            <div class="search-bar-container">
              <div class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input #searchInput type="text" class="main-search-input" placeholder="Search medicine to add..." (input)="onSearchInput($event)" />
            </div>
            
            @if (searchResults.length > 0) {
              <div class="search-results-dropdown shadow-2xl">
                @for (p of searchResults; track p.productId) {
                  <div class="search-result-item" (click)="addToCart(p)">
                    <div class="item-name-group">
                        <div class="item-primary-name">{{ p.productName }}</div>
                        <div class="item-sub-name">{{ p.strength }} | MRP: {{ calc.formatCurrency(p.mrp) }}</div>
                    </div>
                    <div class="item-price-group">
                        <div class="item-price" style="font-size: 14px;">Cost: {{ calc.formatCurrency(p.costPrice || 0) }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="cart-container shadow-lg">
            <table class="luxury-pos-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Batch/Expiry</th>
                  <th class="text-center">Cost</th>
                  <th class="text-center">MRP</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Total</th>
                  <th style="width: 40px;"></th>
                </tr>
              </thead>
              <tbody>
                @for (item of cart; track item.productId) {
                  <tr class="cart-row-animate">
                    <td>
                        <div class="cart-item-name">{{ item.productName }}</div>
                        <div class="cart-item-code">ID: {{ item.productId }}</div>
                    </td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 8px; padding-right: 5px;">
                        <input type="text" [(ngModel)]="item.batchNo" placeholder="BATCH NO" class="table-cell-input" style="width: 100px; height: 35px; font-size: 11px; text-transform: uppercase;" />
                        <input type="date" [(ngModel)]="item.expiryDate" class="table-cell-input" style="width: 110px; height: 35px; font-size: 11px;" />
                      </div>
                    </td>
                    <td>
                        <div class="table-input-wrapper">
                            <span class="table-input-label">COST</span>
                            <input type="number" [(ngModel)]="item.costPrice" (ngModelChange)="updateItem(item)" (wheel)="$event.preventDefault()" class="no-spinner table-cell-input" style="width: 65px;" />
                        </div>
                    </td>
                    <td>
                        <div class="table-input-wrapper">
                            <span class="table-input-label">M.R.P</span>
                            <input type="number" [(ngModel)]="item.mrp" (wheel)="$event.preventDefault()" class="no-spinner table-cell-input" style="width: 65px;" />
                        </div>
                    </td>
                    <td>
                        <div class="table-input-wrapper">
                            <span class="table-input-label">QTY</span>
                            <input type="number" [(ngModel)]="item.quantity" (ngModelChange)="updateItem(item)" (wheel)="$event.preventDefault()" class="no-spinner table-cell-input qty-active" style="width: 65px;" />
                        </div>
                    </td>
                    <td class="text-right" style="padding-right: 15px;">
                        <div style="display: flex; flex-direction: column; align-items: flex-end;">
                           <div style="font-size: 8px; font-weight: 950; color: #94a3b8; text-transform: uppercase;">Subtotal</div>
                           <div class="cart-item-total" style="font-size: 18px; color: #0f172a;">
                              <span style="color: #0ea5e9; font-size: 12px; margin-right: 2px;">Tk</span>{{ item.total.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                           </div>
                        </div>
                    </td>
                    <td class="text-center">
                        <button class="btn-remove-item" (click)="removeItem(item.productId)">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </td>
                  </tr>
                } @empty {
                   <tr>
                     <td colspan="7" class="empty-cart-state">
                        <div class="empty-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        </div>
                        <div class="empty-text">NO ACTIVE PROCUREMENT</div>
                     </td>
                   </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column: Checkout Sidebar (Lazz Luxury) -->
        <div class="pos-right-panel">
          
          <!-- Supplier Selection Card -->
          <div class="customer-section-card shadow-sm">
            <div class="section-header">
              <h3 class="section-title">Supplier Selection</h3>
              @if (selectedParty) {
                <button class="btn-text-only" (click)="selectedParty = null">Change</button>
              }
            </div>
            
            @if (!selectedParty) {
              <div class="customer-search-row">
                <div class="search-input-wrapper">
                  <input #partyInput type="text" class="customer-search-input" placeholder="Search supplier profile..." (input)="onPartySearch($event)" />
                  @if (partyResults.length > 0) {
                    <div class="customer-results-dropdown shadow-xl">
                      @for (p of partyResults; track p.partyId) {
                        <div class="customer-result-item" (click)="selectParty(p)">
                           <div class="cust-name">{{ p.fullName }}</div>
                           <div class="cust-phone">{{ p.phoneNumber }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
                <button class="btn-add-circle" (click)="showSupplierAdd = true">+</button>
              </div>
              <div style="margin-top: 15px; font-size: 11px; font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
                 <span>WALKING SUPPLIER MODE</span>
                 <span (click)="setWalkingSupplier()" style="color: #0ea5e9; cursor: pointer; text-decoration: underline; font-weight: 950;">SET PROFILE</span>
              </div>
            } @else {
              <div class="selected-customer-pill animate-in">
                 <div class="cust-info">
                    <div class="cust-name-large">{{ selectedParty.fullName }}</div>
                    <div class="cust-phone-sub">{{ selectedParty.phoneNumber }}</div>
                 </div>
                 <div class="cust-balance">
                    <div class="balance-label">Current Due</div>
                    <div class="balance-value">{{ calc.formatCurrency(selectedParty.currentBalance || 0) }}</div>
                 </div>
              </div>
            }
          </div>

          <!-- Add this new card for supplier change if needed -->
          <div *ngIf="changeAmount > 0" class="customer-section-card shadow-sm animate-in" style="background: #10b981; border: none;">
             <div class="flex justify-between items-center">
                <div>
                   <div style="font-size: 10px; font-weight: 950; color: rgba(255,255,255,0.7); text-transform: uppercase;">Change to Receive</div>
                   <div style="font-size: 24px; font-weight: 950; color: #fff;">{{ calc.formatCurrency(changeAmount) }}</div>
                </div>
                <div style="color: #fff; opacity: 0.8;">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m7 19 5 3 5-3"/><path d="M2 12h20"/><path d="m5 7-3 5 3 5"/><path d="m19 17 3-5-3-5"/></svg>
                </div>
             </div>
          </div>

          <!-- Master Checkout Panel (Black Luxury) -->
          <div class="checkout-panel shadow-2xl">
            
            <div class="summary-section">
                <div class="summary-row">
                   <span class="sum-label">Subtotal</span>
                   <span class="sum-value">Tk {{ totalAmount.toFixed(2) }}</span>
                </div>
                
                <div class="discount-row">
                   <span class="sum-label">Total Discount</span>
                   <div class="discount-controls">
                      <select [(ngModel)]="discountType" (ngModelChange)="updateItem()" class="discount-type-select">
                         <option value="fixed">Tk</option>
                         <option value="percent">%</option>
                      </select>
                      <input type="number" [(ngModel)]="discountValue" (ngModelChange)="updateItem()" (wheel)="$event.preventDefault()" class="no-spinner discount-value-input" />
                   </div>
                </div>
                
                <div class="divider-line"></div>
                <div class="net-bill-box">
                  <div class="net-label">NET PAYABLE AMOUNT</div>
                  <div class="net-value">{{ calc.formatCurrency(netAmount) }}</div>
               </div>
               
               <div class="divider-line"></div>
            </div>

            <!-- Payment Registry -->
            <div class="payment-section">
               <div class="section-header-row">
                  <label class="section-label-tiny">Payment Breakdown</label>
                  <button class="btn-add-payment" (click)="addPaymentField()">+ Split Payment</button>
               </div>
               
               <div class="payments-list">
                 @for (p of payments; track $index) {
                   <div class="payment-item-row animate-in">
                        <div class="method-input-group">
                            <div class="method-icon-overlay">
                               <svg *ngIf="p.method === 'Cash'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                               <svg *ngIf="p.method !== 'Cash'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            </div>
                            <select [(ngModel)]="p.method" class="method-dropdown-lazz">
                               <option value="Cash">CASH</option>
                               <option value="Card">CARD</option>
                               <option value="Mobile">MOBILE</option>
                               <option value="Bank">BANK</option>
                            </select>
                        </div>
                        <input type="number" [(ngModel)]="p.amount" (ngModelChange)="updateItem()" (wheel)="$event.preventDefault()" class="no-spinner payment-amount-field" />
                        @if (payments.length > 1) {
                           <button class="btn-del-payment" (click)="removePayment($index)">&times;</button>
                        }
                   </div>
                 }
               </div>
            </div>

            <!-- Reconciliation Box -->
            <div class="reconciliation-box">
               <div *ngIf="remainingBalance > 0" class="recon-due-alert animate-in">
                  <div class="flex justify-between items-center">
                     <span class="due-label">Remaining Balance</span>
                     <span class="due-value">{{ calc.formatCurrency(remainingBalance) }}</span>
                  </div>
               </div>
               
               <div *ngIf="changeAmount > 0" class="recon-due-alert animate-in" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2);">
                  <div class="flex justify-between items-center">
                     <span class="due-label" style="color: #d1fae5;">Change to Receive</span>
                     <span class="due-value" style="color: #10b981;">{{ calc.formatCurrency(changeAmount) }}</span>
                  </div>
               </div>
               
               <div *ngIf="remainingBalance <= 0 && cart.length > 0" class="recon-row" style="margin-top: 15px;">
                  <span class="recon-label" style="color: #10b981;">Status</span>
                  <span class="recon-value-success" style="font-size: 20px;">FULLY PAID</span>
               </div>
            </div>

            <button class="btn-finalize-ocean" [disabled]="cart.length === 0 || !selectedParty || submitting" (click)="submitPurchase()">
              @if (submitting) { <div class="lazz-spinner"></div> } 
              @else { 
                <span class="btn-inner">
                  Confirm & Save Purchase 
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17 4 12"/></svg>
                </span> 
              }
            </button>
          </div>
        </div>
      </div>

      <!-- New Supplier Modal (Fixed Overlay) -->
      @if (showSupplierAdd) {
        <div class="modal-overlay-lazz" (click)="showSupplierAdd = false">
           <div class="modal-body-lazz animate-in" (click)="$event.stopPropagation()">
              <div class="modal-header-lazz">
                <h3 class="modal-title-lazz">Register New Supplier</h3>
                <button class="btn-close-modal-lazz" (click)="showSupplierAdd = false">&times;</button>
              </div>
              <div class="modal-inputs-lazz">
                <div class="lazz-field">
                   <label>SUPPLIER NAME</label>
                   <input type="text" [(ngModel)]="newSupplier.fullName" placeholder="Enter name..." />
                </div>
                <div class="lazz-field">
                   <label>CONTACT NUMBER</label>
                   <input type="text" [(ngModel)]="newSupplier.phoneNumber" placeholder="Enter phone..." />
                </div>
              </div>
              <button class="btn-submit-lazz" (click)="saveSupplier()">
                 Create Profile & Auto-Select
              </button>
           </div>
        </div>
      }

      @if (showSuccessModal && lastPurchaseData) {
        <app-global-preview-modal type="Purchase" [data]="lastPurchaseData" (close)="onModalClose()"></app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .pos-wrapper { max-width: 100%; width: 100%; margin: 0 auto; padding: 15px 24px; font-family: 'Inter', sans-serif; background: transparent; min-height: 98vh; box-sizing: border-box; overflow-x: hidden; }
    
    /* HEADER */
    .pos-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 24px 32px; border-radius: 32px; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 24px; }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .header-logo { padding: 12px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 18px; box-shadow: 0 8px 16px -4px rgba(14, 165, 233, 0.3); }
    .header-title { font-size: 26px; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -1px; }
    .header-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
    .branch-tag { padding: 3px 10px; background: #f0f9ff; color: #0ea5e9; border-radius: 8px; font-weight: 900; font-size: 11px; text-transform: uppercase; }
    .system-status { font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px; }
    .header-right { display: flex; align-items: center; }
    .btn-clear { display: flex; align-items: center; gap: 8px; background: #fff1f2; color: #e11d48; border: none; padding: 10px 20px; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; }

    /* LAYOUT */
    .pos-layout { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
    .pos-left-panel { flex: 1 1 500px; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
    .pos-right-panel { flex: 0 0 400px; max-width: 100%; position: sticky; top: 15px; }

    /* SEARCH SECTION */
    .search-section { position: relative; z-index: 500; }
    .search-bar-container { background: #fff; border: 3px solid #f1f5f9; border-radius: 24px; display: flex; align-items: center; padding: 0 28px; height: 75px; transition: all 0.3s; }
    .search-bar-container:focus-within { border-color: #0ea5e9; box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.12); }
    .main-search-input { width: 100%; border: none; outline: none; font-size: 22px; font-weight: 800; color: #0f172a; padding-left: 15px; background: transparent; }
    .search-results-dropdown { position: absolute; top: calc(100% + 12px); left: 0; width: 100%; background: #fff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; z-index: 1000; }
    .search-result-item { padding: 20px 28px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc; transition: all 0.2s; }
    .search-result-item:hover { background: #f0f9ff; padding-left: 35px; }
    .item-primary-name { font-size: 19px; font-weight: 950; color: #0f172a; }
    .item-sub-name { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-top: 3px; }
    .item-price { font-size: 20px; font-weight: 950; color: #0ea5e9; }

    /* CART TABLE */
    .cart-container { background: #fff; border-radius: 32px; overflow-x: auto; min-height: 550px; }
    .luxury-pos-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 100%; }
    .luxury-pos-table th { background: #f8fafc; padding: 14px 8px; font-weight: 950; text-transform: uppercase; font-size: 11px; color: #94a3b8; letter-spacing: 1px; border-bottom: 2px solid #f1f5f9; text-align: left; }
    .luxury-pos-table td { padding: 12px 8px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
    .cart-item-name { font-size: 18px; font-weight: 950; color: #0f172a; }
    .cart-item-code { font-size: 11px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; margin-top: 2px; }
    .table-input-wrapper { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .table-input-label { font-size: 9px; font-weight: 950; color: #94a3b8; }
    .table-cell-input { background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; font-weight: 800; font-size: 15px; color: #0f172a; outline: none; transition: 0.2s; }
    .table-cell-input:focus { border-color: #0ea5e9; }
    .table-cell-input.qty-active { background: #f0f9ff; border-color: #bae6fd; color: #0369a1; font-weight: 950; height: 45px; }
    .no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    .no-spinner { -moz-appearance: textfield; }
    .cart-item-total { font-size: 20px; font-weight: 950; color: #0f172a; white-space: nowrap; }
    .btn-remove-item { background: #fff1f2; color: #f43f5e; border: none; width: 44px; height: 44px; border-radius: 14px; cursor: pointer; transition: all 0.2s; opacity: 0.3; }
    tr:hover .btn-remove-item { opacity: 1; }
    .btn-remove-item:hover { background: #f43f5e; color: #fff; transform: rotate(8deg); }
    .empty-cart-state { padding: 100px 0; text-align: center; }
    .empty-icon { color: #f1f5f9; margin-bottom: 20px; }
    .empty-text { font-size: 24px; font-weight: 950; color: #cbd5e1; text-transform: uppercase; letter-spacing: 6px; }

    /* CUSTOMER CARD */
    .customer-section-card { background: #fff; border-radius: 32px; padding: 28px; margin-bottom: 24px; border: 1px solid #f1f5f9; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-title { font-size: 20px; font-weight: 950; color: #0f172a; margin: 0; }
    .btn-text-only { background: transparent; border: none; color: #f43f5e; font-weight: 900; font-size: 11px; text-transform: uppercase; cursor: pointer; }
    .customer-search-row { display: flex; gap: 12px; }
    .search-input-wrapper { flex: 1; position: relative; }
    .customer-search-input { width: 100%; height: 60px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 18px; padding: 0 20px; font-weight: 800; font-size: 16px; outline: none; transition: all 0.2s; }
    .customer-search-input:focus { background: #fff; border-color: #0ea5e9; }
    .customer-results-dropdown { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: #fff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; z-index: 100; }
    .customer-result-item { padding: 14px 20px; border-bottom: 1px solid #f8fafc; cursor: pointer; }
    .customer-result-item:hover { background: #f0f9ff; }
    .cust-name { font-weight: 900; color: #0f172a; }
    .cust-phone { font-size: 10px; font-weight: 800; color: #94a3b8; }
    .btn-add-circle { width: 60px; height: 60px; background: #0ea5e9; color: #fff; border: none; border-radius: 18px; font-size: 28px; font-weight: 300; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 16px -4px rgba(14, 165, 233, 0.4); }
    .btn-add-circle:hover { transform: translateY(-3px) scale(1.05); }
    .selected-customer-pill { background: linear-gradient(to right, #f0f9ff, #fff); border: 2px solid #bae6fd; padding: 24px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; }
    .cust-name-large { font-size: 22px; font-weight: 950; color: #0f172a; }
    .cust-phone-sub { font-size: 12px; font-weight: 900; color: #0ea5e9; margin-top: 3px; letter-spacing: 1px; }
    .balance-label { font-size: 10px; font-weight: 950; color: #94a3b8; text-transform: uppercase; text-align: right; }
    .balance-value { font-size: 20px; font-weight: 950; color: #f43f5e; margin-top: 2px; }
    
    /* CHECKOUT PANEL */
    .checkout-panel { background: #0f172a; color: #fff; border-radius: 36px; padding: 32px 36px; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .sum-label { font-size: 13px; font-weight: 950; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
    .sum-value { font-size: 22px; font-weight: 800; }
    .discount-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 16px 20px; border-radius: 18px; margin-bottom: 16px; }
    .discount-controls { display: flex; gap: 10px; align-items: center; }
    .discount-type-select { background: transparent; border: none; color: #fff; font-weight: 900; font-size: 14px; outline: none; cursor: pointer; }
    .discount-value-input { width: 90px; height: 35px; background: rgba(255,255,255,0.1); border: none; border-radius: 10px; color: #fff; text-align: right; font-weight: 950; font-size: 18px; padding: 0 10px; }
    .divider-line { height: 1px; background: rgba(255,255,255,0.08); margin: 16px 0; }
    .net-bill-box { text-align: center; padding: 5px 0; }
    .net-label { font-size: 11px; font-weight: 950; color: #0ea5e9; letter-spacing: 5px; margin-bottom: 8px; }
    .net-value { font-size: 52px; font-weight: 950; letter-spacing: -2px; line-height: 1; }
    
    .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-label-tiny { font-size: 10px; font-weight: 950; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 3px; }
    .btn-add-payment { background: rgba(255,255,255,0.08); border: 1.5px dashed rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); font-weight: 900; font-size: 9px; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; cursor: pointer; }
    .payment-item-row { display: flex; gap: 10px; margin-bottom: 12px; }
    .method-input-group { position: relative; flex: 1; }
    .method-icon-overlay { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #0ea5e9; }
    .method-dropdown-lazz { width: 100%; height: 52px; background: #fff; border: none; border-radius: 14px; padding-left: 40px; font-weight: 950; font-size: 13px; color: #0f172a; appearance: none; cursor: pointer; }
    .payment-amount-field { width: 130px; height: 52px; background: #fff; border: none; border-radius: 14px; text-align: right; padding: 0 16px; font-weight: 950; font-size: 19px; color: #0f172a; outline: none; }
    .btn-del-payment { background: rgba(244, 63, 94, 0.2); border: none; color: #f43f5e; width: 35px; height: 52px; border-radius: 12px; font-size: 22px; font-weight: 300; cursor: pointer; }

    .reconciliation-box { margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
    .recon-row { display: flex; justify-content: space-between; align-items: center; }
    .recon-label { font-size: 13px; font-weight: 950; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px; }
    .recon-value-success { font-size: 24px; font-weight: 950; color: #10b981; }
    .recon-due-alert { background: rgba(244, 63, 94, 0.1); border: 2px solid rgba(244, 63, 94, 0.2); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .due-label { font-size: 11px; font-weight: 950; color: #fecaca; text-transform: uppercase; letter-spacing: 2px; }
    .due-value { font-size: 20px; font-weight: 950; color: #f43f5e; }

    .btn-finalize-ocean { width: 100%; height: 70px; background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: #fff; border: none; border-radius: 20px; cursor: pointer; transition: all 0.4s; box-shadow: 0 12px 24px -8px rgba(14, 165, 233, 0.5); margin-top: 16px; }
    .btn-finalize-ocean:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.6); }
    .btn-finalize-ocean:disabled { opacity: 0.3; filter: grayscale(1); cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-inner { display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 18px; font-weight: 950; letter-spacing: -0.5px; }

    /* MODAL LAZZ */
    .modal-overlay-lazz { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-body-lazz { background: #fff; border-radius: 44px; width: 500px; padding: 50px; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
    .modal-header-lazz { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .modal-title-lazz { font-size: 32px; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -1.5px; }
    .btn-close-modal-lazz { background: #f1f5f9; border: none; color: #64748b; font-size: 30px; width: 44px; height: 44px; border-radius: 12px; cursor: pointer; }
    .lazz-field { margin-bottom: 24px; }
    .lazz-field label { display: block; font-size: 10px; font-weight: 950; color: #94a3b8; letter-spacing: 3px; margin-bottom: 12px; }
    .lazz-field input { width: 100%; height: 65px; background: #f8fafc; border: 2.5px solid #e2e8f0; border-radius: 18px; padding: 0 24px; font-weight: 800; font-size: 18px; outline: none; }
    .lazz-field input:focus { border-color: #0ea5e9; background: #fff; }
    .btn-submit-lazz { width: 100%; height: 75px; background: #0f172a; color: #fff; border: none; border-radius: 24px; font-weight: 950; font-size: 18px; cursor: pointer; transition: all 0.2s; margin-top: 20px; }
    .btn-submit-lazz:hover { background: #1e293b; transform: translateY(-3px); }

    .animate-in { animation: smoothIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes smoothIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .lazz-spinner { width: 32px; height: 32px; border: 5px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PurchaseCreateComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('partyInput') partyInput!: ElementRef;
  cart: any[] = []; searchResults: any[] = []; partyResults: any[] = []; selectedParty: any = null;
  submitting = false; showSupplierAdd = false; newSupplier = { fullName: '', phoneNumber: '', partyType: 'Supplier' };
  purchaseDate = new Date().toISOString().split('T')[0];
  discountType: 'fixed' | 'percent' = 'fixed';
  discountValue = 0;
  payments: any[] = [{ method: 'Cash', amount: 0 }];
  showSuccessModal = false; lastPurchaseData: any = null;
  private searchSubject = new Subject<string>();
  private partySubject = new Subject<string>();
  Math = Math;

  constructor(private api: ApiService, public branchService: BranchService, public calc: CalculationService, private router: Router) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400), switchMap(t => t ? this.api.get<any[]>(`Product/SearchInventory/${t}/${this.branchService.activeBranchId()}`) : of([]))).subscribe(r => this.searchResults = r);
    this.partySubject.pipe(debounceTime(400), switchMap(t => t ? this.api.get<any[]>(`Party/Search/${t}`) : of([]))).subscribe(r => this.partyResults = r);
  }

  onSearchInput(e: Event) { this.searchSubject.next((e.target as HTMLInputElement).value); }
  onPartySearch(e: Event) { this.partySubject.next((e.target as HTMLInputElement).value); }
  selectParty(p: any) { 
    this.selectedParty = p; 
    this.partyResults = []; 
    if (this.partyInput) this.partyInput.nativeElement.value = '';
    this.api.get<any>(`Party/${p.partyId}`).subscribe(res => this.selectedParty = res); 
  }

  addToCart(product: any) {
    const existing = this.cart.find(i => i.productId === product.productId);
    if (existing) { 
      existing.quantity++; 
      this.updateItem(existing); 
    }
    else { 
      const item = { productId: product.productId, productName: product.productName, strength: product.strength, batchNo: '', expiryDate: '', costPrice: product.costPrice || 0, mrp: product.mrp || 0, quantity: 1, total: 0 };
      this.cart.push(item); 
      this.updateItem(item);
    }
    this.searchResults = []; 
    if (this.searchInput) this.searchInput.nativeElement.value = ''; 
    this.updateItem();
  }

  setWalkingSupplier() {
    this.api.get<any[]>('Party/Search/Walking').subscribe(res => {
      const walking = res.find(p => p.partyType === 'Supplier');
      if (walking) {
        this.selectParty(walking);
      } else {
        // Auto-create if not found
        const newWalking = { fullName: 'Walking Supplier', phoneNumber: '000', partyType: 'Supplier', branchId: this.branchService.activeBranchId() };
        this.api.post<any>('Party', newWalking).subscribe({
          next: (created) => this.selectParty(created),
          error: () => alert('Could not create Walking Supplier profile.')
        });
      }
    });
  }

  updateItem(item?: any) { 
    if (item) { 
      item.quantity = Math.max(1, parseFloat(item.quantity as any) || 0); 
      item.costPrice = Math.max(0, parseFloat(item.costPrice as any) || 0); 
      item.total = item.quantity * item.costPrice; 
    } else {
      // Update all items if none specified
      this.cart.forEach(i => {
        i.total = (i.quantity || 0) * (i.costPrice || 0);
      });
    }
    this.payments.forEach(p => {
        if (p.amount < 0) p.amount = 0;
    });
    this.discountValue = Math.max(0, this.discountValue || 0);
  }

  addPaymentField() { const remaining = this.totalAmount - this.paidAmount; this.payments.push({ method: 'Cash', amount: remaining > 0 ? remaining : 0 }); }
  removePayment(idx: number) { this.payments.splice(idx, 1); this.updateItem(); }
  removeItem(id: number) { this.cart = this.cart.filter(i => i.productId !== id); this.updateItem(); }
  get totalAmount() { return this.cart.reduce((s, i) => s + i.total, 0); }
  get discountAmount() { return (this.discountType === 'percent') ? (this.totalAmount * this.discountValue) / 100 : this.discountValue; }
  get netAmount() { return Math.max(0, this.totalAmount - (this.discountAmount || 0)); }
  get paidAmount() { return this.payments.reduce((s, p) => s + (p.amount || 0), 0); }
  get remainingBalance() { return Math.max(0, this.netAmount - this.paidAmount); }
  get changeAmount() { return Math.max(0, this.paidAmount - this.netAmount); }

  resetCart() { this.cart = []; this.selectedParty = null; this.discountValue = 0; this.payments = [{ method: 'Cash', amount: 0 }]; }

  submitPurchase() {
    if (this.cart.length === 0 || !this.selectedParty) return;
    this.submitting = true; 
    const payload = { 
        branchId: this.branchService.activeBranchId(), 
        supplierId: this.selectedParty.partyId, 
        totalAmount: this.totalAmount, 
        discount: this.discountAmount,
        netAmount: this.netAmount,
        changeAmount: this.changeAmount,
        purchaseDate: new Date(this.purchaseDate).toISOString(), 
        purchaseDetails: this.cart.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.costPrice, mrp: i.mrp, batchNumber: i.batchNo, expiryDate: i.expiryDate || null })), 
        purchasePayments: this.payments.map(p => ({ paymentMethod: p.method, amount: p.amount, paymentStatus: 'Paid' })) 
    };
    this.api.post<any>('Purchase', payload).subscribe({ 
        next: (res) => { 
            this.submitting = false; 
            const id = res.purchaseId || res.PurchaseId || res.id || res.Id; 
            if (id) { 
                this.api.get<any>(`Purchase/${id}`).subscribe(fullData => { 
                    this.lastPurchaseData = fullData; 
                    this.showSuccessModal = true; 
                    this.resetCart(); 
                }); 
            } else { 
                this.resetCart(); 
            } 
        }, 
        error: (err) => { this.submitting = false; alert(err.error?.message || err.error?.title || err.message || 'Error saving purchase'); } 
    });
  }

  onModalClose() { this.showSuccessModal = false; this.router.navigate(['/purchase-history']); }

  saveSupplier() { 
    if (!this.newSupplier.fullName) return; 
    this.api.post<any>('Party', { ...this.newSupplier, branchId: this.branchService.activeBranchId() }).subscribe({ 
        next: (res) => { this.selectParty(res); this.showSupplierAdd = false; }, 
        error: () => alert('Error adding supplier') 
    }); 
  }
}
