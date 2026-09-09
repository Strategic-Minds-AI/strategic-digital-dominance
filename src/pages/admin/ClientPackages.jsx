import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Save, X, Lock, Unlock, Eye } from 'lucide-react';

const AVAILABLE_PAGES = [
  { route: '/portal', label: 'Portal Home' },
  { route: '/portal/timeline', label: 'Project Timeline' },
  { route: '/portal/gallery', label: 'Photo Gallery' },
  { route: '/portal/chat', label: 'Chat' },
  { route: '/portal/maintenance', label: 'Maintenance Plan' },
  { route: '/portal/warranty', label: 'Warranty Info' },
  { route: '/portal/estimates', label: 'Estimates' },
  { route: '/portal/invoices', label: 'Invoices' },
  { route: '/portal/documents', label: 'Documents' },
  { route: '/portal/referrals', label: 'Referrals' },
];

const AVAILABLE_FEATURES = [
  'project_tracking', 'timeline', 'photo_gallery', 'chat', 'maintenance_plan',
  'warranty', 'estimates', 'invoices', 'documents', 'referrals',
];

const TIERS = [
  { value: 'basic', label: 'Basic', color: 'border-stone-300 bg-stone-50 text-stone-700' },
  { value: 'standard', label: 'Standard', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'premium', label: 'Premium', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'enterprise', label: 'Enterprise', color: 'border-purple-400 bg-purple-50 text-purple-700' },
];

export default function ClientPackages() {
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    package_name: '', client_email: '', client_name: '',
    assigned_pages: ['/portal'], features: ['project_tracking'], tier: 'standard',
    status: 'pending', expires_at: '', admin_notes: '',
  });
  const queryClient = useQueryClient();

  const { data: packages } = useQuery({
    queryKey: ['client-packages'],
    queryFn: () => base44.entities.ClientPackage.list('-created_date'),
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      package_name: '', client_email: '', client_name: '',
      assigned_pages: ['/portal'], features: ['project_tracking'], tier: 'standard',
      status: 'pending', expires_at: '', admin_notes: '',
    });
    setShowEditor(true);
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      package_name: pkg.package_name, client_email: pkg.client_email, client_name: pkg.client_name || '',
      assigned_pages: pkg.assigned_pages || [], features: pkg.features || [], tier: pkg.tier || 'standard',
      status: pkg.status || 'pending', expires_at: pkg.expires_at || '', admin_notes: pkg.admin_notes || '',
    });
    setShowEditor(true);
  };

  const save = async () => {
    if (!form.package_name || !form.client_email || !form.assigned_pages.length) return;
    const payload = { ...form, provisioned_at: form.status === 'active' ? new Date().toISOString() : undefined };
    if (editing) {
      await base44.entities.ClientPackage.update(editing.id, payload);
    } else {
      await base44.entities.ClientPackage.create(payload);
    }
    queryClient.invalidateQueries({ queryKey: ['client-packages'] });
    setShowEditor(false);
  };

  const togglePage = (route) => {
    setForm((f) => ({
      ...f,
      assigned_pages: f.assigned_pages.includes(route)
        ? f.assigned_pages.filter((p) => p !== route)
        : [...f.assigned_pages, route],
    }));
  };

  const toggleFeature = (feat) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter((x) => x !== feat)
        : [...f.features, feat],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Client Package Manager</h1>
          <p className="text-sm text-stone-500 mt-1">Assign packages with exact page access and features per client</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> New Package
        </button>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(packages || []).map((pkg) => {
          const tier = TIERS.find((t) => t.value === pkg.tier) || TIERS[1];
          return (
            <div key={pkg.id} className={`rounded-2xl border-2 p-5 ${tier.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <h3 className="font-bold">{pkg.package_name}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${pkg.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {pkg.status}
                </span>
              </div>
              <p className="text-sm font-medium">{pkg.client_name || 'N/A'}</p>
              <p className="text-xs opacity-70">{pkg.client_email}</p>
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Assigned Pages ({pkg.assigned_pages?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {(pkg.assigned_pages || []).map((p) => (
                    <span key={p} className="text-[10px] bg-white/60 px-2 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Features ({pkg.features?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {(pkg.features || []).map((f) => (
                    <span key={f} className="text-[10px] bg-white/60 px-2 py-0.5 rounded">{f.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
              {pkg.expires_at && <p className="text-[10px] opacity-60 mt-2">Expires: {pkg.expires_at}</p>}
              <button
                onClick={() => openEdit(pkg)}
                className="mt-3 text-xs font-bold text-stone-700 hover:underline"
              >
                Edit Package →
              </button>
            </div>
          );
        })}
        {(!packages || packages.length === 0) && (
          <p className="text-sm text-stone-400 text-center py-8 col-span-2">No client packages yet.</p>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEditor(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">{editing ? 'Edit' : 'New'} Client Package</h3>
              <button onClick={() => setShowEditor(false)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500">PACKAGE NAME</label>
                  <input
                    type="text"
                    value={form.package_name}
                    onChange={(e) => setForm({ ...form, package_name: e.target.value })}
                    placeholder="e.g. Premium Homeowner"
                    className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">TIER</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                  >
                    {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500">CLIENT NAME</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">CLIENT EMAIL</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500">ASSIGNED PAGES (exact access control)</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AVAILABLE_PAGES.map((p) => (
                    <button
                      key={p.route}
                      onClick={() => togglePage(p.route)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition ${
                        form.assigned_pages.includes(p.route)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-stone-200 text-stone-500'
                      }`}
                    >
                      {form.assigned_pages.includes(p.route) ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500">FEATURES</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVAILABLE_FEATURES.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFeature(f)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        form.features.includes(f)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-stone-200 text-stone-500'
                      }`}
                    >
                      {f.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500">STATUS</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">EXPIRES AT</label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500">ADMIN NOTES</label>
                <textarea
                  value={form.admin_notes}
                  onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                  rows={2}
                  placeholder="Internal notes..."
                  className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <button
                onClick={save}
                disabled={!form.package_name || !form.client_email || !form.assigned_pages.length}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:brightness-110 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}