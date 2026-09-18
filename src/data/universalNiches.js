// ============================================================
// UNIVERSAL NICHE REGISTRY
// Every service + product business that depends on NEED & EMERGENCY.
// Used by the Domain Gold Rush universal system to generate
// domain strategies, business names, simulations, and dominance plans.
// ============================================================

export const EMERGENCY_LEVELS = {
  CRITICAL: { label: "Critical Emergency", color: "red", weight: 100, desc: "Immediate action required — minutes matter" },
  HIGH: { label: "High Urgency", color: "orange", weight: 85, desc: "Same-day action required — hours matter" },
  MEDIUM: { label: "Need-Based", color: "amber", weight: 65, desc: "Planned but necessary — days to weeks" },
  ROUTINE: { label: "Routine Need", color: "blue", weight: 40, desc: "Planned purchase — weeks to months" },
};

export const PSYCHOLOGY_PROFILES = {
  PANIC_URGENCY: { label: "Panic & Urgency", desc: "Fear-driven, price-insensitive, needs immediate resolution", factors: ["fear", "safety", "immediacy", "trust"] },
  PROBLEM_AVOIDANCE: { label: "Problem Avoidance", desc: "Wants to prevent damage or worsening condition", factors: ["prevention", "protection", "cost-avoidance"] },
  ASPIRATION: { label: "Aspiration & Pride", desc: "Wants to improve, beautify, or upgrade their property/life", factors: ["pride", "status", "beauty", "investment"] },
  COMPLIANCE: { label: "Compliance & Legal", desc: "Must meet code, regulation, or legal requirement", factors: ["compliance", "safety", "legal", "code"] },
  CONVENIENCE: { label: "Convenience & Time-Saving", desc: "Wants it done fast and easy by a professional", factors: ["speed", "convenience", "trust", "quality"] },
  HEALTH_SAFETY: { label: "Health & Safety", desc: "Driven by health concerns for family/pets/self", factors: ["health", "safety", "family", "cleanliness"] },
};

// TLD tail-word patterns people actually search in Google
export const TAIL_WORD_PATTERNS = [
  { word: "near me", pattern: "nearme", search_share: 35, intent: "local-commercial", desc: "Dominant local intent — #1 tail word for service businesses" },
  { word: "near you", pattern: "nearyou", search_share: 8, intent: "local-commercial", desc: "Growing variant — second-person framing" },
  { word: "near me now", pattern: "nearmenow", search_share: 12, intent: "emergency", desc: "Urgency modifier — emergency services" },
  { word: "near me open", pattern: "nearmeopen", search_share: 6, intent: "emergency", desc: "Availability modifier — open now" },
  { word: "near me today", pattern: "nearmetoday", search_share: 7, intent: "urgent", desc: "Same-day intent" },
  { word: "close to me", pattern: "closetome", search_share: 5, intent: "local", desc: "Proximity variant" },
  { word: "around me", pattern: "aroundme", search_share: 4, intent: "local", desc: "Proximity variant" },
  { word: "in my area", pattern: "inmyarea", search_share: 5, intent: "local", desc: "Area-based search" },
  { word: "near by", pattern: "nearby", search_share: 4, intent: "local", desc: "Single-word proximity" },
  { word: "local", pattern: "local", search_share: 8, intent: "local", desc: "Local modifier" },
  { word: "best", pattern: "best", search_share: 6, intent: "comparison", desc: "Quality intent" },
  { word: "affordable", pattern: "affordable", search_share: 4, intent: "budget", desc: "Price-sensitive" },
  { word: "cheap", pattern: "cheap", search_share: 3, intent: "budget", desc: "Lowest price" },
  { word: "cost", pattern: "cost", search_share: 8, intent: "research", desc: "Price research" },
  { word: "price", pattern: "price", search_share: 5, intent: "research", desc: "Price research" },
  { word: "pro", pattern: "pro", search_share: 3, intent: "authority", desc: "Professional intent" },
  { word: "expert", pattern: "expert", search_share: 2, intent: "authority", desc: "Expert intent" },
  { word: "24 7", pattern: "247", search_share: 4, intent: "emergency", desc: "Around-the-clock availability" },
  { word: "emergency", pattern: "emergency", search_share: 6, intent: "emergency", desc: "Explicit emergency" },
  { word: "same day", pattern: "sameday", search_share: 5, intent: "urgent", desc: "Same-day service" },
];

// ============================================================
// UNIVERSAL NICHE DATABASE
// 200+ niches across all need/emergency-driven categories
// ============================================================
export const UNIVERSAL_NICHES = [
  // ── EMERGENCY RESTORATION (Critical) ──
  { id: "water_damage", category: "restoration", label: "Water Damage Restoration", keyword: "water damage restoration", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 35, avg_order: 4500, search_volume: "high", margin: 0.55 },
  { id: "fire_damage", category: "restoration", label: "Fire Damage Restoration", keyword: "fire damage restoration", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 40, avg_order: 8500, search_volume: "medium", margin: 0.50 },
  { id: "mold_remediation", category: "restoration", label: "Mold Remediation", keyword: "mold remediation", emergency: "CRITICAL", psychology: "HEALTH_SAFETY", avg_cpc: 28, avg_order: 3200, search_volume: "high", margin: 0.60 },
  { id: "flood_cleanup", category: "restoration", label: "Flood Cleanup", keyword: "flood cleanup", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 32, avg_order: 5200, search_volume: "high", margin: 0.55 },
  { id: "sewage_cleanup", category: "restoration", label: "Sewage Cleanup", keyword: "sewage cleanup", emergency: "CRITICAL", psychology: "HEALTH_SAFETY", avg_cpc: 30, avg_order: 3800, search_volume: "medium", margin: 0.58 },
  { id: "biohazard_cleanup", category: "restoration", label: "Biohazard Cleanup", keyword: "biohazard cleanup", emergency: "CRITICAL", psychology: "HEALTH_SAFETY", avg_cpc: 45, avg_order: 6500, search_volume: "low", margin: 0.65 },
  { id: "crime_scene_cleanup", category: "restoration", label: "Crime Scene Cleanup", keyword: "crime scene cleanup", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 50, avg_order: 7500, search_volume: "low", margin: 0.70 },
  { id: "board_up", category: "restoration", label: "Emergency Board Up", keyword: "board up service", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 1200, search_volume: "medium", margin: 0.60 },
  { id: "storm_damage", category: "restoration", label: "Storm Damage Repair", keyword: "storm damage repair", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 5500, search_volume: "medium", margin: 0.50 },
  { id: "asbestos_removal", category: "restoration", label: "Asbestos Removal", keyword: "asbestos removal", emergency: "HIGH", psychology: "HEALTH_SAFETY", avg_cpc: 35, avg_order: 4200, search_volume: "medium", margin: 0.55 },
  { id: "lead_removal", category: "restoration", label: "Lead Paint Removal", keyword: "lead paint removal", emergency: "HIGH", psychology: "HEALTH_SAFETY", avg_cpc: 32, avg_order: 3800, search_volume: "low", margin: 0.55 },

  // ── EMERGENCY HOME (Critical/High) ──
  { id: "emergency_plumbing", category: "emergency_home", label: "Emergency Plumbing", keyword: "emergency plumber", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 850, search_volume: "high", margin: 0.50 },
  { id: "burst_pipe", category: "emergency_home", label: "Burst Pipe Repair", keyword: "burst pipe repair", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 28, avg_order: 1200, search_volume: "high", margin: 0.55 },
  { id: "water_heater_repair", category: "emergency_home", label: "Water Heater Repair", keyword: "water heater repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 1800, search_volume: "high", margin: 0.45 },
  { id: "water_heater_install", category: "emergency_home", label: "Water Heater Installation", keyword: "water heater installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 20, avg_order: 2200, search_volume: "high", margin: 0.40 },
  { id: "gas_leak", category: "emergency_home", label: "Gas Leak Repair", keyword: "gas leak repair", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 950, search_volume: "medium", margin: 0.55 },
  { id: "emergency_hvac", category: "emergency_home", label: "Emergency HVAC Repair", keyword: "emergency hvac repair", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 28, avg_order: 1500, search_volume: "high", margin: 0.50 },
  { id: "emergency_electrical", category: "emergency_home", label: "Emergency Electrician", keyword: "emergency electrician", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 26, avg_order: 1100, search_volume: "high", margin: 0.52 },
  { id: "emergency_roofing", category: "emergency_home", label: "Emergency Roof Repair", keyword: "emergency roof repair", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 2800, search_volume: "high", margin: 0.48 },
  { id: "emergency_locksmith", category: "emergency_home", label: "Emergency Locksmith", keyword: "emergency locksmith", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 18, avg_order: 350, search_volume: "high", margin: 0.70 },
  { id: "emergency_pest", category: "emergency_home", label: "Emergency Pest Control", keyword: "emergency pest control", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 20, avg_order: 450, search_volume: "high", margin: 0.65 },
  { id: "emergency_tree", category: "emergency_home", label: "Emergency Tree Removal", keyword: "emergency tree removal", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 1800, search_volume: "high", margin: 0.55 },
  { id: "emergency_fence", category: "emergency_home", label: "Emergency Fence Repair", keyword: "emergency fence repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 18, avg_order: 750, search_volume: "medium", margin: 0.50 },
  { id: "emergency_generator", category: "emergency_home", label: "Emergency Generator Repair", keyword: "generator repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 22, avg_order: 1200, search_volume: "medium", margin: 0.50 },
  { id: "well_pump", category: "emergency_home", label: "Well Pump Repair", keyword: "well pump repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 20, avg_order: 1500, search_volume: "medium", margin: 0.50 },
  { id: "septic_repair", category: "emergency_home", label: "Septic Tank Repair", keyword: "septic tank repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 2800, search_volume: "medium", margin: 0.55 },
  { id: "septic_pumping", category: "emergency_home", label: "Septic Pumping", keyword: "septic tank pumping", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 18, avg_order: 450, search_volume: "high", margin: 0.60 },
  { id: "drain_cleaning", category: "emergency_home", label: "Drain Cleaning", keyword: "drain cleaning", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 16, avg_order: 350, search_volume: "high", margin: 0.65 },

  // ── GARAGE & CONCRETE (Need-Based) ──
  { id: "epoxy_garage", category: "garage_concrete", label: "Epoxy Garage Floors", keyword: "epoxy garage floor", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 2800, search_volume: "high", margin: 0.55 },
  { id: "polished_concrete", category: "garage_concrete", label: "Polished Concrete", keyword: "polished concrete", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 3500, search_volume: "medium", margin: 0.50 },
  { id: "concrete_resurfacing", category: "garage_concrete", label: "Concrete Resurfacing", keyword: "concrete resurfacing", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 11, avg_order: 2200, search_volume: "medium", margin: 0.52 },
  { id: "garage_coating", category: "garage_concrete", label: "Garage Floor Coating", keyword: "garage floor coating", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 2600, search_volume: "high", margin: 0.55 },
  { id: "concrete_leveling", category: "garage_concrete", label: "Concrete Leveling", keyword: "concrete leveling", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 14, avg_order: 1800, search_volume: "medium", margin: 0.58 },
  { id: "foundation_repair", category: "garage_concrete", label: "Foundation Repair", keyword: "foundation repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 25, avg_order: 6500, search_volume: "high", margin: 0.45 },
  { id: "basement_waterproofing", category: "garage_concrete", label: "Basement Waterproofing", keyword: "basement waterproofing", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 22, avg_order: 5500, search_volume: "high", margin: 0.48 },
  { id: "crawl_space", category: "garage_concrete", label: "Crawl Space Repair", keyword: "crawl space repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 20, avg_order: 4800, search_volume: "medium", margin: 0.50 },
  { id: "stamped_concrete", category: "garage_concrete", label: "Stamped Concrete", keyword: "stamped concrete", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 3200, search_volume: "medium", margin: 0.50 },
  { id: "concrete_sealing", category: "garage_concrete", label: "Concrete Sealing", keyword: "concrete sealing", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 9, avg_order: 1200, search_volume: "medium", margin: 0.60 },
  { id: "mudjacking", category: "garage_concrete", label: "Mudjacking", keyword: "mudjacking", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 1400, search_volume: "low", margin: 0.58 },
  { id: "slab_repair", category: "garage_concrete", label: "Slab Repair", keyword: "concrete slab repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 15, avg_order: 2500, search_volume: "medium", margin: 0.50 },

  // ── ROOFING (Need-Based) ──
  { id: "roof_repair", category: "roofing", label: "Roof Repair", keyword: "roof repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 22, avg_order: 1200, search_volume: "high", margin: 0.45 },
  { id: "roof_replacement", category: "roofing", label: "Roof Replacement", keyword: "roof replacement", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 25, avg_order: 12000, search_volume: "high", margin: 0.35 },
  { id: "roof_leak", category: "roofing", label: "Roof Leak Repair", keyword: "roof leak repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 24, avg_order: 950, search_volume: "high", margin: 0.50 },
  { id: "shingle_replacement", category: "roofing", label: "Shingle Replacement", keyword: "roof shingle replacement", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 18, avg_order: 1800, search_volume: "medium", margin: 0.45 },
  { id: "flat_roof", category: "roofing", label: "Flat Roof Repair", keyword: "flat roof repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 20, avg_order: 2200, search_volume: "medium", margin: 0.48 },
  { id: "metal_roofing", category: "roofing", label: "Metal Roofing", keyword: "metal roofing", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 22, avg_order: 15000, search_volume: "medium", margin: 0.38 },
  { id: "roof_inspection", category: "roofing", label: "Roof Inspection", keyword: "roof inspection", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 15, avg_order: 350, search_volume: "high", margin: 0.70 },
  { id: "gutter_install", category: "roofing", label: "Gutter Installation", keyword: "gutter installation", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 14, avg_order: 2200, search_volume: "medium", margin: 0.45 },
  { id: "gutter_cleaning", category: "roofing", label: "Gutter Cleaning", keyword: "gutter cleaning", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 250, search_volume: "high", margin: 0.65 },
  { id: "gutter_repair", category: "roofing", label: "Gutter Repair", keyword: "gutter repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 450, search_volume: "medium", margin: 0.55 },

  // ── HVAC (Need-Based) ──
  { id: "ac_repair", category: "hvac", label: "AC Repair", keyword: "ac repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 650, search_volume: "high", margin: 0.50 },
  { id: "ac_install", category: "hvac", label: "AC Installation", keyword: "ac installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 28, avg_order: 5500, search_volume: "high", margin: 0.35 },
  { id: "furnace_repair", category: "hvac", label: "Furnace Repair", keyword: "furnace repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 24, avg_order: 750, search_volume: "high", margin: 0.50 },
  { id: "furnace_install", category: "hvac", label: "Furnace Installation", keyword: "furnace installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 27, avg_order: 5200, search_volume: "medium", margin: 0.35 },
  { id: "heat_pump", category: "hvac", label: "Heat Pump Repair", keyword: "heat pump repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 23, avg_order: 1800, search_volume: "medium", margin: 0.45 },
  { id: "duct_cleaning", category: "hvac", label: "Duct Cleaning", keyword: "air duct cleaning", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 15, avg_order: 550, search_volume: "high", margin: 0.60 },
  { id: "mini_split", category: "hvac", label: "Mini Split Installation", keyword: "mini split installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 20, avg_order: 3500, search_volume: "medium", margin: 0.40 },
  { id: "thermostat", category: "hvac", label: "Smart Thermostat Install", keyword: "thermostat installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 350, search_volume: "medium", margin: 0.55 },

  // ── PLUMBING (Need-Based) ──
  { id: "plumber", category: "plumbing", label: "Plumbing Repair", keyword: "plumber", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 450, search_volume: "high", margin: 0.55 },
  { id: "leak_detection", category: "plumbing", label: "Leak Detection", keyword: "leak detection", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 20, avg_order: 850, search_volume: "medium", margin: 0.60 },
  { id: "repiping", category: "plumbing", label: "Repiping", keyword: "repiping", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 22, avg_order: 4500, search_volume: "medium", margin: 0.40 },
  { id: "tankless_water", category: "plumbing", label: "Tankless Water Heater", keyword: "tankless water heater", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 3200, search_volume: "high", margin: 0.42 },
  { id: "garbage_disposal", category: "plumbing", label: "Garbage Disposal Repair", keyword: "garbage disposal repair", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 15, avg_order: 350, search_volume: "medium", margin: 0.55 },
  { id: "toilet_repair", category: "plumbing", label: "Toilet Repair", keyword: "toilet repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 16, avg_order: 280, search_volume: "high", margin: 0.60 },
  { id: "faucet_repair", category: "plumbing", label: "Faucet Repair", keyword: "faucet repair", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 14, avg_order: 250, search_volume: "medium", margin: 0.60 },
  { id: "sump_pump", category: "plumbing", label: "Sump Pump Repair", keyword: "sump pump repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 18, avg_order: 650, search_volume: "medium", margin: 0.55 },
  { id: "backflow", category: "plumbing", label: "Backflow Testing", keyword: "backflow testing", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 15, avg_order: 350, search_volume: "low", margin: 0.65 },

  // ── ELECTRICAL (Need-Based) ──
  { id: "electrician", category: "electrical", label: "Electrician", keyword: "electrician", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 450, search_volume: "high", margin: 0.52 },
  { id: "panel_upgrade", category: "electrical", label: "Electrical Panel Upgrade", keyword: "electrical panel upgrade", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 24, avg_order: 3500, search_volume: "medium", margin: 0.40 },
  { id: "wiring_repair", category: "electrical", label: "Wiring Repair", keyword: "electrical wiring repair", emergency: "HIGH", psychology: "HEALTH_SAFETY", avg_cpc: 20, avg_order: 750, search_volume: "medium", margin: 0.50 },
  { id: "outlet_install", category: "electrical", label: "Outlet Installation", keyword: "outlet installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 14, avg_order: 250, search_volume: "medium", margin: 0.58 },
  { id: "lighting_install", category: "electrical", label: "Lighting Installation", keyword: "lighting installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 16, avg_order: 850, search_volume: "medium", margin: 0.50 },
  { id: "ceiling_fan", category: "electrical", label: "Ceiling Fan Installation", keyword: "ceiling fan installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 350, search_volume: "medium", margin: 0.55 },
  { id: "ev_charger", category: "electrical", label: "EV Charger Installation", keyword: "ev charger installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 1500, search_volume: "high", margin: 0.45 },
  { id: "generator_install", category: "electrical", label: "Generator Installation", keyword: "generator installation", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 25, avg_order: 8500, search_volume: "medium", margin: 0.35 },

  // ── EXTERIOR & LANDSCAPING (Need-Based) ──
  { id: "siding_repair", category: "exterior", label: "Siding Repair", keyword: "siding repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 16, avg_order: 2800, search_volume: "medium", margin: 0.42 },
  { id: "window_replacement", category: "exterior", label: "Window Replacement", keyword: "window replacement", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 5500, search_volume: "high", margin: 0.35 },
  { id: "door_install", category: "exterior", label: "Door Installation", keyword: "door installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 16, avg_order: 1800, search_volume: "medium", margin: 0.40 },
  { id: "deck_building", category: "exterior", label: "Deck Building", keyword: "deck builder", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 15, avg_order: 8500, search_volume: "medium", margin: 0.35 },
  { id: "deck_repair", category: "exterior", label: "Deck Repair", keyword: "deck repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 14, avg_order: 1500, search_volume: "medium", margin: 0.45 },
  { id: "fence_install", category: "exterior", label: "Fence Installation", keyword: "fence installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 14, avg_order: 3500, search_volume: "high", margin: 0.40 },
  { id: "fence_repair", category: "exterior", label: "Fence Repair", keyword: "fence repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 650, search_volume: "medium", margin: 0.50 },
  { id: "landscaping", category: "exterior", label: "Landscaping", keyword: "landscaping", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 4500, search_volume: "high", margin: 0.45 },
  { id: "lawn_care", category: "exterior", label: "Lawn Care", keyword: "lawn care", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 8, avg_order: 150, search_volume: "high", margin: 0.60 },
  { id: "tree_service", category: "exterior", label: "Tree Service", keyword: "tree service", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 15, avg_order: 1200, search_volume: "high", margin: 0.50 },
  { id: "stump_removal", category: "exterior", label: "Stump Removal", keyword: "stump removal", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 450, search_volume: "medium", margin: 0.55 },
  { id: "sod_install", category: "exterior", label: "Sod Installation", keyword: "sod installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 11, avg_order: 2200, search_volume: "medium", margin: 0.45 },
  { id: "sprinkler_repair", category: "exterior", label: "Sprinkler Repair", keyword: "sprinkler repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 350, search_volume: "medium", margin: 0.55 },
  { id: "retaining_wall", category: "exterior", label: "Retaining Wall", keyword: "retaining wall", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 14, avg_order: 5500, search_volume: "medium", margin: 0.38 },
  { id: "patio_install", category: "exterior", label: "Patio Installation", keyword: "patio installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 13, avg_order: 4500, search_volume: "medium", margin: 0.40 },
  { id: "driveway_install", category: "exterior", label: "Driveway Installation", keyword: "driveway installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 15, avg_order: 6500, search_volume: "medium", margin: 0.38 },
  { id: "asphalt_paving", category: "exterior", label: "Asphalt Paving", keyword: "asphalt paving", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 16, avg_order: 5500, search_volume: "medium", margin: 0.40 },
  { id: "sealcoating", category: "exterior", label: "Asphalt Sealcoating", keyword: "sealcoating", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 1200, search_volume: "medium", margin: 0.55 },
  { id: "line_striping", category: "exterior", label: "Parking Lot Striping", keyword: "parking lot striping", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 12, avg_order: 850, search_volume: "low", margin: 0.55 },
  { id: "snow_removal", category: "exterior", label: "Snow Removal", keyword: "snow removal", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 15, avg_order: 450, search_volume: "high", margin: 0.55 },
  { id: "ice_dam", category: "exterior", label: "Ice Dam Removal", keyword: "ice dam removal", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 20, avg_order: 850, search_volume: "medium", margin: 0.60 },

  // ── CLEANING & PRESSURE WASH (Need-Based) ──
  { id: "pressure_washing", category: "cleaning", label: "Pressure Washing", keyword: "pressure washing", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 450, search_volume: "high", margin: 0.65 },
  { id: "soft_washing", category: "cleaning", label: "Soft Washing", keyword: "soft washing", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 550, search_volume: "medium", margin: 0.65 },
  { id: "roof_cleaning", category: "cleaning", label: "Roof Cleaning", keyword: "roof cleaning", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 650, search_volume: "medium", margin: 0.60 },
  { id: "house_washing", category: "cleaning", label: "House Washing", keyword: "house washing", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 450, search_volume: "medium", margin: 0.65 },
  { id: "window_cleaning", category: "cleaning", label: "Window Cleaning", keyword: "window cleaning", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 8, avg_order: 250, search_volume: "high", margin: 0.70 },
  { id: "gutter_cleaning_pro", category: "cleaning", label: "Gutter Cleaning Pro", keyword: "gutter cleaning service", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 250, search_volume: "high", margin: 0.65 },
  { id: "deck_staining", category: "cleaning", label: "Deck Staining", keyword: "deck staining", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 650, search_volume: "medium", margin: 0.55 },
  { id: "concrete_sealing_pro", category: "cleaning", label: "Concrete Sealing Pro", keyword: "concrete sealing service", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 1200, search_volume: "medium", margin: 0.60 },
  { id: "carpet_cleaning", category: "cleaning", label: "Carpet Cleaning", keyword: "carpet cleaning", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 10, avg_order: 250, search_volume: "high", margin: 0.65 },
  { id: "tile_cleaning", category: "cleaning", label: "Tile & Grout Cleaning", keyword: "tile cleaning", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 350, search_volume: "medium", margin: 0.65 },
  { id: "upholstery_cleaning", category: "cleaning", label: "Upholstery Cleaning", keyword: "upholstery cleaning", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 10, avg_order: 250, search_volume: "medium", margin: 0.65 },
  { id: "air_duct_cleaning", category: "cleaning", label: "Air Duct Cleaning", keyword: "air duct cleaning", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 15, avg_order: 550, search_volume: "high", margin: 0.60 },
  { id: "chimney_cleaning", category: "cleaning", label: "Chimney Cleaning", keyword: "chimney cleaning", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 250, search_volume: "medium", margin: 0.65 },

  // ── PEST CONTROL (Need-Based) ──
  { id: "pest_control", category: "pest", label: "Pest Control", keyword: "pest control", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 15, avg_order: 350, search_volume: "high", margin: 0.65 },
  { id: "termite_control", category: "pest", label: "Termite Control", keyword: "termite control", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 1200, search_volume: "high", margin: 0.55 },
  { id: "bed_bug", category: "pest", label: "Bed Bug Treatment", keyword: "bed bug treatment", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 1500, search_volume: "high", margin: 0.60 },
  { id: "rodent_control", category: "pest", label: "Rodent Control", keyword: "rodent control", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 18, avg_order: 450, search_volume: "medium", margin: 0.60 },
  { id: "mosquito_control", category: "pest", label: "Mosquito Control", keyword: "mosquito control", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 14, avg_order: 550, search_volume: "medium", margin: 0.65 },
  { id: "bee_removal", category: "pest", label: "Bee Removal", keyword: "bee removal", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 16, avg_order: 350, search_volume: "medium", margin: 0.65 },
  { id: "wildlife_removal", category: "pest", label: "Wildlife Removal", keyword: "wildlife removal", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 18, avg_order: 650, search_volume: "medium", margin: 0.60 },

  // ── POOL & SPA (Need-Based) ──
  { id: "pool_service", category: "pool", label: "Pool Service", keyword: "pool service", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 150, search_volume: "high", margin: 0.60 },
  { id: "pool_repair", category: "pool", label: "Pool Repair", keyword: "pool repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 650, search_volume: "medium", margin: 0.50 },
  { id: "pool_install", category: "pool", label: "Pool Installation", keyword: "pool installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 18, avg_order: 45000, search_volume: "medium", margin: 0.30 },
  { id: "hot_tub_repair", category: "pool", label: "Hot Tub Repair", keyword: "hot tub repair", emergency: "MEDIUM", psychology: "PANIC_URGENCY", avg_cpc: 12, avg_order: 450, search_volume: "low", margin: 0.55 },
  { id: "pool_resurfacing", category: "pool", label: "Pool Resurfacing", keyword: "pool resurfacing", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 15, avg_order: 6500, search_volume: "low", margin: 0.40 },

  // ── INSULATION & ENERGY (Need-Based) ──
  { id: "insulation", category: "energy", label: "Insulation", keyword: "insulation installation", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 14, avg_order: 2800, search_volume: "medium", margin: 0.45 },
  { id: "attic_insulation", category: "energy", label: "Attic Insulation", keyword: "attic insulation", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 13, avg_order: 2200, search_volume: "medium", margin: 0.48 },
  { id: "solar_install", category: "energy", label: "Solar Panel Installation", keyword: "solar panel installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 25, avg_order: 25000, search_volume: "high", margin: 0.25 },
  { id: "solar_repair", category: "energy", label: "Solar Panel Repair", keyword: "solar panel repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 18, avg_order: 650, search_volume: "medium", margin: 0.50 },
  { id: "water_filtration", category: "energy", label: "Water Filtration", keyword: "water filtration system", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 16, avg_order: 2200, search_volume: "medium", margin: 0.45 },
  { id: "water_softener", category: "energy", label: "Water Softener", keyword: "water softener installation", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 15, avg_order: 1800, search_volume: "medium", margin: 0.45 },
  { id: "weatherization", category: "energy", label: "Weatherization", keyword: "weatherization", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 3500, search_volume: "low", margin: 0.45 },

  // ── INTERIOR HOME (Need-Based) ──
  { id: "flooring_install", category: "interior", label: "Flooring Installation", keyword: "flooring installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 14, avg_order: 4500, search_volume: "high", margin: 0.35 },
  { id: "tile_install", category: "interior", label: "Tile Installation", keyword: "tile installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 13, avg_order: 2800, search_volume: "high", margin: 0.40 },
  { id: "carpet_install", category: "interior", label: "Carpet Installation", keyword: "carpet installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 2200, search_volume: "medium", margin: 0.40 },
  { id: "hardwood_floor", category: "interior", label: "Hardwood Flooring", keyword: "hardwood floor installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 15, avg_order: 5500, search_volume: "medium", margin: 0.35 },
  { id: "laminate_floor", category: "interior", label: "Laminate Flooring", keyword: "laminate flooring installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 2800, search_volume: "medium", margin: 0.40 },
  { id: "vinyl_floor", category: "interior", label: "Vinyl Flooring", keyword: "vinyl plank flooring", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 3200, search_volume: "high", margin: 0.38 },
  { id: "countertop_install", category: "interior", label: "Countertop Installation", keyword: "countertop installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 16, avg_order: 3500, search_volume: "medium", margin: 0.35 },
  { id: "cabinet_refacing", category: "interior", label: "Cabinet Refacing", keyword: "cabinet refacing", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 15, avg_order: 4500, search_volume: "medium", margin: 0.38 },
  { id: "interior_painting", category: "interior", label: "Interior Painting", keyword: "interior painting", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 10, avg_order: 2500, search_volume: "high", margin: 0.45 },
  { id: "exterior_painting", category: "interior", label: "Exterior Painting", keyword: "exterior painting", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 3500, search_volume: "high", margin: 0.40 },
  { id: "drywall_repair", category: "interior", label: "Drywall Repair", keyword: "drywall repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 450, search_volume: "medium", margin: 0.55 },
  { id: "stucco_repair", category: "interior", label: "Stucco Repair", keyword: "stucco repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 1800, search_volume: "low", margin: 0.45 },
  { id: "crown_molding", category: "interior", label: "Crown Molding", keyword: "crown molding installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 1500, search_volume: "low", margin: 0.50 },
  { id: "door_install_int", category: "interior", label: "Interior Door Installation", keyword: "interior door installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 650, search_volume: "low", margin: 0.45 },

  // ── GARAGE DOOR (Need-Based) ──
  { id: "garage_door_repair", category: "garage_door", label: "Garage Door Repair", keyword: "garage door repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 16, avg_order: 350, search_volume: "high", margin: 0.55 },
  { id: "garage_door_install", category: "garage_door", label: "Garage Door Installation", keyword: "garage door installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 18, avg_order: 2200, search_volume: "high", margin: 0.40 },
  { id: "garage_door_spring", category: "garage_door", label: "Garage Door Spring Repair", keyword: "garage door spring repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 15, avg_order: 250, search_volume: "high", margin: 0.60 },
  { id: "garage_door_opener", category: "garage_door", label: "Garage Door Opener Repair", keyword: "garage door opener repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 350, search_volume: "medium", margin: 0.55 },

  // ── APPLIANCE REPAIR (Need-Based) ──
  { id: "appliance_repair", category: "appliance", label: "Appliance Repair", keyword: "appliance repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 250, search_volume: "high", margin: 0.60 },
  { id: "refrigerator_repair", category: "appliance", label: "Refrigerator Repair", keyword: "refrigerator repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 15, avg_order: 350, search_volume: "high", margin: 0.55 },
  { id: "washer_repair", category: "appliance", label: "Washer Repair", keyword: "washer repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 250, search_volume: "medium", margin: 0.60 },
  { id: "dryer_repair", category: "appliance", label: "Dryer Repair", keyword: "dryer repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 250, search_volume: "medium", margin: 0.60 },
  { id: "dishwasher_repair", category: "appliance", label: "Dishwasher Repair", keyword: "dishwasher repair", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 13, avg_order: 250, search_volume: "medium", margin: 0.60 },
  { id: "oven_repair", category: "appliance", label: "Oven Repair", keyword: "oven repair", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 13, avg_order: 250, search_volume: "medium", margin: 0.60 },
  { id: "microwave_repair", category: "appliance", label: "Microwave Repair", keyword: "microwave repair", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 200, search_volume: "low", margin: 0.60 },

  // ── AUTOMOTIVE (Need/Emergency) ──
  { id: "towing", category: "automotive", label: "Towing Service", keyword: "towing service", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 18, avg_order: 150, search_volume: "high", margin: 0.70 },
  { id: "roadside_assist", category: "automotive", label: "Roadside Assistance", keyword: "roadside assistance", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 16, avg_order: 120, search_volume: "high", margin: 0.65 },
  { id: "jump_start", category: "automotive", label: "Jump Start", keyword: "jump start service", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 80, search_volume: "medium", margin: 0.75 },
  { id: "auto_lockout", category: "automotive", label: "Car Lockout Service", keyword: "car lockout service", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 15, avg_order: 120, search_volume: "medium", margin: 0.70 },
  { id: "flat_tire", category: "automotive", label: "Flat Tire Repair", keyword: "flat tire repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 100, search_volume: "medium", margin: 0.65 },
  { id: "tire_replacement", category: "automotive", label: "Tire Replacement", keyword: "tire replacement", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 16, avg_order: 550, search_volume: "high", margin: 0.40 },
  { id: "brake_repair", category: "automotive", label: "Brake Repair", keyword: "brake repair", emergency: "HIGH", psychology: "HEALTH_SAFETY", avg_cpc: 18, avg_order: 450, search_volume: "high", margin: 0.50 },
  { id: "transmission_repair", category: "automotive", label: "Transmission Repair", keyword: "transmission repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 20, avg_order: 2800, search_volume: "medium", margin: 0.45 },
  { id: "engine_repair", category: "automotive", label: "Engine Repair", keyword: "engine repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 19, avg_order: 2200, search_volume: "medium", margin: 0.45 },
  { id: "oil_change", category: "automotive", label: "Oil Change", keyword: "oil change", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 10, avg_order: 60, search_volume: "high", margin: 0.55 },
  { id: "battery_replace", category: "automotive", label: "Car Battery Replacement", keyword: "car battery replacement", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 14, avg_order: 220, search_volume: "medium", margin: 0.50 },
  { id: "auto_glass", category: "automotive", label: "Auto Glass Repair", keyword: "auto glass repair", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 15, avg_order: 350, search_volume: "high", margin: 0.55 },
  { id: "windshield", category: "automotive", label: "Windshield Replacement", keyword: "windshield replacement", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 18, avg_order: 450, search_volume: "high", margin: 0.50 },
  { id: "car_detailing", category: "automotive", label: "Car Detailing", keyword: "car detailing", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 180, search_volume: "high", margin: 0.65 },
  { id: "ceramic_coating", category: "automotive", label: "Ceramic Coating", keyword: "ceramic coating", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 14, avg_order: 1200, search_volume: "high", margin: 0.60 },
  { id: "window_tinting", category: "automotive", label: "Window Tinting", keyword: "window tinting", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 350, search_volume: "high", margin: 0.60 },
  { id: "ppf", category: "automotive", label: "Paint Protection Film", keyword: "paint protection film", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 16, avg_order: 2500, search_volume: "medium", margin: 0.55 },
  { id: "auto_repair", category: "automotive", label: "Auto Repair", keyword: "auto repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 16, avg_order: 450, search_volume: "high", margin: 0.50 },
  { id: "ev_charging", category: "automotive", label: "EV Charging Installation", keyword: "ev charging station installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 1500, search_volume: "high", margin: 0.45 },

  // ── HEALTH & MEDICAL (Need/Emergency) ──
  { id: "emergency_dentist", category: "health", label: "Emergency Dentist", keyword: "emergency dentist", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 450, search_volume: "high", margin: 0.60 },
  { id: "emergency_vet", category: "health", label: "Emergency Vet", keyword: "emergency vet", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 850, search_volume: "high", margin: 0.55 },
  { id: "urgent_care", category: "health", label: "Urgent Care", keyword: "urgent care", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 20, avg_order: 250, search_volume: "high", margin: 0.50 },
  { id: "chiropractor", category: "health", label: "Chiropractor", keyword: "chiropractor", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 15, avg_order: 150, search_volume: "high", margin: 0.60 },
  { id: "physical_therapy", category: "health", label: "Physical Therapy", keyword: "physical therapy", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 14, avg_order: 150, search_volume: "high", margin: 0.55 },
  { id: "massage_therapy", category: "health", label: "Massage Therapy", keyword: "massage therapy", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 12, avg_order: 100, search_volume: "high", margin: 0.65 },
  { id: "mental_health", category: "health", label: "Mental Health Counseling", keyword: "therapist near me", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 14, avg_order: 150, search_volume: "high", margin: 0.60 },
  { id: "dermatology", category: "health", label: "Dermatology", keyword: "dermatologist", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 18, avg_order: 250, search_volume: "high", margin: 0.55 },
  { id: "medical_spa", category: "health", label: "Medical Spa", keyword: "med spa", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 550, search_volume: "high", margin: 0.60 },
  { id: "botox", category: "health", label: "Botox", keyword: "botox near me", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 22, avg_order: 650, search_volume: "high", margin: 0.65 },
  { id: "laser_hair", category: "health", label: "Laser Hair Removal", keyword: "laser hair removal", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 350, search_volume: "high", margin: 0.65 },
  { id: "home_health", category: "health", label: "Home Health Care", keyword: "home health care", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 18, avg_order: 5500, search_volume: "medium", margin: 0.35 },
  { id: "senior_care", category: "health", label: "Senior Care", keyword: "senior care", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 16, avg_order: 4500, search_volume: "medium", margin: 0.35 },
  { id: "assisted_living", category: "health", label: "Assisted Living", keyword: "assisted living", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 25, avg_order: 5500, search_volume: "high", margin: 0.30 },
  { id: "memory_care", category: "health", label: "Memory Care", keyword: "memory care", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 28, avg_order: 6500, search_volume: "medium", margin: 0.28 },
  { id: "addiction_treatment", category: "health", label: "Addiction Treatment", keyword: "addiction treatment", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 35, avg_order: 15000, search_volume: "medium", margin: 0.25 },
  { id: "pain_management", category: "health", label: "Pain Management", keyword: "pain management", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 350, search_volume: "medium", margin: 0.50 },
  { id: "weight_loss", category: "health", label: "Medical Weight Loss", keyword: "medical weight loss", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 25, avg_order: 850, search_volume: "high", margin: 0.55 },

  // ── LEGAL (Need-Based) ──
  { id: "dui_lawyer", category: "legal", label: "DUI Lawyer", keyword: "dui lawyer", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 45, avg_order: 3500, search_volume: "high", margin: 0.55 },
  { id: "criminal_defense", category: "legal", label: "Criminal Defense", keyword: "criminal defense lawyer", emergency: "CRITICAL", psychology: "PANIC_URGENCY", avg_cpc: 50, avg_order: 5500, search_volume: "high", margin: 0.50 },
  { id: "personal_injury", category: "legal", label: "Personal Injury Lawyer", keyword: "personal injury lawyer", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 55, avg_order: 8500, search_volume: "high", margin: 0.33 },
  { id: "workers_comp", category: "legal", label: "Workers Comp Lawyer", keyword: "workers comp lawyer", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 40, avg_order: 4500, search_volume: "medium", margin: 0.35 },
  { id: "divorce_lawyer", category: "legal", label: "Divorce Lawyer", keyword: "divorce lawyer", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 35, avg_order: 5500, search_volume: "high", margin: 0.45 },
  { id: "family_law", category: "legal", label: "Family Law", keyword: "family lawyer", emergency: "MEDIUM", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 3500, search_volume: "medium", margin: 0.45 },
  { id: "bankruptcy_lawyer", category: "legal", label: "Bankruptcy Lawyer", keyword: "bankruptcy lawyer", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 35, avg_order: 2500, search_volume: "high", margin: 0.50 },
  { id: "immigration_lawyer", category: "legal", label: "Immigration Lawyer", keyword: "immigration lawyer", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 3500, search_volume: "high", margin: 0.50 },
  { id: "estate_planning", category: "legal", label: "Estate Planning", keyword: "estate planning lawyer", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 25, avg_order: 1500, search_volume: "medium", margin: 0.55 },
  { id: "real_estate_lawyer", category: "legal", label: "Real Estate Lawyer", keyword: "real estate lawyer", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 22, avg_order: 1200, search_volume: "medium", margin: 0.55 },
  { id: "social_security", category: "legal", label: "Social Security Disability", keyword: "social security disability lawyer", emergency: "MEDIUM", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 2500, search_volume: "medium", margin: 0.40 },

  // ── FINANCIAL (Need-Based) ──
  { id: "tax_prep", category: "financial", label: "Tax Preparation", keyword: "tax preparation", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 15, avg_order: 350, search_volume: "high", margin: 0.60 },
  { id: "tax_debt", category: "financial", label: "Tax Debt Relief", keyword: "tax debt relief", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 35, avg_order: 2500, search_volume: "medium", margin: 0.50 },
  { id: "credit_repair", category: "financial", label: "Credit Repair", keyword: "credit repair", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 1200, search_volume: "high", margin: 0.55 },
  { id: "debt_relief", category: "financial", label: "Debt Relief", keyword: "debt relief", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 30, avg_order: 2500, search_volume: "high", margin: 0.45 },
  { id: "mortgage", category: "financial", label: "Mortgage Broker", keyword: "mortgage broker", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 3500, search_volume: "high", margin: 0.40 },
  { id: "refinance", category: "financial", label: "Mortgage Refinance", keyword: "mortgage refinance", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 22, avg_order: 3500, search_volume: "high", margin: 0.38 },
  { id: "reverse_mortgage", category: "financial", label: "Reverse Mortgage", keyword: "reverse mortgage", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 30, avg_order: 5500, search_volume: "medium", margin: 0.35 },
  { id: "auto_insurance", category: "financial", label: "Auto Insurance", keyword: "auto insurance", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 35, avg_order: 1500, search_volume: "high", margin: 0.20 },
  { id: "home_insurance", category: "financial", label: "Home Insurance", keyword: "home insurance", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 25, avg_order: 1800, search_volume: "high", margin: 0.22 },
  { id: "life_insurance", category: "financial", label: "Life Insurance", keyword: "life insurance", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 30, avg_order: 850, search_volume: "high", margin: 0.30 },
  { id: "financial_planning", category: "financial", label: "Financial Planning", keyword: "financial planner", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 25, avg_order: 2500, search_volume: "medium", margin: 0.45 },

  // ── SECURITY & SMART HOME (Need-Based) ──
  { id: "security_system", category: "security", label: "Security System", keyword: "home security system", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 25, avg_order: 1200, search_volume: "high", margin: 0.45 },
  { id: "security_cameras", category: "security", label: "Security Cameras", keyword: "security camera installation", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 20, avg_order: 850, search_volume: "high", margin: 0.45 },
  { id: "alarm_system", category: "security", label: "Alarm System", keyword: "alarm system installation", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 22, avg_order: 650, search_volume: "medium", margin: 0.45 },
  { id: "access_control", category: "security", label: "Access Control", keyword: "access control system", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 25, avg_order: 2200, search_volume: "low", margin: 0.40 },
  { id: "smart_home", category: "security", label: "Smart Home Installation", keyword: "smart home installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 18, avg_order: 1200, search_volume: "medium", margin: 0.45 },
  { id: "home_theater", category: "security", label: "Home Theater Installation", keyword: "home theater installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 16, avg_order: 3500, search_volume: "medium", margin: 0.40 },
  { id: "tv_mounting", category: "security", label: "TV Mounting", keyword: "tv mounting", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 10, avg_order: 180, search_volume: "high", margin: 0.65 },
  { id: "network_install", category: "security", label: "Home Network Installation", keyword: "home network installation", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 14, avg_order: 450, search_volume: "medium", margin: 0.55 },

  // ── COMMERCIAL/B2B (Need-Based) ──
  { id: "commercial_cleaning", category: "commercial", label: "Commercial Cleaning", keyword: "commercial cleaning", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 850, search_volume: "high", margin: 0.55 },
  { id: "janitorial", category: "commercial", label: "Janitorial Service", keyword: "janitorial service", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 10, avg_order: 650, search_volume: "medium", margin: 0.55 },
  { id: "hood_cleaning", category: "commercial", label: "Kitchen Hood Cleaning", keyword: "hood cleaning", emergency: "HIGH", psychology: "COMPLIANCE", avg_cpc: 15, avg_order: 450, search_volume: "medium", margin: 0.60 },
  { id: "fire_suppression", category: "commercial", label: "Fire Suppression", keyword: "fire suppression system", emergency: "HIGH", psychology: "COMPLIANCE", avg_cpc: 22, avg_order: 3500, search_volume: "low", margin: 0.45 },
  { id: "fire_extinguisher", category: "commercial", label: "Fire Extinguisher Service", keyword: "fire extinguisher service", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 14, avg_order: 150, search_volume: "low", margin: 0.65 },
  { id: "commercial_roofing", category: "commercial", label: "Commercial Roofing", keyword: "commercial roofing", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 20, avg_order: 25000, search_volume: "medium", margin: 0.30 },
  { id: "commercial_hvac", category: "commercial", label: "Commercial HVAC", keyword: "commercial hvac", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 5500, search_volume: "medium", margin: 0.35 },
  { id: "commercial_electrical", category: "commercial", label: "Commercial Electrical", keyword: "commercial electrician", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 22, avg_order: 1800, search_volume: "medium", margin: 0.40 },
  { id: "commercial_plumbing", category: "commercial", label: "Commercial Plumbing", keyword: "commercial plumber", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 20, avg_order: 1200, search_volume: "medium", margin: 0.45 },
  { id: "parking_lot", category: "commercial", label: "Parking Lot Maintenance", keyword: "parking lot maintenance", emergency: "MEDIUM", psychology: "COMPLIANCE", avg_cpc: 14, avg_order: 2500, search_volume: "low", margin: 0.45 },
  { id: "it_services", category: "commercial", label: "IT Services", keyword: "it services", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 25, avg_order: 1500, search_volume: "high", margin: 0.50 },
  { id: "cybersecurity", category: "commercial", label: "Cybersecurity", keyword: "cybersecurity services", emergency: "HIGH", psychology: "PANIC_URGENCY", avg_cpc: 35, avg_order: 3500, search_volume: "medium", margin: 0.50 },
  { id: "web_design", category: "commercial", label: "Web Design", keyword: "web design", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 20, avg_order: 3500, search_volume: "high", margin: 0.45 },
  { id: "seo_services", category: "commercial", label: "SEO Services", keyword: "seo services", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 25, avg_order: 2500, search_volume: "high", margin: 0.50 },
  { id: "junk_removal", category: "commercial", label: "Junk Removal", keyword: "junk removal", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 12, avg_order: 450, search_volume: "high", margin: 0.60 },
  { id: "dumpster_rental", category: "commercial", label: "Dumpster Rental", keyword: "dumpster rental", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 14, avg_order: 450, search_volume: "high", margin: 0.55 },
  { id: "storage_units", category: "commercial", label: "Storage Units", keyword: "storage units", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 15, avg_order: 150, search_volume: "high", margin: 0.55 },
  { id: "moving_company", category: "commercial", label: "Moving Company", keyword: "moving company", emergency: "MEDIUM", psychology: "CONVENIENCE", avg_cpc: 18, avg_order: 1500, search_volume: "high", margin: 0.40 },

  // ── PEST-ADJACENT / SPECIALTY ──
  { id: "chimney_repair", category: "specialty", label: "Chimney Repair", keyword: "chimney repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 15, avg_order: 1800, search_volume: "medium", margin: 0.45 },
  { id: "chimney_sweep", category: "specialty", label: "Chimney Sweep", keyword: "chimney sweep", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 12, avg_order: 250, search_volume: "medium", margin: 0.65 },
  { id: "artificial_turf", category: "specialty", label: "Artificial Turf", keyword: "artificial turf installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 15, avg_order: 8500, search_volume: "medium", margin: 0.35 },
  { id: "landscape_lighting", category: "specialty", label: "Landscape Lighting", keyword: "landscape lighting", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 13, avg_order: 3500, search_volume: "low", margin: 0.45 },
  { id: "french_drain", category: "specialty", label: "French Drain", keyword: "french drain installation", emergency: "HIGH", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 16, avg_order: 4500, search_volume: "medium", margin: 0.40 },
  { id: "walk_in_tub", category: "specialty", label: "Walk-In Tub", keyword: "walk in tub installation", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 35, avg_order: 8500, search_volume: "medium", margin: 0.30 },
  { id: "stair_lift", category: "specialty", label: "Stair Lift", keyword: "stair lift installation", emergency: "MEDIUM", psychology: "HEALTH_SAFETY", avg_cpc: 30, avg_order: 5500, search_volume: "medium", margin: 0.30 },
  { id: "home_elevator", category: "specialty", label: "Home Elevator", keyword: "home elevator installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 28, avg_order: 35000, search_volume: "low", margin: 0.25 },
  { id: "masonry", category: "specialty", label: "Masonry", keyword: "masonry repair", emergency: "MEDIUM", psychology: "PROBLEM_AVOIDANCE", avg_cpc: 14, avg_order: 2800, search_volume: "medium", margin: 0.40 },
  { id: "stone_veneer", category: "specialty", label: "Stone Veneer", keyword: "stone veneer installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 15, avg_order: 4500, search_volume: "low", margin: 0.38 },
  { id: "paver_install", category: "specialty", label: "Paver Installation", keyword: "paver installation", emergency: "MEDIUM", psychology: "ASPIRATION", avg_cpc: 13, avg_order: 5500, search_volume: "medium", margin: 0.35 },
];

// Category metadata
export const NICHE_CATEGORIES = [
  { id: "restoration", label: "Emergency Restoration", icon: "Flame", color: "red" },
  { id: "emergency_home", label: "Emergency Home", icon: "Siren", color: "red" },
  { id: "garage_concrete", label: "Garage & Concrete", icon: "Square", color: "amber" },
  { id: "roofing", label: "Roofing", icon: "Home", color: "orange" },
  { id: "hvac", label: "HVAC", icon: "Wind", color: "blue" },
  { id: "plumbing", label: "Plumbing", icon: "Droplet", color: "blue" },
  { id: "electrical", label: "Electrical", icon: "Zap", color: "amber" },
  { id: "exterior", label: "Exterior & Landscape", icon: "Trees", color: "green" },
  { id: "cleaning", label: "Cleaning & Washing", icon: "Sparkles", color: "cyan" },
  { id: "pest", label: "Pest Control", icon: "Bug", color: "red" },
  { id: "pool", label: "Pool & Spa", icon: "Waves", color: "cyan" },
  { id: "energy", label: "Insulation & Energy", icon: "Sun", color: "amber" },
  { id: "interior", label: "Interior Home", icon: "Paintbrush", color: "purple" },
  { id: "garage_door", label: "Garage Doors", icon: "DoorOpen", color: "amber" },
  { id: "appliance", label: "Appliance Repair", icon: "Refrigerator", color: "blue" },
  { id: "automotive", label: "Automotive", icon: "Car", color: "stone" },
  { id: "health", label: "Health & Medical", icon: "HeartPulse", color: "red" },
  { id: "legal", label: "Legal Services", icon: "Scale", color: "stone" },
  { id: "financial", label: "Financial", icon: "DollarSign", color: "green" },
  { id: "security", label: "Security & Smart Home", icon: "Shield", color: "blue" },
  { id: "commercial", label: "Commercial / B2B", icon: "Building2", color: "stone" },
  { id: "specialty", label: "Specialty", icon: "Wrench", color: "purple" },
];

export function getNichesByCategory(categoryId) {
  return UNIVERSAL_NICHES.filter((n) => n.category === categoryId);
}

export function getNichesByEmergency(level) {
  return UNIVERSAL_NICHES.filter((n) => n.emergency === level);
}

export function getNicheById(id) {
  return UNIVERSAL_NICHES.find((n) => n.id === id);
}

export function getEmergencyStats() {
  const stats = {};
  Object.keys(EMERGENCY_LEVELS).forEach((level) => {
    stats[level] = UNIVERSAL_NICHES.filter((n) => n.emergency === level).length;
  });
  return stats;
}