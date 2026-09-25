import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import * as db from './db';
import { currentStreak, hitMilestone, isCompletedOn } from './streaks';
import { todayStr } from './dates';

const RachasContext = createContext(null);

function RachasProvider({ children }) {
  const [data, setData] = useState(() => db.load());
  const [celebration, setCelebration] = useState(null); // { habit, milestone }

  const activeHabits = useMemo(
    () => data.habits.filter((h) => !h.archived).sort((a, b) => a.order - b.order),
    [data.habits],
  );

  const setValue = useCallback((habitId, dateStr, value) => {
    setData((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId);
      const wasCompleted = habit ? isCompletedOn(habit, prev.logs, dateStr) : false;
      const next = db.setLog(prev, habitId, dateStr, value);
      if (habit && dateStr === todayStr()) {
        const nowCompleted = isCompletedOn(habit, next.logs, dateStr);
        if (!wasCompleted && nowCompleted) {
          const streak = currentStreak(habit, next.logs);
          const milestone = hitMilestone(streak);
          if (milestone) {
            const shown = next.milestonesShown[habitId] || [];
            if (!shown.includes(milestone)) {
              setCelebration({ habit, milestone });
              return db.markMilestoneShown(next, habitId, milestone);
            }
          }
        }
      }
      return next;
    });
  }, []);

  const actions = useMemo(() => ({
    addHabit: (input) => setData((prev) => db.createHabit(prev, input).data),
    updateHabit: (id, patch) => setData((prev) => db.updateHabit(prev, id, patch)),
    deleteHabit: (id) => setData((prev) => db.deleteHabit(prev, id)),
    archiveHabit: (id, archived) => setData((prev) => db.archiveHabit(prev, id, archived)),
    reorderHabits: (orderedIds) => setData((prev) => db.reorderHabits(prev, orderedIds)),
    setValue,
    toggleComplete: (habit, dateStr) => {
      const v = db.getLogValue(data, habit.id, dateStr);
      setValue(habit.id, dateStr, v >= 1 ? 0 : 1);
    },
    incrementAmount: (habit, dateStr, delta) => {
      const v = db.getLogValue(data, habit.id, dateStr);
      const next = Math.max(0, v + delta);
      setValue(habit.id, dateStr, next);
    },
    setAmount: (habit, dateStr, value) => {
      setValue(habit.id, dateStr, Math.max(0, value));
    },
    updateSettings: (patch) => setData((prev) => db.updateSettings(prev, patch)),
    exportData: () => db.exportData(data),
    importData: (json) => setData(db.importData(json)),
    dismissCelebration: () => setCelebration(null),
  }), [data, setValue]);

  const value = useMemo(() => ({
    data, activeHabits, logs: data.logs, settings: data.settings, celebration, ...actions,
  }), [data, activeHabits, celebration, actions]);

  return <RachasContext.Provider value={value}>{children}</RachasContext.Provider>;
}

function useRachas() {
  const ctx = useContext(RachasContext);
  if (!ctx) throw new Error('useRachas must be used within RachasProvider');
  return ctx;
}

export { RachasProvider, useRachas };
