// js/auth.js
import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // Form toggle
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginToggle && signupToggle) {
        loginToggle.addEventListener('click', () => {
            loginToggle.classList.add('active');
            signupToggle.classList.remove('active');
            loginForm.classList.remove('d-none');
            signupForm.classList.add('d-none');
        });

        signupToggle.addEventListener('click', () => {
            signupToggle.classList.add('active');
            loginToggle.classList.remove('active');
            signupForm.classList.remove('d-none');
            loginForm.classList.add('d-none');
        });
    }

    // Password visibility toggle
    document.getElementById('toggleLoginPassword')?.addEventListener('click', function () {
        const passwordInput = document.getElementById('loginPassword');
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    document.getElementById('toggleSignupPassword')?.addEventListener('click', function () {
        const passwordInput = document.getElementById('signupPassword');
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    // Password strength indicator
    document.getElementById('signupPassword')?.addEventListener('input', function () {
        checkPasswordStrength(this.value);
    });

    // Login form submission
    document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    // Signup form submission
    document.getElementById('signupFormElement')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignup();
    });

    // Check authentication state
    checkAuthState();
});

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');

    if (!strengthBar || !strengthText) return;

    let strength = 0;
    let text = '';
    let color = '';

    // Check password length
    if (password.length >= 8) strength += 25;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) strength += 25;

    // Check for lowercase letters
    if (/[a-z]/.test(password)) strength += 25;

    // Check for numbers
    if (/[0-9]/.test(password)) strength += 25;

    // Determine strength level
    if (strength === 0) {
        text = '';
        color = '';
    } else if (strength <= 25) {
        text = 'Weak';
        color = '#dc3545';
    } else if (strength <= 50) {
        text = 'Fair';
        color = '#ffc107';
    } else if (strength <= 75) {
        text = 'Good';
        color = '#17a2b8';
    } else {
        text = 'Strong';
        color = '#28a745';
    }

    strengthBar.style.width = `${strength}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    // Basic validation
    if (!email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email
        }));

        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Please try again later.';
                break;
        }

        showError(errorDiv, errorMessage);
    }
}

// Handle Signup
async function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('signupError');
    const successDiv = document.getElementById('signupSuccess');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match');
        return;
    }

    if (password.length < 8) {
        showError(errorDiv, 'Password must be at least 8 characters long');
        return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        showError(errorDiv, 'Password must contain uppercase, lowercase, and numbers');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user info
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: name
        }));

        // Show success message
        errorDiv.classList.add('d-none');
        successDiv.classList.remove('d-none');

        // Switch to login form after 2 seconds
        setTimeout(() => {
            document.getElementById('loginToggle').click();
            successDiv.classList.add('d-none');
        }, 2000);

    } catch (error) {
        let errorMessage = 'Signup failed. Please try again.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email already in use.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak.';
                break;
        }

        showError(errorDiv, errorMessage);
    }
}

// Show error message
function showError(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.remove('d-none');

    // Hide error after 5 seconds
    setTimeout(() => {
        element.classList.add('d-none');
    }, 5000);
}

// Check authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        const authDropdown = document.getElementById('authDropdown');
        const logoutBtn = document.querySelector('.logout-btn');

        if (user) {
            // User is signed in
            if (authDropdown) {
                authDropdown.innerHTML = `
                    <i class="fas fa-user me-2"></i>${user.email}
                `;
            }
            if (logoutBtn) {
                logoutBtn.classList.remove('d-none');
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            // User is signed out
            localStorage.removeItem('user');
            if (logoutBtn) {
                logoutBtn.classList.add('d-none');
            }
        }
    });
}

// Handle Logout
async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}