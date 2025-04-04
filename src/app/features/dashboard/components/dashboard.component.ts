import {Component, inject, OnInit} from '@angular/core';
import {ColComponent, ContainerComponent, RowComponent} from '@coreui/angular';
import {cardData} from '../models/card-data';
import {NgClass} from '@angular/common';
import {IconComponent} from '@coreui/icons-angular';
import {IconSubset} from '../../../icons/icon-subset';
import {ChartjsComponent} from '@coreui/angular-chartjs';
import {DashboardData} from '../models/dashboard-data';
import {DashboardService} from '../services/dashboard.service';

@Component({
  selector: 'gl-dashboard',
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    NgClass,
    IconComponent,
    ChartjsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  protected readonly cardData = cardData;
  dashboardData: DashboardData | null = null;
  loading = true;

  readonly dashboardService = inject(DashboardService);

  // Bar chart data
  barChartData: any;
  barChartOptions: any;

  // Line chart data
  lineChartData: any;
  lineChartOptions: any;

  // Doughnut chart data
  doughnutChartData: any;
  doughnutChartOptions: any;

  // Pie chart data
  pieChartData: any;
  pieChartOptions: any;

  ngOnInit(): void {
    this.loadDashboardData();
    this.initBarChart();
    this.initLineChart();
    this.initDoughnutChart();
    this.initPieChart();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
        this.loading = false;
      }
    });
  }

  initBarChart(): void {
    // Sample data - replace with your actual data
    this.barChartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Users',
          backgroundColor: 'rgba(255, 107, 107, 0.7)',
          data: [40, 20, 12, 39, 10, 40, 39]
        },
        {
          label: 'Lessons',
          backgroundColor: 'rgba(78, 205, 196, 0.7)',
          data: [50, 12, 28, 29, 7, 25, 12]
        },
        {
          label: 'Words',
          backgroundColor: 'rgba(255, 209, 102, 0.7)',
          data: [30, 45, 23, 33, 15, 18, 25]
        }
      ]
    };

    this.barChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            display: true
          },
          beginAtZero: true
        }
      }
    };
  }

  initLineChart(): void {
    this.lineChartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Active Users',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderColor: 'rgba(255, 107, 107, 1)',
          pointBackgroundColor: 'rgba(255, 107, 107, 1)',
          pointBorderColor: '#fff',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: true,
          tension: 0.4
        },
        {
          label: 'Completed Lessons',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          borderColor: 'rgba(78, 205, 196, 1)',
          pointBackgroundColor: 'rgba(78, 205, 196, 1)',
          pointBorderColor: '#fff',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: true,
          tension: 0.4
        },
        {
          label: 'New Registrations',
          backgroundColor: 'rgba(106, 5, 114, 0.1)',
          borderColor: 'rgba(106, 5, 114, 1)',
          pointBackgroundColor: 'rgba(106, 5, 114, 1)',
          pointBorderColor: '#fff',
          data: [12, 23, 34, 45, 56, 67, 78],
          fill: true,
          tension: 0.4
        }
      ]
    };

    this.lineChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          grid: {
            drawOnChartArea: false
          }
        },
        y: {
          grid: {
            drawOnChartArea: true
          },
          beginAtZero: true
        }
      },
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 4,
          hitRadius: 10,
          hoverRadius: 6
        }
      }
    };
  }

  initDoughnutChart(): void {
    this.doughnutChartData = {
      labels: ['Học viên', 'Giáo viên', 'Admin', 'VIP Users', 'Free Users'],
      datasets: [
        {
          data: [45, 25, 5, 15, 10],
          backgroundColor: [
            'rgba(255, 107, 107, 0.7)',
            'rgba(78, 205, 196, 0.7)',
            'rgba(255, 209, 102, 0.7)',
            'rgba(106, 5, 114, 0.7)',
            'rgba(26, 83, 92, 0.7)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(78, 205, 196, 1)',
            'rgba(255, 209, 102, 1)',
            'rgba(106, 5, 114, 1)',
            'rgba(26, 83, 92, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    this.doughnutChartOptions = {
      maintainAspectRatio: false,
      cutout: '65%',
      radius: '90%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              let label = context.label || '';
              let value = context.raw || 0;
              let total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              let percentage = Math.round((value / total) * 100);
              return label + ': ' + percentage + '%';
            }
          }
        }
      }
    };
  }

  initPieChart(): void {
    this.pieChartData = {
      labels: ['Chủ đề', 'Bài học', 'Từ vựng', 'Ngữ pháp', 'Bài tập'],
      datasets: [
        {
          data: [15, 25, 35, 15, 10],
          backgroundColor: [
            'rgba(255, 107, 107, 0.7)',
            'rgba(78, 205, 196, 0.7)',
            'rgba(255, 209, 102, 0.7)',
            'rgba(106, 5, 114, 0.7)',
            'rgba(26, 83, 92, 0.7)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(78, 205, 196, 1)',
            'rgba(255, 209, 102, 1)',
            'rgba(106, 5, 114, 1)',
            'rgba(26, 83, 92, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    this.pieChartOptions = {
      maintainAspectRatio: false,
      radius: '90%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              let label = context.label || '';
              let value = context.raw || 0;
              let total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              let percentage = Math.round((value / total) * 100);
              return label + ': ' + percentage + '%';
            }
          }
        }
      }
    };
  }

  getIcon(index: number): string {
    // Array of different icons
    const icons = [
      IconSubset.cilUser,
      IconSubset.cilSettings,
      IconSubset.cilChart,
      IconSubset.cilNotes,
      IconSubset.cilBook,
      IconSubset.cilSpeedometer,
      IconSubset.cilDollar
    ];

    // Return the icon at the current index or use modulo for more than 7 cards
    return icons[index % icons.length];
  }
}
