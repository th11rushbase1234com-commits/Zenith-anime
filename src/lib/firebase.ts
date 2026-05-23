import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDMcmQ1eSMP11Iwcq_FU7CQJAsPIUmZK3w",
  authDomain: "studio-8047086496-cb891.firebaseapp.com",
  projectId: "studio-8047086496-cb891",
  storageBucket: "studio-8047086496-cb891.firebasestorage.app",
  messagingSenderId: "738666537284",
  appId: "1:738666537284:web:612131eec3389eab5a7711"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
