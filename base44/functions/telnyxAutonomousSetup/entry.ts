import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import {
  getComplianceAudit,
  create10DlcCampaign,
  assignNumberToCampaign,
  assignProfileToCampaign,
  submitTollFreeVerification,
  updateTollFreeVerification,
  sendSmsDirect,
  assignProfileToNumber,
} from '../../shared/telnyxApi.ts';

// ─────────────────────────────────────────────────────────────────────────────
// telnyxAutonomousSetup — Deterministic autonomous Telnyx account setup.
//
// Audits the Telnyx account, identifies compliance gaps, and executes the
// exact steps needed to make SMS fully productional:
//   1. Assign missing messaging profiles to numbers
//   2. Create a 10DLC campaign under the verified brand (for local numbers)
//   3. Assign all local numbers to the campaign
//   4. Link the messaging profile to the campaign
//   5. Submit/update toll-free verification (for toll-free numbers)
//   6. Optionally send a test SMS to confirm delivery
//
// Actions:
//   runAudit    — audit only, no changes
//   runFullSetup — execute the full deterministic setup pipeline
//
// Invoke: base44.functions.invoke('telnyxAutonomousSetup', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

// Discovered during account audit — the VERIFIED XPS 10DLC brand
const XPS_BRAND_ID = '4b2001a0-8ae4-3c90-aba7-15265bb8d2bd';

// The main messaging profile (has webhook configured)
const MAIN_PROFILE_ID = '4001a073-3d82-4a82-b285-08799785d01f';

// The existing toll-free verification request (submitted for wrong business, needs correction)
const EXISTING_TFV_ID = 'b06dea57-74f7-582e-a82e-1f875e3f88a6';

// XPS business info (from the verified 10DLC brand)
const XPS_BUSINESS = {
  businessName: 'Xtreme Polishing Systems',
  corporateWebsite: 'https://xtremepolishingsystems.com',
  businessAddr1: '2200 Northwest 32nd Street',
  businessCity: 'Pompano Beach',
  businessState: 'Florida',
  businessZip: '33069',
  businessContactFirstName: 'Jeremy',
  businessContactLastName: 'Bensen',
  businessContactEmail: 'jeremy@xtremepolishingsystems.com',
  businessContactPhone: '+17722090266',
  messageVolume: '10,000',
  businessRegistrationNumber: '271665278',
  businessRegistrationType: 'EIN',
  businessRegistrationCountry: 'US',
  doingBusinessAs: 'Xtreme AI Systems',
  entityType: 'PRIVATE_PROFIT',
  isvReseller: 'No',
  ageGatedContent: false,
  optInKeywords: 'START,YES',
};

// 10DLC campaign config for XPS garage floor coating business
const XPS_CAMPAIGN = {
  usecase: 'MARKETING',
  description: 'Garage floor coating marketing, lead follow-up, and appointment reminders for homeowners who request free estimates through our website.',
  sample1: 'Hi, this is Jeremy with Xtreme Polishing Systems. Your free garage floor estimate is ready! Call 1-833-700-1239 or reply here. Reply STOP to opt out.',
  sample2: 'Reminder: Your garage floor coating consultation is tomorrow. Call 1-833-700-1239 to reschedule. Reply STOP to cancel.',
  messageFlow: 'Customers opt in by requesting a free estimate on our website epoxyquotenearme.com by filling out a form with their name, phone, and garage details.',
  helpMessage: 'Xtreme Polishing Systems: Call 1-833-700-1239 or email jeremy@xtremepolishingsystems.com. Reply STOP to unsubscribe.',
  optinKeywords: 'START,YES',
  optoutKeywords: 'STOP,UNSUBSCRIBE,CANCEL',
  helpKeywords: 'HELP,INFO',
  embeddedLink: true,
  numberPool: false,
  ageGated: false,
};

// Toll-free verification config for XPS
const XPS_TFV = {
  ...XPS_BUSINESS,
  businessAddr2: ' ',
  useCase: 'Mixed',
  useCaseSummary: 'Garage floor coating estimates, follow-up messages, and appointment reminders for homeowners who request quotes through our website.',
  productionMessageContent: 'Hi, this is Jeremy with Xtreme Polishing Systems. Your free garage floor estimate is ready! Call 1-833-700-1239 or reply here. Reply STOP to opt out.',
  sampleMessage1: 'Hi, this is Jeremy with Xtreme Polishing Systems. Your free garage floor estimate is ready! Call 1-833-700-1239 or reply here. Reply STOP to opt out.',
  sampleMessage2: 'Reminder: Your garage floor coating consultation is tomorrow. Call 1-833-700-1239 to reschedule. Reply STOP to cancel.',
  optInWorkflow: 'Customers opt in by requesting a free estimate on our website epoxyquotenearme.com/estimate by filling out a form with their name, phone, and garage details. They consent to receive SMS follow-ups about their estimate by submitting the form.',
  optInWorkflowImageURLs: [{ url: 'https://epoxyquotenearme.com/estimate' }],
  additionalInformation: 'Xtreme Polishing Systems is a premium garage floor coating company serving Florida homeowners. 20+ locations nationwide.',
  optInConfirmationResponse: "You're subscribed to Xtreme Polishing Systems updates. Reply STOP to unsubscribe.",
  helpMessageResponse: 'Xtreme Polishing Systems: Call 1-833-700-1239 or email jeremy@xtremepolishingsystems.com. Reply STOP to unsubscribe.',
  privacyPolicyURL: 'https://epoxyquotenearme.com/privacy',
  termsAndConditionURL: 'https://epoxyquotenearme.com/terms',
  webhookUrl: 'https://epoxyquotenearme.base44.app/functions/telnyxWebhook',
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'runFullSetup';

    // ── Audit only ──
    if (action === 'runAudit') {
      const audit = await getComplianceAudit();
      return Response.json({ ok: true, action, result: audit });
    }

    // ── Full deterministic setup ──
    if (action === 'runFullSetup') {
      const steps: any[] = [];

      // Step 0: Audit
      const audit = await getComplianceAudit();
      steps.push({
        step: 'audit',
        status: 'done',
        summary: `${audit.numbers.length} numbers, ${audit.profiles.length} profiles, ${audit.brands.length} brands (${audit.verifiedBrands.length} verified), ${audit.campaigns.length} campaigns, ${audit.tollfreeVerifications.length} toll-free verifications`,
      });

      // Step 1: Fix missing messaging profiles
      const numbersWithoutProfile = audit.numbers.filter((n: any) => !n.messaging_profile_id);
      if (numbersWithoutProfile.length > 0) {
        for (const num of numbersWithoutProfile) {
          try {
            await assignProfileToNumber(num.id, MAIN_PROFILE_ID);
            steps.push({ step: 'assign_profile', status: 'done', summary: `Assigned messaging profile to ${num.phone}` });
          } catch (e: any) {
            steps.push({ step: 'assign_profile', status: 'failed', summary: `${num.phone}: ${e.message}` });
          }
        }
      } else {
        steps.push({ step: 'assign_profile', status: 'skipped', summary: 'All numbers already have messaging profiles' });
      }

      // Step 2: Create 10DLC campaign if none exists
      let campaignId = audit.campaigns[0]?.campaignId;
      let tcrCampaignId = audit.campaigns[0]?.tcrCampaignId;
      if (!campaignId && audit.verifiedBrands.length > 0) {
        try {
          const camp = await create10DlcCampaign(XPS_BRAND_ID, XPS_CAMPAIGN);
          campaignId = camp?.campaignId;
          tcrCampaignId = camp?.tcrCampaignId;
          steps.push({ step: 'create_campaign', status: 'done', summary: `Created 10DLC campaign: ${campaignId} (TCR: ${tcrCampaignId})` });
          await logSop(svc, 'campaign_created', `Created 10DLC campaign ${campaignId}`, JSON.stringify(XPS_CAMPAIGN).slice(0, 200));
        } catch (e: any) {
          steps.push({ step: 'create_campaign', status: 'failed', summary: e.message });
        }
      } else if (campaignId) {
        steps.push({ step: 'create_campaign', status: 'skipped', summary: `Campaign already exists: ${campaignId}` });
      } else {
        steps.push({ step: 'create_campaign', status: 'failed', summary: 'No verified 10DLC brand found — create one in Telnyx portal first' });
      }

      // Step 3: Assign local numbers to campaign
      if (campaignId) {
        const localNumbers = audit.numbers.filter((n: any) => n.type === 'local');
        for (const num of localNumbers) {
          try {
            await assignNumberToCampaign(num.phone, campaignId);
            steps.push({ step: 'assign_campaign_number', status: 'done', summary: `${num.phone} → campaign ${campaignId}` });
          } catch (e: any) {
            // May already be assigned — treat as skipped if error mentions "already"
            const msg = e.message.toLowerCase();
            if (msg.includes('already') || msg.includes('exists') || msg.includes('assigned')) {
              steps.push({ step: 'assign_campaign_number', status: 'skipped', summary: `${num.phone} already assigned to campaign` });
            } else {
              steps.push({ step: 'assign_campaign_number', status: 'failed', summary: `${num.phone}: ${e.message}` });
            }
          }
        }

        // Step 4: Link messaging profile to campaign
        if (tcrCampaignId) {
          try {
            await assignProfileToCampaign(MAIN_PROFILE_ID, campaignId, tcrCampaignId);
            steps.push({ step: 'link_profile_campaign', status: 'done', summary: `Messaging profile linked to campaign ${campaignId}` });
          } catch (e: any) {
            const msg = e.message.toLowerCase();
            if (msg.includes('already') || msg.includes('exists')) {
              steps.push({ step: 'link_profile_campaign', status: 'skipped', summary: 'Profile already linked to campaign' });
            } else {
              steps.push({ step: 'link_profile_campaign', status: 'failed', summary: e.message });
            }
          }
        }
      }

      // Step 5: Fix toll-free verification
      const tfv = audit.tollfreeVerifications[0];
      if (tfv && (tfv.verificationStatus === 'Waiting For Customer' || tfv.verificationStatus === 'rejected' || tfv.verificationStatus === 'Rejected')) {
        try {
          await updateTollFreeVerification(tfv.id, XPS_TFV);
          steps.push({ step: 'update_tfv', status: 'done', summary: `Updated toll-free verification ${tfv.id} with correct XPS business info` });
          await logSop(svc, 'tfv_updated', `Updated toll-free verification ${tfv.id}`, JSON.stringify(XPS_TFV).slice(0, 200));
        } catch (e: any) {
          steps.push({ step: 'update_tfv', status: 'failed', summary: e.message });
        }
      } else if (!tfv) {
        try {
          const tfvData = {
            ...XPS_TFV,
            phoneNumbers: audit.numbers.filter((n: any) => n.type === 'toll_free').map((n: any) => ({ phoneNumber: n.phone })),
          };
          await submitTollFreeVerification(tfvData);
          steps.push({ step: 'submit_tfv', status: 'done', summary: 'Submitted new toll-free verification for XPS' });
          await logSop(svc, 'tfv_submitted', 'Submitted toll-free verification', '');
        } catch (e: any) {
          steps.push({ step: 'submit_tfv', status: 'failed', summary: e.message });
        }
      } else {
        steps.push({ step: 'update_tfv', status: 'skipped', summary: `Toll-free verification status: ${tfv.verificationStatus}` });
      }

      // Step 6: Send test SMS (optional)
      let testSmsResult = null;
      if (body.sendTestSms && body.testTo) {
        try {
          const fromNumber = audit.numbers.find((n: any) => n.type === 'toll_free')?.phone || audit.numbers[0]?.phone;
          if (fromNumber) {
            testSmsResult = await sendSmsDirect(fromNumber, body.testTo, '✅ Xtreme Polishing Systems — Telnyx autonomous setup complete. SMS pipeline is live. Reply STOP to opt out.');
            steps.push({ step: 'test_sms', status: 'done', summary: `Test SMS sent from ${fromNumber} to ${body.testTo}: ${testSmsResult.status}` });
            await logSop(svc, 'test_sms', `Test SMS to ${body.testTo}`, testSmsResult.status || '');
          }
        } catch (e: any) {
          steps.push({ step: 'test_sms', status: 'failed', summary: e.message });
        }
      }

      // Final audit
      const finalAudit = await getComplianceAudit();

      return Response.json({
        ok: true,
        action,
        result: {
          steps,
          initial_gaps: audit.gaps,
          final_gaps: finalAudit.gaps,
          test_sms: testSmsResult,
          summary: {
            total_steps: steps.length,
            succeeded: steps.filter((s) => s.status === 'done').length,
            failed: steps.filter((s) => s.status === 'failed').length,
            skipped: steps.filter((s) => s.status === 'skipped').length,
          },
        },
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('[telnyxAutonomousSetup] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function logSop(svc: any, action: string, description: string, detail = '') {
  await svc.entities.SopLog.create({
    category: 'integration',
    action,
    description,
    detail,
    source: 'telnyxAutonomousSetup',
  }).catch(() => {});
}