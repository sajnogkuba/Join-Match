import dayjs from 'dayjs';

export function formatEventDate(date: any) {
  if (Array.isArray(date)) {
    const [year, month, day, hour, minute] = date;
    return dayjs(new Date(year, month - 1, day, hour, minute)).format('dddd, DD.MM.YYYY • HH:mm');
  }
  return dayjs(date).format('dddd, DD.MM.YYYY • HH:mm');
}

export function parseEventDate(date: any) {
    if (Array.isArray(date)) {
      const [year, month, day, hour, minute] = date;
      return dayjs(new Date(year, month - 1, day, hour, minute));
    }
    return dayjs(date);
  }
  