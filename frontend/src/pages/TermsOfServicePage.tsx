import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Regulamin
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
              <h2 className="text-2xl font-bold text-purple-300 mb-4">1. Postanowienia ogólne</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Niniejszy Regulamin określa zasady korzystania z platformy internetowej JoinMatch 
                  („Platforma") oraz świadczonych przez nią usług. Platforma umożliwia organizację 
                  i uczestnictwo w amatorskich wydarzeniach sportowych.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Administratorem Platformy jest JoinMatch z siedzibą w Warszawie, ul. Sportowa 123, 
                  00-001 Warszawa, Polska. Kontakt: kontakt@joinmatch.pl
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong>Definicje:</strong><br/>
                    • <strong>Platforma</strong> - serwis internetowy JoinMatch dostępny pod adresem joinmatch.pl<br/>
                    • <strong>Użytkownik</strong> - osoba fizyczna korzystająca z Platformy<br/>
                    • <strong>Wydarzenie</strong> - amatorskie wydarzenie sportowe organizowane przez Użytkownika<br/>
                    • <strong>Organizator</strong> - Użytkownik tworzący i zarządzający Wydarzeniem<br/>
                    • <strong>Uczestnik</strong> - Użytkownik biorący udział w Wydarzeniu
                  </p>
                </div>
              </div>
            </section>

            {/* Akceptacja regulaminu */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">2. Akceptacja Regulaminu</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Korzystanie z Platformy jest równoznaczne z akceptacją niniejszego Regulaminu. 
                  Jeśli nie akceptujesz postanowień Regulaminu, nie możesz korzystać z Platformy.
                </p>
                <div className="bg-purple-900 p-4 rounded-lg">
                  <p className="text-white text-sm">
                    <strong>Wymagania wiekowe:</strong> Platforma jest przeznaczona dla osób, 
                    które ukończyły 16 lat. Osoby niepełnoletnie mogą korzystać z Platformy 
                    wyłącznie za zgodą rodziców lub opiekunów prawnych.
                  </p>
                </div>
              </div>
            </section>

            {/* Rejestracja i konto */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">3. Rejestracja i konto użytkownika</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Proces rejestracji:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Podanie prawdziwych danych osobowych</li>
                    <li>Potwierdzenie adresu e-mail</li>
                    <li>Akceptacja Regulaminu i Polityki Prywatności</li>
                    <li>Utworzenie bezpiecznego hasła</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Obowiązki użytkownika:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Zachowanie poufności danych logowania</li>
                    <li>Natychmiastowe powiadomienie o nieuprawnionym dostępie</li>
                    <li>Aktualizacja danych w przypadku ich zmiany</li>
                    <li>Nieudostępnianie konta osobom trzecim</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Zakazane działania:</h3>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                    <li>Tworzenie fałszywych kont</li>
                    <li>Używanie danych innych osób</li>
                    <li>Próby obejścia zabezpieczeń Platformy</li>
                    <li>Automatyzacja procesów bez zgody Administratora</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Organizacja wydarzeń */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">4. Organizacja wydarzeń sportowych</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prawa organizatora:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Tworzenie i zarządzanie wydarzeniami sportowymi</li>
                    <li>Ustalanie zasad uczestnictwa i wymagań</li>
                    <li>Akceptowanie lub odrzucanie zgłoszeń uczestników</li>
                    <li>Anulowanie wydarzenia w uzasadnionych przypadkach</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Obowiązki organizatora:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Podanie prawdziwych informacji o wydarzeniu</li>
                    <li>Zapewnienie bezpieczeństwa uczestników</li>
                    <li>Przestrzeganie przepisów prawa i zasad fair play</li>
                    <li>Informowanie o zmianach w wydarzeniu</li>
                    <li>Poszanowanie praw uczestników</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Zakazane treści wydarzeń:</h3>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                    <li>Wydarzenia promujące przemoc, nienawiść lub dyskryminację</li>
                    <li>Aktywności nielegalne lub niebezpieczne</li>
                    <li>Wydarzenia komercyjne bez odpowiednich pozwoleń</li>
                    <li>Treści naruszające prawa autorskie</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Uczestnictwo w wydarzeniach */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">5. Uczestnictwo w wydarzeniach</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prawa uczestnika:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Dostęp do informacji o wydarzeniu</li>
                    <li>Możliwość rezygnacji z uczestnictwa</li>
                    <li>Ocena organizatora po wydarzeniu</li>
                    <li>Zgłaszanie nieprawidłowości</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Obowiązki uczestnika:</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Przestrzeganie zasad wydarzenia</li>
                    <li>Punktualne przybycie na wydarzenie</li>
                    <li>Poszanowanie innych uczestników</li>
                    <li>Informowanie o rezygnacji w odpowiednim czasie</li>
                    <li>Przestrzeganie zasad fair play</li>
                  </ul>
                </div>
                <div className="bg-purple-900 p-4 rounded-lg">
                  <p className="text-white text-sm">
                    <strong>Odpowiedzialność za bezpieczeństwo:</strong> Uczestnicy biorą udział 
                    w wydarzeniach na własną odpowiedzialność. Organizatorzy powinni zapewnić 
                    odpowiednie warunki bezpieczeństwa, ale uczestnicy powinni ocenić swoje 
                    możliwości fizyczne przed udziałem.
                  </p>
                </div>
              </div>
            </section>

            {/* Zasady użytkowania */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">6. Zasady użytkowania Platformy</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Dozwolone działania</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Tworzenie wydarzeń sportowych</li>
                      <li>• Uczestnictwo w wydarzeniach</li>
                      <li>• Komunikacja z innymi użytkownikami</li>
                      <li>• Ocena wydarzeń i organizatorów</li>
                      <li>• Udostępnianie treści sportowych</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Zakazane działania</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Spam i niechciane wiadomości</li>
                      <li>• Naruszanie prywatności innych</li>
                      <li>• Publikowanie treści nielegalnych</li>
                      <li>• Próby włamania do systemu</li>
                      <li>• Naruszanie praw autorskich</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Moderacja treści</h3>
                  <p className="text-gray-300 text-sm">
                    Administrator zastrzega sobie prawo do moderacji treści publikowanych na Platformie. 
                    Treści naruszające Regulamin mogą być usunięte bez uprzedzenia. Użytkownicy mogą 
                    zgłaszać nieprawidłowe treści poprzez formularz kontaktowy.
                  </p>
                </div>
              </div>
            </section>

            {/* Odpowiedzialność */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">7. Odpowiedzialność</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Ograniczenie odpowiedzialności Administratora</h3>
                  <p className="text-gray-300 text-sm">
                    Administrator nie ponosi odpowiedzialności za szkody wynikające z uczestnictwa 
                    w wydarzeniach sportowych, w tym kontuzje, wypadki lub inne zdarzenia losowe. 
                    Platforma służy wyłącznie jako narzędzie komunikacji i organizacji.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Odpowiedzialność użytkowników</h3>
                  <p className="text-gray-300 text-sm">
                    Użytkownicy ponoszą pełną odpowiedzialność za swoje działania na Platformie, 
                    w tym za treści publikowane, organizowane wydarzenia i interakcje z innymi użytkownikami.
                  </p>
                </div>
                <div className="bg-purple-900 p-4 rounded-lg">
                  <p className="text-white text-sm">
                    <strong>Ważne:</strong> Uczestnictwo w wydarzeniach sportowych wiąże się z ryzykiem. 
                    Użytkownicy powinni upewnić się, że są w odpowiedniej kondycji fizycznej 
                    i posiadają odpowiednie ubezpieczenie.
                  </p>
                </div>
              </div>
            </section>

            {/* Własność intelektualna */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">8. Własność intelektualna</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prawa do Platformy</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Wszystkie prawa do Platformy, w tym kod źródłowy, design, logo i treści, 
                    należą do Administratora i są chronione prawem autorskim.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Treści użytkowników</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Użytkownicy zachowują prawa do treści przez siebie publikowanych, ale udzielają 
                    Administratorowi licencji na ich wykorzystanie w ramach funkcjonowania Platformy.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Zakazane działania</h3>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                    <li>Kopiowanie lub reprodukowanie elementów Platformy</li>
                    <li>Tworzenie konkurencyjnych serwisów na podstawie Platformy</li>
                    <li>Naruszenie znaków towarowych lub praw autorskich</li>
                    <li>Reverse engineering kodu źródłowego</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prywatność i dane */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">9. Prywatność i ochrona danych</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Zasady przetwarzania danych osobowych określa Polityka Prywatności, 
                  która stanowi integralną część niniejszego Regulaminu.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Zasady udostępniania danych</h3>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                    <li>Podstawowe dane są widoczne dla uczestników wydarzeń</li>
                    <li>Organizatorzy widzą dane uczestników swoich wydarzeń</li>
                    <li>Administrator ma dostęp do danych w celach technicznych</li>
                    <li>Dane mogą być udostępnione organom publicznym na żądanie</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Zawieszenie i usunięcie konta */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">10. Zawieszenie i usunięcie konta</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Zawieszenie konta</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Administrator może zawiesić konto użytkownika w przypadku naruszenia Regulaminu. 
                    Zawieszenie może być czasowe lub stałe w zależności od rodzaju naruszenia.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Przyczyny zawieszenia</h3>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Naruszenie postanowień Regulaminu</li>
                    <li>Publikowanie nielegalnych treści</li>
                    <li>Spam lub nadużycia</li>
                    <li>Naruszenie praw innych użytkowników</li>
                    <li>Próby włamania lub sabotażu</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Procedura odwoławcza</h3>
                  <p className="text-gray-300 text-sm">
                    Użytkownicy mogą odwołać się od decyzji o zawieszeniu konta, kontaktując się 
                    z Administratorem. Każdy przypadek jest rozpatrywany indywidualnie.
                  </p>
                </div>
              </div>
            </section>

            {/* Zmiany regulaminu */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">11. Zmiany Regulaminu</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Administrator zastrzega sobie prawo do zmiany niniejszego Regulaminu. 
                  O istotnych zmianach użytkownicy zostaną powiadomieni poprzez:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-1">
                  <li>Powiadomienie na Platformie</li>
                  <li>Wiadomość e-mail</li>
                  <li>Komunikat na stronie głównej</li>
                </ul>
                <div className="bg-purple-900 p-4 rounded-lg">
                  <p className="text-white text-sm">
                    <strong>Kontynuacja korzystania:</strong> Kontynuowanie korzystania z Platformy 
                    po wprowadzeniu zmian jest równoznaczne z akceptacją nowego Regulaminu.
                  </p>
                </div>
              </div>
            </section>

            {/* Prawo właściwe */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">12. Prawo właściwe i rozstrzyganie sporów</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Prawo właściwe</h3>
                  <p className="text-gray-300 text-sm">
                    Niniejszy Regulamin podlega prawu polskiemu. Wszelkie spory będą rozstrzygane 
                    przez sądy właściwe dla siedziby Administratora.
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Rozstrzyganie sporów</h3>
                  <p className="text-gray-300 text-sm">
                    W pierwszej kolejności Administrator dąży do polubownego rozwiązania sporów. 
                    W przypadku braku porozumienia, spory rozstrzygane są przez sądy powszechne.
                  </p>
                </div>
              </div>
            </section>

            {/* Kontakt */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">13. Kontakt</h2>
              <div className="bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-300 leading-relaxed mb-4">
                  W przypadku pytań dotyczących niniejszego Regulaminu lub innych spraw związanych 
                  z Platformą, skontaktuj się z nami:
                </p>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Email:</strong> kontakt@joinmatch.pl</p>
                  <p><strong>Adres:</strong> ul. Sportowa 123, 00-001 Warszawa, Polska</p>
                  <p><strong>Telefon:</strong> +48 123 456 789</p>
                  <p><strong>Formularz kontaktowy:</strong> dostępny na stronie /kontakt</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-600 pt-6 mt-8">
              <p className="text-gray-400 text-sm text-center">
                Niniejszy Regulamin wchodzi w życie z dniem publikacji i obowiązuje wszystkich 
                użytkowników Platformy JoinMatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
