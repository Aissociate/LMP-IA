import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, Edit3, Plus, Trash2, FileText, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminPrompt } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const PromptManager: React.FC = () => {
  const { isDark } = useTheme();
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<AdminPrompt | null>(null);
  const [newPrompt, setNewPrompt] = useState<Partial<AdminPrompt>>({
    prompt_type: 'document_analysis',
    section_key: '',
    prompt_content: '',
    description: '',
    is_active: true
  });
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_prompts')
        .select('*')
        .order('prompt_type', { ascending: true })
        .order('section_key', { ascending: true });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async (prompt: AdminPrompt) => {
    try {
      const { error } = await supabase
        .from('admin_prompts')
        .update({
          prompt_content: prompt.prompt_content,
          description: prompt.description,
          is_active: prompt.is_active
        })
        .eq('id', prompt.id);

      if (error) throw error;

      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleCreatePrompt = async () => {
    if (!newPrompt.prompt_content?.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_prompts')
        .insert([newPrompt]);

      if (error) throw error;

      setNewPrompt({
        prompt_type: 'document_analysis',
        section_key: '',
        prompt_content: '',
        description: '',
        is_active: true
      });
      setShowNewForm(false);
      fetchPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce prompt ?')) return;

    try {
      const { error } = await supabase
        .from('admin_prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;
      fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const promptTypeLabels: Record<string, string> = {
    document_analysis: 'Analyse de documents',
    technical_memory: 'Mémoire technique',
    assistant: 'Assistant IA'
  };

  const getPromptIcon = (type: string) => {
    return type === 'document_analysis' ? FileText : BookOpen;
  };

  const getPromptColor = (type: string) => {
    if (type === 'document_analysis') return 'purple';
    if (type === 'technical_memory') return 'blue';
    return 'green';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-6`}></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl mb-4`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gestion des prompts</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Configurez les prompts utilisés par l'IA</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Nouveau prompt
          </button>
        </div>

        {/* Formulaire nouveau prompt */}
        {showNewForm && (
          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 mb-6 transition-colors duration-200`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Créer un nouveau prompt</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Type de prompt
                  </label>
                  <select
                    value={newPrompt.prompt_type}
                    onChange={(e) => setNewPrompt({ ...newPrompt, prompt_type: e.target.value as any })}
                    className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    <option value="document_analysis">Analyse de documents</option>
                    <option value="technical_memory">Mémoire technique</option>
                    <option value="assistant">Assistant IA</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Clé de section (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newPrompt.section_key || ''}
                    onChange={(e) => setNewPrompt({ ...newPrompt, section_key: e.target.value })}
                    placeholder="ex: presentation, methodologie..."
                    className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Description
                </label>
                <input
                  type="text"
                  value={newPrompt.description || ''}
                  onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
                  placeholder="Description du prompt..."
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Contenu du prompt
                </label>
                <textarea
                  rows={4}
                  value={newPrompt.prompt_content || ''}
                  onChange={(e) => setNewPrompt({ ...newPrompt, prompt_content: e.target.value })}
                  placeholder="Saisissez le prompt ici..."
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none`}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewForm(false)}
                  className={`px-4 py-2 ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreatePrompt}
                  disabled={!newPrompt.prompt_content?.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des prompts */}
        <div className="space-y-4">
          {prompts.map((prompt) => {
            const Icon = getPromptIcon(prompt.prompt_type);
            const color = getPromptColor(prompt.prompt_type);
            const isEditing = editingPrompt?.id === prompt.id;
            
            return (
              <div
                key={prompt.id}
                className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                  prompt.is_active 
                    ? isDark ? 'border-gray-700' : 'border-gray-200'
                    : isDark ? 'border-gray-800 bg-gray-800/50 opacity-75' : 'border-gray-100 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      color === 'purple' 
                        ? isDark ? 'bg-purple-900/20' : 'bg-purple-100'
                        : isDark ? 'bg-blue-900/20' : 'bg-blue-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        color === 'purple' 
                          ? isDark ? 'text-purple-400' : 'text-purple-600'
                          : isDark ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {promptTypeLabels[prompt.prompt_type] || prompt.prompt_type}
                        </h3>
                        {prompt.section_key && (
                          <span className={`px-2 py-1 ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} text-xs rounded-full`}>
                            {prompt.section_key}
                          </span>
                        )}
                        {!prompt.is_active && (
                          <span className={`px-2 py-1 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'} text-xs rounded-full`}>
                            Inactif
                          </span>
                        )}
                      </div>
                      {prompt.description && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{prompt.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPrompt(isEditing ? null : prompt)}
                      className={`${isDark ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'} transition-colors`}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className={`${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition-colors`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={editingPrompt.description || ''}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                        className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Contenu du prompt
                      </label>
                      <textarea
                        rows={6}
                        value={editingPrompt.prompt_content}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_content: e.target.value })}
                        className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPrompt.is_active}
                          onChange={(e) => setEditingPrompt({ ...editingPrompt, is_active: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Prompt actif</span>
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingPrompt(null)}
                          className={`px-4 py-2 ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSavePrompt(editingPrompt)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Save className="w-4 h-4" />
                          Sauvegarder
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 transition-colors duration-200`}>
                    <pre className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap font-mono`}>
                      {prompt.prompt_content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {prompts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucun prompt configuré</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Commencez par créer votre premier prompt</p>
          </div>
        )}
      </div>
    </div>
  );
};