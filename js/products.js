// products.js - UPDATED
// ===============================
// Products Management Module
// ===============================

// API Base URL - Declare globally
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://dummyjson.com';
}
const API_BASE_URL = window.API_BASE_URL;

// Helper functions
function showLoading(container) {
    container.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-3x text-muted"></i></div>';
}

function showError(container, message) {
    container.innerHTML = `<div class="text-center py-5"><i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i><h4>${message}</h4></div>`;
}

function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addToCart(product) {
    console.log(`[v0] Adding product to cart:`, product);

    // Get existing cart from localStorage
    let cart = [];
    try {
        const storedCart = localStorage.getItem('cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error('Error parsing cart:', e);
        cart = [];
    }

    // Get quantity to add
    const quantityToAdd = product.requestedQuantity || 1;

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Increase quantity if product already in cart
        existingItem.quantity = (existingItem.quantity || 1) + quantityToAdd;
        console.log(`[v0] Updated quantity for product ${product.id} to ${existingItem.quantity}`);
    } else {
        // Add new product to cart
        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.thumbnail || product.image || 'https://via.placeholder.com/80',
            quantity: quantityToAdd,
            description: product.description || ''
        };
        cart.push(cartItem);
        console.log(`[v0] Added new product to cart:`, cartItem);
    }

    // Save to localStorage
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`${product.title} added to cart! (Qty: ${quantityToAdd})`, 'success');
        console.log(`[v0] Cart saved successfully. Total items: ${cart.length}`);
    } catch (e) {
        console.error('Error saving cart:', e);
        showNotification('Error adding to cart', 'error');
    }
}

function formatPrice(price) {
    return `$${typeof price === 'number' ? price.toFixed(2) : '0.00'}`;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }

    return stars;
}

// Function to update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
}

// Function to load categories (placeholder)
function loadCategories() {
    console.log('Loading categories...');
    // This will be implemented in categories.js
}

// Function to load categories page
function loadCategoriesPage() {
    console.log('Loading categories page...');
    // This will be implemented in categories.js
}

// Fetch and display latest products
async function loadLatestProducts() {
    const container = document.getElementById('latestProducts');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=8`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        container.innerHTML = '';

        data.products.forEach((product, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4 product-col';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.05}s both`;
            col.innerHTML = createProductCard(product);
            container.appendChild(col);
        });

        // Add event listeners to "Add to Cart" buttons
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.dataset.id;
                const product = data.products.find(p => p.id == productId);
                if (product) {
                    addToCart(product);
                }
            });
        });
    } catch (error) {
        console.error('Error loading latest products:', error);
        showError(container, 'Failed to load products. Please try again later.');
    }
}

// Create product card HTML
function createProductCard(product) {
    const description = product.description ? product.description.substring(0, 80) + '...' : 'No description available';
    return `
        <div class="card product-card h-100">
            <img src="${product.thumbnail || 'https://via.placeholder.com/300'}" 
                 class="card-img-top product-img" 
                 alt="${product.title}"
                 onerror="this.src='https://via.placeholder.com/300'">
            <div class="card-body d-flex flex-column">
                <h6 class="card-title product-title">${product.title}</h6>
                <p class="product-description text-muted small mb-2 flex-grow-1">${description}</p>
                <div class="product-rating mb-2">
                    ${generateStarRating(product.rating || 0)}
                    <small class="text-muted">(${product.rating || 0})</small>
                </div>
                <p class="product-price fw-bold">${formatPrice(product.price)}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <a href="product-details.html?id=${product.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                    <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Fetch and display all products on products page
async function loadAllProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=100`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Store products for filtering
        window.allProducts = data.products;

        displayProducts(data.products);
        populateCategories(data.products);
    } catch (error) {
        console.error('Error loading all products:', error);
        showError(container, 'Failed to load products. Please try again later.');
    }
}

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No products found</h4>
                <p class="text-muted">Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    products.forEach((product, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4 product-col';
        col.style.animation = `fadeIn 0.5s ease-out ${index * 0.05}s both`;
        col.innerHTML = createProductCard(product);
        container.appendChild(col);
    });

    // Add event listeners to "Add to Cart" buttons
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.dataset.id;
            const product = window.allProducts.find(p => p.id == productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

// Populate categories for filter
function populateCategories(products) {
    const categorySelect = document.getElementById('categoryFilter');
    if (!categorySelect) return;

    // Clear existing options except the first one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))];

    categories.forEach(category => {
        // Ensure category is a string
        const categoryStr = typeof category === 'string' ? category : String(category);
        const option = document.createElement('option');
        option.value = categoryStr;
        option.textContent = categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);
        categorySelect.appendChild(option);
    });
}

// Filter products
function filterProducts() {
    if (!window.allProducts) return;

    const category = document.getElementById('categoryFilter')?.value;
    const priceRange = document.getElementById('priceRange')?.value || 2000;
    const maxPrice = parseFloat(priceRange);
    const priceValue = document.getElementById('priceValue');

    if (priceValue) {
        priceValue.textContent = `$0 - $${maxPrice}`;
    }

    const filtered = window.allProducts.filter(product => {
        const matchesCategory = !category || product.category === category;
        const matchesPrice = product.price >= 0 && product.price <= maxPrice;
        return matchesCategory && matchesPrice;
    });

    displayProducts(filtered);
}

// Sort products
function sortProducts() {
    if (!window.allProducts) return;

    const sortType = document.getElementById('sortFilter')?.value || 'default';
    const container = document.getElementById('productsContainer');
    const products = Array.from(container.querySelectorAll('.col-lg-3'));

    let sortedProducts = [...window.allProducts];

    switch (sortType) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            // Keep original order
            break;
    }

    displayProducts(sortedProducts);
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - products.js initialized');
    updateCartCount();

    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/' || path === '' || path.endsWith('/')) {
        console.log('Home page detected');
        loadLatestProducts();
    } else if (path.includes('products.html') && !path.includes('product-details.html')) {
        console.log('Products page detected');
        loadAllProducts();
    }
});