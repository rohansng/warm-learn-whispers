
import React from 'react';
import { Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-red-900/10 to-black border-t border-red-600/30 mt-16">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-fade-in-up">
          <h3 className="text-xl font-semibold text-white mb-6 text-center font-poppins">
            ✨ A Project by Rohan Singh
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <img
                src="/lovable-uploads/4db4454b-d1e2-4b31-8ee9-d3bd59dfc8be.png"
                alt="Rohan Singh"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-red-600 shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-red-600/50 hover:shadow-2xl"
              />
            </div>
            
            {/* LinkedIn Link */}
            <div className="flex items-center space-x-3">
              <a
                href="https://www.linkedin.com/in/rohan-singh-6b716022a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gradient-card border border-red-600/30 px-4 py-2 rounded-full shadow-md hover:shadow-red-600/40 hover:shadow-lg transition-all duration-300 hover:scale-105 group hover:border-red-600/60"
              >
                <Linkedin 
                  size={20} 
                  className="text-red-500 group-hover:text-red-400 transition-colors duration-300" 
                />
                <span className="text-gray-200 font-medium font-poppins group-hover:text-white transition-colors duration-300">
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
