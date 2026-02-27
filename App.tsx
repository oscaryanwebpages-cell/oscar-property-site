import React, { useEffect, useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import ListingsGrid from './components/ListingsGrid';
import Testimonials from './components/Testimonials';
import MapSection from './components/MapSection';
import ContactCTA from './components/ContactCTA';
import Footer from './components/Footer';
import ListingDetail from './components/ListingDetail';
import { useStore } from './store';
import { useScrollTracking } from './hooks/useScrollTracking';
import { analytics } from './services/analytics';

function App() {
  const { selectedListing, isDetailModalOpen, closeDetailModal } = useStore();
  const listingsGridRef = useRef<{ refreshListings: () => void } | null>(null);

  // Track page view
  useEffect(() => {
    analytics.pageView('home');
  }, []);

  // Track scroll depth
  useScrollTracking();

  // Handle refresh after listing edit
  const handleRefresh = () => {
    listingsGridRef.current?.refreshListings();
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <ListingsGrid ref={listingsGridRef} />
        <Testimonials />
        <MapSection />
        <ContactCTA />
      </main>
      <Footer />

      {/* Listing Detail Modal */}
      {isDetailModalOpen && selectedListing && (
        <ListingDetail listing={selectedListing} onClose={() => closeDetailModal(selectedListing)} onRefresh={handleRefresh} />
      )}
    </div>
  );
}

export default App;
