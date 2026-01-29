// firebase-config.js - Firebase configuration using CDN/compat version
(function () {
    'use strict';

    console.log('[Firebase] Config script loading...');

    const firebaseConfig = {
        apiKey: "AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o",
        authDomain: "authentication-1f69e.firebaseapp.com",
        projectId: "authentication-1f69e",
        storageBucket: "authentication-1f69e.firebasestorage.app",
        messagingSenderId: "719879359858",
        appId: "1:719879359858:web:8eb24d174d30245c45e1eb",
        measurementId: "G-8XF582MC3Y"
    };

    // Function to check if Firebase is loaded correctly
    function checkFirebaseLoaded() {
        // Check if wrong version is loaded (modular version)
        const scripts = document.getElementsByTagName('script');
        let wrongVersionLoaded = false;

        for (let script of scripts) {
            if (script.src.includes('firebasejs/') &&
                script.src.includes('firebase-app.js') &&
                !script.src.includes('compat')) {
                wrongVersionLoaded = true;
                console.error('[Firebase] Wrong Firebase version detected (modular version). Looking for compat version.');
                break;
            }
        }

        return !wrongVersionLoaded;
    }

    // Function to initialize Firebase
    function initializeFirebase() {
        console.log('[Firebase] Checking Firebase availability...');

        // First check if correct version is loaded
        if (!checkFirebaseLoaded()) {
            console.error('[Firebase] Wrong Firebase version. Make sure to use -compat.js files.');
            return false;
        }

        if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function') {
            console.log('[Firebase] Firebase library is available');

            try {
                // Check if already initialized
                if (!firebase.apps || firebase.apps.length === 0) {
                    console.log('[Firebase] Initializing Firebase app...');
                    firebase.initializeApp(firebaseConfig);
                } else {
                    console.log('[Firebase] Firebase already initialized');
                }

                // Make auth available globally
                window.firebaseAuth = firebase.auth();
                window.firebaseReady = true;

                console.log('[Firebase] Firebase initialized successfully');

                // Dispatch event for other modules
                try {
                    const event = new CustomEvent('firebaseReady');
                    document.dispatchEvent(event);
                } catch (eventError) {
                    console.warn('[Firebase] Could not dispatch event:', eventError);
                }

                return true;

            } catch (error) {
                console.error('[Firebase] Initialization error:', error);
                window.firebaseReady = false;
                return false;
            }
        } else {
            console.warn('[Firebase] Firebase library not available yet');
            return false;
        }
    }

    // Try to initialize immediately
    if (typeof firebase !== 'undefined') {
        console.log('[Firebase] Firebase available on script load');
        initializeFirebase();
    } else {
        console.log('[Firebase] Firebase not available yet, will wait');

        // Listen for Firebase to be loaded
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkFirebase);
                console.log('[Firebase] Detected Firebase loaded, initializing...');
                initializeFirebase();
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkFirebase);
            if (!window.firebaseReady) {
                console.error('[Firebase] Firebase failed to load after timeout');
            }
        }, 5000);
    }

    // Also try on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function () {
        console.log('[Firebase] DOMContentLoaded - checking Firebase');
        if (!window.firebaseReady) {
            setTimeout(initializeFirebase, 100);
        }
    });

    // Export config
    window.firebaseConfig = firebaseConfig;
})();