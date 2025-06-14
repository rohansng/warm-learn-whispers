
import React from 'react';
import { Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-fade-in-up">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center font-poppins">
            ✨ A Project by Rohan Singh
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <img
                src="/lovable-uploads/b7b3be69-dbc1-44bb-bfcf-ce520ea51354.png"
                alt="Rohan Singh"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* LinkedIn Link */}
            <div className="flex items-center space-x-3">
              <a
                href="https://www.linkedin.com/in/rohan-singh-6b716022a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <Linkedin 
                  size={20} 
                  className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" 
                />
                <span className="text-gray-700 font-medium font-poppins group-hover:text-gray-800 transition-colors duration-300">
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
