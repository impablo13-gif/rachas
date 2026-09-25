import { Check, Flame, Minus, Plus } from 'lucide-react';
import { HabitIcon } from '../lib/iconMap';
import { useRachas } from '../lib/RachasContext';
import { currentStreak, getValue, isCompletedOn } from '../lib/streaks';
import { todayStr } from '../lib/dates';

function HabitCard({ habit, onOpen }) {
  const { logs, toggleComplete, incrementAmount } = useRachas();
  const today = todayStr();
  const value = getValue(logs, habit.id, today);
  const done = isCompletedOn(habit, logs, today);
  const streak = currentStreak(habit, logs);

  return (
    <div className={`habit-card ${done ? 'done' : ''}`}>
      <button className="habit-card-icon" style={{ background: `${habit.color}22`, color: habit.color }} onClick={() => onOpen(habit)}>
        <HabitIcon name={habit.icon} size={20} strokeWidth={2.2} />
      </button>
      <button className="habit-card-body" onClick={() => onOpen(habit)}>
        <span className="habit-card-name">{habit.name}</span>
        <span className="habit-card-meta">
          {streak > 0 && (
            <span className="streak-badge">
              <Flame size={13} strokeWidth={2.4} className={streak >= 3 ? 'flame-lit' : ''} />
              {streak}
            </span>
          )}
          {habit.type === 'amount' && (
            <span className="mono-num">{value} / {habit.target} {habit.unit}</span>
          )}
        </span>
      </button>

      {habit.type === 'check' ? (
        <button
          className={`check-toggle ${done ? 'checked' : ''}`}
          style={done ? { background: habit.color, borderColor: habit.color } : undefined}
          onClick={() => toggleComplete(habit, today)}
          aria-label={done ? 'Marcar como no completado' : 'Marcar como completado'}
        >
          {done && <Check size={16} strokeWidth={3} color="#0a0c0f" />}
        </button>
      ) : (
        <div className="amount-stepper">
          <button className="stepper-btn" onClick={() => incrementAmount(habit, today, -1)} aria-label="Restar">
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <button className="stepper-btn primary" style={done ? { background: habit.color, color: '#0a0c0f' } : undefined} onClick={() => incrementAmount(habit, today, 1)} aria-label="Sumar">
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

export default HabitCard;
