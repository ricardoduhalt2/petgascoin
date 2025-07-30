import React from 'react';
import GoldenParticles from './GoldenParticles';

const PetGasLoadingScreen = ({ message = 'Loading...', subMessage = '' }) => {
  return (
    <div className="fixed inset-0 bg-petgas-black flex items-center justify-center z-50 overflow-hidden">
      {/* Golden Particles Background */}
      <GoldenParticles count={50} />
      
      <div className="relative z-10 text-center">
        {/* Main Logo with Glow Effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping">
            <img 
              src="https://bscscan.com/token/images/petgas_32.png?v=2" 
              alt="PetGasCoin Logo" 
              className="h-24 w-24 mx-auto rounded-full opacity-20 blur-sm"
            />
          </div>
          <img 
            src="https://bscscan.com/token/images/petgas_32.png?v=2" 
            alt="PetGasCoin Logo" 
            className="relative h-24 w-24 mx-auto rounded-full border-4 border-petgas-gold shadow-2xl petgas-animate-float"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
              animation: 'float 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate'
            }}
          />
        </div>

        {/* Spectacular Golden Spinner */}
        <div className="relative mb-8">
          {/* Outer Ring */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-petgas-gold border-r-petgas-gold animate-spin"
                 style={{ 
                   animation: 'spin 2s linear infinite',
                   filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
                 }}>
            </div>
            
            {/* Middle Ring */}
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-petgas-amber border-l-petgas-amber"
                 style={{ 
                   animation: 'spin 1.5s linear infinite reverse',
                   filter: 'drop-shadow(0 0 8px rgba(255, 193, 7, 0.6))'
                 }}>
            </div>
            
            {/* Inner Ring */}
            <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-yellow-300 border-r-yellow-300"
                 style={{ 
                   animation: 'spin 1s linear infinite',
                   filter: 'drop-shadow(0 0 6px rgba(253, 224, 71, 0.4))'
                 }}>
            </div>
            
            {/* Center Dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-petgas-gold rounded-full animate-pulse"
                   style={{
                     boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 215, 0, 0.3)'
                   }}>
              </div>
            </div>
          </div>
          
          {/* Orbiting Dots */}
          <div className="absolute inset-0 w-32 h-32 mx-auto">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-petgas-gold rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-60px) translateX(-4px)`,
                  animation: `orbit 3s linear infinite ${i * 0.125}s`,
                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Title with Gradient Animation */}
        <div className="mb-6">
          <h1 className="petgas-gradient-text-animated petgas-text-4xl petgas-font-black mb-2"
              style={{
                textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                animation: 'textGlow 2s ease-in-out infinite alternate'
              }}>
            PetgasCoin
          </h1>
          <div className="flex items-center justify-center">
            <span className="text-xs font-bold text-petgas-gold bg-petgas-gold/10 px-3 py-1 rounded-full border border-petgas-gold/30 animate-pulse">
              V1.1
            </span>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <p className="petgas-text-xl text-petgas-text-light font-semibold animate-pulse">
            {message}
          </p>
          {subMessage && (
            <p className="petgas-text-sm text-petgas-text-muted">
              {subMessage}
            </p>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-petgas-gold rounded-full"
              style={{
                animation: `bounce 1.4s ease-in-out infinite ${i * 0.16}s`,
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translateY(-60px) translateX(-4px); }
          100% { transform: rotate(360deg) translateY(-60px) translateX(-4px); }
        }
        
        @keyframes glow {
          0% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6)) brightness(1); }
          100% { filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.9)) brightness(1.2); }
        }
        
        @keyframes textGlow {
          0% { text-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
          100% { text-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.3); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default PetGasLoadingScreen;