from pathlib import Path

p = Path("js/apps.js")
s = p.read_text()

old = '''      <div class="ai-header">

        <button class="ai-menu">☰</button>

        <div class="ai-avatar">🤖</div>

        <div class="ai-header-text">
          Lynn AI ${NEEDS_SETUP
            ? '— belum dikonfigurasi'
            : '— ditenagai Groq (Llama 3.3)'}
        </div>

      </div>'''

new = '''      <div class="ai-header">

        <button class="ai-menu">☰</button>

        <button class="ai-model-trigger" type="button">
          <span class="ai-model-title">Lynn AI</span>
          <span class="ai-model-arrow">▾</span>
        </button>

      </div>'''

if old not in s:
    print("PATCH GAGAL — header tidak ditemukan")
    raise SystemExit(1)

p.write_text(s.replace(old, new, 1))
print("PATCH OK — header berhasil diubah")
