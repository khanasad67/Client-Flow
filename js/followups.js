/**
 * ClientFlow CRM - Follow-ups & Tasks Controller
 * 
 * Task checklist management, pending/completed filter tabs,
 * due date tracking, and priority tagging.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('followups');
  FollowupsManager.init();
});

const FollowupsManager = {
  currentTab: 'all', // 'all', 'pending', 'today', 'completed'

  init() {
    this.bindEvents();
    this.renderTasks();

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      const prefillRelated = params.get('related');
      this.openTaskModal(null, prefillRelated);
    }
  },

  bindEvents() {
    // Filter Tabs
    const tabBtns = document.querySelectorAll('.task-filter-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('btn-primary'));
        tabBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        this.currentTab = btn.dataset.tab;
        this.renderTasks();
      });
    });

    // Add Task Button
    const btnAdd = document.getElementById('btn-add-task');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openTaskModal());
    }

    // Modal Close
    const modalBackdrop = document.getElementById('task-modal-backdrop');
    const btnCloseModal = document.getElementById('btn-close-task-modal');
    const btnCancelModal = document.getElementById('btn-cancel-task-modal');

    const closeModal = () => modalBackdrop.classList.remove('active');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Form Submit
    const form = document.getElementById('task-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  },

  renderTasks() {
    const tasks = Storage.getTasks();
    const container = document.getElementById('tasks-list-container');
    const emptyState = document.getElementById('tasks-empty-state');
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = tasks.filter(task => {
      if (this.currentTab === 'pending') {
        return task.status === 'pending';
      }
      if (this.currentTab === 'today') {
        return task.status === 'pending' && task.dueDate === todayStr;
      }
      if (this.currentTab === 'completed') {
        return task.status === 'completed';
      }
      return true; // 'all'
    });

    if (filtered.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(task => {
      const isCompleted = task.status === 'completed';
      const isToday = task.dueDate === todayStr && !isCompleted;
      const isOverdue = task.dueDate && task.dueDate < todayStr && !isCompleted;

      let dueBadge = '';
      if (isToday) {
        dueBadge = '<span class="task-due-today">● Due Today</span>';
      } else if (isOverdue) {
        dueBadge = '<span class="task-overdue">● Overdue</span>';
      } else if (task.dueDate) {
        dueBadge = `<span>Due: ${App.formatDate(task.dueDate)}</span>`;
      }

      const priorityClass = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;

      return `
        <div class="task-item ${isCompleted ? 'completed' : ''}">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${isCompleted ? 'checked' : ''} title="Toggle Completion">
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:0.35rem;">${task.description}</p>` : ''}
            <div class="task-meta">
              <span>
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${task.relatedTo || 'General Activity'}
              </span>
              ${dueBadge}
              <span class="badge ${priorityClass}">${task.priority || 'Medium'}</span>
              <span class="badge ${isCompleted ? 'badge-won' : 'badge-new'}">${task.status}</span>
            </div>
          </div>
          <div class="table-actions" style="margin-left:auto;">
            <button class="btn-icon" title="Edit Task" onclick="FollowupsManager.openTaskModal('${task.id}')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
            <button class="btn-icon btn-icon-danger" title="Delete Task" onclick="FollowupsManager.deleteTask('${task.id}', '${task.title.replace(/'/g, "\\'")}')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach checkbox events
    container.querySelectorAll('.task-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const updated = Storage.toggleTaskStatus(id);
        App.toast(updated.status === 'completed' ? 'Task completed!' : 'Task marked pending', 'info');
        this.renderTasks();
        App.updateSidebarBadges();
      });
    });
  },

  openTaskModal(id = null, prefillRelated = null) {
    const modalBackdrop = document.getElementById('task-modal-backdrop');
    const modalTitle = document.getElementById('task-modal-title');
    const form = document.getElementById('task-form');

    form.reset();
    document.getElementById('task-id').value = '';

    // Populate Datalist / Suggestions for Related Contact
    const datalist = document.getElementById('contacts-datalist');
    if (datalist) {
      const customers = Storage.getCustomers();
      const leads = Storage.getLeads();
      datalist.innerHTML = `
        ${customers.map(c => `<option value="${c.name} (${c.company})">`).join('')}
        ${leads.map(l => `<option value="${l.name} (${l.company})">`).join('')}
      `;
    }

    if (id) {
      modalTitle.textContent = 'Edit Follow-up Task';
      const task = Storage.getTasks().find(t => t.id === id);
      if (task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title || '';
        document.getElementById('task-related').value = task.relatedTo || '';
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-priority').value = task.priority || 'Medium';
        document.getElementById('task-desc').value = task.description || '';
      }
    } else {
      modalTitle.textContent = 'Add Follow-up Task';
      document.getElementById('task-priority').value = 'Medium';
      document.getElementById('task-due-date').value = new Date().toISOString().split('T')[0];
      if (prefillRelated) {
        document.getElementById('task-related').value = prefillRelated;
      }
    }

    modalBackdrop.classList.add('active');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value.trim();
    const relatedTo = document.getElementById('task-related').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const description = document.getElementById('task-desc').value.trim();

    if (!title) {
      App.toast('Please enter task title', 'danger');
      return;
    }

    const taskData = {
      ...(id ? { id } : {}),
      title,
      relatedTo,
      dueDate,
      priority,
      description
    };

    Storage.saveTask(taskData);
    document.getElementById('task-modal-backdrop').classList.remove('active');
    App.toast(id ? 'Task updated!' : 'Follow-up task scheduled!', 'success');
    this.renderTasks();
    App.updateSidebarBadges();
  },

  deleteTask(id, title) {
    App.confirm(
      'Delete Follow-up Task?',
      `Are you sure you want to delete "${title}"?`,
      () => {
        Storage.deleteTask(id);
        App.toast('Task deleted.', 'info');
        this.renderTasks();
        App.updateSidebarBadges();
      }
    );
  }
};
