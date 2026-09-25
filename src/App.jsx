import { useEffect, useState } from 'react';
import { RachasProvider, useRachas } from './lib/RachasContext';
import { Sidebar, BottomNav } from './components/Nav';
import MilestoneModal from './components/MilestoneModal';
import TodayView from './views/TodayView';
import CalendarView from './views/CalendarView';
import StatsView from './views/StatsView';
import HabitsView from './views/HabitsView';
import SettingsView from './views/SettingsView';

function Shell() {
  const [tab, setTab] = useState('today');
  const [prevTab, setPrevTab] = useState('today');
  const { settings, celebration, dismissCelebration } = useRachas();

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', !!settings.reducedMotion);
  }, [settings.reducedMotion]);

  const openSettings = () => {
    setPrevTab(tab);
    setTab('settings');
  };

  const goTo = (id) => setTab(id);

  return (
    <div className="app-shell">
      <Sidebar active={tab} onChange={goTo} />
      <main className="app-main">
        {tab === 'today' && <TodayView />}
        {tab === 'calendar' && <CalendarView />}
        {tab === 'stats' && <StatsView />}
        {tab === 'habits' && <HabitsView onOpenSettings={openSettings} />}
        {tab === 'settings' && <SettingsView onBack={() => setTab(prevTab)} />}
      </main>
      <BottomNav active={tab} onChange={goTo} />
      {celebration && (
        <MilestoneModal
          habit={celebration.habit}
          milestone={celebration.milestone}
          onClose={dismissCelebration}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <RachasProvider>
      <Shell />
    </RachasProvider>
  );
}

export default App;
