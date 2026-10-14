/**
 * ClientFlow CRM - Reports & Analytics Controller
 * 
 * Computes conversion funnels, win/loss rates, and visual progress breakdowns.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('reports');
  ReportsManager.init();
});

const ReportsManager = {
  init() {
    this.renderKPIs();
    this.renderBreakdowns();
    this.bindEvents();
  },

  bindEvents() {
    const btnPrint = document.getElementById('btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    const btnExportData = document.getElementById('btn-export-data');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
        this.exportAllDataAsJSON();
      });
    }
  },

  renderKPIs() {
    const stats = Storage.getDashboardStats();

    // Lead Funnel
    document.getElementById('rep-total-leads').textContent = stats.totalLeads;
    document.getElementById('rep-converted-leads').textContent = stats.convertedLeads;
    document.getElementById('rep-conversion-rate').textContent = `${stats.leadConversionRate}%`;
    document.getElementById('rep-conversion-fill').style.width = `${stats.leadConversionRate}%`;

    // Deals Funnel
    document.getElementById('rep-won-deals').textContent = stats.wonDealsCount;
    document.getElementById('rep-lost-deals').textContent = stats.lostDealsCount;
    document.getElementById('rep-win-rate').textContent = `${stats.dealWinRate}%`;
    document.getElementById('rep-win-fill').style.width = `${stats.dealWinRate}%`;

    // Revenue
    document.getElementById('rep-won-revenue').textContent = App.formatCurrency(stats.totalWonRevenue);
    document.getElementById('rep-pipeline-val').textContent = App.formatCurrency(stats.totalPipelineValue);

    // Follow-ups
    document.getElementById('rep-pending-tasks').textContent = stats.pendingTasks;
    document.getElementById('rep-completed-tasks').textContent = stats.completedTasks;
    document.getElementById('rep-task-rate').textContent = `${stats.taskCompletionRate}%`;
    document.getElementById('rep-task-fill').style.width = `${stats.taskCompletionRate}%`;
  },

  renderBreakdowns() {
    const leads = Storage.getLeads();
    const deals = Storage.getDeals();

    // 1. Lead Sources
    const sourceCounts = {};
    leads.forEach(l => {
      const src = l.source || 'Direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const totalLeads = leads.length || 1;
    const sourceContainer = document.getElementById('rep-sources-list');
    if (sourceContainer) {
      const colors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const keys = Object.keys(sourceCounts);

      sourceContainer.innerHTML = keys.map((key, i) => {
        const count = sourceCounts[key];
        const pct = Math.round((count / totalLeads) * 100);
        const col = colors[i % colors.length];
        return `
          <div class="progress-container">
            <div class="progress-label-row">
              <span>${key}</span>
              <span><strong>${count}</strong> leads (${pct}%)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%; background: ${col};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Deals Distribution Table
    const stageSummary = {
      'New': { count: 0, val: 0 },
      'Contacted': { count: 0, val: 0 },
      'Qualified': { count: 0, val: 0 },
      'Won': { count: 0, val: 0 },
      'Lost': { count: 0, val: 0 }
    };

    deals.forEach(d => {
      if (stageSummary[d.stage]) {
        stageSummary[d.stage].count++;
        stageSummary[d.stage].val += Number(d.value || 0);
      }
    });

    const dealsTbody = document.getElementById('rep-deals-tbody');
    if (dealsTbody) {
      dealsTbody.innerHTML = Object.keys(stageSummary).map(stage => {
        const item = stageSummary[stage];
        const badgeClass = `badge-${stage.toLowerCase()}`;
        return `
          <tr>
            <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${stage}</span></td>
            <td><strong>${item.count}</strong></td>
            <td>${App.formatCurrency(item.val)}</td>
          </tr>
        `;
      }).join('');
    }
  },

  exportAllDataAsJSON() {
    const data = {
      app: 'ClientFlow CRM',
      exportedAt: new Date().toISOString(),
      leads: Storage.getLeads(),
      customers: Storage.getCustomers(),
      deals: Storage.getDeals(),
      tasks: Storage.getTasks(),
      interactions: Storage.getInteractions()
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `clientflow_crm_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    App.toast('Backup JSON data downloaded!', 'success');
  }
};
