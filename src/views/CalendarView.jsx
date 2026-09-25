import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useRachas } from '../lib/RachasContext';
import {
  DIAS_MON0_CORTOS, daysInMonth, toDateStr, todayStr, formatMonthYear, dayOfWeekMon0,
} from '../lib/dates';
import { aggregateDayStats, isCompletedOn } from '../lib/streaks';
import { HabitIcon } from '../lib/iconMap';
import EmptyState from '../components/EmptyState';

function cellColor(pct, color) {
  if (pct === null) return 'transparent';
  if (pct === 0) return 'var(--surface-2)';
  if (pct < 1) return `${color}55`;
  return color;
}

function MonthGrid({ year, month, habit, habits, logs }) {
  const today = todayStr();
  const total = daysInMonth(year, month);
  const first = new Date(year, month, 1);
  const leadingBlanks = dayOfWeekMon0(first);
  const cells = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) cells.push(new Date(year, month, d));

  return (
    <div className="month-grid">
      {DIAS_MON0_CORTOS.map((d, i) => <span key={i} className="month-grid-label">{d}</span>)}
      {cells.map((date, i) => {
        if (!date) return <span key={`b${i}`} />;
        const dateStr = toDateStr(date);
        const isFuture = dateStr > today;
        let pct = null;
        if (!isFuture) {
          if (habit) {
            pct = isCompletedOn(habit, logs, dateStr) ? 1 : 0;
          } else {
            pct = aggregateDayStats(habits, logs, dateStr).pct;
          }
        }
        const color = habit ? habit.color : 'var(--accent)';
        return (
          <div key={dateStr} className={`month-cell ${dateStr === today ? 'is-today' : ''} ${isFuture ? 'is-future' : ''}`}>
            <span
              className="month-cell-fill"
              style={{ background: isFuture ? 'transparent' : cellColor(pct, color) }}
            >
              {date.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({ habit, habits, logs, weeks = 18 }) {
  const today = new Date();
  const cols = [];
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const col = [];
    for (let d = 6; d >= 0; d -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - w * 7 - d + dayOfWeekMon0(today));
      col.push(date);
    }
    cols.push(col);
  }
  return (
    <div className="heatmap">
      {cols.map((col, ci) => (
        <div className="heatmap-col" key={ci}>
          {col.map((date, ri) => {
            const dateStr = toDateStr(date);
            const isFuture = dateStr > todayStr();
            let pct = null;
            if (!isFuture) {
              pct = habit
                ? (isCompletedOn(habit, logs, dateStr) ? 1 : 0)
                : aggregateDayStats(habits, logs, dateStr).pct;
            }
            const color = habit ? habit.color : 'var(--accent)';
            return (
              <div
                key={ri}
                className="heatmap-cell"
                title={dateStr}
                style={{ background: isFuture ? 'transparent' : cellColor(pct, color) }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CalendarView() {
  const { activeHabits, logs } = useRachas();
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedId, setSelectedId] = useState('all');

  const selectedHabit = selectedId === 'all' ? null : activeHabits.find((h) => h.id === selectedId);

  const changeMonth = (delta) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  if (activeHabits.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={CalendarDays} title="Todavía no hay nada que mostrar" description="En cuanto crees un hábito, aquí verás tu calendario de constancia." />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Calendario</h1>

      <div className="habit-filter-row">
        <button className={`chip ${selectedId === 'all' ? 'selected' : ''}`} onClick={() => setSelectedId('all')}>Todos</button>
        {activeHabits.map((h) => (
          <button
            key={h.id}
            className={`chip ${selectedId === h.id ? 'selected' : ''}`}
            style={selectedId === h.id ? { borderColor: h.color, color: 'var(--text)' } : undefined}
            onClick={() => setSelectedId(h.id)}
          >
            <HabitIcon name={h.icon} size={13} />
            {h.name}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="month-nav">
          <button className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Mes anterior"><ChevronLeft size={19} /></button>
          <span className="month-nav-label">{formatMonthYear(cursor)}</span>
          <button className="icon-btn" onClick={() => changeMonth(1)} aria-label="Mes siguiente"><ChevronRight size={19} /></button>
        </div>
        <MonthGrid year={cursor.getFullYear()} month={cursor.getMonth()} habit={selectedHabit} habits={activeHabits} logs={logs} />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p className="section-title">Últimas {18} semanas</p>
        <Heatmap habit={selectedHabit} habits={activeHabits} logs={logs} />
      </div>
    </div>
  );
}

export default CalendarView;
