// ================= COMMON FUNCTIONS =================

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTop');
    let scrollTimeout;

    if (scrollToTopBtn) {
        window.addEventListener(
            'scroll',
            () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    scrollToTopBtn.classList.toggle('show', window.pageYOffset > 300);
                }, 100);
            },
            { passive: true }
        );

        scrollToTopBtn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Update auth button
    if (!document.querySelector('.auth-container')) {
        updateAuthButton();
    }

    // Lazy loading images
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
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

            if (img.dataset.src) observer.observe(img);
        });
    }
});

// ================= CART COUNT (FIXED) =================

function updateCartCount() {
    const cartCountEl = document.getElementById('cartCount');
    if (!cartCountEl) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalItems = cart.reduce((sum, item) => {
        // ✅ backward compatible
        return sum + (item.quantity ? Number(item.quantity) : 1);
    }, 0);

    cartCountEl.textContent = totalItems;
}

// ================= ADD TO CART =================

function addToCart(product) {
    if (!product || !product.id) {
        console.error('Invalid product');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title || 'Unknown Product',
            price: product.price || 0,
            image:
                product.thumbnail ||
                product.images?.[0] ||
                'https://via.placeholder.com/100',
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
}

// ================= AUTH BUTTON =================

function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;

    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        authBtn.innerHTML = `<i class="fas fa-user me-2"></i>${user.displayName || 'Profile'}`;
        authBtn.href = '#';

        authBtn.onclick = e => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('user');
                updateAuthButton();
                window.location.href = 'index.html';
            }
        };
    } else {
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
        authBtn.href = 'auth.html';
        authBtn.onclick = null;
    }
}

// ================= NOTIFICATIONS =================

function showNotification(message, type = 'success') {
    const cartToast = document.getElementById('cartToast');

    if (cartToast) {
        const msg = document.getElementById('cartToastMessage');
        if (msg) {
            msg.textContent = message;
            cartToast.style.display = 'block';
            setTimeout(() => (cartToast.style.display = 'none'), 2500);
            return;
        }
    }

    document.querySelectorAll('.alert-notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-notification`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;

    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ================= UTILITIES =================

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(Number(price) || 0);
}

function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

// ================= FETCH CACHE =================

const apiCache = new Map();

async function fetchWithCache(url) {
    if (apiCache.has(url)) return apiCache.get(url);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        apiCache.set(url, data);
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}
