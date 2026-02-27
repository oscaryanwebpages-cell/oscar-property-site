import { useEffect } from 'react';
import { analytics } from '../services/analytics';

export const useScrollTracking = () => {
  useEffect(() => {
    let lastTrackedDepth = 0;
    const depths = [25, 50, 75, 90, 100];

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

      // Track milestone depths
      depths.forEach((depth) => {
        if (scrollDepth >= depth && lastTrackedDepth < depth) {
          analytics.scrollDepth(depth);
          lastTrackedDepth = depth;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};
