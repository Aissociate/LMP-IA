import React from 'react';
import { GraduationCap, Play } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const FormationSection: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
          <GraduationCap className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
        </div>
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Formation
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Apprenez à optimiser votre utilisation de la plateforme
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <Play className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Guide de démarrage
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Découvrez les fonctionnalités principales de la plateforme
              </p>
            </div>
          </div>

          <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.facebook.com/plugins/video.php?height=304&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1347758950405127%2F&show_text=false&width=560&t=0"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 'none' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              <strong>Astuce :</strong> Regardez cette vidéo pour comprendre comment utiliser efficacement les outils de recherche et d'analyse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
