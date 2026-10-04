import {
  createContext, useContext, useMemo, useState, useCallback, useEffect, useRef,
} from 'react';
import * as db from './db';
import { currentStreak, hitMilestone, isCompletedOn } from './streaks';
import { todayStr } from './dates';
import {
  watchAuth, signInWithGoogle, signOutUser, fetchUserDoc, writeUserDoc, watchUserDoc,
  friendlyAuthError,
} from './cloudSync';

const RachasContext = createContext(null);

function RachasProvider({ children }) {
  const [data, setData] = useState(() => db.load());
  const [celebration, setCelebration] = useState(null); // { habit, milestone }
  const [user, setUser] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [syncError, setSyncError] = useState(null);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Persistencia centralizada: toda mutación pasa por aquí, que decide si
  // escribe en localStorage (sin cuenta) o en el documento de Firestore del
  // usuario (con cuenta). Las funciones de db.js son transformaciones puras.
  const mutate = useCallback((transformFn) => {
    setData((prev) => {
      const next = transformFn(prev);
      if (userRef.current) {
        writeUserDoc(userRef.current.uid, next).catch((e) => {
          setSyncState('error');
          setSyncError(friendlyAuthError(e));
        });
      } else {
        db.save(next);
      }
      return next;
    });
  }, []);

  // Sesión de Firebase Auth.
  useEffect(() => watchAuth(setUser), []);

  // Al iniciar sesión: si ya hay datos en la nube, se adoptan (y pasan a
  // escucharse en vivo para reflejar cambios de otros dispositivos). Si es
  // la primera vez que esta cuenta sincroniza, se sube lo que hubiera en
  // local para no perderlo. Al cerrar sesión, se vuelve a localStorage.
  useEffect(() => {
    if (!user) {
      setData(db.load());
      setSyncState('idle');
      setSyncError(null);
      return undefined;
    }

    let cancelled = false;
    let unsubDoc;
    setSyncState('loading');
    setSyncError(null);

    (async () => {
      try {
        const existing = await fetchUserDoc(user.uid);
        if (cancelled) return;
        if (existing) {
          setData(db.normalize(existing));
        } else {
          const toUpload = db.normalize(data);
          await writeUserDoc(user.uid, toUpload);
        }
        if (cancelled) return;
        unsubDoc = watchUserDoc(user.uid, (remote) => {
          if (remote) setData(db.normalize(remote));
        });
        setSyncState('idle');
      } catch (e) {
        if (!cancelled) {
          setSyncState('error');
          setSyncError(friendlyAuthError(e));
        }
      }
    })();

    return () => {
      cancelled = true;
      if (unsubDoc) unsubDoc();
    };
    // Sólo se re-ejecuta al cambiar de sesión: se usa deliberadamente el
    // `data` local presente en el momento del login, no en cada edición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeHabits = useMemo(
    () => data.habits.filter((h) => !h.archived).sort((a, b) => a.order - b.order),
    [data.habits],
  );

  const setValue = useCallback((habitId, dateStr, value) => {
    mutate((prev) => {
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
  }, [mutate]);

  const actions = useMemo(() => ({
    addHabit: (input) => mutate((prev) => db.createHabit(prev, input).data),
    updateHabit: (id, patch) => mutate((prev) => db.updateHabit(prev, id, patch)),
    deleteHabit: (id) => mutate((prev) => db.deleteHabit(prev, id)),
    archiveHabit: (id, archived) => mutate((prev) => db.archiveHabit(prev, id, archived)),
    reorderHabits: (orderedIds) => mutate((prev) => db.reorderHabits(prev, orderedIds)),
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
    updateSettings: (patch) => mutate((prev) => db.updateSettings(prev, patch)),
    exportData: () => db.exportData(data),
    importData: (json) => mutate(() => db.importData(json)),
    dismissCelebration: () => setCelebration(null),
    signIn: async () => {
      setSyncState('loading');
      setSyncError(null);
      try {
        await signInWithGoogle();
      } catch (e) {
        setSyncState('error');
        setSyncError(friendlyAuthError(e));
      }
    },
    signOutAccount: () => signOutUser(),
  }), [data, setValue, mutate]);

  const value = useMemo(() => ({
    data,
    activeHabits,
    logs: data.logs,
    settings: data.settings,
    celebration,
    user,
    syncState,
    syncError,
    ...actions,
  }), [data, activeHabits, celebration, user, syncState, syncError, actions]);

  return <RachasContext.Provider value={value}>{children}</RachasContext.Provider>;
}

function useRachas() {
  const ctx = useContext(RachasContext);
  if (!ctx) throw new Error('useRachas must be used within RachasProvider');
  return ctx;
}

export { RachasProvider, useRachas };
