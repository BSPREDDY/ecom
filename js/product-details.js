// Product Details Page Script
class ProductDetailsPage {
    constructor() {
        this.productId = null;
        this.product = null;
        this.selectedVariations = {};
        this.quantity = 1;
        this.initializePage();
    }

    async initializePage() {
        this.getProductIdFromURL();

        if (this.productId) {
            await this.loadProductDetails();
            this.loadRelatedProducts();
            this.loadReviews();
            this.setupEventListeners();
            this.initializeImageGallery();
        } else {
            this.showError('Product not found');
        }
    }

    getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = parseInt(urlParams.get('id'));
    }

    async loadProductDetails() {
        const container = document.getElementById('productDetailContainer');
        if (!container) return;

        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            this.product = await API.getProduct(this.productId);
            this.renderProductDetails();
        } catch (error) {
            console.error('Error loading product details:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Product Not Found</h3>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <a href="products.html" class="btn btn-primary">Browse Products</a>
                </div>
            `;
        }
    }

    renderProductDetails() {
        const container = document.getElementById('productDetailContainer');
        if (!container || !this.product) return;

        const isInWishlist = window.app ? window.app.isInWishlist(this.product.id) : false;
        const basePrice = this.product.price;

        container.innerHTML = `
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${this.product.image}" alt="${this.product.title}" id="mainProductImage">
                    <div class="zoom-lens"></div>
                    <div class="zoom-result"></div>
                </div>
                <div class="thumbnails">
                    <div class="thumbnail active">
                        <img src="${this.product.image}" alt="${this.product.title}">
                    </div>
                    <!-- Additional thumbnails would be added here for products with multiple images -->
                </div>
            </div>

            <div class="product-info">
                <h1>${this.product.title}</h1>
                
                <div class="product-rating-large">
                    <div class="rating-stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <span class="review-count">(125 reviews)</span>
                    <span class="product-stock in-stock">In Stock</span>
                </div>

                <div class="product-price-large" data-base-price="${basePrice}">
                    $${basePrice.toFixed(2)}
                </div>

                <div class="product-description">
                    <h3>Description</h3>
                    <p>${this.product.description}</p>
                    <p>High-quality product with premium materials and excellent craftsmanship. Perfect for everyday use.</p>
                </div>

                <!-- Variations -->
                <div class="variations">
                    <div class="variation-group">
                        <label>Color</label>
                        <div class="variation-options">
                            <div class="variation-option selected" data-variation="color" data-value="black">
                                Black
                            </div>
                            <div class="variation-option" data-variation="color" data-value="white">
                                White
                            </div>
                            <div class="variation-option" data-variation="color" data-value="blue">
                                Blue
                            </div>
                            <div class="variation-option disabled" data-variation="color" data-value="red">
                                Red (Out of Stock)
                            </div>
                        </div>
                    </div>

                    <div class="variation-group">
                        <label>Size</label>
                        <div class="variation-options">
                            <div class="variation-option selected" data-variation="size" data-value="m">
                                M
                            </div>
                            <div class="variation-option" data-variation="size" data-value="l">
                                L
                            </div>
                            <div class="variation-option" data-variation="size" data-value="xl">
                                XL
                            </div>
                            <div class="variation-option" data-variation="size" data-value="xxl">
                                XXL
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quantity Selector -->
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="10">
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <span class="stock-info">Only 10 items left</span>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="btn btn-primary btn-add-to-cart">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="btn btn-wishlist-detail ${isInWishlist ? 'active' : ''}">
                        <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>

                <!-- Product Meta -->
                <div class="product-meta">
                    <div class="meta-item">
                        <i class="fas fa-shipping-fast"></i>
                        <span>Free shipping on orders over $100</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-undo"></i>
                        <span>30-day return policy</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>2-year warranty included</span>
                    </div>
                </div>
            </div>
        `;

        // Initialize product interactions
        this.initializeProductInteractions();
    }

    initializeProductInteractions() {
        // Variation selection
        document.querySelectorAll('.variation-option:not(.disabled)').forEach(option => {
            option.addEventListener('click', (e) => {
                const variation = e.currentTarget.dataset.variation;
                const value = e.currentTarget.dataset.value;

                // Update selected variations
                this.selectedVariations[variation] = value;

                // Update UI
                const group = e.currentTarget.parentElement;
                group.querySelectorAll('.variation-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');

                // Update price if needed
                this.updatePrice();
            });
        });

        // Quantity controls
        const quantityInput = document.querySelector('.quantity-input');
        document.querySelector('.quantity-btn.decrease')?.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
                this.quantity = quantityInput.value;
                this.updatePrice();
            }
        });

        document.querySelector('.quantity-btn.increase')?.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
                this.quantity = quantityInput.value;
                this.updatePrice();
            }
        });

        quantityInput.addEventListener('change', (e) => {
            let value = parseInt(e.target.value);
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            e.target.value = value;
            this.quantity = value;
            this.updatePrice();
        });

        // Add to cart button
        document.querySelector('.btn-add-to-cart')?.addEventListener('click', () => {
            if (window.app && this.product) {
                window.app.addToCart(this.product, this.quantity, this.selectedVariations);

                // Show success animation
                const button = document.querySelector('.btn-add-to-cart');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Added!';
                button.style.backgroundColor = '#28a745';

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                }, 2000);
            }
        });

        // Wishlist button
        const wishlistBtn = document.querySelector('.btn-wishlist-detail');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                if (window.app && this.product) {
                    window.app.toggleWishlist(this.product);

                    // Update button state
                    const icon = wishlistBtn.querySelector('i');
                    icon.classList.toggle('far');
                    icon.classList.toggle('fas');
                    wishlistBtn.classList.toggle('active');

                    // Show feedback
                    if (wishlistBtn.classList.contains('active')) {
                        wishlistBtn.style.backgroundColor = '#f72585';
                    } else {
                        wishlistBtn.style.backgroundColor = '';
                    }
                }
            });
        }
    }

    updatePrice() {
        const basePrice = parseFloat(document.querySelector('.product-price-large')?.dataset.basePrice || 0);
        let finalPrice = basePrice;

        // Apply variation price adjustments (if any)
        // In a real app, you would fetch price adjustments from the server
        if (this.selectedVariations.color === 'white') {
            finalPrice += 5;
        }
        if (this.selectedVariations.size === 'xl' || this.selectedVariations.size === 'xxl') {
            finalPrice += 3;
        }

        // Apply quantity
        finalPrice *= this.quantity;

        // Update displayed price
        const priceElement = document.querySelector('.product-price-large');
        if (priceElement) {
            priceElement.textContent = `$${finalPrice.toFixed(2)}`;
        }
    }

    initializeImageGallery() {
        const mainImage = document.getElementById('mainProductImage');
        if (!mainImage) return;

        // Image zoom
        mainImage.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                const zoomResult = document.querySelector('.zoom-result');
                const zoomLens = document.querySelector('.zoom-lens');

                if (!zoomResult || !zoomLens) return;

                const { left, top, width, height } = mainImage.getBoundingClientRect();
                const x = ((e.pageX - left) / width) * 100;
                const y = ((e.pageY - top) / height) * 100;

                const lensSize = 150;
                zoomLens.style.display = 'block';
                zoomLens.style.width = `${lensSize}px`;
                zoomLens.style.height = `${lensSize}px`;
                zoomLens.style.left = `${e.pageX - left - lensSize / 2}px`;
                zoomLens.style.top = `${e.pageY - top - lensSize / 2}px`;

                zoomResult.style.display = 'block';
                zoomResult.style.backgroundImage = `url('${mainImage.src}')`;
                zoomResult.style.backgroundSize = `${width * 2}px ${height * 2}px`;
                zoomResult.style.backgroundPosition = `${x}% ${y}%`;
            }
        });

        mainImage.addEventListener('mouseleave', () => {
            const zoomResult = document.querySelector('.zoom-result');
            const zoomLens = document.querySelector('.zoom-lens');

            if (zoomResult) zoomResult.style.display = 'none';
            if (zoomLens) zoomLens.style.display = 'none';
        });

        // Thumbnail click
        document.querySelectorAll('.thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                const imgSrc = thumbnail.querySelector('img').src;
                mainImage.src = imgSrc;

                document.querySelectorAll('.thumbnail').forEach(t => {
                    t.classList.remove('active');
                });
                thumbnail.classList.add('active');
            });
        });
    }

    async loadRelatedProducts() {
        const container = document.getElementById('relatedProducts');
        if (!container || !this.product) return;

        try {
            // In a real app, you would fetch related products by category
            const products = await API.getProducts(4);

            if (window.app) {
                window.app.renderProducts(products, container);
            }
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    async loadReviews() {
        const container = document.getElementById('reviewList');
        if (!container) return;

        // Sample reviews data
        const reviews = [
            {
                id: 1,
                user: 'John Doe',
                rating: 5,
                date: '2024-11-15',
                title: 'Excellent Product!',
                content: 'This product exceeded my expectations. The quality is outstanding and it works perfectly.'
            },
            {
                id: 2,
                user: 'Jane Smith',
                rating: 4,
                date: '2024-11-10',
                title: 'Very Good',
                content: 'Good product, works as described. Shipping was fast and packaging was secure.'
            },
            {
                id: 3,
                user: 'Mike Johnson',
                rating: 5,
                date: '2024-11-05',
                title: 'Highly Recommended',
                content: 'One of the best purchases I have made this year. Great value for money.'
            }
        ];

        let reviewsHTML = '';
        reviews.forEach(review => {
            reviewsHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <span class="reviewer">${review.user}</span>
                            <div class="review-rating">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                        <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <h4>${review.title}</h4>
                    <p>${review.content}</p>
                </div>
            `;
        });

        container.innerHTML = reviewsHTML;

        // Initialize star rating for review form
        this.initializeStarRating();
    }

    initializeStarRating() {
        const stars = document.querySelectorAll('.star-rating i');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('mouseover', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            });

            star.addEventListener('click', (e) => {
                selectedRating = parseInt(e.target.dataset.rating);
                this.highlightStars(selectedRating);
            });
        });

        document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
            this.highlightStars(selectedRating);
        });

        // Review form submission
        document.getElementById('reviewForm')?.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!window.app || !window.app.currentUser) {
                alert('Please login to submit a review');
                return;
            }

            if (selectedRating === 0) {
                alert('Please select a rating');
                return;
            }

            const title = document.getElementById('reviewTitle').value;
            const content = document.getElementById('reviewContent').value;

            // In a real app, you would submit this to a server
            alert('Review submitted successfully!');

            // Reset form
            document.getElementById('reviewForm').reset();
            selectedRating = 0;
            this.highlightStars(0);
        });
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-rating i');
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }

    showError(message) {
        const container = document.getElementById('productDetailContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <a href="products.html" class="btn btn-primary">Browse Products</a>
                </div>
            `;
        }
    }
}

// Initialize product details page
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.product-detail')) {
        window.productDetailsPage = new ProductDetailsPage();
    }
});