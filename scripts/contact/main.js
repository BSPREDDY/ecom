import { initAuth, showAuthModal, hideAuthModal, logout, isUserLoggedIn } from '../auth.js';

// DOM Elements
const getElement = (id) => document.getElementById(id);

const elements = {
    // Navigation
    hamburger: getElement('hamburger'),
    mobilePanel: getElement('mobilePanel'),
    mobileOverlay: getElement('mobileOverlay'),
    mobileClose: getElement('mobileClose'),

    // Profile
    profileBtn: getElement('profileBtn'),
    profileMenu: getElement('profileMenu'),
    logoutBtn: getElement('logoutBtn'),
    mobileLogoutBtn: getElement('mobileLogoutBtn'),

    // Search
    searchBtn: getElement('searchBtn'),
    desktopSearch: getElement('desktopSearch'),
    mobileSearchBtn: getElement('mobileSearchBtn'),
    mobileSearch: getElement('mobileSearch'),

    // Cart & Wishlist
    cartBtn: getElement('cartBtn'),
    wishlistBtn: getElement('wishlistBtn'),
    cartCount: getElement('cartCount'),

    // Contact Form
    contactForm: getElement('contactForm'),

    // FAQ
    faqItems: document.querySelectorAll('.faq-item'),

    // Auth
    loginRedirectBtn: getElement('loginRedirectBtn'),
    closeAuthModal: getElement('closeAuthModal'),
    authModal: getElement('authModal'),

    // Toast
    toast: getElement('toast'),
    toastMessage: getElement('toastMessage')
};

// Initialize
function init() {
    console.log('Initializing contact page...');

    setupEventListeners();
    setupFAQ();
    setupHeaderScroll();
    updateCartBadge();

    // Initialize authentication
    initAuth().then((authenticated) => {
        console.log('User authenticated:', authenticated);
    }).catch((error) => {
        console.error('Authentication init failed:', error);
    });

    // Fix for right side white space
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    console.log('Contact page initialized successfully');
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Mobile panel
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobilePanel();
        });
    }

    if (elements.mobileClose) {
        elements.mobileClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobilePanel();
        });
    }

    if (elements.mobileOverlay) {
        elements.mobileOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobilePanel();
        });
    }

    // Profile dropdown
    if (elements.profileBtn && elements.profileMenu) {
        elements.profileBtn.addEventListener('click', toggleProfileMenu);
        document.addEventListener('click', closeProfileMenu);
    }

    // Logout buttons
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }

    if (elements.mobileLogoutBtn) {
        elements.mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Search functionality - Redirect to home page with search
    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', performSearch);
        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    if (elements.mobileSearchBtn && elements.mobileSearch) {
        elements.mobileSearchBtn.addEventListener('click', performMobileSearch);
        elements.mobileSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performMobileSearch();
        });
    }

    // Cart and wishlist
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => {
            if (isUserLoggedIn) {
                window.location.href = '../pages/cart.html';
            } else {
                showAuthModal();
            }
        });
    }

    if (elements.wishlistBtn) {
        elements.wishlistBtn.addEventListener('click', () => {
            if (isUserLoggedIn) {
                window.location.href = '../pages/wishlist.html';
            } else {
                showAuthModal();
            }
        });
    }

    // Contact form
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Auth modal buttons
    if (elements.loginRedirectBtn) {
        elements.loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '../login_signup.html';
        });
    }

    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener('click', () => {
            hideAuthModal();
        });
    }

    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.mobilePanel.classList.contains('show')) {
                closeMobilePanel();
            }
            if (elements.authModal.classList.contains('show')) {
                hideAuthModal();
            }
            closeProfileMenu();
        }
    });

    // Close mobile panel on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 880 && elements.mobilePanel.classList.contains('show')) {
            closeMobilePanel();
        }
    });

    // Close mobile panel when clicking on links (except logout)
    if (elements.mobilePanel) {
        elements.mobilePanel.querySelectorAll('a').forEach(link => {
            if (!link.id.includes('logout')) {
                link.addEventListener('click', () => {
                    setTimeout(closeMobilePanel, 300);
                });
            }
        });
    }
}

// Mobile Panel Functions
function toggleMobilePanel() {
    const isOpening = !elements.mobilePanel.classList.contains('show');

    // Toggle classes
    elements.mobilePanel.classList.toggle('show');
    elements.mobileOverlay.classList.toggle('show');

    // Toggle body scroll
    if (isOpening) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        elements.mobilePanel.setAttribute('aria-hidden', 'false');

        // Set focus to close button
        setTimeout(() => {
            elements.mobileClose.focus();
        }, 100);
    } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        elements.mobilePanel.setAttribute('aria-hidden', 'true');

        // Return focus to hamburger
        if (elements.hamburger) {
            elements.hamburger.focus();
        }
    }
}

function closeMobilePanel() {
    if (elements.mobilePanel.classList.contains('show')) {
        elements.mobilePanel.classList.remove('show');
        elements.mobileOverlay.classList.remove('show');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        elements.mobilePanel.setAttribute('aria-hidden', 'true');

        if (elements.hamburger) {
            elements.hamburger.focus();
        }
    }
}

// Profile Menu Functions
function toggleProfileMenu(e) {
    if (e) e.stopPropagation();

    if (!elements.profileMenu) return;

    const isOpen = elements.profileMenu.style.display === 'block';
    elements.profileMenu.style.display = isOpen ? 'none' : 'block';
    if (elements.profileBtn) {
        elements.profileBtn.setAttribute('aria-expanded', !isOpen);
    }
}

function closeProfileMenu() {
    if (elements.profileMenu) {
        elements.profileMenu.style.display = 'none';
    }
    if (elements.profileBtn) {
        elements.profileBtn.setAttribute('aria-expanded', 'false');
    }
}

// Logout Handler
function handleLogout(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (confirm('Are you sure you want to sign out?')) {
        logout();
    }
}

// Search Functions
function performSearch() {
    if (!elements.desktopSearch) return;
    const query = elements.desktopSearch.value.trim();
    if (!query) {
        showToast('Please enter a search term', 'warning');
        return;
    }
    // Redirect to home page with search parameter
    window.location.href = `../pages/home.html?search=${encodeURIComponent(query)}`;
}

function performMobileSearch() {
    if (!elements.mobileSearch) return;
    const query = elements.mobileSearch.value.trim();
    if (!query) {
        showToast('Please enter a search term', 'warning');
        return;
    }
    window.location.href = `../pages/home.html?search=${encodeURIComponent(query)}`;
    closeMobilePanel();
}

// FAQ Setup
function setupFAQ() {
    if (!elements.faqItems || elements.faqItems.length === 0) {
        console.warn('No FAQ items found');
        return;
    }

    console.log(`Setting up ${elements.faqItems.length} FAQ items`);

    elements.faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');

        if (!questionBtn) return;

        questionBtn.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            elements.faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Add keyboard support
        questionBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                questionBtn.click();
            }
        });
    });
}

// Header Scroll Effect
function setupHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');

            // Hide/show on scroll direction
            if (currentScroll > lastScroll && currentScroll > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('scrolled');
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

// Cart Functions
function updateCartBadge() {
    if (!elements.cartCount) return;

    try {
        let cartData = JSON.parse(localStorage.getItem('cartData')) ||
            JSON.parse(sessionStorage.getItem('cartData')) || [];
        const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
        elements.cartCount.textContent = totalItems > 99 ? '99+' : totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    } catch (error) {
        console.error('Error updating cart badge:', error);
        elements.cartCount.style.display = 'none';
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    if (!elements.toast || !elements.toastMessage) return;

    // Set message
    elements.toastMessage.textContent = message;

    // Set color based on type
    if (type === 'error') {
        elements.toast.style.background = '#ef4444';
    } else if (type === 'warning') {
        elements.toast.style.background = '#ffb300';
    } else {
        elements.toast.style.background = '#10b981';
    }

    // Show toast
    elements.toast.classList.add('show');

    // Auto hide after 3 seconds
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Contact Form Handler
function handleContactSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        subject: document.getElementById('contactSubject').value.trim(),
        message: document.getElementById('contactMessage').value.trim()
    };

    // Simple validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (!validateEmail(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Simulate form submission
    console.log('Contact form submitted:', formData);

    // Show success message
    showToast('✅ Message sent successfully! We\'ll get back to you soon.');

    // Reset form
    e.target.reset();
}

// Email validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions if needed by other modules
export { showToast, updateCartBadge, handleContactSubmit };