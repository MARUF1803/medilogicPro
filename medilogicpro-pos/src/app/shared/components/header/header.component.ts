import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { BranchService, Branch } from '@core/services/branch.service';
import { ThemeService } from '@core/services/theme.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="header-left">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search medicines, prescriptions or stock..." class="search-input" />
        </div>
      </div>

      <div class="header-right">
        <!-- Theme Toggle -->
        <button class="theme-toggle" (click)="theme.toggleTheme()" [title]="theme.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          @if (theme.isDarkMode()) {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        <!-- Branch Selector -->
        <div class="branch-selector">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c63e4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <div class="branch-info">
            <span class="branch-label">Pharmacy Branch</span>
            <select class="branch-select" [ngModel]="branchService.activeBranchId()" (change)="onBranchChange($event)">
              @for (b of branchService.branches(); track b.branchId) {
                <option [value]="b.branchId">{{ b.branchName }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Notifications -->
        <div class="notification-container">
          <button class="notification-btn" (click)="showNotifications = !showNotifications" [class.has-unread]="notify.unreadCount() > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            @if (notify.unreadCount() > 0) {
              <span class="unread-badge">{{ notify.unreadCount() }}</span>
            }
          </button>
          
          @if (showNotifications) {
            <div class="notification-dropdown animate-in">
              <div class="dropdown-header">
                <h3>Stock Alerts</h3>
                <span class="badge">{{ notify.lowStockItems().length }} Items</span>
              </div>
              <div class="dropdown-body">
                @for (item of notify.lowStockItems(); track item.productId) {
                  <div class="notification-item">
                    <div class="item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
                    <div class="item-content">
                      <div class="item-title">{{ item.productName }}</div>
                      <div class="item-desc">Critical Stock: <b>{{ item.currentBalance }}</b> remaining</div>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">No critical stock alerts</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- User Info -->
        <div class="user-profile-section">
          <div class="user-profile-info">
            <span class="user-profile-name">{{ auth.userName() }}</span>
            <span class="user-profile-role">{{ auth.roles()[0] || 'Member' }}</span>
          </div>
          <div class="user-profile-avatar">{{ auth.userName().charAt(0).toUpperCase() }}</div>
          <button class="logout-btn" (click)="auth.logout()" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .theme-toggle {
      width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--border);
      background: var(--bg); cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; margin-right: 8px;
    }
    .theme-toggle:hover { border-color: var(--primary); transform: translateY(-1px); }
    .header {
      height: 70px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;
      background: var(--glass-bg); backdrop-filter: var(--glass); -webkit-backdrop-filter: var(--glass);
      border: 1px solid var(--border);
      border-radius: var(--radius); margin: 16px 20px 0;
      box-shadow: var(--shadow-premium);
    }
    .header-left { flex: 1; max-width: 480px; }
    .search-box {
      display: flex; align-items: center; gap: 10px; background: var(--bg);
      border: 1px solid var(--border); border-radius: 12px;
      padding: 0 16px; height: 42px; color: var(--text-muted);
    }
    .search-input {
      border: none; background: none; outline: none; width: 100%; font-size: 14px;
      color: var(--text); font-family: inherit;
    }
    .search-input::placeholder { color: var(--text-muted); }
    .header-right { display: flex; align-items: center; gap: 24px; }
    .branch-selector {
      display: flex; align-items: center; gap: 10px; background: var(--bg);
      padding: 4px 16px; border-radius: 12px; border: 1px solid var(--border);
      height: 42px;
    }
    .branch-info { display: flex; flex-direction: column; }
    .branch-label { font-size: 9px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; line-height: 1; }
    .branch-select {
      background: none; border: none; color: var(--text); font-weight: 700; font-size: 13px;
      font-family: inherit; cursor: pointer; outline: none; padding: 0;
    }
    .branch-select option { background: var(--card-bg); color: var(--text); }
    .user-profile-section {
      display: flex; align-items: center; gap: 14px; padding-left: 20px;
      border-left: 1px solid var(--border);
    }
    .user-profile-info { text-align: right; }
    .user-profile-name { display: block; font-weight: 700; font-size: 14px; color: var(--text); line-height: 1.2; }
    .user-profile-role { display: block; font-size: 11px; color: var(--text-muted); font-weight: 500; }
    .user-profile-avatar {
      width: 38px; height: 38px; border-radius: 50%; background: #0c63e4; color: #ffffff;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;
      box-shadow: 0 4px 10px rgba(12, 99, 228, 0.2);
    }
    .logout-btn {
      background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;
      display: flex; align-items: center; transition: all 0.2s; margin-left: 4px;
    }
    .logout-btn:hover { color: var(--danger); transform: scale(1.1); }

    .notification-container { position: relative; }
    .notification-btn {
      width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--border);
      background: var(--bg); cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; position: relative; color: var(--text-muted);
    }
    .notification-btn:hover { border-color: var(--primary); color: var(--primary); }
    .unread-badge {
      position: absolute; top: -5px; right: -5px; background: #ef4444; color: white;
      font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 8px;
      border: 2px solid var(--bg);
    }
    .notification-dropdown {
      position: absolute; top: 55px; right: 0; width: 320px; background: var(--card-bg);
      border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-premium);
      z-index: 1000; overflow: hidden;
    }
    .dropdown-header {
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      background: var(--bg);
    }
    .dropdown-header h3 { font-size: 14px; font-weight: 800; margin: 0; color: var(--text); }
    .dropdown-body { max-height: 350px; overflow-y: auto; }
    .notification-item {
      padding: 14px 20px; display: flex; gap: 12px; border-bottom: 1px solid var(--border);
      transition: background 0.2s; cursor: pointer;
    }
    .notification-item:hover { background: var(--hover-bg); }
    .item-icon {
      width: 32px; height: 32px; border-radius: 8px; background: rgba(239, 68, 68, 0.1);
      color: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .item-content { flex: 1; }
    .item-title { font-weight: 700; font-size: 13px; color: var(--text); margin-bottom: 2px; }
    .item-desc { font-size: 11px; color: var(--text-muted); }
    .empty-state { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 500; }
    .animate-in { animation: dropFade 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes dropFade { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  `]
})
export class HeaderComponent {
  constructor(
    public auth: AuthService,
    public branchService: BranchService,
    public theme: ThemeService,
    public notify: NotificationService
  ) {}

  showNotifications = false;

  onBranchChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const branchId = parseInt(select.value);
    const branch = this.branchService.branches().find((b: Branch) => b.branchId === branchId);
    if (branch) {
      this.branchService.switchBranch(branch);
    }
  }
}
