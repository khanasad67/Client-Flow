/**
 * ClientFlow CRM - Storage & Data Persistence Engine
 * 
 * Manages all data in browser LocalStorage.
 * Auto-seeds realistic sample data on first launch.
 */

const STORAGE_KEYS = {
  LEADS: 'clientflow_leads',
  CUSTOMERS: 'clientflow_customers',
  DEALS: 'clientflow_deals',
  TASKS: 'clientflow_tasks',
  INTERACTIONS: 'clientflow_interactions',
  ACTIVITIES: 'clientflow_activities',
  AUTH: 'clientflow_auth'
};

// Initial Seed Data for Instant Demonstration
const INITIAL_DATA = {
  leads: [
    {
      id: 'lead-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@apextech.in',
      phone: '+91 98765 43210',
      company: 'Apex Technologies',
      source: 'Website',
      status: 'Qualified',
      priority: 'High',
      followUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      notes: 'Interested in enterprise cloud CRM migration. Budget is pre-approved.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'lead-2',
      name: 'Priya Patel',
      email: 'priya@nexusmedia.com',
      phone: '+91 98123 45678',
      company: 'Nexus Media',
      source: 'LinkedIn',
      status: 'Contacted',
      priority: 'Medium',
      followUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      notes: 'Introductory pitch completed. Requested custom quotation proposal.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'lead-3',
      name: 'Amit Verma',
      email: 'amit@zenithlogistics.com',
      phone: '+91 97654 32109',
      company: 'Zenith Logistics',
      source: 'Referral',
      status: 'New',
      priority: 'Medium',
      followUpDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      notes: 'Referred by Vikram Malhotra. Wants a live product walkthrough.',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'lead-4',
      name: 'Neha Gupta',
      email: 'neha@fincore.org',
      phone: '+91 96543 21098',
      company: 'FinCore Systems',
      source: 'Cold Call',
      status: 'Lost',
      priority: 'Low',
      followUpDate: '',
      notes: 'Opted for in-house custom database due to strict compliance policies.',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'lead-5',
      name: 'Sneha Rao',
      email: 'sneha@vortexlabs.io',
      phone: '+91 95432 10987',
      company: 'Vortex Labs',
      source: 'Website',
      status: 'Converted',
      priority: 'High',
      followUpDate: '',
      notes: 'Successfully converted to full enterprise customer.',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
    }
  ],

  customers: [
    {
      id: 'cust-1',
      name: 'Sneha Rao',
      email: 'sneha@vortexlabs.io',
      phone: '+91 95432 10987',
      company: 'Vortex Labs',
      address: 'Vortex Innovation Hub, Whitefield, Bengaluru',
      notes: 'Converted from high-priority lead. Focuses on AI and analytics solutions.',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'cust-2',
      name: 'Vikram Malhotra',
      email: 'vikram@bluewave.com',
      phone: '+91 94321 09876',
      company: 'BlueWave Corp',
      address: 'Tower B, Cyber City, Gurugram',
      notes: 'Long-term client. Always open to early-access modules.',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'cust-3',
      name: 'Ananya Deshmukh',
      email: 'ananya@cloudscale.net',
      phone: '+91 93210 98765',
      company: 'CloudScale Inc',
      address: 'Bandra-Kurla Complex, Mumbai',
      notes: 'Requires 24/7 dedicated support tier.',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
    },
    {
      id: 'cust-4',
      name: 'Rohan Mehta',
      email: 'rohan@novaretail.com',
      phone: '+91 92109 87654',
      company: 'Nova Retail',
      address: 'MG Road Commercial Center, Pune',
      notes: 'Retail chain with 18 branch locations.',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ],

  deals: [
    {
      id: 'deal-1',
      title: 'Cloud Infrastructure Migration',
      customerId: 'cust-3',
      customerName: 'Ananya Deshmukh (CloudScale Inc)',
      value: 15000,
      stage: 'Qualified',
      priority: 'High',
      closingDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'deal-2',
      title: 'CRM Annual Implementation & Training',
      customerId: 'cust-2',
      customerName: 'Vikram Malhotra (BlueWave Corp)',
      value: 8500,
      stage: 'Contacted',
      priority: 'Medium',
      closingDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'deal-3',
      title: 'Enterprise Software Multi-Seat License',
      customerId: 'cust-4',
      customerName: 'Rohan Mehta (Nova Retail)',
      value: 22000,
      stage: 'Won',
      priority: 'High',
      closingDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'deal-4',
      title: 'Real-time Analytics Custom Pipeline',
      customerId: 'cust-1',
      customerName: 'Sneha Rao (Vortex Labs)',
      value: 12500,
      stage: 'New',
      priority: 'Medium',
      closingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'deal-5',
      title: 'Legacy Compliance Audit Package',
      customerId: '',
      customerName: 'FinCore Systems (Lead)',
      value: 6000,
      stage: 'Lost',
      priority: 'Low',
      closingDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    }
  ],

  tasks: [
    {
      id: 'task-1',
      title: 'Call Rahul Sharma to review technical scope document',
      relatedTo: 'Rahul Sharma (Apex Technologies)',
      dueDate: new Date().toISOString().split('T')[0], // Due Today!
      priority: 'High',
      status: 'pending',
      description: 'Review cloud architecture requirements and address data residency concerns.'
    },
    {
      id: 'task-2',
      title: 'Send formal product pricing quote to Priya Patel',
      relatedTo: 'Priya Patel (Nexus Media)',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      priority: 'Medium',
      status: 'pending',
      description: 'Include 10% promotional educational discount for the first quarter.'
    },
    {
      id: 'task-3',
      title: 'Schedule Q3 strategic check-in call with Vikram Malhotra',
      relatedTo: 'Vikram Malhotra (BlueWave Corp)',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      priority: 'Low',
      status: 'pending',
      description: 'Discuss upcoming feature release roadmap.'
    },
    {
      id: 'task-4',
      title: 'Finalize contract signing ceremony with Rohan Mehta',
      relatedTo: 'Rohan Mehta (Nova Retail)',
      dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      priority: 'High',
      status: 'completed',
      description: 'Counter-signed documents received and stored in archive.'
    }
  ],

  interactions: [
    {
      id: 'int-1',
      customerId: 'cust-2',
      type: 'Call',
      date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: 'Discussed renewal terms for Q4. Vikram is very satisfied with platform stability.'
    },
    {
      id: 'int-2',
      customerId: 'cust-3',
      type: 'Meeting',
      date: new Date(Date.now() - 5 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: 'Architecture alignment meeting held with engineering leads. Signed NDA.'
    },
    {
      id: 'int-3',
      customerId: 'cust-1',
      type: 'Email',
      date: new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: 'Dispatched onboarding welcome pack and login instructions.'
    },
    {
      id: 'int-4',
      customerId: 'cust-4',
      type: 'Meeting',
      date: new Date(Date.now() - 3 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: 'Final review meeting before deal closure. Customer signed contract.'
    }
  ],

  activities: [
    {
      id: 'act-1',
      action: 'Deal Won',
      details: 'Enterprise Software Multi-Seat License ($22,000) was won!',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 'act-2',
      action: 'Lead Converted',
      details: 'Sneha Rao from Vortex Labs converted to Customer.',
      time: '1 day ago',
      type: 'primary'
    },
    {
      id: 'act-3',
      action: 'New Lead Added',
      details: 'Amit Verma from Zenith Logistics joined the pipeline.',
      time: '2 days ago',
      type: 'info'
    },
    {
      id: 'act-4',
      action: 'Follow-up Completed',
      details: 'Contract signing with Rohan Mehta completed.',
      time: '3 days ago',
      type: 'success'
    }
  ]
};

// Data Store Object
const Storage = {
  // Initialize sample data if not already present or forced
  init(force = false) {
    if (force || !localStorage.getItem(STORAGE_KEYS.LEADS)) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_DATA.leads));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_DATA.customers));
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(INITIAL_DATA.deals));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_DATA.tasks));
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(INITIAL_DATA.interactions));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_DATA.activities));
      console.log('ClientFlow: Realistic demo data seeded successfully into LocalStorage.');
    }
  },

  // Reset database back to default initial state
  resetToSampleData() {
    this.init(true);
  },

  // Generic JSON helpers
  _get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key} from LocalStorage:`, e);
      return [];
    }
  },

  _save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to LocalStorage:`, e);
      return false;
    }
  },

  // ==================== LEADS ====================
  getLeads() {
    return this._get(STORAGE_KEYS.LEADS);
  },

  getLead(id) {
    return this.getLeads().find(l => l.id === id);
  },

  saveLead(leadData) {
    const leads = this.getLeads();
    if (leadData.id) {
      // Edit existing
      const idx = leads.findIndex(l => l.id === leadData.id);
      if (idx !== -1) {
        leads[idx] = { ...leads[idx], ...leadData, updatedAt: new Date().toISOString() };
        this._save(STORAGE_KEYS.LEADS, leads);
        this.logActivity('Lead Updated', `Updated details for ${leadData.name}`, 'info');
        return leads[idx];
      }
    } else {
      // Create new
      const newLead = {
        id: 'lead-' + Date.now(),
        ...leadData,
        createdAt: new Date().toISOString()
      };
      leads.unshift(newLead);
      this._save(STORAGE_KEYS.LEADS, leads);
      this.logActivity('New Lead Added', `${newLead.name} (${newLead.company}) added`, 'primary');
      return newLead;
    }
  },

  deleteLead(id) {
    const leads = this.getLeads();
    const lead = leads.find(l => l.id === id);
    const filtered = leads.filter(l => l.id !== id);
    this._save(STORAGE_KEYS.LEADS, filtered);
    if (lead) {
      this.logActivity('Lead Removed', `${lead.name} was deleted`, 'danger');
    }
    return true;
  },

  convertLeadToCustomer(leadId) {
    const lead = this.getLead(leadId);
    if (!lead) return null;

    // 1. Mark lead as converted
    lead.status = 'Converted';
    this.saveLead(lead);

    // 2. Create customer record
    const customer = this.saveCustomer({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      address: '',
      notes: `Converted from Lead (${lead.source}). Original notes: ${lead.notes || 'None'}`
    });

    this.logActivity('Lead Converted', `${lead.name} successfully converted to customer!`, 'success');
    return customer;
  },

  // ==================== CUSTOMERS ====================
  getCustomers() {
    return this._get(STORAGE_KEYS.CUSTOMERS);
  },

  getCustomer(id) {
    return this.getCustomers().find(c => c.id === id);
  },

  saveCustomer(customerData) {
    const customers = this.getCustomers();
    if (customerData.id) {
      const idx = customers.findIndex(c => c.id === customerData.id);
      if (idx !== -1) {
        customers[idx] = { ...customers[idx], ...customerData, updatedAt: new Date().toISOString() };
        this._save(STORAGE_KEYS.CUSTOMERS, customers);
        this.logActivity('Customer Updated', `Updated customer ${customerData.name}`, 'info');
        return customers[idx];
      }
    } else {
      const newCust = {
        id: 'cust-' + Date.now(),
        ...customerData,
        createdAt: new Date().toISOString()
      };
      customers.unshift(newCust);
      this._save(STORAGE_KEYS.CUSTOMERS, customers);
      this.logActivity('Customer Created', `${newCust.name} (${newCust.company}) onboarded`, 'success');
      return newCust;
    }
  },

  deleteCustomer(id) {
    const customers = this.getCustomers();
    const cust = customers.find(c => c.id === id);
    const filtered = customers.filter(c => c.id !== id);
    this._save(STORAGE_KEYS.CUSTOMERS, filtered);
    if (cust) {
      this.logActivity('Customer Deleted', `Customer ${cust.name} removed`, 'danger');
    }
    return true;
  },

  // ==================== DEALS / PIPELINE ====================
  getDeals() {
    return this._get(STORAGE_KEYS.DEALS);
  },

  getDeal(id) {
    return this.getDeals().find(d => d.id === id);
  },

  saveDeal(dealData) {
    const deals = this.getDeals();
    if (dealData.id) {
      const idx = deals.findIndex(d => d.id === dealData.id);
      if (idx !== -1) {
        deals[idx] = { ...deals[idx], ...dealData, updatedAt: new Date().toISOString() };
        this._save(STORAGE_KEYS.DEALS, deals);
        this.logActivity('Deal Updated', `Updated deal "${dealData.title}"`, 'info');
        return deals[idx];
      }
    } else {
      const newDeal = {
        id: 'deal-' + Date.now(),
        ...dealData,
        createdAt: new Date().toISOString()
      };
      deals.unshift(newDeal);
      this._save(STORAGE_KEYS.DEALS, deals);
      this.logActivity('Deal Created', `New deal "${newDeal.title}" ($${Number(newDeal.value).toLocaleString()}) added`, 'primary');
      return newDeal;
    }
  },

  updateDealStage(id, newStage) {
    const deals = this.getDeals();
    const deal = deals.find(d => d.id === id);
    if (deal) {
      const oldStage = deal.stage;
      deal.stage = newStage;
      this._save(STORAGE_KEYS.DEALS, deals);
      this.logActivity('Stage Moved', `Deal "${deal.title}" moved from ${oldStage} → ${newStage}`, newStage === 'Won' ? 'success' : 'info');
      return deal;
    }
    return null;
  },

  deleteDeal(id) {
    const deals = this.getDeals();
    const deal = deals.find(d => d.id === id);
    const filtered = deals.filter(d => d.id !== id);
    this._save(STORAGE_KEYS.DEALS, filtered);
    if (deal) {
      this.logActivity('Deal Deleted', `Deal "${deal.title}" removed`, 'danger');
    }
    return true;
  },

  // ==================== TASKS / FOLLOW-UPS ====================
  getTasks() {
    return this._get(STORAGE_KEYS.TASKS);
  },

  saveTask(taskData) {
    const tasks = this.getTasks();
    if (taskData.id) {
      const idx = tasks.findIndex(t => t.id === taskData.id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...taskData };
        this._save(STORAGE_KEYS.TASKS, tasks);
        return tasks[idx];
      }
    } else {
      const newTask = {
        id: 'task-' + Date.now(),
        status: 'pending',
        ...taskData
      };
      tasks.unshift(newTask);
      this._save(STORAGE_KEYS.TASKS, tasks);
      this.logActivity('Task Scheduled', `New follow-up: "${newTask.title}"`, 'info');
      return newTask;
    }
  },

  toggleTaskStatus(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      this._save(STORAGE_KEYS.TASKS, tasks);
      if (task.status === 'completed') {
        this.logActivity('Task Completed', `Follow-up "${task.title}" completed!`, 'success');
      }
      return task;
    }
    return null;
  },

  deleteTask(id) {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    this._save(STORAGE_KEYS.TASKS, filtered);
    return true;
  },

  // ==================== INTERACTIONS ====================
  getInteractions(customerId = null) {
    const all = this._get(STORAGE_KEYS.INTERACTIONS);
    if (customerId) {
      return all.filter(i => i.customerId === customerId);
    }
    return all;
  },

  saveInteraction(interaction) {
    const all = this._get(STORAGE_KEYS.INTERACTIONS);
    const newInt = {
      id: 'int-' + Date.now(),
      ...interaction,
      date: interaction.date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    all.unshift(newInt);
    this._save(STORAGE_KEYS.INTERACTIONS, all);
    this.logActivity('Interaction Logged', `Logged ${newInt.type} interaction`, 'info');
    return newInt;
  },

  // ==================== ACTIVITIES ====================
  getActivities() {
    return this._get(STORAGE_KEYS.ACTIVITIES);
  },

  logActivity(action, details, type = 'info') {
    const activities = this.getActivities();
    const newAct = {
      id: 'act-' + Date.now(),
      action,
      details,
      time: 'Just now',
      type
    };
    activities.unshift(newAct);
    // Keep max 25 recent activities
    if (activities.length > 25) activities.pop();
    this._save(STORAGE_KEYS.ACTIVITIES, activities);
  },

  // ==================== AUTHENTICATION ====================
  getAuth() {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
    return auth ? JSON.parse(auth) : null;
  },

  setAuth(user) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  // ==================== DASHBOARD & METRICS ====================
  getDashboardStats() {
    const leads = this.getLeads();
    const customers = this.getCustomers();
    const deals = this.getDeals();
    const tasks = this.getTasks();

    const todayStr = new Date().toISOString().split('T')[0];

    const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
    const wonDeals = deals.filter(d => d.stage === 'Won');
    const lostDeals = deals.filter(d => d.stage === 'Lost');
    const convertedLeads = leads.filter(l => l.status === 'Converted');

    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const totalWonRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

    const followupsToday = tasks.filter(t => t.status === 'pending' && t.dueDate === todayStr).length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return {
      totalLeads: leads.length,
      convertedLeads: convertedLeads.length,
      leadConversionRate: leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0,
      totalCustomers: customers.length,
      activeDealsCount: activeDeals.length,
      totalPipelineValue,
      wonDealsCount: wonDeals.length,
      lostDealsCount: lostDeals.length,
      totalWonRevenue,
      dealWinRate: (wonDeals.length + lostDeals.length) > 0 
        ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) 
        : 0,
      followupsToday,
      pendingTasks,
      completedTasks,
      taskCompletionRate: (pendingTasks + completedTasks) > 0 
        ? Math.round((completedTasks / (pendingTasks + completedTasks)) * 100) 
        : 0
    };
  }
};

// Auto-seed sample data on script execution if absent
Storage.init();
