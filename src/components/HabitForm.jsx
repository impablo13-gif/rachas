import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { HabitIcon } from '../lib/iconMap';
import { HABIT_COLORS, HABIT_ICONS, SUGGESTIONS } from '../lib/presets';
import { DIAS_MON0_CORTOS } from '../lib/dates';

const emptyForm = {
  name: '', icon: 'Circle', color: HABIT_COLORS[0], type: 'check', unit: '', target: 1,
  schedule: { mode: 'daily', days: [0, 1, 2, 3, 4, 5, 6], timesPerWeek: 5 }, note: '',
};

function HabitForm({ habit, onSave, onDelete, onClose, showSuggestions }) {
  const [form, setForm] = useState(() => (habit
    ? { ...emptyForm, ...habit, schedule: { ...emptyForm.schedule, ...habit.schedule } }
    : emptyForm));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setSchedule = (patch) => setForm((f) => ({ ...f, schedule: { ...f.schedule, ...patch } }));

  const toggleDay = (i) => {
    const days = form.schedule.days.includes(i)
      ? form.schedule.days.filter((d) => d !== i)
      : [...form.schedule.days, i].sort();
    setSchedule({ days });
  };

  const applySuggestion = (s) => {
    set({
      name: s.name, icon: s.icon, color: s.color, type: s.type,
      unit: s.unit || '', target: s.target || 1,
    });
  };

  const canSave = form.name.trim().length > 0
    && (form.schedule.mode !== 'weekdays' || form.schedule.days.length > 0);

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(form);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal-sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          <h2 className="modal-title">{habit ? 'Editar hábito' : 'Nuevo hábito'}</h2>
          <button type="button" className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {showSuggestions && !habit && (
          <div className="suggestion-chips">
            {SUGGESTIONS.map((s) => (
              <button type="button" key={s.name} className="chip" onClick={() => applySuggestion(s)}>
                <HabitIcon name={s.icon} size={14} />
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div className="field">
          <label htmlFor="habit-name">Nombre</label>
          <input
            id="habit-name" type="text" autoFocus value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="p. ej. Meditar 10 minutos"
            maxLength={40}
          />
        </div>

        <div className="field">
          <label>Icono</label>
          <div className="icon-grid">
            {HABIT_ICONS.map((name) => (
              <button
                type="button" key={name}
                className={`icon-swatch ${form.icon === name ? 'selected' : ''}`}
                style={form.icon === name ? { borderColor: form.color, color: form.color, background: `${form.color}1a` } : undefined}
                onClick={() => set({ icon: name })}
              >
                <HabitIcon name={name} size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Color</label>
          <div className="color-grid">
            {HABIT_COLORS.map((c) => (
              <button
                type="button" key={c}
                className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => set({ color: c })}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label>Tipo de seguimiento</label>
          <div className="segmented">
            <button type="button" className={form.type === 'check' ? 'active' : ''} onClick={() => set({ type: 'check' })}>Sí / No</button>
            <button type="button" className={form.type === 'amount' ? 'active' : ''} onClick={() => set({ type: 'amount' })}>Cantidad</button>
          </div>
        </div>

        {form.type === 'amount' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="habit-target">Objetivo diario</label>
              <input id="habit-target" type="number" min={1} value={form.target} onChange={(e) => set({ target: Number(e.target.value) || 1 })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="habit-unit">Unidad</label>
              <input id="habit-unit" type="text" value={form.unit} placeholder="min, vasos..." onChange={(e) => set({ unit: e.target.value })} maxLength={12} />
            </div>
          </div>
        )}

        <div className="field">
          <label>Frecuencia</label>
          <div className="segmented three">
            <button type="button" className={form.schedule.mode === 'daily' ? 'active' : ''} onClick={() => setSchedule({ mode: 'daily' })}>Todos los días</button>
            <button type="button" className={form.schedule.mode === 'weekdays' ? 'active' : ''} onClick={() => setSchedule({ mode: 'weekdays' })}>Días concretos</button>
            <button type="button" className={form.schedule.mode === 'timesPerWeek' ? 'active' : ''} onClick={() => setSchedule({ mode: 'timesPerWeek' })}>X veces/semana</button>
          </div>
        </div>

        {form.schedule.mode === 'weekdays' && (
          <div className="field">
            <div className="weekday-picker">
              {DIAS_MON0_CORTOS.map((d, i) => (
                <button
                  type="button" key={i}
                  className={`weekday-btn ${form.schedule.days.includes(i) ? 'selected' : ''}`}
                  style={form.schedule.days.includes(i) ? { background: form.color, color: '#0a0c0f' } : undefined}
                  onClick={() => toggleDay(i)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {form.schedule.mode === 'timesPerWeek' && (
          <div className="field">
            <label htmlFor="times-week">Veces por semana</label>
            <input id="times-week" type="number" min={1} max={7} value={form.schedule.timesPerWeek} onChange={(e) => setSchedule({ timesPerWeek: Math.min(7, Math.max(1, Number(e.target.value) || 1)) })} />
          </div>
        )}

        <div className="field">
          <label htmlFor="habit-note">Nota (opcional)</label>
          <textarea id="habit-note" value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="¿Por qué este hábito te importa?" maxLength={160} />
        </div>

        <div className="modal-actions">
          {habit && (
            confirmDelete ? (
              <div className="confirm-delete">
                <span>¿Eliminar «{habit.name}»?</span>
                <button type="button" className="btn btn-danger btn-ghost" onClick={() => onDelete(habit.id)}>Sí, eliminar</button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button>
              </div>
            ) : (
              <button type="button" className="icon-btn danger" onClick={() => setConfirmDelete(true)} aria-label="Eliminar hábito">
                <Trash2 size={18} />
              </button>
            )
          )}
          <button type="submit" className="btn btn-primary" disabled={!canSave} style={{ marginLeft: 'auto' }}>
            {habit ? 'Guardar cambios' : 'Crear hábito'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HabitForm;
