// Common functions for all pages
document.addEventListener('DOMContentLoaded', function () {
    // Initialize cart count
    updateCartCount();

    // Scroll to top button with throttling
    const scrollToTopBtn = document.getElementById('scrollToTop');
    let scrollTimeout;
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function () {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.style.display = 'block';
                } else {
                    scrollToTopBtn.style.display = 'none';
                }
            }, 100);
        }, { passive: true });

        scrollToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Update authentication button - only if not on auth page
    if (!document.querySelector('.auth-container')) {
        updateAuthButton();
    }

    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function () {
                if (!this.src.includes('placeholder')) {
                    this.src = 'https://via.placeholder.com/300';
                }
            });
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }

    // Debounce filter events
    const filterInputs = document.querySelectorAll('#categoryFilter, #priceRange, #sortFilter');
    const sortProducts = function () {
        console.log('Sorting products...');
        // Sorting logic here
    };
    const filterProducts = function () {
        console.log('Filtering products...');
        // Filtering logic here
    };
    filterInputs.forEach(input => {
        let filterTimeout;
        input.addEventListener('change', function () {
            clearTimeout(filterTimeout);
            filterTimeout = setTimeout(() => {
                if (this.id === 'sortFilter') {
                    sortProducts();
                } else {
                    filterProducts();
                }
            }, 300);
        });
    });
});

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCount.textContent = totalItems;
    }
}

// Format price with currency
function formatPrice(price) {
    if (isNaN(price)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Show loading spinner
function showLoading(element) {
    if (!element) return;
    element.innerHTML = `
        <div class="spinner-container">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

// Show error message
function showError(element, message) {
    if (!element) return;
    element.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
        </div>
    `;
}

// Update authentication button based on login status
function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    const user = JSON.parse(localStorage.getItem('user'));

    // Check if we're on a page with auth button
    if (!authBtn) return;

    if (user) {
        // User is logged in
        authBtn.innerHTML = '<i class="fas fa-user me-2"></i>' + (user.displayName || 'Profile');
        authBtn.href = '#';
        authBtn.onclick = function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                if (window.firebase && window.firebase.auth) {
                    window.firebase.auth().signOut().then(() => {
                        console.log('User signed out');
                    }).catch((error) => {
                        console.error('Sign out error:', error);
                    });
                }
                localStorage.removeItem('user');
                updateAuthButton();
                window.location.href = 'index.html';
            }
        };
    } else {
        // User is not logged in
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
        authBtn.href = 'auth.html';
        authBtn.onclick = null;
    }
}

// Add to cart function
function addToCart(product) {
    if (!product || !product.id) {
        console.error('Invalid product');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title || 'Unknown Product',
            price: product.price || 0,
            image: product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/100',
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Show notification
    showNotification('Product added to cart!');
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.alert-notification').forEach(el => el.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-notification`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for animations if not already added
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Preload API responses
const apiCache = new Map();

async function fetchWithCache(url) {
    if (apiCache.has(url)) {
        return apiCache.get(url);
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            apiCache.set(url, data);
            return data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
    return null;
}