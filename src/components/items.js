
/**
 * Items component for managing product/service items
 * Main component for listing, filtering and basic CRUD operations
 */
class ItemsComponent {
    constructor() {
        // Component state
        this.items = [];
        this.filteredItems = [];
        this.filter = '';
        this.sortField = 'name';
        this.sortDirection = 'asc';
    }
    
    /**
     * Initialize the component
     */
    async init() {
        try {
            // Load items from database
            this.items = await db.getItems();
            this.filterItems();
            return this.render();
        } catch (error) {
            console.error('Error initializing items component:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    Failed to load items. Please try refreshing the page.
                </div>
            `;
        }
    }
    
    /**
     * Render the items list view
     */
    render() {
        return `
            <div class="items-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Items</h1>
                    <a href="#/items/new" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add New Item
                    </a>
                </div>
                
                <!-- Search and filter controls -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input type="text" id="item-search" class="form-control" 
                                       placeholder="Search items..." aria-label="Search items">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <select id="item-sort" class="form-select">
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="price-asc">Price (Low to High)</option>
                                    <option value="price-desc">Price (High to Low)</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <button id="item-refresh" class="btn btn-outline-secondary w-100">
                                    <i class="fas fa-sync-alt"></i> Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Items list -->
                <div class="card">
                    <div class="list-group list-group-flush" id="items-list">
                        ${this.renderItemsList()}
                    </div>
                </div>
                
                ${this.renderItemsScript()}
            </div>
        `;
    }
    
    /**
     * Render the items list based on current filters and sorting
     */
    renderItemsList() {
        if (this.filteredItems.length === 0) {
            return `
                <div class="list-group-item text-center py-4">
                    <i class="fas fa-box fa-2x mb-3 text-muted"></i>
                    <p class="mb-0 text-muted">No items found</p>
                    <p class="text-muted small">Add your first item to get started</p>
                </div>
            `;
        }
        
        return this.filteredItems.map(item => `
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="mb-1 text-muted small">${item.description || 'No description'}</p>
                </div>
                <div class="text-end">
                    <h6 class="mb-0">Rs. ${item.price.toFixed(2)}</h6>
                    <div class="btn-group btn-group-sm mt-2">
                        <a href="#/items/${item.id}" class="btn btn-outline-primary">
                            <i class="fas fa-eye"></i>
                        </a>
                        <a href="#/items/${item.id}/edit" class="btn btn-outline-secondary">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-outline-danger delete-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Render the JavaScript for the items component
     */
    renderItemsScript() {
        return `
            <script>
                // Initialize component event handlers
                document.getElementById('item-search').addEventListener('input', function(e) {
                    const searchTerm = e.target.value.trim().toLowerCase();
                    filterItems(searchTerm);
                });
                
                document.getElementById('item-sort').addEventListener('change', function(e) {
                    const [field, direction] = e.target.value.split('-');
                    sortItems(field, direction);
                });
                
                document.getElementById('item-refresh').addEventListener('click', function() {
                    loadItems();
                });
                
                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-item').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const itemId = this.getAttribute('data-id');
                        deleteItem(itemId);
                    });
                });
                
                // Filter items based on search term
                function filterItems(searchTerm = '') {
                    const itemsList = document.getElementById('items-list');
                    const allItems = ${JSON.stringify(this.items)};
                    
                    const filtered = allItems.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) || 
                        (item.description && item.description.toLowerCase().includes(searchTerm))
                    );
                    
                    if (filtered.length === 0) {
                        itemsList.innerHTML = \`
                            <div class="list-group-item text-center py-4">
                                <i class="fas fa-search fa-2x mb-3 text-muted"></i>
                                <p class="mb-0 text-muted">No items matching "\${searchTerm}"</p>
                                <p class="text-muted small">Try a different search term</p>
                            </div>
                        \`;
                    } else {
                        const sortSelect = document.getElementById('item-sort');
                        const [field, direction] = sortSelect.value.split('-');
                        const sorted = sortItemsArray(filtered, field, direction);
                        
                        itemsList.innerHTML = sorted.map(item => \`
                            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-1">\${item.name}</h5>
                                    <p class="mb-1 text-muted small">\${item.description || 'No description'}</p>
                                </div>
                                <div class="text-end">
                                    <h6 class="mb-0">Rs. \${item.price.toFixed(2)}</h6>
                                    <div class="btn-group btn-group-sm mt-2">
                                        <a href="#/items/\${item.id}" class="btn btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="#/items/\${item.id}/edit" class="btn btn-outline-secondary">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <button class="btn btn-outline-danger delete-item" data-id="\${item.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        \`).join('');
                        
                        // Reattach event listeners
                        document.querySelectorAll('.delete-item').forEach(button => {
                            button.addEventListener('click', function(e) {
                                e.preventDefault();
                                const itemId = this.getAttribute('data-id');
                                deleteItem(itemId);
                            });
                        });
                    }
                }
                
                // Sort items by field and direction
                function sortItems(field, direction) {
                    const itemsList = document.getElementById('items-list');
                    const searchTerm = document.getElementById('item-search').value.trim().toLowerCase();
                    const allItems = ${JSON.stringify(this.items)};
                    
                    const filtered = allItems.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) || 
                        (item.description && item.description.toLowerCase().includes(searchTerm))
                    );
                    
                    const sorted = sortItemsArray(filtered, field, direction);
                    
                    itemsList.innerHTML = sorted.map(item => \`
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-1">\${item.name}</h5>
                                <p class="mb-1 text-muted small">\${item.description || 'No description'}</p>
                            </div>
                            <div class="text-end">
                                <h6 class="mb-0">Rs. \${item.price.toFixed(2)}</h6>
                                <div class="btn-group btn-group-sm mt-2">
                                    <a href="#/items/\${item.id}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="#/items/\${item.id}/edit" class="btn btn-outline-secondary">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <button class="btn btn-outline-danger delete-item" data-id="\${item.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    \`).join('');
                    
                    // Reattach event listeners
                    document.querySelectorAll('.delete-item').forEach(button => {
                        button.addEventListener('click', function(e) {
                            e.preventDefault();
                            const itemId = this.getAttribute('data-id');
                            deleteItem(itemId);
                        });
                    });
                }
                
                // Sort an array of items
                function sortItemsArray(items, field, direction) {
                    return [...items].sort((a, b) => {
                        if (field === 'name') {
                            return direction === 'asc' 
                                ? a.name.localeCompare(b.name)
                                : b.name.localeCompare(a.name);
                        } else if (field === 'price') {
                            return direction === 'asc'
                                ? a.price - b.price
                                : b.price - a.price;
                        }
                        return 0;
                    });
                }
                
                // Reload items from database
                async function loadItems() {
                    try {
                        const items = await db.getItems();
                        const searchTerm = document.getElementById('item-search').value.trim().toLowerCase();
                        const sortSelect = document.getElementById('item-sort');
                        const [field, direction] = sortSelect.value.split('-');
                        
                        const filtered = items.filter(item => 
                            item.name.toLowerCase().includes(searchTerm) || 
                            (item.description && item.description.toLowerCase().includes(searchTerm))
                        );
                        
                        const sorted = sortItemsArray(filtered, field, direction);
                        
                        const itemsList = document.getElementById('items-list');
                        
                        if (sorted.length === 0) {
                            itemsList.innerHTML = \`
                                <div class="list-group-item text-center py-4">
                                    <i class="fas fa-box fa-2x mb-3 text-muted"></i>
                                    <p class="mb-0 text-muted">No items found</p>
                                    <p class="text-muted small">Add your first item to get started</p>
                                </div>
                            \`;
                        } else {
                            itemsList.innerHTML = sorted.map(item => \`
                                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 class="mb-1">\${item.name}</h5>
                                        <p class="mb-1 text-muted small">\${item.description || 'No description'}</p>
                                    </div>
                                    <div class="text-end">
                                        <h6 class="mb-0">Rs. \${item.price.toFixed(2)}</h6>
                                        <div class="btn-group btn-group-sm mt-2">
                                            <a href="#/items/\${item.id}" class="btn btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="#/items/\${item.id}/edit" class="btn btn-outline-secondary">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-outline-danger delete-item" data-id="\${item.id}">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            \`).join('');
                            
                            // Reattach event listeners
                            document.querySelectorAll('.delete-item').forEach(button => {
                                button.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    const itemId = this.getAttribute('data-id');
                                    deleteItem(itemId);
                                });
                            });
                        }
                    } catch (error) {
                        console.error('Error loading items:', error);
                        alert('Failed to load items. Please try again.');
                    }
                }
                
                // Delete an item
                async function deleteItem(itemId) {
                    if (confirm('Are you sure you want to delete this item?')) {
                        try {
                            await db.deleteItem(itemId);
                            
                            // Show success message
                            const messageContainer = document.createElement('div');
                            messageContainer.className = 'alert alert-success alert-dismissible fade show';
                            messageContainer.innerHTML = \`
                                Item deleted successfully.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            \`;
                            
                            document.querySelector('.items-container').prepend(messageContainer);
                            
                            // Refresh the list
                            loadItems();
                            
                            // Auto dismiss after 3 seconds
                            setTimeout(() => {
                                messageContainer.remove();
                            }, 3000);
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            alert('Failed to delete item. Please try again.');
                        }
                    }
                }
            </script>
        `;
    }
    
    /**
     * Filter items based on the current filter
     */
    filterItems(filter = this.filter) {
        this.filter = filter.toLowerCase();
        
        if (!this.filter) {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => 
                item.name.toLowerCase().includes(this.filter) || 
                (item.description && item.description.toLowerCase().includes(this.filter))
            );
        }
        
        this.sortItems();
    }
    
    /**
     * Sort items based on the current sort field and direction
     */
    sortItems(field = this.sortField, direction = this.sortDirection) {
        this.sortField = field;
        this.sortDirection = direction;
        
        this.filteredItems.sort((a, b) => {
            if (field === 'name') {
                return direction === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (field === 'price') {
                return direction === 'asc'
                    ? a.price - b.price
                    : b.price - a.price;
            }
            return 0;
        });
    }
}
