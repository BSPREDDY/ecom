import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDdh-oCx5lv1tg0KUrpS1IfGohWDKSMeyI",
    authDomain: "shopmate-65761.firebaseapp.com",
    projectId: "shopmate-65761",
    storageBucket: "shopmate-65761.firebasestorage.app",
    messagingSenderId: "488365861082",
    appId: "1:488365861082:web:3de58a294ca5eadb385de3",
    measurementId: "G-2G9W19EX50"
};

// Initialize Firebase
let app;
let auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Set persistence to keep users logged in
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log('Firebase auth persistence set to LOCAL');
        })
        .catch((error) => {
            console.error('Error setting auth persistence:', error);
        });

    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Create fallback auth object to prevent crashes
    auth = {
        currentUser: null,
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (callback) => {
            callback(null);
            return () => { };
        }
    };
}

export { auth };