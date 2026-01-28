import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText } from 'lucide-react';

export function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#F77F00] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </button>
          <img src="/logo1.png" alt="Le Marché Public.fr" className="h-16 w-auto object-contain" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions Légales & Confidentialité</h1>
            <p className="text-sm text-gray-600">Dernière mise à jour : 28 janvier 2025</p>
          </div>

          {/* MENTIONS LÉGALES */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#F77F00]" />
              <h2 className="text-2xl font-bold text-gray-900">Mentions Légales</h2>
            </div>

            <div className="bg-orange-50 border-l-4 border-[#F77F00] p-6 rounded-lg space-y-3">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Raison sociale</p>
                <p className="text-gray-700">LeMarchéPublic.fr</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Forme juridique</p>
                <p className="text-gray-700">Entreprise Individuelle</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Adresse du siège social</p>
                <p className="text-gray-700">36 chemin de l'état major<br />Saint Denis, La Réunion 974</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">RCS</p>
                <p className="text-gray-700">Saint Denis : 443 451 943 00049</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Directeur de la publication</p>
                <p className="text-gray-700">Shanti MERALLI BALLOU</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Contact</p>
                <p className="text-gray-700">
                  Email : <a href="mailto:contact@lemarchepublic.fr" className="text-[#F77F00] hover:underline">contact@lemarchepublic.fr</a>
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Hébergement</p>
                <p className="text-gray-700">
                  Supabase Inc.<br />
                  970 Toa Payoh North, #07-04, Singapore 318992<br />
                  Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#F77F00] hover:underline">supabase.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* PROTECTION DES DONNÉES */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#F77F00]" />
              <h2 className="text-2xl font-bold text-gray-900">Protection des Données Personnelles (RGPD)</h2>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Responsable du traitement</h3>
                <p>
                  Le responsable du traitement des données personnelles est LeMarchéPublic.fr, représenté par Shanti MERALLI BALLOU.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Données collectées</h3>
                <p className="mb-3">Nous collectons les données suivantes dans le cadre de l'utilisation de notre plateforme :</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Données d'identification :</strong> Nom, prénom, adresse email, numéro de téléphone</p>
                  <p><strong>Données professionnelles :</strong> Nom de l'entreprise, SIRET, secteur d'activité, fonction</p>
                  <p><strong>Données de connexion :</strong> Adresse IP, logs de connexion, cookies</p>
                  <p><strong>Données de navigation :</strong> Pages visitées, actions effectuées sur la plateforme</p>
                  <p><strong>Données de paiement :</strong> Informations bancaires (traitées par notre prestataire de paiement sécurisé)</p>
                  <p><strong>Documents et contenus :</strong> Documents de marchés publics, mémoires techniques, fichiers uploadés</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Finalités du traitement</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Gestion de votre compte utilisateur et authentification</li>
                  <li>Fourniture des services de veille et d'alertes marchés publics</li>
                  <li>Génération de mémoires techniques et documents par IA</li>
                  <li>Gestion des abonnements et facturation</li>
                  <li>Envoi de communications relatives au service (alertes, notifications)</li>
                  <li>Amélioration de nos services et support client</li>
                  <li>Respect de nos obligations légales et réglementaires</li>
                  <li>Prévention de la fraude et sécurisation de la plateforme</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Base légale du traitement</h3>
                <p>Les traitements de données sont fondés sur :</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>L'exécution du contrat</strong> : pour fournir les services auxquels vous avez souscrit</li>
                  <li><strong>Le consentement</strong> : pour l'envoi de communications marketing (révocable à tout moment)</li>
                  <li><strong>L'intérêt légitime</strong> : pour améliorer nos services et assurer la sécurité</li>
                  <li><strong>L'obligation légale</strong> : pour respecter nos obligations fiscales et comptables</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Destinataires des données</h3>
                <p className="mb-2">Vos données personnelles sont destinées :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Au personnel habilité de LeMarchéPublic.fr</li>
                  <li>À nos prestataires techniques (hébergement, paiement, envoi d'emails)</li>
                  <li>Aux autorités compétentes sur réquisition judiciaire</li>
                </ul>
                <p className="mt-3 text-sm bg-blue-50 p-3 rounded">
                  <strong>Important :</strong> Nous ne vendons ni ne louons jamais vos données personnelles à des tiers à des fins commerciales.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Durée de conservation</h3>
                <div className="space-y-2">
                  <p><strong>Données de compte actif :</strong> Pendant toute la durée de votre abonnement + 3 ans après résiliation</p>
                  <p><strong>Données de facturation :</strong> 10 ans (obligation légale)</p>
                  <p><strong>Logs de connexion :</strong> 12 mois maximum</p>
                  <p><strong>Documents et mémoires :</strong> Pendant la durée de votre abonnement + 1 an, sauf suppression manuelle</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Vos droits</h3>
                <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-semibold text-green-900 mb-1">Droit d'accès</p>
                    <p className="text-green-800 text-sm">Obtenir une copie de vos données personnelles</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-1">Droit de rectification</p>
                    <p className="text-blue-800 text-sm">Corriger des données inexactes ou incomplètes</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-1">Droit à l'effacement</p>
                    <p className="text-purple-800 text-sm">Demander la suppression de vos données</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="font-semibold text-orange-900 mb-1">Droit à la limitation</p>
                    <p className="text-orange-800 text-sm">Limiter le traitement de vos données</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <p className="font-semibold text-teal-900 mb-1">Droit à la portabilité</p>
                    <p className="text-teal-800 text-sm">Recevoir vos données dans un format structuré</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="font-semibold text-red-900 mb-1">Droit d'opposition</p>
                    <p className="text-red-800 text-sm">Vous opposer au traitement de vos données</p>
                  </div>
                </div>
                <p className="mt-4">
                  Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@lemarchepublic.fr" className="text-[#F77F00] hover:underline font-semibold">contact@lemarchepublic.fr</a>
                </p>
                <p className="mt-2 text-sm">
                  Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#F77F00] hover:underline">www.cnil.fr</a>).
                </p>
              </div>
            </div>
          </section>

          {/* SÉCURITÉ DES DONNÉES */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#F77F00]" />
              <h2 className="text-2xl font-bold text-gray-900">Sécurité des Données</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour assurer la sécurité et la confidentialité de vos données :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Chiffrement SSL/TLS</strong> : Toutes les communications sont chiffrées (HTTPS)</li>
                <li><strong>Hébergement sécurisé</strong> : Serveurs conformes RGPD, avec redondance et sauvegardes</li>
                <li><strong>Authentification forte</strong> : Protection par mot de passe sécurisé</li>
                <li><strong>Surveillance 24/7</strong> : Monitoring des accès et détection des anomalies</li>
                <li><strong>Mises à jour régulières</strong> : Patches de sécurité appliqués systématiquement</li>
                <li><strong>Accès restreints</strong> : Seul le personnel habilité accède aux données</li>
                <li><strong>Coffre-fort numérique</strong> : Stockage chiffré de vos documents sensibles</li>
              </ul>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <p className="text-green-800">
                  <strong>En cas de violation de données</strong>, nous vous informerons dans les 72 heures conformément au RGPD et prendrons toutes les mesures nécessaires pour limiter l'impact.
                </p>
              </div>
            </div>
          </section>

          {/* COOKIES */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-[#F77F00]" />
              <h2 className="text-2xl font-bold text-gray-900">Politique de Cookies</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Notre site utilise des cookies pour améliorer votre expérience et analyser l'utilisation de notre plateforme.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Types de cookies utilisés :</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-1">Cookies essentiels (obligatoires)</p>
                    <p className="text-blue-800 text-sm">Nécessaires au fonctionnement du site (authentification, sécurité, préférences de session)</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-1">Cookies analytiques (optionnels)</p>
                    <p className="text-purple-800 text-sm">Mesure d'audience et statistiques de visite (Google Analytics)</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="font-semibold text-orange-900 mb-1">Cookies fonctionnels (optionnels)</p>
                    <p className="text-orange-800 text-sm">Amélioration de l'expérience utilisateur et personnalisation</p>
                  </div>
                </div>
              </div>

              <p>
                Vous pouvez à tout moment modifier vos préférences de cookies depuis les paramètres de votre navigateur ou notre interface dédiée.
              </p>
            </div>
          </section>

          {/* TRANSFERTS DE DONNÉES */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-[#F77F00]" />
              <h2 className="text-2xl font-bold text-gray-900">Transferts de Données</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Vos données sont hébergées au sein de l'Union Européenne. Elles ne font l'objet d'aucun transfert vers des pays tiers, sauf dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Services de paiement sécurisés (conformes PCI-DSS)</li>
                <li>Services d'envoi d'emails transactionnels</li>
                <li>Services d'intelligence artificielle dans le cadre de la génération de contenus</li>
              </ul>
              <p className="mt-3">
                Dans tous les cas, ces transferts sont encadrés par des clauses contractuelles types approuvées par la Commission Européenne et garantissent un niveau de protection équivalent au RGPD.
              </p>
            </div>
          </section>

          {/* INTELLIGENCE ARTIFICIELLE */}
          <section>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Utilisation de l'Intelligence Artificielle</h3>
              <p className="text-gray-700 mb-3">
                Notre plateforme utilise des technologies d'intelligence artificielle pour générer des mémoires techniques et analyser des documents de marchés publics.
              </p>
              <p className="text-gray-900 font-semibold mb-2">Informations importantes :</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Les contenus générés par IA sont des propositions qui doivent être relues et validées par vous</li>
                <li>Vos documents sont traités de manière confidentielle</li>
                <li>Vous restez propriétaire de tous les documents que vous uploadez et des contenus générés</li>
                <li>Nous ne partageons jamais vos données avec des tiers sans votre consentement</li>
              </ul>
            </div>
          </section>

          {/* MODIFICATIONS */}
          <section>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-xl font-semibold text-gray-900">Modifications de la politique</h3>
              <p>
                Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour.
              </p>
              <p>
                En cas de modification substantielle, nous vous en informerons par email ou via une notification sur la plateforme.
              </p>
            </div>
          </section>

          {/* CONTACT */}
          <section className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-3">Nous contacter</h3>
            <p className="mb-4">
              Pour toute question concernant vos données personnelles ou l'exercice de vos droits :
            </p>
            <div className="space-y-2">
              <p><strong>Email :</strong> <a href="mailto:contact@lemarchepublic.fr" className="underline hover:no-underline">contact@lemarchepublic.fr</a></p>
              <p><strong>Adresse :</strong> 36 chemin de l'état major, Saint Denis, La Réunion 974</p>
            </div>
            <p className="mt-4 text-sm text-white/90">
              Nous nous engageons à répondre à toute demande dans un délai maximum de 30 jours.
            </p>
          </section>

          <div className="border-t pt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2025 LeMarchéPublic.fr - Tous droits réservés
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2025 Le Marché Public.fr - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
