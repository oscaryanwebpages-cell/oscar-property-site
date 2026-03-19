import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AGENT_PROFILE, HERO_BACKGROUND_URL } from "../constants";
import { motion } from "framer-motion";

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${HERO_BACKGROUND_URL}')`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 border border-blue-300/40 rounded-full bg-blue-600/20 text-blue-100 text-xs font-bold tracking-widest uppercase mb-6">
                BOVAEA Registered • {AGENT_PROFILE.regNo}
              </span>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                Johor <span className="text-blue-300">Industrial</span> <br />
                Property Specialist
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-white/90 mb-6 tracking-wide drop-shadow-md">
                Factories • Industrial Land • Investment Opportunities
              </h2>
              <div className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto md:mx-0 mb-10 font-light leading-relaxed space-y-4">
                <p>
                  Advising investors, developers and corporations on strategic acquisitions of factories, industrial land and commercial assets across Johor Bahru.
                </p>
                <p>
                  With strong market insight and extensive industry connections, Oscar helps clients secure high-value industrial properties with confidence and precision.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="#listings"
                  className="bg-accent hover:bg-accent-hover text-primary font-bold px-8 py-4 rounded-sm transition-all flex items-center justify-center gap-2 group"
                >
                  Browse Listings
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
                <a
                  href="#contact"
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium px-8 py-4 rounded-sm transition-all"
                >
                  Contact Oscar
                </a>
              </div>
            </motion.div>
          </div>

          {/* Hero Image / Agent Portrait */}
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]"
            >
              <img
                src={AGENT_PROFILE.photoUrl}
                alt={AGENT_PROFILE.name}
                className="w-full h-full object-contain drop-shadow-2xl scale-[1.08] origin-bottom"
                loading="eager"
              />

              {/* Badge */}
              <div className="absolute bottom-10 left-0 bg-surface px-6 py-4 rounded-sm shadow-xl flex items-center gap-4 animate-bounce-slow border-l-4 border-accent">
                <div className="flex flex-col">
                  <span className="text-primary font-serif font-bold text-2xl">
                    {AGENT_PROFILE.yearsExperience}+
                  </span>
                  <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">
                    Years Exp.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;
