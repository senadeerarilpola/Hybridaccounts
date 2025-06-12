// Main application script
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Initialize the application
async function initApp() {
    setupNavigation();
    setupRoutes();
    await checkFirstTimeSetup();
    checkAuth();
}

// Setup the main navigation
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.innerHTML = `
        <div class="container">
            <a class="navbar-brand" href="#/">SupiriAccounts</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="#/"><i class="fas fa-home"></i> Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#/customers"><i class="fas fa-users"></i> Customers</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#/items"><i class="fas fa-box"></i> Items</a>
                    </li>                    <li class="nav-item">
                        <a class="nav-link" href="#/sales"><i class="fas fa-shopping-cart"></i> Sales</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#/reports"><i class="fas fa-chart-bar"></i> Reports</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#/analytics"><i class="fas fa-chart-line"></i> Business Analytics</a>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                           data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user"></i> <span id="username">Account</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="#/profile"><i class="fas fa-id-card"></i> Profile</a></li>
                            <li><a class="dropdown-item" href="#/settings"><i class="fas fa-cog"></i> Settings</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#/logout" id="logout-btn">
                                <i class="fas fa-sign-out-alt"></i> Logout</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    `;

    // Setup logout functionality
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
}

// Setup application routes
function setupRoutes() {
    // Home/Dashboard route
    router.addRoute('/', async function() {
        return `
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">Dashboard</h1>
                </div>
                
                <!-- Sales Summary Card -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">Sales Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 class="card-subtitle mb-1 text-muted">Total Sales</h6>
                                    <h4 class="card-text" id="total-sales">...</h4>
                                </div>
                                <div>
                                    <h6 class="card-subtitle mb-1 text-muted">Total Amount</h6>
                                    <h4 class="card-text" id="total-amount">...</h4>
                                </div>
                            </div>
                            <canvas id="sales-chart" height="200"></canvas>
                            <div class="text-center mt-3">
                                <a href="#/sales" class="btn btn-sm btn-outline-primary">View All Sales</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Customer Summary Card -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h5 class="card-title mb-0">Customer Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 class="card-subtitle mb-1 text-muted">Total Customers</h6>
                                    <h4 class="card-text" id="total-customers">...</h4>
                                </div>
                                <div>
                                    <h6 class="card-subtitle mb-1 text-muted">New This Month</h6>
                                    <h4 class="card-text" id="new-customers">...</h4>
                                </div>
                            </div>
                            <div class="list-group">
                                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <span>Loading customers...</span>
                                    <span class="badge bg-primary rounded-pill">...</span>
                                </div>
                            </div>
                            <div class="text-center mt-3">
                                <a href="#/customers" class="btn btn-sm btn-outline-success">View All Customers</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Access -->
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5 class="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-6 col-md-3">
                                    <a href="#/sales/new" class="btn btn-primary w-100 h-100 py-4">
                                        <i class="fas fa-cart-plus fa-2x mb-2"></i><br>
                                        New Sale
                                    </a>
                                </div>
                                <div class="col-6 col-md-3">
                                    <a href="#/customers/new" class="btn btn-success w-100 h-100 py-4">
                                        <i class="fas fa-user-plus fa-2x mb-2"></i><br>
                                        New Customer
                                    </a>
                                </div>
                                <div class="col-6 col-md-3">
                                    <a href="#/items/new" class="btn btn-warning w-100 h-100 py-4">
                                        <i class="fas fa-box-open fa-2x mb-2"></i><br>
                                        New Item
                                    </a>
                                </div>
                                <div class="col-6 col-md-3">
                                    <a href="#/reports/generate" class="btn btn-info w-100 h-100 py-4">
                                        <i class="fas fa-chart-line fa-2x mb-2"></i><br>
                                        Generate Report
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });    // Login route
    router.addRoute('/login', async function() {
        return `
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card">
                        <div class="card-header bg-primary text-white text-center">
                            <h4 class="my-0">Login</h4>
                        </div>
                        <div class="card-body">
                            <form id="login-form">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="password" required>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">Login</button>
                                </div>
                                <div class="alert alert-danger mt-3" role="alert" id="login-error" style="display: none;">
                                    Invalid username or password.
                                </div>
                            </form>
                        </div>
                        <div class="card-footer text-center">
                            <p class="mb-0">Don't have an account? <a href="#/register">Register</a></p>
                        </div>
                    </div>
                </div>
            </div>
            <script>
                document.getElementById('login-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    loginUser(username, password);
                });

                async function loginUser(username, password) {
                    try {
                        // Get user by username
                        const user = await db.getUserByUsername(username);

                        if (user && user.password === password) {
                            localStorage.setItem('user', JSON.stringify({
                                id: user.id,
                                username: user.username,
                                businessName: user.businessName,
                                isLoggedIn: true
                            }));
                            document.getElementById('login-error').style.display = 'none';
                            router.navigateTo('/');
                            location.reload(); // Refresh to update navigation
                        } else {
                            document.getElementById('login-error').style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Login error:', error);
                        document.getElementById('login-error').style.display = 'block';
                        document.getElementById('login-error').textContent = 'An error occurred. Please try again.';
                    }
                }
            </script>
        `;
    });
    
    // Register route
    router.addRoute('/register', async function() {
        return registerView.render();    });
    
    // Profile route
    router.addRoute('/profile', async function() {
        try {
            return await profileView.init();
        } catch (error) {
            console.error('Error loading profile view:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load profile. Please try again later.</p>
                </div>
            `;
        }
    });
      // Items routes
    router.addRoute('/items', async function() {
        try {
            // Load the items component
            const itemsComponent = new ItemsComponent();
            return await itemsComponent.init();
        } catch (error) {
            console.error('Error loading items:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load items. Please try refreshing the page.</p>
                </div>
            `;
        }
    });

    // New item route
    router.addRoute('/items/new', async function() {
        try {
            const newItemView = new NewItemView();
            return await newItemView.init();
        } catch (error) {
            console.error('Error loading new item view:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load the new item form.</p>
                </div>
            `;
        }
    });

    // Item detail route
    router.addRoute('/items/:id', async function(params) {
        try {
            const itemId = params.id;
            const itemDetailView = new ItemDetailView(itemId);
            return await itemDetailView.init();
        } catch (error) {
            console.error('Error loading item details:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load item details.</p>
                </div>
            `;
        }
    });

    // Edit item route
    router.addRoute('/items/:id/edit', async function(params) {
        try {
            const itemId = params.id;
            const itemDetailView = new ItemDetailView(itemId);
            itemDetailView.isEditing = true;
            return await itemDetailView.init();
        } catch (error) {
            console.error('Error loading item edit form:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load the item edit form.</p>
                </div>
            `;
        }
    });
      // Sales routes
    router.addRoute('/sales', async function() {
        try {
            // Load the sales component
            const salesComponent = new SalesComponent();
            return await salesComponent.init();
        } catch (error) {
            console.error('Error loading sales:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load sales. Please try refreshing the page.</p>
                </div>
            `;
        }
    });

    // New sale route
    router.addRoute('/sales/new', async function() {
        try {
            // Get step from query parameter
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const step = parseInt(urlParams.get('step')) || 1;
            
            const newSaleView = new NewSaleView();
            newSaleView.currentStep = Math.min(3, Math.max(1, step));
            
            return await newSaleView.init();
        } catch (error) {
            console.error('Error loading new sale view:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load the new sale form.</p>
                </div>
            `;
        }
    });    // Sale detail route
    router.addRoute('/sales/:id', async function(params) {
        try {
            const saleId = params.id;
            const saleDetailView = new SaleDetailView(saleId);
            return await saleDetailView.init();
        } catch (error) {
            console.error('Error loading sale details:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load sale details.</p>
                </div>
            `;
        }
    });
    
    // Business Analytics route
    router.addRoute('/analytics', async function() {
        try {
            return await businessAnalyticsView.init();
        } catch (error) {
            console.error('Error loading business analytics:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load business analytics. Please try again later.</p>
                </div>
            `;
        }
    });
    
    // Settings route
    router.addRoute('/settings', async function() {
        try {
            const settingsView = new SettingsView();
            return await settingsView.init();
        } catch (error) {
            console.error('Error loading settings:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load settings. Please try again later.</p>
                </div>
            `;
        }
    });
    
    // Reports route
    router.addRoute('/reports', async function() {
        // Redirect to analytics for now
        router.navigateTo('/analytics');
        return `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;
    });
}

// Check if user is authenticated
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || '{"isLoggedIn": false}');
    
    if (user.isLoggedIn) {
        // Update username in navigation
        document.getElementById('username').textContent = user.username || 'User';
    } else {
        // Redirect to login if trying to access a protected route
        const path = window.location.hash.slice(1) || '/';
        if (path !== '/login' && path !== '/register') {
            router.navigateTo('/login');
        }
    }
}

// Logout user
function logoutUser() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('currentSale'); // Clear any in-progress sale
    router.navigateTo('/login');
}

// First-time app setup
async function checkFirstTimeSetup() {
    try {
        // Check if any users exist in the database
        const users = await db.getUsers();
        
        // If no users exist, this is first run
        if (users && users.length === 0) {
            console.log('First-time setup: No users found');
            // Wait for DOM to be ready
            if (window.location.hash !== '#/register') {
                router.navigateTo('/register');
            }
        }
    } catch (error) {
        console.error('Error checking first-time setup:', error);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get sales data
        const sales = await db.getSales();
        document.getElementById('total-sales').textContent = sales.length;
        
        let totalAmount = 0;
        sales.forEach(sale => {
            totalAmount += sale.final_amount;
        });
        document.getElementById('total-amount').textContent = totalAmount.toFixed(2);
        
        // Get customer data
        const customers = await db.getCustomers();
        document.getElementById('total-customers').textContent = customers.length;
        
        // Calculate new customers this month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const newCustomers = customers.filter(customer => {
            const createdDate = new Date(customer.created_at);
            return createdDate >= firstDayOfMonth;
        });
        document.getElementById('new-customers').textContent = newCustomers.length;
        
        // Load customer list
        const customerListEl = document.querySelector('.list-group');
        customerListEl.innerHTML = '';
        
        const topCustomers = customers.slice(0, 5);
        topCustomers.forEach(customer => {
            const customerSales = sales.filter(sale => sale.customer_id === customer.id);
            const totalSpent = customerSales.reduce((sum, sale) => sum + sale.final_amount, 0);
            
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <span>${customer.name}</span>
                <span class="badge bg-primary rounded-pill">${totalSpent.toFixed(2)}</span>
            `;
            customerListEl.appendChild(listItem);
        });
        
        // Draw sales chart
        // This would use a library like Chart.js
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}
