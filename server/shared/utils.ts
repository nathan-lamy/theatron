export const getDaysDiff = (date1: Date, date2: Date = new Date()) =>
  Math.abs(
    Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
  );
