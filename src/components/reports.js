/**
 * Reports component for generating and displaying business reports
 */
class ReportsComponent {
    constructor() {
        // Default date range (current month)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        this.startDate = firstDay.toISOString().split('T')[0];
        this.endDate = lastDay.toISOString().split('T')[0];
        this.reportType = 'sales';
        
        // Data storage
        this.sales = [];
        this.customers = [];
        this.items = [];
        this.payments = [];
    }
    
    /**
     * Initialize the component
     */
    async init() {
        try {
            // Load data from database based on date range
            await this.loadData();
            return this.render();
        } catch (error) {
            console.error('Error initializing reports component:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    Failed to load reports. Please try refreshing the page.
                </div>
            `;
        }
    }
    
    /**
     * Load data from database
     */
    async loadData() {
        // Load all data
        this.sales = await db.getSales();
        this.customers = await db.getCustomers();
        this.items = await db.getItems();
        
        // Filter sales by date range
        this.sales = this.sales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            end.setHours(23, 59, 59); // Include the entire end day
            
            return saleDate >= start && saleDate <= end;
        });
        
        // Load all payments for the filtered sales
        this.payments = [];
        for (const sale of this.sales) {
            const payments = await db.getPayments(sale.id);
            this.payments.push(...payments);
        }
    }
    
    /**
     * Render the reports view
     */
    render() {
        return `
            <div class="reports-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Reports</h1>
                    <button id="print-report-btn" class="btn btn-outline-secondary">
                        <i class="fas fa-print"></i> Print Report
                    </button>
                </div>
                
                <!-- Report settings -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label for="report-type" class="form-label">Report Type</label>
                                <select id="report-type" class="form-select">
                                    <option value="sales" ${this.reportType === 'sales' ? 'selected' : ''}>Sales Report</option>
                                    <option value="inventory" ${this.reportType === 'inventory' ? 'selected' : ''}>Inventory Report</option>
                                    <option value="customers" ${this.reportType === 'customers' ? 'selected' : ''}>Customer Report</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="start-date" class="form-label">From Date</label>
                                <input type="date" id="start-date" class="form-control" 
                                       value="${this.startDate}">
                            </div>
                            <div class="col-md-3">
                                <label for="end-date" class="form-label">To Date</label>
                                <input type="date" id="end-date" class="form-control" 
                                       value="${this.endDate}">
                            </div>
                            <div class="col-md-2">
                                <label class="d-block">&nbsp;</label>
                                <button id="generate-report-btn" class="btn btn-primary w-100">
                                    <i class="fas fa-sync-alt"></i> Generate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Report content -->
                <div class="report-content">
                    ${this.renderReportContent()}
                </div>
                
                ${this.renderReportScript()}
            </div>
        `;
    }
    
    /**
     * Render the appropriate report content based on report type
     */
    renderReportContent() {
        switch (this.reportType) {
            case 'sales':
                return this.renderSalesReport();
            case 'inventory':
                return this.renderInventoryReport();
            case 'customers':
                return this.renderCustomerReport();
            default:
                return `<div class="alert alert-warning">Select a report type to generate</div>`;
        }
    }
    
    /**
     * Render sales report
     */
    renderSalesReport() {
        // Calculate summary data
        const totalSales = this.sales.length;
        const totalAmount = this.sales.reduce((sum, sale) => sum + sale.final_amount, 0);
        const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalUnpaid = totalAmount - totalPaid;
        
        // Calculate sales by date for chart
        const salesByDate = {};
        
        this.sales.forEach(sale => {
            const dateStr = sale.sale_date;
            if (!salesByDate[dateStr]) {
                salesByDate[dateStr] = {
                    count: 0,
                    amount: 0
                };
            }
            
            salesByDate[dateStr].count += 1;
            salesByDate[dateStr].amount += sale.final_amount;
        });
        
        // Sort dates
        const sortedDates = Object.keys(salesByDate).sort();
        
        return `
            <div class="sales-report">
                <h2>Sales Report</h2>
                <p class="text-muted">
                    Period: ${new Date(this.startDate).toLocaleDateString()} - ${new Date(this.endDate).toLocaleDateString()}
                </p>
                
                <!-- Summary cards -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Sales</h6>
                                <h3 class="card-title mb-0">${totalSales}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Amount</h6>
                                <h3 class="card-title mb-0">Rs. ${totalAmount.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Amount Collected</h6>
                                <h3 class="card-title mb-0">Rs. ${totalPaid.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Amount Due</h6>
                                <h3 class="card-title mb-0 ${totalUnpaid > 0 ? 'text-danger' : ''}">Rs. ${totalUnpaid.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sales chart -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Sales Trend</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="sales-chart" height="300"></canvas>
                    </div>
                </div>
                
                <!-- Latest sales table -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Sales Details</h5>
                        <a href="#/sales" class="btn btn-sm btn-outline-primary">View All Sales</a>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Items</th>
                                    <th scope="col" class="text-end">Amount</th>
                                    <th scope="col" class="text-end">Status</th>
                                    <th scope="col" class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderSalesTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render inventory report
     */
    renderInventoryReport() {
        // Calculate summary data
        const totalItems = this.items.length;
        const totalQuantity = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalValue = this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
        
        // Get low stock items (less than 10 quantity)
        const lowStockItems = this.items.filter(item => (item.quantity || 0) < 10);
        
        return `
            <div class="inventory-report">
                <h2>Inventory Report</h2>
                <p class="text-muted">
                    Generated on ${new Date().toLocaleDateString()}
                </p>
                
                <!-- Summary cards -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Items</h6>
                                <h3 class="card-title mb-0">${totalItems}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Quantity</h6>
                                <h3 class="card-title mb-0">${totalQuantity}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Value</h6>
                                <h3 class="card-title mb-0">Rs. ${totalValue.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Low stock items -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Low Stock Items</h5>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Item Name</th>
                                    <th scope="col" class="text-end">Price</th>
                                    <th scope="col" class="text-end">Quantity</th>
                                    <th scope="col" class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderLowStockItems(lowStockItems)}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- All items table -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">All Items</h5>
                        <a href="#/items" class="btn btn-sm btn-outline-primary">Manage Items</a>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Item Name</th>
                                    <th scope="col" class="text-end">Price</th>
                                    <th scope="col" class="text-end">Quantity</th>
                                    <th scope="col" class="text-end">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderItemsTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render customer report
     */
    renderCustomerReport() {
        // Calculate summary data
        const totalCustomers = this.customers.length;
        
        // Calculate customer sales data
        const customerSalesData = [];
        
        this.customers.forEach(customer => {
            // Get sales for this customer
            const customerSales = this.sales.filter(sale => sale.customer_id === customer.id);
            const totalSales = customerSales.length;
            const totalSpent = customerSales.reduce((sum, sale) => sum + sale.final_amount, 0);
            
            // Get last sale date
            let lastSaleDate = null;
            if (customerSales.length > 0) {
                lastSaleDate = new Date(Math.max(...customerSales.map(s => new Date(s.sale_date))));
            }
            
            customerSalesData.push({
                customer,
                totalSales,
                totalSpent,
                lastSaleDate
            });
        });
        
        // Sort by total spent
        customerSalesData.sort((a, b) => b.totalSpent - a.totalSpent);
        
        // Get top customers (top 5)
        const topCustomers = customerSalesData.slice(0, 5);
        
        return `
            <div class="customer-report">
                <h2>Customer Report</h2>
                <p class="text-muted">
                    Period: ${new Date(this.startDate).toLocaleDateString()} - ${new Date(this.endDate).toLocaleDateString()}
                </p>
                
                <!-- Summary cards -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Customers</h6>
                                <h3 class="card-title mb-0">${totalCustomers}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Active Customers</h6>
                                <h3 class="card-title mb-0">${customerSalesData.filter(c => c.totalSales > 0).length}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Avg. Sale Value</h6>
                                <h3 class="card-title mb-0">Rs. ${this.sales.length > 0 ? 
                                    (this.sales.reduce((sum, sale) => sum + sale.final_amount, 0) / this.sales.length).toFixed(2) : 
                                    '0.00'}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Top customers -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Top Customers</h5>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Contact</th>
                                    <th scope="col" class="text-end">Sales Count</th>
                                    <th scope="col" class="text-end">Total Spent</th>
                                    <th scope="col">Last Purchase</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderTopCustomersTable(topCustomers)}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- All customers table -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">All Customers</h5>
                        <a href="#/customers" class="btn btn-sm btn-outline-primary">Manage Customers</a>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Contact</th>
                                    <th scope="col" class="text-end">Sales Count</th>
                                    <th scope="col" class="text-end">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderCustomersTable(customerSalesData)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render sales table for the sales report
     */
    renderSalesTable() {
        if (this.sales.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="text-center">No sales found for the selected period</td>
                </tr>
            `;
        }
        
        // Sort sales by date, newest first
        const sortedSales = [...this.sales].sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
        
        return sortedSales.map(sale => {
            const customer = this.customers.find(c => c.id === sale.customer_id) || { name: 'Unknown Customer' };
            const saleDate = new Date(sale.sale_date).toLocaleDateString();
            
            // Determine status class
            let statusClass = 'bg-secondary';
            if (sale.payment_status === 'paid') {
                statusClass = 'bg-success';
            } else if (sale.payment_status === 'partial') {
                statusClass = 'bg-warning text-dark';
            } else if (sale.payment_status === 'unpaid') {
                statusClass = 'bg-danger';
            }
            
            return `
                <tr>
                    <td>${sale.id}</td>
                    <td>${saleDate}</td>
                    <td>${customer.name}</td>
                    <td>${sale.item_count || '—'}</td>
                    <td class="text-end">Rs. ${sale.final_amount.toFixed(2)}</td>
                    <td class="text-end">
                        <span class="badge ${statusClass}">${this.formatStatus(sale.payment_status)}</span>
                    </td>
                    <td class="text-center">
                        <a href="#/sales/${sale.id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Render low stock items table
     */
    renderLowStockItems(items) {
        if (items.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center">No low stock items found</td>
                </tr>
            `;
        }
        
        return items.map(item => {
            return `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td class="text-end">Rs. ${item.price.toFixed(2)}</td>
                    <td class="text-end">${item.quantity || 0}</td>
                    <td class="text-center">
                        <a href="#/items/${item.id}" class="btn btn-sm btn-outline-primary me-1">
                            <i class="fas fa-eye"></i>
                        </a>
                        <a href="#/items/${item.id}/edit" class="btn btn-sm btn-outline-warning">
                            <i class="fas fa-edit"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Render items table for the inventory report
     */
    renderItemsTable() {
        if (this.items.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center">No items found</td>
                </tr>
            `;
        }
        
        // Sort items by name
        const sortedItems = [...this.items].sort((a, b) => a.name.localeCompare(b.name));
        
        return sortedItems.map(item => {
            const totalValue = item.price * (item.quantity || 0);
            
            return `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td class="text-end">Rs. ${item.price.toFixed(2)}</td>
                    <td class="text-end">${item.quantity || 0}</td>
                    <td class="text-end">Rs. ${totalValue.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Render top customers table
     */
    renderTopCustomersTable(customers) {
        if (customers.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center">No customers found</td>
                </tr>
            `;
        }
        
        return customers.map(data => {
            const { customer, totalSales, totalSpent, lastSaleDate } = data;
            
            return `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.phone || customer.email || '—'}</td>
                    <td class="text-end">${totalSales}</td>
                    <td class="text-end">Rs. ${totalSpent.toFixed(2)}</td>
                    <td>${lastSaleDate ? lastSaleDate.toLocaleDateString() : '—'}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Render customers table for the customer report
     */
    renderCustomersTable(customersData) {
        if (customersData.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center">No customers found</td>
                </tr>
            `;
        }
        
        return customersData.map(data => {
            const { customer, totalSales, totalSpent } = data;
            
            return `
                <tr>
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.phone || customer.email || '—'}</td>
                    <td class="text-end">${totalSales}</td>
                    <td class="text-end">Rs. ${totalSpent.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Format status for display
     */
    formatStatus(status) {
        switch(status) {
            case 'paid': return 'Paid';
            case 'partial': return 'Partially Paid';
            case 'unpaid': return 'Unpaid';
            default: return 'Unknown';
        }
    }
    
    /**
     * Render the JavaScript for this component
     */
    renderReportScript() {
        return `
            <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
            <script>
                // Load Chart.js if it's not loaded yet
                if (typeof Chart === 'undefined') {
                    const chartScript = document.createElement('script');
                    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
                    document.head.appendChild(chartScript);
                    
                    // Wait for chart.js to load
                    chartScript.onload = initializeCharts;
                } else {
                    initializeCharts();
                }
                
                // Handle report type change
                document.getElementById('report-type').addEventListener('change', function(e) {
                    const reportType = e.target.value;
                    updateReportType(reportType);
                });
                
                // Handle date range change
                document.getElementById('start-date').addEventListener('change', function(e) {
                    const startDate = e.target.value;
                    storeDateRange(startDate, document.getElementById('end-date').value);
                });
                
                document.getElementById('end-date').addEventListener('change', function(e) {
                    const endDate = e.target.value;
                    storeDateRange(document.getElementById('start-date').value, endDate);
                });
                
                // Handle generate report button
                document.getElementById('generate-report-btn').addEventListener('click', function() {
                    generateReport();
                });
                
                // Handle print report button
                document.getElementById('print-report-btn').addEventListener('click', function() {
                    window.print();
                });
                
                // Update the report type in session storage
                function updateReportType(reportType) {
                    sessionStorage.setItem('reportType', reportType);
                }
                
                // Store date range in session storage
                function storeDateRange(startDate, endDate) {
                    sessionStorage.setItem('reportStartDate', startDate);
                    sessionStorage.setItem('reportEndDate', endDate);
                }
                
                // Generate report with current settings
                function generateReport() {
                    const reportType = document.getElementById('report-type').value;
                    const startDate = document.getElementById('start-date').value;
                    const endDate = document.getElementById('end-date').value;
                    
                    // Validate dates
                    if (new Date(startDate) > new Date(endDate)) {
                        alert('Start date cannot be after end date');
                        return;
                    }
                    
                    // Store settings
                    updateReportType(reportType);
                    storeDateRange(startDate, endDate);
                    
                    // Refresh page with new settings
                    window.location.reload();
                }
                
                // Initialize charts based on report type
                function initializeCharts() {
                    const reportType = '${this.reportType}';
                    
                    if (reportType === 'sales' && document.getElementById('sales-chart')) {
                        initializeSalesChart();
                    }
                }
                
                // Initialize sales chart
                function initializeSalesChart() {
                    const ctx = document.getElementById('sales-chart').getContext('2d');
                    
                    // Prepare sales data by date
                    const sales = ${JSON.stringify(this.sales)};
                    const salesByDate = {};
                    
                    sales.forEach(sale => {
                        const dateStr = sale.sale_date;
                        if (!salesByDate[dateStr]) {
                            salesByDate[dateStr] = {
                                count: 0,
                                amount: 0
                            };
                        }
                        
                        salesByDate[dateStr].count += 1;
                        salesByDate[dateStr].amount += sale.final_amount;
                    });
                    
                    // Sort dates
                    const sortedDates = Object.keys(salesByDate).sort();
                    
                    // Prepare chart data
                    const chartData = {
                        labels: sortedDates.map(date => {
                            const d = new Date(date);
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        datasets: [
                            {
                                label: 'Sales Amount',
                                data: sortedDates.map(date => salesByDate[date].amount),
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Sales Count',
                                data: sortedDates.map(date => salesByDate[date].count),
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1,
                                type: 'line',
                                yAxisID: 'y1'
                            }
                        ]
                    };
                    
                    // Create chart
                    const salesChart = new Chart(ctx, {
                        type: 'bar',
                        data: chartData,
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    title: {
                                        display: true,
                                        text: 'Amount (Rs.)'
                                    }
                                },
                                y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    title: {
                                        display: true,
                                        text: 'Number of Sales'
                                    },
                                    grid: {
                                        drawOnChartArea: false
                                    }
                                }
                            }
                        }
                    });
                }
            </script>
            
            <style>
                @media print {
                    .navbar, .footer, .btn, button {
                        display: none !important;
                    }
                    
                    .card {
                        break-inside: avoid;
                    }
                    
                    .card-header {
                        background-color: #f8f9fa !important;
                        color: #000 !important;
                    }
                    
                    body {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .container {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            </style>
        `;
    }
}

// Export the component
window.ReportsComponent = ReportsComponent;
