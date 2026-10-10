import dayjs from 'dayjs';

export const getBuildNumber = () => {
  const minutes = dayjs(BUILD_DATE).diff(
    dayjs(BUILD_DATE).startOf('day'),
    'minute',
  );
  const formattedDate = dayjs(BUILD_DATE).format('YYMMDD');
  const intervals = Math.floor(minutes / 2);
  return `${formattedDate}${intervals}`;
};
