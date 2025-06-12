// New customer form view
class NewCustomerView {
    constructor() {
        this.formData = {
            name: '',
            email: '',
            phone: '',
            address: '',
            notes: ''
        };
    }
    
    // Render the new customer form
    render() {
        return `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h1>Add New Customer</h1>
                        <a href="#/customers" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Back to Customers
                        </a>
                    </div>
                </div>
                
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">Customer Information</h5>
                        </div>
                        <div class="card-body">
                            <form id="new-customer-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="name" name="name" required>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email" name="email">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="phone" class="form-label">Phone</label>
                                        <input type="tel" class="form-control" id="phone" name="phone">
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label for="address" class="form-label">Address</label>
                                        <input type="text" class="form-control" id="address" name="address">
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="notes" class="form-label">Notes</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="3"></textarea>
                                </div>
                                
                                <div class="d-flex justify-content-end">
                                    <button type="reset" class="btn btn-secondary me-2">Clear</button>
                                    <button type="submit" class="btn btn-primary">Save Customer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Handle form submission
                document.getElementById('new-customer-form').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const customer = {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        notes: document.getElementById('notes').value,
                        created_at: new Date().toISOString()
                    };
                    
                    try {
                        // Save customer to database
                        const id = await db.addCustomer(customer);
                        
                        // Show success message and redirect
                        alert('Customer added successfully!');
                        router.navigateTo('/customers');
                    } catch (error) {
                        console.error('Error adding customer:', error);
                        alert('Failed to add customer. Please try again.');
                    }
                });
            </script>
        `;
    }
}

// Export the view
const newCustomerView = new NewCustomerView();
