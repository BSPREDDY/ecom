// wishlist.js - Wishlist Management Module
(function () {
    'use strict';

    console.log('[Wishlist] Module loading...');

    let wishlistItems = [];

    // Initialize wishlist
    function initializeWishlist() {
        console.log('[Wishlist] Initializing...');
        loadWishlistFromStorage();
        updateWishlistDisplay();
        setupEventListeners();
        console.log('[Wishlist] Initialized with', wishlistItems.length, 'items');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Wishlist link click handler
        const wishlistLink = document.getElementById('wishlistLink');
        if (wishlistLink) {
            wishlistLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/wishlist.html';
            });
        }
    }

    // Add product to wishlist
    function addToWishlist(product) {
        if (!product || !product.id) {
            console.error('[Wishlist] Invalid product');
            return false;
        }

        const existingItem = wishlistItems.find(item => item.id === product.id);

        if (!existingItem) {
            wishlistItems.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.thumbnail || product.image,
                category: product.category,
                rating: product.rating,
                addedAt: new Date().toISOString()
            });

            saveWishlistToStorage();
            updateWishlistDisplay();
            showToast('Added to wishlist!', 'success');
            console.log('[Wishlist] Added:', product.title);
            return true;
        } else {
            showToast('Already in wishlist', 'info');
            return false;
        }
    }

    // Remove product from wishlist
    function removeFromWishlist(productId) {
        const itemIndex = wishlistItems.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const itemName = wishlistItems[itemIndex].title;
            wishlistItems.splice(itemIndex, 1);
            saveWishlistToStorage();
            updateWishlistDisplay();
            showToast('Removed from wishlist', 'success');
            console.log('[Wishlist] Removed:', itemName);
            return true;
        }
        return false;
    }

    // Toggle wishlist (add or remove)
    function toggleWishlist(product) {
        const isInWishlist = wishlistItems.some(item => item.id === product.id);
        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    }

    // Check if product is in wishlist
    function isProductInWishlist(productId) {
        return wishlistItems.some(item => item.id === productId);
    }

    // Update wishlist button state
    function updateWishlistButton(productId) {
        const btn = document.querySelector(`[data-wishlist-btn="${productId}"]`);
        if (btn) {
            const isInWishlist = isProductInWishlist(productId);
            btn.className = isInWishlist ? 'btn btn-danger' : 'btn btn-outline-danger';
            btn.innerHTML = `<i class="bi bi-heart${isInWishlist ? '-fill' : ''}"></i>`;
        }
    }

    // Save wishlist to localStorage
    function saveWishlistToStorage() {
        try {
            localStorage.setItem('eshophub-wishlist', JSON.stringify(wishlistItems));
            console.log('[Wishlist] Saved to storage');
        } catch (error) {
            console.error('[Wishlist] Error saving:', error);
        }
    }

    // Load wishlist from localStorage
    function loadWishlistFromStorage() {
        try {
            const stored = localStorage.getItem('eshophub-wishlist');
            wishlistItems = stored ? JSON.parse(stored) : [];
            console.log('[Wishlist] Loaded from storage:', wishlistItems.length, 'items');
        } catch (error) {
            console.error('[Wishlist] Error loading:', error);
            wishlistItems = [];
        }
    }

    // Update wishlist display count
    function updateWishlistDisplay() {
        const count = wishlistItems.length;

        // Update all wishlist count badges
        document.querySelectorAll('#wishlistCount, .wishlist-count, .wishlist-badge').forEach(el => {
            if (el) el.textContent = count;
        });

        console.log('[Wishlist] Updated display:', count, 'items');
    }

    // Get wishlist items
    function getWishlistItems() {
        return wishlistItems;
    }

    // Clear wishlist
    function clearWishlist() {
        wishlistItems = [];
        saveWishlistToStorage();
        updateWishlistDisplay();
        console.log('[Wishlist] Cleared');
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[Wishlist Toast] ${type}: ${message}`);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWishlist);
    } else {
        initializeWishlist();
    }

    // Export functions for global use
    window.addToWishlist = addToWishlist;
    window.removeFromWishlist = removeFromWishlist;
    window.toggleWishlist = toggleWishlist;
    window.isProductInWishlist = isProductInWishlist;
    window.updateWishlistButton = updateWishlistButton;
    window.getWishlistItems = getWishlistItems;
    window.clearWishlist = clearWishlist;

    // For backward compatibility
    window.wishlistItems = wishlistItems;
})();