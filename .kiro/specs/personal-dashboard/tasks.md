# Implementation Plan: Personal Dashboard

## Overview

Implementasi dasbor personal sisi klien dengan HTML, CSS, dan Vanilla JavaScript — terdiri dari sapaan berbasis waktu, timer fokus gaya Pomodoro, daftar tugas, dan tautan cepat, ditambah toggle tema terang/gelap pada topbar. Seluruh data dipersistensi di `localStorage` browser tanpa server.

Dokumen ini bersifat **retroaktif**: seluruh implementasi sudah selesai, sehingga setiap task ditandai `[x]` (selesai). Tidak ada task dengan status `[ ]`.

Pendekatan implementasi mengikuti pola tiga file (`index.html`, `css/style.css`, `js/app.js`) dengan alur data satu arah: event pengguna → mutasi state in-memory → persistensi `localStorage` → re-render DOM. Theming dilakukan via atribut `data-theme` dan Design Tokens berupa CSS custom properties.

## Tasks

- [x] 1. Setup struktur proyek
  - [x] 1.1 Buat struktur folder `dashboard/` dengan subfolder `css/` dan `js/`
    - Buat direktori `dashboard/css/` dan `dashboard/js/`
    - _Requirements: 6.4_
  - [x] 1.2 Buat `index.html` boilerplate dan hubungkan `css/style.css` serta `js/app.js`
    - Boilerplate HTML5 dengan struktur topbar + grid utama (greeting, timer, todo, links)
    - Tambahkan `<link rel="stylesheet" href="css/style.css">` dan `<script src="js/app.js"></script>`
    - _Requirements: 6.4_

- [x] 2. Implementasi CSS Design System
  - [x] 2.1 Definisikan Design Tokens: CSS custom properties di `:root` (light theme) dan override di `[data-theme="dark"]`
    - Token warna dan tata letak sebagai CSS custom properties di `:root`
    - Override seluruh token warna pada selektor `[data-theme="dark"]`
    - _Requirements: 5.4_
  - [x] 2.2 Buat layout CSS Grid 2 kolom dengan `grid-template-areas` dan responsive media query `max-width: 700px`
    - Definisikan `grid-template-areas` untuk topbar, greeting, timer, todo, links
    - Media query `max-width: 700px` mengubah tata letak menjadi 1 kolom
    - _Requirements: 6.5_
  - [x] 2.3 Buat component styles dan animasi slide-in
    - Style `.card`, `.topbar`, `.btn-primary`/`.btn-secondary`/`.btn-ghost`, dan form inputs
    - Animasi `slide-in` untuk `todo-item` dan `link-chip`
    - _Requirements: 5.4, 6.5_

- [x] 3. Implementasi utility functions (`js/app.js`)
  - [x] 3.1 Implementasikan `lsGet(key, fallback)` dan `lsSet(key, value)`
    - `lsGet`: `JSON.parse(localStorage.getItem(key))` dengan `try-catch`; return `fallback` bila `null` atau parse error
    - `lsSet`: `localStorage.setItem(key, JSON.stringify(value))`
    - _Requirements: 6.2_

- [x] 4. Implementasi light/dark mode
  - [x] 4.1 Implementasikan toggle button, `applyTheme(dark)`, load dan simpan preferensi tema
    - Toggle button di topbar dengan emoji 🌙/☀️
    - `applyTheme(dark)` set atribut `data-theme` pada `<html>` dan perbarui emoji tombol
    - Load preferensi dari localStorage (key: `dashboard_dark`) saat page load
    - Simpan preferensi ke localStorage saat toggle
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x]* 4.2 Write property test for theme state sync
    - **Property 1: Theme State Sync**
    - **Validates: Requirements 5.2, 5.3**

- [x] 5. Implementasi greeting section
  - [x] 5.1 Implementasikan `getTimeGreeting()`, `formatDatetime()`, `updateGreeting()`, dan interval 30 detik
    - `getTimeGreeting()`: `<12` → "Good morning", `<17` → "Good afternoon", else → "Good evening"
    - `formatDatetime()` via `toLocaleString('en-US', {weekday, year, month, day, hour, minute})`
    - `updateGreeting()` memperbarui `#greeting-msg` dan `#datetime`
    - `setInterval(updateGreeting, 30_000)`
    - _Requirements: 1.1, 1.3, 1.4_
  - [x] 5.2 Implementasikan `saveName()` dengan visual feedback dan load nama saat init
    - Trim input, `lsSet('dashboard_name', trimmed)`, panggil `updateGreeting()`
    - Umpan balik visual "✓ Saved"
    - Load nama dari localStorage (key: `dashboard_name`) saat init
    - _Requirements: 1.2, 1.5, 1.6_
  - [x]* 5.3 Write property test for greeting correctness
    - **Property 2: Greeting Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.6**
  - [x]* 5.4 Write property test for name save round trip
    - **Property 3: Name Save Round Trip**
    - **Validates: Requirements 1.5**

- [x] 6. Implementasi focus timer
  - [x] 6.1 Implementasikan `getConfiguredSeconds()`, `formatTime(secs)`, dan `renderTimer()`
    - `getConfiguredSeconds()`: `parseInt(#timer-duration.value) * 60`
    - `formatTime(secs)`: format `MM:SS` via `padStart`
    - `renderTimer()`: tulis `#timer-display` textContent
    - _Requirements: 2.1, 2.2_
  - [x] 6.2 Implementasikan `startTimer()`, `stopTimer()`, `resetTimer()`, completion, dan request permission
    - `startTimer()`: guard (return bila running), disable Start + input durasi, `setInterval(1000)` decrement `secondsLeft`
    - `stopTimer()`: `clearInterval`, `timerRunning=false`, enable Start (pause tanpa reset)
    - `resetTimer()`: stop + recompute `secondsLeft` + reset warna + `renderTimer()`
    - Completion: `clearInterval`, warna `var(--success)`, `Notification` API atau fallback `alert`
    - `Notification.requestPermission()` sekali pada first document click
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x]* 6.3 Write property test for configured duration to seconds
    - **Property 4: Configured Duration to Seconds**
    - **Validates: Requirements 2.2**
  - [x]* 6.4 Write property test for timer countdown invariant
    - **Property 5: Timer Countdown Invariant**
    - **Validates: Requirements 2.4, 2.7**
  - [x]* 6.5 Write property test for timer reset round trip
    - **Property 6: Timer Reset Round Trip**
    - **Validates: Requirements 2.6**

- [x] 7. Implementasi to-do list
  - [x] 7.1 Implementasikan state, `saveTasks()`, `getSortedTasks()`, `renderTasks()`, sort buttons, dan load
    - State `tasks[]` (dari `lsGet('dashboard_tasks', [])`) dan `sortMode`
    - `saveTasks()` dan `getSortedTasks()` (sort sesuai `sortMode`)
    - `renderTasks()` dengan empty state bila kosong
    - Sort buttons: Default, A-Z, Done last
    - Load tasks dari localStorage saat init
    - _Requirements: 3.8, 3.9, 3.10, 3.11_
  - [x] 7.2 Implementasikan `addTask()`, `toggleDone(id)`, dan `deleteTask(id)`
    - `addTask()`: trim, cek duplikat case-insensitive, push `{id:Date.now(), text, done:false}`, `saveTasks`, `renderTasks`, clear input
    - `toggleDone(id)` dan `deleteTask(id)`: map/filter, `saveTasks`, `renderTasks`
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.12_
  - [x] 7.3 Implementasikan inline editing dan `showDupWarn()`
    - `startEdit(id, li, span)`, `finishEdit(...)`, `cancelEdit(...)` untuk inline editing
    - Simpan via tombol 💾 atau Enter; batal via Escape
    - `showDupWarn()`: tampilkan `#todo-dup-warn`, auto-hide 2500 ms
    - _Requirements: 3.4, 3.5, 3.6, 3.12_
  - [x]* 7.4 Write property test for task uniqueness (case-insensitive)
    - **Property 7: Task Uniqueness (Case-Insensitive)**
    - **Validates: Requirements 3.12**
  - [x]* 7.5 Write property test for task persistence render-sync
    - **Property 8: Task Persistence Render-Sync**
    - **Validates: Requirements 3.8**
  - [x]* 7.6 Write property test for sort correctness
    - **Property 9: Sort Correctness**
    - **Validates: Requirements 3.9, 3.10, 3.11**

- [x] 8. Implementasi quick links
  - [x] 8.1 Implementasikan state, `saveLinks()`, `renderLinks()`, dan load dengan default links
    - State `links[]` dengan default Google, YouTube, GitHub
    - `saveLinks()` dan `renderLinks()` membangun `.link-chip` (`<a target="_blank" rel="noopener noreferrer">` + tombol hapus)
    - Load links dari localStorage (key: `dashboard_links`) saat init
    - _Requirements: 4.4, 4.5, 4.7, 4.8_
  - [x] 8.2 Implementasikan `addLink()` dan `deleteLink(id)`
    - `addLink()`: trim label (maks 30) + URL, auto-prepend `https://` bila tidak berawalan `http://`/`https://`, `saveLinks`, `renderLinks`, clear input
    - `deleteLink(id)`: filter, `saveLinks`, `renderLinks`
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  - [x]* 8.3 Write property test for URL normalization
    - **Property 10: URL Normalization**
    - **Validates: Requirements 4.3**
  - [x]* 8.4 Write property test for link persistence render-sync
    - **Property 11: Link Persistence Render-Sync**
    - **Validates: Requirements 4.7**

- [x] 9. Checkpoint - Pastikan seluruh tes lulus
  - Pastikan seluruh tes lulus, tanyakan pengguna bila ada pertanyaan.

## Notes

- Dokumen ini bersifat retroaktif: seluruh implementasi sudah selesai, sehingga setiap task ditandai `[x]` (selesai). Tidak ada task dengan status `[ ]`.
- Sub-task bertanda `*` adalah task pengujian opsional (property test) yang mereferensikan Correctness Properties pada design document; tetap ditandai `[x]` sesuai instruksi dokumentasi retroaktif.
- Setiap task mereferensikan requirement spesifik dari `requirements.md` untuk traceabilitas.
- Property test memvalidasi invariant universal (11 properti pada design document); unit test memvalidasi contoh dan edge case.
- Checkpoint memastikan validasi bertahap sebelum menyelesaikan dokumen.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["3.1", "2.2"] },
    { "id": 3, "tasks": ["4.1", "2.3"] },
    { "id": 4, "tasks": ["5.1", "4.2"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["6.1", "5.3"] },
    { "id": 7, "tasks": ["6.2", "5.4", "6.3"] },
    { "id": 8, "tasks": ["7.1", "6.4"] },
    { "id": 9, "tasks": ["7.2", "6.5"] },
    { "id": 10, "tasks": ["7.3", "7.4"] },
    { "id": 11, "tasks": ["8.1", "7.5"] },
    { "id": 12, "tasks": ["8.2", "7.6"] },
    { "id": 13, "tasks": ["8.3"] },
    { "id": 14, "tasks": ["8.4"] },
    { "id": 15, "tasks": ["9"] }
  ]
}
```
