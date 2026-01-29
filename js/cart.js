// cart.js - Cart Management Module
(function () {
    'use strict';

    console.log('[Cart] Module loading...');

    let cartItems = [];

    // Initialize cart
    function initializeCart() {
        console.log('[Cart] Initializing...');
        loadCartFromStorage();
        updateCartDisplay();
        setupEventListeners();
        console.log('[Cart] Initialized with', cartItems.length, 'items');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Cart link click handler
        const cartLink = document.getElementById('cartLink');
        if (cartLink) {
            cartLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/cart.html';
            });
        }
    }

    // Add product to cart
    function addToCart(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('[Cart] Invalid product');
            return false;
        }

        // Check if product already in cart
        const existingIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            // Update quantity
            cartItems[existingIndex].quantity = (cartItems[existingIndex].quantity || 1) + quantity;
        } else {
            // Add new item
            cartItems.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.thumbnail || product.image,
                category: product.category,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        saveCartToStorage();
        updateCartDisplay();
        showToast(`${product.title} added to cart!`, 'success');
        console.log('[Cart] Added:', product.title, 'x', quantity);
        return true;
    }

    // Remove product from cart
    function removeFromCart(productId) {
        const itemIndex = cartItems.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const itemName = cartItems[itemIndex].title;
            cartItems.splice(itemIndex, 1);
            saveCartToStorage();
            updateCartDisplay();
            showToast('Removed from cart', 'success');
            console.log('[Cart] Removed:', itemName);
            return true;
        }
        return false;
    }

    // Update product quantity
    function updateQuantity(productId, quantity) {
        const itemIndex = cartItems.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            quantity = Math.max(1, Math.min(99, quantity));
            cartItems[itemIndex].quantity = quantity;
            saveCartToStorage();
            updateCartDisplay();
            console.log('[Cart] Updated quantity:', productId, '->', quantity);
            return true;
        }
        return false;
    }

    // Get cart items
    function getCartItems() {
        return cartItems;
    }

    // Get cart total
    function getCartTotal() {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    }

    // Get total items count
    function getTotalItems() {
        return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }

    // Save cart to localStorage
    function saveCartToStorage() {
        try {
            localStorage.setItem('eshophub-cart', JSON.stringify(cartItems));
            console.log('[Cart] Saved to storage');
        } catch (error) {
            console.error('[Cart] Error saving:', error);
        }
    }

    // Load cart from localStorage
    function loadCartFromStorage() {
        try {
            const stored = localStorage.getItem('eshophub-cart');
            cartItems = stored ? JSON.parse(stored) : [];
            console.log('[Cart] Loaded from storage:', cartItems.length, 'items');
        } catch (error) {
            console.error('[Cart] Error loading:', error);
            cartItems = [];
        }
    }

    // Update cart display count
    function updateCartDisplay() {
        const count = getTotalItems();

        // Update all cart count badges
        document.querySelectorAll('#cartCount, .cart-count, .cart-badge').forEach(el => {
            if (el) el.textContent = count;
        });

        console.log('[Cart] Updated display:', count, 'items');
    }

    // Clear cart
    function clearCart() {
        cartItems = [];
        saveCartToStorage();
        updateCartDisplay();
        console.log('[Cart] Cleared');
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[Cart Toast] ${type}: ${message}`);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCart);
    } else {
        initializeCart();
    }

    // Export functions for global use
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;
    window.getCartItems = getCartItems;
    window.getCartTotal = getCartTotal;
    window.getTotalItems = getTotalItems;
    window.clearCart = clearCart;

    // For backward compatibility
    window.cartItems = cartItems;
})();