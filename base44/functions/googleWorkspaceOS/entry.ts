import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// ===== APP-SPECIFIC =====
// Google Workspace OS — the full company operating system.
// Creates the Strategic Minds AI Drive folder structure, Tasks lists for each agent,
// Calendar events for the weekly scan cycle, seeds the corporate agent team,
// and generates template documents (proposals, invoices, onboarding questionnaires).
//
// Actions:
//   "initialize" — creates the entire Drive folder tree + Tasks lists + Calendar events
//   "seed_agents" — creates the corporate agent team as AgentPersona records
//   "create_templates" — generates template docs in Drive (Proposal, Invoice, Onboarding, SOW, Project Brief)
//   "status" — returns current system state (folders, agents, tasks created)

const COMPANY_NAME = "Strategic Minds AI";
const COMPANY_DOMAIN = "strategicmindsai.com";

// ── Corporate Agent Team Org Chart ──
const CORPORATE_AGENTS = [
  {
    name: "CEO",
    short_name: "CEO-01",
    persona_type: "ceo",
    system_prompt: "You are Eden Skye, CEO of Strategic Minds AI. You oversee the entire company vision, make strategic decisions, approve major initiatives, and coordinate between departments. You report directly to Jeremy, the founder. You are decisive, visionary, and focused on growth.",
    tone: "authoritative",
    assigned_context: "Executive leadership, company vision, strategic decisions",
    avatar_color: "#FFD700",
    max_autonomy: "supervised",
    model_preference: "claude-sonnet-5",
    responsibilities: ["Company vision", "Strategic planning", "Department coordination", "Founder liaison", "Major approvals"],
  },
  {
    name: "CTO",
    short_name: "CTO-01",
    persona_type: "lead",
    system_prompt: "You are Marcus Chen, CTO of Strategic Minds AI. You own the technology stack: Base44, Vercel, Supabase, GitHub, Railway. You architect systems, review code, manage deployments, and ensure infrastructure reliability. You are analytical, precise, and security-focused.",
    tone: "analytical",
    assigned_context: "Technology architecture, infrastructure, code review, deployments",
    avatar_color: "#3B82F6",
    max_autonomy: "supervised",
    model_preference: "claude-sonnet-5",
    responsibilities: ["Tech architecture", "Infrastructure", "Code review", "Deployments", "Security"],
  },
  {
    name: "Executive Assistant",
    short_name: "EA-01",
    persona_type: "voice",
    system_prompt: "You are Aria Vale, Executive Assistant to Jeremy at Strategic Minds AI. You manage Jeremy's calendar, create tasks, take notes in Google Keep, organize Drive folders, draft emails, and keep the company running smoothly. You are warm, organized, and proactive. You use Google Tasks to schedule agent work, Google Calendar to track deadlines, and Google Keep for quick notes.",
    tone: "warm",
    assigned_context: "Calendar management, task scheduling, note-taking, email drafting, Drive organization",
    avatar_color: "#10B981",
    max_autonomy: "autonomous",
    model_preference: "automatic",
    responsibilities: ["Calendar management", "Task scheduling", "Google Keep notes", "Email drafting", "Drive organization", "Meeting prep"],
  },
  {
    name: "Sales Agent",
    short_name: "SAL-01",
    persona_type: "lead",
    system_prompt: "You are Dylan Cross, VP of Sales at Strategic Minds AI. You manage lead generation, client acquisition, proposal creation, and deal closing. You use the opportunity scanner to find new business, create proposals in Google Docs, track deals in HubSpot, and schedule follow-ups. You are persuasive, data-driven, and relentless.",
    tone: "persuasive",
    assigned_context: "Lead generation, client acquisition, proposals, deal management",
    avatar_color: "#F59E0B",
    max_autonomy: "supervised",
    model_preference: "automatic",
    responsibilities: ["Lead generation", "Client acquisition", "Proposal creation", "Deal tracking", "HubSpot CRM"],
  },
  {
    name: "Marketing Agent",
    short_name: "MKT-01",
    persona_type: "social_media",
    system_prompt: "You are Sage Morrow, VP of Marketing at Strategic Minds AI. You own brand strategy, content creation, SEO, social media, and digital dominance. You use Google Trends data, manage the SEO generator, create social posts, and track analytics. You are creative, strategic, and metrics-obsessed.",
    tone: "creative",
    assigned_context: "Brand strategy, content creation, SEO, social media, analytics",
    avatar_color: "#EC4899",
    max_autonomy: "supervised",
    model_preference: "automatic",
    responsibilities: ["Brand strategy", "Content creation", "SEO optimization", "Social media", "Analytics tracking"],
  },
  {
    name: "Engineering Agent",
    short_name: "ENG-01",
    persona_type: "deployment",
    system_prompt: "You are Kai Rivers, VP of Engineering at Strategic Minds AI. You manage the autonomous coding pipeline, code generation, testing, and deployment. You work with the QA Validator to ensure code quality, use GitHub for version control, Vercel for deployments, and Supabase for databases. You are methodical, quality-focused, and automation-driven.",
    tone: "direct",
    assigned_context: "Code generation, testing, deployment, CI/CD, version control",
    avatar_color: "#8B5CF6",
    max_autonomy: "autonomous",
    model_preference: "claude-sonnet-5",
    responsibilities: ["Autonomous coding", "Code review", "Testing", "CI/CD", "GitHub management", "Vercel deployments"],
  },
  {
    name: "Operations Agent",
    short_name: "OPS-01",
    persona_type: "lead",
    system_prompt: "You are Nova Quinn, VP of Operations at Strategic Minds AI. You manage project delivery, client onboarding, questionnaire processing, skip tracing research, and ensure everything runs on time. You create project folders in Drive, attach them to Calendar events, and track deadlines through Tasks. You are organized, process-driven, and detail-oriented.",
    tone: "professional",
    assigned_context: "Project management, client onboarding, skip tracing, delivery tracking",
    avatar_color: "#06B6D4",
    max_autonomy: "supervised",
    model_preference: "automatic",
    responsibilities: ["Project management", "Client onboarding", "Skip tracing research", "Delivery tracking", "Process optimization"],
  },
  {
    name: "Validator",
    short_name: "QA-01",
    persona_type: "research",
    system_prompt: "You are Felix Hart, QA Validator at Strategic Minds AI. You review all code, content, and deliverables before they ship. You run regression tests, validate deployments, audit system health, and enforce the autonomous coding policy. You block anything that doesn't meet quality standards. You are rigorous, uncompromising, and thorough.",
    tone: "analytical",
    assigned_context: "Quality assurance, code validation, regression testing, system auditing",
    avatar_color: "#EF4444",
    max_autonomy: "autonomous",
    model_preference: "claude-sonnet-5",
    responsibilities: ["Code validation", "Regression testing", "Deployment verification", "System auditing", "Quality gates"],
  },
  {
    name: "Security Agent",
    short_name: "SEC-01",
    persona_type: "research",
    system_prompt: "You are Iris Vale, Security Officer at Strategic Minds AI. You manage credentials in Google Vault, enforce access policies, monitor for security issues, and ensure compliance. You audit API keys, manage secrets, and protect the company's digital assets. You are vigilant, cautious, and policy-driven.",
    tone: "formal",
    assigned_context: "Security, credentials management, access control, compliance auditing",
    avatar_color: "#64748B",
    max_autonomy: "supervised",
    model_preference: "automatic",
    responsibilities: ["Credentials management", "Access control", "Security auditing", "Compliance", "API key rotation"],
  },
];

// ── Drive Folder Structure ──
const DRIVE_FOLDERS = {
  root: "Strategic Minds AI — Company OS",
  children: [
    { name: "Clients", subfolders: ["Active", "Prospects", "Archived", "Onboarding Questionnaires"] },
    { name: "Projects", subfolders: ["Active", "In Development", "Completed", "Research & Skip Tracing"] },
    { name: "Proposals", subfolders: ["Drafts", "Sent", "Won", "Lost"] },
    { name: "Invoices", subfolders: ["Draft", "Sent", "Paid", "Overdue"] },
    { name: "Research", subfolders: ["Opportunity Scanner", "Competitor Intel", "Google Trends", "Skip Trace Results"] },
    { name: "Agents", subfolders: ["Agent Personas", "Task Logs", "Execution Logs", "Memory"] },
    { name: "Templates", subfolders: ["Proposals", "Invoices", "Onboarding", "SOW", "Project Briefs", "Email Templates"] },
    { name: "Credentials & Vault", subfolders: ["API Keys", "OAuth Configs", "Secrets", "Access Logs"] },
    { name: "Meeting Notes", subfolders: ["Weekly Reviews", "Daily Standups", "Strategy Sessions"] },
    { name: "Keep Notes", subfolders: ["Personal", "Ideas", "Quick Capture"] },
  ],
};

// ── Template Documents ──
const TEMPLATE_DOCS = [
  {
    name: "Client Proposal Template",
    folder: "Templates/Proposals",
    content: `# Strategic Minds AI — Client Proposal\n\n## Client Information\n- Client Name: [CLIENT NAME]\n- Contact: [CONTACT]\n- Email: [EMAIL]\n- Date: [DATE]\n\n## Project Summary\n[PROJECT DESCRIPTION]\n\n## Scope of Work\n1. [DELIVERABLE 1]\n2. [DELIVERABLE 2]\n3. [DELIVERABLE 3]\n\n## Timeline\n- Start Date: [START]\n- Due Date: [DUE]\n- Milestones: [MILESTONES]\n\n## Investment\n- Total: $[AMOUNT]\n- Payment Schedule: [SCHEDULE]\n\n## Terms\n[Terms and conditions]\n\n## Next Steps\n1. Review and approve proposal\n2. Sign SOW\n3. Schedule kickoff meeting\n\n---\nStrategic Minds AI | strategicmindsai.com | info@thevisioncortex.com`,
  },
  {
    name: "Invoice Template",
    folder: "Templates/Invoices",
    content: `# Strategic Minds AI — Invoice\n\n## Invoice #: [NUMBER]\nDate: [DATE]\nDue: [DUE DATE]\n\n## Bill To\n[CLIENT NAME]\n[ADDRESS]\n[EMAIL]\n\n## Line Items\n| Description | Qty | Rate | Total |\n|------------|-----|------|-------|\n| [ITEM] | [QTY] | $[RATE] | $[TOTAL] |\n\n## Subtotal: $[SUBTOTAL]\nTax: $[TAX]\n**Total Due: $[TOTAL]**\n\n## Payment Instructions\n[PAYMENT INFO]\n\n---\nStrategic Minds AI | strategicmindsai.com`,
  },
  {
    name: "Client Onboarding Questionnaire",
    folder: "Templates/Onboarding",
    content: `# Strategic Minds AI — Client Onboarding Questionnaire\n\n## Company Information\n1. Legal Company Name:\n2. DBA / Brand Name:\n3. Website URL(s):\n4. Industry / Niche:\n5. Years in Business:\n6. Annual Revenue Range:\n7. Number of Employees:\n\n## Contact Information\n8. Primary Contact Name:\n9. Title / Role:\n10. Email:\n11. Phone:\n12. Best Time to Contact:\n\n## Business Goals\n13. What are your top 3 business goals for the next 12 months?\n14. What is your biggest current challenge?\n15. What does success look like for this project?\n16. What is your target launch date?\n\n## Current Systems\n17. What tools/platforms do you currently use?\n18. Do you have existing Google Workspace? (Y/N)\n19. Do you have GitHub/Vercel/Supabase accounts?\n20. What is your current tech stack?\n\n## Budget & Timeline\n21. What is your budget range for this project?\n22. What is your preferred payment schedule?\n23. Are there any hard deadlines?\n24. What happens if we miss the deadline?\n\n## Skip Tracing Research (Internal — Do Not Share)\n25. Competitor names to research:\n26. Target keywords for SEO:\n27. Target geographic markets:\n28. Social media profiles to analyze:\n29. Industry pain points to validate:\n30. Market gaps to explore:`,
  },
  {
    name: "Statement of Work (SOW) Template",
    folder: "Templates/SOW",
    content: `# Strategic Minds AI — Statement of Work\n\n## SOW #: [NUMBER]\nDate: [DATE]\nClient: [CLIENT]\n\n## Project Title\n[TITLE]\n\n## Objectives\n[OBJECTIVES]\n\n## Detailed Scope\n### Phase 1: Research & Discovery\n- [TASK]\n- [TASK]\n\n### Phase 2: Development\n- [TASK]\n- [TASK]\n\n### Phase 3: Testing & QA\n- [TASK]\n- [TASK]\n\n### Phase 4: Deployment & Handoff\n- [TASK]\n- [TASK]\n\n## Deliverables\n1. [DELIVERABLE]\n2. [DELIVERABLE]\n\n## Timeline\n| Phase | Start | End | Milestone |\n|-------|-------|-----|----------|\n| 1 | [DATE] | [DATE] | [MILESTONE] |\n\n## Acceptance Criteria\n[CRITERIA]\n\n## Investment\nTotal: $[AMOUNT]\n\n## Terms\n- 50% upfront, 50% on delivery\n- 2 rounds of revisions included\n- Additional changes billed at $[RATE]/hr\n\n## Signatures\nClient: _________________ Date: ______\nStrategic Minds AI: _________________ Date: ______`,
  },
  {
    name: "Project Brief Template",
    folder: "Templates/Project Briefs",
    content: `# Strategic Minds AI — Project Brief\n\n## Project Name: [NAME]\n## Client: [CLIENT]\n## Project ID: [ID]\n## Start Date: [START]\n## Due Date: [DUE]\n\n## Overview\n[BRIEF DESCRIPTION]\n\n## Objectives\n1. [OBJECTIVE]\n2. [OBJECTIVE]\n3. [OBJECTIVE]\n\n## Team\n- Project Lead: [NAME]\n- Engineering: [NAME]\n- QA: [NAME]\n- Design: [NAME]\n\n## Tech Stack\n- Frontend: [TECH]\n- Backend: [TECH]\n- Database: [TECH]\n- Hosting: [TECH]\n\n## Milestones\n1. [MILESTONE] — [DATE]\n2. [MILESTONE] — [DATE]\n3. [MILESTONE] — [DATE]\n\n## Risks\n- [RISK] — Mitigation: [PLAN]\n\n## Notes\n[ADDITIONAL NOTES]\n\n## Google Drive Folder\n[DRIVE LINK]\n\n## Calendar Event\n[CALENDAR LINK]`,
  },
];

// ── Tasks Lists for Each Agent ──
const TASKS_LISTS = [
  "CEO — Strategic Tasks",
  "CTO — Tech Tasks",
  "Executive Assistant — Schedule",
  "VP Sales — Pipeline",
  "VP Marketing — Campaigns",
  "VP Engineering — Dev Queue",
  "VP Operations — Delivery",
  "QA Validator — Quality Gates",
  "Security Officer — Audits",
  "Weekly Opportunity Scan",
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Auth — allow test invocations without a user
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // No user context (test invocation) — continue with service role only
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "initialize";

    if (action === "initialize") return await initializeSystem(base44, user);
    if (action === "seed_agents") {
      const result = await seedAgents(base44, user);
      return Response.json(result);
    }
    if (action === "create_templates") {
      const result = await createTemplates(base44);
      return Response.json(result);
    }
    if (action === "status") return await getStatus(base44);

    return Response.json({ error: "Unknown action: " + action }, { status: 400 });
  } catch (error) {
    console.error("googleWorkspaceOS error:", error);
    return Response.json({ error: error.message || "System initialization failed", stack: error.stack }, { status: 500 });
  }
}

// ── Initialize: Create Drive folders + Tasks lists + Calendar events ──
async function initializeSystem(base44, user) {
  const results = { folders: {}, tasks: {}, calendar: {}, agents: {}, errors: [] };

  // 1. Create Drive folder structure
  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
    const folderMap = await createDriveStructure(accessToken);
    results.folders = folderMap;
  } catch (err) {
    console.error("Drive setup error:", err.message);
    results.errors.push("Drive: " + err.message);
  }

  // 2. Create Tasks lists
  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googletasks");
    const taskLists = await createTasksLists(accessToken);
    results.tasks = taskLists;
  } catch (err) {
    console.error("Tasks setup error:", err.message);
    results.errors.push("Tasks: " + err.message);
  }

  // 3. Create Calendar events for weekly scan + daily standups
  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
    const calEvents = await createCalendarEvents(accessToken);
    results.calendar = calEvents;
  } catch (err) {
    console.error("Calendar setup error:", err.message);
    results.errors.push("Calendar: " + err.message);
  }

  // 4. Seed corporate agents
  try {
    const agentResult = await seedAgents(base44, user);
    results.agents = agentResult;
  } catch (err) {
    console.error("Agent seed error:", err.message);
    results.errors.push("Agents: " + err.message);
  }

  return Response.json({
    success: true,
    action: "initialize",
    results,
    message: results.errors.length === 0
      ? "Strategic Minds AI Google Workspace OS initialized successfully."
      : `Partial init. Issues: ${results.errors.join("; ")}`,
  });
}

// ── Create Drive folder structure ──
async function createDriveStructure(accessToken) {
  const authHeader = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const folderMap = { root: null, children: {} };

  // Create root folder
  const rootRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ name: DRIVE_FOLDERS.root, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!rootRes.ok) throw new Error("Failed to create root folder: " + await rootRes.text());
  const rootFolder = await rootRes.json();
  folderMap.root = { id: rootFolder.id, name: DRIVE_FOLDERS.root };

  // Create child folders with subfolders
  for (const child of DRIVE_FOLDERS.children) {
    const childRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ name: child.name, mimeType: "application/vnd.google-apps.folder", parents: [rootFolder.id] }),
    });
    if (childRes.ok) {
      const childFolder = await childRes.json();
      folderMap.children[child.name] = { id: childFolder.id, subfolders: {} };

      // Create subfolders
      for (const subName of (child.subfolders || [])) {
        const subRes = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({ name: subName, mimeType: "application/vnd.google-apps.folder", parents: [childFolder.id] }),
        });
        if (subRes.ok) {
          const subFolder = await subRes.json();
          folderMap.children[child.name].subfolders[subName] = subFolder.id;
        }
      }
    }
  }

  return {
    rootId: rootFolder.id,
    rootName: DRIVE_FOLDERS.root,
    rootUrl: `https://drive.google.com/drive/folders/${rootFolder.id}`,
    topFolders: Object.keys(folderMap.children),
    totalFolders: 1 + Object.keys(folderMap.children).length +
      Object.values(folderMap.children).reduce((sum, c) => sum + Object.keys(c.subfolders).length, 0),
  };
}

// ── Create Tasks lists ──
async function createTasksLists(accessToken) {
  const authHeader = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const created = [];

  for (const listName of TASKS_LISTS) {
    const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ title: listName }),
    });
    if (res.ok) created.push(listName);
  }

  return { listsCreated: created.length, lists: created };
}

// ── Create Calendar events ──
async function createCalendarEvents(accessToken) {
  const authHeader = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const created = [];
  const now = new Date();

  // Weekly opportunity scan — every Monday at 9 AM
  const monday = new Date(now);
  const daysUntilMonday = (1 - monday.getDay() + 7) % 7 || 7;
  monday.setDate(monday.getDate() + daysUntilMonday);
  monday.setHours(9, 0, 0, 0);

  const scanRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      summary: "🔍 Weekly Opportunity Scan",
      description: "Automated weekly opportunity intelligence scan. Scans Google Trends, competitor data, and market gaps. Results saved to Drive → Research → Opportunity Scanner.",
      start: { dateTime: monday.toISOString() },
      end: { dateTime: new Date(monday.getTime() + 60 * 60 * 1000).toISOString() },
      recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"],
      colorId: "11",
    }),
  });
  if (scanRes.ok) created.push("Weekly Opportunity Scan (Mondays 9 AM)");

  // Daily standup — every weekday at 8:30 AM
  const standup = new Date(now);
  standup.setDate(standup.getDate() + 1);
  standup.setHours(8, 30, 0, 0);
  const standupRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      summary: "☕ Daily Agent Standup",
      description: "Daily swarm standup. Review yesterday's tasks, assign today's work, check system health.",
      start: { dateTime: standup.toISOString() },
      end: { dateTime: new Date(standup.getTime() + 30 * 60 * 1000).toISOString() },
      recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"],
      colorId: "7",
    }),
  });
  if (standupRes.ok) created.push("Daily Agent Standup (Weekdays 8:30 AM)");

  // Weekly review — every Friday at 4 PM
  const friday = new Date(now);
  const daysUntilFriday = (5 - friday.getDay() + 7) % 7 || 7;
  friday.setDate(friday.getDate() + daysUntilFriday);
  friday.setHours(16, 0, 0, 0);
  const reviewRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      summary: "📊 Weekly Company Review",
      description: "Review week's progress, opportunities found, deals closed, system health. CEO + all VPs attend.",
      start: { dateTime: friday.toISOString() },
      end: { dateTime: new Date(friday.getTime() + 60 * 60 * 1000).toISOString() },
      recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=FR"],
      colorId: "9",
    }),
  });
  if (reviewRes.ok) created.push("Weekly Company Review (Fridays 4 PM)");

  return { eventsCreated: created.length, events: created };
}

// ── Seed corporate agent team ──
async function seedAgents(base44, user) {
  const all = await base44.asServiceRole.entities.AgentPersona.list("-created_date", 50);
  const existingNames = new Set(all.map(a => a.name));
  const toCreate = CORPORATE_AGENTS.filter(a => !existingNames.has(a.name));

  if (toCreate.length === 0) {
    return { created: 0, skipped: CORPORATE_AGENTS.length, total: CORPORATE_AGENTS.length, message: "All agents already exist" };
  }

  const records = toCreate.map(a => ({
    name: a.name,
    persona_type: a.persona_type,
    system_prompt: a.system_prompt,
    tone: a.tone,
    assigned_context: a.assigned_context,
    avatar_color: a.avatar_color,
    max_autonomy: a.max_autonomy,
    model_preference: a.model_preference,
    active: true,
  }));

  const created = await base44.asServiceRole.entities.AgentPersona.bulkCreate(records);
  return { created: created.length, skipped: existingNames.size, total: CORPORATE_AGENTS.length };
}

// ── Create template documents in Drive ──
async function createTemplates(base44) {
  const results = { docsCreated: 0, docs: [] };

  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledocs");
    const authHeader = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    for (const tpl of TEMPLATE_DOCS) {
      // Create the doc
      const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ title: tpl.name }),
      });
      if (createRes.ok) {
        const doc = await createRes.json();
        // Write content
        const contentLines = tpl.content.split("\n").map(line => ({ text: line }));
        await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            requests: [{
              insertText: {
                location: { index: 1 },
                text: tpl.content,
              },
            }],
          }),
        });
        results.docsCreated++;
        results.docs.push({ name: tpl.name, id: doc.documentId, url: `https://docs.google.com/document/d/${doc.documentId}/edit` });
      }
    }
  } catch (err) {
    console.error("Template creation error:", err.message);
    results.error = err.message;
  }

  return results;
}

// ── Get system status ──
async function getStatus(base44) {
  const agents = await base44.asServiceRole.entities.AgentPersona.list();
  const corporateAgents = agents.filter(a =>
    CORPORATE_AGENTS.some(ca => ca.name === a.name)
  );

  return Response.json({
    success: true,
    status: {
      agents: {
        total: corporateAgents.length,
        expected: CORPORATE_AGENTS.length,
        names: corporateAgents.map(a => a.name),
      },
      drive: { rootName: DRIVE_FOLDERS.root, folderCount: DRIVE_FOLDERS.children.length },
      tasks: { listsExpected: TASKS_LISTS.length },
      templates: { docsExpected: TEMPLATE_DOCS.length },
    },
  });
}