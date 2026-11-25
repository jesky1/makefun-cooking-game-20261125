# Dapur Kilat — Game Masak

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/jesky1/makefun-cooking-game-20261125/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/jesky1/makefun-cooking-game-20261125/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

**Dapur Kilat** adalah game masak 2D yang berjalan dari file statis di browser
desktop, tanpa permintaan jaringan. Kamu adalah satu-satunya koki di dapur:
ambil bahan dari counter, potong di talenan, panggang di panggangan, rebus di
panci, susun hidangan di piring, dan antar ke Jendela Saji sebelum pelanggan
kehabisan sabar.

## Cara main

- **WASD / panah** — jalan
- **E / Spasi** — ambil, taruh, sajikan (di stasiun terdekat)
- **Klik lantai** — jalan ke sana; **klik stasiun** — jalan & berinteraksi
- **M** — bisu / bunyi

## Resep

| Hidangan | Bahan |
| --- | --- |
| Burger Kilat | Roti + Patty Panggang + Selada Potong + Tomat Potong |
| Salad Segar | Selada Potong + Tomat Potong + Keju |
| Pasta Saus | Pasta Rebus + Saus + Keju |
| Sandwich Kilat | Roti + Keju + Tomat Potong |

Pesanan datang di papan atas dengan timer kesabaran. Sajikan tepat waktu
untuk bonus koin; combo beruntun menaikkan bayaran sampai 2x. Masakan yang
dibiarkan terlalu lama di panggangan atau panci akan gosong — buang ke sampah.
Shift berlangsung 3 menit, dengan rush di 45 detik terakhir.

## Jalankan lokal

```sh
node serve.ts
# buka http://localhost:8080
```

## Screenshot

Empat adegan (`?shot=start|play|serve|end`) diambil dari render game itu
sendiri di browser, lewat `shots.json`.

## Struktur

- `game/index.html` — halaman game
- `game/src/config.js` — angka, resep, tata letak dapur
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — efek suara sintetis WebAudio (tanpa file audio)
- `game/src/orders.js` — papan pesanan, kesabaran, pencocokan, skor
- `game/src/stations.js` — bin bahan, talenan, panggangan, panci, plating, jendela saji, sampah
- `game/src/chef.js` — gerakan koki & barang bawaan
- `game/src/render.js` — semua gambar dapur, makanan, HUD, dan layar
- `game/src/shots.js` — adegan screenshot dari state game asli
- `game/src/main.js` — loop, state machine, wiring
- `main.ts` — program hand-in: menyalin `game/` + `screenshots/` ke `/output`
  dan menulis `dossier.json` via `vendor/makefun-game.ts`
- `vendor/makefun-game.ts` — salinan kit, tidak diubah

Lisensi: MIT.
