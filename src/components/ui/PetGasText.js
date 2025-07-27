/**
 * PetGasText Component
 * 
 * Componente de texto con efectos de gradiente dorado animado,
 * similar al estilo de los títulos en PetGasCoin.
 */

const PetGasText = ({
  children,
  variant = 'gradient', // 'gradient', 'typing', 'shine'
  size = 'base', // 'sm', 'base', 'lg', 'xl', '2xl', '3xl'
  className = '',
  animated = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const baseGradientClasses = animated 
    ? 'petgas-gradient-text animated' 
    : 'petgas-gradient-text';

  const variantClasses = {
    gradient: `${baseGradientClasses} bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-bold`,
    typing: `typing-text`,
    shine: `${baseGradientClasses} bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-bold relative`
  };

  return (
    <span
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default PetGasText;