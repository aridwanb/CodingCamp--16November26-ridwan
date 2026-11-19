/* ══════════════════════════════════════════════
   PERSONAL DASHBOARD — app.js
   Challenges implemented:
     ✅ Light / Dark mode
     ✅ Custom name in greeting
     ✅ Prevent duplicate tasks
     (+ Bonus: Change Pomodoro time, Sort tasks)
══════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────────── */

/** Read a value from localStorage; return fallback if missing. */
function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Write a value to localStorage. */
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ─────────────────────────────────────────────
   THEME — Light / Dark toggle (Challenge #1)
───────────────────────────────────────────── */

const themeBtn = document.getElementById('theme-toggle');

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

let isDark = lsGet('dashboard_dark', false);
applyTheme(isDark);

themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  applyTheme(isDark);
  lsSet('dashboard_dark', isDark);
});

/* ─────────────────────────────────────────────
   GREETING — time, date, custom name (Challenge #2)
───────────────────────────────────────────── */

const greetingMsg = document.getElementById('greeting-msg');
const datetimeEl  = document.getElementById('datetime');
const nameInput   = document.getElementById('name-input');
const nameSaveBtn = document.getElementById('name-save');

/** Returns "Good morning", "Good afternoon", or "Good evening" */
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Format: Wednesday, July 9, 2025 · 3:45 PM */
function formatDatetime() {
  return new Date().toLocaleString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
  });
}

function updateGreeting() {
  const name = lsGet('dashboard_name', '');
  const base = getTimeGreeting();
  greetingMsg.textContent = name ? `${base}, ${name}! 👋` : `${base}! 👋`;
  datetimeEl.textContent  = formatDatetime();
}

// Pre-fill saved name
nameInput.value = lsGet('dashboard_name', '');
updateGreeting();
setInterval(updateGreeting, 30_000); // refresh every 30 s

nameSaveBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });

function saveName() {
  const val = nameInput.value.trim();
  lsSet('dashboard_name', val);
  updateGreeting();
  // Brief visual feedback
  nameSaveBtn.textContent = '✓ Saved';
  setTimeout(() => { nameSaveBtn.textContent = 'Save'; }, 1500);
}

/* ─────────────────────────────────────────────
   FOCUS TIMER — 25-min Pomodoro (+ custom duration)
───────────────────────────────────────────── */

const timerDisplay  = document.getElementById('timer-display');
const timerDuration = document.getElementById('timer-duration');
const startBtn      = document.getElementById('timer-start');
const stopBtn       = document.getElementById('timer-stop');
const resetBtn      = document.getElementById('timer-reset');

let timerInterval = null;
let secondsLeft   = 25 * 60;
let timerRunning  = false;

function getConfiguredSeconds() {
  const mins = parseInt(timerDuration.value, 10);
  return (isNaN(mins) || mins < 1) ? 25 * 60 : mins * 60;
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsLeft);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  startBtn.disabled = true;
  timerDuration.disabled = true;

  timerInterval = setInterval(() => {
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      startBtn.disabled = false;
      timerDisplay.textContent = '00:00';
      // Notify user
      timerDisplay.style.color = 'var(--success)';
      if (Notification.permission === 'granted') {
        new Notification('Focus session complete! 🎉');
      } else {
        alert('⏰ Focus session complete!');
      }
      return;
    }
    secondsLeft--;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  startBtn.disabled = false;
}

function resetTimer() {
  stopTimer();
  timerDuration.disabled = false;
  secondsLeft = getConfiguredSeconds();
  timerDisplay.style.color = '';
  renderTimer();
}

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// When user changes the duration field, reset the timer immediately
timerDuration.addEventListener('change', () => {
  if (!timerRunning) {
    secondsLeft = getConfiguredSeconds();
    renderTimer();
  }
});

// Request notification permission on first interaction
document.addEventListener('click', () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, { once: true });

renderTimer();

/* ─────────────────────────────────────────────
   TO-DO LIST — add, edit, done, delete, sort
   Challenge #3: Prevent duplicate tasks
   Challenge #5: Sort tasks
───────────────────────────────────────────── */

const todoInput   = document.getElementById('todo-input');
const todoAddBtn  = document.getElementById('todo-add');
const todoList    = document.getElementById('todo-list');
const dupWarn     = document.getElementById('todo-dup-warn');
const sortBtns    = document.querySelectorAll('.sort-btn');

let tasks    = lsGet('dashboard_tasks', []);   // [{ id, text, done }]
let sortMode = 'default';

/** Persist tasks to localStorage */
function saveTasks() { lsSet('dashboard_tasks', tasks); }

/** Hide duplicate warning after 2.5 s */
let dupTimer = null;
function showDupWarn() {
  dupWarn.hidden = false;
  clearTimeout(dupTimer);
  dupTimer = setTimeout(() => { dupWarn.hidden = true; }, 2500);
}

/** Return tasks sorted according to current sortMode */
function getSortedTasks() {
  const copy = [...tasks];
  if (sortMode === 'az') {
    copy.sort((a, b) => a.text.localeCompare(b.text));
  } else if (sortMode === 'done') {
    copy.sort((a, b) => Number(a.done) - Number(b.done));
  }
  // 'default' keeps insertion order
  return copy;
}

/** Build and render the full task list */
function renderTasks() {
  todoList.innerHTML = '';
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'text-align:center;color:var(--text-secondary);padding:1rem;font-size:.9rem;';
    empty.textContent = 'No tasks yet — add one above!';
    todoList.appendChild(empty);
    return;
  }

  sorted.forEach((task) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'todo-check';
    check.checked = task.done;
    check.setAttribute('aria-label', `Mark "${task.text}" as done`);
    check.addEventListener('change', () => toggleDone(task.id));

    // Text span
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit task "${task.text}"`);
    editBtn.addEventListener('click', () => startEdit(task.id, li, span));

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn del';
    delBtn.textContent = '🗑️';
    delBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, delBtn);
    li.append(check, span, actions);
    todoList.appendChild(li);
  });
}

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  // ── Challenge #3: Prevent duplicate tasks (case-insensitive) ──
  const duplicate = tasks.some(
    (t) => t.text.toLowerCase() === text.toLowerCase()
  );
  if (duplicate) {
    showDupWarn();
    todoInput.select();
    return;
  }

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  todoInput.value = '';
  dupWarn.hidden = true;
}

function toggleDone(id) {
  tasks = tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function startEdit(id, li, span) {
  // Replace span with an input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-edit-input';
  input.value = span.textContent;
  input.maxLength = 120;
  li.replaceChild(input, span);
  input.focus();
  input.select();

  // Replace edit button with a save button
  const saveBtn = li.querySelector('.action-btn');
  saveBtn.textContent = '💾';
  saveBtn.setAttribute('aria-label', 'Save edit');

  const commit = () => finishEdit(id, input, li, span, saveBtn);
  saveBtn.onclick = commit;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') cancelEdit(li, input, span, saveBtn);
  });
  input.addEventListener('blur', commit);
}

function finishEdit(id, input, li, span, saveBtn) {
  const newText = input.value.trim();
  if (!newText) { cancelEdit(li, input, span, saveBtn); return; }

  // Prevent renaming to a duplicate (excluding itself)
  const duplicate = tasks.some(
    (t) => t.id !== id && t.text.toLowerCase() === newText.toLowerCase()
  );
  if (duplicate) {
    input.style.outlineColor = 'var(--danger)';
    showDupWarn();
    return;
  }

  tasks = tasks.map((t) => t.id === id ? { ...t, text: newText } : t);
  saveTasks();
  renderTasks();
}

function cancelEdit(li, input, span, saveBtn) {
  li.replaceChild(span, input);
  saveBtn.textContent = '✏️';
  saveBtn.setAttribute('aria-label', 'Edit task');
}

// Sort buttons
sortBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    sortBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    sortMode = btn.dataset.sort;
    renderTasks();
  });
});

todoAddBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

renderTasks();

/* ─────────────────────────────────────────────
   QUICK LINKS — add & delete, persisted
───────────────────────────────────────────── */

const linkName  = document.getElementById('link-name');
const linkUrl   = document.getElementById('link-url');
const linkAdd   = document.getElementById('link-add');
const linksGrid = document.getElementById('links-grid');

let links = lsGet('dashboard_links', [
  { id: 1, label: 'Google',   url: 'https://google.com'   },
  { id: 2, label: 'YouTube',  url: 'https://youtube.com'  },
  { id: 3, label: 'GitHub',   url: 'https://github.com'   },
]);

function saveLinks() { lsSet('dashboard_links', links); }

function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    linksGrid.innerHTML =
      '<p style="color:var(--text-secondary);font-size:.9rem;">No links saved yet.</p>';
    return;
  }

  links.forEach((link) => {
    // Wrapper (chip)
    const chip = document.createElement('div');
    chip.className = 'link-chip';
    chip.setAttribute('role', 'listitem');

    // The actual anchor
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.label;
    a.style.cssText = 'color:inherit;text-decoration:none;';

    // Delete button
    const del = document.createElement('button');
    del.className = 'link-chip-del';
    del.textContent = '×';
    del.setAttribute('aria-label', `Remove link ${link.label}`);
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLink(link.id);
    });

    chip.append(a, del);
    linksGrid.appendChild(chip);
  });
}

function addLink() {
  const label = linkName.value.trim();
  let   url   = linkUrl.value.trim();

  if (!label || !url) return;

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ id: Date.now(), label, url });
  saveLinks();
  renderLinks();
  linkName.value = '';
  linkUrl.value  = '';
}

function deleteLink(id) {
  links = links.filter((l) => l.id !== id);
  saveLinks();
  renderLinks();
}

linkAdd.addEventListener('click', addLink);
linkUrl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });

renderLinks();
