// Sale Page Manager
class SaleManager {
    constructor() {
        this.saleProducts = []
        this.filteredProducts = []
        this.currentFilter = "all"
        this.currentPage = 1
        this.productsPerPage = 8
        this.totalSaleProducts = 0
        this.isLoading = false
        this.apiBaseUrl = "https://dummyjson.com/products?limit=1000"
        this.cart = JSON.parse(localStorage.getItem("cart")) || []

        // Sale end date (3 days from now)
        this.saleEndDate = new Date()
        this.saleEndDate.setDate(this.saleEndDate.getDate() + 3)

        // Flash sale end date (12 hours from now)
        this.flashSaleEndDate = new Date()
        this.flashSaleEndDate.setHours(this.flashSaleEndDate.getHours() + 12)

        this.init()
    }

    async init() {
        this.bindEvents()
        await this.loadSaleProducts()

        if (window.cartManager) {
            window.cartManager.updateCartBadge()
        } else {
            this.updateCartBadge()
        }

        this.updateSaleStats()
        this.startTimers()
        // this.loadSaleCategories() // Removed
        this.setupDealOfTheDay()
    }

    bindEvents() {
        // Sale filter buttons
        const saleFilters = document.querySelectorAll(".sale-filter-btn")
        saleFilters.forEach((btn) => {
            btn.addEventListener("click", () => {
                const discount = btn.getAttribute("data-discount")
                this.setActiveFilter(discount)
            })
        })

        // Search functionality
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
            retryButton.addEventListener("click", () => this.loadSaleProducts())
        }

        // Cart functionality
        const cartIcon = document.getElementById("cartIcon")
        const cartClose = document.getElementById("cartClose")
        const cartOverlay = document.getElementById("cartOverlay")
        const checkoutBtn = document.getElementById("checkoutBtn")
        const startShoppingBtn = document.getElementById("startShoppingBtn")
        const applyCouponBtn = document.getElementById("applyCouponBtn")
        const buyDealBtn = document.getElementById("buyDealBtn")

        if (cartIcon) {
            cartIcon.addEventListener("click", (e) => {
                e.preventDefault()
                this.showCart()
            })
        }

        if (cartClose) cartClose.addEventListener("click", () => this.hideCart())
        if (cartOverlay) cartOverlay.addEventListener("click", () => this.hideCart())

        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                if (this.cart.length === 0) {
                    alert("Your cart is empty!")
                    return
                }
                alert(`Proceeding to checkout with total: ₹${this.calculateTotal().toFixed(2)}`)
            })
        }

        if (startShoppingBtn) {
            startShoppingBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.hideCart()
                document.getElementById("flash-sale").scrollIntoView({ behavior: "smooth" })
            })
        }

        if (applyCouponBtn) {
            applyCouponBtn.addEventListener("click", () => {
                const couponCode = "MEGASALE15"
                navigator.clipboard.writeText(couponCode).then(() => {
                    this.showNotification(`Coupon code "${couponCode}" copied to clipboard!`)
                })
            })
        }

        if (buyDealBtn) {
            buyDealBtn.addEventListener("click", () => {
                // Simulate buying the deal of the day
                const dealProduct = this.getDealOfTheDay()
                if (dealProduct) {
                    this.addToCart(dealProduct.id)
                    this.showNotification(`Added ${dealProduct.title} to cart!`)
                }
            })
        }

        // Close with Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.hideCart()
            }
        })
    }

    async loadSaleProducts() {
        try {
            this.showLoading()
            this.hideError()

            // Fetch products from API
            const response = await fetch(this.apiBaseUrl)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            let products = []

            if (Array.isArray(data)) {
                // Direct array from fakestoreapi
                products = data
            } else if (data.products && Array.isArray(data.products)) {
                // Object with products array from dummyjson
                products = data.products
            } else {
                console.error("[v0] Unexpected API response format:", data)
                throw new Error("Invalid products data format received from API")
            }

            if (products.length === 0) {
                throw new Error("No products received from API")
            }

            // Convert products to sale products with discounts
            this.saleProducts = products.map((product) => {
                // Random discount between 20% and 70%
                const discount = Math.floor(Math.random() * 50) + 20
                const originalPrice = product.price * (1 + discount / 100)
                const salePrice = product.price

                // INR conversion
                const salePriceINR =
                    window.utils && window.utils.convertToINR ? window.utils.convertToINR(salePrice) : Math.round(salePrice * 83)
                const originalPriceINR =
                    window.utils && window.utils.convertToINR
                        ? window.utils.convertToINR(originalPrice)
                        : Math.round(originalPrice * 83)

                // Determine if it's clearance (over 60% off)
                const isClearance = discount >= 60

                // Calculate items sold (random)
                const totalStock = Math.floor(Math.random() * 100) + 50
                const itemsSold = Math.floor(totalStock * (Math.random() * 0.7 + 0.1))
                const itemsLeft = totalStock - itemsSold
                const soldPercentage = (itemsSold / totalStock) * 100

                return {
                    ...product,
                    originalPrice: Number.parseFloat(originalPrice.toFixed(2)),
                    salePrice: Number.parseFloat(salePrice.toFixed(2)),
                    originalPriceINR: originalPriceINR,
                    salePriceINR: salePriceINR,
                    discount: discount,
                    isClearance: isClearance,
                    totalStock: totalStock,
                    itemsSold: itemsSold,
                    itemsLeft: itemsLeft,
                    soldPercentage: soldPercentage,
                    isFlashSale: Math.random() > 0.7, // 30% chance to be flash sale
                    isFeatured: Math.random() > 0.8, // 20% chance to be featured
                    rating: {
                        rate: product.rating?.rate || Math.random() * 2 + 3,
                        count: product.rating?.count || Math.floor(Math.random() * 1000) + 100,
                    },
                }
            })

            this.totalSaleProducts = this.saleProducts.length
            this.filterProducts()
            this.renderSaleProducts()
            this.updateProductsCount()
            this.updateFilterCounts()
        } catch (error) {
            console.error("Error loading sale products:", error)
            this.showError()
        } finally {
            this.hideLoading()
        }
    }

    useFallbackSaleProducts() {
        // Fallback sale products
        this.saleProducts = [
            {
                id: 1,
                title: "Premium Wireless Headphones",
                price: 89.99,
                originalPrice: 199.99,
                discount: 55,
                description: "Noise-cancelling headphones with premium sound quality.",
                category: "electronics",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
                isClearance: true,
                totalStock: 100,
                itemsSold: 75,
                itemsLeft: 25,
                soldPercentage: 75,
                isFlashSale: true,
                isFeatured: true,
                rating: { rate: 4.7, count: 342 },
                originalPriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(199.99) : 16600,
                salePriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(89.99) : 7469,
            },
            {
                id: 2,
                title: "Designer Handbag",
                price: 129.99,
                originalPrice: 299.99,
                discount: 57,
                description: "Luxury leather handbag with multiple compartments.",
                category: "women's clothing",
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
                isClearance: false,
                totalStock: 150,
                itemsSold: 120,
                itemsLeft: 30,
                soldPercentage: 80,
                isFlashSale: false,
                isFeatured: true,
                rating: { rate: 4.8, count: 189 },
                originalPriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(299.99) : 24900,
                salePriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(129.99) : 10789,
            },
            {
                id: 3,
                title: "Men's Casual Shoes",
                price: 49.99,
                originalPrice: 99.99,
                discount: 50,
                description: "Comfortable and stylish casual shoes for everyday wear.",
                category: "men's clothing",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
                isClearance: true,
                totalStock: 200,
                itemsSold: 180,
                itemsLeft: 20,
                soldPercentage: 90,
                isFlashSale: true,
                isFeatured: false,
                rating: { rate: 4.5, count: 256 },
                originalPriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(99.99) : 8300,
                salePriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(49.99) : 4149,
            },
            {
                id: 4,
                title: "Smart Watch Pro",
                price: 199.99,
                originalPrice: 399.99,
                discount: 50,
                description: "Advanced smartwatch with health monitoring features.",
                category: "electronics",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
                isClearance: false,
                totalStock: 80,
                itemsSold: 60,
                itemsLeft: 20,
                soldPercentage: 75,
                isFlashSale: false,
                isFeatured: true,
                rating: { rate: 4.9, count: 421 },
                originalPriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(399.99) : 33200,
                salePriceINR: window.utils && window.utils.convertToINR ? window.utils.convertToINR(199.99) : 16600,
            },
        ]

        this.totalSaleProducts = this.saleProducts.length
        this.filterProducts()
        this.renderSaleProducts()
        this.updateProductsCount()
        this.updateFilterCounts()
    }

    filterProducts() {
        const discount = this.currentFilter

        if (discount === "all") {
            this.filteredProducts = [...this.saleProducts]
        } else if (discount === "clearance") {
            this.filteredProducts = this.saleProducts.filter((product) => product.isClearance)
        } else if (discount === "50") {
            this.filteredProducts = this.saleProducts.filter((product) => product.discount >= 50)
        } else if (discount === "30") {
            this.filteredProducts = this.saleProducts.filter((product) => product.discount >= 30)
        } else {
            this.filteredProducts = [...this.saleProducts]
        }
    }

    setActiveFilter(filter) {
        this.currentFilter = filter

        // Update filter buttons
        document.querySelectorAll(".sale-filter-btn").forEach((btn) => {
            btn.classList.remove("active")
            if (btn.getAttribute("data-discount") === filter) {
                btn.classList.add("active")
            }
        })

        this.filterProducts()
        this.renderSaleProducts()
        this.updateProductsCount()
    }

    getProductsToDisplay() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage
        const endIndex = startIndex + this.productsPerPage
        return this.filteredProducts.slice(0, endIndex)
    }

    renderSaleProducts() {
        const grid = document.getElementById("saleProductsGrid")
        if (!grid) return

        const productsHTML = this.filteredProducts
            .map((product) => {
                const discountAmount = product.originalPriceINR - product.salePriceINR
                const progressPercentage = Math.min((product.itemsSold / (product.itemsSold + product.itemsLeft)) * 100, 100)

                return `
          <div class="product-card sale-product-card" data-product-id="${product.id}">
            <div class="product-image-container" style="position: relative;">
              ${product.thumbnail ? `<img src="${product.thumbnail}" alt="${product.title}" class="product-image">` : '<div class="placeholder-image">No Image</div>'}
              ${product.discount >= 50 ? '<div class="hot-deal-badge"><i class="fas fa-fire"></i> HOT DEAL</div>' : ""}
              ${product.isClearance
                        ? '<div class="clearance-badge"><i class="fas fa-exclamation-circle"></i> CLEARANCE</div>'
                        : ""
                    }
              <div class="discount-badge">${product.discount}% OFF</div>
            </div>
            <div class="product-info">
              <div class="product-category">${product.category || "General"}</div>
              <h3 class="product-title">${product.title}</h3>
              <div class="product-rating">
                ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating.rate))}
                ${product.rating.rate % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ""}
                <span class="rating-count">(${product.rating.count})</span>
              </div>

              <div class="product-prices">
                <div class="sale-price">₹${product.salePriceINR.toLocaleString("en-IN")}</div>
                <div class="original-price">₹${product.originalPriceINR.toLocaleString("en-IN")}</div>
              </div>

              <div class="sale-progress">
                <div class="progress-label">
                  <span>Sold: ${product.itemsSold} / ${product.itemsSold + product.itemsLeft}</span>
                  <span>Left: ${product.itemsLeft}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
              </div>

              <div class="product-actions-wrapper">
                <button class="btn-add-to-cart" data-product-id="${product.id}">
                  <i class="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
                <button class="btn-add-wishlist" data-product-id="${product.id}" title="Add to Wishlist">
                  <i class="far fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        `
            })
            .join("")

        grid.innerHTML = productsHTML

        this.bindProductCardClicks()
        this.bindWishlistButtons()
        this.bindAddToCartButtons()
    }

    bindAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll(".btn-add-to-cart")
        addToCartButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                const productId = btn.getAttribute("data-product-id")
                if (productId) {
                    this.addToCart(productId)
                }
            })
        })
    }

    loadMoreProducts() {
        return
    }

    updateFilterCounts() {
        const allCount = this.saleProducts.length
        const discount50Count = this.saleProducts.filter((p) => p.discount >= 50).length
        const discount30Count = this.saleProducts.filter((p) => p.discount >= 30).length
        const clearanceCount = this.saleProducts.filter((p) => p.isClearance).length

        document.getElementById("allCount").textContent = allCount
        document.getElementById("discount50Count").textContent = discount50Count
        document.getElementById("discount30Count").textContent = discount30Count
        document.getElementById("clearanceCount").textContent = clearanceCount
    }

    startTimers() {
        // Main sale countdown
        this.updateCountdown()
        setInterval(() => this.updateCountdown(), 1000)

        // Flash sale countdown
        this.updateFlashSaleTimer()
        setInterval(() => this.updateFlashSaleTimer(), 1000)

        // Deal of the day countdown - REMOVED
    }

    updateCountdown() {
        const now = new Date().getTime()
        const distance = this.saleEndDate - now

        if (distance < 0) {
            // Sale has ended
            document.getElementById("countdownTimer").innerHTML =
                '<div class="countdown-item" style="grid-column: 1/-1;"><div class="countdown-value">SALE ENDED</div></div>'
            return
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        document.getElementById("days").textContent = days.toString().padStart(2, "0")
        document.getElementById("hours").textContent = hours.toString().padStart(2, "0")
        document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0")
        document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0")
    }

    updateFlashSaleTimer() {
        const now = new Date().getTime()
        const distance = this.flashSaleEndDate - now

        if (distance < 0) {
            // Reset flash sale for another 12 hours
            this.flashSaleEndDate = new Date()
            this.flashSaleEndDate.setHours(this.flashSaleEndDate.getHours() + 12)
            return
        }

        const hours = Math.floor(distance / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        document.getElementById("flashHours").textContent = hours.toString().padStart(2, "0")
        document.getElementById("flashMinutes").textContent = minutes.toString().padStart(2, "0")
        document.getElementById("flashSeconds").textContent = seconds.toString().padStart(2, "0")
    }

    updateDealTimer() {
        // This method is no longer called
        return
    }

    loadSaleCategories() {
        return
    }

    filterByCategory(category) {
        // Normalize category for matching
        const normalizedCategory = category.toLowerCase().trim()

        this.filteredProducts = this.saleProducts.filter((product) => {
            const productCategory = (product.category || "").toLowerCase().trim()
            return (
                productCategory === normalizedCategory ||
                productCategory.includes(normalizedCategory) ||
                normalizedCategory.includes(productCategory)
            )
        })

        // Update active filter button
        const filterButtons = document.querySelectorAll(".sale-filter-btn")
        filterButtons.forEach((btn) => btn.classList.remove("active"))

        // Render filtered products
        this.renderSaleProducts()
        this.updateProductsCount()
    }

    setupDealOfTheDay() {
        // Select a random featured product as deal of the day
        const featuredProducts = this.saleProducts.filter((p) => p.isFeatured)
        const dealProduct =
            featuredProducts.length > 0
                ? featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
                : this.saleProducts[0]

        if (!dealProduct) return

        document.getElementById("dealTitle").textContent = dealProduct.title
        document.getElementById("dealDescription").textContent = dealProduct.description
        document.getElementById("dealCurrentPrice").textContent = `₹${dealProduct.salePriceINR.toFixed(2)}`
        document.getElementById("dealOriginalPrice").textContent = `₹${dealProduct.originalPriceINR.toFixed(2)}`
        document.getElementById("dealImage").src = dealProduct.image
        document.getElementById("dealSold").textContent = dealProduct.itemsSold
        document.getElementById("dealLeft").textContent = dealProduct.itemsLeft
        document.getElementById("dealProgress").style.width = `${dealProduct.soldPercentage}%`

        // Store deal product ID for purchase
        window.currentDealProductId = dealProduct.id
    }

    getDealOfTheDay() {
        return this.saleProducts.find((p) => p.id === window.currentDealProductId)
    }

    performSearch() {
        const searchInput = document.getElementById("searchInput")
        if (!searchInput) return

        const query = searchInput.value.toLowerCase().trim()

        if (query) {
            // Filter sale products by search query
            const filtered = this.saleProducts.filter(
                (product) =>
                    product.title.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query),
            )

            this.renderSearchResults(filtered, query)
        } else {
            // Reset to all products
            this.filterProducts()
            this.renderSaleProducts()
        }
    }

    renderSearchResults(products, query) {
        const saleProductsGrid = document.getElementById("saleProductsGrid")
        if (!saleProductsGrid) return

        if (products.length === 0) {
            saleProductsGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 60px; color: #e0e0e0; margin-bottom: 20px;"></i>
                    <h3>No sale items found</h3>
                    <p>No sale items match your search for "${query}". Try different keywords.</p>
                    <button class="btn btn-primary" onclick="saleManager.setActiveFilter('all')">
                        View All Sale Items
                    </button>
                </div>
            `
        } else {
            this.filteredProducts = products
            this.currentPage = 1
            this.renderSaleProducts()

            // Highlight search terms
            const searchTerms = query.split(" ")
            document.querySelectorAll(".product-title, .product-description").forEach((element) => {
                let html = element.innerHTML
                searchTerms.forEach((term) => {
                    if (term.length > 2) {
                        const regex = new RegExp(`(${term})`, "gi")
                        html = html.replace(regex, '<mark style="background: yellow; color: black;">$1</mark>')
                    }
                })
                element.innerHTML = html
            })
        }
    }

    updateQuantity(delta) {
        const quantityInput = document.getElementById("productQuantity")
        if (!quantityInput) return

        let value = Number.parseInt(quantityInput.value) + delta
        if (value < 1) value = 1
        if (value > 10) value = 10
        quantityInput.value = value
    }

    addToCart(productId, fromQuickView = false) {
        const product = this.saleProducts.find((p) => p.id === productId)
        if (!product) return

        const quantity = fromQuickView ? Number.parseInt(document.getElementById("productQuantity")?.value || 1) : 1

        if (window.cartManager) {
            window.cartManager.addItem(product, quantity, {})
            this.showCartFeedback(product.title, quantity)
        } else {
            // Fallback to local cart logic
            const existingItem = this.cart.find((item) => item.id === productId)
            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                this.cart.push({ ...product, quantity })
            }
            this.saveCart()
            this.updateCartBadge()
            this.showCartFeedback(product.title, quantity)
        }
    }

    toggleWishlist(productId) {
        const product = this.saleProducts.find((p) => p.id === productId)
        if (!product) return

        const wishlistButtons = document.querySelectorAll(`.btn-add-wishlist[data-product-id="${productId}"]`)

        wishlistButtons.forEach((button) => {
            const icon = button.querySelector("i")
            if (icon.classList.contains("far")) {
                icon.classList.remove("far")
                icon.classList.add("fas")
                button.style.color = "var(--primary-color)"
                button.style.borderColor = "var(--primary-color)"
                this.showNotification("Added to wishlist!")
            } else {
                icon.classList.remove("fas")
                icon.classList.add("far")
                button.style.color = ""
                button.style.borderColor = ""
                this.showNotification("Removed from wishlist")
            }
        })
    }

    buyNow(productId) {
        this.addToCart(productId, true)
        setTimeout(() => {
            // this.hideQuickView()
            this.showCart()
        }, 500)
    }

    showCart() {
        const cartSidebar = document.getElementById("cartSidebar")
        const cartOverlay = document.getElementById("cartOverlay")

        if (cartSidebar) cartSidebar.classList.add("active")
        if (cartOverlay) cartOverlay.classList.add("active")

        document.body.style.overflow = "hidden"
        this.renderCart()
    }

    hideCart() {
        const cartSidebar = document.getElementById("cartSidebar")
        const cartOverlay = document.getElementById("cartOverlay")

        if (cartSidebar) cartSidebar.classList.remove("active")
        if (cartOverlay) cartOverlay.classList.remove("active")

        document.body.style.overflow = ""
    }

    renderCart() {
        const cartBody = document.getElementById("cartBody")
        const emptyCart = document.getElementById("emptyCart")
        const totalAmount = document.getElementById("totalAmount")

        if (!cartBody || !emptyCart || !totalAmount) return

        if (this.cart.length === 0) {
            emptyCart.style.display = "block"
            cartBody.innerHTML = ""
            totalAmount.textContent = "₹0.00"
            return
        }

        emptyCart.style.display = "none"

        cartBody.innerHTML = this.cart
            .map(
                (item) => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">₹${item.salePrice ? item.salePrice.toFixed(2) : item.price.toFixed(2)} × ${item.quantity}</p>
                    ${item.discount ? `<p style="color: var(--primary-color); font-size: 12px; margin: 5px 0;">-${item.discount}% OFF</p>` : ""}
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button class="cart-quantity-btn minus" onclick="saleManager.updateCartQuantity(${item.id}, -1)">-</button>
                            <span class="cart-quantity-value">${item.quantity}</span>
                            <button class="cart-quantity-btn plus" onclick="saleManager.updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="cart-remove-btn" onclick="saleManager.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    ₹${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                </div>
            </div>
        `,
            )
            .join("")

        totalAmount.textContent = `₹${this.calculateTotal().toFixed(2)}`
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find((item) => item.id === productId)
        if (!item) return

        item.quantity += change

        if (item.quantity < 1) {
            this.removeFromCart(productId)
        } else {
            this.saveCart()
            this.renderCart()
            this.updateCartBadge()
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter((item) => item.id !== productId)
        this.saveCart()
        this.renderCart()
        this.updateCartBadge()
        this.showNotification("Item removed from cart")
    }

    calculateTotal() {
        return this.cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0)
    }

    saveCart() {
        localStorage.setItem("cart", JSON.stringify(this.cart))
    }

    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0)
        const cartBadge = document.getElementById("cartBadge")
        if (cartBadge) {
            cartBadge.textContent = totalItems
        }
    }

    updateProductsCount() {
        const displayed = this.getProductsToDisplay().length
        const total = this.filteredProducts.length
        const productsCount = document.getElementById("productsCount")
        if (productsCount) {
            productsCount.textContent = `Showing ${displayed} of ${total} sale items`
        }
    }

    showLoading() {
        const loadingState = document.getElementById("loadingState")
        const saleProductsGrid = document.getElementById("saleProductsGrid")

        if (loadingState) loadingState.style.display = "block"
        if (saleProductsGrid) saleProductsGrid.style.display = "none"

        this.isLoading = true
    }

    hideLoading() {
        const loadingState = document.getElementById("loadingState")
        const saleProductsGrid = document.getElementById("saleProductsGrid")

        if (loadingState) loadingState.style.display = "none"
        if (saleProductsGrid) saleProductsGrid.style.display = "grid"

        this.isLoading = false
    }

    showError() {
        const errorElement = document.getElementById("errorState")
        if (errorElement) errorElement.style.display = "block"
    }

    hideError() {
        const errorElement = document.getElementById("errorState")
        if (errorElement) errorElement.style.display = "none"
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating)
        const halfStar = rating % 1 >= 0.5
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

        let stars = ""
        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>'
        if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>'
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>'

        return stars
    }

    showCartFeedback(productName, quantity) {
        const feedback = document.createElement("div")
        feedback.className = "cart-feedback"
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>Added to cart!</strong>
                <p>${quantity} × ${productName}</p>
            </div>
        `

        // Add styles if not already added
        if (!document.querySelector("#sale-feedback-styles")) {
            const style = document.createElement("style")
            style.id = "sale-feedback-styles"
            style.textContent = `
                .cart-feedback {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 4000;
                    animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                    max-width: 350px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateX(100%); }
                }
            `
            document.head.appendChild(style)
        }

        document.body.appendChild(feedback)

        setTimeout(() => {
            if (feedback.parentNode) feedback.remove()
        }, 3000)
    }

    showNotification(message) {
        const notification = document.createElement("div")
        notification.className = "notification"
        notification.textContent = message

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--dark-color);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 4000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        `

        document.body.appendChild(notification)

        setTimeout(() => {
            if (notification.parentNode) notification.remove()
        }, 3000)
    }

    updateSaleStats() {
        // Calculate total products
        const totalProducts = this.saleProducts.length

        // Calculate average discount
        const totalDiscount = this.saleProducts.reduce((sum, product) => sum + product.discount, 0)
        const avgDiscount = totalProducts > 0 ? Math.round(totalDiscount / totalProducts) : 0

        // Calculate total items sold
        const totalItemsSold = this.saleProducts.reduce((sum, product) => sum + product.itemsSold, 0)

        // Update hero section stats
        const totalProductsEl = document.getElementById("totalProducts")
        const avgDiscountEl = document.getElementById("avgDiscount")
        const itemsSoldEl = document.getElementById("itemsSold")

        if (totalProductsEl) totalProductsEl.textContent = totalProducts
        if (avgDiscountEl) avgDiscountEl.textContent = avgDiscount + "%"
        if (itemsSoldEl) itemsSoldEl.textContent = totalItemsSold
    }

    bindProductCardClicks() {
        const productCards = document.querySelectorAll(".sale-product-card")
        productCards.forEach((card) => {
            card.addEventListener("click", (e) => {
                // Don't navigate if clicking action buttons
                if (
                    e.target.closest(".btn-add-to-cart") ||
                    e.target.closest(".btn-quick-view") ||
                    e.target.closest(".btn-add-wishlist") ||
                    e.target.closest(".product-actions")
                ) {
                    return
                }

                // Get product ID from card and navigate to product detail page
                const productId = card.getAttribute("data-product-id")
                if (productId) {
                    window.location.href = `product.html?id=${productId}`
                }
            })
        })
    }

    bindWishlistButtons() {
        const wishlistButtons = document.querySelectorAll(".btn-add-wishlist")
        wishlistButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                const productId = btn.getAttribute("data-product-id")
                this.toggleWishlist(productId)
            })
        })
    }
}

// Initialize Sale Manager
document.addEventListener("DOMContentLoaded", () => {
    window.saleManager = new SaleManager()
})
