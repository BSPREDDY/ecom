// search.js - Enhanced Search Functionality Module
(function () {
    'use strict';

    console.log('[Search] Module loading...');

    const SearchManager = {
        config: {
            debounceDelay: 300,
            maxResults: 8,
            minSearchLength: 2
        },

        elements: {
            searchInput: null,
            searchResults: null,
            searchBtn: null,
            searchInputMobile: null
        },

        state: {
            currentQuery: '',
            isSearching: false,
            lastResults: [],
            searchActive: false
        },

        // Initialize search
        init: function () {
            console.log('[Search] Initializing search...');

            this.cacheElements();

            if (!this.elements.searchInput && !this.elements.searchInputMobile) {
                console.log('[Search] No search elements found on this page');
                return;
            }

            this.setupEventListeners();
            this.createSearchResultsContainer();
            this.setupStyles();

            console.log('[Search] Search initialized');
        },

        // Cache DOM elements
        cacheElements: function () {
            this.elements.searchInput = document.getElementById('searchInput');
            this.elements.searchResults = document.getElementById('searchResults');
            this.elements.searchBtn = document.getElementById('searchBtn');
            this.elements.searchInputMobile = document.getElementById('searchInputMobile');
        },

        // Create search results container if it doesn't exist
        createSearchResultsContainer: function () {
            if (!this.elements.searchResults && this.elements.searchInput) {
                const resultsContainer = document.createElement('div');
                resultsContainer.id = 'searchResults';
                resultsContainer.className = 'search-results-container';
                resultsContainer.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    display: none;
                    max-height: 400px;
                    overflow-y: auto;
                `;

                this.elements.searchInput.parentNode.style.position = 'relative';
                this.elements.searchInput.parentNode.appendChild(resultsContainer);
                this.elements.searchResults = resultsContainer;
            }
        },

        // Setup event listeners
        setupEventListeners: function () {
            // Desktop search
            if (this.elements.searchInput) {
                let debounceTimer;

                this.elements.searchInput.addEventListener('input', (e) => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        this.handleSearch(e.target.value);
                    }, this.config.debounceDelay);
                });

                this.elements.searchInput.addEventListener('focus', () => {
                    if (this.state.lastResults.length > 0) {
                        this.showResults();
                    }
                });

                this.elements.searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch(this.elements.searchInput.value, true);
                    }
                });
            }

            // Search button
            if (this.elements.searchBtn) {
                this.elements.searchBtn.addEventListener('click', () => {
                    if (this.elements.searchInput) {
                        this.performSearch(this.elements.searchInput.value, true);
                    }
                });
            }

            // Mobile search
            if (this.elements.searchInputMobile) {
                this.elements.searchInputMobile.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch(this.elements.searchInputMobile.value, true);
                    }
                });
            }

            // Close results when clicking outside
            document.addEventListener('click', (e) => {
                if (this.elements.searchResults &&
                    !this.elements.searchResults.contains(e.target) &&
                    !this.elements.searchInput?.contains(e.target) &&
                    !this.elements.searchBtn?.contains(e.target)) {
                    this.hideResults();
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.state.searchActive) {
                    this.hideResults();
                }
            });
        },

        // Handle search input
        handleSearch: function (query) {
            this.state.currentQuery = query.trim();

            if (this.state.currentQuery.length < this.config.minSearchLength) {
                this.hideResults();
                return;
            }

            this.performSearch(this.state.currentQuery, false);
        },

        // Perform search
        performSearch: async function (query, redirect = false) {
            query = query.trim();

            if (!query || query.length < this.config.minSearchLength) {
                if (redirect) {
                    this.showToast('Please enter a search term', 'warning');
                }
                return;
            }

            console.log('[Search] Performing search:', query);

            // If redirect is true or we're not on products page, redirect
            if (redirect || !window.location.pathname.includes('products.html')) {
                window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
                return;
            }

            // Otherwise perform live search
            this.state.isSearching = true;
            this.showLoading();

            try {
                const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${this.config.maxResults}`);
                const data = await response.json();

                this.state.lastResults = data.products || [];
                this.displayResults(this.state.lastResults, query);

            } catch (error) {
                console.error('[Search] Error performing search:', error);
                this.showError();
            } finally {
                this.state.isSearching = false;
            }
        },

        // Display search results
        displayResults: function (products, query) {
            if (!this.elements.searchResults) return;

            if (products.length === 0) {
                this.elements.searchResults.innerHTML = `
                    <div class="search-no-results">
                        <div class="text-center p-3">
                            <i class="bi bi-search" style="font-size: 2rem; color: #6c757d;"></i>
                            <p class="mt-2 mb-0">No results found for "${query}"</p>
                            <small class="text-muted">Try different keywords</small>
                        </div>
                    </div>
                `;
                this.showResults();
                return;
            }

            let resultsHTML = `
                <div class="search-results-header">
                    <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <strong>Search Results</strong>
                        <small class="text-muted">${products.length} ${products.length === 1 ? 'result' : 'results'}</small>
                    </div>
                </div>
                <div class="search-results-list">
            `;

            products.forEach(product => {
                const isInCart = window.app?.cart?.some(item => item.id === product.id) || false;
                const isInWishlist = window.app?.isInWishlist?.(product.id) || false;

                resultsHTML += `
                    <a href="/product-details.html?id=${product.id}" class="search-result-item">
                        <div class="search-result-image">
                            <img src="${product.thumbnail || product.image || 'https://via.placeholder.com/60'}" 
                                 alt="${product.title}" 
                                 loading="lazy">
                        </div>
                        <div class="search-result-info">
                            <div class="search-result-title">${product.title}</div>
                            <div class="search-result-meta">
                                <span class="search-result-price">$${product.price.toFixed(2)}</span>
                                <span class="search-result-category">${product.category}</span>
                            </div>
                            <div class="search-result-actions">
                                <span class="badge bg-${isInCart ? 'success' : 'primary'}">
                                    ${isInCart ? 'In Cart' : 'Add to Cart'}
                                </span>
                                <span class="badge bg-${isInWishlist ? 'danger' : 'secondary'}">
                                    ${isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                                </span>
                            </div>
                        </div>
                    </a>
                `;
            });

            resultsHTML += `
                </div>
                <div class="search-results-footer border-top">
                    <a href="/products.html?search=${encodeURIComponent(query)}" class="view-all-results">
                        View all results for "${query}"
                        <i class="bi bi-arrow-right ms-1"></i>
                    </a>
                </div>
            `;

            this.elements.searchResults.innerHTML = resultsHTML;
            this.showResults();
        },

        // Show loading state
        showLoading: function () {
            if (!this.elements.searchResults) return;

            this.elements.searchResults.innerHTML = `
                <div class="search-loading">
                    <div class="text-center p-4">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 mb-0">Searching...</p>
                    </div>
                </div>
            `;
            this.showResults();
        },

        // Show error state
        showError: function () {
            if (!this.elements.searchResults) return;

            this.elements.searchResults.innerHTML = `
                <div class="search-error">
                    <div class="text-center p-3">
                        <i class="bi bi-exclamation-triangle" style="font-size: 2rem; color: #dc3545;"></i>
                        <p class="mt-2 mb-0">Search unavailable</p>
                        <small class="text-muted">Please try again later</small>
                    </div>
                </div>
            `;
            this.showResults();
        },

        // Show results container
        showResults: function () {
            if (this.elements.searchResults) {
                this.elements.searchResults.style.display = 'block';
                this.state.searchActive = true;
            }
        },

        // Hide results container
        hideResults: function () {
            if (this.elements.searchResults) {
                this.elements.searchResults.style.display = 'none';
                this.state.searchActive = false;
            }
        },

        // Setup CSS styles
        setupStyles: function () {
            if (!document.querySelector('#search-styles')) {
                const styles = `
                    <style id="search-styles">
                        .search-results-container {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        }
                        
                        .search-result-item {
                            display: flex;
                            align-items: center;
                            padding: 12px 16px;
                            border-bottom: 1px solid #e9ecef;
                            text-decoration: none;
                            color: #212529;
                            transition: background-color 0.15s ease-in-out;
                        }
                        
                        .search-result-item:hover {
                            background-color: #f8f9fa;
                            text-decoration: none;
                        }
                        
                        .search-result-image {
                            flex: 0 0 60px;
                            margin-right: 12px;
                        }
                        
                        .search-result-image img {
                            width: 60px;
                            height: 60px;
                            object-fit: cover;
                            border-radius: 4px;
                        }
                        
                        .search-result-info {
                            flex: 1;
                            min-width: 0;
                        }
                        
                        .search-result-title {
                            font-weight: 500;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .search-result-meta {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            margin-bottom: 6px;
                        }
                        
                        .search-result-price {
                            font-weight: 600;
                            color: #4361ee;
                        }
                        
                        .search-result-category {
                            font-size: 0.85em;
                            color: #6c757d;
                            text-transform: capitalize;
                        }
                        
                        .search-result-actions {
                            display: flex;
                            gap: 6px;
                        }
                        
                        .search-result-actions .badge {
                            font-size: 0.7em;
                            padding: 2px 6px;
                        }
                        
                        .view-all-results {
                            display: block;
                            padding: 12px 16px;
                            text-align: center;
                            background-color: #4361ee;
                            color: white;
                            text-decoration: none;
                            font-weight: 500;
                            transition: background-color 0.15s ease-in-out;
                        }
                        
                        .view-all-results:hover {
                            background-color: #3a0ca3;
                            color: white;
                            text-decoration: none;
                        }
                        
                        .search-loading,
                        .search-no-results,
                        .search-error {
                            text-align: center;
                            padding: 24px 16px;
                        }
                        
                        .search-loading .spinner-border {
                            width: 2rem;
                            height: 2rem;
                        }
                    </style>
                `;
                document.head.insertAdjacentHTML('beforeend', styles);
            }
        },

        // Show toast notification
        showToast: function (message, type = 'info') {
            if (window.showToast && typeof window.showToast === 'function') {
                window.showToast(message, type);
            } else {
                console.log(`[Search Toast] ${type}: ${message}`);
            }
        },

        // Clear search
        clearSearch: function () {
            if (this.elements.searchInput) {
                this.elements.searchInput.value = '';
            }
            if (this.elements.searchInputMobile) {
                this.elements.searchInputMobile.value = '';
            }
            this.hideResults();
            this.state.currentQuery = '';
            this.state.lastResults = [];
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SearchManager.init());
    } else {
        SearchManager.init();
    }

    // Make search manager globally available
    window.searchManager = SearchManager;

    console.log('[Search] Module loaded');
})();