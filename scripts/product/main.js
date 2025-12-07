// Main Application Logic
import { initAuth, logout, showAuthModal, hideAuthModal } from '../auth.js';
import { initMobilePanel, updateMobileUserInfo } from '../mobile-panel.js';

// Global variables
let currentProduct = null;
let quantity = 1;
let reviews = [];
let displayedReviews = 3;

// DOM Elements
const getElement = (id) => document.getElementById(id);

const elements = {
    profileBtn: getElement('profileBtn'),
    profileMenu: getElement('profileMenu'),
    logoutBtn: getElement('logoutBtn'),
    cartBtn: getElement('cartBtn'),
    wishlistBtn: getElement('wishlistBtn'),
    cartCount: getElement('cartCount'),
    searchBtn: getElement('searchBtn'),
    desktopSearch: getElement('desktopSearch'),
    toast: getElement('toast'),
    toastMessage: getElement('toastMessage'),
    authModal: getElement('authModal'),
    loginRedirectBtn: getElement('loginRedirectBtn'),
    closeAuthModal: getElement('closeAuthModal'),
    userAvatar: getElement('userAvatar')
};

// Event Listeners Setup
function setupEventListeners() {
    // Profile dropdown
    if (elements.profileBtn && elements.profileMenu) {
        elements.profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = elements.profileMenu.style.display === 'block';
            elements.profileMenu.style.display = isOpen ? 'none' : 'block';
            elements.profileBtn.setAttribute('aria-expanded', !isOpen);
        });

        document.addEventListener('click', (e) => {
            if (elements.profileMenu && elements.profileMenu.style.display === 'block') {
                if (!elements.profileBtn.contains(e.target) && !elements.profileMenu.contains(e.target)) {
                    elements.profileMenu.style.display = 'none';
                    elements.profileBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // Logout functionality (desktop only)
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await logout();
                window.location.href = '../login_signup.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed. Please try again.', true);
            }
        });
    }

    // Auth modal buttons
    if (elements.loginRedirectBtn) {
        elements.loginRedirectBtn.addEventListener('click', () => {
            hideAuthModal();
            window.location.href = '../login_signup.html';
        });
    }

    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener('click', hideAuthModal);
    }

    // Search functionality
    setupSearchFunctionality();

    // Cart and wishlist buttons
    if (elements.cartBtn) elements.cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
    if (elements.wishlistBtn) elements.wishlistBtn.addEventListener('click', () => window.location.href = 'wishlist.html');
}

// Search Functionality
function setupSearchFunctionality() {
    function performSearch(query) {
        if (!query.trim()) return;
        window.location.href = `home.html?search=${encodeURIComponent(query)}`;
    }

    // Make search function available globally for mobile panel
    window.performSearch = performSearch;

    // Desktop search
    if (elements.searchBtn && elements.desktopSearch) {
        elements.searchBtn.addEventListener('click', () => {
            performSearch(elements.desktopSearch.value);
        });

        elements.desktopSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
            }
        });
    }
}

// Product Functions
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '1';
}

async function loadProductDetails() {
    const productId = getProductId();
    const container = document.getElementById('productContainer');

    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');

        currentProduct = await response.json();
        displayProductDetails(currentProduct);
        updateBreadcrumb(currentProduct);
        loadRelatedProducts(currentProduct.category);
        loadReviews(currentProduct.id);
    } catch (error) {
        if (container) {
            container.innerHTML = `
                <div class="loading" style="color:var(--danger)">
                    ⚠️ Failed to load product details.<br><br>
                    <a href="home.html" style="color:var(--primary);text-decoration:underline">
                        Return to Shop
                    </a>
                </div>
            `;
        }
        console.error('Error loading product:', error);
    }
}

function displayProductDetails(product) {
    const container = document.getElementById('productContainer');
    if (!container) return;

    const discount = Math.round(product.discountPercentage || 15);
    const originalPrice = Math.round(product.price * 83);
    const currentPrice = Math.round(originalPrice * (1 - discount / 100));
    const rating = product.rating || 0;

    // Generate proper star rating display
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '★';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHTML += '☆';
        } else {
            starsHTML += '☆';
        }
    }

    const images = product.images || [product.thumbnail];

    container.innerHTML = `
        <div class="product-container">
            <div class="product-images">
                <img src="${images[0]}" alt="${product.title}" class="main-image" id="mainImage">
                <div class="thumbnail-container" id="thumbnailContainer">
                    ${images.slice(0, 5).map((img, index) => `
                        <img src="${img}" alt="${product.title} ${index + 1}" 
                             class="thumbnail ${index === 0 ? 'active' : ''}" 
                             data-image="${img}">
                    `).join('')}
                </div>
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.title}</h1>
                <div class="product-rating">
                    <span class="stars">${starsHTML}</span>
                    <span class="rating-text">${rating.toFixed(1)} (${Math.floor(Math.random() * 500)} reviews)</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${currentPrice.toLocaleString()}</span>
                    <span class="original-price">₹${originalPrice.toLocaleString()}</span>
                    <span class="discount-badge">${discount}% OFF</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Brand:</span>
                        <span class="meta-value">${product.brand || 'Generic'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${product.category}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Stock:</span>
                        <span class="meta-value" style="color:${product.stock > 10 ? 'var(--success)' : 'var(--danger)'}">
                            ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                        </span>
                    </div>
                </div>
                <div class="quantity-section">
                    <span class="quantity-label">Quantity:</span>
                    <div class="quantity-controls">
                        <button class="qty-btn" id="decrementBtn" ${product.stock === 0 ? 'disabled' : ''}>−</button>
                        <span class="qty-value" id="qtyValue">1</span>
                        <button class="qty-btn" id="incrementBtn" ${product.stock === 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn-primary" id="addToCartBtn" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                    </button>
                    <button class="btn-secondary" id="buyNowBtn" ${product.stock === 0 ? 'disabled' : ''}>
                        ⚡ Buy Now
                    </button>
                    <button class="btn-wishlist" id="wishlistBtnProduct">
                        ♡
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners after HTML is rendered
    setupProductEventListeners();
}

function setupProductEventListeners() {
    // Thumbnail click events
    const thumbnails = document.querySelectorAll('.thumbnail');
    if (thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function () {
                const imageSrc = this.getAttribute('data-image');
                const mainImage = document.getElementById('mainImage');
                if (mainImage) mainImage.src = imageSrc;

                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Quantity buttons
    const decrementBtn = document.getElementById('decrementBtn');
    const incrementBtn = document.getElementById('incrementBtn');

    if (decrementBtn) decrementBtn.addEventListener('click', decrementQty);
    if (incrementBtn) incrementBtn.addEventListener('click', incrementQty);

    // Action buttons
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');
    const wishlistBtn = document.getElementById('wishlistBtnProduct');

    if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);
    if (buyNowBtn) buyNowBtn.addEventListener('click', buyNow);
    if (wishlistBtn) wishlistBtn.addEventListener('click', addToWishlist);
}

function incrementQty() {
    if (currentProduct && quantity < currentProduct.stock) {
        quantity++;
        const qtyValue = document.getElementById('qtyValue');
        if (qtyValue) qtyValue.textContent = quantity;
    }
}

function decrementQty() {
    if (quantity > 1) {
        quantity--;
        const qtyValue = document.getElementById('qtyValue');
        if (qtyValue) qtyValue.textContent = quantity;
    }
}

function addToCart() {
    if (!currentProduct) return;

    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const existingItem = cartData.find(item => item.productId === currentProduct.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartData.push({
            id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            productId: currentProduct.id,
            title: currentProduct.title,
            price: Math.round(currentProduct.price * 83 * (1 - (currentProduct.discountPercentage || 15) / 100)),
            thumbnail: currentProduct.thumbnail,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }

    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    updateCartBadge();
    showToast(`${quantity} × ${currentProduct.title} added to cart!`);
    quantity = 1;

    const qtyValue = document.getElementById('qtyValue');
    if (qtyValue) qtyValue.textContent = '1';
}

function buyNow() {
    addToCart();
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 500);
}

function addToWishlist() {
    if (!currentProduct) return;

    let wishlistData = JSON.parse(localStorage.getItem('wishlistData')) || [];
    const productData = {
        id: currentProduct.id,
        title: currentProduct.title,
        price: Math.round(currentProduct.price * 83),
        thumbnail: currentProduct.thumbnail,
        category: currentProduct.category,
        addedAt: new Date().toISOString()
    };

    if (!wishlistData.some(item => item.id === currentProduct.id)) {
        wishlistData.push(productData);
        localStorage.setItem('wishlistData', JSON.stringify(wishlistData));
        showToast(`${currentProduct.title} added to wishlist! ❤️`);
    } else {
        showToast('Already in wishlist!');
    }
}

function updateCartBadge() {
    let cartData = JSON.parse(sessionStorage.getItem('cartData')) || [];
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Reviews Functions
function loadReviews(productId) {
    generateSampleReviews(productId);
    displayReviews();
}

function generateSampleReviews(productId) {
    const sampleReviews = [
        {
            id: 1,
            reviewer: "Rahul Sharma",
            rating: 5,
            title: "Excellent product!",
            content: "I've been using this for a month now and it's absolutely fantastic. The quality is top-notch and it works exactly as described. Highly recommended!",
            date: "2025-01-15",
            helpful: 12
        },
        {
            id: 2,
            reviewer: "Priya Patel",
            rating: 4,
            title: "Very good value for money",
            content: "The product works well and looks great. It arrived on time and was well packaged. Only minor issue was the instructions could be clearer.",
            date: "2025-01-10",
            helpful: 8
        },
        {
            id: 3,
            reviewer: "Amit Kumar",
            rating: 3,
            title: "Average product",
            content: "Does what it's supposed to but nothing special. The build quality could be better for the price. Might look for alternatives next time.",
            date: "2025-01-05",
            helpful: 5
        },
        {
            id: 4,
            reviewer: "Sneha Gupta",
            rating: 5,
            title: "Best purchase this year!",
            content: "Exceeded all my expectations. The quality is amazing and it has made my life so much easier. Would definitely recommend to friends and family.",
            date: "2024-12-28",
            helpful: 15
        },
        {
            id: 5,
            reviewer: "Vikram Singh",
            rating: 2,
            title: "Not as expected",
            content: "The product looks different from the pictures and doesn't perform as advertised. Customer service was helpful with the return though.",
            date: "2024-12-20",
            helpful: 3
        },
        {
            id: 6,
            reviewer: "Anjali Mehta",
            rating: 4,
            title: "Great quality, minor issues",
            content: "Overall a good product. The color is beautiful and it works well. Had some issues with setup but got it working eventually.",
            date: "2024-12-15",
            helpful: 7
        }
    ];

    // Add more reviews
    const names = ["Rajesh", "Meera", "Suresh", "Kavita", "Deepak", "Neha", "Manoj", "Pooja"];
    const surnames = ["Verma", "Reddy", "Nair", "Joshi", "Malhotra", "Choudhary", "Banerjee", "Desai"];
    const reviewTitles = [
        "Great purchase!", "Works perfectly", "Good but could be better",
        "Excellent quality", "Satisfied customer", "Better than expected",
        "Decent product", "Worth the price", "Very happy", "Not bad"
    ];
    const reviewContents = [
        "This product has exceeded my expectations in every way.",
        "Solid performance and good build quality for the price.",
        "The product arrived on time and was exactly as described.",
        "I use this daily and it has been very reliable so far.",
        "Good value for money, would recommend to others.",
        "The features are useful and it's easy to set up.",
        "Does what it says on the tin, no complaints here.",
        "I'm very satisfied with this purchase overall.",
        "Works well for my needs, no issues so far.",
        "Good product but could use some improvements."
    ];

    for (let i = 7; i <= 20; i++) {
        const firstName = names[Math.floor(Math.random() * names.length)];
        const lastName = surnames[Math.floor(Math.random() * surnames.length)];
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
        const daysAgo = Math.floor(Math.random() * 90); // Within last 90 days

        sampleReviews.push({
            id: i,
            reviewer: `${firstName} ${lastName}`,
            rating: rating,
            title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
            content: reviewContents[Math.floor(Math.random() * reviewContents.length)],
            date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            helpful: Math.floor(Math.random() * 10)
        });
    }

    reviews = sampleReviews;
}

function displayReviews() {
    const reviewsSection = document.getElementById('reviewsSection');
    const reviewsList = document.getElementById('reviewsList');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (!reviewsSection || !reviewsList) return;

    // Calculate review statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(review => {
        ratingCounts[review.rating]++;
    });

    // Update review summary
    const overallRating = document.getElementById('overallRating');
    const reviewCount = document.getElementById('reviewCount');
    const overallStars = document.getElementById('overallStars');

    if (overallRating) {
        const productRating = currentProduct ? currentProduct.rating : averageRating;
        overallRating.textContent = productRating.toFixed(1);
    }

    if (reviewCount) {
        reviewCount.textContent = `Based on ${averageRating.toFixed(1)} (${reviews.length} reviews)`;
    }

    // Update star rating display
    if (overallStars) {
        const fullStars = Math.floor(averageRating);
        const hasHalfStar = averageRating % 1 >= 0.5;
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += '★';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHTML += '☆';
            } else {
                starsHTML += '☆';
            }
        }
        overallStars.innerHTML = starsHTML;
    }

    // Update rating breakdown
    const ratingBreakdown = document.getElementById('ratingBreakdown');
    if (ratingBreakdown) {
        ratingBreakdown.innerHTML = '';

        for (let i = 5; i >= 1; i--) {
            const percentage = totalReviews > 0 ? (ratingCounts[i] / totalReviews) * 100 : 0;
            const bar = document.createElement('div');
            bar.className = 'rating-bar';
            bar.innerHTML = `
                <span class="rating-label">${i}★</span>
                <div class="rating-progress">
                    <div class="rating-progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-percentage">${Math.round(percentage)}%</span>
            `;
            ratingBreakdown.appendChild(bar);
        }
    }

    // Display reviews
    if (totalReviews === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <div class="no-reviews-icon">💬</div>
                <div class="no-reviews-text">No reviews yet</div>
                <p>Be the first to review this product!</p>
            </div>
        `;
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    } else {
        // Sort reviews by date (newest first)
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayReviewBatch();

        // Show/hide load more button
        if (loadMoreContainer) {
            if (displayedReviews >= totalReviews) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
            }
        }
    }

    // Show reviews section
    reviewsSection.style.display = 'block';
}

function displayReviewBatch() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

    const reviewsToShow = reviews.slice(0, displayedReviews);

    reviewsToShow.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';

        // Generate proper star rating
        const fullStars = Math.floor(review.rating);
        const hasHalfStar = review.rating % 1 >= 0.5;
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += '★';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHTML += '☆';
            } else {
                starsHTML += '☆';
            }
        }

        // Format date
        const date = new Date(review.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get reviewer initial for avatar
        const reviewerInitial = review.reviewer.split(' ').map(n => n[0]).join('').toUpperCase();

        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${reviewerInitial}</div>
                    <div class="reviewer-details">
                        <div class="reviewer-name">${review.reviewer}</div>
                        <div class="review-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="review-rating">${starsHTML}</div>
            </div>
            <div class="review-title">${review.title}</div>
            <div class="review-content">${review.content}</div>
            <div class="review-helpful">
                <span>Was this review helpful?</span>
                <button class="helpful-btn" data-review-id="${review.id}">
                    👍 <span class="helpful-count">${review.helpful}</span>
                </button>
            </div>
        `;

        reviewsList.appendChild(reviewCard);
    });

    // Add event listeners to helpful buttons
    document.querySelectorAll('.helpful-btn').forEach(button => {
        button.addEventListener('click', function () {
            const reviewId = parseInt(this.getAttribute('data-review-id'));
            const countElement = this.querySelector('.helpful-count');
            let count = parseInt(countElement.textContent);
            count++;
            countElement.textContent = count;
            this.disabled = true;
            this.style.opacity = '0.7';

            // Update the review in our data
            const reviewIndex = reviews.findIndex(r => r.id === reviewId);
            if (reviewIndex !== -1) {
                reviews[reviewIndex].helpful = count;
            }
        });
    });
}

function loadMoreReviews() {
    displayedReviews += 3;
    displayReviewBatch();

    // Hide load more button if all reviews are displayed
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer && displayedReviews >= reviews.length) {
        loadMoreContainer.style.display = 'none';
    }
}

// Review Form Functionality
function handleReviewSubmit(e) {
    e.preventDefault();

    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const titleInput = document.getElementById('reviewTitle');
    const contentInput = document.getElementById('reviewContent');

    if (!ratingInput || !titleInput || !contentInput) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!ratingInput) {
        showToast('Please select a rating');
        return;
    }

    if (!title || !content) {
        showToast('Please fill in all fields');
        return;
    }

    const rating = parseInt(ratingInput.value);
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userName = localStorage.getItem('userName') || userEmail.split('@')[0];

    // Create new review
    const newReview = {
        id: Date.now(),
        reviewer: userName,
        rating: rating,
        title: title,
        content: content,
        date: new Date().toISOString().split('T')[0],
        helpful: 0
    };

    // Add to reviews array
    reviews.unshift(newReview);

    // Reset form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) reviewForm.reset();

    // Reset star rating display
    document.querySelectorAll('.star-label').forEach(label => {
        label.style.color = '#ddd';
    });

    // Update display
    displayReviews();

    // Show success message
    showToast('Review submitted successfully!');
}

function initializeStarRating() {
    const starLabels = document.querySelectorAll('.star-label');
    const reviewForm = document.getElementById('reviewForm');

    starLabels.forEach((label, index) => {
        label.addEventListener('click', () => {
            // Update visual state
            starLabels.forEach((l, i) => {
                if (i <= index) {
                    l.style.color = '#fbbf24';
                } else {
                    l.style.color = '#ddd';
                }
            });
        });
    });

    // Reset stars when form is reset
    if (reviewForm) {
        reviewForm.addEventListener('reset', () => {
            starLabels.forEach(label => {
                label.style.color = '#ddd';
            });
        });
    }
}

// Related Products Functions
async function loadRelatedProducts(category) {
    if (!currentProduct) return;

    try {
        const response = await fetch(`https://dummyjson.com/products/category/${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error('Failed to load related products');

        const data = await response.json();
        const relatedProducts = data.products.filter(p => p.id !== currentProduct.id).slice(0, 4);
        if (relatedProducts.length > 0) displayRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function displayRelatedProducts(products) {
    const grid = document.getElementById('relatedGrid');
    const section = document.getElementById('relatedSection');

    if (!grid || !section) return;

    grid.innerHTML = '';
    products.forEach(product => {
        const discount = Math.round(product.discountPercentage || 15);
        const price = Math.round(product.price * 83 * (1 - discount / 100));

        const card = document.createElement('div');
        card.className = 'related-card';
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
            <div class="related-title">${product.title}</div>
            <div class="related-price">₹${price.toLocaleString()}</div>
        `;
        card.addEventListener('click', () => {
            window.location.href = `product.html?id=${product.id}`;
        });
        grid.appendChild(card);
    });
    section.style.display = 'block';
}

// Utility Functions
function showToast(message, isError = false) {
    if (elements.toastMessage && elements.toast) {
        elements.toastMessage.textContent = message;
        elements.toast.className = 'toast show';
        elements.toast.style.background = isError ? '#ef4444' : '#10b981';
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }
}

// Make showToast available globally for mobile panel
window.showToast = showToast;

function updateBreadcrumb(product) {
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    const breadcrumbProduct = document.getElementById('breadcrumbProduct');

    if (breadcrumbCategory) breadcrumbCategory.textContent = product.category;
    if (breadcrumbProduct) {
        const title = product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title;
        breadcrumbProduct.textContent = title;
    }
    document.title = `${product.title} — ShopMate`;
}

// Initialize authentication and update UI
async function initAuthAndUI() {
    try {
        const isAuthenticated = await initAuth();
        return isAuthenticated;
    } catch (error) {
        console.error('Error in auth initialization:', error);
        return false;
    }
}

// Initialize Application
async function init() {
    try {
        // Initialize mobile panel
        initMobilePanel();

        // Setup event listeners
        setupEventListeners();

        // Update cart badge
        updateCartBadge();

        // Initialize auth and UI
        await initAuthAndUI();

        // Load product details (regardless of authentication)
        await loadProductDetails();

        // Add event listeners for reviews
        const reviewForm = document.getElementById('reviewForm');
        const loadMoreBtn = document.getElementById('loadMoreReviews');

        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const isAuthenticated = await initAuth();
                if (!isAuthenticated) {
                    showToast('Please sign in to submit a review');
                    showAuthModal();
                    return;
                }
                handleReviewSubmit(e);
            });
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreReviews);
        }

        // Initialize star rating functionality
        initializeStarRating();
    } catch (error) {
        console.error('Error in application initialization:', error);
    }
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Fix for right side white space
document.body.style.overflowX = 'hidden';
document.documentElement.style.overflowX = 'hidden';