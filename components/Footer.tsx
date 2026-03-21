import React from 'react';
import { AGENT_PROFILE } from '../constants';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-primary text-white border-t border-white/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/oscar-property-1cc52.firebasestorage.app/o/main%20page%2FImage(1).png?alt=media&token=15102a56-3178-4e2c-a441-c7f2c5f25736" 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-sm"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-tight">{AGENT_PROFILE.name}</span>
                <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">{AGENT_PROFILE.regNo}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
              "Connecting Investors with Johor’s Best Industrial Properties"
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted partner in navigating Malaysia's commercial real estate landscape. Delivering professional advisory and successful transactions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-heading">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-accent transition-colors">About Oscar</a></li>
              <li><a href="#listings" className="hover:text-accent transition-colors">Featured Listings</a></li>
              <li><a href="#stats" className="hover:text-accent transition-colors">Track Record</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Mortgage Calculator</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-heading">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                <span>
                  {AGENT_PROFILE.agency} <br />
                  {AGENT_PROFILE.address || "Johor Bahru, Johor, Malaysia"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent shrink-0" />
                <a href={`tel:${AGENT_PROFILE.phone}`} className="hover:text-white transition-colors">{AGENT_PROFILE.phone}</a>
              </li>
              {AGENT_PROFILE.companyPhone && (
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-accent shrink-0" />
                  <a href={`tel:${AGENT_PROFILE.companyPhone}`} className="hover:text-white transition-colors">{AGENT_PROFILE.companyPhone} (Office)</a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent shrink-0" />
                <a href={`mailto:${AGENT_PROFILE.email}`} className="hover:text-white transition-colors">{AGENT_PROFILE.email}</a>
              </li>
              {AGENT_PROFILE.website && (
                <li className="flex items-center gap-3">
                  <Globe size={18} className="text-accent shrink-0" />
                  <a href={`https://${AGENT_PROFILE.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{AGENT_PROFILE.website}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-heading">Certifications</h4>
            <div className="p-4 bg-white/5 rounded-sm border border-white/10 mb-4">
              <p className="text-xs text-gray-300 font-medium">BOVAEA Registered Estate Negotiator</p>
              <p className="text-accent font-bold text-sm mt-1">{AGENT_PROFILE.regNo}</p>
            </div>
            {AGENT_PROFILE.agencyLicense && (
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <p className="text-xs text-gray-300 font-medium">Agency License</p>
                <p className="text-accent font-bold text-sm mt-1">{AGENT_PROFILE.agencyLicense}</p>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-white/10 my-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {AGENT_PROFILE.name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for Real Estate Excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
