// ════════════════════════════════════════════════════════════════
// XTREME Universal Worker SDK
// Shared by all Railway workers: coding, browser, validation, research, document.
// NOTE: This is a Railway-side module — not a Base44 backend function.
// ════════════════════════════════════════════════════════════════

import { createClient } from 'npm:@supabase/supabase-js@2';

export interface WorkerConfig {
  worker_id: string;
  worker_type: string;
  version: string;
  capabilities: string[];
  environment: string;
  supabase_url: string;
  supabase_service_key: string;
  poll_interval_ms?: number;
  heartbeat_interval_ms?: number;
  max_concurrent_jobs?: number;
}

export interface JobEnvelope {
  job_id: string;
  system_id: string;
  job_type: string;
  priority: string;
  payload: Record<string, any>;
  correlation_id?: string;
  parent_job_id?: string;
  intent_id?: string;
  repair_id?: string;
  benchmark_id?: string;
  required_worker_type: string;
  required_capabilities?: string[];
  created_at: string;
  available_at?: string;
  attempt: number;
  max_attempts: number;
  timeout_seconds?: number;
  idempotency_key: string;
  risk_class: string;
  approval_required: boolean;
}

export abstract class BaseWorker {
  protected config: WorkerConfig;
  protected supabase: any;
  protected status: 'active' | 'idle' | 'busy' | 'degraded' | 'offline' = 'idle';
  protected current_job: string | null = null;
  protected load: number = 0;
  protected heartbeatTimer: any = null;
  protected pollTimer: any = null;
  protected running: boolean = false;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.supabase = createClient(config.supabase_url, config.supabase_service_key);
  }

  async start() {
    await this.registerWorker();
    this.running = true;
    this.startHeartbeat();
    this.startPolling();
    console.log(`[${this.config.worker_id}] Worker started — type=${this.config.worker_type}`);
  }

  async stop() {
    this.running = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    await this.updateStatus('offline');
  }

  async registerWorker() {
    const now = new Date().toISOString();
    await this.supabase.from('workers').upsert({
      worker_id: this.config.worker_id,
      worker_type: this.config.worker_type,
      version: this.config.version,
      capabilities: this.config.capabilities,
      environment: this.config.environment,
      status: 'active',
      load: 0,
      last_heartbeat: now,
      registered_at: now,
      updated_at: now,
    });
  }

  startHeartbeat() {
    const interval = this.config.heartbeat_interval_ms || 15000;
    this.heartbeatTimer = setInterval(() => this.heartbeat(), interval);
  }

  async heartbeat() {
    const now = new Date().toISOString();
    await this.supabase.from('workers').update({
      last_heartbeat: now,
      status: this.status,
      current_job: this.current_job,
      load: this.load,
      updated_at: now,
    }).eq('worker_id', this.config.worker_id);
  }

  startPolling() {
    const interval = this.config.poll_interval_ms || 5000;
    this.pollTimer = setInterval(() => this.pollAndProcess(), interval);
  }

  async pollAndProcess() {
    if (!this.running || this.current_job) return;
    if (this.load >= (this.config.max_concurrent_jobs || 1)) return;
    try {
      const job = await this.pollQueue();
      if (job) await this.claimAndProcess(job);
    } catch (e) {
      console.error(`[${this.config.worker_id}] Poll error:`, e);
      this.status = 'degraded';
    }
  }

  async pollQueue(): Promise<JobEnvelope | null> {
    const queueName = this.getQueueName();
    const { data, error } = await this.supabase.rpc('pgmq_read', { queue_name: queueName, vt_seconds: 300 });
    if (error || !data || data.length === 0) return null;
    return data[0].message as JobEnvelope;
  }

  async claimAndProcess(job: JobEnvelope) {
    const now = new Date().toISOString();
    const leaseExpiresAt = new Date(Date.now() + (job.timeout_seconds || 300) * 1000).toISOString();
    const { data, error } = await this.supabase.from('jobs').update({
      status: 'in_progress', claimed_by: this.config.worker_id, lease_expires_at: leaseExpiresAt, updated_at: now,
    }).eq('job_id', job.job_id).eq('status', 'queued').select();

    if (error || !data || data.length === 0) return;

    this.current_job = job.job_id;
    this.status = 'busy';
    this.load = 1;

    try {
      await this.startJob(job);
      await this.completeJob(job, { status: 'success' });
    } catch (e: any) {
      await this.failJob(job, e.message);
    } finally {
      this.current_job = null;
      this.status = 'idle';
      this.load = 0;
    }
  }

  abstract startJob(job: JobEnvelope): Promise<any>;

  async completeJob(job: JobEnvelope, result: any) {
    const now = new Date().toISOString();
    await this.supabase.from('jobs').update({ status: 'ready_for_validation', updated_at: now }).eq('job_id', job.job_id);
    await this.supabase.from('job_attempts').insert({
      job_id: job.job_id, worker_id: this.config.worker_id, attempt: job.attempt, status: result.status, completed_at: now,
    });
    await this.logEvent(job.job_id, 'job_completed', result);
  }

  async failJob(job: JobEnvelope, error: string) {
    const now = new Date().toISOString();
    const newAttempt = job.attempt + 1;
    if (newAttempt >= job.max_attempts) {
      await this.supabase.from('jobs').update({ status: 'dead_letter', updated_at: now }).eq('job_id', job.job_id);
      await this.supabase.rpc('pgmq_send', { queue_name: 'dead_letter', message: { ...job, error, failed_at: now } });
      await this.supabase.from('incidents').insert({
        incident_id: `inc-${job.job_id}-${Date.now()}`, system_id: job.system_id, severity: 'high',
        title: `Job ${job.job_id} exceeded max attempts`, description: error, status: 'open', related_job_id: job.job_id,
      });
    } else {
      await this.supabase.from('jobs').update({
        status: 'queued', attempt: newAttempt, claimed_by: null, lease_expires_at: null, updated_at: now,
      }).eq('job_id', job.job_id);
      await this.supabase.rpc('pgmq_send', { queue_name: this.getQueueName(), message: { ...job, attempt: newAttempt } });
    }
    await this.logEvent(job.job_id, 'job_failed', { error, attempt: newAttempt });
  }

  async renewLease(job: JobEnvelope, extendSeconds: number = 300) {
    const newExpiry = new Date(Date.now() + extendSeconds * 1000).toISOString();
    await this.supabase.from('jobs').update({
      lease_expires_at: newExpiry, updated_at: new Date().toISOString(),
    }).eq('job_id', job.job_id).eq('claimed_by', this.config.worker_id);
  }

  async logEvent(jobId: string, eventType: string, data: any) {
    console.log(`[${this.config.worker_id}] ${eventType} job=${jobId}`, data);
  }

  async uploadArtifact(systemId: string, artifactType: string, data: any): Promise<string> {
    const artifactId = `art-${systemId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.supabase.from('artifacts').insert({
      artifact_id: artifactId, system_id: systemId, artifact_type: artifactType, metadata: data, created_at: new Date().toISOString(),
    });
    return artifactId;
  }

  async writeEvidenceReceipt(systemId: string, benchmarkId: string | null, evidenceType: string, description: string, data: string): Promise<string> {
    const receiptId = `receipt-${systemId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.supabase.from('evidence_receipts').insert({
      receipt_id: receiptId, system_id: systemId, benchmark_id: benchmarkId, evidence_type: evidenceType,
      evidence_description: description, evidence_data: data, verified_at: new Date().toISOString(),
      verified_by: this.config.worker_id, valid: true,
    });
    return receiptId;
  }

  async updateStatus(status: string) {
    this.status = status as any;
    await this.supabase.from('workers').update({ status, updated_at: new Date().toISOString() }).eq('worker_id', this.config.worker_id);
  }

  getQueueName(): string {
    const map: Record<string, string> = {
      validation: 'validation_jobs', browser: 'browser_jobs', coding: 'coding_jobs',
      research: 'research_jobs', document: 'knowledge_jobs', discovery: 'discovery_jobs',
      audit: 'audit_jobs', repair: 'repair_jobs', deployment: 'deployment_jobs',
    };
    return map[this.config.worker_type] || 'discovery_jobs';
  }
}