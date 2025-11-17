import { motion } from "motion/react";
import { ImageWithFallback } from "../ImageWFB/ImageWithFallback";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  onRequest: () => void;
}

export function ServiceCard({ title, description, icon, image, onRequest }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
          {icon}
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">{title}</div>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <button
          onClick={onRequest}
          className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Request Service
        </button>
      </div>
    </motion.div>
  );
}
