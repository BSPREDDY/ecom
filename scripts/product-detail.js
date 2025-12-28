// Product Detail Page Manager
class ProductDetailManager {
    constructor() {
        this.product = null
        this.relatedProducts = []
        this.selectedVariations = {
            color: null,
            size: null,
        }
        this.quantity = 1
        this.apiBaseUrl = "https://dummyjson.com/products"
        this.cart = JSON.parse(localStorage.getItem("cart")) || []

        this.init()
    }

    async init() {
        this.bindEvents()
        await this.loadProduct()
        this.updateCartBadge()
        this.setupImageZoom()
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll(".tab-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const tabId = e.target.getAttribute("data-tab")
                this.switchTab(tabId)
            })
        })

        // Quantity controls
        const quantityMinusBtn = document.getElementById("quantityMinusBtn")
        const quantityPlusBtn = document.getElementById("quantityPlusBtn")
        const quantityInput = document.getElementById("productQuantity")

        if (quantityMinusBtn) {
            quantityMinusBtn.addEventListener("click", () => this.updateQuantity(-1))
        }

        if (quantityPlusBtn) {
            quantityPlusBtn.addEventListener("click", () => this.updateQuantity(1))
        }

        if (quantityInput) {
            quantityInput.addEventListener("change", (e) => {
                let value = Number.parseInt(e.target.value)
                if (isNaN(value) || value < 1) value = 1
                if (value > 10) value = 10
                this.quantity = value
                e.target.value = value
            })
        }

        // Color selection
        document.addEventListener("click", (e) => {
            if (e.target.closest(".color-option")) {
                const colorOption = e.target.closest(".color-option")
                const color = colorOption.getAttribute("data-color")
                this.selectColor(color)
            }
        })

        // Size selection
        document.addEventListener("click", (e) => {
            if (e.target.closest(".size-option") && !e.target.closest(".size-option.unavailable")) {
                const sizeOption = e.target.closest(".size-option")
                const size = sizeOption.getAttribute("data-size")
                this.selectSize(size)
            }
        })

        // Add to cart buttons
        const addToCartBtn = document.getElementById("addToCartBtn")
        const mobileAddToCartBtn = document.getElementById("mobileAddToCartBtn")
        const buyNowBtn = document.getElementById("buyNowBtn")
        const mobileBuyNowBtn = document.getElementById("mobileBuyNowBtn")
        const wishlistBtn = document.getElementById("wishlistBtn")

        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => {
                if (window.authManager) {
                    window.authManager.checkAuthAndAction(() => this.addToCart())
                } else {
                    this.addToCart()
                }
            })
        }

        if (mobileAddToCartBtn) {
            mobileAddToCartBtn.addEventListener("click", () => this.addToCart())
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener("click", () => this.buyNow())
        }

        if (mobileBuyNowBtn) {
            mobileBuyNowBtn.addEventListener("click", () => this.buyNow())
        }

        if (wishlistBtn) {
            wishlistBtn.addEventListener("click", () => this.toggleWishlist())
        }

        // Image thumbnail clicks
        document.addEventListener("click", (e) => {
            if (e.target.closest(".thumbnail")) {
                const thumbnail = e.target.closest(".thumbnail")
                const imageUrl = thumbnail.getAttribute("data-image")
                this.changeMainImage(imageUrl)

                // Update active thumbnail
                document.querySelectorAll(".thumbnail").forEach((t) => t.classList.remove("active"))
                thumbnail.classList.add("active")
            }
        })

        // Image zoom on hover
        const mainImageContainer = document.getElementById("mainImageContainer")
        const mainImage = document.getElementById("mainProductImage")
        const zoomLens = document.getElementById("zoomLens")
        const zoomView = document.getElementById("zoomView")

        if (mainImageContainer && mainImage && zoomLens && zoomView) {
            mainImageContainer.addEventListener("mouseenter", () => {
                if (this.zoomEnabled && window.innerWidth > 768) {
                    this.showZoom()
                }
            })

            mainImageContainer.addEventListener("mouseleave", () => {
                this.hideZoom()
            })

            mainImageContainer.addEventListener("mousemove", (e) => {
                if (this.zoomEnabled && window.innerWidth > 768) {
                    this.updateZoom(e)
                }
            })

            // Enable zoom on image load
            mainImage.addEventListener("load", () => {
                if (window.innerWidth > 768) {
                    this.zoomEnabled = true
                }
            })
        }

        // Cart functionality
        const cartIcon = document.getElementById("cartIcon")
        const cartClose = document.getElementById("cartClose")
        const cartOverlay = document.getElementById("cartOverlay")
        const checkoutBtn = document.getElementById("checkoutBtn")
        const startShoppingBtn = document.getElementById("startShoppingBtn")

        if (cartIcon) {
            cartIcon.addEventListener("click", (e) => {
                e.preventDefault()
                window.location.href = "cart.html"
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
                alert(`Proceeding to checkout with total: ${window.utils.formatINR(this.calculateTotal())}`)
            })
        }

        if (startShoppingBtn) {
            startShoppingBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.hideCart()
                window.location.href = "index.html#products"
            })
        }

        // Search functionality
        const searchBtn = document.getElementById("searchBtn")
        const searchInput = document.getElementById("searchInput")

        if (searchBtn && searchInput) {
            searchBtn.addEventListener("click", () => this.handleSearch())
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.handleSearch()
            })
        }
    }

    async loadProduct() {
        try {
            // Get product ID from URL
            const urlParams = new URLSearchParams(window.location.search)
            const productId = urlParams.get("id")

            if (!productId) {
                this.showError()
                return
            }

            this.showLoading()
            const response = await fetch(`${this.apiBaseUrl}/${productId}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const product = await response.json()
            this.product = this.enhanceProductData(product)

            this.hideLoading()
            this.renderProduct()
            await this.loadRelatedProducts()
        } catch (error) {
            console.error("Error loading product:", error)
            this.showError()
            this.hideLoading()
        }
    }

    enhanceProductData(product) {
        const discount = product.discountPercentage || Math.floor(Math.random() * 40) + 10
        const originalPrice = product.price * (1 + discount / 100)

        return {
            ...product,
            // Use thumbnail or first image from images array
            image: product.thumbnail || (product.images && product.images[0]) || product.image,
            images: product.images || [product.thumbnail || product.image],
            originalPrice: originalPrice,
            discount: Math.round(discount),
            priceINR: product.priceINR || window.utils.convertToINR(product.price),
            originalPriceINR: window.utils.convertToINR(originalPrice),
            rating:
                product.rating && typeof product.rating === "object"
                    ? product.rating
                    : { rate: product.rating || 4, count: Math.floor(Math.random() * 100) + 10 },
            stock: product.stock || 100,
            colors: ["#FF6B8B", "#4A90E2", "#50C878", "#FFD700", "#000000"],
            sizes: ["S", "M", "L", "XL"],
        }
    }

    renderProduct() {
        if (!this.product) return

        // Update breadcrumb
        document.getElementById("breadcrumbProduct").textContent = this.product.title

        // Update category
        document.getElementById("productCategory").textContent = this.product.category

        // Update title
        document.getElementById("productTitle").textContent = this.product.title

        // Update rating
        const ratingRate = this.product.rating?.rate || 4
        const ratingStars = this.generateStarRating(ratingRate)
        document.getElementById("productRatingStars").innerHTML = ratingStars
        document.getElementById("productRatingCount").textContent = `(${this.product.rating?.count || 0} reviews)`

        // Update prices
        const currentPrice = document.getElementById("currentPrice")
        const originalPrice = document.getElementById("originalPrice")
        const discountPercent = document.getElementById("discountPercent")

        currentPrice.textContent = window.utils.formatINR(this.product.priceINR)
        originalPrice.textContent = window.utils.formatINR(this.product.originalPriceINR)

        if (this.product.discount > 0) {
            discountPercent.textContent = `-${this.product.discount}%`
            discountPercent.style.display = "inline-block"
        }

        // Update description
        document.getElementById("productDescription").textContent = this.product.description
        document.getElementById("fullDescription").innerHTML = `
            <p>${this.product.description}</p>
            <p>This premium product features high-quality materials and craftsmanship. Perfect for everyday use or special occasions.</p>
        `

        // Update images
        this.renderProductImages()

        // Update variations
        this.renderVariations()

        // Update stock status
        const stockStatus = document.getElementById("stockStatus")
        if (this.product.stock > 20) {
            stockStatus.textContent = `In Stock (${this.product.stock} available)`
            stockStatus.style.color = "#4CAF50"
        } else if (this.product.stock > 0) {
            stockStatus.textContent = `Low Stock (Only ${this.product.stock} left)`
            stockStatus.style.color = "#FF9800"
        } else {
            stockStatus.textContent = "Out of Stock"
            stockStatus.style.color = "#FF4757"
        }

        // Update specifications
        this.renderSpecifications()

        // Update reviews
        this.renderReviews()

        // Show product container and tabs
        document.getElementById("productDetailContainer").style.display = "grid"
        document.getElementById("productTabs").style.display = "block"
        document.getElementById("relatedProducts").style.display = "block"
    }

    renderProductImages() {
        const mainImage = document.getElementById("mainProductImage")
        const thumbnailsContainer = document.getElementById("imageThumbnails")

        if (this.product.images && this.product.images.length > 0) {
            mainImage.src = this.product.images[0]
            mainImage.alt = this.product.title

            thumbnailsContainer.innerHTML = this.product.images
                .map(
                    (image, index) => `
                <div class="thumbnail ${index === 0 ? "active" : ""}" data-image="${image}">
                    <img src="${image}" alt="${this.product.title} - View ${index + 1}">
                </div>
            `,
                )
                .join("")
        }
    }

    renderVariations() {
        // Color variations
        const colorVariation = document.getElementById("colorVariation")
        const colorOptions = document.getElementById("colorOptions")

        if (this.product.colors && this.product.colors.length > 0) {
            colorVariation.style.display = "block"
            colorOptions.innerHTML = this.product.colors
                .map(
                    (color, index) => `
                <div class="color-option ${index === 0 ? "active" : ""}" 
                     data-color="${color}"
                     style="background-color: ${color};"
                     title="Color ${index + 1}">
                </div>
            `,
                )
                .join("")

            this.selectedVariations.color = this.product.colors[0]
        }

        // Size variations
        const sizeVariation = document.getElementById("sizeVariation")
        const sizeOptions = document.getElementById("sizeOptions")

        if (this.product.sizes && this.product.sizes.length > 0) {
            sizeVariation.style.display = "block"
            sizeOptions.innerHTML = this.product.sizes
                .map((size, index) => {
                    const isUnavailable = this.product.unavailableSizes && this.product.unavailableSizes.includes(size)
                    return `
                    <div class="size-option ${isUnavailable ? "unavailable" : ""} ${index === 0 && !isUnavailable ? "active" : ""}" 
                         data-size="${size}"
                         ${isUnavailable ? 'title="Out of stock"' : ""}>
                        ${size}
                    </div>
                `
                })
                .join("")

            this.selectedVariations.size = this.product.sizes.find((size) => !this.product.unavailableSizes?.includes(size))
        }
    }

    renderSpecifications() {
        const specificationsTable = document.getElementById("specificationsTable")

        if (this.product.specifications) {
            specificationsTable.innerHTML = Object.entries(this.product.specifications)
                .map(
                    ([key, value]) => `
                    <tr>
                        <td>${key}</td>
                        <td>${value}</td>
                    </tr>
                `,
                )
                .join("")
        }
    }

    renderReviews() {
        const reviewsList = document.getElementById("reviewsList")

        if (this.product.reviews && Array.isArray(this.product.reviews) && this.product.reviews.length > 0) {
            reviewsList.innerHTML = this.product.reviews
                .map(
                    (review) => `
                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <div class="reviewer-avatar">${(review.reviewerName || "A").charAt(0)}</div>
                            <div>
                                <div class="reviewer-name">${review.reviewerName || "Anonymous"}</div>
                                <div class="review-date">${window.utils.formatDate(review.date) || "Recent"}</div>
                            </div>
                        </div>
                        <div class="rating-stars-large">
                            ${this.generateStarRating(review.rating || 5)}
                        </div>
                    </div>
                    <div class="review-content">
                        <p>${review.comment || "Great product!"}</p>
                    </div>
                </div>
            `,
                )
                .join("")
        } else {
            reviewsList.innerHTML = `
                <div class="review-item">
                    <p>No reviews yet. Be the first to review this product!</p>
                </div>
            `
        }
    }

    async loadRelatedProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?limit=10`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            const products = data.products || []

            // Filter out current product and take 4 random related products
            this.relatedProducts = products
                .filter((p) => p.id !== this.product.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map((product) => this.enhanceProductData(product))

            this.renderRelatedProducts()
        } catch (error) {
            console.error("Error loading related products:", error)
        }
    }

    renderRelatedProducts() {
        const relatedProductsGrid = document.getElementById("relatedProductsGrid")

        if (this.relatedProducts.length > 0) {
            relatedProductsGrid.innerHTML = this.relatedProducts
                .map(
                    (product) => `
                <div class="product-card" data-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
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
                                <span class="product-price">${window.utils.formatINR(product.priceINR)}</span>
                                <span class="product-original-price">${window.utils.formatINR(product.originalPriceINR)}</span>
                            </div>
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-to-cart" onclick="event.stopPropagation(); window.productDetailManager.addRelatedToCart(${product.id})">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn-wishlist" onclick="event.stopPropagation(); window.productDetailManager.toggleRelatedWishlist(${product.id})">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `,
                )
                .join("")
        }
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

    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll(".tab-btn").forEach((btn) => {
            btn.classList.remove("active")
        })
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add("active")

        // Update active tab content
        document.querySelectorAll(".tab-content").forEach((content) => {
            content.classList.remove("active")
        })
        document.getElementById(`${tabId}Tab`).classList.add("active")
    }

    updateQuantity(change) {
        let newQuantity = this.quantity + change

        if (newQuantity < 1) newQuantity = 1
        if (newQuantity > 10) newQuantity = 10

        this.quantity = newQuantity
        document.getElementById("productQuantity").value = newQuantity

        // Animate price update
        this.animatePriceUpdate()
    }

    selectColor(color) {
        this.selectedVariations.color = color

        // Update active color
        document.querySelectorAll(".color-option").forEach((option) => {
            option.classList.remove("active")
            if (option.getAttribute("data-color") === color) {
                option.classList.add("active")
            }
        })

        // Change product image based on color (simulated)
        this.changeImageByColor(color)
    }

    selectSize(size) {
        this.selectedVariations.size = size

        // Update active size
        document.querySelectorAll(".size-option").forEach((option) => {
            option.classList.remove("active")
            if (option.getAttribute("data-size") === size) {
                option.classList.add("active")
            }
        })
    }

    changeImageByColor(color) {
        // Simulate changing image based on color
        // In a real app, you would have different images for each color
        const mainImage = document.getElementById("mainProductImage")

        // Add a color filter to simulate different color
        mainImage.style.filter = `drop-shadow(0 0 10px ${color}40)`

        // Reset filter after 500ms
        setTimeout(() => {
            mainImage.style.filter = "none"
        }, 500)
    }

    changeMainImage(imageUrl) {
        const mainImage = document.getElementById("mainProductImage")
        mainImage.src = imageUrl

        // Reset zoom
        this.zoomEnabled = false
        setTimeout(() => {
            if (window.innerWidth > 768) {
                this.zoomEnabled = true
            }
        }, 100)
    }

    setupImageZoom() {
        const mainImage = document.getElementById("mainProductImage")
        const zoomLens = document.getElementById("zoomLens")
        const zoomView = document.getElementById("zoomView")

        if (!mainImage || !zoomLens || !zoomView) return

        // Set up zoom view dimensions
        zoomView.style.width = "400px"
        zoomView.style.height = "400px"

        // Calculate zoom ratio
        const zoomRatio = 2

        // Store references for use in event handlers
        this.zoomElements = { mainImage, zoomLens, zoomView, zoomRatio }
    }

    showZoom() {
        const { zoomLens, zoomView } = this.zoomElements
        zoomLens.style.display = "block"
        zoomView.style.display = "block"
    }

    hideZoom() {
        const { zoomLens, zoomView } = this.zoomElements
        zoomLens.style.display = "none"
        zoomView.style.display = "none"
    }

    updateZoom(event) {
        const { mainImage, zoomLens, zoomView, zoomRatio } = this.zoomElements

        const bounds = mainImage.getBoundingClientRect()
        const x = event.clientX - bounds.left
        const y = event.clientY - bounds.top

        // Calculate lens position (centered on cursor)
        const lensSize = 150
        let lensX = x - lensSize / 2
        let lensY = y - lensSize / 2

        // Keep lens within image bounds
        lensX = Math.max(0, Math.min(lensX, bounds.width - lensSize))
        lensY = Math.max(0, Math.min(lensY, bounds.height - lensSize))

        // Position lens
        zoomLens.style.width = `${lensSize}px`
        zoomLens.style.height = `${lensSize}px`
        zoomLens.style.left = `${lensX}px`
        zoomLens.style.top = `${lensY}px`

        // Calculate zoom view position (opposite side of cursor)
        const viewSize = 400
        let viewX = event.clientX + 20
        let viewY = event.clientY + 20

        // Keep view within window bounds
        if (viewX + viewSize > window.innerWidth) {
            viewX = event.clientX - viewSize - 20
        }
        if (viewY + viewSize > window.innerHeight) {
            viewY = event.clientY - viewSize - 20
        }

        // Position zoom view
        zoomView.style.left = `${viewX}px`
        zoomView.style.top = `${viewY}px`

        // Calculate background position for zoom
        const bgX = (lensX / bounds.width) * 100
        const bgY = (lensY / bounds.height) * 100

        // Set zoom view background
        zoomView.style.backgroundImage = `url('${mainImage.src}')`
        zoomView.style.backgroundSize = `${bounds.width * zoomRatio}px ${bounds.height * zoomRatio}px`
        zoomView.style.backgroundPosition = `${bgX}% ${bgY}%`
    }

    addToCart() {
        if (!this.product) return

        const cartItem = {
            id: this.product.id,
            title: this.product.title,
            price: this.product.price,
            image: this.product.image,
            quantity: this.quantity,
            color: this.selectedVariations.color,
            size: this.selectedVariations.size,
            category: this.product.category,
        }

        // Check if item already exists in cart
        const existingItemIndex = this.cart.findIndex(
            (item) => item.id === cartItem.id && item.color === cartItem.color && item.size === cartItem.size,
        )

        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            this.cart[existingItemIndex].quantity += cartItem.quantity
        } else {
            // Add new item
            this.cart.push(cartItem)
        }

        this.saveCart()
        this.updateCartBadge()
        this.showCartFeedback()
    }

    buyNow() {
        this.addToCart()
        setTimeout(() => {
            this.showCart()
        }, 500)
    }

    toggleWishlist() {
        const wishlistBtn = document.getElementById("wishlistBtn")
        const icon = wishlistBtn.querySelector("i")

        if (icon.classList.contains("far")) {
            icon.classList.remove("far")
            icon.classList.add("fas")
            wishlistBtn.style.color = "var(--primary-color)"
            this.showNotification("Added to wishlist!")
        } else {
            icon.classList.remove("fas")
            icon.classList.add("far")
            wishlistBtn.style.color = ""
            this.showNotification("Removed from wishlist")
        }
    }

    toggleRelatedWishlist(productId) {
        // This would toggle wishlist for related products
        this.showNotification("Added to wishlist!")
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
            totalAmount.textContent = window.utils.formatINR(0)
            return
        }

        emptyCart.style.display = "none"

        cartBody.innerHTML = this.cart
            .map(
                (item, index) => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">${window.utils.formatINR(item.priceINR || window.utils.convertToINR(item.price))}</p>
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button class="cart-quantity-btn minus" onclick="window.productDetailManager.updateCartQuantity(${index}, -1)">-</button>
                            <span class="cart-quantity-value">${item.quantity}</span>
                            <button class="cart-quantity-btn plus" onclick="window.productDetailManager.updateCartQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="cart-remove-btn" onclick="window.productDetailManager.removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    ${window.utils.formatINR((item.priceINR || window.utils.convertToINR(item.price)) * item.quantity)}
                </div>
            </div>
        `,
            )
            .join("")

        totalAmount.textContent = window.utils.formatINR(this.calculateTotal())
    }

    updateCartQuantity(index, change) {
        if (index < 0 || index >= this.cart.length) return

        this.cart[index].quantity += change

        if (this.cart[index].quantity < 1) {
            this.removeFromCart(index)
        } else {
            this.saveCart()
            this.renderCart()
            this.updateCartBadge()
        }
    }

    removeFromCart(index) {
        this.cart.splice(index, 1)
        this.saveCart()
        this.renderCart()
        this.updateCartBadge()
        this.showNotification("Item removed from cart")
    }

    calculateTotal() {
        return this.cart.reduce(
            (sum, item) => sum + (item.priceINR || window.utils.convertToINR(item.price)) * item.quantity,
            0,
        )
    }

    saveCart() {
        localStorage.setItem("cart", JSON.stringify(this.cart))
    }

    updateCartBadge() {
        const badge = document.getElementById("cartBadge")
        if (badge && window.cartManager) {
            const cart = window.cartManager.getCart()
            const count = Array.isArray(cart) ? cart.reduce((total, item) => total + (item.quantity || 0), 0) : 0
            badge.textContent = count
            badge.style.display = count > 0 ? "flex" : "inline-flex"
        }
    }

    showLoading() {
        const loading = document.getElementById("productLoading")
        if (loading) loading.style.display = "flex"
    }

    hideLoading() {
        const loading = document.getElementById("productLoading")
        if (loading) loading.style.display = "none"
    }

    showError() {
        const errorElement = document.getElementById("productError")
        if (errorElement) {
            errorElement.style.display = "block"
        }
    }

    showCartFeedback() {
        const feedback = document.createElement("div")
        feedback.className = "cart-feedback"
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>Added to cart!</strong>
                <p>${this.quantity} × ${this.product.title}</p>
            </div>
        `

        // Add styles if not already added
        if (!document.querySelector("#product-feedback-styles")) {
            const style = document.createElement("style")
            style.id = "product-feedback-styles"
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

    handleSearch() {
        const searchInput = document.getElementById("searchInput")
        if (!searchInput) return

        const query = searchInput.value.trim()

        if (query) {
            // Redirect to search results or filter
            window.location.href = `index.html#products?search=${encodeURIComponent(query)}`
        }
    }

    addRelatedToCart(productId) {
        const product = this.relatedProducts.find((p) => p.id === productId)
        if (product && window.cartManager) {
            window.cartManager.addItem(product, 1, {})
            window.utils.showNotification(`${product.title} added to cart!`, "success")
        }
    }

    animatePriceUpdate() {
        // Animate price update logic here
    }
}

// Initialize Product Detail Manager
document.addEventListener("DOMContentLoaded", () => {
    window.productDetailManager = new ProductDetailManager()
})
