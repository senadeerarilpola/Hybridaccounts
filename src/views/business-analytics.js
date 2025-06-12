/**
 * Business Analytics View
 * Provides visualizations and reports for business data
 */
class BusinessAnalyticsView {
    constructor() {
        this.charts = {};
        this.currentPeriod = 'month';
    }
    
    /**
     * Initialize the view
     */
    async init() {
        try {
            // Get the sales summary for the current period
            const salesSummary = await businessAnalytics.getSalesSummary(this.currentPeriod);
            const inventorySummary = await businessAnalytics.getInventorySummary();
            const customerInsights = await businessAnalytics.getCustomerInsights(this.currentPeriod);
            const profitabilityReport = await businessAnalytics.getProfitabilityReport(this.currentPeriod);
            
            return this.render(salesSummary, inventorySummary, customerInsights, profitabilityReport);
        } catch (error) {
            console.error('Error initializing business analytics:', error);
            return `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">Error</h4>
                    <p>Failed to load business analytics. Please try again later.</p>
                    <hr>
                    <p class="mb-0">Error details: ${error.message}</p>
                </div>
            `;
        }
    }
    
    /**
     * Render the business analytics view
     * @param {Object} salesSummary - Sales summary data
     * @param {Object} inventorySummary - Inventory summary data
     * @param {Object} customerInsights - Customer insights data
     * @param {Object} profitabilityReport - Profitability report data
     * @returns {string} HTML for the view
     */
    render(salesSummary, inventorySummary, customerInsights, profitabilityReport) {
        return `
            <div class="business-analytics-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Business Analytics</h1>
                    <div>
                        <select class="form-select" id="period-select">
                            <option value="today" ${this.currentPeriod === 'today' ? 'selected' : ''}>Today</option>
                            <option value="week" ${this.currentPeriod === 'week' ? 'selected' : ''}>This Week</option>
                            <option value="month" ${this.currentPeriod === 'month' ? 'selected' : ''}>This Month</option>
                            <option value="quarter" ${this.currentPeriod === 'quarter' ? 'selected' : ''}>This Quarter</option>
                            <option value="year" ${this.currentPeriod === 'year' ? 'selected' : ''}>This Year</option>
                            <option value="all" ${this.currentPeriod === 'all' ? 'selected' : ''}>All Time</option>
                        </select>
                    </div>
                </div>
                
                <!-- Key Metrics Summary -->
                <div class="row mb-4">
                    <div class="col-lg-3 col-md-6 mb-4">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                            Total Revenue
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                                            ${this.formatCurrency(profitabilityReport.overview.totalRevenue)}
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6 mb-4">
                        <div class="card border-left-success shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                            Gross Profit
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                                            ${this.formatCurrency(profitabilityReport.overview.grossProfit)}
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-chart-line fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6 mb-4">
                        <div class="card border-left-info shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                            Total Sales
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                                            ${salesSummary.totals.sales}
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6 mb-4">
                        <div class="card border-left-warning shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                            Gross Margin
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                                            ${profitabilityReport.overview.grossMargin.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-percentage fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts Row -->
                <div class="row mb-4">
                    <!-- Sales Trend Chart -->
                    <div class="col-xl-8 col-lg-7">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Sales Overview</h6>
                            </div>
                            <div class="card-body">
                                <div class="chart-area">
                                    <canvas id="salesTrendChart" style="min-height:250px;"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Status Chart -->
                    <div class="col-xl-4 col-lg-5">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Payment Status</h6>
                            </div>
                            <div class="card-body">
                                <div class="chart-pie">
                                    <canvas id="paymentStatusChart" style="min-height:250px;"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Inventory and Customers Row -->
                <div class="row">
                    <!-- Inventory Summary -->
                    <div class="col-lg-6 mb-4">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3">
                                <h6 class="m-0 font-weight-bold text-primary">Inventory Summary</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-4">
                                    <h5 class="small font-weight-bold">Stock Level Overview</h5>
                                    <div class="row mb-3">
                                        <div class="col-4 text-center border-right">
                                            <h4 class="text-danger">${inventorySummary.stockLevels.outOfStock}</h4>
                                            <small>Out of Stock</small>
                                        </div>
                                        <div class="col-4 text-center border-right">
                                            <h4 class="text-warning">${inventorySummary.stockLevels.lowStock}</h4>
                                            <small>Low Stock</small>
                                        </div>
                                        <div class="col-4 text-center">
                                            <h4 class="text-success">${inventorySummary.stockLevels.healthyStock}</h4>
                                            <small>Healthy Stock</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <h5 class="small font-weight-bold">Inventory Value: ${this.formatCurrency(inventorySummary.summary.totalValue)}</h5>
                                <h5 class="small font-weight-bold">Retail Value: ${this.formatCurrency(inventorySummary.summary.retailValue)}</h5>
                                
                                <hr>
                                
                                <h5 class="small font-weight-bold">Items Needing Reorder</h5>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Stock</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${inventorySummary.needsReorder.slice(0, 5).map(item => `
                                                <tr>
                                                    <td>${item.name}</td>
                                                    <td><span class="${item.quantity <= 0 ? 'text-danger' : 'text-warning'}">${item.quantity}</span></td>
                                                    <td>${this.formatCurrency(item.selling_price * item.quantity)}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    ${inventorySummary.needsReorder.length > 5 ? `<small class="text-muted">+ ${inventorySummary.needsReorder.length - 5} more items</small>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Customer Insights -->
                    <div class="col-lg-6 mb-4">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3">
                                <h6 class="m-0 font-weight-bold text-primary">Customer Insights</h6>
                            </div>
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-6 border-right">
                                        <h5 class="small font-weight-bold">Active Customers</h5>
                                        <h4>${customerInsights.summary.activeCustomers}</h4>
                                    </div>
                                    <div class="col-6">
                                        <h5 class="small font-weight-bold">Repeat Rate</h5>
                                        <h4>${customerInsights.customerRetention.repeatRate.toFixed(1)}%</h4>
                                    </div>
                                </div>
                                
                                <hr>
                                
                                <h5 class="small font-weight-bold">Top Customers by Spend</h5>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Purchases</th>
                                                <th>Total Spent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${customerInsights.topCustomers.map(customer => `
                                                <tr>
                                                    <td>${customer.name}</td>
                                                    <td>${customer.totalPurchases}</td>
                                                    <td>${this.formatCurrency(customer.totalSpent)}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <hr>
                                
                                <div class="row">
                                    <div class="col-6">
                                        <h5 class="small font-weight-bold">Walk-in Sales</h5>
                                        <h4>${customerInsights.summary.walkInPercentage.toFixed(1)}%</h4>
                                    </div>
                                    <div class="col-6">
                                        <h5 class="small font-weight-bold">Avg. Purchase</h5>
                                        <h4>${this.formatCurrency(profitabilityReport.averageSaleValue)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${this.renderAnalyticsScript(salesSummary, inventorySummary, customerInsights, profitabilityReport)}
            </div>
        `;
    }
    
    /**
     * Format a number as currency
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        // Get the currency symbol from settings
        const settingsStr = localStorage.getItem('appSettings');
        const settings = settingsStr ? JSON.parse(settingsStr) : {};
        const currency = settings.currency || 'Rs.';
        
        return `${currency} ${amount.toFixed(2)}`;
    }
    
    /**
     * Render the JavaScript for the analytics view
     * @param {Object} salesSummary - Sales summary data
     * @param {Object} inventorySummary - Inventory summary data  
     * @param {Object} customerInsights - Customer insights data
     * @param {Object} profitabilityReport - Profitability report data
     * @returns {string} Script HTML
     */
    renderAnalyticsScript(salesSummary, inventorySummary, customerInsights, profitabilityReport) {
        return `
            <script>
                // Handle period selection
                document.getElementById('period-select').addEventListener('change', function(e) {
                    // Redirect to the same page with a new period parameter
                    const period = e.target.value;
                    const url = new URL(window.location.href);
                    url.searchParams.set('period', period);
                    window.location.href = url.toString();
                });
                
                // Initialize charts when the page loads
                document.addEventListener('DOMContentLoaded', function() {
                    initCharts();
                });
                
                // Initialize all charts
                function initCharts() {
                    // Check if Chart.js is loaded
                    if (typeof Chart === 'undefined') {
                        // Load Chart.js if not available
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                        script.onload = function() {
                            createCharts();
                        };
                        document.head.appendChild(script);
                    } else {
                        createCharts();
                    }
                }
                
                // Create all charts
                function createCharts() {
                    // Create sales trend chart
                    createSalesTrendChart();
                    
                    // Create payment status chart
                    createPaymentStatusChart();
                }
                
                // Create the sales trend chart
                function createSalesTrendChart() {
                    const ctx = document.getElementById('salesTrendChart');
                    if (!ctx) return;
                    
                    // Prepare data from salesByDay
                    const salesByDay = ${JSON.stringify(salesSummary.salesByDay)};
                    const dates = Object.keys(salesByDay).sort();
                    const salesData = dates.map(date => salesByDay[date].total);
                    
                    // Create the chart
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: dates,
                            datasets: [{
                                label: 'Daily Sales',
                                data: salesData,
                                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                                borderColor: 'rgba(78, 115, 223, 1)',
                                pointRadius: 3,
                                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                                pointBorderColor: 'rgba(78, 115, 223, 1)',
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                                pointHitRadius: 10,
                                pointBorderWidth: 2,
                                tension: 0.3,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return '${salesSummary && salesSummary.currency || 'Rs.'} ' + value;
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return 'Sales: ${salesSummary && salesSummary.currency || 'Rs.'} ' + context.raw;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                
                // Create the payment status chart
                function createPaymentStatusChart() {
                    const ctx = document.getElementById('paymentStatusChart');
                    if (!ctx) return;
                    
                    // Prepare data from payment status
                    const paymentStatus = ${JSON.stringify(salesSummary.paymentStatus)};
                    
                    // Create the chart
                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: ['Fully Paid', 'Partially Paid', 'Unpaid'],
                            datasets: [{
                                data: [
                                    paymentStatus.fullyPaid.count,
                                    paymentStatus.partiallyPaid.count,
                                    paymentStatus.unpaid.count
                                ],
                                backgroundColor: [
                                    '#1cc88a',
                                    '#f6c23e',
                                    '#e74a3b'
                                ],
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const value = context.raw;
                                            const total = value + paymentStatus.fullyPaid.count + 
                                                paymentStatus.partiallyPaid.count + paymentStatus.unpaid.count;
                                            const percentage = Math.round((value / total) * 100);
                                            return context.label + ': ' + value + ' (' + percentage + '%)';
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            </script>
        `;
    }
}

// Create the view
const businessAnalyticsView = new BusinessAnalyticsView();
