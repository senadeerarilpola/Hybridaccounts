/**
 * New Item view component
 * For adding new inventory items to the system
 */
class NewItemView {
    constructor() {
        this.item = {
            name: '',
            description: '',
            price: 0,
            cost: 0,
            quantity: 0,
            category: '',
            sku: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
    
    /**
     * Initialize the view
     */
    async init() {
        return this.render();
    }
    
    /**
     * Render the new item form
     */
    render() {
        return `
            <div class="new-item-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>New Item</h1>
                    <a href="#/items" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Items
                    </a>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <form id="new-item-form">
                            <!-- Basic Information -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h5 class="card-title">Basic Information</h5>
                                </div>
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label for="item-name" class="form-label">Item Name *</label>
                                        <input type="text" class="form-control" id="item-name" 
                                               placeholder="Enter item name" required>
                                    </div>
                                </div>                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="item-sku" class="form-label">SKU/Code</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="item-sku" 
                                                placeholder="Item unique code">
                                            <button class="btn btn-outline-primary" type="button" id="scan-barcode-btn">
                                                <i class="fas fa-barcode"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="item-description" class="form-label">Description</label>
                                        <textarea class="form-control" id="item-description" rows="3" 
                                                  placeholder="Enter item description"></textarea>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="item-category" class="form-label">Category</label>
                                        <select class="form-select" id="item-category">
                                            <option value="" selected>Select a category...</option>
                                            <option value="food">Food</option>
                                            <option value="beverage">Beverage</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="clothing">Clothing</option>
                                            <option value="service">Service</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Pricing and Inventory -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h5 class="card-title">Pricing & Inventory</h5>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="item-price" class="form-label">Selling Price *</label>
                                        <div class="input-group">
                                            <span class="input-group-text">Rs.</span>
                                            <input type="number" step="0.01" min="0" class="form-control" 
                                                   id="item-price" required placeholder="0.00">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="item-cost" class="form-label">Cost Price</label>
                                        <div class="input-group">
                                            <span class="input-group-text">Rs.</span>
                                            <input type="number" step="0.01" min="0" class="form-control" 
                                                   id="item-cost" placeholder="0.00">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="item-quantity" class="form-label">Quantity</label>
                                        <input type="number" step="1" min="0" class="form-control" 
                                               id="item-quantity" placeholder="0">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Form Actions -->
                            <div class="d-flex justify-content-end">
                                <button type="reset" class="btn btn-outline-secondary me-2">
                                    <i class="fas fa-undo"></i> Reset
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                ${this.renderScript()}
            </div>
        `;
    }
    
    /**
     * Render the JavaScript for this view
     */
    renderScript() {
        return `
            <script>                // Handle barcode scanning
                document.getElementById('scan-barcode-btn').addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Create a modal for the barcode scanner
                    const modal = document.createElement('div');
                    modal.className = 'modal fade';
                    modal.id = 'barcodeScannerModal';
                    modal.setAttribute('tabindex', '-1');
                    modal.setAttribute('aria-labelledby', 'barcodeScannerModalLabel');
                    modal.setAttribute('aria-hidden', 'true');
                    
                    modal.innerHTML = `
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="barcodeScannerModalLabel">Scan Barcode</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div id="barcode-scanner-container"></div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Initialize the modal
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                    
                    // Initialize the barcode scanner
                    barcodeScanner.setupScanner('barcode-scanner-container', function(result) {
                        // Set the scan result to the SKU field
                        document.getElementById('item-sku').value = result.text;
                        
                        // Close the modal after a short delay
                        setTimeout(() => {
                            bsModal.hide();
                            
                            // Remove the modal from DOM when hidden
                            modal.addEventListener('hidden.bs.modal', function() {
                                document.body.removeChild(modal);
                            });
                        }, 1000);
                    });
                    
                    // Clean up when the modal is closed
                    modal.addEventListener('hidden.bs.modal', function() {
                        barcodeScanner.stopScanning();
                        document.body.removeChild(modal);
                    });
                });

                // Handle form submission
                document.getElementById('new-item-form').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    // Get form values
                    const newItem = {
                        name: document.getElementById('item-name').value.trim(),
                        description: document.getElementById('item-description').value.trim(),
                        price: parseFloat(document.getElementById('item-price').value) || 0,
                        cost: parseFloat(document.getElementById('item-cost').value) || 0,
                        quantity: parseInt(document.getElementById('item-quantity').value) || 0,
                        category: document.getElementById('item-category').value,
                        sku: document.getElementById('item-sku').value.trim(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    try {
                        // Validate required fields
                        if (!newItem.name) {
                            throw new Error('Item name is required');
                        }
                        if (newItem.price <= 0) {
                            throw new Error('Item price must be greater than zero');
                        }
                        
                        // Save to database
                        const itemId = await db.addItem(newItem);
                        
                        // Show success message
                        alert('Item added successfully!');
                        
                        // Redirect back to items list
                        window.location.hash = '#/items';
                        
                    } catch (error) {
                        console.error('Error saving item:', error);
                        alert('Error: ' + error.message);
                    }
                });
            </script>
        `;
    }
}

// Export the component
window.NewItemView = NewItemView;
