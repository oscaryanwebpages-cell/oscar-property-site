import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Listing } from '../types';
import { getListingById } from '../services/firebase';
import ListingDetail from '../components/ListingDetail';
import SkeletonDetail from '../components/ui/SkeletonDetail';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update document title and meta tags
  useEffect(() => {
    if (listing) {
      // Update document title
      document.title = `${listing.title} | Oscar Yan Property`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `${listing.title} - ${listing.category} in ${listing.location}. ${listing.description || ''} RM ${listing.price.toLocaleString()}. Contact Oscar Yan (REA E 08414) for more details.`);
      }

      // Update or create Open Graph meta tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const displayImage = listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0] : '');

      updateMetaTag('og:title', `${listing.title} | Oscar Yan Property`);
      updateMetaTag('og:description', `${listing.category} in ${listing.location} for ${listing.type}. RM ${listing.price.toLocaleString()}.`);
      updateMetaTag('og:image', displayImage);
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:url', `${window.location.origin}/listing/${listing.id}`);

      // Update Twitter meta tags
      const updateTwitterMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateTwitterMeta('twitter:card', 'summary_large_image');
      updateTwitterMeta('twitter:title', `${listing.title} | Oscar Yan Property`);
      updateTwitterMeta('twitter:description', `${listing.category} in ${listing.location}. RM ${listing.price.toLocaleString()}.`);
      updateTwitterMeta('twitter:image', displayImage);

      // Add canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${window.location.origin}/listing/${listing.id}`);

      // Add structured data (JSON-LD) for the listing
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Oscar Yan",
        "description": listing.description || `${listing.category} property in ${listing.location}`,
        "url": window.location.href,
        "image": displayImage,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": listing.location,
          "addressCountry": "MY"
        },
        "price": listing.price,
        "priceCurrency": "MYR",
        "identifier": {
          "@type": "PropertyValue",
          "name": "BOVAEA Registration Number",
          "value": "E 08414"
        },
        "offers": {
          "@type": "Offer",
          "price": listing.price,
          "priceCurrency": "MYR",
          "availability": listing.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          "url": window.location.href
        }
      };

      // Remove old structured data if exists
      const oldScript = document.getElementById('listing-structured-data');
      if (oldScript) {
        oldScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'listing-structured-data';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [listing]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('Listing ID is required');
        setLoading(false);
        return;
      }

      try {
        const data = await getListingById(id);
        if (data) {
          setListing(data);
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleClose = () => {
    // Navigate back to home page
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <SkeletonDetail isOpen={true} />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-sm p-6 mb-4">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Listing Not Found</h1>
            <p className="text-red-700">{error || 'The requested listing could not be found.'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-sm transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <ListingDetail listing={listing} onClose={handleClose} />
    </div>
  );
};

export default ListingDetailPage;
