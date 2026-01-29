// auth.js - Authentication Module for Firebase Email/Password Auth
let currentUser = null;

// Helper function to wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        console.log('[Auth] Waiting for Firebase...');

        // Check if Firebase is already ready
        if (window.firebaseReady && window.firebaseAuth) {
            console.log('[Auth] Firebase already ready');
            resolve(window.firebaseAuth);
            return;
        }

        // Listen for the firebaseReady event
        const readyHandler = () => {
            console.log('[Auth] Firebase ready event received');
            if (window.firebaseAuth) {
                resolve(window.firebaseAuth);
            } else {
                reject(new Error('Firebase Auth not available'));
            }
            document.removeEventListener('firebaseReady', readyHandler);
            clearTimeout(timeoutId);
        };

        document.addEventListener('firebaseReady', readyHandler);

        // Also check periodically
        const intervalId = setInterval(() => {
            if (window.firebaseAuth) {
                console.log('[Auth] Found Firebase Auth in interval check');
                resolve(window.firebaseAuth);
                document.removeEventListener('firebaseReady', readyHandler);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            }
        }, 100);

        // Timeout after 10 seconds
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            document.removeEventListener('firebaseReady', readyHandler);
            reject(new Error('Firebase Auth timeout - took too long to load'));
        }, 10000);
    });
}

// Initialize Auth
async function initializeAuth() {
    console.log('[Auth] Initializing authentication module...');

    try {
        // Wait for Firebase to be ready
        const auth = await waitForFirebase();
        console.log('[Auth] Firebase Auth available:', !!auth);

        // Setup form event listeners
        setupAuthForms(auth);

        // Set up auth state listener
        setupAuthStateListener(auth);

        console.log('[Auth] Authentication module initialized successfully');

    } catch (error) {
        console.error('[Auth] Failed to initialize authentication:', error.message);

        // Show user-friendly message
        const loginError = document.getElementById('loginError');
        const registerError = document.getElementById('registerError');

        if (loginError) {
            loginError.textContent = 'Authentication service is currently unavailable. Please try again later.';
            loginError.style.display = 'block';
        }

        if (registerError) {
            registerError.textContent = 'Authentication service is currently unavailable. Please try again later.';
            registerError.style.display = 'block';
        }
    }
}

// Setup form event listeners
function setupAuthForms(auth) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Setup login form
    if (loginForm) {
        console.log('[Auth] Setting up login form');
        loginForm.addEventListener('submit', (e) => handleLogin(e, auth));
    } else {
        console.warn('[Auth] Login form not found');
    }

    // Setup register form
    if (registerForm) {
        console.log('[Auth] Setting up register form');
        registerForm.addEventListener('submit', (e) => handleRegister(e, auth));
    } else {
        console.warn('[Auth] Register form not found');
    }
}

// Setup auth state listener
function setupAuthStateListener(auth) {
    auth.onAuthStateChanged(function (user) {
        currentUser = user;
        updateUIBasedOnAuth(user);
        console.log('[Auth] Auth state changed:', user ? `Logged in as ${user.email}` : 'No user');

        // Store user info for other modules
        window.currentUser = user;

        // Update cart/wishlist counts if user logs in/out
        if (user) {
            // User logged in - you could load user-specific cart/wishlist here
            console.log('[Auth] User logged in, display name:', user.displayName);
        } else {
            // User logged out
            console.log('[Auth] User logged out');
        }
    });
}

// Update UI based on authentication state
function updateUIBasedOnAuth(user) {
    const loginMenuItem = document.getElementById('loginMenuItem');
    const registerMenuItem = document.getElementById('registerMenuItem');
    const profileMenuItem = document.getElementById('profileMenuItem');
    const ordersMenuItem = document.getElementById('ordersMenuItem');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    const userName = document.getElementById('userName');

    if (user) {
        // User is logged in
        if (loginMenuItem) loginMenuItem.style.display = 'none';
        if (registerMenuItem) registerMenuItem.style.display = 'none';
        if (profileMenuItem) profileMenuItem.style.display = 'block';
        if (ordersMenuItem) ordersMenuItem.style.display = 'block';
        if (logoutMenuItem) logoutMenuItem.style.display = 'block';
        if (userName) {
            const displayName = user.displayName || user.email.split('@')[0];
            userName.textContent = displayName;
        }
    } else {
        // User is logged out
        if (loginMenuItem) loginMenuItem.style.display = 'block';
        if (registerMenuItem) registerMenuItem.style.display = 'block';
        if (profileMenuItem) profileMenuItem.style.display = 'none';
        if (ordersMenuItem) ordersMenuItem.style.display = 'none';
        if (logoutMenuItem) logoutMenuItem.style.display = 'none';
        if (userName) userName.textContent = 'Account';
    }
}

// Handle login
async function handleLogin(e, auth) {
    e.preventDefault();
    console.log('[Auth] Login attempt');

    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        showError('Please fill in all fields', errorDiv);
        return;
    }

    try {
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
        }

        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        console.log('[Auth] Login successful:', email);
        showToast('Login successful! Welcome back.', 'success');

        // Close modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            const modal = bootstrap.Modal.getInstance(loginModal);
            if (modal) modal.hide();
        }

        // Reset form
        if (errorDiv) errorDiv.style.display = 'none';
        e.target.reset();

        // Update UI
        updateUIBasedOnAuth(userCredential.user);

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 500);

    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        handleAuthError(error, errorDiv);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
        }
    }
}

// Handle registration
async function handleRegister(e, auth) {
    e.preventDefault();
    console.log('[Auth] Registration attempt');

    const name = document.getElementById('registerName')?.value?.trim();
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
    const errorDiv = document.getElementById('registerError');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields', errorDiv);
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match', errorDiv);
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters', errorDiv);
        return;
    }

    try {
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Update profile with display name
        await userCredential.user.updateProfile({
            displayName: name
        });

        console.log('[Auth] Registration successful:', email);
        showToast('Account created successfully! Logging you in...', 'success');

        // Close modal
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
            const modal = bootstrap.Modal.getInstance(registerModal);
            if (modal) modal.hide();
        }

        // Reset form and error
        if (errorDiv) errorDiv.style.display = 'none';
        e.target.reset();

        // Update UI
        updateUIBasedOnAuth(userCredential.user);

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 500);

    } catch (error) {
        console.error('[Auth] Registration error:', error.message);
        handleAuthError(error, errorDiv);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-person-plus"></i> Create Account';
        }
    }
}

// Handle logout
async function handleLogout() {
    console.log('[Auth] Logout attempt');

    try {
        const auth = window.firebaseAuth;
        if (!auth) {
            console.error('[Auth] Firebase Auth not available');
            showToast('Error logging out', 'danger');
            return;
        }

        await auth.signOut();
        console.log('[Auth] Logout successful');
        showToast('Logged out successfully', 'success');

        // Reset cart and wishlist for privacy
        window.cartItems = [];
        window.wishlistItems = [];
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');

        // Update UI
        updateUIBasedOnAuth(null);

        // Redirect to home
        setTimeout(() => {
            window.location.href = '/';
        }, 500);

    } catch (error) {
        console.error('[Auth] Logout error:', error.message);
        showToast('Error logging out', 'danger');
    }
}

// Handle auth errors
function handleAuthError(error, errorDiv) {
    let message = 'An error occurred';

    if (error.code === 'auth/user-not-found') {
        message = 'User account not found. Please register first.';
    } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use. Please login instead.';
    } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
    } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password authentication is not enabled.';
    } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many login attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
    } else {
        message = error.message || 'Authentication failed. Please try again.';
    }

    showError(message, errorDiv);
}

// Show error message
function showError(message, errorDiv) {
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    console.error('[Auth] Error:', message);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toastEl || !toastMessage) {
        console.log(`[Auth] Toast: ${message} (${type})`);
        return;
    }

    toastMessage.textContent = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;

    if (window.bootstrap) {
        const toast = new window.bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Export functions for global use
window.handleLogout = handleLogout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;