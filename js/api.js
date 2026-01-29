// Product API Service
class ProductAPI {
    static BASE_URL = 'https://dummyjson.com';

    static async getProducts(limit = 1000, category = null) {
        try {
            let url = `${this.BASE_URL}/products?limit=${limit}`;
            if (category) {
                url = `${this.BASE_URL}/products/category/${category}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.products || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    static async getProduct(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/products/${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    static async getCategories() {
        try {
            const response = await fetch(`${this.BASE_URL}/products/categories`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    static async searchProducts(query) {
        try {
            const products = await this.getProducts();
            return products.filter(product =>
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                (product.category && product.category.toLowerCase().includes(query.toLowerCase()))
            );
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
}

// Local Storage API (Fallback)
class LocalStorageAPI {
    static async getProducts() {
        const products = JSON.parse(localStorage.getItem('products'));
        if (!products) {
            // Initialize with sample data if none exists
            const sampleProducts = [
                {
                    id: 1,
                    title: "Premium Wireless Headphones",
                    price: 199.99,
                    description: "High-quality wireless headphones with noise cancellation",
                    category: "electronics",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
                },
                {
                    id: 2,
                    title: "Modern Smart Watch",
                    price: 299.99,
                    description: "Feature-rich smart watch with health monitoring",
                    category: "electronics",
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
                },
                {
                    id: 3,
                    title: "Leather Jacket",
                    price: 159.99,
                    description: "Premium leather jacket for men",
                    category: "men's clothing",
                    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop"
                },
                {
                    id: 4,
                    title: "Summer Dress",
                    price: 89.99,
                    description: "Lightweight summer dress for women",
                    category: "women's clothing",
                    image: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&h-500&fit=crop"
                }
            ];
            localStorage.setItem('products', JSON.stringify(sampleProducts));
            return sampleProducts;
        }
        return products;
    }

    static async getProduct(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === id);
    }

    static async getCategories() {
        const products = await this.getProducts();
        const categories = [...new Set(products.map(p => p.category))];
        return categories;
    }

    static async searchProducts(query) {
        const products = await this.getProducts();
        return products.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Use LocalStorageAPI as fallback if DummyJSON API fails
let API = ProductAPI;

// Test connection to DummyJSON API on load
(async () => {
    try {
        await ProductAPI.getProducts(1);
        console.log('Connected to DummyJSON API');
        API = ProductAPI;
    } catch (error) {
        console.log('Using LocalStorage fallback');
        API = LocalStorageAPI;
    }
})();
