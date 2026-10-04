LynnZz OS

«A browser-based operating system interface built with HTML, CSS, and JavaScript.»

LynnZz OS is a web-based operating system simulation designed to recreate a desktop environment directly inside a browser.

It includes a boot sequence, authentication, desktop environment, window management, virtual filesystem, built-in applications, animated wallpapers, and browser-based system utilities.

Live Demo:
https://aether-asahina.github.io/LynnZz-OS/

---

Features

Desktop Environment

- Boot sequence with progress indicator
- Animated desktop wallpaper
- Desktop icons
- Taskbar and start menu
- Real-time clock and date
- User profile
- Toast notifications

Window Management

- Multiple applications running simultaneously
- Drag and resize windows
- Minimize, maximize, and close
- Window state management

Built-in Applications

- File Manager
- Notes
- Calculator
- Browser
- Music Player
- Gallery
- Settings
- Algorithm Lab
- Terminal simulation

Authentication & Storage

LynnZz OS supports two storage modes:

- Local Mode using browser storage
- Firebase Mode for authentication and cloud data

The system can operate locally without requiring a Firebase configuration.

Developer Experiments

The project also contains several experimental components, including:

- Algorithm visualization
- A* and Dijkstra pathfinding
- Sorting algorithm visualization
- Virtual filesystem
- Canvas-based animated wallpapers
- Browser-based terminal simulation

---

Tech Stack

Technology| Purpose
HTML5| Application structure
CSS3| Desktop UI and animations
JavaScript| Core system logic
Firebase| Authentication and cloud storage
Canvas API| Animated graphics and visualizations
Browser Storage APIs| Local persistence

---

Architecture

LynnZz-OS/
├── apps/
├── assets/
│   ├── icons/
│   └── wallpapers/
├── css/
│   ├── desktop.css
│   ├── taskbar.css
│   └── algorithm-lab.css
├── js/
│   ├── firebase-config.js
│   ├── os.js
│   ├── window.js
│   ├── algorithm-lab.js
│   └── wallpaper.js
├── index.html
└── README.md

The project uses a browser-first architecture. Most applications are rendered and managed through JavaScript rather than relying on separate server-side components.

---

Running Locally

Clone the repository:

git clone https://github.com/aether-asahina/LynnZz-OS.git
cd LynnZz-OS

Then open "index.html" in a browser.

For development, the project can also be served using a local HTTP server.

GitHub Pages

The project is designed to work as a static web application and can be deployed directly through GitHub Pages.

---

Firebase Configuration

Firebase is optional.

Without Firebase configuration, LynnZz OS uses local browser storage.

To enable Firebase:

1. Create a Firebase project.
2. Register a Web App.
3. Enable Email/Password Authentication.
4. Enable Firestore.
5. Add the Firebase configuration to:

js/firebase-config.js

Do not commit private API keys or credentials that should not be public.

---

Current Status

LynnZz OS is an ongoing personal development project.

The current implementation focuses on:

- Desktop environment
- Window management
- Browser-based applications
- Local persistence
- Firebase integration
- Algorithm visualization
- Terminal and filesystem simulation

---

Roadmap

Future development may include:

- AI assistant integration
- Expanded virtual terminal
- Application Store
- Window snapping
- Multiple virtual desktops
- Improved filesystem capabilities
- Firebase Storage integration
- More system applications

---

Known Limitations

Some browser APIs have limitations that affect the simulated operating system.

- Files selected for the Gallery and Music Player may not persist after the browser session ends.
- Some websites cannot be embedded inside the browser application because they block iframe access.
- Firebase functionality requires additional project configuration.
- The virtual filesystem is a browser-side simulation and is not an actual operating-system filesystem.

---

Why This Project?

LynnZz OS started as an experiment in recreating an operating system experience using only web technologies.

The project explores how far a browser can be pushed to simulate concepts normally associated with desktop operating systems, including window management, filesystems, applications, authentication, and interactive system utilities.

It is primarily a learning and experimentation project focused on frontend engineering, browser APIs, system design concepts, and interactive UI development.

---

Author

Muhammad Naufal Dzakiy

GitHub: https://github.com/aether-asahina

---

«Build. Break. Learn. Repeat.»
