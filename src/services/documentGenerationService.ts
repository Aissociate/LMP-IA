import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} from 'docx';
import { saveAs } from 'file-saver';
import { Section } from '../types/technicalMemory';
import { supabase } from '../lib/supabase';

interface DocumentGenerationOptions {
  marketTitle: string;
  marketReference?: string;
  client?: string;
  sections: Section[];
}

export class DocumentGenerationService {
  private static instance: DocumentGenerationService;

  static getInstance(): DocumentGenerationService {
    if (!DocumentGenerationService.instance) {
      DocumentGenerationService.instance = new DocumentGenerationService();
    }
    return DocumentGenerationService.instance;
  }

  async generateWordDocument(options: DocumentGenerationOptions): Promise<void> {
    const { marketTitle, marketReference, client, sections } = options;

    try {
      console.log('[DocGen] Génération document Word démarrée...');

      // Filtrer les sections activées et avec du contenu
      const sectionsWithContent = sections
        .filter(section => section.isEnabled !== false && section.content && section.content.trim());

      if (sectionsWithContent.length === 0) {
        throw new Error('Aucune section avec du contenu à exporter');
      }

      console.log(`[DocGen] ${sectionsWithContent.length} sections à inclure`);

      const documentChildren = [];

      // Page de garde professionnelle
      documentChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "" })],
          spacing: { before: convertInchesToTwip(2) },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "MÉMOIRE TECHNIQUE",
              bold: true,
              size: 48,
              font: "Calibri",
              color: "1a56db",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: convertInchesToTwip(0.5) },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: marketTitle,
              bold: true,
              size: 32,
              font: "Calibri",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: convertInchesToTwip(0.3) },
        })
      );

      if (marketReference) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Référence: ${marketReference}`,
                size: 24,
                font: "Calibri",
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: convertInchesToTwip(0.2) },
          })
        );
      }

      if (client) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Client: ${client}`,
                size: 24,
                font: "Calibri",
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: convertInchesToTwip(0.3) },
          })
        );
      }

      documentChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "" })],
          spacing: { after: convertInchesToTwip(1) },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              size: 20,
              font: "Calibri",
              color: "999999",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: "" })],
          pageBreakBefore: true,
        })
      );

      // Préparer les sections du document DOCX avec en-têtes et pieds de page
      const docSections = [];

      // Section de couverture (sans en-tête ni pied de page)
      docSections.push({
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: documentChildren,
      });

      // Ajouter les sections de contenu avec numérotation automatique
      for (let i = 0; i < sectionsWithContent.length; i++) {
        const section = sectionsWithContent[i];
        console.log(`[DocGen] Traitement section: ${section.title}`);

        // Renuméroter la section (enlever l'ancienne numérotation et ajouter la nouvelle)
        const cleanTitle = section.title.replace(/^\d+\.\s*/, '');
        const numberedTitle = `${i}. ${cleanTitle}`;

        // Titre de la section
        const sectionTitle = new Paragraph({
          children: [
            new TextRun({
              text: numberedTitle,
              bold: true,
              size: 32,
              font: "Calibri",
              color: "1e40af",
            }),
          ],
          spacing: { before: 400, after: 300 },
          shading: {
            fill: "e3f2fd",
            type: ShadingType.CLEAR,
          },
          border: {
            left: {
              color: "1e40af",
              space: 1,
              size: 24,
              style: BorderStyle.SINGLE,
            },
          },
          indent: {
            left: 200,
          },
        });

        const paragraphs = await this.processTextContent(section.content);
        const sectionChildren = [sectionTitle, ...paragraphs];

        // Créer en-tête et pied de page
        const headerText = `${marketTitle}${marketReference ? ' - ' + marketReference : ''}`;
        const footerText = `Généré le ${new Date().toLocaleDateString('fr-FR')}`;

        docSections.push({
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: headerText,
                      size: 18,
                      font: "Calibri",
                      color: "6b7280",
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 100 },
                  border: {
                    bottom: {
                      color: "d1d5db",
                      space: 1,
                      size: 6,
                      style: BorderStyle.SINGLE,
                    },
                  },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: footerText + " - Page ",
                      size: 18,
                      font: "Calibri",
                      color: "6b7280",
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 18,
                      font: "Calibri",
                      color: "6b7280",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100 },
                  border: {
                    top: {
                      color: "d1d5db",
                      space: 1,
                      size: 6,
                      style: BorderStyle.SINGLE,
                    },
                  },
                }),
              ],
            }),
          },
          children: sectionChildren,
        });
      }

      const doc = new Document({
        sections: docSections,
        creator: "Mon marché Public.fr",
        title: `Mémoire Technique - ${marketTitle}`,
        description: `Mémoire technique généré pour le marché: ${marketTitle}`,
      });

      console.log('[DocGen] Document Word créé, génération du blob...');

      const blob = await Packer.toBlob(doc);
      const fileName = `Memoire_Technique_${marketTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.docx`;

      console.log(`[DocGen] Téléchargement du fichier: ${fileName}`);
      saveAs(blob, fileName);

      console.log('[DocGen] ✅ Document Word généré et téléchargé avec succès!');

    } catch (error) {
      console.error('[DocGen] ❌ Erreur génération Word:', error);
      throw new Error(`Erreur lors de la génération du document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processTextContent(content: string): Promise<Array<Paragraph | Table>> {
    const elements: Array<Paragraph | Table> = [];
    const lines = content.split('\n');

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      // Détecter les images
      const imageMatch = line.match(/!\[([^\]]*)\]\(asset:([^)]+)\)/);
      if (imageMatch) {
        const [, alt, assetId] = imageMatch;
        const imageElement = await this.createImageParagraph(assetId, alt);
        if (imageElement) {
          elements.push(imageElement);
        }
        i++;
        continue;
      }

      // Détecter les tableaux
      if (line.includes('|') && (line.match(/\|/g) || []).length >= 2) {
        const tableLines: string[] = [];
        while (i < lines.length) {
          const tableLine = lines[i].trim();
          if (tableLine.includes('|') && (tableLine.match(/\|/g) || []).length >= 2) {
            if (!tableLine.match(/^[\|\s\-:]+$/)) {
              tableLines.push(tableLine);
            }
            i++;
          } else {
            break;
          }
        }

        if (tableLines.length > 0) {
          const table = this.createTable(tableLines);
          if (table) {
            elements.push(table);
          }
        }
        continue;
      }

      // Titres avec espacement amélioré
      if (line.startsWith('####')) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/^####\s*/, ''),
                bold: true,
                size: 22,
                font: "Calibri",
                color: "4b5563",
              }),
            ],
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 280, after: 140 },
            keepNext: true,
          })
        );
      } else if (line.startsWith('###')) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/^###\s*/, ''),
                bold: true,
                size: 24,
                font: "Calibri",
                color: "374151",
              }),
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 320, after: 160 },
            keepNext: true,
          })
        );
      } else if (line.startsWith('##')) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/^##\s*/, ''),
                bold: true,
                size: 28,
                font: "Calibri",
                color: "1e40af",
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 200 },
            keepNext: true,
          })
        );
      } else if (line.startsWith('#')) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/^#\s*/, ''),
                bold: true,
                size: 32,
                font: "Calibri",
                color: "1e40af",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 240 },
            keepNext: true,
          })
        );
      } else if (line.startsWith('-') || line.startsWith('•')) {
        const textRuns = this.parseInlineFormatting(line.replace(/^[-•]\s*/, ''));
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ',
                size: 22,
                font: "Calibri",
                color: "1e40af",
              }),
              ...textRuns,
            ],
            indent: { left: 360 },
            spacing: { after: 160, line: 360 },
          })
        );
      } else if (line.match(/^\d+\./)) {
        const textRuns = this.parseInlineFormatting(line.replace(/^\d+\.\s*/, ''));
        const numberMatch = line.match(/^(\d+)\./);
        const number = numberMatch ? numberMatch[1] : '1';
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${number}. `,
                size: 22,
                font: "Calibri",
                color: "1e40af",
              }),
              ...textRuns,
            ],
            indent: { left: 360 },
            spacing: { after: 160, line: 360 },
          })
        );
      } else {
        const textRuns = this.parseInlineFormatting(line);
        elements.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 200, line: 360 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }

      i++;
    }

    return elements;
  }

  private parseInlineFormatting(text: string): TextRun[] {
    const textRuns: TextRun[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;

    let lastIndex = 0;
    let match;

    const combinedRegex = /\*\*(.+?)\*\*|\*(.+?)\*/g;

    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        textRuns.push(new TextRun({
          text: text.substring(lastIndex, match.index),
          size: 22,
          font: "Calibri",
        }));
      }

      if (match[1]) {
        textRuns.push(new TextRun({
          text: match[1],
          bold: true,
          size: 22,
          font: "Calibri",
        }));
      } else if (match[2]) {
        textRuns.push(new TextRun({
          text: match[2],
          italics: true,
          size: 22,
          font: "Calibri",
        }));
      }

      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      textRuns.push(new TextRun({
        text: text.substring(lastIndex),
        size: 22,
        font: "Calibri",
      }));
    }

    if (textRuns.length === 0) {
      textRuns.push(new TextRun({
        text: text,
        size: 22,
        font: "Calibri",
      }));
    }

    return textRuns;
  }

  private async createImageParagraph(assetId: string, alt: string): Promise<Paragraph | null> {
    try {
      const { data: asset, error } = await supabase
        .from('report_assets')
        .select('file_url, name')
        .eq('id', assetId)
        .single();

      if (error || !asset) {
        console.warn(`[DocGen] Asset introuvable: ${assetId}`);
        return new Paragraph({
          children: [
            new TextRun({
              text: `[Image non trouvée: ${alt || 'Image'}]`,
              italics: true,
              color: "999999",
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        });
      }

      console.log(`[DocGen] Téléchargement image: ${asset.file_url}`);
      const response = await fetch(asset.file_url);
      if (!response.ok) {
        console.warn(`[DocGen] Échec téléchargement: ${asset.file_url}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Déterminer le type d'image
      const contentType = response.headers.get('content-type') || '';
      let imageType: 'png' | 'jpg' | 'gif' | 'bmp' = 'png';

      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        imageType = 'jpg';
      } else if (contentType.includes('gif')) {
        imageType = 'gif';
      } else if (contentType.includes('bmp')) {
        imageType = 'bmp';
      }

      console.log(`[DocGen] Image chargée (${imageType}): ${uint8Array.length} bytes`);

      // Créer l'ImageRun avec des dimensions raisonnables (largeur max 6 pouces)
      const imageRun = new ImageRun({
        data: uint8Array,
        transformation: {
          width: 500,
          height: 375,
        },
        type: imageType,
      });

      return new Paragraph({
        children: [imageRun],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      });
    } catch (error) {
      console.error('[DocGen] Erreur chargement image:', error);
      return new Paragraph({
        children: [
          new TextRun({
            text: `[Erreur chargement image: ${alt || 'Image'}]`,
            italics: true,
            color: "ff0000",
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      });
    }
  }

  private cleanCellText(text: string): string {
    let cleaned = text;

    // Nettoyer toutes les balises HTML
    cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
    cleaned = cleaned.replace(/<\/p>/gi, ' ');
    cleaned = cleaned.replace(/<\/div>/gi, ' ');
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // Nettoyer tous les marqueurs Markdown
    cleaned = cleaned.replace(/^#+\s*/gm, ''); // Titres
    cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // Gras + Italique
    cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1'); // Gras
    cleaned = cleaned.replace(/\*(.+?)\*/g, '$1'); // Italique
    cleaned = cleaned.replace(/_(.+?)_/g, '$1'); // Italique underscore
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Code inline
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Liens

    // Nettoyer les entités HTML
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    cleaned = cleaned.replace(/&quot;/g, '"');
    cleaned = cleaned.replace(/&#39;/g, "'");
    cleaned = cleaned.replace(/&#x27;/g, "'");

    // Nettoyer les espaces multiples
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  private createTableCellContent(cellText: string, isHeader: boolean): Paragraph[] {
    const baseSize = isHeader ? 22 : 20;
    const baseColor = isHeader ? "1a56db" : "000000";

    console.log(`[DocGen] Cellule AVANT nettoyage: "${cellText.substring(0, 100)}"`);

    // Nettoyer complètement le texte
    const cleanedText = this.cleanCellText(cellText);

    console.log(`[DocGen] Cellule APRÈS nettoyage: "${cleanedText.substring(0, 100)}"`);

    // Si le texte est vide
    if (!cleanedText || cleanedText.trim() === '') {
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: '',
              size: baseSize,
              font: "Calibri",
            }),
          ],
        }),
      ];
    }

    // Créer un paragraphe simple avec le texte nettoyé
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: cleanedText,
            bold: isHeader,
            size: baseSize,
            font: "Calibri",
            color: baseColor,
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
      }),
    ];
  }

  private parseInlineFormattingForTable(text: string, isHeader: boolean): TextRun[] {
    const textRuns: TextRun[] = [];
    const baseSize = isHeader ? 22 : 20;
    const baseColor = isHeader ? "1a56db" : "000000";

    // Nettoyer les marqueurs Markdown en trop (### ** etc au début)
    let cleanedText = text.replace(/^#+\s*/g, '');

    // Pour les en-têtes, nettoyer le markdown et tout mettre en gras
    if (isHeader) {
      cleanedText = cleanedText.replace(/\*\*(.+?)\*\*/g, '$1');
      cleanedText = cleanedText.replace(/\*(.+?)\*/g, '$1');
      cleanedText = cleanedText.replace(/`([^`]+)`/g, '$1');

      return [
        new TextRun({
          text: cleanedText,
          bold: true,
          size: baseSize,
          font: "Calibri",
          color: baseColor,
        }),
      ];
    }

    // Pour les cellules normales, parser le formatage Markdown
    // Traiter d'abord le gras (**texte**) puis l'italique (*texte*)
    const segments: Array<{text: string, bold?: boolean, italic?: boolean}> = [];
    let currentIndex = 0;

    // Regex pour détecter **gras** et *italique*
    const boldRegex = /\*\*([^*]+?)\*\*/g;
    const italicRegex = /\*([^*]+?)\*/g;

    // D'abord, remplacer temporairement les gras pour éviter les conflits
    const boldMatches: Array<{index: number, length: number, text: string}> = [];
    let boldMatch;

    while ((boldMatch = boldRegex.exec(cleanedText)) !== null) {
      boldMatches.push({
        index: boldMatch.index,
        length: boldMatch[0].length,
        text: boldMatch[1]
      });
    }

    // Construire les segments
    let processedText = cleanedText;
    const allSegments: Array<{start: number, end: number, text: string, bold: boolean, italic: boolean}> = [];

    // Marquer les segments en gras
    boldMatches.forEach(match => {
      allSegments.push({
        start: match.index,
        end: match.index + match.length,
        text: match.text,
        bold: true,
        italic: false
      });
    });

    // Si pas de formatage, retourner texte simple
    if (allSegments.length === 0) {
      // Vérifier italique seul
      const italicMatch = italicRegex.exec(cleanedText);
      if (!italicMatch) {
        return [
          new TextRun({
            text: cleanedText,
            size: baseSize,
            font: "Calibri",
            color: baseColor,
          }),
        ];
      }
    }

    // Construire les TextRuns en parcourant le texte
    let lastPos = 0;

    // Trier par position
    allSegments.sort((a, b) => a.start - b.start);

    allSegments.forEach(segment => {
      // Ajouter texte avant
      if (segment.start > lastPos) {
        const beforeText = cleanedText.substring(lastPos, segment.start);
        if (beforeText) {
          textRuns.push(new TextRun({
            text: beforeText,
            size: baseSize,
            font: "Calibri",
            color: baseColor,
          }));
        }
      }

      // Ajouter segment formaté
      textRuns.push(new TextRun({
        text: segment.text,
        bold: segment.bold,
        italics: segment.italic,
        size: baseSize,
        font: "Calibri",
        color: baseColor,
      }));

      lastPos = segment.end;
    });

    // Ajouter texte après
    if (lastPos < cleanedText.length) {
      const afterText = cleanedText.substring(lastPos);
      if (afterText) {
        textRuns.push(new TextRun({
          text: afterText,
          size: baseSize,
          font: "Calibri",
          color: baseColor,
        }));
      }
    }

    // Si aucun TextRun créé, retourner texte brut
    if (textRuns.length === 0) {
      textRuns.push(new TextRun({
        text: cleanedText,
        size: baseSize,
        font: "Calibri",
        color: baseColor,
      }));
    }

    return textRuns;
  }

  private createTable(tableLines: string[]): Table | null {
    if (tableLines.length === 0) return null;

    const rows: TableRow[] = [];

    tableLines.forEach((line, rowIndex) => {
      const cells = line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());

      if (cells.length === 0 || !cells.some(cell => cell)) return;

      const isHeader = rowIndex === 0;

      const tableCells = cells.map(cellText => {
        const cellParagraphs = this.createTableCellContent(cellText, isHeader);

        return new TableCell({
          children: cellParagraphs,
          shading: {
            fill: isHeader ? "1E40AF" : (rowIndex % 2 === 1 ? "f9fafb" : "ffffff"),
            type: ShadingType.CLEAR,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
          },
          margins: {
            top: 120,
            bottom: 120,
            left: 180,
            right: 180,
          },
          verticalAlign: VerticalAlign.CENTER,
        });
      });

      rows.push(
        new TableRow({
          children: tableCells,
          height: { value: isHeader ? 450 : 400, rule: 'atLeast' },
          cantSplit: true,
        })
      );
    });

    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      margins: {
        top: 300,
        bottom: 300,
      },
    });
  }
}