# Facebook Pixel - Documentation d'Intégration

## ✅ Installation Complétée

Le Facebook Pixel (ID: **1887279508534690**) a été intégré sur toutes les pages du site.

## 📍 Emplacement du Code

### 1. Script Principal (index.html)
Le script Facebook Pixel est chargé dans le `<head>` de toutes les pages via `index.html`:

```javascript
fbq('init', '1887279508534690');
fbq('track', 'PageView');
```

### 2. Fallback NoScript (index.html)
Pour les utilisateurs sans JavaScript, un pixel de tracking alternatif est placé dans le `<body>`.

## 🔧 Configuration CSP (Content Security Policy)

Le CSP a été mis à jour pour autoriser Facebook:
- **script-src**: `https://connect.facebook.net`
- **img-src**: `https://www.facebook.com`
- **connect-src**: `https://www.facebook.com` et `https://connect.facebook.net`

## 📊 Événements Trackés Automatiquement

### 1. PageView (Standard)
✅ Trackée automatiquement sur toutes les pages
- Page d'accueil
- Landing pages (PME, BTP, Artisans, Lead)
- Page CGV
- Page de connexion

### 2. ViewContent (Personnalisé)
✅ Trackée avec catégories:
- `Landing - PME` pour /pme
- `Landing - BTP` pour /btp
- `Landing - Artisans` pour /artisans
- `Landing - Lead` pour /lead
- `Home` pour /
- `Other` pour les autres pages

### 3. Lead (Conversion)
✅ Trackée sur les actions:
- Clics sur boutons CTA
- Clics sur boutons d'inscription
- Formulaires de contact

### 4. Contact
✅ Trackée sur:
- Clics sur boutons de contact
- Clics sur email de contact

### 5. Événements Personnalisés
✅ Disponibles via l'API:
- `RequestDemo` - Demande de démo
- `ViewPricing` - Consultation des tarifs
- `GenerateMemoire` - Génération de mémoire technique
- `SearchMarket` - Recherche de marché
- `StartTrial` - Démarrage d'essai
- `GenerateLead` - Génération de lead

## 🛠️ Utilisation dans le Code

### Import du Module
```typescript
import { FacebookPixelEvents } from '../lib/analytics';
```

### Exemples d'Utilisation

#### Tracker une conversion Lead
```typescript
FacebookPixelEvents.Lead({
  content_name: 'Landing PME',
  value: 0,
  currency: 'EUR'
});
```

#### Tracker une demande de démo
```typescript
FacebookPixelEvents.RequestDemo('/pme');
```

#### Tracker une recherche
```typescript
FacebookPixelEvents.Search('travaux routiers');
```

#### Tracker une génération de mémoire
```typescript
FacebookPixelEvents.GenerateMemoire('BTP');
```

#### Tracker un achat/abonnement
```typescript
FacebookPixelEvents.Purchase(
  299,  // valeur
  'EUR', // devise
  {
    content_name: 'Abonnement Pro',
    content_category: 'Subscription'
  }
);
```

## 🎯 Événements Standards Facebook Disponibles

| Événement | Description | Usage |
|-----------|-------------|-------|
| `PageView` | Vue de page | Automatique |
| `ViewContent` | Consultation contenu | Automatique |
| `Lead` | Génération de lead | Boutons CTA |
| `CompleteRegistration` | Inscription complète | À implémenter |
| `InitiateCheckout` | Démarrage paiement | À implémenter |
| `Purchase` | Achat confirmé | À implémenter |
| `AddToCart` | Ajout au panier | À implémenter |
| `Search` | Recherche | Fonction recherche |
| `Contact` | Contact | Boutons contact |

## 🎨 Événements Personnalisés Disponibles

| Événement | Description | Paramètres |
|-----------|-------------|------------|
| `RequestDemo` | Demande de démonstration | `page_url` |
| `ViewPricing` | Consultation tarifs | - |
| `GenerateMemoire` | Génération mémoire technique | `market_type` |
| `SearchMarket` | Recherche de marché | `search_term` |
| `StartTrial` | Démarrage essai | `trial_type` |
| `GenerateLead` | Lead généré | `lead_type`, custom |
| `SubmitApplication` | Soumission candidature | `application_name`, custom |

## 📈 Tracking Analytics Intégré

Le système de tracking combine:
1. **Supabase** (page_visits, page_clicks)
2. **Facebook Pixel** (conversions, événements)

Les clics sont automatiquement trackés dans les deux systèmes via `trackClick()`.

## 🔐 Sécurité & Confidentialité

- ✅ CSP configuré pour autoriser uniquement Facebook
- ✅ Domaines autorisés: `connect.facebook.net`, `www.facebook.com`
- ✅ Chargement asynchrone du script
- ✅ Fallback noscript pour compatibilité maximale

## 🚀 Prochaines Étapes

### Court Terme
- [ ] Tester les conversions dans Facebook Events Manager
- [ ] Configurer les audiences personnalisées
- [ ] Activer le suivi des conversions pour les campagnes

### Moyen Terme
- [ ] Implémenter l'événement `Purchase` lors des paiements
- [ ] Configurer le catalogue produits Facebook
- [ ] Ajouter valeurs monétaires aux conversions

### Long Terme
- [ ] A/B testing basé sur les données pixel
- [ ] Lookalike audiences pour ciblage
- [ ] Optimisation des campagnes publicitaires

## 🧪 Test & Validation

### Tester le Pixel
1. Installer l'extension **Facebook Pixel Helper** (Chrome)
2. Visiter le site lemarchepublic.fr
3. Vérifier que le pixel se déclenche
4. Tester les événements personnalisés

### Facebook Events Manager
1. Se connecter à [Facebook Business Manager](https://business.facebook.com)
2. Aller dans **Events Manager**
3. Sélectionner le pixel **1887279508534690**
4. Vérifier les événements en temps réel dans "Test Events"

## 📞 Support

Pour toute question:
- **Pixel ID**: 1887279508534690
- **Documentation**: [Facebook for Developers](https://developers.facebook.com/docs/facebook-pixel)
- **Contact**: contact@lemarchepublic.fr

## 🔗 Ressources

- [Facebook Pixel Setup](https://www.facebook.com/business/help/952192354843755)
- [Standard Events Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Custom Events Guide](https://developers.facebook.com/docs/meta-pixel/implementation/custom-events)
- [Troubleshooting Guide](https://www.facebook.com/business/help/1733952196906554)
