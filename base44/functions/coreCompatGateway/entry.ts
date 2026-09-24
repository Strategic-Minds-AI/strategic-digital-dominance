import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { invokeIndependentAi } from '../../shared/coreCompat.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const method = body.method || 'InvokeLLM';
    const options = body.options || body;

    if (method !== 'InvokeLLM') {
      return Response.json({ error: `Unsupported compatibility method: ${method}` }, { status: 400 });
    }

    const result = await invokeIndependentAi(base44, options);
    return Response.json({ ok: true, method, result, independent: true });
  } catch (error: any) {
    console.error('[coreCompatGateway] Error:', error?.message || error);
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
