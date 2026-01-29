// Checkout Page Script
class CheckoutPage {
    constructor() {
        this.cart = [];
        this.subtotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.total = 0;
        this.selectedPaymentMethod = 'credit-card';
        this.initializePage();
    }

    async initializePage() {
        this.loadCartData();
        await this.loadOrderSummary();
        this.setupEventListeners();
        this.initializeFormValidation();
    }

    loadCartData() {
        if (window.app) {
            this.cart = [...window.app.cart];
        } else {
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        }
    }

    async loadOrderSummary() {
        await this.loadOrderItems();
        this.calculateTotals();
        this.updatePaymentForms();
    }

    async loadOrderItems() {
        const container = document.getElementById('orderSummaryItems');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="products.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            document.getElementById('placeOrderBtn').disabled = true;
            return;
        }

        let itemsHTML = '<div class="order-items-list">';

        for (const item of this.cart) {
            try {
                const product = await API.getProduct(item.id);

                itemsHTML += `
                    <div class="order-review-item">
                        <img src="${product.image}" alt="${product.title}">
                        <div class="order-review-info">
                            <h4>${product.title}</h4>
                            ${Object.keys(item.variations).length > 0 ?
                        `<small>${Object.entries(item.variations).map(([key, value]) => `${key}: ${value}`).join(', ')}</small>` :
                        ''}
                        </div>
                        <div class="order-review-price">
                            <span>${item.quantity} × $${item.price.toFixed(2)}</span>
                            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading product:', error);
            }
        }

        itemsHTML += '</div>';
        container.innerHTML = itemsHTML;
    }

    calculateTotals() {
        this.subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.shipping = this.subtotal > 100 ? 0 : 9.99;
        this.tax = this.subtotal * 0.08;
        this.total = this.subtotal + this.shipping + this.tax;

        this.updateTotalsDisplay();
    }

    updateTotalsDisplay() {
        const container = document.getElementById('summaryTotals');
        if (!container) return;

        container.innerHTML = `
            <div class="summary-item">
                <span>Subtotal</span>
                <span>$${this.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Shipping</span>
                <span>${this.shipping === 0 ? 'FREE' : `$${this.shipping.toFixed(2)}`}</span>
            </div>
            <div class="summary-item">
                <span>Tax</span>
                <span>$${this.tax.toFixed(2)}</span>
            </div>
            <div class="summary-item total">
                <span>Total</span>
                <span>$${this.total.toFixed(2)}</span>
            </div>
        `;
    }

    updatePaymentForms() {
        // Hide all payment forms first
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });

        // Show selected payment form
        const selectedForm = document.getElementById(`${this.selectedPaymentMethod}Form`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                const selectedMethod = e.currentTarget.dataset.method;
                this.selectPaymentMethod(selectedMethod);
            });
        });

        // Place order button
        document.getElementById('placeOrderBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.processOrder();
        });

        // Form auto-fill for logged in users
        this.autoFillUserInfo();

        // Input formatting
        this.setupInputFormatting();
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;

        // Update UI
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('selected');
        });
        document.querySelector(`.payment-method[data-method="${method}"]`)?.classList.add('selected');

        this.updatePaymentForms();
    }

    initializeFormValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.validatePhone(phoneInput);
            });
        }

        // Card number formatting and validation
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                this.formatCardNumber(e.target);
            });
        }

        // Expiry date formatting
        const expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                this.formatExpiryDate(e.target);
            });
        }

        // CVV validation
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('blur', () => {
                this.validateCVV(cvvInput);
            });
        }
    }

    validateEmail(input) {
        const email = input.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            this.showInputError(input, 'Please enter a valid email address');
            return false;
        }

        this.clearInputError(input);
        return true;
    }

    validatePhone(input) {
        const phone = input.value.replace(/\D/g, '');

        if (phone && phone.length < 10) {
            this.showInputError(input, 'Please enter a valid phone number');
            return false;
        }

        this.clearInputError(input);
        return true;
    }

    formatCardNumber(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.substring(0, 16);

        // Add spaces every 4 digits
        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = formatted;

        // Validate card type
        this.detectCardType(value);
    }

    detectCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\D/g, '');

        // Visa: starts with 4
        if (/^4/.test(cleanNumber)) {
            return 'visa';
        }
        // MasterCard: starts with 51-55
        if (/^5[1-5]/.test(cleanNumber)) {
            return 'mastercard';
        }
        // American Express: starts with 34 or 37
        if (/^3[47]/.test(cleanNumber)) {
            return 'amex';
        }
        // Discover: starts with 6011, 65, or 644-649
        if (/^(6011|65|64[4-9])/.test(cleanNumber)) {
            return 'discover';
        }

        return 'unknown';
    }

    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');

        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }

        input.value = value;
    }

    validateCVV(input) {
        const cvv = input.value.replace(/\D/g, '');
        const cardType = this.detectCardNumber(document.getElementById('cardNumber')?.value || '');

        let requiredLength = 3;
        if (cardType === 'amex') {
            requiredLength = 4;
        }

        if (cvv.length !== requiredLength) {
            this.showInputError(input, `CVV must be ${requiredLength} digits`);
            return false;
        }

        this.clearInputError(input);
        return true;
    }

    showInputError(input, message) {
        this.clearInputError(input);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e63946';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '5px';

        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#e63946';
    }

    clearInputError(input) {
        const errorDiv = input.parentNode.querySelector('.input-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    autoFillUserInfo() {
        if (window.app && window.app.currentUser) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = window.app.currentUser.email;
            }

            // In a real app, you would fetch user profile data
            // and fill in name, address, etc.
        }
    }

    setupInputFormatting() {
        // Auto-format phone number
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');

                if (value.length > 3 && value.length <= 6) {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
                } else if (value.length > 6) {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 10);
                }

                e.target.value = value;
            });
        }
    }

    validateForm() {
        let isValid = true;

        // Required fields
        const requiredFields = [
            'email', 'phone', 'firstName', 'lastName',
            'address', 'city', 'state', 'zipCode', 'country'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                this.showInputError(field, 'This field is required');
                isValid = false;
            }
        });

        // Validate email and phone
        if (!this.validateEmail(document.getElementById('email'))) {
            isValid = false;
        }

        if (!this.validatePhone(document.getElementById('phone'))) {
            isValid = false;
        }

        // Validate payment method specific fields
        if (this.selectedPaymentMethod === 'credit-card') {
            const cardNumber = document.getElementById('cardNumber');
            const expiryDate = document.getElementById('expiryDate');
            const cvv = document.getElementById('cvv');
            const cardName = document.getElementById('cardName');

            if (!cardNumber?.value.trim()) {
                this.showInputError(cardNumber, 'Card number is required');
                isValid = false;
            }

            if (!expiryDate?.value.trim()) {
                this.showInputError(expiryDate, 'Expiry date is required');
                isValid = false;
            }

            if (!cvv?.value.trim()) {
                this.showInputError(cvv, 'CVV is required');
                isValid = false;
            }

            if (!cardName?.value.trim()) {
                this.showInputError(cardName, 'Name on card is required');
                isValid = false;
            }

            // Additional validation for card details
            if (cardNumber && !this.validateCardNumber(cardNumber.value)) {
                this.showInputError(cardNumber, 'Invalid card number');
                isValid = false;
            }

            if (expiryDate && !this.validateExpiryDate(expiryDate.value)) {
                this.showInputError(expiryDate, 'Invalid expiry date');
                isValid = false;
            }
        }

        return isValid;
    }

    validateCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\D/g, '');
        return cleanNumber.length >= 13 && cleanNumber.length <= 19;
    }

    validateExpiryDate(expiryDate) {
        const [month, year] = expiryDate.split('/').map(num => parseInt(num));

        if (!month || !year || month < 1 || month > 12) {
            return false;
        }

        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return false;
        }

        return true;
    }

    async processOrder() {
        // Validate form
        if (!this.validateForm()) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        // Check cart is not empty
        if (this.cart.length === 0) {
            alert('Your cart is empty. Please add items to your cart before placing an order.');
            return;
        }

        // Show loading state
        const orderBtn = document.getElementById('placeOrderBtn');
        const originalText = orderBtn.innerHTML;
        orderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        orderBtn.disabled = true;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Gather order data
            const orderData = {
                orderNumber: 'ORD-' + Date.now().toString().slice(-8),
                orderDate: new Date().toISOString(),
                items: this.cart,
                subtotal: this.subtotal,
                shipping: this.shipping,
                tax: this.tax,
                total: this.total,
                paymentMethod: this.selectedPaymentMethod,
                shipping: {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zipCode: document.getElementById('zipCode').value,
                    country: document.getElementById('country').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value
                },
                billing: this.getBillingInfo()
            };

            // Save order data
            this.saveOrder(orderData);

            // Clear cart
            if (window.app) {
                window.app.cart = [];
                window.app.saveCart();
                window.app.updateCartCount();
            } else {
                localStorage.removeItem('cart');
            }

            // Redirect to success page
            window.location.href = 'order-success.html';

        } catch (error) {
            console.error('Error processing order:', error);
            alert('There was an error processing your order. Please try again.');

            // Reset button
            orderBtn.innerHTML = originalText;
            orderBtn.disabled = false;
        }
    }

    getBillingInfo() {
        // In a real app, you would have separate billing info
        // For this demo, we'll use shipping info as billing info
        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value
        };
    }

    saveOrder(orderData) {
        // Save to localStorage for demo purposes
        localStorage.setItem('lastOrder', JSON.stringify(orderData));

        // Also save to orders history
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-page')) {
        window.checkoutPage = new CheckoutPage();
    }
});