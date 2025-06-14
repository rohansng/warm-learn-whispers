
import React from 'react';
import { Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gradient-footer border-t border-red-crimson/30 backdrop-blur-sm z-40">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Profile section */}
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/b7b3be69-dbc1-44bb-bfcf-ce520ea51354.png"
              alt="Rohan Singh"
              className="w-12 h-12 rounded-full object-cover border-2 border-red-cherry shadow-lg hover-scale transition-all duration-300"
            />
            <div>
              <h3 className="text-sm font-orbitron font-semibold gradient-text">
                ✨ A Project by Rohan Singh
              </h3>
              <p className="text-xs text-gray-400">Full Stack Developer</p>
            </div>
          </div>
          
          {/* Social links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://www.linkedin.com/in/rohan-singh-6b716022a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 glass-card px-3 py-2 rounded-lg hover:glow-red-hover transition-all duration-300 hover-scale group"
            >
              <Linkedin 
                size={16} 
                className="text-red-cherry group-hover:text-white transition-colors duration-300" 
              />
              <span className="text-white text-sm font-medium group-hover:text-white transition-colors duration-300">
                LinkedIn
              </span>
            </a>
            
            <div className="text-xs text-gray-400">
              © 2024 TIL App
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
