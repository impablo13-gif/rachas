import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, firestore } from './firebase';

function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

async function signOutUser() {
  await signOut(auth);
}

function userDocRef(uid) {
  return doc(firestore, 'users', uid);
}

async function fetchUserDoc(uid) {
  const snap = await getDoc(userDocRef(uid));
  return snap.exists() ? snap.data() : null;
}

async function writeUserDoc(uid, data) {
  await setDoc(userDocRef(uid), data);
}

function watchUserDoc(uid, callback) {
  return onSnapshot(userDocRef(uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// Documento público (sin login) con el resumen de hoy, leído por el widget
// de iPhone (Scriptable). El token largo en la ruta es lo único que lo
// protege — ver firestore.rules.
async function writeWidgetSummary(token, summary) {
  await setDoc(doc(firestore, 'widgets', token), summary);
}

const FRIENDLY_AUTH_ERRORS = {
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes para este sitio e inténtalo de nuevo.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar. Inténtalo de nuevo.',
  'auth/cancelled-popup-request': 'Inténtalo de nuevo.',
  'auth/unauthorized-domain': 'Este sitio todavía no está autorizado para iniciar sesión. Avisa para añadirlo en Firebase.',
  'auth/network-request-failed': 'No hay conexión a internet. Inténtalo de nuevo cuando estés conectado.',
  'permission-denied': 'Todavía no está activada la regla que permite esto en Firebase. Avisa para activarla.',
  unavailable: 'No hay conexión con el servidor ahora mismo. Se reintentará solo.',
};

function friendlyAuthError(error) {
  const code = error?.code;
  return (code && FRIENDLY_AUTH_ERRORS[code]) || error?.message || String(error);
}

export {
  watchAuth, signInWithGoogle, signOutUser, fetchUserDoc, writeUserDoc, watchUserDoc,
  writeWidgetSummary, friendlyAuthError,
};
