import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Polityka Prywatności
          </h1>
          <p className="text-xl text-gray-300">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
          <div className="prose prose-invert max-w-none">
            
            {/* Wprowadzenie */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">1. Wprowadzenie</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Niniejsza Polityka Prywatności opisuje, w jaki sposób JoinMatch („my", „nas", „nasza") 
                zbiera, wykorzystuje i chroni Twoje dane osobowe podczas korzystania z naszej platformy 
                internetowej i aplikacji mobilnej („Serwis").
              </p>
              <p className="text-gray-300 leading-relaxed">
                Administratorem Twoich danych osobowych jest JoinMatch z siedzibą w Warszawie, 
                ul. Sportowa 123, 00-001 Warszawa, Polska. Kontakt: kontakt@joinmatch.pl
              </p>
            </section>

            {/* Rodzaje danych */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">2. Jakie dane zbieramy</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dane osobowe:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Imię i nazwisko</li>
                    <li>Adres e-mail</li>
                    <li>Numer telefonu (opcjonalnie)</li>
                    <li>Data urodzenia (opcjonalnie)</li>
                    <li>Zdjęcie profilowe</li>
                    <li>Preferencje sportowe</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dane techniczne:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Adres IP</li>
                    <li>Typ przeglądarki i wersja</li>
                    <li>System operacyjny</li>
                    <li>Data i czas wizyty</li>
                    <li>Strony odwiedzone w naszym Serwisie</li>
                    <li>Źródło ruchu</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dane dotyczące aktywności:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Utworzone wydarzenia sportowe</li>
                    <li>Uczestnictwo w wydarzeniach</li>
                    <li>Oceny i komentarze</li>
                    <li>Komunikacja z innymi użytkownikami</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Podstawa prawna */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">3. Podstawa prawna przetwarzania</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Wykonanie umowy (art. 6 ust. 1 lit. b RODO)</h3>
                  <p className="text-gray-300">
                    Przetwarzamy Twoje dane osobowe w celu świadczenia usług platformy JoinMatch, 
                    w tym tworzenia konta, organizacji wydarzeń sportowych i komunikacji z innymi użytkownikami.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)</h3>
                  <p className="text-gray-300">
                    Przetwarzamy dane w celu zapewnienia bezpieczeństwa Serwisu, zapobiegania nadużyciom, 
                    analizy ruchu i poprawy funkcjonalności platformy.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Zgoda (art. 6 ust. 1 lit. a RODO)</h3>
                  <p className="text-gray-300">
                    Przetwarzamy dane na podstawie Twojej dobrowolnej zgody, np. w przypadku 
                    otrzymywania newslettera lub komunikacji marketingowej.
                  </p>
                </div>
              </div>
            </section>

            {/* Cele przetwarzania */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">4. Cele przetwarzania danych</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Świadczenie usług</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Tworzenie i zarządzanie kontem</li>
                    <li>• Organizacja wydarzeń sportowych</li>
                    <li>• Komunikacja między użytkownikami</li>
                    <li>• System ocen i komentarzy</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Bezpieczeństwo</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Zapobieganie nadużyciom</li>
                    <li>• Weryfikacja tożsamości</li>
                    <li>• Monitoring bezpieczeństwa</li>
                    <li>• Ochrona przed spamem</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Analiza i rozwój</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Analiza ruchu na stronie</li>
                    <li>• Poprawa funkcjonalności</li>
                    <li>• Personalizacja treści</li>
                    <li>• Badania użytkowników</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Komunikacja</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Powiadomienia o wydarzeniach</li>
                    <li>• Newsletter (za zgodą)</li>
                    <li>• Wsparcie techniczne</li>
                    <li>• Komunikaty systemowe</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">5. Polityka Cookies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Co to są cookies?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Cookies to małe pliki tekstowe przechowywane na Twoim urządzeniu, które pomagają nam 
                    poprawić funkcjonalność naszej platformy i lepiej zrozumieć, jak korzystasz z naszego Serwisu.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Rodzaje cookies używanych przez JoinMatch:</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-300 mb-2">Cookies niezbędne</h4>
                      <p className="text-gray-300 text-sm">
                        Umożliwiają podstawowe funkcjonowanie platformy, takie jak logowanie, 
                        zachowanie sesji użytkownika i bezpieczeństwo. Nie można ich wyłączyć.
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-300 mb-2">Cookies funkcjonalne</h4>
                      <p className="text-gray-300 text-sm">
                        Zapamiętują Twoje preferencje (język, region, ustawienia) i personalizują 
                        doświadczenie użytkownika na platformie.
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-300 mb-2">Cookies analityczne</h4>
                      <p className="text-gray-300 text-sm">
                        Pomagają nam zrozumieć, jak użytkownicy korzystają z platformy, 
                        które strony są najczęściej odwiedzane i jak możemy poprawić funkcjonalność.
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-300 mb-2">Cookies marketingowe</h4>
                      <p className="text-gray-300 text-sm">
                        Używane do wyświetlania spersonalizowanych reklam i śledzenia skuteczności 
                        kampanii marketingowych. Używane tylko za Twoją zgodą.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Zarządzanie cookies</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Możesz kontrolować i usuwać cookies poprzez ustawienia swojej przeglądarki. 
                    Pamiętaj jednak, że wyłączenie niektórych cookies może wpłynąć na funkcjonalność platformy.
                  </p>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-2">Instrukcje dla popularnych przeglądarek:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Chrome:</strong> Ustawienia → Prywatność i bezpieczeństwo → Cookies</li>
                      <li>• <strong>Firefox:</strong> Opcje → Prywatność i bezpieczeństwo → Cookies</li>
                      <li>• <strong>Safari:</strong> Preferencje → Prywatność → Cookies</li>
                      <li>• <strong>Edge:</strong> Ustawienia → Prywatność → Cookies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Udostępnianie danych */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">6. Udostępnianie danych osobowych</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Twoje dane osobowe mogą być udostępniane następującym kategoriom odbiorców:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Inni użytkownicy platformy</h3>
                  <p className="text-gray-300 text-sm">
                    Podstawowe informacje (imię, zdjęcie profilowe) są widoczne dla uczestników 
                    tych samych wydarzeń sportowych.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Dostawcy usług technicznych</h3>
                  <p className="text-gray-300 text-sm">
                    Zaufani partnerzy techniczni, którzy pomagają nam w świadczeniu usług 
                    (hosting, analityka, komunikacja).
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Organy publiczne</h3>
                  <p className="text-gray-300 text-sm">
                    W przypadkach wymaganych prawem lub w celu ochrony naszych praw i bezpieczeństwa.
                  </p>
                </div>
              </div>
            </section>

            {/* Prawa użytkownika */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">7. Twoje prawa</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Zgodnie z RODO masz następujące prawa dotyczące swoich danych osobowych:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo dostępu</h3>
                  <p className="text-gray-300 text-sm">
                    Możesz żądać informacji o tym, jakie dane osobowe przetwarzamy.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo do sprostowania</h3>
                  <p className="text-gray-300 text-sm">
                    Możesz żądać poprawienia nieprawidłowych lub uzupełnienia niekompletnych danych.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo do usunięcia</h3>
                  <p className="text-gray-300 text-sm">
                    Możesz żądać usunięcia swoich danych w określonych przypadkach.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo do ograniczenia</h3>
                  <p className="text-gray-300 text-sm">
                    Możesz żądać ograniczenia przetwarzania swoich danych.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo do przenoszenia</h3>
                  <p className="text-gray-300 text-sm">
                    Możesz żądać przekazania swoich danych w formacie strukturalnym.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo do sprzeciwu</h3>
                  <p className="text-gray-300 text-sm">
                    Możesz sprzeciwić się przetwarzaniu danych w określonych przypadkach.
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-purple-900 p-4 rounded-lg">
                <p className="text-white text-sm">
                  <strong>Aby skorzystać z swoich praw, skontaktuj się z nami:</strong><br/>
                  Email: kontakt@joinmatch.pl<br/>
                  Adres: ul. Sportowa 123, 00-001 Warszawa
                </p>
              </div>
            </section>

            {/* Bezpieczeństwo */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">8. Bezpieczeństwo danych</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych osobowych:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Szyfrowanie SSL/TLS dla wszystkich transmisji danych</li>
                  <li>Regularne aktualizacje systemów bezpieczeństwa</li>
                  <li>Ograniczony dostęp do danych tylko dla upoważnionych osób</li>
                  <li>Regularne kopie zapasowe danych</li>
                  <li>Monitoring bezpieczeństwa 24/7</li>
                  <li>Szkolenia personelu w zakresie ochrony danych</li>
                </ul>
              </div>
            </section>

            {/* Przechowywanie */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">9. Okres przechowywania danych</h2>
              <div className="space-y-3">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Dane konta użytkownika</h3>
                  <p className="text-gray-300 text-sm">
                    Przechowywane do momentu usunięcia konta lub wycofania zgody na przetwarzanie.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Dane wydarzeń</h3>
                  <p className="text-gray-300 text-sm">
                    Przechowywane przez 3 lata po zakończeniu wydarzenia dla celów archiwalnych.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Dane techniczne (logi)</h3>
                  <p className="text-gray-300 text-sm">
                    Przechowywane przez 12 miesięcy dla celów bezpieczeństwa i analizy.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Cookies</h3>
                  <p className="text-gray-300 text-sm">
                    Sesyjne cookies są usuwane po zamknięciu przeglądarki, stałe cookies mogą być 
                    przechowywane do 2 lat.
                  </p>
                </div>
              </div>
            </section>

            {/* Zmiany */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">10. Zmiany w Polityce Prywatności</h2>
              <p className="text-gray-300 leading-relaxed">
                Możemy aktualizować niniejszą Politykę Prywatności w celu odzwierciedlenia zmian 
                w naszych praktykach lub z innych powodów operacyjnych, prawnych lub regulacyjnych. 
                O wszelkich istotnych zmianach poinformujemy Cię poprzez powiadomienie na platformie 
                lub drogą e-mailową.
              </p>
            </section>

            {/* Kontakt */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">11. Kontakt</h2>
              <div className="bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Jeśli masz pytania dotyczące niniejszej Polityki Prywatności lub chcesz skorzystać 
                  ze swoich praw, skontaktuj się z nami:
                </p>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Email:</strong> kontakt@joinmatch.pl</p>
                  <p><strong>Adres:</strong> ul. Sportowa 123, 00-001 Warszawa, Polska</p>
                  <p><strong>Telefon:</strong> +48 123 456 789</p>
                  <p><strong>Inspektor Ochrony Danych:</strong> iod@joinmatch.pl</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-600 pt-6 mt-8">
              <p className="text-gray-400 text-sm text-center">
                Niniejsza Polityka Prywatności jest zgodna z Rozporządzeniem RODO (UE) 2016/679 
                oraz polskim prawem o ochronie danych osobowych.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
