// app.js - Main Application Module (Improved Version)
(function () {
    'use strict';

    console.log('[App] Main application module loading...');

    const app = {
        // Core state
        config: {
            apiBase: 'https://dummyjson.com',
            localStoragePrefix: 'eshophub_',
            toastDuration: 3000,
            debounceDelay: 250
        },

        // State
        cart: [],
        wishlist: [],
        currentUser: null,
        categories: [],
        searchQuery: '',

        // Initialize app
        init: function () {
            console.log('[App] Initializing application...');

            // Load state from localStorage
            this.loadState();

            // Initialize modules
            this.initModules();

            // Setup event listeners
            this.setupEventListeners();

            // Setup auth state listener if Firebase is available
            this.setupAuthListener();

            // Check for any URL parameters
            this.handleUrlParams();

            // Performance monitoring
            this.monitorPerformance();

            console.log('[App] Application initialized successfully');

            // Dispatch app ready event
            this.dispatchEvent('appReady');
        },

        // Load state from localStorage
        loadState: function () {
            try {
                // Load cart with fallback to old key
                const cartData = localStorage.getItem(this.config.localStoragePrefix + 'cart') ||
                    localStorage.getItem('cart');
                this.cart = cartData ? JSON.parse(cartData) : [];

                // Load wishlist with fallback to old key
                const wishlistData = localStorage.getItem(this.config.localStoragePrefix + 'wishlist') ||
                    localStorage.getItem('wishlist');
                this.wishlist = wishlistData ? JSON.parse(wishlistData) : [];

                // Load user
                const userData = localStorage.getItem(this.config.localStoragePrefix + 'user');
                this.currentUser = userData ? JSON.parse(userData) : null;

                console.log('[App] Loaded state:', {
                    cartItems: this.cart.length,
                    wishlistItems: this.wishlist.length,
                    user: this.currentUser ? 'Logged in' : 'Not logged in'
                });

            } catch (error) {
                console.error('[App] Error loading state:', error);
                this.cart = [];
                this.wishlist = [];
                this.currentUser = null;
            }
        },

        // Save state to localStorage
        saveState: function () {
            try {
                localStorage.setItem(this.config.localStoragePrefix + 'cart', JSON.stringify(this.cart));
                localStorage.setItem(this.config.localStoragePrefix + 'wishlist', JSON.stringify(this.wishlist));
                if (this.currentUser) {
                    localStorage.setItem(this.config.localStoragePrefix + 'user', JSON.stringify(this.currentUser));
                }
            } catch (error) {
                console.error('[App] Error saving state:', error);
            }
        },

        // Initialize modules
        initModules: function () {
            // Update UI counters
            this.updateCartCount();
            this.updateWishlistCount();

            // Update auth UI
            this.updateAuthUI();

            // Load categories if needed
            if (document.getElementById('categoriesMenu') || document.getElementById('categoryFilter')) {
                this.loadCategories();
            }

            // Initialize products on home page
            if (document.getElementById('productsContainer') && !window.productsInitialized) {
                this.loadProducts();
            }
        },

        // Setup event listeners
        setupEventListeners: function () {
            // Search functionality
            this.setupSearchListeners();

            // Filter listeners
            this.setupFilterListeners();

            // Cart modal
            this.setupCartModalListeners();

            // Window events
            this.setupWindowEvents();

            // Mobile menu
            this.setupMobileMenu();
        },

        // Setup search listeners
        setupSearchListeners: function () {
            const searchBtn = document.getElementById('searchBtn');
            const searchInput = document.getElementById('searchInput');
            const searchInputMobile = document.getElementById('searchInputMobile');

            const performSearch = (query) => {
                if (query && query.trim()) {
                    this.handleSearch(query.trim());
                }
            };

            if (searchBtn && searchInput) {
                searchBtn.addEventListener('click', () => performSearch(searchInput.value));
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') performSearch(searchInput.value);
                });
            }

            if (searchInputMobile) {
                searchInputMobile.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') performSearch(searchInputMobile.value);
                });
            }
        },

        // Setup filter listeners
        setupFilterListeners: function () {
            const categoryFilter = document.getElementById('categoryFilter');
            const priceFilter = document.getElementById('priceFilter');
            const sortFilter = document.getElementById('sortFilter');

            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => this.handleFilterChange());
            }

            if (priceFilter) {
                priceFilter.addEventListener('input', () => this.handleFilterChange());
                priceFilter.addEventListener('change', () => this.handleFilterChange());
            }

            if (sortFilter) {
                sortFilter.addEventListener('change', () => this.handleFilterChange());
            }
        },

        // Setup cart modal listeners
        setupCartModalListeners: function () {
            const cartModal = document.getElementById('cartModal');
            if (cartModal) {
                cartModal.addEventListener('show.bs.modal', () => {
                    this.renderCartModal();
                });
            }
        },

        // Setup window events
        setupWindowEvents: function () {
            // Online/offline
            window.addEventListener('online', () => {
                this.showToast('You are back online!', 'success');
            });

            window.addEventListener('offline', () => {
                this.showToast('You are offline. Some features may be limited.', 'warning');
            });

            // Page visibility
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.updateCartCount();
                    this.updateWishlistCount();
                }
            });
        },

        // Setup mobile menu
        setupMobileMenu: function () {
            const mobileMenuBtn = document.querySelector('[data-bs-toggle="collapse"][data-bs-target="#navbarNav"]');
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', () => {
                    const navbar = document.getElementById('navbarNav');
                    if (navbar) {
                        setTimeout(() => {
                            const isExpanded = navbar.classList.contains('show');
                            console.log('[App] Mobile menu', isExpanded ? 'opened' : 'closed');
                        }, 300);
                    }
                });
            }
        },

        // Setup auth listener
        setupAuthListener: function () {
            if (window.firebaseAuth) {
                window.firebaseAuth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.updateAuthUI();
                    this.saveState();
                    console.log('[App] Auth state changed:', user ? user.email : 'No user');
                });
            }
        },

        // Handle URL parameters
        handleUrlParams: function () {
            const urlParams = new URLSearchParams(window.location.search);
            const searchParam = urlParams.get('search');
            const categoryParam = urlParams.get('category');

            if (searchParam) {
                this.searchQuery = searchParam;
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = searchParam;
            }

            if (categoryParam) {
                const categoryFilter = document.getElementById('categoryFilter');
                if (categoryFilter) categoryFilter.value = categoryParam;
            }
        },

        // Handle search
        handleSearch: function (query) {
            if (!query) {
                this.showToast('Please enter a search term', 'warning');
                return;
            }

            console.log('[App] Searching for:', query);

            // If on products page, trigger search
            if (window.location.pathname.includes('products.html') || window.location.pathname.includes('/products')) {
                if (typeof window.applyFilters === 'function') {
                    window.applyFilters();
                }
                this.showToast(`Searching for "${query}"...`, 'info');
            } else {
                // Redirect to products page with search query
                window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
            }
        },

        // Handle filter change
        handleFilterChange: function () {
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        },

        // Load categories
        loadCategories: async function () {
            try {
                const response = await fetch(`${this.config.apiBase}/products/categories`);
                const categories = await response.json();
                this.categories = categories;
                this.populateCategories(categories);
            } catch (error) {
                console.error('[App] Error loading categories:', error);
            }
        },

        // Populate categories in UI
        populateCategories: function (categories) {
            // Categories dropdown
            const categoriesMenu = document.getElementById('categoriesMenu');
            if (categoriesMenu) {
                categories.slice(0, 10).forEach(category => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a class="dropdown-item" href="/products.html?category=${category.slug}">
                            ${category.name}
                        </a>
                    `;
                    categoriesMenu.appendChild(li);
                });
            }

            // Category filter
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter && categoryFilter.options.length <= 1) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.slug;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }
        },

        // Load products
        loadProducts: async function () {
            const container = document.getElementById('productsContainer');
            if (!container) return;

            try {
                this.showLoadingSkeleton();

                const response = await fetch(`${this.config.apiBase}/products?limit=12`);
                const data = await response.json();

                if (data.products && data.products.length > 0) {
                    window.allProducts = data.products;
                    this.renderProducts(data.products);
                } else {
                    this.showNoProducts();
                }
            } catch (error) {
                console.error('[App] Error loading products:', error);
                this.showToast('Failed to load products', 'error');
                this.showNoProducts();
            }
        },

        // Render products
        renderProducts: function (products) {
            const container = document.getElementById('productsContainer');
            const noProducts = document.getElementById('noProducts');

            if (!container) return;

            container.innerHTML = '';

            if (products.length === 0) {
                if (noProducts) noProducts.style.display = 'block';
                return;
            }

            if (noProducts) noProducts.style.display = 'none';

            products.forEach(product => {
                const isInWishlist = this.isInWishlist(product.id);
                const discount = product.discountPercentage ? Math.round(product.discountPercentage) : 0;

                const productCard = `
                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="position-relative overflow-hidden" style="height: 200px;">
                                <img src="${product.thumbnail || product.image || 'https://via.placeholder.com/300x200'}" 
                                     alt="${product.title}" 
                                     class="card-img-top" 
                                     style="object-fit: cover; height: 100%;">
                                ${discount > 0 ? `
                                    <span class="badge bg-danger position-absolute top-0 start-0 m-2">
                                        -${discount}%
                                    </span>
                                ` : ''}
                                <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2" 
                                        onclick="app.toggleWishlistItem(${product.id})"
                                        title="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                                    <i class="bi bi-heart${isInWishlist ? '-fill' : ''}"></i>
                                </button>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h6 class="card-title">${product.title}</h6>
                                <div class="mb-2">
                                    <small class="text-muted">${product.category}</small>
                                </div>
                                <div class="mb-2">
                                    <span class="text-primary fw-bold">$${product.price.toFixed(2)}</span>
                                    ${discount > 0 ? `
                                        <small class="text-muted text-decoration-line-through ms-2">
                                            $${(product.price * (1 + discount / 100)).toFixed(2)}
                                        </small>
                                    ` : ''}
                                </div>
                                <div class="mt-auto">
                                    <button class="btn btn-primary btn-sm w-100" 
                                            onclick="app.addToCartItem(${product.id})">
                                        <i class="bi bi-cart-plus"></i> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', productCard);
            });
        },

        // Show loading skeleton
        showLoadingSkeleton: function () {
            const skeleton = document.getElementById('loadingSkeleton');
            if (!skeleton) return;

            let html = '';
            for (let i = 0; i < 8; i++) {
                html += `
                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="skeleton skeleton-image" style="height: 200px;"></div>
                            <div class="card-body">
                                <div class="skeleton skeleton-text" style="height: 20px; margin-bottom: 10px;"></div>
                                <div class="skeleton skeleton-text" style="height: 15px; width: 60%; margin-bottom: 10px;"></div>
                                <div class="skeleton skeleton-text" style="height: 25px; width: 40%;"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
            skeleton.innerHTML = html;
        },

        // Show no products message
        showNoProducts: function () {
            const noProducts = document.getElementById('noProducts');
            if (noProducts) {
                noProducts.style.display = 'block';
            }
        },

        // ===== CART FUNCTIONS =====
        addToCartItem: function (productId) {
            if (!window.allProducts) return;

            const product = window.allProducts.find(p => p.id === productId);
            if (product) {
                this.addToCart(product);
            }
        },

        addToCart: function (product, quantity = 1) {
            if (!product || !product.id) {
                this.showToast('Invalid product', 'error');
                return false;
            }

            quantity = Math.max(1, parseInt(quantity) || 1);

            const existingIndex = this.cart.findIndex(item => item.id === product.id);

            if (existingIndex > -1) {
                this.cart[existingIndex].quantity += quantity;
            } else {
                this.cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.thumbnail || product.image,
                    category: product.category,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }

            this.saveState();
            this.updateCartCount();
            this.showToast(`${product.title} added to cart!`, 'success');

            return true;
        },

        removeFromCart: function (productId) {
            const initialLength = this.cart.length;
            this.cart = this.cart.filter(item => item.id !== productId);

            if (this.cart.length < initialLength) {
                this.saveState();
                this.updateCartCount();
                this.showToast('Item removed from cart', 'info');
                return true;
            }
            return false;
        },

        updateCartQuantity: function (productId, quantity) {
            const item = this.cart.find(item => item.id === productId);
            if (item) {
                quantity = Math.max(1, Math.min(99, parseInt(quantity) || 1));
                item.quantity = quantity;
                this.saveState();
                this.updateCartCount();
                return true;
            }
            return false;
        },

        getCartTotal: function () {
            return this.cart.reduce((total, item) => {
                return total + (item.price * (item.quantity || 1));
            }, 0);
        },

        updateCartCount: function () {
            const totalItems = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

            document.querySelectorAll('#cartCount, .cart-count, .cart-badge').forEach(element => {
                if (element) {
                    element.textContent = totalItems;
                    element.style.display = totalItems > 0 ? 'inline-block' : 'none';
                }
            });

            console.log('[App] Cart count updated:', totalItems, 'items');
        },

        renderCartModal: function () {
            const modalBody = document.getElementById('cartModalBody');
            const cartTotal = document.getElementById('cartTotal');

            if (!modalBody || !cartTotal) return;

            if (this.cart.length === 0) {
                modalBody.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-cart" style="font-size: 3rem; color: #ccc;"></i>
                        <p class="mt-3 text-muted">Your cart is empty</p>
                    </div>
                `;
                cartTotal.textContent = '$0.00';
                return;
            }

            let html = '<div class="list-group">';
            let total = 0;

            this.cart.forEach((item, index) => {
                const itemTotal = item.price * (item.quantity || 1);
                total += itemTotal;

                html += `
                    <div class="list-group-item">
                        <div class="row align-items-center">
                            <div class="col-3">
                                <img src="${item.image || 'https://via.placeholder.com/80'}" 
                                     alt="${item.title}" 
                                     class="img-fluid rounded"
                                     style="height: 60px; object-fit: cover;">
                            </div>
                            <div class="col-6">
                                <h6 class="mb-1">${item.title}</h6>
                                <small class="text-muted">$${item.price.toFixed(2)} × ${item.quantity || 1}</small>
                            </div>
                            <div class="col-3 text-end">
                                <span class="fw-bold">$${itemTotal.toFixed(2)}</span>
                                <button class="btn btn-sm btn-outline-danger mt-2" 
                                        onclick="app.removeFromCart(${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            modalBody.innerHTML = html;
            cartTotal.textContent = `$${total.toFixed(2)}`;
        },

        clearCart: function () {
            this.cart = [];
            this.saveState();
            this.updateCartCount();
            this.showToast('Cart cleared', 'info');
        },

        // ===== WISHLIST FUNCTIONS =====
        toggleWishlistItem: function (productId) {
            if (!window.allProducts) return;

            const product = window.allProducts.find(p => p.id === productId);
            if (product) {
                this.toggleWishlist(product);
            }
        },

        toggleWishlist: function (product) {
            if (!product || !product.id) return;

            const index = this.wishlist.findIndex(item => item.id === product.id);

            if (index > -1) {
                this.wishlist.splice(index, 1);
                this.showToast('Removed from wishlist', 'info');
            } else {
                this.wishlist.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.thumbnail || product.image,
                    category: product.category,
                    addedAt: new Date().toISOString()
                });
                this.showToast('Added to wishlist!', 'success');
            }

            this.saveState();
            this.updateWishlistCount();
        },

        isInWishlist: function (productId) {
            return this.wishlist.some(item => item.id === productId);
        },

        updateWishlistCount: function () {
            document.querySelectorAll('#wishlistCount, .wishlist-count, .wishlist-badge').forEach(element => {
                if (element) {
                    element.textContent = this.wishlist.length;
                    element.style.display = this.wishlist.length > 0 ? 'inline-block' : 'none';
                }
            });

            console.log('[App] Wishlist count updated:', this.wishlist.length, 'items');
        },

        // ===== AUTH FUNCTIONS =====
        updateAuthUI: function () {
            const loginMenuItem = document.getElementById('loginMenuItem');
            const registerMenuItem = document.getElementById('registerMenuItem');
            const profileMenuItem = document.getElementById('profileMenuItem');
            const ordersMenuItem = document.getElementById('ordersMenuItem');
            const logoutMenuItem = document.getElementById('logoutMenuItem');
            const userName = document.getElementById('userName');

            if (this.currentUser) {
                // User is logged in
                if (loginMenuItem) loginMenuItem.style.display = 'none';
                if (registerMenuItem) registerMenuItem.style.display = 'none';
                if (profileMenuItem) profileMenuItem.style.display = 'block';
                if (ordersMenuItem) ordersMenuItem.style.display = 'block';
                if (logoutMenuItem) logoutMenuItem.style.display = 'block';
                if (userName) {
                    const displayName = this.currentUser.displayName ||
                        this.currentUser.email.split('@')[0] ||
                        'User';
                    userName.textContent = displayName;
                }
            } else {
                // User is logged out
                if (loginMenuItem) loginMenuItem.style.display = 'block';
                if (registerMenuItem) registerMenuItem.style.display = 'block';
                if (profileMenuItem) profileMenuItem.style.display = 'none';
                if (ordersMenuItem) ordersMenuItem.style.display = 'none';
                if (logoutMenuItem) logoutMenuItem.style.display = 'none';
                if (userName) userName.textContent = 'Account';
            }
        },

        // ===== UTILITY FUNCTIONS =====
        showToast: function (message, type = 'info') {
            // Use window.showToast if available
            if (window.showToast && typeof window.showToast === 'function') {
                window.showToast(message, type);
                return;
            }

            // Fallback toast implementation
            const toastEl = document.getElementById('liveToast');
            const toastMessage = document.getElementById('toastMessage');

            if (toastEl && toastMessage) {
                toastMessage.textContent = message;
                toastEl.className = `toast align-items-center text-white bg-${type} border-0`;

                if (window.bootstrap) {
                    const toast = new window.bootstrap.Toast(toastEl);
                    toast.show();
                }
            } else {
                console.log(`[App Toast] ${type}: ${message}`);
            }
        },

        // Debounce utility
        debounce: function (func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Dispatch custom event
        dispatchEvent: function (eventName, detail = {}) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
        },

        // Performance monitoring
        monitorPerformance: function () {
            if (window.performance && window.performance.timing) {
                window.addEventListener('load', () => {
                    const timing = window.performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log('[App] Page load time:', loadTime, 'ms');
                });
            }
        },

        // Reset filters
        resetFilters: function () {
            const categoryFilter = document.getElementById('categoryFilter');
            const priceFilter = document.getElementById('priceFilter');
            const sortFilter = document.getElementById('sortFilter');
            const priceValue = document.getElementById('priceValue');

            if (categoryFilter) categoryFilter.value = '';
            if (priceFilter) priceFilter.value = '10000';
            if (sortFilter) sortFilter.value = 'newest';
            if (priceValue) priceValue.textContent = '$0 - $10000';

            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        },

        // Proceed to checkout
        proceedToCheckout: function () {
            if (this.cart.length === 0) {
                this.showToast('Your cart is empty', 'warning');
                return;
            }

            // Check authentication
            if (this.currentUser) {
                window.location.href = '/checkout.html';
            } else {
                this.showToast('Please login to checkout', 'info');
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

    // Make app globally available
    window.app = app;

    // Export commonly used functions globally
    window.addToCart = app.addToCart.bind(app);
    window.toggleWishlist = app.toggleWishlist.bind(app);
    window.showToast = app.showToast.bind(app);
    window.resetFilters = app.resetFilters.bind(app);
    window.proceedToCheckout = app.proceedToCheckout.bind(app);

    console.log('[App] Module loaded');
})();