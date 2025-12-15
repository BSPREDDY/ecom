// Main Application Script
class EcommerceApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('PassKart E-commerce Platform Initialized');
        this.initUser();
        this.initCart();
        this.initWishlist();
        this.initNotifications();
        this.initPerformance();
    }

    initUser() {
        // Check if user is logged in
        const user = this.getCurrentUser();
        if (user) {
            this.updateUserUI(user);
        }
    }

    getCurrentUser() {
        // In a real app, this would check Firebase auth or session
        return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    }

    updateUserUI(user) {
        // Update account dropdown
        const accountLabel = document.querySelector('.nav-label');
        const accountSubtext = document.querySelector('.nav-subtext');

        if (accountLabel && accountSubtext) {
            accountLabel.textContent = user.name || 'Account';
            accountSubtext.textContent = 'My Account';
        }

        // Update dropdown header
        const dropdownHeader = document.querySelector('.dropdown-header');
        if (dropdownHeader) {
            dropdownHeader.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <div>
                    <h4>Welcome, ${user.name}</h4>
                    <p>${user.email}</p>
                </div>
            `;
        }
    }

    initCart() {
        // Initialize cart from localStorage or create empty cart
        let cart = JSON.parse(localStorage.getItem('cart')) || {
            items: [],
            total: 0,
            count: 0
        };

        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartUI(cart);
    }

    updateCartUI(cart) {
        // Update cart badge
        const cartBadge = document.getElementById('cart-badge');
        if (cartBadge) {
            cartBadge.textContent = cart.count || '0';
        }

        // Update cart total
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            cartTotal.textContent = `$${(cart.total || 0).toFixed(2)}`;
        }

        // Update cart dropdown if open
        this.updateCartDropdown(cart);
    }

    updateCartDropdown(cart) {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        if (cart.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = cart.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h5>${item.name}</h5>
                        <p>${item.quantity} × $${item.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            // Update subtotal
            const subtotal = document.querySelector('.subtotal-amount');
            if (subtotal) {
                subtotal.textContent = `$${cart.total.toFixed(2)}`;
            }

            // Update cart count in header
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = `(${cart.count} items)`;
            }
        }
    }

    initWishlist() {
        // Initialize wishlist
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Update wishlist badge
        const wishlistBadge = document.getElementById('wishlist-badge');
        if (wishlistBadge) {
            wishlistBadge.textContent = wishlist.length || '0';
        }
    }

    initNotifications() {
        // Check for new notifications
        this.checkNotifications();
    }

    checkNotifications() {
        // In a real app, this would check for new orders, messages, etc.
        setTimeout(() => {
            // Example: Show welcome notification
            if (!localStorage.getItem('welcomeShown')) {
                this.showNotification('Welcome to PassKart! Enjoy shopping with us.', 'info');
                localStorage.setItem('welcomeShown', 'true');
            }
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        }
    }

    initPerformance() {
        // Monitor performance metrics
        this.trackPerformance();

        // Lazy load images
        this.initLazyLoading();

        // Prefetch critical resources
        this.prefetchResources();
    }

    trackPerformance() {
        // Track page load time
        window.addEventListener('load', () => {
            if (window.performance) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`Page loaded in ${loadTime}ms`);

                // Send to analytics in real app
                // this.sendAnalytics('page_load', { loadTime });
            }
        });
    }

    initLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    prefetchResources() {
        // Prefetch next likely pages
        const links = [
            '/products.html',
            '/deals.html',
            '/cart.html'
        ];

        links.forEach(link => {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = link;
            document.head.appendChild(prefetchLink);
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new EcommerceApp();

    // Add global error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        // Send to error tracking service in production
    });

    // Add offline/online detection
    window.addEventListener('online', () => {
        app.showNotification('You are back online!', 'success');
    });

    window.addEventListener('offline', () => {
        app.showNotification('You are offline. Some features may not work.', 'warning');
    });
});