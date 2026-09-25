import { Flame } from 'lucide-react';
import { HabitIcon } from '../lib/iconMap';

const MESSAGES = {
  3: 'Ya tienes impulso.',
  7: 'Una semana entera. Esto ya es una rutina.',
  14: 'Dos semanas seguidas. Nada mal.',
  21: 'Tres semanas. Dicen que ahí se forma el hábito.',
  30: 'Un mes completo. Esto ya es tuyo.',
  50: '50 días. Constancia de verdad.',
  66: '66 días — el punto en el que un hábito se vuelve automático.',
  100: '100 días. Una barrera simbólica, superada.',
  200: '200 días. Esto ya es identidad, no disciplina.',
  365: 'Un año entero. Enhorabuena.',
};

const CONFETTI_COLORS = ['#7c5cff', '#34d399', '#fb7185', '#60a5fa', '#f472b6'];

function MilestoneModal({ habit, milestone, onClose }) {
  const pieces = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet milestone-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="confetti-field">
          {pieces.map((i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i * 53) % 100}%`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${(i % 6) * 0.08}s`,
              }}
            />
          ))}
        </div>
        <div className="milestone-icon" style={{ background: `${habit.color}22`, color: habit.color }}>
          <HabitIcon name={habit.icon} size={26} strokeWidth={2.2} />
        </div>
        <div className="milestone-streak">
          <Flame size={22} className="flame-lit" strokeWidth={2.4} />
          <span className="mono-num">{milestone}</span>
        </div>
        <h2 style={{ fontSize: 21, textAlign: 'center' }}>{habit.name}</h2>
        <p className="text-secondary" style={{ textAlign: 'center', fontSize: 14.5, maxWidth: 320 }}>
          {MESSAGES[milestone] || `${milestone} días seguidos.`}
        </p>
        <button className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} onClick={onClose}>
          Seguir así
        </button>
      </div>
    </div>
  );
}

export default MilestoneModal;
