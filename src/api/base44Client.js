// Compatibility export retained while the Digital Dominance frontend is migrated.
// This module is vendor-neutral: it does not import or call the Base44 SDK.
// Existing UI modules can keep their current `base44` binding while backend
// capabilities move behind the governed /api/platform boundary.

class PlatformMigrationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'PlatformMigrationError';
    this.code = details.code || 'PLATFORM_REQUEST_FAILED';
    this.status = details.status || 500;
    this.details = details;
  }
}

async function callPlatform(envelope, { signal } = {}) {
  const response = await fetch('/api/platform', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
    signal,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { error: 'INVALID_PLATFORM_RESPONSE' };
  }

  if (!response.ok) {
    const code = payload?.code || payload?.error || 'PLATFORM_REQUEST_FAILED';
    throw new PlatformMigrationError(code, {
      code,
      status: response.status,
      envelope: {
        kind: envelope?.kind || null,
        operation: envelope?.operation || null,
        name: envelope?.name || null,
        entity: envelope?.entity || null,
      },
    });
  }

  return payload || {};
}

function unwrap(payload) {
  return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

function entityApi(entity) {
  const run = (operation, payload = {}) =>
    callPlatform({ kind: 'entity', entity: String(entity), operation, ...payload }).then(unwrap);

  return Object.freeze({
    list: (sort, limit, skip) => run('list', { sort, limit, skip }),
    filter: (filters, sort, limit, skip) => run('filter', { filters, sort, limit, skip }),
    get: (id) => run('get', { id }),
    create: (data) => run('create', { data }),
    bulkCreate: (records) => run('bulkCreate', { records }),
    update: (id, data) => run('update', { id, data }),
    updateMany: (filters, data) => run('updateMany', { filters, data }),
    delete: (id) => run('delete', { id }),
    deleteMany: (filters) => run('deleteMany', { filters }),
    subscribe: (callback) => {
      console.warn(`[Digital Dominance] Live subscription for ${String(entity)} is not migrated yet.`);
      if (typeof callback === 'function') {
        queueMicrotask(() => callback({ type: 'MIGRATION_REQUIRED', entity: String(entity) }));
      }
      return () => {};
    },
  });
}

const entities = new Proxy(Object.create(null), {
  get(_target, entity) {
    if (typeof entity !== 'string') return undefined;
    return entityApi(entity);
  },
});

const functions = Object.freeze({
  invoke: async (name, payload = {}) => {
    const result = await callPlatform({ kind: 'function', name: String(name), operation: 'invoke', payload });
    return { data: unwrap(result) };
  },
});

const auth = Object.freeze({
  me: () => callPlatform({ kind: 'auth', operation: 'me' }).then(unwrap),
  isAuthenticated: async () => {
    try {
      await callPlatform({ kind: 'auth', operation: 'me' });
      return true;
    } catch (error) {
      if (error?.status === 401) return false;
      throw error;
    }
  },
  logout: () => callPlatform({ kind: 'auth', operation: 'logout' }).then(unwrap),
  register: (payload) => callPlatform({ kind: 'auth', operation: 'register', payload }).then(unwrap),
  verifyOtp: (payload) => callPlatform({ kind: 'auth', operation: 'verifyOtp', payload }).then(unwrap),
  resendOtp: (payload) => callPlatform({ kind: 'auth', operation: 'resendOtp', payload }).then(unwrap),
  loginWithProvider: (provider, options = {}) =>
    callPlatform({ kind: 'auth', operation: 'loginWithProvider', provider, options }).then(unwrap),
  loginViaEmailPassword: (email, password) =>
    callPlatform({ kind: 'auth', operation: 'loginViaEmailPassword', email, password }).then(unwrap),
  updateMe: (payload) => callPlatform({ kind: 'auth', operation: 'updateMe', payload }).then(unwrap),
  resetPassword: (payload) => callPlatform({ kind: 'auth', operation: 'resetPassword', payload }).then(unwrap),
  resetPasswordRequest: (payload) =>
    callPlatform({ kind: 'auth', operation: 'resetPasswordRequest', payload }).then(unwrap),
  setToken: (token) => callPlatform({ kind: 'auth', operation: 'setToken', token }).then(unwrap),
  redirectToLogin: (returnTo) => {
    if (typeof window === 'undefined') return;
    const target = returnTo || `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/login?returnTo=${encodeURIComponent(target)}`);
  },
});

const coreIntegrations = Object.freeze({
  InvokeLLM: async (options = {}) => {
    const response = await functions.invoke('independentAi', options);
    return response.data?.result ?? response.data;
  },
  GenerateImage: async (options = {}) => {
    const response = await functions.invoke('vercelAiGateway', { action: 'generateImage', ...options });
    return response.data;
  },
  GenerateVideo: async (options = {}) => {
    const response = await functions.invoke('vercelAiGateway', { action: 'generateVideo', ...options });
    return response.data;
  },
  SendEmail: async (options = {}) => {
    const response = await functions.invoke('xtremeComms', { action: 'sendEmail', ...options });
    return response.data;
  },
  UploadFile: async (options = {}) => {
    const response = await functions.invoke('supabaseUpload', options);
    return response.data;
  },
  UploadPublicFile: async (options = {}) => {
    const response = await functions.invoke('supabaseUpload', { ...options, public: true });
    return response.data;
  },
});

const agents = Object.freeze({
  listConversations: (payload = {}) =>
    callPlatform({ kind: 'agent', operation: 'listConversations', payload }).then(unwrap),
  createConversation: (payload = {}) =>
    callPlatform({ kind: 'agent', operation: 'createConversation', payload }).then(unwrap),
  updateConversation: (conversation, payload = {}) =>
    callPlatform({ kind: 'agent', operation: 'updateConversation', conversation, payload }).then(unwrap),
  addMessage: (conversation, payload = {}) =>
    callPlatform({ kind: 'agent', operation: 'addMessage', conversation, payload }).then(unwrap),
  subscribeToConversation: (conversationId, callback) => {
    console.warn(`[Digital Dominance] Agent conversation subscription ${conversationId} is not migrated yet.`);
    if (typeof callback === 'function') {
      queueMicrotask(() => callback({ type: 'MIGRATION_REQUIRED', conversationId }));
    }
    return () => {};
  },
});

const analytics = Object.freeze({
  track: (event, properties = {}) =>
    callPlatform({ kind: 'analytics', operation: 'track', event, properties }).catch(() => null),
});

export const base44 = Object.freeze({
  entities,
  functions,
  auth,
  agents,
  integrations: Object.freeze({ Core: coreIntegrations }),
  analytics,
});

export const platform = base44;
export { PlatformMigrationError };
