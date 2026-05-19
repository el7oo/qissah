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
          <h1 className="splash-title">قصــــــة</h1>
          <div className="splash-glow"></div>
        </div>
        <p className="splash-subtitle">L U X U R Y   E S T A T E</p>
        <div className="splash-loader-bar"></div>
      </div>
      <style>{`
        :root {
          --splash-bg: #fff8f3;
          --splash-text: #DC586D;
          --splash-sub: #852E4E;
          --splash-glow: rgba(220,88,109,0.2);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --splash-bg: #020813;
            --splash-text: #fff;
            --splash-sub: #888;
            --splash-glow: rgba(220,88,109,0.3);
          }
        }
        .splash-screen {
          position: fixed; inset: 0; z-index: 9999999;
          background: var(--splash-bg);
          display: flex; justify-content: center; align-items: center;
          animation: splashOut 0.8s cubic-bezier(0.8, 0, 0.2, 1) 2.2s forwards;
        }
        .splash-content {
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .splash-logo-container {
          position: relative;
          animation: logoScale 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .splash-title {
          font-family: var(--font-tajawal), 'Tajawal', sans-serif;
          font-size: 82px; font-weight: 900; color: var(--splash-text);
          margin: 0; letter-spacing: 4px;
          position: relative; z-index: 2;
          text-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .splash-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 150%; height: 150%; background: radial-gradient(circle, var(--splash-glow) 0%, transparent 60%);
          z-index: 1; filter: blur(20px);
          animation: glowPulse 2s ease-in-out infinite alternate;
        }
        .splash-subtitle {
          font-family: var(--font-outfit), 'Outfit', sans-serif;
          font-size: 14px; letter-spacing: 12px; color: var(--splash-sub);
          margin-top: -10px; margin-bottom: 40px;
          opacity: 0; animation: fadeInSub 1s ease 0.5s forwards;
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
          0% { opacity: 1; transform: scale(1); }
          40% { transform: scale(1.05); opacity: 1; }
          100% { opacity: 0; transform: scale(1.2); visibility: hidden; pointer-events: none; }
        }
      `}</style>
    </div>
  );
}
