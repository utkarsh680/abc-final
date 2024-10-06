import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cashflow';
  startDate: Date | null = null;
  endDate: Date | null = null;
  dateRange: string = '';

  setStartDate(date: Date) {
    this.startDate = date;
    this.updateDateRange();
  }

  setEndDate(date: Date) {
    this.endDate = date;
    this.updateDateRange();
  }

  updateDateRange() {
    if (this.startDate && this.endDate) {
      this.dateRange = `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
    }
  }
}
