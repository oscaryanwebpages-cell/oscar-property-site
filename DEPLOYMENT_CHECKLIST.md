# Production Deployment Checklist

**Project**: Oscar Yan - Commercial Real Estate Expert
**Deployment Date**: 2026-02-14
**Version**: P3 Priority Sprint Completion

---

## Pre-Deployment Checklist

### Environment Configuration
- [ ] **Environment Variables Set**
  - [ ] `VITE_GOOGLE_MAPS_API_KEY` - Google Maps JavaScript API key
  - [ ] `VITE_FIREBASE_API_KEY` - Firebase project API key
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
  - [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
  - [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID
  - [ ] `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (GA4)

### Firebase Configuration
- [ ] **Firebase Project Selected**
  ```bash
  firebase use --add
  # Select production project
  firebase use default  # or your production project alias
  ```

- [ ] **Firestore Rules Deployed**
  ```bash
  firebase deploy --only firestore:rules
  ```
  Verify rules are in Firebase Console > Firestore > Rules

- [ ] **Storage Rules Deployed**
  ```bash
  firebase deploy --only storage:rules
  ```
  Verify rules are in Firebase Console > Storage > Rules

### Local Testing
- [ ] **Build Tested Locally**
  ```bash
  npm run build
  npm run preview
  ```
  - [ ] Test at http://localhost:4173
  - [ ] Verify no console errors
  - [ ] Verify all assets load correctly

- [ ] **Functionality Verified**
  - [ ] Homepage loads and displays correctly
  - [ ] Listings section displays properties
  - [ ] Map section loads (with valid API key)
  - [ ] Admin login works
  - [ ] Create listing form submits
  - [ ] Image uploads work (Storage emulator or production)
  - [ ] Contact form submits

---

## Deployment Steps

### 1. Clean Build
```bash
# Remove old build artifacts
rm -rf dist

# Create production build
npm run build

# Verify build output
ls -la dist/
```

### 2. Deploy Hosting (Static Files)
```bash
# Deploy Firebase Hosting
firebase deploy --only hosting

# Expected output:
# ✔ Deploy complete!
# Project console: https://console.firebase.google.com/project/...
# Hosting URL: https://oscaryan.my
```

### 3. Deploy Firestore Rules
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

### 4. Deploy Storage Rules
```bash
# Deploy Firebase Storage security rules
firebase deploy --only storage:rules
```

### 5. Deploy Cloud Functions (Optional - if using)
```bash
# Deploy Cloud Functions for Firebase
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

## Post-Deployment Verification

### Critical User Flows
- [ ] **Homepage Access**
  - [ ] Navigate to https://oscaryan.my
  - [ ] Verify page loads within 3 seconds
  - [ ] Verify SSL certificate is valid (green lock)
  - [ ] Verify meta tags are correct (view source)
  - [ ] Verify Open Graph tags (use Facebook Sharing Debugger)
  - [ ] Verify structured data (use Google Rich Results Test)

- [ ] **Admin Authentication**
  - [ ] Navigate to admin section
  - [ ] Verify login form displays
  - [ ] Test admin login with credentials
  - [ ] Verify admin dashboard loads
  - [ ] Verify no authentication errors in console

- [ ] **Listing Management**
  - [ ] Create new listing
  - [ ] Upload listing images
  - [ ] Verify images appear in Storage
  - [ ] Verify listing data in Firestore
  - [ ] Edit existing listing
  - [ ] Delete listing
  - [ ] Verify changes reflect on homepage

- [ ] **Map Functionality**
  - [ ] Verify map loads on homepage
  - [ ] Verify markers display
  - [ ] Click marker and verify detail modal opens
  - [ ] Verify cluster markers work
  - [ ] Test filter toggles (For Sale/For Rent)

### SEO & Performance
- [ ] **SEO Files Accessible**
  - [ ] https://oscaryan.my/sitemap.xml returns XML
  - [ ] https://oscaryan.my/robots.txt returns text
  - [ ] https://oscaryan.my/manifest.json returns JSON
  - [ ] Submit sitemap to Google Search Console
  - [ ] Submit sitemap to Bing Webmaster Tools

- [ ] **Analytics Verification**
  - [ ] Verify Google Analytics 4 is collecting data
  - [ ] Check real-time reports in GA4
  - [ ] Verify Microsoft Clarity is recording sessions
  - [ ] Test custom events (listing clicks, contact form)

### Performance Metrics
- [ ] **Lighthouse Score** (run in Chrome DevTools)
  - [ ] Performance score > 90
  - [ ] Accessibility score > 90
  - [ ] Best Practices score > 90
  - [ ] SEO score = 100

- [ ] **Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

---

## Rollback Procedure

If critical issues are found after deployment:

### Option 1: Rollback to Previous Hosting Release
```bash
# List previous releases
firebase hosting:releases:list

# Rollback to specific release
firebase hosting:releases:rollback RELEASE_ID
```

### Option 2: Emergency Fix
```bash
# Make hotfix locally
git checkout -b hotfix/emergency-fix
# Make changes
git commit -am "Emergency hotfix"
git push origin hotfix/emergency-fix

# Deploy immediately
npm run build
firebase deploy --only hosting
```

---

## Monitoring Post-Deployment

### First 24 Hours
- [ ] Monitor Firebase Console for errors
- [ ] Check Firestore usage and costs
- [ ] Monitor Storage usage
- [ ] Review Analytics for traffic spikes or drops
- [ ] Check Cloud Functions logs (if deployed)

### First Week
- [ ] Review search console for crawl errors
- [ ] Monitor page load times
- [ ] Check for broken links
- [ ] Verify image optimization is working
- [ ] Review user feedback

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Fails
```bash
# Check Firebase project selection
firebase projects:list
firebase use <project-id>

# Check deployment logs
firebase deploy --debug
```

### Map Not Loading
- Verify API key has correct restrictions
- Check browser console for API errors
- Verify billing is enabled on Google Cloud project

### Images Not Uploading
- Verify Storage rules are deployed
- Check CORS configuration in Storage
- Verify file size limits
- Check browser console for errors

---

## Contact Information

**Deployment Lead**: [Your Name]
**Firebase Project**: [Project ID]
**Hosting URL**: https://oscaryan.my
**Console**: https://console.firebase.google.com/project/[PROJECT_ID]

---

## Completion Checklist

- [ ] All pre-deployment items complete
- [ ] All deployment steps executed
- [ ] All post-deployment verifications passed
- [ ] Rollback procedure documented
- [ ] Monitoring setup confirmed
- [ ] Stakeholders notified of deployment

**Deployment Status**: _____________
**Signed Off By**: _____________
**Date**: _____________
