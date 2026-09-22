from pathlib import Path

p = Path("js/apps.js")
s = p.read_text()

# =========================================================
# 1. Tambahkan HTML empty state setelah ai-messages
# =========================================================

old1 = '''      <div class="ai-messages"></div>'''

new1 = '''      <div class="ai-messages">

        <div class="lynn-empty-state">
          <div class="lynn-empty-title"></div>
          <div class="lynn-empty-subtitle">
            Mau nanya apa hari ini?
          </div>
        </div>

      </div>'''

if old1 not in s:
    print("PATCH 1 GAGAL — ai-messages tidak ditemukan")
    raise SystemExit(1)

if '<div class="lynn-empty-state">' not in s:
    s = s.replace(old1, new1, 1)
    print("PATCH 1 OK — empty state HTML")
else:
    print("PATCH 1 SKIP — empty state sudah ada")


# =========================================================
# 2. Hapus greeting system dari newChat()
# =========================================================

old2 = '''    addMessage(
      'system',
      NEEDS_SETUP
        ? 'Lynn AI belum aktif. Isi API key Groq lo di js/groq-config.js lalu push ulang.'
        : 'Halo! Gue Lynn AI. Tanya apa aja — bisa bikinin kode, jelasin konsep, atau bantu tugas.'
    );'''

new2 = '''    updateLynnEmptyState();'''

if old2 not in s:
    print("PATCH 2 GAGAL — greeting newChat tidak ditemukan")
    raise SystemExit(1)

s = s.replace(old2, new2, 1)
print("PATCH 2 OK — greeting newChat dihapus")


# =========================================================
# 3. Hapus greeting system dari initial chat
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

new3 = '''  updateLynnEmptyState();'''

if old3 not in s:
    print("PATCH 3 GAGAL — greeting initial tidak ditemukan")
    raise SystemExit(1)

s = s.replace(old3, new3, 1)
print("PATCH 3 OK — greeting initial dihapus")


# =========================================================
# 4. Pastikan empty state diperbarui setelah pesan
# =========================================================

old4 = '''    msgsEl.appendChild(el);

    if (animate){'''

new4 = '''    msgsEl.appendChild(el);

    updateLynnEmptyState();

    if (animate){'''

if old4 not in s:
    print("PATCH 4 GAGAL — addMessage target tidak ditemukan")
    raise SystemExit(1)

if "msgsEl.appendChild(el);\n\n    updateLynnEmptyState();" not in s:
    s = s.replace(old4, new4, 1)
    print("PATCH 4 OK — empty state update")


p.write_text(s)
print("\nPATCH SELESAI")
