// scripts/contact/main.js - Contact page specific functionality
import { auth, checkAuthentication, showAuthModal, hideAuthModal, logout, getIsUserLoggedIn } from '../auth.js';

class ContactPage {
    constructor() {
        this.elements = {};
        this.cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
        this.init();
    }

    async init() {
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
    }

    cacheElements() {
        this.elements = {
            // Mobile navigation
            hamburger: document.getElementById('hamburger'),
            mobilePanel: document.getElementById('mobilePanel'),
            mobileOverlay: document.getElementById('mobileOverlay'),
            mobileClose: document.getElementById('mobileClose'),

            // Profile and auth
            profileBtn: document.getElementById('profileBtn'),
            profileMenu: document.getElementById('profileMenu'),
            logoutBtn: document.getElementById('logoutBtn'),
            mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
            authModal: document.getElementById('authModal'),
            loginRedirectBtn: document.getElementById('loginRedirectBtn'),

            // Search functionality
            searchBtn: document.getElementById('searchBtn'),
            desktopSearch: document.getElementById('desktopSearch'),
            mobileSearchBtn: document.getElementById('mobileSearchBtn'),
            mobileSearch: document.getElementById('mobileSearch'),

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
            faqItems: document.querySelectorAll('.faq-item')
        };
    }

    setupEventListeners() {
        // Mobile panel toggle
        if (this.elements.hamburger) {
            this.elements.hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobilePanel();
            });
        }

        if (this.elements.mobileClose) {
            this.elements.mobileClose.addEventListener('click', () => this.toggleMobilePanel());
        }

        if (this.elements.mobileOverlay) {
            this.elements.mobileOverlay.addEventListener('click', () => this.toggleMobilePanel());
        }

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

        if (this.elements.mobileLogoutBtn) {
            this.elements.mobileLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Search functionality
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => this.performSearch('desktop'));
        }

        if (this.elements.desktopSearch) {
            this.elements.desktopSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch('desktop');
            });
        }

        if (this.elements.mobileSearchBtn) {
            this.elements.mobileSearchBtn.addEventListener('click', () => {
                this.performSearch('mobile');
                this.toggleMobilePanel();
            });
        }

        if (this.elements.mobileSearch) {
            this.elements.mobileSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch('mobile');
                    this.toggleMobilePanel();
                }
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

        // Close mobile panel on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.mobilePanel?.classList.contains('show')) {
                    this.toggleMobilePanel();
                }
                if (this.elements.authModal?.classList.contains('show')) {
                    hideAuthModal();
                }
            }
        });

        // Close mobile panel when clicking on links (except logout)
        const mobileLinks = this.elements.mobilePanel?.querySelectorAll('a:not(#mobileLogoutBtn)');
        if (mobileLinks) {
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.elements.mobilePanel.classList.contains('show')) {
                        this.toggleMobilePanel();
                    }
                });
            });
        }
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

    toggleMobilePanel() {
        if (!this.elements.mobilePanel || !this.elements.mobileOverlay) return;

        const isOpening = !this.elements.mobilePanel.classList.contains('show');

        if (isOpening) {
            this.elements.mobilePanel.classList.add('show');
            this.elements.mobileOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            this.elements.mobilePanel.classList.remove('show');
            this.elements.mobileOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Close profile menu when opening mobile panel
        if (isOpening) {
            this.closeProfileMenu();
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

    performSearch(type) {
        let searchInput;
        if (type === 'desktop') {
            searchInput = this.elements.desktopSearch;
        } else {
            searchInput = this.elements.mobileSearch;
        }

        if (!searchInput || !searchInput.value.trim()) {
            this.showToast('Please enter a search term');
            return;
        }

        const query = encodeURIComponent(searchInput.value.trim());
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

    // Helper method to update user info in mobile panel
    updateUserInfo(user) {
        if (!user) return;

        const mobileUserAvatar = document.getElementById('mobileUserAvatar');
        const mobileUserName = document.getElementById('mobileUserName');
        const mobileUserEmail = document.getElementById('mobileUserEmail');

        if (mobileUserAvatar) {
            const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() :
                user.email ? user.email.charAt(0).toUpperCase() : 'U';
            mobileUserAvatar.textContent = initial;
        }

        if (mobileUserName) {
            mobileUserName.textContent = user.displayName || user.email?.split('@')[0] || 'Welcome Back!';
        }

        if (mobileUserEmail) {
            mobileUserEmail.textContent = user.email || 'user@example.com';
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

    // Listen for auth state changes to update UI
    auth.onAuthStateChanged((user) => {
        if (user) {
            contactPage.updateUserInfo(user);
        }
    });
});