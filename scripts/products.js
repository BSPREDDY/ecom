class ProductManager {
    constructor() {
        this.products = []
        this.filteredProducts = []
        this.currentCategory = "all"
        this.currentSort = "featured"
        this.totalProducts = 0
        this.isLoading = false
        this.apiBaseUrl = "https://dummyjson.com/products?limit=1000"
        this.searchQuery = ""

        this.init()
    }

    async init() {
        this.bindEvents()
        await this.fetchProducts()
        this.checkUrlParams()
        this.setupRealTimeListeners()
    }

    setupRealTimeListeners() {
        window.addEventListener("wishlistUpdated", () => {
            this.updateWishlistButtons()
        })
    }

    updateWishlistButtons() {
        document.querySelectorAll(".btn-wishlist").forEach((btn) => {
            const onclick = btn.getAttribute("onclick")
            if (onclick) {
                const match = onclick.match(/toggleWishlist$$(\d+)$$/)
                if (match) {
                    const productId = Number.parseInt(match[1])
                    const isInWishlist = window.wishlistManager && window.wishlistManager.isInWishlist(productId)
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

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search)
        const searchParam = urlParams.get("search")
        if (searchParam) {
            this.searchQuery = searchParam
            const searchInput = document.getElementById("searchInput")
            if (searchInput) searchInput.value = searchParam
            this.performSearch()
        }
    }

    bindEvents() {
        const categoryFilter = document.getElementById("categoryFilter")
        const sortFilter = document.getElementById("sortFilter")
        const retryButton = document.getElementById("retryButton")
        const searchBtn = document.getElementById("searchBtn")
        const searchInput = document.getElementById("searchInput")

        if (categoryFilter) {
            categoryFilter.addEventListener("change", (e) => {
                this.currentCategory = e.target.value
                this.filterProducts()
                this.renderProducts()
            })
        }

        if (sortFilter) {
            sortFilter.addEventListener("change", (e) => {
                this.currentSort = e.target.value
                this.sortProducts()
                this.renderProducts()
            })
        }

        if (retryButton) {
            retryButton.addEventListener("click", () => this.fetchProducts())
        }

        if (searchBtn && searchInput) {
            searchBtn.addEventListener("click", () => this.performSearch())

            const debounce = (func, delay) => {
                let timeout
                return (...args) => {
                    clearTimeout(timeout)
                    timeout = setTimeout(() => func.apply(this, args), delay)
                }
            }

            const handleSearch = debounce(() => {
                this.performSearch()
            }, 300)

            searchInput.addEventListener("input", handleSearch)

            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.performSearch()
            })
        }
    }

    performSearch() {
        const searchInput = document.getElementById("searchInput")
        if (searchInput) {
            this.searchQuery = searchInput.value.toLowerCase().trim()
            this.filterProducts()
            this.renderProducts()
        }
    }

    async fetchProducts() {
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
                id: product.id || Math.random(),
                title: product.title || "Untitled Product",
                description: product.description || "No description available",
                price: product.price || 0,
                priceINR: convertPrice(product.price || 0),
                originalPriceINR: convertPrice(Math.round((product.price || 0) * 1.2 * 100) / 100),
                image: product.thumbnail || (product.images && product.images[0]) || "/placeholder.svg",
                category:
                    product.category === "smartphones" || product.category === "laptops"
                        ? "electronics"
                        : product.category === "womens-jewellery"
                            ? "jewelery"
                            : product.category === "mens-shirts" || product.category === "mens-shoes"
                                ? "men's clothing"
                                : product.category === "womens-dresses" || product.category === "womens-shoes"
                                    ? "women's clothing"
                                    : product.category || "uncategorized",
                rating: {
                    rate: product.rating || Math.random() * 2 + 3,
                    count: Math.floor(Math.random() * 1000) + 100,
                },
                featured: Math.random() > 0.7,
                sale: (product.discountPercentage || 0) > 10,
                new: Math.random() > 0.9,
            }))

            this.totalProducts = this.products.length
            this.filterProducts()
            this.renderProducts()
            this.updateProductsCount()
        } catch (error) {
            console.error("Error fetching products:", error)
            this.showError()
        } finally {
            this.hideLoading()
        }
    }

    filterProducts() {
        let filtered = [...this.products]

        if (this.searchQuery) {
            filtered = filtered.filter(
                (product) =>
                    (product.title && product.title.toLowerCase().includes(this.searchQuery)) ||
                    (product.description && product.description.toLowerCase().includes(this.searchQuery)) ||
                    (product.category && product.category.toLowerCase().includes(this.searchQuery)),
            )
        }

        if (this.currentCategory !== "all") {
            filtered = filtered.filter((product) => product.category === this.currentCategory)
        }

        this.filteredProducts = filtered
        this.sortProducts()
    }

    sortProducts() {
        switch (this.currentSort) {
            case "price-low":
                this.filteredProducts.sort((a, b) => a.priceINR - b.priceINR)
                break
            case "price-high":
                this.filteredProducts.sort((a, b) => b.priceINR - a.priceINR)
                break
            case "name-asc":
                this.filteredProducts.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
                break
            case "name-desc":
                this.filteredProducts.sort((a, b) => (b.title || "").localeCompare(a.title || ""))
                break
            case "featured":
            default:
                this.filteredProducts.sort((a, b) => {
                    if (a.featured && !b.featured) return -1
                    if (!a.featured && b.featured) return 1
                    if (a.sale && !b.sale) return -1
                    if (!a.sale && b.sale) return 1
                    return (b.rating.rate || 0) - (a.rating.rate || 0)
                })
                break
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById("productsGrid")

        if (!productsGrid) return

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 60px; color: #e0e0e0; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">No products found</h3>
                    <p>${this.searchQuery ? `No results for "${this.searchQuery}".` : ""} Try changing your filters or check back later for new arrivals.</p>
                </div>
            `
            return
        }

        const formatPrice =
            window.utils && window.utils.formatINR ? window.utils.formatINR : (price) => `₹${price.toFixed(2)}`
        const generateStars =
            window.utils && window.utils.generateStarRating
                ? window.utils.generateStarRating
                : (rating) => {
                    return `<i class="fas fa-star"></i>`.repeat(Math.floor(rating))
                }

        productsGrid.innerHTML = this.filteredProducts
            .map(
                (product, index) => `
            <div class="product-card ${product.featured ? "featured" : ""} ${product.sale ? "sale" : ""} ${product.new ? "new" : ""}"
                 style="animation-delay: ${(index % 12) * 0.05}s;"
                 onclick="window.location.href='product.html?id=${product.id}'">
                <div class="product-image-container">
                    <img 
                        src="${product.image}" 
                        alt="${product.title}" 
                        class="product-image"
                        loading="lazy"
                    >
                </div>
                <div class="product-details">
                    <div class="product-category">
                        <i class="fas fa-tag"></i> ${product.category}
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${(product.description || "").substring(0, 80)}...</p>
                    <div class="product-price-container">
                        <div>
                            <span class="product-price">${formatPrice(product.priceINR)}</span>
                            ${product.priceINR < product.originalPriceINR
                        ? `<span class="product-original-price">${formatPrice(product.originalPriceINR)}</span>`
                        : ""
                    }
                        </div>
                        <div class="product-rating">
                            <span class="rating-stars">
                                ${generateStars(product.rating?.rate || 0)}
                            </span>
                            <span class="rating-count">(${product.rating?.count || 0})</span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="event.stopPropagation(); window.productManager.addToCart(${product.id})" title="Add to Cart">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-wishlist ${window.wishlistManager && window.wishlistManager.isInWishlist(product.id) ? "active" : ""}" 
                                onclick="event.stopPropagation(); window.productManager.toggleWishlist(${product.id})" 
                                title="${window.wishlistManager && window.wishlistManager.isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}">
                            <i class="${window.wishlistManager && window.wishlistManager.isInWishlist(product.id) ? "fas" : "far"} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,
            )
            .join("")

        productsGrid.style.display = "grid"
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
            this.updateWishlistButtons()
        }
    }

    updateProductsCount() {
        const productsCount = document.getElementById("productsCount")
        if (productsCount) {
            const total = this.filteredProducts.length
            productsCount.textContent = `Showing ${total} products${this.searchQuery ? ` for "${this.searchQuery}"` : ""}`
        }
    }

    showLoading() {
        const loadingState = document.getElementById("loadingState")
        if (loadingState) loadingState.style.display = "block"

        const productsGrid = document.getElementById("productsGrid")
        if (productsGrid) productsGrid.style.display = "none"
    }

    hideLoading() {
        const loadingState = document.getElementById("loadingState")
        if (loadingState) loadingState.style.display = "none"
    }

    showError() {
        const errorState = document.getElementById("errorState")
        if (errorState) errorState.style.display = "block"
    }

    hideError() {
        const errorState = document.getElementById("errorState")
        if (errorState) errorState.style.display = "none"
    }

    buyNow(productId) {
        this.addToCart(productId)
        window.location.href = "cart.html"
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.productManager = new ProductManager()
})
