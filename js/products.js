// Products Page Module - Product Listing and Filtering
(function () {
    'use strict';

    const API_URL = 'https://dummyjson.com/products';
    const ITEMS_PER_PAGE = 12;

    let allProducts = [];
    let filteredProducts = [];
    let categories = [];
    let currentPage = 1;

    // Initialize products page
    async function initializeProductsPage() {
        console.log("[Products] Initializing products page...");
        await fetchProducts();
        setupEventListeners();
        renderProducts();
        console.log("[Products] Products page loaded");
    }

    // Fetch products from API
    async function fetchProducts() {
        try {
            showLoadingSkeleton();
            const response = await fetch(`${API_URL}?limit=100`);
            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            allProducts = data.products || [];
            filteredProducts = [...allProducts];

            // Extract categories
            categories = [...new Set(allProducts.map(p => p.category))].sort();
            populateCategoryFilter();

            console.log("[Products] Loaded", allProducts.length, "products");
        } catch (error) {
            console.error("[Products] Error fetching products:", error);
            showToast('Error loading products', 'error');
        }
    }

    // Populate category filter
    function populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Clear existing options (except "All Categories")
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortFilter = document.getElementById('sortFilter');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
        if (priceFilter) priceFilter.addEventListener('input', applyFilters);
        if (sortFilter) sortFilter.addEventListener('change', applyFilters);
        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    }

    // Apply filters and sorting
    function applyFilters() {
        const categoryValue = document.getElementById('categoryFilter')?.value || '';
        const priceValue = parseInt(document.getElementById('priceFilter')?.value || 10000);
        const sortValue = document.getElementById('sortFilter')?.value || 'newest';
        const searchValue = (document.getElementById('searchInput')?.value || '').toLowerCase();

        // Filter products
        filteredProducts = allProducts.filter(product => {
            const matchCategory = !categoryValue || product.category === categoryValue;
            const matchPrice = product.price <= priceValue;
            const matchSearch = !searchValue ||
                product.title.toLowerCase().includes(searchValue) ||
                (product.description && product.description.toLowerCase().includes(searchValue));

            return matchCategory && matchPrice && matchSearch;
        });

        // Apply sorting
        switch (sortValue) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }

        currentPage = 1;
        renderProducts();
    }

    // Render products
    function renderProducts() {
        const container = document.getElementById('productsContainer');
        const noProducts = document.getElementById('noProducts');
        const pagination = document.getElementById('pagination');

        if (!container) return;

        if (filteredProducts.length === 0) {
            container.innerHTML = '';
            if (noProducts) noProducts.style.display = 'block';
            if (pagination) pagination.innerHTML = '';
            return;
        }

        if (noProducts) noProducts.style.display = 'none';

        // Pagination
        const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageProducts = filteredProducts.slice(startIndex, endIndex);

        // Render
        container.innerHTML = pageProducts.map(product => createProductCard(product)).join('');

        // Setup product card listeners
        setupProductCardListeners();

        // Render pagination
        renderPagination(totalPages);
    }

    // Create product card
    function createProductCard(product) {
        const rating = product.rating ? product.rating.toFixed(1) : '4.5';
        const discount = product.discountPercentage ? Math.round(product.discountPercentage) : 0;

        return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image cursor-pointer" onclick="goToProductDetails(${product.id})">
                        <img src="${product.thumbnail || product.image}" alt="${product.title}" loading="lazy"
                             onerror="this.src='https://via.placeholder.com/300?text=Product'">
                        ${discount > 0 ? `<span class="badge bg-danger">-${discount}%</span>` : ''}
                    </div>
                    <div class="product-info">
                        <p class="product-category">${product.category}</p>
                        <h5 class="product-title">${product.title}</h5>
                        <div class="product-rating">
                            <span class="stars">${'★'.repeat(Math.floor(rating))}</span>
                            <span>(${rating})</span>
                        </div>
                        <div class="product-price">
                            $${product.price.toFixed(2)}
                        </div>
                        <div class="product-buttons">
                            <button class="btn btn-primary btn-sm flex-grow-1" onclick="addProductToCart(${product.id}, event)">
                                <i class="bi bi-cart-plus"></i> Add
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="toggleProductWishlist(${product.id}, event)">
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup product card listeners
    function setupProductCardListeners() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.product-buttons')) {
                    const productId = parseInt(card.dataset.productId);
                    goToProductDetails(productId);
                }
            });
        });
    }

    // Go to product details
    function goToProductDetails(productId) {
        window.location.href = `/product-details.html?id=${productId}`;
    }

    // Add to cart
    function addProductToCart(productId, event) {
        if (event) event.stopPropagation();
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            if (window.app && typeof window.app.addToCart === 'function') {
                window.app.addToCart(product, 1);
            } else {
                console.error('[Products] App not available');
                showToast('Failed to add to cart', 'error');
            }
        }
    }

    // Toggle wishlist
    function toggleProductWishlist(productId, event) {
        if (event) event.stopPropagation();
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            if (window.app && typeof window.app.toggleWishlist === 'function') {
                window.app.toggleWishlist(product);
            } else {
                console.error('[Products] App not available');
                showToast('Failed to update wishlist', 'error');
            }
        }
    }

    // Render pagination
    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let html = '';
        if (currentPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">Previous</a></li>`;
        }

        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
            </li>`;
        }

        if (currentPage < totalPages) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">Next</a></li>`;
        }

        pagination.innerHTML = html;
    }

    // Go to page
    function goToPage(page) {
        currentPage = page;
        renderProducts();
        window.scrollTo(0, 0);
    }

    // Reset filters
    function resetFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortFilter = document.getElementById('sortFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) categoryFilter.value = '';
        if (priceFilter) priceFilter.value = 10000;
        if (sortFilter) sortFilter.value = 'newest';
        if (searchInput) searchInput.value = '';

        applyFilters();
    }

    // Show loading skeleton
    function showLoadingSkeleton() {
        const skeleton = document.getElementById('loadingSkeleton');
        if (!skeleton) return;

        let html = '';
        for (let i = 0; i < 12; i++) {
            html += `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="product-card">
                        <div class="skeleton skeleton-image"></div>
                        <div class="product-info">
                            <div class="skeleton skeleton-text" style="width: 60%; height: 12px;"></div>
                            <div class="skeleton skeleton-text skeleton-title" style="height: 16px;"></div>
                            <div class="skeleton skeleton-text" style="width: 80%; height: 12px; margin: 8px 0;"></div>
                            <div class="skeleton skeleton-text" style="width: 40%; height: 12px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        skeleton.innerHTML = html;
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProductsPage);
    } else {
        initializeProductsPage();
    }

    // Export functions for global use
    window.initializeProductsPage = initializeProductsPage;
    window.goToProductDetails = goToProductDetails;
    window.addProductToCart = addProductToCart;
    window.toggleProductWishlist = toggleProductWishlist;
    window.goToPage = goToPage;
    window.resetFilters = resetFilters;
    window.applyFilters = applyFilters;
})();