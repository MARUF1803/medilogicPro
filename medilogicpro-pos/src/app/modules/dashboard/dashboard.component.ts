import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('profitChart') profitChartCanvas!: ElementRef;
  @ViewChild('branchChart') branchChartCanvas!: ElementRef;

  analyticsData: any;
  loading = true;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Initial charts setup if needed, but we do it after data load
  }

  loadData(): void {
    this.loading = true;
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;
        // Wait for DOM to update with canvas elements
        setTimeout(() => this.initCharts(), 100);
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.loading = false;
      }
    });
  }

  refreshDashboard(): void {
    this.loadData();
  }

  initCharts(): void {
    if (!this.analyticsData) return;

    if (this.profitChartCanvas) {
      const ctx = this.profitChartCanvas.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.analyticsData.topSellingProducts.map((p: any) => p.productName),
          datasets: [{
            label: 'Quantity Sold',
            data: this.analyticsData.topSellingProducts.map((p: any) => p.quantitySold),
            backgroundColor: 'rgba(0, 119, 190, 0.6)',
            borderColor: 'rgba(0, 119, 190, 1)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    if (this.branchChartCanvas) {
      const ctx = this.branchChartCanvas.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.analyticsData.branchPerformance.map((b: any) => b.branchName),
          datasets: [{
            data: this.analyticsData.branchPerformance.map((b: any) => b.totalSales),
            backgroundColor: [
              'rgba(16, 185, 129, 0.7)',
              'rgba(0, 119, 190, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(99, 102, 241, 0.7)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          cutout: '70%'
        }
      });
    }
  }
}
