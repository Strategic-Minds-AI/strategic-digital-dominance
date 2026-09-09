import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ─────────────────────────────────────────────────────────────────────────────
// apiKeyManager — Generate, list, revoke, and verify scoped API keys.
//
// Scopes:
//   admin — full access to every backend function and entity operation
//   user  — limited: lead submission + property lookup only (public estimator)
//   seo   — SEO system: page generation, optimization, indexing, search console
//
// Keys are formatted  xps_<scope>_<48hex>  and stored as a SHA-256 hash.
// The full key is returned ONLY at generation time and never stored in plaintext.
//
// Actions:
//   generate  — create a new key (admin only) → returns the full key once
//   list      — list all keys (prefix + metadata, never the hash or full key)
//   revoke    — deactivate a key (active = false)
//   delete    — permanently remove a key
//   verify    — validate a key + scope (used by other functions to gate access)
//
// Invoke: base44.functions.invoke('apiKeyManager', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

const SCOPE_PERMISSIONS: Record<string, { functions: string[] | string; entities: string; label: string; description: string }> = {
  admin: {
    functions: '*',
    entities: 'all',
    label: 'Full Access (Admin)',
    description: 'Unrestricted access to every backend function and entity operation.',
  },
  user: {
    functions: ['propertyLookup'],
    entities: 'lead:create',
    label: 'Limited (User)',
    description: 'Lead submission and property lookup only — for external estimator widgets and partner integrations.',
  },
  seo: {
    functions: [
      'generateSeoPage', 'optimizeSeo', 'generateSitemap', 'pingIndexNow',
      'submitToIndexers', 'fillContentGaps', 'generateRss', 'fetchCoreWebVitals',
      'pullSearchConsoleData', 'verifySearchConsole', 'addSearchConsoleProperty',
      'checkGoogleStatus', 'seoGenerator', 'generateSop',
    ],
    entities: 'seo:read,create,update',
    label: 'SEO System',
    description: 'SEO automation — page generation, optimization, indexing, sitemaps, and Search Console management.',
  },
};

function generateKey(scope: string): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `xps_${scope}_${hex}`;
}

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    switch (action) {
      case 'generate': {
        const scope = body.scope || 'user';
        if (!SCOPE_PERMISSIONS[scope]) {
          return Response.json({ error: `Invalid scope. Use: ${Object.keys(SCOPE_PERMISSIONS).join(', ')}` }, { status: 400 });
        }
        if (!body.keyName || !body.keyName.trim()) {
          return Response.json({ error: 'keyName is required' }, { status: 400 });
        }

        const fullKey = generateKey(scope);
        const keyHash = await hashKey(fullKey);
        const prefix = fullKey.slice(0, 20);

        const record = await svc.entities.ApiKey.create({
          key_name: body.keyName.trim(),
          key_prefix: prefix,
          key_hash: keyHash,
          scope,
          active: true,
          description: body.description || SCOPE_PERMISSIONS[scope].description,
          created_by_name: user.full_name || user.email,
          expires_at: body.expiresAt || null,
          usage_count: 0,
        });

        // Return the full key ONCE — never retrievable again.
        return Response.json({
          ok: true,
          apiKey: fullKey,
          id: record.id,
          prefix,
          scope,
          permissions: SCOPE_PERMISSIONS[scope],
        });
      }

      case 'list': {
        const keys = await svc.entities.ApiKey.list('-created_date', 200);
        // Strip the hash from the response — never expose it to the client.
        const safe = keys.map((k) => ({
          id: k.id,
          key_name: k.key_name,
          key_prefix: k.key_prefix,
          scope: k.scope,
          active: k.active,
          description: k.description,
          created_by_name: k.created_by_name,
          created_date: k.created_date,
          expires_at: k.expires_at,
          last_used_at: k.last_used_at,
          usage_count: k.usage_count,
        }));
        return Response.json({ ok: true, keys: safe, scopes: SCOPE_PERMISSIONS });
      }

      case 'revoke': {
        if (!body.id) return Response.json({ error: 'id is required' }, { status: 400 });
        await svc.entities.ApiKey.update(body.id, { active: false });
        return Response.json({ ok: true });
      }

      case 'delete': {
        if (!body.id) return Response.json({ error: 'id is required' }, { status: 400 });
        await svc.entities.ApiKey.delete(body.id);
        return Response.json({ ok: true });
      }

      case 'verify': {
        // Used by other backend functions to gate access by API key.
        if (!body.apiKey) return Response.json({ ok: true, valid: false });

        const hash = await hashKey(body.apiKey);
        const keys = await svc.entities.ApiKey.filter({ active: true });
        const match = keys.find((k) => k.key_hash === hash);

        if (!match) return Response.json({ ok: true, valid: false });

        // Check expiry
        if (match.expires_at && new Date(match.expires_at) < new Date()) {
          return Response.json({ ok: true, valid: false, reason: 'expired' });
        }

        // Update usage stats (fire-and-forget)
        svc.entities.ApiKey.update(match.id, {
          last_used_at: new Date().toISOString(),
          usage_count: (match.usage_count || 0) + 1,
        }).catch(() => {});

        return Response.json({
          ok: true,
          valid: true,
          keyId: match.id,
          scope: match.scope,
          keyName: match.key_name,
          permissions: SCOPE_PERMISSIONS[match.scope],
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[apiKeyManager] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}