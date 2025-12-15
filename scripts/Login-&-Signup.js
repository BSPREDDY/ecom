// Main Application Script
(function () {
    'use strict';

    // DOM Elements
    let loginForm, signupForm, loginToggle, signupToggle, switchToSignup, switchToLogin;
    let loginBtn, signupBtn, logoutBtn, alertMessage, userInfo, userDetails;
    let formWrapper, formTitle, formSubtitle, forgotPasswordLink;
    let forgotPasswordModal, modalClose, resetBtn, resetEmail, resetAlert, resetEmailError;
    let loginPasswordToggle, signupPasswordToggle, confirmPasswordToggle;
    let passwordStrengthBar, passwordStrengthText;
    let loadingOverlay, loadingText, notificationContainer;

    // Form validation patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    // Initialize the application
    window.initApp = function () {
        initializeElements();
        initEventListeners();
        checkAuthState();
        console.log('PassKart Authentication System Initialized');
    };

    // Initialize DOM elements
    function initializeElements() {
        loginForm = document.getElementById('login-form');
        signupForm = document.getElementById('signup-form');
        loginToggle = document.getElementById('login-toggle');
        signupToggle = document.getElementById('signup-toggle');
        switchToSignup = document.getElementById('switch-to-signup');
        switchToLogin = document.getElementById('switch-to-login');
        loginBtn = document.getElementById('login-btn');
        signupBtn = document.getElementById('signup-btn');
        logoutBtn = document.getElementById('logout-btn');
        alertMessage = document.getElementById('alert-message');
        userInfo = document.getElementById('user-info');
        userDetails = document.getElementById('user-details');
        formWrapper = document.getElementById('form-wrapper');
        formTitle = document.getElementById('form-title');
        formSubtitle = document.getElementById('form-subtitle');
        forgotPasswordLink = document.getElementById('forgot-password');
        forgotPasswordModal = document.getElementById('forgot-password-modal');
        modalClose = document.getElementById('modal-close');
        resetBtn = document.getElementById('reset-btn');
        resetEmail = document.getElementById('reset-email');
        resetAlert = document.getElementById('reset-alert');
        resetEmailError = document.getElementById('reset-email-error');
        loginPasswordToggle = document.getElementById('login-password-toggle');
        signupPasswordToggle = document.getElementById('signup-password-toggle');
        confirmPasswordToggle = document.getElementById('confirm-password-toggle');
        passwordStrengthBar = document.getElementById('password-strength-bar');
        passwordStrengthText = document.getElementById('password-strength-text');
        loadingOverlay = document.getElementById('loading-overlay');
        loadingText = document.getElementById('loading-text');
        notificationContainer = document.getElementById('notification-container');
    }

    // Event Listeners
    function initEventListeners() {
        // Form toggling
        loginToggle.addEventListener('click', () => switchForm('login'));
        signupToggle.addEventListener('click', () => switchForm('signup'));
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('signup');
        });
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });

        // Form submissions
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
        logoutBtn.addEventListener('click', handleLogout);

        // Password visibility toggle
        loginPasswordToggle.addEventListener('click', () => togglePasswordVisibility('login-password', 'login-password-toggle'));
        signupPasswordToggle.addEventListener('click', () => togglePasswordVisibility('signup-password', 'signup-password-toggle'));
        confirmPasswordToggle.addEventListener('click', () => togglePasswordVisibility('confirm-password', 'confirm-password-toggle'));

        // Real-time validation
        document.getElementById('signup-password').addEventListener('input', validatePasswordStrength);
        document.getElementById('signup-email').addEventListener('input', () => validateEmail('signup-email', 'signup-email-error'));
        document.getElementById('login-email').addEventListener('input', () => validateEmail('login-email', 'login-email-error'));
        document.getElementById('confirm-password').addEventListener('input', validateConfirmPassword);
        document.getElementById('signup-name').addEventListener('input', () => validateName('signup-name', 'signup-name-error'));

        // Forgot password functionality
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            openForgotPasswordModal();
        });
        modalClose.addEventListener('click', closeForgotPasswordModal);
        resetBtn.addEventListener('click', handlePasswordReset);

        // Close modal when clicking outside
        forgotPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                closeForgotPasswordModal();
            }
        });

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.form.active');
                if (activeForm && activeForm.id === 'login-form') {
                    if (!loginBtn.disabled) handleLogin(e);
                } else if (activeForm && activeForm.id === 'signup-form') {
                    if (!signupBtn.disabled) handleSignup(e);
                }
            }
        });
    }

    // Show loading overlay
    function showLoading(message = 'Processing...') {
        loadingText.textContent = message;
        loadingOverlay.style.display = 'flex';
    }

    // Hide loading overlay
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Show notification
    function showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        notificationContainer.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Form switching
    function switchForm(formType) {
        if (formType === 'login') {
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            loginToggle.classList.add('active');
            signupToggle.classList.remove('active');
            formTitle.textContent = 'Welcome to PassKart';
            formSubtitle.textContent = 'Sign in to access your password manager';
            document.getElementById('login-email').focus();
        } else {
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
            signupToggle.classList.add('active');
            loginToggle.classList.remove('active');
            formTitle.textContent = 'Create Account';
            formSubtitle.textContent = 'Sign up to start managing your passwords securely';
            document.getElementById('signup-name').focus();
        }
        clearAlerts();
        clearErrors();
    }

    // Password visibility toggle
    function togglePasswordVisibility(passwordFieldId, toggleButtonId) {
        const passwordField = document.getElementById(passwordFieldId);
        const toggleButton = document.getElementById(toggleButtonId);
        const icon = toggleButton.querySelector('i');

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            toggleButton.setAttribute('aria-label', 'Hide password');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            toggleButton.setAttribute('aria-label', 'Show password');
        }
    }

    // Validation functions
    function validateName(nameFieldId, errorFieldId) {
        const name = document.getElementById(nameFieldId).value.trim();

        if (!name) {
            showError(errorFieldId, 'Full name is required');
            return false;
        } else if (name.length < 2) {
            showError(errorFieldId, 'Name must be at least 2 characters');
            return false;
        } else {
            hideError(errorFieldId);
            return true;
        }
    }

    function validateEmail(emailFieldId, errorFieldId) {
        const email = document.getElementById(emailFieldId).value.trim();
        const errorField = document.getElementById(errorFieldId);
        const inputField = document.getElementById(emailFieldId);

        if (!email) {
            showError(errorFieldId, 'Email is required');
            inputField.classList.add('error');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(errorFieldId, 'Please enter a valid email address (e.g., user@example.com)');
            inputField.classList.add('error');
            return false;
        } else {
            hideError(errorFieldId);
            inputField.classList.remove('error');
            return true;
        }
    }

    function validatePasswordStrength() {
        const password = document.getElementById('signup-password').value;
        let strength = 0;
        let text = 'Password strength: ';
        let color = '#e74c3c';

        // Length check
        if (password.length >= 8) strength += 1;
        // Lowercase check
        if (/[a-z]/.test(password)) strength += 1;
        // Uppercase check
        if (/[A-Z]/.test(password)) strength += 1;
        // Number check
        if (/\d/.test(password)) strength += 1;
        // Special character check
        if (/[@$!%*?&]/.test(password)) strength += 1;

        // Determine strength level
        switch (strength) {
            case 0:
            case 1:
                text += 'Weak';
                color = '#e74c3c';
                break;
            case 2:
                text += 'Fair';
                color = '#f39c12';
                break;
            case 3:
                text += 'Good';
                color = '#3498db';
                break;
            case 4:
            case 5:
                text += 'Strong';
                color = '#2ecc71';
                break;
        }

        // Update UI
        const width = (strength / 5) * 100;
        passwordStrengthBar.style.width = `${width}%`;
        passwordStrengthBar.style.backgroundColor = color;
        passwordStrengthText.textContent = text;
        passwordStrengthText.style.color = color;

        // Validate against regex
        const inputField = document.getElementById('signup-password');
        const errorField = document.getElementById('signup-password-error');

        if (password && !passwordRegex.test(password)) {
            showError('signup-password-error',
                'Password must have: • 8+ characters • Uppercase letter • Lowercase letter • Number');
            inputField.classList.add('error');
            return false;
        } else {
            hideError('signup-password-error');
            inputField.classList.remove('error');
            return true;
        }
    }

    function validateConfirmPassword() {
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const inputField = document.getElementById('confirm-password');

        if (confirmPassword && password !== confirmPassword) {
            showError('confirm-password-error', 'Passwords do not match');
            inputField.classList.add('error');
            return false;
        } else {
            hideError('confirm-password-error');
            inputField.classList.remove('error');
            return true;
        }
    }

    function showError(fieldId, message) {
        const errorField = document.getElementById(fieldId);
        if (errorField) {
            errorField.textContent = message;
            errorField.style.display = 'block';
        }
    }

    function hideError(fieldId) {
        const errorField = document.getElementById(fieldId);
        if (errorField) {
            errorField.style.display = 'none';
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.style.display = 'none';
        });

        const errorInputs = document.querySelectorAll('input.error');
        errorInputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    // Alert handling
    function showAlert(message, type = 'info') {
        alertMessage.textContent = message;
        alertMessage.className = `alert ${type}`;
        alertMessage.style.display = 'block';

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                alertMessage.style.display = 'none';
            }, 5000);
        }
    }

    function clearAlerts() {
        alertMessage.style.display = 'none';
        resetAlert.style.display = 'none';
    }

    // Button state management
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    // Firebase Authentication Functions
    async function handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Validate inputs
        if (!validateEmail('login-email', 'login-email-error')) return;
        if (!password) {
            showError('login-password-error', 'Password is required');
            document.getElementById('login-password').classList.add('error');
            return;
        }

        // Set loading state
        setButtonLoading(loginBtn, true);
        showLoading('Signing you in...');

        try {
            // Set persistence based on "Remember me" checkbox
            await window.firebaseAuth.setPersistence(
                window.auth,
                rememberMe ? window.firebaseAuth.browserLocalPersistence : window.firebaseAuth.browserSessionPersistence
            );

            // Sign in with Firebase
            const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(
                window.auth,
                email,
                password
            );

            // Success
            showNotification('Successfully logged in!', 'success');
            console.log('Login successful:', userCredential.user);

        } catch (error) {
            // Reset button state
            setButtonLoading(loginBtn, false);
            hideLoading();

            // Handle specific Firebase errors
            let errorMessage = 'Login failed. Please try again.';

            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    errorMessage = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled. Please contact support.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
            }

            showNotification(errorMessage, 'error');
            showAlert(errorMessage, 'error');
        }
    }

    async function handleSignup(e) {
        e.preventDefault();

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validate all inputs
        let isValid = true;

        if (!validateName('signup-name', 'signup-name-error')) isValid = false;
        if (!validateEmail('signup-email', 'signup-email-error')) isValid = false;
        if (!validatePasswordStrength()) isValid = false;
        if (!validateConfirmPassword()) isValid = false;

        if (!isValid) {
            showAlert('Please fix the errors in the form.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match. Please try again.', 'error');
            return;
        }

        // Set loading state
        setButtonLoading(signupBtn, true);
        showLoading('Creating your account...');

        try {
            // Create user with Firebase
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(
                window.auth,
                email,
                password
            );
            const user = userCredential.user;

            // Update profile with display name
            await window.firebaseAuth.updateProfile(user, {
                displayName: name
            });

            // Send email verification (optional - you can enable this later)
            // await sendEmailVerification(user);

            // Success
            showNotification('Account created successfully! Welcome to PassKart!', 'success');

            // Clear form
            document.getElementById('signup-form').reset();
            passwordStrengthBar.style.width = '0%';
            passwordStrengthText.textContent = 'Password strength: None';

            // Show user info
            showUserInfo(user);

        } catch (error) {
            // Reset button state
            setButtonLoading(signupBtn, false);
            hideLoading();

            // Handle specific Firebase errors
            let errorMessage = 'Signup failed. Please try again.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered. Please use a different email or login.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please use a stronger password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address. Please enter a valid email.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
            }

            showNotification(errorMessage, 'error');
            showAlert(errorMessage, 'error');
        }
    }

    async function handleLogout() {
        showLoading('Logging out...');

        try {
            await window.firebaseAuth.signOut(window.auth);
            showNotification('You have been logged out successfully.', 'success');
        } catch (error) {
            showNotification(`Logout failed: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    // Check and handle authentication state
    function checkAuthState() {
        window.firebaseAuth.onAuthStateChanged(window.auth, (user) => {
            if (user) {
                // User is signed in
                showUserInfo(user);
                console.log('User is signed in:', user.email);
            } else {
                // User is signed out
                showAuthForms();
                console.log('User is signed out');
            }
            hideLoading();
        });
    }

    function showUserInfo(user) {
        // Hide forms, show user info
        formWrapper.style.display = 'none';
        userInfo.style.display = 'block';

        // Format dates
        const creationDate = new Date(user.metadata.creationTime);
        const lastSignInDate = new Date(user.metadata.lastSignInTime);

        // Populate user details with better formatting
        userDetails.innerHTML = `
            <p><strong>Name:</strong> <span>${user.displayName || 'Not set'}</span></p>
            <p><strong>Email:</strong> <span>${user.email}</span></p>
            <p><strong>Account Created:</strong> <span>${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
            <p><strong>Last Login:</strong> <span>${lastSignInDate.toLocaleDateString()} ${lastSignInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
            <p><strong>Email Verified:</strong> <span>${user.emailVerified ? '✅ Yes' : '❌ No'}</span></p>
            <p><strong>User ID:</strong> <span class="user-id">${user.uid.substring(0, 8)}...</span></p>
        `;

        // Update navigation for logged in user
        updateNavForLoggedInUser(user.displayName || user.email);
    }

    function showAuthForms() {
        // Hide user info, show forms
        userInfo.style.display = 'none';
        formWrapper.style.display = 'block';

        // Reset forms
        loginForm.reset();
        signupForm.reset();
        clearAlerts();
        clearErrors();

        // Reset password strength indicator
        passwordStrengthBar.style.width = '0%';
        passwordStrengthText.textContent = 'Password strength: None';

        // Update navigation for logged out user
        updateNavForLoggedOutUser();
    }

    function updateNavForLoggedInUser(userName) {
        // Update navigation items
        const navLinks = document.querySelector('.nav-links');
        const userInitial = userName.charAt(0).toUpperCase();

        // Add user profile link
        const profileLink = document.createElement('li');
        profileLink.innerHTML = `<a href="#" class="user-profile"><i class="fas fa-user-circle"></i> ${userName.split(' ')[0]}</a>`;
        navLinks.appendChild(profileLink);

        // Update existing login link to logout
        const loginLinks = document.querySelectorAll('.nav-links a');
        loginLinks.forEach(link => {
            if (link.textContent.includes('Login')) {
                link.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                link.href = '#';
                link.onclick = handleLogout;
            }
        });
    }

    function updateNavForLoggedOutUser() {
        // Reset navigation
        const navLinks = document.querySelector('.nav-links');
        const userProfileLink = navLinks.querySelector('.user-profile');
        if (userProfileLink) {
            userProfileLink.parentNode.remove();
        }

        // Reset logout links to login
        const logoutLinks = document.querySelectorAll('.nav-links a');
        logoutLinks.forEach(link => {
            if (link.textContent.includes('Logout')) {
                link.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                link.href = '#';
                link.onclick = null;
            }
        });
    }

    // Forgot password functionality
    function openForgotPasswordModal() {
        forgotPasswordModal.style.display = 'flex';
        resetEmail.value = document.getElementById('login-email').value || '';
        resetAlert.style.display = 'none';
        resetEmailError.style.display = 'none';

        // Focus on email input
        setTimeout(() => {
            resetEmail.focus();
        }, 100);
    }

    function closeForgotPasswordModal() {
        forgotPasswordModal.style.display = 'none';
    }

    async function handlePasswordReset() {
        const email = resetEmail.value.trim();

        if (!email) {
            resetEmailError.textContent = 'Email is required';
            resetEmailError.style.display = 'block';
            resetEmail.classList.add('error');
            return;
        }

        if (!emailRegex.test(email)) {
            resetEmailError.textContent = 'Please enter a valid email address';
            resetEmailError.style.display = 'block';
            resetEmail.classList.add('error');
            return;
        }

        resetEmailError.style.display = 'none';
        resetEmail.classList.remove('error');

        // Set loading state
        resetBtn.disabled = true;
        resetBtn.textContent = 'Sending...';

        try {
            await window.firebaseAuth.sendPasswordResetEmail(window.auth, email);

            resetAlert.textContent = 'Password reset email sent! Check your inbox (and spam folder).';
            resetAlert.className = 'alert success';
            resetAlert.style.display = 'block';

            showNotification('Password reset email sent successfully!', 'success');

            // Close modal after 3 seconds
            setTimeout(() => {
                closeForgotPasswordModal();
                // Clear form
                resetBtn.disabled = false;
                resetBtn.textContent = 'Send Reset Link';
            }, 3000);

        } catch (error) {
            let errorMessage = 'Failed to send reset email. Please try again.';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
            }

            resetAlert.textContent = errorMessage;
            resetAlert.className = 'alert error';
            resetAlert.style.display = 'block';

            // Reset button
            resetBtn.disabled = false;
            resetBtn.textContent = 'Send Reset Link';
        }
    }

    // Initialize the application when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initApp);
    } else {
        window.initApp();
    }
})();