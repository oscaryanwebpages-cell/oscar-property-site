import React from 'react';
import { MapPin, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const values = [
    {
      icon: MapPin,
      title: 'Specialized in Johor Industrial Properties',
      description: 'Focused exclusively on high-value industrial assets across the Johor Bahru region.',
    },
    {
      icon: Users,
      title: 'Strong Network with Owners & Developers',
      description: 'Direct access to key stakeholders and premium off-market opportunities.',
    },
    {
      icon: Briefcase,
      title: 'Experienced in High Value Transactions',
      description: 'Proven track record of managing complex, large-scale commercial real estate deals.',
    },
    {
      icon: ShieldCheck,
      title: 'Trusted by Investors and Corporate Buyers',
      description: 'Delivering professional advisory and successful outcomes for discerning clients.',
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
            About Oscar Yan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-primary font-bold mb-6">
            Commercial Real Estate Advisor
          </h2>
          <div className="text-gray-600 text-base sm:text-lg leading-relaxed px-4 space-y-4">
            <p>
              Oscar Yan is a commercial real estate advisor specializing in industrial properties across Johor Bahru.
            </p>
            <p>
              He focuses on factory, warehouse, and industrial land transactions, assisting investors, corporations, and developers in identifying strategic opportunities and securing high-value assets.
            </p>
            <p>
              With deep market knowledge and a trusted network within the industry, Oscar is committed to delivering professional advisory and successful transactions for his clients.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl text-primary font-bold mb-6">
            Why Work With Oscar
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
