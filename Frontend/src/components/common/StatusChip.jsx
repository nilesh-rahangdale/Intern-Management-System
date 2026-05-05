/**
 * StatusChip Component
 * Displays status with color-coded indicators
 */

const StatusChip = ({ status, size = 'md', showDot = true }) => {
  const statusConfig = {
    ACTIVE: {
      label: 'Active',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      dotColor: 'bg-green-500',
    },
    INACTIVE: {
      label: 'Inactive',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      dotColor: 'bg-yellow-500',
    },
    BLOCKED: {
      label: 'Blocked',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500',
    },
    ONGOING: {
      label: 'Ongoing',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      dotColor: 'bg-blue-500',
    },
    COMPLETED: {
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      dotColor: 'bg-green-500',
    },
    CANCELLED: {
      label: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500',
    },
    TERMINATED: {
      label: 'Terminated',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500',
    },
  };

  const config = statusConfig[status] || statusConfig.ACTIVE;

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center ${sizes[size]} font-medium rounded-full ${config.bgColor} ${config.textColor}`}
    >
      {showDot && (
        <span className={`${dotSizes[size]} ${config.dotColor} rounded-full mr-1.5`}></span>
      )}
      {config.label}
    </span>
  );
};

export default StatusChip;
