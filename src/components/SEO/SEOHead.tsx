import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export function SEOHead({
  title = "LeMarchéPublic.fr - Plateforme IA pour Remporter vos Marchés Publics à La Réunion 974",
  description = "Gagnez plus de marchés publics à La Réunion avec notre IA. Génération automatique de mémoires techniques, BPU, veille 24/7 des appels d'offres. Solution pour PME, BTP et artisans réunionnais.",
  keywords = "marchés publics réunion, appels d'offres 974, mémoire technique IA, BPU automatique, BOAMP réunion",
  ogImage = "https://lemarchepublic.fr/logo1.png",
  canonical,
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', `https://lemarchepublic.fr${location.pathname}`, true);

    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonical || `https://lemarchepublic.fr${location.pathname}`;

  }, [title, description, keywords, ogImage, canonical, location.pathname]);

  return null;
}
