import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    // Ogólne pytania
    {
      id: '1',
      question: 'Czym jest JoinMatch?',
      answer: 'JoinMatch to platforma, która ułatwia organizację amatorskich wydarzeń sportowych. Dzięki intuicyjnemu systemowi możesz łatwo tworzyć wydarzenia, zarządzać harmonogramem i komunikować się z uczestnikami.',
      category: 'general'
    },
    {
      id: '2',
      question: 'Czy korzystanie z platformy jest bezpłatne?',
      answer: 'Tak, podstawowe funkcje JoinMatch są całkowicie bezpłatne. Możesz tworzyć wydarzenia, dołączać do nich i zarządzać swoim profilem bez żadnych opłat. Niektóre funkcje premium mogą być dostępne za dodatkową opłatą w przyszłości.',
      category: 'general'
    },
    {
      id: '3',
      question: 'Jak mogę się zarejestrować?',
      answer: 'Rejestracja jest bardzo prosta! Kliknij przycisk "Zarejestruj się" w prawym górnym rogu strony, wypełnij formularz z podstawowymi danymi i potwierdź swój adres email. Możesz też zalogować się przez Google.',
      category: 'general'
    },

    // Wydarzenia
    {
      id: '4',
      question: 'Jak mogę utworzyć wydarzenie sportowe?',
      answer: 'Aby utworzyć wydarzenie, zaloguj się na swoje konto i kliknij "Stwórz wydarzenie". Wypełnij formularz z informacjami o wydarzeniu: nazwa, data, miejsce, opis, maksymalna liczba uczestników. Po utworzeniu wydarzenie będzie widoczne dla innych użytkowników.',
      category: 'events'
    },
    {
      id: '5',
      question: 'Jak mogę dołączyć do wydarzenia?',
      answer: 'Znajdź interesujące Cię wydarzenie na stronie głównej lub w sekcji "Wydarzenia". Kliknij na wydarzenie, aby zobaczyć szczegóły, a następnie kliknij przycisk "Dołącz". Organizator zostanie powiadomiony o Twoim uczestnictwie.',
      category: 'events'
    },
    {
      id: '6',
      question: 'Czy mogę anulować uczestnictwo w wydarzeniu?',
      answer: 'Tak, możesz anulować swoje uczestnictwo w wydarzeniu. Przejdź do sekcji "Moje wydarzenia" w swoim profilu, znajdź wydarzenie i kliknij "Anuluj uczestnictwo". Organizator zostanie powiadomiony o zmianie.',
      category: 'events'
    },
    {
      id: '7',
      question: 'Jakie rodzaje wydarzeń sportowych mogę organizować?',
      answer: 'JoinMatch obsługuje wszystkie rodzaje amatorskich wydarzeń sportowych: piłka nożna, koszykówka, siatkówka, tenis, biegi, pływanie, jazda na rowerze, siłownia, jogging i wiele innych. Platforma jest elastyczna i dostosowuje się do Twoich potrzeb.',
      category: 'events'
    },

    // Konto i profil
    {
      id: '8',
      question: 'Jak mogę edytować swój profil?',
      answer: 'Przejdź do swojego profilu klikając na swoje imię w prawym górnym rogu, a następnie wybierz "Profil". Możesz tam edytować swoje dane osobowe, zdjęcie profilowe, preferencje sportowe i inne informacje.',
      category: 'profile'
    },
    {
      id: '9',
      question: 'Czy mogę zmienić hasło?',
      answer: 'Tak, możesz zmienić hasło w sekcji "Ustawienia konta" w swoim profilu. Jeśli zapomniałeś hasła, użyj opcji "Zapomniałem hasła" na stronie logowania.',
      category: 'profile'
    },
    {
      id: '10',
      question: 'Jak mogę usunąć swoje konto?',
      answer: 'Aby usunąć konto, skontaktuj się z naszym zespołem wsparcia przez formularz kontaktowy. Usuniemy Twoje konto i wszystkie powiązane dane zgodnie z naszą polityką prywatności.',
      category: 'profile'
    },

    // Techniczne
    {
      id: '11',
      question: 'Czy aplikacja działa na telefonach?',
      answer: 'Tak! JoinMatch jest w pełni responsywna i działa na wszystkich urządzeniach - komputerach, tabletach i telefonach. Możesz korzystać z platformy przez przeglądarkę internetową na dowolnym urządzeniu.',
      category: 'technical'
    },
    {
      id: '12',
      question: 'Jakie przeglądarki są obsługiwane?',
      answer: 'JoinMatch działa na wszystkich nowoczesnych przeglądarkach: Chrome, Firefox, Safari, Edge. Zalecamy używanie najnowszej wersji przeglądarki dla najlepszego doświadczenia.',
      category: 'technical'
    },
    {
      id: '13',
      question: 'Co robić, gdy strona nie działa poprawnie?',
      answer: 'Jeśli napotkasz problemy techniczne, spróbuj odświeżyć stronę, wyczyścić cache przeglądarki lub spróbować innej przeglądarki. Jeśli problem się utrzymuje, skontaktuj się z naszym wsparciem technicznym.',
      category: 'technical'
    },

    // Bezpieczeństwo i prywatność
    {
      id: '14',
      question: 'Czy moje dane są bezpieczne?',
      answer: 'Tak, bezpieczeństwo Twoich danych jest dla nas priorytetem. Używamy szyfrowania SSL, regularnie aktualizujemy nasze systemy bezpieczeństwa i przestrzegamy wszystkich obowiązujących przepisów o ochronie danych osobowych (RODO).',
      category: 'security'
    },
    {
      id: '15',
      question: 'Kto może zobaczyć moje dane osobowe?',
      answer: 'Twoje dane osobowe są widoczne tylko dla Ciebie i innych użytkowników, którzy uczestniczą w tych samych wydarzeniach co Ty. Organizatorzy wydarzeń widzą podstawowe informacje uczestników. Możesz kontrolować swoją prywatność w ustawieniach profilu.',
      category: 'security'
    },

    // Płatności i rozliczenia
    {
      id: '16',
      question: 'Czy mogę organizować płatne wydarzenia?',
      answer: 'Obecnie wszystkie wydarzenia na platformie są bezpłatne. Funkcja płatnych wydarzeń jest w planach rozwoju. Jeśli chcesz organizować płatne wydarzenia, skontaktuj się z nami.',
      category: 'payments'
    },
    {
      id: '17',
      question: 'Jak działają rankingi użytkowników?',
      answer: 'Rankingi są oparte na aktywności użytkowników: liczbie zorganizowanych wydarzeń, uczestnictwie w wydarzeniach, ocenach od innych użytkowników i innych czynnikach aktywności na platformie.',
      category: 'payments'
    }
  ];

  const categories = [
    { id: 'all', name: 'Wszystkie pytania' },
    { id: 'general', name: 'Ogólne' },
    { id: 'events', name: 'Wydarzenia' },
    { id: 'profile', name: 'Konto i profil' },
    { id: 'technical', name: 'Techniczne' },
    { id: 'security', name: 'Bezpieczeństwo' },
    { id: 'payments', name: 'Płatności i rankingi' }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Najczęściej zadawane pytania
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Znajdź odpowiedzi na najczęstsze pytania dotyczące platformy JoinMatch. 
            Jeśli nie znajdziesz odpowiedzi na swoje pytanie, skontaktuj się z nami!
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`h-5 w-5 text-purple-300 transition-transform ${
                      openItems.includes(faq.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Nie znalazłeś odpowiedzi?
            </h2>
            <p className="text-gray-300 mb-6">
              Jeśli masz inne pytania lub potrzebujesz pomocy, skontaktuj się z naszym zespołem wsparcia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/kontakt"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Skontaktuj się z nami
              </a>
              <a
                href="mailto:pomoc@joinmatch.pl"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Wyślij email
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-purple-600 p-6 rounded-xl mb-4">
              <svg className="h-12 w-12 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">17 pytań</h3>
            <p className="text-gray-300">Najczęściej zadawane pytania</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600 p-6 rounded-xl mb-4">
              <svg className="h-12 w-12 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">24h</h3>
            <p className="text-gray-300">Czas odpowiedzi na email</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600 p-6 rounded-xl mb-4">
              <svg className="h-12 w-12 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">7 dni</h3>
            <p className="text-gray-300">Wsparcie techniczne</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
