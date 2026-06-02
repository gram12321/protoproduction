import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Unified number formatting function that handles regular numbers, currency, and compact notation
 * Replaces formatCurrency and formatCompact functions
 *
 * @param value The number to format
 * @param options Formatting options
 * @returns Formatted number string
 *
 * @example
 * // Regular number formatting
 * formatNumber(1234.5) // "1.234,50" (German locale)
 * formatNumber(0.987, { adaptiveNearOne: true }) // "0.98700" (extra precision near 1.0)
 * formatNumber(0.01, { smartMaxDecimals: true }) // "0.01" (2 decimals for small numbers)
 * formatNumber(5.2, { smartMaxDecimals: true }) // "5.2" (1 decimal for medium numbers)
 * formatNumber(15, { smartMaxDecimals: true }) // "15" (0 decimals for large numbers)
 *
 * // Currency formatting
 * formatNumber(1234.56, { currency: true }) // "€1,235"
 * formatNumber(1234567, { currency: true, compact: true }) // "€1.2M"
 *
 * // Compact notation
 * formatNumber(1234567, { compact: true }) // "1.2M"
 * formatNumber(1234567, { compact: true, decimals: 2 }) // "1.23M"
 */
export function formatNumber(value: number, options?: {
  decimals?: number;
  forceDecimals?: boolean;
  smartDecimals?: boolean;
  smartMaxDecimals?: boolean; // when true, reduce decimals for larger numbers (0-1%: 2-3 decimals, 1-10%: 1 decimal, 10%+: 0 decimals)
  adaptiveNearOne?: boolean; // when true, increase decimals near 1.0 (e.g., 0.95-1.0)
  currency?: boolean; // when true, formats as currency with € symbol
  compact?: boolean; // when true, uses compact notation (K, M, B, T)
  percent?: boolean; // when true, formats as a percentage
  percentIsDecimal?: boolean; // when percent is true: input is decimal (0-1) if true, else 0-100
}): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return options?.currency ? "€0" : "0";
  }

  const {
    decimals,
    forceDecimals = false,
    smartDecimals = false,
    smartMaxDecimals = false,
    adaptiveNearOne = true,
    currency = false,
    compact = false,
    percent = false,
    percentIsDecimal = true,
  } = options || {};

  // Handle percentage formatting first (ignores compact/currency)
  if (percent) {
    const finalDecimals = decimals !== undefined ? decimals : 1;
    const percentage = percentIsDecimal ? value * 100 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).format(percentage / 100);
  }

  // Handle compact notation (with or without currency)
  if (compact) {
    const absValue = Math.abs(value);
    // Default decimals for compact: 1 for currency, 1 for regular
    const compactDecimals = decimals !== undefined ? decimals : 1;

    let compactValue: string;
    if (absValue >= 1e12) {
      compactValue = (value / 1e12).toFixed(compactDecimals) + 'T';
    } else if (absValue >= 1e9) {
      compactValue = (value / 1e9).toFixed(compactDecimals) + 'B';
    } else if (absValue >= 1e6) {
      compactValue = (value / 1e6).toFixed(compactDecimals) + 'M';
    } else if (absValue >= 1e3) {
      compactValue = (value / 1e3).toFixed(compactDecimals) + 'K';
    } else {
      compactValue = value.toFixed(compactDecimals);
    }

    return currency ? `€${compactValue}` : compactValue;
  }

  // Handle currency formatting (non-compact)
  if (currency) {
    const finalDecimals = decimals !== undefined ? decimals : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).format(value);
  }

  // Regular number formatting (original logic)
  const effectiveDecimals = decimals ?? 2;

  // Smart max decimals: reduce decimals for larger numbers
  let calculatedDecimals = effectiveDecimals;
  if (smartMaxDecimals) {
    const absValue = Math.abs(value);
    if (absValue >= 10) {
      calculatedDecimals = 0; // 10%+: 0 decimals (15%, 100%)
    } else if (absValue >= 1) {
      calculatedDecimals = 1; // 1-10%: 1 decimal (1.2%, 8.5%)
    } else {
      calculatedDecimals = 2; // 0-1%: 2 decimals (0.01%, 0.15%)
    }
  }

  // Dynamically increase precision when approaching 1.0 to better show differences (e.g., 0.987 → 0.9870)
  // This ALWAYS takes precedence over smart options when near 1.0
  if (adaptiveNearOne && value < 1 && value >= 0.95) {
    calculatedDecimals = Math.max(calculatedDecimals, 4);
    if (value >= 0.98) {
      calculatedDecimals = Math.max(calculatedDecimals, 5);
    }
  }

  // For large numbers (>1000), don't show decimals unless forced
  if (Math.abs(value) >= 1000 && !forceDecimals && !smartDecimals) {
    return value.toLocaleString('de-DE', {
      maximumFractionDigits: 0
    });
  }

  // For small whole numbers, don't show decimals unless forced
  if (Number.isInteger(value) && !forceDecimals && !smartDecimals) {
    return value.toLocaleString('de-DE', {
      maximumFractionDigits: 0
    });
  }

  // Smart decimals mode: intelligent decimal display based on value magnitude
  // Always uses calculatedDecimals as base (includes smartMaxDecimals and adaptiveNearOne logic)
  // If decimals is specified: uses calculatedDecimals (preserves original behavior)
  // If decimals is NOT specified: uses calculatedDecimals for >=1, new intelligent logic for <1
  // NOTE: Uses minimumFractionDigits: 0 (when forceDecimals is false) to remove trailing zeros
  //       So whole numbers show as "6" not "6,0", but decimals show as "6,1"
  if (smartDecimals) {
    // Handle zero case: show "0" with no decimals
    if (value === 0) {
      return '0';
    }

    // If decimals is specified with smartDecimals, use calculatedDecimals (includes smartMaxDecimals and adaptiveNearOne)
    // This preserves the original behavior completely
    if (decimals !== undefined) {
      const maxDecimals = Math.min(calculatedDecimals, 6); // Cap for readability
      const formatted = value.toLocaleString('de-DE', {
        minimumFractionDigits: forceDecimals ? maxDecimals : 0,
        maximumFractionDigits: maxDecimals
      });
      return formatted;
    }

    // New intelligent behavior: no decimals specified
    // For values >= 1: use calculatedDecimals (which includes smartMaxDecimals: >=10: 0, >=1: 1, default: 2)
    if (Math.abs(value) >= 1) {
      const maxDecimals = Math.min(calculatedDecimals, 6);
      return value.toLocaleString('de-DE', {
        minimumFractionDigits: forceDecimals ? maxDecimals : 0,
        maximumFractionDigits: maxDecimals
      });
    }

    // Handle values > 0 and < 1: show 2 decimals after first non-zero digit
    // BUT respect adaptiveNearOne first (takes precedence)
    // Example: 0.999999 → 0.99999 (adaptiveNearOne: 5 decimals)
    // Example: 0.00044 → 0.00044 (first non-zero at pos 4, show positions 4-5, need 5 total decimals)
    // Example: 0.123 → 0.12 (first non-zero at pos 1, show positions 1-2, need 2 total decimals)
    const str = value.toString();
    const match = str.match(/0\.(0*)(\d+)/);

    if (match) {
      const leadingZeros = match[1].length;
      const maxDecimals = Math.min(leadingZeros + 2, 6); // First non-zero digit + 1 more
      return value.toLocaleString('de-DE', {
        minimumFractionDigits: forceDecimals ? maxDecimals : 0,
        maximumFractionDigits: maxDecimals
      });
    }

    return value.toLocaleString('de-DE', {
      minimumFractionDigits: forceDecimals ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  // Non-smart mode: preserve original behavior, use the requested decimals exactly
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: forceDecimals ? calculatedDecimals : 0,
    maximumFractionDigits: calculatedDecimals
  });
}
