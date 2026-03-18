import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Users, Search, Download, Eye, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const SESSION_KEY = 'prospects_admin_creds';
const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-prospects`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Lead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  legal_form: string;
  siret: string;
  naf_code: string;
  address: string;
  city: string;
  postal_code: string;
  website: string;
  main_activity: string;
  workforce_range: string;
  turnover_range: string;
  company_presentation: string;
  differentiators: string;
  status: string;
}

export function ProspectsAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const { u, p } = JSON.parse(atob(stored));
        setUsername(u);
        setPassword(p);
        setIsAuthenticated(true);
        setLoading(true);
        fetchLeads(u, p)
          .then(data => setLeads(data))
          .catch(() => {})
          .finally(() => setLoading(false));
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  async function fetchLeads(u: string, p: string): Promise<Lead[]> {
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ username: u, password: p }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur serveur');
    }
    const data = await res.json();
    return data.leads as Lead[];
  }

  async function loadLeads() {
    setLoading(true);
    try {
      const data = await fetchLeads(username, password);
      setLeads(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await fetchLeads(username, password);
      sessionStorage.setItem(SESSION_KEY, btoa(JSON.stringify({ u: username, p: password })));
      setLeads(data);
      setIsAuthenticated(true);
    } catch {
      setLoginError('Identifiants incorrects');
    }
    setLoginLoading(false);
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setLeads([]);
  }

  function handleSort(field: keyof Lead) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function exportCSV() {
    const headers = ['Date', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'SIRET', 'Ville', 'Activité', 'Statut'];
    const rows = filtered.map(l => [
      new Date(l.created_at).toLocaleDateString('fr-FR'),
      l.first_name || '',
      l.last_name || '',
      l.email || '',
      l.phone || '',
      l.company_name || '',
      l.siret || '',
      l.city || '',
      l.main_activity || '',
      l.status || 'nouveau',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospects_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = leads
    .filter(l => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (l.email || '').toLowerCase().includes(q) ||
        (l.first_name || '').toLowerCase().includes(q) ||
        (l.last_name || '').toLowerCase().includes(q) ||
        (l.company_name || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortField] || '');
      const bv = String(b[sortField] || '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-2xl mb-4 border border-orange-500/20">
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Espace Prospects</h1>
            <p className="text-slate-400 mt-1 text-sm">Accès administrateur requis</p>
          </div>
          <form onSubmit={handleLogin} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Identifiant</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {loginError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !username || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">Prospects</h1>
              <p className="text-slate-500 text-xs mt-0.5">{leads.length} enregistrement{leads.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadLeads}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un prospect..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-orange-500 rounded-full animate-spin mr-3" />
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? 'Aucun résultat pour cette recherche' : 'Aucun prospect enregistré'}</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    {([
                      ['created_at', 'Date'],
                      ['first_name', 'Prénom'],
                      ['last_name', 'Nom'],
                      ['email', 'Email'],
                      ['phone', 'Téléphone'],
                      ['company_name', 'Entreprise'],
                      ['city', 'Ville'],
                      ['status', 'Statut'],
                    ] as [keyof Lead, string][]).map(([field, label]) => (
                      <th
                        key={field}
                        onClick={() => handleSort(field)}
                        className="px-4 py-3 text-left cursor-pointer hover:text-slate-300 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortField === field ? (
                            sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          ) : null}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left">Détail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{lead.first_name || '-'}</td>
                      <td className="px-4 py-3 text-white font-medium">{lead.last_name || '-'}</td>
                      <td className="px-4 py-3 text-blue-400">{lead.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-300">{lead.phone || '-'}</td>
                      <td className="px-4 py-3 text-slate-300 font-medium">{lead.company_name || '-'}</td>
                      <td className="px-4 py-3 text-slate-400">{lead.city || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'converti' ? 'bg-green-500/15 text-green-400' :
                          lead.status === 'contacte' ? 'bg-blue-500/15 text-blue-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {lead.status || 'nouveau'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900">
              <div>
                <h2 className="font-bold text-white text-lg">{[selectedLead.first_name, selectedLead.last_name].filter(Boolean).join(' ') || 'Prospect'}</h2>
                <p className="text-slate-400 text-sm">{selectedLead.company_name || 'Entreprise non renseignée'}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <Section title="Contact">
                <Field label="Email" value={selectedLead.email} />
                <Field label="Téléphone" value={selectedLead.phone} />
                <Field label="Ville" value={selectedLead.city} />
                <Field label="Code postal" value={selectedLead.postal_code} />
                <Field label="Adresse" value={selectedLead.address} />
                <Field label="Site web" value={selectedLead.website} />
              </Section>
              <Section title="Entreprise">
                <Field label="Raison sociale" value={selectedLead.company_name} />
                <Field label="Forme juridique" value={selectedLead.legal_form} />
                <Field label="SIRET" value={selectedLead.siret} />
                <Field label="Code NAF" value={selectedLead.naf_code} />
                <Field label="Activité principale" value={selectedLead.main_activity} />
                <Field label="Effectif" value={selectedLead.workforce_range} />
                <Field label="CA" value={selectedLead.turnover_range} />
              </Section>
              {selectedLead.company_presentation && (
                <Section title="Présentation">
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedLead.company_presentation}</p>
                </Section>
              )}
              {selectedLead.differentiators && (
                <Section title="Différenciateurs">
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedLead.differentiators}</p>
                </Section>
              )}
              <div className="text-xs text-slate-600 pt-2 border-t border-slate-800">
                Enregistré le {new Date(selectedLead.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="bg-slate-800/50 rounded-lg px-3 py-2">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-200 font-medium">{value}</p>
    </div>
  );
}
