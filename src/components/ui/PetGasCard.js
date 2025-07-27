/**
 * PetGasCard Component
 * 
 * Tarjeta con el estilo visual de PetGasCoin - fondo negro con bordes dorados,
 * efectos de brillo y diseño elegante.
 */

const PetGasCard = ({
  children,
  title = null,
  className = '',
  variant = 'default', // 'default', 'error', 'success', 'warning'
  glowing = false,
  ...props
}) => {
  const baseClasses = `
    relative bg-black border-2 rounded-2xl p-6
    transition-all duration-300 ease-out
    backdrop-blur-sm
  `;

  const variantClasses = {
    default: `
      border-yellow-500/30 
      hover:border-yellow-400/50
      shadow-lg shadow-yellow-500/10
      hover:shadow-xl hover:shadow-yellow-500/20
    `,
    error: `
      border-red-500/30
      hover:border-red-400/50
      shadow-lg shadow-red-500/10
      hover:shadow-xl hover:shadow-red-500/20
    `,
    success: `
      border-green-500/30
      hover:border-green-400/50
      shadow-lg shadow-green-500/10
      hover:shadow-xl hover:shadow-green-500/20
    `,
    warning: `
      border-orange-500/30
      hover:border-orange-400/50
      shadow-lg shadow-orange-500/10
      hover:shadow-xl hover:shadow-orange-500/20
    `
  };

  const glowClasses = glowing ? `
    before:absolute before:inset-0 before:rounded-2xl
    before:bg-gradient-to-r before:from-yellow-400/20 before:via-yellow-500/20 before:to-yellow-600/20
    before:blur-xl before:-z-10
    before:animate-pulse
  ` : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${glowClasses}
        ${className}
      `}
      {...props}
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 opacity-0 transition-opacity duration-300 hover:opacity-20 -z-10" />
      
      {title && (
        <div className="mb-4 pb-4 border-b border-yellow-500/20">
          <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
      )}
      
      <div className="relative z-10 text-white">
        {children}
      </div>
    </div>
  );
};

export default PetGasCard;