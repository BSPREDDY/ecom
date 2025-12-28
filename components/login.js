// Login Page Manager
class LoginManager {
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
        const loginForm = document.getElementById("loginForm")
        const passwordToggle = document.getElementById("passwordToggle")
        const forgotPasswordLink = document.getElementById("forgotPasswordLink")

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => this.handleLogin(e))
        }

        if (passwordToggle) {
            passwordToggle.addEventListener("click", () => this.togglePassword())
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener("click", (e) => this.handleForgotPassword(e))
        }

        // Real-time validation
        const emailInput = document.getElementById("email")
        const passwordInput = document.getElementById("password")

        if (emailInput) {
            emailInput.addEventListener("blur", () => this.validateEmail())
        }

        if (passwordInput) {
            passwordInput.addEventListener("blur", () => this.validatePassword())
        }
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

        if (!password || password.length < 6) {
            passwordError.classList.add("show")
            passwordInput.style.borderColor = "#e53e3e"
            return false
        }

        passwordError.classList.remove("show")
        passwordInput.style.borderColor = "#e2e8f0"
        return true
    }

    togglePassword() {
        const passwordInput = document.getElementById("password")
        const passwordToggle = document.getElementById("passwordToggle")
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

    async handleLogin(e) {
        e.preventDefault()

        const emailValid = this.validateEmail()
        const passwordValid = this.validatePassword()

        if (!emailValid || !passwordValid) {
            return
        }

        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value
        const loginBtn = document.getElementById("loginBtn")

        try {
            window.utils.setLoadingState(loginBtn, true, "Logging in...")

            const auth = window.firebaseService.getAuth()
            if (!auth) {
                throw new Error("Firebase not initialized")
            }

            await auth.signInWithEmailAndPassword(email, password)

            window.utils.showNotification("Login successful!", "success")

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = "index.html"
            }, 1000)
        } catch (error) {
            console.error("[Login] Error:", error)

            let errorMessage = "Login failed. Please try again."

            if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email."
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password."
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address."
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many attempts. Please try again later."
            }

            window.utils.showNotification(errorMessage, "error")
            window.utils.setLoadingState(loginBtn, false)
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault()

        const email = document.getElementById("email").value.trim()

        if (!email || !window.utils.validateEmail(email)) {
            window.utils.showNotification("Please enter a valid email address", "error")
            return
        }

        try {
            const auth = window.firebaseService.getAuth()
            if (!auth) {
                throw new Error("Firebase not initialized")
            }

            await auth.sendPasswordResetEmail(email)
            window.utils.showNotification("Password reset email sent!", "success")
        } catch (error) {
            console.error("[Forgot Password] Error:", error)

            let errorMessage = "Error sending reset email"

            if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email."
            }

            window.utils.showNotification(errorMessage, "error")
        }
    }
}

// Initialize login manager
document.addEventListener("DOMContentLoaded", () => {
    window.loginManager = new LoginManager()

    const loginForm = document.getElementById("loginForm")
    const emailInput = document.getElementById("email")
    const passwordInput = document.getElementById("password")
    const passwordToggle = document.getElementById("passwordToggle")
    const loginBtn = document.getElementById("loginBtn")

    // Toggle Password Visibility
    if (passwordToggle) {
        passwordToggle.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
            passwordInput.setAttribute("type", type)
            passwordToggle.querySelector("i").classList.toggle("fa-eye")
            passwordToggle.querySelector("i").classList.toggle("fa-eye-slash")
        })
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault()

            const email = emailInput.value.trim()
            const password = passwordInput.value

            const auth = window.firebaseService.getAuth()
            if (!auth) {
                alert("Authentication system is not initialized. Please try again later.")
                return
            }

            loginBtn.disabled = true
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...'

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password)
                console.log("[v0] Login successful:", userCredential.user.uid)

                // Sync with local storage for immediate UI feedback if needed
                localStorage.setItem("user", JSON.stringify({ uid: userCredential.user.uid, email: userCredential.user.email }))

                // Redirect to home or dashboard
                window.location.href = "index.html"
            } catch (error) {
                console.error("[v0] Login error:", error.code, error.message)
                loginBtn.disabled = false
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login'

                // Handle specific error messages
                let errorMessage = "Invalid email or password."
                if (error.code === "auth/user-not-found") errorMessage = "No account found with this email."
                if (error.code === "auth/wrong-password") errorMessage = "Incorrect password."
                if (error.code === "auth/too-many-requests") errorMessage = "Too many failed attempts. Try again later."

                alert(errorMessage)
            }
        })
    }
})
