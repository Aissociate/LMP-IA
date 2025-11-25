import React, { useState, useEffect } from 'react';
import { Brain, Save, Key, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminSetting } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface AIModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

// Liste des modèles disponibles via OpenRouter (sera enrichie plus tard)
const availableModels: AIModel[] = [
  {
    id: 'google/gemini-2.5-flash-lite-preview-09-2025',
    name: 'Gemini 2.5 Flash Lite Preview',
    description: 'Modèle Gemini 2.5 Flash Lite optimisé pour la vitesse et l\'efficacité',
    context_length: 1048576,
    pricing: { prompt: 0.0000005, completion: 0.000002 }
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    description: 'Nouveau modèle Gemini 3 Pro avec capacités avancées',
    context_length: 2097152,
    pricing: { prompt: 0.000002, completion: 0.000008 }
  }
];

export const AIModelSelector: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-4');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['selected_ai_model']);

      if (error) throw error;

      const settings = data?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>) || {};

      setSelectedModel(settings.selected_ai_model || 'google/gemini-2.5-flash-lite-preview-09-2025');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const update = {
        setting_key: 'selected_ai_model',
        setting_value: selectedModel,
        description: 'Modèle IA sélectionné'
      };

      await supabase
        .from('admin_settings')
        .upsert(update, { onConflict: 'setting_key' });

      setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Vérifier si la clé API est configurée dans .env
  const apiKeyConfigured = !!import.meta.env.VITE_OPENROUTER_API_KEY;
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-6`}></div>
          <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl mb-6`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Statut OpenRouter</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>État de la configuration API</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          apiKeyConfigured 
            ? isDark ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'
            : isDark ? 'border-red-700 bg-red-900/20' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              apiKeyConfigured ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className={`font-medium ${
                apiKeyConfigured 
                  ? isDark ? 'text-green-400' : 'text-green-800'
                  : isDark ? 'text-red-400' : 'text-red-800'
              }`}>
                {apiKeyConfigured 
                  ? 'Clé API OpenRouter configurée' 
                  : 'Clé API OpenRouter manquante'
                }
              </p>
              <p className={`text-sm ${
                apiKeyConfigured 
                  ? isDark ? 'text-green-300' : 'text-green-600'
                  : isDark ? 'text-red-300' : 'text-red-600'
              }`}>
                {apiKeyConfigured 
                  ? 'Variable VITE_OPENROUTER_API_KEY détectée dans .env'
                  : 'Ajoutez VITE_OPENROUTER_API_KEY dans votre fichier .env'
                }
              </p>
            </div>
          </div>
          
          {!apiKeyConfigured && (
            <div className={`mt-3 text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              <p><strong>Instructions :</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Obtenez votre clé API sur <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} underline`}>openrouter.ai/keys</a></li>
                <li>Ajoutez <code className={`${isDark ? 'bg-red-900/30' : 'bg-red-100'} px-1 rounded`}>VITE_OPENROUTER_API_KEY=your_key_here</code> dans votre fichier .env</li>
                <li>Redémarrez l'application</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sélection du modèle IA</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choisissez le modèle utilisé pour la génération</p>
          </div>
        </div>

        <div className="space-y-4">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedModel === model.id
                  ? isDark ? 'border-purple-500 bg-purple-900/20' : 'border-purple-200 bg-purple-50'
                  : isDark ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedModel === model.id
                      ? 'border-purple-500 bg-purple-500'
                      : isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    {selectedModel === model.id && (
                      <Check className="w-2 h-2 text-white m-0.5" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{model.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{model.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {model.context_length.toLocaleString()} tokens
                  </p>
                  {model.pricing && (
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      ${(model.pricing.prompt * 1000000).toFixed(2)}/M tokens
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </button>
      </div>
    </div>
  );
};