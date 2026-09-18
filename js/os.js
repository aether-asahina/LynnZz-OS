/* =========================================================
   LynnZz OS v1.0 — os.js
   Core: boot, auth, notifications, clock, desktop icons, storage
   ========================================================= */

const LZ = {}; // global namespace to avoid polluting window

/* ---------------------------------------------------------
   DIAGNOSTICS — surfaces silent JS errors as visible toasts
   since there's no devtools/console access on mobile.
--------------------------------------------------------- */
/* ---------------------------------------------------------
   ERROR LOGGER — persistent diagnostics
--------------------------------------------------------- */
LZ.errorLog = {
  key: 'lynnzz:error-log',
  max: 50,

  add(error){
    try{
      const logs = JSON.parse(localStorage.getItem(this.key) || '[]');

      logs.unshift({
        time: new Date().toISOString(),
        message: error.message || String(error),
        file: error.file || '?',
        line: error.line || 0,
        column: error.column || 0
      });

      localStorage.setItem(
        this.key,
        JSON.stringify(logs.slice(0, this.max))
      );
    }catch(e){
      console.error('[LynnZz OS] gagal menyimpan error log:', e);
    }
  },

  get(){
    try{
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    }catch(e){
      return [];
    }
  },

  clear(){
    localStorage.removeItem(this.key);
  }
};

/* ---------------------------------------------------------
   DIAGNOSTICS — surfaces and stores silent JS errors
--------------------------------------------------------- */
window.addEventListener('error', (e) => {
  console.error('[LynnZz OS error]', e);

  const file = (e.filename || '?').split('/').pop();
  const msg = `${e.message} — ${file}:${e.lineno || 0}`;

  LZ.errorLog.add({
    message: e.message || 'Unknown error',
    file,
    line: e.lineno || 0,
    column: e.colno || 0
  });

  if (LZ.notify) LZ.notify('⚠️ Error terdeteksi', msg, '⚠️', 12000);
  else alert('Error sebelum OS siap: ' + msg);
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason;
  const message = reason?.message || String(reason || 'Unknown rejection');

  console.error('[LynnZz OS unhandled rejection]', reason);

  LZ.errorLog.add({
    message,
    file: 'Promise',
    line: 0,
    column: 0
  });

  if (LZ.notify) {
    LZ.notify('⚠️ Promise Error', message, '⚠️', 12000);
  }
});

// Self-test: can we actually inject a <style> tag and have it take effect?
(function styleInjectionSelfTest(){
  try{
    const s = document.createElement('style');
    s.textContent = ':root{ --lz-smoketest: 1px; }';
    document.head.appendChild(s);
    const val = getComputedStyle(document.documentElement).getPropertyValue('--lz-smoketest').trim();
    window.__LZ_STYLE_OK__ = (val === '1px');
  }catch(e){
    window.__LZ_STYLE_OK__ = false;
  }
})();

/* =========================================================
   LYNNZZ PERSONALIZATION ENGINE
========================================================= */

LZ.applyPersonalization = function(){
  const settings = LZ.storage.get('settings', {});

  const accent = settings.accentColor || 'violet';
  const blur = settings.blurStrength || 'normal';
  const scale = settings.uiScale || '100';

  document.documentElement.dataset.accent = accent;
  document.documentElement.dataset.blur = blur;

  const scaleMap = {
    '90': 0.90,
    '100': 1,
    '110': 1.10
  };

  document.documentElement.style.setProperty(
    '--lz-scale',
    scaleMap[String(scale)] || 1
  );
};

/* Apply once DOM is available. */
document.addEventListener('DOMContentLoaded', () => {
  LZ.applyPersonalization();
});

/* ---------------------------------------------------------
   STORAGE HELPERS (namespaced by logged-in user)
--------------------------------------------------------- */
LZ.storage = {
  _key(app){ return `lynnzz:${LZ.auth.currentUser?.uid || 'guest'}:${app}`; },
  get(app, fallback){
    try{
      const raw = localStorage.getItem(this._key(app));
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(app, value){
    localStorage.setItem(this._key(app), JSON.stringify(value));
    // Best-effort cloud sync if Firestore is configured
    if (firebaseReady && db && LZ.auth.currentUser && !LZ.auth.currentUser.isGuest){
      db.collection('users').doc(LZ.auth.currentUser.uid)
        .collection('appdata').doc(app)
        .set({ value: JSON.stringify(value), updatedAt: Date.now() })
        .catch(()=>{ /* offline is fine, localStorage already has it */ });
    }
  }
};

/* ---------------------------------------------------------
   AUTH — uses Firebase if configured, else a local fallback
   so the OS is fully testable before Firebase is set up.
--------------------------------------------------------- */
LZ.auth = {
  currentUser: null,
  _listeners: [],

  onChange(cb){ this._listeners.push(cb); },
  _emit(){ this._listeners.forEach(cb => cb(this.currentUser)); },

  _localUsers(){
    return JSON.parse(localStorage.getItem('lynnzz_local_users') || '{}');
  },
  _saveLocalUsers(u){
    localStorage.setItem('lynnzz_local_users', JSON.stringify(u));
  },

  async register(name, email, password){
    if (firebaseReady){
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      await db.collection('users').doc(cred.user.uid).set({
        name, email, createdAt: Date.now()
      });
      return cred.user;
    } else {
      const users = this._localUsers();
      if (users[email]) throw new Error('Email sudah terdaftar.');
      if (password.length < 6) throw new Error('Kata sandi minimal 6 karakter.');
      const uid = 'local_' + Date.now();
      users[email] = { uid, name, email, password };
      this._saveLocalUsers(users);
      return this._login_local(email, password);
    }
  },

  async login(email, password){
    if (firebaseReady){
      const cred = await auth.signInWithEmailAndPassword(email, password);
      return cred.user;
    } else {
      return this._login_local(email, password);
    }
  },

  _login_local(email, password){
    const users = this._localUsers();
    const u = users[email];
    if (!u || u.password !== password) throw new Error('Email atau kata sandi salah.');
    const user = { uid: u.uid, displayName: u.name, email: u.email, isGuest:false };
    this.currentUser = user;
    localStorage.setItem('lynnzz_session', JSON.stringify(user));
    this._emit();
    return user;
  },

  loginAsGuest(){
    const user = { uid: 'guest', displayName: 'Tamu', email: 'guest@lynnzz.os', isGuest:true };
    this.currentUser = user;
    localStorage.setItem('lynnzz_session', JSON.stringify(user));
    this._emit();
    return user;
  },

  logout(){
    if (firebaseReady && auth.currentUser) auth.signOut();
    this.currentUser = null;
    localStorage.removeItem('lynnzz_session');
    this._emit();
  },

  restoreSession(){
    if (firebaseReady){
      auth.onAuthStateChanged(user => {
        if (user){
          this.currentUser = { uid:user.uid, displayName:user.displayName || user.email, email:user.email, isGuest:false };
        } else {
          // fall back to a possible local/guest session
          const raw = localStorage.getItem('lynnzz_session');
          this.currentUser = raw ? JSON.parse(raw) : null;
        }
        this._emit();
      });
    } else {
      const raw = localStorage.getItem('lynnzz_session');
      this.currentUser = raw ? JSON.parse(raw) : null;
      this._emit();
    }
  }
};

/* ---------------------------------------------------------
   NOTIFICATIONS
--------------------------------------------------------- */
LZ.notify = function(title, body, icon = '🔔', timeout = 4200){
  const stack = document.getElementById('notification-stack');
  const el = document.createElement('div');
  el.className = 'notif-toast';
  el.innerHTML = `<div class="notif-title">${icon} ${title}</div><div class="notif-body">${body}</div>`;
  stack.appendChild(el);
  setTimeout(()=>{
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(()=> el.remove(), 260);
  }, timeout);
};

/* ---------------------------------------------------------
   CLOCK
--------------------------------------------------------- */
LZ.startClock = function(){
  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu'];
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  function tick(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    document.getElementById('tray-time').textContent = `${hh}:${mm}`;
    document.getElementById('tray-date').textContent = `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]}`;
  }
  tick();
  setInterval(tick, 1000);
};

/* ---------------------------------------------------------
   DESKTOP ICONS + START MENU (built from LZ.APPS, defined in apps.js)
--------------------------------------------------------- */
LZ.renderLaunchers = function(){
  const iconLayer = document.getElementById('desktop-icons');
  const smApps = document.getElementById('start-menu-apps');
  iconLayer.innerHTML = '';
  smApps.innerHTML = '';

  LZ.APPS.forEach(app => {
    const di = document.createElement('div');
    di.className = 'desktop-icon';
    di.innerHTML = `<div class="icon-glyph">${app.icon}</div><div class="icon-label">${app.name}</div>`;
    di.ondblclick = () => LZ.win.open(app.id);
    di.onclick = (e)=>{ // mobile: single tap opens too
      clearTimeout(di._t);
      di._t = setTimeout(()=> LZ.win.open(app.id), 180);
    };
    iconLayer.appendChild(di);

    const sm = document.createElement('div');
    sm.className = 'sm-app';
    sm.innerHTML = `<div class="icon-glyph">${app.icon}</div><span>${app.name}</span>`;
    sm.onclick = () => { LZ.win.open(app.id); LZ.toggleStartMenu(false); };
    smApps.appendChild(sm);
  });
};

LZ.toggleStartMenu = function(force){
  const menu = document.getElementById('start-menu');
  const show = force !== undefined ? force : menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !show);
};

/* ---------------------------------------------------------
   START MENU SEARCH
--------------------------------------------------------- */
function initStartMenuSearch(){
  const search = document.getElementById('start-menu-search');
  const apps = document.getElementById('start-menu-apps');

  if (!search || !apps) return;

  search.addEventListener('input', ()=>{
    const query = search.value.trim().toLowerCase();

    apps.querySelectorAll('.sm-app').forEach(item=>{
      const name = item.textContent.trim().toLowerCase();
      item.style.display = !query || name.includes(query) ? '' : 'none';
    });
  });
}

initStartMenuSearch();

/* ---------------------------------------------------------
   SCREEN TRANSITIONS
--------------------------------------------------------- */
LZ.showScreen = function(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
};

/* ---------------------------------------------------------
   BOOT SEQUENCE
--------------------------------------------------------- */
function boot(){
  const steps = [
    [15, 'Memuat kernel…'],
    [35, 'Menyiapkan filesystem virtual…'],
    [55, 'Menginisialisasi Firebase…'],
    [75, 'Merender antarmuka…'],
    [95, 'Hampir selesai…'],
    [100, 'Selamat datang.']
  ];
  const fill = document.getElementById('boot-bar-fill');
  const status = document.getElementById('boot-status');
  let i = 0;
  const iv = setInterval(()=>{
    if (i >= steps.length){
      clearInterval(iv);
      finishBoot();
      return;
    }
    fill.style.width = steps[i][0] + '%';
    status.textContent = steps[i][1];
    i++;
  }, 320);
}

function finishBoot(){
  setTimeout(()=>{
    LZ.auth.restoreSession();
    if (LZ.auth.currentUser){
      enterDesktop();
    } else {
      LZ.showScreen('auth-screen');
    }
  }, 250);
}

function enterDesktop(){
  LZ.showScreen('desktop-screen');
  document.getElementById('sm-username').textContent = LZ.auth.currentUser.displayName || 'Pengguna';
  document.getElementById('sm-email').textContent = LZ.auth.currentUser.email || '';
  document.getElementById('sm-avatar').textContent = (LZ.auth.currentUser.displayName || 'P')[0].toUpperCase();
  LZ.applyWallpaper();
  LZ.renderLaunchers();
  LZ.startClock();
  setTimeout(()=> LZ.notify('Selamat datang', `Halo, ${LZ.auth.currentUser.displayName || 'Pengguna'} 👋`, '✨'), 500);
  setTimeout(()=> LZ.notify('Diagnostik', `Injeksi CSS dinamis: ${window.__LZ_STYLE_OK__ ? '✅ OK' : '❌ GAGAL'}`, '🔧', 9000), 1200);
}

/* ---------------------------------------------------------
   AUTH FORM WIRING
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  boot();

  document.getElementById('go-register').onclick = (e)=>{
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  };
  document.getElementById('go-login').onclick = (e)=>{
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  };

  document.getElementById('login-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const err = document.getElementById('login-error');
    err.textContent = '';
    try{
      await LZ.auth.login(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value
      );
      enterDesktop();
    }catch(ex){ err.textContent = ex.message || 'Gagal masuk.'; }
  });

  document.getElementById('register-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const err = document.getElementById('register-error');
    err.textContent = '';
    try{
      await LZ.auth.register(
        document.getElementById('register-name').value.trim(),
        document.getElementById('register-email').value.trim(),
        document.getElementById('register-password').value
      );
      enterDesktop();
    }catch(ex){ err.textContent = ex.message || 'Gagal daftar.'; }
  });

  document.getElementById('btn-guest').onclick = ()=>{
    LZ.auth.loginAsGuest();
    enterDesktop();
  };

  document.getElementById('start-btn').onclick = ()=> LZ.toggleStartMenu();
  document.addEventListener('click', (e)=>{
    const menu = document.getElementById('start-menu');
    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target.id !== 'start-btn' && !document.getElementById('start-btn').contains(e.target)){
      LZ.toggleStartMenu(false);
    }
  });

  document.getElementById('btn-logout').onclick = ()=>{
    LZ.auth.logout();
    LZ.toggleStartMenu(false);
    document.querySelectorAll('.os-window').forEach(w=>w.remove());
    document.getElementById('taskbar-apps').innerHTML = '';
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    LZ.showScreen('auth-screen');
  };

  document.getElementById('btn-lock').onclick = ()=>{
    LZ.toggleStartMenu(false);
    LZ.notify('Terkunci', 'Fitur kunci layar penuh nyusul di update berikutnya.', '🔒');
  };

  document.getElementById('tray-notif').onclick = ()=>{
    LZ.notify('Pusat Notifikasi', 'Belum ada notifikasi baru.', '🔔', 3000);
  };

  /* ---------------------------------------------------------
     DESKTOP SYSTEM MONITOR
  --------------------------------------------------------- */
  const systemStartTime = Date.now();

  function updateSystemWidget(){
    const ramEl = document.getElementById('system-ram');
    const uptimeEl = document.getElementById('system-uptime');
    const deviceEl = document.getElementById('system-device');
    const screenEl = document.getElementById('system-screen');

    if (!ramEl || !uptimeEl || !deviceEl || !screenEl) return;

    // RAM — tersedia di beberapa browser Chromium
    if (performance.memory){
      const used = performance.memory.usedJSHeapSize / 1024 / 1024;
      ramEl.textContent = `${used.toFixed(0)} MB`;
    }else{
      ramEl.textContent = 'N/A';
    }

    // Uptime LynnZz OS
    const elapsed = Math.floor((Date.now() - systemStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    uptimeEl.textContent =
      `${String(hours).padStart(2,'0')}:` +
      `${String(minutes).padStart(2,'0')}:` +
      `${String(seconds).padStart(2,'0')}`;

    // Device / browser platform
    const platform = navigator.platform || navigator.userAgentData?.platform || 'Unknown';
    deviceEl.textContent = platform;

    // Screen
    screenEl.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  }

  /* Apply saved desktop settings */
  function applyDesktopSettings(){
    const settings = LZ.storage.get('settings', {});

    const desktop = document.getElementById('desktop-icons');
    const widgets = document.getElementById('desktop-widgets');

    if (desktop){
      desktop.dataset.iconSize = settings.iconSize || 'medium';
    }

    if (widgets){
      widgets.style.display = settings.widgets === false ? 'none' : '';
    }

    document.documentElement.classList.toggle(
      'no-window-animation',
      settings.windowAnim === false
    );
  }

  applyDesktopSettings();

  updateSystemWidget();
  setInterval(updateSystemWidget, 1000);

  /* ---------------------------------------------------------
     SYSTEM WIDGET TOGGLE
  --------------------------------------------------------- */
  const systemWidget = document.getElementById('system-widget');
  const systemToggle = document.getElementById('system-widget-toggle');

  if (systemWidget && systemToggle){
    systemToggle.addEventListener('click', ()=>{
      const minimized = systemWidget.classList.toggle('minimized');

      systemToggle.textContent = minimized ? '+' : '−';
      systemToggle.title = minimized ? 'Expand' : 'Minimize';
    });
  }
});
