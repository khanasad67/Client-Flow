/**
 * ClientFlow CRM - Customer 360 Detail View Controller
 * 
 * Manages customer profile, associated deals, follow-up tasks,
 * and chronological interaction timeline logging.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('customers');
  CustomerDetail.init();
});

const CustomerDetail = {
  customerId: null,
  customer: null,

  init() {
    const params = new URLSearchParams(window.location.search);
    this.customerId = params.get('id');

    if (!this.customerId) {
      window.location.href = 'customers.html';
      return;
    }

    this.customer = Storage.getCustomer(this.customerId);
    if (!this.customer) {
      App.toast('Customer not found', 'danger');
      setTimeout(() => window.location.href = 'customers.html', 1000);
      return;
    }

    this.renderProfile();
    this.renderTimeline();
    this.renderAssociatedDeals();
    this.renderAssociatedTasks();
    this.bindEvents();
  },

  bindEvents() {
    // Interaction Modal Open / Close
    const btnAddInt = document.getElementById('btn-add-interaction');
    const modalBackdrop = document.getElementById('interaction-modal-backdrop');
    const btnCloseModal = document.getElementById('btn-close-int-modal');
    const btnCancelModal = document.getElementById('btn-cancel-int-modal');

    if (btnAddInt) {
      btnAddInt.addEventListener('click', () => {
        document.getElementById('interaction-form').reset();
        document.getElementById('int-date').value = new Date().toISOString().split('T')[0];
        modalBackdrop.classList.add('active');
      });
    }

    const closeModal = () => modalBackdrop.classList.remove('active');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Form Submit
    const form = document.getElementById('interaction-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleInteractionSubmit(e));
    }

    // Add task shortcut for this customer
    const btnAddTask = document.getElementById('btn-add-cust-task');
    if (btnAddTask) {
      btnAddTask.addEventListener('click', () => {
        window.location.href = `followups.html?action=new&related=${encodeURIComponent(this.customer.name + ' (' + this.customer.company + ')')}`;
      });
    }
  },

  renderProfile() {
    const c = this.customer;
    document.title = `${c.name} — Customer 360 | ClientFlow`;

    document.getElementById('cust-header-name').textContent = c.name;
    document.getElementById('cust-header-company').textContent = c.company;
    document.getElementById('cust-avatar-initial').textContent = (c.name || 'C').charAt(0).toUpperCase();

    document.getElementById('profile-name').textContent = c.name;
    document.getElementById('profile-company').textContent = c.company;
    document.getElementById('profile-email').textContent = c.email || '—';
    document.getElementById('profile-phone').textContent = c.phone || '—';
    document.getElementById('profile-address').textContent = c.address || 'No address provided';
    document.getElementById('profile-created').textContent = App.formatDate(c.createdAt);
    document.getElementById('profile-notes').textContent = c.notes || 'No notes available.';
  },

  renderTimeline() {
    const interactions = Storage.getInteractions(this.customerId);
    const container = document.getElementById('interaction-timeline-container');
    if (!container) return;

    if (interactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem 0;">
          <p class="empty-state-title">No interactions logged yet</p>
          <p class="empty-state-text">Record phone calls, meetings, or emails with this customer.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = interactions.map(item => {
      let iconColor = '#3b82f6';
      if (item.type === 'Meeting') iconColor = '#10b981';
      if (item.type === 'Call') iconColor = '#8b5cf6';
      if (item.type === 'Email') iconColor = '#f59e0b';

      return `
        <div class="timeline-item">
          <div class="timeline-bullet" style="border-color:${iconColor};">
            <div class="timeline-bullet-inner" style="background:${iconColor};"></div>
          </div>
          <div class="timeline-card">
            <div class="timeline-header">
              <span class="timeline-type" style="color:${iconColor};">${item.type}</span>
              <span class="timeline-date">${item.date}</span>
            </div>
            <p class="timeline-notes">${item.notes}</p>
          </div>
        </div>
      `;
    }).join('');
  },

  renderAssociatedDeals() {
    const deals = Storage.getDeals();
    const relatedDeals = deals.filter(d => d.customerId === this.customerId || (d.customerName && d.customerName.includes(this.customer.name)));
    const container = document.getElementById('cust-deals-list');
    if (!container) return;

    if (relatedDeals.length === 0) {
      container.innerHTML = '<p style="font-size:0.875rem; color:var(--text-muted); padding:0.5rem 0;">No active deals currently attached.</p>';
      return;
    }

    container.innerHTML = relatedDeals.map(d => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--border-light);">
        <div>
          <div style="font-size:0.875rem; font-weight:600; color:var(--text-main);">${d.title}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Closing: ${App.formatDate(d.closingDate)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700; color:var(--primary); font-size:0.9375rem;">${App.formatCurrency(d.value)}</div>
          <span class="badge badge-${d.stage.toLowerCase()}">${d.stage}</span>
        </div>
      </div>
    `).join('');
  },

  renderAssociatedTasks() {
    const tasks = Storage.getTasks();
    const relatedTasks = tasks.filter(t => t.relatedTo && (t.relatedTo.includes(this.customer.name) || t.relatedTo.includes(this.customer.company)));
    const container = document.getElementById('cust-tasks-list');
    if (!container) return;

    if (relatedTasks.length === 0) {
      container.innerHTML = '<p style="font-size:0.875rem; color:var(--text-muted); padding:0.5rem 0;">No follow-ups scheduled for this customer.</p>';
      return;
    }

    container.innerHTML = relatedTasks.map(t => {
      const isCompleted = t.status === 'completed';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--border-light); ${isCompleted ? 'opacity:0.6;' : ''}">
          <div>
            <div style="font-size:0.875rem; font-weight:600; ${isCompleted ? 'text-decoration:line-through;' : ''}">${t.title}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Due: ${App.formatDate(t.dueDate)} • ${t.priority} Priority</div>
          </div>
          <span class="badge ${isCompleted ? 'badge-won' : 'badge-new'}">${t.status}</span>
        </div>
      `;
    }).join('');
  },

  handleInteractionSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('int-type').value;
    const dateInput = document.getElementById('int-date').value;
    const notes = document.getElementById('int-notes').value.trim();

    if (!notes) {
      App.toast('Please write interaction notes', 'danger');
      return;
    }

    const formattedDate = dateInput 
      ? new Date(dateInput).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    Storage.saveInteraction({
      customerId: this.customerId,
      type,
      date: formattedDate,
      notes
    });

    document.getElementById('interaction-modal-backdrop').classList.remove('active');
    App.toast('Interaction logged to timeline!', 'success');
    this.renderTimeline();
  }
};
