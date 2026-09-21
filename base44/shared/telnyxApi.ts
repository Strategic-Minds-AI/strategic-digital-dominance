import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// telnyxApi — Shared Telnyx API client for backend functions.
// Handles auth, errors, and provides high-level compliance endpoints.
//
// Usage:
//   import { getComplianceAudit, create10DlcCampaign } from '../../shared/telnyxApi.ts';
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.telnyx.com/v2';

export async function telnyxRequest(method: string, path: string, body?: any) {
  const apiKey = secrets.get('TELNYX_API_KEY');
  if (!apiKey) throw new Error('TELNYX_API_KEY not set — add it in Settings → Secrets');

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data.errors?.[0];
    throw new Error(err?.detail || err?.title || `Telnyx API error (${res.status})`);
  }
  return data;
}

// ── Full compliance audit ──
export async function getComplianceAudit() {
  // 1. Phone numbers
  const numbersRes = await telnyxRequest('GET', '/phone_numbers?records_per_page=100');
  const numbers = (numbersRes.data || []).map((n: any) => ({
    id: n.id,
    phone: n.phone_number,
    type: n.phone_number_type,
    status: n.status,
    messaging_profile_id: n.messaging_profile_id,
    messaging_profile_name: n.messaging_profile_name,
    country: n.country_iso_alpha2,
  }));

  // 2. Messaging profiles
  const profilesRes = await telnyxRequest('GET', '/messaging_profiles?records_per_page=50');
  const profiles = (profilesRes.data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    enabled: p.enabled,
    webhook_url: p.webhook_url,
  }));

  // 3. 10DLC brands (records at top level, not nested under data)
  const brandsRes = await telnyxRequest('GET', '/10dlc/brand');
  const brands = (brandsRes.records || brandsRes.data?.records || []).map((b: any) => ({
    brandId: b.brandId,
    tcrBrandId: b.tcrBrandId,
    companyName: b.companyName,
    displayName: b.displayName,
    identityStatus: b.identityStatus,
    status: b.status,
    assignedCampaignsCount: b.assignedCampaignsCount,
    email: b.email,
    website: b.website,
    ein: b.ein,
  }));

  // 4. Campaigns for verified brands
  const verifiedBrands = brands.filter((b: any) => b.identityStatus === 'VERIFIED');
  let campaigns: any[] = [];
  for (const brand of verifiedBrands) {
    try {
      const campRes = await telnyxRequest('GET', `/10dlc/campaign?brandId=${brand.brandId}&records_per_page=50`);
      const brandCampaigns = (campRes.records || campRes.data?.records || []).map((c: any) => ({
        campaignId: c.campaignId,
        tcrCampaignId: c.tcrCampaignId,
        brandId: c.brandId,
        usecase: c.usecase,
        status: c.status,
        description: c.description,
      }));
      campaigns.push(...brandCampaigns);
    } catch { /* skip */ }
  }

  // 5. Toll-free verifications
  let tollfreeVerifications: any[] = [];
  try {
    const tfvRes = await telnyxRequest('GET', '/messaging_tollfree/verification/requests?page=1&page_size=50');
    tollfreeVerifications = (tfvRes.records || tfvRes.data?.records || []).map((v: any) => ({
      id: v.id,
      businessName: v.businessName,
      verificationStatus: v.verificationStatus,
      reason: v.reason,
      phoneNumbers: (v.phoneNumbers || []).map((p: any) => p.phoneNumber),
      useCase: v.useCase,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  } catch { /* skip */ }

  // Compute gaps
  const localNumbers = numbers.filter((n: any) => n.type === 'local');
  const tollfreeNumbers = numbers.filter((n: any) => n.type === 'toll_free');
  const numbersWithoutProfile = numbers.filter((n: any) => !n.messaging_profile_id);

  return {
    numbers,
    profiles,
    brands,
    verifiedBrands,
    campaigns,
    tollfreeVerifications,
    gaps: {
      numbersWithoutProfile: numbersWithoutProfile.map((n: any) => n.phone),
      localCount: localNumbers.length,
      tollfreeCount: tollfreeNumbers.length,
      hasVerifiedBrand: verifiedBrands.length > 0,
      hasCampaign: campaigns.length > 0,
      hasTollfreeVerification: tollfreeVerifications.length > 0,
      tollfreeVerificationStatus: tollfreeVerifications[0]?.verificationStatus || 'none',
    },
  };
}

// ── 10DLC campaign ──
export async function create10DlcCampaign(brandId: string, data: any) {
  const res = await telnyxRequest('POST', '/10dlc/campaignBuilder', { brandId, ...data });
  return res.data;
}

export async function assignNumberToCampaign(phoneNumber: string, campaignId: string) {
  const res = await telnyxRequest('POST', '/10dlc/phoneNumberCampaign', { phoneNumber, campaignId });
  return res.data;
}

export async function assignProfileToCampaign(messagingProfileId: string, campaignId: string, tcrCampaignId: string) {
  const res = await telnyxRequest('POST', '/10dlc/phoneNumberAssignmentByProfile/assign', {
    messagingProfileId,
    campaignId,
    tcrCampaignId,
  });
  return res.data;
}

// ── Toll-free verification ──
export async function submitTollFreeVerification(data: any) {
  const res = await telnyxRequest('POST', '/messaging_tollfree/verification/requests', data);
  return res.data;
}

export async function updateTollFreeVerification(id: string, data: any) {
  const res = await telnyxRequest('PATCH', `/messaging_tollfree/verification/requests/${id}`, data);
  return res.data;
}

// ── Send SMS directly ──
export async function sendSmsDirect(from: string, to: string, text: string) {
  const res = await telnyxRequest('POST', '/messages', { from, to, text });
  return {
    message_id: res.data?.id,
    status: res.data?.status,
    to: res.data?.to,
    from: res.data?.from,
  };
}

// ── Assign messaging profile to a number ──
export async function assignProfileToNumber(numberId: string, profileId: string) {
  const res = await telnyxRequest('PATCH', `/phone_numbers/${numberId}`, {
    messaging_product: { messaging_profile_id: profileId },
  });
  return res.data;
}