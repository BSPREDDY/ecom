// Header Component Manager
class HeaderManager {
    constructor() {
        this.init()
    }

    init() {
        this.bindEvents()
        this.updateCartBadge()
        this.updateWishlistBadge()
        this.setActiveNav()
        this.setupRealTimeListeners()
        this.setupAuthUI() // Added auth UI initialization
    }

    setupRealTimeListeners() {
        // Listen for cart updates across all pages
        window.eventBus.on("cartUpdated", (e) => {
            this.updateCartBadge()
        })

        // Listen for wishlist updates across all pages
        window.eventBus.on("wishlistUpdated", (e) => {
            this.updateWishlistBadge()
        })
    }

    bindEvents() {
        // Mobile menu toggle
        const hamburgerMenu = document.getElementById("hamburgerMenu")
        const mobileNav = document.getElementById("mobileNav")

        if (hamburgerMenu && mobileNav) {
            const newHamburger = hamburgerMenu.cloneNode(true)
            hamburgerMenu.parentNode.replaceChild(newHamburger, hamburgerMenu)

            newHamburger.addEventListener("click", (e) => {
                e.stopPropagation()
                mobileNav.classList.toggle("active")
                newHamburger.innerHTML = mobileNav.classList.contains("active")
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>'
            })

            // Close mobile menu when clicking outside
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".header-content") && mobileNav.classList.contains("active")) {
                    mobileNav.classList.remove("active")
                    newHamburger.innerHTML = '<i class="fas fa-bars"></i>'
                }
            })
        }

        // Close mobile nav when clicking a link
        document.querySelectorAll(".mobile-nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (mobileNav) mobileNav.classList.remove("active")
                if (hamburgerMenu) hamburgerMenu.innerHTML = '<i class="fas fa-bars"></i>'
            })
        })

        // Search functionality
        const searchBtn = document.getElementById("searchBtn")
        const searchInput = document.getElementById("searchInput")

        if (searchBtn && searchInput) {
            searchBtn.addEventListener("click", () => this.handleSearch())
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.handleSearch()
            })
        }

        const cartIcon = document.getElementById("cartIcon")
        if (cartIcon) {
            cartIcon.onclick = null
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", (e) => {
                const href = anchor.getAttribute("href")
                if (href !== "#" && href.startsWith("#")) {
                    const targetElement = document.querySelector(href)
                    if (targetElement) {
                        e.preventDefault()
                        window.utils.scrollToElement(href.substring(1))
                    }
                }
            })
        })

        // Logout functionality
        const logoutBtn = document.getElementById("logoutBtn")
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault()
                if (window.authManager) window.authManager.logout()
            })
        }
    }

    handleSearch() {
        const searchInput = document.getElementById("searchInput")
        if (searchInput && searchInput.value.trim()) {
            window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`
        }
    }

    updateCartBadge() {
        const badge = document.getElementById("cartBadge")
        if (badge && window.cartManager) {
            const count = window.cartManager.getItemCount()
            badge.textContent = count
            badge.style.display = count > 0 ? "flex" : "inline-flex"
        }
    }

    updateWishlistBadge() {
        const badge = document.getElementById("wishlistBadge")
        if (badge && window.wishlistManager) {
            const count = window.wishlistManager.getItemCount()
            badge.textContent = count
            badge.style.display = count > 0 ? "flex" : "none"
        }
    }

    setActiveNav() {
        const currentPage = window.location.pathname.split("/").pop() || "index.html"
        document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
            const href = link.getAttribute("href")
            if (href === currentPage || (currentPage === "" && href === "index.html")) {
                link.classList.add("active")
            } else {
                link.classList.remove("active")
            }
        })
    }

    setupAuthUI() {
        const userAccountDropdown = document.getElementById("userAccountDropdown")
        const userIconBtn = document.getElementById("userIconBtn")
        const userDropdown = document.getElementById("userDropdown")

        if (userIconBtn && userDropdown) {
            userIconBtn.addEventListener("click", (e) => {
                e.preventDefault()
                userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block"
            })

            document.addEventListener("click", (e) => {
                if (!e.target.closest(".user-account")) {
                    userDropdown.style.display = "none"
                }
            })
        }
    }
}

// Header Component HTML
function getHeaderHTML() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html"
    const isLoggedIn = window.authManager && window.authManager.isLoggedIn()
    const userEmail = isLoggedIn ? window.authManager.getCurrentUser().email : ""

    return `
    <div class="container">
        <div class="header-content">
            <div class="logo">
                <a href="index.html">
                    <i class="fas fa-crown"></i>
                    <span class="logo-text">Style<span class="logo-highlight">Shop</span></span>
                </a>
            </div>

            <nav class="desktop-nav">
                <ul class="nav-list">
                    <li><a href="index.html" class="nav-link ${currentPage === "index.html" ? "active" : ""}">Home</a></li>
                    <li><a href="index.html#products" class="nav-link">Products</a></li>
                    <li><a href="categories.html" class="nav-link ${currentPage === "categories.html" ? "active" : ""}">Categories</a></li>
                    <li><a href="sale.html" class="nav-link ${currentPage === "sale.html" ? "active" : ""}">Sale</a></li>
                    <li><a href="about.html" class="nav-link ${currentPage === "about.html" ? "active" : ""}">About</a></li>
                    <li><a href="contact.html" class="nav-link ${currentPage === "contact.html" ? "active" : ""}">Contact</a></li>
                </ul>
            </nav>

            <div class="header-right">
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Search products..." id="searchInput">
                    <button class="search-btn" id="searchBtn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <div class="wishlist-container">
                    <a href="wishlist.html" class="cart-icon" id="wishlistIcon" title="Wishlist">
                        <i class="fas fa-heart"></i>
                        <span class="cart-badge" id="wishlistBadge" style="display: none;">0</span>
                    </a>
                </div>

                <div class="cart-container">
                    <a href="cart.html" class="cart-icon" id="cartIcon" title="Shopping Cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-badge" id="cartBadge">0</span>
                    </a>
                </div>

                <div class="user-account" id="userAccountDropdown">
                    <a href="#" class="user-icon" id="userIconBtn">
                        <i class="fas fa-user"></i>
                    </a>
                    <div class="user-dropdown" id="userDropdown" style="display: none;">
                        <div id="userLoggedIn" style="${isLoggedIn ? "display: block;" : "display: none;"}">
                            <div class="user-email" id="userEmail">${userEmail}</div>
                            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                        </div>
                        <div id="userLoggedOut" style="${!isLoggedIn ? "display: block;" : "display: none;"}">
                            <a href="login.html" class="auth-btn login-btn"><i class="fas fa-sign-in-alt"></i> Login</a>
                            <a href="signup.html" class="auth-btn signup-btn"><i class="fas fa-user-plus"></i> Sign Up</a>
                        </div>
                    </div>
                </div>

                <button class="hamburger-menu" id="hamburgerMenu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>

        <nav class="mobile-nav" id="mobileNav">
            <ul class="mobile-nav-list">
                <li><a href="index.html" class="mobile-nav-link ${currentPage === "index.html" ? "active" : ""}">Home</a></li>
                <li><a href="index.html#products" class="mobile-nav-link">Products</a></li>
                <li><a href="categories.html" class="mobile-nav-link ${currentPage === "categories.html" ? "active" : ""}">Categories</a></li>
                <li><a href="sale.html" class="mobile-nav-link ${currentPage === "sale.html" ? "active" : ""}">Sale</a></li>
                <li><a href="about.html" class="mobile-nav-link ${currentPage === "about.html" ? "active" : ""}">About</a></li>
                <li><a href="contact.html" class="mobile-nav-link ${currentPage === "contact.html" ? "active" : ""}">Contact</a></li>
            </ul>
        </nav>
    </div>
  `
}

// Footer Component HTML
function getFooterHTML() {
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <div class="footer-logo">
                            <i class="fas fa-crown"></i>
                            <span class="logo-text">Style<span class="logo-highlight">Shop</span></span>
                        </div>
                        <p class="footer-description">
                            Your premium destination for fashion and lifestyle products. 
                            Quality guaranteed, style delivered.
                        </p>
                        <div class="footer-social">
                            <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                        </div>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-title">Quick Links</h4>
                        <ul class="footer-links">
                            <li><a href="index.html">Home</a></li>
                            <li><a href="index.html#products">Products</a></li>
                            <li><a href="categories.html">Categories</a></li>
                            <li><a href="sale.html">Sale</a></li>
                            <li><a href="about.html">About Us</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-title">Customer Service</h4>
                        <ul class="footer-links">
                            <li><a href="#">My Account</a></li>
                            <li><a href="cart.html">Shopping Cart</a></li>
                            <li><a href="wishlist.html">Wishlist</a></li>
                            <li><a href="#">Track Order</a></li>
                            <li><a href="#">Returns & Exchanges</a></li>
                            <li><a href="#">Shipping Info</a></li>
                            <li><a href="#">FAQs</a></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-title">Contact Info</h4>
                        <ul class="footer-contact">
                            <li>
                                <i class="fas fa-map-marker-alt"></i>
                                <span>123 Fashion Street, Mumbai, India</span>
                            </li>
                            <li>
                                <i class="fas fa-phone"></i>
                                <span>+91 98765 43210</span>
                            </li>
                            <li>
                                <i class="fas fa-envelope"></i>
                                <span>support@styleshop.com</span>
                            </li>
                            <li>
                                <i class="fas fa-clock"></i>
                                <span>Mon - Sat: 10:00 AM - 8:00 PM</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; ${new Date().getFullYear()} StyleShop. All rights reserved.</p>
                    <div class="footer-payment">
                        <i class="fab fa-cc-visa"></i>
                        <i class="fab fa-cc-mastercard"></i>
                        <i class="fab fa-cc-paypal"></i>
                        <i class="fab fa-cc-amex"></i>
                    </div>
                </div>
            </div>
        </footer>
    `
}

// Initialize footer on page load
function initializeFooter() {
    const footerPlaceholder = document.getElementById("footerPlaceholder")
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = getFooterHTML()
    }
}

// Initialize header on page load
function initializeHeader() {
    const headerPlaceholder = document.getElementById("headerPlaceholder")
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = getHeaderHTML()
        // Re-initialize manager after injection
        if (window.headerManager) window.headerManager.init()
        else window.headerManager = new HeaderManager()
    }
}

// Initialize components on page load
document.addEventListener("DOMContentLoaded", () => {
    initializeHeader()
    initializeFooter()
})
