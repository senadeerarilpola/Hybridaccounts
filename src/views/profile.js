/**
 * User Profile Component
 * Manages user profile information and settings
 */
class ProfileView {
    constructor() {
        this.user = null;
        this.settings = null;
    }
    
    /**
     * Initialize the profile view
     */
    async init() {
        try {
            // Get current user data
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!userData.isLoggedIn) {
                router.navigateTo('/login');
                return '';
            }
            
            // Get user from database
            const dbUser = await db.dbPromise.then(db => db.get('users', Number(userData.id)));
            
            if (!dbUser) {
                throw new Error('User not found');
            }
            
            this.user = dbUser;
            
            // Get user settings
            // Query for settings where user_id matches
            const allSettings = await db.dbPromise.then(db => db.getAll('settings'));
            this.settings = allSettings.find(s => s.user_id === this.user.id) || {};
            
            return this.render();
        } catch (error) {
            console.error('Error loading profile:', error);
            return `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">Error</h4>
                    <p>Failed to load user profile. Please try again later.</p>
                </div>
            `;
        }
    }
    
    /**
     * Render the profile view
     */
    render() {
        return `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h1>User Profile</h1>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <!-- Profile Summary Card -->
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">Profile Summary</h5>
                        </div>
                        <div class="card-body text-center">
                            <div class="mb-3">
                                <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                     style="width: 100px; height: 100px; font-size: 3rem;">
                                    ${this.user.username ? this.user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </div>
                            <h5 class="card-title">${this.user.username}</h5>
                            <p class="text-muted">${this.user.email || 'No email provided'}</p>
                            <p class="mb-0">
                                <span class="badge bg-info">Account created: ${new Date(this.user.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-danger w-100" id="logout-profile-btn">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-8">
                    <!-- Account Settings Card -->
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">Account Settings</h5>
                        </div>
                        <div class="card-body">
                            <form id="profile-form">
                                <div class="mb-3">
                                    <label for="profile-username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="profile-username" value="${this.user.username}" readonly>
                                    <div class="form-text">Username cannot be changed</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="profile-email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="profile-email" value="${this.user.email || ''}">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="profile-business-name" class="form-label">Business Name</label>
                                    <input type="text" class="form-control" id="profile-business-name" value="${this.settings.businessName || this.user.businessName || ''}">
                                </div>
                                
                                <hr>
                                
                                <h6 class="mb-3">Change Password</h6>
                                
                                <div class="mb-3">
                                    <label for="current-password" class="form-label">Current Password</label>
                                    <input type="password" class="form-control" id="current-password">
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="new-password" class="form-label">New Password</label>
                                        <input type="password" class="form-control" id="new-password">
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label for="confirm-new-password" class="form-label">Confirm New Password</label>
                                        <input type="password" class="form-control" id="confirm-new-password">
                                    </div>
                                </div>
                                
                                <div class="d-flex justify-content-end">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i> Save Changes
                                    </button>
                                </div>
                                
                                <div class="alert alert-success mt-3" id="profile-success" style="display: none;">
                                    Profile updated successfully!
                                </div>
                                
                                <div class="alert alert-danger mt-3" id="profile-error" style="display: none;">
                                    Error message here
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Logout functionality
                document.getElementById('logout-profile-btn').addEventListener('click', function() {
                    localStorage.removeItem('user');
                    router.navigateTo('/login');
                });
                
                // Handle profile form submission
                document.getElementById('profile-form').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('profile-email').value.trim();
                    const businessName = document.getElementById('profile-business-name').value.trim();
                    const currentPassword = document.getElementById('current-password').value;
                    const newPassword = document.getElementById('new-password').value;
                    const confirmNewPassword = document.getElementById('confirm-new-password').value;
                    
                    try {
                        // Get the user from database
                        const db = await window.db.dbPromise;
                        const user = await db.get('users', ${this.user.id});
                        
                        if (!user) {
                            showError('User not found');
                            return;
                        }
                        
                        // Check if changing password
                        if (currentPassword || newPassword || confirmNewPassword) {
                            // Validate current password
                            if (currentPassword !== user.password) {
                                showError('Current password is incorrect');
                                return;
                            }
                            
                            // Validate new password
                            if (newPassword.length < 6) {
                                showError('New password must be at least 6 characters long');
                                return;
                            }
                            
                            if (newPassword !== confirmNewPassword) {
                                showError('New passwords do not match');
                                return;
                            }
                            
                            // Update password
                            user.password = newPassword;
                        }
                        
                        // Update user data
                        user.email = email;
                        user.businessName = businessName;
                        
                        // Save to database
                        await db.put('users', user);
                        
                        // Update settings
                        const allSettings = await db.getAll('settings');
                        const userSettings = allSettings.find(s => s.user_id === user.id);
                        
                        if (userSettings) {
                            userSettings.businessName = businessName;
                            await db.put('settings', userSettings);
                        } else {
                            // Create settings if not exists
                            const newSettings = {
                                user_id: user.id,
                                businessName: businessName,
                                currency: 'Rs.',
                                theme: 'light',
                                created_at: new Date().toISOString()
                            };
                            await db.add('settings', newSettings);
                        }
                        
                        // Update localStorage
                        const userData = JSON.parse(localStorage.getItem('user') || '{}');
                        userData.businessName = businessName;
                        localStorage.setItem('user', JSON.stringify(userData));
                        
                        // Show success message
                        showSuccess();
                        
                        // Clear password fields
                        document.getElementById('current-password').value = '';
                        document.getElementById('new-password').value = '';
                        document.getElementById('confirm-new-password').value = '';
                    } catch (error) {
                        console.error('Error updating profile:', error);
                        showError('An error occurred while updating your profile. Please try again.');
                    }
                });
                
                function showError(message) {
                    const errorElement = document.getElementById('profile-error');
                    const successElement = document.getElementById('profile-success');
                    
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                    successElement.style.display = 'none';
                }
                
                function showSuccess() {
                    const errorElement = document.getElementById('profile-error');
                    const successElement = document.getElementById('profile-success');
                    
                    errorElement.style.display = 'none';
                    successElement.style.display = 'block';
                }
            </script>
        `;
    }
}

const profileView = new ProfileView();
