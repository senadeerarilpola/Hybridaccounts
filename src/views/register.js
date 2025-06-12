/**
 * User Registration Component
 * Handles new user registration functionality
 */
class RegisterView {
    constructor() {
        this.formData = {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            businessName: ''
        };
    }
    
    /**
     * Render the registration form
     */
    render() {
        return `
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card">
                        <div class="card-header bg-primary text-white text-center">
                            <h4 class="my-0">Create Account</h4>
                        </div>
                        <div class="card-body">
                            <form id="register-form">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="username" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email">
                                    <div class="form-text">Optional, but useful for account recovery</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="business-name" class="form-label">Business Name</label>
                                    <input type="text" class="form-control" id="business-name">
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                                        <input type="password" class="form-control" id="password" minlength="6" required>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label for="confirm-password" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                        <input type="password" class="form-control" id="confirm-password" required>
                                    </div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary">Register</button>
                                    <a href="#/login" class="btn btn-outline-secondary">Already have an account? Login</a>
                                </div>
                                
                                <div class="alert alert-danger mt-3" role="alert" id="register-error" style="display: none;">
                                    Error message here
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                document.getElementById('register-form').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const username = document.getElementById('username').value.trim();
                    const password = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirm-password').value;
                    const email = document.getElementById('email').value.trim();
                    const businessName = document.getElementById('business-name').value.trim();
                    
                    const errorElement = document.getElementById('register-error');
                    
                    // Validate input
                    if (username.length < 3) {
                        showError('Username must be at least 3 characters long');
                        return;
                    }
                    
                    if (password.length < 6) {
                        showError('Password must be at least 6 characters long');
                        return;
                    }
                    
                    if (password !== confirmPassword) {
                        showError('Passwords do not match');
                        return;
                    }
                    
                    try {
                        // Check if username already exists
                        const db = await window.db.dbPromise;
                        const usersStore = db.transaction('users').objectStore('users');
                        const usernameIndex = usersStore.index('username');
                        const existingUser = await usernameIndex.get(username);
                        
                        if (existingUser) {
                            showError('Username already exists. Please choose a different one.');
                            return;
                        }
                        
                        // Create new user
                        const user = {
                            username,
                            password, // In a real app, we would hash this password
                            email: email || null,
                            businessName: businessName || 'My Business',
                            created_at: new Date().toISOString()
                        };
                        
                        // Save to database
                        const userId = await db.add('users', user);
                        
                        // Create default settings
                        const settings = {
                            user_id: userId,
                            businessName: businessName || 'My Business',
                            currency: 'Rs.',
                            theme: 'light',
                            created_at: new Date().toISOString()
                        };
                        
                        await db.add('settings', settings);
                        
                        // Log in the user
                        localStorage.setItem('user', JSON.stringify({
                            id: userId,
                            username: user.username,
                            businessName: user.businessName,
                            isLoggedIn: true
                        }));
                        
                        // Redirect to dashboard
                        alert('Account created successfully! Welcome to SupiriAccounts.');
                        window.location.hash = '/';
                        location.reload(); // Refresh to update navigation
                    } catch (error) {
                        console.error('Registration error:', error);
                        showError('An error occurred during registration. Please try again.');
                    }
                });
                
                function showError(message) {
                    const errorElement = document.getElementById('register-error');
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                }
            </script>
        `;
    }
}

const registerView = new RegisterView();
