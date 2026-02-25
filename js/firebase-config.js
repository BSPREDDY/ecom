// Wait for Firebase to be ready
(function () {
    function initializeFirebase() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded');
                return;
            }

            // Check if CONFIG is available
            if (typeof CONFIG === 'undefined') {
                console.error('CONFIG not found. Make sure config.js is loaded first.');
                return;
            }

            // Initialize Firebase if not already initialized
            if (!firebase.apps || firebase.apps.length === 0) {
                console.log('Initializing Firebase with config:', CONFIG.FIREBASE);

                // Initialize with config
                firebase.initializeApp(CONFIG.FIREBASE);
                console.log('Firebase initialized successfully');

                // Get auth instance
                const auth = firebase.auth();

                // Set persistence - FIXED: Use the correct syntax for compat version
                auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                    .then(() => {
                        console.log('Auth persistence set to LOCAL');

                        // Monitor auth state
                        auth.onAuthStateChanged((user) => {
                            if (user) {
                                console.log('User is signed in:', user.email);
                                // You can dispatch an event or update UI here
                                document.dispatchEvent(new CustomEvent('auth-state-changed', {
                                    detail: { user: user }
                                }));
                            } else {
                                console.log('No user signed in');
                                document.dispatchEvent(new CustomEvent('auth-state-changed', {
                                    detail: { user: null }
                                }));
                            }
                        });
                    })
                    .catch((error) => {
                        console.error('Error setting auth persistence:', error);
                    });
            } else {
                console.log('Firebase already initialized');
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFirebase);
    } else {
        initializeFirebase();
    }
})();