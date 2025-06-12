/**
 * Sales component for managing sales transactions
 * Main component for listing, filtering and basic CRUD operations
 */
class SalesComponent {
    constructor() {
        // Component state
        this.sales = [];
        this.filteredSales = [];
        this.filter = '';
        this.sortField = 'sale_date';
        this.sortDirection = 'desc';
        this.customers = [];
    }
    
    /**
     * Initialize the component
     */
    async init() {
        try {
            // Load sales from database
            this.sales = await db.getSales();
            
            // Load customers for name display
            this.customers = await db.getCustomers();
            
            this.filterSales();
            return this.render();
        } catch (error) {
            console.error('Error initializing sales component:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    Failed to load sales. Please try refreshing the page.
                </div>
            `;
        }
    }
    
    /**
     * Render the sales list view
     */
    render() {
        return `
            <div class="sales-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Sales</h1>
                    <a href="#/sales/new" class="btn btn-primary">
                        <i class="fas fa-plus"></i> New Sale
                    </a>
                </div>
                
                <!-- Search and filter controls -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input type="text" id="sale-search" class="form-control" 
                                       placeholder="Search sales..." aria-label="Search sales">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <select id="sale-status-filter" class="form-select">
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="partial">Partially Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select id="sale-sort" class="form-select">
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="amount-desc">Amount (High to Low)</option>
                                    <option value="amount-asc">Amount (Low to High)</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <button id="sale-refresh" class="btn btn-outline-secondary w-100">
                                    <i class="fas fa-sync-alt"></i> Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sales list -->
                <div class="card">
                    <div class="list-group list-group-flush" id="sales-list">
                        ${this.renderSalesList()}
                    </div>
                </div>
                
                ${this.renderSalesScript()}
            </div>
        `;
    }
    
    /**
     * Render the sales list based on current filters and sorting
     */
    renderSalesList() {
        if (this.filteredSales.length === 0) {
            return `
                <div class="list-group-item text-center py-4">
                    <i class="fas fa-shopping-cart fa-2x mb-3 text-muted"></i>
                    <p class="mb-0 text-muted">No sales found</p>
                    <p class="text-muted small">Add your first sale to get started</p>
                </div>
            `;
        }
        
        return this.filteredSales.map(sale => {
            // Find customer name
            const customer = this.customers.find(c => c.id === sale.customer_id) || { name: 'Unknown Customer' };
            
            // Format date
            const saleDate = new Date(sale.sale_date);
            const formattedDate = saleDate.toLocaleDateString();
            
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
                <a href="#/sales/${sale.id}" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">Sale #${sale.id} - ${customer.name}</h5>
                            <p class="mb-1">
                                <i class="fas fa-calendar-alt me-1"></i> ${formattedDate}
                                <span class="ms-3">
                                    <i class="fas fa-shopping-bag me-1"></i> ${sale.item_count || '—'} items
                                </span>
                            </p>
                        </div>
                        <div class="text-end">
                            <h5 class="mb-1">Rs. ${sale.final_amount.toFixed(2)}</h5>
                            <span class="badge ${statusClass}">
                                ${this.formatStatus(sale.payment_status)}
                            </span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }
    
    /**
     * Filter sales based on search query and selected filters
     */
    filterSales() {
        this.filteredSales = [...this.sales];
        
        // Apply filters if needed
        
        // Apply sorting
        this.sortSales();
    }
    
    /**
     * Sort sales based on the selected sort field and direction
     */
    sortSales() {
        if (this.sortField === 'sale_date') {
            this.filteredSales.sort((a, b) => {
                const dateA = new Date(a.sale_date);
                const dateB = new Date(b.sale_date);
                return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            });
        } else if (this.sortField === 'final_amount') {
            this.filteredSales.sort((a, b) => {
                return this.sortDirection === 'asc' ? a.final_amount - b.final_amount : b.final_amount - a.final_amount;
            });
        }
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
     * Render the JavaScript for sales list interactions
     */
    renderSalesScript() {
        return `
            <script>
                // Handle search filter
                document.getElementById('sale-search').addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    filterSalesList(searchTerm);
                });
                
                // Handle status filter
                document.getElementById('sale-status-filter').addEventListener('change', function(e) {
                    const statusFilter = e.target.value;
                    filterSalesByStatus(statusFilter);
                });
                
                // Handle sort change
                document.getElementById('sale-sort').addEventListener('change', function(e) {
                    const sortValue = e.target.value;
                    sortSalesList(sortValue);
                });
                
                // Handle refresh button
                document.getElementById('sale-refresh').addEventListener('click', function() {
                    window.location.reload();
                });
                
                // Filter sales list based on search term
                function filterSalesList(searchTerm) {
                    const salesItems = document.querySelectorAll('#sales-list .list-group-item');
                    salesItems.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        if (text.includes(searchTerm)) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
                
                // Filter sales by status
                function filterSalesByStatus(status) {
                    if (status === 'all') {
                        document.querySelectorAll('#sales-list .list-group-item').forEach(item => {
                            item.style.display = '';
                        });
                        return;
                    }
                    
                    const salesItems = document.querySelectorAll('#sales-list .list-group-item');
                    salesItems.forEach(item => {
                        const statusText = item.querySelector('.badge').textContent.toLowerCase();
                        
                        if (status === 'paid' && statusText.includes('paid') && !statusText.includes('partially')) {
                            item.style.display = '';
                        } else if (status === 'partial' && statusText.includes('partially')) {
                            item.style.display = '';
                        } else if (status === 'unpaid' && statusText.includes('unpaid')) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
                
                // Sort sales list
                function sortSalesList(sortValue) {
                    // In a real app, we'd refetch or resort
                    // For now, just reload the page with a sort parameter
                    window.location.reload();
                }
            </script>
        `;
    }
}

// Export the component
window.SalesComponent = SalesComponent;
