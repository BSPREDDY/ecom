// scripts/contact/main.js - Contact page specific functionality
import { auth, checkAuthentication, showAuthModal, hideAuthModal, logout, getIsUserLoggedIn } from '../auth.js';
import { initMobilePanel } from '../mobile-panel.js'; // Import the mobile panel functionality

class ContactPage {
    constructor() {
        this.elements = {};
        this.cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
        this.init();
    }

    async init() {
        // Initialize mobile panel first (imported from mobile-panel.js)
        initMobilePanel();

        // Check authentication
        await checkAuthentication();

        // Initialize components
        this.cacheElements();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.updateCartBadge();
        this.setupFAQ();

        // Check if user needs to be redirected from auth modal
        this.checkAuthRedirect();

        // Update user info from storage
        this.updateUserInfoFromStorage();
    }

    cacheElements() {
        this.elements = {
            // Profile and auth
            profileBtn: document.getElementById('profileBtn'),
            profileMenu: document.getElementById('profileMenu'),
            logoutBtn: document.getElementById('logoutBtn'),
            authModal: document.getElementById('authModal'),
            loginRedirectBtn: document.getElementById('loginRedirectBtn'),

            // Search functionality
            searchBtn: document.getElementById('searchBtn'),
            desktopSearch: document.getElementById('desktopSearch'),

            // Cart and wishlist
            cartBtn: document.getElementById('cartBtn'),
            wishlistBtn: document.getElementById('wishlistBtn'),
            cartCount: document.getElementById('cartCount'),

            // Contact form
            contactForm: document.getElementById('contactForm'),

            // Toast notification
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),

            // Header
            header: document.getElementById('mainHeader'),

            // FAQ elements
            faqItems: document.querySelectorAll('.faq-item'),

            // User info elements
            userAvatar: document.getElementById('userAvatar')
        };
    }

    setupEventListeners() {
        // Profile dropdown
        if (this.elements.profileBtn) {
            this.elements.profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleProfileMenu();
            });
        }

        // Close profile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.profileBtn?.contains(e.target) &&
                !this.elements.profileMenu?.contains(e.target)) {
                this.closeProfileMenu();
            }
        });

        // Logout functionality
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Search functionality
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (this.elements.desktopSearch) {
            this.elements.desktopSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Cart and wishlist navigation
        if (this.elements.cartBtn) {
            this.elements.cartBtn.addEventListener('click', () => this.navigateToCart());
        }

        if (this.elements.wishlistBtn) {
            this.elements.wishlistBtn.addEventListener('click', () => this.navigateToWishlist());
        }

        // Contact form submission
        if (this.elements.contactForm) {
            this.elements.contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Auth modal
        if (this.elements.loginRedirectBtn) {
            this.elements.loginRedirectBtn.addEventListener('click', () => {
                hideAuthModal();
                window.location.href = '/login_signup.html';
            });
        }

        // Close auth modal on overlay click
        if (this.elements.authModal) {
            this.elements.authModal.addEventListener('click', (e) => {
                if (e.target === this.elements.authModal) {
                    hideAuthModal();
                }
            });
        }

        // Close auth modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.authModal?.classList.contains('show')) {
                    hideAuthModal();
                }
            }
        });
    }

    setupScrollEffects() {
        if (this.elements.header) {
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    this.elements.header.classList.add('scrolled');

                    // Hide header on scroll down, show on scroll up
                    if (currentScroll > lastScroll && currentScroll > 200) {
                        this.elements.header.style.transform = 'translateY(-100%)';
                    } else {
                        this.elements.header.style.transform = 'translateY(0)';
                    }
                } else {
                    this.elements.header.classList.remove('scrolled');
                    this.elements.header.style.transform = 'translateY(0)';
                }

                lastScroll = currentScroll;
            });
        }
    }

    setupFAQ() {
        if (this.elements.faqItems) {
            this.elements.faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                if (question) {
                    question.addEventListener('click', () => {
                        // Close other FAQ items
                        this.elements.faqItems.forEach(otherItem => {
                            if (otherItem !== item && otherItem.classList.contains('active')) {
                                otherItem.classList.remove('active');
                            }
                        });

                        // Toggle current item
                        item.classList.toggle('active');
                    });
                }
            });
        }
    }

    toggleProfileMenu() {
        if (!this.elements.profileMenu) return;

        const isVisible = this.elements.profileMenu.style.display === 'block';
        this.elements.profileMenu.style.display = isVisible ? 'none' : 'block';

        if (this.elements.profileBtn) {
            this.elements.profileBtn.setAttribute('aria-expanded', !isVisible);
        }
    }

    closeProfileMenu() {
        if (this.elements.profileMenu) {
            this.elements.profileMenu.style.display = 'none';
        }
        if (this.elements.profileBtn) {
            this.elements.profileBtn.setAttribute('aria-expanded', 'false');
        }
    }

    async handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Failed to sign out. Please try again.');
        }
    }

    performSearch() {
        if (!this.elements.desktopSearch || !this.elements.desktopSearch.value.trim()) {
            this.showToast('Please enter a search term');
            return;
        }

        const query = encodeURIComponent(this.elements.desktopSearch.value.trim());
        window.location.href = `/index.html?search=${query}`;
    }

    navigateToCart() {
        if (getIsUserLoggedIn()) {
            window.location.href = '/pages/cart.html';
        } else {
            showAuthModal();
        }
    }

    navigateToWishlist() {
        if (getIsUserLoggedIn()) {
            window.location.href = '/pages/wishlist.html';
        } else {
            showAuthModal();
        }
    }

    updateCartBadge() {
        if (!this.elements.cartCount) return;

        const totalItems = this.cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
        this.elements.cartCount.textContent = totalItems;

        // Hide badge if no items
        if (totalItems === 0) {
            this.elements.cartCount.style.display = 'none';
        } else {
            this.elements.cartCount.style.display = 'flex';
        }
    }

    updateUserInfoFromStorage() {
        // Update desktop avatar from localStorage
        const userInitial = localStorage.getItem('userInitial');
        if (this.elements.userAvatar && userInitial) {
            this.elements.userAvatar.textContent = userInitial;
            if (userInitial !== 'U') {
                this.elements.userAvatar.style.backgroundColor = '#2874f0';
                this.elements.userAvatar.style.color = 'white';
            }
        }
    }

    showToast(message, duration = 3000) {
        if (!this.elements.toast || !this.elements.toastMessage) return;

        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.add('show');

        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, duration);
    }

    async handleContactForm(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        // Basic validation
        if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) {
            this.showToast('Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues.email)) {
            this.showToast('Please enter a valid email address');
            return;
        }

        // Simulate form submission
        this.showToast('✅ Message sent successfully! We\'ll get back to you soon.');

        // Reset form
        e.target.reset();

        // In a real app, you would send the data to a server here
        console.log('Contact form submitted:', formValues);
    }

    checkAuthRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        const authRequired = urlParams.get('auth') === 'required';

        if (authRequired && !getIsUserLoggedIn()) {
            showAuthModal();

            // Remove the query parameter
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }
}

// Initialize the contact page
document.addEventListener('DOMContentLoaded', () => {
    // Prevent horizontal scroll
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    // Initialize the app
    const contactPage = new ContactPage();

    // Make it available globally for debugging
    window.contactPage = contactPage;
});

// Make performSearch available globally for mobile panel
window.performSearch = function (query) {
    const encodedQuery = encodeURIComponent(query);
    window.location.href = `/index.html?search=${encodedQuery}`;
};