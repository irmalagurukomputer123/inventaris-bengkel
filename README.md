# Inventaris Barang

Aplikasi web inventaris barang sederhana (HTML, CSS, JavaScript murni, tanpa instalasi library).

## Cara menjalankan di Visual Studio Code
1. Ekstrak folder `inventaris-barang`, lalu di VS Code pilih **File → Open Folder**.
2. Buka tab **Extensions** (Ctrl+Shift+X), cari dan pasang **Live Server** (Ritwick Dey).
3. Klik kanan `index.html` → **Open with Live Server**. Aplikasi terbuka di browser.

Alternatif tanpa ekstensi: klik dua kali `index.html` untuk membukanya langsung di browser.

## Struktur file
- `index.html`: kerangka halaman dan form
- `style.css`: tampilan (otomatis mengikuti mode terang/gelap)
- `script.js`: logika aplikasi; data disimpan di `localStorage` browser

## Fitur
Tambah, ubah, hapus barang; tombol + dan − untuk stok; ringkasan nilai persediaan; peringatan stok menipis; cari, filter kategori, urutkan; unduh CSV.
