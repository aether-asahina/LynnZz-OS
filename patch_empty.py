from pathlib import Path

p = Path("js/apps.js")
s = p.read_text()

# ============================================================
# PATCH 1 — CSS
# ============================================================

css_marker = ".ai-wrap{"

css_patch = r'''
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
      z-index:1;
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

    @media(max-width:600px){
      .lynn-empty-title{
        font-size:23px;
      }

      .lynn-empty-subtitle{
        font-size:14px;
      }
    }

'''

if ".lynn-empty-state{" not in s:
    pos = s.find(css_marker)

    if pos == -1:
        raise SystemExit("PATCH 1 gagal: .ai-wrap tidak ditemukan")

    s = s[:pos] + css_patch + s[pos:]
    print("PATCH 1 OK — CSS")
else:
    print("PATCH 1 SKIP — CSS sudah ada")


# ============================================================
# PATCH 2 — HTML
# ============================================================

html_markers = [
    '<div class="ai-messages"',
    '<div class="messages"',
    '<div class="chat-messages"'
]

html_patch = r'''
        <div class="lynn-empty-state">
          <div class="lynn-empty-title"></div>
          <div class="lynn-empty-subtitle">
            Mau nanya apa hari ini?
          </div>
        </div>

'''

if ".lynn-empty-title" not in s:
    inserted = False

    for marker in html_markers:
        pos = s.find(marker)

        if pos != -1:
            s = s[:pos] + html_patch + s[pos:]
            inserted = True
            print("PATCH 2 OK — HTML")
            break

    if not inserted:
        print("PATCH 2 GAGAL — container messages tidak ditemukan")
else:
    print("PATCH 2 SKIP — HTML sudah ada")


# ============================================================
# PATCH 3 — JS
# ============================================================

js_marker = "function renderLynnAI(body){"

if "function getLynnGreeting()" not in s:

    pos = s.find(js_marker)

    if pos == -1:
        raise SystemExit("PATCH 3 gagal: renderLynnAI() tidak ditemukan")

    # Cari awal isi function setelah {
    pos = s.find("{", pos) + 1

    js_patch = r'''

  // ========================================================
  // LYNN AI EMPTY STATE
  // Greeting UI-only — tidak masuk history / messages
  // ========================================================

  const lynnEmptyState =
    body.querySelector('.lynn-empty-state');

  const lynnEmptyTitle =
    body.querySelector('.lynn-empty-title');

  function getLynnGreeting(){
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11){
      return 'Selamat pagi, Ketua.';
    }

    if (hour >= 11 && hour < 15){
      return 'Selamat siang, Ketua.';
    }

    if (hour >= 15 && hour < 18){
      return 'Selamat sore, Ketua.';
    }

    return 'Selamat malam, Ketua.';
  }

  function updateLynnEmptyState(){
    if (!lynnEmptyState || !lynnEmptyTitle) return;

    lynnEmptyTitle.textContent =
      getLynnGreeting();

    const hasMessages =
      Array.isArray(messages) &&
      messages.length > 0;

    lynnEmptyState.style.display =
      hasMessages ? 'none' : 'flex';
  }

'''

    s = s[:pos] + js_patch + s[pos:]

    print("PATCH 3A OK — greeting")
else:
    print("PATCH 3 SKIP — greeting sudah ada")


# ============================================================
# PATCH 3B — update setelah messages berubah
# ============================================================

if "updateLynnEmptyState();" not in s:

    # Cari addMessage function yang sudah ada
    marker = "function addMessage("

    pos = s.find(marker)

    if pos != -1:

        # Cari kurung buka function
        brace = s.find("{", pos)

        # Cari akhir function dengan bracket counting
        depth = 0
        end = None

        for i in range(brace, len(s)):
            if s[i] == "{":
                depth += 1
            elif s[i] == "}":
                depth -= 1

                if depth == 0:
                    end = i + 1
                    break

        if end:
            s = (
                s[:end]
                + "\n\n  updateLynnEmptyState();"
                + s[end:]
            )

            print("PATCH 3B OK — update empty state")
        else:
            print("PATCH 3B GAGAL — akhir addMessage tidak ditemukan")

    else:
        print("PATCH 3B SKIP — addMessage tidak ditemukan")


# ============================================================
# SAVE
# ============================================================

p.write_text(s)

print()
print("Patch selesai.")
