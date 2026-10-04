const STORAGE_KEY = 'rachas:data';

const DEFAULT_DATA = {
  version: 1,
  habits: [],
  logs: {}, // { [habitId]: { [dateStr]: number } }
  milestonesShown: {}, // { [habitId]: number[] }
  settings: {
    reducedMotion: false,
  },
};

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalize(parsed) {
  return {
    ...structuredCloneSafe(DEFAULT_DATA),
    ...parsed,
    settings: { ...DEFAULT_DATA.settings, ...(parsed?.settings || {}) },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredCloneSafe(DEFAULT_DATA);
    return normalize(JSON.parse(raw));
  } catch {
    return structuredCloneSafe(DEFAULT_DATA);
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Todas las funciones de abajo son transformaciones puras: reciben el
// estado actual y devuelven el siguiente, sin tocar almacenamiento. Quien
// llama (RachasContext) decide dónde persistir (local o nube).

function createHabit(data, input) {
  const habit = {
    id: uid(),
    name: input.name.trim(),
    icon: input.icon || 'Circle',
    color: input.color || '#7c5cff',
    type: input.type || 'check', // 'check' | 'amount'
    unit: input.unit || '',
    target: input.type === 'amount' ? Number(input.target) || 1 : 1,
    schedule: input.schedule || { mode: 'daily', days: [], timesPerWeek: 5 },
    category: input.category || '',
    note: input.note || '',
    createdAt: new Date().toISOString(),
    archived: false,
    order: data.habits.length,
  };
  const next = { ...data, habits: [...data.habits, habit] };
  return { data: next, habit };
}

function updateHabit(data, id, patch) {
  const habits = data.habits.map((h) => (h.id === id ? { ...h, ...patch } : h));
  return { ...data, habits };
}

function deleteHabit(data, id) {
  const habits = data.habits.filter((h) => h.id !== id);
  const logs = { ...data.logs };
  delete logs[id];
  const milestonesShown = { ...data.milestonesShown };
  delete milestonesShown[id];
  return { ...data, habits, logs, milestonesShown };
}

function archiveHabit(data, id, archived) {
  return updateHabit(data, id, { archived });
}

function reorderHabits(data, orderedIds) {
  const byId = Object.fromEntries(data.habits.map((h) => [h.id, h]));
  const habits = orderedIds.map((id, i) => ({ ...byId[id], order: i }));
  return { ...data, habits };
}

function setLog(data, habitId, dateStr, value) {
  const habitLogs = { ...(data.logs[habitId] || {}) };
  if (value <= 0) {
    delete habitLogs[dateStr];
  } else {
    habitLogs[dateStr] = value;
  }
  const logs = { ...data.logs, [habitId]: habitLogs };
  return { ...data, logs };
}

function getLogValue(data, habitId, dateStr) {
  return data.logs[habitId]?.[dateStr] || 0;
}

function markMilestoneShown(data, habitId, milestone) {
  const list = data.milestonesShown[habitId] || [];
  if (list.includes(milestone)) return data;
  const milestonesShown = { ...data.milestonesShown, [habitId]: [...list, milestone] };
  return { ...data, milestonesShown };
}

function exportData(data) {
  return JSON.stringify(data, null, 2);
}

function importData(json) {
  return normalize(JSON.parse(json));
}

function updateSettings(data, patch) {
  return { ...data, settings: { ...data.settings, ...patch } };
}

export {
  DEFAULT_DATA, load, save, normalize, createHabit, updateHabit, deleteHabit, archiveHabit,
  reorderHabits, setLog, getLogValue, markMilestoneShown, exportData, importData,
  updateSettings, uid, structuredCloneSafe,
};
