import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Brain,
  Loader,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MarketDocument } from '../../types';
import { openRouterService } from '../../lib/openrouter';
import { documentExtractor } from '../../lib/documentExtractor';
import { SecurityValidation } from '../../lib/securityValidation';
import { apiSecurity, RATE_LIMITS } from '../../lib/apiSecurity';

interface DocumentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  marketTitle: string;
}

interface ExtendedMarketDocument extends MarketDocument {
  extracted_content?: string;
}

interface DocumentState {
  [documentId: string]: {
    isAnalysisCollapsed: boolean;
  };
}

const getErrorMessage = (error: any): string => {
  if (!error) return 'Erreur inconnue';
  
  if (error instanceof Error) {
    if (error.message && error.message.trim()) return error.message;
  }
  
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  
  if (typeof error === 'object' && error !== null) {
    if (error.message && typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
    
    if (error.error_description && typeof error.error_description === 'string') {
      return String(error.error_description);
    }
    if (error.error && typeof error.error === 'string') {
      return String(error.error);
    }
    if (error.details && typeof error.details === 'string') {
      return String(error.details);
    }
  }
  
  return 'Erreur inconnue - aucun message disponible';
};

const statusConfig = {
  pending: { label: 'En attente', icon: FileText, color: 'text-gray-600 bg-gray-50' },
  analyzing: { label: 'Analyse en cours', icon: Loader, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Analysé', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  error: { label: 'Erreur', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
};

export const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({
  isOpen,
  onClose,
  marketId,
  marketTitle
}) => {
  const [documents, setDocuments] = useState<ExtendedMarketDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analyzeAllLoading, setAnalyzeAllLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [documentStates, setDocumentStates] = useState<DocumentState>({});
  const { user, isAdmin } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const toggleAnalysisCollapse = (documentId: string) => {
    setDocumentStates(prev => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        isAnalysisCollapsed: prev[documentId]?.isAnalysisCollapsed === undefined
          ? false
          : !prev[documentId].isAnalysisCollapsed
      }
    }));
  };

  const isAnalysisExpanded = (documentId: string): boolean => {
    return documentStates[documentId]?.isAnalysisCollapsed === false;
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, marketId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_documents')
        .select('*, extracted_content')
        .eq('market_id', marketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    // Validation de sécurité
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];
    for (const file of files) {
      if (!SecurityValidation.validateFileType(file.name, allowedTypes)) {
        alert(`Fichier ${file.name}: type non autorisé`);
        e.target.value = '';
        return;
      }
      
      if (!SecurityValidation.validateFileSize(file.size, 25)) { // 25MB max
        alert(`Fichier ${file.name}: taille trop importante (max 25MB)`);
        e.target.value = '';
        return;
      }
    }
    
    // Rate limiting
    if (!apiSecurity.checkRateLimit(user.id, 'file_upload', RATE_LIMITS.FILE_UPLOAD)) {
      alert('Trop d\'uploads récents. Veuillez attendre une minute.');
      e.target.value = '';
      return;
    }
    setUploadLoading(true);
    addLog(`📤 Début d'upload et extraction de ${files.length} fichier(s)`);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        addLog(`📁 Traitement: ${file.name} (${Math.round(file.size / 1024)} KB)`);

        // Extraction IMMÉDIATE du contenu
        let extractedContent;
        try {
          addLog(`🔍 Extraction du texte en cours...`);
          extractedContent = await documentExtractor.extractContent(file, file.name);
          addLog(`✅ Texte extrait: ${extractedContent.text.length} caractères`);
          
          if (!extractedContent.text || extractedContent.text.trim().length < 10) {
            throw new Error('Contenu extrait insuffisant ou vide');
          }
        } catch (extractError) {
          addLog(`❌ Erreur extraction: ${extractError.message}`);
          throw new Error(`Impossible d'extraire le texte: ${extractError.message}`);
        }

        // Enregistrement DIRECT en base avec le contenu extrait
        const { error: dbError } = await supabase.from('market_documents').insert({
          market_id: marketId,
          name: file.name,
          file_path: '', // Plus besoin de chemin physique !
          file_size: file.size,
          file_type: file.type || 'unknown',
          user_id: user.id,
          analysis_status: 'pending',
          extracted_content: extractedContent.text
        });

        if (dbError) {
          addLog(`❌ Erreur base de données: ${dbError.message}`);
          throw new Error(`Erreur base de données: ${dbError.message}`);
        }

        addLog(`🎉 Document traité et stocké: ${file.name}`);
      }

      fetchDocuments();
      addLog(`✨ Processus terminé! ${files.length} fichier(s) prêt(s) pour l'analyse IA`);
      
    } catch (error: any) {
      addLog(`💥 Erreur upload: ${getErrorMessage(error)}`);
      alert(`Erreur lors du traitement: ${getErrorMessage(error)}`);
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleAnalyzeDocument = async (documentId: string) => {
    try {
      // Validation UUID
      if (!SecurityValidation.validateUUID(documentId)) {
        throw new Error('ID de document invalide');
      }
      
      // Rate limiting pour l'IA
      if (!apiSecurity.checkRateLimit(user?.id || 'anonymous', 'ai_generation', RATE_LIMITS.AI_GENERATION)) {
        throw new Error('Trop de générations récentes. Veuillez attendre.');
      }
      
      addLog(`🚀 Démarrage de l'analyse IA pour: ${documentId}`);
      
      // Récupérer le document avec son contenu extrait
      const document = documents.find(doc => doc.id === documentId);

      // Mettre à jour le statut
      await supabase
        .from('market_documents')
        .update({ analysis_status: 'analyzing' })
        .eq('id', documentId);

      // Mettre à jour localement le statut du document
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, analysis_status: 'analyzing' as const }
          : doc
      ));
      if (!document) {
        throw new Error('Document non trouvé');
      }
      
      if (!document.extracted_content) {
        throw new Error('Contenu textuel non disponible');
      }

      addLog(`📄 Contenu disponible: ${document.extracted_content.length} caractères`);

      // Analyser DIRECTEMENT le contenu stocké
      try {
        addLog(`🤖 Envoi vers l'IA...`);
        
        const analysisPrompt = `Analysez ce document de marché public en vous concentrant sur le RÈGLEMENT DE LA CONSULTATION (RC):

**Document:** ${document.name}
**Type:** ${document.file_type}
**Taille:** ${Math.round(document.file_size / 1024)} KB

**Contenu du document:**
${document.extracted_content}

---

INSTRUCTIONS IMPORTANTES:
- Concentrez-vous EXCLUSIVEMENT sur le Règlement de la Consultation (RC)
- Identifiez et extrayez TOUS les avertissements et points d'alerte
- Repérez les clauses contraignantes et pénalités

Fournissez une analyse structurée avec:

1. **⚠️ AVERTISSEMENTS ET POINTS D'ALERTE**
   - Liste TOUS les avertissements du RC
   - Clauses éliminatoires
   - Pièces obligatoires sous peine de rejet
   - Dates et délais impératifs

2. **📋 RÈGLEMENT DE LA CONSULTATION (RC)**
   - Format de réponse imposé
   - Structure du mémoire technique requis
   - Documents à fournir obligatoirement
   - Modalités de remise des offres

3. **🎯 CRITÈRES DE JUGEMENT**
   - Pondération des critères
   - Méthodologie d'évaluation
   - Points d'attention pour maximiser le score

4. **💰 ASPECTS FINANCIERS**
   - Budget et montants identifiés
   - Modalités de prix (forfait, unitaire, etc.)
   - Pénalités financières

5. **⏰ DÉLAIS CRITIQUES**
   - Date limite de remise
   - Délais d'exécution
   - Dates de visites obligatoires

6. **🚨 RECOMMANDATIONS PRIORITAIRES**
   - Points ABSOLUMENT à respecter
   - Risques de non-conformité
   - Actions immédiates à entreprendre`;
        
        const analysisResult = await openRouterService.analyzeDocument(
          analysisPrompt,
          document.name
        );
        
        addLog(`📥 Analyse IA reçue: ${analysisResult.length} caractères`);

        // Sauvegarder le résultat
        await supabase
          .from('market_documents')
          .update({
            analysis_status: 'completed',
            analysis_result: analysisResult
          })
          .eq('id', documentId);

        addLog(`🎉 Analyse terminée avec succès!`);

        // Mettre à jour localement le document
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId
            ? { ...doc, analysis_status: 'completed' as const, analysis_result: analysisResult }
            : doc
        ));

        // Émettre un événement pour mettre à jour le dashboard
        window.dispatchEvent(new CustomEvent('straticia:document-analyzed', {
          detail: { documentId, marketId }
        }));
        
      } catch (aiError) {
        addLog(`❌ Échec de l'analyse IA: ${aiError.message}`);
        throw new Error(`Erreur analyse IA: ${aiError.message}`);
      }
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      addLog(`💥 Erreur générale: ${errorMessage}`);

      await supabase
        .from('market_documents')
        .update({
          analysis_status: 'error',
          analysis_result: `Erreur lors de l'analyse: ${errorMessage}`
        })
        .eq('id', documentId);

      // Mettre à jour localement le document
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, analysis_status: 'error' as const, analysis_result: `Erreur lors de l'analyse: ${errorMessage}` }
          : doc
      ));
    }
  };

  const handleAnalyzeAllDocuments = async () => {
    const pendingDocuments = documents.filter(doc => doc.analysis_status === 'pending');
    if (pendingDocuments.length === 0) return;

    setAnalyzeAllLoading(true);
    addLog(`🔥 Analyse en lot de ${pendingDocuments.length} documents`);

    try {
      // Marquer tous les documents comme "analyzing"
      await Promise.all(
        pendingDocuments.map(doc =>
          supabase
            .from('market_documents')
            .update({ analysis_status: 'analyzing' })
            .eq('id', doc.id)
        )
      );

      // Mettre à jour localement
      setDocuments(prev => prev.map(doc =>
        pendingDocuments.some(pendingDoc => pendingDoc.id === doc.id)
          ? { ...doc, analysis_status: 'analyzing' as const }
          : doc
      ));

      // Analyser tous les documents EN PARALLÈLE
      const analysisPromises = pendingDocuments.map(async (doc) => {
        try {
          addLog(`📋 Traitement: ${doc.name}`);

          if (!doc.extracted_content) {
            throw new Error('Contenu textuel non disponible');
          }

          // Analyser avec l'IA
          const analysisPrompt = `Analysez ce document de marché public en vous concentrant sur le RÈGLEMENT DE LA CONSULTATION (RC):

**Document:** ${doc.name}
**Type:** ${doc.file_type}

**Contenu du document:**
${doc.extracted_content}

---

INSTRUCTIONS IMPORTANTES:
- Concentrez-vous EXCLUSIVEMENT sur le Règlement de la Consultation (RC)
- Identifiez et extrayez TOUS les avertissements et points d'alerte
- Repérez les clauses contraignantes et pénalités

Fournissez une analyse structurée avec:

1. **⚠️ AVERTISSEMENTS ET POINTS D'ALERTE**
2. **📋 RÈGLEMENT DE LA CONSULTATION (RC)**
3. **🎯 CRITÈRES DE JUGEMENT**
4. **💰 ASPECTS FINANCIERS**
5. **⏰ DÉLAIS CRITIQUES**
6. **🚨 RECOMMANDATIONS PRIORITAIRES**`;

          const analysisResult = await openRouterService.analyzeDocument(
            analysisPrompt,
            doc.name
          );

          // Sauvegarder
          await supabase
            .from('market_documents')
            .update({
              analysis_status: 'completed',
              analysis_result: analysisResult
            })
            .eq('id', doc.id);

          addLog(`✅ ${doc.name} analysé avec succès`);

          // Mettre à jour localement
          setDocuments(prev => prev.map(d =>
            d.id === doc.id
              ? { ...d, analysis_status: 'completed' as const, analysis_result: analysisResult }
              : d
          ));

          // Émettre un événement pour chaque document analysé
          window.dispatchEvent(new CustomEvent('straticia:document-analyzed', {
            detail: { documentId: doc.id, marketId }
          }));

        } catch (docError) {
          const errorMessage = getErrorMessage(docError);
          addLog(`❌ Erreur pour ${doc.name}: ${errorMessage}`);

          await supabase
            .from('market_documents')
            .update({
              analysis_status: 'error',
              analysis_result: `Erreur: ${errorMessage}`
            })
            .eq('id', doc.id);

          // Mettre à jour localement
          setDocuments(prev => prev.map(d =>
            d.id === doc.id
              ? { ...d, analysis_status: 'error' as const, analysis_result: `Erreur: ${errorMessage}` }
              : d
          ));
        }
      });

      // Attendre que TOUTES les analyses soient terminées
      await Promise.all(analysisPromises);

      addLog(`🎊 Analyse en lot terminée!`);

    } catch (error) {
      console.error('Batch analysis error:', error);
      alert(`Erreur analyse globale: ${getErrorMessage(error)}`);
    } finally {
      setAnalyzeAllLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      await supabase.from('market_documents').delete().eq('id', documentId);
      fetchDocuments();
      addLog(`🗑️ Document supprimé`);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(`Erreur lors de la suppression: ${getErrorMessage(error)}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analyse des documents</h2>
            <p className="text-gray-600 mt-1">{marketTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Zone d'upload */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upload + Extraction automatique</p>
                  <p className="text-sm text-gray-600">Le texte est extrait immédiatement, plus de problèmes de fichiers !</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={uploadLoading}
                />
                <label
                  htmlFor="file-upload"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                >
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Extraction...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Sélectionner
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Barre d'actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Documents ({documents.length})
              </h3>
              {isAdmin && logs.length > 0 && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Terminal className="w-4 h-4" />
                  Logs ({logs.length})
                  {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
              {documents.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">{documents.filter(doc => doc.analysis_status === 'completed').length} analysés</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700">{documents.filter(doc => doc.analysis_status === 'analyzing').length} en cours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">{documents.filter(doc => doc.analysis_status === 'pending').length} en attente</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDocuments}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title="Actualiser la liste"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              {documents.filter(doc => doc.analysis_status === 'pending').length > 0 && (
                <button
                  onClick={handleAnalyzeAllDocuments}
                  disabled={analyzeAllLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Brain className={`w-4 h-4 ${analyzeAllLoading ? 'animate-spin' : ''}`} />
                  {analyzeAllLoading 
                    ? `Analyse... (${documents.filter(doc => doc.analysis_status === 'analyzing').length})`
                    : `Analyser tout (${documents.filter(doc => doc.analysis_status === 'pending').length})`
                  }
                </button>
              )}
            </div>
          </div>

          {/* Bulle de logs */}
          {showLogs && logs.length > 0 && (
            <div className="mb-6 bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400">Console de logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearLogs}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded transition-colors"
                  >
                    Effacer
                  </button>
                  <button
                    onClick={() => setShowLogs(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-black rounded p-3">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des documents */}
          <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-xl bg-white">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h4>
                <p className="text-gray-600">Commencez par uploader vos documents de marché</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {documents.map((doc) => {
                  const status = statusConfig[doc.analysis_status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{doc.name}</h4>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.file_size)} • {doc.file_type}
                              </p>
                              {doc.extracted_content && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  {Math.round(doc.extracted_content.length / 1000)}k caractères extraits
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className={`w-3 h-3 ${doc.analysis_status === 'analyzing' ? 'animate-spin' : ''}`} />
                            <span className="text-xs font-medium">{status.label}</span>
                          </div>
                          {doc.analysis_status === 'pending' && (
                            <button
                              onClick={() => handleAnalyzeDocument(doc.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors"
                            >
                              <Brain className="w-3 h-3" />
                              Analyser
                            </button>
                          )}
                          {doc.analysis_status === 'error' && (
                            <button
                              onClick={() => handleAnalyzeDocument(doc.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors"
                              title="Réessayer l'analyse"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Réessayer
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {doc.analysis_result && (
                        <div className={`mt-3 ml-11 rounded-lg ${
                          doc.analysis_status === 'error'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-green-50 border border-green-200'
                        }`}>
                          <div
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                              doc.analysis_status === 'error'
                                ? 'hover:bg-red-100'
                                : 'hover:bg-green-100'
                            }`}
                            onClick={() => toggleAnalysisCollapse(doc.id)}
                          >
                            <div className="flex items-center gap-2">
                              {doc.analysis_status === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <Brain className="w-4 h-4 text-green-600" />
                              )}
                              <h5 className={`font-medium ${
                                doc.analysis_status === 'error' ? 'text-red-900' : 'text-green-900'
                              }`}>
                                {doc.analysis_status === 'error' ? 'Erreur d\'analyse' : 'Analyse IA'}
                              </h5>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                doc.analysis_status === 'error'
                                  ? 'text-red-600 bg-red-100'
                                  : 'text-green-600 bg-green-100'
                              }`}>
                                {Math.round((doc.analysis_result.length / 1000) * 10) / 10}k caractères
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className={`p-1 rounded transition-colors ${
                                doc.analysis_status === 'error'
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-green-600 hover:text-green-700'
                              }`}>
                                {isAnalysisExpanded(doc.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {isAnalysisExpanded(doc.id) && (
                            <div className="px-3 pb-3">
                              <div
                                className={`prose prose-sm max-w-none leading-relaxed ${
                                  doc.analysis_status === 'error' ? 'text-red-800' : 'text-green-800'
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html: doc.analysis_result
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-green-900">$1</strong>')
                                    .replace(/## (.*)/g, '<h3 class="text-sm font-semibold text-green-900 mt-4 mb-2 border-b border-green-200 pb-1">$1</h3>')
                                    .replace(/# (.*)/g, '<h2 class="text-base font-bold text-green-900 mt-4 mb-3 border-b-2 border-green-300 pb-2">$1</h2>')
                                    .replace(/### (.*)/g, '<h4 class="text-sm font-medium text-green-800 mt-3 mb-1">$1</h4>')
                                    .replace(/- (.*)/g, '<div class="flex items-start gap-2 mb-1"><span class="text-green-600 mt-1">•</span><span>$1</span></div>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                    .replace(/\n\n/g, '<br><br>')
                                    .replace(/\n/g, '<br>')
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Aperçu du contenu extrait si pas d'analyse */}
                      {doc.extracted_content && !doc.analysis_result && (
                        <div className="mt-3 ml-11 bg-blue-50 border border-blue-200 rounded-lg">
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => toggleAnalysisCollapse(doc.id)}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <h5 className="font-medium text-blue-900">Contenu extrait</h5>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                {Math.round(doc.extracted_content.length / 1000)}k caractères
                              </span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors">
                              {documentStates[doc.id]?.isAnalysisCollapsed ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          
                          {isAnalysisExpanded(doc.id) && (
                            <div className="px-3 pb-3">
                              <div className="text-sm text-blue-800 font-mono bg-blue-25 p-3 rounded border max-h-60 overflow-y-auto">
                                {doc.extracted_content.substring(0, 2000)}
                                {doc.extracted_content.length > 2000 && (
                                  <span className="text-blue-600 font-sans">... ({doc.extracted_content.length - 2000} caractères supplémentaires)</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {documents.length} document{documents.length > 1 ? 's' : ''} • {documents.filter(doc => doc.analysis_status === 'completed').length} analysé{documents.filter(doc => doc.analysis_status === 'completed').length > 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};