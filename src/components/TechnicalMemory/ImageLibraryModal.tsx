import React, { useState, useEffect } from 'react';
import { X, Image, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface ReportAsset {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (code: string) => void;
}

export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [assets, setAssets] = useState<ReportAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_assets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertImage = (asset: ReportAsset) => {
    const code = `![${asset.name}](asset:${asset.id})`;
    onInsertImage(code);
    setCopiedAssetId(asset.id);
    setTimeout(() => {
      setCopiedAssetId(null);
      onClose();
    }, 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Bibliothèque d'images
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cliquez sur une image pour l'insérer dans votre section
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Chargement...
              </span>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Image className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Aucune image
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Ajoutez des images depuis Paramètres → Mes images
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleInsertImage(asset)}
                  className={`${
                    isDark ? 'bg-gray-700 border-gray-600 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400'
                  } border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
                >
                  {/* Image preview */}
                  <div className="aspect-video bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                    <img
                      src={asset.file_url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {copiedAssetId === asset.id && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Check className="w-12 h-12 mx-auto mb-2" />
                          <p className="font-bold">Inséré !</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate text-sm`} title={asset.name}>
                      {asset.name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {formatFileSize(asset.file_size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-1">
              <Copy className="w-4 h-4" />
              <span>Cliquez sur une image pour l'insérer automatiquement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
