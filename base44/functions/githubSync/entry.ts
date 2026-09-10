import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// githubSync — Pushes Code Studio content (DynamicPages + CodeBlocks) to a
// GitHub repo as JSON files, creating a commit with the current state.
//
// Invoke: base44.functions.invoke('githubSync', {})
// ─────────────────────────────────────────────────────────────────────────────

async function getFileSha(token: string, repo: string, path: string, branch: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'epoxy-code-studio' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

async function pushFile(token: string, repo: string, path: string, content: string, branch: string, sha: string | null): Promise<any> {
  const body: any = { message: `sync: ${path}`, content: btoa(content), branch };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'epoxy-code-studio' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API ${res.status} for ${path}: ${err}`);
  }
  return res.json();
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const token = secrets.get('GITHUB_TOKEN');
    const repo = secrets.get('GITHUB_REPO');
    if (!token) return Response.json({ error: 'GITHUB_TOKEN secret is not set' }, { status: 500 });
    if (!repo) return Response.json({ error: 'GITHUB_REPO secret is not set (format: owner/repo)' }, { status: 500 });

    const branch = 'main';
    const svc = base44.asServiceRole;
    const pages = await svc.entities.DynamicPage.list('-updated_date', 100);
    const codeBlocks = await svc.entities.CodeBlock.list('-updated_date', 100);

    const pushed: string[] = [];
    const errors: string[] = [];

    // Push each DynamicPage as a JSON file
    for (const page of pages) {
      const path = `pages/${page.slug}.json`;
      const content = JSON.stringify(page, null, 2);
      try {
        const sha = await getFileSha(token, repo, path, branch);
        await pushFile(token, repo, path, content, branch, sha);
        pushed.push(path);
      } catch (e) {
        errors.push(`${path}: ${e.message}`);
      }
    }

    // Push each CodeBlock as a file
    for (const block of codeBlocks) {
      const ext = block.type === 'css' ? 'css' : block.type === 'js' ? 'js' : block.type === 'html' ? 'html' : 'json';
      const path = `code-blocks/${block.name.replace(/[^a-z0-9-]/gi, '-')}.${ext}`;
      try {
        const sha = await getFileSha(token, repo, path, branch);
        await pushFile(token, repo, path, block.content || '', branch, sha);
        pushed.push(path);
      } catch (e) {
        errors.push(`${block.name}: ${e.message}`);
      }
    }

    // Push a manifest
    const manifest = { synced_at: new Date().toISOString(), pages: pages.length, code_blocks: codeBlocks.length, pushed: pushed.length };
    try {
      const sha = await getFileSha(token, repo, 'code-studio-manifest.json', branch);
      await pushFile(token, repo, 'code-studio-manifest.json', JSON.stringify(manifest, null, 2), branch, sha);
      pushed.push('code-studio-manifest.json');
    } catch (e) {
      errors.push(`manifest: ${e.message}`);
    }

    return Response.json({
      success: true,
      pages_synced: pages.length,
      code_blocks_synced: codeBlocks.length,
      files_pushed: pushed.length,
      errors: errors.length > 0 ? errors : undefined,
      repo_url: `https://github.com/${repo}`,
    });
  } catch (error) {
    console.error('githubSync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}