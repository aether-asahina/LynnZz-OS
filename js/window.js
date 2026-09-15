/* =========================================================
   LynnZz OS v1.0 — window.js
   Window manager
   ========================================================= */

LZ.win = (function(){
  const layer = () => document.getElementById('window-layer');
  const taskbarApps = () => document.getElementById('taskbar-apps');
  let zTop = 10;
  const openWindows = {}; // appId -> element (single-instance apps)
  let cascadeOffset = 0;

  function focus(el){
    document.querySelectorAll('.os-window').forEach(w => w.classList.remove('focused'));
    el.classList.add('focused');
    zTop += 1;
    el.style.zIndex = zTop;
    document.querySelectorAll('.taskbar-app').forEach(t => t.classList.remove('active'));
    const tb = document.querySelector(`.taskbar-app[data-app="${el.dataset.app}"]`);
    if (tb) tb.classList.add('active');
  }

  function open(appId){
    const app = LZ.APPS.find(a => a.id === appId);
    if (!app) return;

    // single instance: focus existing if open
    if (openWindows[appId]){
      const el = openWindows[appId];
      el.classList.remove('hidden');
      focus(el);
      return;
    }

    const win = document.createElement('div');
    win.className = 'os-window';
    win.dataset.app = appId;

    const isMobile = window.innerWidth < 640;
    const w = isMobile ? window.innerWidth - 20 : (app.width || 480);
    const h = isMobile ? window.innerHeight - 130 : (app.height || 380);
    const x = isMobile ? 10 : 60 + (cascadeOffset % 200);
    const y = isMobile ? 10 : 40 + (cascadeOffset % 160);
    cascadeOffset += 28;

    win.style.width = w + 'px';
    win.style.height = h + 'px';
    win.style.left = x + 'px';
    win.style.top = y + 'px';

    win.innerHTML = `
      <div class="win-titlebar">
        <span class="win-icon">${app.icon}</span>
        <span class="win-title">${app.name}</span>
        <div class="win-controls">
          <button class="win-min" title="Minimize">−</button>
          <button class="win-max" title="Maximize">▢</button>
          <button class="win-close" title="Close">✕</button>
        </div>
      </div>
      <div class="win-body"></div>
      <div class="win-resize-handle"></div>
    `;

    layer().appendChild(win);
    openWindows[appId] = win;

    // render app content
    const body = win.querySelector('.win-body');
    try{
      app.render(body);
    }catch(err){
      console.error('[LynnZz OS] render error in', appId, err);
      body.innerHTML = `<div style="padding:16px; color:var(--crimson); font-family:var(--font-mono); font-size:12px; white-space:pre-wrap;">Error render "${app.name}":\n${err.message}</div>`;
      if (LZ.notify) LZ.notify('⚠️ Gagal render app', `${app.name}: ${err.message}`, '⚠️', 10000);
    }

    // taskbar entry
    const tb = document.createElement('div');
    tb.className = 'taskbar-app';
    tb.dataset.app = appId;
    tb.innerHTML = `<span>${app.icon}</span><span>${app.name}</span>`;
    tb.onclick = () => {
      if (win.classList.contains('hidden')){
        win.classList.remove('hidden');
        focus(win);
      } else if (win.classList.contains('focused')){
        win.classList.add('hidden');
      } else {
        focus(win);
      }
    };
    taskbarApps().appendChild(tb);

    // controls
    win.querySelector('.win-close').onclick = (e)=>{
      e.stopPropagation();
      win.remove();
      tb.remove();
      delete openWindows[appId];
    };
    win.querySelector('.win-min').onclick = (e)=>{
      e.stopPropagation();
      win.classList.add('hidden');
    };
    win.querySelector('.win-max').onclick = (e)=>{
      e.stopPropagation();
      if (win.classList.contains('maximized')){
        win.classList.remove('maximized');
        win.style.left = win.dataset.prevLeft;
        win.style.top = win.dataset.prevTop;
        win.style.width = win.dataset.prevWidth;
        win.style.height = win.dataset.prevHeight;
      } else {
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.classList.add('maximized');
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 54px)';
      }
    };

    win.onmousedown = () => focus(win);
    win.ontouchstart = () => focus(win);

    makeDraggable(win, win.querySelector('.win-titlebar'));
    makeResizable(win, win.querySelector('.win-resize-handle'));

    focus(win);
  }

  function makeDraggable(win, handle){
    let sx, sy, ox, oy, dragging = false;
    function start(e){
      if (win.classList.contains('maximized')) return;
      if (e.target.closest('.win-controls')) return; // let min/max/close buttons receive their own click
      const p = e.touches ? e.touches[0] : e;
      dragging = true;
      sx = p.clientX; sy = p.clientY;
      ox = win.offsetLeft; oy = win.offsetTop;
      focus(win);
      e.preventDefault();
    }
    function move(e){
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - sx, dy = p.clientY - sy;
      win.style.left = Math.max(0, ox + dx) + 'px';
      win.style.top = Math.max(0, oy + dy) + 'px';
    }
    function end(){ dragging = false; }
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, {passive:false});
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, {passive:false});
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
  }

  function makeResizable(win, handle){
    let sx, sy, ow, oh, resizing = false;
    function start(e){
      const p = e.touches ? e.touches[0] : e;
      resizing = true;
      sx = p.clientX; sy = p.clientY;
      ow = win.offsetWidth; oh = win.offsetHeight;
      e.preventDefault(); e.stopPropagation();
    }
    function move(e){
      if (!resizing) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - sx, dy = p.clientY - sy;
      win.style.width = Math.max(260, ow + dx) + 'px';
      win.style.height = Math.max(180, oh + dy) + 'px';
    }
    function end(){ resizing = false; }
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, {passive:false});
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, {passive:false});
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
  }

  return { open, focus };
})();
