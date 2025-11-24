import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Eye, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ReportAsset } from '../../types';
import { SecurityValidation } from '../../lib/securityValidation';
import { ImageDescriptionService } from '../../services/imageDescriptionService';

export const ReportAssetManager: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [assets, setAssets] = useState<ReportAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);
  const [describingAssetId, setDescribingAssetId] = useState<string | null>(null);

  const imageDescriptionService = ImageDescriptionService.getInstance();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('report_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploadLoading(true);
    
    try {
      for (const file of files) {
        // Validations de sécurité
        const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        if (!SecurityValidation.validateFileType(file.name, allowedTypes)) {
          alert(`Type de fichier non autorisé: ${file.name}. Formats acceptés: JPG, PNG, GIF, SVG, WebP`);
          continue;
        }
        
        if (!SecurityValidation.validateFileSize(file.size, 5)) { // 5MB max
          alert(`Fichier trop volumineux: ${file.name} (max 5MB)`);
          continue;
        }

        console.log(`Uploading asset: ${file.name} (${Math.round(file.size / 1024)} KB)`);
        
        // Upload vers Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        console.log(`Generated public URL for ${file.name}:`, publicUrl);

        // Vérifier si l'URL publique est valide
        if (!publicUrl || publicUrl.includes('undefined')) {
          throw new Error(`URL publique invalide générée pour ${file.name}`);
        }

        // Enregistrer en base
        const { data: insertedAsset, error: dbError } = await supabase
          .from('report_assets')
          .insert({
            name: file.name,
            file_path: filePath,
            file_url: publicUrl,
            file_size: file.size,
            file_type: file.type,
            user_id: user.id
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          // Nettoyer le fichier uploadé en cas d'erreur
          await supabase.storage.from('uploads').remove([filePath]);
          throw dbError;
        }

        console.log(`Asset uploaded successfully: ${file.name}`);

        // Générer la description de l'image en arrière-plan
        if (insertedAsset) {
          imageDescriptionService.generateImageDescription(publicUrl, insertedAsset.id)
            .then(description => {
              console.log(`Generated description for ${file.name}:`, description);
              fetchAssets();
            })
            .catch(err => {
              console.error(`Failed to generate description for ${file.name}:`, err);
            });
        }
      }

      fetchAssets();
    } catch (error) {
      console.error('Error uploading assets:', error);
      alert(`Erreur lors de l'upload: ${(error as Error).message}`);
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAsset = async (asset: ReportAsset) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${asset.name}" ?`)) return;

    try {
      // Supprimer de la base
      const { error: dbError } = await supabase
        .from('report_assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) throw dbError;

      // Supprimer du storage
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([asset.file_path]);

      if (storageError) {
        console.warn('Storage deletion warning:', storageError);
      }

      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    }
  };

  const handleCopyAssetCode = async (asset: ReportAsset) => {
    const markdownCode = `![${asset.name}](asset:${asset.id})`;
    await navigator.clipboard.writeText(markdownCode);
    setCopiedAssetId(asset.id);
    setTimeout(() => setCopiedAssetId(null), 2000);
  };

  const handleGenerateDescription = async (asset: ReportAsset) => {
    try {
      setDescribingAssetId(asset.id);
      await imageDescriptionService.generateImageDescription(asset.file_url, asset.id);
      await fetchAssets();
    } catch (error) {
      console.error('Error generating description:', error);
      alert(`Erreur lors de la génération de la description: ${(error as Error).message}`);
    } finally {
      setDescribingAssetId(null);
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
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg shadow-lg">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mes images</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gérez vos images pour les mémoires techniques</p>
          </div>
        </div>

        {/* Zone d'upload */}
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDark 
            ? 'border-gray-600 hover:border-purple-500 bg-gray-700/50' 
            : 'border-gray-300 hover:border-purple-400 bg-gray-50'
        }`}>
          <Upload className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
          <div className="space-y-2">
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Ajoutez vos images
            </p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ou</p>
            <label className="inline-block">
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block">
                {uploadLoading ? 'Upload en cours...' : 'Sélectionner des images'}
              </span>
            </label>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-4`}>
            Formats supportés: JPG, PNG, GIF, SVG, WebP • Upload multiple • Max 5MB par fichier
          </p>
        </div>
      </div>

      {/* Galerie d'images */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
          Ma galerie ({assets.length})
        </h3>

        {assets.length === 0 ? (
          <div className="text-center py-12">
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Image className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucune image</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Commencez par ajouter votre première image</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:transform hover:scale-105`}
              >
                {/* Aperçu de l'image */}
                <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg mb-4 overflow-hidden">
                  {/* Debug de l'URL */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 p-1">
                      URL: {asset.file_url.substring(0, 50)}...
                    </div>
                  )}
                  <img
                    src={asset.file_url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log(`Image loaded successfully: ${asset.name}`)}
                    onError={(e) => {
                      console.error(`Failed to load image: ${asset.name}`, asset.file_url);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center">
                            <div class="w-12 h-12 ${isDark ? 'bg-gray-500' : 'bg-gray-300'} rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                            </div>
                            <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}">Aperçu indisponible</p>
                            <p class="text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}">${asset.file_url.substring(0, 30)}...</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>

                {/* Informations */}
                <div className="space-y-3">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`} title={asset.name}>
                      {asset.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatFileSize(asset.file_size)} • {formatDate(asset.created_at)}
                    </p>
                  </div>

                  {/* Description IA */}
                  {asset.ai_description && (
                    <div className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3 mb-3`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                          Description IA
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'} leading-relaxed line-clamp-3`}>
                        {asset.ai_description}
                      </p>
                    </div>
                  )}

                  {/* Bouton de génération de description */}
                  {!asset.ai_description && (
                    <button
                      onClick={() => handleGenerateDescription(asset)}
                      disabled={describingAssetId === asset.id}
                      className={`w-full mb-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
                          : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
                      } disabled:cursor-not-allowed`}
                    >
                      {describingAssetId === asset.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Génération...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Générer description IA
                        </>
                      )}
                    </button>
                  )}

                  {/* Code Markdown pour insertion */}
                  <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-200'} border rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Code d'insertion
                      </span>
                      <button
                        onClick={() => handleCopyAssetCode(asset)}
                        className={`${isDark ? 'text-gray-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-600'} transition-colors`}
                        title="Copier le code"
                      >
                        {copiedAssetId === asset.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <code className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} font-mono truncate block`}>
                      ![{asset.name}](asset:{asset.id})
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors flex items-center gap-1 text-sm`}
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </a>
                    <button
                      onClick={() => handleDeleteAsset(asset)}
                      className={`${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors flex items-center gap-1 text-sm`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions d'utilisation */}
      <div className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 border transition-colors duration-200`}>
        <div className="flex items-start gap-3">
          <div className={`p-1 rounded-full ${isDark ? 'bg-blue-800' : 'bg-blue-100'}`}>
            <Image className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h4 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-1`}>
              Comment utiliser vos images
            </h4>
            <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} space-y-2`}>
              <p>1. Uploadez vos images dans cette galerie</p>
              <p>2. Copiez le code d'insertion de l'image souhaitée</p>
              <p>3. Collez le code dans le contenu de votre section de mémoire technique</p>
              <p>4. L'image apparaîtra automatiquement dans les exports Word et PDF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};