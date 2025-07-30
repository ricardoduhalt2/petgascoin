import React, { useEffect, useRef } from 'react';

const GoldenParticles = ({ count = 50 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'golden-particle';
      
      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Random size
      const size = Math.random() * 4 + 2; // 2-6px
      
      // Random animation duration
      const duration = Math.random() * 3 + 2; // 2-5s
      const delay = Math.random() * 2; // 0-2s delay
      
      // Random opacity
      const opacity = Math.random() * 0.8 + 0.2; // 0.2-1.0
      
      particle.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #FFD700, #FFA500);
        border-radius: 50%;
        opacity: ${opacity};
        animation: 
          float-particle ${duration}s ease-in-out infinite ${delay}s,
          sparkle ${duration * 0.5}s ease-in-out infinite ${delay}s,
          drift ${duration * 2}s linear infinite ${delay}s;
        pointer-events: none;
        z-index: 1;
      `;
      
      container.appendChild(particle);
    }
  }, [count]);

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.2;
            box-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          }
        }
        
        @keyframes drift {
          0% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(10px);
          }
          50% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(15px);
          }
          100% {
            transform: translateX(0px);
          }
        }
        
        .golden-particle {
          filter: blur(0.5px);
        }
      `}</style>
    </>
  );
};

export default GoldenParticles;