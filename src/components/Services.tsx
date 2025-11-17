import { Sparkles, UtensilsCrossed, Plane } from 'lucide-react';
import { Card } from './ui/card';
import { ImageWithFallback } from './ImageWFB/ImageWithFallback';
import housekeeping from '@/assets/images/housekeeping.png';
import cusine from '@/assets/images/cusine.png';
import frontdesk from '@/assets/images/frontdesk.png';

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  color: string;
}

interface ServicesProps {
  onNavigate?: (page: 'home' | 'housekeeping' | 'restaurant' | 'travel') => void;
}

export function Services({ onNavigate }: ServicesProps = {}) {
  const services: Service[] = [
    {
      id: 'housekeeping',
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Housekeeping',
      description:
        'Immaculate room service and maintenance ensuring your comfort and cleanliness throughout your stay.',
      image: housekeeping,
      color: '#6B8E23',
    },
    {
      id: 'restaurant',
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: 'Restaurant',
      description:
        'Savor exquisite culinary experiences with our world-class dining options featuring local and international cuisines.',
      image: cusine,
      color: '#FFD700',
    },
    {
      id: 'travel',
      icon: <Plane className="w-8 h-8" />,
      title: 'Travel Desk',
      description:
        'Expert travel assistance and concierge services to help you explore and make the most of your destination.',
      image: frontdesk,
      color: '#6B8E23',
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-4 inline-block">
            <span
              className="text-[#6B8E23] font-poppins tracking-widest uppercase"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              Our Services
            </span>
          </div>
          <h2
            className="text-[#2D2D2D] font-playfair mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}
          >
            Exceptional Hospitality Services
          </h2>
          <p
            className="text-[#2D2D2D]/70 max-w-2xl mx-auto font-poppins"
            style={{ fontSize: '1.125rem', fontWeight: 300 }}
          >
            We offer a comprehensive range of services designed to exceed your expectations
            and make your stay truly memorable.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={service.id}
              onClick={() => {
                if (service.id === 'housekeeping') onNavigate?.('housekeeping');
                else if (service.id === 'restaurant') onNavigate?.('restaurant');
                else if (service.id === 'travel') onNavigate?.('travel');
              }}
              className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div
                  className="absolute top-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: service.color }}
                >
                  <div className="text-white">{service.icon}</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="text-[#2D2D2D] font-playfair mb-3"
                  style={{ fontSize: '1.5rem', fontWeight: 600 }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-[#2D2D2D]/70 font-poppins"
                  style={{ fontSize: '0.9375rem', fontWeight: 300 }}
                >
                  {service.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
