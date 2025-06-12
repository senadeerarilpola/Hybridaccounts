// Sale Model
class SaleModel {
    constructor() {
        // Define the structure of a sale
        this.defaultSale = {
            id: null,
            customer_id: null,
            sale_date: new Date().toISOString().split('T')[0],
            total_amount: 0,
            discount: 0,
            final_amount: 0,
            amount_paid: 0,
            payment_status: 'Unpaid',
            created_at: new Date().toISOString()
        };
    }
    
    /**
     * Get all sales
     * @returns {Promise<Array>} Array of sales
     */
    async getAllSales() {
        const db = await window.db.dbPromise;
        return db.getAll('sales');
    }
    
    /**
     * Get sales with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated sales and metadata
     */
    async getPaginatedSales(page = 1, limit = 10) {
        const sales = await this.getAllSales();
        
        // Sort by date, newest first
        sales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const totalPages = Math.ceil(sales.length / limit);
        
        // Get customer details for each sale
        const enrichedSales = [];
        for (const sale of sales.slice(startIndex, endIndex)) {
            const customer = await this.getCustomerForSale(sale.customer_id);
            enrichedSales.push({
                ...sale,
                customer_name: customer ? customer.name : 'Unknown Customer'
            });
        }
        
        return {
            sales: enrichedSales,
            pagination: {
                total: sales.length,
                page,
                limit,
                totalPages
            }
        };
    }
    
    /**
     * Get a single sale by ID
     * @param {number} id - Sale ID
     * @returns {Promise<Object|null>} Sale object or null if not found
     */
    async getSale(id) {
        const db = await window.db.dbPromise;
        return db.get('sales', Number(id));
    }
    
    /**
     * Get full sale details including customer and items
     * @param {number} id - Sale ID
     * @returns {Promise<Object>} Complete sale details
     */
    async getSaleDetails(id) {
        const sale = await this.getSale(id);
        
        if (!sale) {
            return null;
        }
        
        // Get customer
        const customer = await this.getCustomerForSale(sale.customer_id);
        
        // Get sale items
        const saleItems = await this.getSaleItems(id);
        
        // Get payments
        const payments = await this.getSalePayments(id);
        
        return {
            ...sale,
            customer,
            items: saleItems,
            payments
        };
    }
    
    /**
     * Create a new sale
     * @param {Object} saleData - Sale data
     * @returns {Promise<number>} ID of the new sale
     */
    async createSale(saleData) {
        const db = await window.db.dbPromise;
        
        const sale = {
            ...this.defaultSale,
            ...saleData,
            created_at: new Date().toISOString()
        };
        
        return db.add('sales', sale);
    }
    
    /**
     * Update a sale
     * @param {Object} saleData - Sale data with ID
     * @returns {Promise<number>} ID of the updated sale
     */
    async updateSale(saleData) {
        const db = await window.db.dbPromise;
        
        // Get the existing sale
        const existingSale = await this.getSale(saleData.id);
        
        if (!existingSale) {
            throw new Error('Sale not found');
        }
        
        const updatedSale = {
            ...existingSale,
            ...saleData,
            updated_at: new Date().toISOString()
        };
        
        return db.put('sales', updatedSale);
    }
    
    /**
     * Delete a sale
     * @param {number} id - Sale ID
     * @returns {Promise<void>}
     */
    async deleteSale(id) {
        const db = await window.db.dbPromise;
        
        // First delete all related items and payments
        await this.deleteSaleItems(id);
        await this.deleteSalePayments(id);
        
        // Then delete the sale
        return db.delete('sales', Number(id));
    }
    
    /**
     * Get all items for a sale
     * @param {number} saleId - Sale ID
     * @returns {Promise<Array>} Array of sale items
     */
    async getSaleItems(saleId) {
        const db = await window.db.dbPromise;
        const tx = db.transaction('sale_items', 'readonly');
        const index = tx.store.index('sale_id');
        return index.getAll(Number(saleId));
    }
    
    /**
     * Add an item to a sale
     * @param {Object} itemData - Sale item data
     * @returns {Promise<number>} ID of the new sale item
     */
    async addSaleItem(itemData) {
        const db = await window.db.dbPromise;
        
        // Calculate the subtotal
        const subtotal = itemData.quantity * itemData.unit_price;
        
        const saleItem = {
            ...itemData,
            subtotal,
            created_at: new Date().toISOString()
        };
        
        const id = await db.add('sale_items', saleItem);
        
        // Update the sale totals
        await this.updateSaleTotals(itemData.sale_id);
        
        return id;
    }
    
    /**
     * Delete an item from a sale
     * @param {number} itemId - Sale item ID
     * @returns {Promise<void>}
     */
    async deleteSaleItem(itemId) {
        const db = await window.db.dbPromise;
        
        // Get the item to get its sale_id
        const item = await db.get('sale_items', Number(itemId));
        
        if (!item) {
            throw new Error('Sale item not found');
        }
        
        // Delete the item
        await db.delete('sale_items', Number(itemId));
        
        // Update the sale totals
        await this.updateSaleTotals(item.sale_id);
    }
    
    /**
     * Delete all items for a sale
     * @param {number} saleId - Sale ID
     * @returns {Promise<void>}
     */
    async deleteSaleItems(saleId) {
        const db = await window.db.dbPromise;
        const tx = db.transaction('sale_items', 'readwrite');
        const index = tx.store.index('sale_id');
        const keys = await index.getAllKeys(Number(saleId));
        
        for (const key of keys) {
            await tx.store.delete(key);
        }
        
        await tx.done;
    }
    
    /**
     * Get all payments for a sale
     * @param {number} saleId - Sale ID
     * @returns {Promise<Array>} Array of payments
     */
    async getSalePayments(saleId) {
        const db = await window.db.dbPromise;
        const tx = db.transaction('payments', 'readonly');
        const index = tx.store.index('sale_id');
        return index.getAll(Number(saleId));
    }
    
    /**
     * Add a payment to a sale
     * @param {Object} paymentData - Payment data
     * @returns {Promise<number>} ID of the new payment
     */
    async addPayment(paymentData) {
        const db = await window.db.dbPromise;
        
        const payment = {
            ...paymentData,
            payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };
        
        const id = await db.add('payments', payment);
        
        // Update the sale payment status
        await this.updateSalePaymentStatus(payment.sale_id);
        
        return id;
    }
    
    /**
     * Delete all payments for a sale
     * @param {number} saleId - Sale ID
     * @returns {Promise<void>}
     */
    async deleteSalePayments(saleId) {
        const db = await window.db.dbPromise;
        const tx = db.transaction('payments', 'readwrite');
        const index = tx.store.index('sale_id');
        const keys = await index.getAllKeys(Number(saleId));
        
        for (const key of keys) {
            await tx.store.delete(key);
        }
        
        await tx.done;
    }
    
    /**
     * Get customer for a sale
     * @param {number} customerId - Customer ID
     * @returns {Promise<Object|null>} Customer object or null if not found
     */
    async getCustomerForSale(customerId) {
        const db = await window.db.dbPromise;
        return db.get('customers', Number(customerId));
    }
    
    /**
     * Update the totals for a sale
     * @param {number} saleId - Sale ID
     * @returns {Promise<void>}
     */
    async updateSaleTotals(saleId) {
        const saleItems = await this.getSaleItems(saleId);
        const sale = await this.getSale(saleId);
        
        if (!sale) {
            throw new Error('Sale not found');
        }
        
        // Calculate new total
        const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
        
        // Apply discount (keep existing discount)
        const finalAmount = totalAmount - (sale.discount || 0);
        
        // Update sale
        await this.updateSale({
            id: saleId,
            total_amount: totalAmount,
            final_amount: finalAmount
        });
        
        // Update payment status
        await this.updateSalePaymentStatus(saleId);
    }
    
    /**
     * Update the payment status for a sale
     * @param {number} saleId - Sale ID
     * @returns {Promise<void>}
     */
    async updateSalePaymentStatus(saleId) {
        const sale = await this.getSale(saleId);
        const payments = await this.getSalePayments(saleId);
        
        if (!sale) {
            throw new Error('Sale not found');
        }
        
        // Calculate amount paid
        const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Determine payment status
        let paymentStatus = 'Unpaid';
        if (amountPaid >= sale.final_amount) {
            paymentStatus = 'Paid';
        } else if (amountPaid > 0) {
            paymentStatus = 'Partially Paid';
        }
        
        // Update sale
        await this.updateSale({
            id: saleId,
            amount_paid: amountPaid,
            payment_status: paymentStatus
        });
    }
    
    /**
     * Apply a discount to a sale
     * @param {number} saleId - Sale ID
     * @param {number} discount - Discount amount
     * @returns {Promise<void>}
     */
    async applyDiscount(saleId, discount) {
        const sale = await this.getSale(saleId);
        
        if (!sale) {
            throw new Error('Sale not found');
        }
        
        // Validate discount
        if (discount < 0) {
            throw new Error('Discount cannot be negative');
        }
        
        if (discount > sale.total_amount) {
            throw new Error('Discount cannot be greater than total amount');
        }
        
        // Calculate new final amount
        const finalAmount = sale.total_amount - discount;
        
        // Update sale
        await this.updateSale({
            id: saleId,
            discount,
            final_amount: finalAmount
        });
        
        // Update payment status
        await this.updateSalePaymentStatus(saleId);
    }
}

// Create an instance of the SaleModel
const saleModel = new SaleModel();
