// js/products.js
let allProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// Fetch all products
async function fetchAllProducts() {
    try {
        let url = 'https://dummyjson.com/products';
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');

        if (category) {
            url = `https://dummyjson.com/products/category/${category}`;
        } else {
            url = 'https://dummyjson.com/products?limit=100';
        }

        const response = await fetch(url);
        const data = await response.json();
        allProducts = Array.isArray(data) ? data : data.products;

        displayProducts();
        setupFilters();
        setupPagination();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display products
function displayProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    // Apply filters
    let filteredProducts = applyFilters(allProducts);

    // Apply sorting
    filteredProducts = applySorting(filteredProducts);

    // Paginate
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    container.innerHTML = paginatedProducts.map(product => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card h-100">
                <img src="${product.thumbnail}" class="card-img-top product-img" alt="${product.title}">
                <div class="card-body">
                    <h6 class="card-title">${product.title}</h6>
                    <div class="rating mb-2">
                        ${generateStarRating(product.rating)}
                        <small class="text-muted">(${product.rating})</small>
                    </div>
                    <p class="price">${formatPrice(product.price)}</p>
                    <p class="card-text small text-muted">${product.description.substring(0, 80)}...</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-secondary">${product.category}</span>
                        <span class="text-muted small">Stock: ${product.stock}</span>
                    </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-primary w-100 add-to-cart-btn"
                            data-product-id="${product.id}"
                            data-product-title="${product.title}"
                            data-product-price="${product.price}"
                            data-product-image="${product.thumbnail}">
                        <i class="fas fa-cart-plus me-2"></i>Add to Cart
                    </button>
                    <a href="product-details.html?id=${product.id}" class="btn btn-outline-secondary w-100 mt-2">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Apply filters
function applyFilters(products) {
    let filtered = [...products];

    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(cb => cb.value);

    if (selectedCategories.length > 0) {
        filtered = filtered.filter(product =>
            selectedCategories.includes(product.category)
        );
    }

    // Price filter
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || 2000;

    filtered = filtered.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    );

    // Rating filter
    const selectedRatings = Array.from(document.querySelectorAll('.rating-checkbox:checked'))
        .map(cb => parseFloat(cb.value));

    if (selectedRatings.length > 0) {
        const minRating = Math.min(...selectedRatings);
        filtered = filtered.filter(product => product.rating >= minRating);
    }

    return filtered;
}

// Apply sorting
function applySorting(products) {
    const sortSelect = document.getElementById('sortProducts');
    if (!sortSelect) return products;

    const sortValue = sortSelect.value;

    switch (sortValue) {
        case 'price-low':
            return [...products].sort((a, b) => a.price - b.price);
        case 'price-high':
            return [...products].sort((a, b) => b.price - a.price);
        case 'rating':
            return [...products].sort((a, b) => b.rating - a.rating);
        default:
            return products;
    }
}

// Setup filters
function setupFilters() {
    // Load categories for filter
    loadCategoriesForFilter();

    // Price range labels
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const minPriceLabel = document.getElementById('minPriceLabel');
    const maxPriceLabel = document.getElementById('maxPriceLabel');

    if (minPriceInput && maxPriceInput) {
        minPriceInput.addEventListener('input', () => {
            minPriceLabel.textContent = `$${minPriceInput.value}`;
        });

        maxPriceInput.addEventListener('input', () => {
            maxPriceLabel.textContent = `$${maxPriceInput.value}`;
        });
    }

    // Apply filters button
    document.getElementById('applyFilters')?.addEventListener('click', () => {
        currentPage = 1;
        displayProducts();
        setupPagination();
    });

    // Reset filters button
    document.getElementById('resetFilters')?.addEventListener('click', () => {
        resetFilters();
    });

    // Sort select
    document.getElementById('sortProducts')?.addEventListener('change', () => {
        displayProducts();
    });
}

// Load categories for filter
async function loadCategoriesForFilter() {
    try {
        const response = await fetch('https://dummyjson.com/products/categories');
        const categories = await response.json();

        const container = document.getElementById('category-filters');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <div class="form-check mb-2">
                <input class="form-check-input category-checkbox" type="checkbox" id="cat-${category}" value="${category}">
                <label class="form-check-label" for="cat-${category}">
                    ${category.replace('-', ' ')}
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories for filter:', error);
    }
}

// Reset filters
function resetFilters() {
    // Reset checkboxes
    document.querySelectorAll('.category-checkbox').forEach(cb => {
        cb.checked = false;
    });

    document.querySelectorAll('.rating-checkbox').forEach(cb => {
        cb.checked = false;
    });

    // Reset price range
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    if (minPriceInput && maxPriceInput) {
        minPriceInput.value = 0;
        maxPriceInput.value = 2000;

        const minPriceLabel = document.getElementById('minPriceLabel');
        const maxPriceLabel = document.getElementById('maxPriceLabel');

        if (minPriceLabel && maxPriceLabel) {
            minPriceLabel.textContent = '$0';
            maxPriceLabel.textContent = '$2000';
        }
    }

    // Reset sort
    const sortSelect = document.getElementById('sortProducts');
    if (sortSelect) {
        sortSelect.value = 'default';
    }

    currentPage = 1;
    displayProducts();
    setupPagination();
}

// Setup pagination
function setupPagination() {
    const filteredProducts = applyFilters(allProducts);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (!paginationContainer || totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;

    paginationContainer.innerHTML = paginationHTML;

    // Add click event listeners
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            if (page && page !== currentPage) {
                currentPage = page;
                displayProducts();
                setupPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Initialize products page
if (document.getElementById('products-grid')) {
    fetchAllProducts();
}