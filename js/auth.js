document.addEventListener('DOMContentLoaded', function () {
    // Check if on auth page
    if (!document.querySelector('.auth-container')) return;

    // Form elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const formToggle = document.getElementById('formToggle');
    const toggleText = document.getElementById('toggleText');
    const toggleBtn = document.getElementById('toggleBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
    const passwordRequirements = document.getElementById('passwordRequirements');

    // Initialize with login form
    showLoginForm();

    // Form toggle
    formToggle?.addEventListener('click', function (e) {
        e.preventDefault();
        if (loginForm.classList.contains('form-hidden')) {
            showLoginForm();
        } else {
            showSignupForm();
        }
    });

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.innerHTML = type === 'password' ?
                '<i class="fas fa-eye"></i>' :
                '<i class="fas fa-eye-slash"></i>';
        });
    });

    // Password strength checker
    signupPassword?.addEventListener('input', function () {
        checkPasswordStrength(this.value);
    });

    // Password confirmation check
    confirmPassword?.addEventListener('input', function () {
        checkPasswordConfirmation();
    });

    // Form validation
    loginForm?.addEventListener('submit', handleLogin);
    signupForm?.addEventListener('submit', handleSignup);

    // Forgot password
    const forgotPassword = document.getElementById('forgotPassword');
    forgotPassword?.addEventListener('click', function (e) {
        e.preventDefault();
        const email = prompt('Please enter your email address:');
        if (email) {
            resetPassword(email);
        }
    });
});

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleText = document.getElementById('toggleText');
    const toggleBtn = document.getElementById('toggleBtn');

    loginForm.classList.remove('form-hidden');
    signupForm.classList.add('form-hidden');
    toggleText.textContent = "Don't have an account?";
    toggleBtn.textContent = "Sign Up";
    document.title = "ShopEasy - Login";
}

function showSignupForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleText = document.getElementById('toggleText');
    const toggleBtn = document.getElementById('toggleBtn');

    signupForm.classList.remove('form-hidden');
    loginForm.classList.add('form-hidden');
    toggleText.textContent = "Already have an account?";
    toggleBtn.textContent = "Login";
    document.title = "ShopEasy - Sign Up";
}

function checkPasswordStrength(password) {
    let strength = 0;
    const requirements = [];

    // Check length
    if (password.length >= 8) {
        strength += 25;
        requirements.push('✓ At least 8 characters');
    } else {
        requirements.push('✗ At least 8 characters');
    }

    // Check for uppercase
    if (/[A-Z]/.test(password)) {
        strength += 25;
        requirements.push('✓ Uppercase letter');
    } else {
        requirements.push('✗ Uppercase letter');
    }

    // Check for lowercase
    if (/[a-z]/.test(password)) {
        strength += 25;
        requirements.push('✓ Lowercase letter');
    } else {
        requirements.push('✗ Lowercase letter');
    }

    // Check for numbers
    if (/[0-9]/.test(password)) {
        strength += 25;
        requirements.push('✓ Number');
    } else {
        requirements.push('✗ Number');
    }

    // Update meter
    const meter = document.getElementById('passwordStrengthMeter');
    meter.className = 'password-strength-meter';

    if (strength >= 100) {
        meter.classList.add('strong');
    } else if (strength >= 50) {
        meter.classList.add('medium');
    } else if (strength > 0) {
        meter.classList.add('weak');
    }

    // Update requirements list
    const requirementsList = document.getElementById('passwordRequirements');
    requirementsList.innerHTML = requirements.map(req =>
        `<span class="d-block">${req}</span>`
    ).join('');
}

function checkPasswordConfirmation() {
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const error = document.getElementById('confirmPasswordError');

    if (confirm && password !== confirm) {
        error.textContent = 'Passwords do not match';
        error.style.display = 'block';
        return false;
    } else {
        error.style.display = 'none';
        return true;
    }
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');

    // Basic validation
    if (!email || !password) {
        showMessage('loginMessage', 'Please fill in all fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('loginMessage', 'Please enter a valid email address', 'error');
        return;
    }

    try {
        // Show loading state
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        // Firebase login
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Store user info
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        }));

        showMessage('loginMessage', 'Login successful! Redirecting...', 'success');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        let errorMessage = 'Login failed. ';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage += 'No user found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Incorrect password.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage += 'This account has been disabled.';
                break;
            default:
                errorMessage += error.message;
        }

        showMessage('loginMessage', errorMessage, 'error');

        // Reset button
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        submitBtn.innerHTML = originalText || 'Login';
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    // Validation
    if (!name || !email || !password || !confirm) {
        showMessage('signupMessage', 'Please fill in all fields', 'error');
        return;
    }

    if (password !== confirm) {
        showMessage('signupMessage', 'Passwords do not match', 'error');
        return;
    }

    // Password strength check
    if (password.length < 8 || !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        showMessage('signupMessage', 'Password does not meet requirements', 'error');
        return;
    }

    try {
        // Show loading state
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;

        // Firebase signup
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update profile
        await user.updateProfile({
            displayName: name
        });

        // Store user info
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: name
        }));

        showMessage('signupMessage', 'Account created successfully! Redirecting...', 'success');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        let errorMessage = 'Signup failed. ';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'Email already in use.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage += 'Operation not allowed.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Password is too weak.';
                break;
            default:
                errorMessage += error.message;
        }

        showMessage('signupMessage', errorMessage, 'error');

        // Reset button
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');
        submitBtn.innerHTML = originalText || 'Sign Up';
        submitBtn.disabled = false;
    }
}

async function resetPassword(email) {
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
        alert('Error sending reset email: ' + error.message);
    }
}

// Check if user is logged in on page load
window.addEventListener('load', function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            }));
        } else {
            // User is signed out
            localStorage.removeItem('user');
        }
        updateAuthButton();
    });
});