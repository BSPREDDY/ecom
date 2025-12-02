import { initAuth, showAuthModal, hideAuthModal, logout, getIsUserLoggedIn } from '../auth.js';

let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
let allProducts = [];

// DOM Elements
const getElement = (id) => document.getElementById(id);

const elements = {
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
    toast: getElement('toast'),
    toastMessage: getElement('toastMessage'),
    userAvatar: getElement('userAvatar'),
    mobileUserAvatar: getElement('mobileUserAvatar'),
    mobileUserEmail: getElement('mobileUserEmail'),
    mobileUserName: getElement('mobileUserName'),
    authModal: getElement('authModal'),
    closeAuthModal: getElement('closeAuthModal'),
    loginRedirectBtn: getElement('loginRedirectBtn'),
    cartContent: getElement('cartContent'),
    cartItemCount: getElement('cartItemCount')
};

// Initialize
async function init() {
    console.log('Initializing cart page...');

    try {
        // Initialize authentication first
        const isAuthenticated = await initAuth();

        if (!isAuthenticated) {
            showAuthModal();
        }

        setupEventListeners();
        updateCartBadge();
        updateCartDisplay();

        if (getIsUserLoggedIn()) {
            await loadProducts();
        }

        console.log('Cart page initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
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
            displayCart();
            return;
        }

        // Fetch from API
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        allProducts = data.products || [];

        // Cache the results
        localStorage.setItem('cachedProducts', JSON.stringify(allProducts));
        localStorage.setItem('cacheTime', now.toString());

        displayCart();
    } catch (err) {
        console.error('Error loading products:', err);
        showToast('Failed to load products', 'error');

        // Try to use cached products as fallback
        const cachedProducts = localStorage.getItem('cachedProducts');
        if (cachedProducts) {
            allProducts = JSON.parse(cachedProducts);
            displayCart();
        } else {
            showEmptyCart();
        }
    }
}

// Display cart
function displayCart() {
    if (!elements.cartContent || !elements.cartItemCount) return;

    if (cartData.length === 0) {
        showEmptyCart();
        return;
    }

    const cartItems = cartData.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) return null;
        return { ...product, quantity: item.quantity, cartId: item.id };
    }).filter(Boolean);

    if (cartItems.length === 0) {
        showEmptyCart();
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * 83 * item.quantity), 0);
    const discount = subtotal * 0.1;
    const shipping = subtotal > 5000 ? 0 : 99;
    const total = subtotal - discount + shipping;
    const savings = discount;

    elements.cartItemCount.textContent = cartItems.length;

    elements.cartContent.innerHTML = `
        <div class="cart-container">
            <div class="cart-items">
                ${cartItems.map(item => `
                    <div class="cart-item">
                        <img src="${item.thumbnail}" alt="${item.title}" class="item-image" data-product-id="${item.id}" loading="lazy">
                        <div class="item-details">
                            <div class="item-title" data-product-id="${item.id}">${item.title}</div>
                            <div class="item-meta">
                                <div>Category: ${item.category}</div>
                                <div>Brand: ${item.brand || 'Generic'}</div>
                                ${item.stock < 10 ? `<div style="color:var(--danger)">Only ${item.stock} left in stock</div>` : ''}
                            </div>
                            <div class="item-price">₹${Math.round(item.price * 83).toLocaleString()} × ${item.quantity}</div>
                            ${item.quantity > 1 ? `<div style="font-size:0.9rem;color:var(--muted)">Total: ₹${Math.round(item.price * 83 * item.quantity).toLocaleString()}</div>` : ''}
                            <div class="item-actions">
                                <div class="quantity-controls">
                                    <button class="qty-btn" data-cart-id="${item.cartId}" data-action="decrease" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                                    <span class="qty-value">${item.quantity}</span>
                                    <button class="qty-btn" data-cart-id="${item.cartId}" data-action="increase" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
                                </div>
                                <button class="remove-btn" data-cart-id="${item.cartId}">🗑️ Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="cart-summary">
                <h3 class="summary-title">Order Summary</h3>
                <div class="summary-row">
                    <span class="summary-label">Subtotal (${cartItems.length} items)</span>
                    <span class="summary-value">₹${Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Discount (10%)</span>
                    <span class="summary-value" style="color:var(--success)">−₹${Math.round(discount).toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Shipping</span>
                    <span class="summary-value">${shipping === 0 ? 'FREE' : '₹' + shipping}</span>
                </div>
                ${savings > 0 ? `<div class="savings-badge">🎉 You're saving ₹${Math.round(savings).toLocaleString()}!</div>` : ''}
                <div class="summary-divider"></div>
                <div class="summary-total">
                    <span>Total</span>
                    <span class="total-value">₹${Math.round(total).toLocaleString()}</span>
                </div>
                <button class="checkout-btn" id="checkoutButton">⚡ Proceed to Checkout</button>
            </div>
        </div>
    `;

    setupCartEventListeners();
    updateCartBadge();
}

function showEmptyCart() {
    if (!elements.cartContent || !elements.cartItemCount) return;

    elements.cartContent.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h2 class="empty-cart-title">Your cart is empty</h2>
            <p class="empty-cart-text">Looks like you haven't added anything to your cart yet.</p>
            <a href="/pages/home.html" class="continue-shopping">Start Shopping</a>
        </div>
    `;
    elements.cartItemCount.textContent = '0';
    updateCartBadge();
}

function updateCartDisplay() {
    if (cartData.length === 0) {
        showEmptyCart();
    } else if (allProducts.length > 0) {
        displayCart();
    }
}

function setupCartEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', function () {
            const cartId = this.getAttribute('data-cart-id');
            const action = this.getAttribute('data-action');
            updateQuantity(cartId, action === 'increase' ? 1 : -1);
        });
    });

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function () {
            const cartId = this.getAttribute('data-cart-id');
            removeItem(cartId);
        });
    });

    // Product image and title clicks
    document.querySelectorAll('.item-image, .item-title').forEach(element => {
        element.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            navigateToProduct(productId);
        });
    });

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutButton');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

function updateQuantity(cartId, change) {
    const item = cartData.find(i => i.id === cartId);
    if (!item) return;

    const product = allProducts.find(p => p.id === item.productId);
    if (!product) return;

    const newQuantity = item.quantity + change;

    if (newQuantity < 1 || newQuantity > product.stock) {
        showToast('Cannot update quantity', 'warning');
        return;
    }

    item.quantity = newQuantity;
    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    displayCart();
    showToast('Quantity updated!');
}

function removeItem(cartId) {
    const index = cartData.findIndex(i => i.id === cartId);
    if (index === -1) return;

    const item = cartData[index];
    const product = allProducts.find(p => p.id === item.productId);

    if (confirm(`Remove "${product?.title || 'this item'}" from cart?`)) {
        cartData.splice(index, 1);
        sessionStorage.setItem('cartData', JSON.stringify(cartData));
        displayCart();
        showToast('Item removed from cart');
    }
}

function updateCartBadge() {
    if (!elements.cartCount) return;

    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems > 99 ? '99+' : totalItems;
}

function navigateToProduct(productId) {
    window.location.href = `/pages/product.html?id=${productId}`;
}

function proceedToCheckout() {
    if (cartData.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
    }

    if (!getIsUserLoggedIn()) {
        showAuthModal();
        return;
    }

    window.location.href = '/pages/checkout.html';
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