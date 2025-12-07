// Mobile Panel Functionality
import { logout, getCurrentUser, getUserEmail, getUserName } from '/scripts/auth.js';

// DOM Elements
let mobileElements = {};

// Function to initialize mobile panel elements
function initializeMobileElements() {
    mobileElements = {
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        mobilePanel: document.getElementById('mobilePanel'),
        closeMobilePanel: document.getElementById('closeMobilePanel'),
        mobileSearchInput: document.getElementById('mobileSearchInput'),
        mobileSearchBtn: document.getElementById('mobileSearchBtn'),
        mobileUserAvatar: document.getElementById('mobileUserAvatar'),
        mobileUserEmail: document.getElementById('mobileUserEmail'),
        mobileUserName: document.getElementById('mobileUserName'),
        mobileLogoutBtn: document.getElementById('mobileLogoutBtn')
    };
}

// Function to update mobile user info (exported)
export function updateMobileUserInfo(userInitial = '', userEmail = '', userName = '') {
    console.log('Updating mobile user info with:', { userInitial, userEmail, userName });

    if (!mobileElements.mobileUserAvatar) {
        initializeMobileElements();
    }

    if (mobileElements.mobileUserAvatar) {
        const initial = userInitial || 'U';
        mobileElements.mobileUserAvatar.textContent = initial;

        if (initial !== 'U') {
            mobileElements.mobileUserAvatar.style.backgroundColor = '#2874f0';
            mobileElements.mobileUserAvatar.style.color = 'white';
        } else {
            mobileElements.mobileUserAvatar.style.backgroundColor = '#f1f5f9';
            mobileElements.mobileUserAvatar.style.color = '#64748b';
        }
    }

    if (mobileElements.mobileUserEmail) {
        mobileElements.mobileUserEmail.textContent = userEmail || 'user@example.com';
    }

    if (mobileElements.mobileUserName) {
        mobileElements.mobileUserName.textContent = userName || 'Welcome Back!';
    }

    if (mobileElements.mobileLogoutBtn) {
        const isLoggedIn = userInitial && userInitial !== 'U';
        mobileElements.mobileLogoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }
}

// Function to update mobile user info from storage (exported)
export function updateMobileUserInfoFromStorage() {
    console.log('Updating mobile user info from storage...');

    // Check localStorage for user data
    const userInitial = localStorage.getItem('userInitial');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    console.log('Storage data:', { userInitial, userEmail, userName });

    updateMobileUserInfo(userInitial, userEmail, userName);
}

// Function to update active navigation link
function updateActiveNavLink() {
    const currentPage = window.location.pathname;
    console.log('Current page:', currentPage);

    // Remove active class from all mobile nav links
    document.querySelectorAll('.mobile-nav-section a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to the current page link
    if (currentPage.includes('deals.html')) {
        const dealsLink = document.querySelector('.mobile-nav-section a[href*="deals.html"]');
        if (dealsLink) dealsLink.classList.add('active');
    } else if (currentPage.includes('about.html')) {
        const aboutLink = document.querySelector('.mobile-nav-section a[href*="about.html"]');
        if (aboutLink) aboutLink.classList.add('active');
    } else if (currentPage.includes('contact.html')) {
        const contactLink = document.querySelector('.mobile-nav-section a[href*="contact.html"]');
        if (contactLink) contactLink.classList.add('active');
    } else if (currentPage.includes('home.html') || currentPage.includes('index.html') || currentPage === '/' || currentPage === '' || currentPage.endsWith('/')) {
        const homeLink = document.querySelector('.mobile-nav-section a[href*="home.html"], .mobile-nav-section a[href*="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    } else if (currentPage.includes('wishlist.html')) {
        const wishlistLink = document.querySelector('.mobile-nav-section a[href*="wishlist.html"]');
        if (wishlistLink) wishlistLink.classList.add('active');
    }
}

// Initialize Mobile Panel
export function initMobilePanel() {
    console.log('Initializing mobile panel...');

    // Initialize elements
    initializeMobileElements();

    // Check if elements exist
    if (!mobileElements.mobileMenuBtn) {
        console.error('Mobile menu button not found! Looking for id="mobileMenuBtn"');
        return;
    }

    if (!mobileElements.mobilePanel) {
        console.error('Mobile panel not found!');
        return;
    }

    console.log('Mobile elements found:', mobileElements);

    // Open mobile panel
    mobileElements.mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileElements.mobilePanel.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateMobileUserInfoFromStorage();
        updateActiveNavLink();
        console.log('Mobile panel opened');
    });

    // Close mobile panel
    if (mobileElements.closeMobilePanel) {
        mobileElements.closeMobilePanel.addEventListener('click', () => {
            mobileElements.mobilePanel.classList.remove('show');
            document.body.style.overflow = '';
            console.log('Mobile panel closed');
        });
    }

    // Close when clicking outside
    mobileElements.mobilePanel.addEventListener('click', (e) => {
        if (e.target === mobileElements.mobilePanel) {
            mobileElements.mobilePanel.classList.remove('show');
            document.body.style.overflow = '';
            console.log('Mobile panel closed by clicking outside');
        }
    });

    // Mobile search functionality
    if (mobileElements.mobileSearchBtn && mobileElements.mobileSearchInput) {
        mobileElements.mobileSearchBtn.addEventListener('click', () => {
            const query = mobileElements.mobileSearchInput.value.trim();
            if (query) {
                // Use the global performSearch function if available
                if (typeof window.performSearch === 'function') {
                    window.performSearch(query);
                }
                mobileElements.mobilePanel.classList.remove('show');
                document.body.style.overflow = '';
                mobileElements.mobileSearchInput.value = '';
                console.log('Mobile search performed:', query);
            }
        });

        mobileElements.mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = mobileElements.mobileSearchInput.value.trim();
                if (query) {
                    if (typeof window.performSearch === 'function') {
                        window.performSearch(query);
                    }
                    mobileElements.mobilePanel.classList.remove('show');
                    document.body.style.overflow = '';
                    mobileElements.mobileSearchInput.value = '';
                    console.log('Mobile search performed (Enter):', query);
                }
            }
        });
    }

    // Mobile logout
    if (mobileElements.mobileLogoutBtn) {
        mobileElements.mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Mobile logout clicked');

            // Close panel first
            mobileElements.mobilePanel.classList.remove('show');
            document.body.style.overflow = '';

            // Call logout function
            logout().catch(error => {
                console.error('Logout error:', error);
                alert('Failed to sign out. Please try again.');
            });
        });
    }

    // Mobile navigation links
    document.querySelectorAll('.mobile-nav-section a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't prevent default for internal navigation
            mobileElements.mobilePanel.classList.remove('show');
            document.body.style.overflow = '';
            console.log('Mobile navigation link clicked');
        });
    });

    console.log('Mobile panel initialized successfully');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing mobile panel...');
    initMobilePanel();
    updateMobileUserInfoFromStorage();
});

// Update active nav links based on current page
document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;

    // Desktop navigation
    const desktopNavLinks = document.querySelectorAll('nav.primary a');
    desktopNavLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile navigation
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});