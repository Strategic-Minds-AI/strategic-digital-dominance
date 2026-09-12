import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// ===== APP-SPECIFIC =====
// Google Workspace Sync — creates the full Google infrastructure for the contractor simulation system.
// Uses authorized connectors (googlesheets, googlecalendar) and attempts BYO_SHARED connectors (googledrive, googledocs, googletasks).
// Returns a comprehensive status report of what was synced and what needs authorization.
//
// The function receives archetype, visitor, admin profile, and questionnaire data from the frontend,
// creates a master Google Sheet with all data, creates Calendar events for the simulation schedule,
// and attempts to create Drive folders, Tasks lists, and Docs templates.

// Google Drive, Docs, and Tasks are SHARED connectors (platform OAuth app)
// Use getConnection(integration_type) — NOT getWorkspaceConnection

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { archetypes = [], visitors = [], adminProfiles = [], questionnaire = [] } = body;

    const status = {};
    const needsAuth = [];

    // ── 1. GOOGLE SHEETS (authorized) ──
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

      // Create the master spreadsheet
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: { title: "Xtreme AI — Contractor Simulation System" },
          sheets: [
            { properties: { title: "Contractor Archetypes", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Simulated Visitors", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Admin Profiles", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Questionnaire", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Email Templates", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Agent Task Matrix", gridProperties: { frozenRowCount: 1 } } },
          ],
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        console.error("Sheets create error:", errText);
        status.sheets = `Error: ${errText}`;
      } else {
        const sheetData = await createRes.json();
        const spreadsheetId = sheetData.spreadsheetId;
        const spreadsheetUrl = sheetData.spreadsheetUrl;

        // Write Archetypes sheet
        const archetypeHeader = ["Name", "Archetype Type", "Business Name", "Business Size", "Years", "Annual Revenue", "Crew Count", "Tech Skill", "Ambition", "Budget", "Family Size", "Pain Points", "Goals", "Fears", "Act-As Prompt"];
        const archetypeRows = (archetypes || []).map(a => [
          a.name, a.archetype_type, a.business_name, a.business_size, a.years_in_business,
          a.annual_revenue, a.crew_count, a.tech_skill_level, a.ambition_level, a.budget_mindset,
          a.family_size, (a.pain_points || []).join("; "), (a.goals || []).join("; "), (a.fears || []).join("; "),
          a.act_as_prompt?.substring(0, 4000) || "",
        ]);
        await writeSheetData(accessToken, spreadsheetId, "Contractor Archetypes!A1", [archetypeHeader, ...archetypeRows]);

        // Write Visitors sheet
        const visitorHeader = ["Name", "Visitor ID", "Type", "Age", "Income", "Location", "Home Type", "Search Intent", "Conversion %", "Lead Score", "Status", "Assigned Archetype", "Pain Points", "Objections"];
        const visitorRows = (visitors || []).map(v => [
          v.name, v.visitor_id, v.visitor_type, v.demographics?.age, v.demographics?.income,
          v.demographics?.location, v.demographics?.home_type, v.search_intent,
          v.conversion_probability, v.lead_score, v.status, v.assigned_archetype,
          (v.pain_points || []).join("; "), (v.objections || []).join("; "),
        ]);
        await writeSheetData(accessToken, spreadsheetId, "Simulated Visitors!A1", [visitorHeader, ...visitorRows]);

        // Write Admin Profiles sheet
        const profileHeader = ["Name", "Profile Type", "Tech Skill", "Focus Areas", "Decision Style", "Access Level", "Opinionated Stance", "Assigned Archetypes"];
        const profileRows = (adminProfiles || []).map(p => [
          p.name, p.profile_type, p.tech_skill_level, (p.focus_areas || []).join("; "),
          p.decision_style, p.access_level, p.opinionated_stance, (p.assigned_archetypes || []).join("; "),
        ]);
        await writeSheetData(accessToken, spreadsheetId, "Admin Profiles!A1", [profileHeader, ...profileRows]);

        // Write Questionnaire sheet
        const questHeader = ["Category", "Weight %", "Question ID", "Question", "Max Score"];
        const questRows = [];
        (questionnaire || []).forEach(cat => {
          cat.questions.forEach(q => {
            questRows.push([cat.name, cat.weight, q.id, q.text, q.maxScore]);
          });
        });
        await writeSheetData(accessToken, spreadsheetId, "Questionnaire!A1", [questHeader, ...questRows]);

        // Write Email Templates sheet
        const emailHeader = ["Template Name", "Email Address", "Direction", "Category", "Trigger", "Subject Line", "Body Template", "Tone", "Active"];
        const emailRows = [
          ["Bid Request Confirmation", "bids@epoxyquotenearme.com", "Inbound", "Lead Capture", "Customer sends bid request", "We received your bid request!", "Hi {name}, we received your request for {service_type}. We'll send your estimate within 24 hours. Here's what happens next...", "Professional", "TRUE"],
          ["Estimate Delivery", "bids@epoxyquotenearme.com", "Outbound", "Estimating", "Estimate generated", "Your epoxy garage floor estimate is ready", "Hi {name}, your estimate for your {garage_size} garage is ready. Price range: ${low}-${high}. View your estimate here: {link}", "Professional", "TRUE"],
          ["Follow-Up 3 Day", "bids@epoxyquotenearme.com", "Outbound", "Follow-Up", "3 days after estimate", "Still thinking about your garage floor?", "Hi {name}, just checking in. Here's a visualizer render of your garage in the color you liked: {visualizer_link}", "Warm", "TRUE"],
          ["Support Welcome", "support@epoxyquotenearme.com", "Inbound", "Customer Service", "Customer emails support", "We received your message", "Hi {name}, we received your message about {issue}. Our team will respond within 2 hours during business hours.", "Empathetic", "TRUE"],
          ["Install Day Update", "support@epoxyquotenearme.com", "Outbound", "Installation", "Install day progress", "Your garage floor installation is underway!", "Hi {name}, your installation is progressing. Base coat applied — topcoat at {time}. You can park by {park_time}.", "Informative", "TRUE"],
          ["Review Request", "support@epoxyquotenearme.com", "Outbound", "Reviews", "24hrs after job completion", "How's your new garage floor?", "Hi {name}, we hope you love your new floor! Would you mind leaving us a review? It takes 30 seconds: {review_link}", "Warm", "TRUE"],
          ["7-Day Check-In", "support@epoxyquotenearme.com", "Outbound", "Quality Assurance", "7 days after install", "How's your floor holding up?", "Hi {name}, it's been a week since your installation. Any issues? Reply here and we'll take care of it immediately.", "Caring", "TRUE"],
        ];
        await writeSheetData(accessToken, spreadsheetId, "Email Templates!A1", [emailHeader, ...emailRows]);

        // Write Agent Task Matrix sheet
        const agentHeader = ["Agent Name", "Task Category", "Task Title", "Priority", "Deadline", "Expected Result", "Google Task List", "Status"];
        const agentRows = [
          ["lead_orchestrator", "Lead Capture", "Qualify new inbound leads", "high", "Within 1 hour of lead", "Lead qualified and routed", "Lead Orchestrator Tasks", "Active"],
          ["lead_orchestrator", "Follow-Up", "Send 3-day follow-up sequence", "high", "3 days after estimate", "Lead re-engaged or marked cold", "Lead Orchestrator Tasks", "Active"],
          ["seo_manager", "SEO", "Audit and optimize landing pages", "medium", "Weekly", "SEO score improved", "SEO Manager Tasks", "Active"],
          ["social_manager", "Social Media", "Generate and schedule social posts", "medium", "Daily", "3+ posts per week", "Social Manager Tasks", "Active"],
          ["reputation_manager", "Reviews", "Send review requests to completed jobs", "high", "24hrs after completion", "5-star review collected", "Reputation Manager Tasks", "Active"],
          ["site_factory_manager", "Website Factory", "Monitor and optimize deployed sites", "medium", "Daily", "All sites healthy", "Site Factory Tasks", "Active"],
          ["comms_manager", "Communications", "Process inbound bids@ and support@ emails", "high", "Within 2 hours", "All emails responded to", "Comms Manager Tasks", "Active"],
          ["swarm_orchestrator", "Orchestration", "Daily swarm audit and task assignment", "critical", "Daily 8 AM", "All agents on task", "Swarm Orchestrator Tasks", "Active"],
        ];
        await writeSheetData(accessToken, spreadsheetId, "Agent Task Matrix!A1", [agentHeader, ...agentRows]);

        // Format header rows
        await formatSheetHeaders(accessToken, spreadsheetId, 6);

        status.sheets = `Created with ${(archetypes || []).length} archetypes, ${(visitors || []).length} visitors, ${(adminProfiles || []).length} profiles, ${(questionnaire || []).length} questionnaire categories, 7 email templates, 8 agent tasks`;
        status.sheetUrl = spreadsheetUrl;
        status.spreadsheetId = spreadsheetId;
      }
    } catch (err) {
      console.error("Sheets error:", err.message);
      status.sheets = `Error: ${err.message}`;
    }

    // ── 2. GOOGLE CALENDAR (authorized) ──
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");

      // Create a 60-day simulation schedule
      const now = new Date();
      const events = [];
      for (let day = 1; day <= 60; day += 5) {
        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() + day);
        const startTime = eventDate.toISOString();
        const endTime = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString();

        const eventRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: `Simulation Checkpoint — Day ${day}`,
            description: `QA validation checkpoint for the 60-day contractor workflow simulation. Review tasks completed, scores, and gaps.`,
            start: { dateTime: startTime },
            end: { dateTime: endTime },
            colorId: day % 5 === 0 ? "11" : "5",
          }),
        });

        if (eventRes.ok) {
          events.push(`Day ${day}`);
        }
      }

      status.calendar = `Created ${events.length} QA checkpoint events across 60 days`;
    } catch (err) {
      console.error("Calendar error:", err.message);
      status.calendar = `Error: ${err.message}`;
    }

    // ── 3. GOOGLE DRIVE (BYO_SHARED — needs authorization) ──
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");

      // Create root folder
      const folderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Xtreme AI — Contractor Simulation",
          mimeType: "application/vnd.google-apps.folder",
        }),
      });

      if (folderRes.ok) {
        const rootFolder = await folderRes.json();
        const rootFolderId = rootFolder.id;

        // Create subfolders for each archetype
        const archetypeFolders = [];
        for (const archetype of (archetypes || [])) {
          const subRes = await fetch("https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `${archetype.name} — ${archetype.business_name}`,
              mimeType: "application/vnd.google-apps.folder",
              parents: [rootFolderId],
            }),
          });
          if (subRes.ok) archetypeFolders.push(archetype.name);
        }

        // Create system subfolders
        const systemFolders = ["Email Templates", "Simulation Reports", "Questionnaire Results", "Agent Task Logs"];
        for (const folderName of systemFolders) {
          await fetch("https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: folderName,
              mimeType: "application/vnd.google-apps.folder",
              parents: [rootFolderId],
            }),
          });
        }

        status.drive = `Created root folder + ${archetypeFolders.length} archetype folders + ${systemFolders.length} system folders`;
      }
    } catch (err) {
      console.error("Drive error:", err.message);
      status.drive = "Needs authorization";
      needsAuth.push("Google Drive");
    }

    // ── 4. GOOGLE TASKS (BYO_SHARED — needs authorization) ──
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googletasks");

      // Create task lists for each agent
      const agents = [
        "Lead Orchestrator Tasks",
        "SEO Manager Tasks",
        "Social Manager Tasks",
        "Reputation Manager Tasks",
        "Site Factory Tasks",
        "Comms Manager Tasks",
        "Swarm Orchestrator Tasks",
      ];

      const taskListsCreated = [];
      for (const listName of agents) {
        const listRes = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: listName }),
        });
        if (listRes.ok) taskListsCreated.push(listName);
      }

      status.tasks = `Created ${taskListsCreated.length} agent task lists`;
    } catch (err) {
      console.error("Tasks error:", err.message);
      status.tasks = "Needs authorization";
      needsAuth.push("Google Tasks");
    }

    // ── 5. GOOGLE DOCS (BYO_SHARED — needs authorization) ──
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledocs");

      // Create email template docs
      const templatesCreated = [];
      const templates = [
        { name: "Bid Request Confirmation Template", content: "Email template for inbound bid requests to bids@epoxyquotenearme.com" },
        { name: "Estimate Delivery Template", content: "Email template for outbound estimate delivery" },
        { name: "Support Welcome Template", content: "Email template for inbound support emails to support@epoxyquotenearme.com" },
        { name: "Review Request Template", content: "Email template for post-job review requests" },
      ];

      for (const tpl of templates) {
        const docRes = await fetch("https://docs.googleapis.com/v1/documents", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: tpl.name }),
        });
        if (docRes.ok) templatesCreated.push(tpl.name);
      }

      status.docs = `Created ${templatesCreated.length} email template docs`;
    } catch (err) {
      console.error("Docs error:", err.message);
      status.docs = "Needs authorization";
      needsAuth.push("Google Docs");
    }

    return Response.json({
      success: true,
      status,
      needsAuth,
      sheetUrl: status.sheetUrl,
      spreadsheetId: status.spreadsheetId,
      message: needsAuth.length > 0
        ? `Partial sync complete. Authorize ${needsAuth.join(", ")} to complete the full sync.`
        : "Full Google Workspace sync complete!",
    });
  } catch (error) {
    console.error("googleWorkspaceSync error:", error);
    return Response.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}

async function writeSheetData(accessToken, spreadsheetId, range, values) {
  return await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
}

async function formatSheetHeaders(accessToken, spreadsheetId, sheetCount) {
  const requests = [];
  for (let i = 0; i < sheetCount; i++) {
    requests.push({
      repeatCell: {
        range: { sheetId: i, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 0.83, green: 0.69, blue: 0.22 },
          },
        },
        fields: "userEnteredFormat(textFormat,backgroundColor)",
      },
    });
  }
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });
}