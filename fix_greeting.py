from pathlib import Path

p = Path("js/apps.js")
s = p.read_text()

# =========================================================
# 1. Pindahkan empty state KELUAR dari .ai-messages
# =========================================================

old = '''      <div class="ai-messages">

        <div class="lynn-empty-state">
          <div class="lynn-empty-title"></div>
          <div class="lynn-empty-subtitle">
            Mau nanya apa hari ini?
          </div>
        </div>

      </div>'''

new = '''      <div class="lynn-empty-state">
        <div class="lynn-empty-title"></div>
        <div class="lynn-empty-subtitle">
          Mau nanya apa hari ini?
        </div>
      </div>

      <div class="ai-messages"></div>'''

if old in s:
    s = s.replace(old, new, 1)
    print("PATCH 1 OK — empty state dipisahkan dari messages")
else:
    print("PATCH 1 SKIP — struktur empty state tidak ditemukan")


# =========================================================
# 2. Hapus greeting lama dari newChat()
# =========================================================

old2 = '''    addMessage(
      'system',
      NEEDS_SETUP
        ? 'Lynn AI belum aktif. Isi API key Groq lo di js/groq-config.js lalu push ulang.'
        : 'Halo! Gue Lynn AI. Tanya apa aja — bisa bikinin kode, jelasin konsep, atau bantu tugas.'
    );'''

if old2 in s:
    s = s.replace(old2, '''    updateLynnEmptyState();''', 1)
    print("PATCH 2 OK — greeting newChat dihapus")
else:
    print("PATCH 2 SKIP — greeting newChat sudah tidak ada")


# =========================================================
# 3. Hapus greeting lama dari initial render
# =========================================================

old3 = '''  if (NEEDS_SETUP){

    addMessage(
      'system',
      'Lynn AI belum aktif.'
    );

  }else{

    addMessage(
      'system',
      'Halo! Gue Lynn AI. Tanya apa aja — bisa bikinin kode, jelasin konsep, atau bantu tugas.'
    );

  }'''

if old3 in s:
    s = s.replace(old3, '''  updateLynnEmptyState();''', 1)
    print("PATCH 3 OK — greeting initial dihapus")
else:
    print("PATCH 3 SKIP — greeting initial sudah tidak ada")


# =========================================================
# 4. Pastikan update dipanggil setelah chat dimuat
# =========================================================

old4 = '''    messages.forEach(m => {
      addMessage(
        m.role,
        m.text,
        false
      );
    });

    msgsEl.scrollTop = msgsEl.scrollHeight;'''

new4 = '''    messages.forEach(m => {
      addMessage(
        m.role,
        m.text,
        false
      );
    });

    updateLynnEmptyState();

    msgsEl.scrollTop = msgsEl.scrollHeight;'''

if old4 in s and "updateLynnEmptyState();\n\n    msgsEl.scrollTop" not in s:
    s = s.replace(old4, new4, 1)
    print("PATCH 4 OK — update setelah load chat")
else:
    print("PATCH 4 SKIP")


# =========================================================
# 5. Pastikan newChat meng-update empty state
# =========================================================

old5 = '''    msgsEl.innerHTML = '';

    addMessage('''

new5 = '''    msgsEl.innerHTML = '';

    updateLynnEmptyState();

    addMessage('''

# Hanya lakukan kalau greeting lama masih ada
if old5 in s and "msgsEl.innerHTML = '';\n\n    updateLynnEmptyState();\n\n    addMessage(" not in s:
    s = s.replace(old5, new5, 1)
    print("PATCH 5 OK — newChat update")
else:
    print("PATCH 5 SKIP")


p.write_text(s)
print("\nFIX GREETING SELESAI")
