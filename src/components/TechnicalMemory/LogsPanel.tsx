import React from 'react';
import { Terminal, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LogsPanelProps {
  logs: string[];
  showLogs: boolean;
  onToggleLogs: () => void;
  onClearLogs: () => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({
  logs,
  showLogs,
  onToggleLogs,
  onClearLogs
}) => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin || logs.length === 0) return null;

  return (
    <>
      <button
        onClick={onToggleLogs}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
        title={`Console de logs (${logs.length} entrées)`}
      >
        <Terminal className="w-3 h-3" />
        {logs.length}
        {showLogs ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />}
      </button>

      {showLogs && (
        <div className="absolute top-16 right-4 z-50 w-80 bg-gray-900 rounded-lg p-3 text-white font-mono text-xs shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-green-400" />
              <span className="font-semibold text-green-400 text-xs">Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClearLogs}
                className="text-gray-400 hover:text-white text-xs px-1 py-0.5 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={onToggleLogs}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5 bg-black rounded p-2">
            {logs.map((log, index) => (
              <div key={index} className="text-xs leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};