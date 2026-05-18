"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Animate page entry on every route change
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 12, scale: 0.99 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
