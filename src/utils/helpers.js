// Helper utility functions for SupiriAccounts PWA

/**
 * Format currency values consistently
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted currency string without currency symbol
 */
function formatCurrency(amount, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date values consistently
 * @param {string|Date} date - The date to format
 * @param {string} format - The format to use (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    } else if (format === 'MM/DD/YYYY') {
        return `${month}/${day}/${year}`;
    } else if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    }
    
    return `${year}-${month}-${day}`;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Check if the device is currently online
 * @returns {boolean} True if online, false otherwise
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 * @param {number} duration - How long to show the toast in ms
 */
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = `toast-${generateId()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast bg-${type} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Initialize and show the toast
    const toastInstance = new bootstrap.Toast(toast, {
        autohide: true,
        delay: duration
    });
    toastInstance.show();
    
    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', function () {
        toast.remove();
    });
}

/**
 * Handle offline status changes
 */
function setupOfflineDetection() {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.className = 'offline-indicator';
    offlineIndicator.textContent = 'You are offline';
    offlineIndicator.style.display = 'none';
    document.body.appendChild(offlineIndicator);
    
    window.addEventListener('online', function() {
        offlineIndicator.style.display = 'none';
        showToast('You are back online', 'success');
    });
    
    window.addEventListener('offline', function() {
        offlineIndicator.style.display = 'block';
        showToast('You are offline. Changes will be saved when you reconnect.', 'warning');
    });
    
    // Check initial status
    if (!navigator.onLine) {
        offlineIndicator.style.display = 'block';
    }
}

// Initialize offline detection when the page loads
document.addEventListener('DOMContentLoaded', setupOfflineDetection);
