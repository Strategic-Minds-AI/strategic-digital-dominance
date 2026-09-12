import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Download, RefreshCw, CheckCircle2, AlertCircle, Brain, Zap } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import { base44 } from "@/api/base44Client";

export default function WorkflowFindings() {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleSyncToSwarm = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke("syncWorkflowToSwarm", {});
      setSyncResult({ success: true, ...res.data });
    } catch (err) {
      setSyncResult({ success: false, error: err?.message || "Swarm sync failed" });
    }
    setSyncing(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-black">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate("/admin/contractor-workflow")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-black text-xs font-semibold text-black hover:bg-black hover:text-white transition shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Workflow</span><span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src={LOGO_URL} alt="XPS" className="h-7 w-7 object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-extrabold font-heading tracking-tight text-black truncate">Industry Research Findings</h1>
                <p className="text-[9px] sm:text-[10px] text-amber-600 font-semibold tracking-wider uppercase">For Marketing Use</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncToSwarm}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-stone-800 transition disabled:opacity-50"
            >
              {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Sync to Swarm</span><span className="sm:hidden">Swarm</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:brightness-110 text-xs font-bold text-black transition"
            >
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className={`rounded-xl p-3 flex items-start gap-2 border ${syncResult.success ? "bg-green-50 border-green-600" : "bg-red-50 border-red-600"}`} style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
            {syncResult.success ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={`text-xs font-semibold ${syncResult.success ? "text-green-700" : "text-red-700"}`}>
                {syncResult.success ? `Swarm synced! ${syncResult.tasksCreated} new tasks. ${syncResult.totalTracked} total tracked across ${syncResult.stagesTracked} stages.` : "Sync failed"}
              </p>
              {syncResult.success && <p className="text-[10px] text-stone-500 mt-0.5">Alpha Prime now has persistent awareness. Investigation ID: {syncResult.investigationId?.slice(0, 12)}...</p>}
              {!syncResult.success && <p className="text-[10px] text-red-500 mt-0.5">{syncResult.error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <article className="max-w-none">
          <h1 className="text-xl sm:text-3xl font-extrabold font-heading text-black mb-2">
            THE EPOXY CONTRACTOR'S COMPLETE WORKFLOW — END-TO-END ANALYSIS
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mb-6 italic">
            Researched across contractor forums, industry publications, Xtreme Polishing Systems/XPS Xpress, and the
            decorative/polished concrete market ($20.67B in 2025, growing 6.2% CAGR).
          </p>

          {/* PART 1 */}
          <PartHeader partNum={1} title="THE COMPLETE CONTRACTOR WORKFLOW (Hour → Day → Week → Month)" />

          <h3 className="text-base sm:text-xl font-bold text-black mt-6 mb-3">☀️ HOUR-BY-HOUR (A typical installation day)</h3>
          <div className="space-y-2 mb-6">
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
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3 flex items-start gap-3">
                <span className="text-xs font-mono text-amber-600 font-bold shrink-0 w-16">{row[0]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-700">{row[1]}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] text-stone-400">{row[2]}</span>
                    <span className="text-[9px]">{row[3]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-black mt-6 mb-3">📅 DAY-BY-DAY (A typical week)</h3>
          <div className="space-y-2 mb-6">
            {[
              ["Monday:", "Install Job A. Return weekend leads at night. Send 2 estimates from scratch."],
              ["Tuesday:", "Install Job B (different city, 45 min away). A lead from last week wants to 'think about it' — you forget to follow up. (Lost revenue.)"],
              ["Wednesday:", "No job booked. Spend 3 hours doing takeoffs/estimates manually. Drive to XPS store for materials. A Yelp review came in — you don't see it for 4 days."],
              ["Thursday:", "Install Job C. Customer asks 'can I see what it'll look like first?' — you pull up a stock photo on your phone and say 'trust me.' (Conversion risk.)"],
              ["Friday:", "Install Job D. Collect deposit on next week's job. Forget to send the invoice. (Cash flow delay.)"],
              ["Saturday:", "Catch up on estimates. Miss your kid's soccer game. (Family time lost.)"],
              ["Sunday:", "Answer texts from anxious customers asking 'when are you coming?' because you didn't communicate the schedule. Order materials for Monday."],
            ].map(([day, desc], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs text-stone-700"><strong className="text-amber-600">{day}</strong> {desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-black mt-6 mb-3">📆 WEEK-BY-WEEK (A typical month)</h3>
          <div className="space-y-2 mb-6">
            {[
              ["Week 1:", "4 installs. 8 new leads. You follow up with 3 of them. 5 go cold. (Lost: ~$15K-$25K in potential revenue.)"],
              ["Week 2:", "3 installs (one rained out). You forgot to order enough flake for one job — had to make a second XPS run, wasting 90 minutes. ($150 lost + half a day.)"],
              ["Week 3:", "A customer from Week 1 hasn't paid their final. You're too busy to chase. ($2,500 outstanding.)"],
              ["Week 4:", "Month-end. You realize you have no idea how much you actually made. You pull bank statements and guess. (No financial visibility.) You didn't post on social media once this month. (Lead pipeline drying up.)"],
            ].map(([week, desc], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs text-stone-700"><strong className="text-amber-600">{week}</strong> {desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-black mt-6 mb-3">🗓️ MONTH-BY-MONTH (A quarter)</h3>
          <div className="space-y-2 mb-6">
            {[
              ["Month 1:", "Busy but disorganized. Making money but stressed."],
              ["Month 2:", "A job fails — moisture issue, homeowner wants it redone. No documentation of prep. (Your word vs. theirs. $3,500 loss.)"],
              ["Month 3:", "You realize you're turning down leads because you can't keep up — but you also can't afford to hire help because cash flow is inconsistent. (Growth ceiling.)"],
              ["Month 4-12:", "Repeat. Burn out. Either quit, stay small, or buy generic software (Jobber/Housecall Pro) that doesn't understand epoxy and still leaves gaps."],
            ].map(([month, desc], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs text-stone-700"><strong className="text-amber-600">{month}</strong> {desc}</p>
              </div>
            ))}
          </div>

          {/* PART 2 */}
          <PartHeader partNum={2} title="THE MANUAL STEPS & PROBLEMATIC PARTS" />
          <h3 className="text-base sm:text-lg font-bold text-black mt-4 mb-3">What Contractors Complain About (from research)</h3>
          <div className="space-y-2 mb-6">
            {[
              ["Estimating takes forever", "2-3 days per takeoff for some (Reddit r/estimators). Excel is the default. No multi-player. No coating-specific logic."],
              ["Leads go cold because I can't follow up", "'Most flooring businesses don't lose jobs because of bad work or bad pricing. They lose them because of silence.' (Service Buddy). This is the #1 cited complaint."],
              ["Customers ghost after deposit / Contractors ghost after deposit", "A two-way problem. Homeowners fear being ghosted; contractors fear non-payment. Trust is the industry's core deficit."],
              ["Scheduling double-books", "'Manual scheduling methods cause an average of 2.8 double-booking conflicts per month for mid-size contractors, costing up to $4,500 per event.' (WrightPlan)"],
              ["Material miscalculation", "'Underestimating the volume of product required leads to stressful delays and mismatched color batches.' (APIowa). Wrong color, not enough product = second store run = lost half-day."],
              ["No work-life balance", "Contractors do estimates at 9 PM on the kitchen table. Miss kids' events. Burn out is the industry's silent killer. (Contractor Accelerator)"],
              ["Customers can't visualize the result", "'Can I see what it'll look like?' is met with a stock photo and 'trust me.' Conversion drops. (ShowFloor AI research)"],
              ["Invoicing and collections", "'Most delays are process problems, not payment problems. Missing documents and disorganized billing are the leading cause.' (JK Rosenberger CPA)"],
              ["Software doesn't fit epoxy", "'Generic CRMs fall apart when you try to handle the complexity of construction.' (Reddit r/automation). Jobber/Housecall Pro don't understand mil thickness, resin systems, or flake broadcast rates."],
              ["I look unprofessional", "Scribbled estimates. Text-only communication. No branded proposal. The customer wonders if this guy is legit."],
            ].map(([title, body], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs text-stone-700"><strong className="text-black">{i + 1}. {title}</strong> — {body}</p>
              </div>
            ))}
          </div>

          {/* PART 3 */}
          <PartHeader partNum={3} title="WHERE THEY'RE LEAVING MONEY/STRESS/TIME ON THE TABLE" />

          <h3 className="text-base sm:text-lg font-bold text-green-600 mt-4 mb-3">💰 MONEY LEFT ON THE TABLE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {[
              ["No follow-up system", "50-70% of leads never get a second touch. At $3K-$8K per job, that's $15K-$50K/month in lost revenue.", "Too busy installing to follow up manually"],
              ["No visualizer", "Customers who can't see the result hesitate, price-shop, or walk. Conversion rates 30-50% lower without visualization.", "No tool to show THEIR floor in THEIR color"],
              ["Manual estimating", "2-3 hours per estimate × 10 estimates/week = 20-30 hrs/week. That's a part-time job.", "Excel/Notepad, no templates"],
              ["Material miscalculation", "Wrong order = second trip to XPS = 90 min + gas + crew standing around. ~$200-500/incident.", "Manual math, no system-linked material lists"],
              ["No upsell system", "Customers don't know about baseboard coating, patios, commercial options.", "No structured upsell prompt"],
              ["Late invoicing", "Invoice sent 5 days late × 4 jobs/month = 20 days of cash flow lag.", "Forgot to send, no automation"],
              ["No reviews collected", "Each 5-star review is worth ~$500 in future leads. Most contractors collect 0.", "No automated review request"],
            ].map(([gap, loss, cause], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-black mb-1">{gap}</p>
                <p className="text-[11px] text-stone-700 mb-1">{loss}</p>
                <p className="text-[10px] text-stone-400">{cause}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-red-500 mt-4 mb-3">😩 STRESS LEFT ON THE TABLE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {[
              ["Kitchen-table estimating", "9 PM, exhausted, trying to remember pricing for metallic vs flake. Second-guessing.", "Mental load, errors, resentment"],
              ["'Did I order enough?'", "Lying awake wondering if 3 kits is enough for tomorrow's 600 sq ft.", "Sleep loss, anxiety"],
              ["Crew no-shows", "'Is Mike coming today?' Text at 6 AM, no answer.", "Morning chaos, customer waiting"],
              ["Customer 'when are you coming?'", "15 texts a day from anxious customers. No schedule visibility for them.", "Constant interruption, feels like a servant"],
              ["'Am I making money?'", "No real-time P&L. Just a gut feeling at month-end.", "Financial anxiety, can't make decisions"],
            ].map(([gap, stress, cost], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-black mb-1">{gap}</p>
                <p className="text-[11px] text-stone-700 mb-1">{stress}</p>
                <p className="text-[10px] text-stone-400">{cost}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-blue-500 mt-4 mb-3">⏰ TIME LEFT ON THE TABLE (→ FAMILY TIME)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {[
              ["Manual takeoffs", "2-3 hrs/estimate", "AI takeoff: 2 min. Reclaim 20+ hrs/week"],
              ["Driving to XPS store", "90 min round trip, 2-3×/week", "Auto-order from app, delivery. Reclaim 4-6 hrs/week"],
              ["Returning calls one by one", "60-90 min/evening", "AI voice assistant handles qualification. Reclaim 1 hr/day"],
              ["Writing estimates from scratch", "45 min each", "Template + auto-fill: 5 min. Reclaim 6+ hrs/week"],
              ["Chasing payments", "Hours on the phone", "Auto-reminders. Reclaim 3-5 hrs/week"],
              ["Social media (or lack of it)", "0 hrs spent = 0 leads from social", "AI auto-generates posts. Reclaim pipeline without time cost"],
            ].map(([gap, wasted, reclaimed], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-black mb-1">{gap}</p>
                <p className="text-[11px] text-red-500 mb-1">{wasted}</p>
                <p className="text-[10px] text-green-600">{reclaimed}</p>
              </div>
            ))}
          </div>
          <div className="xa-electric-light rounded-xl bg-amber-50 border border-black p-3 mb-6" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
            <p className="text-xs font-extrabold text-amber-700">TOTAL RECLAIMABLE: 30-40 hrs/week → a full workday with family</p>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-purple-500 mt-4 mb-3">🤝 CUSTOMER EXPERIENCE LEFT ON THE TABLE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {[
              ["No visualization", "'I hope it looks good...' (anxiety)", "'I can see my floor in that color before I pay a dime' (confidence)"],
              ["Scribbled estimate", "'Is this guy legit?' (doubt)", "Branded, itemized, professional proposal (trust)"],
              ["No communication", "'When are you coming? Are you still coming?' (anxiety)", "Automated status updates: 'Crew arriving 8 AM Tuesday' (peace)"],
              ["No follow-up after install", "'Did he care about my job?' (ambivalence)", "Automated check-in + review request (loyalty)"],
              ["No documentation", "'What if it fails?' (fear)", "Photo-documented prep, warranty on file (security)"],
              ["Cash/check only", "'Can I pay with a card?' (friction)", "One-tap digital payment (convenience)"],
            ].map(([gap, bad, good], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-black mb-1">{gap}</p>
                <p className="text-[11px] text-red-500 mb-1">{bad}</p>
                <p className="text-[10px] text-green-600">{good}</p>
              </div>
            ))}
          </div>

          {/* PART 4 */}
          <PartHeader partNum={4} title="THE INDUSTRY GAP ANALYSIS" />
          <h3 className="text-base sm:text-lg font-bold text-black mt-4 mb-3">What the Epoxy/Decorative Concrete/Polished Concrete Industry Is Lacking</h3>
          <div className="space-y-2 mb-6">
            {[
              ["1. No Epoxy-Native All-in-One", "Every existing tool is either generic field service (Jobber, Housecall Pro) that doesn't understand mil thickness, resin systems, flake broadcast rates, moisture testing, or curing times; coating-specific but narrow (QuoteIQ = estimating only; ShowFloor AI = visualizer only; CoatingOS = CRM but no visualizer); or all-in-one but young (Floor Nexus) with visualizer on credits and thin ecosystem. The gap: No platform combines AI visualization + coating-native estimating + CRM + scheduling + material ordering (from XPS) + customer communication + invoicing + reputation management in ONE app."],
              ["2. No Material-Supplier Integration", "Contractors drive to XPS stores 2-3×/week. No app connects the estimate directly to the XPS inventory system and auto-orders. This is a massive gap — the contractor's software doesn't talk to their supplier's software."],
              ["3. No AI Voice Assistant for Lead Qualification", "Contractors miss calls while installing. Existing tools send the caller to voicemail. No epoxy-specific AI voice assistant that answers, qualifies, books the estimate, and texts the contractor a summary."],
              ["4. No Photo-Documented Prep Records", "When a floor fails, it's the contractor's word vs. the homeowner's. No platform automatically documents the prep process (moisture test photo, crack repair photo, grind photo) and ties it to the job record for warranty defense."],
              ["5. No Customer-Facing Portal", "Homeowners are left in the dark. No app gives the customer a portal where they can: see their estimate, see their scheduled date, see progress photos, make a payment, and leave a review — all in one place."],
              ["6. No Automated Social Proof Engine", "Contractors know they should post before/after photos on social media but don't have time. No tool auto-generates and schedules social posts from completed job photos with SEO-optimized captions."],
              ["7. No 'Can't Live Without It' Mobile Experience", "Most software is desktop-first. Contractors live on their phones, in their trucks, at jobsites. No app is designed mobile-first, offline-capable, and built for the 5:30 AM to 10 PM reality of a contractor's day."],
            ].map(([title, body], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <h4 className="text-xs font-bold text-amber-600 mb-1">{title}</h4>
                <p className="text-[11px] text-stone-700 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* PART 5 */}
          <PartHeader partNum={5} title="WHERE THIS APP BECOMES ADDICTIVE (Can't-Live-Without-It)" />
          <h3 className="text-base sm:text-lg font-bold text-black mt-4 mb-3">The "Heroin" Moments — When the Contractor Can't Go Back</h3>
          <div className="space-y-2 mb-6">
            {[
              "The first time they show a customer their OWN floor in 3 colors on an iPad and the customer says 'I'll take it' without asking the price. They will never go back to 'trust me' with a stock photo.",
              "The first time the AI voice assistant answers a call while they're elbow-deep in epoxy, qualifies the lead, books the estimate, and texts them 'New lead: John Smith, 440 sq ft garage, booked for Thursday 10 AM.' They will never miss another lead.",
              "The first time the estimate auto-generates from the visualizer (color, sq ft, system) and the material list auto-orders from XPS with one tap. They will never hand-calculate mil thickness again.",
              "The first time a customer pays a deposit via text link while the contractor is driving home. They will never chase a check again.",
              "The first time they open the app at 5:30 AM and see: today's job, crew confirmed, materials delivered, customer notified, route planned. They will never go back to chaos.",
              "The first time their kid says 'Dad, are you coming to my game?' and they can say 'Yes' because the estimates are done and the follow-ups are automated. They will never quit the app.",
              "The first time a floor fails and they pull up the photo-documented prep record and the homeowner says 'Oh, you did everything right.' They will never install without the app again.",
            ].map((text, i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-[11px] text-stone-700"><strong className="text-amber-600">{i + 1}.</strong> {text}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-black mt-4 mb-3">How Professional It Makes the Contractor Look</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
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
            ].map(([bad, good], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-[11px] text-red-500 line-through mb-1">{bad}</p>
                <p className="text-[11px] text-green-600 font-semibold">{good}</p>
              </div>
            ))}
          </div>
          <div className="xa-electric-light rounded-xl bg-amber-50 border border-black p-3 mb-6" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
            <p className="text-xs text-amber-700 font-bold">
              The contractor goes from "a guy with a truck" to "a professional flooring company with a system." That's the
              difference between $3K jobs and $8K jobs. Between one crew and three crews. Between burnout and a business that runs itself.
            </p>
          </div>

          {/* PART 6 */}
          <PartHeader partNum={6} title="THE END-TO-END SOLUTION LIST" />
          <p className="text-xs text-stone-500 italic mb-4">
            Stage → What They're Losing → The Stress → 3 Examples → The Tool That Solves It → Happiness Increase → Trust & Loyalty Potential
          </p>

          <div className="space-y-3 mb-6">
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
              <div key={s.stage} className="xa-electric-light rounded-2xl bg-white border border-black p-4" style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}>
                <h3 className="text-base font-extrabold text-amber-600 mb-3">
                  STAGE {s.stage}: {s.name}
                </h3>
                <div className="space-y-2 text-xs text-stone-700">
                  <p><strong className="text-red-500">What they're losing:</strong> {s.losing}</p>
                  <p><strong className="text-orange-500">The stress:</strong> {s.stress}</p>
                  <div>
                    <strong className="text-black">3 Examples:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1 text-stone-500">
                      {s.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                    </ol>
                  </div>
                  <p><strong className="text-green-600">The tool:</strong> {s.tool}</p>
                  <p>
                    <strong className="text-amber-600">Happiness increase:</strong>{" "}
                    {"🔥".repeat(s.happiness)} ({s.happiness}/5)
                  </p>
                  <p><strong className="text-blue-500">Trust & loyalty potential:</strong> {s.trust}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PART 7 */}
          <PartHeader partNum={7} title="THE ADDICTION SUMMARY — WHY THEY CAN'T LIVE WITHOUT IT" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
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
            ].map(([stage, bad, good, back], i) => (
              <div key={i} className="xa-electric-light rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-black mb-1">{stage}</p>
                <p className="text-[11px] text-red-500 mb-0.5">{bad}</p>
                <p className="text-[11px] text-green-600 mb-1">{good}</p>
                <p className="text-[10px] font-bold text-red-500">{back}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-black mt-6 mb-3">The Ultimate Value Proposition</h3>
          <div className="xa-electric-light rounded-2xl bg-amber-50 border border-black p-4 mb-6" style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}>
            <p className="text-sm text-amber-700 font-bold mb-3">
              This app doesn't just save the contractor time. It transforms them from a guy with a truck into a
              professional flooring company with a system — in the customer's eyes and in their own.
            </p>
            <ul className="space-y-1.5 text-xs text-stone-700">
              <li><strong className="text-amber-600">More money:</strong> 30-50% more leads converted, 20-30 hrs/week reclaimed, $12K/month in scheduling errors eliminated, $50K/month in follow-up revenue captured.</li>
              <li><strong className="text-amber-600">Less stress:</strong> No kitchen-table estimating, no store runs, no chasing deposits, no "did I order enough?" anxiety.</li>
              <li><strong className="text-amber-600">More family time:</strong> 30-40 hrs/week reclaimed → a full day with the kids, date night, sleep.</li>
              <li><strong className="text-amber-600">More professional:</strong> Branded proposals, visualizer, documented prep, automated communication → customers see a company, not a guy.</li>
              <li><strong className="text-amber-600">More trust & loyalty:</strong> Customers who are informed, visualized, communicated with, and followed up with → they refer, they review, they come back for the next property.</li>
            </ul>
            <p className="text-sm text-amber-600 font-bold mt-3">
              The contractor who has this app becomes the contractor the homeowner trusts. And the contractor who is
              trusted gets paid more, gets more referrals, and never has to cold-call again.
            </p>
          </div>

          <p className="text-xs text-stone-400 italic mt-6 text-center">
            This is the blueprint. Every feature in this app should map to one of these 12 stages. Every button on the
            /elite screen should open a tool that solves one of these pains. That's how we achieve 100% operational
            parity — not just matching a mockup, but matching the contractor's entire life.
          </p>
        </article>
      </div>
    </div>
  );
}

function PartHeader({ partNum, title }) {
  return (
    <h2 className="text-lg sm:text-2xl font-extrabold text-amber-600 mt-8 sm:mt-12 mb-4 border-b-2 border-black pb-2">
      PART {partNum}: {title}
    </h2>
  );
}