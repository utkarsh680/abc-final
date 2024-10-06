import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-cash-flow-chart',
  templateUrl: './cash-flow-chart.component.html',
  styleUrls: ['./cash-flow-chart.component.css']
})
export class CashFlowChartComponent implements OnInit {

  @ViewChild('cashFlowCanvas', { static: true }) cashFlowCanvas!: ElementRef;
  cashFlowChart: any;

  constructor() { }
  ngOnInit(): void {
    this.createChart();
}
createChart(): void {

    
    const ctx = this.cashFlowCanvas.nativeElement.getContext('2d');
    this.cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    type: 'line', // Line chart for cash flow
                    label: 'Cash',
                    borderColor: '#FFA500', // Orange color for the line
                    borderWidth: 1,
                    fill: true,
                    data: [100, 200, 300, 250, 400, 450, 300],
                    yAxisID: 'y-left', // Assign the line to the left Y-axis
                },
                {
                    type: 'bar', // Bar chart for inflow
                    label: 'Inflow',
                    backgroundColor: '#4CAF50', // Green bars for inflow
                    data: [150, 250, 350, 400, 450, 500, 350],
                    yAxisID: 'y-left', // Assign inflow to the right Y-axis
                    barPercentage: 0.5, // Adjust bar thickness
                    categoryPercentage: 0.5, // Adjust bar thickness within the category
                },
                {
                    type: 'bar', // Bar chart for outflow
                    label: 'Outflow',
                    backgroundColor: '#FF5252', // Red bars for outflow
                    data: [100, 200, 250, 300, 350, 400, 300],
                    yAxisID: 'y-left', // Assign outflow to the right Y-axis
                    barPercentage: 0.5, // Adjust bar thickness
                    categoryPercentage: 0.5, // Adjust bar thickness within the category
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 5,
                        padding: 4,
                    },
                },
                title: {
                    display: true,
                    text: 'Cash Flow Forecast Overview',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem: any) {
                            const datasetLabel = tooltipItem.dataset.label || '';
                            return `${datasetLabel}`;
                        },
                    },
                    titleFont: {
                        size: 8,
                    },
                    bodyFont: {
                        size: 8,
                    },
                },
            },
            scales: {
                'y-left': {
                    beginAtZero: true,
                    position: 'left',
                    grid: {
                        display: true,
                        color: '#E0E0E0',
                    },
                    title: {
                        display: true,
                        text: 'Cash Flow',
                    },
                    ticks: {
                        display: false, // Hides the left Y-axis labels
                    },
                },
                'y-right': {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        display: false, // Hides the grid lines on the right Y-axis
                    },
                    title: {
                        display: false,
                        text: 'Inflow/Outflow',
                    },
                    ticks: {
                        display: false, // Hides the right Y-axis labels
                    },
                },
            },
        },
    });
}

}

