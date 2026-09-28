// Format numbers into currency strings
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0';
  
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }

  if (isNaN(amount)) return '$0';

  return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('vi-VN', options);
};
