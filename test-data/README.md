# Test Data Directory

This directory contains test fixtures and mock data for testing the Oscar Yan Property Agent website.

## 📁 Files

### 1. `mock-listings.json`
**Purpose**: Sample property listings for testing

**Contains**:
- 7 mock listings covering all categories (Commercial, Industrial, Land, Office)
- Both listing types (SALE, RENT)
- Different statuses (active, sold)
- Listings with and without multimedia (images, video, audio, panorama)
- Complete specifications for each listing

**Usage**:
- Manual testing: Import to Firebase Firestore via Firebase Console
- Automated testing: Load in test setup before running tests
- Development: Use as reference for data structure

**Listing IDs**:
- `test-listing-commercial-001` - Commercial space with video
- `test-listing-industrial-001` - Warehouse with 4 images
- `test-listing-land-001` - Development land
- `test-listing-office-001` - Office suite for rent
- `test-listing-industrial-002` - Factory for rent
- `test-listing-inactive-001` - Sold listing (status: sold)
- `test-listing-multimedia-001` - Full multimedia (video, audio, panorama)

### 2. `mock-admin.json`
**Purpose**: Admin credentials and test scenarios

**Contains**:
- Test admin email and password
- Whitelisted emails reference
- Test scenarios for login
- Admin action test cases
- Firebase emulator setup notes

**Usage**:
- Manual testing: Login to admin panel
- Automated testing: Authenticate in test setup
- Development: Reference for admin features

**⚠️ Security Warning**:
- These credentials are for **testing only**
- **DO NOT** use in production
- Create dedicated test accounts in Firebase Auth
- Never commit real credentials

### 3. `test-urls.txt`
**Purpose**: List of URLs to test

**Contains**:
- Homepage URL
- Listing detail URLs (all mock listings)
- Filtered page URLs (category, type)
- Admin URLs
- Edge case URLs (invalid IDs, malformed URLs)
- Multimedia test URLs
- SEO and social sharing URLs
- Performance test URLs
- Mobile and cross-browser test URLs

**Usage**:
- Manual testing: Open each URL in browsers
- Automated testing: Import into Playwright/Cypress
- Lighthouse: Run audits on each URL
- SEO: Test with Facebook/Twitter validators

## 🚀 Quick Start

### Manual Testing Setup

1. **Import Mock Listings**:
   ```bash
   # Open Firebase Console
   # Go to Firestore > Import JSON
   # Select mock-listings.json
   # Import to 'listings' collection
   ```

2. **Create Test Admin**:
   ```bash
   # Open Firebase Console
   # Go to Authentication > Add User
   # Email: test-admin@oscaryan.my
   # Password: TestPassword123!
   ```

3. **Update Whitelist**:
   - Edit `/firestore.rules`: Add `test-admin@oscaryan.my`
   - Edit `/components/admin/AdminLogin.tsx`: Add to whitelist array

4. **Run Tests**:
   ```bash
   # Start development server
   npm run dev

   # Open test-urls.txt
   # Test each URL manually
   ```

### Automated Testing Setup

1. **Install Test Framework** (Playwright recommended):
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Create Test Setup** (`tests/setup.ts`):
   ```typescript
   import { test as base } from '@playwright/test';
   import mockListings from '../test-data/mock-listings.json';
   import mockAdmin from '../test-data/mock-admin.json';

   export const test = base.extend<{
     mockListings: typeof mockListings;
     mockAdmin: typeof mockAdmin;
   }>({
     mockListings: async ({}, use) => {
       // Import mock listings to Firebase
       await importMockListings(mockListings);
       await use(mockListings);
     },
     mockAdmin: async ({}, use) => {
       await use(mockAdmin);
     },
   });
   ```

3. **Write First Test** (`tests/homepage.spec.ts`):
   ```typescript
   import { test } from './setup';

   test('homepage displays listings', async ({ page, mockListings }) => {
     await page.goto('/');
     await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(mockListings.listings.length);
   });
   ```

4. **Run Tests**:
   ```bash
   npx playwright test
   ```

## 📋 Testing Checklist

### Before Each Test Session:
- [ ] Clear browser cache and cookies
- [ ] Reset Firebase Emulator data
- [ ] Start development server
- [ ] Verify Firebase Emulator is running
- [ ] Verify admin user exists

### After Each Test Session:
- [ ] Clean up test data (optional)
- [ ] Review test results
- [ ] Document any issues found
- [ ] Update test data if schema changes

## 🔧 Configuration

### Firebase Emulator Setup

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Emulator**:
   ```bash
   firebase init emulators
   # Select: Firestore, Storage, Auth
   # Use default ports
   ```

3. **Start Emulator**:
   ```bash
   firebase emulators:start
   ```

4. **Import Test Data**:
   ```bash
   # Use Firebase REST API or Firestore SDK
   # See: https://firebase.google.com/docs/emulator-suite/connect_firestore
   ```

### Environment Variables

Create `.env.test`:
```bash
# Firebase
FIREBASE_API_KEY=your-test-api-key
FIREBASE_AUTH_DOMAIN=your-test-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-test-project
FIREBASE_STORAGE_BUCKET=your-test-project.appspot.com

# Use Emulator
FIREBASE_EMULATOR_HOST=localhost:8080

# Google Maps (if needed)
VITE_GOOGLE_MAPS_API_KEY=your-test-maps-api-key
```

## 📊 Test Data Coverage

### Categories:
- ✅ Commercial (2 listings)
- ✅ Industrial (2 listings)
- ✅ Land (1 listing)
- ✅ Office (1 listing)

### Types:
- ✅ SALE (5 listings)
- ✅ RENT (2 listings)

### Status:
- ✅ Active (6 listings)
- ✅ Sold (1 listing)

### Multimedia:
- ✅ Images (all listings)
- ✅ Video (2 listings)
- ✅ Audio (1 listing)
- ✅ 360° Panorama (1 listing)

### Features:
- ✅ Featured listings
- ✅ External links (PropertyGuru, iProperty)
- ✅ Coordinates for maps
- ✅ Complete specifications
- ✅ Description text

## 🔄 Updating Test Data

### When Schema Changes:

1. **Update Types**: Edit `/types.ts` first
2. **Update Mock Data**: Edit `mock-listings.json`
3. **Update Tests**: Update test expectations
4. **Validate**: Run `npm run build` to check types

### When Adding Features:

1. **Add to Mock Data**: Add new listings or fields
2. **Add Test URLs**: Update `test-urls.txt`
3. **Add Test Cases**: Create new test specs
4. **Document**: Update this README

## 🚫 Security Notes

### DO NOT:
- ❌ Commit real credentials to `mock-admin.json`
- ❌ Use production data in tests
- ❌ Share test admin credentials publicly
- ❌ Use test accounts in production

### DO:
- ✅ Use Firebase Emulator for testing
- ✅ Create dedicated test accounts
- ✅ Rotate test passwords regularly
- ✅ Keep `.env.test` private (in `.gitignore`)

## 📚 Resources

### Documentation:
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Playwright Testing](https://playwright.dev/)
- [Cypress Testing](https://www.cypress.io/)

### Tools:
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Studio](https://addons.mozilla.org/en-US/firefox/addon/firestore-studio/)
- [Postman](https://www.postman.com/) (for API testing)

## 📝 Changelog

### v1.0 (2025-02-14)
- Initial test data setup
- 7 mock listings covering all categories
- Mock admin credentials
- Test URLs list
- This README

---

**Maintained By**: Testing Agent
**Last Updated**: 2025-02-14
**Status**: ✅ Ready for use
