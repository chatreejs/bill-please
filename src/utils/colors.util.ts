const colors = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
];

export const getColorByName = (name: string): string => {
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};
