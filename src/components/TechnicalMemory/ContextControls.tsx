import React from 'react';
import { Database, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';

interface ContextControlsProps {
  marketContext: any;
  knowledgeContext: any[];
  useMarketContext: boolean;
  useKnowledgeContext: boolean;
  onToggleMarketContext: (value: boolean) => void;
  onToggleKnowledgeContext: (value: boolean) => void;
  contextLoading: boolean;
}

export const ContextControls: React.FC<ContextControlsProps> = ({
  marketContext,
  knowledgeContext,
  useMarketContext,
  useKnowledgeContext,
  onToggleMarketContext,
  onToggleKnowledgeContext,
  contextLoading
}) => {

  if (contextLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Contexte marché</p>
              <p className="text-sm text-gray-500">
                {marketContext 
                  ? `${marketContext.title} (${marketContext.client})`
                  : 'Aucun contexte marché'
                }
              </p>
            </div>
            <button
              onClick={() => onToggleMarketContext(!useMarketContext)}
              disabled={!marketContext}
              className="transition-colors"
            >
              {useMarketContext && marketContext ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Base de connaissance</p>
              <p className="text-sm text-gray-500">
                {knowledgeContext.length > 0 
                  ? `${knowledgeContext.length} document(s) disponible(s)`
                  : 'Aucun document dans la base'
                }
              </p>
            </div>
            <button
              onClick={() => onToggleKnowledgeContext(!useKnowledgeContext)}
              disabled={knowledgeContext.length === 0}
              className="transition-colors"
            >
              {useKnowledgeContext && knowledgeContext.length > 0 ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
    </div>
  );
};