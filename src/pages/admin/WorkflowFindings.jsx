import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";

export default function WorkflowFindings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-lg border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/contractor-workflow")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-sm font-semibold text-stone-200 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Workflow
            </button>
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="XPS" className="h-8 w-8 object-contain" />
              <div>
                <h1 className="text-lg font-extrabold font-heading tracking-tight">Industry Research Findings</h1>
                <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">For Marketing Use</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:brightness-110 text-sm font-bold text-black transition"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <article className="prose prose-invert prose-sm max-w-none">
          <h1 className="text-3xl font-extrabold font-heading text-white mb-2">
            THE EPOXY CONTRACTOR'S COMPLETE WORKFLOW — END-TO-END ANALYSIS
          </h1>
          <p className="text-sm text-stone-400 mb-8 italic">
            Researched across contractor forums (Reddit r/Construction, r/Contractor, r/estimators), industry publications
            (Projul, Floorzap, Service Buddy, BuildOps, ShowFloor AI), Xtreme Polishing Systems/XPS Xpress, and the
            decorative/polished concrete market ($20.67B in 2025, growing 6.2% CAGR).
          </p>

          {/* PART 1 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-10 mb-4 border-b border-stone-800 pb-2">
            PART 1: THE COMPLETE CONTRACTOR WORKFLOW (Hour → Day → Week → Month)
          </h2>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">☀️ HOUR-BY-HOUR (A typical installation day)</h3>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Hour</th>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Manual?</th>
                  <th className="px-3 py-2">Pain</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["5:30 AM", "Wake up, check phone for lead emails/texts that came in overnight", "Manual", "🟡 Medium"],
                  ["6:00 AM", "Coffee, mentally plan the day — which job, which crew, what materials", "Mental", "🟡 Medium"],
                  ["6:30 AM", "Text/call crew to confirm they're coming and where to meet", "Manual", "🔴 High"],
                  ["7:00 AM", "Load truck — grab kits, flakes, tools. Hope you grabbed the right color", "Manual", "🔴 High"],
                  ["7:30 AM", "Drive to jobsite (30-60 min)", "—", "—"],
                  ["8:30 AM", "Arrive, meet homeowner, walk the floor, eyeball square footage", "Manual", "🔴 High"],
                  ["9:00 AM", "Start prep — grind, patch cracks, moisture test", "Skilled", "🟡 Medium"],
                  ["12:00 PM", "Lunch break (if there is one)", "—", "—"],
                  ["1:00 PM", "Mix and pour base coat, broadcast flakes", "Skilled", "🟡 Medium"],
                  ["3:00 PM", "Scrape flakes, vacuum, apply topcoat", "Skilled", "🟡 Medium"],
                  ["4:30 PM", "Clean up, collect final payment (or 'I'll send it tonight')", "Manual", "🔴 High"],
                  ["5:00 PM", "Drive home", "—", "—"],
                  ["6:00 PM", "Return missed calls from the day — 3 leads went to voicemail", "Manual", "🔴 High"],
                  ["7:00 PM", "Sit at kitchen table, write estimates in Excel/Notepad", "Manual", "🔴 High"],
                  ["8:00 PM", "Text back the leads who asked 'how much?' on Instagram/Facebook", "Manual", "🟡 Medium"],
                  ["9:00 PM", "Order materials for tomorrow — call XPS store, hope they have it", "Manual", "🔴 High"],
                  ["10:00 PM", "Collapse. Repeat tomorrow.", "—", "—"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 font-mono text-amber-400 font-bold">{row[0]}</td>
                    <td className="px-3 py-2">{row[1]}</td>
                    <td className="px-3 py-2 text-stone-500">{row[2]}</td>
                    <td className="px-3 py-2">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">📅 DAY-BY-DAY (A typical week)</h3>
          <div className="space-y-2 text-stone-300 text-sm">
            <p><strong className="text-amber-400">Monday:</strong> Install Job A. Return weekend leads at night. Send 2 estimates from scratch.</p>
            <p><strong className="text-amber-400">Tuesday:</strong> Install Job B (different city, 45 min away). A lead from last week wants to "think about it" — you forget to follow up. <span className="text-red-400 font-bold">(Lost revenue.)</span></p>
            <p><strong className="text-amber-400">Wednesday:</strong> No job booked. Spend 3 hours doing takeoffs/estimates manually. Drive to XPS store for materials. A Yelp review came in — you don't see it for 4 days.</p>
            <p><strong className="text-amber-400">Thursday:</strong> Install Job C. Customer asks "can I see what it'll look like first?" — you pull up a stock photo on your phone and say "trust me." <span className="text-red-400 font-bold">(Conversion risk.)</span></p>
            <p><strong className="text-amber-400">Friday:</strong> Install Job D. Collect deposit on next week's job. Forget to send the invoice. <span className="text-red-400 font-bold">(Cash flow delay.)</span></p>
            <p><strong className="text-amber-400">Saturday:</strong> Catch up on estimates. Miss your kid's soccer game. <span className="text-red-400 font-bold">(Family time lost.)</span></p>
            <p><strong className="text-amber-400">Sunday:</strong> Answer texts from anxious customers asking "when are you coming?" because you didn't communicate the schedule. Order materials for Monday.</p>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">📆 WEEK-BY-WEEK (A typical month)</h3>
          <div className="space-y-2 text-stone-300 text-sm">
            <p><strong className="text-amber-400">Week 1:</strong> 4 installs. 8 new leads. You follow up with 3 of them. 5 go cold. <span className="text-red-400 font-bold">(Lost: ~$15K-$25K in potential revenue.)</span></p>
            <p><strong className="text-amber-400">Week 2:</strong> 3 installs (one rained out). You forgot to order enough flake for one job — had to make a second XPS run, wasting 90 minutes. <span className="text-red-400 font-bold">($150 lost + half a day.)</span></p>
            <p><strong className="text-amber-400">Week 3:</strong> A customer from Week 1 hasn't paid their final. You're too busy to chase. <span className="text-red-400 font-bold">($2,500 outstanding.)</span></p>
            <p><strong className="text-amber-400">Week 4:</strong> Month-end. You realize you have no idea how much you actually made. You pull bank statements and guess. <span className="text-red-400 font-bold">(No financial visibility.)</span> You didn't post on social media once this month. <span className="text-red-400 font-bold">(Lead pipeline drying up.)</span></p>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">🗓️ MONTH-BY-MONTH (A quarter)</h3>
          <div className="space-y-2 text-stone-300 text-sm">
            <p><strong className="text-amber-400">Month 1:</strong> Busy but disorganized. Making money but stressed.</p>
            <p><strong className="text-amber-400">Month 2:</strong> A job fails — moisture issue, homeowner wants it redone. No documentation of prep. <span className="text-red-400 font-bold">(Your word vs. theirs. $3,500 loss.)</span></p>
            <p><strong className="text-amber-400">Month 3:</strong> You realize you're turning down leads because you can't keep up — but you also can't afford to hire help because cash flow is inconsistent. <span className="text-red-400 font-bold">(Growth ceiling.)</span></p>
            <p><strong className="text-amber-400">Month 4-12:</strong> Repeat. Burn out. Either quit, stay small, or buy generic software (Jobber/Housecall Pro) that doesn't understand epoxy and still leaves gaps.</p>
          </div>

          {/* PART 2 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-12 mb-4 border-b border-stone-800 pb-2">
            PART 2: THE MANUAL STEPS & PROBLEMATIC PARTS
          </h2>
          <h3 className="text-lg font-bold text-white mt-6 mb-3">What Contractors Complain About (from research)</h3>
          <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
            <li><strong className="text-white">"Estimating takes forever"</strong> — 2-3 days per takeoff for some (Reddit r/estimators). Excel is the default. No multi-player. No coating-specific logic.</li>
            <li><strong className="text-white">"Leads go cold because I can't follow up"</strong> — "Most flooring businesses don't lose jobs because of bad work or bad pricing. They lose them because of silence." (Service Buddy). This is the #1 cited complaint.</li>
            <li><strong className="text-white">"Customers ghost after deposit" / "Contractors ghost after deposit"</strong> — A two-way problem. Homeowners fear being ghosted; contractors fear non-payment. Trust is the industry's core deficit.</li>
            <li><strong className="text-white">"Scheduling double-books"</strong> — "Manual scheduling methods cause an average of 2.8 double-booking conflicts per month for mid-size contractors, costing up to $4,500 per event." (WrightPlan)</li>
            <li><strong className="text-white">"Material miscalculation"</strong> — "Underestimating the volume of product required leads to stressful delays and mismatched color batches." (APIowa). Wrong color, not enough product = second store run = lost half-day.</li>
            <li><strong className="text-white">"No work-life balance"</strong> — Contractors do estimates at 9 PM on the kitchen table. Miss kids' events. Burn out is the industry's silent killer. (Contractor Accelerator)</li>
            <li><strong className="text-white">"Customers can't visualize the result"</strong> — "Can I see what it'll look like?" is met with a stock photo and "trust me." Conversion drops. (ShowFloor AI research)</li>
            <li><strong className="text-white">"Invoicing and collections"</strong> — "Most delays are process problems, not payment problems. Missing documents and disorganized billing are the leading cause." (JK Rosenberger CPA)</li>
            <li><strong className="text-white">"Software doesn't fit epoxy"</strong> — "Generic CRMs fall apart when you try to handle the complexity of construction." (Reddit r/automation). Jobber/Housecall Pro don't understand mil thickness, resin systems, or flake broadcast rates.</li>
            <li><strong className="text-white">"I look unprofessional"</strong> — Scribbled estimates. Text-only communication. No branded proposal. The customer wonders if this guy is legit.</li>
          </ol>

          {/* PART 3 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-12 mb-4 border-b border-stone-800 pb-2">
            PART 3: WHERE THEY'RE LEAVING MONEY/STRESS/TIME ON THE TABLE
          </h2>

          <h3 className="text-lg font-bold text-green-400 mt-6 mb-3">💰 MONEY LEFT ON THE TABLE</h3>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Gap</th>
                  <th className="px-3 py-2">What They're Losing</th>
                  <th className="px-3 py-2">Root Cause</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["No follow-up system", "50-70% of leads never get a second touch. At $3K-$8K per job, that's $15K-$50K/month in lost revenue.", "Too busy installing to follow up manually"],
                  ["No visualizer", "Customers who can't see the result hesitate, price-shop, or walk. Conversion rates 30-50% lower without visualization.", "No tool to show THEIR floor in THEIR color"],
                  ["Manual estimating", "2-3 hours per estimate × 10 estimates/week = 20-30 hrs/week. That's a part-time job.", "Excel/Notepad, no templates"],
                  ["Material miscalculation", "Wrong order = second trip to XPS = 90 min + gas + crew standing around. ~$200-500/incident.", "Manual math, no system-linked material lists"],
                  ["No upsell system", "Customers don't know about baseboard coating, patios, commercial options.", "No structured upsell prompt"],
                  ["Late invoicing", "Invoice sent 5 days late × 4 jobs/month = 20 days of cash flow lag.", "Forgot to send, no automation"],
                  ["No reviews collected", "Each 5-star review is worth ~$500 in future leads. Most contractors collect 0.", "No automated review request"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 font-bold text-white">{row[0]}</td>
                    <td className="px-3 py-2">{row[1]}</td>
                    <td className="px-3 py-2 text-stone-500">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-red-400 mt-6 mb-3">😩 STRESS LEFT ON THE TABLE</h3>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Gap</th>
                  <th className="px-3 py-2">The Stress</th>
                  <th className="px-3 py-2">What It Costs</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["Kitchen-table estimating", "9 PM, exhausted, trying to remember pricing for metallic vs flake. Second-guessing.", "Mental load, errors, resentment"],
                  ["'Did I order enough?'", "Lying awake wondering if 3 kits is enough for tomorrow's 600 sq ft.", "Sleep loss, anxiety"],
                  ["Crew no-shows", "'Is Mike coming today?' Text at 6 AM, no answer.", "Morning chaos, customer waiting"],
                  ["Customer 'when are you coming?'", "15 texts a day from anxious customers. No schedule visibility for them.", "Constant interruption, feels like a servant"],
                  ["'Am I making money?'", "No real-time P&L. Just a gut feeling at month-end.", "Financial anxiety, can't make decisions"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 font-bold text-white">{row[0]}</td>
                    <td className="px-3 py-2">{row[1]}</td>
                    <td className="px-3 py-2 text-stone-500">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-blue-400 mt-6 mb-3">⏰ TIME LEFT ON THE TABLE (→ FAMILY TIME)</h3>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Gap</th>
                  <th className="px-3 py-2">Time Wasted</th>
                  <th className="px-3 py-2">What They Could Reclaim</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["Manual takeoffs", "2-3 hrs/estimate", "AI takeoff: 2 min. Reclaim 20+ hrs/week"],
                  ["Driving to XPS store", "90 min round trip, 2-3×/week", "Auto-order from app, delivery. Reclaim 4-6 hrs/week"],
                  ["Returning calls one by one", "60-90 min/evening", "AI voice assistant handles qualification. Reclaim 1 hr/day"],
                  ["Writing estimates from scratch", "45 min each", "Template + auto-fill: 5 min. Reclaim 6+ hrs/week"],
                  ["Chasing payments", "Hours on the phone", "Auto-reminders. Reclaim 3-5 hrs/week"],
                  ["Social media (or lack of it)", "0 hrs spent = 0 leads from social", "AI auto-generates posts. Reclaim pipeline without time cost"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 font-bold text-white">{row[0]}</td>
                    <td className="px-3 py-2 text-red-400">{row[1]}</td>
                    <td className="px-3 py-2 text-green-400">{row[2]}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-amber-500 bg-amber-500/10">
                  <td className="px-3 py-2 font-extrabold text-amber-400">TOTAL RECLAIMABLE</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 font-extrabold text-amber-400">30-40 hrs/week → a full workday with family</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-purple-400 mt-6 mb-3">🤝 CUSTOMER EXPERIENCE LEFT ON THE TABLE</h3>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Gap</th>
                  <th className="px-3 py-2">What Customer Experiences</th>
                  <th className="px-3 py-2">What They Should Experience</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["No visualization", "'I hope it looks good...' (anxiety)", "'I can see my floor in that color before I pay a dime' (confidence)"],
                  ["Scribbled estimate", "'Is this guy legit?' (doubt)", "Branded, itemized, professional proposal (trust)"],
                  ["No communication", "'When are you coming? Are you still coming?' (anxiety)", "Automated status updates: 'Crew arriving 8 AM Tuesday' (peace)"],
                  ["No follow-up after install", "'Did he care about my job?' (ambivalence)", "Automated check-in + review request (loyalty)"],
                  ["No documentation", "'What if it fails?' (fear)", "Photo-documented prep, warranty on file (security)"],
                  ["Cash/check only", "'Can I pay with a card?' (friction)", "One-tap digital payment (convenience)"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 font-bold text-white">{row[0]}</td>
                    <td className="px-3 py-2 text-red-400">{row[1]}</td>
                    <td className="px-3 py-2 text-green-400">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PART 4 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-12 mb-4 border-b border-stone-800 pb-2">
            PART 4: THE INDUSTRY GAP ANALYSIS
          </h2>
          <h3 className="text-lg font-bold text-white mt-6 mb-3">What the Epoxy/Decorative Concrete/Polished Concrete Industry Is Lacking</h3>
          <p className="text-stone-400 text-sm mb-4">
            Based on research across Xtreme Polishing Systems, XPS Xpress, ShowFloor AI, QuoteIQ, Floor Nexus, CoatingOS,
            Jobber, Housecall Pro, and contractor forums:
          </p>
          <div className="space-y-4">
            {[
              ["1. No Epoxy-Native All-in-One", "Every existing tool is either generic field service (Jobber, Housecall Pro) that doesn't understand mil thickness, resin systems, flake broadcast rates, moisture testing, or curing times; coating-specific but narrow (QuoteIQ = estimating only; ShowFloor AI = visualizer only; CoatingOS = CRM but no visualizer); or all-in-one but young (Floor Nexus) with visualizer on credits and thin ecosystem. The gap: No platform combines AI visualization + coating-native estimating + CRM + scheduling + material ordering (from XPS) + customer communication + invoicing + reputation management in ONE app."],
              ["2. No Material-Supplier Integration", "Contractors drive to XPS stores 2-3×/week. No app connects the estimate directly to the XPS inventory system and auto-orders. This is a massive gap — the contractor's software doesn't talk to their supplier's software."],
              ["3. No AI Voice Assistant for Lead Qualification", "Contractors miss calls while installing. Existing tools send the caller to voicemail. No epoxy-specific AI voice assistant that answers, qualifies, books the estimate, and texts the contractor a summary."],
              ["4. No Photo-Documented Prep Records", "When a floor fails, it's the contractor's word vs. the homeowner's. No platform automatically documents the prep process (moisture test photo, crack repair photo, grind photo) and ties it to the job record for warranty defense."],
              ["5. No Customer-Facing Portal", "Homeowners are left in the dark. No app gives the customer a portal where they can: see their estimate, see their scheduled date, see progress photos, make a payment, and leave a review — all in one place."],
              ["6. No Automated Social Proof Engine", "Contractors know they should post before/after photos on social media but don't have time. No tool auto-generates and schedules social posts from completed job photos with SEO-optimized captions."],
              ["7. No 'Can't Live Without It' Mobile Experience", "Most software is desktop-first. Contractors live on their phones, in their trucks, at jobsites. No app is designed mobile-first, offline-capable, and built for the 5:30 AM to 10 PM reality of a contractor's day."],
            ].map(([title, body], i) => (
              <div key={i} className="rounded-xl bg-stone-900 border border-stone-800 p-4">
                <h4 className="text-sm font-bold text-amber-400 mb-1">{title}</h4>
                <p className="text-sm text-stone-300 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* PART 5 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-12 mb-4 border-b border-stone-800 pb-2">
            PART 5: WHERE THIS APP BECOMES ADDICTIVE (Can't-Live-Without-It)
          </h2>
          <h3 className="text-lg font-bold text-white mt-6 mb-3">The "Heroin" Moments — When the Contractor Can't Go Back</h3>
          <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
            <li><strong className="text-amber-400">The first time they show a customer their OWN floor in 3 colors on an iPad and the customer says "I'll take it" without asking the price.</strong> They will never go back to "trust me" with a stock photo.</li>
            <li><strong className="text-amber-400">The first time the AI voice assistant answers a call while they're elbow-deep in epoxy, qualifies the lead, books the estimate, and texts them "New lead: John Smith, 440 sq ft garage, booked for Thursday 10 AM."</strong> They will never miss another lead.</li>
            <li><strong className="text-amber-400">The first time the estimate auto-generates from the visualizer (color, sq ft, system) and the material list auto-orders from XPS with one tap.</strong> They will never hand-calculate mil thickness again.</li>
            <li><strong className="text-amber-400">The first time a customer pays a deposit via text link while the contractor is driving home.</strong> They will never chase a check again.</li>
            <li><strong className="text-amber-400">The first time they open the app at 5:30 AM and see: today's job, crew confirmed, materials delivered, customer notified, route planned.</strong> They will never go back to chaos.</li>
            <li><strong className="text-amber-400">The first time their kid says "Dad, are you coming to my game?" and they can say "Yes" because the estimates are done and the follow-ups are automated.</strong> They will never quit the app.</li>
            <li><strong className="text-amber-400">The first time a floor fails and they pull up the photo-documented prep record and the homeowner says "Oh, you did everything right."</strong> They will never install without the app again.</li>
          </ol>

          <h3 className="text-lg font-bold text-white mt-8 mb-3">How Professional It Makes the Contractor Look</h3>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Without the App</th>
                  <th className="px-3 py-2">With the App</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["Scribbled estimate on lined paper", "Branded, itemized, digital proposal"],
                  ["'Trust me, it'll look great'", "iPad showing their actual floor in 3 finishes"],
                  ["'I'll call you back' (doesn't)", "Automated status updates throughout the job"],
                  ["Cash or check, 'mail it to me'", "One-tap digital payment link"],
                  ["No warranty documentation", "Photo-documented prep record + warranty on file"],
                  ["No online presence", "Auto-generated social posts + 5-star review collection"],
                  ["'Let me check my calendar' (a napkin)", "Real-time scheduling with customer self-booking"],
                  ["'I think I have enough material'", "Auto-calculated material order from XPS inventory"],
                  ["Voicemail full, leads lost", "AI voice assistant answers every call"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 text-red-400">{row[0]}</td>
                    <td className="px-3 py-2 text-green-400">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-amber-400 font-bold mt-4">
            The contractor goes from "a guy with a truck" to "a professional flooring company with a system." That's the
            difference between $3K jobs and $8K jobs. Between one crew and three crews. Between burnout and a business
            that runs itself.
          </p>

          {/* PART 6 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-12 mb-4 border-b border-stone-800 pb-2">
            PART 6: THE END-TO-END SOLUTION LIST
          </h2>
          <p className="text-sm text-stone-400 italic mb-6">
            Stage → What They're Losing → The Stress → 3 Examples → The Tool That Solves It → Happiness Increase → Trust & Loyalty Potential
          </p>

          {[
            { stage: 1, name: "LEAD CAPTURE", losing: "40-60% of leads because they can't answer the phone while installing, and voicemail is a lead-killer. Each lost lead = $3K-$8K.", stress: "Phone buzzing in your pocket while you're pouring epoxy. Do you stop and lose the flow, or let it ring and lose the lead?", examples: ["A homeowner calls at 10 AM Tuesday. You're mid-pour. They leave a voicemail. You call back at 7 PM. They already booked the other guy who answered.", "A homeowner messages on Facebook at 9 PM. You see it at 6 AM. They've already messaged 3 other contractors.", "A homeowner finds your website, fills the contact form, and waits. You check email at 8 PM. 12 hours later, they've cooled off."], tool: "AI Voice Assistant (answers every call instantly, qualifies the lead, books the estimate, texts you a summary) + Instant web lead capture with auto-response.", happiness: 5, trust: "The homeowner's first impression is a professional who answers instantly. That sets the tone for the entire relationship. They're already 60% sold before you show up." },
            { stage: 2, name: "LEAD QUALIFICATION & FOLLOW-UP", losing: "50-70% of leads never get a second follow-up. At $5K average job, 10 lost leads/month = $50K/month in potential revenue.", stress: "'I should follow up with those 7 leads from last week.' You think about it at 9 PM, you're tired, you do it tomorrow. Tomorrow you're installing. They go cold.", examples: ["A lead says 'let me think about it.' You mean to follow up in 3 days. You forget. 2 weeks later they booked someone else.", "A lead asked for a lower price. You're too proud to chase. They would have paid your price if you'd followed up once more.", "A lead from 60 days ago is ready now. You deleted their number. They call the next Google result."], tool: "Automated follow-up sequence (Day 1: text, Day 3: email with visualizer render, Day 7: 'still interested?' call, Day 14: final offer) + CRM pipeline that shows every lead's stage and reminds you.", happiness: 4, trust: "The homeowner feels pursued (in a good way). 'They actually followed up — they must want my business.' That persistence reads as professionalism." },
            { stage: 3, name: "THE IN-HOME / VIRTUAL ESTIMATE APPOINTMENT", losing: "Conversion. Without visualization, customers hesitate, price-shop, and walk. 30-50% lower close rate.", stress: "'Can I see what it'll look like?' — the question that makes you sweat because all you have is a stock photo and 'trust me.'", examples: ["You show a stock photo of a flake floor. Customer says 'but what will MINE look like?' You can't answer. They say they'll think about it.", "You describe metallic epoxy. Customer can't visualize it. They choose the cheaper flake option because it's 'safer.' You lost a $3K upsell.", "Customer asks for a custom color blend. You say 'I think we can do that.' They're not confident. They don't book."], tool: "AI Floor Visualizer — upload a photo of the customer's actual garage, select the system and color, generate a photorealistic render in 30 seconds. Show it on the iPad. Watch them say 'that's exactly what I want.'", happiness: 5, trust: "The homeowner sees their OWN floor transformed. That's not a sales pitch — that's a preview of their future. Trust is instant. They're not buying a product; they're buying a vision they can already see." },
            { stage: 4, name: "TAKEOFF & ESTIMATING", losing: "20-30 hours/week of time (2-3 hrs/estimate × 10 estimates). Errors from manual math. Inconsistent pricing.", stress: "9 PM, kitchen table, Excel open, trying to remember: 'Was metallic $4.50 or $5.50 per sq ft? Did I include the moisture test? What's the flake broadcast rate?' Second-guessing every number.", examples: ["You estimate $3,200 for a job. You forgot to include crack repair. It costs you $400 in extra material and labor. You ate it.", "You charged $4/sq ft last month but $4.75 this month for the same system because you forgot. Customer notices. You look inconsistent.", "You spend 2 hours on an estimate for a customer who never books. That's 2 hours you'll never get back with your kids."], tool: "AI-powered estimating that auto-calculates from sq ft + system + condition adjustments. Pulls pricing from your saved settings. Generates a branded, itemized proposal in 2 minutes. Sends it via text/email with a one-tap accept button.", happiness: 4, trust: "The homeowner receives a clean, itemized, branded proposal. Not a scribbled number. They see exactly what they're paying for. No ambiguity. No 'what's included?' phone tag. They trust the process." },
            { stage: 5, name: "MATERIAL ORDERING", losing: "4-6 hours/week driving to XPS. $200-500/incident on wrong/insufficient orders. Mismatched color batches from last-minute store runs.", stress: "'Did I order enough? Is the color in stock? Am I going to have to make a second run with the crew standing around?'", examples: ["You order 3 kits for a 600 sq ft job. You need 3.5. You run out mid-pour. Crew stands for 90 min while you drive to XPS. Customer watches. You look amateur.", "You order 'the blue flake.' XPS has 3 blues. You get the wrong one. Customer says 'that's not what we picked.' You redo it. $800 loss.", "You drive 45 minutes to XPS, wait in line, drive back. 2.5 hours gone. You could have been installing."], tool: "Auto-generated material list from the estimate (exact kit count, exact flake code, exact topcoat). One-tap order to the nearest XPS store. Delivery or ready-for-pickup confirmation. Color-match guarantee.", happiness: 4, trust: "The homeowner sees the exact product, color code, and quantity on the proposal. No surprises. 'This guy has a system.' That's trust." },
            { stage: 6, name: "SCHEDULING & CREW DISPATCH", losing: "2.8 double-booking conflicts/month × $4,500/event = $12,600/month in scheduling errors. Crew no-shows. Customer no-shows.", stress: "6 AM, 'Is Mike coming?' Text. No answer. Customer's waiting. You're scrambling. Or: you double-booked Saturday and now you're calling one customer to reschedule and they're furious.", examples: ["You double-book Saturday. Two customers, one crew. You call one to push to Monday. They cancel. Lost: $4,500.", "Crew no-shows. You're at the jobsite alone with the customer watching. You install solo, badly, exhausted.", "Customer forgets the appointment. You show up. They're not home. Wasted day. $0 revenue."], tool: "Smart scheduling calendar with crew availability, travel-time buffers, automatic customer reminders (text 24 hrs before, text 1 hr before), and real-time crew tracking. No double-booking possible — the system blocks it.", happiness: 4, trust: "The homeowner gets a text: 'Your installation is confirmed for Tuesday, 8 AM. Crew: Mike & Carlos. Track arrival: [link].' That's not a contractor — that's a company. They feel taken care of." },
            { stage: 7, name: "INSTALLATION DAY", losing: "No documentation of prep → warranty disputes you lose. No customer communication during install → 'is it done yet?' calls. No photo record → can't defend against 'it wasn't like that before.'", stress: "Customer calls at 11 AM: 'Are you done yet? I need to park my car.' You're mid-pour. You stop. You call back. You lose the flow. Or: 6 months later the floor blisters. Customer says 'you didn't test for moisture.' You did. But you have no proof.", examples: ["Floor blisters 4 months later. Customer says 'you didn't prep right.' You did a moisture test but didn't document it. It's your word vs. theirs. You refund $3,500 to avoid a lawsuit.", "Customer texts 5 times during install: 'How's it going?' 'Almost done?' 'Can I park yet?' You stop working to respond each time. Adds 45 min to the day.", "You finish a beautiful job. No before/after photo taken. You can't post it, can't show future customers, can't prove the transformation. Marketing gold left on the table."], tool: "Job-day checklist with photo documentation at each stage (prep, moisture test, crack repair, base coat, flake broadcast, topcoat). Auto-sent progress updates to customer. Auto-saved before/after photos to the job record and social media queue.", happiness: 4, trust: "The homeowner gets progress photos and updates without asking. They feel informed, not anxious. When they see the documented prep, they trust the warranty. They tell their neighbors: 'He documented everything — this guy's a pro.'" },
            { stage: 8, name: "PROPOSAL, SIGNATURE & DEPOSIT", losing: "Deals that drag on for days because the proposal is a text or a verbal. Customers who 'think about it' and never sign. Deposits that take a week to collect.", stress: "'I sent the estimate. Did they get it? Are they going to sign? Should I call? I don't want to seem pushy.' Days pass. You're anxious. You call. They say 'oh yeah, I meant to look at that.'", examples: ["You text a number: '$4,200.' Customer says 'ok let me think.' No itemized proposal. They don't understand what they're paying for. They ghost.", "You hand-write a proposal. Customer says 'can you email that?' You take a photo of the paper. It looks unprofessional. They're not confident.", "You do the estimate. Customer says 'I'll mail you a check for the deposit.' You wait 5 days. It doesn't come. You call. They 'forgot.' You lost momentum."], tool: "Branded digital proposal (itemized, with visualizer render embedded) sent via text. One-tap e-signature. One-tap deposit payment via card/ACH. Auto-generated receipt. Job moves to 'scheduled' instantly.", happiness: 5, trust: "The homeowner receives a professional proposal they can review, sign, and pay for — all from their phone. This is Amazon-level friction. They think: 'This is a real company.' They sign faster. They pay faster. They're locked in." },
            { stage: 9, name: "INVOICING & COLLECTIONS", losing: "20+ days of cash flow lag from late invoicing. 5-10% of final payments never collected. Hours on the phone playing 'did you get my invoice?'", stress: "'Did I send the invoice? Did they pay? Should I call? I don't want to be the annoying contractor. But I need the money. It's been 2 weeks.'", examples: ["You finish the job Friday. You forget to invoice. Monday you're busy. Tuesday you remember. You send it. Customer pays 10 days later. You waited 24 days for money you earned on Day 1.", "Customer says 'the check's in the mail.' It's not. You wait a week. Call. 'Oh, I forgot.' You wait another week. $3,200 outstanding for a month.", "You don't charge late fees because you don't want to anger the customer. You eat the time value of money. Over a year, that's thousands."], tool: "Auto-invoice on job completion. Auto-reminders at Day 3, Day 7, Day 14. One-tap payment link. Auto-late-fee application after Day 14 (optional). Real-time A/R dashboard showing every outstanding invoice and its age.", happiness: 4, trust: "The homeowner gets a clean invoice with a pay button. No awkward phone calls. No 'did you get my check?' They pay in 30 seconds. The relationship stays clean. No resentment on either side." },
            { stage: 10, name: "POST-JOB FOLLOW-UP & REVIEWS", losing: "90% of contractors never collect reviews. Each 5-star review is worth ~$500 in future leads. No follow-up = no referrals = no compounding pipeline.", stress: "'I should ask for a review.' You think about it. You're tired. You forget. 2 weeks later, the moment has passed. The customer would have given you 5 stars. Now they won't bother.", examples: ["Customer loves the floor. You leave. You never ask for a review. 3 months later, a neighbor asks 'do you know a good epoxy guy?' The customer can't remember your name to recommend you.", "You text 'can you leave a review?' No link. Customer means to. Doesn't. You get 0 reviews from 40 jobs this year. Your Google profile has 2 reviews from 2019.", "Customer has a minor issue 2 weeks later. They don't know how to reach you. They leave a 1-star review out of frustration. You never saw it coming. No chance to fix it."], tool: "Auto-sent review request 24 hrs after job completion (with direct Google/Facebook review link). Auto-sent 7-day check-in ('How's the floor? Any issues?'). If issue detected → route to contractor immediately. If no issue → prompt for review. Auto-share best reviews to social media.", happiness: 5, trust: "The homeowner gets a check-in, not a sales pitch. They feel cared for post-purchase. If there's an issue, you fix it before it's a review. If there's not, they rave about you publicly. They become your marketing engine." },
            { stage: 11, name: "SOCIAL MEDIA & MARKETING", losing: "0 social posts = 0 organic leads from social. Before/after photos sitting on your phone, never posted. No SEO presence. Competitors who post daily eat your market.", stress: "'I know I should post on Facebook/Instagram. I don't have time. I don't know what to write. I'll do it this weekend.' You never do.", examples: ["You have 40 stunning before/after photos on your phone. You've posted 0. A competitor with worse work posts daily and gets 5 leads/week from Facebook. You get 0.", "You post once every 3 months. No caption, no hashtags, no SEO. 12 people see it. No leads.", "A homeowner searches 'epoxy garage floors near me.' You're on page 4. The competitor with 47 reviews and daily posts is on page 1. You're invisible."], tool: "Auto-generated social posts from completed job photos (before/after, with SEO-optimized captions, hashtags, and AI-search keywords). Auto-scheduled across Facebook/Instagram. Auto-generated SEO landing pages for every city you work in. Auto-pinged to Google IndexNow.", happiness: 4, trust: "The homeowner sees a consistent, professional social presence. Before/after photos. Customer reviews. Educational posts. They think: 'This company is active, busy, and trusted.' They call you, not the guy with 2 posts from 2022." },
            { stage: 12, name: "FINANCIAL VISIBILITY & GROWTH", losing: "No idea of real P&L. Can't make data-driven decisions. Don't know which jobs are profitable and which lose money. Can't scale because they can't see.", stress: "Month-end. 'How much did I make?' You pull bank statements. You guess. You're not sure if you're up or down. You can't plan. You feel out of control.", examples: ["You did 40 jobs this quarter. You think you made $120K. After materials, gas, crew, and the 5 jobs you underpriced, you made $68K. You didn't know until tax time.", "You're turning down leads because you're 'too busy.' But 30% of your time is spent on $3K jobs when you could be doing $8K jobs. You don't know the difference.", "You want to hire a second crew. You can't justify it because you don't know your numbers. You stay small. You stay stressed."], tool: "Real-time dashboard: revenue, material costs, profit per job, profit per sq ft, close rate, lead source ROI, monthly/quarterly/yearly trends. Job profitability heatmap. Growth projections.", happiness: 5, trust: "(Internal) But the downstream effect: the contractor who knows their numbers charges confidently, doesn't underprice, and delivers consistently. Customers get a stable, reliable business — not a stressed guy who might quit next year." },
          ].map((s) => (
            <div key={s.stage} className="rounded-2xl bg-stone-900 border border-stone-800 p-5 mb-4">
              <h3 className="text-lg font-extrabold text-amber-400 mb-3">
                STAGE {s.stage}: {s.name}
              </h3>
              <div className="space-y-3 text-sm text-stone-300">
                <p><strong className="text-red-400">What they're losing:</strong> {s.losing}</p>
                <p><strong className="text-orange-400">The stress:</strong> {s.stress}</p>
                <div>
                  <strong className="text-white">3 Examples:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1 text-stone-400">
                    {s.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                  </ol>
                </div>
                <p><strong className="text-green-400">The tool:</strong> {s.tool}</p>
                <p>
                  <strong className="text-amber-400">Happiness increase:</strong>{" "}
                  {"🔥".repeat(s.happiness)} ({s.happiness}/5)
                </p>
                <p><strong className="text-blue-400">Trust & loyalty potential:</strong> {s.trust}</p>
              </div>
            </div>
          ))}

          {/* PART 7 */}
          <h2 className="text-2xl font-extrabold text-amber-400 mt-12 mb-4 border-b border-stone-800 pb-2">
            PART 7: THE ADDICTION SUMMARY — WHY THEY CAN'T LIVE WITHOUT IT
          </h2>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-stone-800 rounded-lg overflow-hidden">
              <thead className="bg-stone-900">
                <tr className="text-left text-xs uppercase text-stone-400">
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Without the App</th>
                  <th className="px-3 py-2">With the App</th>
                  <th className="px-3 py-2 text-center">Can Go Back?</th>
                </tr>
              </thead>
              <tbody className="text-stone-300">
                {[
                  ["Lead Capture", "Miss 50% of calls", "AI answers every call", "❌ Never"],
                  ["Follow-Up", "70% go cold", "Auto-sequence closes 30% more", "❌ Never"],
                  ["Visualization", "'Trust me' + stock photo", "Their floor, their color, on iPad", "❌ Never"],
                  ["Estimating", "2 hrs, Excel, errors", "5 min, branded, accurate", "❌ Never"],
                  ["Materials", "Store runs, wrong color", "One-tap auto-order from XPS", "❌ Never"],
                  ["Scheduling", "Double-books, no-shows", "Smart calendar, auto-reminders", "❌ Never"],
                  ["Install Day", "No docs, customer calls", "Photo proof, auto-updates", "❌ Never"],
                  ["Proposal", "Text a number", "Branded, e-sign, deposit", "❌ Never"],
                  ["Invoicing", "Chase checks, 24-day lag", "Auto-invoice, one-tap pay", "❌ Never"],
                  ["Reviews", "0 collected", "Auto-request, 47 in 6 months", "❌ Never"],
                  ["Social Media", "0 posts", "Auto-generated daily", "❌ Never"],
                  ["Financials", "Guess at month-end", "Real-time dashboard", "❌ Never"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-stone-800">
                    <td className="px-3 py-2 font-bold text-white">{row[0]}</td>
                    <td className="px-3 py-2 text-red-400">{row[1]}</td>
                    <td className="px-3 py-2 text-green-400">{row[2]}</td>
                    <td className="px-3 py-2 text-center font-bold text-red-500">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-3">The Ultimate Value Proposition</h3>
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6">
            <p className="text-lg text-amber-100 font-bold mb-4">
              This app doesn't just save the contractor time. It transforms them from a guy with a truck into a
              professional flooring company with a system — in the customer's eyes and in their own.
            </p>
            <ul className="space-y-2 text-sm text-stone-200">
              <li><strong className="text-amber-400">More money:</strong> 30-50% more leads converted, 20-30 hrs/week reclaimed, $12K/month in scheduling errors eliminated, $50K/month in follow-up revenue captured.</li>
              <li><strong className="text-amber-400">Less stress:</strong> No kitchen-table estimating, no store runs, no chasing deposits, no "did I order enough?" anxiety.</li>
              <li><strong className="text-amber-400">More family time:</strong> 30-40 hrs/week reclaimed → a full day with the kids, date night, sleep.</li>
              <li><strong className="text-amber-400">More professional:</strong> Branded proposals, visualizer, documented prep, automated communication → customers see a company, not a guy.</li>
              <li><strong className="text-amber-400">More trust & loyalty:</strong> Customers who are informed, visualized, communicated with, and followed up with → they refer, they review, they come back for the next property.</li>
            </ul>
            <p className="text-lg text-amber-300 font-bold mt-4">
              The contractor who has this app becomes the contractor the homeowner trusts. And the contractor who is
              trusted gets paid more, gets more referrals, and never has to cold-call again.
            </p>
          </div>

          <p className="text-sm text-stone-500 italic mt-8 text-center">
            This is the blueprint. Every feature in this app should map to one of these 12 stages. Every button on the
            /elite screen should open a tool that solves one of these pains. That's how we achieve 100% operational
            parity — not just matching a mockup, but matching the contractor's entire life.
          </p>
        </article>
      </div>
    </div>
  );
}