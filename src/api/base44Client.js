import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const rawBase44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

function unwrap(response) {
  return response?.data ?? response ?? {};
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadIndependentFile(file) {
  if (!file) throw new Error('file is required');
  const fileData = await fileToDataUrl(file);
  const response = await rawBase44.functions.invoke('supabaseUpload', {
    file_data: fileData,
    filename: file.name || `upload-${Date.now()}`,
    content_type: file.type || 'application/octet-stream',
  });
  const data = unwrap(response);
  if (!data?.file_url) throw new Error(data?.error || 'Independent upload failed');
  return data;
}

const coreCompatibility = {
  async InvokeLLM(options = {}) {
    const response = await rawBase44.functions.invoke('coreCompatGateway', {
      method: 'InvokeLLM',
      options,
    });
    const data = unwrap(response);
    if (!data?.ok || data.result === undefined || data.result === null) {
      throw new Error(data?.error || 'Independent AI failed');
    }
    return data.result;
  },

  async GenerateImage(options = {}) {
    const response = await rawBase44.functions.invoke('vercelAiGateway', {
      action: 'generateImage',
      ...options,
    });
    const data = unwrap(response);
    const url = data?.url || data?.urls?.[0] || null;
    if (!url) throw new Error(data?.error || 'Independent image generation failed');
    return { ...data, url };
  },

  async GenerateVideo(options = {}) {
    const response = await rawBase44.functions.invoke('independentVideo', options);
    const data = unwrap(response);
    if (!data?.url) throw new Error(data?.error || 'Independent video generation failed');
    return data;
  },

  async SendEmail(options = {}) {
    const response = await rawBase44.functions.invoke('independentEmail', {
      ...(options?.to === 'jeremy@strategicmindsai.com' ? { action: 'contact' } : {}),
      ...options,
    });
    const data = unwrap(response);
    if (data?.error) throw new Error(data.error);
    return data?.result ?? data;
  },

  async UploadFile({ file } = {}) {
    return uploadIndependentFile(file);
  },

  async UploadPublicFile({ file } = {}) {
    return uploadIndependentFile(file);
  },
};

const integrationsCompatibility = new Proxy(rawBase44.integrations || {}, {
  get(target, prop) {
    if (prop === 'Core') return coreCompatibility;
    const value = Reflect.get(target, prop, target);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

// Compatibility membrane: old application code keeps the Base44 Core API
// shape, while credit-consuming integration work is routed externally.
export const base44 = new Proxy(rawBase44, {
  get(target, prop) {
    if (prop === 'integrations') return integrationsCompatibility;
    const value = Reflect.get(target, prop, target);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
