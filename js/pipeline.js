/**
 * ClientFlow CRM - Sales Pipeline Kanban Controller
 * 
 * Manages Kanban board stages, deal cards, stage changing (dropdown + drag & drop),
 * and aggregate pipeline monetary calculations.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('pipeline');
  PipelineManager.init();
});

const PipelineManager = {
  stages: ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],

  init() {
    this.bindEvents();
    this.renderBoard();

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      this.openDealModal();
    }
  },

  bindEvents() {
    // Add Deal Button
    const btnAdd = document.getElementById('btn-add-deal');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openDealModal());
    }

    // Modal Close
    const modalBackdrop = document.getElementById('deal-modal-backdrop');
    const btnCloseModal = document.getElementById('btn-close-deal-modal');
    const btnCancelModal = document.getElementById('btn-cancel-deal-modal');

    const closeModal = () => modalBackdrop.classList.remove('active');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Form Submit
    const form = document.getElementById('deal-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Setup Drag and Drop onto columns
    this.setupColumnDropZones();
  },

  setupColumnDropZones() {
    const columns = document.querySelectorAll('.pipeline-column');
    columns.forEach(col => {
      const stage = col.dataset.stage;
      const container = col.querySelector('.pipeline-cards-container');

      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        const dealId = e.dataTransfer.getData('text/plain');
        if (dealId && stage) {
          Storage.updateDealStage(dealId, stage);
          App.toast(`Moved deal to ${stage}!`, stage === 'Won' ? 'success' : 'info');
          this.renderBoard();
        }
      });
    });
  },

  renderBoard() {
    const deals = Storage.getDeals();
    const stats = Storage.getDashboardStats();

    // Update Header Summary Metrics
    const totalValEl = document.getElementById('pipeline-total-val');
    const activeDealsEl = document.getElementById('pipeline-active-deals');
    const winRateEl = document.getElementById('pipeline-win-rate');

    if (totalValEl) totalValEl.textContent = App.formatCurrency(stats.totalPipelineValue);
    if (activeDealsEl) activeDealsEl.textContent = stats.activeDealsCount;
    if (winRateEl) winRateEl.textContent = `${stats.dealWinRate}%`;

    // Render each Stage Column
    this.stages.forEach(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const stageSum = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

      const countEl = document.getElementById(`count-${stage.toLowerCase()}`);
      const valEl = document.getElementById(`val-${stage.toLowerCase()}`);
      const container = document.getElementById(`cards-${stage.toLowerCase()}`);

      if (countEl) countEl.textContent = stageDeals.length;
      if (valEl) valEl.textContent = App.formatCurrency(stageSum);

      if (!container) return;

      if (stageDeals.length === 0) {
        container.innerHTML = '<div style="font-size:0.8125rem; color:var(--text-subtle); text-align:center; padding:1.5rem 0;">No deals in this stage</div>';
        return;
      }

      container.innerHTML = stageDeals.map(deal => {
        const priorityClass = `badge-priority-${(deal.priority || 'medium').toLowerCase()}`;

        return `
          <div class="deal-card" draggable="true" data-id="${deal.id}">
            <div class="deal-card-header">
              <span class="deal-title">${deal.title}</span>
              <span class="badge ${priorityClass}">${deal.priority}</span>
            </div>

            <div class="deal-customer">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>${deal.customerName || 'General Client'}</span>
            </div>

            <div class="deal-value">${App.formatCurrency(deal.value)}</div>

            <div class="deal-card-footer">
              <div>Closing: <strong>${App.formatDate(deal.closingDate)}</strong></div>
              <div style="display:flex; align-items:center; gap:0.25rem;">
                <select class="deal-stage-selector" title="Change Stage" onchange="PipelineManager.changeStage('${deal.id}', this.value)">
                  ${this.stages.map(s => `
                    <option value="${s}" ${s === deal.stage ? 'selected' : ''}>${s}</option>
                  `).join('')}
                </select>
                <button class="btn-icon" style="width:24px; height:24px;" title="Edit" onclick="PipelineManager.openDealModal('${deal.id}')">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button class="btn-icon btn-icon-danger" style="width:24px; height:24px;" title="Delete" onclick="PipelineManager.deleteDeal('${deal.id}', '${deal.title.replace(/'/g, "\\'")}')">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Attach HTML5 Dragstart listeners
      container.querySelectorAll('.deal-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', card.dataset.id);
          card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });
      });
    });
  },

  changeStage(dealId, newStage) {
    Storage.updateDealStage(dealId, newStage);
    App.toast(`Deal stage updated to ${newStage}`, newStage === 'Won' ? 'success' : 'info');
    this.renderBoard();
  },

  openDealModal(id = null) {
    const modalBackdrop = document.getElementById('deal-modal-backdrop');
    const modalTitle = document.getElementById('deal-modal-title');
    const form = document.getElementById('deal-form');

    form.reset();
    document.getElementById('deal-id').value = '';

    // Populate customer options
    const selectCust = document.getElementById('deal-customer-select');
    const customers = Storage.getCustomers();
    const leads = Storage.getLeads().filter(l => l.status !== 'Lost');

    selectCust.innerHTML = `
      <option value="">-- Select Customer or Lead --</option>
      <optgroup label="Active Customers">
        ${customers.map(c => `<option value="cust:${c.id}:${c.name} (${c.company})">${c.name} — ${c.company}</option>`).join('')}
      </optgroup>
      <optgroup label="Prospect Leads">
        ${leads.map(l => `<option value="lead:${l.id}:${l.name} (${l.company})">${l.name} — ${l.company} [Lead]</option>`).join('')}
      </optgroup>
    `;

    if (id) {
      modalTitle.textContent = 'Edit Deal';
      const deal = Storage.getDeal(id);
      if (deal) {
        document.getElementById('deal-id').value = deal.id;
        document.getElementById('deal-title').value = deal.title || '';
        document.getElementById('deal-value').value = deal.value || '';
        document.getElementById('deal-stage').value = deal.stage || 'New';
        document.getElementById('deal-priority').value = deal.priority || 'Medium';
        document.getElementById('deal-closing-date').value = deal.closingDate || '';

        // Select matched option if available
        Array.from(selectCust.options).forEach(opt => {
          if (deal.customerName && opt.value.includes(deal.customerName)) {
            opt.selected = true;
          }
        });
      }
    } else {
      modalTitle.textContent = 'Add New Deal';
      document.getElementById('deal-stage').value = 'New';
      document.getElementById('deal-priority').value = 'Medium';
    }

    modalBackdrop.classList.add('active');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('deal-id').value;
    const title = document.getElementById('deal-title').value.trim();
    const custVal = document.getElementById('deal-customer-select').value;
    const value = parseFloat(document.getElementById('deal-value').value) || 0;
    const stage = document.getElementById('deal-stage').value;
    const priority = document.getElementById('deal-priority').value;
    const closingDate = document.getElementById('deal-closing-date').value;

    if (!title || !custVal || value <= 0) {
      App.toast('Please enter Deal Title, Customer, and a valid positive Value', 'danger');
      return;
    }

    const parts = custVal.split(':');
    const customerId = parts[1] || '';
    const customerName = parts[2] || 'Valued Client';

    const dealData = {
      ...(id ? { id } : {}),
      title,
      customerId,
      customerName,
      value,
      stage,
      priority,
      closingDate
    };

    Storage.saveDeal(dealData);
    document.getElementById('deal-modal-backdrop').classList.remove('active');
    App.toast(id ? 'Deal updated!' : 'New deal added to pipeline!', 'success');
    this.renderBoard();
  },

  deleteDeal(id, title) {
    App.confirm(
      'Delete Deal?',
      `Are you sure you want to delete "${title}" from the pipeline?`,
      () => {
        Storage.deleteDeal(id);
        App.toast('Deal removed from pipeline.', 'info');
        this.renderBoard();
      }
    );
  }
};
