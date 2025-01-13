export const currencyFormat = (number: number): string => {
  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};
