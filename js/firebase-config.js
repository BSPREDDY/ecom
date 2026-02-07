// js/firebase-config.js
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o",
    authDomain: "authentication-1f69e.firebaseapp.com",
    projectId: "authentication-1f69e",
    storageBucket: "authentication-1f69e.firebasestorage.app",
    messagingSenderId: "719879359858",
    appId: "1:719879359858:web:8eb24d174d30245c45e1eb"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');

    // Set persistence
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log('Auth persistence set to LOCAL');
        })
        .catch((error) => {
            console.error('Error setting auth persistence:', error);
        });
} catch (error) {
    console.error('Firebase initialization error:', error);
}