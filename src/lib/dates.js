const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
// Lunes-first short labels for weekday pickers (mon0 index 0..6)
const DIAS_MON0_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateStr(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function todayStr() {
  return toDateStr(new Date());
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function addDaysStr(dateStr, n) {
  return toDateStr(addDays(parseDateStr(dateStr), n));
}

function isSameDay(a, b) {
  return toDateStr(a) === toDateStr(b);
}

// 0 = lunes ... 6 = domingo
function dayOfWeekMon0(date) {
  const js = date.getDay(); // 0 = domingo
  return (js + 6) % 7;
}

function startOfWeek(date) {
  const mon0 = dayOfWeekMon0(date);
  return addDays(date, -mon0);
}

function getWeekDates(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function isoWeekKey(date) {
  // Simple week key: year + week number relative to Jan 1's Monday start, stable enough for streaks within a season
  const start = startOfWeek(date);
  const jan1 = new Date(start.getFullYear(), 0, 1);
  const diffDays = Math.round((start - startOfWeek(jan1)) / 86400000);
  const week = Math.floor(diffDays / 7);
  return `${start.getFullYear()}-W${week}`;
}

function formatLong(date) {
  const str = `${DIAS[date.getDay()]}, ${date.getDate()} de ${MESES[date.getMonth()]}`;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatMonthYear(date) {
  const m = MESES[date.getMonth()];
  return `${m.charAt(0).toUpperCase() + m.slice(1)} ${date.getFullYear()}`;
}

function formatDayMonth(date) {
  return `${date.getDate()} ${MESES[date.getMonth()].slice(0, 3)}`;
}

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function isFuture(dateStr) {
  return dateStr > todayStr();
}

export {
  DIAS, DIAS_CORTOS, DIAS_MON0_CORTOS, MESES,
  toDateStr, parseDateStr, todayStr, addDays, addDaysStr, isSameDay,
  dayOfWeekMon0, startOfWeek, getWeekDates, isoWeekKey,
  formatLong, formatMonthYear, formatDayMonth, greeting, daysInMonth, isFuture,
};
