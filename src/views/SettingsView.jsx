import { useRef, useState } from 'react';
import { ArrowLeft, Download, Upload, Flame } from 'lucide-react';
import { useRachas } from '../lib/RachasContext';

function SettingsView({ onBack }) {
  const { settings, updateSettings, exportData, importData, data } = useRachas();
  const fileInput = useRef(null);
  const [importMsg, setImportMsg] = useState('');

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rachas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result);
        setImportMsg('Copia de seguridad restaurada correctamente.');
      } catch {
        setImportMsg('El archivo no es una copia de seguridad válida.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <header className="today-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="icon-btn" onClick={onBack} aria-label="Volver"><ArrowLeft size={19} /></button>
          <h1 style={{ fontSize: 22 }}>Ajustes</h1>
        </div>
      </header>

      <div className="card">
        <p className="section-title">Apariencia</p>
        <label className="settings-toggle-row">
          <span>Reducir animaciones</span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
          />
        </label>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p className="section-title">Tus datos</p>
        <p className="text-secondary" style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
          Todo se guarda solo en este navegador. Exporta una copia de seguridad de vez en cuando para no perder tu progreso.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Exportar copia
          </button>
          <button className="btn btn-secondary" onClick={() => fileInput.current?.click()}>
            <Upload size={16} /> Importar copia
          </button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={handleImportFile} />
        </div>
        {importMsg && <p className="text-secondary" style={{ fontSize: 13, marginTop: 10 }}>{importMsg}</p>}
        <p className="text-tertiary" style={{ fontSize: 12.5, marginTop: 14 }}>
          {data.habits.length} hábitos guardados en total.
        </p>
      </div>

      <div className="about-footer">
        <Flame size={14} className="text-tertiary" />
        <span className="text-tertiary" style={{ fontSize: 12.5 }}>Rachas — cada día cuenta.</span>
      </div>
    </div>
  );
}

export default SettingsView;
