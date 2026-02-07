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

    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        if (emptyCart) emptyCart.classList.remove('d-none');
        if (cartContent) cartContent.classList.add('d-none');
        updateCartSummary();
        updateCartCount();
        return;
    }

    if (emptyCart) emptyCart.classList.add('d-none');
    if (cartContent) cartContent.classList.remove('d-none');

    if (!container) return;

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
                         style="width:80px;height:80px;object-fit:contain;">
                    <div>
                        <h6 class="mb-1">${item.title}</h6>
                        <small class="text-muted">Product ID: ${item.id}</small>
                    </div>
                </div>
            </td>

            <td>
                <button onclick="updateQuantity(${index},-1)">-</button>
                ${item.quantity}
                <button onclick="updateQuantity(${index},1)">+</button>
            </td>

            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(item.price * item.quantity)}</td>

            <td>
                <button onclick="removeFromCart(${index})">🗑</button>
            </td>
        `;

        container.appendChild(row);
    });

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

    if (path.includes('cart.html')) {
        loadCart();
    }

    if (path.includes('order-confirmation.html')) {
        loadOrderConfirmation();
    }
});
