import React from "react";
import { Zap, Brain, Clock, Sparkles } from "lucide-react";

export const MarketModelComparison: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Choisissez le modèle IA adapté à vos besoins
        </h2>
        <p className="text-xl text-gray-700">
          Niveau de compétence : Professionnel pour Standard, Expert pour Premium
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="backdrop-blur-sm bg-white/80 rounded-3xl p-8 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Compétences Professionnelles</h3>
              <p className="text-sm text-gray-600">Inclus dans tous les plans</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">1 024 000 tokens de contexte</p>
                <p className="text-sm text-gray-600">Analyse complète de DCE standard</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Génération rapide</p>
                <p className="text-sm text-gray-600">Résultats en quelques minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Niveau de compétence : Professionnel</p>
                <p className="text-sm text-gray-600">Mémoires techniques structurés et cohérents</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <p className="text-sm text-orange-900 font-medium">
              ✓ Parfait pour la majorité des marchés publics
            </p>
          </div>
        </div>

        <div className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
          <div className="absolute -top-3 -right-3">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-bold shadow-lg">
              OPTION PREMIUM
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Compétences Expert</h3>
              <p className="text-sm text-purple-700 font-semibold">+99€/mois</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">1 024 000 tokens de contexte</p>
                <p className="text-sm text-gray-600">Analyse ultra-approfondie des DCE complexes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Modèle avancé avec réflexion</p>
                <p className="text-sm text-gray-600">Raisonnement approfondi et arguments stratégiques</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Rapidité optimisée</p>
                <p className="text-sm text-gray-600">Génération plus rapide malgré la complexité</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Niveau de compétence : Expert</p>
                <p className="text-sm text-gray-600">Analyse fine des critères et optimisation max</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-100 rounded-2xl p-4 border border-purple-300">
            <p className="text-sm text-purple-900 font-medium">
              ⭐ Recommandé pour les marchés stratégiques et complexes
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
