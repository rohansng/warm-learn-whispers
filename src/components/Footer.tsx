
import React from 'react';
import { Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-accent border-t border-crimson-500/20 mt-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-crimson-500/5 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        <div className="animate-fade-in-up">
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-white to-crimson-300 bg-clip-text text-transparent font-poppins">
            ✨ A Project by Rohan Singh
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <img
                src="/lovable-uploads/b7b3be69-dbc1-44bb-bfcf-ce520ea51354.png"
                alt="Rohan Singh"
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-3 border-crimson-500/50 shadow-2xl hover:scale-110 transition-all duration-500 glow-red"
              />
            </div>
            
            {/* LinkedIn Link */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.linkedin.com/in/rohan-singh-6b716022a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 glass-card px-6 py-3 rounded-full shadow-xl hover:glow-red-intense transition-all duration-300 hover:scale-110 group border border-crimson-500/30"
              >
                <Linkedin 
                  size={24} 
                  className="text-cherry-400 group-hover:text-white transition-colors duration-300" 
                />
                <span className="text-white font-semibold font-poppins group-hover:text-cherry-200 transition-colors duration-300 text-lg">
                  LinkedIn
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
