/**
 * FormInput Component
 * Reusable input field with label and error handling
 */

const FormInput = ({
  label,
  name,
  type = 'text',
  as = 'input',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  children,
}) => {
  const inputClasses = `block w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    error
      ? 'border-red-300 focus:ring-red-500'
      : 'border-gray-300'
  } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {as === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default FormInput;
