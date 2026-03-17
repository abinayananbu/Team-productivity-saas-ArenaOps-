const Tooltip = ({ children, content, position = 'top', className = '' }) => {
  const positionClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top:    'before:top-full before:left-1/2 before:-translate-x-1/2 before:border-t-gray-900',
    bottom: 'before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-b-gray-900',
    left:   'before:left-full before:top-1/2 before:-translate-y-1/2 before:border-l-gray-900',
    right:  'before:right-full before:top-1/2 before:-translate-y-1/2 before:border-r-gray-900',
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      {children}
      <div className={`
        absolute px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
        whitespace-pre-wrap max-w-[250px] shadow-xl border border-gray-700
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 z-50 pointer-events-none
        before:absolute before:border-4 before:border-transparent before:z-10
        ${positionClasses[position]}
        ${arrowClasses[position]}
      `}>
        {content}
      </div>
    </div>
  );
};