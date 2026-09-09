import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, DollarSign, Target, MapPin, Activity, Zap, BarChart3, PieChart as PieIcon, Radar as RadarIcon, LineChart as LineIcon, Flame } from 'lucide-react';

const TIME_RANGES = [
  { label: '1H', value: '1h' }, { label: '1D', value: '1d' }, { label: '3D', value: '3d' },
  { label: '7D', value: '7d' }, { label: '15D', value: '15d' }, { label: '30D', value: '30d' },
  { label: '45D', value: '45d' }, { label: '60D', value: '60d' }, { label: '90D', value: '90d' },
  { label: '180D', value: '180d' }, { label: '1Y', value: '1y' }, { label: '2Y', value: '2y' },
  { label: '6Y', value: '6y' },
];

const GRAPH_TYPES = [
  { id: 'line', label: 'Line', icon: LineIcon },
  { id: 'area', label: 'Area', icon: Activity },
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'pie', label: 'Pie', icon: PieIcon },
  { id: 'radar', label: 'Radar', icon: RadarIcon },
];

const COLORS = ['#D4AF37', '#B8860B', '#E6C84E', '#8B6914', '#FFF6D5', '#9B7508'];

export default function Results() {
  const [timeRange, setTimeRange] = useState('30d');
  const [graphType, setGraphType] = useState('area');
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [zipFilter, setZipFilter] = useState('');

  const { data: leads } = useQuery({
    queryKey: ['leads-all'],
    queryFn: () => base44.entities.Lead.list('-created_date', 500),
  });

  const { data: strategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.StrategyDocument.filter({ status: 'active' }),
  });

  // Process leads into time-series data
  const chartData = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    const now = new Date();
    const rangeMs = {
      '1h': 3600000, '1d': 86400000, '3d': 259200000, '7d': 604800000,
      '15d': 1296000000, '30d': 2592000000, '45d': 3888000000, '60d': 5184000000,
      '90d': 7776000000, '180d': 15552000000, '1y': 31536000000, '2y': 63072000000, '6y': 189216000000,
    };
    const ms = rangeMs[timeRange] || 2592000000;
    const since = new Date(now.getTime() - ms);

    const filtered = leads.filter((l) => new Date(l.created_date) >= since);

    // Group by period
    const buckets = {};
    filtered.forEach((l) => {
      const d = new Date(l.created_date);
      let key;
      if (timeRange === '1h') key = d.toLocaleTimeString('en', { hour: 'numeric' });
      else if (['1d', '3d'].includes(timeRange)) key = d.toLocaleTimeString('en', { hour: 'numeric' });
      else if (['7d', '15d', '30d', '45d', '60d'].includes(timeRange)) key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      else key = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });

      if (!buckets[key]) buckets[key] = { period: key, leads: 0, revenue: 0, appointments: 0, won: 0 };
      buckets[key].leads++;
      if (l.estimate_mid) buckets[key].revenue += l.estimate_mid;
      if (l.appointment_status && l.appointment_status !== 'none') buckets[key].appointments++;
      if (l.status === 'WON') buckets[key].won += l.won_value || l.estimate_mid || 0;
    });

    return Object.values(buckets).sort((a, b) => {
      // Sort by date - find first lead in each bucket
      const aDate = filtered.find((l) => {
        const d = new Date(l.created_date);
        let key;
        if (timeRange === '1h') key = d.toLocaleTimeString('en', { hour: 'numeric' });
        else if (['1d', '3d'].includes(timeRange)) key = d.toLocaleTimeString('en', { hour: 'numeric' });
        else if (['7d', '15d', '30d', '45d', '60d'].includes(timeRange)) key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        else key = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
        return key === a.period;
      });
      return aDate ? 0 : 1;
    });
  }, [leads, timeRange]);

  // Geographic data (city/state heat map data)
  const geoData = useMemo(() => {
    if (!leads) return [];
    const byCity = {};
    leads.forEach((l) => {
      const city = l.city || 'Unknown';
      const state = l.state || '';
      const key = `${city}, ${state}`;
      if (!byCity[key]) byCity[key] = { city, state, count: 0, revenue: 0, lat: l.latitude, lng: l.longitude };
      byCity[key].count++;
      if (l.estimate_mid) byCity[key].revenue += l.estimate_mid;
    });
    return Object.values(byCity).sort((a, b) => b.count - a.count).slice(0, 20);
  }, [leads]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    if (!leads) return [];
    const byStatus = {};
    leads.forEach((l) => {
      const s = l.status || 'NEW ESTIMATE';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Radar data (performance metrics)
  const radarData = useMemo(() => {
    if (!leads) return [];
    const total = leads.length;
    const won = leads.filter((l) => l.status === 'WON').length;
    const booked = leads.filter((l) => l.appointment_status && l.appointment_status !== 'none').length;
    const withPhotos = leads.filter((l) => l.photos && l.photos.length > 0).length;
    const withAddress = leads.filter((l) => l.address).length;
    const withEstimate = leads.filter((l) => l.estimate_mid).length;
    return [
      { metric: 'Conversion', value: total ? Math.round((won / total) * 100) : 0 },
      { metric: 'Booking Rate', value: total ? Math.round((booked / total) * 100) : 0 },
      { metric: 'Photo Upload', value: total ? Math.round((withPhotos / total) * 100) : 0 },
      { metric: 'Address Capture', value: total ? Math.round((withAddress / total) * 100) : 0 },
      { metric: 'Estimate Generated', value: total ? Math.round((withEstimate / total) * 100) : 0 },
      { metric: 'Lead Quality', value: total ? Math.round((won + booked) / total * 50) : 0 },
    ];
  }, [leads]);

  // KPIs
  const kpis = useMemo(() => {
    if (!leads) return { total: 0, revenue: 0, won: 0, conversion: 0 };
    const total = leads.length;
    const won = leads.filter((l) => l.status === 'WON').length;
    const revenue = leads.filter((l) => l.status === 'WON').reduce((s, l) => s + (l.won_value || l.estimate_mid || 0), 0);
    const pipeline = leads.filter((l) => l.estimate_mid).reduce((s, l) => s + l.estimate_mid, 0);
    return { total, revenue, won, conversion: total ? Math.round((won / total) * 100) : 0, pipeline };
  }, [leads]);

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await base44.functions.invoke('aiAssist', {
        action: 'simulateOutcome',
        scenario: `Project growth over ${timeRange} with current strategy mix`,
        timeframe: timeRange,
      });
      setSimulation(res.data?.simulation || res.simulation);
      setShowSimulation(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return <div className="flex h-64 items-center justify-center text-stone-400">No data for this time range</div>;
    }

    switch (graphType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#D4AF37" strokeWidth={2} />
              <Line type="monotone" dataKey="appointments" stroke="#B8860B" strokeWidth={2} />
              <Line type="monotone" dataKey="won" stroke="#8B6914" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="leads" stackId="1" stroke="#D4AF37" fill="#FFF6D5" />
              <Area type="monotone" dataKey="appointments" stackId="1" stroke="#B8860B" fill="#E6C84E" />
              <Area type="monotone" dataKey="won" stackId="1" stroke="#8B6914" fill="#D4AF37" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#D4AF37" />
              <Bar dataKey="appointments" fill="#B8860B" />
              <Bar dataKey="won" fill="#8B6914" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Results & Analytics</h1>
          <p className="text-sm text-stone-500 mt-1">Full-spectrum performance metrics with predictive simulation</p>
        </div>
        <button
          onClick={runSimulation}
          disabled={simulating}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:brightness-110 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          {simulating ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: kpis.total, icon: Users, color: '#D4AF37' },
          { label: 'Pipeline Value', value: `$${kpis.pipeline?.toLocaleString() || 0}`, icon: DollarSign, color: '#B8860B' },
          { label: 'Won Revenue', value: `$${kpis.revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: '#8B6914' },
          { label: 'Conversion Rate', value: `${kpis.conversion}%`, icon: Target, color: '#E6C84E' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${kpi.color}20` }}>
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900">{kpi.value}</p>
            <p className="text-xs text-stone-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-1.5">
        {TIME_RANGES.map((tr) => (
          <button
            key={tr.value}
            onClick={() => setTimeRange(tr.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              timeRange === tr.value ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {/* Graph Type Toggle */}
      <div className="flex gap-2">
        {GRAPH_TYPES.map((gt) => (
          <button
            key={gt.id}
            onClick={() => setGraphType(gt.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
              graphType === gt.id ? 'bg-amber-500 text-stone-900' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400'
            }`}
          >
            <gt.icon className="h-4 w-4" />
            {gt.label}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">
          Performance Over Time — {TIME_RANGES.find((t) => t.value === timeRange)?.label}
        </h3>
        {renderChart()}
      </div>

      {/* Simulation Panel */}
      {showSimulation && simulation && (
        <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-stone-900">Predictive Simulation Result</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {simulation.projected && Object.entries(simulation.projected).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white p-4 border border-amber-200">
                <p className="text-xs text-stone-500 capitalize">{k.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-stone-900">{typeof v === 'number' ? v.toLocaleString() : v}</p>
              </div>
            ))}
          </div>
          {simulation.recommendation && (
            <div className="rounded-xl bg-white p-4 border border-amber-200">
              <p className="text-xs font-bold text-amber-600 mb-1">RECOMMENDATION</p>
              <p className="text-sm text-stone-700">{simulation.recommendation}</p>
            </div>
          )}
          {simulation.assumptions && (
            <div className="mt-3">
              <p className="text-xs font-bold text-stone-500 mb-2">KEY ASSUMPTIONS</p>
              <ul className="space-y-1">
                {simulation.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                    <span className="text-amber-500">•</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {simulation.risks && (
            <div className="mt-3">
              <p className="text-xs font-bold text-red-500 mb-2">RISK FACTORS</p>
              <ul className="space-y-1">
                {simulation.risks.map((r, i) => (
                  <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                    <span>⚠</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Geographic Heat Map Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-stone-900">Geographic Heat Map</h3>
          </div>
          <input
            type="text"
            placeholder="Filter by ZIP..."
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            className="w-full mb-4 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {geoData
              .filter((g) => !zipFilter || g.city?.toLowerCase().includes(zipFilter.toLowerCase()))
              .map((g, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-stone-100 p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <span className="text-sm font-medium text-stone-700">{g.city}, {g.state}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-stone-500">{g.count} leads</span>
                    <div className="h-2 w-24 rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (g.count / (geoData[0]?.count || 1)) * 100)}%`,
                          background: 'linear-gradient(90deg, #FFF6D5, #D4AF37)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Radar Performance */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Strategies (for simulation context) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Active Strategy Documents (Simulation Basis)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(strategies || []).map((s) => (
            <div key={s.id} className="rounded-xl border border-stone-100 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{s.type}</span>
              <p className="text-sm font-semibold text-stone-800 mt-1">{s.title}</p>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{s.summary}</p>
            </div>
          ))}
          {(!strategies || strategies.length === 0) && (
            <p className="text-sm text-stone-400 col-span-3">No active strategies. Create strategy documents to power simulations.</p>
          )}
        </div>
      </div>
    </div>
  );
}