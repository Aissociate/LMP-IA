interface MarketContext {
  id: string;
  title: string;
  reference: string;
  client: string;
  budget: number;
  deadline: string;
  status: string;
  description?: string;
  global_memory_prompt?: string;
  documents?: MarketDocument[];
}

interface MarketDocument {
  id: string;
  name: string;
  file_size: number;
  file_type?: string;
  analysis_status: string;
  extracted_content?: string;
  analysis_result?: string;
  created_at: string;
}

interface KnowledgeContext {
  id: string;
  name: string;
  file_size: number;
  content?: string;
  extraction_error?: string;
}

export interface UserProfileContext {
  full_name: string;
  company: string;
  company_name: string;
  phone: string;
  address: string;
  activity_sectors: string[];
  expertise_areas: string[];
  geographical_zones: string[];
}

export interface CompanyProfileContext {
  company_name: string;
  legal_form: string;
  siret: string;
  naf_code: string;
  creation_date: string;
  address: string;
  postal_code: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  main_activity: string;
  secondary_activities: string[];
  certifications: string[];
  insurance_info: {
    company?: string;
    policy_number?: string;
    coverage_amount?: string;
    expiry_date?: string;
  };
  workforce: number;
  annual_turnover: string;
  reference_projects: Array<{
    name: string;
    client: string;
    year: string;
    amount: string;
    description: string;
  }>;
  geographical_coverage: string[];
  equipment_list: string[];
  subcontracting_capacity: boolean;
  presentation: string;
  differentiators: string;
  target_markets: string[];
}

export class ContextService {
  private static instance: ContextService;

  static getInstance(): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService();
    }
    return ContextService.instance;
  }

  async loadMarketContext(marketId: string, supabase: any): Promise<MarketContext | null> {
    try {
      const { data: market, error } = await supabase
        .from('markets')
        .select('*, global_memory_prompt')
        .eq('id', marketId)
        .single();

      if (error) {
        throw new Error(`Erreur chargement marché: ${error.message}`);
      }

      if (market.global_memory_prompt) {
        console.log(`[ContextService] Prompt global détecté: ${market.global_memory_prompt.length} caractères`);
      }

      const { data: documents, error: documentsError } = await supabase
        .from('market_documents')
        .select('id, name, file_size, file_type, analysis_status, extracted_content, analysis_result, created_at')
        .eq('market_id', marketId)
        .order('created_at', { ascending: false });

      if (documentsError) {
        console.warn('Erreur lors du chargement des documents:', documentsError);
      }

      return {
        ...market,
        documents: documents || []
      };
    } catch (error) {
      console.error('Erreur lors du chargement du contexte marché:', error);
      return null;
    }
  }

  async loadCompanyProfile(userId: string, supabase: any): Promise<CompanyProfileContext | null> {
    try {
      const { data: profile, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[ContextService] Erreur chargement profil entreprise:', error);
        return null;
      }

      if (!profile) {
        console.log('[ContextService] Aucun profil entreprise trouvé');
        return null;
      }

      console.log(`[ContextService] Profil entreprise chargé: ${profile.company_name}`);
      return profile;
    } catch (error) {
      console.error('Erreur lors du chargement du profil entreprise:', error);
      return null;
    }
  }

  async loadUserProfile(userId: string, supabase: any): Promise<UserProfileContext | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('full_name, company, company_name, phone, address, activity_sectors, expertise_areas, geographical_zones')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[ContextService] Erreur chargement profil utilisateur:', error);
        return null;
      }

      if (!profile) {
        console.log('[ContextService] Aucun profil utilisateur trouvé');
        return null;
      }

      console.log(`[ContextService] Profil utilisateur chargé: ${profile.full_name || 'sans nom'}`);
      return profile;
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error);
      return null;
    }
  }

  async loadImageAssets(userId: string, supabase: any): Promise<any[]> {
    try {
      const { data: assets, error } = await supabase
        .from('report_assets')
        .select('id, name, ai_description, file_url')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Erreur chargement images: ${error.message}`);
      }

      if (!assets || assets.length === 0) {
        return [];
      }

      console.log(`[ContextService] ${assets.length} images chargées pour contexte`);
      return assets;
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      return [];
    }
  }

  async loadKnowledgeContext(userId: string, supabase: any): Promise<KnowledgeContext[]> {
    try {
      const { data: knowledge, error } = await supabase
        .from('knowledge_files')
        .select('id, name, file_size, extracted_content, extraction_status, extraction_error')
        .eq('user_id', userId)
        .eq('extraction_status', 'completed');

      if (error) {
        throw new Error(`Erreur chargement base de connaissance: ${error.message}`);
      }

      if (!knowledge || knowledge.length === 0) {
        return [];
      }

      const knowledgeWithContent = knowledge
        .filter((doc: any) => doc.name !== 'Profil entreprise complet')
        .map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          file_size: doc.file_size,
          content: doc.extracted_content || '',
          extraction_error: doc.extraction_error
        }));

      console.log(`[ContextService] ${knowledgeWithContent.length} documents base de connaissance chargés`);
      knowledgeWithContent.forEach((doc: KnowledgeContext) => {
        console.log(`[ContextService]   ${doc.name}: ${Math.round((doc.content?.length || 0) / 1000)}k caractères`);
      });

      return knowledgeWithContent;
    } catch (error) {
      console.error('Erreur lors du chargement de la base de connaissance:', error);
      return [];
    }
  }

  private formatCompanyProfileForPrompt(profile: CompanyProfileContext): string {
    const sections: string[] = [];

    sections.push(`=== PROFIL OFFICIEL DE L'ENTREPRISE CANDIDATE ===`);
    sections.push(`(Ces informations sont RÉELLES et VÉRIFIÉES. Vous DEVEZ les utiliser telles quelles.)\n`);

    if (profile.company_name) {
      sections.push(`NOM DE L'ENTREPRISE: ${profile.company_name}`);
    }
    if (profile.legal_form) {
      sections.push(`FORME JURIDIQUE: ${profile.legal_form}`);
    }
    if (profile.siret) {
      sections.push(`SIRET: ${profile.siret}`);
    }
    if (profile.naf_code) {
      sections.push(`CODE NAF: ${profile.naf_code}`);
    }
    if (profile.creation_date) {
      sections.push(`DATE DE CRÉATION: ${profile.creation_date}`);
    }
    if (profile.workforce) {
      sections.push(`EFFECTIF: ${profile.workforce} personnes`);
    }
    if (profile.annual_turnover) {
      sections.push(`CHIFFRE D'AFFAIRES: ${profile.annual_turnover}`);
    }

    if (profile.address || profile.city) {
      sections.push(`\nCOORDONNÉES:`);
      if (profile.address) sections.push(`- Adresse: ${profile.address}`);
      if (profile.postal_code || profile.city) sections.push(`- Ville: ${profile.postal_code || ''} ${profile.city || ''}`);
      if (profile.region) sections.push(`- Région: ${profile.region}`);
      if (profile.phone) sections.push(`- Téléphone: ${profile.phone}`);
      if (profile.email) sections.push(`- Email: ${profile.email}`);
      if (profile.website) sections.push(`- Site web: ${profile.website}`);
    }

    if (profile.main_activity) {
      sections.push(`\nACTIVITÉ PRINCIPALE: ${profile.main_activity}`);
    }
    if (profile.secondary_activities?.length > 0) {
      sections.push(`ACTIVITÉS SECONDAIRES: ${profile.secondary_activities.join(', ')}`);
    }
    if (profile.target_markets?.length > 0) {
      sections.push(`MARCHÉS CIBLÉS: ${profile.target_markets.join(', ')}`);
    }
    if (profile.geographical_coverage?.length > 0) {
      sections.push(`COUVERTURE GÉOGRAPHIQUE: Départements ${profile.geographical_coverage.join(', ')}`);
    }

    if (profile.certifications?.length > 0) {
      sections.push(`\nCERTIFICATIONS ET QUALIFICATIONS:`);
      profile.certifications.forEach(cert => sections.push(`- ${cert}`));
    }

    if (profile.equipment_list?.length > 0) {
      sections.push(`\nMATÉRIEL ET ÉQUIPEMENTS:`);
      profile.equipment_list.forEach(eq => sections.push(`- ${eq}`));
    }

    if (profile.insurance_info?.company) {
      sections.push(`\nASSURANCE RC PROFESSIONNELLE:`);
      if (profile.insurance_info.company) sections.push(`- Compagnie: ${profile.insurance_info.company}`);
      if (profile.insurance_info.policy_number) sections.push(`- Police: ${profile.insurance_info.policy_number}`);
      if (profile.insurance_info.coverage_amount) sections.push(`- Couverture: ${profile.insurance_info.coverage_amount}`);
      if (profile.insurance_info.expiry_date) sections.push(`- Validité: ${profile.insurance_info.expiry_date}`);
    }

    sections.push(`\nCAPACITÉ DE SOUS-TRAITANCE: ${profile.subcontracting_capacity ? 'Oui' : 'Non'}`);

    if (profile.presentation) {
      sections.push(`\nPRÉSENTATION DE L'ENTREPRISE:\n${profile.presentation}`);
    }

    if (profile.differentiators) {
      sections.push(`\nÉLÉMENTS DIFFÉRENCIANTS:\n${profile.differentiators}`);
    }

    if (profile.reference_projects?.length > 0) {
      sections.push(`\nPROJETS DE RÉFÉRENCE:`);
      profile.reference_projects.forEach((p, i) => {
        sections.push(`${i + 1}. ${p.name}`);
        if (p.client) sections.push(`   Client: ${p.client}`);
        if (p.year) sections.push(`   Année: ${p.year}`);
        if (p.amount) sections.push(`   Montant: ${p.amount}`);
        if (p.description) sections.push(`   Description: ${p.description}`);
      });
    }

    sections.push(`\n=== FIN DU PROFIL ENTREPRISE ===`);

    return sections.join('\n');
  }

  private formatUserProfileForPrompt(userProfile: UserProfileContext): string {
    const lines: string[] = [];

    lines.push(`=== PROFIL DU RESPONSABLE / CONTACT ===`);

    if (userProfile.full_name) {
      lines.push(`NOM COMPLET: ${userProfile.full_name}`);
    }
    if (userProfile.company || userProfile.company_name) {
      lines.push(`ENTREPRISE: ${userProfile.company_name || userProfile.company}`);
    }
    if (userProfile.phone) {
      lines.push(`TÉLÉPHONE: ${userProfile.phone}`);
    }
    if (userProfile.address) {
      lines.push(`ADRESSE: ${userProfile.address}`);
    }
    if (userProfile.activity_sectors?.length > 0) {
      lines.push(`SECTEURS D'ACTIVITÉ: ${userProfile.activity_sectors.join(', ')}`);
    }
    if (userProfile.expertise_areas?.length > 0) {
      lines.push(`DOMAINES D'EXPERTISE: ${userProfile.expertise_areas.join(', ')}`);
    }
    if (userProfile.geographical_zones?.length > 0) {
      lines.push(`ZONES GÉOGRAPHIQUES: ${userProfile.geographical_zones.join(', ')}`);
    }

    lines.push(`=== FIN DU PROFIL CONTACT ===`);

    return lines.join('\n');
  }

  buildContextualPrompt(
    basePrompt: string,
    sectionTitle: string,
    marketContext: MarketContext | null,
    knowledgeContext: KnowledgeContext[],
    useMarketContext: boolean,
    useKnowledgeContext: boolean,
    imageAssets: any[] = [],
    companyProfile: CompanyProfileContext | null = null,
    userProfile: UserProfileContext | null = null
  ): string {
    let contextualPrompt = `# ${sectionTitle}\n\n`;

    const hasCompanyProfile = companyProfile && companyProfile.company_name;
    const hasUserProfile = userProfile && (userProfile.full_name || userProfile.activity_sectors?.length > 0 || userProfile.expertise_areas?.length > 0);

    if (hasCompanyProfile || hasUserProfile) {
      let identitySection = '';

      if (hasCompanyProfile) {
        identitySection += this.formatCompanyProfileForPrompt(companyProfile!);
      }

      if (hasUserProfile) {
        identitySection += '\n\n' + this.formatUserProfileForPrompt(userProfile!);
      }

      identitySection += `\n\n**RÈGLE ABSOLUE:** Lorsque vous rédigez le mémoire technique, vous DEVEZ utiliser les informations ci-dessus pour identifier l'entreprise candidate et son responsable. NE JAMAIS inventer de nom d'entreprise, d'adresse, de SIRET, de certifications, de références projet ou de nom de contact. Si une information n'est pas fournie ci-dessus, ne l'inventez pas : omettez-la ou écrivez "[À compléter]".\n\n`;

      contextualPrompt = identitySection + contextualPrompt;
    }

    if (useMarketContext && marketContext) {
      const marketInfo = `
CONTEXTE DU MARCHÉ :
- Titre : ${marketContext.title}
- Référence : ${marketContext.reference}
- Client : ${marketContext.client}
- Budget : ${marketContext.budget ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(marketContext.budget) : 'Non spécifié'}
- Échéance : ${new Date(marketContext.deadline).toLocaleDateString('fr-FR')}
- Statut : ${marketContext.status}
${marketContext.description ? `- Description : ${marketContext.description}` : ''}
${marketContext.global_memory_prompt ? `\nINSTRUCTIONS SPÉCIFIQUES DU MARCHÉ :\n${marketContext.global_memory_prompt}\n` : ''}

${marketContext.documents && marketContext.documents.length > 0 ? `
DOCUMENTS DU MARCHÉ ANALYSÉS :
${marketContext.documents.map(doc => {
  let docInfo = `- ${doc.name} (${Math.round(doc.file_size / 1024)} KB)`;
  if (doc.analysis_result) {
    docInfo += `\n  Analyse IA : ${doc.analysis_result}`;
  }
  if (doc.extracted_content) {
    docInfo += `\n  Extrait : ${doc.extracted_content}`;
  }
  return docInfo;
}).join('\n\n')}
` : ''}

`;
      contextualPrompt = marketInfo + contextualPrompt;
    }

    if (useKnowledgeContext && knowledgeContext.length > 0) {
      const validKnowledgeContext = knowledgeContext.filter(doc =>
        doc.content && doc.content.trim().length > 50
      );

      if (validKnowledgeContext.length > 0) {
        const knowledgeInfo = `
DOCUMENTS DE LA BASE DE CONNAISSANCE ENTREPRISE :
${validKnowledgeContext.map(doc => {
  return `## Document: ${doc.name}\n${doc.content}\n`;
}).join('\n')}

**INSTRUCTIONS:** Utilisez le contenu de ces documents pour personnaliser le mémoire technique avec notre expertise réelle, nos méthodes spécifiques, nos références projets et notre savoir-faire. NE PAS inventer d'informations ; utilisez UNIQUEMENT ce qui est fourni ci-dessus.

`;
        contextualPrompt = knowledgeInfo + contextualPrompt;
      }
    }

    if (imageAssets.length > 0) {
      const validAssets = imageAssets.filter(asset => asset.ai_description);

      if (validAssets.length > 0) {
        const imageInfo = `
BIBLIOTHÈQUE D'IMAGES DISPONIBLES :
${validAssets.map(asset => {
  return `## Image: ${asset.name}
**Description:** ${asset.ai_description}
**Code d'insertion:** ![${asset.name}](asset:${asset.id})
`;
}).join('\n')}

**INSTRUCTIONS POUR LES IMAGES:**
- Si une image de cette bibliothèque illustre parfaitement le sujet de cette section, INSÉREZ son code d'insertion dans le contenu généré.
- Placez l'image à l'endroit le plus pertinent du texte.
- N'insérez des images QUE si elles sont vraiment pertinentes pour cette section spécifique.
- Utilisez UNIQUEMENT les codes d'insertion fournis ci-dessus (format: ![nom](asset:id)).

`;
        contextualPrompt = imageInfo + contextualPrompt;
      }
    }

    contextualPrompt += basePrompt;
    return contextualPrompt;
  }
}