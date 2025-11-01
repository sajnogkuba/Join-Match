import dayjs, { Dayjs } from 'dayjs'

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
  
export function parseLocalDate(date: any): Dayjs {
  if (Array.isArray(date)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = date
    return dayjs(new Date(year, month - 1, day, hour, minute, second))
  }
  return dayjs(date)
}

export function formatLocalDate(date: any, fmt = 'DD.MM.YYYY HH:mm'): string {
  return parseLocalDate(date).format(fmt)
}
