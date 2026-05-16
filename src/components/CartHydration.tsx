"use client";

import React, { useEffect, useState } from 'react';

// Prevents Zustand persist hydration mismatch between SSR and client
export function CartHydration({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Render children inside a div with display: contents to avoid layout shifts,
    // while preserving SEO content during SSR.
    return <div style={{ display: 'contents' }} suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}
