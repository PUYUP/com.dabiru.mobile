export function generateDays(date: Date = new Date()): { day: number; startDate: Date; endDate: Date }[] {
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(date);
  currentMonday.setDate(date.getDate() + daysToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() + i);

    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    return {
      day: i + 1,
      startDate,
      endDate,
    };
  });
}