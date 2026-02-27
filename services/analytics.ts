// Analytics service for tracking user interactions
// GA4, Microsoft Clarity, and Facebook Pixel events

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// GA4 Event Tracking
export const trackGA4Event = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Microsoft Clarity Event Tracking
export const trackClarityEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
};

// Facebook Pixel Event Tracking
export const trackFBPixelEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Combined tracking function
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  trackGA4Event(eventName, params);
  trackClarityEvent(eventName, params);
  trackFBPixelEvent(eventName, params);
};

// Specific event trackers for the website
export const analytics = {
  // Listing interactions
  listingViewed: (listingId: string, listingTitle: string) => {
    trackEvent('listing_viewed', {
      listing_id: listingId,
      listing_title: listingTitle,
    });
  },

  listingCardClicked: (listingId: string) => {
    trackEvent('listing_card_clicked', {
      listing_id: listingId,
    });
  },

  // Filter interactions
  filterApplied: (filters: Record<string, any>) => {
    trackEvent('filter_applied', filters);
  },

  // Contact actions
  whatsappClicked: (listingId?: string) => {
    trackEvent('whatsapp_clicked', {
      listing_id: listingId || 'general',
    });
  },

  phoneClicked: () => {
    trackEvent('phone_clicked');
  },

  emailClicked: () => {
    trackEvent('email_clicked');
  },

  contactFormSubmitted: () => {
    trackEvent('contact_form_submitted');
  },

  // Map interactions
  mapRegionClicked: (region: string) => {
    trackEvent('map_region_clicked', {
      region,
    });
  },

  // Multimedia interactions
  videoPlayed: (listingId: string) => {
    trackEvent('video_played', {
      listing_id: listingId,
    });
  },

  audioPlayed: (listingId: string) => {
    trackEvent('audio_played', {
      listing_id: listingId,
    });
  },

  panorama360Viewed: (listingId: string) => {
    trackEvent('panorama_360_viewed', {
      listing_id: listingId,
    });
  },

  // Page views
  pageView: (pageName: string) => {
    trackEvent('page_view', {
      page_name: pageName,
    });
  },

  // Scroll depth
  scrollDepth: (depth: number) => {
    trackEvent('scroll_depth', {
      depth_percentage: depth,
    });
  },

  // Admin / generic events
  trackEvent: (eventName: string, params?: Record<string, any>) => {
    trackGA4Event(eventName, params);
    trackClarityEvent(eventName, params);
    trackFBPixelEvent(eventName, params);
  },
};
