import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

/**
 * LoadingSpinner — Displays a spinner or full-page loading state.
 *
 * @param {boolean} fullPage - Centers the spinner in the full viewport
 * @param {string} text - Optional loading text
 * @param {string} size - Spinner size: 'sm' | 'md' | 'lg'
 */
export default function LoadingSpinner({ fullPage = false, text, size = 'md' }) {
  const sizeMap = { sm: 20, md: 32, lg: 48 };

  const spinner = (
    <div className="loading-spinner" role="status" aria-label="Loading">
      <Loader2
        size={sizeMap[size]}
        className="loading-spinner__icon"
      />
      {text && <p className="loading-spinner__text body-sm">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="loading-spinner--full-page">
        {spinner}
      </div>
    );
  }

  return spinner;
}
