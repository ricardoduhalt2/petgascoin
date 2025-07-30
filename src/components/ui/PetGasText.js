/**
 * PetGasText Component
 * 
 * Componente de texto con estilos de PetGasCoin - gradientes dorados,
 * diferentes variantes y tamaños.
 */

const PetGasText = ({
  children,
  variant = 'default', // 'default', 'gradient', 'accent', 'muted'
  size = 'base', // 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'
  weight = 'normal', // 'light', 'normal', 'medium', 'semibold', 'bold'
  className = '',
  as: Component = 'span',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    default: 'text-gray-900 dark:text-white',
    gradient: `
      bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500
      bg-clip-text text-transparent
      font-semibold
    `,
    accent: 'text-yellow-600 dark:text-yellow-400',
    muted: 'text-gray-600 dark:text-gray-400'
  };

  // Size styles
  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  // Weight styles
  const weightStyles = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const textClasses = `
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${weightStyles[weight]}
    ${className}
  `;

  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

export default PetGasText;