<div align="center">

# 🖥️ LynnZz OS

**A browser-based desktop operating system.**

A desktop environment simulation built with vanilla HTML, CSS, and JavaScript. No frontend framework, no build step.

[![Status](https://img.shields.io/badge/status-active-success)](#️-development-status)
[![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222?logo=github)](#-getting-started)
[![Firebase](https://img.shields.io/badge/backend-Firebase%20optional-FFCA28?logo=firebase&logoColor=black)](#-firebase-optional)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)](#-tech-stack)

[**🚀 Live Demo**](https://aether-asahina.github.io/LynnZz-OS/)

</div>

---

## 📖 About

LynnZz OS is a desktop operating system simulation that runs entirely in the browser.

It recreates a desktop experience on the web, including a boot sequence, authentication, a desktop environment, animated wallpaper, taskbar, start menu, window management, a virtual filesystem, a terminal simulation, and a set of built-in applications.

The project is an experiment and a learning exercise: how far can web technologies go in building an environment that resembles an operating system?

LynnZz OS runs in local mode without any external backend. Firebase is optional and can be enabled for authentication and cloud-based data storage.

---

## ✨ Features

### 🖥️ Desktop Environment

- Boot sequence with progress indicator
- Desktop with animated canvas wallpaper
- Desktop icons
- Taskbar and start menu
- Realtime clock and date
- User profile
- Toast notifications
- Multi-window environment

### 🪟 Window Manager

- Open multiple applications at the same time
- Drag windows
- Resize windows
- Minimize
- Maximize
- Close
- Window state management

### 📦 Apps & System

| Component | Description |
| --- | --- |
| 📁 File Manager | Virtual filesystem for managing files and folders |
| 📝 Notes | Create and manage notes |
| 🧮 Calculator | Browser-based calculator |
| 🌐 Browser | Browser interface with new-tab fallback |
| 🎵 Music Player | Play audio files from your device |
| 🖼️ Gallery | View images from your device |
| ⚙️ Settings | Wallpaper, account, and local data settings |
| 💻 Terminal | Terminal simulation with a virtual filesystem |
| 🧪 Algorithm Lab | Algorithm experiments and visualization |

### 🧪 Algorithm Lab

Algorithm Lab lets you explore and visualize algorithms interactively, including:

- Bubble Sort
- Quick Sort
- Merge Sort
- A\*
- Dijkstra
- Dataset management
- Algorithm comparison

---

## 💾 Storage Modes

LynnZz OS supports two storage approaches.

### Local Mode

No Firebase configuration required. Data is stored in browser storage, so the system works fully offline-first on a single device.

### Firebase Mode

Firebase can be used for:

- Authentication
- Cloud data
- User-based storage

Firebase mode is optional, so the project can still be deployed as a static web application.

---

## 🚀 Getting Started

### GitHub Pages

LynnZz OS runs directly on GitHub Pages:

**https://aether-asahina.github.io/LynnZz-OS/**

To host your own fork: *Settings → Pages → Branch `main` / folder `/ (root)` → Save*.

### Run Locally

Clone the repository:

```bash
git clone https://github.com/aether-asahina/LynnZz-OS.git
cd LynnZz-OS
```

Because the project relies on browser APIs, running it through a local HTTP server is recommended.

With Python:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Or with Node.js:

```bash
npx serve .
```

> Avoid opening `index.html` directly via `file://` if you want the same behavior as when the project is served over HTTP.

---

## 🔥 Firebase (Optional)

Firebase is not required to run LynnZz OS.

To enable it:

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Register a Web App and copy the `firebaseConfig` object.
3. Paste it into `js/firebase-config.js`, replacing every `GANTI_...` placeholder.
4. Enable **Email/Password** under *Authentication → Sign-in method*.
5. Create a **Cloud Firestore** database under *Firestore Database → Create database*.
6. Configure Firestore Security Rules to fit your application.
7. Reload the page. The system automatically switches from Local Mode to Firebase Mode.

> **Security note:** Firebase Web configuration is visible on the client side. Data security must be enforced through Authentication and Firestore Security Rules. Do not put server-side secrets or sensitive API keys in the frontend.

---

## 🧱 Architecture

The project follows a *browser-first architecture*.

### Folder Structure

```text
LynnZz-OS/
├── index.html               # Entry point: boot, login, desktop shell
├── css/                     # Styling for desktop, windows, taskbar, UI
├── js/
│   ├── firebase-config.js   # Firebase configuration
│   ├── os.js                # Boot, auth, storage, system utilities
│   ├── window.js            # Window manager
│   ├── wallpaper.js         # Animated canvas wallpaper
│   ├── algorithm-lab.js     # Algorithm visualization
│   └── apps.js              # Registry and code for built-in apps
├── apps/                    # Per-app components and assets
└── assets/                  # Icons, wallpapers, and static assets
```

### Main Components

| Component | Responsibility |
| --- | --- |
| `index.html` | Entry point and main desktop structure |
| `css/` | Styling for the desktop, windows, taskbar, and interface |
| `js/` | Core system logic and application logic |
| `apps/` | Application-related components and assets |
| `assets/` | Icons, wallpapers, and static assets |

### Core Modules

| Module | Responsibility |
| --- | --- |
| `os.js` | Core OS logic, boot, authentication, storage, and system utilities |
| `window.js` | Window management |
| `algorithm-lab.js` | Algorithm visualization |
| `wallpaper.js` | Animated canvas wallpaper |
| `firebase-config.js` | Firebase configuration |

> The file structure may change during development, as LynnZz OS is an active project.

---

## 🛣️ Development Status

LynnZz OS is currently under *active development*.

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

## ⚠️ Limitations

Because LynnZz OS runs inside the browser, some capabilities are limited by the browser and by third-party websites.

- Audio and image files loaded through browser object URLs are not automatically persisted.
- Some websites cannot be displayed in an iframe due to security policies such as `X-Frame-Options` or CSP.
- Firebase requires your own project configuration.
- The virtual filesystem is a browser-based simulation, not a real OS filesystem.
- Features that depend on external APIs must handle credentials carefully, since the app runs on the client side.

---

## 🧰 Tech Stack

| Technology | Usage |
| --- | --- |
| HTML5 | Application structure |
| CSS3 | Interface, layout, and animation |
| JavaScript | Core system and application logic |
| Firebase | Authentication and cloud data |
| Canvas API | Animated wallpaper and visualizations |
| Browser Storage APIs | Local persistence |
| GitHub Pages | Static hosting |

---

## 🎯 Project Goals

LynnZz OS was built as an experimental project to learn about:

- Frontend engineering
- Browser APIs
- JavaScript architecture
- Window management
- Virtual filesystem concepts
- Authentication
- Cloud database integration
- Algorithm visualization
- Interactive UI development

This is not an operating system in the sense of a kernel or a real desktop OS. LynnZz OS is a desktop environment simulation that runs in the browser.

---

## 👤 Author

**Muhammad Naufal Dzakiy**

Informatics Student · Developer · AI & Web3 Learner

GitHub: [@aether-asahina](https://github.com/aether-asahina)

---

<div align="center">

*Build. Break. Learn. Repeat.*

</div>
