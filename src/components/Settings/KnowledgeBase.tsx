import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, FileText, Download, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { KnowledgeFile } from '../../types';
import { SecurityValidation } from '../../lib/securityValidation';

interface KnowledgeFileWithStatus extends KnowledgeFile {
  status?: 'checking' | 'available' | 'missing' | 'error';
  error_message?: string;
}

export const KnowledgeBase: React.FC = () => {
  const [files, setFiles] = useState<KnowledgeFileWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filesWithStatus = (data || []).map(file => ({
        ...file
      }));

      setFiles(filesWithStatus);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    console.log(`Starting upload and extraction of ${files.length} file(s) for user:`, user.id);
    setUploadLoading(true);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Validation de sécurité pour chaque fichier
          const allowedTypes = ['pdf', 'doc', 'docx', 'txt'];
          if (!SecurityValidation.validateFileType(file.name, allowedTypes)) {
            throw new Error(`Type de fichier non autorisé: ${file.name}`);
          }

          if (!SecurityValidation.validateFileSize(file.size, 50)) { // 50MB max
            throw new Error(`Fichier trop volumineux: ${file.name} (max 50MB)`);
          }
          
          console.log(`Processing file ${i + 1}/${files.length}: ${file.name} (${Math.round(file.size / 1024)} KB)`);
          
          // 1. EXTRACTION IMMÉDIATE du contenu textuel
          let extractedContent;
          try {
            console.log(`🔍 Starting text extraction for ${file.name}...`);
            const { documentExtractor } = await import('../../lib/documentExtractor');
            const extractionResult = await documentExtractor.extractContent(file, file.name);
            extractedContent = extractionResult.text;
            console.log(`✅ Text extracted for ${file.name}: ${extractedContent.length} characters`);
            
            if (!extractedContent || extractedContent.trim().length < 10) {
              throw new Error(`Contenu extrait insuffisant ou vide: ${file.name}`);
            }
          } catch (extractError) {
            console.error(`❌ Extraction error for ${file.name}:`, extractError);
            throw new Error(`Impossible d'extraire le texte de ${file.name}: ${extractError.message}`);
          }

          // 2. STOCKAGE DIRECT en base avec le contenu extrait
          const { error: dbError } = await supabase.from('knowledge_files').insert({
            name: file.name,
            file_path: '', // Plus besoin de stocker le fichier physique
            file_size: file.size,
            category: file.type || 'unknown',
            user_id: user.id,
            extracted_content: extractedContent,
            extraction_status: 'completed'
          });

          if (dbError) {
            console.error(`Database insert error for ${file.name}:`, dbError);
            throw new Error(`Erreur base de données pour ${file.name}: ${dbError.message}`);
          }

          console.log(`✨ File processed and stored successfully: ${file.name}`);
          successCount++;
          
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          errors.push(`${file.name}: ${fileError.message}`);
          errorCount++;
        }
      }

      fetchFiles();
      
      // Afficher un résumé des résultats
      if (successCount > 0 && errorCount === 0) {
        alert(`✅ ${successCount} fichier(s) traité(s) avec succès !`);
      } else if (successCount > 0 && errorCount > 0) {
        alert(`⚠️ ${successCount} fichier(s) réussi(s), ${errorCount} échec(s):\n\n${errors.join('\n')}`);
      } else if (errorCount > 0) {
        alert(`❌ Tous les fichiers ont échoué:\n\n${errors.join('\n')}`);
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      alert(`Erreur générale lors du traitement: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      // Supprimer directement l'entrée de la base de données
      await supabase.from('knowledge_files').delete().eq('id', fileId);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getFileStatusIcon = (file: KnowledgeFileWithStatus) => {
    // Utiliser extraction_status au lieu de file status
    switch (file.extraction_status) {
      case 'completed':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'processing':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Base de connaissance</h2>
            <p className="text-gray-600">Gérez vos documents de référence</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Ajoutez vos documents de référence
            </p>
            <p className="text-gray-500">ou</p>
            <label className="inline-block">
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
              <span className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block">
                {uploadLoading ? 'Upload en cours...' : 'Sélectionner des fichiers'}
              </span>
            </label>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Formats supportés: PDF, DOC, DOCX, TXT • Upload multiple supporté • Max 50MB par fichier
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Mes documents ({files.length})</h3>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
            <p className="text-gray-600">Commencez par ajouter votre premier document</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <React.Fragment key={file.id}>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      file.status === 'missing' || file.status === 'error' 
                        ? 'bg-red-100' 
                        : 'bg-purple-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        file.status === 'missing' || file.status === 'error'
                          ? 'text-red-600'
                          : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.file_size)} • {file.category}
                          </p>
                          {file.extraction_status === 'completed' && file.extracted_content && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              {Math.round(file.extracted_content.length / 1000)}k chars
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                      </p>
                      {file.error_message && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ {file.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                      file.extraction_status === 'error'
                        ? 'text-red-600 bg-red-50' 
                        : file.extraction_status === 'completed'
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 bg-gray-50'
                    }`}>
                      <div className="w-3 h-3">
                        {getFileStatusIcon(file)}
                      </div>
                      <span className="text-xs font-medium">
                        {file.extraction_status === 'completed' ? 'Extrait' :
                         file.extraction_status === 'processing' ? 'Traitement...' :
                         file.extraction_status === 'error' ? 'Erreur' :
                         'En attente'}
                      </span>
                    </div>
                    <button 
                      className="text-gray-300 cursor-not-allowed"
                      disabled={true}
                      title="Contenu extrait et stocké en base"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id, file.file_path || '')}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer ce document"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              
                {file.extraction_error && (
                  <div className="mt-3 ml-11 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">
                      ⚠️ {file.extraction_error}
                    </p>
                  </div>
                )}
                
                {file.extraction_status === 'completed' && file.extracted_content && (
                  <div className="mt-3 ml-11 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      📄 Aperçu du contenu extrait ({Math.round(file.extracted_content.length / 1000)}k caractères)
                    </p>
                    <div className="text-xs text-blue-600 font-mono bg-blue-25 p-2 rounded max-h-20 overflow-y-auto">
                      {file.extracted_content.substring(0, 300)}
                      {file.extracted_content.length > 300 && '...'}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};