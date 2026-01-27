import React, { useState, useEffect } from 'react';
import { X, Loader2, ThumbsUp, ThumbsDown, AlertCircle, Target, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { openRouterService } from '../../lib/openrouter';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketData: {
    title: string;
    reference: string;
    client?: string;
    description?: string;
    amount?: number;
    location?: string;
    deadline?: string;
    service_type?: string;
  };
}

interface AIAnalysisResult {
  decision: 'GO' | 'NO_GO' | 'A_ETUDIER';
  confidence: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risks: string[];
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  marketData
}) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      analyzeMarket();
    }
  }, [isOpen]);

  const analyzeMarket = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Tu es un expert en analyse de marchés publics. Analyse le marché suivant et donne un avis GO/NO GO structuré.

MARCHÉ À ANALYSER:
Titre: ${marketData.title}
Référence: ${marketData.reference}
Client: ${marketData.client || 'Non spécifié'}
Montant: ${marketData.amount ? `${marketData.amount.toLocaleString('fr-FR')} €` : 'Non spécifié'}
Localisation: ${marketData.location || 'Non spécifiée'}
Date limite: ${marketData.deadline || 'Non spécifiée'}
Type de service: ${marketData.service_type || 'Non spécifié'}
Description: ${marketData.description || 'Non fournie'}

RÉPONDS AU FORMAT JSON STRICT SUIVANT (sans texte avant ou après):
{
  "decision": "GO" | "NO_GO" | "A_ETUDIER",
  "confidence": <nombre entre 0 et 100>,
  "summary": "<résumé en 2-3 phrases>",
  "strengths": ["<point fort 1>", "<point fort 2>", "..."],
  "weaknesses": ["<point faible 1>", "<point faible 2>", "..."],
  "recommendations": ["<recommandation 1>", "<recommandation 2>", "..."],
  "risks": ["<risque 1>", "<risque 2>", "..."]
}

Critères d'évaluation:
- Adéquation avec vos compétences
- Montant et rentabilité potentielle
- Délais de réponse et de réalisation
- Complexité du marché
- Réputation du client
- Localisation géographique`;

      const systemPrompt = `Tu es un expert en analyse de marchés publics. Tu dois fournir une analyse objective et structurée au format JSON strict.`;

      const response = await openRouterService.generateContent(prompt, systemPrompt);

      let content = response.trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      const result: AIAnalysisResult = JSON.parse(content);

      if (!result.decision || !result.summary) {
        throw new Error('Réponse IA invalide');
      }

      setAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing market:', err);
      setError(err.message || 'Erreur lors de l\'analyse du marché');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnalysis(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const getDecisionConfig = (decision: string) => {
    switch (decision) {
      case 'GO':
        return {
          icon: ThumbsUp,
          color: 'text-green-600',
          bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
          borderColor: 'border-green-600',
          label: 'GO - Recommandé'
        };
      case 'NO_GO':
        return {
          icon: ThumbsDown,
          color: 'text-red-600',
          bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50',
          borderColor: 'border-red-600',
          label: 'NO GO - Non recommandé'
        };
      case 'A_ETUDIER':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
          borderColor: 'border-orange-600',
          label: 'À ÉTUDIER - Avis mitigé'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: isDark ? 'bg-gray-900/20' : 'bg-gray-50',
          borderColor: 'border-gray-600',
          label: 'Analyse en cours'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Target className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analyse IA GO/NO GO
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className={`${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {marketData.title}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Réf: {marketData.reference} | Client: {marketData.client || 'Non spécifié'}
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className={`w-12 h-12 ${isDark ? 'text-orange-400' : 'text-orange-600'} animate-spin mb-4`} />
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                Analyse en cours...
              </p>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-sm mt-2`}>
                L'IA évalue la pertinence de ce marché
              </p>
            </div>
          )}

          {error && (
            <div className={`${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
              <AlertCircle className={`w-12 h-12 ${isDark ? 'text-red-400' : 'text-red-600'} mx-auto mb-3`} />
              <p className={`${isDark ? 'text-red-400' : 'text-red-700'} font-medium mb-2`}>
                Erreur d'analyse
              </p>
              <p className={`${isDark ? 'text-red-300' : 'text-red-600'} text-sm`}>
                {error}
              </p>
              <button
                onClick={analyzeMarket}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } transition-colors`}
              >
                Réessayer
              </button>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6">
              <div className={`${getDecisionConfig(analysis.decision).bgColor} border-2 ${getDecisionConfig(analysis.decision).borderColor} rounded-xl p-6`}>
                <div className="flex items-center gap-4 mb-4">
                  {React.createElement(getDecisionConfig(analysis.decision).icon, {
                    className: `w-12 h-12 ${getDecisionConfig(analysis.decision).color}`
                  })}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${getDecisionConfig(analysis.decision).color} mb-1`}>
                      {getDecisionConfig(analysis.decision).label}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Confiance:
                      </span>
                      <div className={`flex-1 max-w-xs h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div
                          className={`h-full ${
                            analysis.confidence >= 75
                              ? 'bg-green-600'
                              : analysis.confidence >= 50
                              ? 'bg-orange-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${analysis.confidence}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analysis.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg leading-relaxed`}>
                  {analysis.summary}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Points forts
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        <span className="text-green-600 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Points faibles
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        <span className="text-red-600 mt-1">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Recommandations
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Risques identifiés
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.risks.map((risk, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`flex justify-end gap-3 p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleClose}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
