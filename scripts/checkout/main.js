// main.js for checkout.html
import { initAuth, showAuthModal, hideAuthModal, logout, getIsUserLoggedIn } from '../auth.js';

let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
let allProducts = [];

// DOM Elements
const getElement = (id) => document.getElementById(id);

const elements = {
    // Navigation elements
    hamburger: getElement('hamburger'),
    mobilePanel: getElement('mobilePanel'),
    mobileOverlay: getElement('mobileOverlay'),
    mobileClose: getElement('mobileClose'),
    profileBtn: getElement('profileBtn'),
    profileMenu: getElement('profileMenu'),
    logoutBtn: getElement('logoutBtn'),
    mobileLogoutBtn: getElement('mobileLogoutBtn'),
    searchBtn: getElement('searchBtn'),
    desktopSearch: getElement('desktopSearch'),
    mobileSearchBtn: getElement('mobileSearchBtn'),
    mobileSearch: getElement('mobileSearch'),
    cartBtn: getElement('cartBtn'),
    wishlistBtn: getElement('wishlistBtn'),
    cartCount: getElement('cartCount'),

    // Toast
    toast: getElement('toast'),
    toastMessage: getElement('toastMessage'),

    // User profile
    userAvatar: getElement('userAvatar'),
    mobileUserAvatar: getElement('mobileUserAvatar'),
    mobileUserEmail: getElement('mobileUserEmail'),
    mobileUserName: getElement('mobileUserName'),

    // Authentication
    authModal: getElement('authModal'),
    closeAuthModal: getElement('closeAuthModal'),
    loginRedirectBtn: getElement('loginRedirectBtn'),

    // Checkout specific elements
    checkoutForm: getElement('checkoutForm'),
    placeOrderBtn: getElement('placeOrderBtn'),
    summaryItems: getElement('summaryItems'),
    subtotalValue: getElement('subtotalValue'),
    discountValue: getElement('discountValue'),
    shippingValue: getElement('shippingValue'),
    totalValue: getElement('totalValue'),

    // Form fields
    firstName: getElement('firstName'),
    lastName: getElement('lastName'),
    email: getElement('email'),
    phone: getElement('phone'),
    address: getElement('address'),
    city: getElement('city'),
    state: getElement('state'),
    pincode: getElement('pincode'),
    country: getElement('country')
};

// Initialize
async function init() {
    console.log('Initializing checkout page...');

    try {
        // Initialize authentication first
        const isAuthenticated = await initAuth();

        setupEventListeners();
        updateCartBadge();

        // Load products
        await loadProducts();
        updateOrderSummary();

        // Pre-fill form if user is logged in
        if (getIsUserLoggedIn()) {
            prefillUserData();
        }

        console.log('Checkout page initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize checkout', 'error');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile panel
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', toggleMobilePanel);
    }

    if (elements.mobileClose) {
        elements.mobileClose.addEventListener('click', toggleMobilePanel);
    }

    if (elements.mobileOverlay) {
        elements.mobileOverlay.addEventListener('click', toggleMobilePanel);
    }

    // Close mobile panel on link click
    if (elements.mobilePanel) {
        elements.mobilePanel.querySelectorAll('a').forEach(link => {
            if (!link.id.includes('logout')) {
                link.addEventListener('click', toggleMobilePanel);
            }
        });
    }

    // Profile dropdown
    if (elements.profileBtn) {
        elements.profileBtn.addEventListener('click', toggleProfileMenu);
        document.addEventListener('click', closeProfileMenu);
    }

    // Logout buttons
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    if (elements.mobileLogoutBtn) {
        elements.mobileLogoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // Search functionality
    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', performSearch);
        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    if (elements.mobileSearchBtn && elements.mobileSearch) {
        elements.mobileSearchBtn.addEventListener('click', () => {
            performSearch();
            toggleMobilePanel();
        });
        elements.mobileSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
                toggleMobilePanel();
            }
        });
    }

    // Navigation
    if (elements.wishlistBtn) {
        elements.wishlistBtn.addEventListener('click', () => {
            if (getIsUserLoggedIn()) {
                window.location.href = '/pages/wishlist.html';
            } else {
                showAuthModal();
            }
        });
    }

    // Cart button
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => {
            if (getIsUserLoggedIn()) {
                window.location.href = '/pages/cart.html';
            } else {
                showAuthModal();
            }
        });
    }

    // Authentication modal
    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener('click', () => {
            hideAuthModal();
        });
    }

    if (elements.loginRedirectBtn) {
        elements.loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '/login_signup.html';
        });
    }

    // Close auth modal when clicking outside
    if (elements.authModal) {
        elements.authModal.addEventListener('click', (e) => {
            if (e.target === elements.authModal) {
                hideAuthModal();
            }
        });
    }

    // Close mobile panel with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.mobilePanel && elements.mobilePanel.classList.contains('show')) {
                toggleMobilePanel();
            }
            if (elements.authModal && elements.authModal.classList.contains('show')) {
                hideAuthModal();
            }
            closeProfileMenu();
        }
    });

    // Radio button selection
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            const radioInput = this.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;
        });
    });

    // Place order button
    if (elements.placeOrderBtn) {
        elements.placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Form validation on input
    if (elements.checkoutForm) {
        elements.checkoutForm.addEventListener('input', validateForm);
    }
}

// Mobile Panel Functions
function toggleMobilePanel() {
    if (!elements.mobilePanel || !elements.mobileOverlay) return;

    const isOpening = !elements.mobilePanel.classList.contains('show');

    elements.mobilePanel.classList.toggle('show');
    elements.mobileOverlay.classList.toggle('show');

    if (isOpening) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Profile Menu Functions
function toggleProfileMenu(e) {
    if (e) e.stopPropagation();

    if (!elements.profileMenu) return;

    const isOpen = elements.profileMenu.style.display === 'block';
    elements.profileMenu.style.display = isOpen ? 'none' : 'block';
    if (elements.profileBtn) {
        elements.profileBtn.setAttribute('aria-expanded', !isOpen);
    }
}

function closeProfileMenu() {
    if (elements.profileMenu) {
        elements.profileMenu.style.display = 'none';
    }
    if (elements.profileBtn) {
        elements.profileBtn.setAttribute('aria-expanded', 'false');
    }
}

// Search function
function performSearch() {
    let query = '';
    if (elements.desktopSearch && elements.desktopSearch.value) {
        query = elements.desktopSearch.value.trim();
    } else if (elements.mobileSearch && elements.mobileSearch.value) {
        query = elements.mobileSearch.value.trim();
    }

    if (!query) {
        showToast('Please enter a search term', 'warning');
        return;
    }

    sessionStorage.setItem('lastSearch', query);
    window.location.href = `/pages/home.html?search=${encodeURIComponent(query)}`;
}

// Load products
async function loadProducts() {
    try {
        // Try to get from cache first
        const cachedProducts = localStorage.getItem('cachedProducts');
        const cacheTime = localStorage.getItem('cacheTime');
        const now = Date.now();

        // Use cache if it's less than 5 minutes old
        if (cachedProducts && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
            allProducts = JSON.parse(cachedProducts);
            return;
        }

        // Fetch from API
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        allProducts = data.products || [];

        // Cache the results
        localStorage.setItem('cachedProducts', JSON.stringify(allProducts));
        localStorage.setItem('cacheTime', now.toString());
    } catch (err) {
        console.error('Error loading products:', err);

        // Try to use cached products as fallback
        const cachedProducts = localStorage.getItem('cachedProducts');
        if (cachedProducts) {
            allProducts = JSON.parse(cachedProducts);
        }
    }
}

// Pre-fill user data if logged in
function prefillUserData() {
    try {
        // Try to get user data from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');

        if (userEmail && elements.email) {
            elements.email.value = userEmail;
        }

        // If name is stored, split into first and last name
        if (userName && elements.firstName && elements.lastName) {
            const nameParts = userName.split(' ');
            elements.firstName.value = nameParts[0] || '';
            if (nameParts.length > 1) {
                elements.lastName.value = nameParts.slice(1).join(' ');
            }
        }

        validateForm();
    } catch (error) {
        console.error('Error pre-filling user data:', error);
    }
}

// Update order summary
function updateOrderSummary() {
    if (!elements.summaryItems) {
        console.error('Summary items element not found');
        return;
    }

    // Clear loading state
    elements.summaryItems.innerHTML = '';

    if (cartData.length === 0) {
        showEmptyCheckout();
        return;
    }

    // Try to load cart data from sessionStorage if empty
    if (cartData.length === 0) {
        const sessionCart = sessionStorage.getItem('cartData');
        if (sessionCart) {
            cartData = JSON.parse(sessionCart);
        }
    }

    const cartItems = cartData.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
    }).filter(Boolean);

    if (cartItems.length === 0) {
        showEmptyCheckout();
        return;
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * 83 * item.quantity), 0);
    const discount = subtotal * 0.1;
    const shipping = subtotal > 5000 ? 0 : 99;
    const total = subtotal - discount + shipping;

    // Update summary items
    elements.summaryItems.innerHTML = cartItems.map(item => `
        <div class="summary-item">
            <img src="${item.thumbnail}" alt="${item.title}" class="item-img">
            <div class="item-info">
                <div class="item-name">${item.title}</div>
                <div class="item-price-details">
                    <div class="price-row">
                        <span class="original-price">₹${Math.round(item.price * 83).toLocaleString()}</span>
                        <span class="discounted-price">₹${Math.round(item.price * 83 * 0.9).toLocaleString()}</span>
                        <span class="discount-badge">10% OFF</span>
                    </div>
                    <div class="item-qty-price">Quantity: ${item.quantity} × ₹${Math.round(item.price * 83 * 0.9).toLocaleString()}</div>
                    <div class="item-total">Item Total: ₹${Math.round(item.price * 83 * 0.9 * item.quantity).toLocaleString()}</div>
                </div>
            </div>
        </div>
    `).join('');

    // Update totals
    elements.subtotalValue.textContent = `₹${Math.round(subtotal).toLocaleString()}`;
    elements.discountValue.textContent = `−₹${Math.round(discount).toLocaleString()}`;
    elements.shippingValue.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    elements.totalValue.textContent = `₹${Math.round(total).toLocaleString()}`;

    // Update shipping note if free
    if (shipping === 0) {
        const shippingNote = document.createElement('div');
        shippingNote.className = 'shipping-note free-shipping';
        shippingNote.textContent = '🎉 You qualify for FREE shipping!';
        elements.summaryItems.appendChild(shippingNote);
    }

    updateCartBadge();
    validateForm();
}

function showEmptyCheckout() {
    if (!elements.summaryItems) return;

    elements.summaryItems.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--muted)">
            <div style="font-size:3rem; margin-bottom:20px">🛒</div>
            <h3 style="margin-bottom:10px; color:#111">Your cart is empty</h3>
            <p>Add items to your cart to proceed with checkout</p>
            <a href="/pages/home.html" style="display:inline-block; margin-top:20px; padding:10px 20px; background:var(--primary); color:white; border-radius:8px; font-weight:600;">
                Continue Shopping
            </a>
        </div>
    `;

    elements.subtotalValue.textContent = '₹0';
    elements.discountValue.textContent = '−₹0';
    elements.shippingValue.textContent = '₹0';
    elements.totalValue.textContent = '₹0';

    if (elements.placeOrderBtn) {
        elements.placeOrderBtn.disabled = true;
        elements.placeOrderBtn.innerHTML = 'Add items to cart first';
    }
}

function updateCartBadge() {
    if (!elements.cartCount) return;

    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems > 99 ? '99+' : totalItems;
}

// Form validation
function validateForm() {
    if (!elements.checkoutForm || !elements.placeOrderBtn) return;

    // Check if cart has items
    if (cartData.length === 0) {
        elements.placeOrderBtn.disabled = true;
        elements.placeOrderBtn.innerHTML = 'Add items to cart first';
        return;
    }

    // Check required fields
    const requiredFields = [
        elements.firstName,
        elements.lastName,
        elements.email,
        elements.phone,
        elements.address,
        elements.city,
        elements.state,
        elements.pincode
    ];

    // Check if all fields exist and have values
    const allFieldsExist = requiredFields.every(field => field !== null);
    if (!allFieldsExist) {
        elements.placeOrderBtn.disabled = true;
        elements.placeOrderBtn.innerHTML = 'Please fill all required fields';
        return;
    }

    // Validate field values
    const allValid = requiredFields.every(field => {
        if (!field.value || field.value.trim() === '') return false;

        // Special validation for email
        if (field === elements.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(field.value);
        }

        // Special validation for phone
        if (field === elements.phone) {
            const phoneRegex = /^[0-9]{10}$/;
            return phoneRegex.test(field.value.replace(/\D/g, ''));
        }

        // Special validation for pincode
        if (field === elements.pincode) {
            const pincodeRegex = /^[0-9]{6}$/;
            return pincodeRegex.test(field.value);
        }

        return true;
    });

    // Update button state
    elements.placeOrderBtn.disabled = !allValid;
    if (allValid) {
        elements.placeOrderBtn.innerHTML = '⚡ Place Order';
    } else {
        elements.placeOrderBtn.innerHTML = 'Please fill all required fields';
    }
}

// Place order function
async function placeOrder() {
    // Check if user is logged in
    if (!getIsUserLoggedIn()) {
        showAuthModal();
        return;
    }

    // Check if cart is empty
    if (cartData.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
    }

    // Validate form
    if (!elements.checkoutForm.checkValidity()) {
        showToast('Please fill all required fields correctly', 'warning');
        return;
    }

    try {
        // Disable button to prevent multiple clicks
        elements.placeOrderBtn.disabled = true;
        elements.placeOrderBtn.innerHTML = 'Processing...';

        // Collect order data
        const orderData = {
            shipping: {
                firstName: elements.firstName.value,
                lastName: elements.lastName.value,
                email: elements.email.value,
                phone: elements.phone.value,
                address: elements.address.value,
                city: elements.city.value,
                state: elements.state.value,
                pincode: elements.pincode.value,
                country: elements.country.value
            },
            payment: document.querySelector('input[name="payment"]:checked').value,
            items: cartData.map(item => {
                const product = allProducts.find(p => p.id === item.productId);
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product ? product.price * 83 : 0,
                    title: product ? product.title : 'Unknown Product'
                };
            }),
            subtotal: parseFloat(elements.subtotalValue.textContent.replace('₹', '').replace(/,/g, '')),
            discount: parseFloat(elements.discountValue.textContent.replace('−₹', '').replace(/,/g, '')),
            shipping: elements.shippingValue.textContent === 'FREE' ? 0 :
                parseFloat(elements.shippingValue.textContent.replace('₹', '').replace(/,/g, '')),
            total: parseFloat(elements.totalValue.textContent.replace('₹', '').replace(/,/g, '')),
            timestamp: new Date().toISOString(),
            orderId: 'ORD' + Date.now().toString().slice(-8)
        };

        // In a real app, you would send this to your backend
        // For demo purposes, we'll simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Save order to session storage
        const existingOrders = JSON.parse(sessionStorage.getItem('userOrders') || '[]');
        existingOrders.push(orderData);
        sessionStorage.setItem('userOrders', JSON.stringify(existingOrders));

        // Clear cart
        cartData = [];
        sessionStorage.setItem('cartData', JSON.stringify(cartData));
        updateCartBadge();

        // Show success message
        showToast('Order placed successfully!', 'success');

        // Redirect to order confirmation
        setTimeout(() => {
            window.location.href = `/pages/order-confirmation.html?orderId=${orderData.orderId}`;
        }, 2000);

    } catch (error) {
        console.error('Order placement error:', error);
        showToast('Failed to place order. Please try again.', 'error');
        elements.placeOrderBtn.disabled = false;
        elements.placeOrderBtn.innerHTML = '⚡ Place Order';
    }
}

function showToast(message, type = 'success') {
    if (!elements.toast || !elements.toastMessage) return;

    elements.toastMessage.textContent = message;

    // Set color based on type
    if (type === 'error') {
        elements.toast.style.background = '#ef4444';
    } else if (type === 'warning') {
        elements.toast.style.background = '#ffb300';
    } else {
        elements.toast.style.background = '#10b981';
    }

    elements.toast.classList.add('show');

    setTimeout(() => {
        if (elements.toast) {
            elements.toast.classList.remove('show');
        }
    }, 3000);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.checkoutApp = {
    cartData,
    allProducts,
    updateOrderSummary,
    placeOrder,
    validateForm
};