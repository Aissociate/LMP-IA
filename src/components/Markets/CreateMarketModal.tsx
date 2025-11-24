import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { SecurityValidation } from '../../lib/securityValidation';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarketCreated: () => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
  isOpen,
  onClose,
  onMarketCreated
}) => {
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
  const { user } = useAuth();

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
    
    // Validation de la date (ne peut pas être dans le passé)
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
      setError('La date limite ne peut pas être dans le passé');
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
      const { error } = await supabase.from('markets').insert({
        title: SecurityValidation.sanitizeInput(formData.title),
        reference: SecurityValidation.sanitizeInput(formData.reference),
        client: SecurityValidation.sanitizeInput(formData.client),
        deadline: formData.deadline,
        budget: budget,
        description: SecurityValidation.sanitizeInput(formData.description || ''),
        status: formData.status,
        user_id: user.id,
        global_memory_prompt: SecurityValidation.sanitizeInput(formData.global_memory_prompt || '')
      });

      if (error) throw error;

      onMarketCreated();
      setFormData({
        title: '',
        reference: '',
        client: '',
        deadline: '',
        budget: '',
        description: '',
        status: 'en_cours',
        global_memory_prompt: ''
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Nouveau marché</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du marché *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
               maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: Rénovation énergétique bâtiment public"
                required
              />
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                Référence *
              </label>
              <input
                id="reference"
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
               maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: MP-2024-001"
                required
              />
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <input
                id="client"
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
               maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: Mairie de Paris"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Date limite *
              </label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget (€)
              </label>
              <input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
               max={999999999}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="en_cours">En cours</option>
                <option value="soumis">Soumis</option>
                <option value="gagne">Gagné</option>
                <option value="perdu">Perdu</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
             maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Description détaillée du marché..."
            />
          </div>

          <div>
            <label htmlFor="global_memory_prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Prompt global mémoire technique
            </label>
            <textarea
              id="global_memory_prompt"
              rows={4}
              value={formData.global_memory_prompt}
              onChange={(e) => setFormData({ ...formData, global_memory_prompt: e.target.value })}
             maxLength={2000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Instructions générales pour la génération de toutes les sections du mémoire technique..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce prompt sera appliqué à toutes les sections lors de la génération automatique
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Création...' : 'Créer le marché'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};