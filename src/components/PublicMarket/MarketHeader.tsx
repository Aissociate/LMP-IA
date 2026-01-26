import React from 'react';
import { Bell, Clock, Target, Zap } from 'lucide-react';

interface MarketHeaderProps {
  onCTAClick: () => void;
}

export function MarketHeader({ onCTAClick }: MarketHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Surveillez automatiquement tous les marchés publics de La Réunion 974
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Ne ratez plus aucune opportunité grâce à notre veille intelligente 24h/7j
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Alertes instantanées</h3>
              <p className="text-sm text-blue-100">
                Recevez une notification dès qu'un nouveau marché correspond à vos critères
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Gain de temps</h3>
              <p className="text-sm text-blue-100">
                Plus besoin de consulter manuellement les plateformes chaque jour
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Ciblage précis</h3>
              <p className="text-sm text-blue-100">
                Définissez vos critères de recherche pour ne voir que les marchés pertinents
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Réactivité maximale</h3>
              <p className="text-sm text-blue-100">
                Soyez parmi les premiers à découvrir les nouvelles opportunités
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={onCTAClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Essayez gratuitement pendant 7 jours
          </button>
          <a
            href="/marchepublics/974"
            className="text-white border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Voir tous les marchés du 974
          </a>
        </div>
      </div>
    </div>
  );
}
