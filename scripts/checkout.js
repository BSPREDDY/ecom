// Checkout Page Manager
class CheckoutManager {
    constructor() {
        this.init()
    }

    init() {
        const cart = window.cartManager.getCart()

        if (cart.length === 0) {
            window.location.href = "cart.html"
            return
        }

        this.renderOrderSummary()
        this.bindEvents()
        window.cartManager.updateCartBadge()
    }

    bindEvents() {
        const form = document.getElementById("checkoutForm")
        if (form) {
            form.addEventListener("submit", (e) => this.handleSubmit(e))
        }

        // Phone number formatting
        const phoneInput = document.getElementById("phone")
        if (phoneInput) {
            phoneInput.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g, "")
                if (value.length > 10) value = value.slice(0, 10)
                e.target.value = value
            })
        }

        // PIN code validation
        const pincodeInput = document.getElementById("pincode")
        if (pincodeInput) {
            pincodeInput.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g, "")
                if (value.length > 6) value = value.slice(0, 6)
                e.target.value = value
            })
        }
    }

    renderOrderSummary() {
        const cart = window.cartManager.getCart()
        const orderItems = document.getElementById("orderItems")

        orderItems.innerHTML = cart
            .map(
                (item) => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="order-item-details">
                    <div class="order-item-title">${item.title}</div>
                    <div class="order-item-qty">Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-price">${window.utils.formatINR(item.priceINR * item.quantity)}</div>
            </div>
        `,
            )
            .join("")

        const subtotal = cart.reduce((total, item) => total + item.priceINR * item.quantity, 0)
        const tax = subtotal * 0.18
        const total = subtotal + tax

        document.getElementById("checkoutSubtotal").textContent = window.utils.formatINR(subtotal)
        document.getElementById("checkoutTax").textContent = window.utils.formatINR(tax)
        document.getElementById("checkoutTotal").textContent = window.utils.formatINR(total)
    }

    async handleSubmit(e) {
        e.preventDefault()

        const formData = {
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            fullName: document.getElementById("fullName").value,
            address: document.getElementById("address").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value,
            pincode: document.getElementById("pincode").value,
            country: document.getElementById("country").value,
            paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        }

        // Validate phone
        if (!window.utils.validatePhone(formData.phone)) {
            window.utils.showNotification("Please enter a valid 10-digit phone number", "error")
            return
        }

        // Validate email
        if (!window.utils.validateEmail(formData.email)) {
            window.utils.showNotification("Please enter a valid email address", "error")
            return
        }

        const submitBtn = e.target.querySelector('button[type="submit"]')
        window.utils.setLoadingState(submitBtn, true, "Processing...")

        // Simulate order processing
        setTimeout(() => {
            window.utils.setLoadingState(submitBtn, false)

            // Save order details to localStorage
            const order = {
                id: Date.now(),
                date: new Date().toISOString(),
                items: window.cartManager.getCart(),
                total: window.cartManager.getTotal(),
                customer: formData,
                status: "Confirmed",
            }

            const orders = JSON.parse(localStorage.getItem("orders") || "[]")
            orders.push(order)
            localStorage.setItem("orders", JSON.stringify(orders))

            // Clear cart
            window.cartManager.clearCart()

            window.utils.showNotification("Order placed successfully!", "success")

            // Redirect to success page after delay
            setTimeout(() => {
                window.location.href = "index.html"
            }, 2000)
        }, 2000)
    }
}

// Initialize checkout manager
document.addEventListener("DOMContentLoaded", () => {
    window.checkoutManager = new CheckoutManager()
})
