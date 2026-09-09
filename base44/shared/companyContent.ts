// Researched company content for the Xtreme Polishing Systems family of
// brands. Sourced from xtremepolishingsystems.com, xpsxpress.com, and
// polishedconcreteuniversity.com. Used to enrich the bid email and admin.

// Real customer epoxy-floor transformation photos (from XPS storefront
// reviews). Embedded inline in the bid email so they ship with the message.
export const GALLERY_IMAGES = [
  {
    url: "https://images.loox.io/uploads/2023/10/6/rt0_Quwno.jpg",
    alt: "Signature flake epoxy garage floor",
    caption: "Signature Flake",
  },
  {
    url: "https://images.loox.io/uploads/2024/3/6/2MvjYfUie.jpg",
    alt: "Clear coat epoxy garage floor",
    caption: "Clear Coat Finish",
  },
  {
    url: "https://images.loox.io/uploads/2023/10/5/-qY-pp735.jpg",
    alt: "Full epoxy garage floor kit installation",
    caption: "Full Garage Kit",
  },
];

export const COMPANY_CONTENT = {
  founded: "2007",
  headquarters: "Pompano Beach, FL",
  about:
    "Xtreme Polishing Systems has been the nation's premier decorative concrete solutions provider for nearly two decades — manufacturing and distributing the equipment, industrial coatings, and tools behind America's best epoxy and polished concrete floors.",
  stats: [
    { value: "Since 2007", label: "Family owned" },
    { value: "50+", label: "XPS Xpress stores" },
    { value: "47", label: "States served" },
    { value: "98%", label: "Client retention" },
  ],
  qualifications: [
    "Certified, factory-trained installation crews",
    "Premium industrial-grade epoxy & polyaspartic systems — the same products the pros buy",
    "Backed by a nationwide workmanship warranty",
    "Part of the Xtreme Polishing Systems family — the industry's #1 source for epoxy & polished concrete",
  ],
  pcu: {
    name: "Polished Concrete University",
    since: "2017",
    blurb:
      "The world's #1 hands-on trade school for epoxy & polished concrete. 5-day certification courses with hands-on training and lifetime support, held every month at our Pompano Beach HQ and select XPS Xpress locations.",
    phone: "(954) 228-8856",
  },
};

export const WARRANTY_TEXT =
  "The company warrants its workmanship for the lifetime of the installation. This warranty covers peeling, delamination, or failure of the installed flooring system attributable to improper installation. It does not cover damage caused by moisture intrusion from below the slab, hydrostatic pressure, acts of God, abuse, neglect, improper maintenance, chemical exposure beyond normal residential use, or modifications by others. Manufacturer product warranties apply separately and are passed through to the customer.";

export const TERMS_TEXT =
  "1. This proposal is valid for 30 days from the date above. 2. A 50% deposit is required to schedule the work; the balance is due upon completion. 3. The customer is responsible for clearing the workspace of all furniture, vehicles, and personal belongings prior to the crew's arrival. 4. Pricing is based on the stated square footage and condition; any variance discovered on site may result in a change order. 5. The company is fully licensed and insured. 6. A change order must be approved in writing by both parties before additional work is performed. 7. Payment terms are net upon completion; late payments may incur a 1.5% monthly finance charge. 8. The company is not responsible for damage caused by pre-existing latent defects, moisture conditions not disclosed, or work performed by others. 9. This proposal, once signed, constitutes the agreement between the parties.";

export const FAQS = [
  { q: "How accurate is the instant estimate?", a: "It is a preliminary range based on the information you provide. Your final price is confirmed after speaking with a specialist and, when necessary, inspecting your concrete." },
  { q: "How long does an installation take?", a: "Most residential garages are completed in a 1-2 day window depending on size and prep. Your specialist will confirm the schedule for your project." },
  { q: "Do I have to move everything out of the garage?", a: "The floor needs to be clear to be prepared and coated. We'll walk you through exactly what's needed before the install date." },
  { q: "What if I already have an old coating?", a: "Existing coatings usually need to be removed before a new system goes down. We factor that into your estimate and scope of work." },
  { q: "Is the estimate a contract?", a: "No. It is an initial estimate only and is not a proposal or a guaranteed final price." },
  { q: "What's covered under your warranty?", a: "Our installation is backed by a lifetime workmanship warranty covering peeling, delamination, or failure attributable to improper installation. Manufacturer product warranties apply separately." },
  { q: "What are the payment terms?", a: "A 50% deposit schedules the work; the balance is due upon completion. This proposal is valid for 30 days." },
];

// Returns the scope-of-work items for a Flake Epoxy garage floor, tailored to
// the lead's floor condition (cracks, moisture, joints added conditionally).
export function scopeForLead(floorCondition) {
  const c = Array.isArray(floorCondition) ? floorCondition : [floorCondition].filter(Boolean);
  const has = (k) => c.includes(k);
  const hasCracks = c.length > 0 && !c.every((x) => x === "good");
  const hasMoisture = has("epoxy") || has("major");
  const hasJoints = has("several") || has("major");
  const items = [
    { label: "Concrete surface preparation", detail: "Diamond grind the existing concrete substrate to remove existing coatings, adhesives, oil, and contaminants. Open the surface to a CSP-2/CSP-3 profile." },
  ];
  if (hasCracks) items.push({ label: "Crack and surface repair", detail: "Fill all cracks, spalls, pop-outs, and surface defects with two-part epoxy repair mortar. Grind flush after cure." });
  items.push({ label: "Perimeter protection", detail: "Apply plastic sheeting and painter's tape to all walls, baseboards, door frames, and adjacent surfaces to protect from overspray and splatter." });
  if (hasMoisture) items.push({ label: "Moisture mitigation", detail: "Apply a moisture vapor barrier primer to the prepared substrate where elevated moisture is detected." });
  items.push({ label: "Epoxy base coat", detail: "Apply epoxy base coat pigmented to match or complement your selected flake color." });
  items.push({ label: "Flake broadcast", detail: "Broadcast vinyl flake to refusal (100% coverage) into the wet base coat. Allow to cure, then scrape, sweep, and vacuum all loose flake." });
  if (hasJoints) items.push({ label: "Joint filler", detail: "Fill all control joints and construction joints with semi-rigid polyurea or epoxy joint filler, then shave flush." });
  items.push({ label: "Topcoat - polyaspartic / urethane", detail: "Apply two coats of clear polyaspartic or urethane topcoat to encapsulate the flake and provide UV stability, chemical resistance, and wear protection." });
  items.push({ label: "Final walk-through inspection", detail: "Conduct a final walk-through inspection with you to confirm flake distribution, finish quality, and surface integrity." });
  return items;
}