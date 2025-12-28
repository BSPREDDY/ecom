// Signup Page Manager
class SignupManager {
    constructor() {
        this.init()
    }

    init() {
        this.bindEvents()
        this.checkIfLoggedIn()
    }

    checkIfLoggedIn() {
        setTimeout(() => {
            const auth = window.firebaseService?.getAuth()
            if (auth && auth.currentUser) {
                window.location.href = "index.html"
            }
        }, 500)
    }

    bindEvents() {
        const signupForm = document.getElementById("signupForm")
        const passwordToggle = document.getElementById("passwordToggle")
        const confirmPasswordToggle = document.getElementById("confirmPasswordToggle")
        const passwordInput = document.getElementById("password")

        if (signupForm) {
            signupForm.addEventListener("submit", (e) => this.handleSignup(e))
        }

        if (passwordToggle) {
            passwordToggle.addEventListener("click", () => this.togglePassword("password", "passwordToggle"))
        }

        if (confirmPasswordToggle) {
            confirmPasswordToggle.addEventListener("click", () =>
                this.togglePassword("confirmPassword", "confirmPasswordToggle"),
            )
        }

        if (passwordInput) {
            passwordInput.addEventListener("input", () => this.checkPasswordStrength())
        }

        // Real-time validation
        const nameInput = document.getElementById("name")
        const emailInput = document.getElementById("email")
        const confirmPasswordInput = document.getElementById("confirmPassword")

        if (nameInput) {
            nameInput.addEventListener("blur", () => this.validateName())
        }

        if (emailInput) {
            emailInput.addEventListener("blur", () => this.validateEmail())
        }

        if (passwordInput) {
            passwordInput.addEventListener("blur", () => this.validatePassword())
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener("blur", () => this.validateConfirmPassword())
        }
    }

    validateName() {
        const nameInput = document.getElementById("name")
        const nameError = document.getElementById("nameError")
        const name = nameInput.value.trim()

        if (!name || name.length < 2) {
            nameError.classList.add("show")
            nameInput.style.borderColor = "#e53e3e"
            return false
        }

        nameError.classList.remove("show")
        nameInput.style.borderColor = "#e2e8f0"
        return true
    }

    validateEmail() {
        const emailInput = document.getElementById("email")
        const emailError = document.getElementById("emailError")
        const email = emailInput.value.trim()

        if (!email || !window.utils.validateEmail(email)) {
            emailError.classList.add("show")
            emailInput.style.borderColor = "#e53e3e"
            return false
        }

        emailError.classList.remove("show")
        emailInput.style.borderColor = "#e2e8f0"
        return true
    }

    validatePassword() {
        const passwordInput = document.getElementById("password")
        const passwordError = document.getElementById("passwordError")
        const password = passwordInput.value

        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

        if (!password || !passwordRegex.test(password)) {
            passwordError.classList.add("show")
            passwordInput.style.borderColor = "#e53e3e"
            return false
        }

        passwordError.classList.remove("show")
        passwordInput.style.borderColor = "#e2e8f0"
        return true
    }

    validateConfirmPassword() {
        const passwordInput = document.getElementById("password")
        const confirmPasswordInput = document.getElementById("confirmPassword")
        const confirmPasswordError = document.getElementById("confirmPasswordError")

        if (confirmPasswordInput.value !== passwordInput.value) {
            confirmPasswordError.classList.add("show")
            confirmPasswordInput.style.borderColor = "#e53e3e"
            return false
        }

        confirmPasswordError.classList.remove("show")
        confirmPasswordInput.style.borderColor = "#e2e8f0"
        return true
    }

    checkPasswordStrength() {
        const passwordInput = document.getElementById("password")
        const strengthBar = document.getElementById("passwordStrengthBar")
        const strengthText = document.getElementById("passwordStrengthText")
        const password = passwordInput.value

        let strength = 0
        let text = ""
        let color = ""

        if (password.length >= 8) strength++
        if (password.match(/[a-z]/)) strength++
        if (password.match(/[A-Z]/)) strength++
        if (password.match(/[0-9]/)) strength++
        if (password.match(/[^a-zA-Z0-9]/)) strength++

        switch (strength) {
            case 0:
            case 1:
                text = "Very Weak"
                color = "#e53e3e"
                break
            case 2:
                text = "Weak"
                color = "#dd6b20"
                break
            case 3:
                text = "Medium"
                color = "#d69e2e"
                break
            case 4:
                text = "Strong"
                color = "#38a169"
                break
            case 5:
                text = "Very Strong"
                color = "#22543d"
                break
        }

        strengthBar.style.width = `${(strength / 5) * 100}%`
        strengthBar.style.background = color
        strengthText.textContent = text
        strengthText.style.color = color
    }

    togglePassword(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId)
        const passwordToggle = document.getElementById(toggleId)
        const icon = passwordToggle.querySelector("i")

        if (passwordInput.type === "password") {
            passwordInput.type = "text"
            icon.classList.remove("fa-eye")
            icon.classList.add("fa-eye-slash")
        } else {
            passwordInput.type = "password"
            icon.classList.remove("fa-eye-slash")
            icon.classList.add("fa-eye")
        }
    }

    async handleSignup(e) {
        e.preventDefault()

        const nameValid = this.validateName()
        const emailValid = this.validateEmail()
        const passwordValid = this.validatePassword()
        const confirmPasswordValid = this.validateConfirmPassword()

        if (!nameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
            return
        }

        const name = document.getElementById("name").value.trim()
        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value
        const signupBtn = document.getElementById("signupBtn")

        try {
            window.utils.setLoadingState(signupBtn, true, "Creating account...")

            const auth = window.firebaseService.getAuth()
            const db = window.firebaseService.getDb()
            if (!auth || !db) {
                throw new Error("Services not initialized")
            }

            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password)
            const user = userCredential.user

            // Update user profile with name
            await user.updateProfile({
                displayName: name,
            })

            // Store user data in database
            await db.ref(`users/${user.uid}`).set({
                name: name,
                email: email,
                createdAt: new Date().toISOString(),
                cart: [],
                wishlist: [],
            })

            window.utils.showNotification("Account created successfully!", "success")

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = "index.html"
            }, 1000)
        } catch (error) {
            console.error("[Signup] Error:", error)

            let errorMessage = "Signup failed. Please try again."

            if (error.code === "auth/email-already-in-use") {
                errorMessage = "An account with this email already exists."
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address."
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak."
            }

            window.utils.showNotification(errorMessage, "error")
            window.utils.setLoadingState(signupBtn, false)
        }
    }
}

// Initialize signup manager
document.addEventListener("DOMContentLoaded", () => {
    window.signupManager = new SignupManager()
})
