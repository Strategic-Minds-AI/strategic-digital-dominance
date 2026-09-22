import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2 } from 'lucide-react';
import CalendarWidget from '@/components/opportunity-intelligence/CalendarWidget';
import ScannerGrid, { SCANNERS } from '@/components/opportunity-intelligence/ScannerGrid';
import ScanResults from '@/components/opportunity-intelligence/ScanResults';

export default function OpportunityIntelligence() {
  const [activeScan, setActiveScan] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [fullScanning, setFullScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = useCallback(async (key) => {
    setActiveScan(key);
    setScanning(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke('opportunityIntelligenceEngine', { action: key });
      setResults(res.data || res);
    } catch (e) {
      setResults({ error: e.message, findings: [] });
    }
    setScanning(false);
  }, []);

  const handleFullScan = useCallback(async () => {
    setFullScanning(true);
    setScanning(false);
    setActiveScan(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke('opportunityIntelligenceEngine', { action: 'full_scan' });
      setResults(res.data || res);
    } catch (e) {
      setResults({ error: e.message });
    }
    setFullScanning(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center">
          <Sparkles className="h-6 w-6 text-stone-950" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900">Opportunity Intelligence</h1>
          <p className="text-sm text-stone-500">Find real problems people are complaining about — then build apps to solve them.</p>
        </div>
      </div>

      {/* Google Calendar — at the very top */}
      <CalendarWidget />

      {/* Scanner grid */}
      <ScannerGrid
        onScan={handleScan}
        activeScan={activeScan}
        scanning={scanning}
        onFullScan={handleFullScan}
        fullScanning={fullScanning}
      />

      {/* Results */}
      {(scanning || fullScanning || results) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-stone-900">
              {fullScanning ? 'Full Scan Results' : activeScan ? SCANNERS.find(s => s.key === activeScan)?.label : 'Results'}
            </h2>
            {(scanning || fullScanning) && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
          </div>
          <ScanResults
            results={results}
            loading={scanning || fullScanning}
            activeScan={activeScan}
            fullScanProgress={SCANNERS}
          />
        </div>
      )}
    </div>
  );
}