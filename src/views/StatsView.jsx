import { useMemo } from 'react';
import { BarChart3, Award, Flame, TrendingUp } from 'lucide-react';
import { useRachas } from '../lib/RachasContext';
import { addDaysStr, todayStr, DIAS } from '../lib/dates';
import { currentStreak, longestStreak, completionRate, aggregateDayStats } from '../lib/streaks';
import { HabitIcon } from '../lib/iconMap';
import EmptyState from '../components/EmptyState';

function StatsView() {
  const { activeHabits, logs } = useRachas();
  const today = todayStr();

  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const dateStr = addDaysStr(today, -(13 - i));
    return { dateStr, ...aggregateDayStats(activeHabits, logs, dateStr) };
  }), [activeHabits, logs, today]);

  const overallRate = useMemo(() => {
    const rates = activeHabits.map((h) => completionRate(h, logs, 30)).filter((r) => r !== null);
    if (rates.length === 0) return null;
    return rates.reduce((a, b) => a + b, 0) / rates.length;
  }, [activeHabits, logs]);

  const ranked = useMemo(() => activeHabits
    .map((h) => ({ habit: h, rate: completionRate(h, logs, 30) }))
    .filter((r) => r.rate !== null)
    .sort((a, b) => b.rate - a.rate), [activeHabits, logs]);

  const dayOfWeekStats = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => ({ due: 0, done: 0 }));
    let cursor = addDaysStr(today, -55);
    while (cursor <= today) {
      const { due, done } = aggregateDayStats(activeHabits, logs, cursor);
      const jsDay = new Date(cursor.replace(/-/g, '/')).getDay();
      buckets[jsDay].due += due;
      buckets[jsDay].done += done;
      cursor = addDaysStr(cursor, 1);
    }
    return buckets.map((b, i) => ({ day: DIAS[i], pct: b.due === 0 ? null : b.done / b.due }));
  }, [activeHabits, logs, today]);

  const bestDay = dayOfWeekStats.filter((d) => d.pct !== null).sort((a, b) => b.pct - a.pct)[0];
  const worstDay = dayOfWeekStats.filter((d) => d.pct !== null).sort((a, b) => a.pct - b.pct)[0];

  if (activeHabits.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={BarChart3} title="Aún no hay estadísticas" description="Completa algunos hábitos y aquí verás cómo evolucionas." />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Estadísticas</h1>

      <div className="card stat-hero">
        <div>
          <p className="text-secondary" style={{ fontSize: 13 }}>Cumplimiento medio (30 días)</p>
          <p className="stat-hero-value mono-num">{overallRate === null ? '—' : `${Math.round(overallRate * 100)}%`}</p>
        </div>
        <TrendingUp size={26} className="text-secondary" strokeWidth={2} />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p className="section-title">Últimos 14 días</p>
        <div className="trend-chart">
          {trend.map((t) => (
            <div className="trend-bar-wrap" key={t.dateStr} title={`${t.dateStr}: ${t.pct === null ? 'sin datos' : Math.round(t.pct * 100) + '%'}`}>
              <div
                className="trend-bar"
                style={{
                  height: `${t.pct === null ? 3 : Math.max(4, t.pct * 64)}px`,
                  background: t.pct === null ? 'var(--surface-2)' : t.pct >= 1 ? 'var(--mint)' : 'var(--accent)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {ranked.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <p className="section-title">Cumplimiento por hábito (30 días)</p>
          {ranked.map(({ habit, rate }) => (
            <div className="stat-bar-row" key={habit.id}>
              <div className="stat-bar-label">
                <HabitIcon name={habit.icon} size={14} style={{ color: habit.color }} />
                <span>{habit.name}</span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{ width: `${Math.round(rate * 100)}%`, background: habit.color }} />
              </div>
              <span className="mono-num stat-bar-pct">{Math.round(rate * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <p className="section-title">Rachas y récords</p>
        <div className="records-grid">
          {activeHabits.map((h) => {
            const cs = currentStreak(h, logs);
            const ls = longestStreak(h, logs);
            return (
              <div className="record-card" key={h.id}>
                <div className="record-icon" style={{ background: `${h.color}22`, color: h.color }}>
                  <HabitIcon name={h.icon} size={16} />
                </div>
                <span className="record-name">{h.name}</span>
                <div className="record-numbers">
                  <span className="mono-num"><Flame size={12} className={cs > 0 ? 'flame-lit' : ''} /> {cs}</span>
                  <span className="mono-num record-best"><Award size={12} /> {ls}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bestDay && worstDay && bestDay.day !== worstDay.day && (
        <div className="card" style={{ marginTop: 12 }}>
          <p className="section-title">Patrones semanales</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>
            Sueles cumplir mejor los <strong style={{ color: 'var(--mint)', textTransform: 'capitalize' }}>{bestDay.day}</strong> ({Math.round(bestDay.pct * 100)}%)
            {' '}y te cuesta más los <strong style={{ color: 'var(--rose)', textTransform: 'capitalize' }}>{worstDay.day}</strong> ({Math.round(worstDay.pct * 100)}%).
          </p>
        </div>
      )}
    </div>
  );
}

export default StatsView;
