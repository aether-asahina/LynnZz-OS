/* =========================================================
   LynnZz OS v1.0 — apps.js
   App registry + built-in apps
   ========================================================= */

function h(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

// Injects a <style> block into <head> exactly once per app (keyed by id).
// Fixes the earlier bug where <style> tags placed inside h()'s template
// string were silently dropped (h() only returns the first child).
function ensureStyle(id, css){
  if (document.getElementById('style-' + id)) return;
  const s = document.createElement('style');
  s.id = 'style-' + id;
  s.textContent = css;
  document.head.appendChild(s);
}

/* ============================================================
   SHARED VIRTUAL FILESYSTEM
   Used by both File Manager and Terminal so they see the same
   folders/files (single storage key: 'vfs').
============================================================ */
const VFS = {
  defaultRoot(){
    return {
      name:'root', type:'folder',
      children:[
        {name:'Dokumen', type:'folder', children:[]},
        {name:'Proyek', type:'folder', children:[]},
        {name:'baca-aku.txt', type:'file', content:'Selamat datang di LynnZz OS!\n\nBuat folder & file baru lewat File Manager atau Terminal — keduanya baca disk virtual yang sama.'}
      ]
    };
  },
  load(){ return LZ.storage.get('vfs', this.defaultRoot()); },
  save(root){ LZ.storage.set('vfs', root); },
  getNode(root, pathArr){
    let node = root;
    for (const seg of pathArr){
      const next = node.children && node.children.find(c => c.name === seg);
      if (!next) return root;
      node = next;
    }
    return node;
  }
};

/* ============================================================
   WALLPAPER THEMES — shared between Settings app and boot-time apply
============================================================ */
LZ.THEMES = [
  { id:'nebula',  label:'Nebula',      grad:'linear-gradient(135deg,#a855f7,#ff2e63)', css:null },
  { id:'crimson', label:'Crimson Dusk', grad:'linear-gradient(135deg,#ff2e63,#a855f7)', css:`radial-gradient(ellipse 60% 45% at 20% 15%, rgba(255,46,99,0.35), transparent 60%), radial-gradient(ellipse 55% 45% at 85% 75%, rgba(168,85,247,0.28), transparent 60%), linear-gradient(160deg, #150a10 0%, #0a0a12 55%, #0c0a14 100%)` },
  { id:'abyss',   label:'Deep Abyss',  grad:'linear-gradient(135deg,#1e40af,#581c87)', css:`radial-gradient(ellipse 60% 45% at 30% 20%, rgba(30,64,175,0.35), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(88,28,135,0.3), transparent 60%), linear-gradient(160deg, #060812 0%, #05050a 55%, #07060f 100%)` },
  { id:'ember',   label:'Ember',       grad:'linear-gradient(135deg,#ff6a00,#ff2e63)', css:`radial-gradient(ellipse 60% 45% at 25% 20%, rgba(255,106,0,0.3), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(255,46,99,0.28), transparent 60%), linear-gradient(160deg, #150c08 0%, #0a0a12 55%, #0c0a14 100%)` },
];

LZ.applyWallpaper = function(){
  const saved = LZ.storage.get('settings', { theme:'nebula', wallpaperAnim:true });
  const theme = LZ.THEMES.find(t => t.id === saved.theme) || LZ.THEMES[0];
  const wp = document.getElementById('wallpaper');
  if (theme.css) wp.style.background = theme.css;
  else wp.removeAttribute('style');
  wp.style.animation = saved.wallpaperAnim === false ? 'none' : '';
};

/* ============================================================
   1. FILE MANAGER — virtual filesystem persisted in storage
============================================================ */
function renderFileManager(body){
  ensureStyle('filemanager', `
    .fm-wrap{display:flex; flex-direction:column; height:100%; font-size:13px;}
    .fm-toolbar{display:flex; gap:6px; padding:8px; border-bottom:1px solid var(--border); flex-wrap:wrap;}
    .fm-btn{background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:6px 10px; border-radius:8px; font-size:12px; cursor:pointer;}
    .fm-btn:active{background:var(--border-strong);}
    .fm-crumbs{padding:6px 10px; color:var(--text-muted); font-family:var(--font-mono); font-size:11px;}
    .fm-crumb{cursor:pointer;} .fm-crumb:active{color:var(--violet);}
    .fm-sep{margin:0 4px;}
    .fm-list{flex:1; overflow:auto; padding:6px;}
    .fm-item{display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px; cursor:pointer;}
    .fm-item:active{background:var(--surface-2);}
    .fm-item .fm-name{flex:1;}
    .fm-del{opacity:.5; padding:2px 6px;}
    .fm-editor{position:absolute; inset:0; background:var(--surface); display:flex; flex-direction:column;}
    .fm-editor textarea{flex:1; background:var(--void); color:var(--text); border:none; padding:12px; font-family:var(--font-mono); font-size:13px; resize:none; outline:none;}
    .fm-editor-bar{display:flex; gap:8px; padding:8px; border-bottom:1px solid var(--border);}
    .fm-empty{padding:24px; text-align:center; color:var(--text-muted);}
  `);

  let fs = VFS.load();
  let path = []; // array of names from root

  function saveFS(){ VFS.save(fs); }
  function getNode(p){ return VFS.getNode(fs, p); }

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
  ensureStyle('notes', `
    .notes-wrap{display:flex; height:100%;}
    .notes-sidebar{width:150px; border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0;}
    .notes-new{margin:8px; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); font-size:12px; cursor:pointer;}
    .notes-new:active{background:var(--border-strong);}
    .notes-list{flex:1; overflow-y:auto; padding:0 6px;}
    .notes-item{padding:8px; border-radius:8px; font-size:12px; cursor:pointer; color:var(--text-muted); margin-bottom:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
    .notes-item.active{background:var(--surface-2); color:var(--text);}
    .notes-editor{flex:1; display:flex; flex-direction:column;}
    .notes-title{border:none; background:transparent; color:var(--text); font-size:15px; font-weight:600; padding:12px 14px 4px; outline:none;}
    .notes-body{flex:1; border:none; background:transparent; color:var(--text); font-size:13.5px; padding:0 14px 14px; outline:none; resize:none; line-height:1.6;}
  `);

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
  ensureStyle('calculator', `
    .calc-wrap{display:flex; flex-direction:column; height:100%; background:var(--void);}
    .calc-screen{padding:24px 18px 12px; text-align:right; display:flex; flex-direction:column; gap:4px; min-height:70px; justify-content:flex-end;}
    .calc-expr{color:var(--text-muted); font-size:13px; font-family:var(--font-mono); min-height:16px; overflow-x:auto; white-space:nowrap;}
    .calc-result{font-size:34px; font-weight:600; font-family:var(--font-mono); overflow-x:auto; white-space:nowrap; color:var(--text);}
    .calc-grid{flex:1; display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:1fr; gap:1px; background:var(--border);}
    .calc-key{background:var(--surface); border:none; color:var(--text); font-size:18px; font-family:var(--font-mono); cursor:pointer; transition:transform .08s;}
    .calc-key:active{background:var(--surface-2); transform:scale(.94);}
    .calc-key.fn{color:var(--crimson);}
    .calc-key.op{color:var(--violet); font-weight:600; background:#1a1626;}
    .calc-key.op:active{background:#241d33;}
    .calc-key.eq{background:var(--grad); color:#fff; font-weight:700;}
    .calc-key.eq:active{opacity:.85; transform:scale(.94);}
  `);

  let expr = '';
  let justEvaluated = false;
  const OPS = ['÷','×','−','+'];

  body.innerHTML = '';
  body.appendChild(h(`
    <div class="calc-wrap">
      <div class="calc-screen"><div class="calc-expr"></div><div class="calc-result">0</div></div>
      <div class="calc-grid">
        ${['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(k=>{
          const cls = OPS.includes(k) ? ' op' : (k==='='?' eq':(k==='C'||k==='⌫'?' fn':''));
          return `<button class="calc-key${cls}" data-k="${k}">${k}</button>`;
        }).join('')}
      </div>
    </div>
  `));

  const exprEl = body.querySelector('.calc-expr');
  const resEl = body.querySelector('.calc-result');

  function safeEval(str){
    const sanitized = str.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/%/g,'/100');
    if (!/^[0-9+\-*/.() ]*$/.test(sanitized)) throw new Error('bad');
    const r = Function(`"use strict"; return (${sanitized})`)();
    if (!isFinite(r)) throw new Error('inf');
    return r;
  }

  function refresh(){
    exprEl.textContent = expr;
    if (!expr){ resEl.textContent = '0'; return; }
    try{ resEl.textContent = safeEval(expr); }
    catch(e){ /* keep last shown result while expr is mid-typing */ }
  }

  body.querySelectorAll('.calc-key').forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.k;
      if (k === 'C'){ expr = ''; justEvaluated = false; refresh(); return; }
      if (k === '⌫'){ expr = expr.slice(0,-1); justEvaluated = false; refresh(); return; }
      if (k === '='){
        try{
          const r = safeEval(expr);
          exprEl.textContent = expr + ' =';
          expr = String(r);
          resEl.textContent = expr;
          justEvaluated = true;
        }catch(e){ resEl.textContent = 'Error'; expr=''; justEvaluated=false; }
        return;
      }
      if (justEvaluated){
        expr = OPS.includes(k) ? expr + k : k; // chain from result on operator, start fresh on digit
        justEvaluated = false;
      } else {
        expr += k;
      }
      refresh();
    };
  });
}

/* ============================================================
   4. BROWSER
============================================================ */
function renderBrowser(body){
  ensureStyle('browser', `
    .br-wrap{display:flex; flex-direction:column; height:100%;}
    .br-bar{display:flex; gap:6px; padding:8px 8px 6px;}
    .br-url{flex:1; background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:8px 10px; border-radius:8px; font-size:12.5px; outline:none;}
    .br-go, .br-ext{background:var(--surface-2); border:1px solid var(--border); color:var(--text); border-radius:8px; padding:0 12px; cursor:pointer; font-size:12.5px;}
    .br-shortcuts{display:flex; gap:6px; padding:0 8px 8px; flex-wrap:wrap;}
    .br-chip{background:transparent; border:1px solid var(--border); color:var(--text-muted); border-radius:20px; padding:4px 11px; font-size:11px; cursor:pointer;}
    .br-chip:active{background:var(--surface-2); color:var(--violet);}
    .br-loadbar{height:2px; background:transparent; overflow:hidden;}
    .br-loadbar-fill{height:100%; width:0%; background:var(--grad); transition:width .3s;}
    .br-loadbar-fill.loading{width:60%; animation:brLoad 1s ease-in-out infinite;}
    @keyframes brLoad{0%{margin-left:-60%;} 100%{margin-left:100%;}}
    .br-note{font-size:10.5px; color:var(--text-muted); padding:0 10px 6px;}
    .br-frame{flex:1; border:none; background:#fff;}
  `);

  const shortcuts = [
    { label:'Wikipedia', url:'https://www.wikipedia.org' },
    { label:'DuckDuckGo', url:'https://duckduckgo.com' },
    { label:'GitHub', url:'https://github.com' },
  ];

  body.innerHTML = '';
  body.appendChild(h(`
    <div class="br-wrap">
      <div class="br-bar">
        <input class="br-url" placeholder="Ketik URL, mis. wikipedia.org" value="${shortcuts[0].url}">
        <button class="br-go">Buka</button>
        <button class="br-ext" title="Buka di tab baru">↗</button>
      </div>
      <div class="br-shortcuts">${shortcuts.map(s=>`<button class="br-chip" data-url="${s.url}">${s.label}</button>`).join('')}</div>
      <div class="br-loadbar"><div class="br-loadbar-fill"></div></div>
      <div class="br-note">Sebagian situs (Google, YouTube, dll) memblokir tampilan embed (X-Frame-Options). Kalau blank, pakai tombol ↗.</div>
      <iframe class="br-frame" src="${shortcuts[0].url}"></iframe>
    </div>
  `));

  function normalize(u){
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  const urlInput = body.querySelector('.br-url');
  const frame = body.querySelector('.br-frame');
  const loadFill = body.querySelector('.br-loadbar-fill');

  function go(u){
    urlInput.value = u;
    loadFill.classList.add('loading');
    frame.src = normalize(u);
  }
  frame.onload = () => loadFill.classList.remove('loading');

  body.querySelector('.br-go').onclick = () => go(urlInput.value.trim());
  urlInput.onkeydown = (e) => { if (e.key === 'Enter') go(urlInput.value.trim()); };
  body.querySelector('.br-ext').onclick = () => window.open(normalize(urlInput.value.trim()), '_blank');
  body.querySelectorAll('.br-chip').forEach(chip => { chip.onclick = () => go(chip.dataset.url); });
}

/* ============================================================
   5. MUSIC PLAYER
============================================================ */
function renderMusicPlayer(body){
  ensureStyle('music', `
    .mp-wrap{display:flex; flex-direction:column; height:100%; padding:12px; gap:10px;}
    .mp-add{background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:10px; border-radius:10px; cursor:pointer; font-size:12.5px;}
    .mp-now{text-align:center; font-size:13px; color:var(--text-muted); font-family:var(--font-mono); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
    .mp-controls{display:flex; justify-content:center; gap:16px;}
    .mp-controls button{width:44px; height:44px; border-radius:50%; border:none; background:var(--grad); color:#fff; font-size:16px; cursor:pointer;}
    .mp-controls button:active{opacity:.85;}
    .mp-list{flex:1; overflow-y:auto; border-top:1px solid var(--border); padding-top:8px;}
    .mp-track{padding:8px; border-radius:8px; font-size:12.5px; cursor:pointer; color:var(--text-muted);}
    .mp-track.active{background:var(--surface-2); color:var(--violet);}
  `);

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
  ensureStyle('gallery', `
    .gal-wrap{display:flex; flex-direction:column; height:100%; padding:12px; gap:10px;}
    .gal-toolbar{display:flex; align-items:center; justify-content:space-between; gap:8px;}
    .gal-add{background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:9px 14px; border-radius:10px; cursor:pointer; font-size:12.5px;}
    .gal-count{font-size:11.5px; color:var(--text-muted); font-family:var(--font-mono);}
    .gal-grid{flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:8px; align-content:start;}
    .gal-item{position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden; cursor:pointer;}
    .gal-item img{width:100%; height:100%; object-fit:cover; display:block;}
    .gal-item .gal-del{position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:rgba(0,0,0,.6); color:#fff; border:none; font-size:11px; display:flex; align-items:center; justify-content:center;}
    .gal-empty{text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;}
    .gal-lightbox{position:fixed; inset:0; background:rgba(0,0,0,.9); display:flex; align-items:center; justify-content:center; z-index:999;}
    .gal-lightbox img{max-width:85%; max-height:80%; border-radius:8px;}
    .gal-lb-close{position:absolute; top:20px; right:20px; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.12); color:#fff; border:none; font-size:16px;}
    .gal-lb-nav{position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.12); color:#fff; border:none; font-size:18px;}
    .gal-lb-prev{left:14px;} .gal-lb-next{right:14px;}
    .gal-lb-count{position:absolute; bottom:20px; left:50%; transform:translateX(-50%); color:#fff; font-size:12px; font-family:var(--font-mono); opacity:.8;}
  `);

  let images = []; // {url, name}
  let lightboxIndex = -1;

  body.innerHTML = '';
  body.appendChild(h(`
    <div class="gal-wrap">
      <input type="file" class="gal-input" accept="image/*" multiple hidden>
      <div class="gal-toolbar">
        <button class="gal-add">🖼 Tambah Gambar</button>
        <span class="gal-count"></span>
      </div>
      <div class="gal-grid"></div>
      <div class="gal-empty">Belum ada gambar. Gambar hanya tersimpan untuk sesi ini.</div>
    </div>
  `));

  const grid = body.querySelector('.gal-grid');
  const input = body.querySelector('.gal-input');
  const empty = body.querySelector('.gal-empty');
  const countEl = body.querySelector('.gal-count');

  body.querySelector('.gal-add').onclick = () => input.click();
  input.onchange = () => {
    Array.from(input.files).forEach(f => images.push({ url: URL.createObjectURL(f), name: f.name }));
    draw();
  };

  function draw(){
    grid.innerHTML = '';
    empty.style.display = images.length ? 'none' : 'block';
    countEl.textContent = images.length ? `${images.length} gambar` : '';
    images.forEach((img, i) => {
      const item = h(`<div class="gal-item"><img src="${img.url}"><button class="gal-del">✕</button></div>`);
      item.querySelector('img').onclick = () => openLightbox(i);
      item.querySelector('.gal-del').onclick = (e) => { e.stopPropagation(); images.splice(i,1); draw(); };
      grid.appendChild(item);
    });
  }

  function openLightbox(i){
    lightboxIndex = i;
    const lb = h(`
      <div class="gal-lightbox">
        <img src="${images[i].url}">
        <button class="gal-lb-close">✕</button>
        <button class="gal-lb-nav gal-lb-prev">‹</button>
        <button class="gal-lb-nav gal-lb-next">›</button>
        <div class="gal-lb-count">${i+1} / ${images.length}</div>
      </div>
    `);
    function update(){
      lb.querySelector('img').src = images[lightboxIndex].url;
      lb.querySelector('.gal-lb-count').textContent = `${lightboxIndex+1} / ${images.length}`;
    }
    lb.querySelector('.gal-lb-close').onclick = () => lb.remove();
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.remove(); });
    lb.querySelector('.gal-lb-prev').onclick = (e) => { e.stopPropagation(); lightboxIndex = (lightboxIndex-1+images.length)%images.length; update(); };
    lb.querySelector('.gal-lb-next').onclick = (e) => { e.stopPropagation(); lightboxIndex = (lightboxIndex+1)%images.length; update(); };
    let sx = 0;
    lb.addEventListener('touchstart', (e)=>{ sx = e.touches[0].clientX; });
    lb.addEventListener('touchend', (e)=>{
      const dx = e.changedTouches[0].clientX - sx;
      if (dx > 50){ lightboxIndex = (lightboxIndex-1+images.length)%images.length; update(); }
      else if (dx < -50){ lightboxIndex = (lightboxIndex+1)%images.length; update(); }
    });
    document.body.appendChild(lb);
  }
  draw();
}

/* ============================================================
   7. SETTINGS
============================================================ */
function renderSettings(body){
  ensureStyle('settings', `
    .st-wrap{padding:16px; overflow-y:auto; height:100%;}
    .st-section{margin-bottom:22px;}
    .st-label{font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:10px;}
    .st-row{display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;}
    .st-account{display:flex; align-items:center; gap:12px;}
    .st-themes{display:grid; grid-template-columns:repeat(2,1fr); gap:8px;}
    .st-theme{height:56px; border-radius:10px; border:2px solid var(--border); cursor:pointer; position:relative; display:flex; align-items:flex-end; padding:6px 8px; font-size:11px; font-weight:500; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.6);}
    .st-theme.active{border-color:var(--violet); box-shadow:0 0 0 2px rgba(168,85,247,.25);}
    .st-danger{background:rgba(255,46,99,0.12); border:1px solid var(--crimson); color:var(--crimson); padding:9px 14px; border-radius:9px; cursor:pointer; font-size:12.5px;}
    .st-switch{display:flex; align-items:center; gap:6px; cursor:pointer;}
    .st-switch input{display:none;}
    .st-switch-track{width:34px; height:19px; border-radius:10px; background:var(--surface-2); border:1px solid var(--border); position:relative; transition:background .15s; display:inline-block;}
    .st-switch-thumb{position:absolute; top:1px; left:1px; width:15px; height:15px; border-radius:50%; background:var(--text-muted); transition:transform .15s, background .15s;}
    .st-switch input:checked + .st-switch-track{background:rgba(168,85,247,.3); border-color:var(--violet);}
    .st-switch input:checked + .st-switch-track .st-switch-thumb{transform:translateX(15px); background:var(--violet);}
    .st-switch-label{font-size:11.5px; color:var(--text-muted);}
  `);

  const saved = LZ.storage.get('settings', { theme:'nebula', wallpaperAnim:true });
  const u = LZ.auth.currentUser;

  body.innerHTML = '';
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
        <div class="st-row">
          <div class="st-label" style="margin-bottom:0;">Wallpaper</div>
          <label class="st-switch">
            <input type="checkbox" class="st-anim-toggle" ${saved.wallpaperAnim !== false ? 'checked' : ''}>
            <span class="st-switch-track"><span class="st-switch-thumb"></span></span>
            <span class="st-switch-label">Animasi</span>
          </label>
        </div>
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
  `));

  const themeGrid = body.querySelector('.st-themes');
  LZ.THEMES.forEach(t => {
    const el = h(`<div class="st-theme ${saved.theme===t.id?'active':''}">${t.label}</div>`);
    el.style.background = t.grad;
    el.onclick = () => {
      const settings = { ...LZ.storage.get('settings', {}), theme: t.id };
      LZ.storage.set('settings', settings);
      LZ.applyWallpaper();
      body.querySelectorAll('.st-theme').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      LZ.notify('Settings', `Wallpaper diganti ke ${t.label}.`, '🎨', 2000);
    };
    themeGrid.appendChild(el);
  });

  LZ.applyWallpaper(); // reflect current saved state whenever Settings is opened

  body.querySelector('.st-anim-toggle').onchange = (e) => {
    const settings = { ...LZ.storage.get('settings', {}), wallpaperAnim: e.target.checked };
    LZ.storage.set('settings', settings);
    LZ.applyWallpaper();
  };

  body.querySelector('.st-danger').onclick = () => {
    if (confirm('Yakin mau hapus semua data lokal LynnZz OS? Ini tidak bisa dibatalkan.')){
      Object.keys(localStorage).filter(k => k.startsWith('lynnzz')).forEach(k => localStorage.removeItem(k));
      LZ.notify('Settings', 'Data lokal dihapus. Reload halaman untuk efek penuh.', '🗑');
    }
  };
}

/* ============================================================
   8. TERMINAL — commands + shared virtual filesystem (VFS)
============================================================ */
function renderTerminal(body){
  ensureStyle('terminal', `
    .term-wrap{display:flex; flex-direction:column; height:100%; background:#08080d; font-family:var(--font-mono); font-size:12.5px;}
    .term-output{flex:1; overflow-y:auto; padding:10px 12px; white-space:pre-wrap; word-break:break-word; color:#c9c6e0;}
    .term-line{margin-bottom:2px; line-height:1.5;}
    .term-echo{color:#7dd3fc;}
    .term-err{color:var(--crimson);}
    .term-ok{color:#86efac;}
    .term-dir{color:#7cc0ff; font-weight:600;}
    .term-file{color:#c9c6e0;}
    .term-inputline{display:flex; align-items:center; gap:6px; padding:8px 12px; border-top:1px solid var(--border);}
    .term-prompt{color:var(--violet); white-space:nowrap; flex-shrink:0;}
    .term-input{flex:1; background:transparent; border:none; outline:none; color:#eceaf5; font-family:var(--font-mono); font-size:12.5px;}
  `);

  let fs = VFS.load();
  let cwd = [];
  let history = JSON.parse(localStorage.getItem('lynnzz_terminal_history') || '[]');
let histIdx = history.length;

  function saveFS(){ VFS.save(fs); }
  function pathStr(){ return '/' + cwd.join('/'); }

  // ---- tokenizer: splits on spaces but respects "quoted strings" ----
  function tokenize(str){
    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const tokens = [];
    let m;
    while ((m = regex.exec(str))){
      tokens.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
    }
    return tokens;
  }

  // ---- path resolution helpers (all relative to cwd unless starting with /) ----
  function absSegs(pathStr){
    let segs = pathStr.startsWith('/') ? [] : [...cwd];
    for (const p of pathStr.split('/').filter(Boolean)){
      if (p === '.') continue;
      else if (p === '..') segs.pop();
      else segs.push(p);
    }
    return segs;
  }
  function findNode(segs){
    let n = fs;
    for (const seg of segs){
      if (!n.children) return null;
      const next = n.children.find(c => c.name === seg);
      if (!next) return null;
      n = next;
    }
    return n;
  }
  // resolves the parent folder + leaf name for a path (used to create/move/remove)
  function resolveParent(pathStr){
    const segs = absSegs(pathStr);
    const name = segs.pop();
    const parent = findNode(segs);
    if (!parent || parent.type !== 'folder') return null;
    return { parent, name, segs: [...segs, name] };
  }
  function deepCopy(node){
    return node.type === 'folder'
      ? { name: node.name, type:'folder', children: node.children.map(deepCopy) }
      : { name: node.name, type:'file', content: node.content };
  }

  body.innerHTML = '';
  body.appendChild(h(`
    <div class="term-wrap">
      <div class="term-output"></div>
      <div class="term-inputline">
        <span class="term-prompt"></span>
        <input class="term-input" autocomplete="off" autocapitalize="off" spellcheck="false">
      </div>
    </div>
  `));

  const out = body.querySelector('.term-output');
  const input = body.querySelector('.term-input');
  const promptEl = body.querySelector('.term-prompt');
  const user = (LZ.auth.currentUser?.displayName || 'guest').toLowerCase().replace(/\s+/g,'');

  function updatePrompt(){ promptEl.textContent = `${user}@lynnzz${pathStr()}$`; }

  function print(text, cls){
    const line = h(`<div class="term-line ${cls||''}"></div>`);
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }
  function printHtml(html, cls){
    const line = h(`<div class="term-line ${cls||''}"></div>`);
    line.innerHTML = html;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }
  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  const COMMANDS = {
    help(){
      print([
        'Perintah yang tersedia:',
        '  help                    tampilkan bantuan ini',
        '  clear                   bersihkan layar',
        '  about                   tentang LynnZz OS',
        '  neofetch                info sistem gaya neofetch',
        '  date                    tanggal & waktu sekarang',
        '  whoami                  tampilkan user aktif',
        '  history                 daftar perintah sebelumnya',
        '  pwd                     tampilkan lokasi sekarang',
        '  ls [path]               daftar isi folder',
        '  cd <path>               pindah folder ("cd .." naik, "cd /" ke root)',
        '  mkdir <path>            buat folder baru',
        '  touch <path>            buat file kosong',
        '  cat <path>              tampilkan isi file',
        '  echo <teks>             tampilkan teks (dukung > dan >> ke file)',
        '  rm <path>               hapus file/folder',
        '  mv <src> <dest>         pindah/ganti nama file/folder',
        '  cp <src> <dest>         salin file/folder',
        '  find <nama>             cari file/folder dari lokasi sekarang',
        '  tree [path]             tampilkan struktur folder',
        '  wc <file>               hitung baris/kata/karakter',
        '  head <file> [n]         n baris pertama (default 10)',
        '  tail <file> [n]         n baris terakhir (default 10)',
        '  exit                    tutup Terminal',
        '',
        'Path bisa relatif ("Proyek/main.txt") atau absolut ("/Dokumen"). Pakai tanda kutip buat nama dengan spasi.',
      ].join('\n'));
    },
    clear(){ out.innerHTML = ''; },
    about(){
      print('LynnZz OS v2.0 — Terminal\nDibangun dengan HTML, CSS, JS & Firebase.\nKetik "help" buat lihat daftar perintah.');
    },
    neofetch(){
      const email = LZ.auth.currentUser?.email || 'guest@lynnzz.os';
      const countNodes = (n) => n.type === 'file' ? 1 : 1 + n.children.reduce((a,c)=>a+countNodes(c),0);
      printHtml(
        `<span class="term-ok">   /\\_/\\  </span>  <b>${user}</b>@lynnzz\n` +
        `<span class="term-ok">  ( o.o ) </span>  ─────────────\n` +
        `<span class="term-ok">   > ^ <  </span>  OS: LynnZz OS v2.0\n` +
        `           Shell: LynnZz Terminal\n` +
        `           User: ${esc(email)}\n` +
        `           Item VFS: ${countNodes(fs)-1}\n` +
        `           Lokasi: ${esc(pathStr())}`
      );
    },
    date(){ print(new Date().toString()); },
    whoami(){ print(LZ.auth.currentUser?.email || 'guest@lynnzz.os'); },
    history(){
      if (!history.length){ print('(belum ada riwayat perintah)'); return; }
      print(history.map((h,i)=>`  ${i+1}  ${h}`).join('\n'));
    },
    pwd(){ print(pathStr()); },
    ls(args){
      const target = args[0] ? absSegs(args[0]) : cwd;
      const n = findNode(target);
      if (!n || n.type !== 'folder'){ print(`ls: folder tidak ditemukan: ${args[0]||''}`, 'term-err'); return; }
      if (!n.children.length){ print('(kosong)'); return; }
      const html = n.children
        .slice()
        .sort((a,b)=> (a.type===b.type ? a.name.localeCompare(b.name) : a.type==='folder'?-1:1))
        .map(c => c.type === 'folder' ? `<span class="term-dir">${esc(c.name)}/</span>` : `<span class="term-file">${esc(c.name)}</span>`)
        .join('   ');
      printHtml(html);
    },
    cd(args){
      const arg = args[0];
      if (!arg || arg === '~' || arg === '/'){ cwd = []; updatePrompt(); return; }
      const segs = absSegs(arg);
      const n = findNode(segs);
      if (!n || n.type !== 'folder'){ print(`cd: folder tidak ditemukan: ${arg}`, 'term-err'); return; }
      cwd = segs;
      updatePrompt();
    },
    mkdir(args){
      if (!args[0]){ print('mkdir: butuh nama folder', 'term-err'); return; }
      const r = resolveParent(args[0]);
      if (!r){ print(`mkdir: path induk tidak ditemukan`, 'term-err'); return; }
      if (r.parent.children.find(c => c.name === r.name)){ print(`mkdir: "${r.name}" sudah ada`, 'term-err'); return; }
      r.parent.children.push({ name: r.name, type:'folder', children:[] });
      saveFS();
      print(`folder "${r.name}" dibuat`, 'term-ok');
    },
    touch(args){
      if (!args[0]){ print('touch: butuh nama file', 'term-err'); return; }
      const r = resolveParent(args[0]);
      if (!r){ print(`touch: path induk tidak ditemukan`, 'term-err'); return; }
      if (r.parent.children.find(c => c.name === r.name)){ print(`touch: "${r.name}" sudah ada`, 'term-err'); return; }
      r.parent.children.push({ name: r.name, type:'file', content:'' });
      saveFS();
      print(`file "${r.name}" dibuat`, 'term-ok');
    },
    cat(args){
      if (!args[0]){ print('cat: butuh nama file', 'term-err'); return; }
      const n = findNode(absSegs(args[0]));
      if (!n || n.type !== 'file'){ print(`cat: file tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      print(n.content || '(kosong)');
    },
    rm(args){
      if (!args[0]){ print('rm: butuh nama file/folder', 'term-err'); return; }
      const r = resolveParent(args[0]);
      if (!r){ print(`rm: tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      const before = r.parent.children.length;
      r.parent.children = r.parent.children.filter(c => c.name !== r.name);
      if (r.parent.children.length === before){ print(`rm: tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      saveFS();
      print(`"${r.name}" dihapus`, 'term-ok');
    },
    mv(args){
      if (!args[0] || !args[1]){ print('mv: butuh sumber dan tujuan', 'term-err'); return; }
      const src = resolveParent(args[0]);
      if (!src){ print(`mv: sumber tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      const srcNode = src.parent.children.find(c => c.name === src.name);
      if (!srcNode){ print(`mv: sumber tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      // if destination is an existing folder, move INTO it keeping the same name
      const destAsFolder = findNode(absSegs(args[1]));
      let destParent, destName;
      if (destAsFolder && destAsFolder.type === 'folder'){
        destParent = destAsFolder; destName = srcNode.name;
      } else {
        const dst = resolveParent(args[1]);
        if (!dst){ print(`mv: tujuan tidak valid: ${args[1]}`, 'term-err'); return; }
        destParent = dst.parent; destName = dst.name;
      }
      if (destParent.children.find(c => c.name === destName)){ print(`mv: "${destName}" sudah ada di tujuan`, 'term-err'); return; }
      src.parent.children = src.parent.children.filter(c => c !== srcNode);
      srcNode.name = destName;
      destParent.children.push(srcNode);
      saveFS();
      print(`dipindah ke "${destName}"`, 'term-ok');
    },
    cp(args){
      if (!args[0] || !args[1]){ print('cp: butuh sumber dan tujuan', 'term-err'); return; }
      const srcNode = findNode(absSegs(args[0]));
      if (!srcNode){ print(`cp: sumber tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      const destAsFolder = findNode(absSegs(args[1]));
      let destParent, destName;
      if (destAsFolder && destAsFolder.type === 'folder'){
        destParent = destAsFolder; destName = srcNode.name;
      } else {
        const dst = resolveParent(args[1]);
        if (!dst){ print(`cp: tujuan tidak valid: ${args[1]}`, 'term-err'); return; }
        destParent = dst.parent; destName = dst.name;
      }
      if (destParent.children.find(c => c.name === destName)){ print(`cp: "${destName}" sudah ada di tujuan`, 'term-err'); return; }
      const copy = deepCopy(srcNode);
      copy.name = destName;
      destParent.children.push(copy);
      saveFS();
      print(`disalin ke "${destName}"`, 'term-ok');
    },
    find(args){
      if (!args[0]){ print('find: butuh kata kunci', 'term-err'); return; }
      const results = [];
      (function walk(n, path){
        if (n.name.toLowerCase().includes(args[0].toLowerCase()) && path) results.push(path);
        if (n.children) n.children.forEach(c => walk(c, path ? path + '/' + c.name : c.name));
      })(findNode(cwd), '');
      print(results.length ? results.join('\n') : '(tidak ditemukan)');
    },
    tree(args){
      const start = args[0] ? findNode(absSegs(args[0])) : findNode(cwd);
      if (!start || start.type !== 'folder'){ print('tree: folder tidak ditemukan', 'term-err'); return; }
      const lines = ['.'];
      (function walk(n, prefix){
        n.children.forEach((c, i) => {
          const last = i === n.children.length - 1;
          lines.push(prefix + (last ? '└── ' : '├── ') + c.name + (c.type==='folder'?'/':''));
          if (c.type === 'folder') walk(c, prefix + (last ? '    ' : '│   '));
        });
      })(start, '');
      print(lines.join('\n'));
    },
    sort(args){
      if (!args[0]){
        print('sort: butuh nama file', 'term-err');
        return;
      }
      const n = findNode(absSegs(args[0]));
      if (!n || n.type !== 'file'){
        print(`sort: file tidak ditemukan: ${args[0]}`, 'term-err');
        return;
      }
      const lines = (n.content || '').split('\n');
      print(lines.sort((a,b) => a.localeCompare(b)).join('\n') || '(kosong)');
    },

    wc(args){
      if (!args[0]){ print('wc: butuh nama file', 'term-err'); return; }
      const n = findNode(absSegs(args[0]));
      if (!n || n.type !== 'file'){ print(`wc: file tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      const text = n.content || '';
      const lines = text ? text.split('\n').length : 0;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      print(`${lines} baris  ${words} kata  ${text.length} karakter  ${args[0]}`);
    },
    head(args){
      if (!args[0]){ print('head: butuh nama file', 'term-err'); return; }
      const n = findNode(absSegs(args[0]));
      if (!n || n.type !== 'file'){ print(`head: file tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      const count = parseInt(args[1]) || 10;
      print((n.content||'').split('\n').slice(0, count).join('\n') || '(kosong)');
    },
    tail(args){
      if (!args[0]){ print('tail: butuh nama file', 'term-err'); return; }
      const n = findNode(absSegs(args[0]));
      if (!n || n.type !== 'file'){ print(`tail: file tidak ditemukan: ${args[0]}`, 'term-err'); return; }
      const count = parseInt(args[1]) || 10;
      const lines = (n.content||'').split('\n');
      print(lines.slice(Math.max(0, lines.length - count)).join('\n') || '(kosong)');
    },
    grep(args){
      if (!args[0]){
        print('grep: butuh kata kunci', 'term-err');
        return;
      }

      const pattern = args[0].toLowerCase();
      const results = [];

      function search(node, path){
        if (node.type === 'file'){
          const lines = (node.content || '').split('\n');

          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(pattern)){
              results.push(`${path}:${i + 1}:${line}`);
            }
          });
        }

        if (node.children){
          node.children.forEach(child => {
            search(child, path ? `${path}/${child.name}` : child.name);
          });
        }
      }

      search(fs, '');

      print(results.length ? results.join('\n') : '(tidak ditemukan)');
    },

    open(args){
      if (!args[0]){
        print('open: butuh nama aplikasi', 'term-err');
        return;
      }

      const query = args.join(' ').toLowerCase();

      const app = LZ.APPS.find(a =>
        a.id.toLowerCase() === query ||
        a.name.toLowerCase() === query
      );

      if (!app){
        print(`open: aplikasi tidak ditemukan: ${args.join(' ')}`, 'term-err');
        return;
      }

      LZ.win.open(app.id);
    },

    errors(args){
      if (!LZ.errorLog){
        print('errors: diagnostics belum tersedia', 'term-err');
        return;
      }

      if (args[0] === 'clear'){
        LZ.errorLog.clear();
        print('Error log dibersihkan.', 'term-ok');
        return;
      }

      const limit = Math.max(1, Math.min(parseInt(args[0]) || 20, 50));
      const logs = LZ.errorLog.get();

      if (!logs.length){
        print('(tidak ada error tersimpan)');
        return;
      }

      const output = logs.slice(0, limit).map((e, i) => {
        const time = new Date(e.time).toLocaleTimeString('id-ID');

        return `[${time}] ${e.file || '?'}:${e.line || 0}:${e.column || 0}\n${e.message || '(tanpa pesan)'}`;
      }).join('\n\n');

      print(output);
    },

    exit(){
      const win = body.closest('.os-window');
      if (win) win.querySelector('.win-close')?.click();
    }
  };

  function runEcho(raw){
    const appendMatch = raw.match(/^(.*)>>\s*(\S+)$/);
    const overwriteMatch = !appendMatch && raw.match(/^(.*)>\s*(\S+)$/);
    if (appendMatch || overwriteMatch){
      const m = appendMatch || overwriteMatch;
      const text = m[1].trim().replace(/^["']|["']$/g,'');
      const filePath = m[2].trim();
      const r = resolveParent(filePath);
      if (!r){ print(`echo: path tidak valid: ${filePath}`, 'term-err'); return; }
      let f = r.parent.children.find(c => c.name === r.name && c.type === 'file');
      if (!f){ f = { name: r.name, type:'file', content:'' }; r.parent.children.push(f); }
      f.content = appendMatch ? (f.content ? f.content + '\n' + text : text) : text;
      saveFS();
      print(`${appendMatch ? 'ditambahkan ke' : 'ditulis ke'} "${r.name}"`, 'term-ok');
    } else {
      print(raw.replace(/^["']|["']$/g,''));
    }
  }

  function run(raw){
    const trimmed = raw.trim();
    if (!trimmed) return;
    print(`${user}@lynnzz${pathStr()}$ ${trimmed}`, 'term-echo');

    // ---- Pipe support: command1 | command2 ----
    // ---- Pipe support: command1 | command2 ----
if (trimmed.includes('|')){
  const pipeParts = trimmed.split('|').map(s => s.trim()).filter(Boolean);

  if (pipeParts.length < 2){
    print('lzsh: pipe tidak valid', 'term-err');
    return;
  }

  let pipeInput = '';

  for (let i = 0; i < pipeParts.length; i++){
    const part = pipeParts[i];
    const tokens = tokenize(part);

    if (!tokens.length) continue;

    const pipeCmd = tokens[0];
    const pipeArgs = tokens.slice(1);

    if (pipeCmd === 'echo'){
      pipeInput = pipeArgs.join(' ');
      continue;
    }

    if (pipeCmd === 'cat'){
      if (!pipeArgs[0]){
        print('cat: butuh nama file', 'term-err');
        return;
      }

      const node = findNode(absSegs(pipeArgs[0]));

      if (!node || node.type !== 'file'){
        print(`cat: file tidak ditemukan: ${pipeArgs[0]}`, 'term-err');
        return;
      }

      pipeInput = node.content || '';
      continue;
    }

    if (pipeCmd === 'grep'){
      if (!pipeArgs[0]){
        print('grep: butuh kata kunci', 'term-err');
        return;
      }

      const pattern = pipeArgs[0].toLowerCase();

      pipeInput = pipeInput
        .split('\n')
        .filter(line => line.toLowerCase().includes(pattern))
        .join('\n');

      continue;
    }

    if (pipeCmd === 'sort'){
      pipeInput = pipeInput
        .split('\n')
        .filter(line => line.trim() !== '')
        .sort((a, b) => a.localeCompare(b))
        .join('\n');

      continue;
    }

    if (pipeCmd === 'uniq'){
      const lines = pipeInput.split('\n');

      pipeInput = lines
        .filter((line, i) => i === 0 || line !== lines[i - 1])
        .join('\n');

      continue;
    }

    print(`lzsh: pipe command not supported: ${pipeCmd}`, 'term-err');
    return;
  }

  if (pipeInput !== '') print(pipeInput);
  return;
}
    const sp = trimmed.indexOf(' ');
    const cmd = sp === -1 ? trimmed : trimmed.slice(0, sp);
    const rest = sp === -1 ? '' : trimmed.slice(sp + 1);

    if (cmd === 'echo'){ runEcho(rest); return; }
    if (COMMANDS[cmd]) COMMANDS[cmd](tokenize(rest));
    else print(`command not found: ${cmd} (ketik "help")`, 'term-err');
  }

  // ---- Tab completion ----
  function handleTab(){
    const val = input.value;
    const upToCursor = val;
    const parts = upToCursor.split(' ');
    const last = parts[parts.length - 1];

    let candidates;
    if (parts.length === 1){
      candidates = Object.keys(COMMANDS).concat('echo').filter(c => c.startsWith(last));
    } else {
      const n = findNode(cwd);
      candidates = (n && n.children ? n.children.map(c => c.name) : []).filter(c => c.startsWith(last));
    }
    if (candidates.length === 1){
      parts[parts.length - 1] = candidates[0];
      input.value = parts.join(' ');
    } else if (candidates.length > 1){
      print(candidates.join('   '));
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
  const val = input.value;
  run(val);

  if (val.trim()){
    history.push(val);

    // Simpan maksimal 100 command terakhir
    if (history.length > 100){
      history = history.slice(-100);
    }

    localStorage.setItem(
      'lynnzz_terminal_history',
      JSON.stringify(history)
    );

    histIdx = history.length;
  }

  input.value = '';
} else if (e.key === 'ArrowUp'){
      if (histIdx > 0){ histIdx--; input.value = history[histIdx] || ''; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown'){
      if (histIdx < history.length){ histIdx++; input.value = history[histIdx] || ''; }
      e.preventDefault();
    } else if (e.key === 'Tab'){
      e.preventDefault();
      handleTab();
    }
  });

  body.querySelector('.term-wrap').addEventListener('click', () => input.focus());

  print('LynnZz OS Terminal — ketik "help" buat mulai. Tab buat autocomplete.', 'term-ok');
  updatePrompt();
  setTimeout(()=> input.focus(), 50);
}


/* ============================================================
   9. LYNN AI — chat assistant powered by Gemini API
============================================================ */
function renderLynnAI(body){
  ensureStyle('lynnai', `
    .ai-wrap{
      display:flex;
      flex-direction:column;
      height:100%;
      background:var(--void);
      position:relative;
      overflow:hidden;
    }

    .ai-header{
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px 12px;
      border-bottom:1px solid var(--border);
      flex-shrink:0;
      position:relative;
      z-index:5;
    }

    .ai-menu{
      width:32px;
      height:32px;
      border:1px solid var(--border);
      background:var(--surface-2);
      color:var(--text);
      border-radius:9px;
      cursor:pointer;
      font-size:17px;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .ai-menu:hover{
      background:var(--surface);
    }

    .ai-avatar{
      width:26px;
      height:26px;
      border-radius:8px;
      background:var(--grad);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:13px;
      flex-shrink:0;
    }

    .ai-header-text{
      font-size:12.5px;
      color:var(--text-muted);
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .ai-messages{
      flex:1;
      overflow-y:auto;
      padding:12px;
      display:flex;
      flex-direction:column;
      gap:10px;
    }

    .ai-msg{
      max-width:85%;
      padding:9px 12px;
      border-radius:14px;
      font-size:13px;
      line-height:1.5;
      white-space:pre-wrap;
      word-break:break-word;
    }

    .ai-msg.user{
      align-self:flex-end;
      background:var(--grad);
      color:#fff;
      border-bottom-right-radius:4px;
    }

    .ai-msg.assistant{
      align-self:flex-start;
      background:var(--surface-2);
      border:1px solid var(--border);
      border-bottom-left-radius:4px;
    }

    .ai-msg.system{
      align-self:center;
      background:transparent;
      color:var(--text-muted);
      font-size:11.5px;
      text-align:center;
      max-width:100%;
    }

    .ai-msg pre{
      background:#08080d;
      border:1px solid var(--border);
      border-radius:8px;
      padding:10px;
      overflow-x:auto;
      margin:6px 0;
      font-family:var(--font-mono);
      font-size:11.5px;
      white-space:pre;
    }

    .ai-msg code{
      font-family:var(--font-mono);
    }

    .ai-typing{
      align-self:flex-start;
      color:var(--text-muted);
      font-size:12px;
      padding:0 4px;
    }

    .ai-inputbar{
      display:flex;
      gap:6px;
      padding:8px;
      border-top:1px solid var(--border);
      flex-shrink:0;
    }

    .ai-input{
      flex:1;
      background:var(--surface-2);
      border:1px solid var(--border);
      color:var(--text);
      padding:9px 12px;
      border-radius:20px;
      font-size:13px;
      outline:none;
      resize:none;
      max-height:80px;
      font-family:inherit;
    }

    .ai-send{
      width:36px;
      height:36px;
      border-radius:50%;
      border:none;
      background:var(--grad);
      color:#fff;
      font-size:15px;
      cursor:pointer;
      flex-shrink:0;
    }

    .ai-send:disabled{
      opacity:.5;
    }

    /* DRAWER */
    .ai-drawer{
      position:absolute;
      inset:0 auto 0 0;
      width:245px;
      background:var(--surface);
      border-right:1px solid var(--border);
      z-index:20;
      transform:translateX(-100%);
      transition:transform .2s ease;
      display:flex;
      flex-direction:column;
      box-shadow:12px 0 30px rgba(0,0,0,.25);
    }

    .ai-drawer.open{
      transform:translateX(0);
    }

    .ai-drawer-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px;
      border-bottom:1px solid var(--border);
    }

    .ai-drawer-title{
      font-weight:700;
      font-size:13px;
    }

    .ai-close{
      width:28px;
      height:28px;
      border:0;
      background:transparent;
      color:var(--text-muted);
      cursor:pointer;
      border-radius:7px;
      font-size:17px;
    }

    .ai-new-chat{
      margin:10px;
      padding:9px 11px;
      border:1px solid var(--border);
      background:var(--surface-2);
      color:var(--text);
      border-radius:9px;
      cursor:pointer;
      text-align:left;
      font-size:12px;
    }

    .ai-new-chat:hover{
      background:var(--surface);
    }

    .ai-history-label{
      padding:5px 12px;
      color:var(--text-muted);
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.08em;
    }

    .ai-history{
      flex:1;
      overflow-y:auto;
      padding:4px 8px;
    }

    .ai-history-item{
      padding:9px 10px;
      border-radius:8px;
      cursor:pointer;
      margin-bottom:2px;
      font-size:12px;
      color:var(--text);
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .ai-history-item:hover{
      background:var(--surface-2);
    }

    .ai-history-empty{
      padding:10px;
      color:var(--text-muted);
      font-size:11px;
    }

    .ai-settings{
      border-top:1px solid var(--border);
      padding:8px;
    }

    .ai-setting-btn{
      width:100%;
      padding:9px 10px;
      border:0;
      background:transparent;
      color:var(--text);
      text-align:left;
      border-radius:8px;
      cursor:pointer;
      font-size:12px;
    }

    .ai-setting-btn:hover{
      background:var(--surface-2);
    }

    .ai-overlay{
      position:absolute;
      inset:0;
      background:rgba(0,0,0,.18);
      z-index:15;
      display:none;
    }

    .ai-overlay.show{
      display:block;
    }

    .ai-settings-panel{
      position:absolute;
      left:50%;
      top:50%;
      transform:translate(-50%,-50%);
      width:min(310px,85%);
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:14px;
      z-index:30;
      padding:14px;
      box-shadow:0 15px 50px rgba(0,0,0,.35);
      display:none;
    }

    .ai-settings-panel.show{
      display:block;
    }

    .ai-settings-panel h3{
      margin:0 0 12px;
      font-size:14px;
    }

    .ai-setting-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:10px 0;
      border-bottom:1px solid var(--border);
      font-size:12px;
    }

    .ai-setting-row:last-child{
      border-bottom:0;
    }
  `);

  const NEEDS_SETUP = false;
  const HISTORY_KEY = 'lynnai:conversations';

  let messages = [];
  let currentChatId = null;

  body.innerHTML = '';
  body.appendChild(h(`
    <div class="ai-wrap">

      <div class="ai-drawer">
        <div class="ai-drawer-head">
          <div class="ai-drawer-title">Lynn AI</div>
          <button class="ai-close">×</button>
        </div>

        <button class="ai-new-chat">＋ Chat Baru</button>

        <div class="ai-history-label">Riwayat</div>
        <div class="ai-history"></div>

        <div class="ai-settings">
          <button class="ai-setting-btn">⚙ Pengaturan AI</button>
        </div>
      </div>

      <div class="ai-overlay"></div>

      <div class="ai-settings-panel">
        <h3>Pengaturan Lynn AI</h3>

        <div class="ai-setting-row">
          <span>Simpan histori chat</span>
          <input class="ai-save-history" type="checkbox" checked>
        </div>

        <div class="ai-setting-row">
          <span>Enter untuk mengirim</span>
          <input class="ai-enter-send" type="checkbox" checked>
        </div>
      </div>

      <div class="ai-header">
        <button class="ai-menu">☰</button>
        <div class="ai-avatar">🤖</div>
        <div class="ai-header-text">
          Lynn AI ${NEEDS_SETUP ? '— belum dikonfigurasi' : '— ditenagai Groq (Llama 3.3)'}
        </div>
      </div>

      <div class="ai-messages"></div>

      <div class="ai-inputbar">
        <textarea class="ai-input" rows="1" placeholder="Tanya apa aja, mis. 'Buatkan kode Java CRUD mahasiswa'…"></textarea>
        <button class="ai-send">➤</button>
      </div>

    </div>
  `));

  const wrap = body.querySelector('.ai-wrap');
  const drawer = body.querySelector('.ai-drawer');
  const overlay = body.querySelector('.ai-overlay');
  const settingsPanel = body.querySelector('.ai-settings-panel');
  const historyEl = body.querySelector('.ai-history');
  const msgsEl = body.querySelector('.ai-messages');
  const input = body.querySelector('.ai-input');
  const sendBtn = body.querySelector('.ai-send');

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderMarkdownLite(text){
    const parts = text.split(/```(\w*)\n?([\s\S]*?)```/g);
    let out = '';

    for (let i = 0; i < parts.length; i++){
      if (i % 3 === 0) out += escapeHtml(parts[i]);
      else if (i % 3 === 2){
        out += `<pre><code>${escapeHtml(parts[i])}</code></pre>`;
      }
    }

    return out;
  }

  function addMessage(role, text){
    const el = h(`<div class="ai-msg ${role}"></div>`);

    if (role === 'assistant') el.innerHTML = renderMarkdownLite(text);
    else el.textContent = text;

    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    return el;
  }

  function getHistory(){
    try{
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    }catch(e){
      return [];
    }
  }

  function saveHistory(list){
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }

  function makeTitle(text){
    const clean = text.replace(/\s+/g,' ').trim();
    return clean.length > 32 ? clean.slice(0,32) + '…' : clean || 'Chat Baru';
  }

  function renderHistory(){
    const history = getHistory();
    historyEl.innerHTML = '';

    if (!history.length){
      historyEl.innerHTML = '<div class="ai-history-empty">Belum ada percakapan.</div>';
      return;
    }

    history.forEach(chat => {
      const item = h(`<div class="ai-history-item"></div>`);
      item.textContent = chat.title || 'Chat Baru';

      item.onclick = () => {
        loadChat(chat.id);
        drawer.classList.remove('open');
        overlay.classList.remove('show');
      };

      historyEl.appendChild(item);
    });
  }

  function saveCurrentChat(){
    if (!messages.length || !localStorage) return;

    const history = getHistory();
    const firstUser = messages.find(m => m.role === 'user');

    if (!firstUser) return;

    if (!currentChatId){
      currentChatId = Date.now().toString();
    }

    const existingIndex = history.findIndex(c => c.id === currentChatId);

    const chat = {
      id: currentChatId,
      title: makeTitle(firstUser.text),
      updatedAt: Date.now(),
      messages
    };

    if (existingIndex >= 0) history[existingIndex] = chat;
    else history.unshift(chat);

    history.sort((a,b) => b.updatedAt - a.updatedAt);
    saveHistory(history.slice(0,50));
    renderHistory();
  }

  function loadChat(id){
    const chat = getHistory().find(c => c.id === id);

    if (!chat) return;

    currentChatId = chat.id;
    messages = Array.isArray(chat.messages) ? chat.messages : [];

    msgsEl.innerHTML = '';

    if (!messages.length){
      addMessage('system','Chat kosong.');
      return;
    }

    messages.forEach(m => addMessage(m.role, m.text));
  }

  function newChat(){
    currentChatId = null;
    messages = [];
    msgsEl.innerHTML = '';

    addMessage(
      'system',
      'Halo! Gue Lynn AI. Tanya apa aja — bisa bikinin kode, jelasin konsep, atau bantu tugas.'
    );
  }

  async function callGroq(){
    const res = await fetch('https://polished-smoke-e31c.naufaldzakiy777.workers.dev/', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        messages:[
          {
            role:'system',
            content:'Kamu adalah Lynn AI, asisten LynnZz OS. Jawab singkat dan jelas.'
          },
          ...messages.map(m => ({
            role:m.role,
            content:m.text
          }))
        ]
      })
    });

    if (!res.ok){
      const errBody = await res.text();
      throw new Error(`HTTP ${res.status}: ${errBody.slice(0,200)}`);
    }

    const data = await res.json();

    return data?.choices?.[0]?.message?.content || '(respons kosong)';
  }

  async function send(){
    const text = input.value.trim();

    if (!text || NEEDS_SETUP) return;

    input.value = '';
    input.style.height = 'auto';

    messages.push({
      role:'user',
      text
    });

    addMessage('user', text);
    saveCurrentChat();

    const typing = h(`<div class="ai-typing">Lynn AI sedang mengetik…</div>`);
    msgsEl.appendChild(typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    sendBtn.disabled = true;

    try{
      const reply = await callGroq();

      messages.push({
        role:'assistant',
        text:reply
      });

      typing.remove();
      addMessage('assistant', reply);
      saveCurrentChat();

    }catch(err){
      typing.remove();
      addMessage('system', `Gagal menghubungi Groq: ${err.message}`);

    }finally{
      sendBtn.disabled = false;
    }
  }

  body.querySelector('.ai-menu').onclick = () => {
    drawer.classList.add('open');
    overlay.classList.add('show');
  };

  body.querySelector('.ai-close').onclick = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  };

  overlay.onclick = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    settingsPanel.classList.remove('show');
  };

  body.querySelector('.ai-new-chat').onclick = () => {
    newChat();
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  };

  body.querySelector('.ai-setting-btn').onclick = () => {
    settingsPanel.classList.toggle('show');
    overlay.classList.toggle('show');
  };

  sendBtn.onclick = send;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey){
      const enterSend = body.querySelector('.ai-enter-send').checked;

      if (enterSend){
        e.preventDefault();
        send();
      }
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  renderHistory();
  newChat();
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
  { id:'terminal',     name:'Terminal',     icon:'💻', width:480, height:420, render: renderTerminal },
  { id:'lynnai',       name:'Lynn AI',      icon:'🤖', width:400, height:460, render: renderLynnAI },
];
