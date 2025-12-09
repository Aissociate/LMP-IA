import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { StructuredData, createFAQSchema } from './StructuredData';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export function FAQ({ items, title = "Questions Fréquentes" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <StructuredData data={createFAQSchema(items)} />

      <section className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {title}
          </h2>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <h3
                    className="text-lg font-semibold text-gray-900 pr-4"
                    itemProp="name"
                  >
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-[#F77F00] flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`px-6 overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96 py-5 border-t border-gray-100' : 'max-h-0'
                  }`}
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p
                    className="text-gray-700 leading-relaxed"
                    itemProp="text"
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export const generalFAQs: FAQItem[] = [
  {
    question: "Comment LeMarchéPublic.fr m'aide à remporter des marchés publics ?",
    answer: "Notre plateforme utilise l'intelligence artificielle pour générer automatiquement vos mémoires techniques, BPU et documents administratifs. Nous assurons également une veille 24/7 des appels d'offres du BOAMP pour ne rater aucune opportunité. Notre IA est spécialement entraînée sur les marchés publics réunionnais."
  },
  {
    question: "Est-ce que l'IA génère des documents conformes aux exigences du Code des marchés publics ?",
    answer: "Oui, absolument. Notre IA est formée sur les réglementations françaises et européennes des marchés publics. Elle respecte les normes du Code de la commande publique et génère des documents professionnels conformes aux attentes des acheteurs publics."
  },
  {
    question: "Combien de temps faut-il pour générer un mémoire technique ?",
    answer: "La génération d'un mémoire technique complet prend entre 5 et 15 minutes selon la complexité du marché. C'est 20 à 30 fois plus rapide qu'une rédaction manuelle traditionnelle qui peut prendre plusieurs jours."
  },
  {
    question: "Mes données et documents sont-ils sécurisés ?",
    answer: "La sécurité est notre priorité absolue. Tous vos documents sont stockés de manière chiffrée dans notre coffre-fort numérique. Nous sommes conformes au RGPD et à l'IA Act européen. Seul vous avez accès à vos données sensibles."
  },
  {
    question: "Quels types de marchés publics sont couverts ?",
    answer: "Nous couvrons tous les types de marchés publics : travaux (BTP, construction), fournitures, services, prestations intellectuelles. Notre plateforme s'adapte aux marchés de toutes tailles, des petits marchés locaux aux grands appels d'offres régionaux."
  },
  {
    question: "Le Market Sentinel, comment ça fonctionne ?",
    answer: "Market Sentinel est notre système de veille intelligent qui surveille en continu le BOAMP et vous alerte dès qu'un marché correspondant à vos critères est publié. Vous recevez des notifications en temps réel pour ne jamais manquer une opportunité."
  },
  {
    question: "Puis-je personnaliser les documents générés par l'IA ?",
    answer: "Bien sûr ! Tous les documents générés sont 100% modifiables. Vous pouvez ajouter vos propres éléments, ajuster le contenu, intégrer vos spécificités. L'IA fournit une base solide que vous pouvez personnaliser selon vos besoins."
  },
  {
    question: "Y a-t-il un essai gratuit ?",
    answer: "Oui, nous proposons un essai gratuit pour vous permettre de tester la puissance de notre plateforme. Vous pourrez générer des documents, tester le Market Sentinel et découvrir toutes nos fonctionnalités avant de vous engager."
  }
];

export const pmeFAQs: FAQItem[] = [
  {
    question: "Ma PME peut-elle vraiment concurrencer les grandes entreprises sur les marchés publics ?",
    answer: "Absolument ! Notre IA vous donne les mêmes outils que les grandes entreprises utilisent. Vous bénéficiez de mémoires techniques professionnels, d'une veille automatisée et d'une assistance IA pour optimiser vos réponses. Nous nivelons le terrain de jeu."
  },
  {
    question: "Combien coûte la plateforme pour une PME ?",
    answer: "Nos tarifs sont adaptés aux PME réunionnaises avec des forfaits flexibles sans engagement. L'investissement est rapidement rentabilisé dès votre premier marché remporté. Demandez une démo personnalisée pour un devis adapté à vos besoins."
  },
  {
    question: "Faut-il des compétences techniques pour utiliser la plateforme ?",
    answer: "Non, aucune compétence technique n'est requise. Notre interface est intuitive et conçue pour être utilisée par tous. Si vous savez naviguer sur internet, vous savez utiliser LeMarchéPublic.fr. Nous offrons également un support et une formation complète."
  }
];

export const btpFAQs: FAQItem[] = [
  {
    question: "L'IA comprend-elle les spécificités techniques du BTP ?",
    answer: "Oui parfaitement. Notre IA est spécialement formée sur les marchés BTP : construction, génie civil, VRD, second œuvre. Elle maîtrise les normes DTU, les méthodes de construction et génère des BPU détaillés conformes aux pratiques du secteur."
  },
  {
    question: "Puis-je importer mes anciens BPU dans la plateforme ?",
    answer: "Oui, vous pouvez importer vos BPU existants au format Excel ou PDF. L'IA les analyse et les utilise comme référence pour générer de nouveaux BPU adaptés à chaque marché. Capitalisez sur votre historique."
  },
  {
    question: "Comment l'IA calcule-t-elle les prix dans le BPU ?",
    answer: "L'IA utilise vos données historiques, les prix du marché réunionnais et vos taux horaires pour calculer des prix compétitifs. Vous gardez le contrôle total et pouvez ajuster chaque ligne selon votre stratégie commerciale."
  }
];

export const artisansFAQs: FAQItem[] = [
  {
    question: "Je suis artisan seul, est-ce adapté à ma taille d'entreprise ?",
    answer: "Totalement ! Notre plateforme est particulièrement utile pour les artisans qui n'ont pas de service administratif dédié. L'IA fait le travail administratif fastidieux, vous permettant de vous concentrer sur votre métier et vos chantiers."
  },
  {
    question: "Quels types de marchés sont accessibles aux artisans ?",
    answer: "Les collectivités publient de nombreux petits marchés accessibles aux artisans : maintenance, rénovation, travaux d'entretien, fournitures. Notre veille Market Sentinel vous alerte sur ces opportunités souvent méconnues des artisans."
  },
  {
    question: "L'IA peut-elle m'aider pour les groupements d'artisans ?",
    answer: "Oui ! L'IA peut générer les documents pour des réponses en groupement, préparer les répartitions de lots et créer les mémoires techniques communs. C'est idéal pour répondre à des marchés plus importants avec d'autres artisans."
  }
];
