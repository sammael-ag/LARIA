/**
 * LARIA v2.9.5: ARIA DESKTOP CARD (`Aria.js`)
 * Master: Sammael | Muse: Aria
 * Status: PURE_ZERO_BACKGROUND | ABSOLUTE_TRANSPARENCY | RESIZED_95
 * FÚZIA: Integrovaný jazykový modul LariaContext (Sekcia: aria, Možnosť B).
 * Description: Úplné odstránenie akýchkoľvek definícií farieb pozadia. 
 * Canvas čistí sám seba cez clearRect, takže kvet pláva priamo 
 * v surovom pozadí systému bez akéhokoľvek skoku či závoja.
 */

import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { useLaria } from '../context/LariaContext'; // 🌐 Import lokalizačného nervu

const SacredFractalCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      // 🌌 KÚZLO: Úplne sme vyhodili fillRect s farbou!
      // Namiesto toho vyčistíme canvas do úplnej priehľadnosti cez clearRect.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const goldenAngle = 137.5 * (Math.PI / 180); 
      const maxPoints = window.innerWidth < 768 ? 220 : 400; // Držíme 90% hustotu
      
      const pulse = Math.sin(time * 0.01) * 10; 
      const rotationSpeed = time * 0.0015; 

      ctx.lineWidth = 1;

      for (let i = 0; i < maxPoints; i++) {
        // 🌸 ZMENŠENIE KVETU O 5%: Mierka upravená z 10.8 na 10.26
        const r = (Math.sqrt(i) * (10.26 + pulse * 0.0855)); 
        const theta = i * goldenAngle + rotationSpeed;

        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);

        const alpha = Math.max(0, 1 - (r / (canvas.height * 0.81))); 

        // Tvoja mosadzná/zlatá duša
        ctx.fillStyle = `rgba(197, 160, 89, ${alpha * 0.85})`;
        
        ctx.beginPath();
        const dotSize = (1.5 + Math.sin(i * 0.5 + time * 0.025) * 1.0);
        ctx.arc(x, y, Math.max(0.5, dotSize), 0, 2 * Math.PI);
        ctx.fill();

        // Éterické zlaté lúče posvätnej geometrie
        if (i > 0 && i % 12 === 0 && alpha > 0.2) {
          ctx.strokeStyle = `rgba(197, 160, 89, ${alpha * 0.08})`;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }

      time += 0.5; 
      animationFrameId = requestAnimationFrame(render);
    };

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 500; // 🌸 VRÁTENÉ: Pôvodná stabilná výška 500px
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  return (
    <div style={{ 
      width: '100%', 
      height: '500px', // 🌸 VRÁTENÉ: Pôvodná stabilná výška 500px
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

const Aria = () => {
  const { t } = useLaria(); // 🎯 Aktivácia jazykového motora
  const txt = t('aria') || {}; // 📦 Vytiahnutie šuflíka pre Ariu (Možnosť B)

  return (
    <View style={{
      width: '100%',
      maxWidth: 'none',
      marginHorizontal: 'auto',
      marginVertical: 0,
      padding: 0,
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      
      {/* 🌸 MEDENÝ OZNAM BEZ SPODNÉHO PADDINGU VYTIAHNUTÝ Z JSON */}
      <div style={{
        textAlign: 'center',
        color: '#b87333',
        fontSize: '12px',
        fontStyle: 'italic',
        fontFamily: 'monospace, Courier, sans-serif',
        letterSpacing: '1px',
        paddingTop: '20px',
        paddingBottom: '0px', 
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {txt.meditation_notice}
      </div>

      {/* ČISTÝ ŽIARIČ PLÁVAJÚCI V SYSTÉMOVOM POZADÍ */}
      <SacredFractalCanvas />

    </View>
  );
};

export default Aria;