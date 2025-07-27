/**
 * ConnectWallet Component
 * 
 * Componente principal de conexión de wallet que utiliza el componente
 * mejorado con el estilo visual de PetGasCoin.
 */

import ConnectWalletEnhanced from './ConnectWalletEnhanced';

const ConnectWallet = (props) => {
  // Simplemente renderiza el componente mejorado
  return <ConnectWalletEnhanced {...props} />;
};

export default ConnectWallet;
