export const formatCurrency = (value, currency = 'USD') => {
  if (!currency) currency = 'USD';
  const cleanCurrency = currency.toUpperCase();
  if (value === undefined || value === null || isNaN(value)) {
    const symbol = cleanCurrency === 'INR' ? '₹' : cleanCurrency === 'GBP' ? '£' : cleanCurrency === 'JPY' ? '¥' : '$';
    return `${symbol}0.00`;
  }

  let locale = 'en-US';
  if (cleanCurrency === 'INR') locale = 'en-IN';
  else if (cleanCurrency === 'GBP') locale = 'en-GB';
  else if (cleanCurrency === 'JPY') locale = 'ja-JP';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cleanCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatVolume = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  if (value >= 1.0e9) return `${(value / 1.0e9).toFixed(2)}B`;
  if (value >= 1.0e6) return `${(value / 1.0e6).toFixed(2)}M`;
  if (value >= 1.0e3) return `${(value / 1.0e3).toFixed(2)}K`;
  return value.toString();
};
