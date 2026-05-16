import React from 'react';

// Navigation Icons
export const HouseIcon = ({ className, active }: { className?: string, active?: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {active ? (
      <>
        {/* Colorful filled house with black outline */}
        <path d="M14 3L3 12H6V24H12V17H16V24H22V12H25L14 3Z" fill="#FFF" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 24V17H16V24" fill="#FF4B4B" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Windows */}
        <rect x="8" y="14" width="3" height="3" fill="#4B9FFF" stroke="#111" strokeWidth="1.5" rx="0.5"/>
        <rect x="17" y="14" width="3" height="3" fill="#4B9FFF" stroke="#111" strokeWidth="1.5" rx="0.5"/>
        <path d="M3 12L14 3L25 12" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <path d="M14 3L3 12H6V24H22V12H25L14 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 24V16C10 14.8954 10.8954 14 12 14H16C17.1046 14 18 14.8954 18 16V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

export const BagsIcon = ({ className, active }: { className?: string, active?: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {active ? (
      <>
        {/* Back Bag (Purple) */}
        <path d="M19 12V8C19 6.89543 18.1046 6 17 6H11C9.89543 6 9 6.89543 9 8V12" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="7" y="10" width="14" height="15" rx="2" fill="#9D4BFF" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
        {/* Front Bag (Cyan) */}
        <rect x="4" y="14" width="12" height="12" rx="2" fill="#4BE4FF" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 14V11C14 9.89543 13.1046 9 12 9H8C6.89543 9 6 9.89543 6 11V14" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <rect x="6" y="10" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 10V6C10 4.89543 10.8954 4 12 4H16C17.1046 4 18 4.89543 18 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

export const CartIcon = ({ className, active }: { className?: string, active?: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {active ? (
      <>
        <path d="M2 3H5L8.5 17H21L24 7H6" fill="#FFF" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="22" r="2" fill="#FFC107" stroke="#111" strokeWidth="1.5"/>
        <circle cx="19" cy="22" r="2" fill="#FFC107" stroke="#111" strokeWidth="1.5"/>
        <path d="M12 11H18" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
      </>
    ) : (
      <>
        <path d="M2 3H5L7.68 14.39A2 2 0 0 0 9.62 16H20.38A2 2 0 0 0 22.32 14.39L24 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="21" r="2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="19" cy="21" r="2" stroke="currentColor" strokeWidth="2"/>
      </>
    )}
  </svg>
);

export const AdminIcon = ({ className, active }: { className?: string, active?: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {active ? (
      <>
        <path d="M14 21C17.866 21 21 17.866 21 14C21 10.134 17.866 7 14 7C10.134 7 7 10.134 7 14C7 17.866 10.134 21 14 21Z" fill="#E2E8F0" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 17C15.6569 17 17 15.6569 17 14C17 12.3431 15.6569 11 14 11C12.3431 11 11 12.3431 11 14C11 15.6569 12.3431 17 14 17Z" fill="#FFF" stroke="#111" strokeWidth="1.5"/>
        <path d="M14 4V7M14 21V24M4 14H7M21 14H24M6.92893 6.92893L9.05025 9.05025M18.9497 18.9497L21.0711 21.0711M6.92893 21.0711L9.05025 18.9497M18.9497 6.92893L21.0711 9.05025" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4V6M14 22V24M4 14H6M22 14H24M6.92893 6.92893L8.34315 8.34315M19.6569 19.6569L21.0711 21.0711M6.92893 21.0711L8.34315 19.6569M19.6569 6.92893L21.0711 8.34315M10.4645 4.46447L11.8787 5.87868M17.5355 23.5355L18.9497 22.1213M4.46447 17.5355L5.87868 16.1213M23.5355 10.4645L22.1213 11.8787" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

// Feature Icons (Why Luxara)
export const TruckIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M34 16H8C6.89543 16 6 16.8954 6 18V32H34V16Z" fill="#FFA500" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M34 16H40L44 22V32H34V16Z" fill="#4B9FFF" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M34 22H42" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="14" cy="34" r="4" fill="#FFF" stroke="#111" strokeWidth="2.5"/>
    <circle cx="34" cy="34" r="4" fill="#FFF" stroke="#111" strokeWidth="2.5"/>
    <path d="M22 24H14" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const PadlockIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 20V14C16 9.58172 19.5817 6 24 6C28.4183 6 32 9.58172 32 14V20" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round"/>
    <path d="M16 20V14C16 9.58172 19.5817 6 24 6C28.4183 6 32 9.58172 32 14V20" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="10" y="20" width="28" height="22" rx="4" fill="#FACC15" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
    <circle cx="24" cy="28" r="3" fill="#111"/>
    <path d="M24 31V35" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const StarIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M24 4L29.28 16.53L43.02 17.65L32.55 26.65L35.75 40.1L24 33.03L12.25 40.1L15.45 26.65L4.98 17.65L18.72 16.53L24 4Z" fill="#FACC15" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M24 10L27 18H33" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

export const PhoneIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 18V16C12 9.37258 17.3726 4 24 4C30.6274 4 36 9.37258 36 16V18" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M8 18H16V30H8C5.79086 30 4 28.2091 4 26V20C4 17.7909 5.79086 18 8 18Z" fill="#EF4444" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M32 18H40C42.2091 18 44 17.7909 44 20V26C44 28.2091 42.2091 30 40 30H32V18Z" fill="#EF4444" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M12 30V32C12 36.4183 15.5817 40 20 40H28C32.4183 40 36 36.4183 36 32V30" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M28 40H20V44H28V40Z" fill="#111"/>
  </svg>
);

export const XIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
