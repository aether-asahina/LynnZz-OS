/* =========================================================
   LynnZz OS v1.0 — apps.js
   App registry + built-in apps
   ========================================================= */

function h(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

/* ============================================================
   1. FILE MANAGER — virtual filesystem persisted in storage
============================================================ */
function renderFileManager(body){
  let fs = LZ.storage.get('filemanager', {
    name:'root', type:'folder',
    children:[
      {name:'Dokumen', type:'folder', children:[]},
      {name:'Proyek', type:'folder', children:[]},
      {name:'baca-aku.txt', type:'file', content:'Selamat datang di LynnZz OS File Manager!\n\nBuat folder & file baru pakai tombol di atas.'}
    ]
  });
  let path = []; // array of names from root

  function saveFS(){ LZ.storage.set('filemanager', fs); }

  function getNode(p){
    let node = fs;
    for (const seg of p){
      node = node.children.find(c => c.name === seg);
      if (!node) return fs;
    }
    return node;
  }

  function draw(){
    const node = getNode(path);
    const crumbs = ['root', ...path].map((n,i) =>
      `<span class="fm-crumb" data-i="${i-1}">${n}</span>`).join('<span class="fm-sep">/</span>');

    body.innerHTML = '';
    body.appendChild(h(`
      <div class="fm-wrap">
        <div class="fm-toolbar">
          <button class="fm-btn" data-act="newfolder">📁+ Folder</button>
          <button class="fm-btn" data-act="newfile">📄+ File</button>
          <button class="fm-btn" data-act="up" ${path.length===0?'disabled':''}>⬆ Atas</button>
        </div>
        <div class="fm-crumbs">${crumbs}</div>
        <div class="fm-list"></div>
      </div>
      <style>
        .fm-wrap{display:flex; flex-direction:column; height:100%; font-size:13px;}
        .fm-toolbar{display:flex; gap:6px; padding:8px; border-bottom:1px solid var(--border); flex-wrap:wrap;}
        .fm-btn{background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:6px 10px; border-radius:8px; font-size:12px; cursor:pointer;}
        .fm-crumbs{padding:6px 10px; color:var(--text-muted); font-family:var(--font-mono); font-size:11px;}
        .fm-crumb{cursor:pointer;} .fm-crumb:hover{color:var(--violet);}
        .fm-sep{margin:0 4px;}
        .fm-list{flex:1; overflow:auto; padding:6px;}
        .fm-item{display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px; cursor:pointer;}
        .fm-item:hover{background:var(--surface-2);}
        .fm-item .fm-name{flex:1;}
        .fm-del{opacity:.5; padding:2px 6px;}
        .fm-editor{position:absolute; inset:0; background:var(--surface); display:flex; flex-direction:column;}
        .fm-editor textarea{flex:1; background:var(--void); color:var(--text); border:none; padding:12px; font-family:var(--font-mono); font-size:13px; resize:none; outline:none;}
        .fm-editor-bar{display:flex; gap:8px; padding:8px; border-bottom:1px solid var(--border);}
        .fm-empty{padding:24px; text-align:center; color:var(--text-muted);}
      </style>
    `));

    const list = body.querySelector('.fm-list');
    if (!node.children.length){
      list.appendChild(h(`<div class="fm-empty">Folder ini kosong.</div>`));
    }
    node.children.forEach(child => {
      const item = h(`<div class="fm-item">
        <span>${child.type === 'folder' ? '📁' : '📄'}</span>
        <span class="fm-name">${child.name}</span>
        <span class="fm-del">🗑</span>
      </div>`);
      item.querySelector('.fm-name').onclick = () => {
        if (child.type === 'folder'){ path.push(child.name); draw(); }
        else openFile(child);
      };
      item.querySelector('.fm-del').onclick = (e) => {
        e.stopPropagation();
        node.children = node.children.filter(c => c !== child);
        saveFS(); draw();
      };
      list.appendChild(item);
    });

    body.querySelectorAll('.fm-crumb').forEach(c => {
      c.onclick = () => { path = path.slice(0, +c.dataset.i + 1); draw(); };
    });
    body.querySelector('[data-act="up"]').onclick = () => { path.pop(); draw(); };
    body.querySelector('[data-act="newfolder"]').onclick = () => {
      const name = prompt('Nama folder:');
      if (name) { node.children.push({name, type:'folder', children:[]}); saveFS(); draw(); }
    };
    body.querySelector('[data-act="newfile"]').onclick = () => {
      const name = prompt('Nama file:');
      if (name) { node.children.push({name, type:'file', content:''}); saveFS(); draw(); }
    };
  }

  function openFile(file){
    const editor = h(`
      <div class="fm-editor">
        <div class="fm-editor-bar">
          <button class="fm-btn" data-act="save">💾 Simpan</button>
          <button class="fm-btn" data-act="close">✕ Tutup</button>
        </div>
        <textarea>${file.content || ''}</textarea>
      </div>
    `);
    body.appendChild(editor);
    editor.querySelector('[data-act="save"]').onclick = () => {
      file.content = editor.querySelector('textarea').value;
      saveFS();
      LZ.notify('File Manager', `"${file.name}" disimpan.`, '📄', 2000);
    };
    editor.querySelector('[data-act="close"]').onclick = () => editor.remove();
  }

  draw();
}

/* ============================================================
   2. NOTES
============================================================ */
function renderNotes(body){
  let notes = LZ.storage.get('notes', []);
  let activeId = notes[0]?.id || null;

  function save(){ LZ.storage.set('notes', notes); }

  function draw(){
    body.innerHTML = '';
    body.appendChild(h(`
      <div class="notes-wrap">
        <div class="notes-sidebar">
          <button class="notes-new">＋ Catatan Baru</button>
          <div class="notes-list"></div>
        </div>
        <div class="notes-editor">
          <input class="notes-title" placeholder="Judul catatan…">
          <textarea class="notes-body" placeholder="Tulis sesuatu…"></textarea>
        </div>
      </div>
      <style>
        .notes-wrap{display:flex; height:100%;}
        .notes-sidebar{width:150px; border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0;}
        .notes-new{margin:8px; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); font-size:12px; cursor:pointer;}
        .notes-list{flex:1; overflow-y:auto; padding:0 6px;}
        .notes-item{padding:8px; border-radius:8px; font-size:12px; cursor:pointer; color:var(--text-muted); margin-bottom:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
        .notes-item.active{background:var(--surface-2); color:var(--text);}
        .notes-editor{flex:1; display:flex; flex-direction:column;}
        .notes-title{border:none; background:transparent; color:var(--text); font-size:15px; font-weight:600; padding:12px 14px 4px; outline:none;}
        .notes-body{flex:1; border:none; background:transparent; color:var(--text); font-size:13.5px; padding:0 14px 14px; outline:none; resize:none; line-height:1.6;}
      </style>
    `));

    const list = body.querySelector('.notes-list');
    notes.forEach(n => {
      const it = h(`<div class="notes-item ${n.id===activeId?'active':''}">${n.title || 'Tanpa judul'}</div>`);
      it.onclick = () => { activeId = n.id; draw(); };
      list.appendChild(it);
    });

    const active = notes.find(n => n.id === activeId);
    const titleEl = body.querySelector('.notes-title');
    const bodyEl = body.querySelector('.notes-body');
    if (active){
      titleEl.value = active.title;
      bodyEl.value = active.content;
      titleEl.oninput = () => { active.title = titleEl.value; save(); body.querySelector('.notes-item.active').textContent = active.title || 'Tanpa judul'; };
      bodyEl.oninput = () => { active.content = bodyEl.value; save(); };
    } else {
      titleEl.value = ''; bodyEl.value = '';
      titleEl.disabled = true; bodyEl.disabled = true;
    }

    body.querySelector('.notes-new').onclick = () => {
      const n = { id: Date.now().toString(), title:'', content:'' };
      notes.unshift(n); activeId = n.id; save(); draw();
      body.querySelector('.notes-title').focus();
    };
  }
  draw();
}

/* ============================================================
   3. CALCULATOR
============================================================ */
function renderCalculator(body){
  let expr = '';
  body.innerHTML = '';
  body.appendChild(h(`
    <div class="calc-wrap">
      <div class="calc-screen"><div class="calc-expr"></div><div class="calc-result">0</div></div>
      <div class="calc-grid">
        ${['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(k=>`<button class="calc-key${['÷','×','−','+','='].includes(k)?' op':''}${k==='='?' eq':''}" data-k="${k}">${k}</button>`).join('')}
      </div>
    </div>
    <style>
      .calc-wrap{display:flex; flex-direction:column; height:100%;}
      .calc-screen{padding:20px 16px 10px; text-align:right;}
      .calc-expr{color:var(--text-muted); font-size:13px; font-family:var(--font-mono); min-height:16px;}
      .calc-result{font-size:32px; font-weight:600; font-family:var(--font-mono); overflow-x:auto;}
      .calc-grid{flex:1; display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border);}
      .calc-key{background:var(--surface); border:none; color:var(--text); font-size:17px; cursor:pointer;}
      .calc-key:active{background:var(--surface-2);}
      .calc-key.op{color:var(--violet); font-weight:600;}
      .calc-key.eq{background:var(--grad); color:#fff; grid-row: span 1;}
    </style>
  `));

  const exprEl = body.querySelector('.calc-expr');
  const resEl = body.querySelector('.calc-result');

  function safeEval(str){
    const sanitized = str.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/%/g,'/100');
    if (!/^[0-9+\-*/.() ]*$/.test(sanitized)) throw new Error('bad');
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${sanitized})`)();
  }

  body.querySelectorAll('.calc-key').forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.k;
      if (k === 'C'){ expr = ''; }
      else if (k === '⌫'){ expr = expr.slice(0,-1); }
      else if (k === '='){
        try{
          const r = safeEval(expr);
          exprEl.textContent = expr + ' =';
          expr = String(r);
          resEl.textContent = expr;
          return;
        }catch(e){ resEl.textContent = 'Error'; expr=''; return; }
      } else {
        expr += k;
      }
      exprEl.textContent = expr;
      resEl.textContent = expr ? (()=>{ try{ return safeEval(expr); }catch(e){ return expr; } })() : '0';
    };
  });
}

/* ============================================================
   4. BROWSER
============================================================ */
function renderBrowser(body){
  body.innerHTML = '';
  body.appendChild(h(`
    <div class="br-wrap">
      <div class="br-bar">
        <input class="br-url" placeholder="Ketik URL, mis. wikipedia.org" value="https://www.wikipedia.org">
        <button class="br-go">Buka</button>
        <button class="br-ext" title="Buka di tab baru">↗</button>
      </div>
      <div class="br-note">Sebagian situs (Google, YouTube, dll) memblokir tampilan embed (X-Frame-Options). Kalau blank, pakai tombol ↗.</div>
      <iframe class="br-frame" src="https://www.wikipedia.org"></iframe>
    </div>
    <style>
      .br-wrap{display:flex; flex-direction:column; height:100%;}
      .br-bar{display:flex; gap:6px; padding:8px; border-bottom:1px solid var(--border);}
      .br-url{flex:1; background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:8px 10px; border-radius:8px; font-size:12.5px; outline:none;}
      .br-go, .br-ext{background:var(--surface-2); border:1px solid var(--border); color:var(--text); border-radius:8px; padding:0 12px; cursor:pointer; font-size:12.5px;}
      .br-note{font-size:10.5px; color:var(--text-muted); padding:2px 10px 6px;}
      .br-frame{flex:1; border:none; background:#fff;}
    </style>
  `));

  function normalize(u){
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  const urlInput = body.querySelector('.br-url');
  const frame = body.querySelector('.br-frame');
  body.querySelector('.br-go').onclick = () => { frame.src = normalize(urlInput.value.trim()); };
  urlInput.onkeydown = (e) => { if (e.key === 'Enter') frame.src = normalize(urlInput.value.trim()); };
  body.querySelector('.br-ext').onclick = () => window.open(normalize(urlInput.value.trim()), '_blank');
}

/* ============================================================
   5. MUSIC PLAYER
============================================================ */
function renderMusicPlayer(body){
  let playlist = [];
  let current = -1;
  body.innerHTML = '';
  body.appendChild(h(`
    <div class="mp-wrap">
      <input type="file" class="mp-input" accept="audio/*" multiple hidden>
      <button class="mp-add">🎵 Tambah Lagu dari Perangkat</button>
      <div class="mp-now">Belum ada lagu diputar</div>
      <audio class="mp-audio"></audio>
      <div class="mp-controls">
        <button class="mp-prev">⏮</button>
        <button class="mp-play">▶</button>
        <button class="mp-next">⏭</button>
      </div>
      <div class="mp-list"></div>
    </div>
    <style>
      .mp-wrap{display:flex; flex-direction:column; height:100%; padding:12px; gap:10px;}
      .mp-add{background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:10px; border-radius:10px; cursor:pointer; font-size:12.5px;}
      .mp-now{text-align:center; font-size:13px; color:var(--text-muted); font-family:var(--font-mono);}
      .mp-controls{display:flex; justify-content:center; gap:16px;}
      .mp-controls button{width:44px; height:44px; border-radius:50%; border:none; background:var(--grad); color:#fff; font-size:16px; cursor:pointer;}
      .mp-list{flex:1; overflow-y:auto; border-top:1px solid var(--border); padding-top:8px;}
      .mp-track{padding:8px; border-radius:8px; font-size:12.5px; cursor:pointer; color:var(--text-muted);}
      .mp-track.active{background:var(--surface-2); color:var(--violet);}
    </style>
  `));

  const audio = body.querySelector('.mp-audio');
  const input = body.querySelector('.mp-input');
  const listEl = body.querySelector('.mp-list');
  const nowEl = body.querySelector('.mp-now');
  const playBtn = body.querySelector('.mp-play');

  body.querySelector('.mp-add').onclick = () => input.click();
  input.onchange = () => {
    Array.from(input.files).forEach(f => playlist.push({ name: f.name, url: URL.createObjectURL(f) }));
    drawList();
    if (current === -1 && playlist.length) playTrack(0);
  };

  function drawList(){
    listEl.innerHTML = '';
    playlist.forEach((t, i) => {
      const it = h(`<div class="mp-track ${i===current?'active':''}">${t.name}</div>`);
      it.onclick = () => playTrack(i);
      listEl.appendChild(it);
    });
  }
  function playTrack(i){
    current = i;
    audio.src = playlist[i].url;
    audio.play();
    nowEl.textContent = playlist[i].name;
    playBtn.textContent = '⏸';
    drawList();
  }
  playBtn.onclick = () => {
    if (current === -1) return;
    if (audio.paused){ audio.play(); playBtn.textContent = '⏸'; }
    else { audio.pause(); playBtn.textContent = '▶'; }
  };
  body.querySelector('.mp-next').onclick = () => { if (playlist.length) playTrack((current+1) % playlist.length); };
  body.querySelector('.mp-prev').onclick = () => { if (playlist.length) playTrack((current-1+playlist.length) % playlist.length); };
  audio.onended = () => { if (playlist.length) playTrack((current+1) % playlist.length); };
}

/* ============================================================
   6. GALLERY
============================================================ */
function renderGallery(body){
  let images = [];
  body.innerHTML = '';
  body.appendChild(h(`
    <div class="gal-wrap">
      <input type="file" class="gal-input" accept="image/*" multiple hidden>
      <button class="gal-add">🖼 Tambah Gambar</button>
      <div class="gal-grid"></div>
      <div class="gal-empty">Belum ada gambar. Gambar hanya tersimpan untuk sesi ini.</div>
    </div>
    <style>
      .gal-wrap{display:flex; flex-direction:column; height:100%; padding:12px; gap:10px;}
      .gal-add{background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:10px; border-radius:10px; cursor:pointer; font-size:12.5px;}
      .gal-grid{flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:8px;}
      .gal-grid img{width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; cursor:pointer;}
      .gal-empty{text-align:center; color:var(--text-muted); font-size:12px;}
      .gal-lightbox{position:fixed; inset:0; background:rgba(0,0,0,.85); display:flex; align-items:center; justify-content:center; z-index:999;}
      .gal-lightbox img{max-width:90%; max-height:90%; border-radius:8px;}
    </style>
  `));

  const grid = body.querySelector('.gal-grid');
  const input = body.querySelector('.gal-input');
  const empty = body.querySelector('.gal-empty');

  body.querySelector('.gal-add').onclick = () => input.click();
  input.onchange = () => {
    Array.from(input.files).forEach(f => images.push(URL.createObjectURL(f)));
    draw();
  };
  function draw(){
    grid.innerHTML = '';
    empty.style.display = images.length ? 'none' : 'block';
    images.forEach(src => {
      const img = h(`<img src="${src}">`);
      img.onclick = () => {
        const lb = h(`<div class="gal-lightbox"><img src="${src}"></div>`);
        lb.onclick = () => lb.remove();
        document.body.appendChild(lb);
      };
      grid.appendChild(img);
    });
  }
  draw();
}

/* ============================================================
   7. SETTINGS
============================================================ */
function renderSettings(body){
  const themes = [
    { id:'nebula', label:'Nebula (default)', css: null },
    { id:'crimson', label:'Crimson Dusk', css: `radial-gradient(ellipse 60% 45% at 20% 15%, rgba(255,46,99,0.35), transparent 60%), radial-gradient(ellipse 55% 45% at 85% 75%, rgba(168,85,247,0.28), transparent 60%), linear-gradient(160deg, #150a10 0%, #0a0a12 55%, #0c0a14 100%)` },
    { id:'abyss', label:'Deep Abyss', css: `radial-gradient(ellipse 60% 45% at 30% 20%, rgba(30,64,175,0.35), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(88,28,135,0.3), transparent 60%), linear-gradient(160deg, #060812 0%, #05050a 55%, #07060f 100%)` },
    { id:'ember', label:'Ember', css: `radial-gradient(ellipse 60% 45% at 25% 20%, rgba(255,106,0,0.3), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(255,46,99,0.28), transparent 60%), linear-gradient(160deg, #150c08 0%, #0a0a12 55%, #0c0a14 100%)` },
  ];
  const saved = LZ.storage.get('settings', { theme:'nebula' });

  body.innerHTML = '';
  const u = LZ.auth.currentUser;
  body.appendChild(h(`
    <div class="st-wrap">
      <div class="st-section">
        <div class="st-label">Akun</div>
        <div class="st-account">
          <div class="user-avatar">${(u.displayName||'P')[0].toUpperCase()}</div>
          <div><div style="font-weight:600; font-size:13px;">${u.displayName || 'Pengguna'}</div>
          <div style="font-size:11.5px; color:var(--text-muted);">${u.email}${u.isGuest ? ' (mode tamu — data tidak sinkron cloud)' : ''}</div></div>
        </div>
      </div>
      <div class="st-section">
        <div class="st-label">Wallpaper</div>
        <div class="st-themes"></div>
      </div>
      <div class="st-section">
        <div class="st-label">Data</div>
        <button class="st-danger">🗑 Hapus Semua Data Lokal</button>
      </div>
      <div class="st-section">
        <div class="st-label">Tentang</div>
        <div style="font-size:12px; color:var(--text-muted); line-height:1.6;">LynnZz OS v1.0<br>Dibangun dengan HTML, CSS, JS & Firebase.</div>
      </div>
    </div>
    <style>
      .st-wrap{padding:16px; overflow-y:auto; height:100%;}
      .st-section{margin-bottom:22px;}
      .st-label{font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:10px;}
      .st-account{display:flex; align-items:center; gap:12px;}
      .st-themes{display:grid; grid-template-columns:repeat(2,1fr); gap:8px;}
      .st-theme{height:52px; border-radius:10px; border:2px solid var(--border); cursor:pointer; position:relative; display:flex; align-items:flex-end; padding:6px; font-size:10px; color:#fff; text-shadow:0 1px 2px #000;}
      .st-theme.active{border-color:var(--violet);}
      .st-danger{background:rgba(255,46,99,0.12); border:1px solid var(--crimson); color:var(--crimson); padding:9px 14px; border-radius:9px; cursor:pointer; font-size:12.5px;}
    </style>
  `));

  const themeGrid = body.querySelector('.st-themes');
  themes.forEach(t => {
    const el = h(`<div class="st-theme ${saved.theme===t.id?'active':''}">${t.label}</div>`);
    el.style.background = t.css || getComputedStyle(document.getElementById('wallpaper')).backgroundImage;
    if (t.id === 'nebula') el.style.background = 'linear-gradient(135deg,#a855f7,#ff2e63)';
    else el.style.background = t.css;
    el.onclick = () => {
      LZ.storage.set('settings', { theme: t.id });
      document.getElementById('wallpaper').style.background = t.css ? t.css + ', linear-gradient(160deg,#0d0b16,#0a0a12)' : '';
      if (!t.css) document.getElementById('wallpaper').removeAttribute('style');
      body.querySelectorAll('.st-theme').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      LZ.notify('Settings', `Wallpaper diganti ke ${t.label}.`, '🎨', 2000);
    };
    themeGrid.appendChild(el);
  });

  // apply saved theme on load
  const savedTheme = themes.find(t => t.id === saved.theme);
  if (savedTheme && savedTheme.css){
    document.getElementById('wallpaper').style.background = savedTheme.css;
  }

  body.querySelector('.st-danger').onclick = () => {
    if (confirm('Yakin mau hapus semua data lokal LynnZz OS? Ini tidak bisa dibatalkan.')){
      Object.keys(localStorage).filter(k => k.startsWith('lynnzz')).forEach(k => localStorage.removeItem(k));
      LZ.notify('Settings', 'Data lokal dihapus. Reload halaman untuk efek penuh.', '🗑');
    }
  };
}

/* ============================================================
   APP REGISTRY
============================================================ */
LZ.APPS = [
  { id:'filemanager', name:'File Manager', icon:'📁', width:420, height:380, render: renderFileManager },
  { id:'notes',        name:'Notes',        icon:'📝', width:440, height:360, render: renderNotes },
  { id:'calculator',   name:'Calculator',   icon:'🧮', width:280, height:400, render: renderCalculator },
  { id:'browser',      name:'Browser',      icon:'🌐', width:520, height:420, render: renderBrowser },
  { id:'music',        name:'Music Player', icon:'🎵', width:340, height:420, render: renderMusicPlayer },
  { id:'gallery',      name:'Gallery',      icon:'🖼️', width:400, height:380, render: renderGallery },
  { id:'settings',     name:'Settings',     icon:'⚙️', width:380, height:440, render: renderSettings },
];
