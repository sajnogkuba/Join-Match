// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';

const EventsPage = () => <div className="container mx-auto px-4 py-20 mt-20">Strona wydarzeń</div>;
const RankingsPage = () => <div className="container mx-auto px-4 py-20 mt-20">Strona rankingów</div>;
const EventDetailsPage = () => <div className="container mx-auto px-4 py-20 mt-20">Szczegóły wydarzenia</div>;
const AboutPage = () => <div className="container mx-auto px-4 py-20 mt-20">O nas</div>;
const LoginPage = () => <div className="container mx-auto px-4 py-20 mt-20">Logowanie</div>;
const RegisterPage = () => <div className="container mx-auto px-4 py-20 mt-20">Rejestracja</div>;
const ContactPage = () => <div className="container mx-auto px-4 py-20 mt-20">Kontakt</div>;
const FAQPage = () => <div className="container mx-auto px-4 py-20 mt-20">FAQ</div>;
const NotFoundPage = () => <div className="container mx-auto px-4 py-20 mt-20">Strona nie znaleziona</div>;

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="wydarzenia" element={<EventsPage />} />
        <Route path="wydarzenia/:id" element={<EventDetailsPage />} />
        <Route path="rankingi" element={<RankingsPage />} />
        <Route path="o-nas" element={<AboutPage />} />
        <Route path="kontakt" element={<ContactPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="logowanie" element={<LoginPage />} />
        <Route path="rejestracja" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;