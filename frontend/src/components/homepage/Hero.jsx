import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    // Added flex, flex-col, and items-center to center the whole section
    <section className="bg-surface-bright py-25 flex flex-col items-center justify-center px-4">
      
      <div className="text-center max-w-3xl">
        {/* Replaced mx-[25vw] with max-w-3xl mx-auto so it doesn't squish on mobile */}
        <h1 className="text-[36px] font-semibold mb-4 leading-tight">
          Sell on Social Media with <span className="text-primary">Absolute Trust</span>
        </h1>
        
        <p className="text-gray-700 leading-relaxed">
          The secure escrow wallet built for Whatsapp Sellers<br />
          Guarantee payment before you ship and build instant trust with every<br />
          buyer
        </p>
      </div>

      {/* Added justify-center and a gap to space out the buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button className="text-white bg-primary flex items-center gap-2 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Get Started <ArrowRight size={18} strokeWidth={5}/>
        </button>
        <button className="px-8 py-3 rounded-lg font-medium bg-gray-100 hover:bg-gray-400 transition-colors border-1">
          See Demo
        </button>
      </div>

    </section>
  );
};

export default Hero;