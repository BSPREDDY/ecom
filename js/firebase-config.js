// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase configuration - Replace with your .env variables
const firebaseConfig = {
    apiKey: "AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o",
    authDomain: "authentication-1f69e.firebaseapp.com",
    projectId: "authentication-1f69e",
    storageBucket: "authentication-1f69e.firebasestorage.app",
    messagingSenderId: "719879359858",
    appId: "1:719879359858:web:8eb24d174d30245c45e1eb",
    measurementId: "G-8XF582MC3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };