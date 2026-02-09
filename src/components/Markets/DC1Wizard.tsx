import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DC1WizardProps {
  marketId: string;
  marketTitle: string;
  onClose: () => void;
}

interface DC1FormData {
  acheteur: string;
  objetConsultation: string;
  typeOffre: 'marche' | 'tous-lots' | 'lots-specifiques';
  lotsSpecifiques: string;
  typeCandidature: 'seul' | 'groupement-conjoint' | 'groupement-solidaire';
  mandataireSolidaire: boolean;

  nomCommercial: string;
  denominationSociale: string;
  adresseEtablissement: string;
  adresseSiegeSocial: string;
  adresseElectronique: string;
  telephone: string;
  telecopie: string;
  numeroSIRET: string;

  membresGroupement: Array<{
    nomCommercial: string;
    denominationSociale: string;
    adresse: string;
    email: string;
    telephone: string;
    siret: string;
    prestations: string;
  }>;

  nomMandataire: string;
  adresseMandataire: string;
  emailMandataire: string;
  telephoneMandataire: string;
  siretMandataire: string;

  declarationNonExclusion: boolean;
  documentsDisponiblesEnLigne: boolean;
  urlDocuments: string;
  renseignementsAcces: string;
}

export default function DC1Wizard({ marketId, marketTitle, onClose }: DC1WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<DC1FormData>({
    acheteur: '',
    objetConsultation: '',
    typeOffre: 'marche',
    lotsSpecifiques: '',
    typeCandidature: 'seul',
    mandataireSolidaire: false,
    nomCommercial: '',
    denominationSociale: '',
    adresseEtablissement: '',
    adresseSiegeSocial: '',
    adresseElectronique: '',
    telephone: '',
    telecopie: '',
    numeroSIRET: '',
    membresGroupement: [],
    nomMandataire: '',
    adresseMandataire: '',
    emailMandataire: '',
    telephoneMandataire: '',
    siretMandataire: '',
    declarationNonExclusion: false,
    documentsDisponiblesEnLigne: false,
    urlDocuments: '',
    renseignementsAcces: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, company_name, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          nomCommercial: profile.company_name || '',
          denominationSociale: profile.company_name || '',
          adresseElectronique: user.email || '',
          telephone: profile.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const fillWithAI = async (field: string) => {
    setAiLoading(field);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: knowledgeFiles } = await supabase
        .from('knowledge_files')
        .select('extracted_content')
        .eq('user_id', user.id)
        .eq('extraction_status', 'completed');

      const context = knowledgeFiles?.map(f => f.extracted_content).filter(Boolean).join('\n\n') || '';

      const prompt = `En tant qu'assistant pour remplir une déclaration de candidature (DC1) pour un marché public, aide à remplir le champ suivant.

Marché: ${marketTitle}
Champ à remplir: ${field}

Contexte de l'entreprise depuis la base de connaissance:
${context}

Données actuelles du formulaire:
${JSON.stringify(formData, null, 2)}

Réponds UNIQUEMENT avec la valeur à remplir pour ce champ, sans explication. Si tu ne peux pas déterminer la valeur avec certitude, réponds "NON_DISPONIBLE".`;

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            prompt,
            max_tokens: 500,
            temperature: 0.3,
          }),
        }
      );

      const result = await response.json();
      const aiValue = result.content?.trim() || '';

      if (aiValue && aiValue !== 'NON_DISPONIBLE') {
        setFormData(prev => ({
          ...prev,
          [field]: aiValue,
        }));
      }
    } catch (error) {
      console.error('Error filling with AI:', error);
    } finally {
      setAiLoading(null);
    }
  };

  const addMembre = () => {
    setFormData(prev => ({
      ...prev,
      membresGroupement: [
        ...prev.membresGroupement,
        {
          nomCommercial: '',
          denominationSociale: '',
          adresse: '',
          email: '',
          telephone: '',
          siret: '',
          prestations: '',
        },
      ],
    }));
  };

  const removeMembre = (index: number) => {
    setFormData(prev => ({
      ...prev,
      membresGroupement: prev.membresGroupement.filter((_, i) => i !== index),
    }));
  };

  const updateMembre = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      membresGroupement: prev.membresGroupement.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const dc1Content = generateDC1Content();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('memo_sections')
        .insert({
          market_id: marketId,
          user_id: user.id,
          section_type: 'dc1',
          title: 'Déclaration de Candidature (DC1)',
          content: dc1Content,
          order_index: 0,
        });

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error generating DC1:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDC1Content = () => {
    let content = '# DÉCLARATION DE CANDIDATURE (DC1)\n\n';

    content += '## A - Identification de l\'acheteur\n\n';
    content += `${formData.acheteur}\n\n`;

    content += '## B - Objet de la consultation\n\n';
    content += `${formData.objetConsultation}\n\n`;

    content += '## C - Objet de la candidature\n\n';
    if (formData.typeOffre === 'marche') {
      content += 'La candidature est présentée pour le marché public (en cas de non allotissement)\n\n';
    } else if (formData.typeOffre === 'tous-lots') {
      content += 'La candidature est présentée pour tous les lots de la procédure\n\n';
    } else {
      content += `La candidature est présentée pour le(s) lot(s) : ${formData.lotsSpecifiques}\n\n`;
    }

    content += '## D - Présentation du candidat\n\n';
    if (formData.typeCandidature === 'seul') {
      content += '### Le candidat se présente seul\n\n';
      content += `**Nom commercial et dénomination sociale** : ${formData.nomCommercial} - ${formData.denominationSociale}\n\n`;
      content += `**Adresse de l'établissement** : ${formData.adresseEtablissement}\n\n`;
      if (formData.adresseSiegeSocial) {
        content += `**Adresse du siège social** : ${formData.adresseSiegeSocial}\n\n`;
      }
      content += `**Adresse électronique** : ${formData.adresseElectronique}\n\n`;
      content += `**Téléphone** : ${formData.telephone}\n\n`;
      if (formData.telecopie) {
        content += `**Télécopie** : ${formData.telecopie}\n\n`;
      }
      content += `**Numéro SIRET** : ${formData.numeroSIRET}\n\n`;
    } else {
      content += `### Le candidat est un groupement d'entreprises : ${formData.typeCandidature}\n\n`;
      if (formData.typeCandidature === 'groupement-conjoint') {
        content += `**Le mandataire est solidaire** : ${formData.mandataireSolidaire ? 'Oui' : 'Non'}\n\n`;
      }
    }

    if (formData.membresGroupement.length > 0) {
      content += '## E - Identification des membres du groupement\n\n';
      formData.membresGroupement.forEach((membre, index) => {
        content += `### Membre ${index + 1}\n\n`;
        content += `**Nom commercial** : ${membre.nomCommercial}\n\n`;
        content += `**Dénomination sociale** : ${membre.denominationSociale}\n\n`;
        content += `**Adresse** : ${membre.adresse}\n\n`;
        content += `**Email** : ${membre.email}\n\n`;
        content += `**Téléphone** : ${membre.telephone}\n\n`;
        content += `**SIRET** : ${membre.siret}\n\n`;
        if (membre.prestations) {
          content += `**Prestations exécutées** : ${membre.prestations}\n\n`;
        }
      });

      content += '## G - Désignation du mandataire\n\n';
      content += `**Nom commercial et dénomination sociale** : ${formData.nomMandataire}\n\n`;
      content += `**Adresse** : ${formData.adresseMandataire}\n\n`;
      content += `**Email** : ${formData.emailMandataire}\n\n`;
      content += `**Téléphone** : ${formData.telephoneMandataire}\n\n`;
      content += `**SIRET** : ${formData.siretMandataire}\n\n`;
    }

    content += '## F - Engagements du candidat\n\n';
    content += '### F1 - Exclusions de la procédure\n\n';
    content += `Le candidat déclare sur l'honneur ne pas entrer dans l'un des cas d'exclusion prévus par le code de la commande publique.\n\n`;

    content += '### F2 - Documents de preuve disponibles en ligne\n\n';
    if (formData.documentsDisponiblesEnLigne) {
      content += `**Adresse internet** : ${formData.urlDocuments}\n\n`;
      if (formData.renseignementsAcces) {
        content += `**Renseignements d'accès** : ${formData.renseignementsAcces}\n\n`;
      }
    } else {
      content += 'Aucun document disponible en ligne\n\n';
    }

    content += '### F3 - Capacités\n\n';
    content += 'Le candidat produira le formulaire DC2 et les documents établissant ses capacités.\n\n';

    return content;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              A & B - Identification de l'acheteur et objet
            </h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Identification de l'acheteur
                </label>
                <button
                  type="button"
                  onClick={() => fillWithAI('acheteur')}
                  disabled={aiLoading === 'acheteur'}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {aiLoading === 'acheteur' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Remplir par IA
                </button>
              </div>
              <textarea
                value={formData.acheteur}
                onChange={(e) => setFormData({ ...formData, acheteur: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nom de l'acheteur, adresse, référence du dossier..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Objet de la consultation
                </label>
                <button
                  type="button"
                  onClick={() => fillWithAI('objetConsultation')}
                  disabled={aiLoading === 'objetConsultation'}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {aiLoading === 'objetConsultation' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Remplir par IA
                </button>
              </div>
              <textarea
                value={formData.objetConsultation}
                onChange={(e) => setFormData({ ...formData, objetConsultation: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description de l'objet de la consultation..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              C - Objet de la candidature
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                La candidature est présentée
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.typeOffre === 'marche'}
                    onChange={() => setFormData({ ...formData, typeOffre: 'marche' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pour le marché public (en cas de non allotissement)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.typeOffre === 'tous-lots'}
                    onChange={() => setFormData({ ...formData, typeOffre: 'tous-lots' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pour tous les lots de la procédure
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.typeOffre === 'lots-specifiques'}
                    onChange={() => setFormData({ ...formData, typeOffre: 'lots-specifiques' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pour le(s) lot(s) spécifique(s)
                  </span>
                </label>
              </div>

              {formData.typeOffre === 'lots-specifiques' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={formData.lotsSpecifiques}
                    onChange={(e) => setFormData({ ...formData, lotsSpecifiques: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Numéro(s) ou intitulé(s) des lots"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              D - Présentation du candidat
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de candidature
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.typeCandidature === 'seul'}
                    onChange={() => setFormData({ ...formData, typeCandidature: 'seul' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Le candidat se présente seul
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.typeCandidature === 'groupement-conjoint'}
                    onChange={() => setFormData({ ...formData, typeCandidature: 'groupement-conjoint' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Groupement d'entreprises conjoint
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.typeCandidature === 'groupement-solidaire'}
                    onChange={() => setFormData({ ...formData, typeCandidature: 'groupement-solidaire' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Groupement d'entreprises solidaire
                  </span>
                </label>
              </div>

              {formData.typeCandidature === 'groupement-conjoint' && (
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.mandataireSolidaire}
                      onChange={(e) => setFormData({ ...formData, mandataireSolidaire: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Le mandataire est solidaire
                    </span>
                  </label>
                </div>
              )}
            </div>

            {formData.typeCandidature === 'seul' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom commercial
                    </label>
                    <input
                      type="text"
                      value={formData.nomCommercial}
                      onChange={(e) => setFormData({ ...formData, nomCommercial: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dénomination sociale
                    </label>
                    <input
                      type="text"
                      value={formData.denominationSociale}
                      onChange={(e) => setFormData({ ...formData, denominationSociale: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse de l'établissement
                  </label>
                  <input
                    type="text"
                    value={formData.adresseEtablissement}
                    onChange={(e) => setFormData({ ...formData, adresseEtablissement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse du siège social (si différente)
                  </label>
                  <input
                    type="text"
                    value={formData.adresseSiegeSocial}
                    onChange={(e) => setFormData({ ...formData, adresseSiegeSocial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse électronique
                    </label>
                    <input
                      type="email"
                      value={formData.adresseElectronique}
                      onChange={(e) => setFormData({ ...formData, adresseElectronique: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Télécopie (optionnel)
                    </label>
                    <input
                      type="tel"
                      value={formData.telecopie}
                      onChange={(e) => setFormData({ ...formData, telecopie: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Numéro SIRET
                    </label>
                    <input
                      type="text"
                      value={formData.numeroSIRET}
                      onChange={(e) => setFormData({ ...formData, numeroSIRET: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 4:
        if (formData.typeCandidature === 'seul') {
          return renderStep5();
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                E - Membres du groupement
              </h3>
              <button
                type="button"
                onClick={addMembre}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Ajouter un membre
              </button>
            </div>

            {formData.membresGroupement.map((membre, index) => (
              <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Membre {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeMembre(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={membre.nomCommercial}
                    onChange={(e) => updateMembre(index, 'nomCommercial', e.target.value)}
                    placeholder="Nom commercial"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={membre.denominationSociale}
                    onChange={(e) => updateMembre(index, 'denominationSociale', e.target.value)}
                    placeholder="Dénomination sociale"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <input
                  type="text"
                  value={membre.adresse}
                  onChange={(e) => updateMembre(index, 'adresse', e.target.value)}
                  placeholder="Adresse"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="email"
                    value={membre.email}
                    onChange={(e) => updateMembre(index, 'email', e.target.value)}
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="tel"
                    value={membre.telephone}
                    onChange={(e) => updateMembre(index, 'telephone', e.target.value)}
                    placeholder="Téléphone"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={membre.siret}
                    onChange={(e) => updateMembre(index, 'siret', e.target.value)}
                    placeholder="SIRET"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {formData.typeCandidature === 'groupement-conjoint' && (
                  <textarea
                    value={membre.prestations}
                    onChange={(e) => updateMembre(index, 'prestations', e.target.value)}
                    placeholder="Prestations exécutées par ce membre"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>
            ))}

            {formData.membresGroupement.length > 0 && (
              <div className="border-t border-gray-300 dark:border-gray-600 pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  G - Désignation du mandataire
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.nomMandataire}
                    onChange={(e) => setFormData({ ...formData, nomMandataire: e.target.value })}
                    placeholder="Nom commercial du mandataire"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={formData.siretMandataire}
                    onChange={(e) => setFormData({ ...formData, siretMandataire: e.target.value })}
                    placeholder="SIRET du mandataire"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <input
                  type="text"
                  value={formData.adresseMandataire}
                  onChange={(e) => setFormData({ ...formData, adresseMandataire: e.target.value })}
                  placeholder="Adresse du mandataire"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    value={formData.emailMandataire}
                    onChange={(e) => setFormData({ ...formData, emailMandataire: e.target.value })}
                    placeholder="Email du mandataire"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="tel"
                    value={formData.telephoneMandataire}
                    onChange={(e) => setFormData({ ...formData, telephoneMandataire: e.target.value })}
                    placeholder="Téléphone du mandataire"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return renderStep5();

      default:
        return null;
    }
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        F - Engagements du candidat
      </h3>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.declarationNonExclusion}
            onChange={(e) => setFormData({ ...formData, declarationNonExclusion: e.target.checked })}
            className="mr-3 mt-1"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Le candidat déclare sur l'honneur ne pas entrer dans l'un des cas d'exclusion prévus aux articles L. 2141-1 à L. 2141-5 et L. 2141-7 à L. 2141-10 du code de la commande publique
          </span>
        </label>
      </div>

      <div>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={formData.documentsDisponiblesEnLigne}
            onChange={(e) => setFormData({ ...formData, documentsDisponiblesEnLigne: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Documents de preuve disponibles en ligne
          </span>
        </label>

        {formData.documentsDisponiblesEnLigne && (
          <div className="space-y-4 ml-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse internet
              </label>
              <input
                type="url"
                value={formData.urlDocuments}
                onChange={(e) => setFormData({ ...formData, urlDocuments: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Renseignements nécessaires pour y accéder
              </label>
              <textarea
                value={formData.renseignementsAcces}
                onChange={(e) => setFormData({ ...formData, renseignementsAcces: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Identifiants, codes d'accès, etc."
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>F3 - Capacités :</strong> Le candidat produira le formulaire DC2 et les documents établissant ses capacités, tels que demandés dans les documents de la consultation.
        </p>
      </div>
    </div>
  );

  const totalSteps = formData.typeCandidature === 'seul' ? 4 : 5;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Déclaration de Candidature (DC1)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {marketTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Étape {currentStep} sur {totalSteps}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {renderStep()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <div className="flex items-center gap-3">
            {currentStep === totalSteps ? (
              <button
                onClick={handleGenerate}
                disabled={loading || !formData.declarationNonExclusion}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Générer le DC1
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
