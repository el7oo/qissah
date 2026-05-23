"use client";
import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Only show once per session
    const hasSeen = sessionStorage.getItem('qissah_splash');
    if (hasSeen) {
      setShow(false);
      return;
    }
    sessionStorage.setItem('qissah_splash', 'true');
    const timer = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo-container">
          <h1 className="splash-title">قصــــة</h1>
          <div className="splash-glow"></div>
        </div>
        <div className="splash-emoji">
          <span style={{ fontSize: '24px' }}>🛍️✨</span>
        </div>
        <div className="splash-loader-bar"></div>
      </div>
      <style>{`
        .splash-screen {
          position: fixed; inset: 0; z-index: 9999999;
          background: var(--bg);
          display: flex; justify-content: center; align-items: center;
          animation: splashOut 0.8s cubic-bezier(0.8, 0, 0.2, 1) 1.8s forwards;
        }
        .splash-content {
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .splash-logo-container {
          position: relative;
          animation: logoScale 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .splash-title {
          font-family: var(--font-tajawal), 'Tajawal', sans-serif;
          font-size: 82px; font-weight: 900; color: var(--txt);
          margin: 0; letter-spacing: 4px;
          position: relative; z-index: 2;
          text-shadow: 0 10px 30px var(--glow);
        }
        .splash-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 150%; height: 150%; background: radial-gradient(circle, var(--glow) 0%, transparent 60%);
          z-index: 1; filter: blur(20px);
          animation: glowPulse 2s ease-in-out infinite alternate;
        }
        .splash-emoji {
          font-size: 28px;
          margin-top: -5px; margin-bottom: 30px;
          opacity: 0; animation: fadeInSub 1s ease 0.5s forwards;
          font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
        }
        .splash-loader-bar {
          width: 60px; height: 3px; background: rgba(255,255,255,0.1);
          border-radius: 4px; overflow: hidden; position: relative;
          opacity: 0; animation: fadeInSub 1s ease 0.8s forwards;
        }
        .splash-loader-bar::after {
          content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 40%;
          background: linear-gradient(90deg, transparent, #DC586D, transparent);
          animation: loadProgress 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes logoScale {
          0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes fadeInSub {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes splashOut {
          0% { opacity: 1; transform: scale(1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
          40% { transform: scale(1.05); opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
          100% { 
            opacity: 0; 
            transform: scale(1.1); 
            visibility: hidden; 
            pointer-events: none; 
            clip-path: polygon(0 50%, 100% 50%, 100% 50%, 0 50%); 
          }
        }
      `}</style>
    </div>
  );
}
