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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsAccordion, setShowDetailsAccordion] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [joined, setJoined] = useState(false);

  // Mock participants data
  const mockParticipants = [
    { id: 1, name: 'Anna Nowak', avatar: '👩', skillLevel: 'Średni' },
    { id: 2, name: 'Piotr Wiśniewski', avatar: '👨', skillLevel: 'Wysoki' },
    { id: 3, name: 'Katarzyna Kowalczyk', avatar: '👩', skillLevel: 'Niski' },
    { id: 4, name: 'Michał Zieliński', avatar: '👨', skillLevel: 'Średni' },
    { id: 5, name: 'Agnieszka Dąbrowska', avatar: '👩', skillLevel: 'Wysoki' },
  ];

  const [participants, setParticipants] = useState(mockParticipants);

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
    return `${street} ${addressNumber}, ${city}`;
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

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'niski': return 'bg-green-500/20 text-green-400';
      case 'średni': return 'bg-yellow-500/20 text-yellow-400';
      case 'wysoki': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
    if (joined) {
      setParticipants(prev => prev.filter(p => p.name !== 'Ty'));
      setJoined(false);
    } else {
      const newParticipant = {
        id: Date.now(),
        name: 'Ty',
        avatar: '👤',
        skillLevel: 'Średni'
      };
      setParticipants(prev => [...prev, newParticipant]);
      setJoined(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
          <p className="text-white mt-4">Ładowanie wydarzenia...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-4">Wydarzenie nie znalezione</h2>
          <p className="text-red-400 mb-6">{error || 'Nie udało się załadować wydarzenia'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all"
          >
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  const spotsLeft = event.numberOfParticipants - participants.length;
  const progressPercentage = (participants.length / event.numberOfParticipants) * 100;

  return (
    <div className="min-h-screen bg-gray-900">
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

      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,40,200,0.3),transparent_50%)]"></div>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Share Button */}
        <button 
          onClick={() => setShowShareModal(true)}
          className="absolute top-6 right-6 z-10 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-purple-500/30 backdrop-blur-sm text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-500/50">
                  {event.sportTypeName}
                </span>
                {getStatusBadge(event.status, event.scoreTeam1, event.scoreTeam2)}
                <span className={`px-3 py-1 rounded-full text-sm ${getSkillLevelColor(event.skillLevel)}`}>
                  Poziom: {event.skillLevel}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.eventName}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{dayjs(event.eventDate).format('dddd, DD.MM.YYYY • HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.sportObjectName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>{formatPrice(event.cost, event.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Progress */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Zapełnienie wydarzenia</h3>
                <span className="text-purple-400 font-bold">{participants.length}/{event.numberOfParticipants}</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Wolne miejsca: {Math.max(0, spotsLeft)}</span>
                <span>{progressPercentage.toFixed(0)}% zapełnione</span>
              </div>

              {spotsLeft <= 3 && spotsLeft > 0 && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">Tylko {spotsLeft} {spotsLeft === 1 ? 'miejsce' : 'miejsca'} pozostało!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Uczestnicy ({participants.length})</h3>
                <button 
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2"
                >
                  {showParticipants ? 'Ukryj' : 'Zobacz wszystkich'}
                  <svg className={`w-4 h-4 transition-transform ${showParticipants ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {participants.slice(0, showParticipants ? participants.length : 8).map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 hover:bg-gray-700 transition group"
                  >
                    <span className="text-2xl">{participant.avatar}</span>
                    <div className="text-sm">
                      <div className="text-white font-medium">{participant.name}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${getSkillLevelColor(participant.skillLevel)}`}>
                        {participant.skillLevel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!showParticipants && participants.length > 8 && (
                <div className="text-center">
                  <span className="text-gray-400 text-sm">i {participants.length - 8} więcej...</span>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Cena</div>
                <div className="text-white text-lg font-semibold">{formatPrice(event.cost, event.currency)}</div>
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
                <div className="text-gray-400 text-sm mb-1">Pojemność obiektu</div>
                <div className="text-white text-lg font-semibold">{event.capacity} osób</div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Lokalizacja</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H7m14 0V4a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                  </svg>
                  <span className="text-white font-medium">{event.sportObjectName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300">{formatAddress(event.street, event.number, event.secondNumber, event.city)}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894l5-1.25a2 2 0 01.894 0l5 1.25A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.894L15 20M9 20V10M9 20l6-2.727M15 10V20" />
                </svg>
                Pokaż na mapie
              </button>
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Button */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 sticky top-4">
              {event.status === 'planned' && spotsLeft > 0 ? (
                <button
                  onClick={handleJoinEvent}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    joined 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg shadow-purple-900/30'
                  }`}
                >
                  {joined ? 'Opuść wydarzenie' : 'Dołącz do wydarzenia'}
                </button>
              ) : spotsLeft <= 0 ? (
                <button disabled className="w-full py-4 rounded-xl font-bold text-lg bg-gray-600 text-gray-400 cursor-not-allowed">
                  Brak wolnych miejsc
                </button>
              ) : (
                <button disabled className="w-full py-4 rounded-xl font-bold text-lg bg-gray-600 text-gray-400 cursor-not-allowed">
                  Wydarzenie niedostępne
                </button>
              )}
            </div>

            {/* Organizer */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Organizator</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {event.ownerName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{event.ownerName}</div>
                  <div className="text-gray-400 text-sm">Organizator</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm">
                  Wyślij wiadomość
                </button>
                <button className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 py-2 rounded-lg transition text-sm">
                  Zobacz profil
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Akcje</h3>
              <div className="space-y-3">
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Zapisz wydarzenie
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dodaj do kalendarza
                </button>
                <button className="w-full text-red-400 hover:text-red-300 py-3 transition flex items-center justify-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Zgłoś wydarzenie
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Udostępnij wydarzenie</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="bg-transparent text-white flex-1 outline-none"
                />
                <button 
                  onClick={handleShare}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                >
                  Facebook
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.eventName)}`, '_blank')}
                  className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg transition"
                >
                  Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 shadow-lg flex items-center gap-2 z-50">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Link skopiowany do schowka!
        </div>
      )}
    </div>
  );
};

export default EventPage;