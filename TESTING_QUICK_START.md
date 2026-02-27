# Testing Quick Start Guide
## Oscar Yan Property Agent Website
**For Development Team**

---

## 🚀 Quick Start (5 Minutes)

### 1. Review Deliverables
```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"

# Read in order:
1. TESTING_INFRASTRUCTURE_SUMMARY.md  (Overview)
2. TEST_PLAN.md                        (E2E tests)
3. PERFORMANCE_REPORT.md               (Performance)
4. SEO_REPORT.md                       (SEO)
5. BROWSER_COMPATIBILITY_REPORT.md      (Cross-browser)
```

### 2. Run Performance Audit
```bash
# Install Lighthouse
npm install -g lighthouse

# Run on production (update URL if needed)
lighthouse https://oscaryan.my --output=json --output-path=./lighthouse-report.json

# Run on local
lighthouse http://localhost:5173 --view
```

### 3. Test Critical Flows
```bash
# Start dev server
npm run dev

# Test in browser:
# 1. Homepage loads
# 2. Click listing card (modal opens)
# 3. Try filters (Commercial, Industrial, etc.)
# 4. Search for "warehouse"
# 5. Navigate to /admin
# 6. Try login (if you have credentials)
```

---

## 📋 P0 Action Items (This Week)

### 1. Performance (2 hours)
- [ ] Run Lighthouse on homepage
- [ ] Run Lighthouse on listing detail
- [ ] Document scores in PERFORMANCE_REPORT.md
- [ ] Identify top 3 bottlenecks

### 2. Safari Testing (2 hours)
- [ ] Open on iPhone or Mac
- [ ] Test image carousel
- [ ] Test video playback
- [ ] Test map display
- [ ] Check for 100vh issues (scroll when shouldn't)
- [ ] Document findings

### 3. SEO Essentials (2 hours)
- [ ] Create `public/sitemap.xml`
- [ ] Create `public/robots.txt`
- [ ] Add alt tags to images in ListingCard.tsx
- [ ] Add alt tags to images in ListingDetail.tsx
- [ ] Validate with Google Rich Results Test

### 4. E2E Framework (3 hours)
- [ ] Install: `npm install -D @playwright/test`
- [ ] Install browsers: `npx playwright install`
- [ ] Add `data-testid` to components
- [ ] Write first test
- [ ] Run: `npx playwright test`

---

## 🧪 Manual Testing Checklist

### Homepage (5 minutes)
- [ ] Loads without errors
- [ ] Listings display
- [ ] Filters work
- [ ] Search works
- [ ] No console errors

### Listing Detail (5 minutes)
- [ ] Modal opens
- [ ] Images load
- [ ] Carousel works
- [ ] Map displays
- [ ] Video plays (if present)
- [ ] No console errors

### Admin (5 minutes)
- [ ] Login works
- [ ] Listings table loads
- [ ] Create listing works
- [ ] Edit listing works
- [ ] Status changes work
- [ ] No console errors

---

## 📊 Test Data Setup

### Import Mock Listings (2 minutes)
```bash
# Option 1: Firebase Console
# 1. Go to https://console.firebase.google.com
# 2. Select your project
# 3. Go to Firestore > Import JSON
# 4. Select test-data/mock-listings.json
# 5. Import to 'listings' collection

# Option 2: Firebase CLI (requires setup)
firebase firestore:import test-data/mock-listings.json
```

### Create Test Admin (2 minutes)
```bash
# Firebase Console
# 1. Go to Authentication > Add User
# 2. Email: test-admin@oscaryan.my
# 3. Password: TestPassword123!
# 4. Click Add User
```

### Update Whitelist (2 minutes)
```typescript
// Edit /components/admin/AdminLogin.tsx
const ADMIN_EMAILS = [
  "oscar@oscaryan.my",
  "oscaryanwebpages@gmail.com",
  "test-admin@oscaryan.my",  // Add this
];

// Edit /firestore.rules
const adminEmails = [
  "oscar@oscaryan.my",
  "oscaryanwebpages@gmail.com",
  "test-admin@oscaryan.my",  // Add this
];
```

---

## 🔧 Common Commands

### Performance
```bash
# Lighthouse (production)
lighthouse https://oscaryan.my --view

# Lighthouse (local)
lighthouse http://localhost:5173 --view

# Bundle size
npm run build
# Check output for bundle sizes
```

### E2E Testing
```bash
# Install
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test tests/homepage.spec.ts
```

### Firebase
```bash
# Start emulator
firebase emulators:start

# Import data
firebase firestore:import test-data/mock-listings.json
```

---

## 🐛 Common Issues

### Issue: Images not loading
- **Cause**: Firebase Storage rules or CORS
- **Fix**: Check storage.rules, update CORS settings

### Issue: Map not displaying
- **Cause**: Missing Google Maps API key
- **Fix**: Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`

### Issue: Admin login fails
- **Cause**: Email not whitelisted
- **Fix**: Add email to `AdminLogin.tsx` and `firestore.rules`

### Issue: Lighthouse fails on local
- **Cause**: Server not running or wrong port
- **Fix**: Start dev server (`npm run dev`), check port

### Issue: Playwright tests fail
- **Cause**: Wrong baseURL or missing dependencies
- **Fix**: Update `playwright.config.ts` baseURL, run `npx playwright install`

---

## 📚 Useful Links

### Testing Tools
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Playwright: https://playwright.dev/
- BrowserStack: https://www.browserstack.com/

### SEO Tools
- Google Rich Results: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/
- Facebook Debugger: https://developers.facebook.com/tools/debug/

### Performance Tools
- WebPageTest: https://www.webpagetest.org/
- Bundlephobia: https://bundlephobia.com/
- Squoosh: https://squoosh.app/

---

## 📞 Getting Help

### Questions About Testing
- Check the relevant report (TEST_PLAN.md, PERFORMANCE_REPORT.md, etc.)
- Check test-data/README.md for test data questions
- Ask Testing Agent

### Questions About Implementation
- Check existing documentation (README.md, implementation plan)
- Check code comments
- Ask Development Team

### Questions About Priority
- Check TESTING_INFRASTRUCTURE_SUMMARY.md for P0/P1/P2 rankings
- Check individual reports for detailed priority lists
- Ask Product Owner

---

## ✅ Daily Testing Routine

### Before Committing Code (2 minutes)
```bash
# 1. Run dev server
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Test manually:
# - Homepage loads?
# - No console errors?
# - New feature works?
# - Nothing broken?

# 4. If all good, commit
git add .
git commit -m "feat: new feature"
```

### Before Release (10 minutes)
```bash
# 1. Run build
npm run build

# 2. Check for errors
# If build fails, fix before releasing

# 3. Test locally
npm run preview
# Open http://localhost:4173
# Test critical flows

# 4. If all good, deploy
firebase deploy
```

---

## 🎯 This Week's Goals

### Monday
- [ ] Read TESTING_INFRASTRUCTURE_SUMMARY.md
- [ ] Run Lighthouse on production
- [ ] Document scores

### Tuesday
- [ ] Test on Safari (or set up BrowserStack)
- [ ] Document Safari issues
- [ ] Fix 100vh issue if found

### Wednesday
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Add alt tags to images

### Thursday
- [ ] Install Playwright
- [ ] Add data-testid to components
- [ ] Write first test

### Friday
- [ ] Review progress
- [ ] Plan next week
- [ ] Document lessons learned

---

**Created By**: Testing Agent
**Last Updated**: 2025-02-14
**For**: Development Team
**Version**: 1.0
