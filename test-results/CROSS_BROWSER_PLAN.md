# Cross-Browser Testing Plan
## Oscar Yan Property Agent Website
**Version**: 1.0
**Date**: 2025-02-14
**Testing Type**: Test Plan Documentation
**Status**: ✅ **READY FOR EXECUTION**

---

## Executive Summary

This document outlines the comprehensive cross-browser testing plan for the Oscar Yan Property Agent website. Testing ensures consistent functionality and appearance across different browsers, devices, and platforms.

**Testing Scope:**
- Desktop browsers (Chrome, Safari, Firefox, Edge)
- Mobile browsers (Chrome, Safari)
- Tablet devices
- Different viewports and orientations

**Priority Levels:**
- **P0**: Critical - Must test before release
- **P1**: High - Test within 1 week
- **P2**: Medium - Test within 2 weeks

---

## 1. Desktop Browser Test Matrix

| Browser | Version | Platform | Priority | Features to Test | Auto/Manual |
|---------|----------|----------|-----------|------------------|-------------|
| **Chrome** | Latest | Desktop/Mobile | **P0** | All features | Both |
| **Safari** | Latest | iOS/MacOS | **P0** | All, autoplay issues, 100vh | Manual |
| **Firefox** | Latest | Desktop | **P1** | All features | Both |
| **Edge** | Latest | Desktop | **P2** | Core features | Manual |

### 1.1 Chrome (Latest) - P0

**Platforms:**
- Windows 10/11
- macOS 12+
- Linux (Ubuntu 20.04+)

**Features to Test:**
- ✅ All core functionality
- ✅ Image carousel (swipe, buttons)
- ✅ Video playback (autoplay, controls)
- ✅ Map interaction (pan, zoom, markers)
- ✅ Form inputs and validation
- ✅ Filter functionality
- ✅ Search functionality
- ✅ Toast notifications
- ✅ Admin panel CRUD
- ✅ Lazy loading images
- ✅ Skeleton loading states

**Known Issues:** None

**Testing Tools:**
- Chrome DevTools (F12)
- Lighthouse (built-in)
- React DevTools

---

### 1.2 Safari (Latest) - P0

**Platforms:**
- macOS 12+ (Monterey, Ventura, Sonoma)
- iOS 15+ (iPhone, iPad)

**Features to Test:**
- ✅ All core functionality
- ⚠️ Video autoplay (may not work without user interaction)
- ⚠️ 100vh issues (address bar affects height)
- ✅ Image carousel
- ✅ Map interaction
- ✅ Form inputs
- ✅ Filters and search
- ✅ Toast notifications
- ✅ Admin panel
- ✅ Lazy loading

**Known Issues:**
1. **100vh Problem**: Safari's address bar affects viewport height
   - **Fix**: Use `height: 100dvh` (dynamic viewport height)
   - **Impact**: Full-screen sections, modals
   - **Status**: Needs verification

2. **Autoplay Policy**: Safari may block autoplay videos
   - **Fix**: Add `playsinline`, `muted`, `autoplay` attributes
   - **Impact**: Video backgrounds, hero section
   - **Status**: Needs verification

**Testing Tools:**
- Safari Web Inspector (Develop > Show Web Inspector)
- iOS Simulator (Xcode)
- Responsive Design Mode (Develop > Enter Responsive Design Mode)

---

### 1.3 Firefox (Latest) - P1

**Platforms:**
- Windows 10/11
- macOS 12+
- Linux (Ubuntu 20.04+)

**Features to Test:**
- ✅ All core functionality
- ✅ Image carousel
- ✅ Video playback
- ✅ Map interaction
- ✅ Form inputs
- ✅ Filters and search
- ✅ Toast notifications
- ✅ Admin panel

**Known Issues:** None expected

**Testing Tools:**
- Firefox Developer Tools (F12)
- React DevTools (Firefox add-on)

---

### 1.4 Edge (Latest) - P2

**Platforms:**
- Windows 10/11

**Features to Test:**
- ✅ Core features only
- ✅ Homepage display
- ✅ Listing grid
- ✅ Filter functionality
- ✅ Listing detail modal
- ✅ Basic admin functionality

**Known Issues:** None expected

**Testing Tools:**
- Edge DevTools (F12)
- Based on Chromium, similar to Chrome

---

## 2. Mobile Test Matrix

### 2.1 iOS Devices (Safari) - P0

| Device | Browser | Viewport | Orientation | Priority |
|--------|---------|----------|-------------|----------|
| **iPhone 12/13/14** | Safari | 390x844 | Portrait | P0 |
| **iPhone 12/13/14** | Safari | 844x390 | Landscape | P1 |
| **iPhone 12/13 Pro Max** | Safari | 428x926 | Portrait | P1 |
| **iPad Air/Pro** | Safari | 820x1180 | Portrait | P0 |
| **iPad Air/Pro** | Safari | 1180x820 | Landscape | P1 |

**iOS-Specific Tests:**
- ✅ Touch interactions (tap, swipe, pinch)
- ⚠️ 100vh issues (use 100dvh)
- ⚠️ Video autoplay
- ✅ Image carousel swipe gestures
- ✅ Map interaction (pan, zoom)
- ✅ Form inputs with mobile keyboard
- ✅ Toast notification positioning
- ✅ Modal display (no overflow)
- ✅ Navigation menu (hamburger)

**Testing Tools:**
- Xcode iOS Simulator
- Physical iOS devices
- Safari Web Inspector (connect to device)

---

### 2.2 Android Devices (Chrome) - P0

| Device | Browser | Viewport | Orientation | Priority |
|--------|---------|----------|-------------|----------|
| **Pixel 6/7** | Chrome | 412x915 | Portrait | P0 |
| **Pixel 6/7** | Chrome | 915x412 | Landscape | P1 |
| **Samsung Galaxy S22** | Chrome | 360x800 | Portrait | P0 |
| **Samsung Galaxy S22** | Chrome | 800x360 | Landscape | P1 |
| **Various Android** | Chrome | 360x800+ | Portrait | P1 |

**Android-Specific Tests:**
- ✅ Touch interactions (tap, swipe, pinch)
- ✅ Image carousel swipe gestures
- ✅ Video playback
- ✅ Map interaction (pan, zoom)
- ✅ Form inputs with mobile keyboard
- ✅ Toast notification positioning
- ✅ Modal display (no overflow)
- ✅ Navigation menu (hamburger)
- ✅ Back button behavior

**Testing Tools:**
- Android Studio Emulator
- Physical Android devices
- Chrome DevTools (Remote Devices)

---

### 2.3 Tablet Devices - P1

| Device | Browser | Viewport | Orientation | Priority |
|--------|---------|----------|-------------|----------|
| **iPad Air/Pro** | Safari | 820x1180 | Portrait | P0 |
| **iPad Air/Pro** | Safari | 1180x820 | Landscape | P1 |
| **Android Tablet** | Chrome | 800x1280 | Portrait | P1 |
| **Android Tablet** | Chrome | 1280x800 | Landscape | P2 |

**Tablet-Specific Tests:**
- ✅ Touch and mouse interactions
- ✅ Layout breakpoints (iPad vs desktop)
- ✅ Grid layout adjustments
- ✅ Navigation behavior
- ✅ Modal sizing
- ✅ Map interaction

---

## 3. Test Scenarios

### 3.1 Homepage - P0

**Steps:**
1. Navigate to homepage
2. Verify hero section displays
3. Verify stats section displays
4. Verify listings grid displays
5. Scroll to testimonials
6. Scroll to contact section
7. Verify footer displays

**Expected Results:**
- All sections visible
- No horizontal scrolling
- Smooth scrolling
- Images load correctly
- No console errors

**Browser Issues to Check:**
- 100vh causing scroll issues (Safari)
- Font loading delays
- Image aspect ratios

---

### 3.2 Image Carousel - P0

**Steps:**
1. Click listing card to open detail
2. Verify image carousel displays
3. Click next/prev arrows
4. Swipe left/right (mobile)
5. Click thumbnail indicators
6. Verify image changes

**Expected Results:**
- Images display correctly
- Arrows work on desktop
- Swipe works on mobile
- Thumbnails indicate current image
- Smooth transitions
- No layout shift

**Browser Issues to Check:**
- Touch events (mobile)
- Swipe gesture recognition
- Image loading order
- Aspect ratio preservation

---

### 3.3 Video Playback - P0

**Steps:**
1. Navigate to listing with video
2. Verify video loads
3. Verify autoplay works (desktop)
4. Verify play button works (mobile)
5. Verify controls work
6. Verify fullscreen works
7. Verify audio works

**Expected Results:**
- Video plays smoothly
- Autoplay works (where supported)
- Controls responsive
- Fullscreen works
- No black screen
- Audio plays

**Browser Issues to Check:**
- Autoplay policy (Safari)
- Video format support
- Controls display
- Fullscreen API

---

### 3.4 Map Interaction - P0

**Steps:**
1. Navigate to listing detail
2. Verify map displays
3. Verify marker shows location
4. Pan map (drag)
5. Zoom map (pinch/scroll)
6. Click marker
7. Verify info window

**Expected Results:**
- Map loads correctly
- Marker displays at listing location
- Pan works smoothly
- Zoom works smoothly
- Marker click shows info
- No gray areas (tiles load)

**Browser Issues to Check:**
- Touch events (mobile)
- Map API support
- Tile loading
- Marker rendering

---

### 3.5 Form Input (Mobile) - P0

**Steps:**
1. Open contact form or login
2. Tap input field
3. Verify keyboard appears
4. Type in field
5. Verify input visible (not hidden)
6. Tap next field
7. Submit form

**Expected Results:**
- Keyboard appears on focus
- Input remains visible
- No layout shift
- Form validation works
- Submit works

**Browser Issues to Check:**
- Keyboard covering inputs
- Viewport resizing
- Input autofocus
- Form validation

---

### 3.6 Toast Notifications - P0

**Steps:**
1. Trigger success notification
2. Verify position (top-right)
3. Verify color (green)
4. Verify icon (checkmark)
5. Wait for auto-dismiss
6. Trigger error notification
7. Verify position stacks

**Expected Results:**
- Toast appears top-right
- Correct color for type
- Icon displays
- Message readable
- Auto-dismisses after 5s
- Multiple toasts stack

**Browser Issues to Check:**
- Positioning (fixed)
- z-index layering
- Stacking order
- Animation performance

---

### 3.7 Filters & Search - P0

**Steps:**
1. Click "For Sale" tab
2. Verify listings update
3. Click "For Rent" tab
4. Verify listings update
5. Select category filter
6. Verify listings update
7. Select location filter
8. Verify listings update
9. Type in search box
10. Verify results update
11. Click "Reset Filters"
12. Verify all filters clear

**Expected Results:**
- All filters work
- Listings update immediately
- No page reload
- Loading states show
- Empty states display
- Reset works

**Browser Issues to Check:**
- Select dropdown styling
- Input field styling
- State updates
- Performance with many listings

---

### 3.8 Admin CRUD - P0

**Steps:**
1. Navigate to /admin
2. Login with admin email
3. Verify dashboard loads
4. Click "Add Listing"
5. Fill form and submit
6. Verify listing created
7. Click "Edit" on listing
8. Make changes and save
9. Verify listing updated
10. Click "Delete" on listing
11. Confirm deletion
12. Verify listing removed

**Expected Results:**
- Login works
- Dashboard loads
- Create works
- Edit works
- Delete works
- Status changes work
- Image uploads work

**Browser Issues to Check:**
- Form validation
- File input styling
- Upload progress
- Confirmation dialogs

---

## 4. Testing Tools

### 4.1 BrowserStack / LambdaTest

**Purpose**: Cloud-based cross-browser testing

**Features:**
- Real browsers on real devices
- Mobile devices
- Different OS versions
- Screenshots
- Video recording

**Setup:**
```bash
# BrowserStack
https://www.browserstack.com/

# LambdaTest
https://www.lambdatest.com/
```

---

### 4.2 Chrome DevTools

**Purpose**: Built-in testing tools

**Features:**
- Device mode (mobile emulation)
- Network throttling
- CPU throttling
- Lighthouse
- Console logging

**Setup:**
1. Open Chrome
2. Press F12
3. Click "Device Toolbar" (Ctrl+Shift+M)

---

### 4.3 Remote Debugging

**Purpose**: Debug on real devices

**iOS:**
```bash
# 1. Connect iOS device to Mac
# 2. Enable Web Inspector on device
# Settings > Safari > Advanced > Web Inspector
# 3. Open Safari on Mac
# Develop > [Device] > [Page]
```

**Android:**
```bash
# 1. Enable USB debugging on device
# Settings > Developer Options > USB Debugging
# 2. Connect device to computer
# 3. Open Chrome on computer
# chrome://inspect
```

---

### 4.4 Automated Testing

**Tools:**
- **Playwright**: Cross-browser automation
- **Selenium**: Legacy automation
- **Cypress**: Modern alternative

**Setup:**
```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test
```

---

## 5. Testing Schedule

### Week 1 (P0):
- ✅ Chrome Desktop (Windows, Mac)
- ✅ Safari Desktop (macOS)
- ✅ Safari Mobile (iOS)
- ✅ Chrome Mobile (Android)

### Week 2 (P1):
- ✅ Firefox Desktop (Windows, Mac)
- ✅ iPad Testing (iOS, Android)
- ✅ Tablet landscape modes
- ✅ Performance testing

### Week 3 (P2):
- ✅ Edge Desktop (Windows)
- ✅ Legacy browser testing
- ✅ Accessibility audit
- ✅ Final regression

---

## 6. Issue Tracking

### Issue Template:
```markdown
### [Browser Name] - [Issue Title]

**Browser**: Chrome 120 / Safari 17 / Firefox 121
**OS**: Windows 11 / macOS 14 / iOS 17
**Device**: Desktop / iPhone 14 / Pixel 7
**Severity**: P0 (Critical) / P1 (High) / P2 (Medium)

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:

**Actual Behavior**:

**Screenshot**: [Attach]

**Console Errors**: [Paste]
```

---

## 7. Success Criteria

### Must Pass (P0):
- ✅ All core features work on Chrome
- ✅ All core features work on Safari
- ✅ Mobile devices functional
- ✅ No console errors
- ✅ No visual breaking

### Should Pass (P1):
- ✅ Firefox functional
- ✅ Tablets functional
- ✅ Performance acceptable

### Nice to Have (P2):
- ✅ Edge functional
- ✅ Legacy browsers supported
- ✅ Progressive enhancement

---

**Document Owner**: Testing Agent
**Status**: ✅ **READY FOR EXECUTION**
**Next Step**: Begin P0 testing on Chrome and Safari
