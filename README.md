<div align="center">

# 🖥️ LynnZz OS

**Sistem operasi desktop berbasis browser.**

Simulasi desktop environment yang dibangun menggunakan HTML, CSS, dan JavaScript vanilla, tanpa framework frontend dan tanpa build step.

[![Status](https://img.shields.io/badge/status-active-success)](#️-status-pengembangan)
[![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222?logo=github)](#-menjalankan)
[![Firebase](https://img.shields.io/badge/backend-Firebase%20optional-FFCA28?logo=firebase&logoColor=black)](#-firebase-opsional)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)](#-teknologi)

[**🚀 Live Demo**](https://aether-asahina.github.io/LynnZz-OS/)

</div>

---

## 📖 Tentang Proyek

LynnZz OS adalah simulasi desktop operating system yang berjalan sepenuhnya di browser.

Proyek ini mencoba menghadirkan pengalaman desktop melalui web, termasuk boot sequence, authentication, desktop environment, animated wallpaper, taskbar, start menu, window management, virtual filesystem, terminal simulation, serta berbagai aplikasi bawaan.

Proyek ini dikembangkan sebagai eksperimen dan pembelajaran untuk mengeksplorasi sejauh mana teknologi web dapat digunakan untuk membangun lingkungan yang menyerupai sistem operasi.

LynnZz OS dapat berjalan dalam mode lokal tanpa backend eksternal. Firebase bersifat opsional dan dapat digunakan untuk authentication serta penyimpanan data berbasis cloud.

---

## ✨ Fitur

### 🖥️ Desktop Environment

- Boot sequence dengan progress indicator
- Desktop dengan animated canvas wallpaper
- Desktop icons
- Taskbar dan start menu
- Jam dan tanggal realtime
- User profile
- Toast notifications
- Multi-window environment

### 🪟 Window Manager

- Membuka beberapa aplikasi secara bersamaan
- Drag window
- Resize window
- Minimize
- Maximize
- Close
- Window state management

### 📦 Aplikasi & Sistem

| Komponen | Deskripsi |
| --- | --- |
| 📁 File Manager | Virtual filesystem untuk mengelola file dan folder |
| 📝 Notes | Membuat dan mengelola catatan |
| 🧮 Calculator | Kalkulator berbasis browser |
| 🌐 Browser | Browser interface dengan fallback ke tab baru |
| 🎵 Music Player | Memutar file audio dari perangkat |
| 🖼️ Gallery | Menampilkan gambar dari perangkat |
| ⚙️ Settings | Pengaturan wallpaper, akun, dan data lokal |
| 💻 Terminal | Simulasi terminal dengan virtual filesystem |
| 🧪 Algorithm Lab | Eksperimen dan visualisasi algoritma |

### 🧪 Algorithm Lab

Algorithm Lab digunakan untuk mengeksplorasi dan memvisualisasikan algoritma secara interaktif, termasuk:

- Bubble Sort
- Quick Sort
- Merge Sort
- A\*
- Dijkstra
- Dataset management
- Perbandingan algoritma

---

## 💾 Mode Penyimpanan

LynnZz OS mendukung dua pendekatan penyimpanan.

### Local Mode

Tanpa konfigurasi Firebase. Data tertentu disimpan menggunakan browser storage sehingga sistem dapat digunakan secara lokal.

### Firebase Mode

Firebase dapat digunakan untuk:

- Authentication
- Cloud data
- User-based storage

Mode Firebase bersifat opsional sehingga proyek tetap dapat dijalankan sebagai static web application.

---

## 🚀 Menjalankan

### GitHub Pages

LynnZz OS dapat langsung dijalankan melalui GitHub Pages:

**https://aether-asahina.github.io/LynnZz-OS/**

Untuk fork sendiri: *Settings → Pages → Branch `main` / folder `/ (root)` → Save*.

### Lokal

Clone repository:

```bash
git clone https://github.com/aether-asahina/LynnZz-OS.git
cd LynnZz-OS
```

Karena proyek menggunakan browser APIs, disarankan menjalankannya melalui local HTTP server.

Dengan Python:

```bash
python3 -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

Alternatif menggunakan Node.js:

```bash
npx serve .
```

> Hindari membuka `index.html` langsung menggunakan `file://` jika ingin mendapatkan perilaku yang sama seperti saat proyek dijalankan melalui HTTP server.

---

## 🔥 Firebase (Opsional)

Firebase tidak wajib untuk menjalankan LynnZz OS.

Untuk menggunakan Firebase:

1. Buat project di [Firebase Console](https://console.firebase.google.com).
2. Daftarkan Web App dan salin objek `firebaseConfig`.
3. Tempel ke `js/firebase-config.js`, ganti semua nilai `GANTI_...`.
4. Aktifkan **Email/Password** di *Authentication → Sign-in method*.
5. Buat **Cloud Firestore** di *Firestore Database → Create database*.
6. Atur Firestore Security Rules sesuai kebutuhan aplikasi.
7. Muat ulang halaman. Sistem otomatis berpindah dari Local Mode ke Firebase Mode.

> **Catatan keamanan:** konfigurasi Firebase Web dapat terlihat di sisi client. Keamanan data tetap harus diterapkan melalui Authentication dan Firestore Security Rules. Jangan menaruh secret server-side atau API key sensitif di frontend.

---

## 🧱 Arsitektur

Proyek menggunakan pendekatan *browser-first architecture*.

### Struktur Folder

```text
LynnZz-OS/
├── index.html               # Entry point: boot, login, shell desktop
├── css/                     # Styling desktop, window, taskbar, interface
├── js/
│   ├── firebase-config.js   # Konfigurasi Firebase
│   ├── os.js                # Boot, auth, storage, utilitas sistem
│   ├── window.js            # Window manager
│   ├── wallpaper.js         # Animated canvas wallpaper
│   ├── algorithm-lab.js     # Visualisasi algoritma
│   └── apps.js              # Registry dan kode aplikasi bawaan
├── apps/                    # Komponen dan aset per aplikasi
└── assets/                  # Icon, wallpaper, dan static assets
```

### Komponen Utama

| Komponen | Tanggung Jawab |
| --- | --- |
| `index.html` | Entry point dan struktur utama desktop |
| `css/` | Styling desktop, window, taskbar, dan interface |
| `js/` | Core system logic dan application logic |
| `apps/` | Komponen dan aset yang berkaitan dengan aplikasi |
| `assets/` | Icon, wallpaper, dan static assets |

### Core Modules

| Module | Tanggung Jawab |
| --- | --- |
| `os.js` | Core OS logic, boot, authentication, storage, dan system utilities |
| `window.js` | Window management |
| `algorithm-lab.js` | Algorithm visualization |
| `wallpaper.js` | Animated canvas wallpaper |
| `firebase-config.js` | Firebase configuration |

> Struktur file dapat berubah selama pengembangan karena LynnZz OS masih merupakan proyek aktif.

---

## 🛣️ Status Pengembangan

LynnZz OS saat ini berada dalam tahap *active development*.

### Implemented

- [x] Desktop environment
- [x] Boot sequence
- [x] Authentication
- [x] Local storage mode
- [x] Firebase integration
- [x] Window manager
- [x] Virtual filesystem
- [x] Terminal simulation
- [x] Animated canvas wallpaper
- [x] Built-in applications
- [x] Algorithm Lab
- [x] Sorting visualization
- [x] A\* and Dijkstra visualization

### Planned

- [ ] Lynn AI integration
- [ ] Application Store
- [ ] Window snapping
- [ ] Multiple virtual desktops
- [ ] Expanded filesystem capabilities
- [ ] Improved cloud storage
- [ ] Additional algorithm visualizations

---

## ⚠️ Keterbatasan

Karena LynnZz OS berjalan di dalam browser, beberapa kemampuan memiliki batasan dari browser dan website pihak ketiga.

- File audio dan gambar yang menggunakan browser object URLs tidak otomatis menjadi persistent storage.
- Beberapa website tidak dapat ditampilkan melalui iframe karena kebijakan keamanan seperti `X-Frame-Options` atau CSP.
- Firebase membutuhkan konfigurasi project sendiri.
- Virtual filesystem merupakan simulasi berbasis browser, bukan filesystem OS sebenarnya.
- Fitur yang membutuhkan API eksternal harus memperhatikan keamanan credential karena aplikasi berjalan di sisi client.

---

## 🧰 Teknologi

| Teknologi | Penggunaan |
| --- | --- |
| HTML5 | Struktur aplikasi |
| CSS3 | Interface, layout, dan animation |
| JavaScript | Core system dan application logic |
| Firebase | Authentication dan cloud data |
| Canvas API | Animated wallpaper dan visualisasi |
| Browser Storage APIs | Local persistence |
| GitHub Pages | Static hosting |

---

## 🎯 Tujuan Proyek

LynnZz OS dibuat sebagai proyek eksperimen untuk mempelajari:

- Frontend engineering
- Browser APIs
- JavaScript architecture
- Window management
- Virtual filesystem concepts
- Authentication
- Cloud database integration
- Algorithm visualization
- Interactive UI development

Proyek ini bukan operating system dalam arti kernel atau sistem operasi desktop sebenarnya. LynnZz OS adalah simulasi lingkungan desktop yang berjalan di browser.

---

## 👤 Pembuat

**Muhammad Naufal Dzakiy**

Informatics Student · Developer · AI & Web3 Learner

GitHub: [@aether-asahina](https://github.com/aether-asahina)

---

<div align="center">

*Build. Break. Learn. Repeat.*

</div>
