# ClientFlow — Simple & Modern CRM Website
> **4th-Year Computer Science College Mini-Project**  
> *A clean, practical, and fully functional Customer Relationship Management system built with HTML5, CSS3, Vanilla JavaScript, Node.js, Express, and LocalStorage persistence.*

---

## 1. Project Overview

**ClientFlow** is a modern Customer Relationship Management (CRM) web application designed for small businesses, freelancers, and sales teams to manage prospective leads, customer accounts, sales opportunities, follow-up tasks, and interaction history.

The application emphasizes clean architecture, professional SaaS UI/UX aesthetics, zero bloated dependencies, and practical full-stack fundamentals that are easy to explain during college presentations and technical viva examinations.

---

## 2. Technology Stack

- **Frontend**:
  - **HTML5**: Semantic tags, accessible forms, responsive viewports.
  - **CSS3**: Custom design system, CSS Grid, Flexbox, custom status badges, animated toast alerts, modals, responsive mobile drawer.
  - **Vanilla JavaScript (ES6+)**: Event delegation, HTML5 Drag & Drop API, DOM manipulation, modular architecture without external frameworks (No React, Angular, or Vue).
- **Backend**:
  - **Node.js**: Runtime environment.
  - **Express.js**: Lightweight static web server and status endpoint.
- **Data Persistence**:
  - **Browser LocalStorage**: Instant offline-first persistence with JSON serialization.
  - **Automatic Sample Data Seeder**: Automatically populates realistic sample data on first launch so the dashboard is immediately populated.
  - **Reset Demo Data**: One-click restore button in the navigation drawer for reliable live demonstrations.

---

## 3. Key Pages & Features

| Page | File | Core Functionality |
| :--- | :--- | :--- |
| **Login** | `index.html` | Professional login screen, form validation, simulated session storage, and **"Auto-Fill Demo Credentials"** button. |
| **Dashboard** | `dashboard.html` | Real-time KPI summary cards (Leads, Customers, Pipeline Value, Due Follow-ups, Won Deals), visual progress meters, upcoming tasks widget, and activity feed. |
| **Leads** | `leads.html` | Full CRUD operations, search by keyword, filter by Status (`New`, `Contacted`, `Qualified`, `Lost`, `Converted`) and Priority (`High`, `Medium`, `Low`), **One-click "Convert Lead to Customer"**. |
| **Customers** | `customers.html` | Customer account directory, search by name/company/email, linked deal summaries, and quick link to Customer 360° Profile. |
| **Customer 360°** | `customer-detail.html` | Dedicated client profile with contact card, **Interaction History Timeline** (log calls, meetings, emails), associated pipeline deals, and scheduled follow-ups. |
| **Sales Pipeline** | `pipeline.html` | Kanban board with 5 stages (`New` → `Contacted` → `Qualified` → `Won` / `Lost`), deal value sums per stage column, card priority tags, stage change dropdown, and HTML5 drag-and-drop. |
| **Follow-ups** | `followups.html` | Interactive task checklist with instant check completion, filter tabs (`All`, `Pending`, `Due Today`, `Completed`), and due date badges (Overdue, Today). |
| **Reports** | `reports.html` | Business conversion funnel metrics, Deal Win Rate %, Won Revenue vs Active Pipeline, Task completion rate %, and **JSON Data Backup Export**. |

---

## 4. Folder Structure

```text
clientflow/
│
├── index.html              # Login & Auth Gate
├── dashboard.html          # Executive Dashboard
├── leads.html              # Lead Management & Conversion
├── customers.html          # Customers Directory
├── customer-detail.html    # Customer 360 Profile & Timeline
├── pipeline.html           # Sales Pipeline Kanban Board
├── followups.html          # Follow-ups & Task Center
├── reports.html            # Performance Reports & Export
│
├── css/
│   └── style.css           # Complete SaaS Design System
│
├── js/
│   ├── storage.js          # LocalStorage persistence & sample data seeder
│   ├── app.js              # Shared UI utilities, auth guard, toasts, confirm modals
│   ├── dashboard.js        # Dashboard metrics computation & visual progress bars
│   ├── leads.js            # Leads CRUD, filtering, and conversion logic
│   ├── customers.js        # Customers directory & search
│   ├── customer-detail.js  # Customer 360 view & interaction logging
│   ├── pipeline.js         # Kanban board management & drag-and-drop
│   ├── followups.js        # Task filtering & checklist toggles
│   └── reports.js          # Analytics calculation & data backup export
│
├── server.js               # Minimal Node.js Express server
├── package.json            # Project manifest & start scripts
└── README.md               # Documentation & College Viva Guide
```

---

## 5. Quick Start Instructions

### Prerequisites
Make sure you have **Node.js** (v14 or higher) installed on your machine.

### Installation & Run Steps

1. Open your terminal and navigate to the project directory:
   ```bash
   cd /Users/asadkhan/.gemini/antigravity/scratch/clientflow
   ```

2. Install the lightweight Express dependency:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your web browser and visit:
   ```text
   http://localhost:3000
   ```

---

## 6. Demo Login Credentials

- **Email**: `admin@clientflow.com`
- **Password**: `admin123`

> 💡 **Tip for Presentation**: You can click the **"Auto-Fill"** button on the login screen to fill these credentials in one click!

---

## 7. College Viva / Presentation Q&A Guide

### Q1: Why did you use LocalStorage instead of a database like MySQL or MongoDB?
> **Answer**: For small business offline capabilities and a lightweight demonstration project, LocalStorage avoids the operational overhead of installing, configuring, and maintaining external database servers. It allows instant zero-latency CRUD operations, maintains state across browser reloads, and makes the project entirely portable.

### Q2: How does data persistence work in this architecture?
> **Answer**: All data is centralized in `js/storage.js`. When any entity (lead, customer, deal, task, interaction) is added, updated, or deleted, it is serialized via `JSON.stringify()` into browser `localStorage`. When any page loads, it parses the data back into JavaScript objects via `JSON.parse()`. If no data exists on first launch, default sample data is automatically seeded.

### Q3: How does the "Lead Conversion" feature work?
> **Answer**: When a lead reaches an advanced stage, clicking "Convert to Customer" triggers `Storage.convertLeadToCustomer(leadId)`. This marks the lead's status as `Converted`, extracts the lead's contact information, and generates a new record in the `customers` store with reference notes. The user is then able to attach sales pipeline deals to that customer.

### Q4: How is the Kanban Board implemented without external libraries?
> **Answer**: The Kanban board uses CSS Grid for responsive 5-column layout. Cards support both the native HTML5 Drag and Drop API (`dragstart`, `dragover`, `drop`) and an explicit `<select>` dropdown on each card for maximum accessibility. Whenever a card is moved to a new column, `Storage.updateDealStage(id, newStage)` is called and column aggregates are re-calculated dynamically.
