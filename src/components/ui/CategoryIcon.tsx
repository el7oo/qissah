import { AppleEmoji } from './AppleEmoji';
import React from 'react';

export function CategoryIcon({ name, className = "", size = 24 }: { name: string, className?: string, size?: number }) {
  // If the icon name is a lucide icon name (like 'ShoppingBag', 'Search', etc), AppleEmoji might return null if it's not mapped.
  // We need to fallback to a lucide icon if AppleEmoji returns null, OR just let AppleEmoji map it via the name.
  // Actually, the user wants Apple Emojis explicitly. So we just pass the name.
  return <AppleEmoji name={name} className={className} width={size} height={size} />;
}
