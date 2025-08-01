import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import WalletCard from './WalletCard';
import GoldenParticles from './ui/GoldenParticles';
import { CONTRACTS, IS_TESTNET, NETWORKS } from '../config.js';

export default function Web3DependentComponents() {
  const { 
    account, 
    isConnected, 
    connect, 
    chainId, 
    error,
    isWrongNetwork
  } = useWeb3();

  // helper: open WalletConnect QR via web3Modal config if available
  async function connectWithWalletConnect() {
    try {
      // Preferimos flujo centralizado si el contexto lo soporta
      if (typeof window !== 'undefined') {
        // intento 1: usar Web3Modal si está configurado
        const anyWin = window;
        const w3m = anyWin?.web3Modal || anyWin?.WALLETCONNECT_MODAL || null;

        // intento 2: cargar config local si existe
        let web3Modal = w3m;
        if (!web3Modal) {
          try {
            const module = await import('../config/web3Modal.js');
            web3Modal = module?.default || module?.web3Modal || null;
          } catch (_) {}
        }

        if (web3Modal?.open) {
          // Web3Modal v2 style
          await web3Modal.open();
          return;
        }
        if (web3Modal?.connect) {
          // Web3Modal clásico
          await web3Modal.connect();
          return;
        }
      }
      // Fallback a connect() del contexto (si internamente abre WalletConnect)
      await connect();
    } catch (e) {
      console.error('WalletConnect QR failed', e);
    }
  }

  // Interactive PGC logo that tilts following mouse
  function PgcLogoInteractive() {
    const [tilt, setTilt] = useState({ rx: 0, ry: 0, scale: 1.0 });

    useEffect(() => {
      function onMove(e) {
        const el = document.getElementById('pgc-logo');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const ry = Math.max(-10, Math.min(10, (dx / rect.width) * 24));
        const rx = Math.max(-10, Math.min(10, (-dy / rect.height) * 24));
        setTilt({ rx, ry, scale: 1.02 });
      }
      function onLeave() {
        setTilt({ rx: 0, ry: 0, scale: 1.0 });
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseout', onLeave);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseout', onLeave);
      };
    }, []);

    return (
      <div className="relative">
        <div
          id="pgc-logo"
          className="relative select-none mx-auto"
          style={{
            width: 128, height: 128,
            transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
            transition: 'transform 120ms linear',
            willChange: 'transform'
          }}
        >
          <img
            src="https://petgascoin.com/media/LogoPetgasCoinTransparent.png?w=512&q=90&f=webp"
            alt="PetgasCoin Logo"
            className="w-full h-full object-contain pointer-events-none select-none"
            style={{
              filter: 'drop-shadow(0 12px 28px rgba(229,184,11,0.28))'
            }}
          />
          {/* subtle ring glow */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: '0 0 0 2px rgba(250, 204, 21, 0.18), 0 0 50px rgba(250, 204, 21, 0.18)'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petgas-black flex flex-col justify-center p-4 relative overflow-hidden">
      <GoldenParticles count={30} />
      <div className="max-w-md w-full mx-auto relative z-10" style={{ marginTop: '-10vh' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Interactive PGC logo that follows mouse */}
            <PgcLogoInteractive />
          </div>
          <div className="flex items-center justify-center mb-4">
            <h1 className="petgas-gradient-text-animated petgas-text-4xl petgas-font-black">
              PetgasCoin
            </h1>
            <span className="ml-3 text-xs font-bold text-petgas-gold bg-petgas-gold/10 px-2 py-1 rounded-full border border-petgas-gold/30 animate-pulse">
              V1.2
            </span>
          </div>
          <p className="petgas-text-base text-petgas-text-light mb-2">
            Next Generation Cryptocurrency
          </p>
          <p className="petgas-text-sm text-petgas-text-muted">
            Connect your wallet to access the dashboard
          </p>
        </div>

        {error && (
          <div className="bg-petgas-dark border-l-4 border-red-500 text-petgas-text-white p-4 mb-4 rounded-lg" role="alert">
            <p className="petgas-font-bold text-red-400">Connection Error</p>
            <p className="petgas-text-sm">{error}</p>
          </div>
        )}

        {isWrongNetwork && (
          <div className="bg-petgas-dark border-l-4 border-petgas-amber text-petgas-text-white p-4 mb-4 rounded-lg" role="alert">
            <div className="flex items-center justify-between">
              <div>
                <p className="petgas-font-bold text-petgas-amber">Wrong Network</p>
                <p className="petgas-text-sm">Please connect to {IS_TESTNET ? 'BSC Testnet' : 'BSC Mainnet'} to continue.</p>
              </div>
              <div className="ml-4">
                <WalletCard 
                  redirectToDashboard={true}
                  account={account}
                  isConnected={isConnected}
                  onConnect={connect}
                  isWrongNetwork={isWrongNetwork}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-petgas-dark border border-petgas-gold/20 rounded-xl p-6 shadow-2xl">
          <div className="text-center mb-4">
            <h2 className="petgas-gradient-text petgas-text-xl petgas-font-bold mb-2">
              Connect Wallet
            </h2>
            <p className="text-petgas-text-gray petgas-text-sm">
              Choose your preferred wallet to get started
            </p>
          </div>
          
          {/* MetaMask (PGC dark + gold) */}
          <button
            onClick={async () => {
              try {
                await connect(); // usa MetaMask si está disponible
              } catch (e) {
                console.error('MetaMask connect failed', e);
              }
            }}
            className="w-full relative flex items-center justify-center gap-2 text-pgc-black font-semibold py-3 px-4 rounded-lg border transition
                       hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
            style={{
              background: 'linear-gradient(135deg, #E5B80B 0%, #FACC15 50%, #E5B80B 100%)',
              borderColor: '#FACC15',
              boxShadow: '0 0 0 2px rgba(250, 204, 21, 0.3), 0 10px 25px rgba(250, 204, 21, 0.2)'
            }}
          >
            <img
              src={typeof window !== 'undefined' ? (new URL('/images/metamask-fox.svg', window.location.origin)).toString() : '/images/metamask-fox.svg'}
              onError={(e) => {
                // fallback a URL pública si no existe el asset local
                e.currentTarget.src = 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg';
              }}
              alt="MetaMask"
              className="h-5 w-5"
            />
            <span className="tracking-wide">Connect with MetaMask</span>
            <span className="absolute inset-0 rounded-lg ring-1 ring-yellow-200/30 pointer-events-none" />
          </button>

          {/* WalletConnect para móviles (QR / deep link) */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WalletConnect QR (desktop) / deep link (mobile) */}
            <button
              onClick={async () => {
                // Desktop: intentamos abrir modal QR via web3Modal si está disponible
                const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                if (!isMobile) {
                  await connectWithWalletConnect();
                  return;
                }
                // Mobile: deep-link MetaMask Mobile (si está)
                try {
                  if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask) {
                    const dappUrl = window.location.origin;
                    window.open(`https://metamask.app.link/dapp/${dappUrl.replace(/^https?:\/\//, '')}`, '_blank');
                  } else {
                    await connectWithWalletConnect();
                  }
                } catch (e) {
                  console.error('WalletConnect/mobile fallback failed', e);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-pgc-black text-petgas-text-white font-semibold py-3 px-4 rounded-lg border border-pgc-gold/40 hover:border-pgc-gold hover:shadow-petgas-glow transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-petgas-gold" viewBox="0 0 32 32" fill="currentColor">
                <path d="M24.5 12.6c-1.6-1.6-4.1-1.6-5.6 0l-.9.9-.9-.9c-1.6-1.6-4.1-1.6-5.6 0-1.5 1.5-1.6 3.9-.2 5.5l3.6 3.9c.5.5 1.2.8 2 .8.8 0 1.5-.3 2-.8l3.6-3.9c1.3-1.6 1.2-4-.2-5.5z"/>
              </svg>
              <span>WalletConnect / Mobile</span>
            </button>

            {/* Alternativas/otros wallets */}
            <div className="w-full">
              <WalletCard 
                redirectToDashboard={true}
                account={account}
                isConnected={isConnected}
                onConnect={connect}
                isWrongNetwork={isWrongNetwork}
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-petgas-text-muted petgas-text-xs">
            By connecting your wallet, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
