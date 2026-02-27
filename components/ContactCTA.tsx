import React, { useState } from "react";
import { Phone, Mail, ExternalLink, Send } from "lucide-react";
import { AGENT_PROFILE, WHATSAPP_ICON_URL } from "../constants";
import { motion } from "framer-motion";
import { analytics } from "../services/analytics";

const ContactCTA: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyInterest: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Track form submission
    analytics.contactFormSubmitted();

    // Simulate form submission
    setTimeout(() => {
      // In production, this would send data to backend
      const whatsappMessage = `Hi Oscar, I'm ${formData.name}. ${formData.message || `I'm interested in ${formData.propertyInterest || "your properties"}.`}`;
      const whatsappUrl = `https://wa.me/${AGENT_PROFILE.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, "_blank");

      setIsSubmitting(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        propertyInterest: "",
        message: "",
      });
    }, 500);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const whatsappUrl = `https://wa.me/${AGENT_PROFILE.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi Oscar, I'm interested in your properties. Please share more details.")}`;

  return (
    <section
      id="contact"
      className="py-24 bg-primary text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">
            Get In Touch
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Let's Find Your Perfect Property
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Ready to explore commercial real estate opportunities in Johor
            Bahru? Reach out today for personalized assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.whatsappClicked()}
                className="block hover:opacity-90 transition-opacity"
                aria-label="WhatsApp"
              >
                <img
                  src={WHATSAPP_ICON_URL}
                  alt="WhatsApp"
                  className="h-16 w-auto object-contain"
                />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <a
                href={`tel:${AGENT_PROFILE.phone}`}
                onClick={() => analytics.phoneClicked()}
                className="flex items-center gap-4 p-6 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-sm border border-white/10 transition-all group"
              >
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-colors">
                  <Phone size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Call Now</h3>
                  <p className="text-gray-400 text-sm">Direct line to Oscar</p>
                  <p className="text-accent font-medium mt-1">
                    {AGENT_PROFILE.phone}
                  </p>
                </div>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a
                href={`mailto:${AGENT_PROFILE.email}`}
                onClick={() => analytics.emailClicked()}
                className="flex items-center gap-4 p-6 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-sm border border-white/10 transition-all group"
              >
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-colors">
                  <Mail size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-gray-400 text-sm">
                    Send detailed inquiries
                  </p>
                  <p className="text-accent font-medium mt-1 break-all">
                    {AGENT_PROFILE.email}
                  </p>
                </div>
              </a>
            </motion.div>

            {/* External Links */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-4">Also find me on:</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-all flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  PropertyGuru
                </a>
                <a
                  href="#"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-all flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  iProperty
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-sm border border-white/10 p-8"
          >
            <h3 className="font-bold text-xl mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  name="propertyInterest"
                  placeholder="Property of Interest (Optional)"
                  value={formData.propertyInterest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 px-6 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send via WhatsApp
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
