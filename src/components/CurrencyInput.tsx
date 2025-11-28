import { useState, useEffect, useRef } from 'react';
import { useSettings, Currency } from '../contexts/SettingsContext';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  required = false,
  min = '0',
  className = '',
  id,
  disabled = false
}: CurrencyInputProps) {
  const { currency } = useSettings();
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Format number with thousand separators based on currency type
   * IDR: Uses period (.) as thousand separator
   * USD: Uses comma (,) as thousand separator
   */
  const formatNumber = (num: string, currencyType: Currency): string => {
    // Remove all non-numeric characters except decimal point
    const cleanNum = num.replace(/[^\d.]/g, '');

    // Split into integer and decimal parts
    const parts = cleanNum.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    // Remove leading zeros but keep single 0
    integerPart = integerPart.replace(/^0+/, '') || '0';

    // Apply thousand separators based on currency
    let formatted = '';
    if (currencyType === 'IDR') {
      // IDR: Use period as thousand separator
      // Format: 1.234.567
      formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
      // USD: Use comma as thousand separator
      // Format: 1,234,567
      formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // For USD, include 2 decimal places
    if (currencyType === 'USD') {
      if (decimalPart !== undefined) {
        // Limit to 2 decimal places
        formatted += '.' + decimalPart.slice(0, 2);
      }
    }
    // IDR doesn't use decimals in typical usage

    return formatted;
  };

  /**
   * Get currency symbol based on currency type
   */
  const getCurrencySymbol = (currencyType: Currency): string => {
    return currencyType === 'IDR' ? 'RP' : '$';
  };

  /**
   * Parse formatted display value back to clean numeric string
   * Removes currency symbols and thousand separators
   */
  const parseDisplayValue = (displayVal: string): string => {
    // Remove currency symbol and spaces
    let cleaned = displayVal.replace(/RP|\$|Rp/gi, '').trim();

    // Remove thousand separators (both . and ,)
    cleaned = cleaned.replace(/[.,]/g, (match, offset, string) => {
      // Keep decimal point for USD (last occurrence before end)
      if (currency === 'USD' && match === '.') {
        const remainingString = string.slice(offset + 1);
        // If there are 1-2 digits after this point, it's a decimal
        if (/^\d{1,2}$/.test(remainingString)) {
          return '.';
        }
      }
      return '';
    });

    return cleaned;
  };

  /**
   * Update display value when value or currency changes
   */
  useEffect(() => {
    if (!isFocused && value) {
      const symbol = getCurrencySymbol(currency);
      const formatted = formatNumber(value, currency);
      setDisplayValue(`${symbol} ${formatted}`);
    } else if (!isFocused && !value) {
      setDisplayValue('');
    }
  }, [value, currency, isFocused]);

  /**
   * Handle input focus
   * Remove currency symbol to allow easy editing
   */
  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number without currency symbol for editing
    if (value) {
      const formatted = formatNumber(value, currency);
      setDisplayValue(formatted);
    }
  };

  /**
   * Handle input blur
   * Add currency symbol back and format
   */
  const handleBlur = () => {
    setIsFocused(false);
    if (displayValue) {
      const cleaned = parseDisplayValue(displayValue);
      onChange(cleaned);

      // Format with currency symbol
      const symbol = getCurrencySymbol(currency);
      const formatted = formatNumber(cleaned, currency);
      setDisplayValue(`${symbol} ${formatted}`);
    } else {
      onChange('');
      setDisplayValue('');
    }
  };

  /**
   * Handle input change with real-time formatting
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Parse the input to get clean number
    const cleaned = parseDisplayValue(inputValue);

    // Validate input
    if (cleaned === '' || /^\d*\.?\d*$/.test(cleaned)) {
      // Update the actual value (stored as clean number)
      onChange(cleaned);

      // Update display with formatting (no currency symbol while typing)
      if (cleaned) {
        const formatted = formatNumber(cleaned, currency);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    }
  };

  /**
   * Handle key press for special keys
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // For USD, allow decimal point
    if (currency === 'USD' && e.key === '.' && !displayValue.includes('.')) {
      return;
    }

    // Only allow numbers
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />
      {!isFocused && !displayValue && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {getCurrencySymbol(currency)} {placeholder}
        </div>
      )}
    </div>
  );
}
