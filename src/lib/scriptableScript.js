const PROJECT_ID = 'rachas-pablo-2026';
const APP_URL = 'https://impablo13-gif.github.io/rachas/';

// Genera el script de Scriptable (iOS) con el token ya incrustado, listo
// para pegar sin tocar nada. Lee el resumen público (sin login) que la app
// sube a Firestore cada vez que cambian los hábitos.
function buildScriptableScript(token) {
  return `// Rachas — widget de progreso diario
// Generado desde Ajustes de Rachas. Pega este script tal cual en Scriptable.

const TOKEN = "${token}";
const PROJECT = "${PROJECT_ID}";
const APP_URL = "${APP_URL}";

async function fetchSummary() {
  const url = \`https://firestore.googleapis.com/v1/projects/\${PROJECT}/databases/(default)/documents/widgets/\${TOKEN}\`;
  try {
    const req = new Request(url);
    const res = await req.loadJSON();
    if (!res.fields) return null;
    const f = res.fields;
    const num = (field) => (field && field.integerValue != null ? parseInt(field.integerValue, 10) : 0);
    const str = (field) => (field && field.stringValue != null ? field.stringValue : "");
    return {
      done: num(f.done),
      total: num(f.total),
      topPending: str(f.topPending),
      bestStreak: num(f.bestStreak),
    };
  } catch (e) {
    return undefined; // undefined = error de red/token, null = sin datos todavia
  }
}

function buildWidget(summary) {
  const w = new ListWidget();
  w.url = APP_URL;
  w.backgroundColor = new Color("#7c5cff");
  w.setPadding(16, 14, 16, 14);

  const title = w.addText("RACHAS");
  title.font = Font.boldSystemFont(11);
  title.textColor = new Color("#ffffff", 0.85);
  w.addSpacer(6);

  if (summary === undefined) {
    const msg = w.addText("No se pudo conectar. Revisa tu conexion.");
    msg.font = Font.systemFont(13);
    msg.textColor = Color.white();
    return w;
  }

  if (!summary) {
    const msg = w.addText("Abre Rachas una vez para generar tu resumen.");
    msg.font = Font.systemFont(13);
    msg.textColor = Color.white();
    return w;
  }

  const big = w.addText(\`\${summary.done}/\${summary.total}\`);
  big.font = Font.boldSystemFont(32);
  big.textColor = Color.white();

  const label = w.addText("completados hoy");
  label.font = Font.systemFont(12);
  label.textColor = new Color("#ffffff", 0.8);
  w.addSpacer(10);

  const barBg = w.addStack();
  barBg.backgroundColor = new Color("#ffffff", 0.25);
  barBg.cornerRadius = 4;
  barBg.size = new Size(0, 8);
  const pct = summary.total > 0 ? summary.done / summary.total : 0;
  const barFill = barBg.addStack();
  barFill.backgroundColor = Color.white();
  barFill.cornerRadius = 4;
  barFill.size = new Size(Math.max(4, 130 * pct), 8);

  w.addSpacer(12);

  if (summary.topPending) {
    const next = w.addText(\`Siguiente: \${summary.topPending}\`);
    next.font = Font.systemFont(12);
    next.textColor = Color.white();
  } else if (summary.total > 0) {
    const done = w.addText("Todo hecho hoy.");
    done.font = Font.systemFont(12);
    done.textColor = Color.white();
  }

  if (summary.bestStreak > 0) {
    w.addSpacer(4);
    const streak = w.addText(\`Racha: \${summary.bestStreak}\`);
    streak.font = Font.systemFont(11);
    streak.textColor = new Color("#ffffff", 0.8);
  }

  return w;
}

const summary = await fetchSummary();
const widget = buildWidget(summary);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}
Script.complete();
`;
}

export { buildScriptableScript };
