import React, { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronUp, Filter } from "lucide-react";
import { AGENT_PROFILE, LOGO_URL, WHATSAPP_ICON_URL } from "../constants";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navClasses = `fixed w-full z-50 transition-all duration-300 ${
    isScrolled
      ? "bg-primary/95 backdrop-blur-md py-4 shadow-lg border-b border-white/10"
      : "bg-transparent py-6"
  }`;

  const linkClasses = `text-sm font-medium tracking-wide transition-colors ${
    isScrolled
      ? "text-gray-200 hover:text-accent"
      : "text-white/90 hover:text-white"
  }`;

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a
          href="#"
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img
            src={LOGO_URL}
            alt="Oscar Yan"
            className="h-12 md:h-14 w-auto object-contain"
          />
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className={linkClasses}>
            About
          </a>
          <a href="#listings" className={linkClasses}>
            Listings
          </a>
          <a href="#stats" className={linkClasses}>
            Track Record
          </a>
          <a href="#contact" className={linkClasses}>
            Contact
          </a>

          <a
            href={`https://wa.me/${AGENT_PROFILE.phone.replace(/[^0-9]/g, "")}`}
            className="block hover:opacity-90 transition-opacity"
            aria-label="WhatsApp"
          >
            <img
              src={WHATSAPP_ICON_URL}
              alt="WhatsApp"
              className="h-12 w-auto object-contain"
            />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-primary/95 backdrop-blur-lg border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <a
            href="#about"
            className="text-white text-lg font-medium py-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </a>
          <a
            href="#listings"
            className="text-white text-lg font-medium py-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Listings
          </a>
          <a
            href="#stats"
            className="text-white text-lg font-medium py-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Track Record
          </a>
          <a
            href="#contact"
            className="text-white text-lg font-medium py-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </a>
          <div className="h-px bg-white/10 my-2"></div>
          {/* Filter Quick-Access for Mobile */}
          <a
            href="#listings"
            className="flex items-center justify-center gap-3 text-accent py-4 bg-white/10 rounded-sm min-h-[44px]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Filter size={20} />
            <span>Search Properties</span>
          </a>
          <a
            href={`tel:${AGENT_PROFILE.phone}`}
            className="flex items-center justify-center gap-3 text-white py-4 bg-white/10 rounded-sm min-h-[44px]"
          >
            <Phone size={20} className="text-accent" />
            <span>Call Now</span>
          </a>
          <a
            href={`https://wa.me/${AGENT_PROFILE.phone.replace(/[^0-9]/g, "")}`}
            className="flex justify-center py-4"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="WhatsApp"
          >
            <img
              src={WHATSAPP_ICON_URL}
              alt="WhatsApp"
              className="h-12 w-auto object-contain"
            />
          </a>
        </div>
      )}

      {/* Back to Top Button (Mobile) */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="md:hidden fixed bottom-6 right-6 z-40 bg-accent hover:bg-accent/90 text-primary p-3 rounded-full shadow-lg transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </nav>
  );
};

export default Navbar;
