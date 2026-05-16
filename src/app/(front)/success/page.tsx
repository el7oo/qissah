"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';

export default function SuccessPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const [bits, setBits] = useState<any[]>([]);

  useEffect(() => {
    const newBits = Array.from({ length: 30 }, (_, i) => ({
      c: ['#DC586D', '#FFBB94', '#A33757', '#FB9590', '#7DA0CA', '#FFD700', '#FF6B9D', '#4C1D3D'][i % 8],
      l: Math.round(Math.random() * 100),
      d: (Math.random() * 0.7).toFixed(2),
      u: (1.2 + Math.random() * 1.1).toFixed(2),
      s: Math.round(5 + Math.random() * 12),
      shape: Math.random() > 0.5 ? '50%' : '4px'
    }));
    setBits(newBits);
    
    // Play success sound when page loads
    audio.playSuccess();
  }, []);

  const handleContinue = (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    router.push('/');
  };

  return (
    <div className="suc-wrap">
      <div className="conf-box">
        {bits.map((b, i) => (
          <div 
            key={i}
            className="conf-bit" 
            style={{
              background: b.c,
              left: `${b.l}%`,
              top: 0,
              width: `${b.s}px`,
              height: `${b.s}px`,
              borderRadius: b.shape,
              animationDelay: `${b.d}s`,
              animationDuration: `${b.u}s`
            }}
          />
        ))}
      </div>
      
      <div className="suc-ico" style={{ animation: 'flt 3s ease-in-out infinite' }}>🎉</div>
      
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, color: 'var(--p1)', marginBottom: '10px' }}>
        {t.orderSuccess || 'تم تأكيد طلبك!'}
      </div>
      
      <div style={{ color: 'var(--txt2)', fontSize: '14px', lineHeight: 1.75, marginBottom: '30px', maxWidth: '275px' }}>
        {t.successMsg || 'طلبك في الطريق. سنتواصل معك قريباً!'}
      </div>
      
      <button 
        className="btn btn-p" 
        style={{ width: 'auto', padding: '14px 38px' }} 
        onClick={handleContinue}
      >
        {t.cont || 'مواصلة التسوق'} →
      </button>
    </div>
  );
}
