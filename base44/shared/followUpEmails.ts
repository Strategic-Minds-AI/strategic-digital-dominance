// Promotional follow-up email templates for the lead drip campaign.
// Each stage is a short, branded nudge with a single CTA to book.

function money(n) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("en-US");
}

function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

const STAGES = {
  immediate: {
    subject: (lead) => `Your garage floor estimate is ready, ${lead.first_name || "there"}`,
    heading: "Here's your instant quote range",
    intro: () =>
      `Thanks for using our instant estimator! Based on the details you provided, here's your estimated price range. Tap below to schedule your free in-home consultation — we'll come out, measure your space, and give you a firm, no-obligation quote.`,
    showRange: true,
    cta: "Schedule my free consultation",
  },
  reminder: {
    subject: (lead) => `Still thinking about your garage floor, ${lead.first_name || "there"}?`,
    heading: "Your estimate is still waiting",
    intro: (ctx) =>
      `We noticed you haven't booked your free consultation yet. Your garage floor estimate is saved and ready — here's a quick reminder of your range:`,
    showRange: true,
    cta: "Book my free consultation",
  },
  gallery: {
    subject: (lead) => `See what a new garage floor looks like, ${lead.first_name || "there"}`,
    heading: "Transformations from your neighborhood",
    intro: () =>
      `Curious what your garage could look like? Homeowners just like you have transformed their floors with Xtreme Polishing Systems. Lock in your free consultation and we'll walk you through the possibilities for your space.`,
    showRange: false,
    cta: "See my options",
  },
  offer: {
    subject: (lead) => `A limited-time offer on your garage floor, ${lead.first_name || "there"}`,
    heading: "Special savings on your estimate",
    intro: () =>
      `For a limited time, book your free in-home consultation and we'll include a premium finish upgrade with your installation. Your estimate is locked in — claim your spot before this offer expires.`,
    showRange: false,
    cta: "Claim my offer",
  },
  final: {
    subject: (lead) => `We'd love to earn your business, ${lead.first_name || "there"}`,
    heading: "Last chance to book your free consultation",
    intro: (ctx) =>
      `We don't want you to miss out. Your estimate is still valid and our team is ready to transform your garage. If now isn't the right time, just reply to let us know — otherwise, tap below to book your free consultation.`,
    showRange: false,
    cta: "Book my consultation",
  },
};

export function followUpSubject(stage, lead) {
  const s = STAGES[stage] || STAGES.reminder;
  return s.subject(lead);
}

export function buildFollowUp(stage, lead, settings, origin, hasImage = false) {
  const s = STAGES[stage] || STAGES.reminder;
  const company = esc(settings.public_business_name || "EpoxyGarageFloorEstimate.com");
  const phone = esc(settings.phone || "");
  const phoneHref = `tel:${(settings.phone || "").replace(/[^\d]/g, "")}`;
  const firstName = esc(lead.first_name || "there");
  const bookUrl = `${origin}/book/${lead.id}`;
  const range =
    lead.estimate_low && lead.estimate_high
      ? `$${money(lead.estimate_low)} &ndash; $${money(lead.estimate_high)}`
      : null;

  const rangeCard = s.showRange && range
    ? `<div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:18px;text-align:center;margin:16px 0;">
         <div style="font-size:12px;color:#78716c;font-weight:600;">YOUR ESTIMATE RANGE</div>
         <div style="font-size:26px;font-weight:800;color:#0c0a09;margin:6px 0;">${range}</div>
       </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="background:#0c0a09;padding:20px 24px;">
      <div style="color:#a3e635;font-weight:800;font-size:18px;">${company}</div>
      <div style="color:#a8a29e;font-size:11px;letter-spacing:1.5px;margin-top:4px;">GARAGE FLOOR ESTIMATE</div>
    </div>
    <div style="padding:28px 24px;">
      <div style="font-size:21px;font-weight:800;color:#0c0a09;">${esc(s.heading)}</div>
      <p style="color:#44403c;font-size:14px;line-height:1.6;margin:12px 0 8px;">${esc(s.intro({ firstName }))}</p>
      ${rangeCard}
      ${hasImage ? `<div style="margin:16px 0;text-align:center;"><img src="cid:hero" alt="Epoxy garage floor transformation" style="width:100%;max-width:540px;border-radius:12px;border:1px solid #e7e5e4;"/></div>` : ""}
      <div style="margin:24px 0;text-align:center;">
        <a href="${esc(bookUrl)}" style="display:inline-block;background:#a3e635;color:#0c0a09;font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:10px;">${esc(s.cta)}</a>
        <div style="margin-top:12px;font-size:13px;color:#44403c;">or call <a href="${phoneHref}" style="color:#0c0a09;font-weight:700;">${phone}</a></div>
      </div>
      <div style="font-size:11px;color:#a8a29e;line-height:1.5;border-top:1px solid #e7e5e4;padding-top:16px;">${esc(settings.disclaimer || "")}</div>
    </div>
    <div style="background:#fafaf9;padding:18px 24px;border-top:1px solid #e7e5e4;">
      <div style="font-size:12px;color:#78716c;">
        <strong style="color:#0c0a09;">${company}</strong><br/>
        ${esc(settings.business_address || "")}<br/>
        ${phone ? `Phone: <a href="${phoneHref}" style="color:#78716c;">${phone}</a><br/>` : ""}
        Reply to this email anytime with questions.
      </div>
    </div>
  </div>
</body></html>`;
}