import { motion } from "motion/react";
import { Plus, Minus, Leaf } from "lucide-react";
import { ImageWithFallback } from "../ImageWFB/ImageWithFallback";
import { Badge } from "../ui/badge";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  cuisine?: string;
}

interface FoodCardProps {
  item: FoodItem;
  quantity: number;
  onAdd: (item: FoodItem) => void;
  onRemove: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

export function FoodCard({ item, quantity, onAdd, onRemove, onQuantityChange }: FoodCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden group">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-4 left-4">
          <Badge 
            className={`${
              item.isVeg 
                ? 'bg-green-500 border-green-600' 
                : 'bg-red-500 border-red-600'
            } text-white border-2 flex items-center gap-1.5`}
          >
            {item.isVeg && <Leaf className="w-3 h-3" />}
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4 bg-[#FFD700] text-gray-900 px-4 py-2 rounded-full shadow-lg">
          <span className="text-lg">₹{item.price}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-2">{item.name}</div>
        
        {item.cuisine && (
          <p className="text-xs text-[#6B8E23] mb-2">{item.cuisine}</p>
        )}
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

        {/* Add to Cart / Quantity Controls */}
        {quantity === 0 ? (
          <button
            onClick={() => onAdd(item)}
            className="w-full bg-gradient-to-r from-[#6B8E23] to-[#556B2F] text-white py-3 px-4 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <button
              onClick={() => quantity > 1 ? onQuantityChange(item.id, quantity - 1) : onRemove(item.id)}
              className="w-10 h-10 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-gray-700" />
            </button>
            
            <span className="text-lg px-4">{quantity}</span>
            
            <button
              onClick={() => onQuantityChange(item.id, quantity + 1)}
              className="w-10 h-10 bg-[#6B8E23] rounded-lg shadow hover:bg-[#556B2F] transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
