import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageSquare,
  Send,
  Loader,
  Sparkles,
  Trash2,
  BookOpen,
  FileText,
  X,
  RefreshCw,
  AlertCircle,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { openRouterService } from '../../lib/openrouter';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
  retryData?: {
    prompt: string;
    systemPrompt: string;
  };
}

interface Market {
  id: string;
  title: string;
  client: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadMarkets();
      loadConversationHistory();
    }
  }, [user]);

  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return;
    }

    console.log('Admin status check:', data);
    setIsAdmin(data?.is_admin || false);
  };

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      message,
      type
    }]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMarkets = async () => {
    if (!user) {
      console.log('No user, skipping market load');
      addLog('Aucun utilisateur connecté', 'error');
      return;
    }

    console.log('Loading markets for user:', user.id);
    addLog(`Chargement des marchés pour l'utilisateur ${user.id}`, 'info');
    const { data, error } = await supabase
      .from('markets')
      .select('id, title, client')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading markets:', error);
      addLog(`Erreur lors du chargement des marchés: ${error.message}`, 'error');
      return;
    }

    console.log('Markets loaded:', data);
    addLog(`${data?.length || 0} marchés chargés`, 'success');
    setMarkets(data || []);
  };

  const loadConversationHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('assistant_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }

    if (data && data.length > 0) {
      const loadedMessages = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(loadedMessages);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user) return;

    await supabase
      .from('assistant_conversations')
      .insert({
        user_id: user.id,
        role,
        content
      });
  };

  const buildContextFromMarkets = async (): Promise<string> => {
    if (selectedMarkets.length === 0) {
      console.log('No markets selected for context');
      addLog('Aucun marché sélectionné pour le contexte', 'info');
      return '';
    }

    console.log('Building context for markets:', selectedMarkets);
    addLog(`Construction du contexte pour ${selectedMarkets.length} marché(s)`, 'info');

    const { data, error } = await supabase
      .from('markets')
      .select(`
        id,
        title,
        client,
        description,
        deadline,
        amount,
        location,
        market_documents (
          name,
          extracted_content,
          analysis_result
        ),
        technical_memories (
          sections (
            title,
            content
          )
        )
      `)
      .in('id', selectedMarkets);

    if (error) {
      console.error('Error fetching market context:', error);
      addLog(`Erreur lors de la récupération du contexte: ${error.message}`, 'error');
      return '';
    }

    if (!data || data.length === 0) {
      console.log('No market data found');
      addLog('Aucune donnée de marché trouvée', 'error');
      return '';
    }

    console.log('Market data retrieved:', data.length, 'markets');
    addLog(`Contexte récupéré: ${data.length} marché(s)`, 'success');

    let context = '\n\n=== CONTEXTE DES MARCHÉS SÉLECTIONNÉS ===\n\n';

    for (const market of data) {
      context += `## Marché: ${market.title}\n`;
      context += `- Client: ${market.client}\n`;
      if (market.description) context += `- Description: ${market.description}\n`;
      if (market.deadline) context += `- Date limite: ${new Date(market.deadline).toLocaleDateString('fr-FR')}\n`;
      if (market.amount) context += `- Montant estimé: ${market.amount}€\n`;
      if (market.location) context += `- Localisation: ${market.location}\n`;

      // Documents d'appel d'offres
      if (market.market_documents && market.market_documents.length > 0) {
        context += '\n### Documents du marché:\n';
        for (const doc of market.market_documents) {
          context += `- **${doc.name}**\n`;
          if (doc.extracted_content) {
            context += `  Contenu: ${doc.extracted_content.substring(0, 800)}...\n`;
          }
          if (doc.analysis_result) {
            context += `  Analyse: ${doc.analysis_result.substring(0, 800)}...\n`;
          }
        }
      }

      // Mémoire technique
      if (market.technical_memories && market.technical_memories.length > 0) {
        const memory = market.technical_memories[0];
        if (memory.sections && memory.sections.length > 0) {
          context += '\n### Sections du mémoire technique:\n';
          for (const section of memory.sections) {
            context += `#### ${section.title}\n`;
            if (section.content) {
              context += `${section.content.substring(0, 500)}...\n\n`;
            }
          }
        }
      }

      context += '\n---\n\n';
    }

    return context;
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage('user', userMessage.content);
    setInput('');
    setLoading(true);

    try {
      addLog('Début de la génération de réponse', 'info');
      const marketContext = await buildContextFromMarkets();
      console.log('Market context:', marketContext);
      addLog(`Contexte construit: ${marketContext.length} caractères`, marketContext ? 'success' : 'info');

      const conversationHistory = messages
        .slice(-10)
        .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = conversationHistory
        ? `${conversationHistory}\n\nUtilisateur: ${userMessage.content}`
        : `Utilisateur: ${userMessage.content}`;

      const systemPrompt = `Tu es un assistant virtuel spécialisé dans les marchés publics et la rédaction de mémoires techniques.
Tu aides les utilisateurs à analyser des marchés, rédiger des réponses, comprendre les critères et optimiser leurs candidatures.
Sois professionnel, précis et constructif. Si des contextes de marchés sont fournis, utilise-les pour donner des réponses personnalisées.

${marketContext ? `${marketContext}\n\nIMPORTANT: Utilise les informations ci-dessus sur les marchés pour personnaliser tes réponses et donner des conseils spécifiques au contexte fourni.` : ''}`;

      console.log('System prompt with context:', systemPrompt);
      addLog(`System prompt: ${systemPrompt.length} caractères`, 'info');
      addLog(`Prompt utilisateur: ${fullPrompt.length} caractères`, 'info');

      addLog('Appel à l\'API OpenRouter...', 'info');
      const response = await openRouterService.generateContent(
        fullPrompt,
        systemPrompt,
        {
          temperature: 0.7,
          maxTokens: 4000
        }
      );
      addLog(`Réponse reçue: ${response.length} caractères`, 'success');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage('assistant', assistantMessage.content);

    } catch (error) {
      console.error('Error sending message:', error);
      addLog(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Désolé, une erreur s'est produite: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date(),
        error: true,
        retryData: {
          prompt: fullPrompt,
          systemPrompt
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = async () => {
    if (!confirm('Voulez-vous vraiment effacer toute la conversation ?')) return;

    if (user) {
      await supabase
        .from('assistant_conversations')
        .delete()
        .eq('user_id', user.id);
    }

    setMessages([]);
  };

  const toggleMarketSelection = (marketId: string) => {
    setSelectedMarkets(prev => {
      if (prev.includes(marketId)) {
        return prev.filter(id => id !== marketId);
      } else {
        return [...prev, marketId];
      }
    });
  };

  const handleRetry = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.error || !message.retryData) return;

    // Supprimer le message d'erreur
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setLoading(true);

    try {
      const response = await openRouterService.generateContent(
        message.retryData.prompt,
        message.retryData.systemPrompt,
        {
          temperature: 0.7,
          maxTokens: 4000
        }
      );

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage('assistant', assistantMessage.content);

    } catch (error) {
      console.error('Error retrying message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Désolé, une erreur s'est produite lors de la nouvelle tentative: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date(),
        error: true,
        retryData: message.retryData
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Assistant Virtuel IA
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Propulsé par OpenRouter
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                console.log('Toggle market selector, current:', showMarketSelector, 'markets:', markets.length);
                setShowMarketSelector(!showMarketSelector);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMarkets.length > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Contextes</span>
              {selectedMarkets.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  'bg-white/20'
                }`}>
                  {selectedMarkets.length}
                </span>
              )}
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowLogs(!showLogs)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showLogs
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Logs</span>
                {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            <button
              onClick={handleClearConversation}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-red-900/20 hover:text-red-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
              }`}
              title="Effacer la conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Market Selector */}
        {showMarketSelector && (
          <div className={`mt-4 p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sélectionner des marchés comme contexte
              </h3>
              <button
                onClick={() => setShowMarketSelector(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {markets.map(market => (
                <label
                  key={market.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedMarkets.includes(market.id)
                      ? isDark
                        ? 'bg-purple-900/30 border-2 border-purple-500'
                        : 'bg-purple-50 border-2 border-purple-500'
                      : isDark
                        ? 'bg-gray-800 border-2 border-transparent hover:bg-gray-750'
                        : 'bg-white border-2 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMarkets.includes(market.id)}
                    onChange={() => toggleMarketSelection(market.id)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <FileText className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {market.title}
                    </div>
                    <div className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {market.client}
                    </div>
                  </div>
                </label>
              ))}
              {markets.length === 0 && (
                <p className={`col-span-2 text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aucun marché disponible
                </p>
              )}
            </div>
          </div>
        )}

        {/* Logs Panel */}
        {isAdmin && showLogs && (
          <div className={`mt-4 p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Terminal className="w-4 h-4" />
                Logs de débogage
              </h3>
              <button
                onClick={() => setLogs([])}
                className={`text-xs px-3 py-1 rounded-lg ${
                  isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Effacer
              </button>
            </div>
            <div className={`max-h-64 overflow-y-auto space-y-1 font-mono text-xs ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } p-3 rounded-lg`}>
              {logs.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Aucun log disponible
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-green-400'
                        : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>[{log.timestamp}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
                <MessageSquare className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bienvenue sur l'Assistant Virtuel
                </h3>
                <p className={`text-base max-w-lg mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Posez-moi des questions sur les marchés publics, demandez de l'aide pour rédiger vos mémoires techniques ou analysez vos documents.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    Analyse de marchés
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Analysez les appels d'offres et identifiez les critères clés
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    Rédaction assistée
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Obtenez de l'aide pour rédiger vos mémoires techniques
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    Conseils personnalisés
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Recevez des recommandations adaptées à vos marchés
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-md ${
                  message.error
                    ? isDark
                      ? 'bg-red-900/20 border-2 border-red-500 text-gray-100'
                      : 'bg-red-50 border-2 border-red-300 text-gray-900'
                    : message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-white text-gray-900'
                }`}
              >
                {message.error && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-400/30">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      Erreur de génération
                    </span>
                  </div>
                )}
                {message.role === 'assistant' ? (
                  <div className={`prose prose-sm max-w-none ${
                    isDark
                      ? 'prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-gray-100 prose-code:text-purple-400 prose-pre:bg-gray-900 prose-li:text-gray-300'
                      : 'prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-code:text-purple-600 prose-pre:bg-gray-100 prose-li:text-gray-800'
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div
                    className={`text-xs ${
                      message.role === 'user'
                        ? 'text-purple-200'
                        : isDark
                          ? 'text-gray-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {message.error && message.retryData && (
                    <button
                      onClick={() => handleRetry(message.id)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        loading
                          ? 'opacity-50 cursor-not-allowed'
                          : isDark
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      Réessayer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-5 py-3.5 shadow-md ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2">
                  <Loader className={`w-4 h-4 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    L'assistant réfléchit...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-6 py-4`}>
        <div className="max-w-4xl mx-auto">
          {/* Active Context Indicator */}
          {selectedMarkets.length > 0 && (
            <div className={`mb-3 flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>Contexte actif:</span>
              <div className="flex gap-2 flex-wrap">
                {markets
                  .filter(m => selectedMarkets.includes(m.id))
                  .map(market => (
                    <span
                      key={market.id}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDark
                          ? 'bg-purple-900/30 text-purple-300'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {market.title}
                    </span>
                  ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Posez votre question..."
              disabled={loading}
              className={`flex-1 px-5 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`px-8 py-3.5 rounded-xl font-medium transition-all ${
                loading || !input.trim()
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
