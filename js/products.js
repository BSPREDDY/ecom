// API Base URL
const API_BASE_URL = 'https://dummyjson.com';

// Helper functions
function showLoading(container) {
    container.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-3x text-muted"></i></div>';
}

function showError(container, message) {
    container.innerHTML = `<div class="text-center py-5"><i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i><h4>${message}</h4></div>`;
}

function addToCart(product) {
    console.log(`Added ${product.title} to cart`);
}

function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch and display categories on home page
async function loadCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();

        container.innerHTML = '';

        // Display top 8 categories
        categories.slice(0, 8).forEach((category, index) => {
            // Ensure category is a string
            const categoryStr = typeof category === 'string' ? category : String(category);
            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-6 mb-4 category-col';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
            col.innerHTML = `
                <div class="card category-card h-100">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                         class="card-img-top" alt="${categoryStr}"
                         onerror="this.src='https://via.placeholder.com/300'">
                    <div class="card-body text-center">
                        <h5 class="card-title">${categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)}</h5>
                        <a href="categories.html?category=${encodeURIComponent(categoryStr)}" class="btn btn-outline-primary">Shop Now</a>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showError(container, 'Failed to load categories. Please try again later.');
    }
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

        data.products.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4 product-col';
            col.style.animation = 'fadeIn 0.5s ease-out';
            col.innerHTML = createProductCard(product);
            container.appendChild(col);
        });

        // Add event listeners to "Add to Cart" buttons
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.dataset.id;
                const product = data.products.find(p => p.id == productId);
                addToCart(product);
            });
        });
    } catch (error) {
        console.error('Error loading latest products:', error);
        showError(container, 'Failed to load products. Please try again later.');
    }
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
            addToCart(product);
        });
    });
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="card product-card h-100">
            <img src="${product.thumbnail || 'https://via.placeholder.com/300'}" 
                 class="card-img-top product-img" 
                 alt="${product.title}"
                 onerror="this.src='https://via.placeholder.com/300'">
            <div class="card-body">
                <h6 class="card-title product-title">${product.title}</h6>
                <div class="product-rating mb-2">
                    ${generateStarRating(product.rating)}
                    <small class="text-muted">(${product.rating})</small>
                </div>
                <p class="product-price">${formatPrice(product.price)}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <a href="product-details.html?id=${product.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                    <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Generate star rating HTML
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

// Populate categories for filter
function populateCategories(products) {
    const categorySelect = document.getElementById('categoryFilter');
    if (!categorySelect) return;

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
            sortedProducts.sort((a, b) => b.rating - a.rating);
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

// Load product details
async function loadProductDetails() {
    const productId = getQueryParam('id');
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    const container = document.getElementById('productDetails');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();

        container.innerHTML = createProductDetailsHTML(product);

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn.addEventListener('click', () => addToCart(product));

        // Load related products
        loadRelatedProducts(product.category, productId);
    } catch (error) {
        console.error('Error loading product details:', error);
        showError(container, 'Failed to load product details. Please try again.');
    }
}

// Create product details HTML
function createProductDetailsHTML(product) {
    return `
        <div class="row">
            <div class="col-md-6">
                <div id="productImages" class="carousel slide">
                    <div class="carousel-inner">
                        ${(product.images || [product.thumbnail]).map((img, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${img}" class="d-block w-100" alt="${product.title}"
                                     onerror="this.src='https://via.placeholder.com/600'">
                            </div>
                        `).join('')}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#productImages" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#productImages" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                </div>
                <div class="thumbnails mt-3">
                    ${(product.images || [product.thumbnail]).map((img, index) => `
                        <img src="${img}" class="thumbnail-img ${index === 0 ? 'active' : ''}" 
                             data-bs-target="#productImages" data-bs-slide-to="${index}"
                             onerror="this.src='https://via.placeholder.com/100'">
                    `).join('')}
                </div>
            </div>
            <div class="col-md-6">
                <h2>${product.title}</h2>
                <div class="product-rating mb-3">
                    ${generateStarRating(product.rating)}
                    <span class="ms-2">${product.rating} (${product.stock} in stock)</span>
                </div>
                <h3 class="text-primary mb-3">${formatPrice(product.price)}</h3>
                <p class="mb-4">${product.description}</p>
                
                <div class="mb-4">
                    <h5>Brand: <span class="text-muted">${product.brand || 'N/A'}</span></h5>
                    <h5>Category: <span class="text-muted">${product.category}</span></h5>
                </div>
                
                <div class="d-flex align-items-center mb-4">
                    <div class="quantity-control me-3">
                        <button class="btn btn-outline-secondary quantity-btn" onclick="changeQuantity(-1)">-</button>
                        <span id="quantity" class="mx-2">1</span>
                        <button class="btn btn-outline-secondary quantity-btn" onclick="changeQuantity(1)">+</button>
                    </div>
                    <button id="addToCartBtn" class="btn btn-primary btn-lg">
                        <i class="fas fa-cart-plus me-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load related products
async function loadRelatedProducts(category, excludeId) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(category)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Filter out current product
        const related = (data.products || []).filter(p => p.id != excludeId).slice(0, 4);

        if (related.length === 0) return;

        container.innerHTML = '<h3 class="mb-4">Related Products</h3>';

        const row = document.createElement('div');
        row.className = 'row';

        related.forEach((product, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-6 mb-4 product-col';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
            col.innerHTML = createProductCard(product);
            row.appendChild(col);
        });

        container.appendChild(row);

        // Add event listeners
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.dataset.id;
                const product = related.find(p => p.id == productId);
                addToCart(product);
            });
        });
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Quantity control
function changeQuantity(delta) {
    const quantityElement = document.getElementById('quantity');
    let quantity = parseInt(quantityElement.textContent);
    quantity = Math.max(1, quantity + delta);
    quantityElement.textContent = quantity;
}

// Load categories page
async function loadCategoriesPage() {
    const category = getQueryParam('category');
    const container = document.getElementById('categoryProducts');

    if (!container) return;

    if (category) {
        // Load specific category products
        document.getElementById('categoryTitle').textContent =
            category.charAt(0).toUpperCase() + category.slice(1);

        showLoading(container);

        try {
            const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            displayProducts(data.products || []);

        } catch (error) {
            console.error('Error loading category products:', error);
            showError(container, 'Failed to load category products. Please try again later.');
        }
    } else {
        // Load all categories
        loadAllCategories();
    }
}

// Load all categories for categories page
async function loadAllCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();

        container.innerHTML = '';

        categories.forEach((category, index) => {
            // Ensure category is a string
            const categoryStr = typeof category === 'string' ? category : String(category);
            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-6 mb-4 category-col';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
            col.innerHTML = `
                <div class="card category-card h-100">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                         class="card-img-top" alt="${categoryStr}"
                         onerror="this.src='https://via.placeholder.com/300'">
                    <div class="card-body text-center">
                        <h5 class="card-title">${categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)}</h5>
                        <a href="categories.html?category=${encodeURIComponent(categoryStr)}" class="btn btn-outline-primary">Shop Now</a>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showError(container, 'Failed to load categories. Please try again later.');
    }
}

// Search products
async function searchProducts() {
    const query = getQueryParam('q');
    const container = document.getElementById('searchResults');

    if (!container || !query) {
        return;
    }

    document.getElementById('searchQuery').textContent = query;
    showLoading(container);

    try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        displaySearchResults(data.products || []);
    } catch (error) {
        console.error('Error searching products:', error);
        showError(container, 'Failed to search products. Please try again later.');
    }
}

// Display search results
function displaySearchResults(products) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No products found</h4>
                <p class="text-muted">Try adjusting your search term or filters</p>
                <a href="products.html" class="btn btn-primary mt-3">Browse All Products</a>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="row" id="searchResultsGrid"></div>';
    const grid = document.getElementById('searchResultsGrid');

    products.forEach((product, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4 product-col';
        col.style.animation = `fadeIn 0.5s ease-out ${index * 0.05}s both`;
        col.innerHTML = createProductCard(product);
        grid.appendChild(col);
    });

    // Add event listeners to "Add to Cart" buttons
    grid.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.dataset.id;
            const product = products.find(p => p.id == productId);
            addToCart(product);
        });
    });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/') {
        loadCategories();
        loadLatestProducts();
    } else if (path.includes('products.html')) {
        loadAllProducts();
    } else if (path.includes('product-details.html')) {
        loadProductDetails();
    } else if (path.includes('categories.html')) {
        loadCategoriesPage();
    } else if (path.includes('search.html')) {
        const query = getQueryParam('q');
        if (query) {
            searchProducts();
        }
    }
});
