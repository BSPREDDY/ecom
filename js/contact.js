// js/contact.js
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('contactSuccess');
    const errorMessage = document.getElementById('contactError');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Reset messages
        successMessage.classList.add('d-none');
        errorMessage.classList.add('d-none');

        // Validate form
        if (!contactForm.checkValidity()) {
            contactForm.classList.add('was-validated');
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            subject: document.getElementById('contactSubject').value,
            message: document.getElementById('contactMessage').value,
            newsletter: document.getElementById('contactNewsletter').checked,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage (simulating backend)
        const contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        contactMessages.push(formData);
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));

        // Show success message
        successMessage.classList.remove('d-none');

        // Reset form
        contactForm.reset();
        contactForm.classList.remove('was-validated');

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.add('d-none');
        }, 5000);
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.classList.remove('is-valid', 'is-invalid');
            }
        });
    });

    // Email validation
    const emailInput = document.getElementById('contactEmail');
    if (emailInput) {
        emailInput.addEventListener('input', function () {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(this.value)) {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.setCustomValidity('Please enter a valid email address');
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }
});