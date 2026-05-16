"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export function BottomNavigation() {
  const pathname = usePathname();

  const { totalItems } = useCartStore();

  const navItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Shop', href: '/shop', icon: '🛍️' },
    { name: 'Cart', href: '/cart', icon: '🛒', showBadge: true },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 p-4 pb-6 pointer-events-none">
      <nav className="glass-panel mx-auto max-w-md rounded-[32px] px-8 py-4 flex justify-between items-center pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const cartCount = totalItems();

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive ? 'text-[var(--color-primary)] scale-110' : 'opacity-60 hover:opacity-100'}`}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.showBadge && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black/20">
                  {cartCount}
                </span>
              )}
              {isActive && <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] mt-1" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
