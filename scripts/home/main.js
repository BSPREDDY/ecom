import { auth } from '/scripts/firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

let products = [];

// Fix for right side white space
document.body.style.overflowX = 'hidden';
document.documentElement.style.overflowX = 'hidden';

// Mobile Panel Toggle
function initMobilePanel() {
    const hamburger = document.getElementById('hamburger');
    const mobilePanel = document.getElementById('mobilePanel');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileClose = document.getElementById('mobileClose');

    if (!hamburger || !mobilePanel) {
        console.error('Mobile panel elements not found');
        return;
    }

    function toggleMobilePanel() {
        mobilePanel.classList.toggle('show');
        mobileOverlay.classList.toggle('show');
        document.body.style.overflow = mobilePanel.classList.contains('show') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMobilePanel);
    mobileClose.addEventListener('click', toggleMobilePanel);
    mobileOverlay.addEventListener('click', toggleMobilePanel);

    // Close mobile panel when clicking on links
    mobilePanel.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMobilePanel();
        });
    });

    // Close mobile panel with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobilePanel.classList.contains('show')) {
            toggleMobilePanel();
        }
    });
}

// Profile Dropdown
function initProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    if (!profileBtn || !profileMenu) {
        console.error('Profile dropdown elements not found');
        return;
    }

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = profileMenu.style.display === 'block';
        profileMenu.style.display = isOpen ? 'none' : 'block';
        profileBtn.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.style.display = 'none';
            profileBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Logout functionality
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = '/login_signup.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed. Please try again.', true);
            }
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = '/login_signup.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed. Please try again.', true);
            }
        });
    }
}

// Search Functionality
function initSearch() {
    function performSearch(query) {
        if (!query.trim()) {
            displayProducts(products); // Show all products if query is empty
            return;
        }
        const filtered = products.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.brand?.toLowerCase().includes(query.toLowerCase())
        );
        displayProducts(filtered);
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        showToast(`Found ${filtered.length} product${filtered.length !== 1 ? 's' : ''} for "${query}"`);
    }

    const searchBtn = document.getElementById('searchBtn');
    const desktopSearch = document.getElementById('desktopSearch');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearch = document.getElementById('mobileSearch');

    if (searchBtn && desktopSearch) {
        searchBtn.addEventListener('click', () => {
            performSearch(desktopSearch.value);
        });

        desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(e.target.value);
        });
    }

    if (mobileSearchBtn && mobileSearch) {
        mobileSearchBtn.addEventListener('click', () => {
            performSearch(mobileSearch.value);
        });

        mobileSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
            }
        });
    }
}

// Function to generate star ratings
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    stars += '☆'.repeat(emptyStars);

    return stars;
}

// Fallback products data in case API fails
const fallbackProducts = [
    {
        id: 1,
        title: "iPhone 15 Pro",
        category: "smartphones",
        price: 999,
        rating: 4.8,
        thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=500&q=60",
        description: "Latest iPhone with advanced camera and A17 Pro chip",
        brand: "Apple"
    },
    {
        id: 2,
        title: "Samsung Galaxy S24",
        category: "smartphones",
        price: 899,
        rating: 4.6,
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=60",
        description: "Powerful Android smartphone with AI features",
        brand: "Samsung"
    },
    {
        id: 3,
        title: "Nike Air Max",
        category: "fashion",
        price: 120,
        rating: 4.4,
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60",
        description: "Comfortable running shoes with air cushioning",
        brand: "Nike"
    },
    {
        id: 4,
        title: "MacBook Pro",
        category: "laptops",
        price: 1999,
        rating: 4.9,
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=60",
        description: "Professional laptop for creative work",
        brand: "Apple"
    },
    {
        id: 5,
        title: "Sony Headphones",
        category: "electronics",
        price: 299,
        rating: 4.5,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60",
        description: "Noise cancelling wireless headphones",
        brand: "Sony"
    },
    {
        id: 6,
        title: "Levi's Jeans",
        category: "fashion",
        price: 79,
        rating: 4.3,
        thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=60",
        description: "Classic denim jeans for everyday wear",
        brand: "Levi's"
    },
    {
        id: 7,
        title: "iPad Air",
        category: "tablets",
        price: 599,
        rating: 4.7,
        thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=60",
        description: "Versatile tablet for work and entertainment",
        brand: "Apple"
    },
    {
        id: 8,
        title: "Smart Watch",
        category: "wearables",
        price: 249,
        rating: 4.2,
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=60",
        description: "Fitness tracking and smart notifications",
        brand: "Fitbit"
    }
];

// Load Products with fallback
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) {
        console.error('Product grid element not found');
        return;
    }

    try {
        console.log('Fetching products from API...');
        const res = await fetch('https://dummyjson.com/products?limit=8');

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        products = data.products || fallbackProducts;
        console.log('Products loaded successfully:', products.length);
    } catch (err) {
        console.error('Error loading products from API, using fallback:', err);
        products = fallbackProducts;
    }

    displayProducts(products);
}

// Display Products
function displayProducts(productsToShow) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (productsToShow.length === 0) {
        grid.innerHTML = '<div class="loading">No products found. Try a different search.</div>';
        return;
    }

    productsToShow.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card fade-up';
        card.onclick = () => navigateToProduct(p.id);

        // Calculate discount pricing
        const currentPrice = Math.round(p.price * 83);
        const originalPrice = Math.round(p.price * 83 * 1.2); // 20% more for original price
        const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

        // Generate random review count for demonstration
        const reviewCount = Math.floor(Math.random() * 5000) + 100;

        card.innerHTML = `
            <img src="${p.thumbnail}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=500&q=60'">
            <div class="title">${p.title}</div>
            <div class="category">${p.category}</div>
            <div class="features">${p.description ? p.description.substring(0, 60) + '...' : 'Premium quality product with amazing features'}</div>
            <div class="rating-container">
                <div class="stars">${generateStars(p.rating || 4.0)} ${(p.rating || 4.0).toFixed(1)}</div>
                <div class="rating-count">(${reviewCount.toLocaleString()})</div>
            </div>
            <div class="price-container">
                <div class="current-price">₹${currentPrice.toLocaleString()}</div>
                <div class="original-price">₹${originalPrice.toLocaleString()}</div>
                <div class="discount">${discountPercentage}% off</div>
            </div>
            <div class="card-footer">
                <button data-id="${p.id}" class="add-btn">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);

        // Add event listener to the button after creating the card
        const addBtn = card.querySelector('.add-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(p.id);
        });
    });

    setTimeout(() => {
        document.querySelectorAll('.card.fade-up').forEach((card, index) => {
            setTimeout(() => card.classList.add('show'), index * 50);
        });
    }, 100);
}

function navigateToProduct(productId) {
    window.location.href = `/pages/product.html?id=${productId}`;
}

// Function to navigate to category page
function navigateToCategory(category) {
    window.location.href = `/pages/category.html?category=${encodeURIComponent(category)}`;
}

// Cart Functionality
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        console.error('Product not found for ID:', id);
        showToast('Product not found!', true);
        return;
    }

    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const existingItem = cartData.find(item => item.productId === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartData.push({
            id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            productId: id,
            title: product.title,
            price: Math.round(product.price * 83),
            thumbnail: product.thumbnail,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    updateCartBadge();

    const btn = document.querySelector(`button[data-id="${id}"]`);
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('added');
        }, 2000);
    }

    showToast(`${product.title} added to cart!`);
}

function updateCartBadge() {
    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function initCartButtons() {
    const cartBtn = document.getElementById('cartBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = '/pages/cart.html';
        });
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            window.location.href = '/pages/wishlist.html';
        });
    }
}

// Toast Functionality
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) {
        console.log('Toast:', message);
        return;
    }

    toast.className = 'toast show';
    if (isError) {
        toast.style.background = '#ef4444';
    } else {
        toast.style.background = '#10b981';
    }

    toastMessage.textContent = message;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Advanced Swipe Functionality for All Devices
function initAdvancedSwipe() {
    const track = document.getElementById('catTrack');
    if (!track) return;

    let startX = 0;
    let endX = 0;
    let startY = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;
    const slideWidth = 256; // 240px + 16px gap
    let slideIndex = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let animationFrameId = null;
    let momentumAnimationId = null;

    // Calculate max index
    function getMaxIndex() {
        return Math.max(0, track.children.length - Math.floor(track.parentElement.offsetWidth / slideWidth));
    }

    // Update slider position
    function updateSliderPosition(instant = false) {
        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        track.style.transform = `translateX(${-slideIndex * slideWidth}px)`;
    }

    // Handle start of drag/swipe
    function handleStart(clientX, clientY) {
        startX = clientX;
        startY = clientY;
        lastX = clientX;
        lastTime = Date.now();
        isDragging = true;
        isHorizontalSwipe = false;
        track.style.transition = 'none';

        // Cancel any ongoing animations
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (momentumAnimationId) {
            cancelAnimationFrame(momentumAnimationId);
            momentumAnimationId = null;
        }
    }

    // Handle move during drag/swipe
    function handleMove(clientX, clientY) {
        if (!isDragging) return;

        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;

        if (deltaTime > 0) {
            const deltaX = clientX - lastX;
            velocity = deltaX / deltaTime;
            lastX = clientX;
            lastTime = currentTime;
        }

        const diffX = clientX - startX;
        const diffY = clientY - startY;

        // Determine if this is a horizontal swipe
        if (!isHorizontalSwipe && Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
            isHorizontalSwipe = true;
        }

        if (isHorizontalSwipe) {
            const maxIndex = getMaxIndex();
            const maxTranslate = -maxIndex * slideWidth;
            const currentTranslate = -slideIndex * slideWidth;

            // Calculate new position with elasticity
            let translateX = currentTranslate + diffX;

            // Add elastic effect at boundaries
            if (translateX > 0) {
                translateX = translateX * 0.3; // Elastic effect when trying to scroll past start
            } else if (translateX < maxTranslate) {
                const overshoot = maxTranslate - translateX;
                translateX = maxTranslate - overshoot * 0.3; // Elastic effect when trying to scroll past end
            }

            track.style.transform = `translateX(${translateX}px)`;

            // Prevent default behavior to avoid scrolling the page
            return true;
        }

        return false;
    }

    // Handle end of drag/swipe
    function handleEnd(clientX) {
        if (!isDragging) return;
        isDragging = false;

        const diffX = clientX - startX;
        const threshold = 50; // Minimum swipe distance
        const maxIndex = getMaxIndex();

        // Apply momentum if velocity is high
        if (Math.abs(velocity) > 0.5 && isHorizontalSwipe) {
            applyMomentum(velocity);
            return;
        }

        // Regular swipe detection
        if (isHorizontalSwipe && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                // Swipe right - go to previous slide
                slideIndex = Math.max(0, slideIndex - 1);
            } else {
                // Swipe left - go to next slide
                slideIndex = Math.min(maxIndex, slideIndex + 1);
            }
        } else if (isHorizontalSwipe) {
            // If small movement, snap to nearest slide
            const currentTranslate = -slideIndex * slideWidth;
            const targetTranslate = -Math.round((-currentTranslate + diffX) / slideWidth) * slideWidth;
            slideIndex = Math.max(0, Math.min(maxIndex, Math.round((-targetTranslate) / slideWidth)));
        }

        updateSliderPosition();
    }

    // Apply momentum scrolling
    function applyMomentum(initialVelocity) {
        const friction = 0.95;
        const minVelocity = 0.01;
        let currentVelocity = initialVelocity;
        const maxIndex = getMaxIndex();

        function momentumStep() {
            if (Math.abs(currentVelocity) < minVelocity || !isHorizontalSwipe) {
                // Snap to nearest slide
                const currentTranslate = parseFloat(track.style.transform.replace('translateX(', '').replace('px)', ''));
                slideIndex = Math.max(0, Math.min(maxIndex, Math.round((-currentTranslate) / slideWidth)));
                updateSliderPosition();
                return;
            }

            // Apply velocity
            const currentTranslate = parseFloat(track.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
            let newTranslate = currentTranslate + currentVelocity * 16; // 16ms per frame

            // Check boundaries with elasticity
            if (newTranslate > 0) {
                newTranslate = newTranslate * 0.5;
                currentVelocity *= -0.5; // Bounce back
            } else if (newTranslate < -maxIndex * slideWidth) {
                const overshoot = -maxIndex * slideWidth - newTranslate;
                newTranslate = -maxIndex * slideWidth - overshoot * 0.5;
                currentVelocity *= -0.5; // Bounce back
            }

            track.style.transform = `translateX(${newTranslate}px)`;
            currentVelocity *= friction;

            momentumAnimationId = requestAnimationFrame(momentumStep);
        }

        momentumAnimationId = requestAnimationFrame(momentumStep);
    }

    // Touch Events
    track.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
    });

    track.addEventListener('touchmove', (e) => {
        if (handleMove(e.touches[0].clientX, e.touches[0].clientY)) {
            e.preventDefault();
        }
    }, { passive: false });

    track.addEventListener('touchend', (e) => {
        handleEnd(e.changedTouches[0].clientX);
    });

    // Mouse Events for Desktop
    track.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);

        const handleMouseMove = (e) => {
            if (handleMove(e.clientX, e.clientY)) {
                e.preventDefault();
            }
        };

        const handleMouseUp = (e) => {
            handleEnd(e.clientX);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'grabbing';
    });

    // Mouse wheel for horizontal scrolling (desktop)
    track.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            const maxIndex = getMaxIndex();

            if (e.deltaX > 0) {
                // Scroll right
                slideIndex = Math.max(0, slideIndex - 1);
            } else {
                // Scroll left
                slideIndex = Math.min(maxIndex, slideIndex + 1);
            }

            updateSliderPosition();
        }
    }, { passive: false });

    // Make sure slideIndex stays in sync with button clicks
    const prevBtn = document.getElementById('catPrev');
    const nextBtn = document.getElementById('catNext');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            slideIndex = Math.max(0, slideIndex - 1);
            updateSliderPosition();
            resetAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxIndex = getMaxIndex();
            slideIndex = Math.min(maxIndex, slideIndex + 1);
            updateSliderPosition();
            resetAutoSlide();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const maxIndex = getMaxIndex();

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            slideIndex = Math.max(0, slideIndex - 1);
            updateSliderPosition();
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            slideIndex = Math.min(maxIndex, slideIndex + 1);
            updateSliderPosition();
            resetAutoSlide();
        }
    });

    // Auto-slide functionality
    let autoInterval;

    function resetAutoSlide() {
        clearInterval(autoInterval);
        if (window.innerWidth > 768) {
            autoInterval = setInterval(() => {
                const maxIndex = getMaxIndex();
                slideIndex = slideIndex >= maxIndex ? 0 : slideIndex + 1;
                updateSliderPosition();
            }, 4000);
        }
    }

    // Pause auto-slide on hover (desktop only)
    if (window.innerWidth > 768) {
        track.addEventListener('mouseenter', () => clearInterval(autoInterval));
        track.addEventListener('mouseleave', resetAutoSlide);
        resetAutoSlide();
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const maxIndex = getMaxIndex();
            if (slideIndex > maxIndex) {
                slideIndex = maxIndex;
                updateSliderPosition(true);
            }

            // Restart auto-slide if needed
            if (window.innerWidth > 768 && !autoInterval) {
                resetAutoSlide();
            } else if (window.innerWidth <= 768) {
                clearInterval(autoInterval);
                autoInterval = null;
            }
        }, 250);
    });

    // Initial position
    updateSliderPosition(true);
}

// Slider Functionality
function initSlider() {
    const track = document.getElementById('catTrack');
    const prevBtn = document.getElementById('catPrev');
    const nextBtn = document.getElementById('catNext');

    if (!track || !prevBtn || !nextBtn) {
        console.error('Slider elements not found');
        return;
    }

    // Initialize advanced swipe functionality
    initAdvancedSwipe();
}

// Add click event listeners to category slides - redirect to category page
function initCategoryNavigation() {
    document.querySelectorAll('.slide').forEach(slide => {
        slide.addEventListener('click', () => {
            const category = slide.getAttribute('data-category');
            if (category) {
                navigateToCategory(category);
            }
        });
    });

    // Add click event listeners to hero category links - redirect to category page
    document.querySelectorAll('.hero-cats a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.includes('pages/category.html')) {
                window.location.href = href;
            }
        });
    });
}

// Intersection Observer for animations
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('show');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Check if user is logged in
function initAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is logged in:', user.email);

            // Get user initial
            let userInitial = 'U';
            if (user.displayName) {
                userInitial = user.displayName.charAt(0).toUpperCase();
            } else if (user.email) {
                userInitial = user.email.charAt(0).toUpperCase();
            }

            // Try to get from localStorage as fallback
            if (!userInitial || userInitial === 'U') {
                userInitial = localStorage.getItem('userInitial') || 'U';
            }

            // Update avatars
            const userAvatar = document.getElementById('userAvatar');
            const mobileUserAvatar = document.getElementById('mobileUserAvatar');
            const mobileUserEmail = document.getElementById('mobileUserEmail');
            const mobileUserName = document.getElementById('mobileUserName');

            if (userAvatar) {
                userAvatar.textContent = userInitial;
                userAvatar.style.backgroundColor = '#2874f0';
                userAvatar.style.color = 'white';
            }

            if (mobileUserAvatar) {
                mobileUserAvatar.textContent = userInitial;
                mobileUserAvatar.style.backgroundColor = '#2874f0';
                mobileUserAvatar.style.color = 'white';
            }

            if (mobileUserEmail) {
                mobileUserEmail.textContent = user.email || 'user@example.com';
            }

            if (mobileUserName) {
                mobileUserName.textContent = user.displayName || user.email?.split('@')[0] || 'Welcome Back!';
            }

            // Store user initial for later use
            localStorage.setItem('userInitial', userInitial);
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userName', user.displayName || user.email?.split('@')[0] || '');
        } else {
            console.log('No user logged in - but not showing popup on home page');
            // Don't show popup on home page, allow browsing
        }
    });
}

// Initialize authentication modal buttons
function initAuthModal() {
    const loginRedirectBtn = document.getElementById('loginRedirectBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authModal = document.getElementById('authModal');
    const profileBtn = document.getElementById('profileBtn');

    if (loginRedirectBtn) {
        loginRedirectBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('show');
            document.body.style.overflow = '';
            window.location.href = '/login_signup.html';
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Check if user is logged in
            onAuthStateChanged(auth, (user) => {
                if (!user && authModal) {
                    e.preventDefault();
                    authModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    // Close modal when clicking outside
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize everything
function init() {
    console.log('Initializing ShopMate Home Page...');

    // Initialize all components
    initMobilePanel();
    initProfileDropdown();
    initLogout();
    initSearch();
    initCartButtons();
    initSlider();
    initCategoryNavigation();
    initAnimations();
    initSmoothScrolling();
    initAuth();
    initAuthModal();

    // Load data
    loadProducts();
    updateCartBadge();

    // Show hero animations
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-up').forEach(el => el.classList.add('show'));
    }, 200);

    console.log('ShopMate Home Page initialized successfully');
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}