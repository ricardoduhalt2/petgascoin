/**
 * PetGas UI Showcase Component
 * 
 * Componente de demostración que muestra todos los componentes de UI
 * con el estilo visual de PetGasCoin.
 */

import { useState } from 'react';
import PetGasButton from '../ui/PetGasButton';
import PetGasCard from '../ui/PetGasCard';
import PetGasText from '../ui/PetGasText';
import ErrorDisplay from '../ui/ErrorDisplay';

const PetGasUIShowcase = () => {
  const [showError, setShowError] = useState(false);

  const mockError = {
    message: 'Error de conexión de ejemplo',
    severity: 'medium',
    type: 'connection',
    actions: [
      {
        type: 'retry',
        label: 'Reintentar',
        primary: true,
        handler: () => console.log('Retry clicked')
      },
      {
        type: 'dismiss',
        label: 'Cerrar',
        primary: false,
        handler: () => setShowError(false)
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <PetGasText variant="gradient" size="3xl" className="mb-4">
            PetGasCoin UI Components
          </PetGasText>
          <p className="text-gray-400 text-lg">
            Componentes de interfaz con el estilo visual de PetGasCoin
          </p>
        </div>

        {/* Buttons Section */}
        <PetGasCard title="Botones">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PetGasButton variant="primary" size="medium">
              Primario
            </PetGasButton>
            
            <PetGasButton variant="secondary" size="medium">
              Secundario
            </PetGasButton>
            
            <PetGasButton variant="danger" size="medium">
              Peligro
            </PetGasButton>
            
            <PetGasButton variant="success" size="medium">
              Éxito
            </PetGasButton>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <PetGasButton size="small">
              Pequeño
            </PetGasButton>
            
            <PetGasButton size="medium">
              Mediano
            </PetGasButton>
            
            <PetGasButton size="large">
              Grande
            </PetGasButton>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <PetGasButton 
              loading 
              icon={<span>🚀</span>}
            >
              Cargando
            </PetGasButton>
            
            <PetGasButton 
              disabled
              icon={<span>❌</span>}
            >
              Deshabilitado
            </PetGasButton>
            
            <PetGasButton 
              icon={<span>⚡</span>}
            >
              Con Icono
            </PetGasButton>
          </div>
        </PetGasCard>

        {/* Text Section */}
        <PetGasCard title="Texto con Gradientes">
          <div className="space-y-4">
            <div>
              <PetGasText variant="gradient" size="3xl">
                Título Principal
              </PetGasText>
            </div>
            
            <div>
              <PetGasText variant="typing" size="2xl">
                Efecto de Escritura
              </PetGasText>
            </div>
            
            <div>
              <PetGasText variant="shine" size="xl">
                Efecto de Brillo
              </PetGasText>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PetGasText variant="gradient" size="lg">
                Texto Grande
              </PetGasText>
              
              <PetGasText variant="gradient" size="base">
                Texto Normal
              </PetGasText>
              
              <PetGasText variant="gradient" size="sm">
                Texto Pequeño
              </PetGasText>
            </div>
          </div>
        </PetGasCard>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetGasCard variant="default" title="Tarjeta Normal">
            <p className="text-gray-300">
              Esta es una tarjeta con el estilo por defecto de PetGasCoin.
            </p>
            <PetGasButton size="small" className="mt-4">
              Acción
            </PetGasButton>
          </PetGasCard>

          <PetGasCard variant="success" title="Tarjeta de Éxito" glowing>
            <p className="text-gray-300">
              Tarjeta con efecto de brillo y borde verde para indicar éxito.
            </p>
            <PetGasButton variant="success" size="small" className="mt-4">
              Continuar
            </PetGasButton>
          </PetGasCard>

          <PetGasCard variant="error" title="Tarjeta de Error">
            <p className="text-gray-300">
              Tarjeta con borde rojo para indicar errores o advertencias.
            </p>
            <PetGasButton variant="danger" size="small" className="mt-4">
              Corregir
            </PetGasButton>
          </PetGasCard>
        </div>

        {/* Wallet Info Example */}
        <PetGasCard title="Información de Wallet (Ejemplo)">
          <div className="space-y-4">
            {/* Address */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Dirección</span>
                <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-white font-mono text-sm break-all">
                0x1234...5678
              </p>
            </div>

            {/* Balance */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">BNB</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Binance Coin</p>
                    <p className="text-gray-400 text-sm">BNB</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">1.2345</p>
                  <p className="text-gray-400 text-sm">BNB</p>
                </div>
              </div>
            </div>
          </div>
        </PetGasCard>

        {/* Error Display Demo */}
        <PetGasCard title="Manejo de Errores">
          <div className="space-y-4">
            <p className="text-gray-300">
              Sistema de manejo de errores con acciones de recuperación contextual.
            </p>
            
            <PetGasButton 
              onClick={() => setShowError(true)}
              variant="secondary"
            >
              Mostrar Error de Ejemplo
            </PetGasButton>
          </div>
        </PetGasCard>

        {/* Animation Examples */}
        <PetGasCard title="Animaciones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="petgas-glow mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto animate-pulse-glow" />
              </div>
              <p className="text-gray-300">Efecto de Brillo</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto animate-float" />
              </div>
              <p className="text-gray-300">Efecto Flotante</p>
            </div>
          </div>
        </PetGasCard>
      </div>

      {/* Error Display */}
      {showError && (
        <ErrorDisplay
          error={mockError}
          onDismiss={() => setShowError(false)}
          autoHide={false}
        />
      )}
    </div>
  );
};

export default PetGasUIShowcase;