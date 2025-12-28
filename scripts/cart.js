// Cart Page Manager
class CartPageManager {
    constructor() {
        this.init()
    }

    init() {
        this.renderCart()
        this.bindEvents()
        if (window.cartManager) {
            window.cartManager.updateCartBadge()
        }
        this.setupRealTimeListeners()
    }

    setupRealTimeListeners() {
        // Listen for cart updates and re-render automatically
        window.addEventListener("cartUpdated", () => {
            this.renderCart()
        })
    }

    bindEvents() {
        const checkoutBtn = document.getElementById("checkoutBtn")
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                const cart = window.cartManager.getCart()
                if (cart.length === 0) {
                    window.utils.showNotification("Your cart is empty!", "error")
                    return
                }
                window.location.href = "checkout.html"
            })
        }
    }

    renderCart() {
        const cartItems = document.getElementById("cartItems")
        const emptyCart = document.getElementById("emptyCart")
        const cartContent = document.getElementById("cartContent")

        if (!cartItems || !emptyCart || !cartContent) return

        const cart = window.cartManager ? window.cartManager.getCart() : []

        if (cart.length === 0) {
            emptyCart.style.display = "block"
            cartContent.style.display = "none"
            return
        }

        emptyCart.style.display = "none"
        cartContent.style.display = "grid"

        cartItems.innerHTML = cart
            .map(
                (item, index) => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${window.utils.formatINR(item.priceINR)}</div>
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button class="cart-quantity-btn" onclick="cartPageManager.updateQuantity(${index}, -1)">-</button>
                            <span class="cart-quantity-value">${item.quantity}</span>
                            <button class="cart-quantity-btn" onclick="cartPageManager.updateQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="cart-remove-btn" onclick="cartPageManager.removeItem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">${window.utils.formatINR(item.priceINR * item.quantity)}</div>
            </div>
        `,
            )
            .join("")

        this.updateSummary()
    }

    updateSummary() {
        const cart = window.cartManager ? window.cartManager.getCart() : []
        const subtotal = cart.reduce((total, item) => total + item.priceINR * item.quantity, 0)
        const tax = subtotal * 0.18
        const total = subtotal + tax

        document.getElementById("cartSubtotal").textContent = window.utils.formatINR(subtotal)
        document.getElementById("cartTax").textContent = window.utils.formatINR(tax)
        document.getElementById("cartTotal").textContent = window.utils.formatINR(total)
    }

    updateQuantity(index, change) {
        const cart = window.cartManager ? window.cartManager.getCart() : []
        const item = cart[index]

        if (item) {
            const newQuantity = item.quantity + change
            if (newQuantity >= 1 && newQuantity <= 10) {
                item.quantity = newQuantity
                if (window.cartManager) window.cartManager.saveCart(cart)
                window.utils.showNotification("Cart updated successfully", "success")
            }
        }
    }

    removeItem(index) {
        const cart = window.cartManager ? window.cartManager.getCart() : []
        const item = cart[index]
        if (item) {
            cart.splice(index, 1)
            if (window.cartManager) window.cartManager.saveCart(cart)
            window.utils.showNotification(`${item.title} removed from cart`, "info")
        }
    }
}

// Initialize cart page manager
document.addEventListener("DOMContentLoaded", () => {
    window.cartPageManager = new CartPageManager()
})
