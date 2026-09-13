# Evidence Receipts

## Principle

All system state must be evidence-based. No agent assertions. Every state transition requires a durable EvidenceReceipt.

## EvidenceReceipt Schema

- receipt_id: stable deterministic ID
- system_id: owning system
- benchmark_id: which benchmark (if applicable)
- cycle_id: which cycle
- evidence_type: http_response | dom_snapshot | entity_record | function_output | connector_status | file_content | log_entry | screenshot | validation_result
- evidence_url: URL or path
- evidence_description: human-readable summary
- evidence_data: serialized payload (max 5000 chars)
- verified_at: timestamp
- verified_by: agent or function that captured this
- valid: boolean
- expires_at: when evidence goes stale

## Freshness Requirements

Each BenchmarkDefinition specifies a freshness_requirement (e.g. 5min, 1h, 24h). Evidence older than the requirement is marked stale and does not count as a pass.

## Independent Validation

The worker implementing a repair cannot certify it. Validation must be performed by an independent validation worker. The validation worker writes its own EvidenceReceipt.

## Audit Trail

EvidenceReceipts form an immutable audit trail. They are never deleted — only marked invalid. This enables post-incident review and regression testing.