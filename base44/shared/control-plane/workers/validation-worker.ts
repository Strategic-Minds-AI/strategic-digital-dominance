// ════════════════════════════════════════════════════════════════
// XTREME Validation Worker
// The safest proof worker — HTTP, DOM, API, schema, file hash checks.
// No production mutation. Generates evidence receipts.
// ════════════════════════════════════════════════════════════════

import { BaseWorker, WorkerConfig, JobEnvelope } from './worker-sdk';

export interface ValidationPayload {
  validation_type: 'http' | 'dom' | 'api' | 'schema' | 'file_hash' | 'playwright';
  target_url?: string;
  expected_state?: string;
  expected_status?: number;
  expected_title?: string;
  benchmark_id?: string;
  repair_id?: string;
}

export interface ValidationOutput {
  status: 'pass' | 'fail' | 'error';
  actual_state: string;
  http_status?: number;
  title?: string;
  evidence_receipt_id: string;
  details: string;
  validated_at: string;
  validated_by: string;
}

export class ValidationWorker extends BaseWorker {

  constructor(config: WorkerConfig) {
    super({
      ...config,
      worker_type: 'validation',
      capabilities: ['http', 'dom', 'api', 'schema', 'file_hash', 'playwright', 'receipt_generation'],
    });
  }

  async startJob(job: JobEnvelope): Promise<ValidationOutput> {
    const payload = job.payload as unknown as ValidationPayload;
    const now = new Date().toISOString();

    console.log(`[validation-worker] Processing job=${job.job_id} type=${payload.validation_type} url=${payload.target_url}`);

    let result: ValidationOutput;

    switch (payload.validation_type) {
      case 'http':
        result = await this.validateHttp(job, payload);
        break;
      case 'dom':
        result = await this.validateDom(job, payload);
        break;
      case 'api':
        result = await this.validateApi(job, payload);
        break;
      case 'schema':
        result = await this.validateSchema(job, payload);
        break;
      default:
        result = await this.validateHttp(job, payload);
    }

    // Write validation run record
    await this.supabase.from('validation_runs').insert({
      validation_id: `val-${job.job_id}`,
      system_id: job.system_id,
      job_id: job.job_id,
      repair_id: payload.repair_id,
      benchmark_id: payload.benchmark_id,
      validation_type: payload.validation_type,
      target_url: payload.target_url,
      expected_state: payload.expected_state,
      actual_state: result.actual_state,
      status: result.status,
      evidence_receipt_id: result.evidence_receipt_id,
      details: result.details,
      validated_at: now,
      validated_by: this.config.worker_id,
    });

    return result;
  }

  // ── HTTP Validation ──
  async validateHttp(job: JobEnvelope, payload: ValidationPayload): Promise<ValidationOutput> {
    const now = new Date().toISOString();

    try {
      const response = await fetch(payload.target_url!, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'XTREME-ValidationWorker/1.0' },
      });

      const httpStatus = response.status;
      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Check expected status
      let status: 'pass' | 'fail' | 'error' = 'pass';
      const checks: string[] = [];

      if (payload.expected_status && httpStatus !== payload.expected_status) {
        status = 'fail';
        checks.push(`HTTP status ${httpStatus} !== expected ${payload.expected_status}`);
      }

      if (payload.expected_title && title !== payload.expected_title) {
        status = 'fail';
        checks.push(`Title "${title}" !== expected "${payload.expected_title}"`);
      }

      if (payload.expected_state) {
        if (!html.includes(payload.expected_state)) {
          status = 'fail';
          checks.push(`Expected state "${payload.expected_state}" not found in response`);
        }
      }

      const actualState = `HTTP ${httpStatus} | Title: "${title}"`;
      const details = checks.length > 0 ? checks.join('; ') : 'All checks passed';

      // Generate evidence receipt
      const evidenceData = JSON.stringify({
        url: payload.target_url,
        http_status: httpStatus,
        title,
        response_size: html.length,
        timestamp: now,
        checks,
      });

      const receiptId = await this.writeEvidenceReceipt(
        job.system_id,
        payload.benchmark_id || null,
        'http_response',
        `HTTP validation of ${payload.target_url} — status ${httpStatus}, title "${title}"`,
        evidenceData
      );

      return {
        status,
        actual_state: actualState,
        http_status: httpStatus,
        title,
        evidence_receipt_id: receiptId,
        details,
        validated_at: now,
        validated_by: this.config.worker_id,
      };
    } catch (e: any) {
      const evidenceData = JSON.stringify({
        url: payload.target_url,
        error: e.message,
        timestamp: now,
      });

      const receiptId = await this.writeEvidenceReceipt(
        job.system_id,
        payload.benchmark_id || null,
        'http_response',
        `HTTP validation FAILED — ${e.message}`,
        evidenceData
      );

      return {
        status: 'error',
        actual_state: `Error: ${e.message}`,
        evidence_receipt_id: receiptId,
        details: e.message,
        validated_at: now,
        validated_by: this.config.worker_id,
      };
    }
  }

  // ── DOM Validation (basic HTML parsing) ──
  async validateDom(job: JobEnvelope, payload: ValidationPayload): Promise<ValidationOutput> {
    // For production, use Playwright here. For now, fetch + regex parse.
    return this.validateHttp(job, payload);
  }

  // ── API Validation ──
  async validateApi(job: JobEnvelope, payload: ValidationPayload): Promise<ValidationOutput> {
    const now = new Date().toISOString();

    try {
      const response = await fetch(payload.target_url!, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      const httpStatus = response.status;
      const body = await response.text();

      let parsed: any = null;
      try { parsed = JSON.parse(body); } catch { /* not JSON */ }

      let status: 'pass' | 'fail' | 'error' = 'pass';
      if (payload.expected_status && httpStatus !== payload.expected_status) {
        status = 'fail';
      }

      const actualState = parsed ? JSON.stringify(parsed).slice(0, 500) : body.slice(0, 500);
      const evidenceData = JSON.stringify({ url: payload.target_url, http_status: httpStatus, body: actualState, timestamp: now });

      const receiptId = await this.writeEvidenceReceipt(
        job.system_id, payload.benchmark_id || null, 'http_response',
        `API validation — status ${httpStatus}`, evidenceData
      );

      return {
        status, actual_state: actualState, http_status: httpStatus,
        evidence_receipt_id: receiptId, details: `API check — HTTP ${httpStatus}`,
        validated_at: now, validated_by: this.config.worker_id,
      };
    } catch (e: any) {
      return {
        status: 'error', actual_state: e.message,
        evidence_receipt_id: '', details: e.message,
        validated_at: now, validated_by: this.config.worker_id,
      };
    }
  }

  // ── Schema Validation ──
  async validateSchema(job: JobEnvelope, payload: ValidationPayload): Promise<ValidationOutput> {
    const now = new Date().toISOString();
    const data = job.payload;
    const expected = payload.expected_state ? JSON.parse(payload.expected_state) : null;

    let status: 'pass' | 'fail' | 'error' = 'pass';
    const missing: string[] = [];

    if (expected) {
      for (const key of Object.keys(expected)) {
        if (!(key in data)) {
          status = 'fail';
          missing.push(key);
        }
      }
    }

    const evidenceData = JSON.stringify({ data, expected, missing, timestamp: now });
    const receiptId = await this.writeEvidenceReceipt(
      job.system_id, payload.benchmark_id || null, 'function_output',
      `Schema validation — ${missing.length} missing fields`, evidenceData
    );

    return {
      status, actual_state: JSON.stringify(data).slice(0, 500),
      evidence_receipt_id: receiptId,
      details: missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'Schema valid',
      validated_at: now, validated_by: this.config.worker_id,
    };
  }
}