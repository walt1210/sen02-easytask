// ── Modal ──
  function openModal()  { document.getElementById('modalBackdrop').classList.add('show'); }
  function closeModal() { document.getElementById('modalBackdrop').classList.remove('show'); }
  function closeModalOutside(e) {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  }
  function saveTask() {
    const input = document.querySelector('.modal-box input[type="text"]');
    const title = input.value.trim();
    if (!title) { input.style.borderColor = 'var(--et-accent)'; return; }
    addTaskToList(title);
    input.value = '';
    closeModal();
  }

  // ── Task CRUD ──
  function addTaskToList(title) {
    const list = document.getElementById('taskList');
    const item = document.createElement('div');
    item.className = 'task-item'; item.dataset.tag = 'work';
    item.innerHTML = `
      <div class="task-priority priority-med"></div>
      <div class="task-check" onclick="toggleCheck(this)"></div>
      <div class="task-body">
        <div class="task-title">${title}</div>
        <div class="task-meta">
          <span class="task-due"><i class="bi bi-clock"></i> Today</span>
          <span class="task-tag work">Work</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn"><i class="bi bi-pencil"></i></button>
        <button class="task-action-btn delete" onclick="this.closest('.task-item').remove()"><i class="bi bi-trash"></i></button>
      </div>`;
    list.prepend(item);
  }

  function toggleCheck(el) {
    el.classList.toggle('checked');
    el.closest('.task-item').classList.toggle('completed');
  }

  // ── Filter tabs ──
  function filterTasks(btn, tag) {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.task-item').forEach(item => {
      item.style.display = (tag === 'all' || item.dataset.tag === tag) ? 'flex' : 'none';
    });
  }

  // ── Tag select in modal ──
  function selectTag(btn, tag) {
    document.querySelectorAll('.tag-opt').forEach(b => b.className = 'tag-opt');
    btn.classList.add('active-' + tag);
  }

  // ── Energy ──
  function setEnergy(btn) {
    document.querySelectorAll('.energy-btn').forEach(b => {
      b.classList.remove('active-high','active-mid','active-low');
    });
    const labels = { '🔥 High':'high', '⚡ Medium':'mid', '🌿 Low':'low' };
    const key = Object.keys(labels).find(k => btn.textContent.includes(k.replace(/\s.*/,'')));
    const cls = Object.values(labels)[Object.keys(labels).indexOf(key)];
    btn.classList.add('active-' + cls);
    const info = document.querySelector('.energy-info');
    const map = {
      high: '<strong>High energy</strong> — showing deep-work tasks first',
      mid:  '<strong>Medium energy</strong> — balanced task suggestions',
      low:  '<strong>Low energy</strong> — showing lighter tasks first',
    };
    info.innerHTML = map[cls] || map.high;
  }