// Contact Form Handler
class ContactPageManager {
    constructor() {
        this.init()
    }

    init() {
        this.bindFormEvents()
        this.setupFAQAccordion()
        this.setupChatWidget()
    }

    bindFormEvents() {
        const form = document.getElementById("contactForm")
        const submitBtn = document.getElementById("submitBtn")

        if (form && submitBtn) {
            form.addEventListener("submit", (e) => {
                e.preventDefault()

                // Get form data
                const firstName = document.getElementById("firstName").value.trim()
                const lastName = document.getElementById("lastName").value.trim()
                const email = document.getElementById("email").value.trim()
                const phone = document.getElementById("phone").value.trim()
                const subject = document.getElementById("subject").value
                const message = document.getElementById("message").value.trim()
                const terms = document.getElementById("terms").checked

                // Validate form
                if (!firstName || !lastName || !email || !subject || !message || !terms) {
                    this.showError("Please fill all required fields")
                    return
                }

                // Validate email
                if (!this.isValidEmail(email)) {
                    this.showError("Please enter a valid email address")
                    return
                }

                // Show loading state
                submitBtn.disabled = true
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'

                // Simulate form submission
                setTimeout(() => {
                    this.showSuccess()
                    form.reset()
                    submitBtn.disabled = false
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'

                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        document.getElementById("formSuccess").style.display = "none"
                    }, 5000)
                }, 1500)
            })
        }
    }

    setupFAQAccordion() {
        const faqItems = document.querySelectorAll(".faq-item")

        faqItems.forEach((item) => {
            const question = item.querySelector(".faq-question")

            question.addEventListener("click", () => {
                const isActive = item.classList.contains("active")

                // Close other items
                faqItems.forEach((otherItem) => {
                    if (otherItem !== item) {
                        otherItem.classList.remove("active")
                        const otherAnswer = otherItem.querySelector(".faq-answer")
                        if (otherAnswer) otherAnswer.style.maxHeight = null
                    }
                })

                // Toggle current item
                const answer = item.querySelector(".faq-answer")
                if (isActive) {
                    item.classList.remove("active")
                    if (answer) answer.style.maxHeight = null
                } else {
                    item.classList.add("active")
                    if (answer) answer.style.maxHeight = answer.scrollHeight + "px"
                }
            })
        })
    }

    setupChatWidget() {
        const chatButton = document.getElementById("chatButton")

        if (chatButton) {
            chatButton.addEventListener("click", () => {
                window.utils.showNotification("Thank you for your interest! Chat support will be available soon.", "info")
            })
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    showSuccess() {
        const successDiv = document.getElementById("formSuccess")
        const errorDiv = document.getElementById("formError")

        if (successDiv) {
            errorDiv.style.display = "none"
            successDiv.style.display = "block"
            successDiv.scrollIntoView({ behavior: "smooth" })
        }
    }

    showError(message) {
        const errorDiv = document.getElementById("formError")
        const successDiv = document.getElementById("formSuccess")

        if (errorDiv) {
            successDiv.style.display = "none"
            errorDiv.style.display = "block"
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            `
            errorDiv.scrollIntoView({ behavior: "smooth" })
        }
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    window.contactPageManager = new ContactPageManager()
})
