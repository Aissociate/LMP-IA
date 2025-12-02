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
import { marked } from 'marked';
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

      // Ajouter les sections de contenu avec numérotation automatique (commence à 1)
      for (let i = 0; i < sectionsWithContent.length; i++) {
        const section = sectionsWithContent[i];
        console.log(`[DocGen] Traitement section: ${section.title}`);

        // Renuméroter la section (enlever l'ancienne numérotation et ajouter la nouvelle, commence à 1)
        const cleanTitle = section.title.replace(/^\d+\.\s*/, '');
        const numberedTitle = `${i + 1}. ${cleanTitle}`;

        // Titre de la section avec style professionnel amélioré
        const sectionTitle = new Paragraph({
          children: [
            new TextRun({
              text: numberedTitle,
              bold: true,
              size: 40,
              font: "Calibri",
              color: "1e40af",
            }),
          ],
          spacing: { before: 480, after: 360 },
          shading: {
            fill: "e3f2fd",
            type: ShadingType.CLEAR,
          },
          border: {
            left: {
              color: "1e40af",
              space: 1,
              size: 30,
              style: BorderStyle.SINGLE,
            },
          },
          indent: {
            left: 240,
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

    // Nettoyer le contenu avant parsing
    let cleanContent = content;

    // Décoder les entités HTML dans tout le contenu
    cleanContent = this.decodeHTMLEntities(cleanContent);

    // Nettoyer les balises HTML restantes (sauf les sauts de ligne)
    cleanContent = cleanContent.replace(/<br\s*\/?>/gi, '\n');
    cleanContent = cleanContent.replace(/<\/p>/gi, '\n\n');
    cleanContent = cleanContent.replace(/<p>/gi, '');
    cleanContent = cleanContent.replace(/<div>/gi, '');
    cleanContent = cleanContent.replace(/<\/div>/gi, '\n');
    cleanContent = cleanContent.replace(/<strong>/gi, '**');
    cleanContent = cleanContent.replace(/<\/strong>/gi, '**');
    cleanContent = cleanContent.replace(/<b>/gi, '**');
    cleanContent = cleanContent.replace(/<\/b>/gi, '**');
    cleanContent = cleanContent.replace(/<em>/gi, '*');
    cleanContent = cleanContent.replace(/<\/em>/gi, '*');
    cleanContent = cleanContent.replace(/<i>/gi, '*');
    cleanContent = cleanContent.replace(/<\/i>/gi, '*');

    console.log('[DocGen] Contenu nettoyé (100 premiers caractères):', cleanContent.substring(0, 100));

    // Parser Markdown avec marked
    const tokens = marked.lexer(cleanContent);

    for (const token of tokens) {
      try {
        const docElements = await this.convertTokenToDocx(token);
        elements.push(...docElements);
      } catch (error) {
        console.error('[DocGen] Erreur conversion token:', error, token);
      }
    }

    return elements;
  }

  private async convertTokenToDocx(token: marked.Token): Promise<Array<Paragraph | Table>> {
    const elements: Array<Paragraph | Table> = [];

    switch (token.type) {
      case 'heading':
        elements.push(this.createHeading(token));
        break;

      case 'paragraph':
        elements.push(await this.createParagraphFromToken(token));
        break;

      case 'list':
        elements.push(...this.createList(token));
        break;

      case 'table':
        const table = await this.createTableFromToken(token);
        if (table) elements.push(table);
        break;

      case 'code':
        elements.push(this.createCodeBlock(token));
        break;

      case 'blockquote':
        elements.push(this.createBlockquote(token));
        break;

      case 'hr':
        elements.push(this.createHorizontalRule());
        break;

      case 'space':
        break;

      default:
        console.warn('[DocGen] Type de token non géré:', token.type);
    }

    return elements;
  }

  private createHeading(token: marked.Tokens.Heading): Paragraph {
    const sizes = [32, 28, 24, 22];
    const colors = ["1e40af", "1e40af", "374151", "4b5563"];
    const spacingBefore = [400, 360, 320, 280];
    const spacingAfter = [240, 200, 160, 140];

    const level = Math.min(token.depth, 4) - 1;

    return new Paragraph({
      children: this.parseInlineTokens(token.tokens || []),
      heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][level],
      spacing: { before: spacingBefore[level], after: spacingAfter[level] },
      keepNext: true,
    });
  }

  private async createParagraphFromToken(token: marked.Tokens.Paragraph): Promise<Paragraph> {
    // Vérifier si le paragraphe contient une image asset
    const text = token.text || '';
    const imageMatch = text.match(/!\[([^\]]*)\]\(asset:([^)]+)\)/);

    if (imageMatch) {
      const [, alt, assetId] = imageMatch;
      const imagePara = await this.createImageParagraph(assetId, alt);
      if (imagePara) return imagePara;
    }

    return new Paragraph({
      children: this.parseInlineTokens(token.tokens || []),
      spacing: { after: 240, line: 360 },
      alignment: AlignmentType.JUSTIFIED,
    });
  }

  private createList(token: marked.Tokens.List): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    token.items.forEach((item, index) => {
      const bullet = token.ordered ? `${index + 1}. ` : '• ';

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: bullet,
              size: 22,
              font: "Calibri",
              color: "1e40af",
            }),
            ...this.parseInlineTokens(item.tokens || []),
          ],
          indent: { left: 360 },
          spacing: { after: 160, line: 360 },
        })
      );
    });

    return paragraphs;
  }

  private createCodeBlock(token: marked.Tokens.Code): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: token.text,
          font: "Courier New",
          size: 20,
        }),
      ],
      shading: {
        fill: "f3f4f6",
        type: ShadingType.CLEAR,
      },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" },
      },
      spacing: { before: 200, after: 200 },
    });
  }

  private createBlockquote(token: marked.Tokens.Blockquote): Paragraph {
    const textContent = this.extractTextFromTokens(token.tokens || []);

    return new Paragraph({
      children: [
        new TextRun({
          text: textContent,
          italics: true,
          size: 22,
          font: "Calibri",
          color: "374151",
        }),
      ],
      shading: {
        fill: "f0f9ff",
        type: ShadingType.CLEAR,
      },
      border: {
        left: {
          color: "3b82f6",
          space: 1,
          size: 24,
          style: BorderStyle.SINGLE,
        },
      },
      indent: { left: 200 },
      spacing: { before: 200, after: 200 },
    });
  }

  private createHorizontalRule(): Paragraph {
    return new Paragraph({
      border: {
        bottom: {
          color: "d1d5db",
          space: 1,
          size: 12,
          style: BorderStyle.SINGLE,
        },
      },
      spacing: { before: 350, after: 350 },
    });
  }

  private decodeHTMLEntities(text: string): string {
    // Décoder les entités HTML communes
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x27;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&euro;': '€',
      '&copy;': '©',
      '&reg;': '®',
      '&deg;': '°',
      '&plusmn;': '±',
      '&times;': '×',
      '&divide;': '÷',
      '&ndash;': '–',
      '&mdash;': '—',
      '&laquo;': '«',
      '&raquo;': '»',
      '&hellip;': '…',
    };

    let decoded = text;

    // Remplacer les entités nommées
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char);
    }

    // Décoder les entités numériques (&#123; ou &#x1A;)
    decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return decoded;
  }

  private extractTextFromTokens(tokens: marked.Token[]): string {
    let text = '';
    for (const token of tokens) {
      if ('text' in token) {
        text += token.text + ' ';
      }
    }
    // Décoder les entités HTML
    return this.decodeHTMLEntities(text.trim());
  }

  private parseInlineTokens(tokens: marked.Token[]): TextRun[] {
    const runs: TextRun[] = [];

    for (const token of tokens) {
      if (token.type === 'text') {
        runs.push(new TextRun({
          text: this.decodeHTMLEntities(token.text),
          size: 22,
          font: "Calibri",
        }));
      } else if (token.type === 'strong') {
        const innerTokens = 'tokens' in token ? token.tokens : [];
        const text = this.extractTextFromTokens(innerTokens as marked.Token[]);
        runs.push(new TextRun({
          text: text,
          bold: true,
          size: 22,
          font: "Calibri",
        }));
      } else if (token.type === 'em') {
        const innerTokens = 'tokens' in token ? token.tokens : [];
        const text = this.extractTextFromTokens(innerTokens as marked.Token[]);
        runs.push(new TextRun({
          text: text,
          italics: true,
          size: 22,
          font: "Calibri",
        }));
      } else if (token.type === 'codespan') {
        runs.push(new TextRun({
          text: this.decodeHTMLEntities(token.text),
          font: "Courier New",
          size: 20,
          shading: {
            fill: "f3f4f6",
            type: ShadingType.CLEAR,
          },
        }));
      } else if (token.type === 'link') {
        const innerTokens = 'tokens' in token ? token.tokens : [];
        const text = this.extractTextFromTokens(innerTokens as marked.Token[]);
        runs.push(new TextRun({
          text: text,
          color: "2563eb",
          underline: {},
          size: 22,
          font: "Calibri",
        }));
      } else if (token.type === 'br') {
        runs.push(new TextRun({
          text: '',
          break: 1,
        }));
      }
    }

    if (runs.length === 0) {
      runs.push(new TextRun({
        text: '',
        size: 22,
        font: "Calibri",
      }));
    }

    return runs;
  }

  private async createTableFromToken(token: marked.Tokens.Table): Promise<Table | null> {
    const rows: TableRow[] = [];

    // En-tête
    if (token.header && token.header.length > 0) {
      const headerCells = token.header.map(cell => {
        const cellText = this.extractTextFromTokens(cell.tokens);
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: true,
                  size: 22,
                  font: "Calibri",
                  color: "ffffff",
                }),
              ],
              alignment: AlignmentType.LEFT,
            }),
          ],
          shading: {
            fill: "1e40af",
            type: ShadingType.CLEAR,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "1e40af" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "1e40af" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "1e40af" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "1e40af" },
          },
          margins: {
            top: 150,
            bottom: 150,
            left: 200,
            right: 200,
          },
          verticalAlign: VerticalAlign.CENTER,
        });
      });

      rows.push(
        new TableRow({
          children: headerCells,
          height: { value: 500, rule: 'atLeast' },
          cantSplit: true,
        })
      );
    }

    // Lignes de données
    token.rows.forEach((row, rowIndex) => {
      const rowCells = row.map(cell => {
        const cellText = this.extractTextFromTokens(cell.tokens);
        const isEvenRow = rowIndex % 2 === 0;

        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  size: 20,
                  font: "Calibri",
                  color: "374151",
                }),
              ],
              alignment: AlignmentType.LEFT,
            }),
          ],
          shading: {
            fill: isEvenRow ? "ffffff" : "f9fafb",
            type: ShadingType.CLEAR,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" },
          },
          margins: {
            top: 140,
            bottom: 140,
            left: 200,
            right: 200,
          },
          verticalAlign: VerticalAlign.CENTER,
        });
      });

      rows.push(
        new TableRow({
          children: rowCells,
          height: { value: 400, rule: 'atLeast' },
          cantSplit: true,
        })
      );
    });

    if (rows.length === 0) return null;

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

  private async createImageParagraph(assetId: string, alt: string): Promise<Paragraph | null> {
    try {
      const { data: asset, error } = await supabase
        .from('report_assets')
        .select('file_url, name')
        .eq('id', assetId)
        .maybeSingle();

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

      // Ajouter timeout de 5 secondes pour le téléchargement
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(asset.file_url, { signal: controller.signal });
      clearTimeout(timeoutId);

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

      // Créer l'ImageRun avec dimensions optimisées (largeur max 6 pouces = 576 pixels)
      // Hauteur max 4.5 pouces = 432 pixels, en conservant le ratio
      const imageRun = new ImageRun({
        data: uint8Array,
        transformation: {
          width: 576,
          height: 432,
        },
        type: imageType,
      });

      return new Paragraph({
        children: [imageRun],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
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
}

