import { useState } from 'react';
import { Plus, ListChecks, ChevronUp, ChevronDown, Archive, ArchiveRestore, Settings } from 'lucide-react';
import { useRachas } from '../lib/RachasContext';
import { HabitIcon } from '../lib/iconMap';
import { currentStreak } from '../lib/streaks';
import HabitForm from '../components/HabitForm';
import EmptyState from '../components/EmptyState';

function scheduleLabel(schedule) {
  if (schedule.mode === 'daily') return 'Todos los días';
  if (schedule.mode === 'timesPerWeek') return `${schedule.timesPerWeek}x por semana`;
  const n = schedule.days?.length || 0;
  return n === 0 ? 'Sin días asignados' : `${n} día${n > 1 ? 's' : ''} por semana`;
}

function HabitsView({ onOpenSettings }) {
  const {
    activeHabits, data, logs, addHabit, updateHabit, deleteHabit, archiveHabit, reorderHabits,
  } = useRachas();
  const [editing, setEditing] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const archived = data.habits.filter((h) => h.archived);

  const move = (id, dir) => {
    const ids = activeHabits.map((h) => h.id);
    const idx = ids.indexOf(id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[idx], ids[swapWith]] = [ids[swapWith], ids[idx]];
    reorderHabits(ids);
  };

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
        <h1 style={{ fontSize: 22 }}>Tus hábitos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Ajustes"><Settings size={19} /></button>
          <button className="btn btn-secondary" onClick={() => setEditing('new')}>
            <Plus size={17} strokeWidth={2.5} /> Nuevo
          </button>
        </div>
      </header>

      {activeHabits.length === 0 ? (
        <div className="card" style={{ marginTop: 12 }}>
          <EmptyState icon={ListChecks} title="No tienes hábitos activos" description="Crea uno para empezar a construir tu constancia." />
        </div>
      ) : (
        <div className="manage-list">
          {activeHabits.map((h, i) => (
            <div className="manage-row" key={h.id}>
              <div className="manage-reorder">
                <button className="icon-btn tiny" disabled={i === 0} onClick={() => move(h.id, -1)} aria-label="Subir"><ChevronUp size={15} /></button>
                <button className="icon-btn tiny" disabled={i === activeHabits.length - 1} onClick={() => move(h.id, 1)} aria-label="Bajar"><ChevronDown size={15} /></button>
              </div>
              <button className="manage-icon" style={{ background: `${h.color}22`, color: h.color }} onClick={() => setEditing(h)}>
                <HabitIcon name={h.icon} size={18} />
              </button>
              <button className="manage-body" onClick={() => setEditing(h)}>
                <span className="habit-card-name">{h.name}</span>
                <span className="text-secondary" style={{ fontSize: 13 }}>
                  {scheduleLabel(h.schedule)} · racha {currentStreak(h, logs)}
                </span>
              </button>
              <button className="icon-btn" onClick={() => archiveHabit(h.id, true)} aria-label="Archivar">
                <Archive size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button className="btn-ghost" style={{ fontSize: 13.5, fontWeight: 600 }} onClick={() => setShowArchived((v) => !v)}>
            {showArchived ? 'Ocultar' : 'Ver'} archivados ({archived.length})
          </button>
          {showArchived && (
            <div className="manage-list" style={{ marginTop: 10 }}>
              {archived.map((h) => (
                <div className="manage-row archived" key={h.id}>
                  <button className="manage-icon" style={{ background: `${h.color}18`, color: h.color }} onClick={() => setEditing(h)}>
                    <HabitIcon name={h.icon} size={18} />
                  </button>
                  <button className="manage-body" onClick={() => setEditing(h)}>
                    <span className="habit-card-name">{h.name}</span>
                  </button>
                  <button className="icon-btn" onClick={() => archiveHabit(h.id, false)} aria-label="Restaurar">
                    <ArchiveRestore size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editing && (
        <HabitForm
          habit={editing === 'new' ? null : editing}
          showSuggestions={activeHabits.length === 0}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

export default HabitsView;
