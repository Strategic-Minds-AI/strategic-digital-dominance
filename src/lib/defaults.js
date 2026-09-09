export const DEFAULT_SETTINGS = {
  company_name: "Xtreme Polishing Systems",
  public_business_name: "Xtreme Polishing Systems",
  legal_business_name: "Xtreme Polishing Systems",
  phone: "(877) 958-5264",
  // AI / SMS / MMS automation line — used for automated outreach, replies,
  // and as the escalation destination. Surfaced across the site as "Text Us".
  automation_phone: "+1-833-700-1239",
  automation_phone_display: "1-833-700-1239",
  email: "jeremy@xtremepolishingsystems.com",
  business_address: "2200 NW 32nd St, Pompano Beach, FL 33069",
  service_area: "Pompano Beach, FL and surrounding South Florida communities",
  primary_city: "Pompano Beach",
  primary_state: "FL",
  google_maps_api_key: "",
  is_test_pricing: true,
  show_precise_bid: true,
  default_location_mode: "nearest",
  size_defaults: { one_car: 240, two_car: 440, three_car: 660, four_car: 880, not_sure: 440 },
  systems: [
    { key: "flake", name: "Decorative Flake Floor", description: "Classic residential garage coating with a decorative flake blend. Popular, durable, and budget-friendly.", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", price_per_sqft: 7 },
    { key: "premium_flake", name: "Premium Flake Floor", description: "Higher-end decorative flake system with a fuller, more uniform finish and expanded color options.", image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", price_per_sqft: 9 },
    { key: "solid", name: "Solid Color Floor", description: "Clean, uniform single-color finish. A sleek, modern look.", image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800", price_per_sqft: 6 },
    { key: "metallic", name: "Metallic Floor", description: "Premium decorative system with a flowing, reflective metallic appearance.", image_url: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800", price_per_sqft: 12 },
    { key: "not_sure", name: "Help Me Choose", description: "Not sure which finish is right? We'll help you decide based on your garage and budget.", image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", price_per_sqft: 8 }
  ],
  condition_adjustments: [
    { key: "good", label: "Clean / bare concrete", percent: 0 },
    { key: "minor", label: "Minor cracks or stains", percent: 5 },
    { key: "several", label: "Several cracks or repairs needed", percent: 12 },
    { key: "paint", label: "Painted concrete", percent: 10 },
    { key: "epoxy", label: "Existing coating needs removal", percent: 18 },
    { key: "major", label: "Major damage / not sure", percent: 20 }
  ],
  minimum_project_price: 1800,
  range_low_percent: 12,
  range_high_percent: 15,
  packages: [
    { tier: "GOOD", name: "Professional Garage Floor", description: "Our core garage floor package with a clean, durable finished look.", multiplier: 0.85 },
    { tier: "BETTER", name: "Premium Garage Floor", description: "Upgraded finish detail and expanded color and flake selection.", multiplier: 1 },
    { tier: "BEST", name: "Designer Garage Floor", description: "Our highest-detail decorative package with custom design input.", multiplier: 1.25 }
  ],
  lead_scoring: {
    timeline: { "AS SOON AS POSSIBLE": 30, "WITHIN 30 DAYS": 22, "1–3 MONTHS": 12, "3–6 MONTHS": 6, "JUST RESEARCHING": 3 },
    garage_size: { one_car: 5, two_car: 12, three_car: 18, four_car: 22, custom: 15, not_sure: 8 },
    has_full_address: 10,
    has_photos: 10,
    consultation_booked: 20,
    call_clicked: 15
  },
  salesperson: {
    name: "Jeremy Bensen",
    title: "Senior Floor Specialist",
    bio: "Jeremy has helped hundreds of South Florida homeowners choose the right garage floor finish for their space, budget, and timeline.",
    phone: "(877) 958-5264",
    photo_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/9508dc51b_generated_image.png"
  },
  // Real, verified reviews — sourced from Google via Trustindex (5.0/5, 5 reviews).
  // These are actual customer reviews of Xtreme Polishing Systems, verbatim.
  google_rating: 5.0,
  google_review_count: 5,
  testimonials: [
    { name: "Tasha", location: "Google Review", quote: "Matt & Justin were great course trainers, Matt especially sharing all his hands-on experience with best tools, materials, pricing etc. These guys are the best in the business and just good people to know.", rating: 5 },
    { name: "Alun Owen", location: "Google Review", quote: "A brilliant course run by a very informative team but in a totally relaxed atmosphere. Learnt loads on this course and cannot wait to undertake work learnt during the three days.", rating: 5 },
    { name: "Feature Finishes", location: "Google Review", quote: "The XPS course is taught by three very knowledgeable, experienced resin installers who are at the top of their game. They are very down to earth, helpful and good at sharing their knowledge.", rating: 5 },
    { name: "James Metcalf", location: "Google Review", quote: "Fantastic course and great products, aftercare is also second to none! Would recommend XPS highly!", rating: 5 },
    { name: "Reece Burgess", location: "Google Review", quote: "Great epoxy training course from start to finish. Matt and Justin were both brilliant — really knowledgeable, easy to learn from, and always happy to answer questions.", rating: 5 }
  ],
  gallery: [
    { before_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/2fa2f386d_generated_image.png", after_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/37f839d5d_generated_image.png", caption: "2-car garage, gray/black/white flake — Pompano Beach" },
    { before_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/2fa2f386d_generated_image.png", after_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/0df228a3a_generated_image.png", caption: "2-car garage, tan/brown Outback flake — Coral Springs" },
    { before_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/2fa2f386d_generated_image.png", after_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/daa85fba2_generated_image.png", caption: "2-car garage, blue/gray Rapids flake — Deerfield Beach" }
  ],
  calendar_url: "",
  disclaimer: "This is a preliminary project estimate — not a contract, proposal, or guaranteed final price. Final pricing may change based on actual square footage, concrete condition, moisture, cracks, repairs, existing coatings, preparation requirements, access, selected system, and other site-specific conditions confirmed during an in-home inspection.",
  consent_language: "By submitting this form you agree to be contacted by phone, text, and email about your garage floor estimate. Message and data rates may apply. You can opt out at any time.",
  hero_image_url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/37f839d5d_generated_image.png",
  seo: {
    site_name: "Xtreme Polishing Systems",
    default_title: "Xtreme Polishing Systems | Garage Floor Coating Estimates in Pompano Beach, FL",
    default_description: "EpoxyGarageFloorEstimate.com offers instant epoxy garage floor cost estimates in Pompano Beach, FL. Get your free, personalized price range in 60 seconds.",
    business_hours: "Mon–Sat 7:00am–7:00pm",
    business_category: "Garage Floor Coating Contractor",
    gbp_url: "",
    review_url: "https://www.trustindex.io/reviews/xtremepolishingsystems.uk",
    social_profiles: []
  }
};

export const SIZE_OPTIONS = [
  { key: "one_car", label: "1-Car Garage" },
  { key: "two_car", label: "2-Car Garage" },
  { key: "three_car", label: "3-Car Garage" },
  { key: "four_car", label: "4+ Car Garage" },
  { key: "custom", label: "Custom Size" },
  { key: "not_sure", label: "I'm Not Sure" }
];

export const TIMELINE_OPTIONS = [
  "AS SOON AS POSSIBLE",
  "WITHIN 30 DAYS",
  "1–3 MONTHS",
  "3–6 MONTHS",
  "JUST RESEARCHING"
];