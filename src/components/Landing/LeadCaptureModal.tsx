import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle, AlertCircle, User, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { trackFacebookEvent } from '../../lib/facebookPixel';

interface LeadCaptureModalProps {
  onClose: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
}

const REDIRECT_URL = 'https://lmp.bolt.host/';

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ onClose }) => {
  const [form, setForm] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const validate = () => {
    if (!form.first_name.trim()) return 'Le prénom est requis';
    if (!form.last_name.trim()) return 'Le nom est requis';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email invalide';
    if (!form.phone.trim()) return 'Le téléphone est requis';
    if (!form.company_name.trim()) return "Le nom de l'entreprise est requis";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('lead_captures')
        .insert([{
          contact_person_name: `${form.first_name.trim()} ${form.last_name.trim()}`,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          company_name: form.company_name.trim(),
          status: 'pending',
          region: 'La Réunion',
        }]);

      if (dbError) throw dbError;

      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-to-highlevel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            firstName: form.first_name.trim(),
            lastName: form.last_name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            companyName: form.company_name.trim(),
            tags: ['iris-lead', 'modal-hero'],
          }),
        });
      } catch {}

      try {
        trackFacebookEvent('Lead', { content_name: 'hero_cta', content_category: 'trial' });
      } catch {}

      setSuccess(true);
      setTimeout(() => {
        window.open(REDIRECT_URL, '_blank');
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Lead capture error:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-linkedin-500 px-6 pt-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80"
              alt="Iris"
              className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
            />
            <div>
              <p className="text-white font-bold text-lg leading-tight">Recruter Iris</p>
              <p className="text-white/80 text-sm">7 jours gratuits • Sans engagement</p>
            </div>
          </div>
          <p className="text-white/90 text-sm">
            Renseignez vos coordonnées et accédez immédiatement à la plateforme.
          </p>
        </div>

        <div className="-mt-4 mx-4 bg-white rounded-xl shadow-md px-6 py-5 border border-gray-100">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Parfait !</h3>
              <p className="text-gray-600 text-sm">Redirection vers la plateforme en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={handleChange('first_name')}
                      placeholder="Jean"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={handleChange('last_name')}
                      placeholder="Dupont"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email professionnel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="jean@monentreprise.re"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="0262 XX XX XX"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Entreprise <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={handleChange('company_name')}
                    placeholder="Mon Entreprise SARL"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none"
                    autoComplete="organization"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2.5 rounded-lg text-sm border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-linkedin-500 hover:bg-linkedin-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Accéder à la plateforme
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                En soumettant, vous acceptez d'être recontacté. Essai 7 jours sans engagement.
              </p>
            </form>
          )}
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Sans engagement
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              7 jours gratuits
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
