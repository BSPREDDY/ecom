// Checkout Page JavaScript
import { initAuth, logout, showAuthModal, hideAuthModal, getCurrentUser, isUserLoggedIn as authState } from '../auth.js';

// Global variables
let allProducts = [];
let isAuthenticatedUser = false;

// DOM Elements
const elements = {
    // Navigation elements
    hamburger: document.getElementById('hamburger'),
    mobilePanel: document.getElementById('mobilePanel'),
    mobileOverlay: document.getElementById('mobileOverlay'),
    mobileClose: document.getElementById('mobileClose'),
    profileBtn: document.getElementById('profileBtn'),
    profileMenu: document.getElementById('profileMenu'),
    logoutBtn: document.getElementById('logoutBtn'),
    mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
    cartBtn: document.getElementById('cartBtn'),
    wishlistBtn: document.getElementById('wishlistBtn'),
    cartCount: document.getElementById('cartCount'),
    searchBtn: document.getElementById('searchBtn'),
    desktopSearch: document.getElementById('desktopSearch'),
    mobileSearchBtn: document.getElementById('mobileSearchBtn'),
    mobileSearch: document.getElementById('mobileSearch'),

    // Checkout elements
    checkoutForm: document.getElementById('checkoutForm'),
    placeOrderBtn: document.getElementById('placeOrderBtn'),
    summaryItems: document.getElementById('summaryItems'),
    subtotalValue: document.getElementById('subtotalValue'),
    discountValue: document.getElementById('discountValue'),
    shippingValue: document.getElementById('shippingValue'),
    totalValue: document.getElementById('totalValue'),

    // Progress bar
    progressBar: document.querySelector('.progress-bar'),

    // Auth modal
    authModal: document.getElementById('authModal'),
    loginRedirectBtn: document.getElementById('loginRedirectBtn'),
    closeAuthModal: document.getElementById('closeAuthModal'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Mobile Panel Functionality
function toggleMobilePanel() {
    elements.mobilePanel.classList.toggle('show');
    elements.mobileOverlay.classList.toggle('show');
    document.body.style.overflow = elements.mobilePanel.classList.contains('show') ? 'hidden' : '';
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile panel
    if (elements.hamburger) elements.hamburger.addEventListener('click', toggleMobilePanel);
    if (elements.mobileClose) elements.mobileClose.addEventListener('click', toggleMobilePanel);
    if (elements.mobileOverlay) elements.mobileOverlay.addEventListener('click', toggleMobilePanel);

    // Close mobile panel on link click
    if (elements.mobilePanel) {
        elements.mobilePanel.querySelectorAll('a').forEach(link => {
            if (!link.href.includes('#')) {
                link.addEventListener('click', toggleMobilePanel);
            }
        });
    }

    // Close mobile panel with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.mobilePanel && elements.mobilePanel.classList.contains('show')) {
            toggleMobilePanel();
        }
    });

    // Profile dropdown
    if (elements.profileBtn && elements.profileMenu) {
        elements.profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = elements.profileMenu.style.display === 'block';
            elements.profileMenu.style.display = isOpen ? 'none' : 'block';
            elements.profileBtn.setAttribute('aria-expanded', !isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!elements.profileBtn.contains(e.target) && !elements.profileMenu.contains(e.target)) {
                elements.profileMenu.style.display = 'none';
                elements.profileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Logout functionality
    if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', logout);
    if (elements.mobileLogoutBtn) elements.mobileLogoutBtn.addEventListener('click', logout);

    // Auth modal buttons
    if (elements.loginRedirectBtn) {
        elements.loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '../login_signup.html';
        });
    }

    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener('click', () => {
            hideAuthModal();
            // User chooses to continue as guest
            isAuthenticatedUser = true; // Allow guest checkout
        });
    }

    // Search functionality
    setupSearchFunctionality();

    // Cart and wishlist buttons
    if (elements.cartBtn) elements.cartBtn.addEventListener('click', () => window.location.href = '../pages/cart.html');
    if (elements.wishlistBtn) elements.wishlistBtn.addEventListener('click', () => window.location.href = '../pages/wishlist.html');

    // Payment method selection
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            const radioInput = this.querySelector('input[type="radio"]');
            if (radioInput) {
                radioInput.checked = true;
            }
        });
    });

    // Initialize radio buttons state
    const defaultRadio = document.querySelector('input[name="payment"][value="cod"]');
    if (defaultRadio) {
        const parentOption = defaultRadio.closest('.radio-option');
        if (parentOption) {
            parentOption.classList.add('selected');
        }
    }

    // Place order button
    if (elements.placeOrderBtn) {
        elements.placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Autofill form with user data if logged in
    autoFillUserData();
}

// Search Functionality
function setupSearchFunctionality() {
    function performSearch(query) {
        if (!query.trim()) return;
        window.location.href = `../pages/home.html?search=${encodeURIComponent(query)}`;
    }

    // Desktop search
    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', () => {
            performSearch(elements.desktopSearch.value);
        });

        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
            }
        });
    }

    // Mobile search
    if (elements.mobileSearchBtn && elements.mobileSearch) {
        elements.mobileSearchBtn.addEventListener('click', () => {
            performSearch(elements.mobileSearch.value);
            toggleMobilePanel();
        });

        elements.mobileSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
                toggleMobilePanel();
            }
        });
    }
}

// Load Order Summary - UPDATED VERSION
async function loadOrderSummary() {
    try {
        const cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];

        if (cartData.length === 0) {
            showToast('Your cart is empty!');
            setTimeout(() => {
                window.location.href = '../pages/home.html';
            }, 2000);
            return;
        }

        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        allProducts = data.products || [];

        let subtotal = 0;
        let totalProductDiscounts = 0;
        let itemsHtml = '';

        // Create a map of product IDs to products for faster lookup
        const productMap = new Map();
        allProducts.forEach(product => {
            productMap.set(product.id, product);
        });

        // Track items for detailed summary
        const orderItems = [];

        cartData.forEach(item => {
            const product = productMap.get(item.productId);
            if (!product) {
                console.warn(`Product ${item.productId} not found`);
                return;
            }

            // Calculate price with discount
            const discountPercentage = product.discountPercentage || 0;
            const originalPriceUSD = product.price || 0;

            // Convert USD to INR (approx conversion)
            const originalPriceINR = Math.round(originalPriceUSD * 83);

            // Calculate discounted price
            const discountAmount = Math.round(originalPriceINR * (discountPercentage / 100));
            const finalPrice = Math.max(0, originalPriceINR - discountAmount);

            // Calculate item total
            const itemTotal = finalPrice * item.quantity;
            const itemOriginalTotal = originalPriceINR * item.quantity;

            subtotal += itemTotal;
            totalProductDiscounts += (itemOriginalTotal - itemTotal);

            // Save item details for later use
            orderItems.push({
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                originalPrice: originalPriceINR,
                discountPercentage: discountPercentage,
                discountAmount: discountAmount,
                discountedPrice: finalPrice,
                quantity: item.quantity,
                itemTotal: itemTotal,
                itemOriginalTotal: itemOriginalTotal
            });

            itemsHtml += `
                <div class="summary-item">
                    <img src="${product.thumbnail}" alt="${product.title}" class="item-img" loading="lazy">
                    <div class="item-info">
                        <div class="item-name">${product.title}</div>
                        <div class="item-price-details">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                                ${discountPercentage > 0 ? `
                                    <span style="font-size: 0.85rem; color: #888; text-decoration: line-through;">
                                        ₹${originalPriceINR.toLocaleString()}
                                    </span>
                                ` : ''}
                                <span style="font-weight: 700; color: var(--primary); font-size: 1rem;">
                                    ₹${finalPrice.toLocaleString()}
                                </span>
                                ${discountPercentage > 0 ? `
                                    <span style="background: var(--success-light); color: var(--success); 
                                           padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
                                        ${discountPercentage}% OFF
                                    </span>
                                ` : ''}
                            </div>
                            <div class="item-qty-price" style="color: var(--muted); font-size: 0.9rem;">
                                Qty: ${item.quantity} × ₹${finalPrice.toLocaleString()}
                            </div>
                            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 6px; color: #111;">
                                Item Total: ₹${itemTotal.toLocaleString()}
                                ${discountPercentage > 0 ? `
                                    <span style="font-size: 0.8rem; color: var(--success); font-weight: 600; margin-left: 8px;">
                                        (Saved: ₹${(itemOriginalTotal - itemTotal).toLocaleString()})
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        if (itemsHtml === '') {
            elements.summaryItems.innerHTML = '<div class="loading">No items in cart</div>';
            return;
        }

        elements.summaryItems.innerHTML = itemsHtml;

        // Calculate order totals
        const orderDiscount = Math.round(subtotal * 0.1); // 10% additional discount on entire order
        const shipping = subtotal > 5000 ? 0 : 99;
        const total = subtotal - orderDiscount + shipping;

        // Update display
        elements.subtotalValue.textContent = '₹' + Math.round(subtotal).toLocaleString();
        elements.discountValue.textContent = '−₹' + orderDiscount.toLocaleString();
        elements.discountValue.title = `10% order discount (Total saved: ₹${(totalProductDiscounts + orderDiscount).toLocaleString()})`;
        elements.shippingValue.textContent = shipping === 0 ? 'FREE' : '₹' + shipping;
        elements.totalValue.textContent = '₹' + Math.round(total).toLocaleString();

        // Save detailed order summary for later use
        sessionStorage.setItem('orderSummary', JSON.stringify({
            subtotal,
            orderDiscount,
            shipping,
            total,
            itemsCount: cartData.length,
            totalProductDiscounts,
            totalSavings: totalProductDiscounts + orderDiscount,
            items: orderItems,
            appliedDiscounts: [
                {
                    type: 'product_discounts',
                    amount: totalProductDiscounts,
                    description: `Product discounts applied: ₹${totalProductDiscounts.toLocaleString()}`
                },
                {
                    type: 'order_discount',
                    value: 10,
                    amount: orderDiscount,
                    description: '10% additional discount on total order'
                }
            ]
        }));

        // Update shipping note
        updateShippingNote(subtotal);

    } catch (err) {
        console.error('Error loading products:', err);
        elements.summaryItems.innerHTML = '<div class="loading">Error loading items</div>';
        showToast('Failed to load order details. Please try again.');
    }
}

// Helper function to show shipping note
function updateShippingNote(subtotal) {
    const existingNote = document.querySelector('.shipping-note');
    if (existingNote) {
        existingNote.remove();
    }

    const shippingNote = document.createElement('div');
    shippingNote.className = 'shipping-note';
    shippingNote.style.marginTop = '10px';
    shippingNote.style.fontSize = '0.85rem';
    shippingNote.style.fontWeight = '600';
    shippingNote.style.textAlign = 'center';
    shippingNote.style.padding = '10px';
    shippingNote.style.borderRadius = '8px';

    if (subtotal > 5000) {
        shippingNote.style.background = 'var(--success-light)';
        shippingNote.style.color = 'var(--success)';
        shippingNote.textContent = '🎉 Congrats! You\'ve earned FREE shipping!';
    } else {
        shippingNote.style.background = 'var(--accent-light)';
        shippingNote.style.color = 'var(--accent)';
        const needed = 5000 - subtotal;
        shippingNote.textContent = `Add ₹${needed.toLocaleString()} more for FREE shipping!`;
    }

    const summaryDivider = document.querySelector('.summary-divider');
    if (summaryDivider) {
        summaryDivider.insertAdjacentElement('afterend', shippingNote);
    }
}

// Auto-fill User Data
function autoFillUserData() {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || '';

    if (userEmail) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = userEmail;
    }

    // Try to split name into first and last name
    if (userName) {
        const nameParts = userName.split(' ');
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');

        if (nameParts.length > 0 && firstNameInput) {
            firstNameInput.value = nameParts[0];
        }
        if (nameParts.length > 1 && lastNameInput) {
            lastNameInput.value = nameParts.slice(1).join(' ');
        }
    }
}

// Update Progress Bar
function updateProgressBar(step) {
    if (elements.progressBar) {
        elements.progressBar.setAttribute('data-progress', step);

        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index < step) {
                stepEl.classList.add('completed');
            }
        });

        if (step > 0 && step <= steps.length) {
            steps[step - 1].classList.add('active');
        }
    }
}

// Place Order Function - UPDATED VERSION
async function placeOrder() {
    // Validate form
    if (!elements.checkoutForm.checkValidity()) {
        elements.checkoutForm.reportValidity();
        return;
    }

    // Validate phone and pincode
    const phoneInput = document.getElementById('phone');
    const pincodeInput = document.getElementById('pincode');

    if (phoneInput && !validatePhoneNumber(phoneInput.value.trim())) {
        showToast('Please enter a valid 10-digit Indian mobile number');
        phoneInput.focus();
        return;
    }

    if (pincodeInput && !validatePincode(pincodeInput.value.trim())) {
        showToast('Please enter a valid 6-digit PIN code');
        pincodeInput.focus();
        return;
    }

    // Disable button and show loading state
    const placeOrderBtn = elements.placeOrderBtn;
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '⏳ Processing...';
    placeOrderBtn.disabled = true;

    try {
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            address: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            pincode: document.getElementById('pincode')?.value || '',
            country: document.getElementById('country')?.value || 'India',
            paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || 'cod',
            orderDate: new Date().toISOString(),
            orderId: 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
        };

        // Get cart data and recalculate for accuracy
        const cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
        const orderSummary = JSON.parse(sessionStorage.getItem('orderSummary')) || {};

        // Recalculate to ensure accuracy
        let recalculatedSubtotal = 0;
        let totalProductDiscounts = 0;
        const detailedItems = [];

        if (allProducts.length > 0) {
            cartData.forEach(item => {
                const product = allProducts.find(p => p.id === item.productId);
                if (product) {
                    const discountPercentage = product.discountPercentage || 0;
                    const originalPriceINR = Math.round(product.price * 83);
                    const discountAmount = Math.round(originalPriceINR * (discountPercentage / 100));
                    const finalPrice = Math.max(0, originalPriceINR - discountAmount);
                    const itemTotal = finalPrice * item.quantity;
                    const itemOriginalTotal = originalPriceINR * item.quantity;

                    recalculatedSubtotal += itemTotal;
                    totalProductDiscounts += (itemOriginalTotal - itemTotal);

                    detailedItems.push({
                        ...item,
                        title: product.title,
                        thumbnail: product.thumbnail,
                        originalPrice: originalPriceINR,
                        discountPercentage: discountPercentage,
                        discountAmount: discountAmount,
                        discountedPrice: finalPrice,
                        itemTotal: itemTotal,
                        itemOriginalTotal: itemOriginalTotal
                    });
                }
            });
        }

        // Calculate final totals
        const orderDiscount = Math.round(recalculatedSubtotal * 0.1);
        const shipping = recalculatedSubtotal > 5000 ? 0 : 99;
        const total = recalculatedSubtotal - orderDiscount + shipping;
        const totalSavings = totalProductDiscounts + orderDiscount;

        // Prepare order data with detailed pricing
        const orderData = {
            ...formData,
            items: detailedItems.length > 0 ? detailedItems : cartData,
            summary: {
                subtotal: recalculatedSubtotal,
                productDiscounts: totalProductDiscounts,
                orderDiscount: orderDiscount,
                shipping: shipping,
                total: total,
                totalSavings: totalSavings,
                itemsCount: cartData.length,
                currency: 'INR',
                appliedDiscounts: [
                    {
                        type: 'product_discounts',
                        amount: totalProductDiscounts,
                        description: 'Individual product discounts'
                    },
                    {
                        type: 'order_discount',
                        value: 10,
                        amount: orderDiscount,
                        description: '10% order discount'
                    }
                ]
            },
            userId: localStorage.getItem('userEmail') || 'guest',
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        // Save order to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
        existingOrders.push(orderData);
        localStorage.setItem('userOrders', JSON.stringify(existingOrders));

        // Animate progress bar through steps
        updateProgressBar(2);

        setTimeout(() => {
            updateProgressBar(3);

            setTimeout(() => {
                updateProgressBar(4);

                setTimeout(() => {
                    // Clear cart
                    sessionStorage.removeItem('cartData');
                    sessionStorage.removeItem('orderSummary');

                    // Update cart badge
                    updateCartBadge();

                    // Show success message with savings
                    const savingsMessage = totalSavings > 0 ?
                        ` You saved ₹${totalSavings.toLocaleString()}!` : '';
                    showToast('🎉 Order placed successfully!' + savingsMessage);

                    // Reset button
                    placeOrderBtn.innerHTML = originalText;
                    placeOrderBtn.disabled = false;

                    // Redirect to order confirmation page
                    setTimeout(() => {
                        localStorage.setItem('lastOrder', JSON.stringify(orderData));
                        window.location.href = `../pages/order-confirmation.html?orderId=${orderData.orderId}`;
                    }, 1500);
                }, 600);
            }, 600);
        }, 600);

    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Failed to place order. Please try again.');

        // Reset button
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
    }
}

// Update Cart Badge
function updateCartBadge() {
    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Show Toast Notification
function showToast(message) {
    if (elements.toastMessage && elements.toast) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.add('show');
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }
}

// Validate Phone Number
function validatePhoneNumber(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Validate PIN Code
function validatePincode(pincode) {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
}

// Form Validation
function setupFormValidation() {
    const phoneInput = document.getElementById('phone');
    const pincodeInput = document.getElementById('pincode');

    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            e.target.value = value;

            if (value && !validatePhoneNumber(value)) {
                e.target.style.borderColor = 'var(--danger)';
            } else {
                e.target.style.borderColor = '';
            }
        });
    }

    if (pincodeInput) {
        pincodeInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 6) value = value.substring(0, 6);
            e.target.value = value;

            if (value && !validatePincode(value)) {
                e.target.style.borderColor = 'var(--danger)';
            } else {
                e.target.style.borderColor = '';
            }
        });
    }
}

// Initialize Authentication
async function initializeAuthentication() {
    try {
        // Initialize auth
        await initAuth();

        // Check if user is logged in
        const currentUser = getCurrentUser();
        isAuthenticatedUser = !!currentUser || authState;

        // Show auth modal if not logged in
        if (!isAuthenticatedUser) {
            setTimeout(() => {
                showAuthModal();
            }, 1000);
        }
    } catch (error) {
        console.error('Error initializing authentication:', error);
        // Allow guest checkout if auth fails
        isAuthenticatedUser = true;
    }
}

// Initialize Application
async function init() {
    try {
        // Setup event listeners
        setupEventListeners();

        // Setup form validation
        setupFormValidation();

        // Update cart badge
        updateCartBadge();

        // Initialize progress bar (start at step 1)
        updateProgressBar(1);

        // Load order summary
        await loadOrderSummary();

        // Initialize authentication
        await initializeAuthentication();

    } catch (error) {
        console.error('Error initializing checkout:', error);
        showToast('Failed to initialize checkout. Please refresh the page.');
    }
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Fix for right side white space
document.body.style.overflowX = 'hidden';
document.documentElement.style.overflowX = 'hidden';