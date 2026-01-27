import React, { useState, useEffect } from 'react';
import { Plus, X, Tag, MapPin, Euro, Calendar, Briefcase, Bell, Search as SearchIcon, AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface CreateAlertFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const CreateAlertForm: React.FC<CreateAlertFormProps> = ({ onSuccess, onCancel }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Création en cours...');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    keywords: [] as string[],
    currentKeyword: '',
    matchAllKeywords: false,
    location: '',
    minAmount: '',
    maxAmount: '',
    serviceType: '',
    minDeadline: '',
    notificationsEnabled: true,
  });

  const addKeyword = () => {
    const keyword = formData.currentKeyword.trim();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keyword],
        currentKeyword: '',
      });
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword),
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.keywords.length > 0 || formData.location || formData.serviceType) {
        loadPreview();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.keywords, formData.location, formData.minAmount, formData.maxAmount, formData.serviceType, formData.minDeadline, formData.matchAllKeywords]);

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);

      let query = supabase
        .from('public_markets')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      if (formData.location) {
        query = query.ilike('location', `%${formData.location}%`);
      }

      if (formData.minAmount) {
        query = query.gte('amount', parseFloat(formData.minAmount));
      }

      if (formData.maxAmount) {
        query = query.lte('amount', parseFloat(formData.maxAmount));
      }

      if (formData.serviceType) {
        query = query.eq('service_type', formData.serviceType);
      }

      if (formData.minDeadline) {
        query = query.gte('deadline', formData.minDeadline);
      }

      const { count } = await query;
      setPreviewCount(count || 0);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const runInitialCheck = async (alertId: string, searchParams: any) => {
    try {
      let query = supabase
        .from('public_markets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (formData.location) {
        query = query.ilike('location', `%${formData.location}%`);
      }

      if (formData.minAmount) {
        query = query.gte('amount', parseFloat(formData.minAmount));
      }

      if (formData.maxAmount) {
        query = query.lte('amount', parseFloat(formData.maxAmount));
      }

      if (formData.serviceType) {
        query = query.eq('service_type', formData.serviceType);
      }

      if (formData.minDeadline) {
        query = query.gte('deadline', formData.minDeadline);
      }

      const { data: markets, error: marketsError } = await query;
      if (marketsError) throw marketsError;

      if (!markets || markets.length === 0) return;

      const matchedMarkets = markets.filter((market: any) => {
        if (formData.keywords.length > 0) {
          const searchText = `${market.title} ${market.description || ''} ${market.client}`.toLowerCase();
          const normalizedText = searchText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

          const keywordMatches = formData.keywords.map(keyword => {
            const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedText.includes(normalizedKeyword);
          });

          if (formData.matchAllKeywords) {
            if (!keywordMatches.every(match => match)) return false;
          } else {
            if (!keywordMatches.some(match => match)) return false;
          }
        }
        return true;
      });

      for (const market of matchedMarkets) {
        const { data: existingDetection } = await supabase
          .from('market_alert_detections')
          .select('id')
          .eq('user_id', user?.id)
          .eq('market_reference', market.reference)
          .maybeSingle();

        if (existingDetection) continue;

        await supabase.from('market_alert_detections').insert({
          user_id: user?.id,
          alert_id: alertId,
          market_reference: market.reference,
          market_title: market.title,
          market_client: market.client,
          market_description: market.description,
          market_amount: market.amount,
          market_location: market.location,
          market_deadline: market.deadline,
          market_url: market.url,
          market_service_type: market.service_type,
          detected_at: new Date().toISOString(),
        });
      }

      if (matchedMarkets.length > 0) {
        const lastMarketId = markets[0].id;
        await supabase
          .from('search_alerts')
          .update({
            last_market_checked_id: lastMarketId,
            last_checked_at: new Date().toISOString()
          })
          .eq('id', alertId);
      }

      return matchedMarkets.length;
    } catch (error) {
      console.error('Error in initial check:', error);
      return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour l\'alerte');
      return;
    }

    if (formData.keywords.length === 0) {
      alert('Veuillez ajouter au moins un mot-clé');
      return;
    }

    try {
      setLoading(true);

      const searchParams: any = {};

      if (formData.location) searchParams.location = formData.location;
      if (formData.minAmount) searchParams.minAmount = parseFloat(formData.minAmount);
      if (formData.maxAmount) searchParams.maxAmount = parseFloat(formData.maxAmount);
      if (formData.serviceType) searchParams.serviceType = formData.serviceType;
      if (formData.minDeadline) searchParams.minDeadline = formData.minDeadline;

      const { data: newAlert, error } = await supabase.from('search_alerts').insert({
        user_id: user?.id,
        name: formData.name,
        keywords: formData.keywords,
        match_all_keywords: formData.matchAllKeywords,
        search_params: searchParams,
        frequency: 'daily',
        is_active: true,
        notifications_enabled: formData.notificationsEnabled,
      }).select().single();

      if (error) throw error;

      setLoadingMessage('Recherche des marchés correspondants...');
      const matchedCount = await runInitialCheck(newAlert.id, searchParams);

      if (matchedCount && matchedCount > 0) {
        alert(`Alerte créée avec succès !\n\n✓ ${matchedCount} marché(s) détecté(s)\n\nConsultez l'onglet "Détections" pour voir les résultats.`);
      } else {
        alert('Alerte créée avec succès ! Aucun marché correspondant trouvé pour le moment.\n\nLes vérifications automatiques auront lieu 2 fois par jour (8h et 18h).');
      }

      onSuccess();

      setFormData({
        name: '',
        keywords: [],
        currentKeyword: '',
        matchAllKeywords: false,
        location: '',
        minAmount: '',
        maxAmount: '',
        serviceType: '',
        minDeadline: '',
        notificationsEnabled: true,
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Erreur lors de la création de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 space-y-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Créer une nouvelle alerte
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Soyez notifié automatiquement des nouveaux marchés
          </p>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Nom de l'alerte *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Marchés BTP Réunion"
          className={`w-full px-4 py-2 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
          required
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Mots-clés * <span className="text-xs font-normal">(appuyez sur Entrée pour ajouter)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={formData.currentKeyword}
              onChange={(e) => setFormData({ ...formData, currentKeyword: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder="Ex: construction, rénovation..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {formData.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-orange-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.matchAllKeywords}
            onChange={(e) => setFormData({ ...formData, matchAllKeywords: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tous les mots-clés requis (sinon au moins un)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            Localisation
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ex: Saint-Denis, Réunion..."
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Briefcase className="w-4 h-4 inline mr-1" />
            Type de service
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="">Tous</option>
            <option value="Travaux">Travaux</option>
            <option value="Services">Services</option>
            <option value="Fournitures">Fournitures</option>
            <option value="Mixte">Mixte</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Euro className="w-4 h-4 inline mr-1" />
            Montant minimum
          </label>
          <input
            type="number"
            value={formData.minAmount}
            onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
            placeholder="0"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Euro className="w-4 h-4 inline mr-1" />
            Montant maximum
          </label>
          <input
            type="number"
            value={formData.maxAmount}
            onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
            placeholder="Illimité"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <Calendar className="w-4 h-4 inline mr-1" />
          Date limite minimum
        </label>
        <input
          type="date"
          value={formData.minDeadline}
          onChange={(e) => setFormData({ ...formData, minDeadline: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications email activées
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Recevoir des emails pour cette alerte (2x par jour: 8h et 18h)
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.notificationsEnabled}
            onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>
      </div>

      {previewCount !== null && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-center gap-2">
            <SearchIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
              {loadingPreview ? 'Chargement...' : `${previewCount} marchés correspondent actuellement à ces critères`}
            </span>
          </div>
        </div>
      )}

      <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          <div className={`text-sm ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
            <strong>Comment ça marche ?</strong>
            <p className="mt-1">
              Cette alerte sera vérifiée automatiquement 2 fois par jour (8h et 18h). Si de nouveaux marchés correspondent à vos critères, vous recevrez un email consolidé avec tous les résultats.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={loading || formData.keywords.length === 0 || !formData.name.trim()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? loadingMessage : 'Créer l\'alerte'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-3 rounded-lg font-semibold ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};
