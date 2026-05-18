
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAy_RvxjmMfbvnu7sc8rGQtLN-Lr7U_vIU",
  authDomain: "blood-list-66e5e.firebaseapp.com",
  databaseURL: "https://blood-list-66e5e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "blood-list-66e5e",
  storageBucket: "blood-list-66e5e.firebasestorage.app",
  messagingSenderId: "900859452994",
  appId: "1:900859452994:web:bb55742a51ee7d61da57db"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
