/**
 * Business Analytics Utility
 * Provides advanced business analytics and reporting for SupiriAccounts
 */
class BusinessAnalytics {
    constructor() {
        // Set default date ranges
        this.dateRanges = {
            today: this.getDateRange('today'),
            thisWeek: this.getDateRange('week'),
            thisMonth: this.getDateRange('month'),
            thisYear: this.getDateRange('year'),
            allTime: this.getDateRange('all')
        };
    }

    /**
     * Get sales summary for a specific period
     * @param {string} period - 'today', 'week', 'month', 'year', 'all' or custom date range
     * @param {Date} [startDate] - Start date for custom range
     * @param {Date} [endDate] - End date for custom range
     * @returns {Promise<Object>} Sales summary data
     */
    async getSalesSummary(period = 'month', startDate = null, endDate = null) {
        try {
            // Determine date range
            let dateRange;
            if (startDate && endDate) {
                dateRange = {
                    start: startDate,
                    end: endDate
                };
            } else {
                dateRange = this.getDateRange(period);
            }

            // Get all sales
            const allSales = await db.getSales();
            
            // Filter sales within the date range
            const salesInRange = allSales.filter(sale => {
                const saleDate = new Date(sale.sale_date);
                return saleDate >= dateRange.start && saleDate <= dateRange.end;
            });

            // Calculate totals
            let totalSales = salesInRange.length;
            let totalRevenue = salesInRange.reduce((sum, sale) => sum + sale.final_amount, 0);
            let totalDiscount = salesInRange.reduce((sum, sale) => sum + sale.discount, 0);
            
            // Get payment information for completion rate
            let fullyPaidCount = 0;
            let partiallyPaidCount = 0;
            let unpaidCount = 0;
            
            for (const sale of salesInRange) {
                if (sale.payment_status === 'Paid') {
                    fullyPaidCount++;
                } else if (sale.payment_status === 'Partially Paid') {
                    partiallyPaidCount++;
                } else {
                    unpaidCount++;
                }
            }

            return {
                period: {
                    name: period,
                    start: dateRange.start.toISOString().split('T')[0],
                    end: dateRange.end.toISOString().split('T')[0]
                },
                totals: {
                    sales: totalSales,
                    revenue: totalRevenue,
                    discount: totalDiscount,
                    average: totalSales > 0 ? totalRevenue / totalSales : 0
                },
                paymentStatus: {
                    fullyPaid: {
                        count: fullyPaidCount,
                        percentage: totalSales > 0 ? (fullyPaidCount / totalSales * 100) : 0
                    },
                    partiallyPaid: {
                        count: partiallyPaidCount,
                        percentage: totalSales > 0 ? (partiallyPaidCount / totalSales * 100) : 0
                    },
                    unpaid: {
                        count: unpaidCount,
                        percentage: totalSales > 0 ? (unpaidCount / totalSales * 100) : 0
                    }
                },
                salesByDay: this.aggregateSalesByDay(salesInRange)
            };
        } catch (error) {
            console.error('Error generating sales summary:', error);
            throw error;
        }
    }

    /**
     * Get inventory summary with stock levels and valuation
     * @returns {Promise<Object>} Inventory summary data
     */
    async getInventorySummary() {
        try {
            // Get all items
            const items = await db.getItems();
            
            // Calculate inventory stats
            const totalItems = items.length;
            const totalValue = items.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0);
            const retailValue = items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
            const potentialProfit = retailValue - totalValue;
            
            // Calculate stock levels
            const outOfStock = items.filter(item => item.quantity <= 0).length;
            const lowStock = items.filter(item => item.quantity > 0 && item.quantity <= 5).length;
            const healthyStock = items.filter(item => item.quantity > 5).length;
            
            // Get top items by value
            const topItemsByValue = [...items]
                .sort((a, b) => (b.selling_price * b.quantity) - (a.selling_price * a.quantity))
                .slice(0, 5);
                
            // Get items needing reorder
            const needsReorder = items
                .filter(item => item.quantity <= 5)
                .sort((a, b) => a.quantity - b.quantity);
                
            return {
                summary: {
                    totalItems,
                    totalValue,
                    retailValue,
                    potentialProfit
                },
                stockLevels: {
                    outOfStock,
                    lowStock,
                    healthyStock
                },
                topItemsByValue,
                needsReorder
            };
        } catch (error) {
            console.error('Error generating inventory summary:', error);
            throw error;
        }
    }

    /**
     * Get customer insights including top customers and purchase patterns
     * @param {string} period - 'month', 'quarter', 'year', 'all'
     * @returns {Promise<Object>} Customer insights data
     */
    async getCustomerInsights(period = 'month') {
        try {
            // Get date range
            const dateRange = this.getDateRange(period);
            
            // Get all customers, sales, and payments
            const customers = await db.getCustomers();
            const allSales = await db.getSales();
            
            // Filter sales within date range
            const salesInRange = allSales.filter(sale => {
                const saleDate = new Date(sale.sale_date);
                return saleDate >= dateRange.start && saleDate <= dateRange.end;
            });
            
            // Calculate customer metrics
            const customerStats = {};
            
            // Initialize stats for all customers
            for (const customer of customers) {
                customerStats[customer.id] = {
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone,
                    totalPurchases: 0,
                    totalSpent: 0,
                    lastPurchase: null,
                    averagePurchaseValue: 0,
                    purchases: []
                };
            }
            
            // Add walk-in customer stats
            customerStats['walk-in'] = {
                id: 'walk-in',
                name: 'Walk-in Customer',
                phone: '',
                totalPurchases: 0,
                totalSpent: 0,
                lastPurchase: null,
                averagePurchaseValue: 0,
                purchases: []
            };
            
            // Calculate per-customer stats
            for (const sale of salesInRange) {
                const customerId = sale.customer_id || 'walk-in';
                
                if (customerStats[customerId]) {
                    customerStats[customerId].totalPurchases++;
                    customerStats[customerId].totalSpent += sale.final_amount;
                    
                    const saleDate = new Date(sale.sale_date);
                    if (!customerStats[customerId].lastPurchase || 
                        saleDate > new Date(customerStats[customerId].lastPurchase)) {
                        customerStats[customerId].lastPurchase = sale.sale_date;
                    }
                    
                    customerStats[customerId].purchases.push({
                        id: sale.id,
                        date: sale.sale_date,
                        amount: sale.final_amount
                    });
                }
            }
            
            // Calculate average purchase values and remove empty customers
            const activeCustomers = Object.values(customerStats)
                .filter(customer => customer.totalPurchases > 0)
                .map(customer => {
                    customer.averagePurchaseValue = customer.totalPurchases > 0 ? 
                        customer.totalSpent / customer.totalPurchases : 0;
                    return customer;
                });
                
            // Sort to find top customers
            const topCustomers = [...activeCustomers]
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5);
                
            // Get total active customers
            const activeCustomerCount = activeCustomers.length;
            const inactiveCustomerCount = customers.length - (activeCustomerCount - (customerStats['walk-in'].totalPurchases > 0 ? 1 : 0));
            
            return {
                period: {
                    name: period,
                    start: dateRange.start.toISOString().split('T')[0],
                    end: dateRange.end.toISOString().split('T')[0]
                },
                summary: {
                    totalCustomers: customers.length,
                    activeCustomers: activeCustomerCount,
                    inactiveCustomers: inactiveCustomerCount,
                    walkInPercentage: salesInRange.length > 0 ? 
                        (customerStats['walk-in'].totalPurchases / salesInRange.length) * 100 : 0
                },
                topCustomers,
                customerRetention: this.calculateRetention(customers, salesInRange)
            };
        } catch (error) {
            console.error('Error generating customer insights:', error);
            throw error;
        }
    }

    /**
     * Generate a profitability report
     * @param {string} period - 'week', 'month', 'quarter', 'year'
     * @returns {Promise<Object>} Profitability data
     */
    async getProfitabilityReport(period = 'month') {
        try {
            // Get date range
            const dateRange = this.getDateRange(period);
            
            // Get all sales in range with their items
            const allSales = await db.getSales();
            const salesInRange = allSales.filter(sale => {
                const saleDate = new Date(sale.sale_date);
                return saleDate >= dateRange.start && saleDate <= dateRange.end;
            });
            
            let totalRevenue = 0;
            let totalCost = 0;
            let totalDiscount = 0;
            
            // Process each sale
            for (const sale of salesInRange) {
                totalRevenue += sale.final_amount;
                totalDiscount += sale.discount;
                
                // Get sale items to calculate costs
                const saleItems = await db.getSaleItems(sale.id);
                
                for (const saleItem of saleItems) {
                    // Get the item details to find cost price
                    const item = await db.getItem(saleItem.item_id);
                    if (item) {
                        totalCost += (item.cost_price * saleItem.quantity);
                    }
                }
            }
            
            // Calculate profit metrics
            const grossProfit = totalRevenue - totalCost;
            const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
            const discountImpact = totalDiscount > 0 ? (totalDiscount / (totalRevenue + totalDiscount)) * 100 : 0;
            
            return {
                period: {
                    name: period,
                    start: dateRange.start.toISOString().split('T')[0],
                    end: dateRange.end.toISOString().split('T')[0]
                },
                overview: {
                    totalRevenue,
                    totalCost,
                    grossProfit,
                    grossMargin,
                    totalDiscount,
                    discountImpact
                },
                salesCount: salesInRange.length,
                averageSaleValue: salesInRange.length > 0 ? totalRevenue / salesInRange.length : 0
            };
        } catch (error) {
            console.error('Error generating profitability report:', error);
            throw error;
        }
    }

    /**
     * Get a date range based on period
     * @param {string} period - 'today', 'week', 'month', 'year', 'all'
     * @returns {Object} Date range with start and end
     */
    getDateRange(period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const start = new Date(today);
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        
        switch (period) {
            case 'today':
                // Start and end already set to today
                break;
                
            case 'week':
                // Start of current week (Sunday)
                start.setDate(today.getDate() - today.getDay());
                // End of week (Saturday)
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
                
            case 'month':
                // Start of current month
                start.setDate(1);
                // End of current month
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
                break;
                
            case 'quarter':
                // Start of current quarter
                const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
                start.setMonth(quarterMonth);
                start.setDate(1);
                // End of current quarter
                end.setMonth(quarterMonth + 3);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
                break;
                
            case 'year':
                // Start of current year
                start.setMonth(0);
                start.setDate(1);
                // End of current year
                end.setMonth(11);
                end.setDate(31);
                end.setHours(23, 59, 59, 999);
                break;
                
            case 'all':
            default:
                // All time - use a far past date for start
                start.setFullYear(2020);
                start.setMonth(0);
                start.setDate(1);
                break;
        }
        
        return { start, end };
    }

    /**
     * Aggregate sales by day for the given sales
     * @param {Array} sales - Array of sale objects
     * @returns {Object} Sales aggregated by day
     */
    aggregateSalesByDay(sales) {
        const salesByDay = {};
        
        for (const sale of sales) {
            const dateStr = sale.sale_date;
            
            if (!salesByDay[dateStr]) {
                salesByDay[dateStr] = {
                    count: 0,
                    total: 0
                };
            }
            
            salesByDay[dateStr].count++;
            salesByDay[dateStr].total += sale.final_amount;
        }
        
        return salesByDay;
    }

    /**
     * Calculate customer retention metrics
     * @param {Array} customers - All customers
     * @param {Array} sales - Sales in the period
     * @returns {Object} Retention metrics
     */
    calculateRetention(customers, sales) {
        // Group customers by their first and last purchase dates
        const customerPurchaseDates = {};
        
        for (const sale of sales) {
            const customerId = sale.customer_id;
            if (customerId && customerId !== 'walk-in') {
                if (!customerPurchaseDates[customerId]) {
                    customerPurchaseDates[customerId] = {
                        first: sale.sale_date,
                        last: sale.sale_date,
                        count: 0
                    };
                }
                
                customerPurchaseDates[customerId].count++;
                
                const saleDate = new Date(sale.sale_date);
                const firstDate = new Date(customerPurchaseDates[customerId].first);
                const lastDate = new Date(customerPurchaseDates[customerId].last);
                
                if (saleDate < firstDate) {
                    customerPurchaseDates[customerId].first = sale.sale_date;
                }
                
                if (saleDate > lastDate) {
                    customerPurchaseDates[customerId].last = sale.sale_date;
                }
            }
        }
        
        // Calculate repeat customer rate
        const buyingCustomers = Object.keys(customerPurchaseDates).length;
        const repeatCustomers = Object.values(customerPurchaseDates)
            .filter(dates => dates.count > 1)
            .length;
            
        const repeatRate = buyingCustomers > 0 ? (repeatCustomers / buyingCustomers) * 100 : 0;
        
        return {
            totalCustomersWithPurchases: buyingCustomers,
            repeatCustomers,
            oneTimePurchases: buyingCustomers - repeatCustomers,
            repeatRate
        };
    }

    /**
     * Generate a visualization ready data for the given dataset
     * @param {Object} data - The data to visualize
     * @param {string} type - The type of visualization ('line', 'bar', 'pie')
     * @returns {Object} Visualization-ready data object
     */
    prepareVisualization(data, type = 'line') {
        // This method can be expanded based on specific visualization needs
        // For now, return a simple format that would work with common chart libraries
        
        switch (type) {
            case 'pie':
                // Example transformation for pie charts
                return {
                    type: 'pie',
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data),
                        backgroundColor: this.generateColors(Object.keys(data).length)
                    }]
                };
                
            case 'bar':
                // Example transformation for bar charts
                return {
                    type: 'bar',
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data).map(v => typeof v === 'object' ? v.total || v.count : v),
                        backgroundColor: this.generateColors(1)[0]
                    }]
                };
                
            case 'line':
            default:
                // Example transformation for line charts
                return {
                    type: 'line',
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data).map(v => typeof v === 'object' ? v.total || v.count : v),
                        borderColor: this.generateColors(1)[0],
                        fill: false
                    }]
                };
        }
    }
    
    /**
     * Generate an array of colors
     * @param {number} count - Number of colors to generate
     * @returns {Array} Array of color strings
     */
    generateColors(count) {
        const baseColors = [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
            '#5a5c69', '#858796', '#2e59d9', '#17a673', '#2c9faf'
        ];
        
        // Return base colors if we have enough
        if (count <= baseColors.length) {
            return baseColors.slice(0, count);
        }
        
        // Generate more colors if needed
        const colors = [...baseColors];
        
        while (colors.length < count) {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        
        return colors;
    }
}

// Create a global instance
const businessAnalytics = new BusinessAnalytics();
