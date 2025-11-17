import { Wifi, Car, Coffee, Shield, Clock, Headphones } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function Features() {
  const features: Feature[] = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: 'Free High-Speed WiFi',
      description: 'Stay connected with complimentary high-speed internet throughout the property.',
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: 'Free Parking',
      description: 'Secure parking facilities available for all our guests at no extra charge.',
    },
    {
      icon: <Coffee className="w-8 h-8" />,
      title: 'Complimentary Breakfast',
      description: 'Start your day right with our delicious complimentary breakfast buffet.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Environment',
      description: '24/7 security and CCTV surveillance for your peace of mind.',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Service',
      description: 'Round-the-clock room service and front desk assistance.',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Concierge Service',
      description: 'Personalized assistance for all your travel and accommodation needs.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-4 inline-block">
            <span
              className="text-[#6B8E23] font-poppins tracking-widest uppercase"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              Amenities
            </span>
          </div>
          <h2
            className="text-[#2D2D2D] font-playfair mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}
          >
            Premium Amenities & Features
          </h2>
          <p
            className="text-[#2D2D2D]/70 max-w-2xl mx-auto font-poppins"
            style={{ fontSize: '1.125rem', fontWeight: 300 }}
          >
            Everything you need for a comfortable and convenient stay, all included in your booking.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFD700]/70 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              >
                <div className="text-white">{feature.icon}</div>
              </div>

              {/* Content */}
              <h3
                className="text-[#2D2D2D] font-playfair mb-2"
                style={{ fontSize: '1.25rem', fontWeight: 600 }}
              >
                {feature.title}
              </h3>
              <p
                className="text-[#2D2D2D]/70 font-poppins"
                style={{ fontSize: '0.9375rem', fontWeight: 300 }}
              >
                {feature.description}
              </p>

              {/* Decorative element */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#6B8E23] group-hover:w-full transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
