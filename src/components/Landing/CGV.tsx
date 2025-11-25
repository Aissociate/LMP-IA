import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function CGV() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#F77F00] hover:text-[#E06F00] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            CONDITIONS GÉNÉRALES DE VENTE
          </h1>
          <p className="text-center text-gray-600 mb-8">DE LA PLATEFORME LEMARCHEPUBLIC.FR</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 – Identification du Prestataire et champ d'application</h2>
              <p className="text-gray-700 mb-4">
                Les présentes conditions générales de vente (ci-après les « CGV ») ont pour objet de définir les conditions dans lesquelles la société :
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-4">
                <p className="font-semibold text-gray-900 mb-2">LeMarchéPublic.fr</p>
                <p className="text-gray-700">Entreprise Individuelle</p>
                <p className="text-gray-700">36 chemin de l'état major, Saint Denis, La Réunion</p>
                <p className="text-gray-700">RCS Saint Denis : 443 451 943 00049</p>
              </div>
              <p className="text-gray-700 mb-4">
                (ci-après le « Prestataire » ou « LeMarchéPublic.fr »)
              </p>
              <p className="text-gray-700 mb-4">
                fournit à tout client professionnel (ci-après le « Client ») l'accès à sa plateforme en ligne et aux services associés (ci-après ensemble les « Services »).
              </p>
              <p className="text-gray-700 mb-4">
                Les présentes CGV s'appliquent, sans restriction ni réserve, à toute commande de Services passée par le Client, à l'exclusion de toute condition d'achat du Client. Elles prévalent sur tout autre document, sauf stipulation contraire expresse et écrite du Prestataire.
              </p>
              <p className="text-gray-700">
                Le Client reconnaît avoir pris connaissance des présentes CGV et les accepter pleinement et sans réserve avant la passation de sa commande.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 – Définitions</h2>
              <p className="text-gray-700 mb-4">Aux fins des présentes, les termes ci-après auront la signification suivante :</p>
              <ul className="space-y-3 text-gray-700">
                <li><strong>« Plateforme » :</strong> l'interface logicielle accessible notamment via le site internet LeMarchéPublic.fr, permettant au Client d'accéder aux Services.</li>
                <li><strong>« Services » :</strong> l'ensemble des fonctionnalités et prestations proposées par le Prestataire, incluant notamment la veille de marchés publics, l'analyse de pertinence (GO / NO-GO), la génération de contenus par intelligence artificielle (mémoires techniques, BPU, etc.), l'assistant IA et, le cas échéant, les prestations d'accompagnement par un expert.</li>
                <li><strong>« Abonnement » :</strong> formule contractuelle permettant au Client d'accéder aux Services sur une base récurrente, moyennant le paiement d'un prix périodique.</li>
                <li><strong>« Boosters » :</strong> prestations additionnelles ponctuelles (par exemple : intervention d'un expert, mémoire supplémentaire, etc.), facturées en sus de l'Abonnement.</li>
                <li><strong>« IA » :</strong> les systèmes d'intelligence artificielle et de génération automatique de contenus mis en œuvre par le Prestataire.</li>
                <li><strong>« Données Client » :</strong> l'ensemble des données, documents et informations transmis ou rendus accessibles par le Client dans le cadre de l'utilisation des Services (notamment DCE, BPU, documents internes, etc.).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 – Description des Services</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Veille de marchés publics</h3>
              <p className="text-gray-700 mb-4">
                Le Prestataire met à disposition du Client un service de veille consistant à détecter et à remonter, selon des critères paramétrables, des annonces de marchés publics susceptibles de correspondre au profil du Client.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Analyse GO / NO-GO</h3>
              <p className="text-gray-700 mb-2">
                Pour certains marchés détectés ou chargés par le Client, le Prestataire fournit, via ses outils IA, un avis de type GO / GO sous condition / NO-GO et/ou un score indicatif de pertinence, assorti de commentaires synthétiques.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Cet avis a une valeur purement indicative et ne saurait se substituer à l'analyse et à la décision du Client.</strong>
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Génération de mémoires techniques et de BPU par IA</h3>
              <p className="text-gray-700 mb-4">
                Le Prestataire met à disposition des moteurs d'IA (notamment « Market Light » et « Market Pro ») permettant :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>la génération d'un brouillon de mémoire technique structuré à partir du DCE et des Données Client ;</li>
                <li>la préparation d'un Bordereau des Prix Unitaires (BPU) sur la base des données fournies et/ou paramétrées par le Client.</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ Les contenus ainsi générés sont des propositions automatiques et des bases de travail, qui doivent obligatoirement être relues, complétées, corrigées et validées par le Client avant tout dépôt officiel ou usage externe.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Assistant IA Marchés & BPU</h3>
              <p className="text-gray-700 mb-4">
                Le Prestataire met à disposition un assistant IA permettant d'interroger, en langage naturel, les documents de marché (DCE, RC, CCAP, CCTP, etc.) ainsi que les contenus générés, afin d'en faciliter la compréhension et l'exploitation.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Abonnements et options</h3>
              <p className="text-gray-700 mb-4">
                Les Abonnements proposés par le Prestataire peuvent notamment inclure, selon la formule choisie :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>un volume mensuel de mémoires générés par IA ;</li>
                <li>l'accès à la veille et aux avis GO / NO-GO ;</li>
                <li>l'accès à l'assistant IA ;</li>
                <li>un niveau prioritaire de traitement.</li>
              </ul>
              <p className="text-gray-700">
                Les caractéristiques précises (volumes inclus, fonctionnalités, durée, prix) de chaque formule d'Abonnement sont détaillées sur le site internet du Prestataire et/ou dans le devis / bon de commande accepté par le Client.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.6 Boosters et prestations ponctuelles</h3>
              <p className="text-gray-700 mb-4">
                Le Prestataire peut également proposer des prestations complémentaires telles que, à titre non limitatif :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>mémoires supplémentaires facturés à l'unité ;</li>
                <li>intervention d'un expert pendant un nombre d'heures déterminé (par ex. 4 heures) ;</li>
                <li>accompagnement intensif sur un marché donné (par ex. 3 jours d'expert).</li>
              </ul>
              <p className="text-gray-700">
                Lesdites prestations sont facturées en sus, sur la base du tarif en vigueur au jour de la commande, éventuellement précisé dans un devis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 4 – Commandes</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Procédure de commande</h3>
              <p className="text-gray-700 mb-4">
                La souscription à un Abonnement ou la commande d'un Booster intervient :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>soit en ligne, via la Plateforme,</li>
                <li>soit par validation d'un devis émis par le Prestataire (signature manuscrite ou électronique, accord par e-mail, clic de validation, etc.).</li>
              </ul>
              <p className="text-gray-700 mb-4">
                La commande est ferme et définitive à compter de sa validation par le Client.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Acceptation des CGV</h3>
              <p className="text-gray-700 mb-4">
                La validation de la commande emporte acceptation pleine et entière des présentes CGV par le Client, qui reconnaît en avoir pris connaissance préalablement.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Modification / annulation de commande</h3>
              <p className="text-gray-700">
                Toute demande de modification ou d'annulation de commande par le Client postérieure à sa validation est soumise à l'acceptation expresse et écrite du Prestataire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 – Prix</h2>
              <p className="text-gray-700 mb-4">
                Les prix des Abonnements et des prestations ponctuelles sont exprimés en euros hors taxes (HT), auxquels s'ajoutent les taxes applicables au jour de la facturation.
              </p>
              <p className="text-gray-700 mb-4">
                Les tarifs applicables sont ceux en vigueur au jour de la commande, tels qu'indiqués sur la Plateforme et/ou sur le devis accepté par le Client.
              </p>
              <p className="text-gray-700 mb-4">
                Le Prestataire se réserve la faculté de modifier ses tarifs à tout moment. Les nouveaux tarifs seront applicables :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>aux nouvelles commandes, immédiatement ;</li>
                <li>aux Abonnements en cours, à compter de la prochaine échéance de renouvellement, sous réserve d'une information préalable du Client dans un délai raisonnable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 – Durée des Abonnements – Renouvellement – Résiliation</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Durée initiale</h3>
              <p className="text-gray-700 mb-4">
                Les Abonnements sont conclus pour une durée initiale de un (1) mois ou de un (1) an, selon la formule choisie par le Client.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Renouvellement tacite</h3>
              <p className="text-gray-700 mb-4">
                À l'issue de la durée initiale, l'Abonnement est tacitement reconduit pour des périodes successives identiques, sauf résiliation par l'une des parties dans les conditions ci-après.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Résiliation à l'initiative du Client</h3>
              <p className="text-gray-700 mb-4">
                Pour les Abonnements mensuels, le Client peut demander la résiliation à tout moment, la résiliation prenant effet à la fin de la période mensuelle en cours, à condition que la demande intervienne avant la date de renouvellement.
              </p>
              <p className="text-gray-700 mb-4">
                Pour les Abonnements annuels, la résiliation ne peut intervenir qu'à l'échéance de la période annuelle en cours, sauf stipulation contractuelle contraire. Sauf accord spécifique, aucun remboursement prorata temporis ne sera effectué en cas de résiliation anticipée.
              </p>
              <p className="text-gray-700 mb-4">
                La résiliation peut être notifiée via l'espace client ou par écrit (courrier ou e-mail) adressé au Prestataire.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.4 Résiliation pour manquement</h3>
              <p className="text-gray-700 mb-4">
                En cas de manquement par l'une des parties à l'une de ses obligations essentielles au titre des présentes, non réparé dans un délai de trente (30) jours à compter de l'envoi d'une mise en demeure par lettre recommandée avec accusé de réception, l'autre partie pourra prononcer la résiliation de plein droit de l'Abonnement, sans préjudice de tous dommages et intérêts auxquels elle pourrait prétendre.
              </p>
              <p className="text-gray-700 mb-4">
                Le Prestataire pourra notamment résilier l'Abonnement de plein droit, sans délai, en cas :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>de non-paiement répété des factures ;</li>
                <li>d'utilisation frauduleuse, illicite ou manifestement abusive des Services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 7 – Conditions de paiement</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Modalités de paiement</h3>
              <p className="text-gray-700 mb-4">
                Sauf conditions particulières, le prix des Abonnements est exigible d'avance au début de chaque période (mensuelle ou annuelle), par prélèvement, carte bancaire, virement ou tout autre moyen proposé par le Prestataire.
              </p>
              <p className="text-gray-700 mb-4">
                Les prestations ponctuelles (Boosters, mémoires à l'unité, etc.) sont facturées selon les modalités définies lors de la commande.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Retard ou défaut de paiement</h3>
              <p className="text-gray-700 mb-4">
                En cas de retard de paiement, des pénalités seront applicables de plein droit, sans mise en demeure préalable, à compter du lendemain de la date d'échéance, au taux minimum prévu par l'article L.441-10 du Code de commerce (taux directeur de la Banque centrale européenne majoré de 10 points).
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  Une indemnité forfaitaire de 40 € pour frais de recouvrement sera également due, sans préjudice du droit pour le Prestataire de réclamer une indemnisation complémentaire sur justificatifs.
                </p>
              </div>
              <p className="text-gray-700">
                En cas de non-paiement partiel ou total, le Prestataire se réserve en outre la faculté de suspendre l'accès aux Services jusqu'au règlement complet des sommes dues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 – Absence de droit de rétractation</h2>
              <p className="text-gray-700 mb-4">
                Le Client reconnaît expressément agir à des fins entrant dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole, de sorte qu'il ne revêt pas la qualité de consommateur au sens du Code de la consommation.
              </p>
              <p className="text-gray-700">
                En conséquence, le Client ne bénéficie pas du droit de rétractation prévu aux articles L.221-18 et suivants du Code de la consommation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 9 – Obligations du Client</h2>
              <p className="text-gray-700 mb-4">Le Client s'engage à :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>fournir des informations exactes, complètes et régulièrement mises à jour ;</li>
                <li>ne transmettre que des Données Client dont il détient les droits d'usage, sans porter atteinte aux droits de tiers ;</li>
                <li>respecter l'ensemble des lois et réglementations applicables (notamment en matière de marchés publics, de confidentialité, de données personnelles, de propriété intellectuelle) ;</li>
                <li>ne pas détourner les Services de leur objet ni les utiliser à des fins illégales, frauduleuses ou contraires à l'ordre public ;</li>
                <li>relire, vérifier, compléter et valider tout contenu généré par IA avant toute utilisation externe, et notamment avant le dépôt d'une réponse à un appel d'offres.</li>
              </ul>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800 font-semibold mb-2">Le Client demeure seul responsable :</p>
                <ul className="list-disc pl-6 text-blue-800 space-y-1">
                  <li>des décisions de répondre ou non à un marché ;</li>
                  <li>des prix figurant dans ses BPU et offres ;</li>
                  <li>du contenu final des mémoires, offres, réponses et documents remis à l'acheteur public.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 10 – Nature des résultats fournis</h2>
              <p className="text-gray-700 mb-4">Le Client est informé et accepte que :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>les résultats fournis par l'IA (mémoires, BPU, analyses, réponses, etc.) sont générés de manière automatisée à partir des Données Client et de modèles statistiques ;</li>
                <li>la Plateforme peut comporter des limitations techniques et ne saurait garantir l'absence totale d'erreur, d'omission ou d'incohérence ;</li>
                <li>les Services constituent un outil d'aide à la rédaction, à l'analyse et à la décision, et non un service de conseil juridique, fiscal, comptable ou un engagement de résultat.</li>
              </ul>
              <p className="text-gray-700 mb-4">Le Prestataire ne garantit pas :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>l'obtention d'un marché public ;</li>
                <li>un score minimal à un critère de notation ;</li>
                <li>la conformité absolue du contenu généré à l'ensemble des exigences du DCE.</li>
              </ul>
              <p className="text-gray-700">
                Il appartient au Client de procéder à toutes vérifications jugées nécessaires et, le cas échéant, de solliciter ses propres conseils (juristes, avocats, bureaux d'études, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 11 – Responsabilité et limitation</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Obligation de moyens</h3>
              <p className="text-gray-700 mb-4">
                Le Prestataire est tenu, dans le cadre de la fourniture des Services, à une obligation de moyens.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Exclusion de certains préjudices</h3>
              <p className="text-gray-700 mb-4">En aucun cas, le Prestataire ne pourra être tenu responsable :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>des décisions prises par le Client sur la base des résultats des Services (GO / NO-GO, niveaux de prix, choix de stratégie, etc.) ;</li>
                <li>de tout dommage indirect, immatériel ou consécutif, tel que perte de chance, perte de marché, perte de chiffre d'affaires, atteinte à l'image, etc. ;</li>
                <li>en cas de mauvaise utilisation des Services par le Client, ou d'utilisation contraire aux présentes CGV ;</li>
                <li>en cas d'erreur, d'inexactitude ou d'incomplétude des Données Client.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Plafond de responsabilité</h3>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <p className="text-orange-800 font-semibold">
                  En tout état de cause, si la responsabilité du Prestataire devait être retenue, l'indemnisation totale due au Client, toutes causes confondues, sera expressément limitée au montant total hors taxes effectivement versé par le Client au Prestataire au titre des Services au cours des trois (3) derniers mois précédant le fait générateur du dommage.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 12 – Propriété intellectuelle</h2>
              <p className="text-gray-700 mb-4">
                LeMarchéPublic.fr et/ou ses partenaires demeurent seuls titulaires de l'ensemble des droits de propriété intellectuelle relatifs :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>à la Plateforme et aux logiciels associés,</li>
                <li>aux modèles, algorithmes, bases de données, interfaces, graphismes, logos, marques, et plus généralement à tous les éléments composant les Services.</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Les présentes CGV n'emportent qu'une licence d'utilisation non exclusive, personnelle, non cessible et non transférable des Services, limitée à la durée du contrat et aux seuls besoins internes du Client.
              </p>
              <p className="text-gray-700 mb-4">Le Client s'interdit, sauf autorisation écrite préalable du Prestataire, de :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>reproduire, représenter, adapter, traduire, modifier ou exploiter tout ou partie de la Plateforme et des Services ;</li>
                <li>procéder à toute ingénierie inverse ou tentative de décompilation ;</li>
                <li>concéder des sous-licences ou mettre les Services à disposition de tiers.</li>
              </ul>
              <p className="text-gray-700">
                Sous réserve du paiement intégral des sommes dues, les contenus générés par IA à partir des Données Client peuvent être exploités par le Client dans le cadre de son activité professionnelle, sous sa seule responsabilité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 13 – Données personnelles et confidentialité</h2>
              <p className="text-gray-700 mb-4">
                Le Prestataire est susceptible de traiter des données à caractère personnel dans le cadre de la fourniture des Services, pour lesquelles il agit en qualité de responsable de traitement et/ou, le cas échéant, de sous-traitant.
              </p>
              <p className="text-gray-700 mb-4">
                Les modalités de ces traitements sont détaillées dans la politique de confidentialité disponible sur la Plateforme, que le Client est invité à consulter.
              </p>
              <p className="text-gray-700 mb-4">
                Le Prestataire s'engage à mettre en œuvre des mesures techniques et organisationnelles appropriées afin d'assurer la sécurité et la confidentialité des Données Client, et notamment des documents de marchés transmis (DCE, BPU, etc.).
              </p>
              <p className="text-gray-700">
                Sauf obligation légale ou accord exprès du Client, le Prestataire s'interdit de communiquer les Données Client à des tiers non autorisés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 14 – Disponibilité des Services</h2>
              <p className="text-gray-700 mb-4">
                Le Prestataire met en œuvre des moyens raisonnables pour assurer la disponibilité de la Plateforme et des Services.
              </p>
              <p className="text-gray-700 mb-4">Le Client reconnaît toutefois que :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>l'accès aux Services peut être occasionnellement suspendu ou limité pour des opérations de maintenance, de mise à jour ou en cas d'incident technique ;</li>
                <li>le Prestataire ne peut garantir une disponibilité ininterrompue ou exempte d'erreurs.</li>
              </ul>
              <p className="text-gray-700">
                Les interruptions temporaires raisonnables n'ouvrent droit à aucune indemnisation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 15 – Force majeure</h2>
              <p className="text-gray-700 mb-4">
                Aucune des parties ne pourra être tenue responsable d'un manquement à l'une quelconque de ses obligations contractuelles si ce manquement résulte d'un événement de force majeure au sens de l'article 1218 du Code civil et de la jurisprudence française (catastrophes naturelles, guerre, émeutes, grèves générales, pannes majeures de réseaux, pandémies, décisions gouvernementales, etc.).
              </p>
              <p className="text-gray-700">
                La partie invoquant la force majeure devra en informer l'autre partie dans les meilleurs délais et faire ses meilleurs efforts pour limiter la durée et les effets de l'événement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 16 – Modification des CGV</h2>
              <p className="text-gray-700 mb-4">
                Le Prestataire se réserve le droit de modifier à tout moment les présentes CGV.
              </p>
              <p className="text-gray-700 mb-4">
                Les CGV applicables sont celles en vigueur à la date de la commande. Pour les Abonnements reconduits, les nouvelles CGV pourront s'appliquer à compter de la prochaine échéance, sous réserve d'une information préalable du Client.
              </p>
              <p className="text-gray-700">
                En cas de désaccord avec les modifications, le Client reste libre de ne pas renouveler son Abonnement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 17 – Cession</h2>
              <p className="text-gray-700 mb-4">
                Le Client ne pourra céder tout ou partie de ses droits et obligations au titre des présentes sans l'accord préalable, exprès et écrit du Prestataire.
              </p>
              <p className="text-gray-700">
                Le Prestataire pourra librement céder le présent contrat à toute entité de son choix (filiale, société mère, cessionnaire de fonds de commerce, etc.), sous réserve d'en informer le Client.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 18 – Droit applicable – Juridiction compétente</h2>
              <p className="text-gray-700 mb-4">
                Les présentes CGV sont soumises au droit français.
              </p>
              <p className="text-gray-700">
                Tout différend relatif à la validité, l'interprétation, l'exécution ou la résiliation des présentes, que les parties ne pourraient résoudre à l'amiable, sera soumis à la compétence exclusive des tribunaux du ressort de <strong>Saint Denis de La Réunion</strong>, y compris en cas de pluralité de défendeurs ou d'appel en garantie.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center">
              <p className="text-gray-600 mb-2">Le Fondateur</p>
              <p className="text-gray-900 font-bold text-lg">Shanti MERALLI BALLOU</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
