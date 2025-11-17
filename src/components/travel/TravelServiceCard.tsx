import { motion } from "motion/react";
import { ImageWithFallback } from "../ImageWFB/ImageWithFallback";

interface TravelServiceCardProps {
  title: string;
  description: string;
  basePrice: string;
  icon: React.ReactNode;
  image: string;
  onBook: () => void;
}

export function TravelServiceCard({ 
  title, 
  description, 
  basePrice, 
  icon, 
  image, 
  onBook 
}: TravelServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Icon Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-lg">
          <div className="text-[#6B8E23]">
            {icon}
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 px-4 py-2 rounded-full shadow-lg">
            <p className="text-xs">Starting from</p>
            <p className="text-lg">{basePrice}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
        
        <button
          onClick={onBook}
          className="w-full bg-gradient-to-r from-[#6B8E23] to-[#556B2F] text-white py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}
