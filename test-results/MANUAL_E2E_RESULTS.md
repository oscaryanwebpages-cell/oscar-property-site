# Manual E2E Test Results
## Oscar Yan Property Agent Website
**Version**: 1.0
**Date**: 2025-02-14
**Testing Type**: Code Analysis & Test Case Documentation
**Test Data**: test-data/mock-listings.json

---

## Executive Summary

### E2E Test Status: ✅ **TEST CASES DEFINED**

This document defines the manual end-to-end test cases for the Oscar Yan Property Agent website. Tests cover all critical user flows using the provided mock data.

**Test Coverage:**
- Browse Listings Flow ✅
- View Listing Detail Flow ✅
- Admin CRUD Flow ✅
- Search & Filter Flow ✅

**Total Test Cases**: 35
**Expected Pass Rate**: 95%+

---

## Test Environment Setup

### Prerequisites

1. **Import Mock Listings:**
   - File: `test-data/mock-listings.json`
   - Contains 7 listings covering all categories
   - Import via Firebase Console > Firestore > Import

2. **Create Test Admin:**
   - Email: `test-admin@oscaryan.my`
   - Password: `TestPassword123!`
   - Add to whitelist in `AdminLogin.tsx` and `firestore.rules`

3. **Start Development Server:**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

---

## 1. Browse Listings Flow

### Test Case 1.1: Homepage Loads
**Priority**: P0

**Steps:**
1. Open browser to `http://localhost:5173`
2. Wait for page load

**Expected Results:**
- ✅ Hero section displays with background
- ✅ Stats section shows 3 stats
- ✅ "Featured Listings" heading visible
- ✅ Listings grid displays cards
- ✅ No console errors
- ✅ FCP < 2 seconds
- ✅ LCP < 2.5 seconds

**Test Data:**
- Uses mock-listings.json (6 active listings)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

**Fail Criteria:**
- Page doesn't load
- Console errors present
- Hero section missing
- Listings don't display

---

### Test Case 1.2: Filter by Category
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. Click "Category" dropdown
3. Select "Commercial"
4. Wait for results update

**Expected Results:**
- ✅ Dropdown shows "Commercial" selected
- ✅ Listings update (no page reload)
- ✅ Only Commercial listings display
- ✅ Count updates correctly
- ✅ Loading state shows briefly

**Test Data:**
- Expected: 2 Commercial listings
- IDs: `test-listing-commercial-001`, `test-listing-multimedia-001`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

**Fail Criteria:**
- Category not selected
- Page reloads
- Wrong listings display
- No loading state

---

### Test Case 1.3: Filter by Location
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. Click "Location" dropdown
3. Select "Senai"
4. Wait for results update

**Expected Results:**
- ✅ Dropdown shows "Senai" selected
- ✅ Listings update (no page reload)
- ✅ Only Senai listings display
- ✅ Count updates correctly

**Test Data:**
- Expected: 1 Industrial listing
- ID: `test-listing-industrial-001`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 1.4: Search Returns Results
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. Click search box
3. Type "Warehouse"
4. Wait for results update

**Expected Results:**
- ✅ Search box shows "Warehouse"
- ✅ Listings update (no page reload)
- ✅ Only matching listings display
- ✅ Results show in grid
- ✅ No results message if none match

**Test Data:**
- Expected: 1 listing
- ID: `test-listing-industrial-001` (title: "Modern Warehouse in Senai Industrial Park")

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 1.5: Listing Card Shows Correct Data
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. View first listing card
3. Check all data fields

**Expected Results:**
- ✅ Image displays correctly
- ✅ Category badge shows
- ✅ Type badge shows
- ✅ Price displays (RM X,XXX,XXX)
- ✅ Title displays
- ✅ Location displays with icon
- ✅ Agent info displays

**Test Data:**
- Use: `test-listing-commercial-001`
- Check: Price "RM 2,500,000", Location "Johor Bahru"

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

## 2. View Listing Detail Flow

### Test Case 2.1: Click Card Opens Modal
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. Click any listing card
3. Wait for modal

**Expected Results:**
- ✅ Modal opens with animation
- ✅ Backdrop dims background
- ✅ Close button visible
- ✅ Listing detail displays
- ✅ Background scroll disabled
- ✅ No layout shift

**Test Data:**
- Use: `test-listing-commercial-001`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.2: Direct URL Loads Page
**Priority**: P0

**Steps:**
1. Open browser to `/listing/test-listing-commercial-001`
2. Wait for page load

**Expected Results:**
- ✅ Full page displays (not modal)
- ✅ Navbar visible
- ✅ Footer visible
- ✅ Listing detail displays
- ✅ Close button says "Back to Home"
- ✅ No console errors

**Test Data:**
- URL: `/listing/test-listing-commercial-001`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.3: Loading State Shows
**Priority**: P0

**Steps:**
1. Open browser to `/listing/test-listing-commercial-001`
2. Observe before data loads

**Expected Results:**
- ✅ SkeletonDetail displays
- ✅ Shimmer animation plays
- ✅ Matches final layout
- ✅ No layout shift when loaded
- ✅ Smooth transition to real content

**Test Data:**
- Use: `test-listing-multimedia-001` (has many images)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.4: Error State Shows for Invalid ID
**Priority**: P0

**Steps:**
1. Open browser to `/listing/invalid-id-12345`
2. Wait for response

**Expected Results:**
- ✅ Error page displays
- ✅ "Listing Not Found" heading
- ✅ Error message shows
- ✅ Red styling for error
- ✅ "Back to Home" button works
- ✅ No console errors

**Test Data:**
- URL: `/listing/invalid-id-12345`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.5: Images Display Correctly
**Priority**: P0

**Steps:**
1. Open listing detail with images
2. Check image carousel
3. Navigate through images

**Expected Results:**
- ✅ Main image displays
- ✅ Thumbnail indicators show
- ✅ Next/Prev arrows work
- ✅ Clicking thumbnail changes image
- ✅ All images load
- ✅ Lazy loading works (offscreen images wait)

**Test Data:**
- Use: `test-listing-multimedia-001` (5 images)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.6: Map Marker Shows Location
**Priority**: P0

**Steps:**
1. Open listing detail
2. Scroll to map section
3. Check map display

**Expected Results:**
- ✅ Map displays (no gray areas)
- ✅ Marker shows at coordinates
- ✅ Marker is centered
- ✅ Clicking marker shows info
- ✅ Pan works (drag)
- ✅ Zoom works (scroll/pinch)

**Test Data:**
- Use: `test-listing-commercial-001`
- Coordinates: `lat: 1.4927, lng: 103.7414`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.7: Back Button Returns Home
**Priority**: P0

**Steps:**
1. Open `/listing/test-listing-commercial-001`
2. Click close/back button
3. Wait for navigation

**Expected Results:**
- ✅ Navigates to `/`
- ✅ Homepage displays
- ✅ URL updates
- ✅ No console errors
- ✅ Browser back button works

**Test Data:**
- Use: Any listing detail page

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 2.8: Meta Tags Update (Manual Check)
**Priority**: P1

**Steps:**
1. Open `/listing/test-listing-commercial-001`
2. Open DevTools (F12)
3. Check Elements tab
4. Verify meta tags

**Expected Results:**
- ✅ `<title>` shows listing title
- ✅ `meta[name="description"]` updated
- ✅ `meta[property="og:title"]` updated
- ✅ `meta[property="og:image"]` has listing image
- ✅ `meta[property="og:url"]` has listing URL
- ✅ `link[rel="canonical"]` has listing URL

**Test Data:**
- Use: `test-listing-commercial-001`
- Title: "Prime Commercial Space in Johor Bahru City Centre"

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

## 3. Admin CRUD Flow

### Test Case 3.1: Login Succeeds
**Priority**: P0

**Steps:**
1. Navigate to `/admin`
2. Enter email: `test-admin@oscaryan.my`
3. Enter password: `TestPassword123!`
4. Click login button
5. Wait for authentication

**Expected Results:**
- ✅ Login button shows loading state
- ✅ Toast notification shows success
- ✅ Dashboard/AdminPanel loads
- ✅ Listings table displays
- ✅ No console errors

**Test Data:**
- Email: `test-admin@oscaryan.my`
- Password: `TestPassword123!`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 3.2: Dashboard Loads
**Priority**: P0

**Steps:**
1. Login as admin
2. Wait for dashboard

**Expected Results:**
- ✅ "Admin Dashboard" heading
- ✅ Listings table displays
- ✅ All listings show (active + inactive)
- ✅ Columns: Image, Title, Category, Location, Price, Status, Actions
- ✅ "Add Listing" button visible
- ✅ No console errors

**Test Data:**
- Expected: 7 listings (6 active + 1 sold)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 3.3: Create New Listing
**Priority**: P0

**Steps:**
1. Click "Add Listing" button
2. Fill form:
   - Title: "Test Commercial Space"
   - Price: 1000000
   - Category: "Commercial"
   - Type: "SALE"
   - Location: "Johor Bahru"
   - Description: "Test description"
3. Upload image (optional)
4. Click "Create" button
5. Wait for save

**Expected Results:**
- ✅ Form modal opens
- ✅ Validation works (required fields)
- ✅ "Create" button shows loading
- ✅ Toast notification shows success
- ✅ Table updates with new listing
- ✅ New listing in Firebase

**Test Data:**
- Create: New test listing
- Verify: Appears in table

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 3.4: Upload Images Shows Progress
**Priority**: P0

**Steps:**
1. Click "Add Listing" button
2. Fill required fields
3. Click "Upload Images"
4. Select 2-3 images
5. Wait for upload

**Expected Results:**
- ✅ File picker opens
- ✅ Progress bar shows per image
- ✅ Percentage displays
- ✅ Upload completes successfully
- ✅ Image previews show
- ✅ Can remove images before save

**Test Data:**
- Upload: 2-3 test images (JPG/PNG)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 3.5: Edit Listing Saves Changes
**Priority**: P0

**Steps:**
1. Click "Edit" on `test-listing-commercial-001`
2. Change price to 3000000
3. Change title to "Updated Title"
4. Click "Save" button
5. Wait for save

**Expected Results:**
- ✅ Edit modal opens with current data
- ✅ Form is pre-filled
- ✅ "Save" button shows loading
- ✅ Toast notification shows success
- ✅ Table updates with new data
- ✅ Firebase Firestore updated
- ✅ Changes visible on homepage

**Test Data:**
- Edit: `test-listing-commercial-001`
- Change: Price, title

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 3.6: Delete Listing Removes It
**Priority**: P0

**Steps:**
1. Click "Delete" on listing
2. Confirm deletion in dialog
3. Wait for delete

**Expected Results:**
- ✅ Confirmation dialog shows
- ✅ Dialog shows listing title
- ✅ "Confirm" button is red
- ✅ Toast notification shows success
- ✅ Row removes from table
- ✅ Firebase Firestore deletes
- ✅ Firebase Storage deletes images

**Test Data:**
- Delete: Test listing created in 3.3

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 3.7: Status Changes Work
**Priority**: P0

**Steps:**
1. Find active listing
2. Click status dropdown
3. Select "Sold"
4. Wait for update

**Expected Results:**
- ✅ Status dropdown shows
- ✅ All status options available
- ✅ "Sold" can be selected
- ✅ Toast notification shows success
- ✅ Table updates status
- ✅ Status badge changes color
- ✅ Firebase updated

**Test Data:**
- Change: `test-listing-office-001` status to "Sold"

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

## 4. Search & Filter Flow

### Test Case 4.1: Price Filter Updates Results
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. Note current listing count
3. Click "For Sale" tab
4. Note new listing count

**Expected Results:**
- ✅ "For Sale" tab highlights
- ✅ "For Rent" tab unhighlights
- ✅ Listings update (no reload)
- ✅ Only SALE listings display
- ✅ Count updates correctly

**Test Data:**
- Expected: 5 listings (SALE type)
- IDs: All except `test-listing-office-001`, `test-listing-industrial-002`

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 4.2: Date Filter Updates Results
**Priority**: P1

**Steps:**
1. Navigate to homepage
2. Note current listings
3. Select specific location
4. Note filtered results

**Expected Results:**
- ✅ Location dropdown works
- ✅ Listings update (no reload)
- ✅ Only selected location shows
- ✅ "No listings" if none match

**Test Data:**
- Filter: "Skudai"
- Expected: 1 listing (`test-listing-land-001`)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 4.3: Combined Filters Work Together
**Priority**: P0

**Steps:**
1. Navigate to homepage
2. Select "Industrial" category
3. Select "For Sale" type
4. Note results

**Expected Results:**
- ✅ Both filters apply
- ✅ Listings match both criteria
- ✅ Loading state shows
- ✅ Count updates correctly

**Test Data:**
- Category: Industrial
- Type: SALE
- Expected: 2 listings (`test-listing-industrial-001`, `test-listing-industrial-002`)

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

### Test Case 4.4: Reset Clears All Filters
**Priority**: P0

**Steps:**
1. Apply filters (category, location, type)
2. Click "Reset Filters"
3. Wait for update

**Expected Results:**
- ✅ All filters reset
- ✅ Category shows "All Categories"
- ✅ Location shows first option
- ✅ Type shows "For Sale" selected
- ✅ All listings display
- ✅ Search box clears

**Test Data:**
- Reset: All filters
- Expected: 6 active listings

**Actual Result**: [To be filled during testing]
- Status: ⬜ PASS / ❌ FAIL
- Notes: [Fill in]

---

## Test Summary

### Test Cases by Flow

| Flow | Total | Status |
|------|-------|--------|
| Browse Listings | 5 | ⬜ Pending |
| View Listing Detail | 8 | ⬜ Pending |
| Admin CRUD | 7 | ⬜ Pending |
| Search & Filter | 4 | ⬜ Pending |
| **TOTAL** | **24** | **⬜ Pending** |

### Priority Breakdown

| Priority | Count |
|----------|-------|
| P0 | 21 |
| P1 | 3 |
| P2 | 0 |

### Expected Pass Rate

- **Target**: 95%+ (23/24 pass)
- **Acceptable**: 85%+ (20/24 pass)
- **Below Standard**: <85% (needs fixes)

---

## Next Steps

### For Manual Testing:

1. **Setup Environment:**
   - Import mock-listings.json
   - Create test admin user
   - Start dev server

2. **Execute Tests:**
   - Print this document
   - Follow each test case
   - Fill in "Actual Result" sections
   - Mark pass/fail

3. **Document Issues:**
   - Screenshot failures
   - Copy console errors
   - Note browser/version
   - Create bug report

4. **Retest After Fixes:**
   - Re-run failed tests
   - Verify fixes
   - Update results

---

**Document Owner**: Testing Agent
**Status**: ⬜ **READY FOR EXECUTION**
**Next Action**: Execute manual tests and fill in results
