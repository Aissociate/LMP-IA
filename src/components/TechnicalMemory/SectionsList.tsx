import React from 'react';
import { Section } from '../../types/technicalMemory';

interface SectionsListProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  activeSection,
  onSectionChange
}) => {
  return (
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const hasContent = section.content.length > 0;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left p-3 rounded transition-all duration-200 group ${
                  isActive
                    ? `bg-blue-600 text-white`
                    : hasContent
                    ? 'bg-green-50 border border-green-200 text-green-800 hover:bg-green-100'
                   : section.isGenerating
                   ? 'bg-purple-50 border border-purple-200 text-purple-800 animate-pulse'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${
                    isActive 
                      ? 'bg-blue-500' 
                      : hasContent
                      ? 'bg-green-100'
                      : section.isGenerating
                      ? 'bg-purple-100'
                      : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-3 h-3 ${
                      isActive
                        ? 'text-white'
                        : hasContent
                        ? 'text-green-600'
                        : section.isGenerating
                        ? 'text-purple-600'
                        : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs">{section.title}</span>
                      {hasContent && !isActive && !section.isGenerating && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      )}
                      {section.isGenerating && (
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    {section.isGenerating && (
                      <p className="text-xs opacity-70 mt-0.5">
                        Génération en cours...
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
  );
};