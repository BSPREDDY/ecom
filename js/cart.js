// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    setupCartEvents();
});

// Load cart items
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
        cartItemsContainer.innerHTML = '';
        if (cartTotalElement) cartTotalElement.textContent = '$0.00';
        return;
    }

    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="row align-items-center">
                <div class="col-md-2 col-sm-3">
                    <img src="${item.image || 'https://via.placeholder.com/100'}" 
                         alt="${item.title}" 
                         class="img-fluid rounded">
                </div>
                <div class="col-md-4 col-sm-5">
                    <h6 class="mb-1">${item.title}</h6>
                    <p class="text-muted mb-0">${formatPrice(item.price)} each</p>
                </div>
                <div class="col-md-3 col-sm-4">
                    <div class="input-group">
                        <button class="btn btn-outline-secondary quantity-minus" type="button">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="form-control text-center quantity-input" 
                               value="${item.quantity}" min="1" max="99">
                        <button class="btn btn-outline-secondary quantity-plus" type="button">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-2 col-sm-6">
                    <h6 class="item-total">${formatPrice(item.price * item.quantity)}</h6>
                </div>
                <div class="col-md-1 col-sm-6 text-end">
                    <button class="btn btn-danger btn-sm remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updateCartTotal();
}

// Setup cart events
function setupCartEvents() {
    // Quantity changes
    document.addEventListener('click', (e) => {
        if (e.target.closest('.quantity-minus')) {
            const input = e.target.closest('.input-group').querySelector('.quantity-input');
            if (input.value > 1) {
                input.value = parseInt(input.value) - 1;
                updateCartItemQuantity(input);
            }
        }

        if (e.target.closest('.quantity-plus')) {
            const input = e.target.closest('.input-group').querySelector('.quantity-input');
            if (input.value < 99) {
                input.value = parseInt(input.value) + 1;
                updateCartItemQuantity(input);
            }
        }
    });

    // Direct input changes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            updateCartItemQuantity(e.target);
        }
    });

    // Remove item
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.productId;
            removeFromCart(parseInt(productId));
            cartItem.remove();
            updateCartTotal();
            updateCartCount();

            // Show empty cart message if needed
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const emptyCartMessage = document.getElementById('empty-cart');
            if (cart.length === 0 && emptyCartMessage) {
                emptyCartMessage.classList.remove('d-none');
            }
        }
    });

    // Clear cart
    document.getElementById('clear-cart')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            localStorage.removeItem('cart');
            loadCartItems();
            updateCartCount();
        }
    });

    // Continue shopping
    document.getElementById('continue-shopping')?.addEventListener('click', () => {
        window.location.href = 'products.html';
    });

    // Proceed to checkout
    document.getElementById('proceed-checkout')?.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please login to proceed to checkout');
            window.location.href = 'auth.html';
            return;
        }

        window.location.href = 'checkout.html';
    });
}

// Update cart item quantity
function updateCartItemQuantity(input) {
    const cartItem = input.closest('.cart-item');
    const productId = parseInt(cartItem.dataset.productId);
    const quantity = parseInt(input.value);

    if (quantity < 1 || quantity > 99) {
        loadCartItems();
        return;
    }

    updateQuantity(productId, quantity);

    // Update item total
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        const itemTotal = cartItem.querySelector('.item-total');
        if (itemTotal) {
            itemTotal.textContent = formatPrice(item.price * quantity);
        }
    }

    updateCartTotal();
}

// Update cart total
function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
    if (taxElement) taxElement.textContent = formatPrice(tax);
    if (totalElement) totalElement.textContent = formatPrice(total);
}