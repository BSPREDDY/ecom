// Currency conversion rate (1 USD = 83 INR approximately)
const USD_TO_INR = 83

// Convert USD to INR
function convertToINR(usdPrice) {
    if (typeof usdPrice !== "number") {
        const num = Number.parseFloat(usdPrice)
        if (isNaN(num)) return 0
        return Math.round(num * USD_TO_INR)
    }
    return Math.round(usdPrice * USD_TO_INR)
}

// Format price in INR
function formatINR(price) {
    if (typeof price !== "number") {
        const num = Number.parseFloat(price)
        if (isNaN(num)) return "₹0.00"
        price = num
    }
    return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

    let stars = ""
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>'
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>'
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>'

    return stars
}

// Notification System
function showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "times-circle" : "info-circle"}"></i>
            <span>${message}</span>
        </div>
    `

    document.body.appendChild(notification)

    // Trigger animation
    setTimeout(() => notification.classList.add("show"), 10)

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => notification.remove(), 300)
    }, 3000)
}

// Debounce function for search and filters
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString)
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("en-IN", options)
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

// Validate phone (Indian format)
function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/
    return re.test(phone.replace(/\s+/g, ""))
}

// Smooth scroll to element
function scrollToElement(elementId, offset = 80) {
    const element = document.getElementById(elementId)
    if (element) {
        const top = element.offsetTop - offset
        window.scrollTo({
            top: top,
            behavior: "smooth",
        })
    }
}

// Loading state management
function setLoadingState(element, isLoading, loadingText = "Loading...") {
    if (isLoading) {
        element.dataset.originalText = element.innerHTML
        element.disabled = true
        element.classList.add("loading")
        element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`
    } else {
        element.disabled = false
        element.classList.remove("loading")
        element.innerHTML = element.dataset.originalText || element.innerHTML
    }
}

window.utils = {
    convertToINR,
    formatINR,
    generateStarRating,
    showNotification,
    debounce,
    formatDate,
    validateEmail,
    validatePhone,
    scrollToElement,
    setLoadingState,
}

// Cart Management Utilities
class CartManager {
    constructor() {
        this.storageKey = "cart"
        this.listeners = []
        this.initializeCart()
    }

    initializeCart() {
        setTimeout(() => this.updateCartBadge(), 150)
    }

    getCart() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || []
    }

    saveCart(cart) {
        localStorage.setItem(this.storageKey, JSON.stringify(cart))
        this.notifyListeners()
        if (window.eventBus) {
            window.eventBus.emit("cartUpdated", { cart, count: this.getItemCount() })
        }
        this.updateCartBadge()
        this.syncWithFirebase(cart)
    }

    syncWithFirebase(cart) {
        if (window.firebaseService && window.firebaseService.getDb()) {
            const db = window.firebaseService.getDb()
            const auth = window.firebaseService.getAuth()
            if (auth && auth.currentUser) {
                const userId = auth.currentUser.uid
                db.ref(`carts/${userId}`)
                    .set({
                        cart: cart,
                        timestamp: new Date().toISOString(),
                    })
                    .catch((err) => console.error("[Firebase] Cart sync error:", err))
            }
        }
    }

    addItem(product, quantity = 1, variations = {}) {
        const cart = this.getCart()
        const existingIndex = cart.findIndex(
            (item) => item.id === product.id && JSON.stringify(item.variations) === JSON.stringify(variations),
        )

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                priceINR: product.priceINR || convertToINR(product.price),
                image: product.image,
                quantity: quantity,
                variations: variations,
                addedAt: new Date().toISOString(),
            })
        }

        this.saveCart(cart)
        return cart
    }

    removeItem(productId, variations = {}) {
        const cart = this.getCart()
        const filteredCart = cart.filter(
            (item) => !(item.id === productId && JSON.stringify(item.variations) === JSON.stringify(variations)),
        )
        this.saveCart(filteredCart)
        this.updateCartBadge()
        return filteredCart
    }

    updateQuantity(productId, quantity, variations = {}) {
        const cart = this.getCart()
        const item = cart.find(
            (item) => item.id === productId && JSON.stringify(item.variations) === JSON.stringify(variations),
        )

        if (item) {
            item.quantity = Math.max(1, Math.min(10, quantity))
            this.saveCart(cart)
            return cart
        }
        return cart
    }

    clearCart() {
        this.saveCart([])
        this.updateCartBadge()
    }

    getTotal() {
        const cart = this.getCart()
        return cart.reduce((total, item) => total + item.priceINR * item.quantity, 0)
    }

    getItemCount() {
        const cart = this.getCart()
        return cart.reduce((count, item) => count + item.quantity, 0)
    }

    updateCartBadge() {
        const badge = document.getElementById("cartBadge")
        if (badge) {
            const count = this.getItemCount()
            badge.textContent = count
            badge.style.display = count > 0 ? "flex" : "inline-flex"
        }
    }

    subscribe(listener) {
        this.listeners.push(listener)
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener())
    }
}

// Wishlist Management Utilities
class WishlistManager {
    constructor() {
        this.storageKey = "wishlist"
        this.listeners = []
        this.initializeWishlist()
    }

    initializeWishlist() {
        setTimeout(() => this.updateWishlistBadge(), 150)
    }

    getWishlist() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || []
    }

    saveWishlist(wishlist) {
        localStorage.setItem(this.storageKey, JSON.stringify(wishlist))
        this.notifyListeners()
        if (window.eventBus) {
            window.eventBus.emit("wishlistUpdated", { wishlist, count: this.getItemCount() })
        }
        this.updateWishlistBadge()
        this.syncWithFirebase(wishlist)
    }

    syncWithFirebase(wishlist) {
        if (window.firebaseService && window.firebaseService.getDb()) {
            const db = window.firebaseService.getDb()
            const auth = window.firebaseService.getAuth()
            if (auth && auth.currentUser) {
                const userId = auth.currentUser.uid
                db.ref(`wishlists/${userId}`)
                    .set({
                        wishlist: wishlist,
                        timestamp: new Date().toISOString(),
                    })
                    .catch((err) => console.error("[Firebase] Wishlist sync error:", err))
            }
        }
    }

    addItem(product) {
        const wishlist = this.getWishlist()
        const existingIndex = wishlist.findIndex((item) => item.id === product.id)

        if (existingIndex === -1) {
            wishlist.push({
                id: product.id,
                title: product.title,
                price: product.price,
                priceINR: product.priceINR || convertToINR(product.price),
                image: product.image,
                category: product.category,
                rating: product.rating,
                description: product.description,
                addedAt: new Date().toISOString(),
            })
            this.saveWishlist(wishlist)
            if (window.utils) {
                window.utils.showNotification("Added to wishlist!", "success")
            }
            return true
        } else {
            this.removeItem(product.id)
            return false
        }
    }

    removeItem(productId) {
        const wishlist = this.getWishlist()
        const filteredWishlist = wishlist.filter((item) => item.id !== productId)
        this.saveWishlist(filteredWishlist)
        this.updateWishlistBadge()
        if (window.utils) {
            window.utils.showNotification("Removed from wishlist", "success")
        }
        return filteredWishlist
    }

    isInWishlist(productId) {
        const wishlist = this.getWishlist()
        return wishlist.some((item) => item.id === productId)
    }

    clearWishlist() {
        this.saveWishlist([])
        this.updateWishlistBadge()
    }

    getItemCount() {
        const wishlist = this.getWishlist()
        return wishlist.length
    }

    updateWishlistBadge() {
        const badge = document.getElementById("wishlistBadge")
        if (badge) {
            const count = this.getItemCount()
            badge.textContent = count
            badge.style.display = count > 0 ? "flex" : "none"
        }
    }

    subscribe(listener) {
        this.listeners.push(listener)
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener())
    }
}

window.cartManager = new CartManager()
window.wishlistManager = new WishlistManager()

// Real-time event system for cart and wishlist updates
class EventBus {
    constructor() {
        this.events = {}
    }

    emit(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data })
        window.dispatchEvent(event)
    }

    on(eventName, callback) {
        window.addEventListener(eventName, callback)
    }

    off(eventName, callback) {
        window.removeEventListener(eventName, callback)
    }
}

window.eventBus = new EventBus()

// Helper to get current user state
function checkAuthState(callback) {
    const auth = window.firebaseService && window.firebaseService.getAuth ? window.firebaseService.getAuth() : null
    if (!auth) return

    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("[v0] User is signed in:", user.uid)
            if (callback) callback(user)
        } else {
            console.log("[v0] User is signed out")
            if (callback) callback(null)
        }
        updateAuthUI(user)
    })
}

function updateAuthUI(user) {
    const authLinks = document.querySelectorAll(".auth-link")
    const userProfile = document.getElementById("userProfile")

    if (user) {
        // Show profile, hide login/signup links
        if (userProfile) userProfile.style.display = "flex"
        authLinks.forEach((link) => (link.style.display = "none"))
    } else {
        // Show login/signup, hide profile
        if (userProfile) userProfile.style.display = "none"
        authLinks.forEach((link) => (link.style.display = "flex"))
    }
}

function logout() {
    const auth = window.firebaseService && window.firebaseService.getAuth ? window.firebaseService.getAuth() : null
    if (auth) {
        auth.signOut().then(() => {
            localStorage.removeItem("user")
            window.location.href = "login.html"
        })
    }
}

window.authUtils = { checkAuthState, logout }

console.log("[v0] Utils initialized:", {
    utils: !!window.utils,
    cartManager: !!window.cartManager,
    wishlistManager: !!window.wishlistManager,
    eventBus: !!window.eventBus,
})
