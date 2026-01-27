import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Building2,
  Save,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  TrendingUp,
  FileText,
  Briefcase,
  Send
} from 'lucide-react';

interface CompanyProfile {
  id?: string;
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

const LEGAL_FORMS = [
  'Auto-entrepreneur',
  'EIRL',
  'EURL',
  'SARL',
  'SAS',
  'SASU',
  'SA',
  'SNC',
  'Association',
  'Autre'
];

const TURNOVER_RANGES = [
  'Moins de 100k€',
  '100k€ - 500k€',
  '500k€ - 1M€',
  '1M€ - 5M€',
  '5M€ - 10M€',
  'Plus de 10M€'
];

const REUNION_DEPARTMENTS = ['974'];

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile>({
    company_name: '',
    legal_form: '',
    siret: '',
    naf_code: '',
    creation_date: '',
    address: '',
    postal_code: '',
    city: '',
    region: 'La Réunion',
    phone: '',
    email: '',
    website: '',
    main_activity: '',
    secondary_activities: [],
    certifications: [],
    insurance_info: {},
    workforce: 0,
    annual_turnover: '',
    reference_projects: [],
    geographical_coverage: ['974'],
    equipment_list: [],
    subcontracting_capacity: false,
    presentation: '',
    differentiators: '',
    target_markets: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newSecondaryActivity, setNewSecondaryActivity] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newTargetMarket, setNewTargetMarket] = useState('');
  const [newReferenceProject, setNewReferenceProject] = useState({
    name: '',
    client: '',
    year: '',
    amount: '',
    description: ''
  });
  const [collectivities, setCollectivities] = useState<any[]>([]);
  const [sendingToCollectivities, setSendingToCollectivities] = useState(false);

  useEffect(() => {
    loadProfile();
    loadCollectivities();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
    } finally {
      setLoading(false);
    }
  };

  const loadCollectivities = async () => {
    try {
      const { data, error } = await supabase
        .from('collectivities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCollectivities(data || []);
    } catch (error) {
      console.error('Error loading collectivities:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const profileData = {
        ...profile,
        user_id: user.id
      };

      const { error } = await supabase
        .from('company_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      // Add to knowledge base for AI context
      await addToKnowledgeBase(profileData);

      setMessage({ type: 'success', text: 'Profil enregistré avec succès et ajouté à la base de connaissance !' });

      // Reload profile to get the ID
      await loadProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'enregistrement' });
    } finally {
      setSaving(false);
    }
  };

  const addToKnowledgeBase = async (profileData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a comprehensive text representation for AI context
      const knowledgeText = `
PROFIL D'ENTREPRISE COMPLET

Informations générales:
- Nom: ${profileData.company_name}
- Forme juridique: ${profileData.legal_form}
- SIRET: ${profileData.siret}
- Code NAF: ${profileData.naf_code}
- Date de création: ${profileData.creation_date}
- Effectif: ${profileData.workforce} personnes
- Chiffre d'affaires: ${profileData.annual_turnover}

Coordonnées:
- Adresse: ${profileData.address}, ${profileData.postal_code} ${profileData.city}
- Région: ${profileData.region}
- Téléphone: ${profileData.phone}
- Email: ${profileData.email}
- Site web: ${profileData.website}

Activités:
- Activité principale: ${profileData.main_activity}
- Activités secondaires: ${profileData.secondary_activities.join(', ')}
- Marchés ciblés: ${profileData.target_markets.join(', ')}
- Couverture géographique: Départements ${profileData.geographical_coverage.join(', ')}

Certifications et qualifications:
${profileData.certifications.join('\n')}

Matériel et équipements:
${profileData.equipment_list.join('\n')}

Assurance:
- Compagnie: ${profileData.insurance_info.company || 'N/A'}
- Numéro de police: ${profileData.insurance_info.policy_number || 'N/A'}
- Montant de couverture: ${profileData.insurance_info.coverage_amount || 'N/A'}

Capacité de sous-traitance: ${profileData.subcontracting_capacity ? 'Oui' : 'Non'}

Présentation de l'entreprise:
${profileData.presentation}

Éléments différenciants:
${profileData.differentiators}

Projets de référence:
${profileData.reference_projects.map((p: any) =>
  `- ${p.name} (${p.year}) pour ${p.client} - ${p.amount}\n  ${p.description}`
).join('\n')}
      `.trim();

      // Add to knowledge_files table
      await supabase
        .from('knowledge_files')
        .insert({
          user_id: user.id,
          file_name: 'Profil entreprise complet',
          file_type: 'text',
          content: knowledgeText,
          extracted_text: knowledgeText
        });
    } catch (error) {
      console.error('Error adding to knowledge base:', error);
    }
  };

  const sendToCollectivities = async () => {
    if (!profile.id) {
      setMessage({ type: 'error', text: 'Veuillez d\'abord enregistrer votre profil' });
      return;
    }

    setSendingToCollectivities(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Create referencing requests for all active collectivities
      const requests = collectivities.map(collectivity => ({
        user_id: user.id,
        company_profile_id: profile.id,
        collectivity_id: collectivity.id,
        status: 'pending'
      }));

      const { error } = await supabase
        .from('referencing_requests')
        .insert(requests);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Demandes de référencement créées pour ${collectivities.length} collectivités ! Les emails seront envoyés automatiquement.`
      });
    } catch (error: any) {
      console.error('Error sending to collectivities:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la création des demandes' });
    } finally {
      setSendingToCollectivities(false);
    }
  };

  const addItem = (field: keyof CompanyProfile, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: keyof CompanyProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const addReferenceProject = () => {
    if (newReferenceProject.name.trim() && newReferenceProject.client.trim()) {
      setProfile(prev => ({
        ...prev,
        reference_projects: [...prev.reference_projects, { ...newReferenceProject }]
      }));
      setNewReferenceProject({
        name: '',
        client: '',
        year: '',
        amount: '',
        description: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#F77F00]" />
            Profil Entreprise & Référencement
          </h2>
          <p className="text-gray-600 mt-1">
            Complétez votre profil pour référencer votre entreprise auprès des collectivités de La Réunion
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-8">
          {/* Informations légales */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F77F00]" />
              Informations légales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forme juridique
                </label>
                <select
                  value={profile.legal_form}
                  onChange={(e) => setProfile({ ...profile, legal_form: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {LEGAL_FORMS.map(form => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SIRET
                </label>
                <input
                  type="text"
                  value={profile.siret}
                  onChange={(e) => setProfile({ ...profile, siret: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  maxLength={14}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code NAF / APE
                </label>
                <input
                  type="text"
                  value={profile.naf_code}
                  onChange={(e) => setProfile({ ...profile, naf_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de création
                </label>
                <input
                  type="date"
                  value={profile.creation_date}
                  onChange={(e) => setProfile({ ...profile, creation_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Coordonnées */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F77F00]" />
              Coordonnées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={profile.postal_code}
                  onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="https://"
                />
              </div>
            </div>
          </section>

          {/* Activités */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#F77F00]" />
              Activités
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activité principale
                </label>
                <textarea
                  value={profile.main_activity}
                  onChange={(e) => setProfile({ ...profile, main_activity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  rows={3}
                  placeholder="Décrivez votre activité principale..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activités secondaires
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSecondaryActivity}
                    onChange={(e) => setNewSecondaryActivity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('secondary_activities', newSecondaryActivity, setNewSecondaryActivity)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Ajouter une activité secondaire"
                  />
                  <Button onClick={() => addItem('secondary_activities', newSecondaryActivity, setNewSecondaryActivity)}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.secondary_activities.map((activity, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {activity}
                      <button onClick={() => removeItem('secondary_activities', index)} className="text-red-600 hover:text-red-800">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marchés ciblés
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTargetMarket}
                    onChange={(e) => setNewTargetMarket(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('target_markets', newTargetMarket, setNewTargetMarket)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Ex: Travaux routiers, Bâtiment, Fournitures..."
                  />
                  <Button onClick={() => addItem('target_markets', newTargetMarket, setNewTargetMarket)}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.target_markets.map((market, index) => (
                    <span key={index} className="bg-[#F77F00]/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {market}
                      <button onClick={() => removeItem('target_markets', index)} className="text-red-600 hover:text-red-800">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Moyens et capacités */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F77F00]" />
              Moyens et capacités
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effectif
                </label>
                <input
                  type="number"
                  value={profile.workforce || ''}
                  onChange={(e) => setProfile({ ...profile, workforce: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Chiffre d'affaires annuel
                </label>
                <select
                  value={profile.annual_turnover}
                  onChange={(e) => setProfile({ ...profile, annual_turnover: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {TURNOVER_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={profile.subcontracting_capacity}
                    onChange={(e) => setProfile({ ...profile, subcontracting_capacity: e.target.checked })}
                    className="rounded border-gray-300 text-[#F77F00] focus:ring-[#F77F00]"
                  />
                  Capacité de sous-traitance
                </label>
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F77F00]" />
              Certifications et qualifications
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('certifications', newCertification, setNewCertification)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                placeholder="Ex: Qualibat 2412, RGE, ISO 9001..."
              />
              <Button onClick={() => addItem('certifications', newCertification, setNewCertification)}>
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert, index) => (
                <span key={index} className="bg-green-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  {cert}
                  <button onClick={() => removeItem('certifications', index)} className="text-red-600 hover:text-red-800">×</button>
                </span>
              ))}
            </div>
          </section>

          {/* Matériel */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Matériel et équipements</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('equipment_list', newEquipment, setNewEquipment)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                placeholder="Ex: Pelle 15T, Camion benne, Échafaudage..."
              />
              <Button onClick={() => addItem('equipment_list', newEquipment, setNewEquipment)}>
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.equipment_list.map((equipment, index) => (
                <span key={index} className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {equipment}
                  <button onClick={() => removeItem('equipment_list', index)} className="text-red-600 hover:text-red-800">×</button>
                </span>
              ))}
            </div>
          </section>

          {/* Assurance */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Assurance responsabilité civile professionnelle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compagnie d'assurance
                </label>
                <input
                  type="text"
                  value={profile.insurance_info.company || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    insurance_info: { ...profile.insurance_info, company: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de police
                </label>
                <input
                  type="text"
                  value={profile.insurance_info.policy_number || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    insurance_info: { ...profile.insurance_info, policy_number: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant de couverture
                </label>
                <input
                  type="text"
                  value={profile.insurance_info.coverage_amount || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    insurance_info: { ...profile.insurance_info, coverage_amount: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="Ex: 2 000 000 €"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={profile.insurance_info.expiry_date || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    insurance_info: { ...profile.insurance_info, expiry_date: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Présentation */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Présentation de l'entreprise</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Présentation générale
                </label>
                <textarea
                  value={profile.presentation}
                  onChange={(e) => setProfile({ ...profile, presentation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  rows={4}
                  placeholder="Présentez votre entreprise, votre histoire, vos valeurs..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Éléments différenciants
                </label>
                <textarea
                  value={profile.differentiators}
                  onChange={(e) => setProfile({ ...profile, differentiators: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  rows={3}
                  placeholder="Qu'est-ce qui vous distingue de vos concurrents ?"
                />
              </div>
            </div>
          </section>

          {/* Projets de référence */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Projets de référence</h3>
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={newReferenceProject.name}
                    onChange={(e) => setNewReferenceProject({ ...newReferenceProject, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Nom du projet"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newReferenceProject.client}
                    onChange={(e) => setNewReferenceProject({ ...newReferenceProject, client: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Client"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newReferenceProject.year}
                    onChange={(e) => setNewReferenceProject({ ...newReferenceProject, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Année"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newReferenceProject.amount}
                    onChange={(e) => setNewReferenceProject({ ...newReferenceProject, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Montant"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea
                    value={newReferenceProject.description}
                    onChange={(e) => setNewReferenceProject({ ...newReferenceProject, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    rows={2}
                    placeholder="Description du projet"
                  />
                </div>
              </div>
              <Button onClick={addReferenceProject}>
                Ajouter le projet
              </Button>
            </div>

            <div className="space-y-3">
              {profile.reference_projects.map((project, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.client} - {project.year} - {project.amount}</p>
                    </div>
                    <button
                      onClick={() => removeItem('reference_projects', index)}
                      className="text-red-600 hover:text-red-800"
                    >×</button>
                  </div>
                  <p className="text-sm text-gray-700">{project.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={saving || !profile.company_name}
              className="flex-1"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
            </Button>

            {profile.id && (
              <Button
                onClick={sendToCollectivities}
                disabled={sendingToCollectivities || collectivities.length === 0}
                variant="outline"
                className="flex-1"
              >
                <Send className="w-5 h-5" />
                {sendingToCollectivities
                  ? 'Envoi en cours...'
                  : `Référencer auprès de ${collectivities.length} collectivités`
                }
              </Button>
            )}
          </div>

          {collectivities.length === 0 && (
            <p className="text-sm text-gray-600 text-center">
              Les collectivités seront bientôt disponibles pour le référencement automatique.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};