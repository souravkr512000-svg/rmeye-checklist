const express = require('express');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database('checklist.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    customer TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    section TEXT NOT NULL,
    item_text TEXT NOT NULL,
    applicability TEXT DEFAULT 'Applicable',
    status TEXT DEFAULT 'Pending',
    owner TEXT,
    initiate_date TEXT,
    complete_date TEXT,
    remarks TEXT,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT
  );
`);

// Checklist template data
const checklistTemplate = [
  // Phase 1 - Project Initiation
  { phase: "Phase 1", section: "Project Initiation", item: "Project discussion is initiated well in advance before handover date as per the project scale." },
  { phase: "Phase 1", section: "Asset & Device Details", item: "Total number of assets confirmed" },
  { phase: "Phase 1", section: "Asset & Device Details", item: "Asset types identified (Transformer, Generator, etc.)" },
  { phase: "Phase 1", section: "Asset & Device Details", item: "Device count confirmed" },
  { phase: "Phase 1", section: "Asset & Device Details", item: "Device models / 3rd party devices documented" },
  { phase: "Phase 1", section: "Asset & Device Details", item: "Asset–Device mapping clarity confirmed by CSE" },
  { phase: "Phase 1", section: "Communication & Protocols", item: "Communication protocols confirmed" },
  { phase: "Phase 1", section: "Communication & Protocols", item: "Ports and connectivity requirements available" },
  { phase: "Phase 1", section: "Communication & Protocols", item: "Time sync / gateway requirements clarified" },
  { phase: "Phase 1", section: "Documents", item: "Architecture drawings collected" },
  { phase: "Phase 1", section: "Documents", item: "SLDs collected" },
  { phase: "Phase 1", section: "Documents", item: "Asset hierarchy" },
  { phase: "Phase 1", section: "Documents", item: "Asset images from customer" },
  { phase: "Phase 1", section: "Documents", item: "I/O list available" },
  { phase: "Phase 1", section: "Documents", item: "Nameplate details for all Assets" },
  { phase: "Phase 1", section: "Documents", item: "Schematic Drawings of each Device" },
  { phase: "Phase 1", section: "Documents", item: "Analytics requirement documented" },
  { phase: "Phase 1", section: "Documents", item: "Alarm & threshold requirement documented" },
  { phase: "Phase 1", section: "Scope Understanding", item: "Project scope clearly understood and confirmed with PM" },
  { phase: "Phase 1", section: "Scope Understanding", item: "Scope documented and aligned with latest approved architecture" },
  { phase: "Phase 1", section: "Scope Understanding", item: "Any scope deviation formally approved and recorded in MOM" },
  { phase: "Phase 1", section: "Document Validation", item: "All documents aligned with agreed scope" },
  { phase: "Phase 1", section: "Document Validation", item: "Architecture vs I/O list verified" },
  { phase: "Phase 1", section: "Document Validation", item: "Device Register Addresses matched with I/O list" },
  { phase: "Phase 1", section: "Document Validation", item: "Naming conventions verified" },
  { phase: "Phase 1", section: "Analytics Scope", item: "Analytics scope confirmed (Included / Not included)" },
  { phase: "Phase 1", section: "Analytics Scope", item: "SME alignment for analytics & thresholds" },
  { phase: "Phase 1", section: "ODI Scope", item: "ODI data scope understood" },
  { phase: "Phase 1", section: "ODI Scope", item: "Data availability & limitations of RMEYE if any" },
  { phase: "Phase 1", section: "Operating System", item: "OS specification as per customer requirement" },
  { phase: "Phase 1", section: "Server Specification", item: "Server details (Customer / Office Premises / Remote)" },
  { phase: "Phase 1", section: "Infrastructure & IT", item: "Firewall scope confirmed (ports, IPs, rules)" },
  { phase: "Phase 1", section: "Infrastructure & IT", item: "Network zones clarified" },
  { phase: "Phase 1", section: "Infrastructure & IT", item: "Licensing requirements confirmed" },
  { phase: "Phase 1", section: "Build & RMEYE Scope", item: "RM EYE build version finalized" },
  { phase: "Phase 1", section: "Build & RMEYE Scope", item: "Build scope aligned with project scope" },
  { phase: "Phase 1", section: "Ownership", item: "Project Inputs Checklist created (Available / Missing)" },
  { phase: "Phase 1", section: "Ownership", item: "Owners assigned for missing inputs" },
  { phase: "Phase 1", section: "Ownership", item: "Alignment meeting conducted" },
  { phase: "Phase 1", section: "Ownership", item: "Demand new feature from customer - PO Will review and propose a date for the feature." },
  { phase: "Phase 1", section: "Ownership", item: "MOM published and tracked Version wise" },
  { phase: "Phase 1", section: "Ownership", item: "Follow-up MOMs (Ver-02 / Ver-03…) tracked until all mandatory inputs are Available" },

  // Phase 2 - Environment Validation
  { phase: "Phase 2", section: "Environment Validation", item: "Cloud / On Premises server availability" },
  { phase: "Phase 2", section: "Environment Validation", item: "Official tested build installed (Engineering-released only)" },
  { phase: "Phase 2", section: "Environment Validation", item: "Golden Database taken and secured" },
  { phase: "Phase 2", section: "Environment Validation", item: "Release notes reviewed" },
  { phase: "Phase 2", section: "Environment Validation", item: "Sanity testing completed (project-specific)" },
  { phase: "Phase 2", section: "Environment Validation", item: "Required features supported as per scope" },
  { phase: "Phase 2", section: "Environment Validation", item: "All RM EYE services running" },

  // Phase 3 - Installation
  { phase: "Phase 3", section: "Installation", item: "Build deployed on target environment" },
  { phase: "Phase 3", section: "Installation", item: "DB restored and verified" },
  { phase: "Phase 3", section: "Installation", item: "Connectivity validated" },
  { phase: "Phase 3", section: "Installation", item: "Licensing verified" },

  // Phase 4 - Configuration
  { phase: "Phase 4", section: "Configuration", item: "Configuration as per project scope" },
  { phase: "Phase 4", section: "Configuration", item: "Maps updated as per customer Location" },
  { phase: "Phase 4", section: "Configuration", item: "SLDs configured (if in scope)" },
  { phase: "Phase 4", section: "Configuration", item: "Screen / UI customization completed" },
  { phase: "Phase 4", section: "Configuration", item: "Device–tag mapping completed" },
  { phase: "Phase 4", section: "Configuration", item: "Mapping validated" },
  { phase: "Phase 4", section: "Configuration", item: "Gaps discussed with SME / TL / PM" },
  { phase: "Phase 4", section: "Configuration", item: "Jira raised for all software issues identified till deployment.(PO Will Propose a Date for Stable Build)" },
  { phase: "Phase 4", section: "Configuration", item: "pgAdmin access verified" },

  // Phase 5 - Analytics, Alarms & Admin
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Asset analytics configured" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Alarm thresholds configured" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Simulation performed for all required tags" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Data flow verified" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Analytics behaviour validated" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Alarm triggering verified" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "Expected results confirmed for each asset" },
  { phase: "Phase 5", section: "Analytics & Alarms", item: "SME sign-off on analytics readiness" },
  { phase: "Phase 5", section: "Admin Configuration", item: "Admin login verified" },
  { phase: "Phase 5", section: "Admin Configuration", item: "Roles & permissions assigned" },
  { phase: "Phase 5", section: "Server Ready", item: "Cloud / On Premises system declared ready" },

  // Phase 6 - Quebec Deployment (Conditional)
  { phase: "Phase 6", section: "Quebec Deployment", item: "VPN requirement confirmed" },
  { phase: "Phase 6", section: "Quebec Deployment", item: "VPN users confirmed" },
  { phase: "Phase 6", section: "Quebec Deployment", item: "VPN validity defined" },
  { phase: "Phase 6", section: "Quebec Deployment", item: "Anydesk/Ultraviewer planned" },

  // Verification Gates
  { phase: "Verification", section: "Verification Gates", item: "Verification-1: Configuration & readiness (CST Engineer)" },
  { phase: "Verification", section: "Verification Gates", item: "Verification-2: Peer review & technical validation (Senior CST)" },
  { phase: "Verification", section: "Verification Gates", item: "Verification-3: SME+PM+CST Assigned Engineer, Lead & CST Manager, Throughout RMEYE Verification with analytics & Alarm validation" },

  // Phase 7 - Project Closure
  { phase: "Phase 7", section: "Project Closure", item: "Final internal review completed" },
  { phase: "Phase 7", section: "Project Closure", item: "Review with TL completed" },
  { phase: "Phase 7", section: "Project Closure", item: "Review with PM / SME / CS completed" },
  { phase: "Phase 7", section: "Project Closure", item: "MOM signed by stakeholders" },
  { phase: "Phase 7", section: "Project Closure", item: "If issues found on analytics → Phase-5 repeated" },
  { phase: "Phase 7", section: "Project Closure", item: "Final MOM (Verification-4) signed by customer" },
  { phase: "Phase 7", section: "Project Closure", item: "Project documents, evidence & Jira archived" },
  { phase: "Phase 7", section: "Project Closure", item: "Project formally closed" }
];

app.use(express.json());
app.use(express.static('public'));

// API Routes

// Get all projects
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
});

// Create new project
app.post('/api/projects', (req, res) => {
  const { name, customer, created_by } = req.body;
  const id = uuidv4().substring(0, 8);
  
  db.prepare('INSERT INTO projects (id, name, customer, created_by) VALUES (?, ?, ?, ?)').run(id, name, customer, created_by);
  
  // Create checklist items for this project
  const insertItem = db.prepare(`
    INSERT INTO checklist_items (project_id, phase, section, item_text) 
    VALUES (?, ?, ?, ?)
  `);
  
  for (const item of checklistTemplate) {
    insertItem.run(id, item.phase, item.section, item.item);
  }
  
  res.json({ id, name, customer, created_by });
});

// Get project by ID
app.get('/api/projects/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Get checklist items for a project
app.get('/api/projects/:id/checklist', (req, res) => {
  const items = db.prepare(`
    SELECT * FROM checklist_items 
    WHERE project_id = ? 
    ORDER BY id
  `).all(req.params.id);
  res.json(items);
});

// Update checklist item
app.put('/api/checklist/:itemId', (req, res) => {
  const { applicability, status, owner, initiate_date, complete_date, remarks, updated_by } = req.body;
  
  db.prepare(`
    UPDATE checklist_items 
    SET applicability = ?, status = ?, owner = ?, initiate_date = ?, complete_date = ?, remarks = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(applicability, status, owner, initiate_date, complete_date, remarks, updated_by, req.params.itemId);
  
  res.json({ success: true });
});

// Get project progress
app.get('/api/projects/:id/progress', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'Pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN applicability = 'Not Applicable' THEN 1 ELSE 0 END) as not_applicable
    FROM checklist_items 
    WHERE project_id = ?
  `).get(req.params.id);
  
  res.json(stats);
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const { name, customer } = req.body;
  db.prepare('UPDATE projects SET name = ?, customer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, customer, req.params.id);
  res.json({ success: true });
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  db.prepare('DELETE FROM checklist_items WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Duplicate project
app.post('/api/projects/:id/duplicate', (req, res) => {
  const originalProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!originalProject) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const newId = uuidv4().substring(0, 8);
  const newName = `${originalProject.name} (Copy)`;
  
  db.prepare('INSERT INTO projects (id, name, customer, created_by) VALUES (?, ?, ?, ?)').run(newId, newName, originalProject.customer, originalProject.created_by);
  
  // Copy all checklist items with their status
  const items = db.prepare('SELECT * FROM checklist_items WHERE project_id = ?').all(req.params.id);
  const insertItem = db.prepare(`
    INSERT INTO checklist_items (project_id, phase, section, item_text, applicability, status, owner, initiate_date, complete_date, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const item of items) {
    insertItem.run(newId, item.phase, item.section, item.item_text, item.applicability, item.status, item.owner, item.initiate_date, item.complete_date, item.remarks);
  }
  
  res.json({ id: newId, name: newName });
});

// Get phase-wise analytics
app.get('/api/projects/:id/analytics', (req, res) => {
  const phaseStats = db.prepare(`
    SELECT 
      phase,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'Pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN applicability = 'Not Applicable' THEN 1 ELSE 0 END) as not_applicable
    FROM checklist_items 
    WHERE project_id = ?
    GROUP BY phase
    ORDER BY phase
  `).all(req.params.id);
  
  const ownerStats = db.prepare(`
    SELECT 
      COALESCE(owner, 'Unassigned') as owner,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
    FROM checklist_items 
    WHERE project_id = ? AND applicability != 'Not Applicable'
    GROUP BY owner
    ORDER BY total DESC
  `).all(req.params.id);
  
  res.json({ phaseStats, ownerStats, overdueItems: [] });
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve project page
app.get('/project/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           RMEYE Checklist Server Running                      ║
║                                                              ║
║   Local:   http://localhost:${PORT}                           ║
║                                                              ║
║   Share this link with your team!                            ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
