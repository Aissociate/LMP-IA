import React from 'react';
import { MapPin, Building, Calendar, Euro, Filter, X } from 'lucide-react';
import { BOAMPSearchParams } from '../../types/boamp';

interface QuickFiltersProps {
  filters: BOAMPSearchParams;
  onFiltersChange: (filters: BOAMPSearchParams) => void;
  onOpenAdvanced: () => void;
  isDark: boolean;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFiltersChange,
  onOpenAdvanced,
  isDark
}) => {
  const quickLocations = ['974 - Réunion', '75 - Paris', '13 - Bouches-du-Rhône', '69 - Rhône'];
  const quickTypes = ['Travaux', 'Fournitures', 'Services'];
  const quickAmounts = [
    { label: '< 40K€', max: 40000 },
    { label: '40K€ - 200K€', min: 40000, max: 200000 },
    { label: '> 200K€', min: 200000 }
  ];

  const hasActiveFilters = !!(
    filters.location?.length ||
    filters.serviceTypes?.length ||
    filters.amountMin ||
    filters.amountMax ||
    filters.deadlineFrom ||
    filters.deadlineTo ||
    filters.publicBuyer ||
    filters.cpvCode ||
    filters.procedureType
  );

  const activeFiltersCount =
    (filters.location?.length || 0) +
    (filters.serviceTypes?.length || 0) +
    (filters.publicBuyer ? 1 : 0) +
    (filters.cpvCode ? 1 : 0) +
    (filters.amountMin || filters.amountMax ? 1 : 0) +
    (filters.deadlineFrom || filters.deadlineTo ? 1 : 0) +
    (filters.procedureType ? 1 : 0);

  const toggleLocation = (location: string) => {
    const currentLocations = filters.location || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter(l => l !== location)
      : [...currentLocations, location];
    onFiltersChange({ ...filters, location: newLocations, page: 1 });
  };

  const toggleType = (type: string) => {
    const currentTypes = filters.serviceTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onFiltersChange({ ...filters, serviceTypes: newTypes, page: 1 });
  };

  const setAmountRange = (min?: number, max?: number) => {
    onFiltersChange({
      ...filters,
      amountMin: min,
      amountMax: max,
      page: 1
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 20,
      sortBy: 'publication_date',
      sortOrder: 'desc',
      deadlineFrom: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-xl shadow-sm border p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Filtres rapides
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                isDark
                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <X className="w-3 h-3" />
              Effacer tout
            </button>
          )}
          <button
            onClick={onOpenAdvanced}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 relative ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filtres avancés
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F77F00] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Location Quick Filters */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Localisation
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickLocations.map((location) => {
            const isActive = filters.location?.includes(location);
            return (
              <button
                key={location}
                onClick={() => toggleLocation(location)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#F77F00] text-white shadow-md'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {location}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type Quick Filters */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Type de marché
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickTypes.map((type) => {
            const isActive = filters.serviceTypes?.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#F77F00] text-white shadow-md'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Quick Filters */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Euro className="w-4 h-4 text-gray-400" />
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Montant
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((range, index) => {
            const isActive =
              filters.amountMin === range.min && filters.amountMax === range.max;
            return (
              <button
                key={index}
                onClick={() => setAmountRange(range.min, range.max)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#F77F00] text-white shadow-md'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.location?.map((loc) => (
              <span
                key={loc}
                className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                }`}
              >
                <MapPin className="w-3 h-3" />
                {loc}
                <button
                  onClick={() => toggleLocation(loc)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.serviceTypes?.map((type) => (
              <span
                key={type}
                className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
                  isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                }`}
              >
                <Building className="w-3 h-3" />
                {type}
                <button
                  onClick={() => toggleType(type)}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(filters.amountMin || filters.amountMax) && (
              <span
                className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
                  isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800'
                }`}
              >
                <Euro className="w-3 h-3" />
                {filters.amountMin || 0}€ - {filters.amountMax || '∞'}€
                <button
                  onClick={() => setAmountRange(undefined, undefined)}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
