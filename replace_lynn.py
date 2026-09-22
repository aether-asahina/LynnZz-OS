from pathlib import Path
import re

path = Path("js/apps.js")
text = path.read_text()

start = text.find("function renderLynnAI(body){")

if start == -1:
    raise SystemExit("renderLynnAI() tidak ditemukan")

# Cari function berikutnya setelah renderLynnAI
next_func = text.find("\nfunction ", start + 10)

if next_func == -1:
    end = len(text)
else:
    end = next_func

new_func = r'''function renderLynnAI(body){
  ensureStyle('lynnai', `
    .lynn-ai{
      position:relative;
      display:flex;
      flex-direction:column;
      height:100%;
      min-height:0;
      background:var(--void);
      color:var(--text);
      overflow:hidden;
    }

    .lynn-header{
      height:52px;
      min-height:52px;
      display:flex;
      align-items:center;
      gap:8px;
      padding:0 12px;
      border-bottom:1px solid var(--border);
      background:var(--void);
      position:relative;
      z-index:20;
    }

    .lynn-menu-btn,
    .lynn-model-btn{
      border:0;
      background:transparent;
      color:var(--text);
      cursor:pointer;
      border-radius:9px;
    }

    .lynn-menu-btn{
      width:36px;
      height:36px;
      font-size:21px;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .lynn-menu-btn:hover,
    .lynn-model-btn:hover{
      background:var(--surface);
    }

    .lynn-model-btn{
      display:flex;
      align-items:center;
      gap:6px;
      padding:8px 10px;
      font-size:15px;
      font-weight:650;
    }

    .lynn-model-arrow{
      font-size:11px;
      opacity:.7;
    }

    .lynn-chat{
      position:relative;
      flex:1;
      min-height:0;
      overflow-y:auto;
      padding:24px 16px 120px;
    }

    .lynn-messages{
      width:min(760px, 100%);
      margin:0 auto;
      display:flex;
      flex-direction:column;
      gap:14px;
    }

    .lynn-empty-state{
      position:absolute;
      inset:0;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding:24px;
      text-align:center;
      pointer-events:none;
    }

    .lynn-empty-title{
      font-size:26px;
      font-weight:650;
      letter-spacing:-.5px;
      color:var(--text);
    }

    .lynn-empty-subtitle{
      margin-top:8px;
      font-size:15px;
      color:var(--muted);
    }

    .lynn-message{
      display:flex;
      width:100%;
    }

    .lynn-message.user{
      justify-content:flex-end;
    }

    .lynn-message-bubble{
      max-width:min(680px, 88%);
      padding:11px 14px;
      border-radius:15px;
      line-height:1.55;
      font-size:14px;
      white-space:pre-wrap;
      overflow-wrap:anywhere;
    }

    .lynn-message.user .lynn-message-bubble{
      background:var(--accent);
      color:#fff;
      border-bottom-right-radius:5px;
    }

    .lynn-message.assistant .lynn-message-bubble{
      background:var(--surface);
      border:1px solid var(--border);
      border-bottom-left-radius:5px;
    }

    .lynn-input-wrap{
      position:absolute;
      left:0;
      right:0;
      bottom:0;
      padding:12px 16px 16px;
      background:linear-gradient(to top,var(--void) 72%,transparent);
      z-index:10;
    }

    .lynn-input-box{
      width:min(760px, 100%);
      margin:0 auto;
      display:flex;
      align-items:flex-end;
      gap:8px;
      padding:9px;
      border:1px solid var(--border);
      border-radius:18px;
      background:var(--surface);
      box-shadow:0 5px 25px rgba(0,0,0,.18);
    }

    .lynn-input{
      flex:1;
      min-height:24px;
      max-height:150px;
      resize:none;
      border:0;
      outline:0;
      background:transparent;
      color:var(--text);
      font:inherit;
      font-size:14px;
      line-height:1.45;
      padding:6px 7px;
    }

    .lynn-input::placeholder{
      color:var(--muted);
    }

    .lynn-send{
      width:36px;
      height:36px;
      flex-shrink:0;
      border:0;
      border-radius:11px;
      background:var(--accent);
      color:#fff;
      cursor:pointer;
      font-size:17px;
    }

    .lynn-send:disabled{
      opacity:.45;
      cursor:not-allowed;
    }

    @media(max-width:600px){
      .lynn-empty-title{
        font-size:23px;
      }

      .lynn-empty-subtitle{
        font-size:14px;
      }

      .lynn-chat{
        padding-left:10px;
        padding-right:10px;
      }

      .lynn-input-wrap{
        padding-left:10px;
        padding-right:10px;
        padding-bottom:10px;
      }
    }
  `);

  body.innerHTML = `
    <div class="lynn-ai">

      <div class="lynn-header">
        <button class="lynn-menu-btn" title="Menu">☰</button>

        <button class="lynn-model-btn">
          <span class="lynn-model-label">Lynn AI</span>
          <span class="lynn-model-arrow">▾</span>
        </button>
      </div>

      <div class="lynn-chat">

        <div class="lynn-empty-state">
          <div class="lynn-empty-title"></div>
          <div class="lynn-empty-subtitle">
            Mau nanya apa hari ini?
          </div>
        </div>

        <div class="lynn-messages"></div>

      </div>

      <div class="lynn-input-wrap">
        <div class="lynn-input-box">

          <textarea
            class="lynn-input"
            rows="1"
            placeholder="Tanya apa aja..."
          ></textarea>

          <button class="lynn-send" title="Kirim">↑</button>

        </div>
      </div>

    </div>
  `;

  const chat = body.querySelector('.lynn-chat');
  const messagesEl = body.querySelector('.lynn-messages');
  const emptyState = body.querySelector('.lynn-empty-state');
  const emptyTitle = body.querySelector('.lynn-empty-title');
  const input = body.querySelector('.lynn-input');
  const sendBtn = body.querySelector('.lynn-send');

  const MODEL_KEY = 'lynnai:selected-model';
  const DEFAULT_MODEL = 'gpt-oss-120b';

  const MODELS = {
    'gpt-oss-120b': {
      name: 'GPT-OSS 120B'
    },
    'gpt-oss-20b': {
      name: 'GPT-OSS 20B'
    }
  };

  let selectedModel =
    localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;

  if (!MODELS[selectedModel]){
    selectedModel = DEFAULT_MODEL;
  }

  let messages = [];
  let sending = false;

  function getGreeting(){
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11)
      return 'Selamat pagi, Ketua.';

    if (hour >= 11 && hour < 15)
      return 'Selamat siang, Ketua.';

    if (hour >= 15 && hour < 18)
      return 'Selamat sore, Ketua.';

    return 'Selamat malam, Ketua.';
  }

  function updateEmptyState(){
    emptyTitle.textContent = getGreeting();

    emptyState.style.display =
      messages.length ? 'none' : 'flex';
  }

  function addMessage(role, text, animate = false){
    messages.push({
      role,
      text
    });

    updateEmptyState();

    const row = document.createElement('div');
    row.className = `lynn-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'lynn-message-bubble';

    row.appendChild(bubble);
    messagesEl.appendChild(row);

    if (!animate){
      bubble.textContent = text;
    }else{
      let i = 0;
      const speed = 12;

      function type(){
        if (i >= text.length){
          bubble.textContent = text;
          return;
        }

        bubble.textContent += text[i++];
        chat.scrollTop = chat.scrollHeight;

        setTimeout(type, speed);
      }

      type();
    }

    chat.scrollTop = chat.scrollHeight;
  }

  function saveCurrentChat(){
    if (!messages.length) return;

    try{
      const history =
        JSON.parse(
          localStorage.getItem('lynnai:conversations') || '[]'
        );

      const chatData = {
        id: Date.now().toString(),
        updatedAt: Date.now(),
        messages
      };

      history.unshift(chatData);

      localStorage.setItem(
        'lynnai:conversations',
        JSON.stringify(history.slice(0, 30))
      );

    }catch(err){
      console.error('[Lynn AI] save error:', err);
    }
  }

  async function send(){
    const text = input.value.trim();

    if (!text || sending) return;

    sending = true;
    sendBtn.disabled = true;

    input.value = '';
    input.style.height = 'auto';

    addMessage('user', text);

    try{
      const res = await fetch(
        'https://polished-smoke-e31c.naufaldzakiy777.workers.dev/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            model: selectedModel,

            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah Lynn AI, asisten LynnZz OS. Jawab singkat dan jelas.'
              },

              ...messages.map(m => ({
                role: m.role,
                content: m.text
              }))
            ]
          })
        }
      );

      const data = await res.json();

      if (!res.ok){
        throw new Error(
          data?.error?.message ||
          data?.message ||
          `HTTP ${res.status}`
        );
      }

      const reply =
        data?.choices?.[0]?.message?.content ||
        'Maaf, Lynn AI tidak memberikan jawaban.';

      addMessage('assistant', reply, true);

      saveCurrentChat();

    }catch(err){
      console.error('[Lynn AI]', err);

      addMessage(
        'assistant',
        `Terjadi error: ${err.message}`
      );

    }finally{
      sending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', send);

  input.addEventListener('keydown', e => {
    const enterToSend =
      localStorage.getItem('lynnai:enter-send') !== 'false';

    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      enterToSend
    ){
      e.preventDefault();
      send();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';

    input.style.height =
      Math.min(input.scrollHeight, 150) + 'px';
  });

  updateEmptyState();
  input.focus();
}'''

path.write_text(
    text[:start] +
    new_func +
    text[end:]
)

print("renderLynnAI berhasil dipasang.")
