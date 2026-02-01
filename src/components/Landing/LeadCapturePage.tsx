import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';

interface LeadData {
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
  contact_person_name: string;
  contact_person_role: string;
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

export const LeadCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState<LeadData>({
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
    target_markets: [],
    contact_person_name: '',
    contact_person_role: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleSubmit = async () => {
    if (!leadData.company_name || !leadData.email || !leadData.phone) {
      setMessage({
        type: 'error',
        text: 'Veuillez renseigner au minimum le nom de l\'entreprise, l\'email et le téléphone'
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('lead_captures')
        .insert([{
          company_name: leadData.company_name,
          legal_form: leadData.legal_form,
          siret: leadData.siret,
          naf_code: leadData.naf_code,
          creation_date: leadData.creation_date,
          address: leadData.address,
          postal_code: leadData.postal_code,
          city: leadData.city,
          region: leadData.region,
          phone: leadData.phone,
          email: leadData.email,
          website: leadData.website,
          main_activity: leadData.main_activity,
          secondary_activities: leadData.secondary_activities,
          certifications: leadData.certifications,
          insurance_info: leadData.insurance_info,
          workforce: leadData.workforce,
          annual_turnover: leadData.annual_turnover,
          reference_projects: leadData.reference_projects,
          geographical_coverage: leadData.geographical_coverage,
          equipment_list: leadData.equipment_list,
          subcontracting_capacity: leadData.subcontracting_capacity,
          presentation: leadData.presentation,
          differentiators: leadData.differentiators,
          target_markets: leadData.target_markets,
          contact_person_name: leadData.contact_person_name,
          contact_person_role: leadData.contact_person_role,
          status: 'pending'
        }]);

      if (error) throw error;

      setShowSuccess(true);

      setTimeout(() => {
        navigate('/signup');
      }, 3000);
    } catch (error: any) {
      console.error('Error saving lead:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'enregistrement' });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: keyof LeadData, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setLeadData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: keyof LeadData, index: number) => {
    setLeadData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const addReferenceProject = () => {
    if (newReferenceProject.name.trim() && newReferenceProject.client.trim()) {
      setLeadData(prev => ({
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Merci pour votre demande !
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Votre profil entreprise a bien été enregistré. Notre équipe va l'examiner et vous recontacter très prochainement.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous allez être redirigé vers la page d'inscription...
          </p>
          <Button
            onClick={() => navigate('/signup')}
            variant="primary"
            className="text-lg px-8 py-3"
          >
            Créer mon compte maintenant
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" />
            Commencez votre essai gratuit de 7 jours
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Présentez votre entreprise
          </h1>
          <p className="text-xl text-gray-600">
            Complétez votre profil pour accéder à la plateforme et référencer votre entreprise auprès des collectivités de La Réunion
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <Card className="p-8">
          <div className="space-y-8">
            {/* Contact principal */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#F77F00]" />
                Personne à contacter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom et prénom *
                  </label>
                  <input
                    type="text"
                    value={leadData.contact_person_name}
                    onChange={(e) => setLeadData({ ...leadData, contact_person_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={leadData.contact_person_role}
                    onChange={(e) => setLeadData({ ...leadData, contact_person_role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    placeholder="Ex: Gérant, Directeur commercial..."
                  />
                </div>
              </div>
            </section>

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
                    value={leadData.company_name}
                    onChange={(e) => setLeadData({ ...leadData, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forme juridique
                  </label>
                  <select
                    value={leadData.legal_form}
                    onChange={(e) => setLeadData({ ...leadData, legal_form: e.target.value })}
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
                    value={leadData.siret}
                    onChange={(e) => setLeadData({ ...leadData, siret: e.target.value })}
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
                    value={leadData.naf_code}
                    onChange={(e) => setLeadData({ ...leadData, naf_code: e.target.value })}
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
                    value={leadData.address}
                    onChange={(e) => setLeadData({ ...leadData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={leadData.postal_code}
                    onChange={(e) => setLeadData({ ...leadData, postal_code: e.target.value })}
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
                    value={leadData.city}
                    onChange={(e) => setLeadData({ ...leadData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={leadData.website}
                    onChange={(e) => setLeadData({ ...leadData, website: e.target.value })}
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
                    value={leadData.main_activity}
                    onChange={(e) => setLeadData({ ...leadData, main_activity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    rows={3}
                    placeholder="Décrivez votre activité principale..."
                  />
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
                    {leadData.target_markets.map((market, index) => (
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
                    value={leadData.workforce || ''}
                    onChange={(e) => setLeadData({ ...leadData, workforce: parseInt(e.target.value) || 0 })}
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
                    value={leadData.annual_turnover}
                    onChange={(e) => setLeadData({ ...leadData, annual_turnover: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    {TURNOVER_RANGES.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
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
                {leadData.certifications.map((cert, index) => (
                  <span key={index} className="bg-green-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Award className="w-3 h-3" />
                    {cert}
                    <button onClick={() => removeItem('certifications', index)} className="text-red-600 hover:text-red-800">×</button>
                  </span>
                ))}
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
                    value={leadData.presentation}
                    onChange={(e) => setLeadData({ ...leadData, presentation: e.target.value })}
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
                    value={leadData.differentiators}
                    onChange={(e) => setLeadData({ ...leadData, differentiators: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                    rows={3}
                    placeholder="Qu'est-ce qui vous distingue de vos concurrents ?"
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-6 border-t">
              <Button
                onClick={handleSubmit}
                disabled={saving || !leadData.company_name || !leadData.email || !leadData.phone}
                variant="primary"
                className="w-full text-lg py-4"
              >
                {saving ? 'Envoi en cours...' : 'Commencer mon essai gratuit de 7 jours'}
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-sm text-gray-600 text-center">
                En soumettant ce formulaire, vous acceptez d'être recontacté par notre équipe.
                Offre Gratuite sans engagement.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
