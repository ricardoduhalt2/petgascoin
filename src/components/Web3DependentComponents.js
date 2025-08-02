import { useEffect, useMemo, useRef, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useRouter } from 'next/router';
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
  const router = useRouter();

  // Smart redirect supervisor (compatible Firefox): eventos + polling + backoff
  const redirectingRef = useRef(false);
  const backoffRef = useRef(500);
  const timeoutRef = useRef(null);
  const pollRef = useRef(null);

  function safeClearTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    // Limpia polling
    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    // Evento -> intenta redirect seguro
    const safeRedirect = () => {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      // Intento inmediato
      router.push('/dashboard').catch(() => {});
      // Polling corto 500ms por 5s (Firefox a veces retrasa resolución)
      let remaining = 10;
      stopPolling();
      pollRef.current = setInterval(() => {
        if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
          redirectingRef.current = false;
          stopPolling();
          return;
        }
        router.push('/dashboard').catch(() => {});
        remaining -= 1;
        if (remaining <= 0) {
          // fallback backoff
          stopPolling();
          const attemptRedirect = () => {
            if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
              redirectingRef.current = false;
              return;
            }
            router.push('/dashboard').catch(() => {});
            backoffRef.current = Math.min(backoffRef.current * 2, 5000);
            timeoutRef.current = setTimeout(attemptRedirect, backoffRef.current);
          };
          safeClearTimeout();
          timeoutRef.current = setTimeout(attemptRedirect, 750);
        }
      }, 500);
    };

    // Suscribir a eventos de MetaMask (Firefox-friendly)
    if (typeof window !== 'undefined' && window.ethereum) {
      const onAccountsChanged = (accs) => {
        if (Array.isArray(accs) && accs.length > 0 && !isWrongNetwork) safeRedirect();
      };
      const onChainChanged = (cid) => {
        // BSC Mainnet 56 / 0x38
        const ok = cid === '0x38' || cid === 56 || cid === '56';
        if (ok && isConnected) safeRedirect();
      };
      window.ethereum.on?.('accountsChanged', onAccountsChanged);
      window.ethereum.on?.('chainChanged', onChainChanged);

      // Cleanup
      return () => {
        window.ethereum.removeListener?.('accountsChanged', onAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', onChainChanged);
        safeClearTimeout();
        stopPolling();
      };
    }

    // Estado actual ya conectado y red correcta => dispara redirect
    if (isConnected && !isWrongNetwork) {
      safeRedirect();
    }

    return () => {
      safeClearTimeout();
      stopPolling();
    };
  }, [isConnected, isWrongNetwork, router]);

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
                V1.5
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
              Smart connect for desktop & mobile
            </p>
          </div>

          {/* Botón único inteligente con fixes para Mobile (MetaMask app) y Desktop */}
          <button
            onClick={async () => {
              try {
                const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                const href = typeof window !== 'undefined' ? window.location.href : '';
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const dappHost = origin.replace(/^https?:\/\//, '');

                // Evitar doble-conexión
                if (redirectingRef.current) {
                  router.push('/dashboard').catch(() => {});
                  return;
                }

                // 1) Mobile: siempre intentar deep-link universal hacia MetaMask con la URL completa
                if (isMobile) {
                  // iOS/Android MetaMask universal link (no usar target=_blank para permitir apertura de app)
                  window.location.href = `https://metamask.app.link/dapp/${dappHost}`;
                  // backup: si no abre en 1200ms, intentar WalletConnect
                  setTimeout(async () => {
                    if (!window.ethereum) {
                      await connectWithWalletConnect();
                    }
                  }, 1200);
                } else {
                  // 2) Desktop: si hay MetaMask usa connect(); si no, mostrar QR WalletConnect
                  const hasMM = typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
                  if (hasMM) {
                    await connect();
                  } else {
                    await connectWithWalletConnect();
                  }
                }

                // Supervisar redirección a /dashboard
                redirectingRef.current = true;
                backoffRef.current = 500;
                const start = Date.now();
                const maxWait = 8000; // 8s máximo
                const tick = async () => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
                    redirectingRef.current = false;
                    return;
                  }
                  router.push('/dashboard').catch(() => {});
                  if (Date.now() - start > maxWait) {
                    redirectingRef.current = false;
                    return;
                  }
                  backoffRef.current = Math.min(backoffRef.current * 1.5, 1500);
                  timeoutRef.current = setTimeout(tick, backoffRef.current);
                };
                safeClearTimeout();
                timeoutRef.current = setTimeout(tick, 400);
              } catch (e) {
                console.error('Smart connect failed', e);
                try { await connect(); } catch {}
                router.push('/dashboard').catch(() => {});
              }
            }}
            className="w-full relative flex items-center justify-center gap-3 text-pgc-black font-semibold py-3 px-4 rounded-lg border transition
                       hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
            style={{
              background: 'linear-gradient(135deg, #E5B80B 0%, #FACC15 50%, #E5B80B 100%)',
              borderColor: '#FACC15',
              boxShadow: '0 0 0 2px rgba(250, 204, 21, 0.3), 0 10px 25px rgba(250, 204, 21, 0.2)'
            }}
          >
            <img
              src="/images/metamask-fox.svg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              alt="Wallet"
              className="h-5 w-5"
            />
            <span className="tracking-wide">Connect Wallet</span>
            <span className="absolute inset-0 rounded-lg ring-1 ring-yellow-200/30 pointer-events-none" />
          </button>

          {/* Hint contextual */}
          <div className="mt-3 text-center text-petgas-text-muted petgas-text-xs">
            Auto-detecta MetaMask o abre QR (WalletConnect) según tu dispositivo
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
