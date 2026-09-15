import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString, formatPattern = 'dd MMM yyyy') => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, formatPattern) : dateString;
  } catch {
    return dateString;
  }
};

export const getMonthYear = (date = new Date()) => {
  return format(date, 'MMMM yyyy');
};

export const getCurrentISODate = () => {
  return new Date().toISOString().split('T')[0];
};
