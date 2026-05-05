export function generateMonths(year: number = new Date().getFullYear()): { month: number; startDate: Date; endDate: Date }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const startDate = new Date(year, i, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, i + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return {
      month: i + 1,
      startDate,
      endDate,
    };
  });
}
