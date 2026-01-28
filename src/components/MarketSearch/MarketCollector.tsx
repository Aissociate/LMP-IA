import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Save,
  Send,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Euro,
  MapPin,
  Building,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Database,
  Play
} from 'lucide-react';
import { SessionWizard } from '../MarketCollector/SessionWizard';

const COLLECTOR_PASSWORD = 'lemarchepublic974#';

interface ManualMarket {
  id: string;
  source: string;
  reference: string;
  title: string;
  client: string;
  description: string | null;
  deadline: string | null;
  amount: number | null;
  location: string | null;
  publication_date: string;
  procedure_type: string | null;
  service_type: string | null;
  cpv_code: string | null;
  url: string | null;
  dce_url: string | null;
  department: string;
  slug: string | null;
  is_public: boolean;
  seo_title: string | null;
  seo_description: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

interface DonneurOrdre {
  id: string;
  name: string;
  siret: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  department: string | null;
}

const SERVICE_TYPES = ['Travaux', 'Services', 'Fournitures', 'Mixte'];

const PROCEDURE_TYPES = [
  'Appel d\'offres ouvert',
  'Appel d\'offres restreint',
  'Procedure adaptee (MAPA)',
  'Procedure negociee',
  'Dialogue competitif',
  'Marche de conception-realisation',
  'Accord-cadre',
  'Autre'
];

const DEPARTMENTS = [
  '01 - Ain', '02 - Aisne', '03 - Allier', '04 - Alpes-de-Haute-Provence', '05 - Hautes-Alpes',
  '06 - Alpes-Maritimes', '07 - Ardeche', '08 - Ardennes', '09 - Ariege', '10 - Aube',
  '11 - Aude', '12 - Aveyron', '13 - Bouches-du-Rhone', '14 - Calvados', '15 - Cantal',
  '16 - Charente', '17 - Charente-Maritime', '18 - Cher', '19 - Correze', '21 - Cote-d\'Or',
  '22 - Cotes-d\'Armor', '23 - Creuse', '24 - Dordogne', '25 - Doubs', '26 - Drome',
  '27 - Eure', '28 - Eure-et-Loir', '29 - Finistere', '30 - Gard', '31 - Haute-Garonne',
  '32 - Gers', '33 - Gironde', '34 - Herault', '35 - Ille-et-Vilaine', '36 - Indre',
  '37 - Indre-et-Loire', '38 - Isere', '39 - Jura', '40 - Landes', '41 - Loir-et-Cher',
  '42 - Loire', '43 - Haute-Loire', '44 - Loire-Atlantique', '45 - Loiret', '46 - Lot',
  '47 - Lot-et-Garonne', '48 - Lozere', '49 - Maine-et-Loire', '50 - Manche', '51 - Marne',
  '52 - Haute-Marne', '53 - Mayenne', '54 - Meurthe-et-Moselle', '55 - Meuse', '56 - Morbihan',
  '57 - Moselle', '58 - Nievre', '59 - Nord', '60 - Oise', '61 - Orne',
  '62 - Pas-de-Calais', '63 - Puy-de-Dome', '64 - Pyrenees-Atlantiques', '65 - Hautes-Pyrenees', '66 - Pyrenees-Orientales',
  '67 - Bas-Rhin', '68 - Haut-Rhin', '69 - Rhone', '70 - Haute-Saone', '71 - Saone-et-Loire',
  '72 - Sarthe', '73 - Savoie', '74 - Haute-Savoie', '75 - Paris', '76 - Seine-Maritime',
  '77 - Seine-et-Marne', '78 - Yvelines', '79 - Deux-Sevres', '80 - Somme', '81 - Tarn',
  '82 - Tarn-et-Garonne', '83 - Var', '84 - Vaucluse', '85 - Vendee', '86 - Vienne',
  '87 - Haute-Vienne', '88 - Vosges', '89 - Yonne', '90 - Territoire de Belfort', '91 - Essonne',
  '92 - Hauts-de-Seine', '93 - Seine-Saint-Denis', '94 - Val-de-Marne', '95 - Val-d\'Oise',
  '971 - Guadeloupe', '972 - Martinique', '973 - Guyane', '974 - La Reunion', '976 - Mayotte'
];

export const MarketCollector: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [operatorName, setOperatorName] = useState('');

  const [markets, setMarkets] = useState<ManualMarket[]>([]);
  const [donneursOrdre, setDonneursOrdre] = useState<DonneurOrdre[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingMarket, setEditingMarket] = useState<ManualMarket | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDonneursOrdre, setShowDonneursOrdre] = useState(false);
  const [showSessionWizard, setShowSessionWizard] = useState(false);

  const emptyForm = {
    title: '',
    client: '',
    description: '',
    deadline: '',
    location: '',
    publication_date: new Date().toISOString().split('T')[0],
    procedure_type: '',
    service_type: '',
    url: '',
    dce_url: '',
    operator_notes: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleLogin = () => {
    if (passwordInput === COLLECTOR_PASSWORD) {
      if (!operatorName.trim()) {
        setAuthError('Veuillez entrer votre nom ou identifiant');
        return;
      }
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('collector_operator', operatorName);
      loadMarkets();
      loadDonneursOrdre();
    } else {
      setAuthError('Mot de passe incorrect');
    }
  };

  useEffect(() => {
    const savedOperator = localStorage.getItem('collector_operator');
    if (savedOperator) {
      setOperatorName(savedOperator);
    }
  }, []);

  const callEdgeFunction = async (action: string, data?: any, marketId?: string) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-collector-save`;

    const payload = {
      password: COLLECTOR_PASSWORD,
      action,
      data,
      marketId
    };

    console.log('Calling edge function with:', { action, passwordLength: COLLECTOR_PASSWORD?.length, apiUrl });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Edge function response:', { status: response.status, ok: response.ok, result });

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Operation failed');
    }

    return result;
  };

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const result = await callEdgeFunction('list');
      setMarkets(result.data || []);
    } catch (err: any) {
      setError(`Erreur lors du chargement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDonneursOrdre = async () => {
    try {
      const result = await callEdgeFunction('listDonneursOrdre');
      setDonneursOrdre(result.data || []);
    } catch (err: any) {
      console.error('Erreur chargement donneurs ordre:', err);
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    // For publishing, title and client are required
    if (publish && (!formData.title.trim() || !formData.client.trim())) {
      setError('Le titre et le donneur d\'ordre sont obligatoires pour publier');
      return;
    }

    // For drafts, at least title OR client is required
    if (!publish && !formData.title.trim() && !formData.client.trim()) {
      setError('Au moins un titre ou un donneur d\'ordre est requis');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const reference = editingMarket?.reference || `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const marketData = {
        source: 'manual',
        reference,
        title: formData.title.trim() || 'Marché sans titre',
        client: formData.client.trim() || 'Donneur d\'ordre non spécifié',
        description: formData.description.trim() || null,
        deadline: formData.deadline || null,
        location: formData.location.trim() || null,
        publication_date: formData.publication_date || new Date().toISOString(),
        procedure_type: formData.procedure_type || null,
        service_type: formData.service_type || null,
        url: formData.url.trim() || null,
        dce_url: formData.dce_url.trim() || null,
        department: '974',
        is_public: publish,
        raw_data: {
          operator: operatorName,
          notes: formData.operator_notes.trim() || null,
        }
      };

      if (editingMarket) {
        await callEdgeFunction('update', marketData, editingMarket.id);
        setSuccess(`Marche "${formData.title}" mis a jour avec succes`);
      } else {
        await callEdgeFunction('insert', marketData);
        setSuccess(`Marche "${formData.title}" ${publish ? 'publie' : 'enregistre comme brouillon'}`);
      }

      if (!donneursOrdre.find(d => d.name.toLowerCase() === formData.client.toLowerCase())) {
        await callEdgeFunction('insertDonneurOrdre', { name: formData.client.trim() });
        loadDonneursOrdre();
      }

      setFormData(emptyForm);
      setEditingMarket(null);
      setShowForm(false);
      loadMarkets();
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (market: ManualMarket) => {
    setEditingMarket(market);
    setFormData({
      title: market.title,
      client: market.client,
      description: market.description || '',
      deadline: market.deadline ? market.deadline.split('T')[0] : '',
      location: market.location || '',
      publication_date: market.publication_date ? market.publication_date.split('T')[0] : '',
      procedure_type: market.procedure_type || '',
      service_type: market.service_type || '',
      url: market.url || '',
      dce_url: market.dce_url || '',
      operator_notes: market.raw_data?.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (market: ManualMarket) => {
    if (!confirm(`Supprimer le marche "${market.title}" ?`)) return;

    try {
      await callEdgeFunction('delete', undefined, market.id);
      setSuccess('Marche supprime');
      loadMarkets();
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    }
  };

  const handlePublish = async (market: ManualMarket) => {
    try {
      await callEdgeFunction('publish', undefined, market.id);
      setSuccess(`Marche "${market.title}" publie`);
      loadMarkets();
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    }
  };

  const handleArchive = async (market: ManualMarket) => {
    try {
      await callEdgeFunction('archive', undefined, market.id);
      setSuccess(`Marche "${market.title}" archive`);
      loadMarkets();
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    }
  };

  const filteredMarkets = markets.filter(m => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && m.is_public) ||
      (filterStatus === 'draft' && !m.is_public) ||
      (filterStatus === 'archived' && !m.is_public);
    const matchesSearch = !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: markets.length,
    draft: markets.filter(m => !m.is_public).length,
    published: markets.filter(m => m.is_public).length,
    today: markets.filter(m => {
      const today = new Date().toISOString().split('T')[0];
      return m.created_at.split('T')[0] === today;
    }).length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Database className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Collecte de Marches</h1>
            <p className="text-gray-600 mt-2">Interface operateur pour la saisie manuelle</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom / identifiant
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Ex: Jean D."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Entrez le mot de passe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {authError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Lock className="w-5 h-5" />
              Acceder a l'interface
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Collecte de Marches Publics</h1>
              <p className="text-orange-100 text-sm">Operateur: {operatorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadMarkets}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPasswordInput('');
              }}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Total saisis</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Brouillons</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Publies</div>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Saisis aujourd'hui</div>
            <div className="text-2xl font-bold text-orange-600">{stats.today}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="published">Publies</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowDonneursOrdre(!showDonneursOrdre)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Building className="w-5 h-5 flex-shrink-0" />
              <span>Donneurs d'ordre ({donneursOrdre.length})</span>
            </button>
            <button
              onClick={() => setShowSessionWizard(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Play className="w-5 h-5 flex-shrink-0" />
              <span>Session de saisie</span>
            </button>
            <button
              onClick={() => {
                setEditingMarket(null);
                setFormData(emptyForm);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              <span>Nouveau marche</span>
            </button>
          </div>
        </div>

        {showDonneursOrdre && (
          <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Liste des donneurs d'ordre connus
            </h3>
            <div className="flex flex-wrap gap-2">
              {donneursOrdre.map(d => (
                <span
                  key={d.id}
                  onClick={() => {
                    if (showForm) {
                      setFormData(prev => ({ ...prev, client: d.name }));
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    showForm
                      ? 'bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {d.name}
                </span>
              ))}
              {donneursOrdre.length === 0 && (
                <span className="text-gray-500 text-sm">Aucun donneur d'ordre enregistre</span>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {editingMarket ? 'Modifier le marche' : 'Nouveau marche'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingMarket(null);
                  setFormData(emptyForm);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Brouillon vs Publication :</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>Pour un <strong>brouillon</strong> : remplissez au minimum le titre OU le donneur d'ordre</li>
                      <li>Pour <strong>publier</strong> : le titre ET le donneur d'ordre sont obligatoires</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intitule du marche <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Travaux de renovation de la mairie"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donneur d'ordre / Acheteur <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    list="donneurs-ordre"
                    placeholder="Ex: Mairie de Saint-Denis"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <datalist id="donneurs-ordre">
                    {donneursOrdre.map(d => (
                      <option key={d.id} value={d.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation (departement)
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selectionner un departement</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de publication
                  </label>
                  <input
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, publication_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date limite de depot
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de service
                  </label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selectionner un type</option>
                    {SERVICE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de procedure
                  </label>
                  <select
                    value={formData.procedure_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, procedure_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selectionner une procedure</option>
                    {PROCEDURE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien web de l'annonce
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien DCE (si disponible)
                  </label>
                  <input
                    type="url"
                    value={formData.dce_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, dce_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Description detaillee du marche..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes operateur
                  </label>
                  <textarea
                    value={formData.operator_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, operator_notes: e.target.value }))}
                    rows={2}
                    placeholder="Notes internes (non visibles publiquement)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMarket(null);
                    setFormData(emptyForm);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer brouillon'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {saving ? 'Publication...' : 'Publier maintenant'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Intitule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donneur d'ordre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date limite
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Chargement...
                    </td>
                  </tr>
                ) : filteredMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Aucun marche trouve
                    </td>
                  </tr>
                ) : (
                  filteredMarkets.map(market => (
                    <tr key={market.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {market.reference}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {market.title}
                          </div>
                          {!market.is_public && (market.title === 'Marché sans titre' || market.client === 'Donneur d\'ordre non spécifié') && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" title="Brouillon incomplet" />
                          )}
                        </div>
                        {market.url && (
                          <a
                            href={market.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Voir l'annonce
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {market.client}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {market.location || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {market.deadline ? (
                          <span className={`${
                            new Date(market.deadline) < new Date()
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {new Date(market.deadline).toLocaleDateString('fr-FR')}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          market.is_public
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {market.is_public ? 'Publie' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(market)}
                            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!market.is_public && (
                            <button
                              onClick={() => handlePublish(market)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Publier"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {market.is_public && (
                            <button
                              onClick={() => handleArchive(market)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Depublier"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(market)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSessionWizard && (
        <SessionWizard
          isOpen={showSessionWizard}
          onClose={() => {
            setShowSessionWizard(false);
            loadMarkets();
          }}
          operatorEmail={operatorName}
        />
      )}
    </div>
  );
};
