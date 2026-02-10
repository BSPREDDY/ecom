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

        // Update cart count in navbar
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

        // Show notification
        showNotification(`${product.title} added to cart! (Qty: ${quantityToAdd})`, 'success');
        console.log(`[v0] Cart saved successfully. Total items: ${cart.length}`);
    } catch (e) {
        console.error('Error saving cart:', e);
        showNotification('Error adding to cart', 'danger');
    }
}

function formatPrice(price) {
    const numPrice = typeof price === 'number' ? price * 83 : 0; // Convert USD to INR (1 USD = ~83 INR)
    return `₹${numPrice.toFixed(0)}`; // Display in rupees without decimals
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

// Load product details by ID
async function loadProductDetails() {
    console.log('[v0] Starting loadProductDetails');
    const productId = getQueryParam('id');
    console.log('[v0] Product ID from URL:', productId);

    if (!productId) {
        console.error('[v0] No product ID provided');
        const container = document.getElementById('productDetails');
        if (container) {
            showError(container, 'Product not found');
        }
        return;
    }

    const container = document.getElementById('productDetails');
    if (!container) {
        console.log('[v0] Product details container not found');
        return;
    }

    showLoading(container);

    try {
        console.log('[v0] Fetching product from API:', `${API_BASE_URL}/products/${productId}`);
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await response.json();
        console.log('[v0] Product loaded successfully:', product);

        // Update page title
        if (product.category) {
            const categoryTitle = document.getElementById('productCategory');
            if (categoryTitle) {
                categoryTitle.textContent = product.category;
            }
        }

        // Create product details HTML
        const productHTML = createProductDetailsHTML(product);
        container.innerHTML = productHTML;

        // Attach event listeners
        attachProductDetailListeners(product);

        // Load related products
        loadRelatedProducts(product.category);

        console.log('[v0] Product details loaded and rendered successfully');
    } catch (error) {
        console.error('[v0] Error loading product details:', error);
        showError(container, 'Failed to load product details. Please try again later.');
    }
}

// Create product details HTML
function createProductDetailsHTML(product) {
    const images = product.images || [product.thumbnail || 'https://via.placeholder.com/500'];
    const imageCarousel = images.map((img, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${img}" alt="Product image" onerror="this.src='https://via.placeholder.com/500'">
        </div>
    `).join('');

    const thumbnails = images.map((img, index) => `
        <img src="${img}" class="thumbnail-img ${index === 0 ? 'active' : ''}" 
             data-bs-slide-to="${index}" 
             alt="Product thumbnail"
             onclick="document.querySelectorAll('.carousel-item')[${index}].classList.add('active'); document.querySelectorAll('.carousel-item').forEach((el, i) => {if(i !== ${index}) el.classList.remove('active')}); this.parentElement.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active')); this.classList.add('active');"
             onerror="this.src='https://via.placeholder.com/60'">
    `).join('');

    const rating = generateStarRating(product.rating || 0);
    const description = product.description || 'No description available';
    const stock = product.stock || product.quantity || 5;
    const availability = stock > 0 ? `<span class="badge bg-success">In Stock (${stock} available)</span>` : '<span class="badge bg-danger">Out of Stock</span>';

    return `
        <div class="row justify-content-center">
            <!-- Product Images -->
            <div class="col-lg-5 col-md-6 mb-4">
                <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner" style="background: #f8f9fa; border-radius: 10px;">
                        ${imageCarousel}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                </div>
                <!-- Thumbnails -->
                <div class="mt-3 d-flex gap-2 flex-wrap" id="thumbnailContainer">
                    ${thumbnails}
                </div>
            </div>

            <!-- Product Info -->
            <div class="col-lg-5 col-md-6">
                <h1 class="mb-3">${product.title}</h1>
                
                <!-- Rating -->
                <div class="mb-3">
                    <span class="text-warning">${rating}</span>
                    <span class="ms-2 text-muted">(${product.rating || 0}/5)</span>
                </div>

                <!-- Price -->
                <div class="mb-3">
                    <span class="display-5 text-primary fw-bold">${formatPrice(product.price)}</span>
                </div>

                <!-- Availability -->
                <div class="mb-3">
                    ${availability}
                </div>

                <!-- Description -->
                <div class="mb-4">
                    <h5>Description</h5>
                    <p>${description}</p>
                </div>

                <!-- Product Details -->
                <div class="mb-4">
                    <h5>Product Details</h5>
                    <ul class="list-unstyled">
                        <li><strong>SKU:</strong> ${product.sku || 'N/A'}</li>
                        <li><strong>Brand:</strong> ${product.brand || 'Not specified'}</li>
                        <li><strong>Category:</strong> ${product.category || 'Uncategorized'}</li>
                        <li><strong>Weight:</strong> ${product.weight || 'Not specified'}</li>
                    </ul>
                </div>

                <!-- Quantity Selector -->
                <div class="mb-4">
                    <label for="quantitySelect" class="form-label">Quantity:</label>
                    <div class="input-group" style="width: 150px;">
                        <button class="btn btn-outline-secondary" type="button" id="decreaseQty">−</button>
                        <input type="number" class="form-control text-center" id="quantitySelect" value="1" min="1" max="${stock}">
                        <button class="btn btn-outline-secondary" type="button" id="increaseQty">+</button>
                    </div>
                </div>

                <!-- Total Price -->
                <div class="mb-4">
                    <h5>Total: <span id="totalPrice" class="text-primary">${formatPrice(product.price)}</span></h5>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-2 mb-4">
                    <button class="btn btn-primary btn-lg flex-grow-1" id="addToCartBtn">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn btn-outline-secondary btn-lg" id="addToWishlistBtn">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>

                <!-- Share -->
                <div class="mt-4 pt-4 border-top">
                    <p class="text-muted">Share this product:</p>
                    <div class="d-flex gap-2">
                        <a href="#" class="btn btn-sm btn-outline-secondary"><i class="fab fa-facebook"></i></a>
                        <a href="#" class="btn btn-sm btn-outline-secondary"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="btn btn-sm btn-outline-secondary"><i class="fab fa-pinterest"></i></a>
                        <a href="#" class="btn btn-sm btn-outline-secondary"><i class="fab fa-whatsapp"></i></a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Attach event listeners to product details
function attachProductDetailListeners(product) {
    const quantityInput = document.getElementById('quantitySelect');
    const increaseBtn = document.getElementById('increaseQty');
    const decreaseBtn = document.getElementById('decreaseQty');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const addToWishlistBtn = document.getElementById('addToWishlistBtn');
    const totalPriceSpan = document.getElementById('totalPrice');

    // Add image zoom on hover
    const carouselImages = document.querySelectorAll('.carousel-item img');
    carouselImages.forEach(img => {
        img.addEventListener('mouseover', function () {
            this.style.transform = 'scale(1.1)';
            this.style.cursor = 'zoom-in';
        });
        img.addEventListener('mouseout', function () {
            this.style.transform = 'scale(1)';
        });
    });

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value) || 1;
            const max = parseInt(quantityInput.max) || 999;
            if (current < max) {
                quantityInput.value = current + 1;
                updateTotalPrice(product.price, quantityInput.value, totalPriceSpan);
            }
        });
    }

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value) || 1;
            if (current > 1) {
                quantityInput.value = current - 1;
                updateTotalPrice(product.price, quantityInput.value, totalPriceSpan);
            }
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('change', (e) => {
            let value = parseInt(e.target.value) || 1;
            const max = parseInt(e.target.max) || 999;
            if (value < 1) value = 1;
            if (value > max) value = max;
            e.target.value = value;
            updateTotalPrice(product.price, value, totalPriceSpan);
        });

        // Real-time price update on input
        quantityInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 0;
            if (value >= 1) {
                updateTotalPrice(product.price, value, totalPriceSpan);
            }
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            product.requestedQuantity = quantity;
            console.log('[v0] Adding product to cart from details page:', product);
            addToCart(product);

            // Show success feedback
            const originalText = addToCartBtn.textContent;
            addToCartBtn.innerHTML = '<i class="fas fa-check me-2"></i>Added to Cart!';
            addToCartBtn.disabled = true;
            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.disabled = false;
            }, 2000);
        });
    }

    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', () => {
            const btn = addToWishlistBtn;
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                btn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
                showNotification('Added to wishlist', 'success');
            } else {
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                showNotification('Removed from wishlist', 'info');
            }
        });
    }
}

// Update total price
function updateTotalPrice(price, quantity, element) {
    if (element) {
        element.textContent = formatPrice(price * quantity);
    }
}

// Load related products
async function loadRelatedProducts(category) {
    if (!category) return;

    const container = document.getElementById('relatedProducts');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error('Failed to load related products');

        const data = await response.json();
        const products = data.products.slice(0, 4);

        if (products.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '<h3 class="mb-4">Related Products</h3><div class="row">';
        products.forEach((product, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-6 mb-4';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
            col.innerHTML = createProductCard(product);
            html += col.outerHTML;
        });
        html += '</div>';

        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.dataset.id;
                const product = products.find(p => p.id == productId);
                if (product) {
                    addToCart(product);
                }
            });
        });
    } catch (error) {
        console.error('[v0] Error loading related products:', error);
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function () {
    console.log('[v0] DOM loaded - products.js initialized');
    updateCartCount();

    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    console.log('[v0] Current page:', filename);

    if (filename === 'index.html' || path === '/' || path === '' || path.endsWith('/')) {
        console.log('[v0] Home page detected');
        loadLatestProducts();
    } else if (filename === 'products.html') {
        console.log('[v0] Products page detected');
        loadAllProducts();
    } else if (filename === 'product-details.html' || filename.includes('product-details')) {
        console.log('[v0] Product details page detected');
        loadProductDetails();
    }
});
