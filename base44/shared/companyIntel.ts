// ============================================================================
// companyIntel.ts — Source of truth for company facts + communication templates
// Shared by backend functions (aiAssist, companyIntel) and surfaced to the admin
// Xtreme Comms UI. Keeping this in base44/shared/ means the AI agent, the manual
// comms console, and the scraper all reference the SAME approved facts and
// scripts — eliminating hallucination and ambiguity in customer conversations.
// ============================================================================

export const COMPANY_FACTS = {
  name: "Xtreme Polishing Systems",
  short_name: "XPS",
  founded_year: 2007,
  years_in_business: new Date().getFullYear() - 2007,
  headquarters: "2200 NW 32nd St, Pompano Beach, FL 33069",
  sales_phone: "(877) 958-5264",
  // AI / SMS / MMS automation line — used for automated outreach, replies,
  // and as the escalation destination when a lead needs a human.
  automation_phone: "+1-833-700-1239",
  automation_phone_display: "1-833-700-1239",
  email: "jeremy@xtremepolishingsystems.com",
  website: "https://xtremepolishingsystems.com",
  locations_count: "40+",
  locations_note: "XPS XPress stores across FL, TX, VA, DC, NY, NJ, PA, SC, GA, NC, OK, WI, TN, IA, IL, MI, IN, OH, KY and growing",
  estimated_revenue: "$31.9M/year",
  industry: "Contractor supply — epoxy floor coatings, concrete polishing equipment, tooling, chemicals, and decorative concrete materials",
  business_model: "XPS supplies contractors and homeowners with professional-grade epoxy coatings, polyaspartic/urethane topcoats, metallic & solid pigments, glitter, flake/chip systems, grinding & polishing machines, dust collectors, and concrete chemicals. Also runs hands-on epoxy & concrete polishing training courses (PCU) at select training locations.",
  related_companies: [
    {
      name: "National Concrete Polishing",
      website: "https://nationalconcretepolishing.net",
      relationship: "Installation arm — same Pompano Beach HQ building (Ste 600). Handles residential, commercial, and government polished concrete & epoxy flooring installations nationwide.",
      years_experience: "35+ years",
      locations: "40+ US cities",
    },
  ],
  ratings: {
    google: { score: 5.0, count: 5, source: "Trustindex (Google-sourced)" },
    trustpilot: { score: 3.4, count: 2 },
    bbb: { grade: "B-", accredited: false },
    apple_maps: { score: "67% positive", count: 9 },
  },
  philosophy:
    "Your success is our success. We supply the industry with the best flooring equipment, coatings, tooling and chemicals at the most reasonable pricing, backed by expert training and support. Our support is always on.",
  product_lines: [
    "Epoxy floor coatings (100% solids, water-based, DIY kits)",
    "Polyaspartic & urethane topcoats (XPS Poly MC, 305 Polyurea)",
    "Metallic & solid-color pigments",
    "Glitter epoxy (ultra-fine & chunky)",
    "Decorative flake / chip garage systems",
    "Pre-mixed quartz coatings (FlexQuartz)",
    "Moisture barriers & primers",
    "Concrete densifiers, hardeners, dyes & stains",
    "Grinding & polishing machines, dust collectors, edge grinders",
    "Floor scrubbers, burnishers, scarifiers, shot blasters",
    "Joint fillers, repair mortars, overlayments",
  ],
  service_systems: [
    "Flake & Quartz Epoxy Flooring",
    "Metallic Epoxy Flooring",
    "Solid Color Epoxy Flooring",
    "Venetian Plaster",
  ],
};

// ----------------------------------------------------------------------------
// COMMUNICATION TEMPLATES
// {placeholders} are filled at send time. Channels: sms | mms | voice.
// These are the ONLY approved scripts — the AI agent must pick from these
// rather than improvising, to eliminate hallucination and ambiguity.
// ----------------------------------------------------------------------------
export const COMMS_TEMPLATES = [
  // ── Appointment scheduling ──
  {
    id: "appt_offer_consultation",
    category: "appointment_scheduling",
    channel: "sms",
    label: "Offer free in-home consultation",
    body: "Hi {name}, this is Xtreme Polishing Systems. Thanks for requesting your garage floor estimate! We'd love to lock in your free in-home consultation. Are you available {day_option_1} or {day_option_2} this week? Reply with your preferred time and we'll get you on the schedule. — The XPS Team",
    variables: ["name", "day_option_1", "day_option_2"],
  },
  {
    id: "appt_confirm",
    category: "appointment_scheduling",
    channel: "sms",
    label: "Confirm appointment",
    body: "Hi {name}, confirming your Xtreme Polishing Systems consultation for {day} at {time}. Our specialist will call/text you from {automation_phone}. Reply C to confirm or R to reschedule. See you soon!",
    variables: ["name", "day", "time", "automation_phone"],
  },
  {
    id: "appt_reminder_1hr",
    category: "appointment_scheduling",
    channel: "sms",
    label: "1-hour reminder",
    body: "Hi {name}, reminder: your XPS garage floor consultation is in 1 hour ({time}). Our specialist will reach out shortly. Reply if you need to reschedule.",
    variables: ["name", "time"],
  },
  {
    id: "appt_booked_human",
    category: "appointment_scheduling",
    channel: "sms",
    label: "Human appointment booked",
    body: "Great news {name}! I've booked your in-home estimate with a senior XPS flooring specialist for {day} at {time}. They'll call you from {automation_phone}. Want to browse our color charts first? {color_chart_url}",
    variables: ["name", "day", "time", "automation_phone", "color_chart_url"],
  },

  // ── Color charts ──
  {
    id: "color_chart_link",
    category: "color_charts",
    channel: "sms",
    label: "Send color chart link",
    body: "Hi {name}, here's the full XPS epoxy color chart with 100+ flake, metallic, solid, and glitter options: {color_chart_url}. Tap any color to see it on a real garage floor. Want me to text a few recommendations based on your space? — XPS",
    variables: ["name", "color_chart_url"],
  },
  {
    id: "color_chart_mms",
    category: "color_charts",
    channel: "mms",
    label: "MMS color swatches",
    body: "Hi {name}, attached are the 3 most popular XPS flake colors for {garage_size} garages in your area: Tidal Wave (blue/gray), Outback (tan/brown), and Smoke (gray/black/white). Want the full chart? {color_chart_url}",
    variables: ["name", "garage_size", "color_chart_url"],
  },
  {
    id: "color_recommendation",
    category: "color_charts",
    channel: "mms",
    label: "Personalized color rec",
    body: "Based on your {garage_size} garage, I'd recommend {color_name} ({color_code}) — it hides dirt well and pairs beautifully with most home exteriors. Here's what it looks like installed: {color_chart_url}. Want to see it on YOUR floor? Upload a photo at {visualizer_url}",
    variables: ["garage_size", "color_name", "color_code", "color_chart_url", "visualizer_url"],
  },

  // ── Google ratings / reviews ──
  {
    id: "ratings_share",
    category: "google_ratings",
    channel: "sms",
    label: "Share Google rating",
    body: "Hi {name}, you asked about our reputation — Xtreme Polishing Systems has been serving contractors and homeowners since 2007 with 40+ XPS XPress locations nationwide. We carry a 5.0-star Google rating from verified customers. Read the reviews here: {review_url}",
    variables: ["name", "review_url"],
  },
  {
    id: "ratings_review_request",
    category: "google_ratings",
    channel: "sms",
    label: "Request a review",
    body: "Hi {name}, we hope you're loving your new XPS garage floor! If you have 60 seconds, a quick Google review would mean the world to our team: {review_url}. Thank you! 🙏",
    variables: ["name", "review_url"],
  },

  // ── Production / process info ──
  {
    id: "production_process",
    category: "production_info",
    channel: "sms",
    label: "Explain the process",
    body: "Hi {name}, here's our 1-day garage floor process: 1) Diamond-grind & prep the concrete, 2) Repair cracks/joints, 3) Apply epoxy base coat, 4) Broadcast decorative flake, 5) Scrape & vacuum, 6) Apply polyaspartic topcoat. Most 2-car garages are done in one day and ready for light foot traffic in 24 hrs. Questions? — XPS",
    variables: ["name"],
  },
  {
    id: "production_timeline",
    category: "production_info",
    channel: "sms",
    label: "Timeline & curing",
    body: "Hi {name}, your install takes about 1 day for a standard 2-car garage. Foot traffic: 24 hrs. Vehicle traffic: 72 hrs. Full cure: 7 days. We'll send a reminder the day before. — XPS",
    variables: ["name"],
  },
  {
    id: "production_warranty",
    category: "production_info",
    channel: "sms",
    label: "Warranty info",
    body: "Hi {name}, all XPS-installed garage floors come with a lifetime residential warranty against peeling, bubbling, and delamination — backed by 18+ years in business and 40+ locations. Peace of mind included. — XPS",
    variables: ["name"],
  },

  // ── Rebuttals (objection handling) ──
  {
    id: "rebuttal_price",
    category: "rebuttals",
    channel: "sms",
    label: "Price objection",
    body: "I understand {name}. XPS isn't the cheapest — we use commercial-grade 100% solids epoxy and a polyaspartic topcoat (not the big-box water-based kits that peel in 2 years). Your floor is backed by a lifetime warranty and 18+ years of installs. Would a free in-home estimate help you compare apples-to-apples? — XPS",
    variables: ["name"],
  },
  {
    id: "rebuttal_diy",
    category: "rebuttals",
    channel: "sms",
    label: "DIY objection",
    body: "Totally fair, {name}! We actually sell DIY kits too at xtremepolishingsystems.com. The pros use pro-grade prep (diamond grinding, moisture testing) — that's 80% of a lasting floor. If you'd rather not rent a grinder, our installed price includes all prep. Want a quote to compare? — XPS",
    variables: ["name"],
  },
  {
    id: "rebuttal_timing",
    category: "rebuttals",
    channel: "sms",
    label: "Timing / not ready",
    body: "No problem {name} — no pressure at all. I'll keep your estimate on file. Want me to check back in {follow_up_window}, or sooner if your timeline moves up? — XPS",
    variables: ["name", "follow_up_window"],
  },
  {
    id: "rebuttal_competitor",
    category: "rebuttals",
    channel: "sms",
    label: "Competitor comparison",
    body: "Happy to compare {name}. Ask any competitor: (1) Is it 100% solids epoxy or water-based? (2) Is the topcoat polyaspartic or cheaper polyurethane? (3) Do they diamond-grind or just acid-etch? (4) What's the warranty? We do all four the right way. Want a side-by-side? — XPS",
    variables: ["name"],
  },

  // ── Google Calendar booking ──
  {
    id: "gcal_book_link",
    category: "google_calendar",
    channel: "sms",
    label: "Send booking link",
    body: "Hi {name}, pick a time that works for your free in-home estimate right from my calendar: {calendar_url}. It'll confirm instantly and send you a reminder. — XPS",
    variables: ["name", "calendar_url"],
  },
  {
    id: "gcal_followup_link",
    category: "google_calendar",
    channel: "sms",
    label: "Follow-up booking link",
    body: "Hi {name}, following up on your estimate. Ready to move forward? Grab a follow-up call with a specialist here: {calendar_url}. Or reply with a couple of times that work and I'll book it for you. — XPS",
    variables: ["name", "calendar_url"],
  },

  // ── Human escalation ──
  {
    id: "escalate_to_human",
    category: "human_escalation",
    channel: "sms",
    label: "Escalate to human (to lead)",
    body: "Hi {name}, I want to make sure you get the best answer on that. I'm bringing in a senior XPS flooring specialist — they'll text or call you from {automation_phone} within the next {response_window}. Is that okay? — XPS AI Assistant",
    variables: ["name", "automation_phone", "response_window"],
  },
  {
    id: "escalate_notify_agent",
    category: "human_escalation",
    channel: "sms",
    label: "Escalation notify (internal)",
    body: "⚠️ ESCALATION: Lead {lead_name} ({lead_phone}) needs a human. Reason: {escalation_reason}. Last message: \"{last_message}\". Please reach out from {automation_phone} within {response_window}. — XPS AI",
    variables: ["lead_name", "lead_phone", "escalation_reason", "last_message", "automation_phone", "response_window"],
  },

  // ── Follow-up ──
  {
    id: "followup_post_consult",
    category: "follow_up",
    channel: "sms",
    label: "Post-consultation follow-up",
    body: "Hi {name}, thanks for your consultation today! Here's your color chart again: {color_chart_url}. Any questions on the quote or colors? I can hold your pricing for {hold_window} if you're ready to move forward. — XPS",
    variables: ["name", "color_chart_url", "hold_window"],
  },
  {
    id: "followup_3day",
    category: "follow_up",
    channel: "sms",
    label: "3-day follow-up",
    body: "Hi {name}, just checking in on your garage floor estimate. Did you get a chance to review the colors? Happy to answer any questions or adjust the quote. — XPS",
    variables: ["name"],
  },

  // ── Nurture ──
  {
    id: "nurture_monthly",
    category: "nurture",
    channel: "sms",
    label: "Monthly nurture",
    body: "Hi {name}, it's XPS with your monthly garage-floor tip: protect your new coating by wiping spills quickly and using soft rubber casters on heavy items. Curious about a refresh or a new project? Reply anytime. — XPS",
    variables: ["name"],
  },
  {
    id: "nurture_seasonal",
    category: "nurture",
    channel: "mms",
    label: "Seasonal offer",
    body: "Hi {name}! 🍂 Seasonal special from XPS — {offer_details}. Valid through {expiry}. Want to see popular fall colors? {color_chart_url} — XPS",
    variables: ["name", "offer_details", "expiry", "color_chart_url"],
  },

  // ── Re-engagement ──
  {
    id: "reengage_cold",
    category: "reengagement",
    channel: "sms",
    label: "Re-engage cold lead",
    body: "Hi {name}, it's been a while! Still thinking about that garage floor? We've got new colors and a {offer_details} this month. Want a refreshed quote? Reply YES and I'll update it. — XPS",
    variables: ["name", "offer_details"],
  },

  // ── Voice scripts ──
  {
    id: "voice_outbound_intro",
    category: "voice",
    channel: "voice",
    label: "Outbound call intro script",
    body: "Hi, is this {name}? This is the Xtreme Polishing Systems AI assistant calling about the garage floor estimate you requested. I can book your free in-home consultation, share our color charts, or answer questions about pricing and our process — all in about two minutes. Is now a good time, or would you prefer I text you a booking link?",
    variables: ["name"],
  },
  {
    id: "voice_qualification",
    category: "voice",
    channel: "voice",
    label: "Qualification script",
    body: "Great, thanks {name}. A few quick questions so I send the right specialist: 1) Is this a 1, 2, or 3-car garage? 2) Any major cracks, paint, or an old coating we'd need to remove? 3) Are you looking to get this done within the next 30 days, or just researching? I'll text you a confirmed quote and available times right after we hang up.",
    variables: ["name"],
  },
  {
    id: "voice_escalation_handoff",
    category: "voice",
    channel: "voice",
    label: "Escalation handoff script",
    body: "I want to get you the most accurate answer on that, {name}. I'm going to connect you with a senior XPS flooring specialist — they'll call you back from {automation_phone} within {response_window}. I'll text you to confirm. Is there a good number and time, or is the one I'm calling now best?",
    variables: ["name", "automation_phone", "response_window"],
  },
];

// Categorical groupings for the UI
export const TEMPLATE_CATEGORIES = [
  { key: "appointment_scheduling", label: "Appointment Scheduling", icon: "Calendar" },
  { key: "color_charts", label: "Color Charts", icon: "Palette" },
  { key: "google_ratings", label: "Google Ratings", icon: "Star" },
  { key: "production_info", label: "Production & Process", icon: "ClipboardList" },
  { key: "rebuttals", label: "Rebuttals", icon: "Shield" },
  { key: "google_calendar", label: "Google Calendar Booking", icon: "CalendarCheck" },
  { key: "human_escalation", label: "Human Escalation", icon: "UserCheck" },
  { key: "follow_up", label: "Follow-Up", icon: "Reply" },
  { key: "nurture", label: "Nurture", icon: "Heart" },
  { key: "reengagement", label: "Re-Engagement", icon: "RefreshCw" },
  { key: "voice", label: "Voice Scripts", icon: "Phone" },
];