// Simulation Questionnaire System
// Each category contains questions that the simulated contractor archetypes
// and admin profiles must answer to judge the system.

export const QUESTIONNAIRE_CATEGORIES = [
  {
    id: "lead_capture",
    name: "Lead Capture & Response",
    description: "How well does the system capture and respond to inbound leads?",
    weight: 15,
    questions: [
      { id: "lc1", text: "Does the system answer every inbound call instantly, even while I'm installing?", type: "rating", maxScore: 10 },
      { id: "lc2", text: "Does it qualify the lead before reaching me (garage size, timeline, address)?", type: "rating", maxScore: 10 },
      { id: "lc3", text: "Does it capture Facebook/Instagram messages and respond within 60 seconds?", type: "rating", maxScore: 10 },
      { id: "lc4", text: "Does it capture website form submissions and auto-respond?", type: "rating", maxScore: 10 },
      { id: "lc5", text: "Does it text me a summary of every captured lead?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "follow_up",
    name: "Lead Follow-Up & Nurture",
    description: "Does the system follow up automatically so no lead goes cold?",
    weight: 12,
    questions: [
      { id: "fu1", text: "Does it send automated follow-up sequences (Day 1, 3, 7, 14)?", type: "rating", maxScore: 10 },
      { id: "fu2", text: "Does it include visualizer renders in follow-up emails?", type: "rating", maxScore: 10 },
      { id: "fu3", text: "Does it nurture long-term leads (30-90 days) with monthly content?", type: "rating", maxScore: 10 },
      { id: "fu4", text: "Does it show me a pipeline of every lead and its stage?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "estimating",
    name: "Estimating & Takeoff",
    description: "How fast and accurate is the estimating process?",
    weight: 15,
    questions: [
      { id: "es1", text: "Can I generate a complete estimate in under 5 minutes?", type: "rating", maxScore: 10 },
      { id: "es2", text: "Does it auto-pull property sqft from public records?", type: "rating", maxScore: 10 },
      { id: "es3", text: "Does it auto-include all line items based on floor conditions?", type: "rating", maxScore: 10 },
      { id: "es4", text: "Does it use consistent, saved pricing every time?", type: "rating", maxScore: 10 },
      { id: "es5", text: "Does it generate a branded, itemized proposal?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "visualization",
    name: "Visualization & Sales",
    description: "Can the customer SEE their floor before buying?",
    weight: 12,
    questions: [
      { id: "vi1", text: "Can I upload a photo of the customer's actual garage and show it in 3 colors?", type: "rating", maxScore: 10 },
      { id: "vi2", text: "Does the render generate in under 30 seconds?", type: "rating", maxScore: 10 },
      { id: "vi3", text: "Can I show metallic vs flake side-by-side on their floor?", type: "rating", maxScore: 10 },
      { id: "vi4", text: "Is the full XPS color chart (200+ colors) available with real photos?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "materials",
    name: "Material Ordering",
    description: "Does the system connect estimating to material ordering?",
    weight: 10,
    questions: [
      { id: "ma1", text: "Does it auto-calculate exact kit count, flake code, and topcoat from the estimate?", type: "rating", maxScore: 10 },
      { id: "ma2", text: "Can I order from XPS with one tap?", type: "rating", maxScore: 10 },
      { id: "ma3", text: "Does it check real-time XPS inventory at nearby stores?", type: "rating", maxScore: 10 },
      { id: "ma4", text: "Does it include a 10% waste factor automatically?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "scheduling",
    name: "Scheduling & Crew Management",
    description: "Does the system prevent double-booking and no-shows?",
    weight: 10,
    questions: [
      { id: "sc1", text: "Does it prevent double-booking automatically?", type: "rating", maxScore: 10 },
      { id: "sc2", text: "Does it send automated customer reminders (24hr, 1hr)?", type: "rating", maxScore: 10 },
      { id: "sc3", text: "Does it track crew GPS location in real-time?", type: "rating", maxScore: 10 },
      { id: "sc4", text: "Does it optimize routes between jobs?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "installation",
    name: "Installation Day",
    description: "Does the system document and communicate during install?",
    weight: 8,
    questions: [
      { id: "in1", text: "Does it prompt photo documentation of prep (moisture test, cracks, grind)?", type: "rating", maxScore: 10 },
      { id: "in2", text: "Does it auto-send progress updates to the customer?", type: "rating", maxScore: 10 },
      { id: "in3", text: "Does it auto-capture before/after photos and queue them for social media?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "proposal",
    name: "Proposal, Signature & Deposit",
    description: "Can the customer sign and pay in one tap?",
    weight: 8,
    questions: [
      { id: "pr1", text: "Does it send a branded digital proposal via text?", type: "rating", maxScore: 10 },
      { id: "pr2", text: "Does it include one-tap e-signature?", type: "rating", maxScore: 10 },
      { id: "pr3", text: "Does it include one-tap deposit payment (card/ACH)?", type: "rating", maxScore: 10 },
      { id: "pr4", text: "Does it track when the proposal is opened and viewed?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "invoicing",
    name: "Invoicing & Collections",
    description: "Does the system automate invoicing and payment collection?",
    weight: 5,
    questions: [
      { id: "iv1", text: "Does it auto-generate invoices on job completion?", type: "rating", maxScore: 10 },
      { id: "iv2", text: "Does it send automated payment reminders (Day 3, 7, 14)?", type: "rating", maxScore: 10 },
      { id: "iv3", text: "Does it show a real-time A/R aging dashboard?", type: "rating", maxScore: 10 },
    ],
  },
  {
    id: "reviews",
    name: "Reviews & Reputation",
    description: "Does the system automatically collect and share reviews?",
    weight: 5,
    questions: [
      { id: "re1", text: "Does it auto-send a review request 24hrs after job completion?", type: "rating", maxScore: 10 },
      { id: "re2", text: "Does it send a 7-day check-in to catch issues before they become bad reviews?", type: "rating", maxScore: 10 },
      { id: "re3", text: "Does it auto-share best reviews to the website and social media?", type: "rating", maxScore: 10 },
    ],
  },
];

export const TOTAL_WEIGHT = QUESTIONNAIRE_CATEGORIES.reduce((sum, c) => sum + c.weight, 0);

export function calculateScore(answers) {
  let totalScore = 0;
  for (const cat of QUESTIONNAIRE_CATEGORIES) {
    const catScore = cat.questions.reduce((sum, q) => {
      const answer = answers[q.id] || 0;
      return sum + (answer / q.maxScore) * 10;
    }, 0) / cat.questions.length;
    totalScore += (catScore / 10) * cat.weight;
  }
  return Math.round((totalScore / TOTAL_WEIGHT) * 100);
}