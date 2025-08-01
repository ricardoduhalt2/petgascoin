/**
 * PetGasCard Component
 * 
 * Tarjeta con el estilo visual de PetGasCoin - bordes dorados,
 * fondos degradados y efectos de hover.
 */

const PetGasCard = ({
  children,
  variant = 'default', // 'default', 'gradient', 'dark'
  className = '',
  hover = true,
  glowing, // transient prop for styling, do not forward to DOM
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    default: `
      bg-petgas-dark border border-petgas-gold/20
      shadow-2xl shadow-petgas-gold/10
    `,
    gradient: `
      bg-gradient-to-br from-petgas-dark via-petgas-gray to-petgas-dark
      border border-petgas-gold/30
      shadow-xl shadow-petgas-gold/20
    `,
    dark: `
      bg-petgas-black border border-petgas-gold/20
      shadow-2xl shadow-petgas-gold/10
    `,
    warning: `
      bg-petgas-dark border border-petgas-amber/30
      shadow-xl shadow-petgas-amber/20
    `
  };

  // Hover effects
  const hoverStyles = hover ? `
    hover:shadow-xl hover:shadow-petgas-gold/20
    hover:border-petgas-gold/40
    transform hover:-translate-y-1
    transition-all duration-300 ease-in-out
  ` : '';

  const baseStyles = `
    rounded-xl p-6
    backdrop-blur-sm
    relative overflow-hidden
  `;
  
  // Optional glowing effect styling (do not forward prop to DOM)
  const glowStyles = glowing ? `
    ring-1 ring-petgas-gold/30
    shadow-[0_0_25px_rgba(255,215,0,0.15)]
  ` : '';

  const cardClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${hoverStyles}
    ${glowStyles}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-petgas-gold/5 via-transparent to-petgas-orange/5 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PetGasCard;
