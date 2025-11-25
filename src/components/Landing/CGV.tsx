import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CGV() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#F77F00] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Conditions Générales de Vente</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes conditions générales de vente (CGV) régissent l'utilisation de la plateforme Le Marché Public.fr,
              éditée par la société MARKET MAKER PUBLIC, SAS au capital de 100 euros, immatriculée au RCS de Saint-Denis
              sous le numéro 985 161 677, dont le siège social est situé au 3 Résidence les Jardins d'Hermione, allée des Cyclamens,
              97490 Sainte-Clotilde, La Réunion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Services proposés</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le Marché Public.fr propose une plateforme SaaS d'aide à la réponse aux appels d'offres publics, incluant notamment :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Veille et recherche d'appels d'offres</li>
              <li>Génération assistée de documents de réponse (mémoires techniques, économiques, etc.)</li>
              <li>Stockage et gestion de la base de connaissances entreprise</li>
              <li>Assistant IA pour l'analyse et la rédaction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Tarifs et modalités de paiement</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les tarifs des abonnements sont indiqués en euros TTC sur le site. Le paiement s'effectue par carte bancaire
              via notre prestataire de paiement sécurisé Stripe.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Les abonnements sont facturés mensuellement ou annuellement selon la formule choisie. Le renouvellement est
              automatique sauf résiliation par l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Durée et résiliation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'abonnement est souscrit pour une durée d'un mois ou d'un an selon la formule choisie, renouvelable tacitement.
            </p>
            <p className="text-gray-700 leading-relaxed">
              L'utilisateur peut résilier son abonnement à tout moment depuis son espace client. La résiliation prend effet
              à la fin de la période en cours, sans remboursement au prorata.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'ensemble des éléments de la plateforme (textes, images, logiciels, bases de données, etc.) est protégé
              par le droit d'auteur et reste la propriété exclusive de MARKET MAKER PUBLIC.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Les documents générés par l'utilisateur à partir de ses propres contenus restent sa propriété.
              MARKET MAKER PUBLIC ne revendique aucun droit sur ces contenus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Protection des données personnelles</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conformément au RGPD, les données personnelles collectées sont nécessaires à la fourniture du service
              et ne sont jamais cédées à des tiers à des fins commerciales.
            </p>
            <p className="text-gray-700 leading-relaxed">
              L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant :
              <a href="mailto:contact@lemarchepublic.fr" className="text-[#F77F00] hover:underline ml-1">
                contact@lemarchepublic.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Responsabilité et garanties</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le Marché Public.fr est un outil d'aide à la décision et à la rédaction. L'utilisateur reste seul responsable
              du contenu de ses réponses aux appels d'offres et de leur conformité aux règles applicables.
            </p>
            <p className="text-gray-700 leading-relaxed">
              MARKET MAKER PUBLIC ne garantit pas l'obtention de marchés publics et ne peut être tenue responsable
              en cas de refus de candidature ou d'attribution de marché à un concurrent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disponibilité du service</h2>
            <p className="text-gray-700 leading-relaxed">
              MARKET MAKER PUBLIC s'engage à fournir un service accessible 24h/24 et 7j/7, sous réserve des opérations
              de maintenance programmées. En cas d'indisponibilité prolongée, les utilisateurs seront informés par email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Droit de rétractation</h2>
            <p className="text-gray-700 leading-relaxed">
              Conformément à l'article L221-28 du Code de la consommation, l'utilisateur dispose d'un délai de 14 jours
              pour exercer son droit de rétractation sans avoir à justifier de motifs. Ce droit est toutefois exclu pour
              les services pleinement exécutés avant la fin du délai de rétractation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications des CGV</h2>
            <p className="text-gray-700 leading-relaxed">
              MARKET MAKER PUBLIC se réserve le droit de modifier les présentes CGV à tout moment. Les utilisateurs
              seront informés par email de toute modification substantielle au moins 30 jours avant leur entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Loi applicable et juridiction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée
              avant toute action judiciaire.
            </p>
            <p className="text-gray-700 leading-relaxed">
              À défaut de résolution amiable, le litige sera porté devant les tribunaux compétents de Saint-Denis, La Réunion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant ces CGV, vous pouvez nous contacter :
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email :</strong> contact@lemarchepublic.fr</p>
              <p className="text-gray-700 mt-2"><strong>Adresse :</strong> 3 Résidence les Jardins d'Hermione, allée des Cyclamens, 97490 Sainte-Clotilde, La Réunion</p>
              <p className="text-gray-700 mt-2"><strong>SIRET :</strong> 985 161 677 00011</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Dernière mise à jour : 25 novembre 2025
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">© 2025 Le Marché Public.fr - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
