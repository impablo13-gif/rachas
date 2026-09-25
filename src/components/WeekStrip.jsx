import { DIAS_MON0_CORTOS, getWeekDates, toDateStr, todayStr, dayOfWeekMon0 } from '../lib/dates';
import { useRachas } from '../lib/RachasContext';
import { isDueOn, isCompletedOn } from '../lib/streaks';

function WeekStrip() {
  const { activeHabits, logs } = useRachas();
  const week = getWeekDates(new Date());
  const today = todayStr();
  const todayIdx = dayOfWeekMon0(new Date());

  const dayStats = week.map((d) => {
    const dateStr = toDateStr(d);
    const due = activeHabits.filter((h) => isDueOn(h, dateStr) && dateStr <= today);
    const done = due.filter((h) => isCompletedOn(h, logs, dateStr));
    return { dateStr, due: due.length, done: done.length };
  });

  return (
    <div className="week-strip">
      {dayStats.map((d, i) => {
        const pct = d.due === 0 ? 0 : d.done / d.due;
        const isToday = i === todayIdx;
        const isFuture = d.dateStr > today;
        return (
          <div className="week-strip-day" key={d.dateStr}>
            <div
              className={`week-strip-dot ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}
              style={{
                background: isFuture
                  ? 'transparent'
                  : pct >= 1 ? 'var(--mint)' : pct > 0 ? 'var(--amber)' : 'var(--surface-2)',
                opacity: d.due === 0 && !isFuture ? 0.3 : 1,
              }}
            />
            <span className={`week-strip-label ${isToday ? 'today' : ''}`}>{DIAS_MON0_CORTOS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default WeekStrip;
