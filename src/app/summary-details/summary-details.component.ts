import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface Account {
  accountNumber: string;
  currency: string;
  cifId: string;
}

interface ApiResponse {
  data: Account[];
}

@Component({
  selector: 'app-summary-details',
  templateUrl: './summary-details.component.html',
  styleUrls: ['./summary-details.component.css'],
})
export class SummaryDetailsComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  dateRangeToggled: boolean = false;
  minEndDate: string = '';
  maxStartDate: string = '';
  searchQuery: string = ''; // Search query for filtering
  accountNumber: string = '';
  cifId: string = '';
  data: any;
  accounts: any[] = []; // To store the list of accounts
  isLoading: boolean = true;
  transactions: any[] = [];

  currentPage: number = 1; // Current page
  itemsPerPage: number = 10; // Default items per page
  totalTransactions: number = 0; // Total number of transactions
  totalPages: number = 0; // Total pages

  paginatedTransactions: any[] = []; // Array to store transactions for the current page
  filteredTransactions: any[] = []; // Array to store filtered transactions
  selectedAccount: any;
  openingBalance: any;
  accountTitle: any;
  startDateValue: any;
  totalCashInflow: any;
  totalCashOutflow: any;
  netCashflow: any;
  closingBalance: any;
  odLimit: any;

  isAscending: boolean = true; // Flag for sorting order

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.accountNumber = params.get('accountNumber')!;
      this.startDate = params.get('startDate')!;
      this.endDate = params.get('endDate')!;
      this.cifId = params.get('cifId[3].cifId')!;
      this.fetchAccountDetails();
    });
    this.fetchAccounts();
  }

  fetchAccounts() {
    this.isLoading = true; // Step 2: Set loading state to true before the API call
    const apiUrl = `http://167.172.220.75:8084/CashflowForecastingApplication/api/accounts/search?cifId=${this.cifId}&startDate=${this.startDate}&endDate=${this.endDate}`;

    this.http.get<ApiResponse>(apiUrl).subscribe(
      (response) => {
        this.data =
          response && Array.isArray(response.data) ? response.data : [];
        this.selectedAccount = this.accountNumber;
        this.isLoading = false; // Step 3: Set loading state to false after the response is received
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        this.isLoading = false; // Step 4: Set loading state to false on error
      }
    );
  }

  fetchAccountDetails() {
    const apiUrl = `http://167.172.220.75:8084/CashflowForecastingApplication/api/transactions/custom-range-summary?accountNumber=${this.accountNumber}&startDate=${this.startDate}&endDate=${this.endDate}`;

    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        this.accountTitle = response.data.accountTitle;
        this.openingBalance = response.data.openingBalance;
        this.startDateValue = response.data.startDate;
        this.accountNumber = response.data.accountNumber;
        this.totalCashInflow = response.data.totalCashInflow;
        this.totalCashOutflow = response.data.totalCashOutflow;
        this.netCashflow = response.data.netCashflow;
        this.closingBalance = response.data.closingBalance;
        this.odLimit = response.data.odLimit;
        if (
          response.data &&
          response.data.transactions &&
          response.data.transactions.content
        ) {
          this.transactions = response.data.transactions.content; // Store all transactions
          this.totalTransactions = this.transactions.length; // Update total transactions
          this.totalPages = Math.ceil(
            this.totalTransactions / this.itemsPerPage
          ); // Calculate total pages
          this.updatePaginatedTransactions(); // Get transactions for the current page
        } else {
          console.error(
            'Empty transactions content or incorrect structure',
            response
          );
          this.transactions = [];
        }
      },
      (error) => {
        console.error('Error fetching data', error);
        this.transactions = [];
      }
    );
  }

  updatePaginatedTransactions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTransactions = this.filteredTransactions.length
      ? this.filteredTransactions.slice(
          startIndex,
          startIndex + this.itemsPerPage
        )
      : this.transactions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange(event: any) {
    this.itemsPerPage = +event.target.value; // Update rows per page
    this.currentPage = 1; // Reset to the first page
    this.updatePaginatedTransactions(); // Update displayed transactions
  }

  onPageChange(page: number) {
    this.currentPage = page; // Update the current page
    this.updatePaginatedTransactions(); // Update displayed transactions
  }

  onAccountChange(event: any) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.accountNumber = selectedValue;
    this.fetchAccountDetails();
  }

  onStartChange() {
    if (this.startDate && this.endDate) {
      this.fetchAccountDetails(); // Fetch new data when both dates are selected
    }
  }

  onEndChange() {
    if (this.startDate && this.endDate) {
      this.fetchAccountDetails(); // Fetch new data when both dates are selected
    }
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to the first page when searching
    this.filterTransactions(); // Call to filter transactions
  }

  filterTransactions() {
    // If search query is empty, show all transactions
    if (this.searchQuery.trim() === '') {
      this.filteredTransactions = [...this.transactions]; // Reset to original transactions
      this.totalTransactions = this.filteredTransactions.length; // Set total to original length
      this.totalPages = Math.ceil(this.totalTransactions / this.itemsPerPage); // Recalculate total pages
      this.updatePaginatedTransactions(); // Update displayed transactions
      return; // Exit early
    }

    // Filter transactions based on the search query
    this.filteredTransactions = this.transactions.filter((transaction) =>
      transaction.narration
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );

    // Check if any transactions match the search query
    if (this.filteredTransactions.length === 0) {
      this.totalTransactions = 0; // No transactions found
      this.totalPages = 0; // Reset total pages
      this.paginatedTransactions = []; // Clear the displayed transactions
    } else {
      this.totalTransactions = this.filteredTransactions.length; // Update total transactions
      this.totalPages = Math.ceil(this.totalTransactions / this.itemsPerPage); // Recalculate total pages
      this.updatePaginatedTransactions(); // Update displayed transactions
    }
  }

  sortTransactions(column: string) {
    this.isAscending = !this.isAscending; // Toggle sorting direction
    this.transactions.sort((a: any, b: any) => {
      let valueA, valueB;

      switch (column) {
        case 'source':
          valueA = a.source ? a.source.toLowerCase() : '';
          valueB = b.source ? b.source.toLowerCase() : '';
          break;
        case 'valueDate':
          valueA = new Date(a.valueDate);
          valueB = new Date(b.valueDate);
          break;
        case 'withdrawals':
          valueA = a.withdrawals;
          valueB = b.withdrawals;
          break;
        case 'deposits':
          valueA = a.deposits;
          valueB = b.deposits;
          break;
        case 'balance':
          valueA = a.balance;
          valueB = b.balance;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return this.isAscending ? -1 : 1;
      } else if (valueA > valueB) {
        return this.isAscending ? 1 : -1;
      } else {
        return 0;
      }
    });

    this.updatePaginatedTransactions(); // Update displayed transactions after sorting
  }

  printTable() {
    const printContent = document.getElementById('printableTable')?.innerHTML;
    const newWindow = window.open('', '_blank');
    newWindow!.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            .transaction-table {
              width: 100%;
              border-collapse: collapse;
            }
            .transaction-table th, .transaction-table td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            .transaction-table th {
              background-color: #f2f2f2;
              text-align: left;
            }
            .transaction-table .actual-transaction-data {
              color: black;
            }
            .transaction-table .opening-balance {
              font-weight: bold;
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <h2>Transaction Table</h2>
          <table class="transaction-table">
            ${printContent}
          </table>
        </body>
      </html>
    `);
    newWindow!.document.close();
  }
}
