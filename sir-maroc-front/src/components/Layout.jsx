import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; 
import Footer from './Footer';

export default function Layout() {
  // 1. On crée l'état pour suivre le scroll
  const [scrolled, setScrolled] = useState(false);

  // 2. On écoute l'événement de défilement du navigateur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true); // Bordeaux quand on descend
      } else {
        setScrolled(false); // Transparent en haut
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="main-app">
      <Navbar scrolled={scrolled} />
      
      <main>
        <Outlet /> 
      </main>
      
      <Footer />
    </div>
  );
}