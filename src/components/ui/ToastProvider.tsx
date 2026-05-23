"use client";

import { Toaster, resolveValue } from "react-hot-toast";
import { AppleEmoji } from "./AppleEmoji";

export function ToastProvider() {
  return (
    <Toaster 
      position="bottom-center"
      toastOptions={{
        duration: 2500,
      }}
    >
      {(t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1)',
            background: 'var(--card)',
            color: 'var(--txt)',
            border: '1px solid var(--bdr)',
            borderRadius: '22px',
            padding: '11px 20px',
            boxShadow: '0 8px 32px var(--shd)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: "'Tajawal', sans-serif",
            margin: '4px 0',
          }}
        >
          {t.type === 'success' && <AppleEmoji name="✨" />}
          {t.type === 'error' && <AppleEmoji name="⚠️" />}
          {resolveValue(t.message, t)}
        </div>
      )}
    </Toaster>
  );
}
