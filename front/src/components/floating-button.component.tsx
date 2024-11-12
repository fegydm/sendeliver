import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const FloatingButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button 
      className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all md:hidden flex items-center"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowRight className="w-6 h-6" />
    </button>
  );
};

export default FloatingButton;
