import React, { useState } from 'react';
import { X, Search, MapPin, Phone, Mail, Building2, Briefcase, Loader2, ExternalLink, Users } from 'lucide-react';
import { BOAMPMarket } from '../../types/boamp';

interface Dirigeant {
  nom: string;
  prenom: string;
  entreprise: string;
  fonction: string;
  telephone?: string;
  email?: string;
  ville: string;
  departement: string;
  secteurActivite: string;
  siret?: string;
}

interface ProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: BOAMPMarket;
  isDark: boolean;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({
  isOpen,
  onClose,
  market,
  isDark
}) => {
  const [loading, setLoading] = useState(false);
  const [dirigeants, setDirigeants] = useState<Dirigeant[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const searchDirigeants = async () => {
    setLoading(true);
    setSearchPerformed(true);

    try {
      // Simulation de recherche - dans un cas réel, on appellerait une API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extraction du département depuis la localisation du marché
      const locationParts = market.location.split(/[\s,()-]+/).filter(Boolean);
      const departement = locationParts[locationParts.length - 1] || 'France';

      // Données de démonstration
      const mockDirigeants: Dirigeant[] = [
        {
          nom: 'Martin',
          prenom: 'Sophie',
          entreprise: 'EURL CONSTRUCTION MARTIN',
          fonction: 'Gérante',
          telephone: '06 12 34 56 78',
          email: 'contact@construction-martin.fr',
          ville: locationParts[0] || 'Paris',
          departement: departement,
          secteurActivite: 'Construction et travaux publics',
          siret: '123 456 789 00012'
        },
        {
          nom: 'Dubois',
          prenom: 'Jean',
          entreprise: 'SARL DUBOIS BTP',
          fonction: 'Président',
          telephone: '06 98 76 54 32',
          email: 'j.dubois@duboisbtp.fr',
          ville: locationParts[0] || 'Paris',
          departement: departement,
          secteurActivite: 'Bâtiment et génie civil',
          siret: '987 654 321 00034'
        },
        {
          nom: 'Lefebvre',
          prenom: 'Marie',
          entreprise: 'SAS LEFEBVRE TRAVAUX',
          fonction: 'Directrice Générale',
          telephone: '06 45 67 89 01',
          email: 'marie.lefebvre@lefebvre-travaux.com',
          ville: locationParts[0] || 'Paris',
          departement: departement,
          secteurActivite: 'Travaux de rénovation',
          siret: '456 789 123 00056'
        }
      ];

      setDirigeants(mockDirigeants);
    } catch (error) {
      console.error('Erreur lors de la recherche de dirigeants:', error);
      setDirigeants([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
          isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white'
        }`}
      >
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Users className="w-6 h-6 text-purple-500" />
              Prospection de dirigeants
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Recherche de dirigeants PME pour: {market.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!searchPerformed ? (
            <div className="text-center py-12">
              <div className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Rechercher des dirigeants PME</p>
                <p className="text-sm">
                  Location: <strong>{market.location}</strong>
                </p>
                <p className="text-sm">
                  Secteur: <strong>{market.client}</strong>
                </p>
              </div>
              <button
                onClick={searchDirigeants}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Lancer la recherche
                  </>
                )}
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Recherche de dirigeants en cours...
                </p>
              </div>
            </div>
          ) : dirigeants.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dirigeants.length} dirigeant(s) trouvé(s)
                </p>
                <button
                  onClick={searchDirigeants}
                  className={`text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Nouvelle recherche
                </button>
              </div>

              {dirigeants.map((dirigeant, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dirigeant.prenom} {dirigeant.nom}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        {dirigeant.fonction}
                      </p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      PME
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {dirigeant.entreprise}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {dirigeant.secteurActivite}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {dirigeant.ville}, {dirigeant.departement}
                      </span>
                    </div>
                  </div>

                  <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Coordonnées de contact
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dirigeant.telephone && (
                        <a
                          href={`tel:${dirigeant.telephone.replace(/\s/g, '')}`}
                          className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-colors ${
                            isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Phone className="w-4 h-4" />
                          {dirigeant.telephone}
                        </a>
                      )}
                      {dirigeant.email && (
                        <a
                          href={`mailto:${dirigeant.email}`}
                          className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-colors ${
                            isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          {dirigeant.email}
                        </a>
                      )}
                    </div>
                    {dirigeant.siret && (
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        SIRET: {dirigeant.siret}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucun dirigeant trouvé pour cette recherche
              </p>
              <button
                onClick={searchDirigeants}
                className="mt-4 text-purple-600 hover:text-purple-700 text-sm flex items-center gap-2 mx-auto"
              >
                <Search className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
