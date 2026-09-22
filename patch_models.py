from pathlib import Path

p = Path("js/apps.js")
s = p.read_text()

# 1. Tambahkan konfigurasi model setelah function renderLynnAI(body){
marker1 = "function renderLynnAI(body){"

insert1 = r'''
  // ========================================================
  // LYNN AI MODEL
  // ========================================================
  const LYNN_MODELS = {
    "gpt-oss-120b": {
      id: "openai/gpt-oss-120b",
      name: "GPT-OSS 120B",
      provider: "OpenAI · Groq",
      category: "Penalaran & Coding",
      description: "Lebih kuat untuk tugas kompleks",
      speed: "Cepat"
    },

    "gpt-oss-20b": {
      id: "openai/gpt-oss-20b",
      name: "GPT-OSS 20B",
      provider: "OpenAI · Groq",
      category: "Chat & Quick Tasks",
      description: "Sangat cepat untuk chat harian",
      speed: "Sangat cepat"
    }
  };

  let selectedLynnModel =
    localStorage.getItem('lynnzz:ai-model') || 'gpt-oss-120b';

  if (!LYNN_MODELS[selectedLynnModel]){
    selectedLynnModel = 'gpt-oss-120b';
  }

'''

if marker1 not in s:
    print("PATCH 1 GAGAL — renderLynnAI tidak ditemukan")
    raise SystemExit(1)

if "const LYNN_MODELS =" not in s:
    s = s.replace(marker1, marker1 + insert1, 1)
    print("PATCH 1 OK — model config")
else:
    print("PATCH 1 SKIP — model config sudah ada")


# 2. Tambahkan dropdown setelah header
marker2 = '''      <div class="ai-header">

        <button class="ai-menu">☰</button>

        <button class="ai-model-trigger" type="button">
          <span class="ai-model-title">Lynn AI</span>
          <span class="ai-model-arrow">▾</span>
        </button>

      </div>'''

insert2 = '''

      <div class="ai-model-picker">
        <div class="ai-model-picker-title">Model AI</div>

        <button class="ai-model-option" data-model="gpt-oss-120b">
          <span class="ai-model-check">✓</span>
          <span class="ai-model-info">
            <strong>GPT-OSS 120B</strong>
            <small>OpenAI · Groq</small>
            <small>Penalaran & Coding</small>
            <small>Lebih kuat untuk tugas kompleks</small>
          </span>
        </button>

        <button class="ai-model-option" data-model="gpt-oss-20b">
          <span class="ai-model-check">✓</span>
          <span class="ai-model-info">
            <strong>GPT-OSS 20B</strong>
            <small>OpenAI · Groq</small>
            <small>Chat & Quick Tasks</small>
            <small>Sangat cepat untuk chat harian</small>
          </span>
        </button>
      </div>'''

if marker2 not in s:
    print("PATCH 2 GAGAL — header tidak ditemukan")
    raise SystemExit(1)

if ".ai-model-picker" not in s:
    s = s.replace(marker2, marker2 + insert2, 1)
    print("PATCH 2 OK — dropdown HTML")
else:
    print("PATCH 2 SKIP — dropdown sudah ada")


# 3. Tambahkan CSS sebelum .ai-wrap
marker3 = "    .ai-wrap{"

css = r'''
    .ai-header{
      position:relative;
      z-index:20;
    }

    .ai-model-trigger{
      border:0;
      background:transparent;
      color:var(--text);
      font:inherit;
      font-weight:650;
      font-size:15px;
      cursor:pointer;
      padding:8px 10px;
      border-radius:9px;
    }

    .ai-model-trigger:hover{
      background:var(--surface);
    }

    .ai-model-arrow{
      margin-left:3px;
      opacity:.7;
    }

    .ai-model-picker{
      position:absolute;
      top:52px;
      left:52px;
      width:285px;
      padding:10px;
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:14px;
      box-shadow:0 12px 35px rgba(0,0,0,.25);
      z-index:100;
      display:none;
    }

    .ai-model-picker.open{
      display:block;
    }

    .ai-model-picker-title{
      padding:6px 8px 10px;
      font-size:12px;
      font-weight:700;
      color:var(--muted);
    }

    .ai-model-option{
      width:100%;
      display:flex;
      gap:8px;
      text-align:left;
      border:0;
      background:transparent;
      color:var(--text);
      padding:10px 8px;
      border-radius:10px;
      cursor:pointer;
    }

    .ai-model-option:hover{
      background:var(--hover);
    }

    .ai-model-check{
      width:16px;
      flex-shrink:0;
      opacity:0;
    }

    .ai-model-option.selected .ai-model-check{
      opacity:1;
    }

    .ai-model-info{
      display:flex;
      flex-direction:column;
      gap:2px;
    }

    .ai-model-info strong{
      font-size:13px;
    }

    .ai-model-info small{
      font-size:11px;
      color:var(--muted);
    }

'''

if ".ai-model-picker{" not in s:
    s = s.replace(marker3, css + marker3, 1)
    print("PATCH 3 OK — dropdown CSS")
else:
    print("PATCH 3 SKIP — dropdown CSS sudah ada")


# 4. Tambahkan handler setelah historyEl
marker4 = "  const historyEl = body.querySelector('.ai-history');"

insert4 = r'''

  const modelTrigger =
    body.querySelector('.ai-model-trigger');

  const modelPicker =
    body.querySelector('.ai-model-picker');

  const modelOptions =
    body.querySelectorAll('.ai-model-option');

  function updateLynnModelUI(){
    const model = LYNN_MODELS[selectedLynnModel];

    if (modelTrigger){
      const title =
        modelTrigger.querySelector('.ai-model-title');

      if (title){
        title.textContent = 'Lynn AI';
      }
    }

    modelOptions.forEach(option => {
      option.classList.toggle(
        'selected',
        option.dataset.model === selectedLynnModel
      );
    });
  }

  modelTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    modelPicker?.classList.toggle('open');
  });

  modelOptions.forEach(option => {
    option.addEventListener('click', () => {
      const key = option.dataset.model;

      if (!LYNN_MODELS[key]) return;

      selectedLynnModel = key;

      localStorage.setItem(
        'lynnzz:ai-model',
        selectedLynnModel
      );

      updateLynnModelUI();
      modelPicker?.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (
      modelPicker &&
      !modelPicker.contains(e.target) &&
      !modelTrigger?.contains(e.target)
    ){
      modelPicker.classList.remove('open');
    }
  });

  updateLynnModelUI();

'''

if "const modelTrigger =" not in s:
    s = s.replace(marker4, marker4 + insert4, 1)
    print("PATCH 4 OK — model handler")
else:
    print("PATCH 4 SKIP — model handler sudah ada")


# 5. Tambahkan model ke request callGroq
old5 = '''        body:JSON.stringify({

          messages:['''

new5 = '''        body:JSON.stringify({

          model: LYNN_MODELS[selectedLynnModel].id,

          messages:['''

if old5 not in s:
    print("PATCH 5 GAGAL — request callGroq tidak ditemukan")
    raise SystemExit(1)

if "model: LYNN_MODELS[selectedLynnModel].id" not in s:
    s = s.replace(old5, new5, 1)
    print("PATCH 5 OK — model dikirim ke Worker")
else:
    print("PATCH 5 SKIP — model request sudah ada")


p.write_text(s)
print("\nPATCH SELESAI")
