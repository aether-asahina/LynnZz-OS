/* =========================================================
   LynnZz OS v1.0 — os.js
   Core: boot, auth, notifications, clock, desktop icons, storage
   ========================================================= */

const LZ = {}; // global namespace to avoid polluting window

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
  LZ.renderLaunchers();
  LZ.startClock();
  setTimeout(()=> LZ.notify('Selamat datang', `Halo, ${LZ.auth.currentUser.displayName || 'Pengguna'} 👋`, '✨'), 500);
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
});
