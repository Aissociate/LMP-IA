import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, Clock, ExternalLink, AlertCircle, Save, SkipForward, ListChecks, Upload } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { sessionService, DonneurOrdre, Session, SessionWithProgress } from '../../services/sessionService';
import { MarketEntryForm } from './MarketEntryForm';
import { SessionMarketsList } from './SessionMarketsList';
import { supabase } from '../../lib/supabase';

interface SessionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  operatorEmail: string;
}

export const SessionWizard: React.FC<SessionWizardProps> = ({ isOpen, onClose, operatorEmail }) => {
  const { isDark } = useTheme();
  const [currentSession, setCurrentSession] = useState<SessionWithProgress | null>(null);
  const [currentDonneurOrdre, setCurrentDonneurOrdre] = useState<DonneurOrdre | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketsAddedThisDonneur, setMarketsAddedThisDonneur] = useState(0);
  const [showDonneurSelection, setShowDonneurSelection] = useState(false);
  const [notes, setNotes] = useState('');
  const [refreshMarkets, setRefreshMarkets] = useState(0);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (isOpen && operatorEmail) {
      loadOrCreateSession();
    }
  }, [isOpen, operatorEmail]);

  const loadOrCreateSession = async () => {
    setLoading(true);
    try {
      const activeSessions = await sessionService.getActiveSessions(operatorEmail);

      if (activeSessions.length > 0) {
        const session = await sessionService.getSession(activeSessions[0].id);
        if (session) {
          setCurrentSession(session);
          if (session.remaining_donneurs_ordre.length > 0 && !currentDonneurOrdre) {
            setCurrentDonneurOrdre(session.remaining_donneurs_ordre[0]);
          }
        }
      } else {
        const newSession = await sessionService.createSession(operatorEmail);
        const fullSession = await sessionService.getSession(newSession.id);
        if (fullSession) {
          setCurrentSession(fullSession);
          if (fullSession.remaining_donneurs_ordre.length > 0) {
            setCurrentDonneurOrdre(fullSession.remaining_donneurs_ordre[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketAdded = () => {
    setMarketsAddedThisDonneur(prev => prev + 1);
    setRefreshMarkets(prev => prev + 1);
    if (currentSession) {
      sessionService.incrementSessionMarkets(currentSession.id);
    }
  };

  const handleMarketDeleted = () => {
    setMarketsAddedThisDonneur(prev => Math.max(0, prev - 1));
    setRefreshMarkets(prev => prev + 1);
  };

  const handleNextDonneurOrdre = async () => {
    if (!currentSession || !currentDonneurOrdre) return;

    setLoading(true);
    try {
      await sessionService.markDonneurOrdreCompleted(
        currentSession.id,
        currentDonneurOrdre.id,
        marketsAddedThisDonneur,
        notes
      );

      const updatedSession = await sessionService.getSession(currentSession.id);
      if (updatedSession) {
        setCurrentSession(updatedSession);
        setMarketsAddedThisDonneur(0);
        setNotes('');

        if (updatedSession.remaining_donneurs_ordre.length > 0) {
          setCurrentDonneurOrdre(updatedSession.remaining_donneurs_ordre[0]);
          await sessionService.startDonneurOrdre(
            updatedSession.id,
            updatedSession.remaining_donneurs_ordre[0].id
          );
        } else {
          await sessionService.updateSessionStatus(currentSession.id, 'completed');
          alert('Session terminée ! Tous les donneurs d\'ordre ont été traités.');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error moving to next donneur ordre:', error);
      alert('Erreur lors du passage au donneur d\'ordre suivant');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipDonneurOrdre = async () => {
    if (!currentSession || !currentDonneurOrdre) return;

    if (!confirm('Êtes-vous sûr de vouloir passer ce donneur d\'ordre sans saisir de marchés ?')) {
      return;
    }

    setLoading(true);
    try {
      await sessionService.markDonneurOrdreCompleted(
        currentSession.id,
        currentDonneurOrdre.id,
        0,
        notes || 'Passé sans saisie'
      );

      const updatedSession = await sessionService.getSession(currentSession.id);
      if (updatedSession) {
        setCurrentSession(updatedSession);
        setMarketsAddedThisDonneur(0);
        setNotes('');

        if (updatedSession.remaining_donneurs_ordre.length > 0) {
          setCurrentDonneurOrdre(updatedSession.remaining_donneurs_ordre[0]);
        } else {
          await sessionService.updateSessionStatus(currentSession.id, 'completed');
          alert('Session terminée !');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error skipping donneur ordre:', error);
      alert('Erreur lors du passage au donneur d\'ordre suivant');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDonneurOrdre = async (donneur: DonneurOrdre) => {
    setCurrentDonneurOrdre(donneur);
    setShowDonneurSelection(false);
    if (currentSession) {
      await sessionService.startDonneurOrdre(currentSession.id, donneur.id);
    }
  };

  const handlePauseSession = async () => {
    if (!currentSession) return;

    try {
      await sessionService.updateSessionStatus(currentSession.id, 'paused');
      onClose();
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const handlePublishSession = async () => {
    if (!currentSession) return;

    if (!confirm('Voulez-vous publier tous les marchés de cette session ? Ils seront alors visibles dans la recherche de marchés.')) {
      return;
    }

    setPublishing(true);
    try {
      const { data, error } = await supabase.rpc('publish_session_markets', {
        session_id: currentSession.id
      });

      if (error) {
        throw error;
      }

      const publishedCount = data?.[0]?.published_count || 0;

      if (publishedCount > 0) {
        alert(`${publishedCount} marché(s) ont été publiés avec succès et sont maintenant visibles dans la recherche !`);
        setRefreshMarkets(prev => prev + 1);
      } else {
        alert('Aucun marché à publier. Tous les marchés de cette session sont déjà publiés.');
      }
    } catch (error) {
      console.error('Error publishing session markets:', error);
      alert('Erreur lors de la publication des marchés. Veuillez réessayer.');
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen) return null;

  if (loading && !currentSession) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 max-w-md w-full mx-4`}>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 animate-spin text-orange-600" />
            <p className={isDark ? 'text-white' : 'text-gray-900'}>Chargement de la session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between flex-shrink-0`}>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
              Session de saisie - {operatorEmail}
            </h2>
            {currentSession && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {currentSession.completed_donneurs_ordre} / {currentSession.total_donneurs_ordre} traités
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-blue-600" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {currentSession.total_markets_added} marchés
                  </span>
                </div>
                {currentSession.total_markets_added > 0 && (
                  <button
                    onClick={handlePublishSession}
                    disabled={publishing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      publishing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
                    } text-white`}
                    title="Publier tous les marchés de cette session pour les rendre visibles dans la recherche"
                  >
                    <Upload className="w-4 h-4" />
                    {publishing ? 'Publication...' : 'Publier la session'}
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handlePauseSession}
            className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {showDonneurSelection ? (
            <div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Sélectionner un donneur d'ordre
              </h3>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {currentSession?.remaining_donneurs_ordre.map((donneur) => (
                  <button
                    key={donneur.id}
                    onClick={() => handleSelectDonneurOrdre(donneur)}
                    className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-4 rounded-lg text-left transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {donneur.name}
                        </h4>
                        {donneur.special_notes && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {donneur.special_notes}
                          </p>
                        )}
                      </div>
                      {donneur.markets_url && (
                        <ExternalLink className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDonneurSelection(false)}
                className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Annuler
              </button>
            </div>
          ) : currentDonneurOrdre ? (
            <div>
              <div className={`${isDark ? 'bg-gray-700' : 'bg-orange-50'} p-3 rounded-lg mb-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {currentDonneurOrdre.name}
                    </h3>
                    {currentDonneurOrdre.special_notes && (
                      <div className={`${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded p-3 mb-3`}>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                            {currentDonneurOrdre.special_notes}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentDonneurOrdre.markets_url && (
                      <a
                        href={currentDonneurOrdre.markets_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ouvrir le site des marchés
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDonneurSelection(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                  >
                    <ListChecks className="w-4 h-4" />
                    Changer de donneur d'ordre
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Save className="w-4 h-4" />
                    <span>{marketsAddedThisDonneur} marché(s) ajouté(s)</span>
                  </div>
                </div>

                <div className="mt-3">
                  <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observations..."
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    rows={2}
                  />
                </div>
              </div>

              <MarketEntryForm
                donneurOrdre={currentDonneurOrdre}
                sessionId={currentSession?.id || ''}
                onMarketAdded={handleMarketAdded}
              />

              {currentSession && (
                <div className="mt-6">
                  <SessionMarketsList
                    key={refreshMarkets}
                    sessionId={currentSession.id}
                    onUpdate={handleMarketDeleted}
                  />
                </div>
              )}

              <div className={`flex gap-3 justify-end mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={handleSkipDonneurOrdre}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <SkipForward className="w-4 h-4" />
                  Passer sans saisie
                </button>
                <button
                  onClick={handleNextDonneurOrdre}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Terminer ce donneur d'ordre
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Tous les donneurs d'ordre ont été traités !
              </h3>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
