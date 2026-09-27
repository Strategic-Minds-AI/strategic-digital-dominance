const MAX_BODY_BYTES = 1_000_000;
const ALLOWED_KINDS = new Set(['entity', 'function', 'auth', 'agent', 'analytics', 'system']);

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-content-type-options', 'nosniff');
  res.end(JSON.stringify(body));
}

function summarizeTarget(body = {}) {
  return {
    kind: typeof body.kind === 'string' ? body.kind : null,
    operation: typeof body.operation === 'string' ? body.operation : null,
    name: typeof body.name === 'string' ? body.name : null,
    entity: typeof body.entity === 'string' ? body.entity : null,
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('allow', 'GET, POST, OPTIONS');
    return res.end();
  }

  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      service: 'digital-dominance-platform-boundary',
      mode: 'debase-phase-1',
      sourceAuthority: 'Strategic-Minds-AI/strategic-digital-dominance',
      migratedCapabilities: [],
      productionMutation: false,
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('allow', 'GET, POST, OPTIONS');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return send(res, 413, { ok: false, code: 'REQUEST_TOO_LARGE' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!ALLOWED_KINDS.has(body.kind)) {
    return send(res, 400, { ok: false, code: 'INVALID_PLATFORM_KIND' });
  }

  if (body.kind === 'system' && body.operation === 'health') {
    return send(res, 200, {
      ok: true,
      status: 'READY',
      mode: 'debase-phase-1',
      migratedCapabilities: [],
    });
  }

  // Phase 1 deliberately fails closed. Each capability is migrated behind this
  // boundary and added to the registry only after staging validation passes.
  return send(res, 501, {
    ok: false,
    code: 'MIGRATION_REQUIRED',
    target: summarizeTarget(body),
  });
}
