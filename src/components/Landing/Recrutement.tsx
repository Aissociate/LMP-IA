import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

export const Recrutement: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    experiences_similaires: '',
    methode_eviter_erreurs: '',
    disponibilite_quotidienne: '',
    accord_paiement_tarif: false,
    motivations: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.experiences_similaires || !formData.methode_eviter_erreurs || !formData.disponibilite_quotidienne) {
      setError('Veuillez répondre à toutes les questions obligatoires.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.accord_paiement_tarif) {
      setError('Vous devez accepter les conditions de paiement et le tarif horaire.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('candidatures')
        .insert([{
          ...formData,
          statut: 'nouveau'
        }]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        experiences_similaires: '',
        methode_eviter_erreurs: '',
        disponibilite_quotidienne: '',
        accord_paiement_tarif: false,
        motivations: ''
      });
    } catch (err: any) {
      console.error('Error submitting candidature:', err);
      setError('Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Candidature envoyée avec succès !
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre candidature. Notre équipe va examiner votre profil et vous contactera dans les plus brefs délais si votre candidature est retenue.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-[#F77F00] text-white hover:bg-[#E06F00]"
          >
            Retour à l'accueil
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-[120px] w-auto" />
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Retour à l'accueil
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission Header */}
        <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📢</span>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Mission Freelance Récurrente
            </h1>
          </div>
          <p className="text-xl font-semibold">
            Collecte & saisie d'informations web (2h/jour)
          </p>
        </div>

        {/* Mission Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-lg text-gray-700 mb-6">
            Nous recherchons un(e) freelance <strong>sérieux(se), méthodique et constant(e)</strong> pour une mission simple, structurée et régulière, idéale pour une personne appréciant les tâches claires, répétitives et bien cadrées.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎯</span> La mission
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Relever manuellement des informations sur environ 50 sites web précis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Copier / coller ces données dans une interface dédiée</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Respecter des règles de saisie strictes (formats, cohérence, exhaustivité)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Suivre un process défini, sans interprétation ni approximation</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 italic">
                Il ne s'agit ni de rédaction, ni d'analyse, mais d'un travail de rigueur et de fiabilité.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>⏱️</span> Organisation
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>2 heures par jour</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Du lundi au vendredi (jours ouvrés uniquement)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Mission récurrente, stable et long terme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Horaires flexibles tant que le travail quotidien est réalisé</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💰</span> Rémunération
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Paiement via Taptap</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>Taux indicatif : 1 € / heure</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Paiements réguliers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Volume stable dans le temps pour les profils fiables</span>
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>✅</span> Profil recherché
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Freelance ponctuel(le), organisé(e) et très attentif(ve) aux détails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>À l'aise avec la navigation web et les interfaces en ligne</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Capable de suivre des consignes précises sur la durée</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Disponible tous les jours ouvrés, sans interruptions fréquentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Connexion internet stable indispensable</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>⚠️ Important :</strong> Cette mission convient uniquement aux personnes recherchant une activité régulière, simple et cadrée, et capables de maintenir un niveau de qualité constant.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">🤝 Ce que nous offrons</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Une mission claire, sans surprise</li>
              <li>• Un cadre de travail stable</li>
              <li>• Des consignes précises et un process rodé</li>
              <li>• Une collaboration sérieuse sur la durée pour les profils fiables</li>
            </ul>
          </div>
        </div>

        {/* Formulaire de candidature */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📌 Formulaire de candidature
          </h2>
          <p className="text-gray-600 mb-6">
            Merci de remplir tous les champs avec attention. Les candidatures incomplètes ne seront pas traitées.
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Questions obligatoires */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vos références ou expériences similaires <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                (saisie, data entry, veille, tâches répétitives)
              </p>
              <textarea
                name="experiences_similaires"
                value={formData.experiences_similaires}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                placeholder="Décrivez vos expériences similaires en détail..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Votre méthode pour éviter les erreurs <span className="text-red-500">*</span>
              </label>
              <textarea
                name="methode_eviter_erreurs"
                value={formData.methode_eviter_erreurs}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                placeholder="Expliquez votre méthode de travail pour garantir la qualité et éviter les erreurs..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmation de votre disponibilité quotidienne <span className="text-red-500">*</span>
              </label>
              <textarea
                name="disponibilite_quotidienne"
                value={formData.disponibilite_quotidienne}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                placeholder="Confirmez votre disponibilité (2h/jour, lundi-vendredi, horaires flexibles)..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motivations (optionnel)
              </label>
              <textarea
                name="motivations"
                value={formData.motivations}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F77F00] focus:border-transparent"
                placeholder="Pourquoi cette mission vous intéresse-t-elle ?"
              />
            </div>

            {/* Accord paiement */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="accord_paiement_tarif"
                  checked={formData.accord_paiement_tarif}
                  onChange={handleChange}
                  required
                  className="mt-1 w-5 h-5 text-[#F77F00] border-gray-300 rounded focus:ring-[#F77F00]"
                />
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-900">J'accepte les conditions de paiement et le tarif horaire</strong>
                  <br />
                  Je confirme accepter le paiement via Taptap au tarif indicatif de 1 € / heure et avoir lu attentivement l'annonce.
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>🚫 Important :</strong> Les candidatures sans références, sans lecture attentive de l'annonce ou non alignées avec les conditions ne seront pas retenues.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg py-4"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
