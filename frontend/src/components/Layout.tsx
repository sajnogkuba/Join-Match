import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner'

const Layout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow bg-gray-800">
      <Outlet />
    </main>
    <Footer />
    <Toaster richColors position="top-right" closeButton />
  </div>
);

export default Layout;
