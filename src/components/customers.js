// Customer list component
class CustomersComponent {
    constructor() {
        this.customers = [];
    }
    
    // Load customers from the database
    async loadCustomers() {
        try {
            this.customers = await db.getCustomers();
            return true;
        } catch (error) {
            console.error('Error loading customers:', error);
            return false;
        }
    }
    
    // Render the customer list
    async render() {
        await this.loadCustomers();
        
        return `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h1>Customers</h1>
                        <a href="#/customers/new" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Customer
                        </a>
                    </div>
                </div>
                
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-white">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="customer-search" 
                                       placeholder="Search customers...">
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th class="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="customers-table-body">
                                        ${this.renderCustomerRows()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Delete confirmation modal -->
            <div class="modal fade" id="deleteCustomerModal" tabindex="-1" aria-labelledby="deleteCustomerModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteCustomerModalLabel">Confirm Delete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Are you sure you want to delete this customer? This action cannot be undone.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Setup search functionality
                document.getElementById('customer-search').addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const rows = document.querySelectorAll('#customers-table-body tr');
                    
                    rows.forEach(row => {
                        const name = row.querySelector('td:first-child').textContent.toLowerCase();
                        const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                        const phone = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                        
                        if (name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm)) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
                
                // Setup delete functionality
                let customerToDelete = null;
                
                document.querySelectorAll('.delete-customer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        customerToDelete = this.dataset.id;
                        const modal = new bootstrap.Modal(document.getElementById('deleteCustomerModal'));
                        modal.show();
                    });
                });
                
                document.getElementById('confirm-delete-btn').addEventListener('click', async function() {
                    if (customerToDelete) {
                        try {
                            await db.deleteCustomer(parseInt(customerToDelete));
                            
                            // Hide modal
                            bootstrap.Modal.getInstance(document.getElementById('deleteCustomerModal')).hide();
                            
                            // Refresh the page
                            router.handleRouteChange();
                        } catch (error) {
                            console.error('Error deleting customer:', error);
                            alert('Failed to delete customer. Please try again.');
                        }
                    }
                });
            </script>
        `;
    }
    
    // Render the table rows for customers
    renderCustomerRows() {
        if (this.customers.length === 0) {
            return `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="text-muted">
                            <i class="fas fa-users fa-2x mb-3"></i>
                            <p>No customers found.</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        return this.customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td class="text-end">
                    <a href="#/customers/view/${customer.id}" class="btn btn-sm btn-info me-1">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="#/customers/edit/${customer.id}" class="btn btn-sm btn-primary me-1">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn btn-sm btn-danger delete-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Export the component
const customersComponent = new CustomersComponent();
