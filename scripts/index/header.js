// Header and Navigation Functionality
class HeaderManager {
    constructor() {
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initDropdowns();
        this.initMobileMenu();
        this.initSearch();
        this.updateCartBadge();
        this.updateWishlistBadge();
        this.initBackToTop();
        this.initResponsiveHeader();
    }

    cacheDOM() {
        // Mobile menu elements
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        this.mobileNavClose = document.getElementById('mobile-nav-close');
        this.mobileDropdownButtons = document.querySelectorAll('.mobile-dropdown-btn');

        // Search elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchSuggestions = document.getElementById('search-suggestions');

        // Cart elements
        this.cartBadge = document.getElementById('cart-badge');
        this.cartTotal = document.getElementById('cart-total');
        this.wishlistBadge = document.getElementById('wishlist-badge');

        // Currency selector
        this.currencySelect = document.getElementById('currency-select');

        // Back to top button
        this.backToTopBtn = document.getElementById('back-to-top');

        // Remove item buttons in cart dropdown
        this.removeItemButtons = document.querySelectorAll('.remove-item');

        // Header elements
        this.logo = document.querySelector('.logo');
        this.navContainer = document.querySelector('.nav-container');
        this.navActions = document.querySelector('.nav-actions');
        this.searchContainer = document.querySelector('.search-container');
        this.categorySelector = document.querySelector('.category-selector');
        this.navMenu = document.querySelector('.nav-menu');
    }

    initResponsiveHeader() {
        // Create responsive header for mobile
        this.createMobileHeader();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Initial responsive check
        this.handleResize();
    }

    createMobileHeader() {
        // Add styles for mobile header
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Header Styles */
            .mobile-header {
                display: none;
            }
            
            .mobile-header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 0;
            }
            
            .mobile-logo-container {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .mobile-nav-toggle {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--primary);
                cursor: pointer;
                padding: 8px;
                margin-right: 10px;
                display: none;
                z-index: 1002;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .mobile-nav-toggle {
                    display: block;
                }
                
                .mobile-header {
                    display: block;
                }
                
                .nav-main .nav-container {
                    display: none;
                }
                
                .nav-menu {
                    display: none;
                }
                
                .top-bar {
                    font-size: 0.75rem;
                    padding: 6px 0;
                }
                
                .top-offers {
                    display: none;
                }
                
                .user-utils {
                    width: 100%;
                    justify-content: center;
                    gap: 10px;
                }
                
                .user-utils a {
                    font-size: 0.75rem;
                }
            }
            
            @media (max-width: 480px) {
                .user-utils {
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .user-utils a {
                    font-size: 0.7rem;
                }
            }
        `;
        document.head.appendChild(style);

        // Create mobile header if it doesn't exist
        if (!document.querySelector('.mobile-header')) {
            const mobileHeader = document.createElement('div');
            mobileHeader.className = 'mobile-header';
            mobileHeader.innerHTML = `
                <div class="container">
                    <div class="mobile-header-content">
                        <button class="mobile-nav-toggle" id="mobile-menu-toggle">
                            <i class="fas fa-bars"></i>
                        </button>
                        <div class="mobile-logo-container">
                            ${this.logo ? this.logo.innerHTML : ''}
                        </div>
                    </div>
                </div>
            `;

            // Insert mobile header after main header
            const mainHeader = document.querySelector('.main-header');
            if (mainHeader) {
                mainHeader.appendChild(mobileHeader);
            }

            // Update mobile menu toggle reference
            this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');

            // Re-bind the event for the newly created toggle button
            this.bindMobileToggleEvent();
        }
    }

    bindMobileToggleEvent() {
        // Remove any existing event listeners first
        if (this.mobileMenuToggle) {
            const newToggle = this.mobileMenuToggle.cloneNode(true);
            this.mobileMenuToggle.parentNode.replaceChild(newToggle, this.mobileMenuToggle);
            this.mobileMenuToggle = newToggle;
        }

        // Add click event listener
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Hide desktop navigation elements
            if (this.navContainer) this.navContainer.style.display = 'none';
            if (this.navMenu) this.navMenu.style.display = 'none';

            // Show mobile header
            const mobileHeader = document.querySelector('.mobile-header');
            if (mobileHeader) mobileHeader.style.display = 'block';
        } else {
            // Show desktop navigation elements
            if (this.navContainer) this.navContainer.style.display = '';
            if (this.navMenu) this.navMenu.style.display = '';

            // Hide mobile header
            const mobileHeader = document.querySelector('.mobile-header');
            if (mobileHeader) mobileHeader.style.display = 'none';

            // Close mobile menu
            this.closeMobileMenu();
        }
    }

    bindEvents() {
        // Mobile menu toggle (will be bound after creation)
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        if (this.mobileNavClose) {
            this.mobileNavClose.addEventListener('click', () => this.closeMobileMenu());
        }

        // Mobile dropdowns
        this.mobileDropdownButtons.forEach(button => {
            button.addEventListener('click', (e) => this.toggleMobileDropdown(e));
        });

        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            this.searchInput.addEventListener('focus', () => this.showSearchSuggestions());
            document.addEventListener('click', (e) => this.handleClickOutsideSearch(e));
        }

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', (e) => this.handleSearch(e));
        }

        // Currency change
        if (this.currencySelect) {
            this.currencySelect.addEventListener('change', (e) => this.handleCurrencyChange(e));
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => this.closeAllDropdowns(e));

        // Close mobile menu when clicking on links
        document.addEventListener('click', (e) => {
            if (this.mobileNav && this.mobileNav.classList.contains('active')) {
                if (e.target.closest('a') && !e.target.closest('.mobile-dropdown-btn')) {
                    this.closeMobileMenu();
                }
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileNav && this.mobileNav.classList.contains('active')) {
                if (!this.mobileNav.contains(e.target) &&
                    !this.mobileMenuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
    }

    initDropdowns() {
        // Initialize all dropdowns
        const dropdownTriggers = document.querySelectorAll('.nav-action-item, .nav-category');

        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    this.showDropdown(trigger);
                }
            });

            trigger.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    this.hideDropdown(trigger);
                }
            });

            // Touch devices
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    this.toggleDropdown(trigger);
                }
            });
        });
    }

    initMobileMenu() {
        // Add animation styles for mobile menu
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutLeft {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-100%);
                    opacity: 0;
                }
            }

            .mobile-nav {
                position: fixed;
                top: 0;
                left: 0;
                width: 280px;
                height: 100vh;
                background: white;
                box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                z-index: 1001;
                padding: 20px;
                overflow-y: auto;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }

            .mobile-nav.active {
                transform: translateX(0);
            }

            .mobile-nav-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease;
            }

            .mobile-nav-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .mobile-nav-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }

            .mobile-nav-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                padding: 5px;
            }

            .mobile-nav-links {
                list-style: none;
            }

            .mobile-nav-links li {
                margin-bottom: 10px;
            }

            .mobile-nav-links a {
                display: flex;
                align-items: center;
                padding: 12px 15px;
                color: #333;
                text-decoration: none;
                border-radius: 8px;
                transition: background 0.2s;
            }

            .mobile-nav-links a:hover {
                background: #f5f5f5;
            }

            .mobile-nav-links a i {
                margin-right: 10px;
                width: 20px;
                text-align: center;
            }

            .mobile-nav-search {
                margin: 20px 0;
                padding: 0 15px;
            }

            .mobile-nav-search .search-wrapper {
                border-radius: 25px;
            }

            .mobile-nav-search .search-input {
                padding: 12px 20px;
                font-size: 14px;
            }

            .mobile-nav-actions {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
                padding: 0 15px;
            }

            .mobile-nav-action {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-decoration: none;
                color: #333;
                padding: 10px;
                border-radius: 8px;
                transition: background 0.2s;
            }

            .mobile-nav-action:hover {
                background: #f5f5f5;
            }

            .mobile-nav-action-icon {
                width: 40px;
                height: 40px;
                background: #f5f5f5;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 5px;
                font-size: 18px;
            }

            .mobile-nav-action-text {
                font-size: 12px;
                font-weight: 500;
            }

            @media (min-width: 769px) {
                .mobile-nav-toggle {
                    display: none;
                }
                
                .mobile-header {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);

        // Create mobile menu structure if it doesn't exist
        if (!this.mobileNav) {
            this.createMobileMenu();
        }
    }

    createMobileMenu() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        overlay.addEventListener('click', () => this.closeMobileMenu());

        // Create mobile nav
        this.mobileNav = document.createElement('nav');
        this.mobileNav.id = 'mobile-nav';
        this.mobileNav.className = 'mobile-nav';

        // Create header with logo
        const header = document.createElement('div');
        header.className = 'mobile-nav-header';
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 30px; height: 30px; background: var(--gradient-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3 style="margin: 0; font-size: 18px; color: var(--primary);">PassKart</h3>
            </div>
            <button class="mobile-nav-close" id="mobile-nav-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Create search bar for mobile
        const searchContainer = document.createElement('div');
        searchContainer.className = 'mobile-nav-search';
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <input type="text" class="search-input" placeholder="Search products...">
                <button class="search-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;

        // Create action buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'mobile-nav-actions';
        actionsContainer.innerHTML = `
            <a href="#" class="mobile-nav-action">
                <div class="mobile-nav-action-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="mobile-nav-action-text">Account</div>
            </a>
            <a href="#" class="mobile-nav-action">
                <div class="mobile-nav-action-icon">
                    <i class="fas fa-heart"></i>
                    <span class="action-badge" style="position: absolute; top: -5px; right: -5px; background: var(--secondary); color: white; font-size: 10px; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</span>
                </div>
                <div class="mobile-nav-action-text">Wishlist</div>
            </a>
            <a href="#" class="mobile-nav-action">
                <div class="mobile-nav-action-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="action-badge" style="position: absolute; top: -5px; right: -5px; background: var(--secondary); color: white; font-size: 10px; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">5</span>
                </div>
                <div class="mobile-nav-action-text">Cart</div>
            </a>
        `;

        // Create links
        const links = document.createElement('ul');
        links.className = 'mobile-nav-links';
        links.innerHTML = `
            <li><a href="/index.html"><i class="fas fa-home"></i> Home</a></li>
            <li><a href="/pages/products.html"><i class="fas fa-store"></i> Shop</a></li>
            <li><a href="#"><i class="fas fa-tag"></i> Deals</a></li>
            <li><a href="#"><i class="fas fa-star"></i> New Arrivals</a></li>
            <li><a href="#"><i class="fas fa-th-large"></i> Categories</a></li>
            <li><a href="/pages/about.html"><i class="fas fa-info-circle"></i> About</a></li>
            <li><a href="/pages/contact.html"><i class="fas fa-phone"></i> Contact</a></li>
            <li><a href="#"><i class="fas fa-question-circle"></i> Help Center</a></li>
            <li><a href="#"><i class="fas fa-shipping-fast"></i> Shipping Info</a></li>
            <li><a href="#"><i class="fas fa-undo-alt"></i> Returns</a></li>
        `;

        // Assemble mobile nav
        this.mobileNav.appendChild(header);
        this.mobileNav.appendChild(searchContainer);
        this.mobileNav.appendChild(actionsContainer);
        this.mobileNav.appendChild(links);

        // Add to body
        document.body.appendChild(overlay);
        document.body.appendChild(this.mobileNav);

        // Update DOM references
        this.mobileNavClose = document.getElementById('mobile-nav-close');

        // Bind events for mobile search
        const mobileSearchInput = searchContainer.querySelector('.search-input');
        const mobileSearchBtn = searchContainer.querySelector('.search-btn');

        if (mobileSearchInput && mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', () => {
                const query = mobileSearchInput.value.trim();
                if (query) {
                    this.performSearch(query);
                    this.closeMobileMenu();
                }
            });

            mobileSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = mobileSearchInput.value.trim();
                    if (query) {
                        this.performSearch(query);
                        this.closeMobileMenu();
                    }
                }
            });
        }

        // Re-bind events for mobile nav close button
        this.bindMobileNavCloseEvent();
    }

    bindMobileNavCloseEvent() {
        if (this.mobileNavClose) {
            // Remove any existing event listeners
            const newCloseBtn = this.mobileNavClose.cloneNode(true);
            this.mobileNavClose.parentNode.replaceChild(newCloseBtn, this.mobileNavClose);
            this.mobileNavClose = newCloseBtn;

            // Add new event listener
            this.mobileNavClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeMobileMenu();
            });
        }
    }

    initSearch() {
        // Sample search suggestions
        this.searchData = [
            { term: "smartphone", category: "electronics" },
            { term: "laptop", category: "electronics" },
            { term: "wireless headphones", category: "electronics" },
            { term: "smart watch", category: "electronics" },
            { term: "t-shirt", category: "fashion" },
            { term: "jeans", category: "fashion" },
            { term: "running shoes", category: "fashion" },
            { term: "kitchen appliances", category: "home" },
            { term: "home decor", category: "home" },
            { term: "fitness tracker", category: "sports" }
        ];
    }

    toggleMobileMenu() {
        if (!this.mobileNav) return;

        this.mobileNav.classList.toggle('active');
        const overlay = document.querySelector('.mobile-nav-overlay');
        if (overlay) {
            overlay.classList.toggle('active');
        }

        // Update toggle button icon
        if (this.mobileMenuToggle) {
            const icon = this.mobileMenuToggle.querySelector('i');
            if (icon) {
                if (this.mobileNav.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        }

        document.body.style.overflow = this.mobileNav.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        if (!this.mobileNav) return;

        this.mobileNav.classList.remove('active');
        const overlay = document.querySelector('.mobile-nav-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Reset toggle button icon
        if (this.mobileMenuToggle) {
            const icon = this.mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }

        document.body.style.overflow = '';
    }

    toggleMobileDropdown(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const dropdown = button.nextElementSibling;

        // Close other dropdowns
        this.mobileDropdownButtons.forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.nextElementSibling.classList.remove('active');
                otherButton.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
            }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('active');
        const icon = button.querySelector('.fa-chevron-down');
        icon.style.transform = dropdown.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    handleSearchInput(e) {
        if (!this.searchSuggestions) return;

        const query = e.target.value.toLowerCase().trim();

        if (query.length === 0) {
            this.searchSuggestions.classList.remove('active');
            return;
        }

        // Filter suggestions
        const suggestions = this.searchData.filter(item =>
            item.term.toLowerCase().includes(query)
        ).slice(0, 5);

        // Update suggestions display
        if (suggestions.length > 0) {
            this.searchSuggestions.innerHTML = suggestions.map(item => `
                <div class="search-suggestion-item" data-term="${item.term}">
                    <i class="fas fa-search"></i>
                    <span>${this.highlightText(item.term, query)}</span>
                    <span class="search-category">${item.category}</span>
                </div>
            `).join('');

            this.searchSuggestions.classList.add('active');

            // Add click handlers to suggestions
            const suggestionItems = this.searchSuggestions.querySelectorAll('.search-suggestion-item');
            suggestionItems.forEach(item => {
                item.addEventListener('click', () => {
                    this.searchInput.value = item.dataset.term;
                    this.searchSuggestions.classList.remove('active');
                    this.performSearch(item.dataset.term);
                });
            });
        } else {
            this.searchSuggestions.classList.remove('active');
        }
    }

    highlightText(text, query) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index >= 0) {
            return text.substring(0, index) +
                '<strong>' + text.substring(index, index + query.length) + '</strong>' +
                text.substring(index + query.length);
        }
        return text;
    }

    handleSearch(e) {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query) {
            this.performSearch(query);
        }
    }

    performSearch(query) {
        // In a real app, this would redirect to search results page
        console.log('Searching for:', query);
        this.showNotification(`Searching for "${query}"...`, 'info');

        // Simulate API call
        setTimeout(() => {
            this.showNotification(`Found results for "${query}"`, 'success');
            if (this.searchSuggestions) {
                this.searchSuggestions.classList.remove('active');
            }
        }, 500);
    }

    showSearchSuggestions() {
        if (this.searchInput && this.searchInput.value.trim().length > 0 && this.searchSuggestions) {
            this.searchSuggestions.classList.add('active');
        }
    }

    handleClickOutsideSearch(e) {
        if (!this.searchInput || !this.searchSuggestions) return;

        if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
            this.searchSuggestions.classList.remove('active');
        }
    }

    showDropdown(trigger) {
        const dropdown = trigger.querySelector('.dropdown-menu, .mega-menu');
        if (dropdown) {
            dropdown.style.display = 'block';
            dropdown.style.animation = 'slideDown 0.3s ease';
        }
    }

    hideDropdown(trigger) {
        const dropdown = trigger.querySelector('.dropdown-menu, .mega-menu');
        if (dropdown) {
            dropdown.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 300);
        }
    }

    toggleDropdown(trigger) {
        const dropdown = trigger.querySelector('.dropdown-menu, .mega-menu');
        if (dropdown) {
            if (dropdown.style.display === 'block') {
                this.hideDropdown(trigger);
            } else {
                this.showDropdown(trigger);
            }
        }
    }

    closeAllDropdowns(e) {
        if (!e.target.closest('.nav-action-item') && !e.target.closest('.nav-category')) {
            const dropdowns = document.querySelectorAll('.dropdown-menu, .mega-menu');
            dropdowns.forEach(dropdown => {
                if (dropdown.style.display === 'block') {
                    dropdown.style.animation = 'slideUp 0.3s ease';
                    setTimeout(() => {
                        dropdown.style.display = 'none';
                    }, 300);
                }
            });
        }
    }

    updateCartBadge() {
        // In a real app, this would fetch from cart API
        const cartCount = 5;
        const cartTotal = 249.99;

        if (this.cartBadge) {
            this.cartBadge.textContent = cartCount;
        }

        if (this.cartTotal) {
            this.cartTotal.textContent = `$${cartTotal.toFixed(2)}`;
        }
    }

    updateWishlistBadge() {
        // In a real app, this would fetch from wishlist API
        const wishlistCount = 3;

        if (this.wishlistBadge) {
            this.wishlistBadge.textContent = wishlistCount;
        }
    }

    handleCurrencyChange(e) {
        const currency = e.target.value;
        console.log('Currency changed to:', currency);

        // In a real app, this would update prices throughout the site
        this.showNotification(`Currency changed to ${currency}`, 'info');
    }

    initBackToTop() {
        if (!this.backToTopBtn) return;

        window.addEventListener('scroll', () => this.handleScroll());
        this.backToTopBtn.addEventListener('click', () => this.scrollToTop());
    }

    handleScroll() {
        if (this.backToTopBtn) {
            if (window.pageYOffset > 300) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    removeCartItem(e) {
        e.preventDefault();
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const itemName = cartItem.querySelector('h5').textContent;

        if (confirm(`Remove "${itemName}" from cart?`)) {
            cartItem.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                cartItem.remove();
                this.updateCartTotal();
                this.showNotification(`Removed "${itemName}" from cart`, 'success');
            }, 300);
        }
    }

    updateCartTotal() {
        // Recalculate cart total
        const cartItems = document.querySelectorAll('.cart-item');
        const cartCount = cartItems.length;

        // Update badge
        if (this.cartBadge) {
            this.cartBadge.textContent = cartCount;
        }

        // Update dropdown header
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = `(${cartCount} items)`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        } else {
            // Fallback
            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
}

// Initialize header manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const headerManager = new HeaderManager();

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(20px); }
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
        
        .search-suggestion-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            cursor: pointer;
            border-radius: var(--radius-sm);
            transition: background var(--transition-fast);
        }
        
        .search-suggestion-item:hover {
            background: var(--light-color);
        }
        
        .search-suggestion-item i {
            color: var(--medium-gray);
        }
        
        .search-category {
            margin-left: auto;
            font-size: 0.8rem;
            color: var(--medium-gray);
            background: var(--light-color);
            padding: 2px 8px;
            border-radius: var(--radius-sm);
        }

        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--gradient-primary);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        .back-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }
    `;
    document.head.appendChild(style);

    // Create back to top button if it doesn't exist
    if (!document.getElementById('back-to-top')) {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopBtn);
    }
});