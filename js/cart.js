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

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const orderDate = new Date(order.date);
    const estimatedDelivery = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        itemsHtml = order.items.map((item, index) => `
            <tr style="animation: fadeIn 0.5s ease-out ${index * 0.1}s both;">
                <td>
                    <img src="${item.image || 'https://via.placeholder.com/80'}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"
                         onerror="this.src='https://via.placeholder.com/80'">
                </td>
                <td><strong>${item.title}</strong></td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
            </tr>
        `).join('');
    }

    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease-out;">
            <!-- Success Message -->
            <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-left: 5px solid #28a745;">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Order Confirmed!</strong> Your order has been successfully placed.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>

            <!-- Order Details -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Order Details</h5>
                            <div class="mb-3">
                                <small class="text-muted">Order Number</small>
                                <h6 class="mb-0" style="color: #007bff; font-weight: 700;">${order.orderNumber}</h6>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">Order Date</small>
                                <h6 class="mb-0">${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}</h6>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">Status</small>
                                <span class="badge bg-primary ms-2">${order.status || 'Processing'}</span>
                            </div>
                            <div>
                                <small class="text-muted">Estimated Delivery</small>
                                <h6 class="mb-0">${estimatedDelivery.toLocaleDateString()}</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Customer Information</h5>
                            <div class="mb-3">
                                <small class="text-muted">Name</small>
                                <h6 class="mb-0">${user.displayName || user.email || 'Guest'}</h6>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">Email</small>
                                <h6 class="mb-0">${user.email || 'Not provided'}</h6>
                            </div>
                            <div>
                                <small class="text-muted">Total Items</small>
                                <h6 class="mb-0">${order.items ? order.items.length : 0} item(s)</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-light border-0">
                    <h5 class="mb-0">Order Items</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body">
                    <div class="row text-right">
                        <div class="col-md-8 text-end">
                            <strong>Subtotal:</strong>
                        </div>
                        <div class="col-md-4 text-end">
                            <strong>${formatPrice(order.subtotal || 0)}</strong>
                        </div>
                    </div>
                    <div class="row text-right mt-2">
                        <div class="col-md-8 text-end">
                            <strong>Shipping:</strong>
                        </div>
                        <div class="col-md-4 text-end">
                            <strong class="text-success">${order.shipping === 0 ? 'FREE' : formatPrice(order.shipping || 0)}</strong>
                        </div>
                    </div>
                    <div class="row text-right mt-2">
                        <div class="col-md-8 text-end">
                            <strong>Tax (10%):</strong>
                        </div>
                        <div class="col-md-4 text-end">
                            <strong>${formatPrice(order.tax || 0)}</strong>
                        </div>
                    </div>
                    <hr>
                    <div class="row text-right">
                        <div class="col-md-8 text-end">
                            <h5>Total:</h5>
                        </div>
                        <div class="col-md-4 text-end">
                            <h5 class="text-primary" style="font-weight: 700;">${formatPrice(order.total || 0)}</h5>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-3 mb-4">
                <a href="index.html" class="btn btn-primary flex-fill">
                    <i class="fas fa-home me-2"></i>Back to Home
                </a>
                <a href="products.html" class="btn btn-outline-primary flex-fill">
                    <i class="fas fa-shopping-bag me-2"></i>Continue Shopping
                </a>
            </div>

            <!-- Order Tracking Section -->
            <div class="alert alert-info" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                <strong>What's Next?</strong> You will receive an email confirmation shortly with tracking information. You can track your order progress below.
            </div>
        </div>
    `;

    // Show order tracking section
    const trackingElement = document.getElementById('orderTracking');
    if (trackingElement) {
        trackingElement.style.display = 'block';
        // Activate first step
        trackingElement.querySelector('.timeline-step')?.classList.add('active');
    }

    // Mark second step as active after 2 seconds
    setTimeout(() => {
        const steps = document.querySelectorAll('.timeline-step');
        if (steps[1]) steps[1].classList.add('active');
    }, 2000);

    localStorage.removeItem('currentOrder');
    localStorage.removeItem('cart');
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
