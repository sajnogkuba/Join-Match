import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/LogoWhite.png';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black bg-opacity-90' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="JoinMatch Logo" className="h-8" />
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-purple-300 transition">Strona Główna</Link>
          <Link to="/wydarzenia" className="text-white hover:text-purple-300 transition">Wydarzenia</Link>
          <Link to="/rankingi" className="text-white hover:text-purple-300 transition">Rankingi</Link>
        </div>
        
        <div>
          <Link 
            to="/logowanie" 
            className="px-4 py-2 rounded-full border border-white text-white hover:bg-white hover:text-purple-700 transition"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;