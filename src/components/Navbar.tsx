import { useState, useEffect } from 'react';
import { Hotel, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <Hotel className={`w-8 h-8 ${isScrolled ? 'text-[#6B8E23]' : 'text-white'}`} />
            <span
              className={`font-playfair transition-colors ${
                isScrolled ? 'text-[#2D2D2D]' : 'text-white'
              }`}
              style={{ fontSize: '1.5rem', fontWeight: 600 }}
            >
              HotelEase
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className={`transition-colors hover:text-[#FFD700] ${
                isScrolled ? 'text-[#2D2D2D]' : 'text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className={`transition-colors hover:text-[#FFD700] ${
                isScrolled ? 'text-[#2D2D2D]' : 'text-white'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`transition-colors hover:text-[#FFD700] ${
                isScrolled ? 'text-[#2D2D2D]' : 'text-white'
              }`}
            >
              Contact
            </button>
            <Button
              onClick={() => {
                const event = new CustomEvent('navigate', { detail: 'admin-login' });
                window.dispatchEvent(event);
              }}
              className="bg-[#FFD700] text-[#2D2D2D] hover:bg-[#FFD700]/90"
            >
              Staff/Admin
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? 'text-[#2D2D2D]' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-[#2D2D2D] hover:text-[#FFD700] text-left transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-[#2D2D2D] hover:text-[#FFD700] text-left transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-[#2D2D2D] hover:text-[#FFD700] text-left transition-colors"
              >
                Contact
              </button>
              <Button
                onClick={() => {
                  const event = new CustomEvent('navigate', { detail: 'admin-login' });
                  window.dispatchEvent(event);
                }}
                className="bg-[#FFD700] text-[#2D2D2D] hover:bg-[#FFD700]/90 w-full"
              >
                Staff/Admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
