import { 
  Shirt, Laptop, Sparkles, Watch, Smartphone, CookingPot, Car, 
  Droplet, Home, Briefcase, Gamepad2, Video, Utensils, PenTool, 
  Tent, Baby, Flower2, Diamond, BookOpen, ShoppingBag, Truck, Lock, Star, Phone
} from 'lucide-react';
import React from 'react';

export function CategoryIcon({ name, className = "", size = 24 }: { name: string, className?: string, size?: number }) {
  const iconMap: Record<string, React.ElementType> = {
    // Emojis mapped
    '👗': Shirt,
    '💻': Laptop,
    '👟': Shirt,
    '✨': Sparkles,
    '⌚': Watch,
    '📱': Smartphone,
    '🍳': CookingPot,
    '🚗': Car,
    '💧': Droplet,
    '🏠': Home,
    '👜': Briefcase,
    '🎮': Gamepad2,
    '📹': Video,
    '🍽️': Utensils,
    '🛠️': PenTool,
    '🏕️': Tent,
    '👶': Baby,
    '🌸': Flower2,
    '🧕': BookOpen,
    '💍': Diamond,
    '💄': Sparkles,
    '👚': Shirt,
    '🛍️': ShoppingBag,
    '⚡': Sparkles,
    '🔥': Sparkles,
    '🚚': Truck,
    '🔒': Lock,
    '⭐': Star,
    '📞': Phone,
    '⚠️': Sparkles,
    '📌': ShoppingBag,
    
    // String names
    'clothing': Shirt,
    'electronics': Laptop,
    'shoes': Shirt,
    'care': Sparkles,
    'watches': Watch,
    'phones': Smartphone,
    'homeApp': CookingPot,
    'carAcc': Car,
    'oils': Droplet,
    'decor': Home,
    'bags': Briefcase,
    'entertainment': Gamepad2,
    'security': Video,
    'kitchen': Utensils,
    'work': PenTool,
    'camping': Tent,
    'baby': Baby,
    'flowers': Flower2,
    'hijab': BookOpen,
    'womenAcc': Diamond,
    'makeup': Sparkles,
    'womenClothes': Shirt,
  };

  const Icon = iconMap[name] || ShoppingBag;
  return <Icon className={className} size={size} strokeWidth={1.25} />;
}
