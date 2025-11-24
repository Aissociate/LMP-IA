import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Market } from '../../types';
import { SecurityValidation } from '../../lib/securityValidation';

interface EditMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarketUpdated: () => void;
  market: Market;
}

export const EditMarketModal: React.FC<EditMarketModalProps> = ({
  isOpen,
  onClose,
  onMarketUpdated,
  market
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    reference: '',
    client: '',
    deadline: '',
    budget: '',
    description: '',
    status: 'en_cours' as const,
    global_memory_prompt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (market) {
      setFormData({
        title: market.title || '',
        reference: market.reference || '',
        client: market.client || '',
        deadline: market.deadline || '',
        budget: market.budget?.toString() || '',
        description: market.description || '',
        status: market.status || 'en_cours',
        global_memory_prompt: market.global_memory_prompt || ''
      });
    }
  }, [market]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validations de sécurité
    if (!formData.title.trim() || formData.title.length > 200) {
      setError('Titre invalide (1-200 caractères)');
      return;
    }
    
    if (!formData.reference.trim() || formData.reference.length > 50) {
      setError('Référence invalide (1-50 caractères)');
      return;
    }
    
    if (!formData.client.trim() || formData.client.length > 200) {
      setError('Client invalide (1-200 caractères)');
      return;
    }
    
    if (!formData.deadline) {
      setError('Date limite requise');
      return;
    }
    
    // Validation du budget
    const budget = parseFloat(formData.budget) || 0;
    if (budget < 0 || budget > 999999999) {
      setError('Budget invalide (doit être positif et raisonnable)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('markets')
        .update({
          title: SecurityValidation.sanitizeInput(formData.title),
          reference: SecurityValidation.sanitizeInput(formData.reference),
          client: SecurityValidation.sanitizeInput(formData.client),
          deadline: formData.deadline,
          budget: budget,
          description: SecurityValidation.sanitizeInput(formData.description || ''),
          status: formData.status,
          global_memory_prompt: SecurityValidation.sanitizeInput(formData.global_memory_prompt || ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', market.id)
        .eq('user_id', user.id); // Sécurité : s'assurer que l'utilisateur peut modifier ce marché

      if (error) throw error;

      // Émettre un événement pour mettre à jour le dashboard
      window.dispatchEvent(new CustomEvent('straticia:market-updated', {
        detail: { marketId: market.id }
      }));

      onMarketUpdated();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200`}>
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Modifier le marché</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mettre à jour les informations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Titre du marché *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Ex: Rénovation énergétique bâtiment public"
                required
              />
            </div>

            <div>
              <label htmlFor="reference" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Référence *
              </label>
              <input
                id="reference"
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                maxLength={50}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Ex: MP-2024-001"
                required
              />
            </div>

            <div>
              <label htmlFor="client" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Client *
              </label>
              <input
                id="client"
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                maxLength={200}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Ex: Mairie de Paris"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Date limite *
              </label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
                required
              />
            </div>

            <div>
              <label htmlFor="budget" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Budget (€)
              </label>
              <input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                max={999999999}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Statut
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
              >
                <option value="en_cours">En cours</option>
                <option value="soumis">Soumis</option>
                <option value="gagne">Gagné</option>
                <option value="perdu">Perdu</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={1000}
              className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors resize-none`}
              placeholder="Description détaillée du marché..."
            />
          </div>

          <div>
            <label htmlFor="global_memory_prompt" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Prompt global mémoire technique
            </label>
            <textarea
              id="global_memory_prompt"
              rows={4}
              value={formData.global_memory_prompt}
              onChange={(e) => setFormData({ ...formData, global_memory_prompt: e.target.value })}
              maxLength={2000}
              className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors resize-none`}
              placeholder="Instructions générales pour la génération de toutes les sections du mémoire technique..."
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Ce prompt sera appliqué à toutes les sections lors de la génération automatique
            </p>
          </div>

          {error && (
            <div className={`${isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg p-4 text-sm`}>
              {error}
            </div>
          )}

          <div className={`flex justify-end gap-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'} rounded-lg font-medium transition-colors`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};