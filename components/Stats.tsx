import React from 'react';
import { AGENT_PROFILE } from '../constants';
import { Award, Building2, TrendingUp, Users } from 'lucide-react';

const StatItem: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
  <div className="flex flex-col items-center text-center p-4 md:p-6 border border-white/5 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
    <div className="text-accent mb-3 md:mb-4 p-2 md:p-3 bg-accent/10 rounded-full">
      {icon}
    </div>
    <div className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">{value}</div>
    <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider font-medium px-2">{label}</div>
  </div>
);

const Stats: React.FC = () => {
  return (
    <section id="stats" className="py-12 md:py-20 bg-primary relative border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatItem 
            icon={<Award size={24} />} 
            value={`${AGENT_PROFILE.yearsExperience}+`} 
            label="Years Experience" 
          />
          <StatItem 
            icon={<Building2 size={24} />} 
            value={`${AGENT_PROFILE.listingsCount}+`} 
            label="Active Listings" 
          />
          <StatItem 
            icon={<TrendingUp size={24} />} 
            value={`${AGENT_PROFILE.dealsClosed}+`} 
            label="Deals Closed" 
          />
          <StatItem 
            icon={<Users size={24} />} 
            value="500+" 
            label="Happy Clients" 
          />
        </div>
      </div>
    </section>
  );
};

export default Stats;
