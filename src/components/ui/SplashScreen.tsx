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
      <div className="splash-door splash-door-l"></div>
      <div className="splash-door splash-door-r"></div>
      <div className="splash-content">
        <div className="splash-logo-container">
          <h1 className="splash-title">قصــــة</h1>
          <div className="splash-glow"></div>
        </div>
        <div className="splash-emoji">
          <span className="heart-light"><AppleEmoji name="❤️" width={32} height={32} /></span>
          <span className="heart-dark"><AppleEmoji name="🤍" width={32} height={32} /></span>
          <AppleEmoji name="✨" width={32} height={32} />
        </div>
        <div className="splash-loader-bar"></div>
      </div>
      <style>{`
        .splash-screen {
          position: fixed; inset: 0; z-index: 9999999;
          display: flex; justify-content: center; align-items: center;
          animation: screenHide 0s linear 2.8s forwards;
        }
        .splash-door {
          position: absolute; top: 0; bottom: 0; width: 50%;
          background: var(--bg);
          z-index: 1;
          animation: doorOpen 1s cubic-bezier(0.8, 0, 0.2, 1) 1.8s forwards;
        }
        .splash-door-l { left: 0; --door-dir: -100%; border-right: 1px solid var(--bdr); }
        .splash-door-r { right: 0; --door-dir: 100%; border-left: 1px solid var(--bdr); }
        
        .splash-content {
          position: relative; z-index: 2;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          animation: contentFade 0.7s cubic-bezier(0.8, 0, 0.2, 1) 1.7s forwards;
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
          margin-top: -5px; margin-bottom: 30px;
          display: flex; gap: 8px; align-items: center; justify-content: center;
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
        
        @keyframes doorOpen {
          0% { transform: translateX(0); }
          100% { transform: translateX(var(--door-dir)); }
        }
        @keyframes contentFade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.3); visibility: hidden; pointer-events: none; }
        }
        @keyframes screenHide {
          to { visibility: hidden; pointer-events: none; }
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
      `}</style>
    </div>
  );
}
