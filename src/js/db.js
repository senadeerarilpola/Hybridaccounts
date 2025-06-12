// Database setup and operations
class SupiriDB {
    constructor() {
        this.dbPromise = this.initDB();
    }

    // Initialize the IndexedDB database
    initDB() {
        try {
            return idb.openDB('supiriAccounts', 1, {
                upgrade(db) {
                // Create object stores (tables) equivalent to your SQLite tables
                
                // Customers table
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                    customerStore.createIndex('name', 'name');
                    customerStore.createIndex('email', 'email');
                    customerStore.createIndex('phone', 'phone');
                }
                
                // Items table
                if (!db.objectStoreNames.contains('items')) {
                    const itemStore = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
                    itemStore.createIndex('name', 'name');
                    itemStore.createIndex('price', 'price');
                }
                
                // Sales table
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
                    salesStore.createIndex('customer_id', 'customer_id');
                    salesStore.createIndex('sale_date', 'sale_date');
                    salesStore.createIndex('payment_status', 'payment_status');
                }
                
                // Sale Items table
                if (!db.objectStoreNames.contains('sale_items')) {
                    const saleItemsStore = db.createObjectStore('sale_items', { keyPath: 'id', autoIncrement: true });
                    saleItemsStore.createIndex('sale_id', 'sale_id');
                    saleItemsStore.createIndex('item_id', 'item_id');
                }
                
                // Payments table
                if (!db.objectStoreNames.contains('payments')) {
                    const paymentsStore = db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
                    paymentsStore.createIndex('sale_id', 'sale_id');
                    paymentsStore.createIndex('payment_date', 'payment_date');
                }
                  // Users table for authentication
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('username', 'username', { unique: true });
                    usersStore.createIndex('email', 'email');
                }
                
                // Settings table for user preferences
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'id', autoIncrement: true });
                    settingsStore.createIndex('user_id', 'user_id');
                }
                
                console.log('Database setup complete');
            }
        });
    }
      // Customer Methods with error handling
    async getCustomers() {
        try {
            const db = await this.dbPromise;
            return db.getAll('customers');
        } catch (error) {
            console.error('Error getting customers:', error);
            throw new Error('Failed to get customers: ' + error.message);
        }
    }
    
    async getCustomer(id) {
        const db = await this.dbPromise;
        return db.get('customers', Number(id));
    }
    
    async addCustomer(customer) {
        const db = await this.dbPromise;
        return db.add('customers', customer);
    }
    
    async updateCustomer(customer) {
        const db = await this.dbPromise;
        return db.put('customers', customer);
    }
    
    async deleteCustomer(id) {
        const db = await this.dbPromise;
        return db.delete('customers', Number(id));
    }
    
    // Item Methods
    async getItems() {
        const db = await this.dbPromise;
        return db.getAll('items');
    }
    
    async getItem(id) {
        const db = await this.dbPromise;
        return db.get('items', Number(id));
    }
      async addItem(item) {
        const db = await this.dbPromise;
        return db.add('items', item);
    }
      async updateItem(item) {
        const db = await this.dbPromise;
        return db.put('items', item);
    }
    
    async deleteItem(id) {
        const db = await this.dbPromise;
        return db.delete('items', Number(id));
    }
    
    // Sales Methods
    async getSales() {
        const db = await this.dbPromise;
        return db.getAll('sales');
    }
    
    async getSale(id) {
        const db = await this.dbPromise;
        return db.get('sales', Number(id));
    }
    
    async addSale(sale) {
        const db = await this.dbPromise;
        return db.add('sales', sale);
    }
    
    async updateSale(sale) {
        const db = await this.dbPromise;
        return db.put('sales', sale);
    }
    
    async deleteSale(id) {
        const db = await this.dbPromise;
        return db.delete('sales', Number(id));
    }
      // Sale Items Methods
    async getSaleItems(saleId) {
        const db = await this.dbPromise;
        const saleItems = await db.getAll('sale_items');
        return saleItems.filter(item => item.sale_id === Number(saleId));
    }
    
    async addSaleItem(saleItem) {
        const db = await this.dbPromise;
        return db.add('sale_items', saleItem);
    }
    
    async updateSaleItem(saleItem) {
        const db = await this.dbPromise;
        return db.put('sale_items', saleItem);
    }
    
    async deleteSaleItem(id) {
        const db = await this.dbPromise;
        return db.delete('sale_items', Number(id));
    }
    
    // Payment Methods
    async getPayments(saleId) {
        const db = await this.dbPromise;
        const payments = await db.getAll('payments');
        return payments.filter(payment => payment.sale_id === Number(saleId));
    }
    
    async addPayment(payment) {
        const db = await this.dbPromise;
        return db.add('payments', payment);
    }
    
    async updatePayment(payment) {
        const db = await this.dbPromise;
        return db.put('payments', payment);
    }
      async deletePayment(id) {
        const db = await this.dbPromise;
        return db.delete('payments', Number(id));
    }
    
    // User Methods
    async getUsers() {
        const db = await this.dbPromise;
        return db.getAll('users');
    }
    
    async getUser(id) {
        const db = await this.dbPromise;
        return db.get('users', Number(id));
    }
    
    async getUserByUsername(username) {
        const db = await this.dbPromise;
        const index = db.transaction('users').store.index('username');
        return index.get(username);
    }
    
    async addUser(user) {
        const db = await this.dbPromise;
        return db.add('users', user);
    }
    
    async updateUser(user) {
        const db = await this.dbPromise;
        return db.put('users', user);
    }
    
    async deleteUser(id) {
        const db = await this.dbPromise;
        return db.delete('users', Number(id));
    }
    
    // Settings Methods
    async getSettings(userId) {
        const db = await this.dbPromise;
        const allSettings = await db.getAll('settings');
        return allSettings.find(setting => setting.user_id === Number(userId));
    }
    
    async addSettings(settings) {
        const db = await this.dbPromise;
        return db.add('settings', settings);
    }
    
    async updateSettings(settings) {
        const db = await this.dbPromise;
        return db.put('settings', settings);
    }
}

// Create a global database instance
const db = new SupiriDB();
