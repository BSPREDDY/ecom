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

// Slider Functionality
function initSlider() {
    const track = document.getElementById('catTrack');
    const prevBtn = document.getElementById('catPrev');
    const nextBtn = document.getElementById('catNext');

    if (!track || !prevBtn || !nextBtn) {
        console.error('Slider elements not found');
        return;
    }

    let slideIndex = 0;
    const slideWidth = 256; // 240px + 16px gap
    let autoInterval;

    function updateSlider() {
        track.style.transform = `translateX(${-slideIndex * slideWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
        slideIndex = Math.max(0, slideIndex - 1);
        updateSlider();
        resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        const maxIndex = Math.max(0, track.children.length - Math.floor(track.parentElement.offsetWidth / slideWidth));
        slideIndex = Math.min(maxIndex, slideIndex + 1);
        updateSlider();
        resetAutoSlide();
    });

    function autoSlide() {
        const maxIndex = Math.max(0, track.children.length - Math.floor(track.parentElement.offsetWidth / slideWidth));
        slideIndex = slideIndex >= maxIndex ? 0 : slideIndex + 1;
        updateSlider();
    }

    function resetAutoSlide() {
        clearInterval(autoInterval);
        autoInterval = setInterval(autoSlide, 4000);
    }

    // Only start auto-slide on desktop
    if (window.innerWidth > 768) {
        autoInterval = setInterval(autoSlide, 4000);
        track.addEventListener('mouseenter', () => clearInterval(autoInterval));
        track.addEventListener('mouseleave', resetAutoSlide);
    }
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