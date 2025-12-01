import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  mode: 'keyword' | 'reference';
  onModeChange: (mode: 'keyword' | 'reference') => void;
  loading: boolean;
  isDark: boolean;
  recentSearches?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  mode,
  onModeChange,
  loading,
  isDark,
  recentSearches = []
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);

  const suggestions = mode === 'keyword'
    ? [
        'Travaux de voirie',
        'Fournitures de bureau',
        'Travaux de peinture',
        'Prestations informatiques',
        'Nettoyage de locaux',
        'Maintenance électrique'
      ]
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocused(false);
    }
  };

  const handleSearch = () => {
    onSearch();
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setTimeout(() => onSearch(), 100);
  };

  const filteredSuggestions = mode === 'keyword'
    ? suggestions.filter(s =>
        value.length >= 2 && s.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const showDropdown = focused && (filteredSuggestions.length > 0 || recentSearches.length > 0);

  return (
    <div className="relative">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onModeChange('keyword')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            mode === 'keyword'
              ? 'bg-[#F77F00] text-white shadow-md'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Mots-clés
        </button>
        <button
          onClick={() => onModeChange('reference')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            mode === 'reference'
              ? 'bg-[#F77F00] text-white shadow-md'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Référence
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className={`flex items-center gap-2 ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
        } border-2 rounded-xl transition-all ${
          focused ? 'border-[#F77F00] shadow-lg' : ''
        }`}>
          <div className="pl-4">
            <Search className={`w-5 h-5 ${focused ? 'text-[#F77F00]' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={
              mode === 'reference'
                ? 'Ex: 24-000001'
                : 'Recherchez par mots-clés : travaux, fournitures, services...'
            }
            className={`flex-1 py-3 bg-transparent outline-none ${
              isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="pr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`m-1.5 px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#F77F00] to-[#E06F00] hover:from-[#E06F00] hover:to-[#D05F00] text-white shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Rechercher
              </>
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div className={`absolute top-full left-0 right-0 mt-2 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto`}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Recherches récentes
                  </span>
                </div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(search)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-2 text-gray-400" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Suggestions populaires
                  </span>
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Search className="w-3 h-3 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      {!value && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Essayez :
          </span>
          {suggestions.slice(0, 4).map((tip, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(tip)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
