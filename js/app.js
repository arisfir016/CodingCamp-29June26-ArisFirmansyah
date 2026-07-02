/* ============================================================
   PRODASH — Dashboard Produktivitas
   js/app.js
   ============================================================
   Fitur MVP:
     • Greeting (jam, tanggal, ucapan otomatis)
     • Focus Timer (Pomodoro, start/stop/reset)
     • To-Do List (tambah, edit, checklist, hapus, Local Storage)
     • Quick Links (tambah, hapus, Local Storage)

   Fitur Tantangan:
     1. Light / Dark Mode (simpan ke Local Storage)
     2. Custom Name in Greeting (simpan ke Local Storage)
     3. Custom Pomodoro Duration (simpan ke Local Storage)
     4. Prevent Duplicate Tasks (validasi + notifikasi)
     5. Sort Tasks (A-Z & status)
   ============================================================ */

'use strict';

/* ── UTILITY: Local Storage helpers ──────────────────────────── */
const storage = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

/* ── STORAGE KEYS ─────────────────────────────────────────────── */
const KEYS = {
  THEME:    'prodash_theme',
  NAME:     'prodash_name',
  DURATION: 'prodash_duration',
  TODOS:    'prodash_todos',
  LINKS:    'prodash_links',
};

/* ============================================================
   MODULE 1 — THEME TOGGLE
   ============================================================ */
const ThemeModule = (() => {
  const html       = document.documentElement;
  const toggleBtn  = document.getElementById('themeToggle');
  const themeIcon  = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  const LIGHT = 'light';
  const DARK  = 'dark';

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    if (theme === DARK) {
      themeIcon.textContent  = '☀️';
      themeLabel.textContent = 'Light Mode';
    } else {
      themeIcon.textContent  = '🌙';
      themeLabel.textContent = 'Dark Mode';
    }
    storage.set(KEYS.THEME, theme);
  }

  function toggle() {
    const current = html.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  function init() {
    const saved = storage.get(KEYS.THEME, LIGHT);
    apply(saved);
    toggleBtn.addEventListener('click', toggle);
  }

  return { init };
})();

/* ============================================================
   MODULE 2 — GREETING (Clock + Date + Name)
   ============================================================ */
const GreetingModule = (() => {
  const timeEl    = document.getElementById('greetingTime');
  const textEl    = document.getElementById('greetingText');
  const dateEl    = document.getElementById('greetingDate');
  const nameInput = document.getElementById('nameInput');
  const saveBtn   = document.getElementById('saveNameBtn');

  const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ];

  function getGreeting(hour) {
    if (hour >= 5  && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now    = new Date();
    const hour   = now.getHours();
    const minute = now.getMinutes();

    // Clock
    timeEl.textContent = `${pad2(hour)}:${pad2(minute)}`;

    // Greeting text
    const name    = storage.get(KEYS.NAME, '');
    const greet   = getGreeting(hour);
    textEl.textContent = name ? `${greet}, ${name}!` : `${greet}!`;

    // Date
    const dayName   = DAYS[now.getDay()];
    const dateNum   = now.getDate();
    const monthName = MONTHS[now.getMonth()];
    const year      = now.getFullYear();
    dateEl.textContent = `${dayName}, ${dateNum} ${monthName} ${year}`;
  }

  function saveName() {
    const val = nameInput.value.trim();
    storage.set(KEYS.NAME, val);
    tick(); // refresh immediately
  }

  function init() {
    const savedName = storage.get(KEYS.NAME, '');
    nameInput.value = savedName;
    tick();
    setInterval(tick, 1000); // update every second

    saveBtn.addEventListener('click', saveName);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveName();
    });
  }

  return { init };
})();

/* ============================================================
   MODULE 3 — FOCUS TIMER (Pomodoro)
   ============================================================ */
const TimerModule = (() => {
  const minutesEl   = document.getElementById('timerMinutes');
  const secondsEl   = document.getElementById('timerSeconds');
  const displayEl   = document.getElementById('timerDisplay');
  const progressBar = document.getElementById('timerProgressBar');
  const statusEl    = document.getElementById('timerStatus');
  const startBtn    = document.getElementById('startBtn');
  const stopBtn     = document.getElementById('stopBtn');
  const resetBtn    = document.getElementById('resetBtn');
  const durationIn  = document.getElementById('durationInput');
  const setDurBtn   = document.getElementById('setDurationBtn');
  const toastEl     = document.getElementById('timerToast');

  let totalSeconds   = 0;   // total seconds for the session
  let remaining      = 0;   // seconds remaining
  let intervalId     = null;
  let isRunning      = false;

  function pad2(n) { return String(n).padStart(2, '0'); }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 4000);
  }

  function updateDisplay() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    minutesEl.textContent = pad2(m);
    secondsEl.textContent = pad2(s);

    // Progress bar
    const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 100;
    progressBar.style.width = pct + '%';
  }

  function updateButtons() {
    startBtn.disabled = isRunning;
    stopBtn.disabled  = !isRunning;
  }

  function setStatus(msg) { statusEl.textContent = msg; }

  function applyDuration(minutes) {
    const mins = Math.max(1, Math.min(120, parseInt(minutes, 10) || 25));
    totalSeconds = mins * 60;
    remaining    = totalSeconds;
    durationIn.value = mins;
    storage.set(KEYS.DURATION, mins);
    updateDisplay();
    displayEl.classList.remove('running', 'done');
    setStatus('Siap untuk fokus!');
  }

  function start() {
    if (isRunning || remaining === 0) return;
    isRunning = true;
    displayEl.classList.add('running');
    displayEl.classList.remove('done');
    setStatus('⏳ Sedang fokus...');
    updateButtons();

    intervalId = setInterval(() => {
      remaining--;
      updateDisplay();

      if (remaining <= 0) {
        clearInterval(intervalId);
        isRunning = false;
        displayEl.classList.remove('running');
        displayEl.classList.add('done');
        setStatus('✅ Sesi selesai! Istirahat sejenak.');
        updateButtons();
        showToast('🎉 Sesi fokus selesai! Saatnya istirahat.');
      }
    }, 1000);
  }

  function stop() {
    if (!isRunning) return;
    clearInterval(intervalId);
    isRunning = false;
    displayEl.classList.remove('running');
    setStatus('⏸ Dijeda. Klik Start untuk lanjut.');
    updateButtons();
  }

  function reset() {
    clearInterval(intervalId);
    isRunning = false;
    const mins = parseInt(durationIn.value, 10) || 25;
    applyDuration(mins);
    updateButtons();
  }

  function init() {
    const savedDuration = storage.get(KEYS.DURATION, 25);
    durationIn.value = savedDuration;
    applyDuration(savedDuration);

    startBtn.addEventListener('click', start);
    stopBtn.addEventListener('click', stop);
    resetBtn.addEventListener('click', reset);

    setDurBtn.addEventListener('click', () => {
      if (isRunning) {
        stop();
      }
      applyDuration(durationIn.value);
    });

    durationIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (isRunning) stop();
        applyDuration(durationIn.value);
      }
    });
  }

  return { init };
})();

/* ============================================================
   MODULE 4 — TO-DO LIST
   ============================================================ */
const TodoModule = (() => {
  const listEl    = document.getElementById('todoList');
  const inputEl   = document.getElementById('todoInput');
  const addBtn    = document.getElementById('addTodoBtn');
  const emptyEl   = document.getElementById('todoEmpty');
  const countEl   = document.getElementById('todoCount');
  const notifEl   = document.getElementById('todoNotification');
  const sortAlpha = document.getElementById('sortAlphaBtn');
  const sortStat  = document.getElementById('sortStatusBtn');

  // Edit modal
  const editModal   = document.getElementById('editModal');
  const editInput   = document.getElementById('editInput');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEdit  = document.getElementById('cancelEditBtn');

  let todos         = [];     // array of { id, text, completed }
  let editingId     = null;
  let notifTimer    = null;

  /* ── Helpers ── */
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function save() { storage.set(KEYS.TODOS, todos); }

  function showNotif(msg, type = 'error') {
    clearTimeout(notifTimer);
    notifEl.textContent = (type === 'error' ? '⚠️ ' : '✅ ') + msg;
    notifEl.className   = `notification ${type}`;
    notifTimer = setTimeout(() => {
      notifEl.className = 'notification';
    }, 3000);
  }

  function updateMeta() {
    const total  = todos.length;
    const done   = todos.filter(t => t.completed).length;
    emptyEl.style.display = total === 0 ? 'block' : 'none';
    countEl.textContent   = total > 0
      ? `${done} dari ${total} tugas selesai`
      : '';
  }

  /* ── Render ── */
  function renderTodos(list) {
    listEl.innerHTML = '';

    list.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;
      li.dataset.id = todo.id;

      // Checkbox
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked   = todo.completed;
      cb.addEventListener('change', () => toggleTodo(todo.id));

      // Text
      const span = document.createElement('span');
      span.className   = 'todo-text';
      span.textContent = todo.text;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon btn-icon--edit';
      editBtn.title     = 'Edit tugas';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => openEdit(todo.id, todo.text));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-icon btn-icon--delete';
      delBtn.title     = 'Hapus tugas';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => deleteTodo(todo.id));

      actions.append(editBtn, delBtn);
      li.append(cb, span, actions);
      listEl.appendChild(li);
    });

    updateMeta();
  }

  function render() { renderTodos(todos); }

  /* ── CRUD ── */
  function addTodo() {
    const text = inputEl.value.trim();
    if (!text) { showNotif('Tugas tidak boleh kosong!'); return; }

    // Challenge 4: Prevent duplicates (case-insensitive)
    const duplicate = todos.some(
      t => t.text.toLowerCase() === text.toLowerCase()
    );
    if (duplicate) {
      showNotif(`Tugas "${text}" sudah ada dalam daftar!`);
      return;
    }

    todos.push({ id: genId(), text, completed: false });
    save();
    render();
    inputEl.value = '';
    inputEl.focus();
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      save();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  /* ── Edit Modal ── */
  function openEdit(id, text) {
    editingId         = id;
    editInput.value   = text;
    editModal.classList.add('open');
    setTimeout(() => editInput.focus(), 80);
  }

  function closeEdit() {
    editModal.classList.remove('open');
    editingId = null;
  }

  function saveEdit() {
    const newText = editInput.value.trim();
    if (!newText) return;

    // Check duplicate excluding the item being edited
    const duplicate = todos.some(
      t => t.id !== editingId &&
           t.text.toLowerCase() === newText.toLowerCase()
    );
    if (duplicate) {
      showNotif(`Tugas "${newText}" sudah ada!`);
      return;
    }

    const todo = todos.find(t => t.id === editingId);
    if (todo) {
      todo.text = newText;
      save();
      render();
    }
    closeEdit();
  }

  /* ── Challenge 5: Sort ── */
  function sortAlphaAZ() {
    todos = [...todos].sort((a, b) =>
      a.text.localeCompare(b.text, 'id', { sensitivity: 'base' })
    );
    save();
    render();
  }

  function sortByStatus() {
    // Belum selesai di atas, sudah selesai di bawah. Dalam grup → alphabetical.
    todos = [...todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.text.localeCompare(b.text, 'id', { sensitivity: 'base' });
    });
    save();
    render();
  }

  /* ── Init ── */
  function init() {
    todos = storage.get(KEYS.TODOS, []);
    render();

    addBtn.addEventListener('click', addTodo);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTodo();
    });

    saveEditBtn.addEventListener('click', saveEdit);
    cancelEdit.addEventListener('click', closeEdit);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') closeEdit();
    });

    // Close modal on overlay click
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEdit();
    });

    sortAlpha.addEventListener('click', sortAlphaAZ);
    sortStat.addEventListener('click', sortByStatus);
  }

  return { init };
})();

/* ============================================================
   MODULE 5 — QUICK LINKS
   ============================================================ */
const LinksModule = (() => {
  const gridEl    = document.getElementById('linksGrid');
  const emptyEl   = document.getElementById('linksEmpty');
  const nameInput = document.getElementById('linkNameInput');
  const urlInput  = document.getElementById('linkUrlInput');
  const addBtn    = document.getElementById('addLinkBtn');

  let links = [];   // array of { id, name, url }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function save() { storage.set(KEYS.LINKS, links); }

  function getFaviconUrl(url) {
    try {
      const origin = new URL(url).origin;
      return `https://www.google.com/s2/favicons?domain=${origin}&sz=64`;
    } catch {
      return '';
    }
  }

  function normalizeUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) return 'https://' + trimmed;
    return trimmed;
  }

  function render() {
    gridEl.innerHTML = '';
    emptyEl.style.display = links.length === 0 ? 'block' : 'none';

    links.forEach(link => {
      const anchor = document.createElement('a');
      anchor.className  = 'link-item';
      anchor.href       = link.url;
      anchor.target     = '_blank';
      anchor.rel        = 'noopener noreferrer';
      anchor.dataset.id = link.id;

      const favicon = document.createElement('img');
      favicon.className = 'link-favicon';
      favicon.src       = getFaviconUrl(link.url);
      favicon.alt       = link.name;
      favicon.onerror   = () => {
        favicon.style.display = 'none';
      };

      const label = document.createElement('span');
      label.className   = 'link-name';
      label.textContent = link.name;

      const delBtn = document.createElement('button');
      delBtn.className  = 'link-delete';
      delBtn.title      = 'Hapus link';
      delBtn.innerHTML  = '✕';
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteLink(link.id);
      });

      anchor.append(favicon, label, delBtn);
      gridEl.appendChild(anchor);
    });
  }

  function addLink() {
    const name = nameInput.value.trim();
    const url  = normalizeUrl(urlInput.value);

    if (!name) { alert('Masukkan nama situs.'); return; }
    if (!url)  { alert('Masukkan URL situs.'); return; }

    // Basic URL validation
    try { new URL(url); }
    catch { alert('URL tidak valid. Gunakan format: https://contoh.com'); return; }

    links.push({ id: genId(), name, url });
    save();
    render();
    nameInput.value = '';
    urlInput.value  = '';
    nameInput.focus();
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    save();
    render();
  }

  function init() {
    links = storage.get(KEYS.LINKS, []);
    render();

    addBtn.addEventListener('click', addLink);
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addLink();
    });
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') urlInput.focus();
    });
  }

  return { init };
})();

/* ============================================================
   BOOTSTRAP — Initialize all modules
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeModule.init();
  GreetingModule.init();
  TimerModule.init();
  TodoModule.init();
  LinksModule.init();
});
