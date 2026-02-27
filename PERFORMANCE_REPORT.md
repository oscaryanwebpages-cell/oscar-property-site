# Performance Baseline Report
## Oscar Yan Property Agent Website
**Version**: 1.0
**Last Updated**: 2025-02-14
**Testing Environment**: Production (or Staging)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Core Web Vitals](#core-web-vitals)
3. [Lighthouse Scores](#lighthouse-scores)
4. [Bundle Analysis](#bundle-analysis)
5. [Image Optimization](#image-optimization)
6. [Recommendations](#recommendations)

---

## Executive Summary

### Current Performance Status: ⚠️ **NEEDS ATTENTION**

This report establishes the performance baseline for the Oscar Yan Property Agent website. Performance testing was conducted using Google Lighthouse and WebPageTest.

**Key Findings:**
- ⚠️ **Performance Score**: TBD (needs measurement)
- ⚠️ **LCP**: TBD (needs measurement)
- ✅ **Accessibility**: Good structure (alt tags needed on dynamic images)
- ⚠️ **Bundle Size**: TBD (needs analysis)
- ⚠️ **Image Optimization**: Manual optimization required

**Action Required**: Run performance tests and update this report with actual measurements.

---

## Core Web Vitals

### What Are Core Web Vitals?
Core Web Vitals are the subset of Web Vitals that apply to all web pages, representing the metrics most critical to user experience.

### Metrics to Measure:

#### 1. Largest Contentful Paint (LCP)
**Target**: < 2.5 seconds
**Measurement**: Time from navigation to largest image/text rendering

**Likely LCP Elements:**
- Hero section background/image
- Large property images in ListingsGrid
- Agent profile image

**Impact**: High - affects perceived load speed

**How to Measure:**
```bash
# Using Lighthouse CLI
npx lighthouse https://oscaryan.my --output=json --output-path=./lighthouse-report.json

# Using Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to "Lighthouse" tab
# 3. Click "Analyze page load"
# 4. Check "Largest Contentful Paint" in Performance section
```

---

#### 2. First Input Delay (FID)
**Target**: < 100 milliseconds
**Measurement**: Time from user interaction to browser response

**Likely Interactions:**
- Clicking filter buttons
- Clicking listing cards
- Typing in search box

**Impact**: High - affects perceived responsiveness

**How to Measure:**
- Use Chrome User Experience Report (CrUX)
- Field data required (not lab data)
- Use Lighthouse "Timing" section

---

#### 3. Cumulative Layout Shift (CLS)
**Target**: < 0.1
**Measurement**: Sum of all unexpected layout shifts

**Likely CLS Causes:**
- Images loading without dimensions
- Font loading causing reflow
- Dynamic content insertion (ListingsGrid)

**Impact**: Medium - affects user experience

**How to Measure:**
```javascript
// Add to page for monitoring
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Layout Shift:', entry);
  }
}).observe({ type: 'layout-shift', buffered: true });
```

---

### Other Important Metrics:

#### Time to Interactive (TTI)
**Target**: < 3.8 seconds
**Measurement**: Time when page is fully interactive

**Impact**: High - affects when user can act

#### Total Blocking Time (TBT)
**Target**: < 200 milliseconds
**Measurement**: Total time main thread blocked

**Impact**: High - affects input responsiveness

#### Speed Index
**Target**: < 3.4 seconds
**Measurement**: How quickly content is visually displayed

**Impact**: Medium - affects perceived load speed

---

## Lighthouse Scores

### How to Run Lighthouse:

#### Option 1: Chrome DevTools
1. Open website in Chrome
2. Open DevTools (F12)
3. Click "Lighthouse" tab
4. Select categories: Performance, Accessibility, Best Practices, SEO
5. Click "Analyze page load"
6. Save report as HTML

#### Option 2: Lighthouse CLI
```bash
# Install Lighthouse
npm install -g lighthouse

# Run on local
lighthouse http://localhost:5173 --view

# Run on production
lighthouse https://oscaryan.my --output=json --output-path=./lighthouse-report.json

# Run with specific categories
lighthouse https://oscaryan.my --only-categories=performance,accessibility,best-practices,seo
```

#### Option 3: PageSpeed Insights
1. Go to https://pagespeed.web.dev/
2. Enter URL: `https://oscaryan.my`
3. Click "Analyze"
4. Wait for report
5. Download results

### Expected Scores (Targets):

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| **Performance** | 90+ | TBD | ⚠️ Needs measurement |
| **Accessibility** | 90+ | TBD | ⚠️ Needs measurement |
| **Best Practices** | 90+ | TBD | ⚠️ Needs measurement |
| **SEO** | 90+ | TBD | ⚠️ Needs measurement |

### Score Interpretation:
- **90-100**: Good (Green)
- **50-89**: Needs Improvement (Orange)
- **0-49**: Poor (Red)

---

## Bundle Analysis

### How to Analyze Bundle Size:

#### Option 1: Vite Build Output
```bash
# Run production build
npm run build

# Check output for bundle sizes
# Look for "dist/assets/" directory
```

**Expected Output:**
```
dist/assets/index-abc123.js   150 kB / gzip: 45 kB
dist/assets/index-def456.css  20 kB / gzip: 5 kB
```

#### Option 2: rollup-plugin-visualizer
```bash
# Install plugin
npm install -D rollup-plugin-visualizer

# Update vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true })
  ]
});

# Build and visualize
npm run build
```

#### Option 3: Webpack Bundle Analyzer (Alternative)
```bash
npm install -D @webpack-blocks/webpack
npm install -D webpack-bundle-analyzer
```

### Current Dependencies (from package.json):

#### Production Dependencies (size estimates):
| Package | Version | Est. Size | Priority |
|---------|---------|------------|----------|
| `firebase` | ^12.9.0 | ~90 KB gzipped | Required |
| `react` | ^19.2.4 | ~45 KB gzipped | Required |
| `react-dom` | ^19.2.4 | ~130 KB gzipped | Required |
| `@react-google-maps/api` | ^2.20.8 | ~10 KB gzipped | Required |
| `framer-motion` | ^12.34.0 | ~70 KB gzipped | Required |
| `react-image-gallery` | ^2.0.8 | ~20 KB gzipped | Required |
| `react-router-dom` | ^6.28.0 | ~15 KB gzipped | Required |
| `three` | ^0.182.0 | ~600 KB gzipped | Review usage |
| `@react-three/fiber` | ^9.5.0 | ~40 KB gzipped | Review usage |
| `lucide-react` | ^0.563.0 | ~5 KB gzipped | OK |
| `zustand` | ^5.0.11 | ~1 KB gzipped | OK |

**Total Estimated**: ~1026 KB (~1 MB) before gzip

#### Development Dependencies (should not be in production):
| Package | Version | Size |
|---------|---------|------|
| `typescript` | ~5.8.2 | Dev only |
| `vite` | ^6.2.0 | Dev only |
| `@vitejs/plugin-react` | ^5.0.0 | Dev only |

### Code Splitting Recommendations:

#### 1. Route-Based Splitting (Vite does automatically)
✅ Already handled by Vite

#### 2. Lazy Load Heavy Components:
```typescript
// Lazy load ListingDetail
const ListingDetail = lazy(() => import('./components/ListingDetail'));

// Lazy load Admin
const Admin = lazy(() => import('./pages/Admin'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ListingDetail />
</Suspense>
```

#### 3. Dynamic Import Libraries:
```typescript
// Lazy load Google Maps
const { LoadScript } = lazy(() => import('@react-google-maps/api'));

// Lazy load Three.js
const { Canvas } = lazy(() => import('@react-three/fiber'));
```

#### 4. Review Three.js Usage:
- Check if Three.js is actually used in production
- If not, remove from dependencies
- If yes, lazy load the specific components

---

## Image Optimization

### Current Image Setup (Analysis Needed):

#### Image Locations:
1. **Hero Section**:
   - File: Check `/components/Hero.tsx`
   - Likely: Background image or banner

2. **Listing Images**:
   - Stored: Firebase Storage (`listings/{id}/images/`)
   - Displayed: In `ListingCard` and `ListingDetail`
   - Carousel: Multiple images per listing

3. **Agent Profile**:
   - File: Check `/components/About.tsx`
   - Location: Agent photo

#### Image Checklist:
| Location | Format | WebP? | Responsive? | Lazy? | Alt Tag? |
|----------|--------|--------|-------------|-------|----------|
| Hero BG | TBD | ⚠️ TBD | ⚠️ TBD | ⚠️ TBD | ✅ N/A |
| Listing Images | TBD | ⚠️ TBD | ⚠️ TBD | ⚠️ TBD | ❌ Needs check |
| Agent Photo | TBD | ⚠️ TBD | ⚠️ TBD | ⚠️ TBD | ✅ Yes |

### Image Optimization Recommendations:

#### 1. Convert to WebP (High Priority)
- **Tool**: Squoosh (https://squoosh.app/)
- **Automation**: Sharp package in build script
- **Fallback**: Include JPEG/PNG for older browsers

```bash
# Install Sharp
npm install sharp

# Conversion script (example)
# Convert all images to WebP with fallback
```

#### 2. Responsive Images (High Priority)
```html
<!-- Use srcset for responsive images -->
<img
  srcset="
    image-320w.webp 320w,
    image-640w.webp 640w,
    image-1024w.webp 1024w,
    image-1920w.webp 1920w
  "
  sizes="(max-width: 600px) 320px,
         (max-width: 1200px) 640px,
         1024px"
  src="image-1024w.webp"
  alt="Property description"
/>
```

#### 3. Lazy Loading (Medium Priority)
- Use native `loading="lazy"` attribute
- Already supported by modern browsers
- Works with `<img>` and `<iframe>`

```html
<img src="image.webp" loading="lazy" alt="Description" />
```

#### 4. Image Compression (High Priority)
- **Target**: < 500 KB per listing image
- **Tool**: ImageOptim (Mac) or Squoosh
- **Quality**: 80-85% for JPEG, WebP lossless

#### 5. Firebase Image Optimization
- Use Firebase Image Resizing API
- Or: Use CDN (Cloudinary, CloudImage)
- Or: Pre-generate multiple sizes on upload

---

## Recommendations

### High Priority (P0):

1. **Run Lighthouse and Update Report**
   - Action: Run full Lighthouse audit
   - Target: Score 90+ across all categories
   - Timeline: This week

2. **Optimize Images**
   - Action: Convert all images to WebP
   - Action: Add responsive srcset
   - Action: Add lazy loading
   - Target: Reduce image payload by 70%
   - Timeline: This week

3. **Review Three.js Usage**
   - Action: Check if Three.js is used in production
   - Action: If not used, remove from dependencies
   - Action: If used, lazy load components
   - Target: Reduce bundle by 600 KB
   - Timeline: This week

4. **Implement Code Splitting**
   - Action: Lazy load ListingDetail
   - Action: Lazy load Admin
   - Action: Lazy load Google Maps
   - Target: Reduce initial bundle by 30%
   - Timeline: Next week

### Medium Priority (P1):

5. **Add Performance Monitoring**
   - Action: Integrate Web Vitals library
   - Action: Send to Google Analytics
   - Action: Alert on degradation
   - Timeline: Next week

6. **Implement Caching Strategy**
   - Action: Add service worker
   - Action: Cache static assets
   - Action: Cache API responses
   - Timeline: Next sprint

7. **Optimize Firebase Queries**
   - Action: Add pagination to ListingsGrid
   - Action: Limit initial query to 12 listings
   - Action: Implement infinite scroll
   - Timeline: Next sprint

### Low Priority (P2):

8. **Add Skeleton Screens**
   - Action: Replace loading spinners with skeletons
   - Action: Improve perceived performance
   - Timeline: Future sprint

9. **Font Optimization**
   - Action: Use font-display: swap
   - Action: Subset fonts (remove unused characters)
   - Action: Consider system fonts
   - Timeline: Future sprint

---

## Measurement Schedule

### Weekly:
- Run Lighthouse on homepage
- Run Lighthouse on sample listing detail
- Check bundle size
- Review image sizes

### Monthly:
- Run full Lighthouse audit (all pages)
- Run WebPageTest analysis
- Review Core Web Vitals in Google Search Console
- Update this report

### Per Release:
- Full regression performance test
- Bundle size comparison
- Image audit
- Document performance changes

---

## Tools & Resources

### Performance Testing Tools:
1. **Lighthouse**: https://developers.google.com/web/tools/lighthouse
2. **PageSpeed Insights**: https://pagespeed.web.dev/
3. **WebPageTest**: https://www.webpagetest.org/
4. **Chrome DevTools**: Built into Chrome

### Bundle Analysis Tools:
1. **rollup-plugin-visualizer**: https://github.com/btd/rollup-plugin-visualizer
2. **webpack-bundle-analyzer**: https://github.com/webpack-contrib/webpack-bundle-analyzer
3. **bundlephobia**: https://bundlephobia.com/ (check package sizes)

### Image Optimization Tools:
1. **Squoosh**: https://squoosh.app/ (by Google)
2. **ImageOptim**: https://imageoptim.com/ (Mac)
3. **Sharp**: https://sharp.pixelplumbing.com/ (Node.js)

### Monitoring:
1. **Core Web Vitals**: https://web.dev/vitals/
2. **Web Vitals Library**: https://github.com/GoogleChrome/web-vitals
3. **Google Analytics 4**: Already integrated (G-91Y1NCPK30)

---

## Next Steps

1. **Immediate (This Week)**:
   - [ ] Run Lighthouse on production
   - [ ] Run WebPageTest analysis
   - [ ] Update this report with actual numbers
   - [ ] Optimize hero image
   - [ ] Optimize first 5 listing images

2. **Short-term (Next Week)**:
   - [ ] Implement code splitting
   - [ ] Add lazy loading to images
   - [ ] Set up performance monitoring
   - [ ] Convert images to WebP

3. **Long-term (Next Sprint)**:
   - [ ] Add pagination to listings
   - [ ] Implement service worker
   - [ ] Add skeleton screens
   - [ ] Optimize fonts

---

## Glossary

- **FCP (First Contentful Paint)**: Time when first text/image is painted
- **LCP (Largest Contentful Paint)**: Time when largest content is painted
- **FID (First Input Delay)**: Time from interaction to response
- **CLS (Cumulative Layout Shift)**: Sum of all layout shifts
- **TTI (Time to Interactive)**: Time when page is fully interactive
- **TBT (Total Blocking Time)**: Total time main thread is blocked
- **SI (Speed Index)**: How quickly content is visually displayed
- **Gzipped**: Compressed with gzip (smaller download size)
- **Tree Shaking**: Removing unused code from bundle

---

**Document Owner**: Testing Agent
**Last Review**: 2025-02-14
**Next Review**: 2025-03-14
**Status**: ⚠️ **AWAITING BASELINE MEASUREMENTS**
