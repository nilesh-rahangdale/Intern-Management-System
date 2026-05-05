/**
 * Reusable Card Component
 * Used for grouping related content
 */

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  className = '',
  padding = 'md',
  hover = false,
  onClick
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyle = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const clickable = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${hoverStyle} ${clickable} ${className}`}
      onClick={onClick}
    >
      {(title || headerAction) && (
        <div className={`flex items-center justify-between border-b border-gray-200 ${paddingStyles[padding]}`}>
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={title || headerAction ? paddingStyles[padding] : paddingStyles[padding]}>
        {children}
      </div>
    </div>
  );
};

export default Card;
