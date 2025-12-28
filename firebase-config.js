// Firebase Configuration and Initialization (Compat Mode Version)
// Use this if including Firebase via CDN in HTML:
// <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>

// If using ES modules, use this version instead:
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3k8ibsWl0RJeTn1oLdWN23ygb01zcWLs",
    authDomain: "styleshop-7ba8b.firebaseapp.com",
    projectId: "styleshop-7ba8b",
    storageBucket: "styleshop-7ba8b.firebasestorage.app",
    messagingSenderId: "889649349768",
    appId: "1:889649349768:web:4899d79b2d5cda1c05cb3d",
    measurementId: "G-190SH7CQ29"
};

// Global variables for Firebase services
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseAnalytics = null;

// Initialize Firebase using compat mode (for CDN)
function initializeFirebase() {
    try {
        if (window.firebase) {
            if (window.firebase.apps.length === 0) {
                firebaseApp = window.firebase.initializeApp(firebaseConfig);
            } else {
                firebaseApp = window.firebase.app();
            }
            firebaseAuth = window.firebase.auth();
            firebaseDb = window.firebase.database();
            firebaseAnalytics = window.firebase.analytics();
            console.log("[Firebase] Initialized successfully using compat mode");
            return true;
        } else {
            console.error("[Firebase] Firebase not loaded. Make sure to include Firebase scripts in HTML.");
            return false;
        }
    } catch (error) {
        console.error("[Firebase] Initialization Error:", error.message);
        return false;
    }
}

// Initialize Firebase if using ES modules
// function initializeFirebaseModules() {
//     try {
//         firebaseApp = initializeApp(firebaseConfig);
//         firebaseAnalytics = getAnalytics(firebaseApp);
//         firebaseAuth = getAuth(firebaseApp);
//         firebaseDb = getDatabase(firebaseApp);
//         console.log("[Firebase] Initialized successfully using ES modules");
//         return true;
//     } catch (error) {
//         console.error("[Firebase] Initialization Error:", error);
//         return false;
//     }
// }

// Real-time cart sync with Firebase
function setupRealtimeListeners() {
    // Check if Firebase is initialized
    if (!firebaseAuth || !firebaseDb) {
        console.warn("[Firebase] Cannot setup listeners: Firebase not initialized");
        return;
    }

    // Prevent duplicate listeners
    if (window.firebaseListenersSetup) {
        console.log("[Firebase] Listeners already setup");
        return;
    }

    // Cart update listener
    const handleCartUpdate = (e) => {
        if (firebaseAuth.currentUser) {
            const userId = firebaseAuth.currentUser.uid;
            firebaseDb
                .ref(`carts/${userId}`)
                .set({
                    cart: e.detail.cart,
                    timestamp: new Date().toISOString(),
                })
                .catch((err) => console.error("[Firebase] Cart sync error:", err));
        }
    };

    // Wishlist update listener
    const handleWishlistUpdate = (e) => {
        if (firebaseAuth.currentUser) {
            const userId = firebaseAuth.currentUser.uid;
            firebaseDb
                .ref(`wishlists/${userId}`)
                .set({
                    wishlist: e.detail.wishlist,
                    timestamp: new Date().toISOString(),
                })
                .catch((err) => console.error("[Firebase] Wishlist sync error:", err));
        }
    };

    // Add event listeners
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    // Mark listeners as setup
    window.firebaseListenersSetup = true;
    console.log("[Firebase] Realtime listeners setup complete");
}

// Cleanup listeners (optional, for single-page apps)
function cleanupRealtimeListeners() {
    if (window.firebaseListenersSetup) {
        // Remove event listeners
        window.removeEventListener("cartUpdated", handleCartUpdate);
        window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
        window.firebaseListenersSetup = false;
        console.log("[Firebase] Listeners cleaned up");
    }
}

// Initialize Firebase on window load
window.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    if (initializeFirebase()) {
        // Setup auth state observer
        if (firebaseAuth) {
            firebaseAuth.onAuthStateChanged((user) => {
                if (user) {
                    console.log("[Firebase] User signed in:", user.uid);
                    setupRealtimeListeners();
                } else {
                    console.log("[Firebase] User signed out");
                }
            });
        }
    }
});

// Export for use in other scripts
window.firebaseService = {
    getApp: () => firebaseApp,
    getAuth: () => firebaseAuth,
    getDb: () => firebaseDb,
    getAnalytics: () => firebaseAnalytics,
    initializeFirebase: initializeFirebase,
    setupRealtimeListeners: setupRealtimeListeners,
    cleanupRealtimeListeners: cleanupRealtimeListeners
};

// For ES modules, export like this:
// export { initializeFirebase, setupRealtimeListeners, cleanupRealtimeListeners };
// export default { firebaseApp, firebaseAuth, firebaseDb, firebaseAnalytics };