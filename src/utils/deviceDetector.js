/**
 * Device Detection Utility
 * 
 * Detecta si el usuario está en un dispositivo móvil o escritorio
 * y proporciona utilidades para manejar la conexión con MetaMask en cada caso
 */

export const isMobile = () => {
  // Detección de dispositivos móviles
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
};

export const isMetaMaskInstalled = () => {
  // Verifica si MetaMask está instalado
  if (typeof window === 'undefined') return false;
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

export const getMetaMaskDeepLink = (path = '') => {
  // Genera un enlace profundo para MetaMask Mobile
  return `https://metamask.app.link/dapp/${window.location.host}${path}`;
};

export const handleMobileConnection = () => {
  // Maneja la conexión para dispositivos móviles
  if (!isMobile()) return false;
  
  if (!isMetaMaskInstalled()) {
    // Si MetaMask no está instalado, redirigir a la tienda de aplicaciones
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      window.location.href = 'https://apps.apple.com/app/metamask/id1438144202';
    } else if (userAgent.includes('android')) {
      window.location.href = 'https://play.google.com/store/apps/details?id=io.metamask';
    }
    return true;
  }
  
  // Si MetaMask está instalado, abrir la app
  window.location.href = getMetaMaskDeepLink();
  return true;
};
