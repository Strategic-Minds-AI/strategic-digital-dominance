import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// ===== APP-SPECIFIC =====
// Syncs the 60-Day Contractor Workflow data to a Google Sheet.
// Uses the authorized googlesheets connector to create a spreadsheet and write all 60 days of before/after data.
// Returns the spreadsheet URL so the admin can open it directly.

const WORKFLOW_STAGES = [
  { id: 1, name: "Lead Capture" },
  { id: 2, name: "Lead Qualification & Follow-Up" },
  { id: 3, name: "Estimate Appointment" },
  { id: 4, name: "Takeoff & Estimating" },
  { id: 5, name: "Material Ordering" },
  { id: 6, name: "Scheduling & Crew Dispatch" },
  { id: 7, name: "Installation Day" },
  { id: 8, name: "Proposal, Signature & Deposit" },
  { id: 9, name: "Invoicing & Collections" },
  { id: 10, name: "Post-Job Follow-Up & Reviews" },
  { id: 11, name: "Social Media & Marketing" },
  { id: 12, name: "Financial Visibility & Growth" },
];

// The full 60-day workflow data — kept in sync with src/data/contractorWorkflow.js
const WORKFLOW_DAYS = [
  { day: 1, stage: 1, timeOfDay: "10:00 AM", withoutAi: "Phone rings while you're mid-pour on a 600 sq ft garage. You can't answer. Lead goes to voicemail. You call back at 7 PM — they already booked the guy who answered.", withAi: "AI Voice Assistant answers instantly, greets the homeowner, qualifies the lead (garage size, timeline, address), books the estimate for Thursday 10 AM, and texts you: 'New lead captured — John Smith, 440 sq ft, Thursday 10 AM.' You never broke your pour.", tool: "AI Voice Assistant (Telnyx-powered)", toolRoute: "/admin/voice-assistant", retailPrice: "$297/mo", deliveredCost: "$97/mo", savings: "67%" },
  { day: 2, stage: 1, timeOfDay: "9:30 AM", withoutAi: "A homeowner messages your Facebook page at 9 PM. You see it at 6 AM the next day. They've already messaged 3 other contractors. You're response #4.", withAi: "Facebook lead auto-captured the moment it arrives. AI responds within 60 seconds: 'Thanks for reaching out! I can get you a free estimate. What's your garage size?' Lead enters your pipeline instantly. You're response #1, every time.", tool: "Social Lead Capture + Auto-Responder", toolRoute: "/admin/social-studio", retailPrice: "$149/mo", deliveredCost: "$47/mo", savings: "68%" },
  { day: 3, stage: 1, timeOfDay: "2:15 PM", withoutAi: "A homeowner finds your website, fills out the contact form, and waits. You check email at 8 PM — 6 hours later. They've cooled off and are browsing competitors.", withAi: "Website form submission triggers instant auto-response: 'Thanks! Your estimate request is confirmed. Here's what happens next…' + AI visualizer link sent. Lead is hot and engaged before you even see it.", tool: "Instant Web Lead Capture + Auto-Response", toolRoute: "/admin/leads", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 4, stage: 1, timeOfDay: "7:00 PM", withoutAi: "You return 3 missed calls from the day. One homeowner already booked someone else. One isn't ready. One is a tire-kicker. You wasted 45 minutes qualifying dead leads.", withAi: "Every lead is pre-qualified by AI before it reaches you. You only spend time on qualified, ready-to-book homeowners. Your 45 minutes of call-backs becomes 10 minutes of booked appointments.", tool: "AI Lead Qualification Engine", toolRoute: "/admin/leads", retailPrice: "$199/mo", deliveredCost: "$59/mo", savings: "70%" },
  { day: 5, stage: 1, timeOfDay: "End of Day", withoutAi: "This week you missed 3 calls, responded late to 2 Facebook messages, and lost 2 leads to competitors who answered first. Estimated lost revenue: $15,000-$40,000.", withAi: "Zero missed leads this week. Every call answered, every message responded to, every lead qualified and booked. You captured 100% of inbound opportunities. Estimated additional revenue: $15,000-$40,000.", tool: "Complete Lead Capture Suite", toolRoute: "/admin/leads", retailPrice: "$744/mo", deliveredCost: "$232/mo", savings: "69%" },
  { day: 6, stage: 2, timeOfDay: "9:00 AM", withoutAi: "A lead from last week said 'let me think about it.' You meant to follow up in 3 days. You forgot. It's been 8 days. They booked someone else. Lost: $4,200.", withAi: "Automated follow-up sequence sent on Day 3: 'Hi John, just checking in — here's a visualizer render of your garage in the color you liked…' Lead re-engaged automatically. No forgotten follow-ups. Ever.", tool: "Automated Follow-Up Sequence", toolRoute: "/admin/emails", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 7, stage: 2, timeOfDay: "11:00 AM", withoutAi: "A lead asked for a lower price. You're too proud to chase. They would have paid your price if you'd followed up once more. You'll never know — you deleted their number.", withAi: "CRM pipeline shows every lead's stage. The 'price negotiation' lead is flagged for follow-up. AI sends a value-reinforcement email with before/after photos and testimonials. Lead closes at your original price.", tool: "CRM Pipeline + Value-Reinforcement Automation", toolRoute: "/admin/pipeline", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 8, stage: 2, timeOfDay: "3:00 PM", withoutAi: "A lead from 45 days ago is ready now. You don't remember them. They call the next Google result. You lost a $5,500 job because you had no long-term nurture system.", withAi: "Long-term nurture sequence keeps every lead warm with monthly before/after photos, seasonal promotions, and educational content. When they're ready, they call YOU — not the next Google result.", tool: "Long-Term Lead Nurture Engine", toolRoute: "/admin/emails", retailPrice: "$129/mo", deliveredCost: "$35/mo", savings: "73%" },
  { day: 9, stage: 2, timeOfDay: "6:00 PM", withoutAi: "You have 12 leads in your phone notes, 3 in email, 2 on Facebook. You have no idea which are hot, which are warm, which are dead. You manage by memory. You drop balls.", withAi: "Unified CRM pipeline: every lead in one place, sorted by stage (New → Contacted → Estimate Booked → Proposal Sent → Won/Lost). You see your entire pipeline at a glance. Nothing falls through.", tool: "Unified CRM Pipeline", toolRoute: "/admin/pipeline", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 10, stage: 2, timeOfDay: "End of Week 2", withoutAi: "You followed up with 3 of 10 leads this week. 7 went cold. At $5K avg job, you lost $35,000 in potential revenue from lack of follow-up alone.", withAi: "Every lead followed up with automatically. Close rate up 30%. You captured $10,500 in revenue that would have been lost. The system works while you install.", tool: "Complete Follow-Up Automation Suite", toolRoute: "/admin/emails", retailPrice: "$676/mo", deliveredCost: "$172/mo", savings: "75%" },
  { day: 11, stage: 3, timeOfDay: "10:00 AM", withoutAi: "Customer asks 'Can I see what it'll look like first?' You pull up a stock photo on your phone and say 'trust me, it'll look like this.' Customer hesitates. They say they'll think about it.", withAi: "You upload a photo of the customer's ACTUAL garage to the AI Visualizer. In 30 seconds, you show them their floor in 3 colors on your iPad. They say 'That's exactly what I want.' You close on the spot.", tool: "AI Floor Visualizer (photo-to-render)", toolRoute: "/elite", retailPrice: "$149/mo", deliveredCost: "$47/mo", savings: "68%" },
  { day: 12, stage: 3, timeOfDay: "11:30 AM", withoutAi: "Customer can't visualize metallic epoxy. They choose the cheaper flake option because it's 'safer.' You lost a $3,000 upsell because they couldn't SEE the premium option.", withAi: "Customer sees metallic vs flake side-by-side on their own garage. They choose metallic because they can see the depth and movement. You upsell $3,000 without saying a word — the visualizer did the selling.", tool: "AI Visualizer — Metallic vs Flake Comparison", toolRoute: "/elite", retailPrice: "$149/mo", deliveredCost: "$47/mo", savings: "68%" },
  { day: 13, stage: 3, timeOfDay: "1:00 PM", withoutAi: "Customer asks for a custom color blend. You say 'I think we can do that.' They're not confident. They don't book. You lost the job to uncertainty.", withAi: "Customer picks custom colors from the full XPS color chart — 200+ options with real photos, not guesses. They see the exact blend. They book with confidence. No uncertainty. No lost jobs.", tool: "Full Color Chart Library (200+ XPS colors)", toolRoute: "/color-charts", retailPrice: "$99/mo", deliveredCost: "$19/mo", savings: "81%" },
  { day: 14, stage: 3, timeOfDay: "2:30 PM", withoutAi: "You drive 45 minutes to an estimate, spend an hour walking the floor, and the customer says 'let me think about it.' You drove 2 hours for nothing. Gas + time = $150 wasted.", withAi: "Virtual estimate option: customer uploads photos + address, AI pulls property sqft from public records, you generate the estimate remotely. No drive. No wasted time. Close rate higher because it's frictionless.", tool: "Virtual Estimate + Property Auto-Lookup", toolRoute: "/estimate", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 15, stage: 3, timeOfDay: "End of Week 3", withoutAi: "You closed 2 of 5 estimates this week. 3 said 'I'll think about it.' You lost 60% of appointments because you couldn't show them the result. Revenue: $8,400.", withAi: "You closed 4 of 5 estimates. The visualizer closed the deals. Close rate: 80%. Revenue: $16,800. You doubled your close rate by showing, not telling.", tool: "AI Visualizer + Virtual Estimate Suite", toolRoute: "/elite", retailPrice: "$596/mo", deliveredCost: "$162/mo", savings: "73%" },
  { day: 16, stage: 4, timeOfDay: "9:00 PM", withoutAi: "Kitchen table. Excel open. Trying to remember: 'Was metallic $4.50 or $5.50/sq ft? Did I include crack repair? What's the flake broadcast rate?' You spend 2 hours second-guessing every number.", withAi: "You open the app, enter sqft (auto-pulled from property records), select system + color + conditions. Estimate generates in 2 minutes — accurate, consistent, branded. Your evening is yours.", tool: "AI-Powered Estimating Engine", toolRoute: "/elite", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 17, stage: 4, timeOfDay: "10:30 PM", withoutAi: "You estimated $3,200 for a job. You forgot to include crack repair. It cost you $400 in extra material and labor. You ate it. Your margin disappeared on a forgotten line item.", withAi: "Estimate auto-includes all line items based on floor conditions: crack repair, moisture test, cove base, transitions. Nothing forgotten. Nothing eaten. Your margin is protected every time.", tool: "Auto-Included Line Items by Condition", toolRoute: "/elite", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 18, stage: 4, timeOfDay: "7:00 AM", withoutAi: "You charged $4/sq ft last month but $4.75 this month for the same system because you forgot your own pricing. Customer notices. You look inconsistent. You look amateur.", withAi: "Pricing saved in your settings. Every estimate uses the same rates, every time. Consistent, professional, defensible. Customers see a company with a system, not a guy guessing.", tool: "Saved Pricing System + Consistency Engine", toolRoute: "/admin/settings", retailPrice: "$49/mo", deliveredCost: "$15/mo", savings: "69%" },
  { day: 19, stage: 4, timeOfDay: "8:00 PM", withoutAi: "You spent 2 hours on an estimate for a customer who never books. That's 2 hours you'll never get back with your kids. 10 estimates/week × 2 hrs = 20 hrs/week gone.", withAi: "Estimates take 5 minutes. 10 estimates/week × 5 min = 50 min/week. You reclaimed 19+ hours/week. That's a full day with your family, every week, forever.", tool: "5-Minute Estimate Generator", toolRoute: "/elite", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 20, stage: 4, timeOfDay: "End of Week 4", withoutAi: "You spent 20 hours estimating this week. Made 3 errors. Inconsistent pricing. Forgot 2 line items. Lost $800 in eaten costs. And you missed your kid's soccer game.", withAi: "You spent 50 minutes estimating. Zero errors. Consistent pricing. All line items included. Zero eaten costs. And you made it to the soccer game. The app gave you your life back.", tool: "Complete Estimating Suite", toolRoute: "/elite", retailPrice: "$546/mo", deliveredCost: "$142/mo", savings: "74%" },
  { day: 21, stage: 5, timeOfDay: "9:00 PM", withoutAi: "You order 3 kits for a 600 sq ft job. You need 3.5. You'll run out mid-pour tomorrow. Crew will stand for 90 minutes while you drive to XPS. Customer watches. You look amateur.", withAi: "Material list auto-calculated from the estimate: exact kit count, exact flake code, exact topcoat — with 10% waste factor built in. One tap to order from the nearest XPS store. Never run out. Never look amateur.", tool: "Auto-Material List + One-Tap XPS Order", toolRoute: "/admin/xtreme-comms", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 22, stage: 5, timeOfDay: "7:30 AM", withoutAi: "You drive 45 minutes to XPS, wait in line 20 minutes, drive back 45 minutes. 110 minutes gone. You could have been installing. At $150/hr, that's $275 in lost productivity.", withAi: "Materials ordered from the app last night. Ready for pickup or delivered to the jobsite. Zero drive time. Zero waiting. You start installing at 7:30 AM. Reclaimed 2+ hours/day.", tool: "XPS Auto-Order + Delivery/Pickup", toolRoute: "/admin/xtreme-comms", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 23, stage: 5, timeOfDay: "10:00 AM", withoutAi: "You ordered 'the blue flake.' XPS has 3 blues. You got the wrong one. Customer says 'that's not what we picked.' You redo the job. Lost: $800 in material + a day of labor.", withAi: "The estimate includes the exact XPS color code (e.g., FB-807 Tidal Wave). The order goes to XPS with that exact code. No ambiguity. No wrong colors. No redos. Color-match guaranteed.", tool: "Exact Color-Code Ordering System", toolRoute: "/color-charts", retailPrice: "$49/mo", deliveredCost: "$15/mo", savings: "69%" },
  { day: 24, stage: 5, timeOfDay: "3:00 PM", withoutAi: "You don't know which XPS store has your materials in stock. You call 3 stores. Nobody answers. You drive to the first one — they're out. You drive to the second. 2 hours gone.", withAi: "The app checks real-time XPS inventory at all nearby stores and routes your order to the one that has it. No phone calls. No wild goose chases. The app knows where your materials are.", tool: "Real-Time XPS Inventory Check", toolRoute: "/admin/xtreme-comms", retailPrice: "$129/mo", deliveredCost: "$35/mo", savings: "73%" },
  { day: 25, stage: 5, timeOfDay: "End of Week 5", withoutAi: "You drove to XPS 3 times this week (4.5 hours), ordered the wrong color once ($800 loss), and ran out of material once (90 min crew downtime). Total cost: $1,500 + 6 hours.", withAi: "Zero store runs. Zero wrong colors. Zero material shortages. All ordered from the app, delivered or ready for pickup. You saved $1,500 and 6 hours this week. The app paid for itself.", tool: "Complete Material Ordering Suite", toolRoute: "/admin/xtreme-comms", retailPrice: "$426/mo", deliveredCost: "$118/mo", savings: "72%" },
  { day: 26, stage: 6, timeOfDay: "6:00 AM", withoutAi: "You text Mike: 'Coming today?' No answer. 6:15 — no answer. 6:30 — 'yeah.' You don't know if he's on time. Customer's waiting. Morning chaos. Stress before you even start.", withAi: "Crew confirmed via app the night before. Automated check-in at 6 AM. GPS tracking shows Mike is 15 min away. Customer auto-notified of arrival time. Zero chaos. Zero stress. You start your day calm.", tool: "Crew Confirmation + GPS Tracking", toolRoute: "/admin", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 27, stage: 6, timeOfDay: "8:00 AM", withoutAi: "You double-booked Saturday. Two customers, one crew. You call one to reschedule. They're furious. They cancel. Lost: $4,500. And a 1-star review is coming.", withAi: "Smart calendar blocks double-booking automatically. Travel-time buffers between jobs. Crew availability tracked. You can't double-book even if you try. The system protects you from yourself.", tool: "Smart Scheduling Calendar + Conflict Prevention", toolRoute: "/admin", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 28, stage: 6, timeOfDay: "12:00 PM", withoutAi: "Customer forgets the appointment. You show up. They're not home. Wasted day. $0 revenue. And you can't reschedule for 2 weeks because your calendar is full.", withAi: "Automated reminders: text 24 hrs before ('Your installation is tomorrow at 8 AM'), text 1 hr before ('Crew arriving in 60 min'). No-shows eliminated. Customer is always ready when you arrive.", tool: "Automated Customer Reminders", toolRoute: "/admin", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 29, stage: 6, timeOfDay: "4:00 PM", withoutAi: "You have 3 crews but manage them by text and memory. You don't know where anyone is. You can't optimize routes. Crews drive 2 hours between jobs because you didn't plan.", withAi: "Crew dispatch board shows all crews on a map, real-time. Routes optimized automatically. Drive time minimized. You fit 5 jobs in a day instead of 3. Revenue up 40% with the same crews.", tool: "Crew Dispatch Board + Route Optimization", toolRoute: "/admin", retailPrice: "$249/mo", deliveredCost: "$69/mo", savings: "72%" },
  { day: 30, stage: 6, timeOfDay: "End of Week 6", withoutAi: "2.8 double-booking conflicts this month × $4,500/event = $12,600 in scheduling errors. Plus 1 no-show day = $0 revenue. Plus 6 hours of crew downtime. Total: $15,000+ lost.", withAi: "Zero double-bookings. Zero no-shows. Zero downtime. Routes optimized. You saved $15,000+ this month in scheduling errors alone. The scheduling system paid for itself 10x over.", tool: "Complete Scheduling & Dispatch Suite", toolRoute: "/admin", retailPrice: "$696/mo", deliveredCost: "$185/mo", savings: "73%" },
  { day: 31, stage: 7, timeOfDay: "8:30 AM", withoutAi: "You arrive, walk the floor, eyeball square footage. You think it's 440. It's actually 520. You ordered for 440. You'll run out. Again. The day starts with a mistake you can't undo.", withAi: "Property sqft auto-pulled from public records before you arrive. You walk in knowing it's 520 sq ft. Materials ordered for 520. The day starts right. No surprises. No shortages.", tool: "Property Auto-Lookup + Pre-Arrival Sqft", toolRoute: "/estimate", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 32, stage: 7, timeOfDay: "11:00 AM", withoutAi: "Customer calls: 'Are you done yet? I need to park my car.' You're mid-pour. You stop. You call back. You lose the flow. 45 minutes added to the day. Every. Single. Time.", withAi: "Automated progress updates sent to customer: 'Base coat applied — topcoat at 2 PM — you can park by 6 PM.' Customer never calls. You never stop. You finish an hour earlier. Every day.", tool: "Automated Install-Day Progress Updates", toolRoute: "/admin/xtreme-comms", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 33, stage: 7, timeOfDay: "9:00 AM", withoutAi: "You do a moisture test but don't document it. 4 months later, floor blisters. Customer says 'you didn't test for moisture.' You did. But you have no proof. You refund $3,500 to avoid a lawsuit.", withAi: "Photo-documented prep: moisture test photo, crack repair photo, grind photo — all timestamped and saved to the job record. When the floor blisters, you pull up the proof. Customer says 'Oh, you did everything right.' No refund. No lawsuit.", tool: "Photo-Documented Prep Records", toolRoute: "/admin", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 34, stage: 7, timeOfDay: "4:00 PM", withoutAi: "You finish a beautiful job. No before/after photo taken. You can't post it, can't show future customers, can't prove the transformation. Marketing gold left on the jobsite floor.", withAi: "App prompts before/after photos at job completion. Auto-saved to job record AND social media queue. Before/after posted to Facebook by 6 PM. 3 leads come in from the post by morning.", tool: "Auto-Capture Before/After + Social Queue", toolRoute: "/admin/social-studio", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 35, stage: 7, timeOfDay: "End of Week 7", withoutAi: "You lost $3,500 to an undocumented moisture test. You lost 45 min/day to customer interruptions (3.75 hrs this week). You lost marketing gold from 5 undocumented jobs. Total: $5,000+ in preventable losses.", withAi: "Every prep documented. Zero customer interruptions. Every before/after captured and posted. You saved $5,000+ and generated 15 leads from auto-posted before/afters. The install-day suite is your insurance policy.", tool: "Complete Install-Day Suite", toolRoute: "/admin", retailPrice: "$446/mo", deliveredCost: "$126/mo", savings: "72%" },
  { day: 36, stage: 8, timeOfDay: "7:00 PM", withoutAi: "You text a number: '$4,200.' Customer says 'ok let me think.' No itemized proposal. They don't understand what they're paying for. They ghost. You lost the job to ambiguity.", withAi: "Branded, itemized proposal sent via text: system, color, sqft, line items, visualizer render embedded. Customer sees exactly what they're paying for. One-tap e-signature. No ambiguity. No ghosting.", tool: "Branded Digital Proposal + E-Signature", toolRoute: "/contractor/bid", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 37, stage: 8, timeOfDay: "9:00 AM", withoutAi: "You hand-write a proposal. Customer says 'can you email that?' You take a photo of the paper. It looks unprofessional. They're not confident. They don't sign. You lost to a competitor with a clean PDF.", withAi: "Proposal is a clean, branded PDF with your logo, the visualizer render, itemized pricing, and terms. Emailed and texted. Customer reviews on their phone. Signs with one tap. Deposits with one tap. You look like a Fortune 500 company.", tool: "Professional Proposal Generator", toolRoute: "/contractor/bid", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 38, stage: 8, timeOfDay: "2:00 PM", withoutAi: "Customer says 'I'll mail you a check for the deposit.' You wait 5 days. It doesn't come. You call. They 'forgot.' You lost momentum. The job that was hot is now lukewarm.", withAi: "One-tap deposit payment via card/ACH in the proposal. Customer pays before they hang up. Funds in your account in 24 hours. Job moves to 'scheduled' instantly. No momentum lost. No checks to chase.", tool: "One-Tap Digital Deposit Collection", toolRoute: "/contractor/bid", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 39, stage: 8, timeOfDay: "5:00 PM", withoutAi: "You sent the proposal. Did they get it? Are they going to sign? Should I call? I don't want to seem pushy. Days pass. You're anxious. You call. They say 'oh yeah, I meant to look at that.'", withAi: "Proposal tracking: you see when they open it, when they view it, how long they spend. Auto-reminder sent if they haven't signed in 48 hours. No anxiety. No awkward calls. The system follows up for you.", tool: "Proposal Tracking + Auto-Reminders", toolRoute: "/contractor/bid", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 40, stage: 8, timeOfDay: "End of Week 8", withoutAi: "3 of 5 proposals this week went unsigned. 2 deposits are 'in the mail.' You lost $12,000 in delayed/lost deals because your proposal process was unprofessional and friction-filled.", withAi: "5 of 5 proposals signed and deposited within 48 hours. Zero checks to chase. Zero ambiguity. You captured $12,000 that would have been lost. Your close rate is 100% when the proposal is this easy to say yes to.", tool: "Complete Proposal & Deposit Suite", toolRoute: "/contractor/bid", retailPrice: "$496/mo", deliveredCost: "$136/mo", savings: "73%" },
  { day: 41, stage: 9, timeOfDay: "5:00 PM", withoutAi: "You finish the job Friday. You forget to invoice. Monday you're busy. Tuesday you remember. You send it. Customer pays 10 days later. You waited 24 days for money you earned on Day 1.", withAi: "Invoice auto-generated on job completion. Sent instantly. Customer pays via one-tap link. Funds in your account in 24 hours. You never wait 24 days again. Cash flow is smooth, not stressful.", tool: "Auto-Invoice on Job Completion", toolRoute: "/admin", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 42, stage: 9, timeOfDay: "10:00 AM", withoutAi: "Customer says 'the check's in the mail.' It's not. You wait a week. Call. 'Oh, I forgot.' You wait another week. $3,200 outstanding for a month. You're too busy to chase. You eat the time value of money.", withAi: "Auto-reminders at Day 3, Day 7, Day 14. One-tap payment link in every reminder. No awkward phone calls. No 'did you get my invoice?' Customer pays on Day 3 because the reminder made it easy.", tool: "Automated Payment Reminders", toolRoute: "/admin", retailPrice: "$79/mo", deliveredCost: "$19/mo", savings: "76%" },
  { day: 43, stage: 9, timeOfDay: "3:00 PM", withoutAi: "You have 8 outstanding invoices. You don't know which are 10 days late, which are 30 days late, which are 60 days late. You manage collections by memory. You miss some. They become uncollectable.", withAi: "Real-time A/R dashboard: every invoice, its amount, its age, its status. Color-coded (green < 15 days, yellow 15-30, red > 30). You know exactly what's outstanding and how old. No surprises. No uncollectables.", tool: "A/R Aging Dashboard", toolRoute: "/admin", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 44, stage: 9, timeOfDay: "8:00 PM", withoutAi: "You don't charge late fees because you don't want to anger the customer. You eat the time value of money. Over a year, that's thousands in lost interest and lost leverage.", withAi: "Optional auto-late-fee application after Day 14 (you set the terms). Customer sees it in the invoice terms. It's not personal — it's policy. You get paid faster AND you look professional for having terms.", tool: "Automated Late-Fee System", toolRoute: "/admin", retailPrice: "$49/mo", deliveredCost: "$15/mo", savings: "69%" },
  { day: 45, stage: 9, timeOfDay: "End of Week 9", withoutAi: "5 outstanding invoices averaging 24 days late. $16,000 in outstanding receivables. 1 invoice uncollectable ($3,200). Cash flow is tight. You can't pay your crew on time. Stress is high.", withAi: "All invoices paid within 7 days. Zero outstanding. $0 uncollectable. Cash flow is smooth. Crew paid on time. Stress is gone. You can plan, invest, and grow because you know your money is coming.", tool: "Complete Invoicing & Collections Suite", toolRoute: "/admin", retailPrice: "$326/mo", deliveredCost: "$92/mo", savings: "72%" },
  { day: 46, stage: 10, timeOfDay: "9:00 AM", withoutAi: "Customer loves the floor. You leave. You never ask for a review. 3 months later, a neighbor asks 'do you know a good epoxy guy?' The customer can't remember your name.", withAi: "Auto-sent review request 24 hrs after job completion with direct Google/Facebook review link. Customer leaves a 5-star review before the novelty wears off. Your Google profile grows automatically.", tool: "Automated Review Request System", toolRoute: "/admin/reviews", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 47, stage: 10, timeOfDay: "2:00 PM", withoutAi: "You text 'can you leave a review?' No link. Customer means to. Doesn't. You get 0 reviews from 40 jobs this year. Your Google profile has 2 reviews from 2019. You're invisible online.", withAi: "One-tap review link sent directly to the customer's phone. They tap, rate, and submit in 30 seconds. No friction. You get 30+ reviews this year. Your Google profile dominates the local 3-pack.", tool: "One-Tap Review Link Generator", toolRoute: "/admin/reviews", retailPrice: "$49/mo", deliveredCost: "$15/mo", savings: "69%" },
  { day: 48, stage: 10, timeOfDay: "10:00 AM", withoutAi: "Customer has a minor issue 2 weeks later. They don't know how to reach you. They leave a 1-star review out of frustration. You never saw it coming. No chance to fix it. Reputation damaged.", withAi: "Auto-sent 7-day check-in: 'How's the floor? Any issues?' If issue detected → routed to you immediately. You fix it before it's a review. If no issue → prompt for 5-star review. You control the narrative.", tool: "Post-Job Check-In + Issue Routing", toolRoute: "/admin/reviews", retailPrice: "$79/mo", deliveredCost: "$19/mo", savings: "76%" },
  { day: 49, stage: 10, timeOfDay: "4:00 PM", withoutAi: "You got a great review but it's buried on Google. You don't share it on your website or social media. It doesn't work for you. It's a trophy on a shelf, not a marketing asset.", withAi: "Best reviews auto-shared to your website testimonials section and social media queue. Every 5-star review becomes a marketing asset that works for you 24/7. Social proof compounds automatically.", tool: "Auto-Share Reviews to Website + Social", toolRoute: "/admin/social-studio", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 50, stage: 10, timeOfDay: "End of Week 10", withoutAi: "0 reviews collected this year. 1 unaddressed 1-star review. No referral system. Each lost review = $500 in future leads. You left $20,000 in review-driven revenue on the table this year.", withAi: "47 reviews collected in 6 months. Zero unaddressed issues. Every review auto-shared to website + social. You generated $20,000+ in review-driven leads. Your reputation is your #1 marketing asset — and it runs itself.", tool: "Complete Review & Reputation Suite", toolRoute: "/admin/reviews", retailPrice: "$326/mo", deliveredCost: "$92/mo", savings: "72%" },
  { day: 51, stage: 11, timeOfDay: "All Day", withoutAi: "You have 40 stunning before/after photos on your phone. You've posted 0. A competitor with worse work posts daily and gets 5 leads/week from Facebook. You get 0. You're invisible.", withAi: "Before/after photos auto-posted to Facebook/Instagram from completed jobs. SEO-optimized captions, hashtags, and AI-search keywords auto-generated. You get 5+ leads/week from social without lifting a finger.", tool: "Auto-Generated Social Posts from Jobs", toolRoute: "/admin/social-studio", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 52, stage: 11, timeOfDay: "9:00 AM", withoutAi: "You post once every 3 months. No caption, no hashtags, no SEO. 12 people see it. No leads. You think 'social media doesn't work for epoxy.' It does — you just don't do it.", withAi: "AI generates captions with SEO keywords ('epoxy garage floors near me', 'garage floor coating [your city]'), hashtags, and AI-search phrases. Every post is optimized for Google + AI search. 200+ people see each post. 5+ leads per post.", tool: "AI-Generated SEO-Optimized Social Content", toolRoute: "/admin/social-studio", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 53, stage: 11, timeOfDay: "1:00 PM", withoutAi: "A homeowner searches 'epoxy garage floors near me.' You're on page 4. The competitor with 47 reviews and daily posts is on page 1. You're invisible. They get the lead.", withAi: "Auto-generated SEO landing pages for every city you work in. Each optimized for local keywords, AI-search phrases, and Google's 3-pack. You show up on page 1 in every city. You dominate local search.", tool: "Auto-Generated Local SEO Landing Pages", toolRoute: "/admin/seo-generator", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 54, stage: 11, timeOfDay: "3:00 PM", withoutAi: "You don't know what AI search (ChatGPT, Perplexity, Google AI Overviews) is. You're not optimized for it. When homeowners ask AI for epoxy recommendations, your competitor shows up. Not you.", withAi: "AEO (Answer Engine Optimization) built into every page and post. AI-search keywords, structured data, and FAQ schema. When homeowners ask ChatGPT for epoxy recommendations, YOU show up. You're future-proofed.", tool: "Answer Engine Optimization (AEO)", toolRoute: "/admin/seo-simulator", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 55, stage: 11, timeOfDay: "End of Week 11", withoutAi: "0 social posts. 0 SEO landing pages. 0 AI-search presence. You spent $0 on marketing and got $0 in marketing-driven leads. You rely 100% on word-of-mouth and hope. Pipeline is drying up.", withAi: "40+ auto-posts, 20+ SEO landing pages, full AEO optimization. You spent 0 hours on marketing and got 25+ leads/week from social + search. Your pipeline is full and compounding. Marketing runs itself.", tool: "Complete Social + SEO + AEO Suite", toolRoute: "/admin/social-studio", retailPrice: "$696/mo", deliveredCost: "$176/mo", savings: "75%" },
  { day: 56, stage: 12, timeOfDay: "End of Month", withoutAi: "You did 40 jobs this quarter. You think you made $120K. After materials, gas, crew, and 5 underpriced jobs, you made $68K. You didn't know until tax time. You can't make decisions without numbers.", withAi: "Real-time dashboard: revenue, material costs, profit per job, profit per sqft, close rate, lead source ROI. You know your numbers every day, not every quarter. You make decisions with data, not guesses.", tool: "Real-Time Financial Dashboard", toolRoute: "/admin/analytics", retailPrice: "$199/mo", deliveredCost: "$49/mo", savings: "75%" },
  { day: 57, stage: 12, timeOfDay: "Morning", withoutAi: "You're turning down leads because you're 'too busy.' But 30% of your time is spent on $3K jobs when you could be doing $8K jobs. You don't know the difference. You stay small because you can't see.", withAi: "Job profitability heatmap shows which jobs made money, which didn't. You stop taking $3K jobs and focus on $8K jobs. Revenue doubles with the same hours. You work smarter, not harder.", tool: "Job Profitability Analysis", toolRoute: "/admin/analytics", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 58, stage: 12, timeOfDay: "Afternoon", withoutAi: "You want to hire a second crew. You can't justify it because you don't know your numbers. You stay small. You stay stressed. You hit a growth ceiling you can't break through.", withAi: "Growth projections show: 'At current close rate + 2nd crew, you'll generate $X in 90 days.' You hire with confidence. You scale from 1 crew to 3. You break through the ceiling. You build a business, not a job.", tool: "Growth Projection Engine", toolRoute: "/admin/analytics", retailPrice: "$149/mo", deliveredCost: "$39/mo", savings: "74%" },
  { day: 59, stage: 12, timeOfDay: "Evening", withoutAi: "You don't know which lead sources produce revenue and which waste money. You spend $2K/month on Angi, HomeAdvisor, and Facebook ads but don't know which actually converts. You waste $1,000+/month.", withAi: "Lead source ROI tracking: every lead tagged by source, every dollar tracked to revenue. You see that Angi produces $2 leads that close at 10% and Google produces $0 leads that close at 40%. You cut Angi, double down on Google. You save $1,000/month and double your ROI.", tool: "Lead Source ROI Tracker", toolRoute: "/admin/analytics", retailPrice: "$99/mo", deliveredCost: "$29/mo", savings: "71%" },
  { day: 60, stage: 12, timeOfDay: "End of 60 Days", withoutAi: "60 days. You worked 600 hours. Made $68K. Lost $45K in preventable losses (missed leads, bad follow-up, scheduling errors, material mistakes, late payments, no reviews, no marketing). Net: exhausted, stressed, and barely profitable.", withAi: "60 days. You worked 420 hours (30% less). Made $113K (66% more). Lost $0 in preventable losses. Reclaimed 180 hours with your family. Net: energized, in control, and highly profitable. You built a business that runs itself.", tool: "COMPLETE XTREME AI SYSTEM", toolRoute: "/admin", retailPrice: "$5,952/mo", deliveredCost: "$1,497/mo", savings: "75%" },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Get the Google Sheets OAuth connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    if (!accessToken) {
      return Response.json(
        { error: "Google Sheets connector not connected. Please authorize the googlesheets connector first." },
        { status: 500 }
      );
    }

    // Step 1: Create a new spreadsheet
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: "60-Day Contractor Workflow — Xtreme AI Before/After",
        },
        sheets: [
          {
            properties: {
              title: "Workflow Comparison",
              gridProperties: {
                columnCount: 9,
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("Google Sheets create error:", errText);
      return Response.json({ error: `Failed to create spreadsheet: ${errText}` }, { status: 500 });
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // Step 2: Write the header row + all 60 days of data
    const headerRow = [
      "Day",
      "Stage",
      "Stage Name",
      "Time of Day",
      "Without Xtreme AI (Pain)",
      "With Xtreme AI (Transformation)",
      "Tool / Service",
      "Retail Price",
      "Delivered Cost",
      "Savings %",
      "Tool Link",
    ];

    const dataRows = WORKFLOW_DAYS.map((d) => {
      const stage = WORKFLOW_STAGES.find((s) => s.id === d.stage);
      return [
        d.day,
        d.stage,
        stage?.name || "",
        d.timeOfDay,
        d.withoutAi,
        d.withAi,
        d.tool,
        d.retailPrice,
        d.deliveredCost,
        d.savings,
        `https://epoxyquotenearme.base44.app${d.toolRoute}`,
      ];
    });

    const allRows = [headerRow, ...dataRows];

    // Write all rows at once
    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:K61?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: allRows,
        }),
      }
    );

    if (!writeRes.ok) {
      const errText = await writeRes.text();
      console.error("Google Sheets write error:", errText);
      return Response.json({ error: `Failed to write data: ${errText}` }, { status: 500 });
    }

    // Step 3: Format the header row (bold + background color)
    const formatRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 11,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.83, green: 0.69, blue: 0.22 }, // Gold (#D4AF37)
                  },
                },
                fields: "userEnteredFormat(textFormat,backgroundColor)",
              },
            },
            {
              setColumnWidth: { startColumnIndex: 4, endColumnIndex: 5, width: 400 },
            },
            {
              setColumnWidth: { startColumnIndex: 5, endColumnIndex: 6, width: 400 },
            },
            {
              setColumnWidth: { startColumnIndex: 6, endColumnIndex: 7, width: 250 },
            },
          ],
        }),
      }
    );

    return Response.json({
      success: true,
      message: "60-day contractor workflow synced to Google Sheets successfully.",
      sheetUrl: spreadsheetUrl,
      spreadsheetId,
      rowsWritten: allRows.length,
    });
  } catch (error) {
    console.error("syncContractorWorkflow error:", error);
    return Response.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}