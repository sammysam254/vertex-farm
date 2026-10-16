/**
 * Date and Weekly Cycle Utility for Vertex Farm
 * Cycle: Starts Sunday 00:00:00, Ends Saturday 23:59:59
 * Deadline: Saturday 23:59:59 (Sunday is Payday)
 */

export function getWeekCycleForDate(inputDate = new Date()) {
  const d = new Date(inputDate);
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Start date of week is Sunday
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);

  // End date of week is Saturday 23:59:59
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // Week number in year
  const firstDayOfYear = new Date(start.getFullYear(), 0, 1);
  const pastDaysOfYear = (start - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const id = `${start.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  const label = `${startFormatted} – ${endFormatted}`;

  const now = new Date();
  const isCurrentWeek = now >= start && now <= end;

  return {
    id,
    label,
    weekNumber,
    year: start.getFullYear(),
    startDate: start,
    endDate: end,
    deadline: end,
    isCurrentWeek,
    startDateStr: start.toISOString().split('T')[0],
    endDateStr: end.toISOString().split('T')[0]
  };
}

export function getCurrentWeekCycle() {
  return getWeekCycleForDate(new Date());
}

export function getPastWeeksList(numWeeks = 8) {
  const weeks = [];
  const current = new Date();
  
  for (let i = 0; i < numWeeks; i++) {
    const targetDate = new Date(current);
    targetDate.setDate(current.getDate() - (i * 7));
    const cycle = getWeekCycleForDate(targetDate);
    // avoid duplicates
    if (!weeks.some(w => w.id === cycle.id)) {
      weeks.push(cycle);
    }
  }
  return weeks;
}

export function getTimeUntilDeadline(deadline) {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      expired: true,
      text: 'Cycle Closed (Payday: Sunday)',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    expired: false,
    text: `${days}d ${hours}h ${minutes}m ${seconds}s until Sat 23:59`,
    days,
    hours,
    minutes,
    seconds
  };
}

export function formatUSD(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatDatePretty(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
