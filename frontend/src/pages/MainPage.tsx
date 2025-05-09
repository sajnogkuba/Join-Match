
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../assets/Background.png';

// Komponenty
import EventCard from '../components/EventCard'; 

// Przykładowe dane wydarzeń
const sampleEvents = [
  {
    id: 1,
    title: 'Piłka Nożna',
    location: 'Koszykowa 10, Warszawa',
    date: new Date('2025-05-15T18:00:00'),
    spots: 30,
    spotsLeft: 12,
    rating: 4.5,
    reviews: 366,
    description: 'Zapraszam na 3v3 rozgrywkę w piłkę nożną.',
    participants: [
      {initials: 'JD', color: 'bg-purple-700'},
      {initials: 'MS', color: 'bg-purple-800'},
      {initials: 'KL', color: 'bg-purple-600'},
      {initials: 'AB', color: 'bg-purple-900'}
    ]
  },
  {
    id: 2,
    title: 'Siatkówka',
    location: 'Sportowa 8, Warszawa',
    date: new Date('2025-05-20T19:30:00'),
    spots: 24,
    spotsLeft: 8,
    rating: 4.7,
    reviews: 212,
    description: 'Turniej siatkówki plażowej 2v2. Wszystkie poziomy zaawansowania.',
    participants: [
      {initials: 'PK', color: 'bg-purple-700'},
      {initials: 'MN', color: 'bg-purple-800'},
      {initials: 'RW', color: 'bg-purple-600'}
    ]
  },
  {
    id: 3,
    title: 'Koszykówka',
    location: 'Plac Defilad 1, Warszawa',
    date: new Date('2025-05-12T17:00:00'),
    spots: 20,
    spotsLeft: 5,
    rating: 4.3,
    reviews: 178,
    description: 'Przyjdź pograć w kosza. Organizujemy mecze 3v3 i 5v5.',
    participants: [
      {initials: 'TK', color: 'bg-purple-700'},
      {initials: 'OP', color: 'bg-purple-800'},
      {initials: 'LM', color: 'bg-purple-600'},
      {initials: 'ZX', color: 'bg-purple-900'},
      {initials: 'EF', color: 'bg-purple-500'}
    ]
  }
];

export const MainPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <>
      {/* Hero Section */}
      <div 
        className="relative bg-black h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-opacity-60"></div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Szukaj Wydarzenia
          </h1>
          
          <p className="text-xl text-gray-300 mb-10">
            np. piłka nożna, siatkówka, turniej 3x3
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative flex">
              <input
                type="text"
                className="bg-white bg-opacity-20 backdrop-blur-md text-white w-full py-4 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Wpisz rodzaj wydarzenia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-700 hover:bg-purple-800 text-white py-2 px-8 rounded-full transition">
                Szukaj
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center mt-8 space-x-6">
              <button className="flex items-center space-x-2 text-white bg-black bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-opacity-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Miejsce</span>
              </button>
              
              <button className="flex items-center space-x-2 text-white bg-black bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-opacity-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Data</span>
              </button>
              
              <button className="flex items-center space-x-2 text-white bg-black bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-opacity-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Kategoria</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Events Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Najnowsze wydarzenia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/wydarzenia" 
              className="inline-block bg-purple-700 hover:bg-purple-800 text-white py-3 px-8 rounded-full transition"
            >
              Zobacz więcej wydarzeń
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Dlaczego JoinMatch?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-5 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Twórz Wydarzenia</h3>
              <p className="text-gray-600">Łatwo organizuj sportowe wydarzenia i zapraszaj znajomych lub poznawaj nowych ludzi.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-5 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Znajdź Drużynę</h3>
              <p className="text-gray-600">Dołącz do wydarzeń w Twojej okolicy i poznaj ludzi z podobnymi zainteresowaniami.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-5 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Rozwijaj się</h3>
              <p className="text-gray-600">Zbieraj punkty, awansuj w rankingach i stale poprawiaj swoje umiejętności.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Gotowy na sportową przygodę?</h2>
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Dołącz do tysięcy użytkowników, którzy każdego dnia znajdują nowe sportowe wyzwania.
          </p>
          <div>
            <Link 
              to="/rejestracja" 
              className="inline-block bg-white text-purple-700 font-semibold py-3 px-8 rounded-full hover:bg-purple-100 transition mr-4"
            >
              Zarejestruj się
            </Link>
            <Link 
              to="/wydarzenia" 
              className="inline-block bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-purple-700 transition"
            >
              Przeglądaj wydarzenia
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainPage;