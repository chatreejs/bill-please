export const currencyFormat = (number: number): string => {
  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const numberFormat = (
  number: number,
  maximumFractionDigits = 2,
): string => {
  return number.toLocaleString(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });
};

export const ellipsisText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
