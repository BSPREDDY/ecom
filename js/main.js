// js/main.js

// DOM Elements
const scrollToTopBtn = document.getElementById('scrollToTop');
const cartCount = document.getElementById('cart-count');

// Initialize cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Scroll to Top Functionality
if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Format price
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Add to Cart Function
function addToCart(product, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.thumbnail || product.images?.[0],
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Show notification
    showNotification('Product added to cart!', 'success');
}

// Remove from Cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update Quantity
function updateQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
}

// Calculate Cart Total
function calculateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Load Categories for Home Page
async function loadCategories() {
    try {
        const response = await fetch('https://dummyjson.com/products/categories');
        const categories = await response.json();

        const container = document.getElementById('categories-container');
        if (!container) return;

        // Take first 8 categories
        const mainCategories = categories.slice(0, 8);

        container.innerHTML = mainCategories.map(category => `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card category-card h-100">
                    <img src="https://via.placeholder.com/300x200/e9ecef/495057?text=${encodeURIComponent(category)}" 
                         class="card-img-top category-img" alt="${category}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${category.replace('-', ' ').toUpperCase()}</h5>
                        <a href="products.html?category=${category}" class="btn btn-outline-primary btn-sm">Shop Now</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Latest Products
async function loadLatestProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=8');
        const data = await response.json();

        const container = document.getElementById('latest-products');
        if (!container) return;

        container.innerHTML = data.products.map(product => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card product-card h-100">
                    <img src="${product.thumbnail}" class="card-img-top product-img" alt="${product.title}">
                    <div class="card-body">
                        <h6 class="card-title">${product.title}</h6>
                        <div class="rating mb-2">
                            ${generateStarRating(product.rating)}
                        </div>
                        <p class="price">${formatPrice(product.price)}</p>
                        <p class="card-text small text-muted">${product.description.substring(0, 60)}...</p>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <button class="btn btn-primary w-100 add-to-cart" data-product='${JSON.stringify(product)}'>
                            <i class="fas fa-cart-plus me-2"></i>Add to Cart
                        </button>
                        <a href="product-details.html?id=${product.id}" class="btn btn-outline-secondary w-100 mt-2">
                            View Details
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = JSON.parse(e.target.closest('.add-to-cart').dataset.product);
                addToCart(product);
            });
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Generate Star Rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Load home page content
    if (document.getElementById('categories-container')) {
        loadCategories();
        loadLatestProducts();
    }

    // Add to cart buttons in product pages
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            const button = e.target.closest('.add-to-cart-btn');
            const productId = button.dataset.productId;
            const productTitle = button.dataset.productTitle;
            const productPrice = parseFloat(button.dataset.productPrice);
            const productImage = button.dataset.productImage;

            addToCart({
                id: productId,
                title: productTitle,
                price: productPrice,
                thumbnail: productImage
            });
        }
    });
});