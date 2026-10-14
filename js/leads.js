/**
 * ClientFlow CRM - Leads Management Controller
 * 
 * Full CRUD, search, status/priority filtering, and lead conversion.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('leads');
  LeadsManager.init();
});

const LeadsManager = {
  currentFilterStatus: 'All',
  currentFilterPriority: 'All',
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderLeads();

    // Check if URL specifies action=new
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      this.openLeadModal();
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('lead-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderLeads();
      });
    }

    // Status Filter
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.currentFilterStatus = e.target.value;
        this.renderLeads();
      });
    }

    // Priority Filter
    const filterPriority = document.getElementById('filter-priority');
    if (filterPriority) {
      filterPriority.addEventListener('change', (e) => {
        this.currentFilterPriority = e.target.value;
        this.renderLeads();
      });
    }

    // Add Lead Button
    const btnAdd = document.getElementById('btn-add-lead');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openLeadModal());
    }

    // Modal Close buttons
    const modalBackdrop = document.getElementById('lead-modal-backdrop');
    const btnCloseModal = document.getElementById('btn-close-lead-modal');
    const btnCancelModal = document.getElementById('btn-cancel-lead-modal');

    const closeModal = () => modalBackdrop.classList.remove('active');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Form Submit
    const form = document.getElementById('lead-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Details Modal Close
    const detailsBackdrop = document.getElementById('lead-details-modal-backdrop');
    const btnCloseDetails = document.getElementById('btn-close-details-modal');
    if (btnCloseDetails && detailsBackdrop) {
      btnCloseDetails.addEventListener('click', () => detailsBackdrop.classList.remove('active'));
    }
  },

  renderLeads() {
    const leads = Storage.getLeads();
    const tbody = document.getElementById('leads-table-body');
    const emptyState = document.getElementById('leads-empty-state');
    const countBadge = document.getElementById('leads-count-badge');

    // Apply search and filters
    const filtered = leads.filter(lead => {
      const matchesSearch = 
        !this.searchQuery ||
        (lead.name && lead.name.toLowerCase().includes(this.searchQuery)) ||
        (lead.email && lead.email.toLowerCase().includes(this.searchQuery)) ||
        (lead.company && lead.company.toLowerCase().includes(this.searchQuery));

      const matchesStatus = this.currentFilterStatus === 'All' || lead.status === this.currentFilterStatus;
      const matchesPriority = this.currentFilterPriority === 'All' || lead.priority === this.currentFilterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${leads.length}`;
    }

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(lead => {
      const statusClass = `badge-${lead.status.toLowerCase()}`;
      const priorityClass = `badge-priority-${(lead.priority || 'medium').toLowerCase()}`;
      const isConverted = lead.status === 'Converted';

      return `
        <tr>
          <td>
            <div class="table-cell-title">${lead.name}</div>
            <div class="table-cell-subtitle">${lead.email || 'No email'}</div>
          </td>
          <td>
            <strong>${lead.company || '—'}</strong>
            <div class="table-cell-subtitle">${lead.phone || '—'}</div>
          </td>
          <td><span style="font-size:0.8125rem; font-weight:500; color:var(--text-muted);">${lead.source || 'Website'}</span></td>
          <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${lead.status}</span></td>
          <td><span class="badge ${priorityClass}">${lead.priority || 'Medium'}</span></td>
          <td style="font-size:0.8125rem;">${App.formatDate(lead.followUpDate)}</td>
          <td>
            <div class="table-actions">
              <button class="btn-icon" title="View Details" onclick="LeadsManager.openDetailsModal('${lead.id}')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="btn-icon" title="Edit Lead" onclick="LeadsManager.openLeadModal('${lead.id}')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              ${!isConverted ? `
                <button class="btn-icon" title="Convert to Customer" style="color:var(--status-won);" onclick="LeadsManager.convertLead('${lead.id}')">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                </button>
              ` : ''}
              <button class="btn-icon btn-icon-danger" title="Delete Lead" onclick="LeadsManager.deleteLead('${lead.id}', '${lead.name.replace(/'/g, "\\'")}')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openLeadModal(id = null) {
    const modalBackdrop = document.getElementById('lead-modal-backdrop');
    const modalTitle = document.getElementById('lead-modal-title');
    const form = document.getElementById('lead-form');

    form.reset();
    document.getElementById('lead-id').value = '';

    if (id) {
      modalTitle.textContent = 'Edit Lead';
      const lead = Storage.getLead(id);
      if (lead) {
        document.getElementById('lead-id').value = lead.id;
        document.getElementById('lead-name').value = lead.name || '';
        document.getElementById('lead-email').value = lead.email || '';
        document.getElementById('lead-phone').value = lead.phone || '';
        document.getElementById('lead-company').value = lead.company || '';
        document.getElementById('lead-source').value = lead.source || 'Website';
        document.getElementById('lead-status').value = lead.status || 'New';
        document.getElementById('lead-priority').value = lead.priority || 'Medium';
        document.getElementById('lead-followup').value = lead.followUpDate || '';
        document.getElementById('lead-notes').value = lead.notes || '';
      }
    } else {
      modalTitle.textContent = 'Add New Lead';
      document.getElementById('lead-status').value = 'New';
      document.getElementById('lead-priority').value = 'Medium';
      document.getElementById('lead-source').value = 'Website';
    }

    modalBackdrop.classList.add('active');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('lead-id').value;
    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const company = document.getElementById('lead-company').value.trim();
    const source = document.getElementById('lead-source').value;
    const status = document.getElementById('lead-status').value;
    const priority = document.getElementById('lead-priority').value;
    const followUpDate = document.getElementById('lead-followup').value;
    const notes = document.getElementById('lead-notes').value.trim();

    if (!name || !email || !company) {
      App.toast('Please fill in all required fields (Name, Email, Company)', 'danger');
      return;
    }

    const leadData = {
      ...(id ? { id } : {}),
      name,
      email,
      phone,
      company,
      source,
      status,
      priority,
      followUpDate,
      notes
    };

    Storage.saveLead(leadData);
    document.getElementById('lead-modal-backdrop').classList.remove('active');
    App.toast(id ? 'Lead updated successfully!' : 'New lead created successfully!', 'success');
    this.renderLeads();
    App.updateSidebarBadges();
  },

  deleteLead(id, name) {
    App.confirm(
      'Delete Lead?',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      () => {
        Storage.deleteLead(id);
        App.toast('Lead removed successfully.', 'info');
        this.renderLeads();
        App.updateSidebarBadges();
      }
    );
  },

  convertLead(id) {
    const lead = Storage.getLead(id);
    if (!lead) return;

    App.confirm(
      'Convert Lead to Customer?',
      `This will mark "${lead.name}" as converted and create an active customer profile under "${lead.company}".`,
      () => {
        const customer = Storage.convertLeadToCustomer(id);
        if (customer) {
          App.toast(`Lead converted to customer!`, 'success');
          this.renderLeads();
          App.updateSidebarBadges();
        }
      }
    );
  },

  openDetailsModal(id) {
    const lead = Storage.getLead(id);
    if (!lead) return;

    const modalBackdrop = document.getElementById('lead-details-modal-backdrop');
    const content = document.getElementById('lead-details-content');

    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 1.25rem;">
        <div>
          <h2 style="font-size:1.35rem; font-weight:700; color:var(--text-main);">${lead.name}</h2>
          <div style="font-size:0.9rem; color:var(--text-muted); font-weight:500;">${lead.company}</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <span class="badge badge-${lead.status.toLowerCase()}">${lead.status}</span>
          <span class="badge badge-priority-${(lead.priority || 'medium').toLowerCase()}">${lead.priority} Priority</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem; background:#f8fafc; padding:1rem; border-radius:var(--radius-sm);">
        <div>
          <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase; font-weight:600;">Email</div>
          <div style="font-size:0.875rem; font-weight:500; color:var(--text-main);">${lead.email || '—'}</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase; font-weight:600;">Phone</div>
          <div style="font-size:0.875rem; font-weight:500; color:var(--text-main);">${lead.phone || '—'}</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase; font-weight:600;">Lead Source</div>
          <div style="font-size:0.875rem; font-weight:500; color:var(--text-main);">${lead.source || 'Website'}</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase; font-weight:600;">Next Follow-up</div>
          <div style="font-size:0.875rem; font-weight:500; color:var(--text-main);">${App.formatDate(lead.followUpDate)}</div>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <div style="font-size:0.8125rem; font-weight:700; color:var(--text-main); margin-bottom:0.35rem;">Notes & Requirements</div>
        <p style="font-size:0.875rem; color:var(--text-muted); line-height:1.6; background:white; border:1px solid var(--border-color); padding:0.875rem; border-radius:var(--radius-sm);">
          ${lead.notes ? lead.notes : 'No specific notes recorded for this lead.'}
        </p>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        ${lead.status !== 'Converted' ? `
          <button class="btn btn-success btn-sm" onclick="document.getElementById('lead-details-modal-backdrop').classList.remove('active'); LeadsManager.convertLead('${lead.id}')">
            Convert to Customer
          </button>
        ` : ''}
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('lead-details-modal-backdrop').classList.remove('active'); LeadsManager.openLeadModal('${lead.id}')">
          Edit Lead
        </button>
      </div>
    `;

    modalBackdrop.classList.add('active');
  }
};
