"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }

    const hasSeen = sessionStorage.getItem('qissah_splash_v3');
    if (hasSeen) {
      setShow(false);
      return;
    }
    sessionStorage.setItem('qissah_splash_v3', 'true');
    const timer = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const heart = theme === 'dark' ? '🖤' : '❤️';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[999999] flex flex-col pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1, delay: 1.2 } }} // Very short fade out at the very end to remove the div
        >
          {/* Top Door */}
          <motion.div 
            className="w-full h-1/2 bg-background border-b border-outline-variant/10 shadow-2xl relative"
            initial={{ y: 0 }}
            exit={{ y: '-100%', transition: { duration: 1.4, ease: [0.76, 0, 0.24, 1] } }}
          >
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5"></div>
          </motion.div>

          {/* Bottom Door */}
          <motion.div 
            className="w-full h-1/2 bg-background border-t border-outline-variant/10 shadow-2xl relative"
            initial={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 1.4, ease: [0.76, 0, 0.24, 1] } }}
          >
             <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/5 dark:to-white/5"></div>
          </motion.div>
          
          {/* Central Text overlay */}
          <motion.div 
             className="absolute inset-0 flex items-center justify-center pointer-events-none"
             exit={{ opacity: 0, scale: 1.2, filter: 'blur(15px)', transition: { duration: 0.8, ease: "easeIn" } }}
          >
              <motion.div
                initial={{ opacity: 0, filter: 'blur(20px)', y: 30, scale: 0.9 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                transition={{ duration: 1.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="flex flex-col items-center"
              >
                <h1 className="text-6xl md:text-8xl font-bold text-on-background tracking-[0.2em] flex items-center gap-4 drop-shadow-2xl" style={{ fontFamily: "var(--font-tajawal), 'Tajawal', sans-serif" }}>
                  قصــة 🖤
                </h1>
                
                <motion.div 
                  className="mt-6 h-[2px] bg-primary w-0 rounded-full"
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                />
              </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
