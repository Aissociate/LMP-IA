import React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeSettings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Apparence</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Personnalisez l'apparence de Le Marché Public.fr</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-orange-50'} rounded-xl p-6 border ${isDark ? 'border-gray-600' : 'border-orange-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-600' : 'bg-white'} shadow-lg`}>
                  {isDark ? (
                    <Moon className="w-6 h-6 text-orange-500" />
                  ) : (
                    <Sun className="w-6 h-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Mode {isDark ? 'sombre' : 'clair'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isDark 
                      ? 'Interface sombre pour réduire la fatigue oculaire'
                      : 'Interface claire et lumineuse'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  isDark 
                    ? 'bg-orange-600 focus:ring-offset-gray-800' 
                    : 'bg-gray-200 focus:ring-offset-white'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                    isDark ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-orange-50 to-orange-100'} rounded-xl p-6 border ${isDark ? 'border-gray-600' : 'border-orange-200'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Couleurs Le Marché Public.fr
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl shadow-lg mx-auto mb-2"></div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Principal</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-xl shadow-lg mx-auto mb-2"></div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accent</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg mx-auto mb-2"></div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dégradé</p>
              </div>
              <div className="text-center">
                <div className={`w-12 h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl shadow-lg mx-auto mb-2`}></div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Neutre</p>
              </div>
              <div className="text-center">
                <div className={`w-12 h-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg mx-auto mb-2 border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}></div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fond</p>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 border`}>
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${isDark ? 'bg-blue-800' : 'bg-blue-100'}`}>
                <Palette className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h4 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-1`}>
                  Thème adaptatif
                </h4>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  Le thème s'adapte automatiquement à vos préférences et améliore votre expérience d'utilisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};