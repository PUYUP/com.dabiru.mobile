export function generateYears(previousYears: number = 2, nextYears: number = 5): { year: number; startDate: Date; endDate: Date }[] {
  const currentYear = new Date().getFullYear();
  const total = previousYears + 1 + nextYears;

  return Array.from({ length: total }, (_, i) => {
    const offset = i - previousYears; // negative = past, 0 = current, positive = future
    const year = currentYear + offset;

    const startDate = new Date(year, 0, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    return {
      year,
      startDate,
      endDate,
    };
  });
}