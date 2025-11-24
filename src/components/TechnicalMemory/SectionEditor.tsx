import React from 'react';
import { CreditCard as Edit3, Save, Wand2, Copy, Check, Maximize2, Minimize2, Sparkles, FileText } from 'lucide-react';
import { Section } from '../../types/technicalMemory';
import { supabase } from '../../lib/supabase';

// Fonction pour convertir le Markdown en HTML avec support des assets
const convertMarkdownToHtml = async (text: string): Promise<string> => {
  // D'abord, traiter les assets images
  let processedText = text;
  
  // Trouver toutes les références d'assets
  const assetMatches = text.match(/!\[([^\]]*)\]\(asset:([^)]+)\)/g);
  
  if (assetMatches) {
    for (const match of assetMatches) {
      const assetRegex = /!\[([^\]]*)\]\(asset:([^)]+)\)/;
      const regexMatch = match.match(assetRegex);
      
      if (regexMatch) {
        const [fullMatch, alt, assetId] = regexMatch;
        
        try {
          // Récupérer l'asset depuis la base
          const { data: asset, error } = await supabase
            .from('report_assets')
            .select('file_url, name')
            .eq('id', assetId)
            .single();
          
          if (error || !asset) {
            processedText = processedText.replace(fullMatch, `[IMAGE NON TROUVÉE: ${alt || 'Image'} - ID: ${assetId}]`);
          } else {
            processedText = processedText.replace(fullMatch, `<img src="${asset.file_url}" alt="${alt || asset.name}" style="max-width: 66%; height: auto; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: block;" />`);
          }
        } catch (error) {
          console.error('Error processing asset:', error);
          processedText = processedText.replace(fullMatch, `[ERREUR IMAGE: ${alt || 'Image'} - ID: ${assetId}]`);
        }
      }
    }
  }
  
  // Traitement ligne par ligne pour une conversion plus robuste
  const lines = processedText.split('\n');
  const processedLines = [];
  let inTable = false;
  let tableRows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter les lignes de tableau (contiennent au moins 2 |)
    if (line.includes('|') && (line.match(/\|/g) || []).length >= 2) {
      // Ignorer les lignes de séparation (contiennent seulement |, -, : et espaces)
      if (line.match(/^[\|\s\-:]+$/)) {
        continue; // Ignorer cette ligne
      }
      
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      tableRows.push(line);
    } else {
      // Fin du tableau si on était dans un tableau
      if (inTable && tableRows.length > 0) {
        // Générer le tableau HTML
        let tableHTML = '<div class="overflow-x-auto my-6"><table class="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">';
        
        tableRows.forEach((tableRow, rowIndex) => {
          const cells = tableRow.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());

          if (cells.length > 0 && cells.some(cell => cell)) {
            const isHeader = rowIndex === 0;
            const rowClass = isHeader
              ? 'bg-gray-800 border-b-2 border-gray-600'
              : rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white';

            tableHTML += `<tr class="${rowClass}">`;

            cells.forEach(cell => {
              const cellTag = isHeader ? 'th' : 'td';
              const cellClass = isHeader
                ? 'px-6 py-4 text-left text-sm font-bold text-white border-r border-gray-600 last:border-r-0'
                : 'px-4 py-3 text-sm text-gray-700 border-r border-gray-200 last:border-r-0';

              tableHTML += `<${cellTag} class="${cellClass}">${cell || ''}</${cellTag}>`;
            });

            tableHTML += '</tr>';
          }
        });
        
        tableHTML += '</table></div>';
        processedLines.push(tableHTML);
        
        inTable = false;
        tableRows = [];
      }
      
      // Ajouter la ligne normale
      processedLines.push(line);
    }
  }
  
  // Traiter le dernier tableau si on finit dans un tableau
  if (inTable && tableRows.length > 0) {
    let tableHTML = '<div class="overflow-x-auto my-6"><table class="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">';
    
    tableRows.forEach((tableRow, rowIndex) => {
      const cells = tableRow.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());

      if (cells.length > 0 && cells.some(cell => cell)) {
        const isHeader = rowIndex === 0;
        const rowClass = isHeader
          ? 'bg-gray-800 border-b-2 border-gray-600'
          : rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white';

        tableHTML += `<tr class="${rowClass}">`;

        cells.forEach(cell => {
          const cellTag = isHeader ? 'th' : 'td';
          const cellClass = isHeader
            ? 'px-6 py-4 text-left text-sm font-bold text-white border-r border-gray-600 last:border-r-0'
            : 'px-4 py-3 text-sm text-gray-700 border-r border-gray-200 last:border-r-0';

          tableHTML += `<${cellTag} class="${cellClass}">${cell || ''}</${cellTag}>`;
        });

        tableHTML += '</tr>';
      }
    });
    
    tableHTML += '</table></div>';
    processedLines.push(tableHTML);
  }
  
  // Rejoindre toutes les lignes traitées
  let htmlContent = processedLines.join('\n');
  
  // Autres conversions Markdown (après traitement des tableaux)
  htmlContent = htmlContent
    // Protéger les blocs de code
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700"><code class="text-sm font-mono whitespace-pre-wrap">$1</code></pre>')
    
    // Titres (plus spécifique d'abord)
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mt-6 mb-3 text-gray-800 border-l-4 border-blue-300 pl-3">$1</h4>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-900 border-b-2 border-blue-200 pb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-12 mb-8 text-gray-900 border-b-4 border-blue-500 pb-4">$1</h1>')

    // Formatage de texte (plus spécifique d'abord)
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic text-gray-900 bg-yellow-100 px-1 rounded shadow-sm">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 bg-yellow-50 px-1 rounded">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-blue-700 font-medium">$1</em>')

    // Code inline
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 border border-gray-300 px-2 py-1 rounded-md text-sm font-mono text-gray-800 shadow-sm">$1</code>')

    // Liens
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800 font-medium hover:bg-blue-50 px-1 rounded transition-all duration-200" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Citations
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-300 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700 rounded-r-lg">$1</blockquote>')

    // Séparateurs
    .replace(/^---$/gm, '<hr class="border-t-2 border-gray-300 my-8" />')
    .replace(/^\*\*\*$/gm, '<hr class="border-t-2 border-gray-300 my-8" />');

  // Traiter les listes ligne par ligne
  const finalLines = htmlContent.split('\n');
  const finalProcessedLines = [];
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < finalLines.length; i++) {
    const line = finalLines[i];
    const trimmed = line.trim();
    
    // Détecter les listes à puces
    if (trimmed.match(/^[-*+] /)) {
      if (!inList || listType !== 'ul') {
        if (inList) finalProcessedLines.push(`</${listType}>`);
        finalProcessedLines.push('<ul class="my-4 space-y-2 ml-6">');
        inList = true;
        listType = 'ul';
      }
      const content = trimmed.replace(/^[-*+] /, '');
      finalProcessedLines.push(`<li class="flex items-start gap-3"><span class="text-blue-500 font-bold mt-1">•</span><span class="text-gray-700">${content}</span></li>`);
    }
    // Détecter les listes numérotées
    else if (trimmed.match(/^\d+\. /)) {
      if (!inList || listType !== 'ol') {
        if (inList) finalProcessedLines.push(`</${listType}>`);
        finalProcessedLines.push('<ol class="my-4 space-y-2 ml-6 list-decimal list-inside">');
        inList = true;
        listType = 'ol';
      }
      const content = trimmed.replace(/^\d+\. /, '');
      finalProcessedLines.push(`<li class="text-gray-700 pl-2">${content}</li>`);
    }
    // Ligne normale
    else {
      if (inList) {
        finalProcessedLines.push(`</${listType}>`);
        inList = false;
        listType = '';
      }
      finalProcessedLines.push(line);
    }
  }
  
  // Fermer la dernière liste si nécessaire
  if (inList) {
    finalProcessedLines.push(`</${listType}>`);
  }
  
  htmlContent = finalProcessedLines.join('\n');

  // Finaliser les sauts de ligne et paragraphes
  // Diviser en lignes et traiter les paragraphes intelligemment
  const paragraphLines = htmlContent.split('\n');
  const paragraphs = [];
  let currentParagraph = [];

  for (let i = 0; i < paragraphLines.length; i++) {
    const line = paragraphLines[i].trim();

    // Si c'est une ligne vide, terminer le paragraphe actuel
    if (!line) {
      if (currentParagraph.length > 0) {
        const joined = currentParagraph.join(' ');
        // Ne pas encapsuler dans <p> si c'est déjà un élément de bloc
        if (joined.match(/^<(h[1-6]|ul|ol|table|div|blockquote|pre|hr)/)) {
          paragraphs.push(joined);
        } else {
          paragraphs.push(`<p class="mb-4 text-gray-700 leading-relaxed text-justify">${joined}</p>`);
        }
        currentParagraph = [];
      }
    }
    // Si c'est un élément de bloc complet, l'ajouter directement
    else if (line.match(/^<(h[1-6]|ul|ol|table|div|blockquote|pre|hr)/)) {
      // Terminer le paragraphe en cours s'il existe
      if (currentParagraph.length > 0) {
        const joined = currentParagraph.join(' ');
        paragraphs.push(`<p class="mb-4 text-gray-700 leading-relaxed text-justify">${joined}</p>`);
        currentParagraph = [];
      }
      paragraphs.push(line);
    }
    // Sinon, ajouter au paragraphe actuel
    else {
      currentParagraph.push(line);
    }
  }

  // Ajouter le dernier paragraphe s'il existe
  if (currentParagraph.length > 0) {
    const joined = currentParagraph.join(' ');
    if (joined.match(/^<(h[1-6]|ul|ol|table|div|blockquote|pre|hr)/)) {
      paragraphs.push(joined);
    } else {
      paragraphs.push(`<p class="mb-4 text-gray-700 leading-relaxed text-justify">${joined}</p>`);
    }
  }

  return paragraphs.join('\n');
};

interface SectionEditorProps {
  section: Section;
  onToggleEdit: () => void;
  onContentChange: (content: string) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onToggleEdit,
  onContentChange
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [processedContent, setProcessedContent] = React.useState('');
  const [contentLoading, setContentLoading] = React.useState(false);
  
  // Traiter le contenu pour les assets à chaque changement
  React.useEffect(() => {
    if (section.content && !section.isEditing) {
      setContentLoading(true);
      convertMarkdownToHtml(section.content).then(html => {
        setProcessedContent(html);
        setContentLoading(false);
      });
    }
  }, [section.content, section.isEditing]);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!section.content && !section.isGenerating) {
    return (
      <div className="p-8 text-center bg-white">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Section vide</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
          Cette section est prête à être générée. Utilisez le bouton "Générer section" dans l'en-tête pour créer le contenu avec l'IA.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-sm text-blue-800 max-w-lg mx-auto">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span className="font-semibold">Astuce</span>
          </div>
          <p className="text-xs">Personnalisez le prompt ou utilisez la génération automatique.</p>
        </div>
      </div>
    );
  }

  if (!section.content) return null;

  const containerClasses = isFullscreen 
    ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-300'
    : 'h-full flex flex-col';

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 rounded">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900">
            Contenu généré
          </label>
            <div className="flex items-center gap-2 mt-1">
              <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                {Math.round(section.content.length / 1000)}k caractères
              </div>
              <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                ~{Math.round(section.content.split(' ').length)} mots
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-gray-600 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Copier le contenu"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-600 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title={isFullscreen ? "Réduire" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
            title={section.isEditing ? "Sauvegarder" : "Modifier"}
          >
            {section.isEditing ? (
              <Save className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className={`flex-1 overflow-y-auto ${isFullscreen ? 'max-h-[calc(100vh-200px)]' : ''}`}>
        {section.isEditing ? (
          <div className="p-4 bg-white">
            <textarea
              value={section.content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none font-mono text-sm ${
                isFullscreen ? 'min-h-[60vh]' : 'h-full min-h-[400px]'
              }`}
              placeholder="Contenu de la section..."
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {section.content.length} caractères • {Math.round(section.content.split(' ').length)} mots • Markdown supporté
              </div>
              <div className="text-xs text-gray-400">
                Ctrl+S pour sauvegarder
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto bg-white">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement des images...</span>
              </div>
            ) : (
              <div 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: processedContent
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {isFullscreen && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-end">
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded transition-colors text-sm"
          >
            Fermer le plein écran
          </button>
        </div>
      )}
    </div>
  );
};