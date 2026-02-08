// categories.js - UPDATED IMAGE URLS
// ===============================
// Category Management Module
// ===============================

// Use API_BASE_URL from products.js (already declared globally)
const CATEGORY_API = `${API_BASE_URL}/products/categories`;
const CATEGORY_PRODUCT_API = (category) => `${API_BASE_URL}/products/category/${encodeURIComponent(category)}`;

// CATEGORY IMAGES - Map each category to a relevant image (FIXED URLs)
const CATEGORY_IMAGES = {
    electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    jewelery: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    "men's clothing": 'https://images.unsplash.com/photo-1521572163474-68674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    "mens clothing": 'https://images.unsplash.com/photo-1521572163474-68674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    "women's clothing": 'https://images.unsplash.com/photo-1491553895917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    "womens clothing": 'https://images.unsplash.com/photo-1491553895917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    beauty: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    fragrances: 'https://images.unsplash.com/photo-1587318014919-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    groceries: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
};

// Get image URL for a category
function getCategoryImage(category) {
    if (!category) return CATEGORY_IMAGES.default;

    let categoryName = '';

    if (typeof category === 'object' && category !== null) {
        categoryName = category.name || category.slug || '';
    } else if (typeof category === 'string') {
        categoryName = category;
    }

    const key = categoryName.toLowerCase().trim();
    return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.default;
}

// Format category name properly
function formatCategoryName(category) {
    if (!category) return 'Unknown';

    let categoryName = '';

    if (typeof category === 'object' && category !== null) {
        categoryName = category.name || category.slug || 'Unknown';
    } else if (typeof category === 'string') {
        categoryName = category;
    } else {
        return 'Unknown';
    }

    return categoryName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Create category card with proper image handling
function createCategoryCard(category) {
    const categoryName = formatCategoryName(category);
    const categoryImage = getCategoryImage(category);
    const categorySlug = typeof category === 'object' ? (category.slug || category.name) : category;

    // Use a simple placeholder if main image fails
    const placeholderUrl = `https://via.placeholder.com/300x200/6c757d/ffffff?text=${categoryName.substring(0, 15)}`;

    return `
        <div class="card category-card h-100 shadow-sm border-0 hover-effect">
            <div class="category-image-wrapper overflow-hidden" style="height: 200px; background-color: #f8f9fa;">
                <img src="${categoryImage}" 
                     class="card-img-top w-100 h-100" 
                     style="object-fit: cover; transition: transform 0.3s ease;"
                     alt="${categoryName}"
                     onerror="this.onerror=null; this.src='${placeholderUrl}';">
            </div>
            <div class="card-body d-flex flex-column text-center p-3">
                <h5 class="card-title mb-3 fw-bold">${categoryName}</h5>
                <a href="categories.html?category=${encodeURIComponent(categorySlug)}" 
                   class="btn btn-primary mt-auto px-4">
                    Shop Now <i class="fas fa-arrow-right ms-2"></i>
                </a>
            </div>
        </div>
    `;
}

// Create product card for categories page
function createProductCardForCategory(product) {
    const description = product.description ? product.description.substring(0, 60) + '...' : 'No description';
    const placeholderUrl = `https://via.placeholder.com/300x200/6c757d/ffffff?text=Product+${product.id}`;

    return `
        <div class="card product-card h-100 shadow-sm border-0 hover-effect">
            <div style="height: 200px; overflow: hidden; background-color: #f8f9fa;">
                <img src="${product.thumbnail || placeholderUrl}" 
                     class="card-img-top w-100 h-100" 
                     alt="${product.title}"
                     style="object-fit: cover; transition: transform 0.3s ease;"
                     onerror="this.onerror=null; this.src='${placeholderUrl}';">
            </div>
            <div class="card-body d-flex flex-column p-3">
                <h6 class="card-title fw-bold mb-2">${product.title}</h6>
                <p class="card-text text-muted small flex-grow-1 mb-2">${description}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="text-primary fw-bold fs-5">${formatPrice(product.price)}</span>
                    <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Add CSS for hover effects
function addCategoryStyles() {
    if (!document.getElementById('category-styles')) {
        const style = document.createElement('style');
        style.id = 'category-styles';
        style.textContent = `
            .hover-effect:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                transition: all 0.3s ease;
            }
            .category-card, .product-card {
                transition: all 0.3s ease;
            }
            .category-image-wrapper img:hover {
                transform: scale(1.05);
            }
            .card-title {
                color: #333;
                min-height: 3rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
}

// Load featured categories for home page
async function loadFeaturedCategories() {
    const container = document.getElementById('categoryList');
    if (!container) {
        console.log('Category list container not found');
        return;
    }

    // Add styles for category cards
    addCategoryStyles();

    showLoading(container, 'Loading categories...');

    try {
        const response = await fetch(CATEGORY_API);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();

        container.innerHTML = '';

        // Display top 8 categories
        const featuredCategories = categories.slice(0, 8);

        if (featuredCategories.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h4>No categories found</h4>
                    <p class="text-muted">Categories will appear here soon</p>
                </div>
            `;
            return;
        }

        featuredCategories.forEach((category, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
            col.innerHTML = createCategoryCard(category);
            container.appendChild(col);
        });

        console.log(`Loaded ${featuredCategories.length} categories`);
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Failed to load categories</h4>
                <p class="text-muted">Please check your connection and try again</p>
                <button onclick="loadFeaturedCategories()" class="btn btn-primary mt-3">
                    <i class="fas fa-redo me-2"></i>Retry
                </button>
            </div>
        `;
    }
}

// Load all categories for categories page
async function loadAllCategoryCards() {
    const container = document.getElementById('categoryList');
    if (!container) {
        console.log('Category list container not found');
        return;
    }

    // Add styles for category cards
    addCategoryStyles();

    showLoading(container, 'Loading categories...');

    try {
        const response = await fetch(CATEGORY_API);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();

        container.innerHTML = '';

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h4>No categories available</h4>
                    <p class="text-muted">Check back later for new categories</p>
                </div>
            `;
            return;
        }

        categories.forEach((category, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            col.style.animation = `fadeIn 0.5s ease-out ${index * 0.05}s both`;
            col.innerHTML = createCategoryCard(category);
            container.appendChild(col);
        });

        console.log(`Loaded ${categories.length} categories`);
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Failed to load categories</h4>
                <p class="text-muted">Please try again later</p>
                <button onclick="loadAllCategoryCards()" class="btn btn-primary mt-3">
                    <i class="fas fa-redo me-2"></i>Retry
                </button>
            </div>
        `;
    }
}

// Load products for a specific category
async function loadCategoryProducts(category) {
    console.log('Loading products for category:', category);

    const categoryName = formatCategoryName(category);
    const titleElement = document.getElementById('categoryTitle');
    if (titleElement) {
        titleElement.textContent = categoryName;
        // Add a back button
        titleElement.innerHTML = `
            <div class="d-flex align-items-center">
                <button onclick="window.history.back()" class="btn btn-outline-secondary me-3">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span>${categoryName}</span>
            </div>
        `;
    }

    const container = document.getElementById('categoryProducts');
    if (!container) {
        console.log('categoryProducts container not found');
        return;
    }

    // Hide the category list
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        categoryList.style.display = 'none';
    }

    showLoading(container, `Loading ${categoryName} products...`);

    try {
        const response = await fetch(CATEGORY_PRODUCT_API(category));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const products = data.products || [];

        displayCategoryProductsGrid(products);
    } catch (error) {
        console.error('Error loading category products:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Failed to load products</h4>
                <p class="text-muted">Please try again later</p>
                <a href="categories.html" class="btn btn-primary mt-3">
                    <i class="fas fa-arrow-left me-2"></i>Back to Categories
                </a>
            </div>
        `;
    }
}

// Display products in grid
function displayCategoryProductsGrid(products) {
    const container = document.getElementById('categoryProducts');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h4>No products found</h4>
                <p class="text-muted">This category currently has no products</p>
                <a href="categories.html" class="btn btn-primary mt-3">
                    <i class="fas fa-arrow-left me-2"></i>Browse Categories
                </a>
            </div>
        `;
        return;
    }

    const row = document.createElement('div');
    row.className = 'row';

    products.forEach((product, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        col.style.animation = `fadeIn 0.5s ease-out ${index * 0.05}s both`;
        col.innerHTML = createProductCardForCategory(product);
        row.appendChild(col);
    });

    container.appendChild(row);

    // Update the results count
    const resultsCount = document.createElement('div');
    resultsCount.className = 'row mb-4';
    resultsCount.innerHTML = `
        <div class="col-12">
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Found ${products.length} product${products.length !== 1 ? 's' : ''} in this category
            </div>
        </div>
    `;
    container.insertBefore(resultsCount, row);

    // Attach event listeners to add-to-cart buttons
    row.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.dataset.id);
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

// Helper function for loading state
function showLoading(container, message = 'Loading...') {
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4>${message}</h4>
        </div>
    `;
}

// Initialize categories page
async function initCategoriesPage() {
    const category = getQueryParam('category');

    if (category) {
        await loadCategoryProducts(category);
    } else {
        await loadAllCategoryCards();
    }
}

// Initialize page based on URL
function initializeCategories() {
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/' || path === '' || path.endsWith('/')) {
        console.log('Initializing home page categories');
        loadFeaturedCategories();
    } else if (path.includes('categories.html')) {
        console.log('Initializing categories page');
        initCategoriesPage();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing categories module');

    // Wait a bit to ensure other scripts are loaded
    setTimeout(() => {
        if (typeof API_BASE_URL !== 'undefined') {
            initializeCategories();
        } else {
            console.warn('API_BASE_URL not found, retrying...');
            // Check again after 500ms
            setTimeout(() => {
                if (typeof API_BASE_URL !== 'undefined') {
                    initializeCategories();
                } else {
                    console.error('API_BASE_URL is still not defined');
                    // Show error message
                    const container = document.getElementById('categoryList') || document.getElementById('categoryProducts');
                    if (container) {
                        container.innerHTML = `
                            <div class="col-12 text-center py-5">
                                <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                                <h4>Configuration Error</h4>
                                <p class="text-muted">Please refresh the page or contact support</p>
                                <button onclick="window.location.reload()" class="btn btn-primary mt-3">
                                    <i class="fas fa-redo me-2"></i>Refresh Page
                                </button>
                            </div>
                        `;
                    }
                }
            }, 500);
        }
    }, 100);
});