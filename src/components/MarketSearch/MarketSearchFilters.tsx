import React from 'react';
import { X, Search } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { BOAMPSearchParams } from '../../types/boamp';

interface MarketSearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BOAMPSearchParams;
  onFiltersChange: (filters: BOAMPSearchParams) => void;
  onSearch: () => void;
}

const SERVICE_TYPES = [
  { value: 'Travaux', label: 'Travaux' },
  { value: 'Fournitures', label: 'Fournitures' },
  { value: 'Services', label: 'Services' }
];

const PROCEDURE_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'Procédure adaptée', label: 'Procédure adaptée' },
  { value: 'Procédure adaptée ouverte', label: 'Procédure adaptée ouverte' },
  { value: 'Appel d\'offres ouvert', label: 'Appel d\'offres ouvert' },
  { value: 'Appel d\'offres restreint', label: 'Appel d\'offres restreint' },
  { value: 'Marché négocié', label: 'Marché négocié' },
  { value: 'Dialogue compétitif', label: 'Dialogue compétitif' },
  { value: 'Concours', label: 'Concours' },
  { value: 'Procédure négociée avec mise en concurrence', label: 'Procédure négociée avec mise en concurrence' },
  { value: 'Procédure négociée sans mise en concurrence', label: 'Procédure négociée sans mise en concurrence' }
];

const FRENCH_REGIONS = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
  'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie',
  'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
];

export const MarketSearchFilters: React.FC<MarketSearchFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onSearch
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const handleServiceTypeToggle = (type: string) => {
    const current = filters.serviceTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, serviceTypes: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} h-full w-full md:w-[480px] shadow-2xl flex flex-col transition-colors duration-200`}
      >
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Filtres de recherche
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Mots-clés
            </label>
            <input
              type="text"
              value={filters.keywords || ''}
              onChange={(e) => onFiltersChange({ ...filters, keywords: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (onSearch(), onClose())}
              placeholder="Rechercher dans les annonces..."
              className={`w-full px-4 py-3 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
            />
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.searchInDCE || false}
                  onChange={(e) => onFiltersChange({ ...filters, searchInDCE: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rechercher les mots-clés dans les DCE des appels d'offres
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Localisation
            </label>
            <input
              type="text"
              value={filters.location?.join(', ') || ''}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [] })}
              placeholder="Toute la France"
              className={`w-full px-4 py-3 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Séparez les départements ou régions par des virgules (ex: 75, 92, Île-de-France)
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nature des prestations
            </label>
            <div className="space-y-2">
              {SERVICE_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.serviceTypes?.includes(type.value) || false}
                    onChange={() => handleServiceTypeToggle(type.value)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Acheteur public
            </label>
            <input
              type="text"
              value={filters.publicBuyer || ''}
              onChange={(e) => onFiltersChange({ ...filters, publicBuyer: e.target.value })}
              placeholder="Nom, code postal ou ville de l'acheteur public"
              className={`w-full px-4 py-3 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Code CPV
            </label>
            <input
              type="text"
              value={filters.cpvCode || ''}
              onChange={(e) => onFiltersChange({ ...filters, cpvCode: e.target.value })}
              placeholder="Code ou libellé du CPV"
              className={`w-full px-4 py-3 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Date de remise des plis
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={filters.deadlineFrom || ''}
                  onChange={(e) => onFiltersChange({ ...filters, deadlineFrom: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Du</p>
              </div>
              <div>
                <input
                  type="date"
                  value={filters.deadlineTo || ''}
                  onChange={(e) => onFiltersChange({ ...filters, deadlineTo: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Au</p>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Montant estimé
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={filters.amountMin || ''}
                  onChange={(e) => onFiltersChange({ ...filters, amountMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Min (€)"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.amountMax || ''}
                  onChange={(e) => onFiltersChange({ ...filters, amountMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Max (€)"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Type de procédure
            </label>
            <select
              value={filters.procedureType || ''}
              onChange={(e) => onFiltersChange({ ...filters, procedureType: e.target.value || undefined })}
              className={`w-full px-4 py-3 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
            >
              {PROCEDURE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              onSearch();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Search className="w-5 h-5" />
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
};
