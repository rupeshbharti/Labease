import { Search } from 'lucide-react';
import './Input.css';

/**
 * Input — Form input with label, error state, and search variant.
 *
 * @param {string} label
 * @param {string} error
 * @param {boolean} search - Adds search icon
 * @param {React.ReactNode} rightIcon
 */
export default function Input({
  label,
  error,
  search = false,
  rightIcon,
  id,
  className = '',
  ...props
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        {search && (
          <Search size={20} className="input-group__search-icon" />
        )}
        <input
          id={inputId}
          className={`form-input ${search ? 'form-input--search' : ''} ${error ? 'form-input--error' : ''}`}
          {...props}
        />
        {rightIcon && (
          <span className="input-group__right-icon">{rightIcon}</span>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

/**
 * TextArea — Multi-line text input.
 */
export function TextArea({
  label,
  error,
  id,
  className = '',
  rows = 4,
  ...props
}) {
  const textareaId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="input-group__label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-input form-textarea ${error ? 'form-input--error' : ''}`}
        rows={rows}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

/**
 * Select — Dropdown select input.
 */
export function Select({
  label,
  error,
  options = [],
  placeholder,
  id,
  className = '',
  ...props
}) {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="input-group__label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-input form-select ${error ? 'form-input--error' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
