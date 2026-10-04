import { useRef, useState } from 'react';
import {
  ArrowLeft, Download, Upload, Flame, LogOut, CloudCheck, CloudOff, RefreshCw, Sun, Moon,
  Smartphone, Copy, Check,
} from 'lucide-react';
import { useRachas } from '../lib/RachasContext';
import { buildScriptableScript } from '../lib/scriptableScript';

function GoogleGIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.3 0-13.6 4.1-16.9 10.1z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5c3.3 6.1 9.6 10.3 16.9 10.3z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.5l6.6 5.4C39.9 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function SettingsView({ onBack }) {
  const {
    settings, updateSettings, exportData, importData, data, user, syncState, syncError,
    widgetError, signIn, signOutAccount,
  } = useRachas();
  const fileInput = useRef(null);
  const [importMsg, setImportMsg] = useState('');
  const [scriptCopied, setScriptCopied] = useState(false);

  const handleCopyScript = async () => {
    if (!settings.widgetToken) return;
    const script = buildScriptableScript(settings.widgetToken);
    try {
      await navigator.clipboard.writeText(script);
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 2500);
    } catch {
      setScriptCopied(false);
    }
  };

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
        <p className="section-title">Cuenta</p>
        {user ? (
          <>
            <div className="account-row">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="account-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="account-avatar account-avatar-fallback">{(user.displayName || user.email || '?').charAt(0).toUpperCase()}</div>
              )}
              <div className="account-info">
                <span className="account-name">{user.displayName || 'Tu cuenta'}</span>
                <span className="text-secondary" style={{ fontSize: 13 }}>{user.email}</span>
              </div>
            </div>
            <div className="sync-status">
              {syncState === 'loading' && <><RefreshCw size={14} className="spin" /> Sincronizando…</>}
              {syncState === 'idle' && <><CloudCheck size={14} style={{ color: 'var(--mint)' }} /> Sincronizado entre tus dispositivos</>}
              {syncState === 'error' && <><CloudOff size={14} style={{ color: 'var(--danger)' }} /> Error al sincronizar{syncError ? `: ${syncError}` : ''}</>}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={signOutAccount}>
              <LogOut size={16} /> Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <p className="text-secondary" style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
              Inicia sesión para que tus hábitos y tu progreso se sincronicen automáticamente entre todos tus dispositivos.
            </p>
            <button className="btn btn-secondary google-btn" onClick={signIn} disabled={syncState === 'loading'}>
              <GoogleGIcon /> {syncState === 'loading' ? 'Conectando…' : 'Iniciar sesión con Google'}
            </button>
            {syncState === 'error' && (
              <p className="text-secondary" style={{ fontSize: 13, marginTop: 10, color: 'var(--danger)' }}>
                {syncError ? `No se pudo iniciar sesión: ${syncError}` : 'No se pudo iniciar sesión.'}
              </p>
            )}
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p className="section-title">Apariencia</p>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Tema</label>
          <div className="segmented">
            <button type="button" className={settings.theme !== 'dark' ? 'active' : ''} onClick={() => updateSettings({ theme: 'light' })}>
              <Sun size={14} /> Claro
            </button>
            <button type="button" className={settings.theme === 'dark' ? 'active' : ''} onClick={() => updateSettings({ theme: 'dark' })}>
              <Moon size={14} /> Oscuro
            </button>
          </div>
        </div>
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
        <p className="section-title">Widget en iPhone</p>
        <p className="text-secondary" style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
          Un widget de verdad en tu pantalla de inicio, a través de la app gratuita{' '}
          <strong style={{ color: 'var(--text)' }}>Scriptable</strong>. Instálala desde la App Store,
          crea un script nuevo, pega el que copias aquí, y añade el widget a tu pantalla de inicio.
        </p>
        <button className="btn btn-secondary" onClick={handleCopyScript} disabled={!settings.widgetToken}>
          {scriptCopied ? <Check size={16} /> : <Copy size={16} />}
          {scriptCopied ? 'Copiado' : 'Copiar script de Scriptable'}
        </button>
        {widgetError && (
          <p className="text-secondary" style={{ fontSize: 13, marginTop: 10, color: 'var(--danger)' }}>
            <Smartphone size={13} style={{ verticalAlign: -2 }} /> {widgetError}
          </p>
        )}
        <p className="text-tertiary" style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>
          El widget solo muestra un resumen (completados hoy, siguiente pendiente, mejor racha) —
          nunca el detalle de tus hábitos. Se actualiza cuando iOS decide refrescarlo, no al instante.
        </p>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p className="section-title">Tus datos</p>
        <p className="text-secondary" style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
          {user
            ? 'Tus datos viven en tu cuenta y se sincronizan solos. Aun así, una copia de seguridad de vez en cuando nunca está de más.'
            : 'Todo se guarda solo en este navegador. Exporta una copia de seguridad de vez en cuando para no perder tu progreso.'}
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
