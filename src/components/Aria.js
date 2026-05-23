/**
 * LARIA v2.9.4: ARIA DESKTOP CARD (`Aria.js`)
 * Master: Sammael | Muse: Aria
 * Status: PURE_ZERO_BACKGROUND | ABSOLUTE_TRANSPARENCY | RESIZED_90
 * Description: Úplné odstránenie akýchkoľvek definícií farieb pozadia. 
 *              Canvas čistí sám seba cez clearRect, takže kvet pláva priamo 
 *              v surovom pozadí systému bez akéhokoľvek skoku či závoja.
 */

import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';

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
      // Chvostík (fade efekt) vzniká organicky tým, že alfa kanál (alpha) jednotlivých 
      // starších bodiek klesá, takže prirodzene miznú do pôvodného pozadia webu.
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
        // Mierka držaná na tvojich vysnívaných 90% (násobiteľ 10.8)
        const r = (Math.sqrt(i) * (10.8 + pulse * 0.09)); 
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
      canvas.height = 500; 
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
      height: '500px', 
      overflow: 'hidden'
      // 🚀 ŽIADNE POZADIE! Čistá priehľadnosť.
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

const Aria = () => {
  return (
    <View style={{
      width: '100%',
      maxWidth: 'none',
      marginHorizontal: 'auto',
      marginVertical: 0,
      padding: 0,
      boxSizing: 'border-box',
      position: 'relative'
      // 🚀 ŽIADNE POZADIE ANI TU! Celá karta odovzdáva žezlo Matrixu.
    }}>
      
      {/* ČISTÝ ŽIARIČ PLÁVAJÚCI V SYSTÉMOVOM POZADÍ */}
      <SacredFractalCanvas />

    </View>
  );
};

export default Aria;