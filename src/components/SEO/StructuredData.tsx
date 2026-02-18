import { useEffect } from 'react';

interface StructuredDataProps {
  data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const rawId = JSON.stringify(Array.isArray(data) ? data[0] : data).substring(0, 40);
    const scriptId = `sd-${rawId.replace(/[^a-zA-Z0-9-]/g, '_')}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(Array.isArray(data) ? data : [data]);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [data]);

  return null;
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'LeMarchéPublic.fr',
  'alternateName': 'Le Marché Public',
  'url': 'https://lemarchepublic.fr',
  'logo': 'https://lemarchepublic.fr/logo1.png',
  'description': 'Plateforme IA pour remporter les marchés publics à La Réunion. Génération automatique de mémoires techniques, BPU, et veille 24/7 des appels d\'offres.',
  'address': {
    '@type': 'PostalAddress',
    'addressRegion': 'La Réunion',
    'addressCountry': 'FR',
    'postalCode': '974'
  },
  'areaServed': {
    '@type': 'GeoCircle',
    'geoMidpoint': {
      '@type': 'GeoCoordinates',
      'latitude': '-20.8823',
      'longitude': '55.4504'
    },
    'geoRadius': '100000'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': '-20.8823',
    'longitude': '55.4504'
  },
  'sameAs': [
    'https://www.facebook.com/lemarchepublic',
    'https://www.linkedin.com/company/mmpfr'
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'customer service',
    'areaServed': 'FR-RE',
    'availableLanguage': 'French'
  }
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'LeMarchéPublic.fr',
  'url': 'https://lemarchepublic.fr',
  'description': 'Plateforme IA pour remporter les marchés publics à La Réunion',
  'publisher': {
    '@type': 'Organization',
    'name': 'LeMarchéPublic.fr',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://lemarchepublic.fr/logo1.png'
    }
  },
  'potentialAction': {
    '@type': 'SearchAction',
    'target': 'https://lemarchepublic.fr/recherche-marches?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
  'inLanguage': 'fr-FR'
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'LeMarchéPublic.fr',
  'applicationCategory': 'BusinessApplication',
  'operatingSystem': 'Web',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'EUR',
    'description': 'Essai gratuit disponible'
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '127',
    'bestRating': '5',
    'worstRating': '1'
  },
  'description': 'Intelligence artificielle pour remporter les marchés publics à La Réunion. Génération automatique de mémoires techniques, BPU, et veille des appels d\'offres.',
  'featureList': [
    'Génération automatique de mémoires techniques',
    'Création de BPU (Bordereau de Prix Unitaires)',
    'Veille 24/7 des appels d\'offres BOAMP',
    'Market Sentinel - surveillance intelligente',
    'Assistant IA spécialisé marchés publics',
    'Coffre-fort numérique sécurisé',
    'Analyse de documents administratifs'
  ]
};

export function createFAQSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };
}

export function createServiceSchema(service: {
  name: string;
  description: string;
  serviceType: string;
  provider?: string;
  areaServed?: string;
  audience?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.name,
    'description': service.description,
    'serviceType': service.serviceType,
    'provider': {
      '@type': 'Organization',
      'name': service.provider || 'LeMarchéPublic.fr'
    },
    'areaServed': {
      '@type': 'Place',
      'name': service.areaServed || 'La Réunion'
    },
    'audience': {
      '@type': 'Audience',
      'audienceType': service.audience || 'Business'
    }
  };
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

export function createArticleSchema(article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  section?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.headline,
    'description': article.description,
    'image': article.image,
    'datePublished': article.datePublished,
    'dateModified': article.dateModified || article.datePublished,
    'author': {
      '@type': 'Organization',
      'name': article.author || 'LeMarchéPublic.fr'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'LeMarchéPublic.fr',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://lemarchepublic.fr/logo1.png'
      }
    },
    'articleSection': article.section || 'Marchés Publics',
    'inLanguage': 'fr-FR'
  };
}
