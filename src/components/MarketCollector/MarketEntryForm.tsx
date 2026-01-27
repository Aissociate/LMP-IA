import React, { useState } from 'react';
import { Save, Plus, Check } from 'lucide-react';
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
    description: '',
    deadline: '',
    amount: '',
    location: '',
    procedure_type: '',
    service_type: '',
    cpv_code: '',
    url: '',
    dce_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('manual_markets').insert({
        reference: formData.reference || null,
        title: formData.title,
        client: donneurOrdre.name,
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
        description: '',
        deadline: '',
        amount: '',
        location: '',
        procedure_type: '',
        service_type: '',
        cpv_code: '',
        url: '',
        dce_url: '',
      });

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);

      onMarketAdded();
    } catch (error) {
      console.error('Error saving market:', error);
      alert('Erreur lors de l\'enregistrement du marché');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
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

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Référence
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
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
            Date limite
          </label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
          />
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Type de service
          </label>
          <select
            value={formData.service_type}
            onChange={(e) => handleChange('service_type', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
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
            Localisation
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
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
            URL de l'annonce
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleChange('url', e.target.value)}
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
          disabled={saving || !formData.title.trim()}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg ${
            (saving || !formData.title.trim()) ? 'opacity-50 cursor-not-allowed' : ''
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
  );
};
