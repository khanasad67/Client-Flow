/**
 * ClientFlow CRM - Dashboard Controller
 * 
 * Computes live KPI metrics, visual summaries, activity feeds,
 * and upcoming follow-ups.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init('dashboard');
  Dashboard.init();
});

const Dashboard = {
  init() {
    this.renderKPIs();
    this.renderVisualSummaries();
    this.renderUpcomingFollowups();
    this.renderRecentActivities();
    this.setupQuickModals();
  },

  // 1. Render Top Stat KPI Cards
  renderKPIs() {
    const stats = Storage.getDashboardStats();

    const elTotalLeads = document.getElementById('stat-total-leads');
    const elTotalCustomers = document.getElementById('stat-total-customers');
    const elActiveDeals = document.getElementById('stat-active-deals');
    const elPipelineVal = document.getElementById('stat-pipeline-val');
    const elFollowupsToday = document.getElementById('stat-followups-today');
    const elWonDeals = document.getElementById('stat-won-deals');

    if (elTotalLeads) elTotalLeads.textContent = stats.totalLeads;
    if (elTotalCustomers) elTotalCustomers.textContent = stats.totalCustomers;
    if (elActiveDeals) elActiveDeals.textContent = stats.activeDealsCount;
    if (elPipelineVal) elPipelineVal.textContent = App.formatCurrency(stats.totalPipelineValue);
    if (elFollowupsToday) elFollowupsToday.textContent = stats.followupsToday;
    if (elWonDeals) elWonDeals.textContent = `${stats.wonDealsCount} (${App.formatCurrency(stats.totalWonRevenue)})`;
  },

  // 2. Render Simple, Modern Visual Summaries (No external dependencies)
  renderVisualSummaries() {
    const leads = Storage.getLeads();
    const deals = Storage.getDeals();

    // Visual 1: Lead Sources breakdown
    const sourceCounts = {};
    leads.forEach(l => {
      const src = l.source || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sourceContainer = document.getElementById('lead-sources-container');
    if (sourceContainer) {
      const total = leads.length || 1;
      const sources = Object.keys(sourceCounts);

      if (sources.length === 0) {
        sourceContainer.innerHTML = '<p class="text-muted" style="font-size:0.875rem;">No lead source data available.</p>';
      } else {
        const colors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        sourceContainer.innerHTML = sources.map((src, idx) => {
          const count = sourceCounts[src];
          const pct = Math.round((count / total) * 100);
          const color = colors[idx % colors.length];
          return `
            <div class="progress-container">
              <div class="progress-label-row">
                <span>${src}</span>
                <span>${count} (${pct}%)</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${pct}%; background: ${color};"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Visual 2: Pipeline Deal Stages
    const stageContainer = document.getElementById('pipeline-stage-summary');
    if (stageContainer) {
      const stages = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];
      const stageColors = {
        'New': '#3b82f6',
        'Contacted': '#8b5cf6',
        'Qualified': '#f59e0b',
        'Won': '#10b981',
        'Lost': '#ef4444'
      };

      const stageCounts = {};
      stages.forEach(s => stageCounts[s] = 0);
      deals.forEach(d => {
        if (stageCounts[d.stage] !== undefined) stageCounts[d.stage]++;
      });

      const totalDeals = deals.length || 1;

      stageContainer.innerHTML = stages.map(st => {
        const cnt = stageCounts[st];
        const pct = Math.round((cnt / totalDeals) * 100);
        return `
          <div class="progress-container">
            <div class="progress-label-row">
              <span style="display:flex; align-items:center; gap:0.5rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:${stageColors[st]}"></span>
                ${st}
              </span>
              <span>${cnt} deals (${pct}%)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%; background: ${stageColors[st]};"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  // 3. Render Follow-ups Widget
  renderUpcomingFollowups() {
    const tasks = Storage.getTasks();
    const container = document.getElementById('dashboard-tasks-list');
    if (!container) return;

    const pending = tasks.filter(t => t.status === 'pending').slice(0, 4);

    if (pending.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 0;">
          <p class="empty-state-title">All caught up!</p>
          <p class="empty-state-text" style="font-size:0.8125rem;">No pending follow-ups right now.</p>
        </div>
      `;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = pending.map(task => {
      const isToday = task.dueDate === todayStr;
      const isOverdue = task.dueDate && task.dueDate < todayStr;
      let dueBadge = '';
      if (isToday) {
        dueBadge = '<span class="task-due-today">● Today</span>';
      } else if (isOverdue) {
        dueBadge = '<span class="task-overdue">● Overdue</span>';
      } else if (task.dueDate) {
        dueBadge = `<span>${App.formatDate(task.dueDate)}</span>`;
      }

      return `
        <div class="task-item" style="padding: 0.75rem 0.875rem;">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" title="Mark as Completed">
          <div class="task-content">
            <div class="task-title" style="font-size:0.875rem;">${task.title}</div>
            <div class="task-meta" style="font-size:0.75rem;">
              <span>${task.relatedTo || 'General'}</span>
              ${dueBadge}
              <span class="badge badge-priority-${(task.priority || 'medium').toLowerCase()}">${task.priority}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach checkbox toggles
    container.querySelectorAll('.task-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const taskId = e.target.dataset.id;
        Storage.toggleTaskStatus(taskId);
        App.toast('Follow-up marked as completed!', 'success');
        Dashboard.renderKPIs();
        Dashboard.renderUpcomingFollowups();
        App.updateSidebarBadges();
      });
    });
  },

  // 4. Render Recent Activities Feed
  renderRecentActivities() {
    const activities = Storage.getActivities().slice(0, 5);
    const container = document.getElementById('dashboard-activities-list');
    if (!container) return;

    if (activities.length === 0) {
      container.innerHTML = '<p class="text-muted" style="font-size:0.875rem;">No recent activities logged.</p>';
      return;
    }

    container.innerHTML = activities.map(act => `
      <div style="display:flex; align-items:flex-start; gap:0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
        <div style="width:8px; height:8px; border-radius:50%; background: var(--primary); margin-top: 6px; flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="font-size:0.875rem; font-weight:600; color:var(--text-main);">${act.action}</div>
          <div style="font-size:0.8125rem; color:var(--text-muted);">${act.details}</div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-subtle);">${act.time}</div>
      </div>
    `).join('');
  },

  // 5. Setup Quick Action Modal Shortcuts
  setupQuickModals() {
    const btnQuickLead = document.getElementById('btn-quick-lead');
    if (btnQuickLead) {
      btnQuickLead.addEventListener('click', () => {
        window.location.href = 'leads.html?action=new';
      });
    }

    const btnQuickDeal = document.getElementById('btn-quick-deal');
    if (btnQuickDeal) {
      btnQuickDeal.addEventListener('click', () => {
        window.location.href = 'pipeline.html?action=new';
      });
    }

    const btnQuickTask = document.getElementById('btn-quick-task');
    if (btnQuickTask) {
      btnQuickTask.addEventListener('click', () => {
        window.location.href = 'followups.html?action=new';
      });
    }
  }
};
