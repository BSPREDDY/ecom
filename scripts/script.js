import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetTab = this.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));
        this.classList.add('active');
        document.querySelector(`[data-form="${targetTab}"]`).classList.add('active');
    });
});

// Password visibility toggle
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId = this.dataset.target;
        const input = document.getElementById(targetId);
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '👁️‍🗨️';
        } else {
            input.type = 'password';
            this.textContent = '👁️';
        }
    });
});

// Password strength checker
const signupPassword = document.getElementById('signupPassword');
const passwordStrength = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');

signupPassword.addEventListener('input', function () {
    const password = this.value;
    if (password.length === 0) {
        passwordStrength.classList.remove('show');
        return;
    }

    passwordStrength.classList.add('show');
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';

    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = '⚠️ Weak password';
    } else if (strength === 3) {
        strengthFill.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = '👍 Medium password';
    } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = '✓ Strong password';
    }
});

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show toast notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toast.className = 'toast show';
    if (isError) toast.classList.add('error');
    toastMessage.textContent = message;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Show/hide loading overlay
function setLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// Get first letter of name for avatar
function getInitials(name) {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 0) return 'U';
    return names[0].charAt(0).toUpperCase();
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

    // Validation
    let hasError = false;
    if (!validateEmail(email)) {
        document.getElementById('loginEmailError').textContent = 'Please enter a valid email address';
        document.getElementById('loginEmailError').classList.add('show');
        document.getElementById('loginEmail').classList.add('error');
        hasError = true;
    }

    if (password.length < 6) {
        document.getElementById('loginPasswordError').textContent = 'Password must be at least 6 characters';
        document.getElementById('loginPasswordError').classList.add('show');
        document.getElementById('loginPassword').classList.add('error');
        hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Store ONLY the first letter for avatar display
        const user = userCredential.user;
        const firstNameLetter = getInitials(user.displayName || email.split('@')[0]);
        localStorage.setItem('userInitial', firstNameLetter);

        showToast('✓ Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = '/pages/home.html';
        }, 1500);
    } catch (error) {
        setLoading(false);
        let errorMessage = 'Login failed. Please try again.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        }
        showToast(errorMessage, true);
    }
});

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

    // Validation
    let hasError = false;
    if (name.length < 2) {
        document.getElementById('signupNameError').textContent = 'Name must be at least 2 characters';
        document.getElementById('signupNameError').classList.add('show');
        document.getElementById('signupName').classList.add('error');
        hasError = true;
    }

    if (!validateEmail(email)) {
        document.getElementById('signupEmailError').textContent = 'Please enter a valid email address';
        document.getElementById('signupEmailError').classList.add('show');
        document.getElementById('signupEmail').classList.add('error');
        hasError = true;
    }

    if (password.length < 8) {
        document.getElementById('signupPasswordError').textContent = 'Password must be at least 8 characters';
        document.getElementById('signupPasswordError').classList.add('show');
        document.getElementById('signupPassword').classList.add('error');
        hasError = true;
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        document.getElementById('signupPasswordError').textContent = 'Password must contain uppercase, lowercase, and number';
        document.getElementById('signupPasswordError').classList.add('show');
        document.getElementById('signupPassword').classList.add('error');
        hasError = true;
    }

    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        document.getElementById('confirmPasswordError').classList.add('show');
        document.getElementById('confirmPassword').classList.add('error');
        hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Store ONLY the first letter for avatar display
        const firstNameLetter = getInitials(name);
        localStorage.setItem('userInitial', firstNameLetter);

        showToast('✓ Account created successfully! Redirecting...');
        setTimeout(() => {
            window.location.href = '/pages/home.html';
        }, 1500);
    } catch (error) {
        setLoading(false);
        let errorMessage = 'Signup failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Try logging in.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak.';
        }
        showToast(errorMessage, true);
    }
});

// Forgot password
document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();

    if (!validateEmail(email)) {
        showToast('Please enter a valid email address first', true);
        return;
    }

    setLoading(true);

    try {
        await sendPasswordResetEmail(auth, email);
        setLoading(false);
        showToast('✓ Password reset email sent! Check your inbox.');
    } catch (error) {
        setLoading(false);
        let errorMessage = 'Failed to send reset email.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        }
        showToast(errorMessage, true);
    }
});

// Check auth state on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is already logged in, redirect to home
        window.location.href = '/pages/home.html';
    }
});

// Social login buttons (placeholder functionality)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Social login coming soon!', false);
    });
});