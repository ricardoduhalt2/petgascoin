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

  // Simple interactive MetaMask-like fox head
  function FoxHeadInteractive() {
    const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
    const [eye, setEye] = useState({ x: 0, y: 0 });
    const ref = useState(null)[0];

    useEffect(() => {
      function onMove(e) {
        const el = document.getElementById('pgc-fox');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const ry = Math.max(-12, Math.min(12, (dx / rect.width) * 30));
        const rx = Math.max(-12, Math.min(12, (-dy / rect.height) * 30));
        setTilt({ rx, ry });

        // eyes move subtler
        const ex = Math.max(-6, Math.min(6, (dx / rect.width) * 12));
        const ey = Math.max(-6, Math.min(6, (dy / rect.height) * 12));
        setEye({ x: ex, y: ey });
      }
      window.addEventListener('mousemove', onMove);
      return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
      <div
        id="pgc-fox"
        className="relative select-none"
        style={{
          width: 112, height: 112,
          transform: `perspective(600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 100ms linear',
        }}
      >
        {/* Head base */}
        <div className="absolute inset-0 rounded-[24px]" style={{
          background: 'linear-gradient(135deg, #111214 0%, #1a1a20 100%)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(229, 184, 11, 0.15)'
        }} />

        {/* Ears */}
        <div className="absolute -top-3 left-2 w-10 h-10 rotate-[-10deg]" style={{
          background: 'linear-gradient(180deg, #E5790B 0%, #A64B00 100%)',
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }} />
        <div className="absolute -top-3 right-2 w-10 h-10 rotate-[10deg]" style={{
          background: 'linear-gradient(180deg, #E5790B 0%, #A64B00 100%)',
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }} />

        {/* Face mask */}
        <div className="absolute inset-2 rounded-[20px]" style={{
          background: 'linear-gradient(135deg, #FACC15 0%, #E5B80B 60%, #C58A00 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.2)'
        }} />

        {/* Eyes container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Left eye */}
          <div className="relative w-4 h-4 rounded-full bg-white mx-3" style={{
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)'
          }}>
            <div
              className="absolute w-2 h-2 rounded-full bg-black"
              style={{
                top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${eye.x}px), calc(-50% + ${eye.y}px))`
              }}
            />
          </div>
          {/* Right eye */}
          <div className="relative w-4 h-4 rounded-full bg-white mx-3" style={{
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)'
          }}>
            <div
              className="absolute w-2 h-2 rounded-full bg-black"
              style={{
                top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${eye.x}px), calc(-50% + ${eye.y}px))`
              }}
            />
          </div>
        </div>

        {/* Nose */}
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-4 h-3 rounded-b-full" style={{
          background: '#2c2c2c', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }} />

        {/* Glow ring */}
        <div className="absolute -inset-1 rounded-[26px] pointer-events-none" style={{
          boxShadow: '0 0 0 2px rgba(250, 204, 21, 0.2), 0 0 40px rgba(250, 204, 21, 0.15)'
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petgas-black flex flex-col justify-center p-4 relative overflow-hidden">
      <GoldenParticles count={30} />
      <div className="max-w-md w-full mx-auto relative z-10" style={{ marginTop: '-10vh' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Fox head that reacts to mouse (parallax tilt + eye tracking) */}
            <FoxHeadInteractive />
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
            <button
              onClick={async () => {
                try {
                  // intenta WalletConnect vía provider de Web3Context si está expuesto
                  if (window && window.ethereum && window.ethereum.isMetaMask) {
                    // Si usuario tiene MetaMask Mobile, abrir enlace deep-link
                    const dappUrl = typeof window !== 'undefined' ? window.location.origin : 'https://petgascoin.com';
                    window.open(`https://metamask.app.link/dapp/${dappUrl.replace(/^https?:\/\//, '')}`, '_blank');
                  } else {
                    // fallback simple: intenta connect(); si tu connect ya maneja WalletConnect, lo abrirá
                    await connect();
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
