import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, remove, push, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

export const configured = !Object.values(firebaseConfig).some(v => String(v).includes("YOUR_"));
let app, auth, db;
if (configured) { app = initializeApp(firebaseConfig); auth = getAuth(app); db = getDatabase(app); }
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, ref, get, set, update, remove, push, query, orderByChild, equalTo };
export function requireFirebase() { if (!configured) throw new Error("Firebase 설정이 필요합니다. js/firebase-config.js를 먼저 수정하세요."); }
