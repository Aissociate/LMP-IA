export const STRIPE_PRODUCTS = [
  {
    priceId: 'price_basic_297', // À remplacer par vos vrais Price IDs Stripe
    name: 'Basic',
    description: 'Accès complet à la plateforme avec les fonctionnalités essentielles',
    price: 297.00,
    currency: 'EUR',
    mode: 'subscription' as const,
    features: [
      '1 mémoire technique par mois',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Support email standard',
      'Statistiques de base'
    ]
  },
  {
    priceId: 'price_pro_997', // À remplacer par vos vrais Price IDs Stripe
    name: 'Pro',
    description: 'Accès complet avec support prioritaire et fonctionnalités avancées',
    price: 997.00,
    currency: 'EUR',
    mode: 'subscription' as const,
    features: [
      '5 mémoires techniques par mois',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Support prioritaire',
      'Statistiques avancées',
      'Accès anticipé aux nouvelles fonctionnalités',
      'Formation personnalisée'
    ]
  },
  {
    priceId: 'price_memory_addon_297', // À remplacer par vos vrais Price IDs Stripe
    name: 'Mémoire Supplémentaire',
    description: 'Ajoutez une mémoire technique supplémentaire à votre compte',
    price: 297.00,
    currency: 'EUR',
    mode: 'payment' as const,
    features: [
      '1 mémoire technique supplémentaire',
      'Stockage permanent',
      'Utilisable immédiatement'
    ]
  }
];