import { initAuth, logout, getIsUserLoggedIn, showAuthModal, hideAuthModal } from '../auth.js';
import { initMobilePanel } from '../mobile-panel.js'; // Import the mobile panel functionality

let allProducts = [];
let currentCategory = 'all';

// DOM Elements
const elements = {
    profileBtn: document.getElementById('profileBtn'),
    profileMenu: document.getElementById('profileMenu'),
    logoutBtn: document.getElementById('logoutBtn'),
    searchBtn: document.getElementById('searchBtn'),
    desktopSearch: document.getElementById('desktopSearch'),
    cartBtn: document.getElementById('cartBtn'),
    wishlistBtn: document.getElementById('wishlistBtn'),
    productsGrid: document.getElementById('productsGrid'),
    cartCount: document.getElementById('cartCount'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    categoryTitle: document.getElementById('categoryTitle'),
    categoryDesc: document.getElementById('categoryDesc')
};

// Professional Authentication Popup
function showProfessionalPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-popup';
    overlay.innerHTML = `
        <div class="auth-popup-content">
            <div class="auth-popup-icon">🔐</div>
            <h2 class="auth-popup-title">Authentication Required</h2>
            <p class="auth-popup-message">
                Please log in to access our exclusive products and amazing deals.
            </p>
            <div class="auth-popup-buttons">
                <button class="auth-popup-btn auth-popup-btn-primary" id="popupLoginBtn">Sign In</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Event listeners
    const popupLoginBtn = document.getElementById('popupLoginBtn');
    if (popupLoginBtn) {
        popupLoginBtn.addEventListener('click', () => {
            window.location.href = '/login_signup.html';
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            window.location.href = '/login_signup.html';
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Profile dropdown
    if (elements.profileBtn && elements.profileMenu) {
        elements.profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = elements.profileMenu.style.display === 'block';
            elements.profileMenu.style.display = isOpen ? 'none' : 'block';
            elements.profileBtn.setAttribute('aria-expanded', !isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!elements.profileBtn?.contains(e.target) &&
                !elements.profileMenu?.contains(e.target)) {
                elements.profileMenu.style.display = 'none';
                elements.profileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }

    // Search functionality
    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', () => performSearch(elements.desktopSearch.value));
        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(e.target.value);
        });
    }

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            loadCategoryProducts();
        });
    });

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            let sortedProducts = [...allProducts];

            switch (sortBy) {
                case 'price-low':
                    sortedProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sortedProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'name':
                    sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                default:
                    loadCategoryProducts();
                    return;
            }

            displayProducts(sortedProducts);
        });
    }

    // Navigation
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => {
            if (getIsUserLoggedIn()) {
                window.location.href = '/pages/cart.html';
            } else {
                showAuthModal();
            }
        });
    }

    if (elements.wishlistBtn) {
        elements.wishlistBtn.addEventListener('click', () => {
            if (getIsUserLoggedIn()) {
                window.location.href = '/pages/wishlist.html';
            } else {
                showAuthModal();
            }
        });
    }
}

// Search function
function performSearch(query) {
    if (!query.trim()) return;
    const filtered = allProducts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
    );
    displayProducts(filtered);
    showToast(`Found ${filtered.length} products for "${query}"`);
}

// Make performSearch available globally for mobile panel
window.performSearch = performSearch;

// Load products
async function loadCategoryProducts() {
    try {
        if (!elements.productsGrid) return;

        elements.productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

        let productsData = [];

        if (currentCategory && currentCategory !== 'all') {
            // Fetch specific category
            console.log(`Fetching category: ${currentCategory}`);
            const res = await fetch(`https://dummyjson.com/products/category/${currentCategory}`);
            const data = await res.json();
            console.log('Category response:', data);
            productsData = data.products || [];
        } else {
            // Fetch all products
            console.log('Fetching all products');
            const res = await fetch('https://dummyjson.com/products?limit=100');
            const data = await res.json();
            console.log('All products response:', data);
            productsData = data.products || [];
        }

        allProducts = productsData;

        // Update title and description
        const title = currentCategory === 'all' ? 'All Products' :
            currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1).replace(/-/g, ' ');

        if (elements.categoryTitle) {
            elements.categoryTitle.textContent = title;
        }

        if (elements.categoryDesc) {
            elements.categoryDesc.textContent = `${allProducts.length} products available`;
        }

        displayProducts();
    } catch (err) {
        console.error('Error loading products:', err);
        if (elements.productsGrid) {
            elements.productsGrid.innerHTML = '<div class="loading" style="color:var(--danger)">⚠️ Failed to load products. Please try again.</div>';
        }
    }
}

// Display products
function displayProducts(productsToShow = null) {
    if (!elements.productsGrid) return;

    const products = productsToShow || allProducts;

    if (products.length === 0) {
        elements.productsGrid.innerHTML = '<div class="loading">No products found in this category</div>';
        return;
    }

    elements.productsGrid.innerHTML = products.map(p => {
        // Convert USD to INR (approximate rate 83)
        const usdToInr = 83;
        const currentPriceInr = Math.round(p.price * usdToInr);
        const originalPriceInr = Math.round(p.price * usdToInr * 1.3); // 30% markup

        // Use actual discount percentage or calculate
        const discount = p.discountPercentage || Math.round(((originalPriceInr - currentPriceInr) / originalPriceInr) * 100);

        // Generate star rating
        const rating = p.rating || 0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) starsHTML += '★';
        if (hasHalfStar) starsHTML += '☆';
        for (let i = 0; i < emptyStars; i++) starsHTML += '☆';

        // Generate review count
        const reviewCount = p.reviews ? p.reviews.length : Math.floor(Math.random() * 100) + 10;

        // Truncate description
        const shortDescription = p.description.length > 100
            ? p.description.substring(0, 100) + '...'
            : p.description;

        return `
            <div class="product-card" data-product-id="${p.id}">
                <img src="${p.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${p.title}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-title">${p.title}</div>
                <div class="product-category">${p.category || 'Uncategorized'}</div>
                
                <div class="product-description">${shortDescription}</div>
                
                <div class="product-rating">
                    <div class="rating-stars">${starsHTML}</div>
                    <div class="rating-value">${rating.toFixed(1)}</div>
                    <div class="rating-count">(${reviewCount})</div>
                </div>
                
                <div class="price-container">
                    <div class="current-price">₹${currentPriceInr.toLocaleString()}</div>
                    <div class="original-price">MRP: ₹${originalPriceInr.toLocaleString()}</div>
                    <div class="discount">${discount}% off</div>
                </div>
                <div class="card-footer">
                    <button class="add-btn" data-product-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');

    setupProductsEventListeners();
}

function setupProductsEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });

    // Product card clicks
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-product-id'));
            window.location.href = `/pages/product.html?id=${productId}`;
        });
    });
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

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
            price: Math.round(product.price * 83), // Price in INR
            thumbnail: product.thumbnail
        });
    }

    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    updateCartBadge();
    showToast(`${product.title} added to cart!`);
}

function updateCartBadge() {
    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function showToast(message) {
    if (elements.toastMessage && elements.toast) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.add('show');
        setTimeout(() => {
            if (elements.toast) {
                elements.toast.classList.remove('show');
            }
        }, 3000);
    }
}

// Initialize
async function init() {
    try {
        console.log('Initializing category page...');

        // Initialize mobile panel first
        initMobilePanel();

        // Initialize authentication
        const authInitialized = await initAuth();
        console.log('Auth initialized:', authInitialized);

        // Check authentication
        const userLoggedIn = getIsUserLoggedIn();
        console.log('User logged in:', userLoggedIn);

        if (!userLoggedIn) {
            setTimeout(showProfessionalPopup, 1000);
        }

        // Setup event listeners
        setupEventListeners();

        // Load initial data
        await loadCategoryProducts();
        updateCartBadge();

        console.log('Category page initialized successfully');

    } catch (error) {
        console.error('Initialization error:', error);

        // Show error message to user
        if (elements.productsGrid) {
            elements.productsGrid.innerHTML = '<div class="loading" style="color:var(--danger)">⚠️ Error loading page. Please refresh.</div>';
        }
    }
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}