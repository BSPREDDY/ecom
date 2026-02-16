// Initialize Firebase
try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(CONFIG.FIREBASE);
        console.log('Firebase initialized successfully');

        // Set persistence
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log('Auth persistence set to LOCAL');
            })
            .catch((error) => {
                console.error('Error setting auth persistence:', error);
            });
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}
