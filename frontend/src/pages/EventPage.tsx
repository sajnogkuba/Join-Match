import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { EventDetails } from '../Api/types.ts';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';

dayjs.locale('pl');
const EventPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShareToast, setShowShareToast] = useState(false);
    const [showDetailsAccordion, setShowDetailsAccordion] = useState(false);
  
    useEffect(() => {
      if (!id) {
        setError('Nieprawidłowy identyfikator wydarzenia');
        setLoading(false);
        return;
      }
  
      axios
        .get<EventDetails>(`http://localhost:8080/api/event/${id}`)
        .then((response) => {
          setEvent(response.data);
        })
        .catch((err) => {
          setError('Nie udało się pobrać szczegółów wydarzenia');
          console.error('Error fetching event details:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [id]);
  
    const formatPrice = (cost: number, currency: string) => {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency,
      }).format(cost);
    };
  
    const formatAddress = (street: string, number: number, secondNumber: number | null, city: string) => {
      const addressNumber = secondNumber ? `${number}/${secondNumber}` : `${number}`;
      return `${street} ${addressNumber} – ${city}`;
    };
  
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
  
    const getStatusBadge = (status: string, scoreTeam1: number | null, scoreTeam2: number | null) => {
      switch (status) {
        case 'finished':
          return (
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-green-900/30 border border-green-700 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Zakończone • {scoreTeam1 ?? 0}:{scoreTeam2 ?? 0}
            </div>
          );
        case 'cancelled':
          return (
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-red-900/30 border border-red-700 text-red-400">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              Anulowane
            </div>
          );
        case 'in_progress':
          return (
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-900/30 border border-orange-700 text-orange-400">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
              W trakcie
            </div>
          );
        default:
          return (
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-400">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Planowane
            </div>
          );
      }
    };
  
    const handleShare = async () => {
      const shareData = {
        title: event?.eventName || 'Wydarzenie sportowe',
        text: `Sprawdź to wydarzenie sportowe: ${event?.eventName}`,
        url: window.location.href,
      };
  
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log('Sharing cancelled');
        }
      } else {
        // Fallback - copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 3000);
        } catch (err) {
          console.error('Failed to copy to clipboard');
        }
      }
    };
  
    const handleJoinEvent = () => {
      // Mock handler - no API call yet
      console.log('Dołączanie do wydarzenia...');
    };
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="bg-black border border-gray-800 rounded-2xl p-6 mb-6">
                <div className="h-6 bg-gray-700 rounded-lg w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded-lg w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-1/3"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-black border border-gray-800 rounded-xl p-4">
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  
    if (error || !event) {
      return (
        <div className="min-h-screen bg-gray-900 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-900/20 border border-red-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-white mb-4">Błąd</h2>
              <p className="text-red-400 mb-6">{error || 'Nie udało się załadować wydarzenia'}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all"
              >
                Powrót do strony głównej
              </button>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        {/* Cancelled Event Banner */}
        {event.status === 'cancelled' && (
          <div className="bg-red-900/20 border-b border-red-700">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-center text-red-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                To wydarzenie zostało anulowane
              </div>
            </div>
          </div>
        )}
  
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Hero Section */}
              <div className="bg-black border border-gray-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-32 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <span className="inline-block bg-black/70 border border-gray-700 text-purple-400 rounded-lg px-3 py-1 text-sm font-medium mb-3">
                        {event.sportTypeName}
                      </span>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{event.eventName}</h1>
                    </div>
                    
                    <div className="lg:hidden w-full sm:w-48 h-36 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center mb-4 sm:mb-0 sm:ml-6">
                      <span className="text-gray-500 text-sm">Miniatura obiektu</span>
                    </div>
                  </div>
  
                  <div className="flex items-center text-gray-400 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{formatAddress(event.street, event.number, event.secondNumber, event.city)}</span>
                  </div>
  
                  <div className="flex items-center text-gray-400 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{dayjs(event.eventDate).format('dddd, DD.MM.YYYY • HH:mm')}</span>
                  </div>
  
                  <div className="mb-6">
                    {getStatusBadge(event.status, event.scoreTeam1, event.scoreTeam2)}
                  </div>
                </div>
              </div>
  
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Cena</div>
                  <div className="text-white text-lg font-semibold">{formatPrice(event.cost, event.currency)}</div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Liczba miejsc</div>
                  <div className="text-white text-lg font-semibold">{event.numberOfParticipants}</div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Poziom</div>
                  <div className="text-white text-lg font-semibold">{event.skillLevel}</div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Płatność</div>
                  <div className="text-white text-lg font-semibold">{event.paymentMethod}</div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Widoczność</div>
                  <div className="text-white text-lg font-semibold">{capitalizeFirst(event.eventVisibilityName)}</div>
                </div>
                
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Organizator</div>
                  <div className="text-white text-lg font-semibold">{event.ownerName}</div>
                </div>
              </div>
  
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={handleJoinEvent}
                  disabled={event.status === 'cancelled' || event.status === 'finished'}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-purple-800"
                >
                  {event.status === 'cancelled' ? 'Wydarzenie anulowane' : event.status === 'finished' ? 'Wydarzenie zakończone' : 'Zapisz się'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="sm:w-14 bg-black border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 py-4 px-4 rounded-xl transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="ml-2 sm:hidden">Udostępnij</span>
                </button>
              </div>
  
              {/* Organizer Section */}
              <div className="bg-black border border-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Organizator</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {event.ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{event.ownerName}</div>
                    <div className="text-gray-400 text-sm">Organizator wydarzenia</div>
                  </div>
                </div>
              </div>
  
              {/* Details Accordion */}
              <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowDetailsAccordion(!showDetailsAccordion)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-900/50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white">Zobacz szczegóły</h3>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showDetailsAccordion ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDetailsAccordion && (
                  <div className="px-6 pb-6 border-t border-gray-800">
                    <div className="pt-4">
                      <h4 className="text-white font-semibold mb-3">Opis wydarzenia</h4>
                      <p className="text-gray-400 leading-relaxed mb-4">
                        To jest placeholder dla opisu wydarzenia. Tutaj organizator może dodać szczegółowe informacje o wydarzeniu, 
                        zasadach, wymaganiach oraz innych ważnych detalach dla uczestników.
                      </p>
                      
                      <h4 className="text-white font-semibold mb-3">Obiekt sportowy</h4>
                      <div className="text-gray-400">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-white mr-2">Nazwa:</span>
                          {event.sportObjectName}
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-white mr-2">Pojemność:</span>
                          {event.capacity} osób
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-white mr-2">Adres:</span>
                          {formatAddress(event.street, event.number, event.secondNumber, event.city)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
  
            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-4">
              {/* Object thumbnail */}
              <div className="bg-black border border-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">{event.sportObjectName}</h3>
                <div className="w-full h-48 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center mb-4">
                  <span className="text-gray-500 text-sm">Zdjęcie obiektu</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="text-white font-medium">Pojemność:</span> {event.capacity} osób
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-white font-medium">Adres:</span><br />
                  {formatAddress(event.street, event.number, event.secondNumber, event.city)}
                </div>
              </div>
  
              {/* Invite players placeholder */}
              <div className="bg-black border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Zaproś graczy</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Podziel się wydarzeniem ze znajomymi i zwiększ szanse na udaną grę.
                </p>
                <button className="w-full bg-gray-800 border border-gray-700 text-gray-400 py-3 px-4 rounded-xl hover:bg-gray-700 hover:text-white transition-all">
                  Skopiuj link
                </button>
              </div>
            </div>
          </div>
  
          {/* Sticky Bottom Bar - Mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 p-4 lg:hidden">
            <div className="flex gap-3">
              <button
                onClick={handleJoinEvent}
                disabled={event.status === 'cancelled' || event.status === 'finished'}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {event.status === 'cancelled' ? 'Anulowane' : event.status === 'finished' ? 'Zakończone' : 'Zapisz się'}
              </button>
              <button
                onClick={handleShare}
                className="bg-gray-800 border border-gray-700 text-gray-400 hover:text-white py-3 px-4 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        {/* Share Toast */}
        {showShareToast && (
          <div className="fixed bottom-20 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80 bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-xl shadow-lg z-50">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Link skopiowany do schowka!
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default EventPage;