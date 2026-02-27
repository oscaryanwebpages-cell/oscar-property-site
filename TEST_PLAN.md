# E2E Test Plan
## Oscar Yan Property Agent Website
**Version**: 1.0
**Last Updated**: 2025-02-14
**Test Framework**: Playwright (Recommended) or Cypress

---

## Table of Contents
1. [Critical User Flows](#critical-user-flows)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Cases](#test-cases)
4. [Test Data Management](#test-data-management)
5. [Success Criteria](#success-criteria)

---

## Critical User Flows

### Flow 1: User Browses Listings
**Priority**: P0 (Critical)
**User Story**: As a potential buyer/renter, I want to browse available property listings so I can find properties that match my needs.

#### Preconditions:
- Website is loaded and accessible
- Listings exist in the database

#### Test Steps:
1. Navigate to homepage (`/`)
2. Wait for ListingsGrid component to load
3. Verify listings are displayed in a grid layout
4. **Filter by Category**:
   - Click "Commercial" filter
   - Verify only Commercial listings are shown
   - Click "Industrial" filter
   - Verify only Industrial listings are shown
   - Click "All" to reset
5. **Filter by Location**:
   - Type location in search box (e.g., "Johor Bahru")
   - Verify listings filter by location
6. **Search by Keyword**:
   - Type keyword in search box (e.g., "warehouse")
   - Verify results match keyword in title or description
7. **Click Listing to View Details**:
   - Click on any listing card
   - Verify modal opens with listing details

#### Expected Results:
- All filters work correctly
- Search results update in real-time
- Listing cards display correctly (image, title, price, location)
- Modal opens smoothly with animations

#### Test Cases:
| ID | Scenario | Happy Path | Error Path | Edge Case |
|----|----------|------------|------------|-----------|
| TC-1.1 | Category Filter | ✅ Filter works | ⚠️ No listings in category | ✅ All categories selected |
| TC-1.2 | Location Filter | ✅ Filter works | ⚠️ Invalid location | ⚠️ Special characters |
| TC-1.3 | Keyword Search | ✅ Results found | ⚠️ No results found | ⚠️ Empty search |
| TC-1.4 | Click Listing | ✅ Modal opens | ⚠️ Listing deleted | ⚠️ Rapid clicking |

---

### Flow 2: User Views Listing Detail
**Priority**: P0 (Critical)
**User Story**: As a potential buyer/renter, I want to view detailed information about a property so I can make an informed decision.

#### Preconditions:
- User is on homepage or direct URL
- Listing exists in database

#### Test Steps (Modal View):
1. Click listing card from homepage
2. Verify modal opens with correct listing
3. **Verify Content**:
   - Title matches clicked listing
   - Price is displayed correctly
   - Location is shown
   - Category and type badges visible
   - Description text renders
4. **Verify Images**:
   - Image carousel loads first image
   - All images in carousel are accessible
   - Navigation arrows work
   - Thumbnail indicators work
5. **Verify Map**:
   - Google Map loads (if API key present)
   - Marker shows at correct coordinates
   - Map is interactive (pan/zoom)
6. **Verify Multimedia** (if present):
   - Video player loads
   - Video plays without errors
   - Audio player loads
   - Audio plays without errors
   - 360° panorama viewer loads
   - Panorama is interactive
7. Close modal via X button

#### Test Steps (Direct URL):
1. Navigate to `/listing/:id` directly
2. Verify full page loads (not modal)
3. Verify all content from Modal View
4. Verify back button returns to homepage
5. Verify browser back button works

#### Expected Results:
- All listing data displays correctly
- Images load without errors
- Map displays at correct location
- Video/audio plays smoothly
- Direct URL sharing works
- Navigation works correctly

#### Test Cases:
| ID | Scenario | Happy Path | Error Path | Edge Case |
|----|----------|------------|------------|-----------|
| TC-2.1 | Modal View | ✅ All content loads | ⚠️ Images fail to load | ⚠️ No images |
| TC-2.2 | Direct URL | ✅ Page loads | ⚠️ Listing not found (404) | ⚠️ Invalid ID format |
| TC-2.3 | Image Carousel | ✅ All images load | ⚠️ Broken image link | ⚠️ Single image |
| TC-2.4 | Map Display | ✅ Map loads | ⚠️ API key missing | ⚠️ No coordinates |
| TC-2.5 | Video Playback | ✅ Video plays | ⚠️ Video fails to load | ⚠️ Unsupported format |
| TC-2.6 | Audio Playback | ✅ Audio plays | ⚠️ Audio fails to load | ⚠️ Autoplay blocked |
| TC-2.7 | 360° Panorama | ✅ Viewer loads | ⚠️ Panorama fails | ⚠️ Mobile rotation |

---

### Flow 3: Admin Manages Listings
**Priority**: P0 (Critical)
**User Story**: As an admin, I want to manage property listings so I can keep the website up-to-date.

#### Preconditions:
- Admin is logged in with valid credentials
- Admin email is whitelisted

#### Test Steps (Login):
1. Navigate to `/admin`
2. Verify login page is displayed
3. Enter valid admin email
4. Enter valid password
5. Click "Login" button
6. Verify redirect to AdminPanel
7. Verify user is authenticated

#### Test Steps (Create Listing):
1. Click "Add New Listing" button
2. Verify form modal opens
3. Fill in required fields:
   - Title: "Test Warehouse"
   - Price: 500000
   - Location: "Johor Bahru"
   - Category: "Industrial"
   - Type: "SALE"
   - Tenure: "Freehold"
   - Land Size: "10000 sq ft"
4. Upload at least one image
5. Click "Create Listing"
6. Verify success message
7. Verify listing appears in table

#### Test Steps (Edit Listing):
1. Locate existing listing in table
2. Click "Edit" button
3. Verify form populates with existing data
4. Modify title: "Updated Title"
5. Click "Save Changes"
6. Verify success message
7. Verify listing updated in table

#### Test Steps (Change Status):
1. Locate active listing in table
2. Click "Deactivate" button
3. Verify confirmation dialog
4. Confirm deactivation
5. Verify status badge changes to "inactive"
6. Verify listing no longer appears on homepage
7. Click "Activate" button
8. Verify status badge changes to "active"
9. Verify listing appears on homepage

#### Test Steps (Mark Sold):
1. Locate active listing in table
2. Click "Mark Sold" button
3. Verify confirmation dialog
4. Confirm marking as sold
5. Verify status badge changes to "sold"
6. Verify sold badge visible on homepage

#### Test Steps (Delete Listing):
1. Locate listing in table
2. Click "Delete" button
3. Verify confirmation dialog
4. Confirm deletion
5. Verify listing removed from table
6. Verify listing removed from homepage
7. Verify images deleted from Firebase Storage

#### Expected Results:
- Login works with valid credentials
- Only whitelisted emails can access admin
- Create listing works with validation
- Edit listing updates data correctly
- Status changes work and reflect on homepage
- Delete removes listing and associated files

#### Test Cases:
| ID | Scenario | Happy Path | Error Path | Edge Case |
|----|----------|------------|------------|-----------|
| TC-3.1 | Admin Login | ✅ Login successful | ⚠️ Invalid password | ⚠️ Non-whitelisted email |
| TC-3.2 | Create Listing | ✅ Listing created | ⚠️ Validation errors | ⚠️ Upload fails |
| TC-3.3 | Edit Listing | ✅ Listing updated | ⚠️ Concurrent edit | ⚠️ No changes made |
| TC-3.4 | Change Status | ✅ Status updated | ⚠️ Network error | ⚠️ Already in status |
| TC-3.5 | Delete Listing | ✅ Listing deleted | ⚠️ Delete fails | ⚠️ Delete with uploads |

---

### Flow 4: Admin AI Extraction
**Priority**: P1 (High)
**User Story**: As an admin, I want to use AI to extract listing data from images/text so I can create listings faster.

#### Preconditions:
- Admin is logged in
- AI extraction service is available
- Listing form is open

#### Test Steps (Image Extraction):
1. Open "Add New Listing" form
2. Click "Extract from Image" button
3. Upload property fact sheet image
4. Verify "Extracting..." loading state
5. Wait for AI processing
6. Verify form fields populate with extracted data:
   - Title
   - Price
   - Location
   - Land Size
   - Tenure
   - Specifications (district, mukim, etc.)
7. Verify extracted data is editable
8. Make corrections if needed
9. Save listing

#### Test Steps (Text Extraction):
1. Open "Add New Listing" form
2. Click "Extract from Text" button
3. Paste property description text
4. Click "Extract" button
5. Verify "Extracting..." loading state
6. Wait for AI processing
7. Verify form fields populate with extracted data
8. Verify extracted data is editable
9. Make corrections if needed
10. Save listing

#### Expected Results:
- AI extraction processes images correctly
- AI extraction processes text correctly
- Extracted data populates form fields
- Data is editable after extraction
- Extraction failures show clear error messages

#### Test Cases:
| ID | Scenario | Happy Path | Error Path | Edge Case |
|----|----------|------------|------------|-----------|
| TC-4.1 | Image Extraction | ✅ Data extracted | ⚠️ Extraction fails | ⚠️ Low quality image |
| TC-4.2 | Text Extraction | ✅ Data extracted | ⚠️ Extraction fails | ⚠️ Empty text |
| TC-4.3 | Extracted Data | ✅ Fields populate | ⚠️ Invalid data | ⚠️ Partial extraction |

---

## Test Environment Setup

### Recommended Tools:
1. **Playwright** (Recommended):
   - Cross-browser support (Chrome, Firefox, Safari, Edge)
   - Fast execution
   - Good TypeScript support
   - Built-in assertions

2. **Cypress** (Alternative):
   - Easy to set up
   - Great debugging
   - Time-travel debugging
   - Strong community

### Installation (Playwright):
```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration:
Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Test Cases

### Structure:
```
e2e/
├── fixtures/
│   ├── listings.ts          # Mock listing data
│   ├── admin.ts             # Admin credentials
│   └── test-urls.ts        # Base URLs
├── pages/
│   ├── home.page.ts        # Home page object model
│   ├── listing-detail.page.ts
│   └── admin.page.ts       # Admin page object model
├── specs/
│   ├── user-browses.spec.ts
│   ├── user-views-detail.spec.ts
│   ├── admin-manages.spec.ts
│   └── admin-ai-extract.spec.ts
└── tests/
    └── setup.ts            # Test setup/teardown
```

### Example Test Spec (User Browses):
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Browses Listings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display listings on homepage', async ({ page }) => {
    await expect(page.locator('[data-testid="listings-grid"]')).toBeVisible();
    const listings = page.locator('[data-testid="listing-card"]');
    await expect(listings).toHaveCount(await listings.count(), { min: 1 });
  });

  test('should filter by category', async ({ page }) => {
    await page.click('button:has-text("Commercial")');
    await expect(page).toHaveURL(/.*category=Commercial/);
    const listings = page.locator('[data-testid="listing-card"]');
    const count = await listings.count();
    for (let i = 0; i < count; i++) {
      await expect(listings.nth(i)).toContainText('Commercial');
    }
  });

  test('should search by keyword', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'warehouse');
    await page.press('[data-testid="search-input"]', 'Enter');
    const listings = page.locator('[data-testid="listing-card"]');
    const count = await listings.count();
    for (let i = 0; i < count; i++) {
      await expect(listings.nth(i)).toContainText(/warehouse/i);
    }
  });

  test('should open listing detail modal', async ({ page }) => {
    const firstListing = page.locator('[data-testid="listing-card"]').first();
    await firstListing.click();
    await expect(page.locator('[data-testid="listing-detail-modal"]')).toBeVisible();
  });
});
```

---

## Test Data Management

### Mock Listings:
Create diverse test data covering:
- All property categories (Commercial, Industrial, Land, Office)
- Both listing types (SALE, RENT)
- All tenure types (Freehold, Leasehold)
- Various price ranges
- Different locations
- With and without multimedia (images, video, audio, panorama)

### Admin Credentials:
Use test-specific admin account:
- Email: `test-admin@oscaryan.my`
- Password: `TestPassword123!`

### URL Management:
Define base URLs for environments:
- Local: `http://localhost:5173`
- Staging: `https://staging.oscaryan.my`
- Production: `https://oscaryan.my`

---

## Success Criteria

### Coverage Targets:
- **Critical Flows**: 100% (P0)
- **Happy Paths**: 100%
- **Error Paths**: 80%
- **Edge Cases**: 60%

### Automated vs. Manual:
- **Automated**: 70% of tests
- **Manual**: 30% (visual testing, UX flows)

### Execution Goals:
- **Run Time**: < 10 minutes for full suite
- **Reliability**: < 5% flaky test rate
- **Maintenance**: < 2 hours per week for updates

---

## Next Steps

1. **Setup Playwright**: Install and configure
2. **Add Test IDs**: Add `data-testid` attributes to components
3. **Create Page Models**: Build page object model classes
4. **Write First Spec**: Start with user browses listings
5. **CI Integration**: Add to GitHub Actions
6. **Visual Regression**: Add screenshots for critical pages

---

## Maintenance

### Weekly:
- Review failed tests
- Update test data if schema changes
- Fix flaky tests

### Monthly:
- Review test coverage
- Add new test cases for features
- Remove obsolete tests

### Per Release:
- Full regression test run
- Update test data
- Document new features

---

**Document Owner**: Testing Agent
**Last Review**: 2025-02-14
**Next Review**: 2025-03-14
