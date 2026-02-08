// ===============================
// Cart functionality
// ===============================

let cart = [];

// ===============================
// Initialize cart safely
// ===============================
function initializeCart() {
    try {
        const storedCart = localStorage.getItem('cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        cart = [];
    }
}

// ===============================
// Load cart items
// ===============================
function loadCart() {
    initializeCart();
    console.log('[v0] Loading cart. Items in cart:', cart.length);

    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        console.log('[v0] Cart is empty, showing empty message');
        if (emptyCart) {
            emptyCart.classList.remove('d-none');
            console.log('[v0] Showed empty cart message');
        }
        if (cartContent) {
            cartContent.classList.add('d-none');
            console.log('[v0] Hid cart content');
        }
        updateCartSummary();
        updateCartCount();
        return;
    }

    console.log('[v0] Cart has items, showing cart content');
    if (emptyCart) {
        emptyCart.classList.add('d-none');
        console.log('[v0] Hid empty cart message');
    }
    if (cartContent) {
        cartContent.classList.remove('d-none');
        console.log('[v0] Showed cart content');
    }

    if (!container) {
        console.error('[v0] cartItems container not found!');
        return;
    }

    container.innerHTML = '';

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'cart-item';
        row.style.animation = 'fadeIn 0.5s ease-out';

        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.image || 'https://via.placeholder.com/80'}"
                         class="img-thumbnail me-3"
                         style="width:80px;height:80px;object-fit:contain;"
                         onerror="this.src='https://via.placeholder.com/80'">
                    <div>
                        <h6 class="mb-1">${item.title}</h6>
                        <small class="text-muted">Product ID: ${item.id}</small>
                    </div>
                </div>
            </td>

            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${index},-1)">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${index},1)">+</button>
            </td>

            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(item.price * item.quantity)}</td>

            <td>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})" title="Remove from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        container.appendChild(row);
    });

    console.log('[v0] Rendered', cart.length, 'items in cart');
    updateCartSummary();
    updateCartCount();
}

// ===============================
// Update quantity
// ===============================
function updateQuantity(index, delta) {
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    saveCart();
}

// ===============================
// Remove item
// ===============================
function removeFromCart(index) {
    if (!confirm('Remove this item?')) return;

    cart.splice(index, 1);
    saveCart();
}

// ===============================
// Save cart
// ===============================
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
    } catch (e) {
        console.error(e);
        showNotification('Error saving cart', 'danger');
    }
}

// ===============================
// Calculate totals (optimized)
// ===============================
function calculateTotals() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
}

// ===============================
// Update summary
// ===============================
function updateCartSummary() {
    const { subtotal, shipping, tax, total } = calculateTotals();

    const subEl = document.getElementById('cartSubtotal');
    const shipEl = document.getElementById('cartShipping');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');

    if (subEl) subEl.textContent = formatPrice(subtotal);
    if (shipEl) shipEl.textContent = formatPrice(shipping);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// ===============================
// Checkout
// ===============================
function checkout() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert('Login first');
        window.location.href = 'auth.html?redirect=checkout.html';
        return;
    }

    if (cart.length === 0) {
        alert('Cart empty!');
        return;
    }

    const totals = calculateTotals();

    const order = {
        orderNumber: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        items: cart,
        ...totals,
        status: 'Processing'
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.removeItem('cart');

    window.location.href = 'checkout.html';
}

// ===============================
// Order confirmation
// ===============================
function loadOrderConfirmation() {
    const order = JSON.parse(localStorage.getItem('currentOrder'));
    if (!order) {
        window.location.href = 'cart.html';
        return;
    }

    const container = document.getElementById('orderConfirmation');
    if (!container) return;

    container.innerHTML = `
        <h2>Order Confirmed 🎉</h2>
        <p>Order #: ${order.orderNumber}</p>
        <p>Total: ${formatPrice(order.total)}</p>
    `;

    localStorage.removeItem('currentOrder');
}

// ===============================
// Helpers
// ===============================
function formatPrice(price) {
    return '$' + price.toFixed(2);
}

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if (el) el.textContent = cart.length;
}

function showNotification(message, type) {
    alert(message);
}

// ===============================
// Init on page load
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    console.log('[v0] Current path:', path);

    if (path.includes('cart.html')) {
        console.log('[v0] Loading cart page');
        loadCart();
    }

    if (path.includes('order-confirmation.html')) {
        console.log('[v0] Loading order confirmation');
        loadOrderConfirmation();
    }
});

// Also try loading immediately in case DOM is already ready
if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        if (path.includes('cart.html')) {
            setTimeout(() => loadCart(), 100);
        }
    });
} else {
    // DOM is already ready
    const path = window.location.pathname;
    if (path.includes('cart.html')) {
        setTimeout(() => loadCart(), 100);
    }
}
