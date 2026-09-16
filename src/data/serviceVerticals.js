// ============================================================
// Universal Digital Dominance — Service Vertical Matrix
// All emergency / need-based services, prioritized by search volume
// ============================================================

export const SERVICE_VERTICALS = [
  {
    tier: 1,
    tier_label: "Ultra High Volume",
    volume_range: "1M+ /mo",
    priority: "P0",
    services: [
      { name: "Plumber", slug: "plumber", est_volume: 2400000, emergency: true, category: "home_repair", avg_lead_value: 350, template: "emergency_home_repair" },
      { name: "Electrician", slug: "electrician", est_volume: 1800000, emergency: true, category: "home_repair", avg_lead_value: 400, template: "emergency_home_repair" },
      { name: "HVAC / AC Repair", slug: "hvac-repair", est_volume: 1500000, emergency: true, category: "home_repair", avg_lead_value: 500, template: "emergency_home_repair" },
      { name: "Roofer", slug: "roofer", est_volume: 1200000, emergency: true, category: "home_repair", avg_lead_value: 800, template: "emergency_home_repair" },
      { name: "Dentist", slug: "dentist", est_volume: 1100000, emergency: false, category: "health", avg_lead_value: 300, template: "health_service" },
      { name: "Urgent Care", slug: "urgent-care", est_volume: 1000000, emergency: true, category: "health", avg_lead_value: 250, template: "emergency_health" },
    ],
  },
  {
    tier: 2,
    tier_label: "High Volume",
    volume_range: "500K–1M /mo",
    priority: "P0",
    services: [
      { name: "Locksmith", slug: "locksmith", est_volume: 900000, emergency: true, category: "auto_security", avg_lead_value: 200, template: "emergency_auto" },
      { name: "Towing", slug: "towing", est_volume: 820000, emergency: true, category: "auto", avg_lead_value: 150, template: "emergency_auto" },
      { name: "Pest Control", slug: "pest-control", est_volume: 750000, emergency: false, category: "home_repair", avg_lead_value: 250, template: "home_service" },
      { name: "Auto Repair", slug: "auto-repair", est_volume: 700000, emergency: false, category: "auto", avg_lead_value: 400, template: "auto_service" },
      { name: "Veterinarian", slug: "vet", est_volume: 650000, emergency: false, category: "health", avg_lead_value: 300, template: "health_service" },
      { name: "Water Damage Restoration", slug: "water-damage-restoration", est_volume: 550000, emergency: true, category: "home_repair", avg_lead_value: 2500, template: "emergency_home_repair" },
      { name: "Chiropractor", slug: "chiropractor", est_volume: 520000, emergency: false, category: "health", avg_lead_value: 200, template: "health_service" },
    ],
  },
  {
    tier: 3,
    tier_label: "Medium High Volume",
    volume_range: "200K–500K /mo",
    priority: "P1",
    services: [
      { name: "Tree Removal", slug: "tree-removal", est_volume: 450000, emergency: true, category: "outdoor", avg_lead_value: 800, template: "outdoor_service" },
      { name: "Physical Therapy", slug: "physical-therapy", est_volume: 420000, emergency: false, category: "health", avg_lead_value: 200, template: "health_service" },
      { name: "Carpet Cleaning", slug: "carpet-cleaning", est_volume: 380000, emergency: false, category: "home_repair", avg_lead_value: 150, template: "home_service" },
      { name: "Garage Door Repair", slug: "garage-door-repair", est_volume: 350000, emergency: true, category: "home_repair", avg_lead_value: 300, template: "emergency_home_repair" },
      { name: "Appliance Repair", slug: "appliance-repair", est_volume: 320000, emergency: true, category: "home_repair", avg_lead_value: 200, template: "emergency_home_repair" },
      { name: "Landscaping", slug: "landscaping", est_volume: 300000, emergency: false, category: "outdoor", avg_lead_value: 500, template: "outdoor_service" },
      { name: "Fence Installation", slug: "fence-installation", est_volume: 250000, emergency: false, category: "outdoor", avg_lead_value: 2000, template: "outdoor_service" },
      { name: "Gutter Cleaning", slug: "gutter-cleaning", est_volume: 220000, emergency: false, category: "home_repair", avg_lead_value: 200, template: "home_service" },
    ],
  },
  {
    tier: 4,
    tier_label: "Emergency Need",
    volume_range: "100K–200K /mo",
    priority: "P1",
    services: [
      { name: "Water Heater Repair", slug: "water-heater-repair", est_volume: 180000, emergency: true, category: "home_repair", avg_lead_value: 600, template: "emergency_home_repair" },
      { name: "Foundation Repair", slug: "foundation-repair", est_volume: 160000, emergency: false, category: "home_repair", avg_lead_value: 5000, template: "home_service" },
      { name: "Mold Remediation", slug: "mold-remediation", est_volume: 150000, emergency: true, category: "home_repair", avg_lead_value: 1500, template: "emergency_home_repair" },
      { name: "Septic Service", slug: "septic-service", est_volume: 140000, emergency: true, category: "home_repair", avg_lead_value: 400, template: "emergency_home_repair" },
      { name: "Emergency Plumber", slug: "emergency-plumber", est_volume: 130000, emergency: true, category: "home_repair", avg_lead_value: 450, template: "emergency_home_repair" },
      { name: "24hr Electrician", slug: "24-hour-electrician", est_volume: 120000, emergency: true, category: "home_repair", avg_lead_value: 500, template: "emergency_home_repair" },
      { name: "Emergency Vet", slug: "emergency-vet", est_volume: 110000, emergency: true, category: "health", avg_lead_value: 400, template: "emergency_health" },
      { name: "Roadside Assistance", slug: "roadside-assistance", est_volume: 105000, emergency: true, category: "auto", avg_lead_value: 100, template: "emergency_auto" },
    ],
  },
  {
    tier: 5,
    tier_label: "Specialized Emergency",
    volume_range: "50K–100K /mo",
    priority: "P2",
    services: [
      { name: "Mobile Mechanic", slug: "mobile-mechanic", est_volume: 95000, emergency: true, category: "auto", avg_lead_value: 200, template: "emergency_auto" },
      { name: "Emergency Dentist", slug: "emergency-dentist", est_volume: 85000, emergency: true, category: "health", avg_lead_value: 350, template: "emergency_health" },
      { name: "Emergency Roofing", slug: "emergency-roofing", est_volume: 80000, emergency: true, category: "home_repair", avg_lead_value: 1000, template: "emergency_home_repair" },
      { name: "Burst Pipe Repair", slug: "burst-pipe-repair", est_volume: 75000, emergency: true, category: "home_repair", avg_lead_value: 500, template: "emergency_home_repair" },
      { name: "Gas Leak Repair", slug: "gas-leak-repair", est_volume: 70000, emergency: true, category: "home_repair", avg_lead_value: 400, template: "emergency_home_repair" },
      { name: "Sewage Cleanup", slug: "sewage-cleanup", est_volume: 65000, emergency: true, category: "home_repair", avg_lead_value: 800, template: "emergency_home_repair" },
      { name: "Board Up Service", slug: "board-up-service", est_volume: 60000, emergency: true, category: "home_repair", avg_lead_value: 300, template: "emergency_home_repair" },
      { name: "Storm Damage Repair", slug: "storm-damage-repair", est_volume: 58000, emergency: true, category: "home_repair", avg_lead_value: 2000, template: "emergency_home_repair" },
      { name: "Flood Damage", slug: "flood-damage", est_volume: 55000, emergency: true, category: "home_repair", avg_lead_value: 3000, template: "emergency_home_repair" },
      { name: "Fire Damage Restoration", slug: "fire-damage-restoration", est_volume: 52000, emergency: true, category: "home_repair", avg_lead_value: 3500, template: "emergency_home_repair" },
      { name: "Crime Scene Cleanup", slug: "crime-scene-cleanup", est_volume: 50000, emergency: true, category: "specialized", avg_lead_value: 2500, template: "specialized_service" },
    ],
  },
];

export const TEMPLATE_TYPES = [
  { id: "emergency_home_repair", name: "Emergency Home Repair", google_specs: ["E-E-A-T", "Core Web Vitals", "Schema: LocalBusiness", "FAQ Schema", "BreadcrumbList"], pages_per_site: 45 },
  { id: "emergency_health", name: "Emergency Health", google_specs: ["E-E-A-T + YMYL", "Schema: MedicalBusiness", "FAQ Schema", "Practitioner Schema"], pages_per_site: 35 },
  { id: "emergency_auto", name: "Emergency Auto", google_specs: ["Schema: AutoRepair", "FAQ Schema", "Service Schema", "BreadcrumbList"], pages_per_site: 30 },
  { id: "home_service", name: "Home Service", google_specs: ["Schema: HomeAndConstructionBusiness", "FAQ Schema", "BreadcrumbList"], pages_per_site: 40 },
  { id: "health_service", name: "Health Service", google_specs: ["E-E-A-T + YMYL", "Schema: MedicalBusiness", "Practitioner Schema"], pages_per_site: 30 },
  { id: "auto_service", name: "Auto Service", google_specs: ["Schema: AutoRepair", "Service Schema"], pages_per_site: 25 },
  { id: "outdoor_service", name: "Outdoor Service", google_specs: ["Schema: LocalBusiness", "FAQ Schema"], pages_per_site: 35 },
  { id: "specialized_service", name: "Specialized Service", google_specs: ["Schema: LocalBusiness", "FAQ Schema", "BreadcrumbList"], pages_per_site: 25 },
];

export const ARCHITECTURE_LAYERS = [
  {
    id: 0,
    name: "Foundation — Deterministic Base",
    color: "#D4AF37",
    icon: "Shield",
    components: ["Supabase (durable state, queues, RLS)", "ControlLease (atomic CAS locking)", "Benchmark constitution (deterministic scoring)", "Evidence receipts (behavioral proof)", "5-minute math bucketing"],
    principle: "Same input → same output. No LLM in this layer. Pure data + locks + scoring.",
  },
  {
    id: 1,
    name: "Intelligence — Validated AI",
    color: "#FFEA00",
    icon: "Brain",
    components: ["LLM Router (GPT-5, Claude, Gemini)", "Output fingerprinting (drift detection)", "Dual validation council (GPT generates, Claude verifies)", "RAG pipeline (grounded generation)", "Temperature-0 + content hashing"],
    principle: "LLM output is non-deterministic by nature. We make it reproducible by pinning temperature, hashing outputs, and detecting drift.",
  },
  {
    id: 2,
    name: "Acquisition — Domain Engine",
    color: "#B8860B",
    icon: "Globe",
    components: ["GoDaddy API (search ALL [keyword]nearme.com)", "Availability filter (only available domains)", "Auto-purchase queue (queue → buy → DNS → Vercel)", "Domain portfolio registry (FleetSystem)", "Bulk search across all service verticals"],
    principle: "Search every possible [service]nearme.com domain. Filter to available only. Queue for purchase. Zero manual domain hunting.",
  },
  {
    id: 3,
    name: "Factory — Programmatic Site Builder",
    color: "#D4AF37",
    icon: "Factory",
    components: ["Template engine (Google-spec compliant)", "Content generator (RAG-grounded, deterministic)", "Page compiler (1000-5000 pages/day)", "Vercel edge deployment (auto)", "XTREMEAUTOBUILDER pipeline"],
    principle: "Every page built to Google's exact specifications. E-E-A-T, Core Web Vitals, Schema.org, canonical URLs, sitemaps, robots.txt — nothing less.",
  },
  {
    id: 4,
    name: "Distribution — Content Amplification",
    color: "#FFEA00",
    icon: "Rocket",
    components: ["YouTube pipeline (AI video → auto-post)", "Social media pipeline (website → social auto-post)", "Google Workspace sync (Calendar, Sheets, Docs, Drive, Tasks, Gmail)", "IndexNow + GSC submission", "RSS generation"],
    principle: "Every page we build gets amplified across YouTube, social, and Google's indexing pipeline automatically.",
  },
  {
    id: 5,
    name: "Optimization — Swarm Intelligence",
    color: "#B8860B",
    icon: "Bot",
    components: ["Agent swarm (hundreds of agents)", "Continuous content optimization", "Ranking tracking + auto-repair", "A/B testing (deterministic variants)", "GSC-driven content expansion"],
    principle: "The swarm never stops. It measures rankings, finds gaps, generates content, validates with dual AI, deploys, and measures again.",
  },
  {
    id: 6,
    name: "Governance — Oversight",
    color: "#D4AF37",
    icon: "Eye",
    components: ["Alpha Prime (CEO agent — strategy)", "Shadow Vision Cortex (operator interface)", "Fleet Alpha Prime (system governor)", "Adversarial validation council", "30-minute AutoComplete cycle"],
    principle: "No autonomous action ships without dual validation. GPT proposes, Claude verifies, Release Authority approves.",
  },
];

export const BUILD_PHASES = [
  { phase: 1, name: "Architecture Lock", duration: "1 day", status: "current", deliverables: ["This architecture page (deterministic plan)", "Service vertical matrix (all emergency services)", "Domain search modification (search all, filter available)", "Template spec definition (Google-spec compliant)"], gate: "Architecture page approved by operator" },
  { phase: 2, name: "Domain Acquisition Engine", duration: "2 days", status: "next", deliverables: ["Modify UrlStrategy to search ALL [keyword]nearme.com", "Availability filter (GoDaddy API bulk check)", "Auto-purchase queue", "Domain portfolio dashboard (all owned domains)"], gate: "System can search 10,000+ domain candidates and filter to available" },
  { phase: 3, name: "Template System", duration: "3 days", status: "planned", deliverables: ["Google-spec-compliant page templates (8 template types)", "Schema.org templates (LocalBusiness, MedicalBusiness, AutoRepair)", "Core Web Vitals optimization (LCP, CLS, INP)", "E-E-A-T signal templates", "Canonical URL + sitemap generation"], gate: "Templates pass Google PageSpeed Insights + Rich Results Test" },
  { phase: 4, name: "Programmatic Site Factory", duration: "3 days", status: "planned", deliverables: ["XTREMEAUTOBUILDER pipeline integration", "Content generator (RAG-grounded, deterministic)", "Page compiler (1000-5000/day throughput)", "Vercel auto-deploy per domain", "Queue system (domain → template → build → deploy)"], gate: "System can build and deploy 100+ sites/day with zero manual intervention" },
  { phase: 5, name: "AI Validation Council", duration: "2 days", status: "planned", deliverables: ["GPT content generation (primary)", "Claude content validation (verifier)", "Output fingerprinting + drift detection", "Content quality scoring (deterministic rubric)", "Reject + regenerate loop"], gate: "Every page passes dual-AI validation before deploy" },
  { phase: 6, name: "Video + YouTube Pipeline", duration: "3 days", status: "planned", deliverables: ["Top-tier video generation (Veo 3 / Sora-tier)", "YouTube auto-post pipeline (website → video → YouTube)", "Social media auto-post (website → social)", "Video SEO optimization (titles, descriptions, tags)", "Thumbnail generation"], gate: "Every deployed site auto-generates + posts video to YouTube + social" },
  { phase: 7, name: "Google Workspace Integration", duration: "2 days", status: "planned", deliverables: ["Google Calendar (auto-create events per site)", "Google Sheets (lead tracking per domain)", "Google Docs (content storage per domain)", "Google Drive (asset storage per domain)", "Google Tasks (task per site optimization)", "Gmail (lead notification per domain)"], gate: "Every domain has its own Google Workspace workspace auto-provisioned" },
  { phase: 8, name: "Swarm Optimization", duration: "3 days", status: "planned", deliverables: ["Hundreds of agents (one per domain cluster)", "Continuous ranking tracking (GSC API)", "Auto-content-expansion (find gaps → generate → deploy)", "Auto-repair (ranking drops → diagnose → fix)", "6-hour optimization cycle"], gate: "Swarm autonomously optimizes all deployed sites every 6 hours" },
  { phase: 9, name: "Scale to 5000/day", duration: "2 days", status: "planned", deliverables: ["Throughput optimization (batch processing)", "Rate limit management (GoDaddy, Vercel, GSC, YouTube APIs)", "Queue depth monitoring", "Cost optimization (credit tracking per site)", "Full autonomous operation"], gate: "System builds, deploys, and optimizes 1000-5000 sites/day autonomously" },
];

export const QUEUE_STAGES = [
  { id: 1, name: "Domain Discovered", desc: "GoDaddy API finds [service]nearme.com domain", icon: "Globe", color: "#3B82F6" },
  { id: 2, name: "Availability Filtered", desc: "Only available domains pass to purchase queue", icon: "Filter", color: "#8B5CF6" },
  { id: 3, name: "Domain Purchased", desc: "Auto-buy via GoDaddy API, DNS pointed to Vercel", icon: "ShoppingCart", color: "#10B981" },
  { id: 4, name: "Template Assigned", desc: "Service vertical → template type mapping", icon: "Layout", color: "#F59E0B" },
  { id: 5, name: "Content Generated", desc: "RAG-grounded content, GPT generates, Claude validates", icon: "Brain", color: "#FFEA00" },
  { id: 6, name: "Pages Compiled", desc: "1000-5000 pages compiled from template + content", icon: "Factory", color: "#D4AF37" },
  { id: 7, name: "Site Deployed", desc: "Vercel edge deployment, SSL auto-provisioned", icon: "Rocket", color: "#EF4444" },
  { id: 8, name: "Video Generated", desc: "AI video created for each deployed site", icon: "Video", color: "#EC4899" },
  { id: 9, name: "YouTube + Social Posted", desc: "Auto-post to YouTube + social media channels", icon: "Share2", color: "#06B6D4" },
  { id: 10, name: "Index Submitted", desc: "IndexNow + GSC sitemap submission", icon: "Send", color: "#84CC16" },
  { id: 11, name: "Swarm Assigned", desc: "Agent assigned for continuous optimization", icon: "Bot", color: "#B8860B" },
  { id: 12, name: "Ranking Tracked", desc: "GSC API tracks rankings, auto-repair on drops", icon: "TrendingUp", color: "#D4AF37" },
];