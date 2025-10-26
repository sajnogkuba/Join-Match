import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="bg-black text-white py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4 text-purple-300">JoinMatch</h3>
          <p className="text-gray-300">
            Ułatwiamy organizację amatorskich wydarzeń sportowych dzięki intuicyjnemu systemowi rezerwacji obiektów,
            zarządzaniu harmonogramem i automatycznej komunikacji z uczestnikami.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4 text-purple-300">Szybkie linki</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="/" className="hover:text-purple-300 transition-colors">Strona główna</a></li>
            <li><a href="/events" className="hover:text-purple-300 transition-colors">Wydarzenia</a></li>
            <li><a href="/about" className="hover:text-purple-300 transition-colors">O nas</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4 text-purple-300">Pomoc</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/kontakt" className="hover:text-purple-300 transition-colors">Kontakt</Link></li>
            <li><Link to="/faq" className="hover:text-purple-300 transition-colors">Najczęstsze pytania (FAQ)</Link></li>
            <li><Link to="/privacy" className="hover:text-purple-300 transition-colors">Polityka prywatności</Link></li>
            <li><a href="/terms" className="hover:text-purple-300 transition-colors">Regulamin</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4 text-purple-300">Połącz się z nami</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-purple-300">
              {/* Facebook */}
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href="#" className="text-gray-300 hover:text-purple-300">
              {/* Twitter */}
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
              </svg>
            </a>
            <a href="#" className="text-gray-300 hover:text-purple-300">
              {/* Instagram */}
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
        <p>© {new Date().getFullYear()} JoinMatch. Wszelkie prawa zastrzeżone.</p>
      </div>
    </div>
  </footer>
);

export default Footer;