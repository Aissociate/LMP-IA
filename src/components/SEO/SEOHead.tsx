import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  locale?: string;
}

export function SEOHead({
  title = "LeMarchéPublic.fr - Plateforme IA pour Remporter vos Marchés Publics à La Réunion 974",
  description = "Gagnez plus de marchés publics à La Réunion avec notre IA. Génération automatique de mémoires techniques, BPU, veille 24/7 des appels d'offres. Solution pour PME, BTP et artisans réunionnais.",
  keywords = "marchés publics réunion, appels d'offres 974, mémoire technique IA, BPU automatique, BOAMP réunion, intelligence artificielle marchés publics, dématérialisation marchés publics, sourcing marchés publics",
  ogImage = "https://lemarchepublic.fr/logo1.png",
  canonical,
  type = 'website',
  author = "LeMarchéPublic.fr",
  publishedTime,
  modifiedTime,
  section,
  locale = "fr_FR",
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = 'fr';

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
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');

    updateMetaTag('geo.region', 'FR-RE');
    updateMetaTag('geo.placename', 'Saint-Denis, La Réunion');
    updateMetaTag('geo.position', '-20.8823;55.4504');
    updateMetaTag('ICBM', '-20.8823, 55.4504');

    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', title, true);
    updateMetaTag('og:url', `https://lemarchepublic.fr${location.pathname}`, true);
    updateMetaTag('og:site_name', 'LeMarchéPublic.fr', true);
    updateMetaTag('og:locale', locale, true);

    if (type === 'article' && publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, true);
      }
      if (author) {
        updateMetaTag('article:author', author, true);
      }
      if (section) {
        updateMetaTag('article:section', section, true);
      }
    }

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:image:alt', title);
    updateMetaTag('twitter:site', '@lemarchepublic');
    updateMetaTag('twitter:creator', '@lemarchepublic');

    updateMetaTag('theme-color', '#F77F00');
    updateMetaTag('msapplication-TileColor', '#F77F00');

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonical || `https://lemarchepublic.fr${location.pathname}`;

  }, [title, description, keywords, ogImage, canonical, location.pathname, type, author, publishedTime, modifiedTime, section, locale]);

  return null;
}
