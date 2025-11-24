import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const VideoUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Veuillez sélectionner un fichier vidéo');
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max: 500MB)');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const fileName = `hero-video-${Date.now()}.mp4`;
      const filePath = fileName;

      const { data, error: uploadError } = await supabase.storage
        .from('marketing-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('marketing-videos')
        .getPublicUrl(filePath);

      setVideoUrl(urlData.publicUrl);
      setProgress(100);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        📹 Upload Vidéo Marketing
      </h2>

      <p className="text-gray-600 mb-6">
        Uploadez votre vidéo pour le hero de la page /lead
      </p>

      <div className="border-3 border-dashed border-orange-300 rounded-xl p-8 text-center mb-6 hover:border-orange-500 transition-colors">
        <Upload className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="text-lg font-semibold text-gray-700 mb-2">
            Cliquez pour sélectionner une vidéo
          </div>
          <div className="text-sm text-gray-500">
            Format accepté: MP4, MOV, AVI (Max: 500MB)
          </div>
        </label>
      </div>

      {file && (
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">{file.name}</div>
              <div className="text-sm text-gray-600">{formatFileSize(file.size)}</div>
            </div>
            {!uploading && !videoUrl && (
              <button
                onClick={handleUpload}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all"
              >
                Upload
              </button>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 text-orange-600 mb-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="font-semibold">Upload en cours...</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-green-700 mb-4">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-semibold text-lg">Vidéo uploadée avec succès!</span>
          </div>

          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">URL publique:</div>
            <div className="bg-white p-3 rounded border border-green-300 font-mono text-sm break-all">
              {videoUrl}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <div className="text-sm font-semibold text-yellow-800 mb-2">
              📝 Prochaine étape:
            </div>
            <div className="text-sm text-yellow-700">
              Copiez l'URL ci-dessus et remplacez-la dans le fichier{' '}
              <code className="bg-yellow-100 px-2 py-1 rounded">
                src/components/Landing/LandingLead.tsx
              </code>
              {' '}à la ligne de la balise <code className="bg-yellow-100 px-2 py-1 rounded">&lt;source src="..."&gt;</code>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>Note:</strong> Une fois la vidéo uploadée, vous devrez mettre à jour le code
          pour utiliser l'URL Supabase au lieu du fichier local.
        </div>
      </div>
    </div>
  );
};
