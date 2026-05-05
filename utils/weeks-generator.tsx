export function generateWeeks(previousWeeks: number = 3, nextWeeks: number = 4): { week: number; startDate: Date; endDate: Date }[] {
  const now = new Date();

  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() + daysToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const getISOWeekNumber = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
      )
    );
  };

  const total = previousWeeks + 1 + nextWeeks;

  return Array.from({ length: total }, (_, i) => {
    const offset = i - previousWeeks; // negative = past, 0 = current, positive = future
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() + offset * 7);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return {
      week: getISOWeekNumber(startDate),
      startDate,
      endDate,
    };
  });
}
