// ===== Inventaris Barang =====
// Data disimpan di localStorage browser, jadi tidak perlu server atau database.

const KEY = "inventaris-barang-v1";
let items = [];
let editId = null; // null = mode tambah, selain itu = id barang yang sedang diubah

const $ = (id) => document.getElementById(id);
const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ----- Simpan & muat data -----
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { items = JSON.parse(raw) || []; return; }
  } catch (e) { /* abaikan, pakai data contoh */ }
  items = [
    { id: uid(), name: "Kertas A4 80 gsm", code: "ATK-001", cat: "Alat tulis", qty: 42, unit: "rim", price: 58000, min: 10, loc: "Gudang A, Rak 1", t: 1 },
    { id: uid(), name: "Kabel HDMI 2 m", code: "ELK-014", cat: "Elektronik", qty: 4, unit: "pcs", price: 45000, min: 6, loc: "Gudang B, Rak 2", t: 2 },
    { id: uid(), name: "Tinta printer hitam", code: "ATK-020", cat: "Alat tulis", qty: 0, unit: "botol", price: 95000, min: 3, loc: "Gudang A, Rak 4", t: 3 },
  ];
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}

// ----- Status stok -----
function status(i) {
  if (i.qty <= 0) return ["Habis", "out"];
  if (i.qty <= i.min) return ["Menipis", "low"];
  return ["Aman", ""];
}

// ----- Tampilkan data -----
function render() {
  const q = $("q").value.trim().toLowerCase();
  const catNow = $("cat").value;
  const sort = $("sort").value;

  // Isi pilihan kategori
  const cats = [...new Set(items.map((i) => i.cat).filter(Boolean))].sort();
  $("cat").innerHTML = '<option value="">Semua kategori</option>' +
    cats.map((c) => `<option${c === catNow ? " selected" : ""}>${esc(c)}</option>`).join("");
  $("catList").innerHTML = cats.map((c) => `<option value="${esc(c)}">`).join("");

  // Filter & urutkan
  const list = items
    .filter((i) => (!catNow || i.cat === catNow) &&
      (!q || `${i.name} ${i.code} ${i.loc}`.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (sort === "qty") return a.qty - b.qty;
      if (sort === "value") return b.qty * b.price - a.qty * a.price;
      if (sort === "recent") return b.t - a.t;
      return a.name.localeCompare(b.name, "id");
    });

  // Baris tabel
  $("rows").innerHTML = list.map((i) => {
    const [label, cls] = status(i);
    return `<tr>
      <td><div class="name">${esc(i.name)}</div><div class="code">${esc(i.code || "Tanpa kode")}</div></td>
      <td>${esc(i.cat || "-")}</td>
      <td>${esc(i.loc || "-")}</td>
      <td class="num">${rupiah(i.price)}</td>
      <td><div class="qty">
        <button data-a="dec" data-id="${i.id}" aria-label="Kurangi stok">−</button>
        <span>${i.qty}</span>
        <button data-a="inc" data-id="${i.id}" aria-label="Tambah stok">+</button>
        <small>${esc(i.unit)}</small>
      </div></td>
      <td><span class="tag ${cls}">${label}</span></td>
      <td><div class="row-actions">
        <button class="btn" data-a="edit" data-id="${i.id}">Ubah</button>
        <button class="btn danger" data-a="del" data-id="${i.id}">Hapus</button>
      </div></td>
    </tr>`;
  }).join("");

  // Pesan kosong
  $("empty").hidden = list.length > 0;
  $("empty").textContent = items.length
    ? "Tidak ada barang yang cocok dengan pencarian."
    : "Belum ada barang. Pilih “Tambah barang” untuk mulai mencatat.";

  // Ringkasan
  $("sItems").textContent = items.length;
  $("sQty").textContent = items.reduce((a, i) => a + i.qty, 0).toLocaleString("id-ID");
  $("sValue").textContent = rupiah(items.reduce((a, i) => a + i.qty * i.price, 0));
  $("sLow").textContent = items.filter((i) => i.qty <= i.min).length;
}

// ----- Form tambah / ubah -----
function openForm(item) {
  editId = item ? item.id : null;
  $("dTitle").textContent = item ? "Ubah barang" : "Tambah barang";
  $("fName").value = item ? item.name : "";
  $("fCode").value = item ? item.code : "";
  $("fCat").value = item ? item.cat : "";
  $("fQty").value = item ? item.qty : 0;
  $("fUnit").value = item ? item.unit : "pcs";
  $("fPrice").value = item ? item.price : 0;
  $("fMin").value = item ? item.min : 5;
  $("fLoc").value = item ? item.loc : "";
  $("dlg").showModal();
  $("fName").focus();
}

$("addBtn").addEventListener("click", () => openForm(null));
$("cancel").addEventListener("click", () => $("dlg").close());

$("f").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    name: $("fName").value.trim(),
    code: $("fCode").value.trim(),
    cat: $("fCat").value.trim(),
    qty: Math.max(0, parseInt($("fQty").value, 10) || 0),
    unit: $("fUnit").value.trim() || "pcs",
    price: Math.max(0, parseFloat($("fPrice").value) || 0),
    min: Math.max(0, parseInt($("fMin").value, 10) || 0),
    loc: $("fLoc").value.trim(),
  };
  if (!data.name) return;

  if (editId) {
    items = items.map((i) => (i.id === editId ? { ...i, ...data } : i));
  } else {
    items.push({ ...data, id: uid(), t: Date.now() });
  }
  save(); render(); $("dlg").close();
});

// ----- Tombol di dalam tabel (+, −, ubah, hapus) -----
$("rows").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-a]");
  if (!btn) return;
  const item = items.find((i) => i.id === btn.dataset.id);
  if (!item) return;

  switch (btn.dataset.a) {
    case "inc": item.qty++; break;
    case "dec": item.qty = Math.max(0, item.qty - 1); break;
    case "edit": openForm(item); return;
    case "del":
      if (!confirm(`Hapus “${item.name}” dari inventaris?`)) return;
      items = items.filter((i) => i.id !== item.id);
      break;
  }
  save(); render();
});

// ----- Pencarian, filter, urutan -----
["q", "cat", "sort"].forEach((id) => $(id).addEventListener("input", render));

// ----- Unduh CSV (bisa dibuka di Excel) -----
$("csvBtn").addEventListener("click", () => {
  const head = ["Nama", "Kode", "Kategori", "Jumlah", "Satuan", "Harga satuan", "Stok minimum", "Lokasi"];
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = items.map((i) => [i.name, i.code, i.cat, i.qty, i.unit, i.price, i.min, i.loc].map(cell).join(","));
  const csv = "\uFEFF" + [head.map(cell).join(","), ...rows].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = "inventaris-barang.csv"; a.click();
  URL.revokeObjectURL(url);
});

load();
render();
