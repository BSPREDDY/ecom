// Authentication Manager Component
class AuthManager {
    constructor() {
        this.currentUser = null
        this.init()
    }

    init() {
        // Wait for Firebase to initialize
        setTimeout(() => {
            if (window.firebaseService && window.firebaseService.getAuth()) {
                this.setupAuthListener()
            }
        }, 500)
    }

    setupAuthListener() {
        const auth = window.firebaseService.getAuth()
        if (!auth) return

        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            this.currentUser = user
            this.updateUI()

            if (user) {
                console.log("[Auth] User logged in:", user.email)
                this.syncUserData()
            } else {
                console.log("[Auth] User logged out")
            }
        })
    }

    updateUI() {
        const userLoggedIn = document.getElementById("userLoggedIn")
        const userLoggedOut = document.getElementById("userLoggedOut")
        const userEmail = document.getElementById("userEmail")
        const logoutBtn = document.getElementById("logoutBtn")
        const userIconBtn = document.getElementById("userIconBtn")
        const userDropdown = document.getElementById("userDropdown")

        if (this.currentUser) {
            if (userLoggedIn) {
                userLoggedIn.style.display = "block"
                userEmail.textContent = this.currentUser.email
            }
            if (userLoggedOut) userLoggedOut.style.display = "none"
        } else {
            if (userLoggedIn) userLoggedIn.style.display = "none"
            if (userLoggedOut) userLoggedOut.style.display = "block"
        }

        // Setup dropdown toggle
        if (userIconBtn && userDropdown) {
            userIconBtn.onclick = (e) => {
                e.preventDefault()
                userDropdown.style.display = userDropdown.style.display === "none" ? "block" : "none"
            }

            // Close dropdown when clicking outside
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".user-account")) {
                    userDropdown.style.display = "none"
                }
            })
        }

        // Setup logout button
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault()
                this.logout()
            }
        }
    }

    async syncUserData() {
        if (!this.currentUser) return

        const db = window.firebaseService.getDb()
        if (!db) return

        const userId = this.currentUser.uid

        // Sync cart from Firebase
        try {
            const cartSnapshot = await db.ref(`carts/${userId}`).once("value")
            if (cartSnapshot.exists()) {
                const cartData = cartSnapshot.val()
                if (cartData.cart && Array.isArray(cartData.cart)) {
                    localStorage.setItem("cart", JSON.stringify(cartData.cart))
                    if (window.cartManager) window.cartManager.updateCartBadge()
                }
            }
        } catch (error) {
            console.error("[Auth] Error syncing cart:", error)
        }

        // Sync wishlist from Firebase
        try {
            const wishlistSnapshot = await db.ref(`wishlists/${userId}`).once("value")
            if (wishlistSnapshot.exists()) {
                const wishlistData = wishlistSnapshot.val()
                if (wishlistData.wishlist && Array.isArray(wishlistData.wishlist)) {
                    localStorage.setItem("wishlist", JSON.stringify(wishlistData.wishlist))
                    if (window.wishlistManager) window.wishlistManager.updateWishlistBadge()
                }
            }
        } catch (error) {
            console.error("[Auth] Error syncing wishlist:", error)
        }
    }

    async logout() {
        const auth = window.firebaseService.getAuth()
        if (!auth) return

        try {
            await auth.signOut()
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification("Logged out successfully", "success")
            }

            // Clear local storage
            localStorage.removeItem("cart")
            localStorage.removeItem("wishlist")

            // Update badges
            if (window.cartManager) window.cartManager.updateCartBadge()
            if (window.wishlistManager) window.wishlistManager.updateWishlistBadge()

            // Redirect to home
            if (window.location.pathname !== "/index.html" && window.location.pathname !== "/") {
                window.location.href = "index.html"
            }
        } catch (error) {
            console.error("[Auth] Logout error:", error)
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification("Error logging out", "error")
            }
        }
    }

    getCurrentUser() {
        return this.currentUser
    }

    isLoggedIn() {
        return this.currentUser !== null
    }

    checkAuthAndAction(action) {
        if (this.isLoggedIn()) {
            action()
        } else {
            this.showAuthNotification()
        }
    }

    showAuthNotification() {
        const overlay = document.createElement("div")
        overlay.className = "auth-notification-overlay"
        overlay.innerHTML = `
      <div class="auth-notification-card">
        <div class="auth-notification-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h3>Login Required</h3>
        <p>Please login to your account to continue or browse without logging in.</p>
        <div class="auth-notification-actions">
          <button class="btn btn-primary" id="notifLoginBtn">Login</button>
          <button class="btn btn-secondary" id="notifContinueBtn">Continue without Login</button>
        </div>
      </div>
    `
        document.body.appendChild(overlay)

        document.getElementById("notifLoginBtn").onclick = () => {
            window.location.href = "login.html"
        }

        document.getElementById("notifContinueBtn").onclick = () => {
            overlay.remove()
        }
    }
}

// Initialize auth manager and register globally
document.addEventListener("DOMContentLoaded", () => {
    window.authManager = new AuthManager()
})
