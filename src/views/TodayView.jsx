import { useMemo, useState } from 'react';
import { Plus, Sparkles, Flame, Trophy } from 'lucide-react';
import { useRachas } from '../lib/RachasContext';
import { greeting, formatLong, todayStr } from '../lib/dates';
import { isDueOn, isCompletedOn, currentStreak } from '../lib/streaks';
import HabitCard from '../components/HabitCard';
import HabitForm from '../components/HabitForm';
import EmptyState from '../components/EmptyState';
import ProgressRing from '../components/ProgressRing';
import WeekStrip from '../components/WeekStrip';

function TodayView() {
  const { activeHabits, logs, addHabit, updateHabit, deleteHabit } = useRachas();
  const [editing, setEditing] = useState(null); // null | 'new' | habit object
  const today = todayStr();

  const dueToday = useMemo(
    () => activeHabits.filter((h) => isDueOn(h, today)),
    [activeHabits, today],
  );
  const doneToday = dueToday.filter((h) => isCompletedOn(h, logs, today));
  const pct = dueToday.length === 0 ? 0 : doneToday.length / dueToday.length;
  const allDone = dueToday.length > 0 && doneToday.length === dueToday.length;

  const bestStreak = useMemo(() => {
    let best = null;
    activeHabits.forEach((h) => {
      const s = currentStreak(h, logs);
      if (s > 0 && (!best || s > best.streak)) best = { habit: h, streak: s };
    });
    return best;
  }, [activeHabits, logs]);

  const handleSave = (form) => {
    if (editing && editing !== 'new') updateHabit(editing.id, form);
    else addHabit(form);
    setEditing(null);
  };

  const handleDelete = (id) => {
    deleteHabit(id);
    setEditing(null);
  };

  return (
    <div>
      <header className="today-header">
        <div>
          <p className="text-secondary" style={{ fontSize: 14, fontWeight: 500 }}>{greeting()}</p>
          <h1 style={{ fontSize: 25 }}>{formatLong(new Date())}</h1>
        </div>
        {activeHabits.length > 0 && (
          <button className="btn btn-secondary add-btn-desktop" onClick={() => setEditing('new')}>
            <Plus size={17} strokeWidth={2.5} /> Nuevo hábito
          </button>
        )}
      </header>

      {activeHabits.length === 0 ? (
        <div className="card" style={{ marginTop: 20 }}>
          <EmptyState
            icon={Sparkles}
            title="Aún no tienes hábitos"
            description="Añade el primero: algo pequeño y concreto que quieras hacer con regularidad."
            action={(
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setEditing('new')}>
                <Plus size={17} strokeWidth={2.5} /> Crear mi primer hábito
              </button>
            )}
          />
        </div>
      ) : dueToday.length === 0 ? (
        <div className="card" style={{ marginTop: 20 }}>
          <EmptyState
            icon={Sparkles}
            title="Nada programado para hoy"
            description="Tus hábitos activos no tienen hoy como día asignado. Buen momento para descansar."
          />
        </div>
      ) : (
        <>
          {allDone && (
            <div className="all-done-banner">
              <Trophy size={18} strokeWidth={2.2} />
              Has completado todos tus hábitos de hoy.
            </div>
          )}
          <div className="habit-list">
            {dueToday.map((h) => <HabitCard key={h.id} habit={h} onOpen={setEditing} />)}
          </div>
        </>
      )}

      {activeHabits.length > 0 && (
        <div className="card today-progress-card">
          <ProgressRing size={104} stroke={9} pct={pct} color={allDone ? 'var(--mint)' : 'var(--accent)'}>
            <span className="ring-pct mono-num">{Math.round(pct * 100)}%</span>
            <span className="ring-sub">hoy</span>
          </ProgressRing>
          <div className="today-progress-info">
            <div className="progress-stat">
              <span className="progress-stat-value mono-num">{doneToday.length}/{dueToday.length}</span>
              <span className="text-secondary" style={{ fontSize: 13 }}>completados hoy</span>
            </div>
            {bestStreak && (
              <div className="progress-stat">
                <span className="progress-stat-value mono-num" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={16} className="flame-lit" strokeWidth={2.4} />{bestStreak.streak}
                </span>
                <span className="text-secondary" style={{ fontSize: 13 }}>racha de {bestStreak.habit.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeHabits.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <p className="section-title">Esta semana</p>
          <WeekStrip />
        </div>
      )}

      {activeHabits.length > 0 && (
        <button className="fab" onClick={() => setEditing('new')} aria-label="Añadir hábito">
          <Plus size={24} strokeWidth={2.4} />
        </button>
      )}

      {editing && (
        <HabitForm
          habit={editing === 'new' ? null : editing}
          showSuggestions={activeHabits.length < 3}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

export default TodayView;
