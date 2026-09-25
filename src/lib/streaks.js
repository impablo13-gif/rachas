import { addDaysStr, dayOfWeekMon0, parseDateStr, todayStr, getWeekDates, toDateStr } from './dates';

const MILESTONES = [3, 7, 14, 21, 30, 50, 66, 100, 200, 365];

function isDueOn(habit, dateStr) {
  const mode = habit.schedule?.mode || 'daily';
  if (mode === 'timesPerWeek') return true; // flexible: candidate every day
  if (mode === 'weekdays') {
    const mon0 = dayOfWeekMon0(parseDateStr(dateStr));
    return (habit.schedule.days || []).includes(mon0);
  }
  return true; // daily
}

function getValue(logs, habitId, dateStr) {
  return logs[habitId]?.[dateStr] || 0;
}

function isCompletedOn(habit, logs, dateStr) {
  const v = getValue(logs, habit.id, dateStr);
  if (habit.type === 'amount') return v >= habit.target;
  return v >= 1;
}

function habitCreatedStr(habit) {
  return toDateStr(new Date(habit.createdAt));
}

// Current streak in days, for daily/weekdays habits.
function currentStreakDaily(habit, logs, today = todayStr()) {
  let streak = 0;
  let cursor = today;
  const createdStr = habitCreatedStr(habit);
  // if today is due but not yet completed, start counting from yesterday (grace period)
  if (isDueOn(habit, cursor) && !isCompletedOn(habit, logs, cursor)) {
    cursor = addDaysStr(cursor, -1);
  }
  while (cursor >= createdStr) {
    if (isDueOn(habit, cursor)) {
      if (isCompletedOn(habit, logs, cursor)) {
        streak += 1;
      } else {
        break;
      }
    }
    cursor = addDaysStr(cursor, -1);
  }
  return streak;
}

function longestStreakDaily(habit, logs) {
  const createdStr = habitCreatedStr(habit);
  const today = todayStr();
  let longest = 0;
  let running = 0;
  let cursor = createdStr;
  while (cursor <= today) {
    if (isDueOn(habit, cursor)) {
      if (isCompletedOn(habit, logs, cursor)) {
        running += 1;
        longest = Math.max(longest, running);
      } else {
        running = 0;
      }
    }
    cursor = addDaysStr(cursor, 1);
  }
  return longest;
}

function weekCompletions(habit, logs, weekDates) {
  return weekDates.reduce((n, d) => n + (isCompletedOn(habit, logs, toDateStr(d)) ? 1 : 0), 0);
}

// Streak in weeks for timesPerWeek habits.
function currentStreakWeekly(habit, logs, todayDate = new Date()) {
  const target = habit.schedule.timesPerWeek || 1;
  let streak = 0;
  let weekStartDate = getWeekDates(todayDate)[0];
  // current (in-progress) week: only counts if already met
  let dates = getWeekDates(todayDate);
  if (weekCompletions(habit, logs, dates) >= target) {
    streak += 1;
  }
  // walk backward through fully-elapsed weeks
  let cursor = weekStartDate;
  const createdStr = habitCreatedStr(habit);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 7);
    if (toDateStr(cursor) < createdStr && toDateStr(getWeekDates(cursor)[6]) < createdStr) break;
    const wDates = getWeekDates(cursor);
    if (weekCompletions(habit, logs, wDates) >= target) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function currentStreak(habit, logs) {
  if (habit.schedule?.mode === 'timesPerWeek') return currentStreakWeekly(habit, logs);
  return currentStreakDaily(habit, logs);
}

function longestStreak(habit, logs) {
  if (habit.schedule?.mode === 'timesPerWeek') {
    // approximate: same walk but track max
    const target = habit.schedule.timesPerWeek || 1;
    const createdStr = habitCreatedStr(habit);
    let cursor = getWeekDates(new Date())[0];
    let longest = 0;
    let running = 0;
    const weeks = [];
    let w = getWeekDates(new Date(createdStr));
    while (toDateStr(w[0]) <= toDateStr(cursor)) {
      weeks.push(w);
      const next = new Date(w[0]);
      next.setDate(next.getDate() + 7);
      w = getWeekDates(next);
    }
    weeks.forEach((wk) => {
      if (weekCompletions(habit, logs, wk) >= target) {
        running += 1;
        longest = Math.max(longest, running);
      } else {
        running = 0;
      }
    });
    return longest;
  }
  return longestStreakDaily(habit, logs);
}

function completionRate(habit, logs, days = 30) {
  const today = todayStr();
  let due = 0;
  let done = 0;
  let cursor = addDaysStr(today, -(days - 1));
  const createdStr = habitCreatedStr(habit);
  while (cursor <= today) {
    if (cursor >= createdStr && isDueOn(habit, cursor)) {
      due += 1;
      if (isCompletedOn(habit, logs, cursor)) done += 1;
    }
    cursor = addDaysStr(cursor, 1);
  }
  return due === 0 ? null : done / due;
}

function aggregateDayStats(habits, logs, dateStr) {
  let due = 0;
  let done = 0;
  habits.forEach((h) => {
    if (habitCreatedStr(h) > dateStr) return;
    if (!isDueOn(h, dateStr)) return;
    due += 1;
    if (isCompletedOn(h, logs, dateStr)) done += 1;
  });
  return { due, done, pct: due === 0 ? null : done / due };
}

function nextMilestone(streak) {
  return MILESTONES.find((m) => m > streak) || null;
}

function hitMilestone(streak) {
  return MILESTONES.includes(streak) ? streak : null;
}

export {
  MILESTONES, isDueOn, isCompletedOn, getValue, currentStreak, longestStreak,
  completionRate, nextMilestone, hitMilestone, weekCompletions, aggregateDayStats,
};
