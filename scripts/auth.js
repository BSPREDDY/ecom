import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from './firebase-config.js';

// Authentication state
let isUserLoggedIn = false;

// Getter function for authentication state
export function getIsUserLoggedIn() {
    return isUserLoggedIn;
}

// DOM Elements
const getElement = (id) => document.getElementById(id);

const authElements = {
    logoutBtn: getElement('logoutBtn'),
    mobileLogoutBtn: getElement('mobileLogoutBtn'),
    userAvatar: getElement('userAvatar'),
    mobileUserAvatar: getElement('mobileUserAvatar'),
    mobileUserEmail: getElement('mobileUserEmail'),
    mobileUserName: getElement('mobileUserName'),
    authModal: getElement('authModal'),
    loginRedirectBtn: getElement('loginRedirectBtn'),
    profileBtn: getElement('profileBtn'),
    closeAuthModal: getElement('closeAuthModal')
};

// Check Authentication
export function checkAuthentication() {
    return new Promise((resolve) => {
        try {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log('User is logged in:', user.email);
                    isUserLoggedIn = true;
                    updateUserProfile(user);
                    resolve(true);
                } else {
                    console.log('No user logged in');
                    isUserLoggedIn = false;
                    resetUserProfile();
                    resolve(false);
                }
            }, (error) => {
                console.error('Auth state change error:', error);
                isUserLoggedIn = false;
                resetUserProfile();
                resolve(false);
            });
        } catch (error) {
            console.error('Error checking authentication:', error);
            isUserLoggedIn = false;
            resolve(false);
        }
    });
}

// Update User Profile
function updateUserProfile(user) {
    if (!user) return;

    console.log('Updating user profile:', user);

    // Get user initial
    let userInitial = 'U';
    if (user.displayName) {
        userInitial = user.displayName.charAt(0).toUpperCase();
    } else if (user.email) {
        userInitial = user.email.charAt(0).toUpperCase();
    }

    // Try to get from localStorage as fallback
    if (!userInitial || userInitial === 'U') {
        userInitial = localStorage.getItem('userInitial') || 'U';
    }

    // Update avatars
    if (authElements.userAvatar) {
        authElements.userAvatar.textContent = userInitial;
        authElements.userAvatar.style.display = 'flex';
        authElements.userAvatar.style.backgroundColor = '#2874f0';
        authElements.userAvatar.style.color = 'white';
    }

    if (authElements.mobileUserAvatar) {
        authElements.mobileUserAvatar.textContent = userInitial;
        authElements.mobileUserAvatar.style.backgroundColor = '#2874f0';
        authElements.mobileUserAvatar.style.color = 'white';
    }

    // Update user info
    if (authElements.mobileUserEmail) {
        authElements.mobileUserEmail.textContent = user.email || 'user@example.com';
    }

    if (authElements.mobileUserName) {
        authElements.mobileUserName.textContent = user.displayName || user.email?.split('@')[0] || 'Welcome Back!';
    }

    // Store user initial for later use
    localStorage.setItem('userInitial', userInitial);
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('userName', user.displayName || user.email?.split('@')[0] || '');

    console.log('User profile updated with initial:', userInitial);
}

// Reset User Profile
function resetUserProfile() {
    console.log('Resetting user profile');

    if (authElements.userAvatar) {
        authElements.userAvatar.textContent = 'U';
        authElements.userAvatar.style.display = 'flex';
        authElements.userAvatar.style.backgroundColor = '#f1f5f9';
        authElements.userAvatar.style.color = '#64748b';
    }

    if (authElements.mobileUserAvatar) {
        authElements.mobileUserAvatar.textContent = 'U';
        authElements.mobileUserAvatar.style.backgroundColor = '#f1f5f9';
        authElements.mobileUserAvatar.style.color = '#64748b';
    }

    if (authElements.mobileUserEmail) {
        authElements.mobileUserEmail.textContent = 'user@example.com';
    }

    if (authElements.mobileUserName) {
        authElements.mobileUserName.textContent = 'Welcome Back!';
    }

    localStorage.removeItem('userInitial');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
}

// Show Authentication Modal
export function showAuthModal() {
    console.log('Showing auth modal');
    if (authElements.authModal) {
        authElements.authModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '0px';
    }
}

// Hide Authentication Modal
export function hideAuthModal() {
    console.log('Hiding auth modal');
    if (authElements.authModal) {
        authElements.authModal.classList.remove('show');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}

// Logout Function
export async function logout() {
    try {
        console.log('Logging out...');
        await signOut(auth);
        console.log('Logout successful');

        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = '../login_signup.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to sign out. Please try again.');
    }
}

// Initialize Authentication
export async function initAuth() {
    console.log('Initializing authentication...');

    // Check authentication on load
    const isAuthenticated = await checkAuthentication();

    // Setup profile button click
    if (authElements.profileBtn) {
        authElements.profileBtn.addEventListener('click', (e) => {
            // If not logged in, show auth modal
            if (!isAuthenticated) {
                e.preventDefault();
                e.stopPropagation();
                showAuthModal();
            }
        });
    }

    // Setup auth modal buttons
    if (authElements.loginRedirectBtn) {
        authElements.loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '../login_signup.html';
        });
    }

    if (authElements.closeAuthModal) {
        authElements.closeAuthModal.addEventListener('click', hideAuthModal);
    }

    return isAuthenticated;
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Get user email
export function getUserEmail() {
    return localStorage.getItem('userEmail') || '';
}

// Get user name
export function getUserName() {
    return localStorage.getItem('userName') || '';
}

// Export auth object for other modules
export { auth };