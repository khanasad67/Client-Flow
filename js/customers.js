/**
 * ClientFlow CRM - Customers Directory Controller
 * 
 * Manages existing customer accounts, search, and navigation to 360 profile.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('customers');
  CustomersManager.init();
});

const CustomersManager = {
  searchQuery: '',

  init() {
    this.bindEvents();
    this.renderCustomers();

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      this.openCustomerModal();
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCustomers();
      });
    }

    // Add Customer Button
    const btnAdd = document.getElementById('btn-add-customer');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openCustomerModal());
    }

    // Modal Close
    const modalBackdrop = document.getElementById('customer-modal-backdrop');
    const btnCloseModal = document.getElementById('btn-close-cust-modal');
    const btnCancelModal = document.getElementById('btn-cancel-cust-modal');

    const closeModal = () => modalBackdrop.classList.remove('active');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Form Submit
    const form = document.getElementById('customer-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  },

  renderCustomers() {
    const customers = Storage.getCustomers();
    const deals = Storage.getDeals();
    const tbody = document.getElementById('customers-table-body');
    const emptyState = document.getElementById('customers-empty-state');
    const countBadge = document.getElementById('customers-count-badge');

    const filtered = customers.filter(cust => {
      return !this.searchQuery ||
        (cust.name && cust.name.toLowerCase().includes(this.searchQuery)) ||
        (cust.company && cust.company.toLowerCase().includes(this.searchQuery)) ||
        (cust.email && cust.email.toLowerCase().includes(this.searchQuery));
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} customers`;
    }

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(cust => {
      // Find deals for this customer
      const custDeals = deals.filter(d => d.customerId === cust.id || (d.customerName && d.customerName.includes(cust.name)));
      const dealsCount = custDeals.length;
      const totalDealsVal = custDeals.reduce((s, d) => s + Number(d.value || 0), 0);

      return `
        <tr>
          <td>
            <a href="customer-detail.html?id=${cust.id}" class="table-cell-title" style="color:var(--primary);">${cust.name}</a>
            <div class="table-cell-subtitle">${cust.email || 'No email provided'}</div>
          </td>
          <td>
            <strong>${cust.company || '—'}</strong>
            <div class="table-cell-subtitle">${cust.phone || '—'}</div>
          </td>
          <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8125rem; color:var(--text-muted);">
            ${cust.address || '—'}
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-main); font-size:0.875rem;">${dealsCount} deals</div>
            <div class="table-cell-subtitle">${App.formatCurrency(totalDealsVal)}</div>
          </td>
          <td style="font-size:0.8125rem; color:var(--text-muted);">
            ${App.formatDate(cust.createdAt)}
          </td>
          <td>
            <div class="table-actions">
              <a href="customer-detail.html?id=${cust.id}" class="btn btn-secondary btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem;">
                View 360°
              </a>
              <button class="btn-icon" title="Edit Customer" onclick="CustomersManager.openCustomerModal('${cust.id}')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Delete Customer" onclick="CustomersManager.deleteCustomer('${cust.id}', '${cust.name.replace(/'/g, "\\'")}')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openCustomerModal(id = null) {
    const modalBackdrop = document.getElementById('customer-modal-backdrop');
    const modalTitle = document.getElementById('customer-modal-title');
    const form = document.getElementById('customer-form');

    form.reset();
    document.getElementById('cust-id').value = '';

    if (id) {
      modalTitle.textContent = 'Edit Customer';
      const cust = Storage.getCustomer(id);
      if (cust) {
        document.getElementById('cust-id').value = cust.id;
        document.getElementById('cust-name').value = cust.name || '';
        document.getElementById('cust-email').value = cust.email || '';
        document.getElementById('cust-phone').value = cust.phone || '';
        document.getElementById('cust-company').value = cust.company || '';
        document.getElementById('cust-address').value = cust.address || '';
        document.getElementById('cust-notes').value = cust.notes || '';
      }
    } else {
      modalTitle.textContent = 'Add New Customer';
    }

    modalBackdrop.classList.add('active');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('cust-id').value;
    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const company = document.getElementById('cust-company').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const notes = document.getElementById('cust-notes').value.trim();

    if (!name || !company) {
      App.toast('Please enter customer Name and Company', 'danger');
      return;
    }

    const customerData = {
      ...(id ? { id } : {}),
      name,
      email,
      phone,
      company,
      address,
      notes
    };

    Storage.saveCustomer(customerData);
    document.getElementById('customer-modal-backdrop').classList.remove('active');
    App.toast(id ? 'Customer updated!' : 'Customer created successfully!', 'success');
    this.renderCustomers();
  },

  deleteCustomer(id, name) {
    App.confirm(
      'Delete Customer?',
      `Are you sure you want to delete "${name}"? Associated deals and history will remain in records.`,
      () => {
        Storage.deleteCustomer(id);
        App.toast('Customer removed.', 'info');
        this.renderCustomers();
      }
    );
  }
};
