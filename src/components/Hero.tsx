import { ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import hotel from '@/assets/images/hotel.png';
import React, { FC } from 'react';
export const Hero: FC = () => {
  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${hotel})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="mb-6 inline-block">
          <span
            className="text-[#FFD700] font-poppins tracking-widest uppercase"
            style={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            Welcome to HotelEase
          </span>
        </div>
        <h1
          className="text-white font-playfair mb-6 leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700 }}
        >
          Experience Comfort, Dining, and Travel —{' '}
          <span className="text-[#FFD700]">All in One Place</span>
        </h1>
        <p
          className="text-white/90 mb-8 max-w-2xl mx-auto font-poppins"
          style={{ fontSize: '1.125rem', fontWeight: 300 }}
        >
          Discover premium hospitality services designed to make your stay unforgettable.
          From immaculate housekeeping to world-class dining and seamless travel assistance.
        </p>
        <Button
          onClick={scrollToServices}
          className="bg-[#FFD700] text-[#2D2D2D] hover:bg-[#FFD700]/90 px-8 py-6 rounded-full shadow-2xl transition-all hover:scale-105 group"
          style={{ fontSize: '1.125rem', fontWeight: 600 }}
        >
          Explore Services
          <ArrowDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
