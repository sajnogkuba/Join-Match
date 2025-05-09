# Join-Match 🎮

Aplikacja inżynierska służąca do tworzenia i dołączania do meczów. Projekt składa się z trzech głównych komponentów:

- 🧠 Backend: Java + Spring Boot
- 💻 Frontend: React + Vite + TypeScript
- 🐘 Baza danych: PostgreSQL
- 🐳 Konteneryzacja: Docker + Docker Compose

---

## 🚀 Jak uruchomić lokalnie?

### ✅ Wymagania

- Node.js (v18+)
- Docker + Docker Compose
- Git
- Java 17+ (jeśli uruchamiasz backend lokalnie z DevTools)

---

### 📦 Klonowanie repozytorium

```bash
git clone https://github.com/sajnogkuba/Join-Match.git
cd join-match
```

---
### ⚙️ Konfiguracja ```.env```
```bash
POSTGRES_DB=joinmatchdb
POSTGRES_USER=joinuser
POSTGRES_PASSWORD=joinpass
```
---
### 🐳 Uruchomienie wszystkich serwisów
```bash
docker-compose up --build
```
Serwisy uruchamiają się na:
* Frontend: http://localhost:3000
* Backend API: http://localhost:8080/api/test (testowy endpoint)
* Baza danych PostgreSQL: localhost:5432 (login i hasło z .env)
---
### 📁 Struktura repozytorium
```bash
.
├── backend/              # Spring Boot backend
├── frontend/             # React + Vite frontend
├── db/                   # Skrypty inicjalizujące bazę (opcjonalnie)
├── docker-compose.yml    # Konteneryzacja całego środowiska
├── .env                  # Zmienne środowiskowe
└── README.md             # To, co właśnie czytasz
```
