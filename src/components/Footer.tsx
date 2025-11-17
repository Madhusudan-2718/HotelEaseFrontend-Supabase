import { Hotel, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#2D2D2D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-8 h-8 text-[#FFD700]" />
              <span
                className="font-playfair text-white"
                style={{ fontSize: '1.5rem', fontWeight: 600 }}
              >
                HotelEase
              </span>
            </div>
            <p
              className="text-white/70 font-poppins"
              style={{ fontSize: '0.9375rem', fontWeight: 300 }}
            >
              Experience comfort, dining, and travel - all in one place. Your perfect stay
              begins with HotelEase.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-playfair mb-4 text-[#FFD700]"
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2 font-poppins">
              <li>
                <a
                  href="#hero"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-playfair mb-4 text-[#FFD700]"
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            >
              Services
            </h4>
            <ul className="space-y-2 font-poppins">
              <li>
                <a
                  href="#services"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Housekeeping
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Restaurant
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Travel Desk
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-[#FFD700] transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Room Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="font-playfair mb-4 text-[#FFD700]"
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            >
              Contact Us
            </h4>
            <ul className="space-y-3 font-poppins">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                <span className="text-white/70" style={{ fontSize: '0.9375rem' }}>
                  134-135, Service Rd, LRDE Layout, Doddanekundi, Doddanekkundi, Bengaluru, Karnataka 560037
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                <span className="text-white/70" style={{ fontSize: '0.9375rem' }}>
                  +91 6718346273
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                <span className="text-white/70" style={{ fontSize: '0.9375rem' }}>
                  info@hotelease.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-white/50 font-poppins text-center md:text-left"
              style={{ fontSize: '0.875rem' }}
            >
              © {currentYear} HotelEase. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFD700] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFD700] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFD700] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFD700] flex items-center justify-center transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
