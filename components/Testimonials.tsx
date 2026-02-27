import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  transactionType?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ahmad Rahman',
    role: 'Business Owner',
    content: 'Oscar helped us find the perfect industrial land for our expansion. His professionalism and attention to detail made the entire process smooth. Highly recommended!',
    rating: 5,
    transactionType: 'Industrial Land Purchase',
  },
  {
    id: '2',
    name: 'Sarah Lim',
    role: 'Property Investor',
    content: 'Working with Oscar was a pleasure. He understood our requirements and found us several excellent commercial properties. His knowledge of the Johor market is exceptional.',
    rating: 5,
    transactionType: 'Commercial Property Investment',
  },
  {
    id: '3',
    name: 'David Tan',
    role: 'Manufacturing Director',
    content: 'We needed a factory space urgently, and Oscar delivered. He negotiated a great deal and handled all the paperwork efficiently. Truly professional service.',
    rating: 5,
    transactionType: 'Factory Rental',
  },
  {
    id: '4',
    name: 'Lisa Chen',
    role: 'Real Estate Developer',
    content: 'Oscar\'s expertise in commercial real estate is unmatched. He provided valuable insights and helped us secure prime land for our development project.',
    rating: 5,
    transactionType: 'Land Acquisition',
  },
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">
            Client Testimonials
          </span>
          <h2 className="font-serif text-4xl text-primary font-bold mb-6">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Trusted by businesses and investors across Johor Bahru. Here's what they have to say about working with us.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-sm shadow-lg p-8 md:p-12 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Quote className="text-accent" size={32} />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < currentTestimonial.rating
                        ? 'text-accent fill-accent'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed text-center mb-8 font-light italic">
                "{currentTestimonial.content}"
              </p>

              {/* Author */}
              <div className="text-center">
                <h3 className="font-bold text-primary text-lg mb-1">
                  {currentTestimonial.name}
                </h3>
                {currentTestimonial.role && (
                  <p className="text-text-muted text-sm mb-2">{currentTestimonial.role}</p>
                )}
                {currentTestimonial.transactionType && (
                  <p className="text-accent text-xs uppercase tracking-wider font-semibold">
                    {currentTestimonial.transactionType}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent hover:text-primary transition-all group"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} className="group-hover:translate-x-[-2px] transition-transform" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent hover:text-primary transition-all group"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} className="group-hover:translate-x-[2px] transition-transform" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-accent w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
