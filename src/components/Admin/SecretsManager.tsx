import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Key, Plus, Trash2, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminSecret {
  id: string;
  secret_key: string;
  secret_value: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

export function SecretsManager() {
  const [secrets, setSecrets] = useState<AdminSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSecret, setEditingSecret] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newSecret, setNewSecret] = useState({
    secret_key: '',
    secret_value: '',
    description: ''
  });
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_secrets')
        .select('*')
        .order('secret_key');

      if (error) throw error;
      setSecrets(data || []);

      const initialFormValues: Record<string, string> = {};
      (data || []).forEach(secret => {
        initialFormValues[secret.id] = secret.secret_value || '';
      });
      setFormValues(initialFormValues);
    } catch (error) {
      console.error('Error loading secrets:', error);
      showMessage('error', 'Erreur lors du chargement des secrets');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveSecret = async (secretId: string) => {
    setSaving(secretId);
    try {
      const { error } = await supabase
        .from('admin_secrets')
        .update({
          secret_value: formValues[secretId],
          updated_at: new Date().toISOString()
        })
        .eq('id', secretId);

      if (error) throw error;

      showMessage('success', 'Secret mis à jour avec succès');
      setEditingSecret(null);
      await loadSecrets();
    } catch (error: any) {
      console.error('Error saving secret:', error);
      showMessage('error', `Erreur: ${error.message}`);
    } finally {
      setSaving(null);
    }
  };

  const handleCreateSecret = async () => {
    if (!newSecret.secret_key.trim()) {
      showMessage('error', 'Le nom du secret est requis');
      return;
    }

    setSaving('new');
    try {
      const { error } = await supabase
        .from('admin_secrets')
        .insert([newSecret]);

      if (error) throw error;

      showMessage('success', 'Secret créé avec succès');
      setNewSecret({ secret_key: '', secret_value: '', description: '' });
      setShowNewForm(false);
      await loadSecrets();
    } catch (error: any) {
      console.error('Error creating secret:', error);
      showMessage('error', `Erreur: ${error.message}`);
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteSecret = async (secretId: string, secretKey: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le secret "${secretKey}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_secrets')
        .delete()
        .eq('id', secretId);

      if (error) throw error;

      showMessage('success', 'Secret supprimé avec succès');
      await loadSecrets();
    } catch (error: any) {
      console.error('Error deleting secret:', error);
      showMessage('error', `Erreur: ${error.message}`);
    }
  };

  const toggleShowValue = (secretId: string) => {
    setShowValues(prev => ({
      ...prev,
      [secretId]: !prev[secretId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            Gestion des Secrets Admin
          </h2>
          <p className="text-gray-600 mt-1">
            Configuration sécurisée des clés API et secrets système
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau secret
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {showNewForm && (
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Créer un nouveau secret</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du secret
              </label>
              <input
                type="text"
                value={newSecret.secret_key}
                onChange={(e) => setNewSecret(prev => ({ ...prev, secret_key: e.target.value }))}
                placeholder="CRON_SECRET"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur
              </label>
              <input
                type="password"
                value={newSecret.secret_value}
                onChange={(e) => setNewSecret(prev => ({ ...prev, secret_value: e.target.value }))}
                placeholder="Valeur du secret"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newSecret.description}
                onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'utilisation de ce secret"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateSecret}
                disabled={saving === 'new'}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving === 'new' ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {secrets.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-gray-500">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun secret configuré</p>
            </div>
          </Card>
        ) : (
          secrets.map((secret) => (
            <Card key={secret.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">{secret.secret_key}</h3>
                    </div>
                    {secret.description && (
                      <p className="text-sm text-gray-600">{secret.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSecret(secret.id, secret.secret_key)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    {editingSecret === secret.id ? (
                      <input
                        type={showValues[secret.id] ? 'text' : 'password'}
                        value={formValues[secret.id] || ''}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [secret.id]: e.target.value }))}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="Entrez la valeur du secret"
                      />
                    ) : (
                      <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                        {showValues[secret.id]
                          ? (secret.secret_value || 'Non configuré')
                          : '•••••••••••••••••••'
                        }
                      </div>
                    )}
                    <button
                      onClick={() => toggleShowValue(secret.id)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title={showValues[secret.id] ? 'Masquer' : 'Afficher'}
                    >
                      {showValues[secret.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {editingSecret === secret.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveSecret(secret.id)}
                        disabled={saving === secret.id}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving === secret.id ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSecret(null);
                          setFormValues(prev => ({ ...prev, [secret.id]: secret.secret_value || '' }));
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSecret(secret.id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      Modifier la valeur
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Créé: {new Date(secret.created_at).toLocaleString('fr-FR')}</span>
                    <span>Modifié: {new Date(secret.updated_at).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <div className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important - Sécurité des secrets</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Les secrets sont stockés en base de données</li>
                <li>Le secret CRON_SECRET est utilisé pour authentifier les tâches automatiques</li>
                <li>Ne partagez jamais ces valeurs publiquement</li>
                <li>Changez régulièrement vos secrets pour plus de sécurité</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
