// src/components/Navbar.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/LogoWhite.png';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="JoinMatch Logo" className="h-9" />
          </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-purple-300 transition-colors font-medium">Strona Główna</Link>
            <Link to="/events" className="hover:text-purple-300 transition-colors font-medium">Eventy</Link>
            <Link to="/venues" className="hover:text-purple-300 transition-colors font-medium">Mecze</Link>
            <Link to="/about" className="hover:text-purple-300 transition-colors font-medium">O nas</Link>
          </div>
          
          {/* Login/Register Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Zaloguj</Link>
            <Link to="/register" className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md">Zarejestruj</Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-black">
            <div className="flex flex-col space-y-4 pb-4">
              <Link to="/" className="hover:bg-gray-800 px-4 py-2 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/events" className="hover:bg-gray-800 px-4 py-2 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>Events</Link>
              <Link to="/venues" className="hover:bg-gray-800 px-4 py-2 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>Venues</Link>
              <Link to="/about" className="hover:bg-gray-800 px-4 py-2 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
              <div className="border-t border-gray-700 pt-2 flex flex-col space-y-2">
                <Link to="/login" className="hover:bg-gray-800 px-4 py-2 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;