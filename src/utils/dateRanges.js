export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
};

export const getPeriodRange = (period = "month") => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "week") {
    start.setDate(now.getDate() - now.getDay());
  } else if (period === "year") {
    start.setMonth(0, 1);
  } else {
    start.setDate(1);
  }

  const previousEnd = new Date(start);
  const previousStart = new Date(start);

  if (period === "week") {
    previousStart.setDate(previousStart.getDate() - 7);
  } else if (period === "year") {
    previousStart.setFullYear(previousStart.getFullYear() - 1);
  } else {
    previousStart.setMonth(previousStart.getMonth() - 1);
  }

  return { start, end, previousStart, previousEnd };
};

export const getLastSixMonthStarts = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return date;
  });
};
