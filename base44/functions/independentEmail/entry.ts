import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { sendEmail as sendXtremeEmail } from '../../shared/xtremeGateway.ts';

const COMPANY_CONTACT = 'jeremy@strategicmindsai.com';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { to, subject, body: plainBody, text, html } = body;

    if (!to || !subject) return Response.json({ error: 'to and subject required' }, { status: 400 });

    const user = await base44.auth.me().catch(() => null);
    const isPublicContact =
      body.action === 'contact' &&
      to === COMPANY_CONTACT &&
      !body.attachments &&
      String(subject).length <= 180 &&
      String(text || plainBody || '').length <= 3000;

    if (!user && !isPublicContact) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user && user.role !== 'admin' && !isPublicContact) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const content = text || plainBody || (typeof html === 'string' ? html.replace(/<[^>]+>/g, ' ') : '');
    const result = await sendXtremeEmail(to, subject, content);

    return Response.json({
      ok: true,
      independent: true,
      provider: 'xtreme-communications',
      result,
    });
  } catch (error: any) {
    console.error('[independentEmail] Error:', error?.message || error);
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
