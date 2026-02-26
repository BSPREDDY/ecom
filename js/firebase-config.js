// js/firebase-config.js
(function () {
    function init() {
        if (typeof firebase === 'undefined') return;
        if (!window.CONFIG || !window.CONFIG.FIREBASE) return;

        if (!firebase.apps.length) {
            firebase.initializeApp(window.CONFIG.FIREBASE);
            console.log('✅ Firebase initialized');
        }

        const auth = firebase.auth();

        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                document.dispatchEvent(
                    new CustomEvent('firebase-ready', {
                        detail: { auth }
                    })
                );
            })
            .catch(console.error);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();