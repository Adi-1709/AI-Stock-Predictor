/**
 * Market Helper Utility
 * Automatically detects market, exchange, currency, symbol, country, flag and formats price dynamically.
 */

export const getMarketData = (symbol, price) => {
  let market = 'USA';
  let exchange = 'NASDAQ';
  let currency = 'USD';
  let currencySymbol = '$';
  let country = 'USA';
  let countryFlag = '🇺🇸';

  const upperSymbol = symbol.toUpperCase();
  if (upperSymbol.endsWith('.NS') || upperSymbol.endsWith('.BO')) {
    market = 'India';
    exchange = upperSymbol.endsWith('.NS') ? 'NSE' : 'BSE';
    currency = 'INR';
    currencySymbol = '₹';
    country = 'India';
    countryFlag = '🇮🇳';
  } else if (upperSymbol.endsWith('.L')) {
    market = 'UK';
    exchange = 'LSE';
    currency = 'GBP';
    currencySymbol = '£';
    country = 'UK';
    countryFlag = '🇬🇧';
  } else if (upperSymbol.endsWith('.T')) {
    market = 'Japan';
    exchange = 'TSE';
    currency = 'JPY';
    currencySymbol = '¥';
    country = 'Japan';
    countryFlag = '🇯🇵';
  }

  const formatted_price = formatPrice(price, currency);

  return {
    ticker: upperSymbol,
    market,
    exchange,
    currency,
    symbol: currencySymbol,
    country,
    countryFlag,
    formatted_price
  };
};

export const formatPrice = (value, currency) => {
  if (value === undefined || value === null || isNaN(value)) return '';
  
  let locale = 'en-US';
  if (currency === 'INR') locale = 'en-IN';
  else if (currency === 'GBP') locale = 'en-GB';
  else if (currency === 'JPY') locale = 'ja-JP';

  // Indian/US/other pricing formatting
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
