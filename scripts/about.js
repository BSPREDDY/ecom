// About Page Manager
class AboutManager {
    constructor() {
        this.stats = {
            happyCustomers: 500000,
            productsSold: 2500000,
            countries: 50,
            rating: 4.8
        };

        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateStats();
        this.updateCartBadge();
        this.startTeamAnimations();
    }

    bindEvents() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.handleSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }

        // Learn more button
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('timeline-section').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Cart functionality
        const cartIcon = document.getElementById('cartIcon');
        const cartClose = document.getElementById('cartClose');
        const cartOverlay = document.getElementById('cartOverlay');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const startShoppingBtn = document.getElementById('startShoppingBtn');

        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCart();
            });
        }

        if (cartClose) cartClose.addEventListener('click', () => this.hideCart());
        if (cartOverlay) cartOverlay.addEventListener('click', () => this.hideCart());

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }
                alert(`Proceeding to checkout with total: $${this.calculateTotal().toFixed(2)}`);
            });
        }

        if (startShoppingBtn) {
            startShoppingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideCart();
                window.location.href = 'index.html#products';
            });
        }

        // Team social links
        document.querySelectorAll('.team-social a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // In a real application, these would open social media profiles
                this.showNotification('Social link clicked! (Demo only)');
            });
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCart();
            }
        });
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');

        stats.forEach(statElement => {
            const statId = statElement.parentElement.querySelector('.stat-label').textContent;
            let targetValue = 0;

            switch (statId) {
                case 'Happy Customers':
                    targetValue = this.stats.happyCustomers;
                    break;
                case 'Products Sold':
                    targetValue = this.stats.productsSold;
                    break;
                case 'Countries Served':
                    targetValue = this.stats.countries;
                    break;
                case 'Customer Rating':
                    targetValue = this.stats.rating;
                    break;
            }

            this.animateNumber(statElement, targetValue, 2000);
        });
    }

    animateNumber(element, target, duration) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (element.id === 'rating') {
                element.textContent = current.toFixed(1);
            } else {
                const value = Math.floor(current);
                const formattedValue = value >= 1000
                    ? `${(value / 1000).toFixed(value >= 1000000 ? 1 : 0)}${value >= 1000000 ? 'M' : 'K'}`
                    : value;
                element.innerHTML = `${formattedValue}<span class="plus">${value >= 1000 ? '+' : value === 50 ? '+' : '/5'}</span>`;
            }
        }, 16);
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase().trim();

        if (query) {
            // Search within about page content
            const content = document.body.textContent.toLowerCase();
            if (content.includes(query)) {
                this.highlightSearchTerms(query);
                this.showNotification(`Found content related to "${query}"`);
            } else {
                this.showNotification(`No results found for "${query}". Try searching in our store.`);
            }
            searchInput.value = '';
        }
    }

    highlightSearchTerms(query) {
        const searchTerms = query.split(' ');
        const elements = document.querySelectorAll('h1, h2, h3, h4, p, .value-description, .timeline-description, .team-bio');

        elements.forEach(element => {
            let html = element.innerHTML;
            searchTerms.forEach(term => {
                if (term.length > 2) {
                    const regex = new RegExp(`(${term})`, 'gi');
                    html = html.replace(regex, '<mark style="background: yellow; color: black;">$1</mark>');
                }
            });
            element.innerHTML = html;
        });

        // Scroll to first highlighted element
        const firstHighlight = document.querySelector('mark');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    startTeamAnimations() {
        // Add hover animations to team cards
        const teamCards = document.querySelectorAll('.team-card');

        teamCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;

            // Add mouse enter/leave effects
            card.addEventListener('mouseenter', () => {
                const image = card.querySelector('.team-image img');
                if (image) {
                    image.style.transform = 'scale(1.1)';
                }
            });

            card.addEventListener('mouseleave', () => {
                const image = card.querySelector('.team-image img');
                if (image) {
                    image.style.transform = 'scale(1)';
                }
            });
        });
    }

    showCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartSidebar) cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');

        document.body.style.overflow = 'hidden';
        this.renderCart();
    }

    hideCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');

        document.body.style.overflow = '';
    }

    renderCart() {
        const cartBody = document.getElementById('cartBody');
        const emptyCart = document.getElementById('emptyCart');
        const totalAmount = document.getElementById('totalAmount');

        if (!cartBody || !emptyCart || !totalAmount) return;

        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartBody.innerHTML = '';
            totalAmount.textContent = '$0.00';
            return;
        }

        emptyCart.style.display = 'none';

        cartBody.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">$${item.price ? item.price.toFixed(2) : '0.00'} × ${item.quantity}</p>
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button class="cart-quantity-btn minus" onclick="aboutManager.updateCartQuantity(${item.id}, -1)">-</button>
                            <span class="cart-quantity-value">${item.quantity}</span>
                            <button class="cart-quantity-btn plus" onclick="aboutManager.updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="cart-remove-btn" onclick="aboutManager.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');

        totalAmount.textContent = `$${this.calculateTotal().toFixed(2)}`;
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity < 1) {
            this.removeFromCart(productId);
        } else {
            this.saveCart();
            this.renderCart();
            this.updateCartBadge();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
        this.updateCartBadge();
        this.showNotification('Item removed from cart');
    }

    calculateTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            cartBadge.textContent = totalItems;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--dark-color);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 4000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
    }
}

// Initialize About Manager
document.addEventListener('DOMContentLoaded', () => {
    window.aboutManager = new AboutManager();
});