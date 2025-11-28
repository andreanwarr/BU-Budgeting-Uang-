# Currency Formatting Feature - Implementation Guide

## Overview

The application now includes an intelligent currency input component that automatically formats numbers based on the user's selected currency type (IDR or USD). The formatting happens in real-time as users type, providing immediate visual feedback while maintaining clean numerical values for calculations.

## Features

### 1. **Automatic Currency Detection**
- Reads the user's currency preference from their settings
- Supports Indonesian Rupiah (IDR) and US Dollar (USD)
- Updates formatting instantly when currency preference changes

### 2. **Real-Time Formatting**

#### Indonesian Rupiah (IDR)
- **Prefix:** RP
- **Thousand Separator:** Period (.)
- **Decimal Places:** None (whole numbers only)
- **Examples:**
  - Input: `50000` → Display: `RP 50.000`
  - Input: `1500000` → Display: `RP 1.500.000`
  - Input: `250000000` → Display: `RP 250.000.000`

#### US Dollar (USD)
- **Prefix:** $
- **Thousand Separator:** Comma (,)
- **Decimal Places:** 2 decimal places
- **Examples:**
  - Input: `1000` → Display: `$1,000.00`
  - Input: `25000` → Display: `$25,000.00`
  - Input: `1500.50` → Display: `$1,500.50`

### 3. **Smart Input Handling**

#### While Typing (Focused)
- Currency symbol is hidden during input for easier editing
- Numbers are formatted with thousand separators in real-time
- Only numeric characters are allowed (plus decimal point for USD)
- Example: Typing `12345` shows as `12,345` (USD) or `12.345` (IDR)

#### After Input (Blurred)
- Currency symbol is automatically added
- Full formatting with symbol and thousand separators
- Example: `12345` becomes `$12,345` (USD) or `RP 12.345` (IDR)

### 4. **Data Integrity**
- **Display Value:** Formatted with currency symbol and separators for user interface
- **Stored Value:** Clean numeric string without formatting for database storage
- **Calculation Value:** Parsed as float for mathematical operations
- No data loss or corruption during format conversions

## Technical Implementation

### Component: `CurrencyInput`

Location: `src/components/CurrencyInput.tsx`

#### Key Functions

```typescript
/**
 * Format number with thousand separators based on currency type
 * IDR: Uses period (.) as thousand separator
 * USD: Uses comma (,) as thousand separator
 */
const formatNumber = (num: string, currencyType: Currency): string
```

```typescript
/**
 * Get currency symbol based on currency type
 * Returns: 'RP' for IDR, '$' for USD
 */
const getCurrencySymbol = (currencyType: Currency): string
```

```typescript
/**
 * Parse formatted display value back to clean numeric string
 * Removes currency symbols and thousand separators
 */
const parseDisplayValue = (displayVal: string): string
```

#### Usage Example

```tsx
import { CurrencyInput } from './CurrencyInput';

<CurrencyInput
  id="amount"
  value={amount}
  onChange={(value) => setAmount(value)}
  required
  min="0"
  className="w-full px-4 py-3 border rounded-xl"
  placeholder="0"
/>
```

### Integration Points

The CurrencyInput component has been integrated into:

1. **TransactionForm** (`src/components/TransactionForm.tsx`)
   - Used for transaction amount input
   - Automatically formats based on user's currency setting

2. **KasbonManager** (`src/components/KasbonManager.tsx`)
   - Used for loan amount input
   - Consistent formatting across all financial inputs

## User Experience

### Input Flow

1. **User selects currency** in Settings → Preferences
   - Choose between IDR (Indonesian Rupiah) or USD (US Dollar)

2. **User enters amount** in any form
   - TransactionForm, KasbonManager, etc.

3. **Real-time formatting** as they type
   - Thousand separators appear automatically
   - Currency symbol shown on blur

4. **Data saved** as clean number
   - Database stores: `50000`
   - User sees: `RP 50.000` or `$50,000.00`

### Edge Cases Handled

1. **Negative Numbers:** Supported, useful for corrections
2. **Large Numbers:** Formats correctly up to billions
3. **Decimal Numbers:**
   - USD: Supports 2 decimal places
   - IDR: Ignores decimals (whole numbers only)
4. **Empty Input:** Gracefully handles empty values
5. **Invalid Characters:** Prevents non-numeric input
6. **Currency Change:** Re-formats existing values when currency changes

## Validation & Security

### Input Validation
- Only numeric characters allowed
- Decimal point allowed only for USD
- Minimum value enforcement (typically 0 or greater)
- Required field validation

### Data Security
- Clean numeric values prevent injection attacks
- Proper parsing prevents calculation errors
- Type safety with TypeScript

## Benefits

1. **Improved User Experience**
   - Professional, familiar formatting
   - Easy to read large numbers
   - Clear currency indication

2. **Reduced Input Errors**
   - Immediate visual feedback
   - Restricted input prevents typos
   - Clear thousand separators reduce misreading

3. **International Support**
   - Proper formatting for multiple currencies
   - Region-specific number formats
   - Easy to extend for more currencies

4. **Consistent Behavior**
   - Same formatting across all forms
   - Predictable user experience
   - Maintains data integrity

## Future Enhancements

Potential improvements for future versions:

1. **Additional Currencies**
   - Euro (EUR), British Pound (GBP), etc.
   - Configurable decimal places per currency

2. **Locale-Specific Formatting**
   - Date and time formatting
   - Number grouping variations

3. **Currency Conversion**
   - Real-time exchange rates
   - Multi-currency transactions

4. **Input Masks**
   - Phone numbers, credit cards
   - Custom format templates

## Testing

### Manual Testing Checklist

- [ ] Enter small amounts (< 1,000)
- [ ] Enter medium amounts (1,000 - 999,999)
- [ ] Enter large amounts (> 1,000,000)
- [ ] Test decimal input for USD
- [ ] Test decimal input for IDR (should ignore)
- [ ] Change currency and verify re-formatting
- [ ] Test form submission with formatted values
- [ ] Verify database stores clean numbers
- [ ] Test on mobile devices
- [ ] Test with keyboard and mouse input

### Expected Behavior

| Input | Currency | Display | Stored Value |
|-------|----------|---------|--------------|
| 50000 | IDR | RP 50.000 | 50000 |
| 50000 | USD | $50,000.00 | 50000 |
| 1500.50 | USD | $1,500.50 | 1500.50 |
| 1500.50 | IDR | RP 1.500 | 1500.50 |

## Troubleshooting

### Issue: Formatting not applying
**Solution:** Check that SettingsContext is properly providing currency value

### Issue: Wrong thousand separator
**Solution:** Verify currency setting in user preferences

### Issue: Can't enter decimals
**Solution:** Decimals only work for USD, IDR uses whole numbers

### Issue: Value not saving correctly
**Solution:** Ensure parseFloat is used when saving to database

## API Reference

### CurrencyInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Current numeric value |
| onChange | (value: string) => void | required | Callback when value changes |
| placeholder | string | '0' | Placeholder text |
| required | boolean | false | Field is required |
| min | string | '0' | Minimum allowed value |
| className | string | '' | Additional CSS classes |
| id | string | undefined | Input element ID |
| disabled | boolean | false | Disable input |

### Context Methods

```typescript
// From SettingsContext
const { currency, formatCurrency } = useSettings();

// Format a number for display
const formatted = formatCurrency(50000);
// Returns: "Rp50.000" or "$50,000.00" based on currency setting
```

## Conclusion

The currency formatting feature provides a professional, user-friendly way to handle financial inputs across the application. It maintains data integrity while providing an excellent user experience with real-time visual feedback and proper international formatting.
