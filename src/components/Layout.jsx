import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ChatAssistant from '@/components/ChatAssistant';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream grain-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ChatAssistant />
    </div>
  );
}