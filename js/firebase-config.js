// ============================================================
// FIREBASE CONFIG — GANTI DENGAN CONFIG PROJECT FIREBASE LO
// ============================================================
// Cara ambil:
// 1. Buka https://console.firebase.google.com
// 2. Bikin project baru (gratis)
// 3. Klik ikon Web ( </> ) buat "Add app"
// 4. Copy object firebaseConfig yang muncul ke sini
// 5. Di menu Firebase Console:
//    - Authentication > Sign-in method > aktifkan "Email/Password"
//    - Firestore Database > Create database > mode "Production" atau "Test"
// ============================================================

const firebaseConfig = {
  apiKey: "GANTI_API_KEY",
  authDomain: "GANTI_PROJECT.firebaseapp.com",
  projectId: "GANTI_PROJECT",
  storageBucket: "GANTI_PROJECT.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

let firebaseReady = false;
let auth = null;
let db = null;

try {
  if (!firebaseConfig.apiKey.startsWith("GANTI")) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseReady = true;
  } else {
    console.warn("[LynnZz OS] Firebase belum dikonfigurasi. Jalan di mode LOKAL (localStorage) — Login pakai akun lokal, tidak sinkron ke cloud.");
  }
} catch (e) {
  console.error("[LynnZz OS] Gagal init Firebase:", e);
}
