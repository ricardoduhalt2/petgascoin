import React from 'react';
import { motion } from 'framer-motion';

const BinanceCard = ({
  children,
  title,
  subtitle,
  className = '',
  hoverEffect = true,
  noPadding = false,
  noShadow = false,
  border = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-gray-900/80 backdrop-blur-sm
        ${border ? 'border border-gray-800' : ''}
        ${!noShadow ? 'shadow-lg' : ''}
        rounded-xl overflow-hidden
        transition-all duration-300 ease-in-out
        ${hoverEffect ? 'hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className="border-b border-gray-800 px-6 py-4">
          {title && (
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </motion.div>
  );
};

export default BinanceCard;
