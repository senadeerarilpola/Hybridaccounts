/**
 * Data Backup and Restore Utility
 * Handles importing and exporting data for SupiriAccounts
 */
class DataManager {
    /**
     * Export all data from IndexedDB to a JSON file
     */
    async exportData() {
        try {
            // Show loading indicator
            this.showMessage('Preparing data export...', 'info');
            
            // Get all data from database
            const customers = await db.getCustomers();
            const items = await db.getItems();
            const sales = await db.getSales();
            
            // Get all sales items and payments
            const allSaleItems = [];
            const allPayments = [];
            
            for (const sale of sales) {
                const saleItems = await db.getSaleItems(sale.id);
                const payments = await db.getPayments(sale.id);
                
                allSaleItems.push(...saleItems);
                allPayments.push(...payments);
            }
            
            // Create export object
            const exportData = {
                customers,
                items,
                sales,
                saleItems: allSaleItems,
                payments: allPayments,
                exportDate: new Date().toISOString(),
                appVersion: '1.0.0',
                metadata: {
                    exportedBy: this.getCurrentUser(),
                    deviceInfo: this.getDeviceInfo()
                }
            };
            
            // Convert to JSON string
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Create a Blob and download link
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Format filename with date
            const date = new Date().toISOString().split('T')[0];
            a.download = `supiri-accounts-export-${date}.json`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Data exported successfully!', 'success');
            
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showMessage('Error exporting data: ' + error.message, 'danger');
            return false;
        }
    }
    
    /**
     * Import data from a JSON file into IndexedDB
     * @param {File} file - The JSON file to import
     * @param {Object} options - Import options
     * @param {boolean} options.clearExisting - Whether to clear existing data before import
     * @param {boolean} options.importCustomers - Whether to import customers
     * @param {boolean} options.importItems - Whether to import items
     * @param {boolean} options.importSales - Whether to import sales
     */
    async importData(file, options = {}) {
        const defaultOptions = {
            clearExisting: false,
            importCustomers: true,
            importItems: true,
            importSales: true
        };
        
        const importOptions = { ...defaultOptions, ...options };
        
        try {
            // Show loading indicator
            this.showMessage('Reading import file...', 'info');
            
            // Read the file
            const fileContent = await this.readFileAsText(file);
            const importData = JSON.parse(fileContent);
            
            // Validate the data format
            if (!this.validateImportData(importData)) {
                this.showMessage('Invalid data format in the import file.', 'danger');
                return false;
            }
            
            // Confirm data replacement if clearing existing
            if (importOptions.clearExisting) {
                if (!confirm('This will replace ALL your existing data. This cannot be undone. Are you sure?')) {
                    this.showMessage('Import cancelled.', 'info');
                    return false;
                }
            }
            
            // Begin import transaction
            this.showMessage('Importing data...', 'info');
            
            // Open a database connection
            const dbConnection = await db.dbPromise;
            
            // Start a transaction
            const tx = dbConnection.transaction(
                ['customers', 'items', 'sales', 'sale_items', 'payments'], 
                'readwrite'
            );
            
            // Clear existing data if requested
            if (importOptions.clearExisting) {
                if (importOptions.importCustomers) await tx.objectStore('customers').clear();
                if (importOptions.importItems) await tx.objectStore('items').clear();
                if (importOptions.importSales) {
                    await tx.objectStore('sales').clear();
                    await tx.objectStore('sale_items').clear();
                    await tx.objectStore('payments').clear();
                }
            }
            
            // Import customers
            if (importOptions.importCustomers && importData.customers) {
                for (const customer of importData.customers) {
                    // Remove id if it exists to avoid conflicts
                    if (importOptions.clearExisting) {
                        delete customer.id;
                    }
                    await tx.objectStore('customers').put(customer);
                }
                this.showMessage(`Imported ${importData.customers.length} customers.`, 'success');
            }
            
            // Import items
            if (importOptions.importItems && importData.items) {
                for (const item of importData.items) {
                    if (importOptions.clearExisting) {
                        delete item.id;
                    }
                    await tx.objectStore('items').put(item);
                }
                this.showMessage(`Imported ${importData.items.length} items.`, 'success');
            }
            
            // Import sales and related data
            if (importOptions.importSales && importData.sales) {
                // Create a mapping for old to new IDs
                const saleIdMap = new Map();
                
                // Import sales
                for (const sale of importData.sales) {
                    const oldId = sale.id;
                    if (importOptions.clearExisting) {
                        delete sale.id;
                    }
                    const newId = await tx.objectStore('sales').put(sale);
                    
                    // Store the ID mapping
                    saleIdMap.set(oldId, newId);
                }
                
                // Import sale items with new sale IDs
                if (importData.saleItems) {
                    for (const saleItem of importData.saleItems) {
                        if (importOptions.clearExisting) {
                            delete saleItem.id;
                        }
                        
                        // Update the sale_id to the new mapped ID
                        if (saleIdMap.has(saleItem.sale_id)) {
                            saleItem.sale_id = saleIdMap.get(saleItem.sale_id);
                            await tx.objectStore('sale_items').put(saleItem);
                        }
                    }
                }
                
                // Import payments with new sale IDs
                if (importData.payments) {
                    for (const payment of importData.payments) {
                        if (importOptions.clearExisting) {
                            delete payment.id;
                        }
                        
                        // Update the sale_id to the new mapped ID
                        if (saleIdMap.has(payment.sale_id)) {
                            payment.sale_id = saleIdMap.get(payment.sale_id);
                            await tx.objectStore('payments').put(payment);
                        }
                    }
                }
                
                this.showMessage(`Imported ${importData.sales.length} sales with related data.`, 'success');
            }
            
            // Complete the transaction
            await tx.complete;
            
            this.showMessage('Data import completed successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            this.showMessage('Error importing data: ' + error.message, 'danger');
            return false;
        }
    }
    
    /**
     * Validate the format of imported data
     * @param {Object} data - The imported data object
     * @returns {boolean} Whether the data is valid
     */
    validateImportData(data) {
        // Basic structure validation
        if (!data) return false;
        
        // Check for required data collections
        const hasCustomers = Array.isArray(data.customers);
        const hasItems = Array.isArray(data.items);
        const hasSales = Array.isArray(data.sales);
        
        // Must have at least one valid collection
        return hasCustomers || hasItems || hasSales;
    }
    
    /**
     * Read a file as text
     * @param {File} file - The file to read
     * @returns {Promise<string>} The file contents as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
    
    /**
     * Get information about the current user
     * @returns {Object} User information
     */
    getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return {
            username: user.username || 'anonymous',
            userId: user.id || 0
        };
    }
    
    /**
     * Get information about the device
     * @returns {Object} Device information
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Show a message to the user
     * @param {string} message - The message to show
     * @param {string} type - The type of message (success, info, warning, danger)
     */
    showMessage(message, type = 'info') {
        // Create a toast notification element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // Create the toast content
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Create a container for the toast if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Add the toast to the container
        toastContainer.appendChild(toast);
        
        // Initialize and show the toast
        const bsToast = new bootstrap.Toast(toast, {
            delay: 5000
        });
        bsToast.show();
        
        // Remove the toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    }
}

// Create a global data manager instance
const dataManager = new DataManager();
