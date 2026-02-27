import React from 'react';
import { ShieldCheck, Scale, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Integrity',
      description: 'Transparent dealings and honest advice. Your trust is the most valuable asset in every transaction.',
    },
    {
      icon: Scale,
      title: 'Fairness',
      description: 'Striving for win-win outcomes where both buyers and sellers feel valued and respected.',
    },
    {
      icon: HeartHandshake,
      title: 'Courtesy',
      description: 'Professionalism with a personal touch. We value your time and prioritize your specific requirements.',
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
        >
          <span className="text-accent font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 block">
            Our Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-primary font-bold mb-4 sm:mb-6">
            Driven by Integrity, Defined by Results
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed px-4">
            With over 8 years of dedicated service in the commercial sector, I help businesses and investors find the perfect foundation for their growth. My practice is built on three non-negotiable pillars.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 md:p-8 hover:bg-surface rounded-lg transition-all duration-300 group border border-transparent hover:border-gray-100 hover:shadow-md"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-primary group-hover:bg-primary group-hover:text-accent transition-colors">
                <value.icon size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-primary">
                {value.title}
              </h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
