interface DocumentContent {
  text: string;
  metadata: {
    pages?: number;
    words?: number;
    fileType: string;
  };
}

class DocumentExtractor {
  async extractContent(fileBlob: Blob, fileName: string): Promise<DocumentContent> {
    const fileType = this.getFileType(fileName);
    
    console.log(`[DocumentExtractor] Extraction démarrée pour ${fileName}, type: ${fileType}, taille: ${fileBlob.size} bytes`);
    
    try {
      switch (fileType) {
        case 'txt':
          return this.extractTextContent(fileBlob);
        case 'pdf':
          return this.extractPdfContent(fileBlob);
        case 'docx':
          return this.extractDocxContent(fileBlob);
        case 'doc':
          return this.extractDocContent(fileBlob, fileName);
        case 'xlsx':
        case 'xls':
          return this.extractExcelContent(fileBlob);
        default:
          return this.extractAsText(fileBlob, fileName);
      }
    } catch (error) {
      console.error(`[DocumentExtractor] Erreur extraction ${fileName}:`, error);
      return {
        text: `ERREUR D'EXTRACTION - ${fileName}

Le contenu de ce document n'a pas pu être extrait automatiquement.
Type de fichier: ${fileType}
Taille: ${fileBlob.size} bytes
Erreur: ${error.message || 'Erreur inconnue'}

Veuillez vérifier que le fichier n'est pas corrompu.`,
        metadata: {
          fileType,
          words: 0
        }
      };
    }
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension;
  }

  private async extractTextContent(fileBlob: Blob): Promise<DocumentContent> {
    console.log('[DocumentExtractor] Extraction TXT...');
    const text = await fileBlob.text();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    
    console.log(`[DocumentExtractor] TXT extrait: ${text.length} caractères, ${words} mots`);
    
    return {
      text,
      metadata: {
        fileType: 'txt',
        words
      }
    };
  }

  private async extractPdfContent(fileBlob: Blob): Promise<DocumentContent> {
    console.log('[DocumentExtractor] Extraction PDF simple (inspiré de pdfplumber)...');
    
    try {
      // Charger PDF.js dynamiquement via CDN (comme l'expert)
      const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.mjs');
      
      // Worker via CDN (recommandé par l'expert)
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.mjs';
      
      const arrayBuffer = await fileBlob.arrayBuffer();
      
      // Chargement PDF avec la méthode de l'expert
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`[DocumentExtractor] PDF chargé: ${pdf.numPages} pages`);
      
      let fullText = '';
      
      // Boucle exacte de l'expert (for let p = 1; p <= pdf.numPages; p++)
      for (let p = 1; p <= pdf.numPages; p++) {
        try {
          const page = await pdf.getPage(p);
          
          // Méthode de l'expert : tc.items.map(i => i.str).join(" ")
          const tc = await page.getTextContent();
          const pageText = tc.items.map((i: any) => i.str).join(" ");
          
          // Format identique à l'expert et Python
          if (pageText && pageText.length > 0) {
            fullText += `\n=== Page ${p} ===\n`;
            fullText += pageText.trim() + '\n';
          }
          
          console.log(`[DocumentExtractor] Page ${p}: ${pageText.length} caractères extraits`);
          
        } catch (pageError) {
          console.warn(`[DocumentExtractor] Erreur page ${p}:`, pageError);
          fullText += `\n=== Page ${p} - ERREUR ===\n`;
          fullText += 'Impossible d\'extraire le texte de cette page\n';
        }
      }
      
      // Nettoyage simple du texte final
      const cleanText = fullText
        .replace(/\s+/g, ' ') // Normaliser les espaces
        .trim();
      
      const words = cleanText.split(/\s+/).filter(w => w.length > 0).length;
      
      console.log(`[DocumentExtractor] Extraction terminée: ${cleanText.length} caractères, ${words} mots`);

      return {
        text: cleanText.length > 0 ? cleanText : 'Document PDF vide ou sans texte',
        metadata: {
          fileType: 'pdf',
          words,
          pages: pdf.numPages
        }
      };
      
    } catch (error) {
      console.error('[DocumentExtractor] Erreur extraction PDF:', error);
      
      // Message d'erreur simple
      return {
        text: `ERREUR EXTRACTION PDF: ${error?.message || 'Erreur inconnue'}

Le fichier PDF n'a pas pu être traité. 
Vérifiez que le fichier n'est pas corrompu ou protégé.`,
        metadata: {
          fileType: 'pdf',
          words: 0
        }
      };
    }
  }

  private async extractDocxContent(fileBlob: Blob): Promise<DocumentContent> {
    console.log('[DocumentExtractor] Extraction DOCX...');
    
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await fileBlob.arrayBuffer();
      
      console.log(`[DocumentExtractor] DOCX - Fichier de ${arrayBuffer.byteLength} bytes`);
      
      // EXTRACTION COMPLÈTE du texte brut (sans formatage)
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const text = result.value || '';
      
      // Vérifications de complétude
      const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      
      console.log(`[DocumentExtractor] DOCX EXTRACTION COMPLÈTE:`);
      console.log(`  - ${text.length} caractères extraits`);
      console.log(`  - ${words} mots`);
      console.log(`  - ${paragraphs.length} paragraphes`);
      console.log(`  - ${sentences.length} phrases`);
      
      // Messages d'avertissement si le document semble avoir des problèmes
      if (result.messages && result.messages.length > 0) {
        console.warn('[DocumentExtractor] DOCX - Messages d\'avertissement:');
        result.messages.forEach(msg => console.warn(`  - ${msg.message}`));
      }

      return {
        text: text || 'Document DOCX vide ou illisible',
        metadata: {
          fileType: 'docx',
          words,
          paragraphs: paragraphs.length,
          sentences: sentences.length,
          extractionMessages: result.messages?.length || 0
        }
      };
    } catch (error) {
      console.error('[DocumentExtractor] Erreur extraction DOCX:', error);
      return {
        text: `Document DOCX - ERREUR D'EXTRACTION

Impossible d'extraire le contenu: ${error.message}

Le document pourrait être protégé, corrompu ou dans un format non standard.`,
        metadata: {
          fileType: 'docx',
          words: 0
        }
      };
    }
  }

  private async extractDocContent(fileBlob: Blob, fileName: string): Promise<DocumentContent> {
    console.log('[DocumentExtractor] Tentative extraction DOC (format ancien)...');
    
    return {
      text: `Document DOC: ${fileName}

ATTENTION: Format .doc (ancien Word) non supporté pour l'extraction automatique.

Veuillez convertir le document en DOCX ou PDF pour une analyse complète.`,
      metadata: {
        fileType: 'doc',
        words: 0
      }
    };
  }

  private async extractExcelContent(fileBlob: Blob): Promise<DocumentContent> {
    console.log('[DocumentExtractor] Extraction Excel...');
    
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await fileBlob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let fullText = '';
      let totalCells = 0;
      let totalSheets = 0;
      let totalRows = 0;

      console.log(`[DocumentExtractor] Excel - ${workbook.SheetNames.length} feuilles détectées`);

      // EXTRACTION COMPLÈTE - toutes les feuilles
      workbook.SheetNames.forEach(sheetName => {
        totalSheets++;
        console.log(`[DocumentExtractor] Traitement feuille: ${sheetName}`);
        
        fullText += `\n\n=== FEUILLE ${totalSheets}: ${sheetName} ===\n`;
        
        const sheet = workbook.Sheets[sheetName];
        
        // EXTRACTION COMPLÈTE - toutes les lignes avec données
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1, 
          raw: false,
          defval: '' // Valeur par défaut pour les cellules vides
        });
        
        let sheetRows = 0;
        let sheetCells = 0;
        
        jsonData.forEach((row: any[], rowIndex) => {
          if (row.some(cell => cell && cell.toString().trim())) {
            const rowText = row
              .map(cell => cell ? cell.toString().trim() : '')
              .join(' | ');
            fullText += `Ligne ${rowIndex + 1}: ${rowText}\n`;
            sheetRows++;
            sheetCells += row.filter(cell => cell && cell.toString().trim()).length;
          }
        });
        
        totalRows += sheetRows;
        totalCells += sheetCells;
        
        console.log(`[DocumentExtractor] Feuille "${sheetName}": ${sheetRows} lignes, ${sheetCells} cellules`);
      });

      console.log(`[DocumentExtractor] Excel EXTRACTION COMPLÈTE:`);
      console.log(`  - ${totalSheets} feuilles traitées`);
      console.log(`  - ${totalRows} lignes avec données`);
      console.log(`  - ${totalCells} cellules extraites`);
      console.log(`  - Texte final: ${fullText.length} caractères`);

      const words = fullText.split(/\s+/).filter(word => word.length > 0).length;
      
      console.log(`[DocumentExtractor] Excel extraction terminée: ${fullText.length} caractères, ${words} mots`);

      return {
        text: fullText.trim() || 'Fichier Excel vide',
        metadata: {
          fileType: 'excel',
          words,
          totalSheets,
          totalRows,
          totalCells
        }
      };
    } catch (error) {
      console.error('[DocumentExtractor] Erreur extraction Excel:', error);
      return {
        text: `Fichier Excel - ERREUR D'EXTRACTION

Impossible de lire le contenu: ${error.message}

Vérifiez que le fichier n'est pas protégé ou corrompu.`,
        metadata: {
          fileType: 'excel',
          words: 0
        }
      };
    }
  }

  private async extractAsText(fileBlob: Blob, fileName: string): Promise<DocumentContent> {
    console.log(`[DocumentExtractor] Tentative extraction comme texte brut: ${fileName}`);
    
    try {
      const text = await fileBlob.text();
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      
      console.log(`[DocumentExtractor] Texte brut extrait: ${text.length} caractères, ${words} mots`);
      
      return {
        text: text || `Fichier ${fileName} - contenu vide`,
        metadata: {
          fileType: 'unknown',
          words
        }
      };
    } catch (error) {
      return {
        text: `Fichier binaire: ${fileName}

Ce type de fichier ne peut pas être analysé automatiquement.
Formats supportés: PDF, DOCX, TXT, Excel (XLSX/XLS).

Veuillez convertir le document dans un format supporté.`,
        metadata: {
          fileType: 'binary',
          words: 0
        }
      };
    }
  }

  private cleanTextContent(text: string): string {
    return text
      // Remplacer les caractères de contrôle par des espaces
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      // Remplacer les séquences d'échappement Unicode problématiques
      .replace(/\\u[0-9a-fA-F]{4}/g, ' ')
      .replace(/\\x[0-9a-fA-F]{2}/g, ' ')
      .replace(/\\[0-7]{1,3}/g, ' ')
      // Nettoyer les caractères de formatage PDF
      .replace(/\\[nrtbf]/g, ' ')
      .replace(/\\/g, '')
      // Normaliser les espaces
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const documentExtractor = new DocumentExtractor();