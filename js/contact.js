// Contact form validation
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Form elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Error elements
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');
    const formMessage = document.getElementById('formMessage');

    // Real-time validation
    nameInput?.addEventListener('input', validateName);
    emailInput?.addEventListener('input', validateEmail);
    subjectInput?.addEventListener('input', validateSubject);
    messageInput?.addEventListener('input', validateMessage);

    // Form submission
    contactForm.addEventListener('submit', handleSubmit);

    // Validation functions
    function validateName() {
        const name = nameInput.value.trim();
        if (!name) {
            showError(nameError, 'Name is required');
            return false;
        }
        if (name.length < 2) {
            showError(nameError, 'Name must be at least 2 characters');
            return false;
        }
        hideError(nameError);
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            showError(emailError, 'Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            showError(emailError, 'Please enter a valid email address');
            return false;
        }
        hideError(emailError);
        return true;
    }

    function validateSubject() {
        const subject = subjectInput.value.trim();
        if (!subject) {
            showError(subjectError, 'Subject is required');
            return false;
        }
        if (subject.length < 3) {
            showError(subjectError, 'Subject must be at least 3 characters');
            return false;
        }
        hideError(subjectError);
        return true;
    }

    function validateMessage() {
        const message = messageInput.value.trim();
        if (!message) {
            showError(messageError, 'Message is required');
            return false;
        }
        if (message.length < 10) {
            showError(messageError, 'Message must be at least 10 characters');
            return false;
        }
        hideError(messageError);
        return true;
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.previousElementSibling.classList.add('is-invalid');
    }

    function hideError(element) {
        element.style.display = 'none';
        element.previousElementSibling.classList.remove('is-invalid');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isSubjectValid = validateSubject();
        const isMessageValid = validateMessage();

        if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
            showFormMessage('Please fix the errors above', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // In a real application, you would send this data to a server
            // For demo purposes, we'll simulate an API call

            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput.value.trim(),
                message: messageInput.value.trim(),
                timestamp: new Date().toISOString()
            };

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Save to localStorage (in a real app, send to server)
            const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
            messages.push(formData);
            localStorage.setItem('contactMessages', JSON.stringify(messages));

            // Show success message
            showFormMessage('Message sent successfully! We\'ll get back to you soon.', 'success');

            // Reset form
            contactForm.reset();

        } catch (error) {
            showFormMessage('Failed to send message. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }
    }

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `alert alert-${type}`;
        formMessage.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
});