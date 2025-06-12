/**
 * New Sale view component
 * Implements a multi-step process for creating a new sale
 */
class NewSaleView {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.customers = [];
        this.items = [];
        this.sale = {
            customer_id: null,
            sale_date: new Date().toISOString().split('T')[0],
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            final_amount: 0,
            payment_status: 'unpaid',
            notes: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
    
    /**
     * Initialize the view
     */
    async init() {
        try {
            // Load customers and items from database
            this.customers = await db.getCustomers();
            this.items = await db.getItems();
            
            return this.render();
        } catch (error) {
            console.error('Error initializing new sale view:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    Failed to load the new sale form. Please try refreshing the page.
                </div>
            `;
        }
    }
    
    /**
     * Render the new sale form
     */
    render() {
        return `
            <div class="new-sale-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>New Sale</h1>
                    <a href="#/sales" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Sales
                    </a>
                </div>
                
                <!-- Steps progress -->
                <div class="card mb-4">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between position-relative mb-4">
                            <!-- Step indicators -->
                            <div class="step-indicator ${this.currentStep >= 1 ? 'active' : ''}">
                                <div class="step-number">1</div>
                                <div class="step-title">Customer</div>
                            </div>
                            <div class="step-indicator ${this.currentStep >= 2 ? 'active' : ''}">
                                <div class="step-number">2</div>
                                <div class="step-title">Items</div>
                            </div>
                            <div class="step-indicator ${this.currentStep >= 3 ? 'active' : ''}">
                                <div class="step-number">3</div>
                                <div class="step-title">Payment</div>
                            </div>
                            
                            <!-- Progress bar -->
                            <div class="progress position-absolute top-50 start-0 end-0 translate-middle-y" style="height: 2px; z-index: -1;">
                                <div class="progress-bar" role="progressbar" 
                                    style="width: ${((this.currentStep - 1) / (this.totalSteps - 1)) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Current step form -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderCurrentStep()}
                    </div>
                </div>
                
                ${this.renderSaleScript()}
            </div>
        `;
    }
    
    /**
     * Render the current step content
     */
    renderCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.renderCustomerStep();
            case 2:
                return this.renderItemsStep();
            case 3:
                return this.renderPaymentStep();
            default:
                return `<div class="alert alert-danger">Invalid step</div>`;
        }
    }
    
    /**
     * Step 1: Customer selection
     */
    renderCustomerStep() {
        const hasCustomers = this.customers && this.customers.length > 0;
        
        return `
            <h3 class="card-title">Select Customer</h3>
            <p class="text-muted mb-4">Choose an existing customer or create a new one</p>
            
            ${!hasCustomers ? `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No customers found. Create a new customer to continue.
                </div>
            ` : ''}
            
            <div class="mb-4">
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" id="customer-search" class="form-control" 
                        placeholder="Search customers..." aria-label="Search customers">
                </div>
            </div>
            
            <div class="customer-list mb-4" style="max-height: 300px; overflow-y: auto;">
                <div class="list-group" id="customer-list">
                    ${this.renderCustomerList()}
                </div>
            </div>
            
            <div class="text-center mb-4">
                <p>Don't see the customer?</p>
                <a href="#/customers/new" class="btn btn-outline-success">
                    <i class="fas fa-user-plus"></i> Create New Customer
                </a>
            </div>
            
            <div class="d-flex justify-content-between mt-4">
                <a href="#/sales" class="btn btn-outline-secondary">
                    <i class="fas fa-times"></i> Cancel
                </a>
                <button id="next-step-btn" class="btn btn-primary" disabled>
                    <i class="fas fa-arrow-right"></i> Next Step
                </button>
            </div>
        `;
    }
    
    /**
     * Step 2: Item selection
     */
    renderItemsStep() {
        const hasItems = this.items && this.items.length > 0;
        
        // Find the selected customer
        const customer = this.customers.find(c => c.id === this.sale.customer_id) || { name: 'Unknown Customer' };
        
        return `
            <h3 class="card-title">Select Items</h3>
            <p class="text-muted mb-4">
                Customer: <strong>${customer.name}</strong>
            </p>
            
            ${!hasItems ? `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No items found. Create items first to continue.
                </div>
            ` : ''}
            
            <div class="mb-4">
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" id="item-search" class="form-control" 
                        placeholder="Search items..." aria-label="Search items">
                </div>
            </div>
            
            <!-- Available items list -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Available Items</h5>
                    <div class="available-items-list" style="max-height: 300px; overflow-y: auto;">
                        <div class="list-group" id="available-items-list">
                            ${this.renderAvailableItemsList()}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>Selected Items</h5>
                    <div class="selected-items-list" style="max-height: 300px; overflow-y: auto;">
                        <div class="list-group" id="selected-items-list">
                            ${this.renderSelectedItemsList()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Sale summary -->
            <div class="card bg-light mb-4">
                <div class="card-body">
                    <h5 class="card-title">Sale Summary</h5>
                    <div class="row">
                        <div class="col-6">Items Count:</div>
                        <div class="col-6 text-end" id="items-count">0</div>
                    </div>
                    <div class="row">
                        <div class="col-6">Subtotal:</div>
                        <div class="col-6 text-end" id="subtotal">Rs. 0.00</div>
                    </div>
                </div>
            </div>
            
            <div class="d-flex justify-content-between mt-4">
                <button id="prev-step-btn" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button id="next-step-btn" class="btn btn-primary" ${this.sale.items.length === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-right"></i> Next Step
                </button>
            </div>
        `;
    }
    
    /**
     * Step 3: Payment details
     */
    renderPaymentStep() {
        // Find the selected customer
        const customer = this.customers.find(c => c.id === this.sale.customer_id) || { name: 'Unknown Customer' };
        
        return `
            <h3 class="card-title">Payment Details</h3>
            <p class="text-muted mb-4">
                Customer: <strong>${customer.name}</strong> | 
                Items: <strong>${this.sale.items.length}</strong>
            </p>
            
            <!-- Sale summary -->
            <div class="card bg-light mb-4">
                <div class="card-body">
                    <h5 class="card-title">Sale Summary</h5>
                    <div class="row mb-2">
                        <div class="col-6">Subtotal:</div>
                        <div class="col-6 text-end">Rs. ${this.sale.subtotal.toFixed(2)}</div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="input-group mb-2">
                                <span class="input-group-text">Discount</span>
                                <input type="number" class="form-control" id="discount-amount" 
                                    min="0" step="0.01" value="${this.sale.discount}">
                                <span class="input-group-text">Rs.</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group mb-2">
                                <span class="input-group-text">Tax</span>
                                <input type="number" class="form-control" id="tax-amount" 
                                    min="0" step="0.01" value="${this.sale.tax}">
                                <span class="input-group-text">Rs.</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-6"><strong>Final Amount:</strong></div>
                        <div class="col-6 text-end"><strong id="final-amount">Rs. ${this.sale.final_amount.toFixed(2)}</strong></div>
                    </div>
                </div>
            </div>
            
            <!-- Payment information -->
            <div class="mb-4">
                <h5>Payment Information</h5>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="payment-status" class="form-label">Payment Status</label>
                            <select class="form-select" id="payment-status">
                                <option value="paid">Paid</option>
                                <option value="partial">Partially Paid</option>
                                <option value="unpaid" selected>Unpaid</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="payment-amount" class="form-label">Amount Paid</label>
                            <div class="input-group">
                                <span class="input-group-text">Rs.</span>
                                <input type="number" class="form-control" id="payment-amount" 
                                    min="0" step="0.01" value="0">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="sale-notes" class="form-label">Notes</label>
                    <textarea class="form-control" id="sale-notes" rows="2"
                        placeholder="Add any notes about this sale"></textarea>
                </div>
            </div>
            
            <div class="d-flex justify-content-between mt-4">
                <button id="prev-step-btn" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button id="complete-sale-btn" class="btn btn-success">
                    <i class="fas fa-check-circle"></i> Complete Sale
                </button>
            </div>
        `;
    }
    
    /**
     * Render the customer list
     */
    renderCustomerList() {
        if (!this.customers || this.customers.length === 0) {
            return `
                <div class="list-group-item text-center py-3">
                    <p class="mb-0 text-muted">No customers found</p>
                </div>
            `;
        }
        
        return this.customers.map(customer => `
            <button type="button" class="list-group-item list-group-item-action customer-item" 
                    data-customer-id="${customer.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${customer.name}</h5>
                    <small>${customer.phone || 'No phone'}</small>
                </div>
                <p class="mb-1">${customer.email || 'No email'}</p>
            </button>
        `).join('');
    }
    
    /**
     * Render the available items list
     */
    renderAvailableItemsList() {
        if (!this.items || this.items.length === 0) {
            return `
                <div class="list-group-item text-center py-3">
                    <p class="mb-0 text-muted">No items found</p>
                </div>
            `;
        }
        
        return this.items.map(item => `
            <button type="button" class="list-group-item list-group-item-action item-select" 
                    data-item-id="${item.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${item.name}</h5>
                    <strong>Rs. ${item.price.toFixed(2)}</strong>
                </div>
                <p class="mb-1">${item.description || 'No description'}</p>
                <small>Available: ${item.quantity || 'Not tracked'}</small>
            </button>
        `).join('');
    }
    
    /**
     * Render the selected items list
     */
    renderSelectedItemsList() {
        if (!this.sale.items || this.sale.items.length === 0) {
            return `
                <div class="list-group-item text-center py-3">
                    <p class="mb-0 text-muted">No items selected yet</p>
                </div>
            `;
        }
        
        return this.sale.items.map((saleItem, index) => {
            const item = this.items.find(i => i.id === saleItem.item_id);
            if (!item) return '';
            
            return `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${item.name}</h5>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-item" 
                                data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div class="input-group" style="width: 140px">
                            <button class="btn btn-outline-secondary decrement-qty" 
                                    type="button" data-index="${index}">-</button>
                            <input type="number" class="form-control text-center item-qty" 
                                   value="${saleItem.quantity}" min="1" data-index="${index}">
                            <button class="btn btn-outline-secondary increment-qty" 
                                    type="button" data-index="${index}">+</button>
                        </div>
                        <div class="price-info">
                            <span class="price">${item.price.toFixed(2)}</span> × 
                            <span class="quantity">${saleItem.quantity}</span> = 
                            <strong>Rs. ${(item.price * saleItem.quantity).toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Render the JavaScript for this view
     */
    renderSaleScript() {
        return `
            <script>
                // Step-specific initialization
                const currentStep = ${this.currentStep};
                initializeStepFunctionality(currentStep);
                
                // Initialize step functionality based on current step
                function initializeStepFunctionality(step) {
                    if (step === 1) {
                        initCustomerStep();
                    } else if (step === 2) {
                        initItemsStep();
                    } else if (step === 3) {
                        initPaymentStep();
                    }
                    
                    // Navigation buttons
                    document.getElementById('prev-step-btn')?.addEventListener('click', function() {
                        previousStep();
                    });
                    
                    document.getElementById('next-step-btn')?.addEventListener('click', function() {
                        nextStep();
                    });
                }
                
                // Step 1: Customer selection
                function initCustomerStep() {
                    // Customer search functionality
                    document.getElementById('customer-search')?.addEventListener('input', function(e) {
                        const searchTerm = e.target.value.toLowerCase();
                        document.querySelectorAll('.customer-item').forEach(item => {
                            if (item.textContent.toLowerCase().includes(searchTerm)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                    
                    // Customer selection
                    document.querySelectorAll('.customer-item').forEach(item => {
                        item.addEventListener('click', function() {
                            // Deselect all customers
                            document.querySelectorAll('.customer-item').forEach(el => {
                                el.classList.remove('active');
                            });
                            
                            // Select this customer
                            this.classList.add('active');
                            
                            // Enable next button
                            document.getElementById('next-step-btn').disabled = false;
                            
                            // Store selected customer
                            const customerId = parseInt(this.getAttribute('data-customer-id'));
                            storeSaleData('customer_id', customerId);
                        });
                    });
                }
                
                // Step 2: Items selection
                function initItemsStep() {
                    // Items search functionality
                    document.getElementById('item-search')?.addEventListener('input', function(e) {
                        const searchTerm = e.target.value.toLowerCase();
                        document.querySelectorAll('.item-select').forEach(item => {
                            if (item.textContent.toLowerCase().includes(searchTerm)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                    
                    // Add item to sale
                    document.querySelectorAll('.item-select').forEach(item => {
                        item.addEventListener('click', function() {
                            const itemId = parseInt(this.getAttribute('data-item-id'));
                            addItemToSale(itemId);
                        });
                    });
                    
                    // Remove item from sale
                    document.querySelectorAll('.remove-item').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const index = parseInt(this.getAttribute('data-index'));
                            removeItemFromSale(index);
                        });
                    });
                    
                    // Change item quantity
                    document.querySelectorAll('.increment-qty').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const index = parseInt(this.getAttribute('data-index'));
                            incrementItemQuantity(index);
                        });
                    });
                    
                    document.querySelectorAll('.decrement-qty').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const index = parseInt(this.getAttribute('data-index'));
                            decrementItemQuantity(index);
                        });
                    });
                    
                    document.querySelectorAll('.item-qty').forEach(input => {
                        input.addEventListener('change', function() {
                            const index = parseInt(this.getAttribute('data-index'));
                            const newQty = parseInt(this.value) || 1;
                            updateItemQuantity(index, newQty);
                        });
                    });
                    
                    // Update subtotal
                    updateItemsCount();
                    updateSubtotal();
                }
                
                // Step 3: Payment
                function initPaymentStep() {
                    // Handle discount changes
                    document.getElementById('discount-amount')?.addEventListener('change', function() {
                        const discount = parseFloat(this.value) || 0;
                        storeSaleData('discount', discount);
                        updateFinalAmount();
                    });
                    
                    // Handle tax changes
                    document.getElementById('tax-amount')?.addEventListener('change', function() {
                        const tax = parseFloat(this.value) || 0;
                        storeSaleData('tax', tax);
                        updateFinalAmount();
                    });
                    
                    // Handle payment status changes
                    document.getElementById('payment-status')?.addEventListener('change', function() {
                        storeSaleData('payment_status', this.value);
                    });
                    
                    // Handle payment amount changes
                    document.getElementById('payment-amount')?.addEventListener('change', function() {
                        const amount = parseFloat(this.value) || 0;
                        storeSaleData('payment_amount', amount);
                        
                        // Update payment status based on amount
                        const finalAmount = getSaleData('final_amount');
                        let status = 'unpaid';
                        
                        if (amount >= finalAmount) {
                            status = 'paid';
                        } else if (amount > 0) {
                            status = 'partial';
                        }
                        
                        document.getElementById('payment-status').value = status;
                        storeSaleData('payment_status', status);
                    });
                    
                    // Handle notes changes
                    document.getElementById('sale-notes')?.addEventListener('input', function() {
                        storeSaleData('notes', this.value);
                    });
                    
                    // Complete sale button
                    document.getElementById('complete-sale-btn')?.addEventListener('click', async function() {
                        await completeSale();
                    });
                    
                    // Initialize final amount
                    updateFinalAmount();
                }
                
                // Handle navigation
                function previousStep() {
                    const newStep = Math.max(1, ${this.currentStep} - 1);
                    window.location.hash = '#/sales/new?step=' + newStep;
                }
                
                function nextStep() {
                    // Validate current step
                    if (!validateCurrentStep()) return;
                    
                    const newStep = Math.min(3, ${this.currentStep} + 1);
                    window.location.hash = '#/sales/new?step=' + newStep;
                }
                
                function validateCurrentStep() {
                    const step = ${this.currentStep};
                    
                    if (step === 1) {
                        if (!getSaleData('customer_id')) {
                            alert('Please select a customer');
                            return false;
                        }
                    } else if (step === 2) {
                        if (!getSaleData('items') || getSaleData('items').length === 0) {
                            alert('Please add at least one item to the sale');
                            return false;
                        }
                    }
                    
                    return true;
                }
                
                // Sale data management
                function storeSaleData(key, value) {
                    // Get current sale data from sessionStorage
                    let sale = JSON.parse(sessionStorage.getItem('currentSale') || '{}');
                    
                    // Update the value
                    sale[key] = value;
                    
                    // Save back to sessionStorage
                    sessionStorage.setItem('currentSale', JSON.stringify(sale));
                }
                
                function getSaleData(key) {
                    // Get current sale data from sessionStorage
                    let sale = JSON.parse(sessionStorage.getItem('currentSale') || '{}');
                    return sale[key];
                }
                
                // Items management
                function addItemToSale(itemId) {
                    // Find the item
                    const allItems = ${JSON.stringify(this.items)};
                    const item = allItems.find(i => i.id === itemId);
                    if (!item) return;
                    
                    // Get current sale items
                    let saleItems = getSaleData('items') || [];
                    
                    // Check if item already exists in sale
                    const existingIndex = saleItems.findIndex(i => i.item_id === itemId);
                    
                    if (existingIndex >= 0) {
                        // Increment quantity of existing item
                        saleItems[existingIndex].quantity += 1;
                    } else {
                        // Add new item to sale
                        saleItems.push({
                            item_id: itemId,
                            price: item.price,
                            quantity: 1,
                            total: item.price
                        });
                    }
                    
                    // Update sale data
                    storeSaleData('items', saleItems);
                    
                    // Recalculate totals
                    calculateSaleTotals();
                    
                    // Refresh items display
                    window.location.reload();
                }
                
                function removeItemFromSale(index) {
                    // Get current sale items
                    let saleItems = getSaleData('items') || [];
                    
                    // Remove item at index
                    if (index >= 0 && index < saleItems.length) {
                        saleItems.splice(index, 1);
                        
                        // Update sale data
                        storeSaleData('items', saleItems);
                        
                        // Recalculate totals
                        calculateSaleTotals();
                        
                        // Refresh items display
                        window.location.reload();
                    }
                }
                
                function updateItemQuantity(index, quantity) {
                    // Get current sale items
                    let saleItems = getSaleData('items') || [];
                    
                    // Update quantity for item at index
                    if (index >= 0 && index < saleItems.length) {
                        const newQty = Math.max(1, quantity);
                        saleItems[index].quantity = newQty;
                        saleItems[index].total = saleItems[index].price * newQty;
                        
                        // Update sale data
                        storeSaleData('items', saleItems);
                        
                        // Recalculate totals
                        calculateSaleTotals();
                        
                        // Update display
                        updateItemsDisplay();
                    }
                }
                
                function incrementItemQuantity(index) {
                    // Get current sale items
                    let saleItems = getSaleData('items') || [];
                    
                    // Increment quantity for item at index
                    if (index >= 0 && index < saleItems.length) {
                        saleItems[index].quantity += 1;
                        saleItems[index].total = saleItems[index].price * saleItems[index].quantity;
                        
                        // Update sale data
                        storeSaleData('items', saleItems);
                        
                        // Recalculate totals
                        calculateSaleTotals();
                        
                        // Update display
                        updateItemsDisplay();
                    }
                }
                
                function decrementItemQuantity(index) {
                    // Get current sale items
                    let saleItems = getSaleData('items') || [];
                    
                    // Decrement quantity for item at index
                    if (index >= 0 && index < saleItems.length) {
                        saleItems[index].quantity = Math.max(1, saleItems[index].quantity - 1);
                        saleItems[index].total = saleItems[index].price * saleItems[index].quantity;
                        
                        // Update sale data
                        storeSaleData('items', saleItems);
                        
                        // Recalculate totals
                        calculateSaleTotals();
                        
                        // Update display
                        updateItemsDisplay();
                    }
                }
                
                function calculateSaleTotals() {
                    // Get current sale items
                    const saleItems = getSaleData('items') || [];
                    
                    // Calculate subtotal
                    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
                    storeSaleData('subtotal', subtotal);
                    
                    // Calculate final amount (accounting for discount and tax)
                    const discount = getSaleData('discount') || 0;
                    const tax = getSaleData('tax') || 0;
                    const finalAmount = subtotal - discount + tax;
                    storeSaleData('final_amount', finalAmount);
                    
                    // Enable/disable next button based on items
                    if (document.getElementById('next-step-btn')) {
                        document.getElementById('next-step-btn').disabled = saleItems.length === 0;
                    }
                }
                
                function updateItemsCount() {
                    const saleItems = getSaleData('items') || [];
                    const countElement = document.getElementById('items-count');
                    if (countElement) {
                        countElement.textContent = saleItems.length;
                    }
                }
                
                function updateSubtotal() {
                    const subtotal = getSaleData('subtotal') || 0;
                    const subtotalElement = document.getElementById('subtotal');
                    if (subtotalElement) {
                        subtotalElement.textContent = 'Rs. ' + subtotal.toFixed(2);
                    }
                }
                
                function updateFinalAmount() {
                    const subtotal = getSaleData('subtotal') || 0;
                    const discount = parseFloat(document.getElementById('discount-amount').value) || 0;
                    const tax = parseFloat(document.getElementById('tax-amount').value) || 0;
                    const finalAmount = subtotal - discount + tax;
                    
                    // Update display
                    document.getElementById('final-amount').textContent = 'Rs. ' + finalAmount.toFixed(2);
                    
                    // Update sale data
                    storeSaleData('discount', discount);
                    storeSaleData('tax', tax);
                    storeSaleData('final_amount', finalAmount);
                    
                    // Update payment field max
                    document.getElementById('payment-amount').max = finalAmount;
                }
                
                function updateItemsDisplay() {
                    // Update quantities and totals in the UI
                    document.querySelectorAll('.item-qty').forEach((input, index) => {
                        const saleItems = getSaleData('items') || [];
                        if (index < saleItems.length) {
                            const item = saleItems[index];
                            const listItem = input.closest('.list-group-item');
                            
                            // Update quantity input
                            input.value = item.quantity;
                            
                            // Update price display
                            const quantityEl = listItem.querySelector('.quantity');
                            const totalEl = listItem.querySelector('strong');
                            if (quantityEl && totalEl) {
                                quantityEl.textContent = item.quantity;
                                totalEl.textContent = 'Rs. ' + item.total.toFixed(2);
                            }
                        }
                    });
                    
                    // Update subtotal and items count
                    updateItemsCount();
                    updateSubtotal();
                }
                
                async function completeSale() {
                    try {
                        // Get all sale data
                        const saleData = JSON.parse(sessionStorage.getItem('currentSale') || '{}');
                        
                        // Validate required fields
                        if (!saleData.customer_id) {
                            alert('Customer is required');
                            return;
                        }
                        
                        if (!saleData.items || saleData.items.length === 0) {
                            alert('At least one item is required');
                            return;
                        }
                        
                        // Create sale record
                        const sale = {
                            customer_id: saleData.customer_id,
                            sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
                            subtotal: saleData.subtotal || 0,
                            discount: saleData.discount || 0,
                            tax: saleData.tax || 0,
                            final_amount: saleData.final_amount || 0,
                            payment_status: saleData.payment_status || 'unpaid',
                            notes: saleData.notes || '',
                            item_count: saleData.items.length,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        
                        // Save sale
                        const saleId = await db.addSale(sale);
                        
                        // Save sale items
                        for (const item of saleData.items) {
                            await db.addSaleItem({
                                sale_id: saleId,
                                item_id: item.item_id,
                                quantity: item.quantity,
                                price: item.price,
                                total: item.total
                            });
                        }
                        
                        // Add payment if any
                        const paymentAmount = saleData.payment_amount || 0;
                        if (paymentAmount > 0) {
                            await db.addPayment({
                                sale_id: saleId,
                                amount: paymentAmount,
                                payment_date: new Date().toISOString().split('T')[0],
                                payment_method: 'cash', // Default method
                                notes: 'Initial payment',
                                created_at: new Date().toISOString()
                            });
                        }
                        
                        // Clear session storage
                        sessionStorage.removeItem('currentSale');
                        
                        // Show success message
                        alert('Sale completed successfully!');
                        
                        // Navigate to sale detail
                        window.location.hash = '#/sales/' + saleId;
                        
                    } catch (error) {
                        console.error('Error saving sale:', error);
                        alert('Error: ' + error.message);
                    }
                }
                
                // Initialize based on stored data
                function initFromStoredData() {
                    const saleData = JSON.parse(sessionStorage.getItem('currentSale') || '{}');
                    
                    // Step 1: Customer selection
                    if (saleData.customer_id && ${this.currentStep} === 1) {
                        const customerItem = document.querySelector(
                            \`.customer-item[data-customer-id="\${saleData.customer_id}"]\`
                        );
                        if (customerItem) {
                            customerItem.classList.add('active');
                            document.getElementById('next-step-btn').disabled = false;
                        }
                    }
                }
                
                // Call initialize
                initFromStoredData();
            </script>
            
            <style>
                /* Step indicators styling */
                .step-indicator {
                    text-align: center;
                    z-index: 1;
                }
                
                .step-indicator .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: #e9ecef;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 8px;
                    font-weight: bold;
                }
                
                .step-indicator.active .step-number {
                    background-color: #007bff;
                    color: white;
                }
                
                .step-indicator .step-title {
                    font-size: 0.875rem;
                    color: #6c757d;
                }
                
                .step-indicator.active .step-title {
                    color: #007bff;
                    font-weight: bold;
                }
            </style>
        `;
    }
}

// Export the component
window.NewSaleView = NewSaleView;
