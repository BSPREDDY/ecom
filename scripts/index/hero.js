// Hero Section Functionality
class HeroManager {
    constructor() {
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initCountdown();
        this.initScrollIndicator();
        this.initAnimations();

        // Only initialize slider if elements exist
        if (this.heroSlides && this.heroSlides.length > 0) {
            this.initSlider();
        }
    }

    cacheDOM() {
        // Slider elements (if they exist)
        this.heroSlides = document.querySelectorAll('.hero-slide');
        this.sliderDots = document.querySelectorAll('.slider-dot');
        this.prevBtn = document.getElementById('hero-prev');
        this.nextBtn = document.getElementById('hero-next');

        // Countdown elements
        this.countdownDays = document.getElementById('days');
        this.countdownHours = document.getElementById('hours');
        this.countdownMinutes = document.getElementById('minutes');
        this.countdownSeconds = document.getElementById('seconds');

        // Flash deals timer
        this.flashTimer = document.querySelector('.timer-value');

        // CTA buttons
        this.shopNowBtn = document.querySelector('.hero-cta .btn-primary');
        this.viewDealsBtn = document.querySelector('.hero-cta .btn-secondary');

        // Scroll indicator
        this.scrollIndicator = document.querySelector('.scroll-indicator');

        // Featured product
        this.featuredProduct = document.querySelector('.featured-product');

        // Hero buttons
        this.ctaPrimary = document.querySelector('.cta-primary');
        this.ctaSecondary = document.querySelector('.cta-secondary');
    }

    bindEvents() {
        // Only bind slider events if elements exist
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        if (this.sliderDots && this.sliderDots.length > 0) {
            this.sliderDots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }

        // Start auto slide only if there are slides
        if (this.heroSlides && this.heroSlides.length > 0) {
            this.startAutoSlide();

            // Hover pause for slider
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.addEventListener('mouseenter', () => this.pauseAutoSlide());
                heroSection.addEventListener('mouseleave', () => this.resumeAutoSlide());
            }
        }

        // Featured product interaction
        if (this.featuredProduct) {
            this.featuredProduct.addEventListener('click', (e) => this.handleProductClick(e));
        }

        // CTA button interactions
        if (this.ctaPrimary) {
            this.ctaPrimary.addEventListener('click', (e) => this.handleCTAClick(e, 'shop'));
        }

        if (this.ctaSecondary) {
            this.ctaSecondary.addEventListener('click', (e) => this.handleCTAClick(e, 'deals'));
        }

        // Scroll indicator
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', () => this.scrollToContent());
        }
    }

    initSlider() {
        this.currentSlide = 0;
        this.totalSlides = this.heroSlides.length;
        this.isAutoSliding = true;
        this.slideInterval = null;

        // Initialize first slide if exists
        if (this.totalSlides > 0) {
            this.updateSlider();
        }
    }

    startAutoSlide() {
        // Only start auto slide if there are multiple slides
        if (!this.heroSlides || this.totalSlides <= 1) return;

        this.slideInterval = setInterval(() => {
            if (this.isAutoSliding) {
                this.nextSlide();
            }
        }, 5000); // Change slide every 5 seconds
    }

    pauseAutoSlide() {
        this.isAutoSliding = false;
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }

    resumeAutoSlide() {
        this.isAutoSliding = true;
        this.startAutoSlide();
    }

    nextSlide() {
        if (!this.heroSlides || this.totalSlides === 0) return;

        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }

    prevSlide() {
        if (!this.heroSlides || this.totalSlides === 0) return;

        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    goToSlide(index) {
        if (!this.heroSlides || index < 0 || index >= this.totalSlides) return;

        this.currentSlide = index;
        this.updateSlider();
    }

    updateSlider() {
        // Check if slides exist
        if (!this.heroSlides || this.totalSlides === 0) return;

        // Update slides
        this.heroSlides.forEach((slide, index) => {
            if (slide) {
                slide.classList.toggle('active', index === this.currentSlide);
            }
        });

        // Update dots if they exist
        if (this.sliderDots) {
            this.sliderDots.forEach((dot, index) => {
                if (dot) {
                    dot.classList.toggle('active', index === this.currentSlide);
                }
            });
        }

        // Update slide animation
        const currentSlide = this.heroSlides[this.currentSlide];
        if (currentSlide) {
            currentSlide.style.animation = 'none';
            setTimeout(() => {
                currentSlide.style.animation = 'zoomIn 20s ease infinite';
            }, 10);
        }
    }

    initCountdown() {
        // Set end date (7 days from now)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);

        this.updateCountdown(endDate);

        // Update every second
        setInterval(() => {
            this.updateCountdown(endDate);
        }, 1000);
    }

    updateCountdown(endDate) {
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
            // Countdown finished
            if (this.countdownDays) this.countdownDays.textContent = '00';
            if (this.countdownHours) this.countdownHours.textContent = '00';
            if (this.countdownMinutes) this.countdownMinutes.textContent = '00';
            if (this.countdownSeconds) this.countdownSeconds.textContent = '00';
            if (this.flashTimer) this.flashTimer.textContent = '00:00:00';
            return;
        }

        // Calculate days, hours, minutes, seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update display
        if (this.countdownDays) this.countdownDays.textContent = this.padNumber(days);
        if (this.countdownHours) this.countdownHours.textContent = this.padNumber(hours);
        if (this.countdownMinutes) this.countdownMinutes.textContent = this.padNumber(minutes);
        if (this.countdownSeconds) this.countdownSeconds.textContent = this.padNumber(seconds);

        // Update flash deals timer (total hours, minutes, seconds)
        if (this.flashTimer) {
            const totalHours = days * 24 + hours;
            this.flashTimer.textContent = `${this.padNumber(totalHours)}:${this.padNumber(minutes)}:${this.padNumber(seconds)}`;
        }
    }

    padNumber(num) {
        return num.toString().padStart(2, '0');
    }

    initScrollIndicator() {
        if (!this.scrollIndicator) return;

        // Add scroll event listener
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.scrollIndicator.style.opacity = '0';
                this.scrollIndicator.style.visibility = 'hidden';
            } else {
                this.scrollIndicator.style.opacity = '1';
                this.scrollIndicator.style.visibility = 'visible';
            }
        });
    }

    scrollToContent() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            // If no main-content, scroll to categories section
            const categoriesSection = document.querySelector('.categories-section');
            if (categoriesSection) {
                categoriesSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    initAnimations() {
        // Add animation classes to elements
        const heroElements = [
            '.hero-badge',
            '.hero-title',
            '.hero-subtitle',
            '.hero-description',
            '.hero-stats',
            '.hero-cta',
            '.hero-countdown'
        ];

        heroElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.animationDelay = `${0.3 + (index * 0.1)}s`;
                element.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });

        // Add animation for featured product
        if (this.featuredProduct) {
            this.featuredProduct.style.animationDelay = '1s';
            this.featuredProduct.classList.add('animate__animated', 'animate__fadeInRight');
        }
    }

    handleProductClick(e) {
        e.preventDefault();

        if (!this.featuredProduct) return;

        // Get product details
        const productTitle = this.featuredProduct.querySelector('.product-title');
        const productPrice = this.featuredProduct.querySelector('.price-current');

        if (!productTitle || !productPrice) return;

        const productName = productTitle.textContent;
        const price = productPrice.textContent;

        // Show product quick view
        this.showNotification(`Quick view: ${productName} - ${price}`, 'info');
    }

    handleCTAClick(e, type) {
        e.preventDefault();

        let message = '';
        if (type === 'shop') {
            message = 'Redirecting to shop page...';
        } else if (type === 'deals') {
            message = 'Showing all deals...';
        }

        // Show notification
        this.showNotification(message, 'success');

        // Simulate navigation
        setTimeout(() => {
            console.log(`Navigating to ${type === 'shop' ? 'shop' : 'deals'} page`);
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);

            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        } else {
            // Fallback
            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }
}

// Initialize hero manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const heroManager = new HeroManager();

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate__animated {
            animation-duration: 0.6s;
            animation-fill-mode: both;
        }
        
        .animate__fadeInUp {
            animation-name: fadeInUp;
        }
        
        .animate__fadeInRight {
            animation-name: fadeInRight;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translate3d(0, 30px, 0);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }
        
        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translate3d(30px, 0, 0);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }

        .scroll-indicator {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 24px;
            cursor: pointer;
            animation: bounce 2s infinite;
            opacity: 1;
            visibility: visible;
            transition: opacity 0.3s, visibility 0.3s;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateX(-50%) translateY(0);
            }
            40% {
                transform: translateX(-50%) translateY(-10px);
            }
            60% {
                transform: translateX(-50%) translateY(-5px);
            }
        }
    `;
    document.head.appendChild(style);

    // Hide loading overlay after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 300);
            }
        }, 1000);
    });
});