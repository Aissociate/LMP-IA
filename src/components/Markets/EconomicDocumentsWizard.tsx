import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Euro, FileText, Calculator, TrendingUp, Award, Download, Save, Plus, Trash2, Sparkles, Upload, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { LogService } from '../../services/logService';
import { LogsPanel } from '../TechnicalMemory/LogsPanel';

interface EconomicDocumentsWizardProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  marketTitle: string;
}

type DocumentType = 'bpu' | 'dqe' | 'dpgf' | 'cadre_economique' | 'fiche_valeur';

interface BPUItem {
  id: string;
  numero: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire: number;
  totalHT: number;
}

interface EconomicDocument {
  id: DocumentType;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  color: string;
}

const economicDocuments: EconomicDocument[] = [
  {
    id: 'bpu',
    title: 'Bordereau des Prix Unitaires',
    shortTitle: 'BPU',
    icon: Calculator,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'fiche_valeur',
    title: 'Fiche de valeur',
    shortTitle: 'Valeur',
    icon: Award,
    color: 'from-pink-500 to-pink-600'
  }
];

export const EconomicDocumentsWizard: React.FC<EconomicDocumentsWizardProps> = ({
  isOpen,
  onClose,
  marketId,
  marketTitle
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>('bpu');
  const [bpuItems, setBpuItems] = useState<BPUItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const logService = useRef(LogService.getInstance()).current;
  const isGeneratingRef = useRef(false);
  const [ficheValeurContent, setFicheValeurContent] = useState('');
  const [isEditingFicheValeur, setIsEditingFicheValeur] = useState(false);
  const [isLoadingFicheValeur, setIsLoadingFicheValeur] = useState(false);
  const [ficheValeurPrompt, setFicheValeurPrompt] = useState(`Génère une fiche "Synthèse de valeur" professionnelle structurée en 5 parties :

## 1. Contexte et compréhension du besoin
- Phrase d'accroche montrant la compréhension des enjeux
- Résumé des besoins du CCTP (qualité, délais, contraintes)
- Rappel du périmètre et du volume global

## 2. Notre réponse en 3 points forts
Tableau avec 3 axes principaux :
- **Organisation** : Équipe, coordination, expérience
- **Qualité & environnement** : Matériaux, certifications, performance durable
- **Délais & réactivité** : Planning, reporting, transparence

## 3. Stratégie prix et cohérence économique
- Répartition du coût global par poste (main d'œuvre, matériaux, logistique, sécurité)
- Positionnement tarifaire justifié et raisonné

## 4. Engagements transversaux (critères RC)
Arguments selon les critères du règlement de consultation :
- Développement durable
- Sécurité
- Insertion sociale
- Innovation

## 5. Synthèse visuelle finale
- Notre promesse en une phrase
- Tableau récapitulatif : Prix / Technique / Délais / Innovation

Utilise un ton professionnel, des tableaux markdown et des émojis pertinents (🏗️, 💶, 🌱, ⏱️, 🎯).`);

  useEffect(() => {
    if (isOpen && marketId) {
      if (bpuItems.length === 0) {
        loadBPUData();
      }
      loadFicheValeur();
    }
  }, [isOpen, marketId]);

  // Recharger la fiche valeur quand on navigue vers cette section
  useEffect(() => {
    if (selectedDocument === 'fiche_valeur' && marketId && user?.id) {
      loadFicheValeur();
    }
  }, [selectedDocument]);

  useEffect(() => {
    const unsubscribe = logService.subscribe((newLogs) => {
      setLogs(newLogs);
    });
    return () => unsubscribe();
  }, [logService]);

  const loadFicheValeur = async () => {
    if (!marketId || !user?.id) {
      console.log('loadFicheValeur: marketId ou user.id manquant', { marketId, userId: user?.id });
      return;
    }

    setIsLoadingFicheValeur(true);
    try {
      console.log('Loading fiche valeur for market:', marketId);
      const { data, error } = await supabase
        .from('fiche_valeur')
        .select('content, prompt')
        .eq('market_id', marketId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading fiche valeur:', error);
        return;
      }

      console.log('Fiche valeur data loaded:', data);

      if (data) {
        console.log('Setting fiche valeur content, length:', data.content?.length);
        setFicheValeurContent(data.content || '');
        if (data.prompt) {
          setFicheValeurPrompt(data.prompt);
        }
      } else {
        console.log('No fiche valeur found for this market');
        // Réinitialiser le contenu si aucune fiche n'existe pour ce marché
        setFicheValeurContent('');
      }
    } catch (error) {
      console.error('Error loading fiche valeur:', error);
    } finally {
      setIsLoadingFicheValeur(false);
    }
  };

  const saveFicheValeur = async (content: string) => {
    if (!marketId || !user?.id) {
      console.log('saveFicheValeur: marketId ou user.id manquant', { marketId, userId: user?.id });
      return;
    }

    try {
      console.log('Saving fiche valeur for market:', marketId, 'content length:', content.length);

      const dataToSave = {
        market_id: marketId,
        user_id: user.id,
        content: content,
        prompt: ficheValeurPrompt,
        updated_at: new Date().toISOString()
      };

      console.log('Data to save:', dataToSave);

      const { data, error } = await supabase
        .from('fiche_valeur')
        .upsert(dataToSave, {
          onConflict: 'market_id'
        })
        .select();

      if (error) {
        console.error('Error saving fiche valeur:', error);
        throw error;
      }

      console.log('Fiche valeur saved successfully:', data);
      logService.addLog('💾 Fiche valeur sauvegardée automatiquement');
    } catch (error) {
      console.error('Error saving fiche valeur:', error);
      logService.addLog(`❌ Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const loadBPUData = useCallback(async () => {
    // Ne pas recharger si une génération est en cours
    if (isGeneratingRef.current) {
      return;
    }

    // Charger les données existantes depuis la base de données
    try {
      const { data, error } = await supabase
        .from('bpu_items')
        .select('*')
        .eq('market_id', marketId)
        .order('numero');

      if (error) throw error;

      if (data && data.length > 0) {
        setBpuItems(data.map((item: any) => ({
          id: item.id,
          numero: item.numero,
          designation: item.designation,
          unite: item.unite,
          quantite: item.quantite,
          prixUnitaire: item.prix_unitaire,
          totalHT: item.total_ht
        })));
      } else {
        setBpuItems([]);
      }
    } catch (error) {
      console.error('Error loading BPU:', error);
      setBpuItems([]);
    }
  }, [marketId]);

  const addNewRow = () => {
    const newItem: BPUItem = {
      id: `temp-${Date.now()}`,
      numero: `${bpuItems.length + 1}`,
      designation: '',
      unite: '',
      quantite: 0,
      prixUnitaire: 0,
      totalHT: 0
    };
    setBpuItems([...bpuItems, newItem]);
  };

  const updateItem = useCallback((id: string, field: keyof BPUItem, value: any) => {
    // Ne pas mettre à jour pendant la génération
    if (isGeneratingRef.current) {
      return;
    }

    setBpuItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantite' || field === 'prixUnitaire') {
          updated.totalHT = updated.quantite * updated.prixUnitaire;
        }
        return updated;
      }
      return item;
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    // Ne pas supprimer pendant la génération
    if (isGeneratingRef.current) {
      return;
    }
    setBpuItems(items => items.filter(item => item.id !== id));
  }, []);

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert('Veuillez entrer un prompt pour la génération');
      return;
    }

    setIsGenerating(true);
    isGeneratingRef.current = true;
    setShowPromptModal(false);
    logService.clearLogs();
    setShowLogs(true);

    try {
      logService.addLog('🚀 Début de la génération du BPU');

      // Récupérer le mémoire technique du marché
      logService.addLog('📄 Récupération du mémoire technique...');
      const { data: technicalMemory } = await supabase
        .from('memo_sections')
        .select('content, section_title')
        .eq('market_id', marketId);

      const memoryContext = technicalMemory
        ?.map(section => `${section.section_title}: ${section.content}`)
        .join('\n\n') || '';

      logService.addLog(`✓ ${technicalMemory?.length || 0} sections trouvées`);

      // Construire le prompt enrichi
      let contextSection = '';
      if (memoryContext && memoryContext.trim().length > 0) {
        // Limiter le contexte à 3000 caractères pour éviter les prompts trop longs
        const truncatedContext = memoryContext.length > 3000
          ? memoryContext.substring(0, 3000) + '...'
          : memoryContext;
        contextSection = `\n\nMÉMOIRE TECHNIQUE:\n${truncatedContext}\n`;
        logService.addLog(`📝 Contexte: ${memoryContext.length} caractères`);
      } else {
        logService.addLog('⚠️ Aucun mémoire technique, génération basique');
      }

      const fullPrompt = `Tu es un expert en BTP et en chiffrage de travaux. Génère un Bordereau des Prix Unitaires (BPU) détaillé.${contextSection}
DEMANDE:
${aiPrompt}

IMPORTANT: Réponds UNIQUEMENT avec un tableau JSON valide au format suivant, sans texte additionnel, sans markdown:
{
  "items": [
    {
      "numero": "1",
      "designation": "Terrassement général",
      "unite": "m³",
      "quantite": 150,
      "prixUnitaire": 25.50
    },
    {
      "numero": "2",
      "designation": "Fondations en béton armé",
      "unite": "m³",
      "quantite": 45,
      "prixUnitaire": 180.00
    }
  ]
}

Génère entre 8 et 15 lignes de prestations réalistes avec des prix cohérents du marché BTP français.`;

      logService.addLog('🤖 Appel à l\'IA pour générer le BPU...');
      logService.addLog('📌 Modèle utilisé: Gemini 2.5 Flash Lite (forcé)');

      // Récupérer le token de session de l'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session utilisateur non trouvée. Veuillez vous reconnecter.');
      }

      logService.addLog('✓ Token de session récupéré');

      // Appeler l'edge function pour générer le BPU
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: fullPrompt,
            systemPrompt: 'Tu es un assistant spécialisé dans la génération de documents techniques pour le BTP. Tu réponds toujours avec du JSON valide.',
            model: 'google/gemini-2.5-flash-lite-preview-09-2025',
            temperature: 0.7,
            maxTokens: 4000
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logService.addLog(`❌ Erreur HTTP ${response.status}: ${errorText}`);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la génération');
      }

      const result = await response.json();
      logService.addLog('✓ Réponse reçue de l\'IA');
      logService.addLog(`📊 Tokens utilisés: ${result.usage?.total_tokens || 'N/A'}`);

      // Parser la réponse JSON
      let parsedData;
      try {
        let jsonContent = result.content;

        // Supprimer les balises markdown si présentes
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Extraire le JSON de la réponse si elle contient du texte autour
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          logService.addLog('🔍 JSON extrait de la réponse');
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          logService.addLog('⚠️ Tentative de parse direct...');
          parsedData = JSON.parse(jsonContent);
        }
      } catch (parseError) {
        logService.addLog('❌ Erreur de parsing JSON');
        console.error('Parse error:', parseError);
        console.log('AI Response:', result.content);
        throw new Error('Format de réponse invalide de l\'IA. La réponse a été loguée dans la console.');
      }

      // Créer les items BPU
      if (parsedData.items && Array.isArray(parsedData.items)) {
        logService.addLog(`✓ ${parsedData.items.length} lignes à ajouter`);

        const generatedItems: BPUItem[] = parsedData.items.map((item: any, index: number) => ({
          id: `gen-${Date.now()}-${index}`,
          numero: item.numero || `${bpuItems.length + index + 1}`,
          designation: item.designation || '',
          unite: item.unite || '',
          quantite: parseFloat(item.quantite) || 0,
          prixUnitaire: parseFloat(item.prixUnitaire) || 0,
          totalHT: (parseFloat(item.quantite) || 0) * (parseFloat(item.prixUnitaire) || 0)
        }));

        setBpuItems([...bpuItems, ...generatedItems]);
        logService.addLog('✅ BPU généré avec succès !');
        alert('BPU généré avec succès !');
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('Error generating BPU:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      logService.addLog(`❌ Erreur: ${errorMessage}`);

      // Messages d'aide selon le type d'erreur
      let helpMessage = '';
      if (errorMessage.includes('401') || errorMessage.includes('Authorization')) {
        helpMessage = '\n\nVérifiez que votre clé API OpenRouter est configurée dans les variables d\'environnement.';
      } else if (errorMessage.includes('500')) {
        helpMessage = '\n\nErreur serveur. Vérifiez que l\'edge function ai-generation est bien déployée.';
      } else if (errorMessage.includes('Format de réponse invalide')) {
        helpMessage = '\n\nL\'IA n\'a pas retourné un format JSON valide. Consultez la console pour voir la réponse brute.';
      }

      alert(`Erreur lors de la génération du BPU: ${errorMessage}${helpMessage}`);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const handleGenerateFicheValeur = async () => {
    if (!ficheValeurPrompt.trim()) {
      alert('Veuillez entrer un prompt pour la génération');
      return;
    }

    setIsGenerating(true);
    isGeneratingRef.current = true;
    logService.clearLogs();
    setShowLogs(true);

    try {
      logService.addLog('🚀 Début de la génération de la fiche valeur');

      // Récupérer le mémoire technique du marché
      logService.addLog('📄 Récupération du mémoire technique...');
      const { data: technicalMemory } = await supabase
        .from('memo_sections')
        .select('content, section_title')
        .eq('market_id', marketId);

      const memoryContext = technicalMemory
        ?.map(section => `${section.section_title}: ${section.content}`)
        .join('\n\n') || '';

      logService.addLog(`✓ ${technicalMemory?.length || 0} sections trouvées`);

      // Récupérer les informations du marché
      logService.addLog('📋 Récupération des informations du marché...');
      const { data: marketData } = await supabase
        .from('markets')
        .select('title, client, description, budget, deadline')
        .eq('id', marketId)
        .single();

      logService.addLog('✓ Informations du marché récupérées');

      // Récupérer le BPU
      logService.addLog('💶 Récupération du BPU...');
      const { data: bpuData } = await supabase
        .from('bpu_items')
        .select('*')
        .eq('market_id', marketId)
        .order('numero', { ascending: true });

      const bpuTotal = bpuData?.reduce((sum, item) => sum + (item.total_ht || 0), 0) || 0;
      logService.addLog(`✓ ${bpuData?.length || 0} lignes BPU trouvées (Total HT: ${bpuTotal.toFixed(2)}€)`);

      // Construire le résumé du BPU par catégorie
      let bpuSummary = '';
      if (bpuData && bpuData.length > 0) {
        // Grouper par première lettre du numéro (ex: 01, 02, 03)
        const categories = new Map<string, { items: number, total: number }>();
        bpuData.forEach(item => {
          const category = item.numero?.substring(0, 2) || 'XX';
          const current = categories.get(category) || { items: 0, total: 0 };
          categories.set(category, {
            items: current.items + 1,
            total: current.total + (item.total_ht || 0)
          });
        });

        const summaryLines = Array.from(categories.entries())
          .map(([cat, data]) => `  - Catégorie ${cat}: ${data.items} lignes, ${data.total.toFixed(2)}€`)
          .join('\n');

        bpuSummary = `\n\nBPU (Bordereau de Prix Unitaires):
- Nombre total de lignes: ${bpuData.length}
- Montant total HT: ${bpuTotal.toFixed(2)}€
- Répartition par catégorie:
${summaryLines}
`;
        logService.addLog('📊 Résumé BPU généré');
      } else {
        logService.addLog('⚠️ Aucune donnée BPU disponible');
      }

      // Construire le contexte complet
      let contextSection = '';
      if (memoryContext && memoryContext.trim().length > 0) {
        const truncatedContext = memoryContext.length > 5000
          ? memoryContext.substring(0, 5000) + '...'
          : memoryContext;
        contextSection = `\n\nMÉMOIRE TECHNIQUE:\n${truncatedContext}\n`;
        logService.addLog(`📝 Contexte mémoire technique: ${memoryContext.length} caractères`);
      } else {
        logService.addLog('⚠️ Aucun mémoire technique disponible');
      }

      const marketInfo = marketData ? `
INFORMATIONS DU MARCHÉ:
- Titre: ${marketData.title}
- Client: ${marketData.client}
- Description: ${marketData.description || 'Non spécifiée'}
- Budget estimé: ${marketData.budget ? `${marketData.budget}€` : 'Non spécifié'}
- Échéance: ${marketData.deadline ? new Date(marketData.deadline).toLocaleDateString('fr-FR') : 'Non spécifiée'}
` : '';

      const fullPrompt = `Tu es un expert en appels d'offres BTP et en rédaction de documents commerciaux.${contextSection}${marketInfo}${bpuSummary}

DEMANDE:
${ficheValeurPrompt}

Génère une fiche valeur complète et professionnelle qui met en avant nos atouts de manière claire et convaincante. Structure ta réponse en sections bien identifiées (utilise des titres en gras avec ##).

Réponds en format markdown avec une structure claire et des points clés mis en évidence.`;

      logService.addLog('🤖 Appel à l\'IA pour générer la fiche valeur...');
      logService.addLog('📌 Modèle utilisé: Gemini 2.5 Flash Lite (forcé)');

      // Récupérer le token de session de l'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session utilisateur non trouvée. Veuillez vous reconnecter.');
      }

      logService.addLog('✓ Token de session récupéré');

      // Appeler l'edge function avec le token d'authentification
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generation`;
      logService.addLog(`📡 Envoi de la requête vers ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: 'google/gemini-2.5-flash-lite-preview-09-2025',
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logService.addLog(`❌ Erreur HTTP ${response.status}: ${errorText}`);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      logService.addLog('✓ Réponse reçue de l\'IA');

      const result = await response.json();

      if (!result.content) {
        logService.addLog('❌ Pas de contenu dans la réponse');
        throw new Error('Aucun contenu retourné par l\'IA');
      }

      logService.addLog(`✓ Contenu généré: ${result.content.length} caractères`);

      setFicheValeurContent(result.content);

      // Sauvegarder automatiquement
      await saveFicheValeur(result.content);

      logService.addLog('✅ Fiche valeur générée avec succès !');
      alert('Fiche valeur générée avec succès !');
    } catch (error) {
      console.error('Error generating fiche valeur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      logService.addLog(`❌ Erreur: ${errorMessage}`);
      alert(`Erreur lors de la génération de la fiche valeur: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      alert('Utilisateur non connecté');
      return;
    }

    if (bpuItems.length === 0) {
      alert('Aucune ligne à sauvegarder');
      return;
    }

    logService.clearLogs();
    setShowLogs(true);

    try {
      logService.addLog('💾 Début de la sauvegarde du BPU...');

      // Supprimer les anciens items
      logService.addLog('🗑️ Suppression des anciennes données...');
      const { error: deleteError } = await supabase
        .from('bpu_items')
        .delete()
        .eq('market_id', marketId)
        .eq('user_id', user.id);

      if (deleteError) {
        logService.addLog(`❌ Erreur suppression: ${deleteError.message}`);
        throw deleteError;
      }

      logService.addLog('✓ Anciennes données supprimées');

      // Insérer les nouveaux items (sans l'id temporaire)
      const itemsToSave = bpuItems.map(item => ({
        market_id: marketId,
        numero: item.numero,
        designation: item.designation,
        unite: item.unite,
        quantite: parseFloat(item.quantite.toString()) || 0,
        prix_unitaire: parseFloat(item.prixUnitaire.toString()) || 0,
        total_ht: parseFloat(item.totalHT.toString()) || 0,
        user_id: user.id
      }));

      logService.addLog(`📝 Insertion de ${itemsToSave.length} lignes...`);

      const { data, error } = await supabase
        .from('bpu_items')
        .insert(itemsToSave)
        .select();

      if (error) {
        logService.addLog(`❌ Erreur insertion: ${error.message}`);
        console.error('Insert error details:', error);
        throw error;
      }

      logService.addLog(`✅ ${data?.length || 0} lignes sauvegardées avec succès`);

      // Recharger les données pour obtenir les vrais IDs
      await loadBPUData();

      alert('BPU sauvegardé avec succès');
    } catch (error) {
      console.error('Error saving BPU:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      logService.addLog(`❌ Erreur: ${errorMessage}`);
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`);
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      bpuItems.map(item => ({
        'N°': item.numero,
        'Désignation des prestations': item.designation,
        'Unité': item.unite,
        'Quantité estimée': item.quantite,
        'Prix unitaire HT (€)': item.prixUnitaire,
        'Total HT (€)': item.totalHT
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BPU');
    XLSX.writeFile(workbook, `BPU_${marketTitle.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
  };

  const handleExportFicheValeurDoc = async () => {
    if (!ficheValeurContent) return;

    try {
      const children: (Paragraph | Table)[] = [];
      const lines = ficheValeurContent.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('## ')) {
          children.push(
            new Paragraph({
              text: line.replace('## ', ''),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            })
          );
        } else if (line.startsWith('### ')) {
          children.push(
            new Paragraph({
              text: line.replace('### ', ''),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            })
          );
        } else if (line.startsWith('#### ')) {
          children.push(
            new Paragraph({
              text: line.replace('#### ', ''),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            })
          );
        } else if (line.startsWith('- ')) {
          const text = line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1');
          children.push(
            new Paragraph({
              text: '• ' + text,
              spacing: { before: 100, after: 100 },
              indent: { left: 400 }
            })
          );
        } else if (line.includes('|') && !line.includes('---')) {
          const isHeader = i === 0 || (i > 0 && lines[i - 1].includes('---'));

          if (isHeader && line.includes('|')) {
            const tableLines = [line];
            let j = i + 1;

            if (j < lines.length && lines[j].includes('---')) {
              j++;
            }

            while (j < lines.length && lines[j].includes('|')) {
              tableLines.push(lines[j]);
              j++;
            }

            if (tableLines.length > 0) {
              const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
              const dataRows = tableLines.slice(1).filter(l => !l.includes('---')).map(row =>
                row.split('|').map(cell => cell.trim()).filter(cell => cell)
              );

              if (headers.length > 0) {
                const tableRows = [
                  new TableRow({
                    children: headers.map(header =>
                      new TableCell({
                        children: [new Paragraph({ text: header.replace(/\*\*/g, ''), bold: true })],
                        shading: { fill: 'D9D9D9' }
                      })
                    )
                  }),
                  ...dataRows.map(row =>
                    new TableRow({
                      children: row.map(cell =>
                        new TableCell({
                          children: [new Paragraph({ text: cell.replace(/\*\*/g, '').replace(/🔹/g, '') })]
                        })
                      )
                    })
                  )
                ];

                children.push(
                  new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE }
                  })
                );

                i = j - 1;
              }
            }
          }
        } else if (line.trim().length > 0 && !line.includes('---')) {
          const textRuns: TextRun[] = [];
          const parts = line.split(/(\*\*.*?\*\*)/);

          parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
              textRuns.push(new TextRun({ text: part.replace(/\*\*/g, ''), bold: true }));
            } else {
              textRuns.push(new TextRun({ text: part }));
            }
          });

          children.push(
            new Paragraph({
              children: textRuns,
              spacing: { before: 100, after: 100 }
            })
          );
        } else if (line.trim().length === 0) {
          children.push(new Paragraph({ text: '' }));
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Fiche_Valeur_${marketTitle.replace(/[^a-z0-9]/gi, '_')}.docx`);
      logService.addLog('📄 Fiche valeur exportée au format DOC');
    } catch (error) {
      console.error('Error exporting fiche valeur:', error);
      logService.addLog(`❌ Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const getTotalHT = () => {
    return bpuItems.reduce((sum, item) => sum + item.totalHT, 0);
  };

  if (!isOpen) return null;

  const renderDocumentEditor = () => {
    if (selectedDocument === 'bpu') {
      return <BPUEditor />;
    }

    if (selectedDocument === 'fiche_valeur') {
      return <FicheValeurEditor />;
    }

    return (
      <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Interface en cours de développement</p>
        </div>
      </div>
    );
  };

  const BPUEditor = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button
            onClick={addNewRow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter ligne
          </button>

          <button
            onClick={() => setShowPromptModal(true)}
            disabled={isGenerating}
            className={`bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Génération...' : 'Générer par IA'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Total HT: {getTotalHT().toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className={`w-full ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <thead className={`sticky top-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b-2`}>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-16">N°</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Désignation des prestations</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-24">Unité</th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider w-32">Quantité</th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider w-32">Prix unit. HT</th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider w-32">Total HT</th>
              <th className="px-3 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {bpuItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center">
                  <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    Aucune ligne. Cliquez sur "Ajouter ligne" ou "Générer par IA"
                  </p>
                </td>
              </tr>
            ) : (
              bpuItems.map((item) => (
                <tr key={item.id} className={`${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.numero}
                      onChange={(e) => updateItem(item.id, 'numero', e.target.value)}
                      className={`w-full px-2 py-1.5 text-sm rounded border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.designation}
                      onChange={(e) => updateItem(item.id, 'designation', e.target.value)}
                      placeholder="Description de la prestation"
                      className={`w-full px-2 py-1.5 text-sm rounded border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unite}
                      onChange={(e) => updateItem(item.id, 'unite', e.target.value)}
                      placeholder="u, m², ml..."
                      className={`w-full px-2 py-1.5 text-sm rounded border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantite}
                      onChange={(e) => updateItem(item.id, 'quantite', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2 py-1.5 text-sm rounded border text-right ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.prixUnitaire}
                      onChange={(e) => updateItem(item.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2 py-1.5 text-sm rounded border text-right ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className={`px-2 py-1.5 text-sm font-medium text-right ${
                      isDark ? 'text-green-400' : 'text-green-700'
                    }`}>
                      {item.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className={`p-1.5 rounded hover:bg-red-100 transition-colors ${
                        isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600'
                      }`}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const FicheValeurEditor = () => {
    const [showPromptPanel, setShowPromptPanel] = useState(true);

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-pink-500" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Fiche de valeur
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {ficheValeurContent && (
              <button
                onClick={() => setIsEditingFicheValeur(!isEditingFicheValeur)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isEditingFicheValeur
                    ? 'bg-pink-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                {isEditingFicheValeur ? 'Aperçu' : 'Éditer'}
              </button>
            )}
            <button
              onClick={() => setShowPromptPanel(!showPromptPanel)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {showPromptPanel ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Masquer le prompt
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Afficher le prompt
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {showPromptPanel && (
            <div className={`w-80 border-r ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'} flex flex-col`}>
              <div className="p-4 flex-1 overflow-y-auto">
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Prompt de génération
                </h4>
                <textarea
                  value={ficheValeurPrompt}
                  onChange={(e) => setFicheValeurPrompt(e.target.value)}
                  placeholder="Décrivez ce que vous souhaitez mettre en avant..."
                  rows={8}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? 'bg-gray-900 border-gray-600 text-gray-300 placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none`}
                />
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  💡 Basé sur le mémoire technique et les infos du marché
                </p>
              </div>
              <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={handleGenerateFicheValeur}
                  disabled={isGenerating}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Générer avec l'IA
                    </>
                  )}
                </button>
                {ficheValeurContent && (
                  <button
                    onClick={() => saveFicheValeur(ficheValeurContent)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {isLoadingFicheValeur ? (
              <div className={`flex items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Chargement de la fiche valeur...</p>
                </div>
              </div>
            ) : ficheValeurContent ? (
              isEditingFicheValeur ? (
                <div className="h-full flex flex-col p-4">
                  <textarea
                    value={ficheValeurContent}
                    onChange={(e) => setFicheValeurContent(e.target.value)}
                    className={`flex-1 w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                    placeholder="Contenu de la fiche valeur en markdown..."
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        await saveFicheValeur(ficheValeurContent);
                        alert('Modifications sauvegardées');
                      }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder les modifications
                    </button>
                    <button
                      onClick={() => setIsEditingFicheValeur(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Aperçu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto px-8 py-6">
                  <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
                  {(() => {
                    const lines = ficheValeurContent.split('\n');
                    const elements: JSX.Element[] = [];
                    let inTable = false;
                    let tableLines: string[] = [];

                    const renderTable = (tableData: string[]) => {
                      if (tableData.length < 2) return null;

                      const headers = tableData[0].split('|').map(h => h.trim()).filter(h => h);
                      const rows = tableData.slice(2).map(row =>
                        row.split('|').map(cell => cell.trim()).filter(cell => cell)
                      );

                      return (
                        <div className="overflow-x-auto my-6">
                          <table className={`w-full border-collapse ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                              <tr>
                                {headers.map((header, i) => (
                                  <th key={i} className={`border px-4 py-3 text-left font-semibold ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => (
                                <tr key={i} className={isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}>
                                  {row.map((cell, j) => (
                                    <td
                                      key={j}
                                      className={`border px-4 py-3 ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}
                                      dangerouslySetInnerHTML={{
                                        __html: cell
                                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/🔹/g, '<span class="text-pink-500">🔹</span>')
                                      }}
                                    />
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    };

                    lines.forEach((line, index) => {
                      if (line.includes('|') && (line.includes('---') || line.split('|').length > 2)) {
                        if (!inTable) {
                          inTable = true;
                          tableLines = [];
                        }
                        tableLines.push(line);
                      } else {
                        if (inTable) {
                          const table = renderTable(tableLines);
                          if (table) elements.push(<div key={`table-${index}`}>{table}</div>);
                          inTable = false;
                          tableLines = [];
                        }

                        if (line.startsWith('## ')) {
                          elements.push(
                            <h2 key={index} className={`text-2xl font-bold mt-8 mb-4 pb-2 border-b-2 ${isDark ? 'text-white border-pink-500/30' : 'text-gray-900 border-pink-500/30'}`}>
                              {line.replace('## ', '')}
                            </h2>
                          );
                        } else if (line.startsWith('### ')) {
                          elements.push(
                            <h3 key={index} className={`text-xl font-semibold mt-6 mb-3 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                              {line.replace('### ', '')}
                            </h3>
                          );
                        } else if (line.startsWith('#### ')) {
                          elements.push(
                            <h4 key={index} className={`text-lg font-semibold mt-4 mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              {line.replace('#### ', '')}
                            </h4>
                          );
                        } else if (line.startsWith('- ')) {
                          const content = line.replace('- ', '')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          elements.push(
                            <li key={index} className={`ml-6 mb-2 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: content }} />
                          );
                        } else if (line.match(/^\d+\./)) {
                          elements.push(
                            <li key={index} className={`ml-6 mb-2 leading-relaxed list-decimal ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {line.replace(/^\d+\.\s*/, '')}
                            </li>
                          );
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                          elements.push(
                            <p key={index} className={`font-bold text-lg mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {line.replace(/\*\*/g, '')}
                            </p>
                          );
                        } else if (line.trim() === '') {
                          elements.push(<div key={index} className="h-3"></div>);
                        } else if (line.trim().length > 0) {
                          const formattedLine = line
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
                          elements.push(
                            <p
                              key={index}
                              className={`mb-3 leading-relaxed text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                              dangerouslySetInnerHTML={{ __html: formattedLine }}
                            />
                          );
                        }
                      }
                    });

                    if (inTable) {
                      const table = renderTable(tableLines);
                      if (table) elements.push(<div key="table-final">{table}</div>);
                    }

                    return elements;
                  })()}
                </div>
                </div>
              )
            ) : (
              <div className={`flex items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="text-center">
                  <Award className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-medium mb-2">Aucune fiche valeur générée</p>
                  <p className="text-sm">
                    {showPromptPanel
                      ? 'Personnalisez le prompt et cliquez sur "Générer avec l\'IA"'
                      : 'Affichez le prompt pour commencer la génération'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} w-full h-full flex flex-col transition-colors duration-200`}>
        {/* Header compact */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Documents économiques
            </h2>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {marketTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LogsPanel
              logs={logs}
              showLogs={showLogs}
              onToggleLogs={() => setShowLogs(!showLogs)}
              onClearLogs={() => logService.clearLogs()}
            />
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export BPU Excel
            </button>
            {ficheValeurContent && (
              <button
                onClick={handleExportFicheValeurDoc}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Valeur DOC
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar compact */}
          <div className={`w-48 border-r ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} overflow-y-auto`}>
            <div className="p-2">
              {economicDocuments.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedDocument === doc.id;

                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-1 ${
                      isSelected
                        ? `bg-gradient-to-r ${doc.color} text-white shadow-lg`
                        : isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} />
                      <span className="text-sm font-medium">{doc.shortTitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {renderDocumentEditor()}
        </div>
      </div>

      {/* Modal prompt IA */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Générer le BPU avec l'IA
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              L'IA utilisera votre mémoire technique pour générer un BPU cohérent avec votre offre.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Génère un BPU complet pour les travaux de gros œuvre incluant terrassement, fondations et élévation des murs..."
              rows={6}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 placeholder-gray-400'
              } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPromptModal(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleGenerateWithAI}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Générer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
