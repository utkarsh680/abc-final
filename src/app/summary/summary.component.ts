import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { baseUrl } from '../utils/api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements AfterViewInit {
  forecastPeriod: string = '';
  selectedOption: number = 0;
  searchValue: string = '';
  accounts: any[] = [];
  yearlySummary: any = {};
  loading: boolean = false;
  error: string | null = null;
  startDate: string = '';
  endDate: string = '';
  selectedCifId: string = '';
  data: any;
  dateRangeToggled: boolean = false;
  minEndDate: string = '';
  maxStartDate: string = '';
  filteredAccountData: any[] = [];

  cifId = [
    { id: 1, cifId: '12345678901' },
    { id: 2, cifId: '98765432102' },
    { id: 3, cifId: '11223344567' },
    { id: 4, cifId: '55667788901' },
    { id: 5, cifId: '22334455678' },
    { id: 6, cifId: '99887766543' },
    { id: 7, cifId: '33445566789' },
    { id: 8, cifId: '77665544321' },
    { id: 9, cifId: '66554433210' },
    { id: 10, cifId: '55443322109' },
  ];
  dataLength: any;
  filteredData: any;
  searchQuery: any;
  noDataAvailable: boolean = false;

  onStartChange() {
    if (this.startDate) {
      this.searchData();
    }
  }

  onEndChange() {
    if (this.startDate && this.endDate) {
      this.searchData();
    }
  }

  ngOnInit() {
    const today = new Date();
    this.endDate = today.toISOString().split('T')[0];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    this.startDate = sixMonthsAgo.toISOString().split('T')[0];

    this.searchData();
  }

  searchData() {
    this.loading = true; // Start loading
    const apiUrl = `http://167.172.220.75:8084/CashflowForecastingApplication/api/accounts/search?cifId=${this.cifId[3].cifId}&startDate=${this.startDate}&endDate=${this.endDate}`;

    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        this.loading = false; // End loading
        if (response && response.data) {
          this.data = response.data;
          this.filteredData = this.data; // Initialize filteredData
          this.filteredAccountData = [...this.filteredData]; // Initialize filteredAccountData
          this.dataLength = response.data.length;
        } else {
          this.data = [];
          this.filteredData = []; // Reset filtered data if no response
          this.filteredAccountData = []; // Reset filteredAccountData
        }
        this.isDetailsVisible = new Array(this.data.length).fill(false);
      },
      (error) => {
        this.loading = false; // End loading even on error
        console.error('Error fetching data:', error);
      }
    );
  }

  onSearchChange() {
    this.filterAccountData(); // Call to filter account data
  }

  filterAccountData() {
    if (this.searchQuery.trim() === '') {
      this.filteredAccountData = [...this.filteredData]; // Reset to original account data
      this.noDataAvailable = this.filteredAccountData.length === 0; // Update flag based on data length
      return; // Exit early
    }

    this.filteredAccountData = this.filteredData.filter(
      (account: { accountNumber: string }) =>
        account.accountNumber
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase())
    );

    this.noDataAvailable = this.filteredAccountData.length === 0; // Update flag based on filtered data length
  }
  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) {}

  onOptionChange() {
    console.log('Selected option:', this.selectedOption);
  }

  items = [
    {
      id: 'ACC006',
      value: 'AE6112424242424244242-AED',
      openingBalance: 'AED 1,30,000',
      closingBalance: 'AED 70,000',
    },
    {
      id: 'ACC007',
      value: 'AE6112424242424244243-AED',
      openingBalance: 'AED 2,00,000',
      closingBalance: 'AED 1,00,000',
    },
    {
      id: 'ACC008',
      value: 'AE6112424242424244244-AED',
      openingBalance: 'AED 1,50,000',
      closingBalance: 'AED 80,000',
    },
    {
      id: 'ACC009',
      value: 'AE6112424242424244245-AED',
      openingBalance: 'AED 1,20,000',
      closingBalance: 'AED 60,000',
    },
    // Add more items as needed
  ];

  // Visibility tracking array initialized directly
  isDetailsVisible: boolean[] = Array(this.items.length).fill(false);

  toggleDetails(index: number) {
    this.isDetailsVisible[index] = !this.isDetailsVisible[index]; // Toggle visibility for the specific item
  }
  search() {
    this.loading = true;
    this.error = null;
    const url = this.buildUrl();

    if (!url) {
      this.loading = false;
      return;
    }

    console.log('Constructed URL:', url);

    this.http.get(url).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.code === 200 && response.status === 'success') {
          this.accounts = response.data;

          this.accounts.forEach((account) => (account.showTable = false));

          if (this.accounts.length > 0) {
            const accountNumber = this.accounts[0].accountNumber;
            this.fetchYearlySummary(
              accountNumber,
              this.startDate,
              this.endDate
            );
          }
        } else {
          this.error = response.message || 'No data found.';
        }
      },
      (error) => {
        this.loading = false;
        this.error = 'Error fetching data. Please try again later.';
        console.error('HTTP request error:', error);
      }
    );
  }

  // onDateChange(event: Event) {
  //   const inputElement = event.target as HTMLInputElement;
  //   const selectedDate = new Date(inputElement.value);

  //   if (!isNaN(selectedDate.getTime())) {
  //     const endDate = new Date(selectedDate);
  //     endDate.setMonth(endDate.getMonth() + 6);

  //     // Format the dates
  //     const options: Intl.DateTimeFormatOptions = {
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric',
  //     };
  //     const startDateFormatted = selectedDate.toLocaleDateString(
  //       undefined,
  //       options
  //     );
  //     const endDateFormatted = endDate.toLocaleDateString(undefined, options);

  //     this.startDate = selectedDate.toISOString().split('T')[0];
  //     this.endDate = endDate.toISOString().split('T')[0];

  //     this.forecastPeriod = `${startDateFormatted} - ${endDateFormatted}`;
  //     console.log('Forecast period:', this.forecastPeriod);
  //     console.log('Start date:', this.startDate, 'End date:', this.endDate);
  //     if (this.accounts.length > 0) {
  //       const accountNumber = this.accounts[0].accountNumber;
  //       this.fetchYearlySummary(accountNumber, this.startDate, this.endDate);
  //     }
  //   } else {
  //     this.forecastPeriod = 'Please select a valid date.';
  //   }
  // }

  toggleTable(account: any) {
    this.dateRangeToggled = !this.dateRangeToggled;

    if (this.dateRangeToggled) {
      console.log('Date range toggled on.');
      if (this.startDate && this.endDate) {
        console.log('Fetching data for the selected date range.');
        this.fetchYearlySummary(
          account.accountNumber,
          this.startDate,
          this.endDate
        );
      } else {
        console.log('Please select both start and end dates.');
        this.error =
          'Start and end dates are required when date range is toggled.';
      }
    } else {
      console.log('Date range toggled off. No date filter applied.');
      this.fetchYearlySummary(account.accountNumber, '', '');
    }

    this.router.navigate(['/summary-view'], {
      queryParams: {
        accountNumber: account.accountNumber,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });
  }

  private fetchYearlySummary(
    accountNumber: string,
    startDate: string,
    endDate: string
  ) {
    const yearlySummaryUrl = `${baseUrl}transactions/custom-range-summary?accountNumber=${accountNumber}&startDate=${startDate}&endDate=${endDate}`;
    console.log('Yearly summary URL:', yearlySummaryUrl);

    this.http.get(yearlySummaryUrl).subscribe(
      (response: any) => {
        console.log('Yearly Summary Response:', response);

        if (response.code === 200 && response.status === 'success') {
          this.yearlySummary[accountNumber] = response.data;
          console.log('Yearly Summary:', this.yearlySummary);
          const account = this.accounts.find(
            (acc) => acc.accountNumber === accountNumber
          );

          if (account) {
            account.yearlyOpeningBalance = response.data.openingBalance;
            account.yearlyClosingBalance = response.data.closingBalance;
            console.log('Opening Balance:', account.yearlyOpeningBalance);
            console.log('Closing Balance:', account.yearlyClosingBalance);
          }
        } else {
          this.error = response.message || 'No yearly summary data found.';
        }
      },
      (error) => {
        this.error = 'Error fetching yearly summary. Please try again later.';
        console.error('HTTP request error (Yearly Summary):', error);
      }
    );
  }

  private buildUrl(): string {
    let url = `${baseUrl}accounts/search?`;
    console.log('searchValue', this.searchValue);
    this.selectedOption = Number(this.selectedOption);

    switch (this.selectedOption) {
      case 1:
        url += `accountNumber=${encodeURIComponent(this.searchValue)}`;
        break;

      case 2:
        url += `accountTitle=${encodeURIComponent(this.searchValue)}`;
        break;

      default:
        this.error = 'Please select a search option.';
        return '';
    }

    return url;
  }

  ngAfterViewInit(): void {
    const canvas1 = document.getElementById('donutChart1') as HTMLCanvasElement;
    const ctx1 = canvas1?.getContext('2d');

    if (ctx1) {
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: [
            'Cheque Collection',
            'Cash Collection',
            'POC Collection',
            'E mandate',
            'Invoice Financing',
          ],
          datasets: [
            {
              label: 'My Dataset',
              data: [300, 50, 100, 200, 150],
              backgroundColor: [
                '#E06C83',
                '#30417E',
                '#D59524',
                '#52BEA7',
                '#B9DF4B',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 10,
                padding: 8,
                font: {
                  size: 10,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const datasetLabel = tooltipItem.dataset.label || '';
                  const dataLabel = tooltipItem.label || '';
                  const amount = tooltipItem.raw;

                  // Adjust spacing with non-breaking spaces instead of raw spaces
                  return `${datasetLabel}: ${dataLabel}\n\xa0\xa0\xa0\xa0<b>${amount} AED</b>`;
                },
              },
              titleFont: {
                size: 10,
              },
              bodyFont: {
                size: 10,
              },
            },
          },
        },
      });
    }

    const canvas2 = document.getElementById('donutChart2') as HTMLCanvasElement;
    const ctx2 = canvas2?.getContext('2d');

    if (ctx2) {
      // Create a new chart instance
      new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: [
            'Future Payment',
            'Payment by SI',
            'Bill Payment Schedule',
            'Tax Payment Schedule',
            'Loan EMIs',
          ],
          datasets: [
            {
              label: 'My Dataset',
              data: [300, 50, 100, 200, 150],
              backgroundColor: [
                '#E06C83',
                '#30417E',
                '#D59524',
                '#52BEA7',
                '#B9DF4B',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 10,
                padding: 8,
                font: {
                  size: 10,
                },
              },
            },
            tooltip: {
              enabled: true, // Make sure tooltips are enabled
              callbacks: {
                label: function (tooltipItem) {
                  const datasetLabel = tooltipItem.dataset.label || '';
                  const dataLabel = tooltipItem.label || '';
                  const amount = tooltipItem.raw;

                  const backgroundColor = tooltipItem.dataset
                    .backgroundColor as string[];
                  const color = backgroundColor[tooltipItem.dataIndex];

                  // Return formatted tooltip with colored circle and HTML content
                  return `<div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: bold">${datasetLabel}: ${dataLabel}</span>
                                <span style="display: flex; align-items: center; justify-content: flex-end;">
                                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 5px;"></span>
                                    <span style="color: ${color}; margin-left: 5px;">${amount} AED</span>
                                </span>
                            </div>`;
                },
              },
              // If you want to customize the tooltip's appearance, you can add other options here.
              titleFont: {
                size: 10,
              },
              bodyFont: {
                size: 10,
              },

              padding: 10,
            },
          },
        },
      });
    } else {
      console.error('Context is not available');
    }
  }
}
