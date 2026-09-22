import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Bookmark, CheckCircle2, Loader2, Trash2, X } from 'lucide-react';

export default function SaveButton({ finding, scannerKey, scannerLabel }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await base44.entities.Opportunity.create({
        title: finding.title || 'Untitled Opportunity',
        description: finding.description || '',
        problem: finding.problem || '',
        buyer: finding.buyer || '',
        app_idea: finding.app_idea || '',
        monetization: finding.monetization || '',
        evidence: finding.evidence || '',
        source_url: finding.url || finding.repo_url || finding.post_url || '',
        scanner_source: scannerKey || 'unknown',
        scanner_label: scannerLabel || scannerKey || '',
        score: finding.score || 0,
        status: 'saved',
        tags: [],
      });
      setSaved(true);
    } catch (e) {
      console.error('Save failed:', e);
    }
    setSaving(false);
  }, [finding, scannerKey, scannerLabel]);

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Saved
      </span>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition disabled:opacity-50"
    >
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bookmark className="h-3.5 w-3.5" />}
      Save
    </button>
  );
}