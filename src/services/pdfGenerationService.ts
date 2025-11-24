import { Section } from '../types/technicalMemory';
import { supabase } from '../lib/supabase';

interface PDFGenerationOptions {
  marketTitle: string;
  marketReference?: string;
  client?: string;
  sections: Section[];
}

export class PDFGenerationService {
  private static instance: PDFGenerationService;

  static getInstance(): PDFGenerationService {
    if (!PDFGenerationService.instance) {
      PDFGenerationService.instance = new PDFGenerationService();
    }
    return PDFGenerationService.instance;
  }

  async generatePDF(options: PDFGenerationOptions): Promise<void> {
    const { marketTitle, marketReference, client, sections } = options;

    try {
      console.log('[PDFGen] Génération PDF démarrée...');

      // Filtrer les sections activées et avec du contenu
      const sectionsWithContent = sections.filter(section => section.isEnabled !== false && section.content && section.content.trim());

      if (sectionsWithContent.length === 0) {
        throw new Error('Aucune section avec du contenu à exporter');
      }

      console.log(`[PDFGen] ${sectionsWithContent.length} sections à inclure`);
      console.log('[PDFGen] Sections:', sectionsWithContent.map(s => ({ title: s.title, contentLength: s.content?.length || 0 })));

      // Convertir le Markdown en HTML avec styles
      const htmlContent = await this.convertSectionsToHTML(sectionsWithContent, {
        marketTitle,
        marketReference,
        client
      });

      // Générer le PDF côté client avec window.print()
      await this.generatePDFFromBrowser(htmlContent, marketTitle);

      console.log('[PDFGen] ✅ PDF généré avec succès!');
      
    } catch (error) {
      console.error('[PDFGen] ❌ Erreur génération PDF:', error);
      throw new Error(`Erreur lors de la génération du PDF: ${(error as Error).message}`);
    }
  }

  private async generatePDFFromBrowser(htmlContent: string, filename: string): Promise<void> {
    // Créer un iframe plein écran pour l'aperçu et l'impression
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '0';
    printFrame.style.left = '0';
    printFrame.style.width = '100%';
    printFrame.style.height = '100%';
    printFrame.style.border = 'none';
    printFrame.style.zIndex = '9999';
    printFrame.style.backgroundColor = 'white';

    document.body.appendChild(printFrame);

    const iframeDoc = printFrame.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(printFrame);
      throw new Error('Impossible de créer l\'aperçu d\'impression');
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Attendre que tout soit chargé
    await new Promise<void>((resolve) => {
      if (printFrame.contentWindow) {
        printFrame.contentWindow.onload = () => {
          setTimeout(resolve, 500);
        };
      }
      setTimeout(resolve, 1000);
    });

    // Fonction pour nettoyer
    const cleanup = () => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    };

    // Ajouter des boutons de contrôle dans l'iframe
    if (printFrame.contentWindow && iframeDoc.body) {
      const controlBar = iframeDoc.createElement('div');
      controlBar.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.6)); padding: 15px; display: flex; gap: 10px; justify-content: center; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.3);';

      controlBar.innerHTML = `
        <button id="printBtn" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-family: system-ui; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;">
          🖨️ Imprimer / Sauver en PDF
        </button>
        <button id="closeBtn" style="background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-family: system-ui; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;">
          ✕ Fermer
        </button>
      `;

      iframeDoc.body.insertBefore(controlBar, iframeDoc.body.firstChild);

      // Ajouter les event listeners
      const printBtn = iframeDoc.getElementById('printBtn');
      const closeBtn = iframeDoc.getElementById('closeBtn');

      if (printBtn) {
        printBtn.addEventListener('click', () => {
          printFrame.contentWindow?.print();
        });
        printBtn.addEventListener('mouseenter', (e) => {
          (e.target as HTMLElement).style.background = '#2563eb';
          (e.target as HTMLElement).style.transform = 'translateY(-1px)';
        });
        printBtn.addEventListener('mouseleave', (e) => {
          (e.target as HTMLElement).style.background = '#3b82f6';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', cleanup);
        closeBtn.addEventListener('mouseenter', (e) => {
          (e.target as HTMLElement).style.background = '#dc2626';
          (e.target as HTMLElement).style.transform = 'translateY(-1px)';
        });
        closeBtn.addEventListener('mouseleave', (e) => {
          (e.target as HTMLElement).style.background = '#ef4444';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        });
      }

      // Ajouter un style pour cacher la barre lors de l'impression
      const style = iframeDoc.createElement('style');
      style.textContent = '@media print { #printBtn, #closeBtn { display: none !important; } }';
      iframeDoc.head.appendChild(style);
    }

    // Déclencher l'impression automatiquement après un court délai
    setTimeout(() => {
      printFrame.contentWindow?.print();
    }, 100);
  }

  private async convertSectionsToHTML(sections: Section[], metadata: { marketTitle: string; marketReference?: string; client?: string }): Promise<string> {
    const { marketTitle, marketReference, client } = metadata;

    // Styles CSS inline pour un rendu fidèle avec en-têtes et pieds de page
    const styles = `
      <style>
        @page {
          size: A4;
          margin: 25mm 25mm 25mm 25mm;
        }

        body {
          font-family: Calibri, 'Segoe UI', Arial, sans-serif;
          line-height: 1.8;
          color: #1f2937;
          font-size: 11pt;
          background: white;
          counter-reset: page;
        }

        .cover-page {
          text-align: center;
          padding: 100px 40px;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          page-break-after: always;
        }

        .cover-title {
          font-size: 36pt;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 3px;
          line-height: 1.3;
        }

        .cover-subtitle {
          font-size: 24pt;
          font-weight: 600;
          color: #374151;
          margin-bottom: 50px;
          line-height: 1.4;
        }

        .cover-info {
          font-size: 14pt;
          color: #6b7280;
          margin: 15px 0;
        }

        .page-header {
          display: none;
        }

        .page-footer {
          display: none;
        }

        .content-page {
          page-break-before: always;
          min-height: 100vh;
          position: relative;
        }

        .section {
          page-break-before: always;
          margin-bottom: 50px;
          padding-top: 20px;
        }

        .section:first-of-type {
          page-break-before: avoid;
        }

        .section-title {
          font-size: 18pt;
          font-weight: bold;
          color: #1e40af;
          padding: 15px 25px;
          background: #e3f2fd;
          border-left: 6px solid #1e40af;
          margin-bottom: 30px;
          page-break-after: avoid;
        }

        h1 {
          font-size: 16pt;
          font-weight: bold;
          color: #1f2937;
          margin: 35px 0 20px 0;
          padding-bottom: 8px;
          border-bottom: 3px solid #3b82f6;
          page-break-after: avoid;
          line-height: 1.4;
        }

        h2 {
          font-size: 14pt;
          font-weight: bold;
          color: #1f2937;
          margin: 30px 0 18px 0;
          padding-bottom: 6px;
          border-bottom: 2px solid #93c5fd;
          page-break-after: avoid;
          line-height: 1.4;
        }

        h3 {
          font-size: 12pt;
          font-weight: 600;
          color: #374151;
          margin: 25px 0 15px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid #e5e7eb;
          page-break-after: avoid;
          line-height: 1.4;
        }

        h4 {
          font-size: 11pt;
          font-weight: 600;
          color: #4b5563;
          margin: 20px 0 12px 0;
          padding-left: 15px;
          border-left: 4px solid #93c5fd;
          page-break-after: avoid;
          line-height: 1.4;
        }

        p {
          margin: 15px 0;
          text-align: justify;
          line-height: 1.8;
          orphans: 3;
          widows: 3;
        }

        strong {
          font-weight: 700;
          color: #1f2937;
        }

        strong em, em strong {
          font-weight: 700;
          font-style: italic;
        }

        em {
          font-style: italic;
          color: #1f2937;
        }

        code {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', Consolas, monospace;
          font-size: 10pt;
          color: #374151;
        }

        pre {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 20px 0;
          page-break-inside: avoid;
        }

        pre code {
          background: none;
          border: none;
          padding: 0;
          color: #1f2937;
        }

        ul, ol {
          margin: 18px 0;
          padding-left: 30px;
          line-height: 1.8;
        }

        li {
          margin: 10px 0;
          line-height: 1.8;
        }

        ul li {
          list-style-type: disc;
        }

        ol li {
          list-style-type: decimal;
        }

        a {
          color: #2563eb;
          text-decoration: underline;
        }

        blockquote {
          border-left: 4px solid #3b82f6;
          background: #f0f9ff;
          padding: 15px 20px;
          margin: 20px 0;
          font-style: italic;
          color: #374151;
          page-break-inside: avoid;
        }

        hr {
          border: none;
          border-top: 2px solid #d1d5db;
          margin: 35px 0;
        }

        table {
          page-break-inside: avoid;
        }

        img {
          page-break-inside: avoid;
          max-width: 100%;
          height: auto;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .page-header {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 15mm;
            padding: 8mm 25mm 5mm 25mm;
            border-bottom: 1px solid #d1d5db;
            background: white;
            font-size: 9pt;
            color: #6b7280;
          }

          .page-footer {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 15mm;
            padding: 5mm 25mm;
            border-top: 1px solid #d1d5db;
            background: white;
            font-size: 9pt;
            color: #6b7280;
            text-align: center;
          }

          .cover-page .page-header,
          .cover-page .page-footer {
            display: none !important;
          }

          .section {
            page-break-before: always;
            page-break-inside: avoid;
          }

          .section:first-of-type {
            page-break-before: avoid;
          }

          h1, h2, h3, h4 {
            page-break-after: avoid;
          }

          p, li {
            orphans: 3;
            widows: 3;
          }

          table, img, pre, blockquote {
            page-break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }

        @media screen {
          body {
            max-width: 210mm;
            margin: 0 auto;
            padding: 25mm;
          }

          .page-header {
            display: block;
            padding: 15px 25px;
            margin-bottom: 20px;
            border-bottom: 1px solid #d1d5db;
            background: #f9fafb;
            font-size: 9pt;
            color: #6b7280;
          }

          .page-footer {
            display: block;
            padding: 15px 25px;
            margin-top: 40px;
            border-top: 1px solid #d1d5db;
            background: #f9fafb;
            font-size: 9pt;
            color: #6b7280;
            text-align: center;
          }
        }
      </style>
    `;
    
    // En-tête et pied de page (masqués sur la page de garde)
    const headerContent = `${marketTitle}${marketReference ? ' - ' + marketReference : ''}`;
    const footerContent = `Généré le ${new Date().toLocaleDateString('fr-FR')}`;

    // Page de couverture
    const coverPage = `
      <div class="cover-page">
        <div class="cover-title">Mémoire Technique</div>
        <div class="cover-subtitle">${marketTitle}</div>
        ${marketReference ? `<div class="cover-info">Référence: ${marketReference}</div>` : ''}
        ${client ? `<div class="cover-info">Client: ${client}</div>` : ''}
        <div class="cover-info">Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
      </div>
    `;

    // Contenu des sections avec en-têtes et pieds de page et numérotation automatique
    const sectionsHTMLArray = await Promise.all(sections.map(async (section, index) => {
      console.log(`[convertSectionsToHTML] Processing section ${index + 1}/${sections.length}: ${section.title}`);
      console.log(`[convertSectionsToHTML] Section content length: ${section.content?.length || 0}`);

      // Renuméroter la section (enlever l'ancienne numérotation et ajouter la nouvelle)
      const cleanTitle = section.title.replace(/^\d+\.\s*/, '');
      const numberedTitle = `${index}. ${cleanTitle}`;

      const htmlContent = await this.convertMarkdownToHTML(section.content);
      console.log(`[convertSectionsToHTML] HTML content length: ${htmlContent?.length || 0}`);
      console.log(`[convertSectionsToHTML] HTML preview:`, htmlContent.substring(0, 200));
      return `
        <div class="section">
          <div class="page-header">${headerContent}</div>
          <div class="section-title">${numberedTitle}</div>
          ${htmlContent}
          <div class="page-footer">${footerContent} - Page <span class="page-number"></span></div>
        </div>
      `;
    }));
    const sectionsHTML = sectionsHTMLArray.join('\n');
    console.log('[convertSectionsToHTML] Total sections HTML length:', sectionsHTML.length);

    // Document HTML complet
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mémoire Technique - ${marketTitle}</title>
        ${styles}
      </head>
      <body>
        ${coverPage}
        ${sectionsHTML}
      </body>
      </html>
    `;
  }

  private async convertMarkdownToHTML(markdown: string): Promise<string> {
    console.log('[convertMarkdownToHTML] START - input length:', markdown?.length || 0);

    if (!markdown || !markdown.trim()) {
      console.log('[convertMarkdownToHTML] Empty markdown, returning empty string');
      return '';
    }

    // Traiter d'abord les images assets
    const processedMarkdown = await this.processAssetImages(markdown);
    console.log('[convertMarkdownToHTML] After processAssetImages:', processedMarkdown.length);

    // Traitement ligne par ligne pour gérer les tableaux et autres éléments
    const lines = processedMarkdown.split('\n');
    console.log('[convertMarkdownToHTML] Number of lines:', lines.length);
    const processedLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Détecter les lignes de tableau (contiennent au moins 2 |)
      if (line.includes('|') && (line.match(/\|/g) || []).length >= 2) {
        // Ignorer les lignes de séparation
        if (line.match(/^[\|\s\-:]+$/)) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableRows = [];
        }

        tableRows.push(line);
      } else {
        // Fin du tableau si on était dans un tableau
        if (inTable && tableRows.length > 0) {
          processedLines.push(this.generateTableHTML(tableRows));
          inTable = false;
          tableRows = [];
        }

        // Ajouter la ligne normale
        processedLines.push(line);
      }
    }

    // Traiter le dernier tableau si on finit dans un tableau
    if (inTable && tableRows.length > 0) {
      processedLines.push(this.generateTableHTML(tableRows));
    }

    // Rejoindre toutes les lignes traitées
    let htmlContent = processedLines.join('\n');

    // Autres conversions Markdown
    htmlContent = htmlContent
      // Protéger les blocs de code
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

      // Titres (plus spécifique d'abord)
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')

      // Formatage de texte (plus spécifique d'abord)
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Code inline
      .replace(/`([^`]+)`/g, '<code>$1</code>')

      // Liens
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

      // Citations
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

      // Séparateurs
      .replace(/^---$/gm, '<hr />')
      .replace(/^\*\*\*$/gm, '<hr />');

    // Traiter les listes
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
          finalProcessedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        const content = trimmed.replace(/^[-*+] /, '');
        finalProcessedLines.push(`<li>${content}</li>`);
      }
      // Détecter les listes numérotées
      else if (trimmed.match(/^\d+\. /)) {
        if (!inList || listType !== 'ol') {
          if (inList) finalProcessedLines.push(`</${listType}>`);
          finalProcessedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        const content = trimmed.replace(/^\d+\. /, '');
        finalProcessedLines.push(`<li>${content}</li>`);
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

    // Traitement des paragraphes
    const paragraphLines = htmlContent.split('\n');
    const paragraphs = [];
    let currentParagraph = [];

    for (let i = 0; i < paragraphLines.length; i++) {
      const line = paragraphLines[i].trim();

      if (!line) {
        if (currentParagraph.length > 0) {
          const joined = currentParagraph.join(' ');
          if (joined.match(/^<(h[1-6]|ul|ol|table|div|blockquote|pre|hr)/)) {
            paragraphs.push(joined);
          } else {
            paragraphs.push(`<p>${joined}</p>`);
          }
          currentParagraph = [];
        }
      }
      else if (line.match(/^<(h[1-6]|ul|ol|table|div|blockquote|pre|hr)/)) {
        if (currentParagraph.length > 0) {
          const joined = currentParagraph.join(' ');
          paragraphs.push(`<p>${joined}</p>`);
          currentParagraph = [];
        }
        paragraphs.push(line);
      }
      else {
        currentParagraph.push(line);
      }
    }

    if (currentParagraph.length > 0) {
      const joined = currentParagraph.join(' ');
      if (joined.match(/^<(h[1-6]|ul|ol|table|div|blockquote|pre|hr)/)) {
        paragraphs.push(joined);
      } else {
        paragraphs.push(`<p>${joined}</p>`);
      }
    }

    const result = paragraphs.join('\n');
    console.log('[convertMarkdownToHTML] END - output length:', result.length);
    console.log('[convertMarkdownToHTML] Output preview (300 chars):', result.substring(0, 300));
    return result;
  }

  private generateTableHTML(tableRows: string[]): string {
    let tableHTML = '<div style="overflow-x: auto; margin: 25px 0; page-break-inside: avoid;"><table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; background: white;">';

    tableRows.forEach((tableRow, rowIndex) => {
      const cells = tableRow.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());

      if (cells.length > 0 && cells.some(cell => cell)) {
        const isHeader = rowIndex === 0;
        const rowStyle = isHeader
          ? 'background: #1e40af; border-bottom: 2px solid #1e40af;'
          : rowIndex % 2 === 1 ? 'background: #f9fafb;' : 'background: white;';

        tableHTML += `<tr style="${rowStyle}">`;

        cells.forEach(cell => {
          const cellTag = isHeader ? 'th' : 'td';
          const cleanedCell = this.cleanMarkdownFromText(cell);
          const cellStyle = isHeader
            ? 'padding: 12px 16px; text-align: left; font-size: 11pt; font-weight: bold; color: white; border: 1px solid #1e40af;'
            : 'padding: 10px 14px; font-size: 10pt; color: #374151; border: 1px solid #e5e7eb; line-height: 1.6;';

          tableHTML += `<${cellTag} style="${cellStyle}">${cleanedCell || ''}</${cellTag}>`;
        });

        tableHTML += '</tr>';
      }
    });

    tableHTML += '</table></div>';
    return tableHTML;
  }

  private cleanMarkdownFromText(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Nettoyer les marqueurs Markdown mais préserver le formatage de base
    cleaned = cleaned.replace(/^#+\s*/gm, '');
    cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    cleaned = cleaned.replace(/\*(.+?)\*/g, '<em>$1</em>');
    cleaned = cleaned.replace(/_(.+?)_/g, '<em>$1</em>');
    cleaned = cleaned.replace(/`([^`]+)`/g, '<code>$1</code>');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    return cleaned.trim();
  }

  private async processAssetImages(markdown: string): Promise<string> {
    // Trouver toutes les références d'assets
    const assetRegex = /!\[([^\]]*)\]\(asset:([^)]+)\)/g;
    const matches = Array.from(markdown.matchAll(assetRegex));

    if (matches.length === 0) {
      return markdown;
    }

    let processedMarkdown = markdown;

    // Traiter chaque asset de manière séquentielle
    for (const match of matches) {
      const [fullMatch, alt, assetId] = match;
      try {
        // Récupérer l'URL de l'asset
        const { data: asset, error } = await supabase
          .from('report_assets')
          .select('file_url, name')
          .eq('id', assetId)
          .maybeSingle();

        if (error || !asset) {
          processedMarkdown = processedMarkdown.replace(
            fullMatch,
            `[IMAGE NON TROUVÉE: ${alt || 'Image'} - ID: ${assetId}]`
          );
        } else {
          processedMarkdown = processedMarkdown.replace(
            fullMatch,
            `<img src="${asset.file_url}" alt="${alt || asset.name}" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />`
          );
        }
      } catch (error) {
        console.error('Error processing asset image:', error);
        processedMarkdown = processedMarkdown.replace(
          fullMatch,
          `[ERREUR IMAGE: ${alt || 'Image'} - ID: ${assetId}]`
        );
      }
    }

    return processedMarkdown;
  }
}