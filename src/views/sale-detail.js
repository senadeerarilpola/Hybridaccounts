/**
 * Sale Detail view component
 * For viewing sale details and managing payments
 */
class SaleDetailView {
    constructor(saleId) {
        this.saleId = saleId;
        this.sale = null;
        this.customer = null;
        this.saleItems = [];
        this.payments = [];
        this.items = [];
    }
    
    /**
     * Initialize the view
     */
    async init() {
        try {
            // Load data from database
            this.sale = await db.getSale(this.saleId);
            
            if (!this.sale) {
                return `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Sale Not Found</h4>
                        <p>The requested sale could not be found.</p>
                        <hr>
                        <p class="mb-0">
                            <a href="#/sales" class="alert-link">Return to Sales</a>
                        </p>
                    </div>
                `;
            }
            
            this.customer = await db.getCustomer(this.sale.customer_id);
            this.saleItems = await db.getSaleItems(this.saleId);
            this.payments = await db.getPayments(this.saleId);
            
            // Load all items to get their details
            this.items = await db.getItems();
            
            return this.render();
        } catch (error) {
            console.error('Error loading sale details:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error!</h4>
                    <p>Failed to load sale details.</p>
                    <hr>
                    <p class="mb-0">Please try again or contact support.</p>
                </div>
            `;
        }
    }
    
    /**
     * Render the sale detail view
     */
    render() {
        const saleDate = new Date(this.sale.sale_date).toLocaleDateString();
        
        // Calculate payment status
        const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = Math.max(0, this.sale.final_amount - totalPaid);
        
        return `
            <div class="sale-detail-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Sale #${this.saleId}</h1>
                    <div>
                        <a href="#/sales" class="btn btn-outline-secondary me-2">
                            <i class="fas fa-arrow-left"></i> Back to Sales
                        </a>
                        <div class="btn-group">
                            <button type="button" class="btn btn-primary dropdown-toggle" 
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-cog"></i> Actions
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" id="print-receipt-btn">
                                    <i class="fas fa-print"></i> Print Receipt</a>
                                </li>
                                <li><a class="dropdown-item" href="#" id="add-payment-btn">
                                    <i class="fas fa-money-bill"></i> Add Payment</a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" id="delete-sale-btn">
                                    <i class="fas fa-trash-alt"></i> Delete Sale</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Sale details -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Sale Details</h5>
                            </div>
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-6 mb-3 mb-md-0">
                                        <h6>Customer</h6>
                                        <p class="mb-0">
                                            ${this.customer ? this.customer.name : 'Unknown Customer'}<br>
                                            ${this.customer && this.customer.phone ? this.customer.phone : ''}<br>
                                            ${this.customer && this.customer.email ? this.customer.email : ''}
                                        </p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6>Sale Information</h6>
                                        <div class="row">
                                            <div class="col-5 text-muted">Date:</div>
                                            <div class="col-7">${saleDate}</div>
                                            <div class="col-5 text-muted">Status:</div>
                                            <div class="col-7">
                                                <span class="badge ${this.getStatusBadgeClass()}">${this.formatStatus(this.sale.payment_status)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Items list -->
                                <h6>Items</h6>
                                <div class="table-responsive">
                                    <table class="table table-striped table-sm">
                                        <thead>
                                            <tr>
                                                <th scope="col">Item</th>
                                                <th scope="col" class="text-center">Qty</th>
                                                <th scope="col" class="text-end">Price</th>
                                                <th scope="col" class="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${this.renderSaleItems()}
                                            <tr>
                                                <td colspan="3" class="text-end"><strong>Subtotal</strong></td>
                                                <td class="text-end"><strong>Rs. ${this.sale.subtotal.toFixed(2)}</strong></td>
                                            </tr>
                                            ${this.sale.discount > 0 ? `
                                                <tr>
                                                    <td colspan="3" class="text-end">Discount</td>
                                                    <td class="text-end">- Rs. ${this.sale.discount.toFixed(2)}</td>
                                                </tr>
                                            ` : ''}
                                            ${this.sale.tax > 0 ? `
                                                <tr>
                                                    <td colspan="3" class="text-end">Tax</td>
                                                    <td class="text-end">+ Rs. ${this.sale.tax.toFixed(2)}</td>
                                                </tr>
                                            ` : ''}
                                            <tr>
                                                <td colspan="3" class="text-end"><strong>Final Amount</strong></td>
                                                <td class="text-end"><strong>Rs. ${this.sale.final_amount.toFixed(2)}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                ${this.sale.notes ? `
                                    <div class="mt-3">
                                        <h6>Notes</h6>
                                        <p class="mb-0">${this.sale.notes}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mt-4 mt-md-0">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Payment Summary</h5>
                            </div>
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-6 text-muted">Total Amount:</div>
                                    <div class="col-6 text-end"><strong>Rs. ${this.sale.final_amount.toFixed(2)}</strong></div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-6 text-muted">Paid Amount:</div>
                                    <div class="col-6 text-end"><strong>Rs. ${totalPaid.toFixed(2)}</strong></div>
                                </div>
                                
                                ${remainingAmount > 0 ? `
                                    <div class="row mb-3">
                                        <div class="col-6 text-muted">Remaining:</div>
                                        <div class="col-6 text-end">
                                            <strong class="text-danger">Rs. ${remainingAmount.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                    <div class="d-grid mb-3">
                                        <button class="btn btn-primary" id="quick-payment-btn">
                                            <i class="fas fa-money-bill"></i> Record Payment
                                        </button>
                                    </div>
                                ` : `
                                    <div class="alert alert-success mb-3">
                                        <i class="fas fa-check-circle"></i> Payment complete
                                    </div>
                                `}
                                
                                <!-- Payment history -->
                                <h6>Payment History</h6>
                                ${this.renderPaymentHistory()}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${this.renderSaleScript()}
            </div>
        `;
    }
    
    /**
     * Render the sale items
     */
    renderSaleItems() {
        if (!this.saleItems || this.saleItems.length === 0) {
            return `
                <tr>
                    <td colspan="4" class="text-center">No items found</td>
                </tr>
            `;
        }
        
        return this.saleItems.map(saleItem => {
            const item = this.items.find(i => i.id === saleItem.item_id) || { name: 'Unknown Item' };
            
            return `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-center">${saleItem.quantity}</td>
                    <td class="text-end">Rs. ${saleItem.price.toFixed(2)}</td>
                    <td class="text-end">Rs. ${saleItem.total.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Render payment history
     */
    renderPaymentHistory() {
        if (!this.payments || this.payments.length === 0) {
            return `
                <div class="text-center text-muted py-3">
                    <p class="mb-0">No payments recorded</p>
                </div>
            `;
        }
        
        return `
            <div class="payment-history">
                ${this.payments.map(payment => {
                    const paymentDate = new Date(payment.payment_date).toLocaleDateString();
                    
                    return `
                        <div class="border-bottom pb-2 mb-2">
                            <div class="d-flex justify-content-between">
                                <div>Rs. ${payment.amount.toFixed(2)}</div>
                                <div class="text-muted small">${paymentDate}</div>
                            </div>
                            <div class="text-muted small">
                                ${payment.payment_method}
                                ${payment.notes ? ` - ${payment.notes}` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * Get the appropriate badge class for the payment status
     */
    getStatusBadgeClass() {
        switch (this.sale.payment_status) {
            case 'paid': return 'bg-success';
            case 'partial': return 'bg-warning text-dark';
            case 'unpaid': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
    
    /**
     * Format status for display
     */
    formatStatus(status) {
        switch(status) {
            case 'paid': return 'Paid';
            case 'partial': return 'Partially Paid';
            case 'unpaid': return 'Unpaid';
            default: return 'Unknown';
        }
    }
    
    /**
     * Render the JavaScript for this view
     */
    renderSaleScript() {
        return `
            <script>
                // Delete sale button
                document.getElementById('delete-sale-btn').addEventListener('click', async function(e) {
                    e.preventDefault();
                    if (confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
                        try {
                            // Delete all related records first (payments, sale items)
                            const payments = ${JSON.stringify(this.payments)};
                            for (const payment of payments) {
                                await db.deletePayment(payment.id);
                            }
                            
                            const saleItems = ${JSON.stringify(this.saleItems)};
                            for (const saleItem of saleItems) {
                                await db.deleteSaleItem(saleItem.id);
                            }
                            
                            // Delete the sale
                            await db.deleteSale(${this.saleId});
                            
                            alert('Sale deleted successfully');
                            window.location.hash = '#/sales';
                        } catch (error) {
                            console.error('Error deleting sale:', error);
                            alert('Error: ' + error.message);
                        }
                    }
                });
                
                // Add payment button
                document.getElementById('add-payment-btn')?.addEventListener('click', function(e) {
                    e.preventDefault();
                    showPaymentModal();
                });
                
                // Quick payment button
                document.getElementById('quick-payment-btn')?.addEventListener('click', function(e) {
                    e.preventDefault();
                    showPaymentModal();
                });
                
                // Print receipt button
                document.getElementById('print-receipt-btn').addEventListener('click', function(e) {
                    e.preventDefault();
                    printReceipt();
                });
                
                // Show payment modal
                function showPaymentModal() {
                    const sale = ${JSON.stringify(this.sale)};
                    const payments = ${JSON.stringify(this.payments)};
                    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
                    const remainingAmount = Math.max(0, sale.final_amount - totalPaid);
                    
                    // Create modal HTML
                    const modalHTML = \`
                        <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="paymentModalLabel">Record Payment</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <form id="payment-form">
                                            <div class="mb-3">
                                                <label for="payment-amount" class="form-label">Amount</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">Rs.</span>
                                                    <input type="number" class="form-control" id="payment-amount" 
                                                        step="0.01" min="0.01" max="\${remainingAmount}" 
                                                        value="\${remainingAmount.toFixed(2)}" required>
                                                </div>
                                                <div class="form-text">Maximum: Rs. \${remainingAmount.toFixed(2)}</div>
                                            </div>
                                            <div class="mb-3">
                                                <label for="payment-date" class="form-label">Date</label>
                                                <input type="date" class="form-control" id="payment-date" 
                                                    value="\${new Date().toISOString().split('T')[0]}" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="payment-method" class="form-label">Payment Method</label>
                                                <select class="form-select" id="payment-method" required>
                                                    <option value="cash" selected>Cash</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                    <option value="credit_card">Credit Card</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div class="mb-3">
                                                <label for="payment-notes" class="form-label">Notes</label>
                                                <textarea class="form-control" id="payment-notes" rows="2"></textarea>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                        <button type="button" class="btn btn-primary" id="save-payment-btn">Save Payment</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    \`;
                    
                    // Add modal to document
                    const modalContainer = document.createElement('div');
                    modalContainer.innerHTML = modalHTML;
                    document.body.appendChild(modalContainer);
                    
                    // Initialize modal
                    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
                    modal.show();
                    
                    // Handle save payment
                    document.getElementById('save-payment-btn').addEventListener('click', async function() {
                        const form = document.getElementById('payment-form');
                        if (!form.checkValidity()) {
                            form.reportValidity();
                            return;
                        }
                        
                        try {
                            const payment = {
                                sale_id: ${this.saleId},
                                amount: parseFloat(document.getElementById('payment-amount').value),
                                payment_date: document.getElementById('payment-date').value,
                                payment_method: document.getElementById('payment-method').value,
                                notes: document.getElementById('payment-notes').value,
                                created_at: new Date().toISOString()
                            };
                            
                            // Add payment to database
                            await db.addPayment(payment);
                            
                            // Update sale payment status
                            const updatedPayments = [...payments, payment];
                            const updatedTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
                            let paymentStatus = 'unpaid';
                            
                            if (updatedTotalPaid >= sale.final_amount) {
                                paymentStatus = 'paid';
                            } else if (updatedTotalPaid > 0) {
                                paymentStatus = 'partial';
                            }
                            
                            // Update sale status
                            await db.updateSale({
                                ...sale,
                                payment_status: paymentStatus
                            });
                            
                            // Close modal and refresh page
                            modal.hide();
                            alert('Payment recorded successfully!');
                            window.location.reload();
                            
                        } catch (error) {
                            console.error('Error adding payment:', error);
                            alert('Error: ' + error.message);
                        }
                    });
                    
                    // Remove modal from DOM when hidden
                    document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function() {
                        document.body.removeChild(modalContainer);
                    });
                }
                
                // Print receipt
                function printReceipt() {
                    const sale = ${JSON.stringify(this.sale)};
                    const customer = ${JSON.stringify(this.customer)};
                    const saleItems = ${JSON.stringify(this.saleItems)};
                    const items = ${JSON.stringify(this.items)};
                    const payments = ${JSON.stringify(this.payments)};
                    
                    const saleDate = new Date(sale.sale_date).toLocaleDateString();
                    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
                    
                    // Create receipt window
                    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
                    
                    // Generate receipt content
                    receiptWindow.document.write(\`
                        <html>
                        <head>
                            <title>Receipt - Sale #${this.saleId}</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 0;
                                    padding: 20px;
                                    font-size: 12px;
                                }
                                .receipt {
                                    max-width: 380px;
                                    margin: 0 auto;
                                }
                                .header {
                                    text-align: center;
                                    margin-bottom: 20px;
                                }
                                .store-name {
                                    font-size: 20px;
                                    font-weight: bold;
                                }
                                .info-row {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 5px;
                                }
                                .separator {
                                    border-bottom: 1px dashed #ccc;
                                    margin: 10px 0;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                th, td {
                                    text-align: left;
                                    padding: 5px 0;
                                }
                                .amount-row {
                                    display: flex;
                                    justify-content: space-between;
                                }
                                .bold {
                                    font-weight: bold;
                                }
                                .right {
                                    text-align: right;
                                }
                                .footer {
                                    text-align: center;
                                    margin-top: 20px;
                                    font-size: 10px;
                                }
                                @media print {
                                    @page {
                                        margin: 0;
                                        size: 80mm 297mm;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="receipt">
                                <div class="header">
                                    <div class="store-name">Supiri Accounts</div>
                                    <div>123 Main Street</div>
                                    <div>Colombo, Sri Lanka</div>
                                    <div>Tel: +94 123 456 789</div>
                                </div>
                                
                                <div class="info-row">
                                    <div>Receipt #: ${this.saleId}</div>
                                    <div>Date: \${saleDate}</div>
                                </div>
                                <div class="info-row">
                                    <div>Customer: \${customer ? customer.name : 'Walk-in'}</div>
                                </div>
                                
                                <div class="separator"></div>
                                
                                <table>
                                    <thead>
                                        <tr>
                                            <th style="width: 40%">Item</th>
                                            <th style="width: 15%" class="right">Qty</th>
                                            <th style="width: 20%" class="right">Price</th>
                                            <th style="width: 25%" class="right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        \${saleItems.map(saleItem => {
                                            const item = items.find(i => i.id === saleItem.item_id) || { name: 'Unknown Item' };
                                            return \`
                                                <tr>
                                                    <td>\${item.name}</td>
                                                    <td class="right">\${saleItem.quantity}</td>
                                                    <td class="right">\${saleItem.price.toFixed(2)}</td>
                                                    <td class="right">\${saleItem.total.toFixed(2)}</td>
                                                </tr>
                                            \`;
                                        }).join('')}
                                    </tbody>
                                </table>
                                
                                <div class="separator"></div>
                                
                                <div class="amount-row">
                                    <div>Subtotal:</div>
                                    <div>Rs. \${sale.subtotal.toFixed(2)}</div>
                                </div>
                                
                                \${sale.discount > 0 ? \`
                                    <div class="amount-row">
                                        <div>Discount:</div>
                                        <div>Rs. \${sale.discount.toFixed(2)}</div>
                                    </div>
                                \` : ''}
                                
                                \${sale.tax > 0 ? \`
                                    <div class="amount-row">
                                        <div>Tax:</div>
                                        <div>Rs. \${sale.tax.toFixed(2)}</div>
                                    </div>
                                \` : ''}
                                
                                <div class="amount-row bold">
                                    <div>Total:</div>
                                    <div>Rs. \${sale.final_amount.toFixed(2)}</div>
                                </div>
                                
                                <div class="amount-row">
                                    <div>Amount Paid:</div>
                                    <div>Rs. \${totalPaid.toFixed(2)}</div>
                                </div>
                                
                                <div class="amount-row bold">
                                    <div>Balance Due:</div>
                                    <div>Rs. \${Math.max(0, sale.final_amount - totalPaid).toFixed(2)}</div>
                                </div>
                                
                                <div class="separator"></div>
                                
                                <div class="footer">
                                    <p>Thank you for your business!</p>
                                    <p>Powered by SupiriAccounts</p>
                                </div>
                            </div>
                            <script>
                                window.onload = function() {
                                    window.print();
                                    // Uncomment to auto-close after printing
                                    // setTimeout(function() { window.close(); }, 500);
                                };
                            </script>
                        </body>
                        </html>
                    \`);
                    
                    // Close the document
                    receiptWindow.document.close();
                }
            </script>
        `;
    }
}

// Export the component
window.SaleDetailView = SaleDetailView;
