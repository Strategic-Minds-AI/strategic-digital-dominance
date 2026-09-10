import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ─────────────────────────────────────────────────────────────────────────────
// supabaseUpload — Free file storage via Supabase Storage.
//
// This is a drop-in alternative to the Base44 UploadFile Core integration.
// It uses your connected Supabase project's Storage bucket to host files
// (images, PDFs, etc.) at zero cost — no integration credits consumed.
//
// Flow:
//   1. Get the Supabase project ref from the Management API
//   2. Get the service_role key
//   3. Ensure a public bucket exists ("epoxy-uploads")
//   4. Upload the file (base64 from frontend) to Supabase Storage
//   5. Return the public URL
//
// Frontend usage:
//   const reader = new FileReader();
//   reader.onload = async () => {
//     const res = await base44.functions.invoke('supabaseUpload', {
//       file_data: reader.result,  // base64 data URL
//       filename: 'photo.jpg',
//       content_type: 'image/jpeg'
//     });
//     return res.data.file_url;
//   };
//   reader.readAsDataURL(file);
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_NAME = 'epoxy-uploads';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { file_data, filename, content_type } = body;

    if (!file_data || !filename) {
      return Response.json({ error: 'file_data and filename are required' }, { status: 400 });
    }

    // Get the Supabase connection token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');

    // Step 1: Get the project ref
    const projectsRes = await fetch('https://api.supabase.com/v1/projects', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!projectsRes.ok) {
      const err = await projectsRes.text();
      return Response.json({ error: `Failed to list Supabase projects: ${err}` }, { status: 500 });
    }
    const projects = await projectsRes.json();
    if (!projects || projects.length === 0) {
      return Response.json({ error: 'No Supabase projects found in your account' }, { status: 400 });
    }
    const projectRef = projects[0].ref;
    const projectUrl = `https://${projectRef}.supabase.co`;

    // Step 2: Get the service_role key
    const keysRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!keysRes.ok) {
      const err = await keysRes.text();
      return Response.json({ error: `Failed to get Supabase API keys: ${err}` }, { status: 500 });
    }
    const keys = await keysRes.json();
    const serviceRoleKey = keys.find((k: any) => k.name === 'service_role')?.api_key;
    if (!serviceRoleKey) {
      return Response.json({ error: 'service_role key not found' }, { status: 500 });
    }

    // Step 3: Ensure the bucket exists (create if missing)
    const bucketCheckRes = await fetch(`${projectUrl}/storage/v1/bucket/${BUCKET_NAME}`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    });
    if (!bucketCheckRes.ok) {
      // Bucket doesn't exist — create it as public
      const createBucketRes = await fetch(`${projectUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: BUCKET_NAME,
          name: BUCKET_NAME,
          public: true,
        }),
      });
      if (!createBucketRes.ok) {
        const err = await createBucketRes.text();
        return Response.json({ error: `Failed to create storage bucket: ${err}` }, { status: 500 });
      }
    }

    // Step 4: Decode base64 and upload
    // file_data is a data URL like "data:image/jpeg;base64,/9j/4AAQ..."
    const base64Match = typeof file_data === 'string' && file_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return Response.json({ error: 'file_data must be a base64 data URL' }, { status: 400 });
    }
    const detectedContentType = base64Match[1] || content_type || 'application/octet-stream';
    const base64Data = base64Match[2];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check size (10MB limit)
    if (bytes.length > 10 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    // Generate a unique path
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = `uploads/${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const uploadRes = await fetch(`${projectUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': detectedContentType,
        'x-upsert': 'true',
      },
      body: bytes,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return Response.json({ error: `Supabase upload failed: ${err}` }, { status: 500 });
    }

    // Construct the public URL
    const publicUrl = `${projectUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

    return Response.json({
      ok: true,
      file_url: publicUrl,
      path: filePath,
      bucket: BUCKET_NAME,
      size: bytes.length,
    });
  } catch (error) {
    console.error('[supabaseUpload] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}