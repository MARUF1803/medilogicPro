import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BranchService } from '../../core/services/branch.service';
import { PdfService } from '../../core/services/pdf.service';
import { CalculationService } from '../../core/services/calculation.service';
import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { GlobalPreviewModalComponent } from '../../shared/components/global-preview-modal/global-preview-modal.component';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalPreviewModalComponent],
  template: `
    <div class="pos-wrapper animate-in">
      
      <!-- Premium POS Header -->
      <div class="pos-header">
        <div class="header-left">
          <div class="header-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <div class="header-info">
            <h1 class="header-title">POS Sales Terminal</h1>
            <div class="header-meta">
              <span class="branch-tag">{{ branchService.activeBranch()?.branchName || 'Main Branch' }}</span>
              <span class="system-status">Live Connected</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <button class="btn-clear" (click)="resetCart()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Terminal
          </button>
          <div class="clock-box">
             <div class="clock-date">{{ today | date:'EEEE, d MMM' }}</div>
             <div class="clock-time">{{ today | date:'shortTime' }}</div>
          </div>
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
              <input #productInput type="text" class="main-search-input" placeholder="Search medicine name or scan barcode..." (input)="onSearchInput($event)" (keyup.enter)="addFirstProduct()" />
            </div>
            
            @if (searchResults.length > 0) {
              <div class="search-results-dropdown shadow-2xl">
                @for (item of searchResults; track item.productId) {
                  <div class="search-item" [class.disabled-item]="item.totalStock <= 0 || item.mrp <= 0" (click)="(item.totalStock > 0 && item.mrp > 0) ? addToCart(item) : null">
                    <div class="flex-1">
                        <div class="item-name">{{ item.productName }} <span class="item-strength">{{ item.strength }}</span></div>
                        <div class="item-meta">{{ item.productCode }}</div>
                    </div>
                    <div class="text-right">
                        <div class="item-price">{{ calc.formatCurrency(item.mrp || item.salePrice || 0) }}</div>
                        <div class="item-stock" [class.low-stock]="item.totalStock <= 0">Stock: {{ item.totalStock }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="cart-container shadow-lg">
            <table class="luxury-pos-table">
              <thead>
                <tr class="luxury-table-header">
                     <th style="padding-left: 24px; text-align: left;">Medicine Description</th>
                     <th style="text-align: center;">Rate</th>
                     <th style="text-align: center;">Qty</th>
                     <th style="text-align: right;">Subtotal</th>
                     <th style="padding-right: 24px; width: 60px;"></th>
                </tr>
              </thead>
              <tbody>
                @for (item of cart; track item.productId) {
                  <tr class="cart-row-animate">
                    <td>
                        <div class="cart-item-name">{{ item.productName }}</div>
                        <div class="cart-item-code">{{ item.productCode }}</div>
                    </td>
                    <td>
                        <div class="table-input-wrapper">
                            <span class="table-input-label">MRP</span>
                            <input type="number" [(ngModel)]="item.unitPrice" (ngModelChange)="updateItem(item)" class="no-spinner table-cell-input" />
                        </div>
                    </td>
                    <td>
                        <div class="table-input-wrapper">
                            <span class="table-input-label">QTY</span>
                            <input type="number" [(ngModel)]="item.quantity" (ngModelChange)="updateItem(item)" class="no-spinner table-cell-input qty-active" />
                        </div>
                    </td>
                    <td style="text-align: right; font-weight: 900; color: #0f172a; font-size: 16px;">{{ calc.formatCurrency(item.total) }}</td>
                    <td style="padding-right: 24px; text-align: right;">
                        <button class="btn-del-luxury" (click)="removeItem(item.productId)">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </td>
                  </tr>
                } @empty {
                   <tr>
                     <td colspan="5" class="empty-cart-state">
                        <div class="empty-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        </div>
                        <div class="empty-text">Cart is Empty</div>
                     </td>
                   </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column: Checkout Sidebar (Lazz Luxury) -->
        <div class="pos-right-panel">
          
          <!-- Customer Selection Card -->
          <div class="customer-section-card shadow-sm">
            <div class="section-header">
              <h3 class="section-title">Client Selection</h3>
              @if (selectedParty && !isWalking) {
                <button class="btn-text-only" (click)="selectedParty = null">Change</button>
              }
            </div>
            
            @if (!selectedParty || isWalking) {
              <div class="customer-search-row">
                <div class="search-input-wrapper">
                  <input #customerInput type="text" class="customer-search-input" placeholder="Search customer profile..." (input)="onPartySearch($event)" />
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
                <button class="btn-add-circle" (click)="showCustomerModal = true">+</button>
              </div>
            } 
            
            @if (selectedParty && !isWalking) {
              <div class="selected-customer-pill animate-in">
                 <div class="cust-info">
                    <div class="cust-name-large">{{ selectedParty.fullName }}</div>
                    <div class="cust-phone-sub">{{ selectedParty.phoneNumber }}</div>
                 </div>
                 <div class="cust-balance">
                    <div class="balance-label">Ledger Balance</div>
                    <div class="balance-value">{{ calc.formatCurrency(selectedParty.currentBalance || 0) }}</div>
                 </div>
              </div>
            } @else if (isWalking) {
               <div class="walking-customer-bar">
                  <span class="walking-label">Walking Customer Mode</span>
                  <button class="btn-link" (click)="selectedParty = null">Set Profile</button>
               </div>
            }
          </div>

          <!-- Master Checkout Panel (Black Luxury) -->
          <div class="checkout-panel shadow-2xl">
            
            <div class="summary-section">
               <div class="summary-row">
                  <span class="sum-label">Gross Total</span>
                  <span class="sum-value">{{ calc.formatCurrency(totalAmount) }}</span>
               </div>
               
               <div class="discount-row">
                  <span class="sum-label">Discount Adjustment</span>
                  <div class="discount-controls">
                     <select [(ngModel)]="discountType" (ngModelChange)="calculateNet()" class="discount-type-select">
                        <option value="fixed">Tk</option>
                        <option value="percent">%</option>
                     </select>
                     <input type="number" [(ngModel)]="discountValue" (ngModelChange)="calculateNet()" class="no-spinner discount-value-input" />
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
                  <label class="section-label-tiny">Payment Registry</label>
                  <button class="btn-add-payment" (click)="addPaymentField()">+ Split</button>
               </div>
               
               <div class="payments-list">
                 @for (p of payments; track $index) {
                   <div class="payment-item-row animate-in">
                        <div class="method-input-group">
                            <div class="method-icon-overlay">
                               <svg *ngIf="p.method === 'Cash'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                               <svg *ngIf="p.method === 'Card'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                               <svg *ngIf="p.method === 'Mobile'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                            </div>
                            <select [(ngModel)]="p.method" class="method-dropdown-lazz">
                               <option value="Cash">CASH</option>
                               <option value="Card">CARD</option>
                               <option value="Mobile">MOBILE</option>
                               <option value="Bank">BANK</option>
                            </select>
                        </div>
                        <input type="number" [(ngModel)]="p.amount" (ngModelChange)="calculateNet()" class="no-spinner payment-amount-field" />
                        @if (payments.length > 1) {
                           <button class="btn-del-payment" (click)="removePayment($index)">&times;</button>
                        }
                   </div>
                 }
               </div>
            </div>

            <!-- Reconciliation Box -->
            <div class="reconciliation-box">
                <div *ngIf="changeAmount > 0" class="recon-row animate-in">
                   <span class="recon-label">Change Amount (Return)</span>
                   <span class="recon-value-success">{{ calc.formatCurrency(changeAmount) }}</span>
                </div>
               
               <div *ngIf="changeAmount < 0" class="recon-due-alert animate-in">
                  <div class="flex justify-between items-center">
                     <span class="due-label">Unpaid Balance (Due)</span>
                     <span class="due-value">{{ calc.formatCurrency(Math.abs(changeAmount)) }}</span>
                  </div>
               </div>
            </div>

            <!-- Critical Block: Walking Customer Full Payment -->
            @if (isWalking && changeAmount < 0) {
               <div class="walking-warning-box animate-in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Walking Customer MUST pay in full</span>
               </div>
            }

            <button class="btn-finalize-ocean" [disabled]="isFinalizeDisabled()" (click)="submitSale()">
              @if (submitting) { <div class="lazz-spinner"></div> } 
              @else { 
                <span class="btn-inner">
                  Finalize & Print Invoice 
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17 4 12"/></svg>
                </span> 
              }
            </button>
          </div>
        </div>
      </div>

      <!-- New Customer Modal (Fixed Overlay) -->
      @if (showCustomerModal) {
        <div class="modal-overlay-lazz" (click)="showCustomerModal = false">
           <div class="modal-body-lazz animate-in" (click)="$event.stopPropagation()">
              <div class="modal-header-lazz">
                <h3 class="modal-title-lazz">Register New Customer</h3>
                <button class="btn-close-modal-lazz" (click)="showCustomerModal = false">&times;</button>
              </div>
              <div class="modal-inputs-lazz">
                <div class="lazz-field">
                   <label>CUSTOMER FULL NAME</label>
                   <input type="text" [(ngModel)]="newCustomer.fullName" placeholder="Enter name..." />
                </div>
                <div class="lazz-field">
                   <label>CONTACT NUMBER</label>
                   <input type="text" [(ngModel)]="newCustomer.phoneNumber" placeholder="Enter phone..." />
                </div>
              </div>
              <button class="btn-submit-lazz" (click)="saveCustomer()">
                 Create Profile & Auto-Select
              </button>
           </div>
        </div>
      }

      @if (showSuccessModal && lastSaleData) {
        <app-global-preview-modal type="Sale" [data]="lastSaleData" (close)="showSuccessModal = false"></app-global-preview-modal>
      }
    </div>
  `,
  styles: [`
    .pos-wrapper { max-width: 100%; width: 100%; margin: 0 auto; padding: 15px 24px; font-family: 'Inter', sans-serif; background: #fdfdfd; min-height: 98vh; box-sizing: border-box; overflow-x: hidden; }
    
    /* HEADER */
    .pos-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 24px 32px; border-radius: 32px; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 24px; }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .header-logo { padding: 12px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 18px; box-shadow: 0 8px 16px -4px rgba(14, 165, 233, 0.3); }
    .header-title { font-size: 26px; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -1px; }
    .header-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
    .branch-tag { padding: 3px 10px; background: #f0f9ff; color: #0ea5e9; border-radius: 8px; font-weight: 900; font-size: 11px; text-transform: uppercase; }
    .system-status { font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px; }
    .btn-clear { display: flex; align-items: center; gap: 8px; background: #fff1f2; color: #e11d48; border: none; padding: 10px 20px; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; }
    .clock-box { border-left: 1px solid #f1f5f9; padding-left: 24px; text-align: right; }
    .clock-date { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
    .clock-time { font-size: 20px; font-weight: 950; color: #0ea5e9; margin-top: 2px; }

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
    .search-item { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
    .search-item:hover:not(.disabled-item) { background: #f8fafc; padding-left: 30px; }
    .search-item.disabled-item { opacity: 0.5; cursor: not-allowed; background: #fafafa; }
    .item-name { font-size: 16px; font-weight: 900; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .item-strength { font-size: 12px; font-weight: 800; color: #94a3b8; }
    .item-meta { font-size: 10px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; margin-top: 3px; }
    .item-price { font-size: 18px; font-weight: 950; color: #0ea5e9; }
    .item-stock { font-size: 11px; font-weight: 800; color: #10b981; margin-top: 3px; }
    .item-stock.low-stock { color: #f43f5e; }

    /* CART TABLE */
    .cart-container { background: #fff; border-radius: 32px; overflow-x: auto; min-height: 550px; }
    .luxury-pos-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 600px; }
    .luxury-pos-table th { background: #f8fafc; padding: 22px 28px; font-weight: 950; text-transform: uppercase; font-size: 11px; color: #94a3b8; letter-spacing: 2px; border-bottom: 2px solid #f1f5f9; text-align: left; }
    .luxury-pos-table td { padding: 24px 28px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
    .cart-item-name { font-size: 18px; font-weight: 950; color: #0f172a; }
    .cart-item-code { font-size: 11px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; margin-top: 2px; }
    .table-input-wrapper { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .table-input-label { font-size: 9px; font-weight: 950; color: #94a3b8; }
    .table-cell-input { width: 90px; height: 45px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; font-weight: 800; font-size: 17px; color: #0f172a; outline: none; }
    .table-cell-input.qty-active { background: #f0f9ff; border-color: #bae6fd; color: #0369a1; font-weight: 950; }
    .cart-item-total { font-size: 22px; font-weight: 950; color: #0f172a; }
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
    .walking-customer-bar { padding: 18px 24px; background: #f8fafc; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9; }
    .walking-label { font-size: 13px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .btn-link { background: transparent; border: none; color: #0ea5e9; font-weight: 900; text-transform: uppercase; font-size: 11px; cursor: pointer; text-decoration: underline; }

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
    .recon-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .recon-label { font-size: 13px; font-weight: 950; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px; }
    .recon-value-success { font-size: 24px; font-weight: 950; color: #10b981; }
    .recon-due-alert { background: rgba(244, 63, 94, 0.1); border: 2px solid rgba(244, 63, 94, 0.2); border-radius: 16px; padding: 16px; margin-top: 16px; }
    .due-label { font-size: 11px; font-weight: 950; color: #fecaca; text-transform: uppercase; letter-spacing: 2px; }
    .due-value { font-size: 20px; font-weight: 950; color: #f43f5e; }

    .walking-warning-box { background: linear-gradient(135deg, #f43f5e, #be123c); color: #fff; padding: 16px; border-radius: 16px; display: flex; align-items: center; gap: 12px; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 16px; }

    .btn-finalize-ocean { width: 100%; height: 70px; background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: #fff; border: none; border-radius: 20px; cursor: pointer; transition: all 0.4s; box-shadow: 0 12px 24px -8px rgba(14, 165, 233, 0.5); margin-top: 8px; }
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
export class PosComponent implements OnInit {
  @ViewChild('productInput') productInput!: ElementRef;
  @ViewChild('customerInput') customerInput!: ElementRef;
  today = new Date(); cart: any[] = []; searchResults: any[] = []; partyResults: any[] = []; selectedParty: any = null;
  discountType: 'fixed' | 'percent' = 'fixed'; discountValue = 0; discountAmount = 0; payments: any[] = [{ method: 'Cash', amount: 0 }];
  submitting = false; Math = Math; showCustomerModal = false; showSuccessModal = false; lastSaleData: any = null;
  newCustomer = { fullName: '', phoneNumber: '', partyType: 'Customer' };
  private searchSubject = new Subject<string>(); private partySearchSubject = new Subject<string>();
  
  constructor(private api: ApiService, public branchService: BranchService, public pdf: PdfService, public calc: CalculationService) {}
  
  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), switchMap(t => t ? this.api.get<any[]>(`Product/SearchInventory/${t}/${this.branchService.activeBranchId()}`) : of([]))).subscribe(r => this.searchResults = r);
    this.partySearchSubject.pipe(debounceTime(300), switchMap(t => t ? this.api.get<any[]>(`Party/Search/${t}`) : of([]))).subscribe(r => this.partyResults = r);
    setInterval(() => this.today = new Date(), 1000);
  }

  onSearchInput(e: Event) { this.searchSubject.next((e.target as HTMLInputElement).value); }
  onPartySearch(e: Event) { this.partySearchSubject.next((e.target as HTMLInputElement).value); }

  addToCart(product: any) {
    if (product.totalStock <= 0 || product.mrp <= 0) {
       alert("CRITICAL ERROR: Cannot add medicine with zero stock or zero price.");
       return;
    }
    const existing = this.cart.find(i => i.productId === product.productId);
    if (existing) { 
        if (existing.quantity >= product.totalStock) {
            alert("WARNING: Cannot exceed available stock.");
            return;
        }
        existing.quantity++; 
        this.updateItem(existing); 
    }
    else { 
      const price = product.mrp || product.salePrice || 0; 
      this.cart.push({ productId: product.productId, productName: product.productName, productCode: product.productCode, strength: product.strength, quantity: 1, unitPrice: price, total: price, batchNumber: product.batchNumber }); 
    }
    this.searchResults = []; if (this.productInput) this.productInput.nativeElement.value = ''; this.calculateNet();
  }

  addFirstProduct() { if (this.searchResults.length > 0) this.addToCart(this.searchResults[0]); }
  
  updateItem(item?: any) { 
    if (item) { 
        item.quantity = Math.max(1, parseFloat(item.quantity as any) || 0); 
        item.unitPrice = Math.max(0, parseFloat(item.unitPrice as any) || 0); 
        item.total = item.quantity * item.unitPrice; 
    } 
    this.calculateNet(); 
  }

  calculateNet() { 
    this.discountValue = Math.max(0, this.discountValue || 0);
    this.discountAmount = (this.discountType === 'percent') ? (this.totalAmount * this.discountValue) / 100 : this.discountValue; 
    
    this.payments.forEach(p => {
        if (p.amount < 0) p.amount = 0;
    });

    if (this.payments.length === 1 && (this.payments[0].amount === 0 || Math.abs(this.payments[0].amount - this.netAmount) < 2)) { 
        this.payments[0].amount = this.netAmount; 
    } 
  }

  addPaymentField() { const remaining = this.netAmount - this.paidAmount; this.payments.push({ method: 'Cash', amount: remaining > 0 ? remaining : 0 }); }
  removePayment(idx: number) { this.payments.splice(idx, 1); this.calculateNet(); }
  removeItem(id: number) { this.cart = this.cart.filter(i => i.productId !== id); this.calculateNet(); }
  resetCart() { this.cart = []; this.selectedParty = null; this.discountValue = 0; this.payments = [{ method: 'Cash', amount: 0 }]; this.calculateNet(); }

  selectParty(party: any) { 
    this.selectedParty = party; 
    this.partyResults = []; 
    if (this.customerInput) this.customerInput.nativeElement.value = ''; 
    this.api.get<any>(`Party/${party.partyId}`).subscribe(res => {
        this.selectedParty = res;
        this.calculateNet();
    }); 
  }

  get totalAmount() { return this.cart.reduce((s, i) => s + i.total, 0); }
  get netAmount() { return Math.max(0, this.totalAmount - this.discountAmount); }
  get paidAmount() { return this.payments.reduce((s, p) => s + (p.amount || 0), 0); }
  get changeAmount() { return this.paidAmount - this.netAmount; }
  get isWalking() { return !this.selectedParty || this.selectedParty.fullName.toLowerCase().includes('walking'); }

  isFinalizeDisabled(): boolean {
    if (this.cart.length === 0 || this.submitting) return true;
    if (this.netAmount === 0) return true;
    if (this.isWalking && this.changeAmount < 0) return true; 
    return false;
  }

  submitSale() {
    if (this.isFinalizeDisabled()) return;
    this.submitting = true; 
    let finalPayments = this.payments.map(p => ({ paymentMethod: p.method, amount: p.amount, paymentStatus: 'Paid' }));
    // We send full payments; backend will handle changeAmount for Ledger and Balance.

    const data = { 
        branchId: this.branchService.activeBranchId(), 
        partyId: this.selectedParty?.partyId || null, 
        totalAmount: this.totalAmount, 
        Discount: this.discountAmount, 
        netAmount: this.netAmount, 
        changeAmount: this.changeAmount > 0 ? this.changeAmount : 0, 
        salesDate: new Date().toISOString(), 
        salesDetails: this.cart.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, batchNumber: i.batchNumber })), 
        salesPayments: finalPayments.filter(p => p.amount > 0)
    };
    
    this.api.post('SalesHistory/Create', data).subscribe({ 
        next: (res: any) => { 
            this.submitting = false; 
            const id = res.salesId || res.SalesId || res.id || res.Id; 
            if (id) { 
                this.api.get<any>(`SalesHistory/${id}`).subscribe(sale => { 
                    this.lastSaleData = sale; 
                    this.showSuccessModal = true; 
                    this.resetCart(); 
                }); 
            } else { this.resetCart(); } 
        }, 
        error: () => { this.submitting = false; alert('Transaction failed. Please check network.'); } 
    });
  }

  saveCustomer() { 
    if (!this.newCustomer.fullName) return; 
    this.api.post<any>('Party', { ...this.newCustomer, branchId: this.branchService.activeBranchId() }).subscribe({ 
        next: (res) => { 
            this.selectParty(res); 
            this.showCustomerModal = false; 
        }, 
        error: () => alert('Error adding customer') 
    }); 
  }
}
