/**
 * Item Detail view component
 * For viewing and editing existing inventory items
 */
class ItemDetailView {
    constructor(itemId) {
        this.itemId = itemId;
        this.item = null;
        this.isEditing = false;
    }
    
    /**
     * Initialize the view
     */
    async init() {
        try {
            // Load the item from the database
            this.item = await db.getItem(this.itemId);
            
            if (!this.item) {
                return `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Item Not Found</h4>
                        <p>The requested item could not be found.</p>
                        <hr>
                        <p class="mb-0">
                            <a href="#/items" class="alert-link">Return to Items</a>
                        </p>
                    </div>
                `;
            }
            
            return this.render();
        } catch (error) {
            console.error('Error loading item:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load the requested item.</p>
                    <hr>
                    <p class="mb-0">Please try again or contact support.</p>
                </div>
            `;
        }
    }
    
    /**
     * Render the item detail view
     */
    render() {
        return `
            <div class="item-detail-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>${this.isEditing ? 'Edit Item' : 'Item Detail'}</h1>
                    <div>
                        <a href="#/items" class="btn btn-outline-secondary">
                            <i class="fas fa-arrow-left"></i> Back to Items
                        </a>
                        ${!this.isEditing ? `
                            <button id="edit-item-btn" class="btn btn-primary ms-2">
                                <i class="fas fa-edit"></i> Edit Item
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        ${this.isEditing ? this.renderEditForm() : this.renderItemDetails()}
                    </div>
                </div>
                
                ${this.renderScript()}
            </div>
        `;
    }
    
    /**
     * Render the item details in view mode
     */
    renderItemDetails() {
        return `
            <div class="row">
                <div class="col-md-8">
                    <h3 class="mb-3">${this.item.name}</h3>
                    ${this.item.sku ? `<p class="text-muted">SKU: ${this.item.sku}</p>` : ''}
                    
                    <h5 class="mt-4">Description</h5>
                    <p>${this.item.description || 'No description provided'}</p>
                    
                    <h5 class="mt-4">Category</h5>
                    <p>${this.formatCategory(this.item.category)}</p>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h5 class="card-title">Pricing & Inventory</h5>
                            <div class="row mb-2">
                                <div class="col-6">Selling Price:</div>
                                <div class="col-6 text-end fw-bold">Rs. ${this.item.price.toFixed(2)}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-6">Cost Price:</div>
                                <div class="col-6 text-end fw-bold">Rs. ${(this.item.cost || 0).toFixed(2)}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-6">Profit Margin:</div>
                                <div class="col-6 text-end fw-bold">${this.calculateProfitMargin()}%</div>
                            </div>
                            <hr>
                            <div class="row mb-2">
                                <div class="col-6">Quantity:</div>
                                <div class="col-6 text-end fw-bold">${this.item.quantity || 0}</div>
                            </div>
                            <div class="row">
                                <div class="col-6">Stock Value:</div>
                                <div class="col-6 text-end fw-bold">Rs. ${this.calculateStockValue()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-danger" id="delete-item-btn">
                            <i class="fas fa-trash-alt"></i> Delete Item
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render the edit form for the item
     */
    renderEditForm() {
        return `
            <form id="edit-item-form">
                <!-- Basic Information -->
                <div class="row mb-3">
                    <div class="col-12">
                        <h5 class="card-title">Basic Information</h5>
                    </div>
                    <div class="col-md-8">
                        <div class="mb-3">
                            <label for="item-name" class="form-label">Item Name *</label>
                            <input type="text" class="form-control" id="item-name" 
                                   value="${this.item.name}" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="item-sku" class="form-label">SKU/Code</label>
                            <input type="text" class="form-control" id="item-sku" 
                                   value="${this.item.sku || ''}">
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="mb-3">
                            <label for="item-description" class="form-label">Description</label>
                            <textarea class="form-control" id="item-description" rows="3">${this.item.description || ''}</textarea>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="item-category" class="form-label">Category</label>
                            <select class="form-select" id="item-category">
                                <option value="" ${!this.item.category ? 'selected' : ''}>Select a category...</option>
                                <option value="food" ${this.item.category === 'food' ? 'selected' : ''}>Food</option>
                                <option value="beverage" ${this.item.category === 'beverage' ? 'selected' : ''}>Beverage</option>
                                <option value="electronics" ${this.item.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                                <option value="clothing" ${this.item.category === 'clothing' ? 'selected' : ''}>Clothing</option>
                                <option value="service" ${this.item.category === 'service' ? 'selected' : ''}>Service</option>
                                <option value="other" ${this.item.category === 'other' ? 'selected' : ''}>Other</option>
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
                                       id="item-price" required value="${this.item.price}">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="item-cost" class="form-label">Cost Price</label>
                            <div class="input-group">
                                <span class="input-group-text">Rs.</span>
                                <input type="number" step="0.01" min="0" class="form-control" 
                                       id="item-cost" value="${this.item.cost || 0}">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="item-quantity" class="form-label">Quantity</label>
                            <input type="number" step="1" min="0" class="form-control" 
                                   id="item-quantity" value="${this.item.quantity || 0}">
                        </div>
                    </div>
                </div>
                
                <!-- Form Actions -->
                <div class="d-flex justify-content-end">
                    <button type="button" id="cancel-edit-btn" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </form>
        `;
    }
    
    /**
     * Render the JavaScript for this view
     */
    renderScript() {
        return `
            <script>
                ${this.isEditing ? this.renderEditScript() : this.renderViewScript()}
                
                // Delete item functionality
                document.getElementById('delete-item-btn')?.addEventListener('click', async function() {
                    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                        try {
                            await db.deleteItem(${this.itemId});
                            alert('Item deleted successfully');
                            window.location.hash = '#/items';
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            alert('Error: ' + error.message);
                        }
                    }
                });
            </script>
        `;
    }
    
    /**
     * Render the view mode JavaScript
     */
    renderViewScript() {
        return `
            // Switch to edit mode
            document.getElementById('edit-item-btn').addEventListener('click', function() {
                window.location.hash = '#/items/${this.itemId}/edit';
            });
        `;
    }
    
    /**
     * Render the edit mode JavaScript
     */
    renderEditScript() {
        return `
            // Handle form submission
            document.getElementById('edit-item-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Get form values
                const updatedItem = {
                    id: ${this.itemId},
                    name: document.getElementById('item-name').value.trim(),
                    description: document.getElementById('item-description').value.trim(),
                    price: parseFloat(document.getElementById('item-price').value) || 0,
                    cost: parseFloat(document.getElementById('item-cost').value) || 0,
                    quantity: parseInt(document.getElementById('item-quantity').value) || 0,
                    category: document.getElementById('item-category').value,
                    sku: document.getElementById('item-sku').value.trim(),
                    updated_at: new Date().toISOString()
                };
                
                try {
                    // Validate required fields
                    if (!updatedItem.name) {
                        throw new Error('Item name is required');
                    }
                    if (updatedItem.price <= 0) {
                        throw new Error('Item price must be greater than zero');
                    }
                    
                    // Save to database
                    await db.updateItem(updatedItem);
                    
                    // Show success message
                    alert('Item updated successfully!');
                    
                    // Redirect back to item detail view
                    window.location.hash = '#/items/${this.itemId}';
                    
                } catch (error) {
                    console.error('Error updating item:', error);
                    alert('Error: ' + error.message);
                }
            });
            
            // Cancel edit
            document.getElementById('cancel-edit-btn').addEventListener('click', function() {
                window.location.hash = '#/items/${this.itemId}';
            });
        `;
    }
    
    /**
     * Format the item category for display
     */
    formatCategory(category) {
        if (!category) return 'Not categorized';
        
        const categoryMap = {
            'food': 'Food',
            'beverage': 'Beverage',
            'electronics': 'Electronics',
            'clothing': 'Clothing',
            'service': 'Service',
            'other': 'Other'
        };
        
        return categoryMap[category] || category;
    }
    
    /**
     * Calculate the profit margin percentage
     */
    calculateProfitMargin() {
        if (!this.item.cost || this.item.cost <= 0) return '—';
        
        const margin = ((this.item.price - this.item.cost) / this.item.price) * 100;
        return margin.toFixed(2);
    }
    
    /**
     * Calculate the total stock value
     */
    calculateStockValue() {
        return ((this.item.quantity || 0) * this.item.price).toFixed(2);
    }
}

// Export the component
window.ItemDetailView = ItemDetailView;
