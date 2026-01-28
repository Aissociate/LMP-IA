import React, { useState } from 'react';
import { Save, Plus, Check, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { DonneurOrdre } from '../../services/sessionService';

interface MarketEntryFormProps {
  donneurOrdre: DonneurOrdre;
  sessionId: string;
  onMarketAdded: () => void;
}

export const MarketEntryForm: React.FC<MarketEntryFormProps> = ({
  donneurOrdre,
  sessionId,
  onMarketAdded,
}) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    reference: '',
    title: '',
    client: donneurOrdre.name,
    description: '',
    deadline: '',
    amount: '',
    location: 'Réunion',
    procedure_type: '',
    service_type: '',
    cpv_code: '',
    url: '',
    dce_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

  const checkForDuplicates = async () => {
    if (!formData.reference.trim() && !formData.title.trim() && !formData.url.trim()) {
      return [];
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.rpc('check_all_market_duplicates', {
        p_reference: formData.reference || null,
        p_title: formData.title,
        p_client: formData.client,
        p_deadline: formData.deadline || new Date().toISOString(),
        p_url: formData.url || null,
        p_exclude_id: null,
      });

      if (error) {
        console.error('Error checking duplicates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return [];
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.reference.trim() || !formData.deadline ||
        !formData.service_type || !formData.url.trim() || !formData.location.trim()) {
      alert('Tous les champs marqués d\'un * sont obligatoires');
      return;
    }

    if (!ignoreDuplicates) {
      const foundDuplicates = await checkForDuplicates();

      if (foundDuplicates.length > 0) {
        setDuplicates(foundDuplicates);
        setShowDuplicateWarning(true);
        return;
      }
    }

    await saveMarket();
  };

  const saveMarket = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('manual_markets').insert({
        reference: formData.reference || null,
        title: formData.title,
        client: formData.client,
        description: formData.description || null,
        deadline: formData.deadline || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        location: formData.location || null,
        procedure_type: formData.procedure_type || null,
        service_type: formData.service_type || null,
        cpv_code: formData.cpv_code || null,
        url: formData.url || null,
        dce_url: formData.dce_url || null,
        source: `Session ${sessionId}`,
        status: 'draft',
        created_by: sessionId,
      });

      if (error) throw error;

      setFormData({
        reference: '',
        title: '',
        client: donneurOrdre.name,
        description: '',
        deadline: '',
        amount: '',
        location: 'Réunion',
        procedure_type: '',
        service_type: '',
        cpv_code: '',
        url: '',
        dce_url: '',
      });

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);

      setIgnoreDuplicates(false);
      setShowDuplicateWarning(false);
      setDuplicates([]);

      onMarketAdded();
    } catch (error) {
      console.error('Error saving market:', error);
      alert('Erreur lors de l\'enregistrement du marché');
    } finally {
      setSaving(false);
    }
  };

  const handleIgnoreDuplicatesAndSave = () => {
    setIgnoreDuplicates(true);
    setShowDuplicateWarning(false);
    setTimeout(() => {
      saveMarket();
    }, 100);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {showDuplicateWarning && (
        <div className={`${isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-4`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-yellow-200' : 'text-yellow-900'}`}>
                Doublons potentiels détectés
              </h4>
              <p className={`text-sm mb-3 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                Les marchés suivants semblent similaires à celui que vous souhaitez ajouter :
              </p>
              <div className="space-y-2 mb-4">
                {duplicates.slice(0, 3).map((dup, index) => (
                  <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded p-3 text-sm`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dup.title}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        dup.source_type === 'boamp'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {dup.source_type === 'boamp' ? 'BOAMP (Auto)' : 'Manuel'}
                      </span>
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Réf: {dup.reference} | {dup.organisme}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Correspondance: {dup.match_type === 'exact_reference' ? 'Référence identique' :
                                       dup.match_type === 'same_url' ? 'URL identique' :
                                       dup.match_type === 'same_title_date' ? 'Titre et date identiques' : 'Similaire'}
                      ({dup.match_score >= 1000 ? Math.floor(dup.match_score - 1000) : dup.match_score}%)
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicates([]);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleIgnoreDuplicatesAndSave}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Ajouter quand même
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Saisie d'un marché
          </h4>
          {justSaved && (
            <div className="flex items-center gap-2 text-green-600 animate-fade-in">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Enregistré !</span>
            </div>
          )}
          {checking && (
            <div className="flex items-center gap-2 text-orange-600 animate-pulse">
              <span className="text-sm font-medium">Vérification des doublons...</span>
            </div>
          )}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Titre du marché <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: Travaux de rénovation..."
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Donneur d'ordre
          </label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => handleChange('client', e.target.value)}
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: Mairie de..."
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Référence <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            required
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: 2026-001"
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Date limite <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            required
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Type de service <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.service_type}
            onChange={(e) => handleChange('service_type', e.target.value)}
            required
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
          >
            <option value="">Sélectionner...</option>
            <option value="Travaux">Travaux</option>
            <option value="Services">Services</option>
            <option value="Fournitures">Fournitures</option>
            <option value="Mixte">Mixte</option>
          </select>
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Montant estimé (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: 50000"
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Localisation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: Saint-Denis"
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Type de procédure
          </label>
          <input
            type="text"
            value={formData.procedure_type}
            onChange={(e) => handleChange('procedure_type', e.target.value)}
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: Appel d'offres ouvert"
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Code CPV
          </label>
          <input
            type="text"
            value={formData.cpv_code}
            onChange={(e) => handleChange('cpv_code', e.target.value)}
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Ex: 45000000"
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            URL de l'annonce <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleChange('url', e.target.value)}
            required
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            URL du DCE
          </label>
          <input
            type="url"
            value={formData.dce_url}
            onChange={(e) => handleChange('dce_url', e.target.value)}
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            placeholder="Description détaillée du marché..."
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={saving || !formData.title.trim() || !formData.reference.trim() || !formData.deadline ||
                    !formData.service_type || !formData.url.trim() || !formData.location.trim()}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg ${
            (saving || !formData.title.trim() || !formData.reference.trim() || !formData.deadline ||
             !formData.service_type || !formData.url.trim() || !formData.location.trim()) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? (
            <>
              <Save className="w-5 h-5 animate-pulse" />
              Enregistrement...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Ajouter ce marché
            </>
          )}
        </button>
      </div>
    </form>
    </>
  );
};
