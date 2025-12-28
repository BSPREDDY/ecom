// Categories Page Manager
class CategoriesManager {
    constructor() {
        this.categories = []
        this.products = []
        this.activeCategory = "all"
        this.apiBaseUrl = "https://dummyjson.com/products?limit=1000"
        this.searchQuery = ""

        this.init()
    }

    async init() {
        this.bindEvents()
        await this.loadAllData()
        if (window.cartManager) window.cartManager.updateCartBadge()
        if (window.wishlistManager) window.wishlistManager.updateWishlistBadge()
        this.setupRealTimeListeners()
        if (window.authManager) window.authManager.updateUI()
    }

    setupRealTimeListeners() {
        // Update wishlist buttons when wishlist changes
        window.eventBus.on("wishlistUpdated", () => {
            this.updateWishlistButtons()
        })
    }

    updateWishlistButtons() {
        // Update all wishlist button states
        document.querySelectorAll(".btn-wishlist").forEach((btn) => {
            const onclick = btn.getAttribute("onclick")
            if (onclick) {
                const match = onclick.match(/toggleWishlist$$(\d+)$$/)
                if (match) {
                    const productId = Number.parseInt(match[1])
                    const isInWishlist = window.wishlistManager.isInWishlist(productId)
                    if (isInWishlist) {
                        btn.classList.add("active")
                        btn.innerHTML = '<i class="fas fa-heart"></i>'
                        btn.title = "Remove from Wishlist"
                    } else {
                        btn.classList.remove("active")
                        btn.innerHTML = '<i class="far fa-heart"></i>'
                        btn.title = "Add to Wishlist"
                    }
                }
            }
        })
    }

    bindEvents() {
        // Category tabs
        // Removed Category tabs event listeners as they were removed from HTML

        const searchBtn = document.getElementById("searchBtn")
        const searchInput = document.getElementById("searchInput")

        if (searchBtn && searchInput) {
            searchBtn.addEventListener("click", () => this.performSearch())

            const debounceFn = window.utils && window.utils.debounce ? window.utils.debounce : (fn) => fn

            searchInput.addEventListener(
                "input",
                debounceFn(() => {
                    this.performSearch()
                }, 500),
            )
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.performSearch()
            })
        }

        // Retry button
        const retryButton = document.getElementById("retryButton")
        if (retryButton) {
            retryButton.addEventListener("click", () => this.loadAllData())
        }
    }

    performSearch() {
        const searchInput = document.getElementById("searchInput")
        if (searchInput) {
            this.searchQuery = searchInput.value.toLowerCase().trim()
            if (this.searchQuery) {
                this.renderSearchResults()
            } else {
                this.renderCategories()
            }
            this.loadFeaturedProducts()
        }
    }

    async loadAllData() {
        try {
            this.showLoading()
            this.hideError()

            const response = await fetch(this.apiBaseUrl)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            const convertPrice =
                window.utils && window.utils.convertToINR ? window.utils.convertToINR : (price) => Math.round(price * 83)

            this.products = data.products.map((product) => ({
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                priceINR: convertPrice(product.price),
                originalPriceINR: convertPrice(Math.round(product.price * 1.2 * 100) / 100),
                image: product.thumbnail || product.images[0],
                category: product.category,
                rating: {
                    rate: product.rating || Math.random() * 2 + 3,
                    count: Math.floor(Math.random() * 1000) + 100,
                },
            }))

            this.processCategories(this.products)
            this.renderCategories()
            this.loadFeaturedProducts()
        } catch (error) {
            console.error("Error loading data:", error)
            this.showError()
        } finally {
            this.hideLoading()
        }
    }

    processCategories(products) {
        const categoriesMap = new Map()

        products.forEach((product) => {
            if (!categoriesMap.has(product.category)) {
                categoriesMap.set(product.category, {
                    name: product.category,
                    products: [],
                    count: 0,
                    image: product.image,
                    description: "",
                    rating: 0,
                })
            }

            const category = categoriesMap.get(product.category)
            category.products.push(product)
            category.count++
            category.rating = Math.max(category.rating, product.rating?.rate || 0)
        })

        this.categories = Array.from(categoriesMap.values()).map((category) => ({
            ...category,
            description: `Browse our collection of ${category.name}.`,
            displayName: this.formatCategoryName(category.name),
        }))
    }

    formatCategoryName(category) {
        return category
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    setActiveCategory(category) {
        this.activeCategory = category

        document.querySelectorAll(".category-tab").forEach((tab) => {
            tab.classList.remove("active")
            if (tab.getAttribute("data-category") === category) {
                tab.classList.add("active")
            }
        })

        document.querySelectorAll(".category-card").forEach((card) => {
            card.classList.remove("active")
            if (category === "all" || card.getAttribute("data-category") === category) {
                card.classList.add("active")
            }
        })

        this.loadFeaturedProducts()
    }

    renderCategories() {
        const categoriesGrid = document.getElementById("categoriesGrid")
        if (!categoriesGrid) return

        categoriesGrid.innerHTML = this.categories
            .map(
                (category) => `
            <div class="category-card ${this.activeCategory === "all" || this.activeCategory === category.name ? "active" : ""}" 
                 data-category="${category.name}">
                <div class="category-image">
                    <img src="${category.image}" alt="${category.displayName}" loading="lazy">
                    <div class="category-overlay">
                        <h3 class="category-title">${category.displayName}</h3>
                    </div>
                </div>
                <div class="category-info">
                    <p class="category-description">${category.description}</p>
                    <div class="category-stats">
                        <span class="product-count">${category.count} Products</span>
                        <div class="category-rating">
                            <i class="fas fa-star"></i>
                            <span>${category.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <!-- Updated button icon and text for consistency -->
                    <button class="btn-view-category" onclick="categoriesManager.viewCategory('${category.name}')">
                        <i class="fas fa-arrow-right"></i> Shop ${category.displayName}
                    </button>
                </div>
            </div>
        `,
            )
            .join("")

        document.querySelectorAll(".category-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                if (!e.target.closest(".btn-view-category")) {
                    const category = card.getAttribute("data-category")
                    this.setActiveCategory(category)
                }
            })
        })
    }

    renderSearchResults() {
        const categoriesGrid = document.getElementById("categoriesGrid")
        if (!categoriesGrid) return

        const filteredCategories = this.categories.filter(
            (cat) =>
                cat.displayName.toLowerCase().includes(this.searchQuery) ||
                cat.description.toLowerCase().includes(this.searchQuery),
        )

        if (filteredCategories.length === 0) {
            categoriesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 60px; color: #e0e0e0; margin-bottom: 20px;"></i>
                    <h3>No categories found</h3>
                    <p>No categories match your search for "${this.searchQuery}". Try different keywords.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('searchInput').value=''; categoriesManager.searchQuery=''; categoriesManager.renderCategories(); categoriesManager.loadFeaturedProducts();">
                        View All Categories
                    </button>
                </div>
            `
        } else {
            this.renderCategories()
        }
    }

    viewCategory(categoryName) {
        this.setActiveCategory(categoryName)
        document.getElementById("featuredProducts")?.scrollIntoView({ behavior: "smooth" })
    }

    async loadFeaturedProducts() {
        try {
            const productsGrid = document.getElementById("productsGrid")
            const productsLoading = document.getElementById("productsLoading")
            const featuredTitle = document.getElementById("featuredTitle")
            const featuredSubtitle = document.getElementById("featuredSubtitle")

            if (productsLoading) productsLoading.style.display = "block"
            if (productsGrid) productsGrid.style.display = "none"

            let filteredProducts = []

            let searchFiltered = this.products
            if (this.searchQuery) {
                searchFiltered = this.products.filter(
                    (product) =>
                        product.title.toLowerCase().includes(this.searchQuery) ||
                        product.description.toLowerCase().includes(this.searchQuery) ||
                        product.category.toLowerCase().includes(this.searchQuery),
                )
            }

            if (this.activeCategory === "all") {
                filteredProducts = searchFiltered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)).slice(0, 12)

                if (featuredTitle) featuredTitle.textContent = this.searchQuery ? `Search Results` : "Top Rated Products"
                if (featuredSubtitle)
                    featuredSubtitle.textContent = this.searchQuery
                        ? `Products matching "${this.searchQuery}"`
                        : "Our highest rated products across all categories"
            } else {
                filteredProducts = searchFiltered.filter((product) => product.category === this.activeCategory).slice(0, 12)

                const categoryName = this.formatCategoryName(this.activeCategory)
                if (featuredTitle) featuredTitle.textContent = `Featured ${categoryName}`
                if (featuredSubtitle) featuredSubtitle.textContent = `Top products in ${categoryName}`
            }

            const formatPrice =
                window.utils && window.utils.formatINR ? window.utils.formatINR : (price) => `₹${price.toFixed(2)}`
            const generateStars =
                window.utils && window.utils.generateStarRating
                    ? window.utils.generateStarRating
                    : (rating) => {
                        return `<i class="fas fa-star"></i>`.repeat(Math.floor(rating))
                    }

            if (productsGrid) {
                productsGrid.innerHTML = filteredProducts
                    .map(
                        (product) => `
                    <div class="product-card" style="cursor: pointer;" onclick="window.location.href='product.html?id=${product.id}'">
                        <div class="product-image-container">
                            <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
                        </div>
                        <div class="product-details">
                            <div class="product-category">
                                <i class="fas fa-tag"></i> ${product.category}
                            </div>
                            <h3 class="product-title">${product.title}</h3>
                            <p class="product-description">${product.description.substring(0, 80)}...</p>
                            <div class="product-price-container">
                                <div>
                                    <span class="product-price">${formatPrice(product.priceINR)}</span>
                                    ${product.priceINR < product.originalPriceINR ? `<span class="product-original-price">${formatPrice(product.originalPriceINR)}</span>` : ""}
                                </div>
                                <div class="product-rating">
                                    <span class="rating-stars">
                                        ${generateStars(product.rating?.rate || 0)}
                                    </span>
                                    <span class="rating-count">(${product.rating?.count || 0})</span>
                                </div>
                            </div>
                            <div class="product-actions">
                                <button class="btn-add-to-cart" onclick="event.stopPropagation(); categoriesManager.addToCart(${product.id})" title="Add to Cart">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                                <button class="btn-wishlist ${window.wishlistManager && window.wishlistManager.isInWishlist(product.id) ? "active" : ""}" 
                                        onclick="event.stopPropagation(); categoriesManager.toggleWishlist(${product.id})" 
                                        title="${window.wishlistManager && window.wishlistManager.isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}">
                                    <i class="${window.wishlistManager && window.wishlistManager.isInWishlist(product.id) ? "fas" : "far"} fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `,
                    )
                    .join("")
            }
        } catch (error) {
            console.error("Error loading featured products:", error)
            const productsGrid = document.getElementById("productsGrid")
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-state" style="grid-column: 1/-1; text-align: center;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Unable to load products</h3>
                        <p>Please try again later.</p>
                    </div>
                `
            }
        } finally {
            const productsGrid = document.getElementById("productsGrid")
            const productsLoading = document.getElementById("productsLoading")
            if (productsGrid) productsGrid.style.display = "grid"
            if (productsLoading) productsLoading.style.display = "none"
        }
    }

    addToCart(productId) {
        const product = this.products.find((p) => p.id === productId)
        if (!product) return

        if (window.cartManager) {
            window.cartManager.addItem(product, 1, {})
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification(`${product.title} added to cart!`, "success")
            }
        }
    }

    toggleWishlist(productId) {
        const product = this.products.find((p) => p.id === productId)
        if (!product) return

        if (window.wishlistManager) {
            window.wishlistManager.addItem(product)
            // Update buttons immediately
            this.updateWishlistButtons()
        }
    }

    showLoading() {
        const loadingState = document.getElementById("loadingCategories")
        if (loadingState) loadingState.style.display = "flex"

        const categoriesGrid = document.getElementById("categoriesGrid")
        if (categoriesGrid) categoriesGrid.style.display = "none"
    }

    hideLoading() {
        const loadingState = document.getElementById("loadingCategories")
        if (loadingState) loadingState.style.display = "none"

        const categoriesGrid = document.getElementById("categoriesGrid")
        if (categoriesGrid) categoriesGrid.style.display = "grid"
    }

    showError() {
        const errorState = document.getElementById("errorState")
        if (errorState) errorState.style.display = "flex"
    }

    hideError() {
        const errorState = document.getElementById("errorState")
        if (errorState) errorState.style.display = "none"
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.categoriesManager = new CategoriesManager()
})
