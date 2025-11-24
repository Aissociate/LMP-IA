import React, { useState, useEffect } from 'react';
import { Upload, Search, FileText, Download, Building2, MessageCircle, Send, Paperclip, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { documentExtractor } from '../../lib/documentExtractor';
import { BPU, Market } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { SecurityValidation } from '../../lib/securityValidation';

interface EnhancedBPU extends BPU {
  market_title?: string;
  market_reference?: string;
  source: 'direct' | 'market';
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  attachment?: {
    name: string;
    size: number;
  };
}

// Fonction pour convertir le Markdown en HTML
const convertMarkdownToHtml = (text: string): string => {
  return text
    // Titres
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    
    // Texte en gras
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    
    // Texte en italique
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Code inline
    .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Blocs de code
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto my-2"><code class="text-sm font-mono">$1</code></pre>')
    
    // Listes à puces
    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/(<li class="ml-4 mb-1">.*<\/li>)/s, '<ul class="my-2">$1</ul>')
    
    // Listes numérotées
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
    .replace(/(<li class="ml-4 mb-1">.*<\/li>)/s, '<ol class="my-2 list-decimal list-inside">$1</ol>')
    
    // Liens
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Sauts de ligne
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
};

export const Sourcing: React.FC = () => {
  const { isDark } = useTheme();
  const [bpus, setBpus] = useState<EnhancedBPU[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBPUs();
  }, []);

  const fetchBPUs = async () => {
    try {
      // Récupérer les BPU uploadés directement
      const { data: directBPUs, error: directError } = await supabase
        .from('bpus')
        .select('*')
        .order('created_at', { ascending: false });

      if (directError) throw directError;

      // Récupérer les documents des marchés qui sont des BPU
      const { data: marketBPUs, error: marketError } = await supabase
        .from('market_documents')
        .select(`
          id,
          name,
          file_path,
          file_size,
          user_id,
          created_at,
          markets!inner(
            title,
            reference
          )
        `)
        .or('name.ilike.%bpu%,name.ilike.%bordereau%,name.ilike.%prix%,file_type.ilike.%sheet%,file_type.ilike.%excel%')
        .order('created_at', { ascending: false });

      if (marketError) throw marketError;

      // Combiner les deux sources
      const enhancedDirectBPUs: EnhancedBPU[] = (directBPUs || []).map(bpu => ({
        ...bpu,
        source: 'direct' as const
      }));

      const enhancedMarketBPUs: EnhancedBPU[] = (marketBPUs || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        file_path: doc.file_path,
        file_size: doc.file_size,
        user_id: doc.user_id,
        created_at: doc.created_at,
        market_title: doc.markets.title,
        market_reference: doc.markets.reference,
        source: 'market' as const
      }));

      setBpus([...enhancedDirectBPUs, ...enhancedMarketBPUs]);
    } catch (error) {
      console.error('Error fetching BPUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validations de sécurité
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    if (!SecurityValidation.validateFileType(file.name, allowedTypes)) {
      alert('Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, TXT');
      e.target.value = '';
      return;
    }
    
    if (!SecurityValidation.validateFileSize(file.size, 10)) { // 10MB max
      alert('Fichier trop volumineux (maximum 10MB)');
      e.target.value = '';
      return;
    }
    console.log('Starting BPU upload for user:', user.id);
    setUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `bpus/${user.id}/${fileName}`;

      console.log('Uploading BPU to path:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('BPU uploaded successfully, inserting into database...');

      const { error: dbError } = await supabase.from('bpus').insert({
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        user_id: user.id
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage.from('uploads').remove([filePath]);
        throw dbError;
      }

      console.log('BPU upload and database insert completed successfully');

      fetchBPUs();
    } catch (error) {
      console.error('Error uploading BPU:', error);
      alert(`Erreur lors de l'upload du BPU: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !chatAttachment) return;

    console.log('[Sourcing] 🚀 Début handleSendMessage');
    console.log('[Sourcing] 📝 Message:', newMessage.trim());
    console.log('[Sourcing] 📎 Attachement:', chatAttachment ? {
      name: chatAttachment.name,
      size: chatAttachment.size,
      type: chatAttachment.type
    } : 'AUCUN');

    // Récupérer l'URL webhook depuis la configuration admin
    let webhookUrl = '';
    try {
      const { data: webhookSetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'sourcing_webhook_url')
        .maybeSingle();
      
      webhookUrl = webhookSetting?.setting_value || '';
    } catch (configError) {
      console.error('[Sourcing] Erreur récupération config webhook:', configError);
    }
    
    if (!webhookUrl) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '❌ Configuration manquante: L\'URL du webhook de sourcing n\'est pas configurée.\n\nPour configurer le webhook:\n1. Allez dans Paramètres > Intégrations\n2. Ajoutez l\'URL de votre webhook N8n\n3. Testez la connexion\n4. Sauvegardez la configuration',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Vérifier que l'URL webhook est valide
    try {
      new URL(webhookUrl);
    } catch (urlError) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '❌ URL webhook invalide: L\'URL configurée dans les paramètres n\'est pas valide.\n\nVérifiez le format de l\'URL dans Paramètres > Intégrations',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsSending(true);

    // Ajouter le message utilisateur immédiatement
    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      timestamp: new Date(),
      attachment: chatAttachment ? {
        name: chatAttachment.name,
        size: chatAttachment.size
      } : undefined
    };

    setChatMessages(prev => [...prev, message]);
    const currentMessage = newMessage.trim();
    setNewMessage('');
    const currentAttachment = chatAttachment;
    setChatAttachment(null);

    console.log('[Sourcing] 💾 Variables sauvegardées:');
    console.log('[Sourcing]   - currentMessage:', currentMessage);
    console.log('[Sourcing]   - currentAttachment:', currentAttachment ? {
      name: currentAttachment.name,
      size: currentAttachment.size,
      type: currentAttachment.type
    } : 'AUCUN');

    try {
      // Préparer les données pour le webhook dans le format requis
      const webhookData: any = {
        // Catégorie MESSAGE
        message: currentMessage,
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        context: 'sourcing',
        timestamp: new Date().toISOString(),
        
        // Catégorie FICHIER (vide par défaut)
        file_attached: false,
        file_name: null,
        file_size: null,
        file_type: null,
        file_content: null
      };
      
      // Si un fichier est attaché, extraire son contenu
      if (currentAttachment) {
        try {
          console.log(`[Sourcing] 🔍 Extraction du fichier PDF/Document: ${currentAttachment.name}`);
          console.log(`[Sourcing]   - Type: ${currentAttachment.type}`);
          console.log(`[Sourcing]   - Taille: ${Math.round(currentAttachment.size / 1024)} KB`);
          
          // Extraire le contenu textuel du fichier
          const extractionResult = await documentExtractor.extractContent(
            currentAttachment, 
            currentAttachment.name
          );
          
          // Ajouter les données du fichier à la catégorie FICHIER
          webhookData.file_attached = true;
          webhookData.file_name = currentAttachment.name;
          webhookData.file_size = currentAttachment.size;
          webhookData.file_type = currentAttachment.type || 'unknown';
          webhookData.file_content = extractionResult.text;
          
          // Validation du contenu extrait pour les PDF
          if (currentAttachment.type === 'application/pdf' && extractionResult.text.length < 50) {
            console.warn('[Sourcing] ⚠️ PDF extrait très court, possible problème d\'extraction');
          }
          
          console.log(`[Sourcing] ✅ Fichier extrait: ${extractionResult.text.length} caractères`);
          console.log(`[Sourcing]   - Aperçu: "${extractionResult.text.substring(0, 200)}..."`);
          
        } catch (extractError) {
          console.error('[Sourcing] ❌ Erreur extraction fichier:', extractError);
          
          // En cas d'erreur d'extraction, envoyer les métadonnées de base
          webhookData.file_attached = true;
          webhookData.file_name = currentAttachment.name;
          webhookData.file_size = currentAttachment.size;
          webhookData.file_type = currentAttachment.type || 'unknown';
          webhookData.file_content = `ERREUR D'EXTRACTION PDF/DOC: ${extractError.message}. Fichier: ${currentAttachment.name} (${currentAttachment.type})`;
          
          console.log(`[Sourcing] ❌ Détails erreur extraction:`, extractError);
        }
      } else {
        console.log('[Sourcing] ℹ️ Aucun fichier attaché à traiter');
      }

      console.log('[Sourcing] 📦 Données webhook finales:', {
        ...webhookData,
        file_content: webhookData.file_content ? `${webhookData.file_content.substring(0, 100)}...` : null
      });

      // Appel au webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorData}`);
      }

      // Vérifier le Content-Type et parser la réponse de manière sécurisée
      let data;
     
     // Lire le body une seule fois en tant que texte
     const responseText = await response.text();
     
     // Tenter de parser comme JSON, sinon utiliser le texte brut
     try {
       data = JSON.parse(responseText);
     } catch (jsonError) {
       console.warn('Réponse non-JSON reçue, utilisation du texte brut');
       data = { message: responseText };
     }
      
      // Ajouter la réponse de l'IA
      let responseContent;
      if (data.response) {
        responseContent = data.response;
      } else if (data.output) {
        responseContent = data.output;
      } else if (data.message) {
        responseContent = data.message;
      } else if (data.text) {
        responseContent = data.text;
      } else if (data.content) {
        responseContent = data.content;
      } else if (typeof data === 'string') {
        responseContent = data;
      } else {
        // Si c'est un tableau avec des objets ayant une propriété output
        if (Array.isArray(data) && data.length > 0 && data[0].output) {
          responseContent = data[0].output;
        } else {
          // Afficher la réponse brute pour débugger
          responseContent = JSON.stringify(data, null, 2);
        }
      }
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      
      // Message d'erreur plus informatif
      let errorText = 'Erreur de connexion inconnue';
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        errorText = `Impossible de contacter le serveur webhook.\n\n🔧 Solutions possibles:\n• Vérifiez que le serveur webhook est démarré\n• Vérifiez l'URL: ${webhookUrl}\n• Vérifiez votre connexion internet\n• Vérifiez les paramètres CORS du serveur`;
      } else {
        errorText = error.message;
      }
      
      // Ajouter un message d'erreur
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${errorText}`,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChatAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validations de sécurité
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'];
      if (!SecurityValidation.validateFileType(file.name, allowedTypes)) {
        alert('Type de fichier non autorisé');
        e.target.value = '';
        return;
      }
      
      if (!SecurityValidation.validateFileSize(file.size, 5)) { // 5MB max pour chat
        alert('Fichier trop volumineux (maximum 5MB)');
        e.target.value = '';
        return;
      }
    }
    
    console.log('[Sourcing] 📎 handleChatAttachment appelé');
    console.log('[Sourcing] 📁 Fichier sélectionné:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'AUCUN');
    
    if (file) {
      setChatAttachment(file);
      console.log('[Sourcing] ✅ setChatAttachment appelé avec le fichier');
    } else {
      console.log('[Sourcing] ❌ Aucun fichier à attacher');
    }
  };

  const removeChatAttachment = () => {
    console.log('[Sourcing] 🗑️ Suppression de l\'attachement');
    setChatAttachment(null);
  };

  const filteredBpus = bpus.filter(bpu =>
    bpu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse space-y-6">
          <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}></div>
          <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
          <div className={`h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assistant virtuel</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Assistant IA pour le sourcing et les marchés publics</p>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 mt-8 transition-colors duration-200`}>
        <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assistant virtuel IA</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Posez vos questions sur les marchés publics et le sourcing</p>
            </div>
          </div>
          <div className={`px-3 py-1 ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'} rounded-full text-sm font-medium`}>
            Connecté
          </div>
        </div>

        <div className={`h-96 overflow-y-auto p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-lg mb-6`}>
          {chatMessages.length === 0 ? (
            <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-16`}>
              <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Assistant IA prêt</h3>
              <p className="text-sm mb-2">Posez vos questions sur les marchés publics, les BPU, ou le sourcing</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Vous pouvez également joindre des documents PDF ou Word</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`rounded-lg p-4 border ${
                  message.content.startsWith('❌') 
                    ? isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                    : message.id.endsWith('1') 
                    ? isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'
                    : isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  {message.content && (
                    message.content.startsWith('❌') 
                      ? (
                        <p className={`mb-2 ${
                          message.content.startsWith('❌') 
                            ? isDark ? 'text-red-300' : 'text-red-700'
                            : message.id.endsWith('1') 
                            ? isDark ? 'text-orange-300' : 'text-orange-700'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>{message.content}</p>
                      ) : (
                        <div 
                          className={`mb-2 prose prose-sm max-w-none ${
                            message.content.startsWith('❌') 
                              ? isDark ? 'text-red-300' : 'text-red-700'
                              : message.id.endsWith('1') 
                              ? isDark ? 'text-orange-300' : 'text-orange-700'
                              : isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: convertMarkdownToHtml(message.content)
                          }}
                        />
                      )
                  )}
                  {message.attachment && (
                    <div className={`flex items-center gap-2 ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'} rounded p-3 mb-2`}>
                      <Paperclip className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>{message.attachment.name}</span>
                      <span className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                        ({Math.round(message.attachment.size / 1024)} KB)
                      </span>
                    </div>
                  )}
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              ))}
              {isSending && (
                <div className={`${isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'} rounded-lg p-4 border`}>
                  <div className="flex items-center gap-3">
                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${isDark ? 'border-orange-400' : 'border-orange-600'}`}></div>
                    <p className={`${isDark ? 'text-orange-300' : 'text-orange-700'} font-medium`}>Assistant en cours de réflexion...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {chatAttachment && (
            <div className={`flex items-center gap-3 p-3 ${isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'} rounded-lg border`}>
              <Paperclip className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <div className="flex-1">
                <span className={`font-medium ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                  {chatAttachment.name}
                </span>
                <span className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-500'} ml-2`}>
                  ({Math.round(chatAttachment.size / 1024)} KB)
                  {chatAttachment.type === 'application/pdf' && ' • PDF'}
                </span>
              </div>
              <button
                onClick={removeChatAttachment}
                className={`${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition-colors p-1`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={2000}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message ou question sur les marchés publics..."
              className={`flex-1 px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-white focus:ring-orange-500 focus:border-orange-500'} rounded-lg focus:ring-2 transition-colors`}
            />
            <label className={`cursor-pointer ${isDark ? 'text-gray-500 hover:text-orange-400' : 'text-gray-400 hover:text-orange-600'} transition-colors p-3 rounded-lg hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`}>
              <input
                type="file"
                className="hidden"
                onChange={handleChatAttachment}
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              />
              <Paperclip className="w-5 h-5" />
            </label>
            <button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !chatAttachment) || isSending}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">
                {isSending ? 'Envoi...' : 'Envoyer'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};