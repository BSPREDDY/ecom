// Deals Page JavaScript
import { initAuth, logout, showAuthModal, hideAuthModal, getCurrentUser, getUserEmail, getUserName } from '../auth.js';
import { initMobilePanel } from '../mobile-panel.js'; // Remove updateMobileUserInfoFromStorage import

// Global variables
let allProducts = [];
let currentFilter = 'all';

// DOM Elements
const elements = {
    profileBtn: document.getElementById('profileBtn'),
    profileMenu: document.getElementById('profileMenu'),
    logoutBtn: document.getElementById('logoutBtn'),
    searchBtn: document.getElementById('searchBtn'),
    desktopSearch: document.getElementById('desktopSearch'),
    priceSortBtn: document.getElementById('priceSortBtn'),
    cartBtn: document.getElementById('cartBtn'),
    wishlistBtn: document.getElementById('wishlistBtn'),
    dealsGrid: document.getElementById('dealsGrid'),
    cartCount: document.getElementById('cartCount'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn')
};

// Initialize Profile Dropdown
function initProfileDropdown() {
    if (!elements.profileBtn || !elements.profileMenu) return;

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

// Initialize Auth Modal
function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const loginRedirectBtn = document.getElementById('loginRedirectBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const profileBtn = document.getElementById('profileBtn');

    if (loginRedirectBtn) {
        loginRedirectBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('show');
            document.body.style.overflow = '';
            window.location.href = '../login_signup.html';
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Close modal when clicking outside
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
}

// Event Listeners
function setupEventListeners() {
    // Initialize mobile panel
    initMobilePanel();

    // Profile dropdown
    initProfileDropdown();

    // Logout - make it available globally for mobile panel
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }

    // Make logout available globally for mobile panel
    window.logout = logout;

    // Auth modal initialization
    initAuthModal();

    // Search functionality
    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', () => performSearch(elements.desktopSearch.value));
        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(e.target.value);
        });
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;

            // Reset price sort if category filter is selected
            if (currentFilter !== 'all' && currentFilter !== 'low-to-high' && currentFilter !== 'high-to-low') {
                elements.priceSortBtn.innerHTML = 'Sort by Price <span>▼</span>';
            }

            displayDeals();
        });
    });

    // Price sort dropdown
    const priceSortLinks = document.querySelectorAll('.price-sort-dropdown-content a');
    if (priceSortLinks.length > 0) {
        priceSortLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const filter = this.dataset.filter;
                elements.priceSortBtn.innerHTML = this.textContent + ' <span>▼</span>';
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                currentFilter = filter;
                displayDeals();

                // Close dropdown
                const dropdown = document.querySelector('.price-sort-dropdown-content');
                if (dropdown) {
                    if (window.innerWidth <= 880) {
                        dropdown.classList.remove('show');
                    } else {
                        dropdown.style.display = 'none';
                    }
                }
            });
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.price-sort-dropdown')) {
            const dropdown = document.querySelector('.price-sort-dropdown-content');
            if (dropdown) {
                if (window.innerWidth <= 880) {
                    dropdown.classList.remove('show');
                } else {
                    dropdown.style.display = 'none';
                }
            }
        }
    });

    // Toggle dropdown
    if (elements.priceSortBtn) {
        elements.priceSortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.querySelector('.price-sort-dropdown-content');
            if (dropdown) {
                if (window.innerWidth <= 880) {
                    dropdown.classList.toggle('show');
                } else {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            }
        });
    }

    // Navigation
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => window.location.href = '../pages/cart.html');
    }

    if (elements.wishlistBtn) {
        elements.wishlistBtn.addEventListener('click', () => window.location.href = '../pages/wishlist.html');
    }
}

// Search function
function performSearch(query) {
    if (!query.trim()) {
        displayDeals(); // Show all if query is empty
        return;
    }
    const filtered = allProducts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.brand?.toLowerCase().includes(query.toLowerCase())
    );
    displayDeals(filtered);
    showToast(`Found ${filtered.length} deal${filtered.length !== 1 ? 's' : ''} for "${query}"`);
}

// Make performSearch available globally for mobile panel
window.performSearch = performSearch;

// Countdown timer
function startCountdown() {
    const endTime = Date.now() + (12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 * 1000);

    const updateTimer = () => {
        const distance = endTime - Date.now();
        if (distance < 0) {
            // Reset timer when it reaches 0
            if (elements.hours) elements.hours.textContent = '00';
            if (elements.minutes) elements.minutes.textContent = '00';
            if (elements.seconds) elements.seconds.textContent = '00';
            return;
        }

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (elements.hours) elements.hours.textContent = hours.toString().padStart(2, '0');
        if (elements.minutes) elements.minutes.textContent = minutes.toString().padStart(2, '0');
        if (elements.seconds) elements.seconds.textContent = seconds.toString().padStart(2, '0');
    };

    updateTimer(); // Initial call
    setInterval(updateTimer, 1000);
}

// Load deals
async function loadDeals() {
    try {
        if (elements.dealsGrid) {
            elements.dealsGrid.innerHTML = '<div class="loading">Loading deals...</div>';
        }

        const res = await fetch('https://dummyjson.com/products?limit=50');
        const data = await res.json();

        // Add random discounts and stock info
        allProducts = data.products.map(p => ({
            ...p,
            discount: Math.floor(Math.random() * 40) + 10, // 10-50% discount
            stock: Math.floor(Math.random() * 50) + 5
        }));

        displayDeals();
    } catch (err) {
        if (elements.dealsGrid) {
            elements.dealsGrid.innerHTML = '<div class="loading" style="color:#ef4444">⚠️ Failed to load deals. Please try again later.</div>';
        }
        console.error('Error loading deals:', err);
        showToast('Failed to load deals. Please check your connection.');
    }
}

// Display deals
function displayDeals(productsToShow = null) {
    if (!elements.dealsGrid) return;

    let filtered = productsToShow || allProducts;

    if (!productsToShow) {
        // Apply filters only if no custom products are provided (like from search)
        if (currentFilter === 'low-to-high') {
            filtered = [...filtered].sort((a, b) => a.price - b.price);
        } else if (currentFilter === 'high-to-low') {
            filtered = [...filtered].sort((a, b) => b.price - a.price);
        } else if (currentFilter === 'top-rated') {
            filtered = filtered.filter(p => p.rating >= 4.5);
        } else if (currentFilter !== 'all') {
            // Category filters
            filtered = filtered.filter(p => {
                const category = p.category.toLowerCase();
                switch (currentFilter) {
                    case 'smartphones':
                        return category.includes('smartphone') ||
                            category.includes('mobile') ||
                            category.includes('laptop') ||
                            category.includes('tablet');
                    case 'fashion':
                        return category.includes('fashion') ||
                            category.includes('clothing') ||
                            category.includes('shoes') ||
                            category.includes('jewelery') ||
                            category.includes('accessories');
                    case 'home-decoration':
                        return category.includes('home') ||
                            category.includes('decoration') ||
                            category.includes('furniture') ||
                            category.includes('garden') ||
                            category.includes('kitchen');
                    case 'beauty':
                        return category.includes('beauty') ||
                            category.includes('skincare') ||
                            category.includes('cosmetic') ||
                            category.includes('fragrance');
                    default:
                        return true;
                }
            });
        }
    }

    if (filtered.length === 0) {
        elements.dealsGrid.innerHTML = '<div class="loading">No deals found. Try a different filter.</div>';
        return;
    }

    elements.dealsGrid.innerHTML = filtered.map(p => {
        const originalPrice = Math.round(p.price * 83);
        const discountedPrice = Math.round(originalPrice * (1 - p.discount / 100));
        const stockPercent = Math.min(100, (p.stock / 50) * 100);

        // Generate star rating
        const fullStars = Math.floor(p.rating);
        const halfStar = p.rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) starsHTML += '★';
        if (halfStar) starsHTML += '☆';
        for (let i = 0; i < emptyStars; i++) starsHTML += '☆';

        return `
            <div class="deal-card" data-product-id="${p.id}">
                <div class="image-container">
                    <img src="${p.thumbnail}" alt="${p.title}" loading="lazy" width="270" height="200">
                    <span class="discount-percentage">${p.discount}% OFF</span>
                </div>
                <div class="deal-content">
                    <div class="deal-title">${p.title}</div>
                    <div class="price-row">
                        <span class="current-price">₹${discountedPrice.toLocaleString()}</span>
                        <span class="original-price">MRP: ₹${originalPrice.toLocaleString()}</span>
                    </div>
                    <div class="rating-row">
                        <span class="rating-stars">${starsHTML}</span>
                        <span class="rating-value">${p.rating.toFixed(1)}</span>
                    </div>
                    <div class="stock-indicator">
                        ${p.stock < 10 ? `⚡ Only ${p.stock} left!` : `${p.stock} available`}
                    </div>
                    <div class="stock-bar">
                        <div class="stock-fill" style="width: ${stockPercent}%"></div>
                    </div>
                    <div class="deal-footer">
                        <button class="add-btn" data-product-id="${p.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    setupDealsEventListeners();
}

function setupDealsEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });

    // Product card clicks
    document.querySelectorAll('.deal-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Don't navigate if clicking the add to cart button
            if (e.target.closest('.add-btn')) return;

            const productId = parseInt(this.getAttribute('data-product-id'));
            window.location.href = `../pages/product.html?id=${productId}`;
        });
    });
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showToast('Product not found!');
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
            title: product.title,
            price: Math.round(product.price * 83 * (1 - product.discount / 100)),
            thumbnail: product.thumbnail,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    updateCartBadge();

    const originalPrice = Math.round(product.price * 83);
    const discountedPrice = Math.round(originalPrice * (1 - product.discount / 100));
    showToast(`Added ${product.title} to cart for ₹${discountedPrice.toLocaleString()}!`);
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
            elements.toast.classList.remove('show');
        }, 3000);
    }
}

// Make showToast available globally for mobile panel
window.showToast = showToast;

// Initialize
async function init() {
    // Setup event listeners
    setupEventListeners();

    // Start countdown timer
    startCountdown();

    // Load deals
    await loadDeals();

    // Update cart badge
    updateCartBadge();

    // Initialize authentication
    await initAuth();

    // Update user info from localStorage after auth initialization
    const userInitial = localStorage.getItem('userInitial');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    // Update desktop avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && userInitial && userInitial !== 'U') {
        userAvatar.textContent = userInitial;
        userAvatar.style.backgroundColor = '#2874f0';
        userAvatar.style.color = 'white';
    }

    // Update mobile panel info directly
    const mobileUserAvatar = document.getElementById('mobileUserAvatar');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const mobileUserName = document.getElementById('mobileUserName');

    if (mobileUserAvatar && userInitial) {
        mobileUserAvatar.textContent = userInitial;
        if (userInitial !== 'U') {
            mobileUserAvatar.style.backgroundColor = '#2874f0';
            mobileUserAvatar.style.color = 'white';
        } else {
            mobileUserAvatar.style.backgroundColor = '#f1f5f9';
            mobileUserAvatar.style.color = '#64748b';
        }
    }

    if (mobileUserEmail && userEmail) {
        mobileUserEmail.textContent = userEmail;
    }

    if (mobileUserName && userName) {
        mobileUserName.textContent = userName;
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