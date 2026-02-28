# SARUKU E-Commerce App - Netlify Deployment Guide

## Overview
This guide will help you deploy your SARUKU e-commerce application to Netlify with all necessary environment variables and configurations.

---

## Step 1: Prepare Your Repository

### 1.1 Create a GitHub Repository (Recommended)
```bash
# Initialize git in your project folder
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - SARUKU e-commerce app"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/ecomfrontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Files You Have Ready
- ✅ `netlify.toml` - Already created with proper configuration
- ✅ `manifest.json` - PWA configuration
- ✅ `sw.js` - Service Worker for offline support
- ✅ All HTML, CSS, and JS files

---

## Step 2: Set Up Netlify Account & Deploy

### 2.1 Create Netlify Account
1. Go to https://app.netlify.com
2. Click **"Sign up"** (you can use GitHub for faster signup)
3. Complete the registration process

### 2.2 Connect Your Repository
**Option A: Via Git (Recommended)**
1. Click **"New site from Git"** button
2. Choose **"GitHub"** as your Git provider
3. Authorize Netlify to access your GitHub account
4. Select your **ecomfrontend** repository
5. Click **"Deploy"**

**Option B: Manual Upload (No Git Required)**
1. Drag and drop your entire project folder to Netlify
2. Or click **"Upload an existing project"** and select your folder

---

## Step 3: Configure Environment Variables

Your app uses these environment variables:

### 3.1 Environment Variables Needed

#### Firebase Configuration (Already in code, but can be moved to env vars for security)
```
FIREBASE_API_KEY=AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o
FIREBASE_AUTH_DOMAIN=authentication-1f69e.firebaseapp.com
FIREBASE_PROJECT_ID=authentication-1f69e
FIREBASE_STORAGE_BUCKET=authentication-1f69e.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=719879359858
FIREBASE_APP_ID=1:719879359858:web:8eb24d174d30245c45e1eb
```

#### API Configuration
```
API_BASE_URL=https://dummyjson.com
```

### 3.2 Add Environment Variables to Netlify

1. Go to your Netlify site dashboard
2. Click **"Site settings"** → **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"** button
4. Add each variable:
   - Key: `FIREBASE_API_KEY`
   - Value: `AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o`
5. Click **"Save"**
6. Repeat for all other variables listed above

**OR** Add them via netlify.toml:

```toml
[context.production.environment]
FIREBASE_API_KEY = "AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o"
FIREBASE_AUTH_DOMAIN = "authentication-1f69e.firebaseapp.com"
FIREBASE_PROJECT_ID = "authentication-1f69e"
FIREBASE_STORAGE_BUCKET = "authentication-1f69e.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID = "719879359858"
FIREBASE_APP_ID = "1:719879359858:web:8eb24d174d30245c45e1eb"
API_BASE_URL = "https://dummyjson.com"
```

---

## Step 4: Update Your Configuration Files (Optional but Recommended)

### 4.1 Create `.env.example` File
This shows what environment variables are needed without revealing secrets:

```bash
# Copy this file to .env for local development
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
FIREBASE_APP_ID=your_firebase_app_id_here
API_BASE_URL=https://dummyjson.com
```

### 4.2 Update `js/config.js` to Use Environment Variables

Instead of hardcoding values, dynamically load them:

```javascript
// js/config.js
window.API_BASE_URL = window.ENV?.API_BASE_URL || 'https://dummyjson.com';

window.CONFIG = {
    FIREBASE: {
        apiKey: window.ENV?.FIREBASE_API_KEY || "AIzaSyBymNxicwA7ALiiNKJVyTZlBQTI1nuZa6o",
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "authentication-1f69e.firebaseapp.com",
        projectId: window.ENV?.FIREBASE_PROJECT_ID || "authentication-1f69e",
        storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "authentication-1f69e.firebasestorage.app",
        messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "719879359858",
        appId: window.ENV?.FIREBASE_APP_ID || "1:719879359858:web:8eb24d174d30245c45e1eb"
    }
};
```

---

## Step 5: Deployment Checklist

- [ ] Created GitHub repository (or have project ready)
- [ ] Connected Netlify to your GitHub repository
- [ ] Added all environment variables in Netlify dashboard
- [ ] Verified `netlify.toml` is in your root directory
- [ ] Updated build settings if needed
- [ ] Enabled PWA support (manifest.json is configured)
- [ ] Service Worker (sw.js) is configured

---

## Step 6: Deploy

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push
   ```

2. Netlify will automatically deploy! Watch the build logs:
   - Go to your site dashboard
   - Click **"Deploys"** tab
   - View the build progress

3. Once deployment completes, you'll get a URL like:
   ```
   https://your-site-name.netlify.app
   ```

---

## Step 7: Manage Deployments

### Preview Deploys
- Every git commit creates a preview deploy
- Share preview URLs with teammates before going live
- Useful for testing before merging to main branch

### Production Deploy
- Only main branch deploys to your primary URL
- Use branch protection rules for better control

### Rollback
1. Go to **"Deploys"** tab
2. Click on any previous deployment
3. Click **"Publish deploy"** to rollback

---

## Step 8: Custom Domain (Optional)

1. In Netlify dashboard, click **"Site settings"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Enter your domain name (e.g., saruku.com)
4. Follow DNS setup instructions
5. Netlify will automatically provision an SSL certificate

---

## Step 9: Monitor Your Site

### Build Notifications
1. Go to **"Site settings"** → **"Build & deploy"** → **"Deploy notifications"**
2. Add email notifications for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed

### Analytics
1. Enable Netlify Analytics to track your site performance
2. Track pageviews, traffic sources, and more

---

## Troubleshooting

### Issue: Files not found / 404 errors
**Solution:** 
- Make sure `netlify.toml` redirect rule is in place
- Check that all HTML files are in the root directory

### Issue: Service Worker not working
**Solution:**
- Service Workers require HTTPS (Netlify provides this automatically)
- Clear browser cache and service worker
- Check browser DevTools → Application → Service Workers

### Issue: Firebase Authentication not working
**Solution:**
- Verify all Firebase credentials are correct
- Check Firebase Console for CORS settings
- Ensure your Netlify domain is whitelisted in Firebase

### Issue: Environment variables not loading
**Solution:**
- Clear cache: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Redeploy after adding environment variables
- Check that variable names match exactly (case-sensitive)

---

## Performance Optimization

### Enable Compression
Already configured in `netlify.toml` with cache headers

### Asset Optimization
- CSS and JS files are cached for 1 year
- HTML files use no-cache (always fresh)
- Images are cached long-term

### PWA Support
Your app already has:
- ✅ Service Worker for offline support
- ✅ Web manifest for installation
- ✅ PWA-ready configuration

---

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Enable HTTPS** - Netlify does this automatically
3. **Set strong passwords** - For admin/accounts
4. **Regular backups** - Export data regularly
5. **Monitor deployments** - Enable build notifications

---

## Next Steps

1. ✅ Deploy to Netlify (following steps above)
2. 📧 Set up build notifications
3. 🎯 Configure custom domain
4. 📊 Enable analytics
5. 🔐 Review security settings
6. 🚀 Optimize performance
7. 🧪 Test all features on live site

---

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://support.netlify.com
- **Firebase Docs**: https://firebase.google.com/docs
- **PWA Guide**: https://web.dev/progressive-web-apps/

---

## Your Site Details

Once deployed, your site will have:
- **Primary URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: (optional, requires domain purchase)
- **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- **CDN**: Global content delivery network
- **Uptime SLA**: 99.99% uptime guarantee
