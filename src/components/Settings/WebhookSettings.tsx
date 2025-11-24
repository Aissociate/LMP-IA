import React, { useState, useEffect } from 'react';
import { Webhook, Save, Link, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const WebhookSettings: React.FC = () => {
  const { isDark } = useTheme();
  const { user, isAdmin } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWebhookSettings();
  }, []);

  const fetchWebhookSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'sourcing_webhook_url')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setWebhookUrl(data?.setting_value || '');
    } catch (error) {
      console.error('Error fetching webhook settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validation de l'URL
      if (webhookUrl.trim()) {
        try {
          new URL(webhookUrl);
        } catch {
          throw new Error('URL webhook invalide');
        }
      }

      const update = {
        setting_key: 'sourcing_webhook_url',
        setting_value: webhookUrl.trim(),
        description: 'URL du webhook pour l\'agent de sourcing'
      };

      await supabase
        .from('admin_settings')
        .upsert(update, { onConflict: 'setting_key' });

      setMessage({ type: 'success', text: 'Configuration webhook sauvegardée avec succès' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      setTestResult({ success: false, message: 'Aucune URL configurée' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const testData = {
        message: 'Test de connexion depuis Le Marché Public.fr',
        userId: user?.id || 'test',
        userEmail: user?.email || 'test@example.com',
        context: 'test',
        timestamp: new Date().toISOString(),
        file_attached: false,
        file_name: null,
        file_size: null,
        file_type: null,
        file_content: null
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        setTestResult({ 
          success: true, 
          message: `Connexion réussie (${response.status} ${response.statusText})` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `Erreur HTTP: ${response.status} ${response.statusText}` 
        });
      }
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        message: error.message || 'Erreur de connexion' 
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-6`}></div>
          <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg">
            <Webhook className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Configuration Webhook</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>URL du webhook pour l'agent de sourcing</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="webhookUrl" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              URL du webhook *
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Link className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  id="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://votre-serveur.app.n8n.cloud/webhook/..."
                  className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                />
              </div>
              <button
                onClick={handleTestWebhook}
                disabled={testing || !webhookUrl.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Test...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    Tester
                  </>
                )}
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
              URL complète du webhook N8n pour l'agent de sourcing
            </p>
          </div>

          {/* Résultat du test */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success
                ? isDark ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                : isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {testResult.success ? 'Test réussi' : 'Test échoué'}
                </span>
              </div>
              <p className="text-sm mt-1">{testResult.message}</p>
            </div>
          )}

          {/* Informations d'aide */}
          <div className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 border transition-colors duration-200`}>
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${isDark ? 'bg-blue-800' : 'bg-blue-100'}`}>
                <Webhook className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h4 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-1`}>
                  Configuration N8n
                </h4>
                <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} space-y-2`}>
                  <p>• L'agent de sourcing enverra les messages utilisateur vers cette URL</p>
                  <p>• Le webhook recevra les données au format JSON avec le message et les fichiers</p>
                  <p>• La réponse du webhook sera affichée dans l'interface de chat</p>
                  <p>• URL actuelle configurée : {webhookUrl || 'Aucune'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? isDark ? 'bg-green-900/20 border border-green-700 text-green-400' : 'bg-green-50 border border-green-200 text-green-700'
            : isDark ? 'bg-red-900/20 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </button>
      </div>
    </div>
  );
};