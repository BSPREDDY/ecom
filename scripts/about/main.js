import { initAuth, logout, showAuthModal, hideAuthModal } from '../auth.js';
import { initMobilePanel } from '../mobile-panel.js'; // Import mobile panel functionality

// DOM Elements
const getElement = (id) => document.getElementById(id);

// Initialize the page
async function initAboutPage() {
    console.log('Initializing About page...');

    try {
        // Initialize mobile panel first
        initMobilePanel();

        // Initialize authentication
        const isAuthenticated = await initAuth();

        // If not authenticated, show auth modal
        if (!isAuthenticated) {
            console.log('User not authenticated, showing auth modal...');
            showAuthModal();
        }

        // Setup event listeners
        setupEventListeners();

        // Check cart
        updateCartBadge();

        console.log('About page initialized successfully');
    } catch (error) {
        console.error('Error initializing About page:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const desktopSearchBtn = getElement('searchBtn');
    const desktopSearchInput = getElement('desktopSearch');

    function performSearch(query) {
        if (!query.trim()) return;
        sessionStorage.setItem('lastSearch', query);
        window.location.href = `/pages/home.html?search=${encodeURIComponent(query)}`;
    }

    if (desktopSearchBtn && desktopSearchInput) {
        desktopSearchBtn.addEventListener('click', () => {
            performSearch(desktopSearchInput.value);
        });

        desktopSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(e.target.value);
        });
    }

    // Profile dropdown
    const profileBtn = getElement('profileBtn');
    const profileMenu = getElement('profileMenu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = profileMenu.style.display === 'block';
            profileMenu.style.display = isOpen ? 'none' : 'block';
            profileBtn.setAttribute('aria-expanded', !isOpen);
        });

        document.addEventListener('click', (e) => {
            if (profileBtn && !profileBtn.contains(e.target) &&
                profileMenu && !profileMenu.contains(e.target)) {
                profileMenu.style.display = 'none';
                profileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Cart and wishlist buttons
    const cartBtn = getElement('cartBtn');
    const wishlistBtn = getElement('wishlistBtn');

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = '/pages/cart.html';
        });
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            window.location.href = '/pages/wishlist.html';
        });
    }

    // Logout buttons
    const logoutBtn = getElement('logoutBtn');
    const closeAuthModal = getElement('closeAuthModal');
    const loginRedirectBtn = getElement('loginRedirectBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logout();
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            hideAuthModal();
        });
    }

    if (loginRedirectBtn) {
        loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '../login_signup.html';
        });
    }

    // Restore last search query if exists
    const lastSearch = sessionStorage.getItem('lastSearch');
    if (lastSearch && desktopSearchInput) {
        desktopSearchInput.value = lastSearch;
    }
}

// Update cart badge
function updateCartBadge() {
    const cartCountElement = getElement('cartCount');
    if (!cartCountElement) return;

    try {
        let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
        const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCountElement.textContent = totalItems;
    } catch (error) {
        console.error('Error updating cart badge:', error);
        cartCountElement.textContent = '0';
    }
}

// Make performSearch available globally for mobile panel
window.performSearch = function (query) {
    if (!query.trim()) return;
    sessionStorage.setItem('lastSearch', query);
    window.location.href = `/pages/home.html?search=${encodeURIComponent(query)}`;
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutPage);
} else {
    initAboutPage();
}