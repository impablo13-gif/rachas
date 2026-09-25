import { Flame, Home, CalendarDays, BarChart3, ListChecks } from 'lucide-react';

const TABS = [
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
  { id: 'habits', label: 'Hábitos', icon: ListChecks },
];

function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Flame size={18} strokeWidth={2.5} /></div>
        <span className="brand-name">Rachas</span>
      </div>
      <nav className="nav-list">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? 'active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={18} className="nav-icon" strokeWidth={2.2} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`bottom-nav-item ${active === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
          aria-label={label}
        >
          <Icon size={21} strokeWidth={2.2} />
          {label}
        </button>
      ))}
    </nav>
  );
}

export { Sidebar, BottomNav };
