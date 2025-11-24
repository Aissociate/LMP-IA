import React from 'react';
import { Wand2, RotateCcw, Sparkles, Lock, Image } from 'lucide-react';
import { ImageLibraryModal } from './ImageLibraryModal';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onPromptSave?: (prompt: string) => void;
  onGenerate?: () => void;
  isGenerating: boolean;
  isBlocked?: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onPromptChange,
  onPromptSave,
  onGenerate,
  isGenerating,
  isBlocked
}) => {
  const [originalPrompt, setOriginalPrompt] = React.useState(prompt);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isImageLibraryOpen, setIsImageLibraryOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    setOriginalPrompt(prompt);
    setHasUnsavedChanges(false);
  }, [prompt]);
  
  const resetPrompt = () => {
    onPromptChange(originalPrompt);
    setHasUnsavedChanges(false);
  };
  
  const handlePromptChange = (value: string) => {
    onPromptChange(value);
    setHasUnsavedChanges(value !== originalPrompt);
  };

  const handleSavePrompt = () => {
    if (onPromptSave && hasUnsavedChanges) {
      onPromptSave(prompt);
      setOriginalPrompt(prompt);
      setHasUnsavedChanges(false);
    }
  };

  const hasChanges = prompt !== originalPrompt;

  const handleInsertImage = (imageCode: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = prompt.substring(0, start) + '\n' + imageCode + '\n' + prompt.substring(end);
      onPromptChange(newText);
      setHasUnsavedChanges(true);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + imageCode.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      <ImageLibraryModal
        isOpen={isImageLibraryOpen}
        onClose={() => setIsImageLibraryOpen(false)}
        onInsertImage={handleInsertImage}
      />
      {hasUnsavedChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-orange-700 text-sm font-medium">
              Modifications non sauvegardées
            </span>
            {onPromptSave && (
              <button
                onClick={handleSavePrompt}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium px-2 py-1 rounded transition-colors"
              >
                Sauvegarder
              </button>
            )}
          </div>
        </div>
      )}
      
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          onBlur={handleSavePrompt}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm"
          placeholder="Décrivez ce que vous souhaitez générer pour cette section..."
        />
      
        <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">
                {prompt.length} caractères
                {prompt.length > 500 && (
                  <span className="ml-2 text-orange-600">• Prompt détaillé</span>
                )}
          </div>
          {hasUnsavedChanges && (
            <button
              onClick={resetPrompt}
              className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 rounded transition-colors flex items-center gap-1"
              title="Réinitialiser le prompt"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImageLibraryOpen(true)}
              className="text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-400 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:shadow-sm"
              title="Insérer une image"
            >
              <Image className="w-4 h-4" />
              <span className="text-sm font-medium">Images</span>
            </button>

            <button
              onClick={onGenerate}
              disabled={isGenerating || !prompt.trim() || isBlocked || !onGenerate}
              className={`font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${
                isBlocked
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isBlocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  Limite atteinte
                </>
              ) : (
                <>
                  <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Génération...' : 'Générer section'}
                </>
              )}
            </button>
          </div>
        </div>
    </div>
  );
};