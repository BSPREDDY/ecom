// Performance Optimization Script
class PerformanceOptimizer {
    constructor() {
        this.initializeOptimizations();
    }

    initializeOptimizations() {
        this.lazyLoadImages();
        this.deferNonCriticalCSS();
        this.optimizeAnimations();
        this.setupServiceWorker();
        this.optimizeFontLoading();
        this.setupResourcePreloading();
    }

    lazyLoadImages() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading is supported
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        } else {
            // Fallback for older browsers
            this.lazyLoadImagesFallback();
        }
    }

    lazyLoadImagesFallback() {
        const lazyImages = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for very old browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    deferNonCriticalCSS() {
        // Load non-critical CSS asynchronously
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"][data-async]');
        stylesheets.forEach(link => {
            link.rel = 'preload';
            link.as = 'style';
            link.onload = () => {
                link.rel = 'stylesheet';
            };
        });
    }

    optimizeAnimations() {
        // Use requestAnimationFrame for smooth animations
        const animate = (element, property, start, end, duration) => {
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const currentValue = start + (end - start) * progress;
                element.style[property] = currentValue + 'px';

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            requestAnimationFrame(update);
        };

        // Expose animation function to global scope
        window.smoothAnimate = animate;
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    registration => {
                        console.log('ServiceWorker registration successful');
                    },
                    error => {
                        console.log('ServiceWorker registration failed: ', error);
                    }
                );
            });
        }
    }

    optimizeFontLoading() {
        // Preconnect to Google Fonts
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://fonts.gstatic.com';
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);

        // Load fonts with font-display: swap
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@700;800&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }

    setupResourcePreloading() {
        // Preload critical resources
        const resources = [
            { href: '/css/main.css', as: 'style' },
            { href: '/js/app.js', as: 'script' }
        ];

        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    // Image optimization helper
    static getOptimizedImageUrl(url, width, quality = 80) {
        // In a real app, you would use a CDN or image processing service
        // This is a placeholder for the optimization logic
        return url;
    }

    // Cache management
    static clearOldCache() {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.startsWith('shopease-')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});