import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAF6o3VcDwmvVluBb9w7qNZdopbQbOGz9c',
  authDomain: 'rachas-pablo-2026.firebaseapp.com',
  projectId: 'rachas-pablo-2026',
  storageBucket: 'rachas-pablo-2026.firebasestorage.app',
  messagingSenderId: '42553704808',
  appId: '1:42553704808:web:bbe29b34ab7df099b056dd',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Cache local persistente (IndexedDB) con soporte multi-pestaña: permite que
// la app siga funcionando sin conexión y se sincronice sola al reconectar.
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export { auth, googleProvider, firestore };
