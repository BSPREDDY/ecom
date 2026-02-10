// Contact form validation using JavaScript + jQuery
$(document).ready(function () {
    const $form = $('#contactForm');
    if (!$form.length) return;

    const $name = $('#name');
    const $email = $('#email');
    const $subject = $('#subject');
    const $message = $('#message');
    const $submitBtn = $form.find('button[type="submit"]');

    const $nameError = $('#nameError');
    const $emailError = $('#emailError');
    const $subjectError = $('#subjectError');
    const $messageError = $('#messageError');
    const $formMessage = $('#formMessage');

    // Real-time validation
    $name.on('input', validateName);
    $email.on('input', validateEmail);
    $subject.on('input', validateSubject);
    $message.on('input', validateMessage);

    // Submit handler
    $form.on('submit', handleSubmit);

    function validateName() {
        const value = $name.val().trim();
        if (!value) return showError($name, $nameError, 'Name is required');
        if (value.length < 2) return showError($name, $nameError, 'Name must be at least 2 characters');
        hideError($name, $nameError);
        return true;
    }

    function validateEmail() {
        const value = $email.val().trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return showError($email, $emailError, 'Email is required');
        if (!regex.test(value)) return showError($email, $emailError, 'Enter a valid email');
        hideError($email, $emailError);
        return true;
    }

    function validateSubject() {
        const value = $subject.val().trim();
        if (!value) return showError($subject, $subjectError, 'Subject is required');
        if (value.length < 3) return showError($subject, $subjectError, 'Subject must be at least 3 characters');
        hideError($subject, $subjectError);
        return true;
    }

    function validateMessage() {
        const value = $message.val().trim();
        if (!value) return showError($message, $messageError, 'Message is required');
        if (value.length < 10) return showError($message, $messageError, 'Message must be at least 10 characters');
        hideError($message, $messageError);
        return true;
    }

    function showError($input, $error, msg) {
        $error.text(msg).fadeIn();
        $input.addClass('is-invalid');
        return false;
    }

    function hideError($input, $error) {
        $error.fadeOut();
        $input.removeClass('is-invalid');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const valid =
            validateName() &
            validateEmail() &
            validateSubject() &
            validateMessage();

        if (!valid) {
            showFormMessage('Please fix the errors above', 'danger');
            return;
        }

        $submitBtn.prop('disabled', true).html(
            '<i class="fas fa-spinner fa-spin"></i> Sending...'
        );

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const data = {
                name: $name.val(),
                email: $email.val(),
                subject: $subject.val(),
                message: $message.val(),
                time: new Date().toISOString()
            };

            const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
            messages.push(data);
            localStorage.setItem('contactMessages', JSON.stringify(messages));

            showFormMessage('Message sent successfully!', 'success');
            $form.trigger('reset');

        } catch {
            showFormMessage('Something went wrong. Try again.', 'danger');
        } finally {
            $submitBtn.prop('disabled', false).text('Send Message');
        }
    }

    function showFormMessage(msg, type) {
        $formMessage
            .removeClass()
            .addClass(`alert alert-${type}`)
            .text(msg)
            .fadeIn();

        setTimeout(() => $formMessage.fadeOut(), 5000);
    }
});
