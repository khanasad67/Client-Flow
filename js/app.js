/**
 * ClientFlow CRM - Shared Application Utilities
 * 
 * Handles authentication checks, sidebar navigation, toast alerts,
 * confirmation modals, and common UI helpers.
 */

const App = {
  // Initialize shared page components
  init(currentPage = '') {
    this.checkAuth(currentPage);
    this.setupSidebar(currentPage);
    this.setupToasts();
    this.setupConfirmModal();
    this.renderUserProfile();
    this.updateSidebarBadges();
  },

  // Auth Guard
  checkAuth(currentPage) {
    const user = Storage.getAuth();
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';

    if (!user && !isLoginPage) {
      window.location.href = 'index.html';
    } else if (user && isLoginPage) {
      window.location.href = 'dashboard.html';
    }
  },

  // Logout Handler
  logout() {
    Storage.clearAuth();
    window.location.href = 'index.html';
  },

  // Sidebar Setup & Mobile Drawer
  setupSidebar(currentPage) {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    // Mark current active nav item
    if (currentPage) {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        if (item.dataset.page === currentPage) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // Attach Reset Demo Data listener if button exists
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        App.confirm(
          'Reset to Sample Data?',
          'This will restore default demo leads, customers, deals, and follow-ups. Any custom changes will be overwritten.',
          () => {
            Storage.resetToSampleData();
            App.toast('Demo data restored successfully!', 'success');
            setTimeout(() => window.location.reload(), 600);
          }
        );
      });
    }

    // Attach Logout listener
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        App.logout();
      });
    }
  },

  // Update real-time counter badges in the sidebar
  updateSidebarBadges() {
    const stats = Storage.getDashboardStats();
    const leadsBadge = document.getElementById('sidebar-leads-badge');
    const tasksBadge = document.getElementById('sidebar-tasks-badge');

    if (leadsBadge) leadsBadge.textContent = stats.totalLeads;
    if (tasksBadge) tasksBadge.textContent = stats.pendingTasks;
  },

  // Render Logged In User Info
  renderUserProfile() {
    const user = Storage.getAuth();
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    if (user && nameEl) {
      nameEl.textContent = user.name || 'Sales Executive';
      if (roleEl) roleEl.textContent = user.role || 'Administrator';
      if (avatarEl) avatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();
    }
  },

  // Toast System
  setupToasts() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon mapping
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem;">
        ${iconSvg}
        <span class="toast-message">${message}</span>
      </div>
      <button style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;line-height:1;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Confirmation Modal
  setupConfirmModal() {
    if (document.getElementById('confirm-modal-backdrop')) return;

    const modalHtml = `
      <div id="confirm-modal-backdrop" class="modal-backdrop">
        <div class="modal-dialog" style="max-width: 420px;">
          <div class="modal-header">
            <h3 id="confirm-modal-title" class="modal-title">Confirm Action</h3>
            <button id="btn-close-confirm" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-modal-message" style="color: var(--text-muted); font-size: 0.9375rem; line-height: 1.5;"></p>
          </div>
          <div class="modal-footer">
            <button id="btn-cancel-confirm" class="btn btn-secondary btn-sm">Cancel</button>
            <button id="btn-proceed-confirm" class="btn btn-danger btn-sm">Proceed</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const backdrop = document.getElementById('confirm-modal-backdrop');
    const closeBtn = document.getElementById('btn-close-confirm');
    const cancelBtn = document.getElementById('btn-cancel-confirm');

    const closeModal = () => backdrop.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  },

  confirm(title, message, onConfirmCallback) {
    const backdrop = document.getElementById('confirm-modal-backdrop');
    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-message');
    const proceedBtn = document.getElementById('btn-proceed-confirm');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    // Remove old listeners to avoid multiple firings
    const newProceedBtn = proceedBtn.cloneNode(true);
    proceedBtn.parentNode.replaceChild(newProceedBtn, proceedBtn);

    newProceedBtn.addEventListener('click', () => {
      backdrop.classList.remove('active');
      if (typeof onConfirmCallback === 'function') {
        onConfirmCallback();
      }
    });

    backdrop.classList.add('active');
  },

  // Currency & Date formatters
  formatCurrency(num) {
    return '$' + Number(num || 0).toLocaleString('en-US');
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};
