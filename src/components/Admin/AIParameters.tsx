import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Thermometer, Hash, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

export const AIParameters: React.FC = () => {
  const { isDark } = useTheme();
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(300000);
  const [topP, setTopP] = useState<number>(1.0);
  const [reasoningEffort, setReasoningEffort] = useState<string>('medium');
  const [reasoningMaxTokens, setReasoningMaxTokens] = useState<number>(2000);
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(true);
  const [reasoningExclude, setReasoningExclude] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['temperature', 'max_tokens', 'top_p', 'reasoning_effort', 'reasoning_max_tokens', 'reasoning_enabled', 'reasoning_exclude']);

      if (error) throw error;

      const settings = data?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>) || {};

      setTemperature(settings.temperature || 0.7);
      setMaxTokens(settings.max_tokens || 300000);
      setTopP(settings.top_p || 1.0);
      setReasoningEffort(settings.reasoning_effort || 'medium');
      setReasoningMaxTokens(settings.reasoning_max_tokens || 2000);
      setReasoningEnabled(settings.reasoning_enabled !== undefined ? settings.reasoning_enabled : true);
      setReasoningExclude(settings.reasoning_exclude !== undefined ? settings.reasoning_exclude : false);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updates = [
        {
          setting_key: 'temperature',
          setting_value: temperature,
          description: 'Température de génération (0.0 - 2.0)'
        },
        {
          setting_key: 'max_tokens',
          setting_value: maxTokens,
          description: 'Nombre maximum de tokens'
        },
        {
          setting_key: 'top_p',
          setting_value: topP,
          description: 'Top P pour le sampling (0.0 - 1.0)'
        },
        {
          setting_key: 'reasoning_effort',
          setting_value: reasoningEffort,
          description: 'Niveau d\'effort de raisonnement (low, medium, high)'
        },
        {
          setting_key: 'reasoning_max_tokens',
          setting_value: reasoningMaxTokens,
          description: 'Nombre maximum de tokens pour le raisonnement'
        },
        {
          setting_key: 'reasoning_enabled',
          setting_value: reasoningEnabled,
          description: 'Activer le raisonnement avancé'
        },
        {
          setting_key: 'reasoning_exclude',
          setting_value: reasoningExclude,
          description: 'Exclure les tokens de raisonnement de la réponse'
        }
      ];

      for (const update of updates) {
        await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });
      }

      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-6`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl mb-6`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Paramètres de génération IA</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Configurez le comportement des modèles IA</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Temperature */}
          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 transition-colors duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Température</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contrôle la créativité du modèle (0.0 = déterministe, 2.0 = très créatif)</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-8`}>0.0</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className={`flex-1 h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-8`}>2.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Valeur actuelle:</span>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                    className={`w-20 px-3 py-1 text-sm border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                  />
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {temperature < 0.3 ? 'Très conservateur' : 
                   temperature < 0.7 ? 'Équilibré' : 
                   temperature < 1.2 ? 'Créatif' : 'Très créatif'}
                </div>
              </div>
            </div>
          </div>

          {/* Max Tokens */}
          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 transition-colors duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Nombre maximum de tokens</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Limite la longueur de la réponse générée</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-12`}>1000</span>
                <input
                  type="range"
                  min="1000"
                  max="300000"
                  step="500"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className={`flex-1 h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-16`}>300k</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Valeur actuelle:</span>
                  <input
                    type="number"
                    min="1000"
                    max="300000"
                    step="5000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1000)}
                    className={`w-24 px-3 py-1 text-sm border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ~{Math.round(maxTokens * 0.75).toLocaleString('fr-FR')} mots environ
                </div>
              </div>
            </div>
          </div>

          {/* Top P */}
          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 transition-colors duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Top P (Nucleus Sampling)</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contrôle la diversité en limitant aux tokens les plus probables</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-8`}>0.1</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className={`flex-1 h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-8`}>1.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Valeur actuelle:</span>
                  <input
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value) || 0.1)}
                    className={`w-20 px-3 py-1 text-sm border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {topP < 0.3 ? 'Très focalisé' : 
                   topP < 0.7 ? 'Modéré' : 
                   topP < 0.9 ? 'Diversifié' : 'Maximum'}
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Parameters */}
          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 transition-colors duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Paramètres de raisonnement</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Configuration du raisonnement avancé des modèles IA</p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {/* Reasoning Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Raisonnement activé</h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active le mode de raisonnement avancé</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reasoningEnabled}
                    onChange={(e) => setReasoningEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600`}></div>
                </label>
              </div>

              {reasoningEnabled && (
                <>
                  {/* Reasoning Effort */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Niveau d'effort de raisonnement
                    </label>
                    <select
                      value={reasoningEffort}
                      onChange={(e) => setReasoningEffort(e.target.value)}
                      className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="low">Faible (Low) - Rapide</option>
                      <option value="medium">Moyen (Medium) - Équilibré</option>
                      <option value="high">Élevé (High) - Approfondi</option>
                    </select>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {reasoningEffort === 'low' ? 'Raisonnement rapide et direct' :
                       reasoningEffort === 'medium' ? 'Équilibre entre vitesse et profondeur' :
                       'Raisonnement approfondi et détaillé'}
                    </p>
                  </div>

                  {/* Reasoning Max Tokens */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Tokens maximum pour le raisonnement
                    </label>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-12`}>500</span>
                      <input
                        type="range"
                        min="500"
                        max="50000"
                        step="250"
                        value={reasoningMaxTokens}
                        onChange={(e) => setReasoningMaxTokens(parseInt(e.target.value))}
                        className={`flex-1 h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} w-16`}>50k</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Valeur actuelle:</span>
                        <input
                          type="number"
                          min="500"
                          max="50000"
                          step="250"
                          value={reasoningMaxTokens}
                          onChange={(e) => setReasoningMaxTokens(parseInt(e.target.value) || 500)}
                          className={`w-20 px-3 py-1 text-sm border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Limite de tokens pour la phase de raisonnement
                      </div>
                    </div>
                  </div>

                  {/* Reasoning Exclude */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Exclure les tokens de raisonnement</h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ne pas inclure le processus de raisonnement dans la réponse finale</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reasoningExclude}
                        onChange={(e) => setReasoningExclude(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600`}></div>
                    </label>
                  </div>
                </>
              )}
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
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  );
};