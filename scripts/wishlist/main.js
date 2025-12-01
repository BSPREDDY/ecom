// Main Wishlist JavaScript
import { auth, showAuthModal, hideAuthModal, logout, initAuth } from '/scripts/auth.js';

// Global variables
let wishlistData = [];
let allProducts = [];
let isUserLoggedIn = false;

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
    loginRedirectBtn: getElement('loginRedirectBtn'),
    closeAuthModal: getElement('closeAuthModal'),
    wishlistContent: getElement('wishlistContent'),
    wishlistCount: getElement('wishlistCount')
};

// Fallback products
const fallbackProducts = [
    {
        id: 1,
        title: "iPhone 15 Pro",
        category: "smartphones",
        price: 999,
        rating: 4.8,
        thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=500&q=60",
        description: "Latest iPhone with advanced camera and A17 Pro chip"
    },
    {
        id: 2,
        title: "Samsung Galaxy S24",
        category: "smartphones",
        price: 899,
        rating: 4.6,
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=60",
        description: "Powerful Android smartphone with AI features"
    },
    {
        id: 3,
        title: "Nike Air Max",
        category: "fashion",
        price: 120,
        rating: 4.4,
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60",
        description: "Comfortable running shoes with air cushioning"
    },
    {
        id: 4,
        title: "MacBook Pro",
        category: "laptops",
        price: 1999,
        rating: 4.9,
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=60",
        description: "Professional laptop for creative work"
    }
];

// Load wishlist data (now stores full product objects)
function loadWishlistData() {
    const data = JSON.parse(localStorage.getItem('wishlistData')) || [];
    return Array.isArray(data) ? data : [];
}

// Save wishlist data
function saveWishlistData() {
    localStorage.setItem('wishlistData', JSON.stringify(wishlistData));
}

// Mobile Panel Functions
function toggleMobilePanel() {
    if (!elements.mobilePanel || !elements.mobileOverlay) return;

    elements.mobilePanel.classList.toggle('show');
    elements.mobileOverlay.classList.toggle('show');
    document.body.style.overflow = elements.mobilePanel.classList.contains('show') ? 'hidden' : '';
}

// Event Listeners
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
            link.addEventListener('click', toggleMobilePanel);
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

    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', async () => {
            try {
                await logout();
                window.location.href = '/login_signup.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed. Please try again.', true);
            }
        });
    }

    if (elements.mobileLogoutBtn) {
        elements.mobileLogoutBtn.addEventListener('click', async () => {
            try {
                await logout();
                window.location.href = '/login_signup.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed. Please try again.', true);
            }
        });
    }

    // Search functionality
    function performSearch(query) {
        if (!query.trim()) {
            loadWishlistDisplay();
            return;
        }

        const filtered = wishlistData.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );

        displayWishlist(filtered);
        showToast(`Found ${filtered.length} products for "${query}"`);
    }

    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', () => performSearch(elements.desktopSearch.value));
        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(e.target.value);
        });
    }

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

    // Navigation
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => window.location.href = '/pages/cart.html');
    }

    if (elements.wishlistBtn) {
        elements.wishlistBtn.addEventListener('click', () => {
            showToast('You are already on the wishlist page');
        });
    }

    // Authentication modal
    if (elements.loginRedirectBtn) {
        elements.loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '/login_signup.html';
        });
    }

    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '/pages/home.html';
        });
    }

    // Close auth modal when clicking outside
    if (elements.authModal) {
        elements.authModal.addEventListener('click', (e) => {
            if (e.target === elements.authModal) {
                hideAuthModal();
                window.location.href = '/pages/home.html';
            }
        });
    }
}

// Load all products for reference
async function loadAllProducts() {
    try {
        const res = await fetch('https://dummyjson.com/products?limit=100');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        allProducts = data.products || fallbackProducts;
        console.log('Products loaded successfully:', allProducts.length);
    } catch (err) {
        console.error('Error loading products from API, using fallback:', err);
        allProducts = fallbackProducts;
    }
}

// Load wishlist display
async function loadWishlistDisplay() {
    if (!elements.wishlistContent || !elements.wishlistCount) return;

    elements.wishlistCount.textContent = wishlistData.length;

    if (wishlistData.length === 0) {
        elements.wishlistContent.innerHTML = `
            <div class="empty-wishlist">
                <div class="empty-icon">❤️</div>
                <h2 class="empty-title">Your wishlist is empty</h2>
                <p class="empty-text">Start adding products you love!</p>
                <a href="/pages/home.html" class="continue-shopping">Explore Products</a>
            </div>
        `;
        return;
    }

    // Ensure we have all products loaded
    if (allProducts.length === 0) {
        await loadAllProducts();
    }

    // Filter out any invalid products
    const validWishlistProducts = wishlistData.filter(item =>
        item && item.id && item.title
    );

    displayWishlist(validWishlistProducts);
}

// Display wishlist
function displayWishlist(products) {
    if (!elements.wishlistContent) return;

    if (products.length === 0) {
        elements.wishlistContent.innerHTML = `
            <div class="empty-wishlist">
                <div class="empty-icon">🔍</div>
                <h2 class="empty-title">No matching products</h2>
                <p class="empty-text">Try a different search term.</p>
                <button class="continue-shopping" onclick="window.location.reload()">Show All Wishlist</button>
            </div>
        `;
        return;
    }

    elements.wishlistContent.innerHTML = `
        <div class="wishlist-grid">
            ${products.map(product => `
                <div class="wishlist-card" data-product-id="${product.id}">
                    <button class="remove-wishlist" data-product-id="${product.id}" title="Remove from wishlist">×</button>
                    <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" 
                         onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=500&q=60'">
                    <div class="card-content">
                        <div class="title">${product.title}</div>
                        <div class="category">${product.category}</div>
                        <div class="price-section">
                            <div class="price">₹${Math.round(product.price * 83).toLocaleString()}</div>
                            <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add event listeners after HTML is rendered
    setupWishlistEventListeners();
}

// Setup wishlist event listeners
function setupWishlistEventListeners() {
    // Remove wishlist buttons
    document.querySelectorAll('.remove-wishlist').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            removeFromWishlist(productId);
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });

    // Product card clicks
    document.querySelectorAll('.wishlist-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Don't navigate if clicking buttons
            if (e.target.closest('.remove-wishlist') || e.target.closest('.add-to-cart-btn')) {
                return;
            }

            const productId = parseInt(this.getAttribute('data-product-id'));
            navigateToProduct(productId);
        });
    });
}

// Remove from wishlist
function removeFromWishlist(productId) {
    wishlistData = wishlistData.filter(product => product.id !== productId);
    saveWishlistData();

    if (elements.wishlistCount) {
        elements.wishlistCount.textContent = wishlistData.length;
    }

    loadWishlistDisplay();
    showToast('Removed from wishlist');
}

// Add to cart
function addToCart(productId) {
    const product = wishlistData.find(p => p.id === productId) ||
        allProducts.find(p => p.id === productId);

    if (!product) {
        console.error('Product not found for ID:', productId);
        showToast('Product not found', true);
        return;
    }

    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const existingItem = cartData.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartData.push({
            id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            productId: productId,
            quantity: 1,
            title: product.title,
            price: Math.round(product.price * 83),
            thumbnail: product.thumbnail
        });
    }

    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    updateCartBadge();
    showToast(`${product.title} added to cart!`);
}

// Update cart badge
function updateCartBadge() {
    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);

    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Navigate to product page
function navigateToProduct(productId) {
    window.location.href = `/pages/product.html?id=${productId}`;
}

// Show toast notification
function showToast(message, isError = false) {
    if (!elements.toast || !elements.toastMessage) {
        console.log('Toast:', message);
        return;
    }

    elements.toast.className = 'toast show';
    elements.toast.style.background = isError ? '#ef4444' : '#10b981';
    elements.toastMessage.textContent = message;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Initialize
async function init() {
    console.log('Initializing Wishlist...');

    try {
        // Setup event listeners first
        setupEventListeners();

        // Update cart badge
        updateCartBadge();

        // Initialize authentication
        const isAuthenticated = await initAuth();
        isUserLoggedIn = isAuthenticated;

        if (isAuthenticated) {
            // Load wishlist data
            wishlistData = loadWishlistData();

            // Load all products for reference
            await loadAllProducts();

            // Load wishlist display
            await loadWishlistDisplay();
        } else {
            // Show authentication modal for non-authenticated users
            showAuthModal();

            // Show empty state for non-logged in users
            if (elements.wishlistContent) {
                elements.wishlistContent.innerHTML = `
                    <div class="empty-wishlist">
                        <div class="empty-icon">🔒</div>
                        <h2 class="empty-title">Please Sign In</h2>
                        <p class="empty-text">You need to be logged in to view your wishlist.</p>
                        <button class="continue-shopping" onclick="hideAuthModal(); window.location.href='/login_signup.html'">
                            Sign In Now
                        </button>
                    </div>
                `;
            }
        }

        console.log('Wishlist initialized successfully');
    } catch (error) {
        console.error('Error initializing wishlist:', error);
        showToast('Failed to initialize page. Please refresh.', true);
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Fix for right side white space
document.body.style.overflowX = 'hidden';
document.documentElement.style.overflowX = 'hidden';