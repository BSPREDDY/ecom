// Wishlist Page Manager
class WishlistPageManager {
  constructor() {
    this.init()
  }

  init() {
    this.renderWishlistItems()
    this.bindEvents()
    this.setupRealTimeListeners()
    if (window.wishlistManager) {
      window.wishlistManager.updateWishlistBadge()
    }
  }

  setupRealTimeListeners() {
    // Listen for wishlist updates and re-render automatically
    window.addEventListener("wishlistUpdated", () => {
      this.renderWishlistItems()
    })
  }

  bindEvents() {
    // Setup clear all button
    const clearAllBtn = document.getElementById("clearAllBtn")
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your entire wishlist?")) {
          window.wishlistManager.clearWishlist()
          window.utils.showNotification("Wishlist cleared", "success")
        }
      })
    }
  }

  renderWishlistItems() {
    const wishlistGrid = document.getElementById("wishlistGrid")
    const emptyState = document.getElementById("emptyWishlist")
    const wishlistCount = document.getElementById("wishlistCount")
    const wishlist = window.wishlistManager ? window.wishlistManager.getWishlist() : []

    if (wishlist.length === 0) {
      if (emptyState) emptyState.style.display = "flex"
      if (wishlistGrid) wishlistGrid.style.display = "none"
      if (wishlistCount) wishlistCount.textContent = "0 items"
      return
    }

    if (emptyState) emptyState.style.display = "none"
    if (wishlistGrid) wishlistGrid.style.display = "grid"
    if (wishlistCount) wishlistCount.textContent = `${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`

    if (wishlistGrid) {
      wishlistGrid.innerHTML = wishlist
        .map(
          (product) => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-container">
          <img src="${product.image || product.thumbnail || "/placeholder.svg?height=200&width=200"}" alt="${product.title}" class="product-image" loading="lazy">
          <button class="btn-wishlist active" onclick="wishlistPageManager.removeFromWishlist(${product.id})" title="Remove from wishlist">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="product-details">
          <div class="product-category">
            <i class="fas fa-tag"></i> ${product.category || "Product"}
          </div>
          <h3 class="product-title">${product.title}</h3>
          ${product.description ? `<p class="product-description">${product.description.substring(0, 80)}...</p>` : ""}
          <div class="product-price-container">
            <div>
              <span class="product-price">${window.utils.formatINR(product.priceINR || product.price || 0)}</span>
            </div>
            ${product.rating
              ? `<div class="product-rating">
              <span class="rating-stars">${window.utils.generateStarRating(product.rating.rate || product.rating || 4)}</span>
              <span class="rating-count">(${product.rating.count || 0})</span>
            </div>`
              : ""
            }
          </div>
          <div class="product-actions">
            <button class="btn-add-to-cart" onclick="wishlistPageManager.addToCartFromWishlist(${product.id})">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `,
        )
        .join("")
    }
  }

  removeFromWishlist(productId) {
    if (window.wishlistManager) {
      window.wishlistManager.removeItem(productId)
    }
  }

  addToCartFromWishlist(productId) {
    const wishlist = window.wishlistManager ? window.wishlistManager.getWishlist() : []
    const product = wishlist.find((item) => item.id === productId)

    if (product && window.cartManager) {
      window.cartManager.addItem(product, 1, {})
      window.utils.showNotification(`${product.title} added to cart!`, "success")
    }
  }
}

// Initialize wishlist page manager
document.addEventListener("DOMContentLoaded", () => {
  window.wishlistPageManager = new WishlistPageManager()
})
