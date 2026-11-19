# Requirements Document

## Introduction

Dokumen ini adalah dokumentasi retroaktif dari fitur "personal-dashboard" yang sudah selesai dibangun. Personal-dashboard adalah aplikasi web dasbor personal berisi sapaan berbasis waktu, timer fokus gaya Pomodoro, daftar tugas, dan tautan cepat. Aplikasi dibangun dengan HTML, CSS, dan Vanilla JavaScript tanpa framework apa pun, dan menyimpan seluruh data di sisi klien menggunakan localStorage. Dokumen ini mendeskripsikan perilaku yang sudah diimplementasikan pada kode yang ada; tidak ada perubahan kode yang dilakukan dalam pembuatan dokumen ini.

## Glossary

- **Dashboard**: Aplikasi personal-dashboard secara keseluruhan, sistem yang direpresentasikan oleh gabungan file index.html, css/style.css, dan js/app.js.
- **Greeting_Section**: Bagian Dashboard yang menampilkan sapaan berbasis waktu, nama pengguna, serta tanggal dan waktu saat ini.
- **Focus_Timer**: Komponen hitung mundur gaya Pomodoro di Dashboard yang menampilkan durasi dalam format MM:SS.
- **Not_Running_State**: Kondisi Focus_Timer ketika hitung mundur tidak sedang berjalan.
- **Running_State**: Kondisi Focus_Timer ketika hitung mundur sedang berjalan.
- **Task_List**: Komponen daftar tugas di Dashboard yang menyimpan, menampilkan, mengurutkan, dan mengelola tugas.
- **Task**: Satu item dalam Task_List, direpresentasikan sebagai objek {id, text, done}.
- **Quick_Links**: Komponen Dashboard yang menyimpan dan menampilkan tautan cepat sebagai chip/badge.
- **Quick_Link**: Satu item di Quick_Links, terdiri dari label dan URL.
- **Theme_Toggle**: Tombol pada topbar Dashboard yang mengubah mode tampilan terang atau gelap.
- **Design_Tokens**: Nilai warna dan variabel tata letak yang didefinisikan sebagai CSS custom properties.
- **localStorage**: API penyimpanan sisi klien pada browser yang digunakan Dashboard untuk menyimpan seluruh data.
- **User_Name**: Nama pengguna yang disimpan di localStorage dengan key dashboard_name dan ditampilkan pada Greeting_Section.

## Requirements

### Requirement 1: Sapaan Berbasis Waktu

**User Story:** Sebagai pengguna, saya ingin melihat sapaan yang sesuai dengan waktu saat ini beserta nama dan tanggal, sehingga dasbor terasa personal dan informatif.

#### Acceptance Criteria

1. THE Greeting_Section SHALL menampilkan sapaan "Good morning" saat jam 00:00–11:59, "Good afternoon" saat jam 12:00–16:59, dan "Good evening" saat jam 17:00–23:59.
2. WHEN User_Name tersimpan di localStorage, THE Greeting_Section SHALL menampilkan sapaan dengan nama pengguna dalam format "Good morning, Budi! 👋".
3. THE Greeting_Section SHALL menampilkan tanggal dan waktu saat ini dalam format "Wednesday, July 9, 2025 · 3:45 PM".
4. THE Greeting_Section SHALL memperbarui tanggal dan waktu secara otomatis setiap 30 detik.
5. WHEN pengguna memasukkan nama pada input nama dan menekan tombol Save, THE Greeting_Section SHALL menyimpan nama tersebut ke localStorage dengan key dashboard_name dan langsung menampilkannya.
6. WHEN User_Name belum tersimpan di localStorage, THE Greeting_Section SHALL menampilkan sapaan tanpa nama.

### Requirement 2: Focus Timer Gaya Pomodoro

**User Story:** Sebagai pengguna, saya ingin timer fokus dengan durasi yang dapat dikonfigurasi, sehingga saya dapat menggunakan teknik Pomodoro untuk meningkatkan konsentrasi.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan durasi default 25 menit dalam format MM:SS.
2. WHILE Focus_Timer berada dalam Not_Running_State, THE Focus_Timer SHALL mengizinkan pengguna mengubah durasi melalui input angka dengan rentang 1–99 menit.
3. WHILE Focus_Timer berada dalam Running_State, THE Focus_Timer SHALL menonaktifkan tombol Start dan input durasi.
4. WHEN tombol Start ditekan, THE Focus_Timer SHALL memulai hitung mundur dari durasi yang dikonfigurasi.
5. WHEN tombol Stop ditekan, THE Focus_Timer SHALL menghentikan hitung mundur tanpa mereset ke durasi awal.
6. WHEN tombol Reset ditekan, THE Focus_Timer SHALL menghentikan hitung mundur dan mengembalikan tampilan ke durasi yang dikonfigurasi.
7. WHEN hitung mundur mencapai 00:00, THE Focus_Timer SHALL mengubah tampilan menjadi warna hijau dan memunculkan browser Notification.
8. IF browser Notification tidak memiliki izin, THEN THE Focus_Timer SHALL menampilkan alert sebagai pengganti notifikasi.

### Requirement 3: Daftar Tugas

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas dengan tambah, centang selesai, edit, dan hapus, sehingga saya dapat melacak aktivitas harian saya.

#### Acceptance Criteria

1. WHEN pengguna memasukkan teks pada input task dan menekan tombol Add atau tombol Enter, THE Task_List SHALL menambahkan task baru.
2. THE Task_List SHALL membatasi panjang teks task maksimal 120 karakter.
3. WHEN pengguna mencentang checkbox pada task, THE Task_List SHALL menandai task tersebut sebagai done dan menampilkannya dengan gaya strikethrough serta berkurang opacity.
4. WHEN pengguna menekan tombol edit (✏️) pada task, THE Task_List SHALL mengubah teks task menjadi input field.
5. WHILE teks task berada dalam mode edit, THE Task_List SHALL menyimpan perubahan ketika pengguna menekan tombol simpan (💾) atau tombol Enter.
6. WHILE teks task berada dalam mode edit, THE Task_List SHALL membatalkan perubahan ketika pengguna menekan tombol Escape.
7. WHEN pengguna menekan tombol hapus (🗑️) pada task, THE Task_List SHALL menghapus task tersebut.
8. THE Task_List SHALL menyimpan seluruh task ke localStorage dengan key dashboard_tasks sebagai array objek {id, text, done}.
9. WHERE sort mode disetel ke Default, THE Task_List SHALL menampilkan task sesuai urutan insert.
10. WHERE sort mode disetel ke A–Z, THE Task_List SHALL menampilkan task dalam urutan alfabetis.
11. WHERE sort mode disetel ke Done last, THE Task_List SHALL menampilkan task yang belum selesai sebelum task yang sudah selesai.
12. WHEN pengguna menambah atau mengedit task dengan teks yang sama secara case-insensitive dengan task yang sudah ada, THE Task_List SHALL menampilkan peringatan "⚠️ That task already exists." yang otomatis hilang setelah 2,5 detik.

### Requirement 4: Tautan Cepat

**User Story:** Sebagai pengguna, saya ingin menyimpan dan membuka tautan yang sering saya kunjungi dari dasbor, sehingga saya dapat mengaksesnya dengan cepat.

#### Acceptance Criteria

1. WHEN pengguna memasukkan label dan URL pada form tambah link lalu menekan tombol Add, THE Quick_Links SHALL menambahkan link baru.
2. THE Quick_Links SHALL membatasi panjang label maksimal 30 karakter.
3. WHEN URL yang dimasukkan tidak diawali dengan http:// atau https://, THE Quick_Links SHALL menambahkan prefiks "https://" secara otomatis.
4. THE Quick_Links SHALL menampilkan setiap link sebagai chip/badge.
5. WHEN pengguna mengklik chip link, THE Quick_Links SHALL membuka URL pada tab baru dengan atribut target bernilai "_blank" dan rel bernilai "noopener noreferrer".
6. WHEN pengguna menekan tombol hapus (×) pada chip, THE Quick_Links SHALL menghapus link tersebut.
7. THE Quick_Links SHALL menyimpan seluruh link ke localStorage dengan key dashboard_links.
8. WHEN Quick_Links diakses untuk pertama kali tanpa data tersimpan, THE Quick_Links SHALL menampilkan default links Google, YouTube, dan GitHub.

### Requirement 5: Mode Terang/Gelap

**User Story:** Sebagai pengguna, saya ingin beralih antara mode terang dan gelap, sehingga saya dapat menggunakan dasbor dengan nyaman di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL menampilkan ikon 🌙 atau ☀️ pada topbar.
2. WHEN pengguna menekan Theme_Toggle, THE Dashboard SHALL mengubah atribut data-theme pada elemen <html>.
3. WHEN pengguna menekan Theme_Toggle, THE Dashboard SHALL menyimpan preferensi mode ke localStorage dengan key dashboard_dark.
4. THE Dashboard SHALL menerapkan seluruh warna melalui Design_Tokens berupa CSS custom properties.

### Requirement 6: Batasan Teknis dan Karakteristik Non-Fungsional

**User Story:** Sebagai pengembang, saya ingin batasan teknis dan karakteristik non-fungsional didokumentasikan, sehingga implementasi Dashboard dapat dipahami dan dipelihara dengan konsisten.

#### Acceptance Criteria

1. THE Dashboard SHALL diimplementasikan hanya dengan HTML, CSS, dan Vanilla JavaScript tanpa framework apa pun.
2. THE Dashboard SHALL menyimpan seluruh data di sisi klien menggunakan localStorage tanpa server.
3. THE Dashboard SHALL didukung oleh browser modern Chrome, Firefox, Edge, dan Safari.
4. THE Dashboard SHALL menggunakan satu file CSS yang berada di direktori css/ dan satu file JavaScript yang berada di direktori js/.
5. THE Dashboard SHALL menyajikan antarmuka minimal yang bersih, dengan waktu muat cepat, tata letak responsif, dan tipografi yang mudah dibaca.
