# LynnZz OS v1.0

"Operating System" yang jalan penuh di browser. Dibangun buat di-host gratis di GitHub Pages / Netlify.

## Cara pakai (dari HP, tanpa laptop)

1. Push folder ini ke repo GitHub baru (misal `LynnZz-OS`).
2. Aktifkan **GitHub Pages**: Settings → Pages → Branch: `main` / folder `root` → Save.
3. Buka link Pages-nya (`https://username.github.io/LynnZz-OS/`) — OS langsung boot.

Tanpa setup Firebase pun sudah jalan penuh: sistem otomatis pakai **mode lokal** (akun & data disimpan di `localStorage` HP/browser lo).

## Aktifin Firebase (login beneran + cloud sync)

1. Buka [Firebase Console](https://console.firebase.google.com) → buat project baru (gratis).
2. Klik ikon Web `</>` → daftarkan app → copy object `firebaseConfig`.
3. Tempel ke `js/firebase-config.js`, ganti semua nilai `"GANTI_..."`.
4. Di Firebase Console:
   - **Authentication → Sign-in method** → aktifkan **Email/Password**.
   - **Firestore Database → Create database**.
5. Reload — sistem otomatis pindah dari mode lokal ke mode cloud.

## Struktur folder

```
LynnZz-OS/
├── index.html              → boot screen, login/register, shell desktop
├── css/
│   ├── desktop.css         → wallpaper, ikon, window, notifikasi
│   └── taskbar.css         → taskbar, start menu, jam
├── js/
│   ├── firebase-config.js  → config Firebase (isi sendiri)
│   ├── os.js               → boot, auth, notifikasi, jam, storage
│   ├── window.js           → window manager (drag/resize/minimize/maximize)
│   └── apps.js             → semua app bawaan (registry + kode)
├── apps/                   → dokumentasi tiap app (lihat catatan di bawah)
└── assets/
    ├── icons/
    └── wallpapers/
```

**Catatan desain:** semua app (Notes, Calculator, File Manager, dst) di-render langsung dari
`js/apps.js`, bukan file HTML terpisah di `apps/`. Ini sengaja — kalau app-nya `fetch()` file HTML
sendiri-sendiri, itu bakal gagal kena CORS pas dibuka lewat `file://` (sebelum di-push ke GitHub
Pages), yang ngerepotin banget buat workflow dari Termux/HP. Folder `apps/*/` gue biarin sebagai
tempat naruh dokumentasi/aset per-app kalau nanti mau dipisah beneran pas masuk fase App Store (v3.0).

## Fitur v1.0 yang sudah jalan

- ✅ Boot sequence dengan progress bar
- ✅ Login / Register / Guest (Firebase atau mode lokal otomatis)
- ✅ Desktop dengan wallpaper animasi + ikon
- ✅ Taskbar + jam & tanggal realtime (format Indonesia)
- ✅ Start menu dengan profil user
- ✅ Sistem notifikasi (toast)
- ✅ Window manager: buka banyak app, drag, resize, minimize, maximize, close
- ✅ File Manager (virtual filesystem tersimpan per-user)
- ✅ Notes (CRUD, autosave)
- ✅ Calculator
- ✅ Browser (iframe + fallback tab baru buat situs yang nge-block embed)
- ✅ Music Player (pilih file audio dari HP)
- ✅ Gallery (pilih gambar dari HP, lightbox)
- ✅ Settings (ganti wallpaper, info akun, hapus data lokal)

## Belum di v1.0 (nyusul v2.0 / v3.0 sesuai rencana lo)

- Lynn AI (Gemini API) — butuh API key, gampang ditambahin sebagai app baru di `apps.js`
- Terminal dengan virtual filesystem (`mkdir`, `cd`, `ls`, dst)
- App Store buat install app baru
- Window snapping / multi-desktop

## Known limitations

- Gallery & Music Player pakai `URL.createObjectURL` — playlist/gambar hilang kalau tab ditutup
  (file besar nggak cocok disimpan permanen di localStorage). Kalau mau persist, opsi ke depan:
  upload ke Firebase Storage.
- Browser app: banyak situs besar (Google, YouTube, Instagram) block iframe lewat header
  `X-Frame-Options` — ini pembatasan dari situs tujuan, bukan bug LynnZz OS.
