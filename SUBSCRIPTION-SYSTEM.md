# Système d'abonnement - Documentation

## Vue d'ensemble

Le système d'abonnement a été implémenté avec les règles suivantes :

### Plans d'abonnement

1. **TRIAL (Essai gratuit - 7 jours)**
   - Prix : 0€
   - Durée : 7 jours avec carte bancaire requise
   - Fonctionnalités : Tout illimité SAUF 0 mémoire technique
   - Veille marchés illimitée
   - IA et GO/NO-GO illimité

2. **BRONZE**
   - Prix : 199€/mois
   - 1 mémoire technique par mois
   - Veille marchés illimitée
   - IA et GO/NO-GO illimité
   - Export Word / PDF
   - Support email

3. **ARGENT**
   - Prix : 349€/mois
   - 3 mémoires techniques par mois
   - Veille marchés illimitée
   - IA et GO/NO-GO illimité
   - Export Word / PDF
   - Support prioritaire

4. **OR**
   - Prix : 549€/mois
   - 10 mémoires techniques par mois
   - Veille marchés illimitée
   - IA et GO/NO-GO illimité
   - Export Word / PDF
   - Support VIP
   - Accompagnement personnalisé

### Règles d'accès

- **Admins** : Accès illimité sans abonnement
- **Utilisateurs** : Doivent avoir un abonnement Stripe valide OU être en période d'essai
- **Pas d'abonnement** = Pas d'accès (sauf admin)

## Architecture

### Base de données

#### Tables

1. **subscription_plans**
   - Contient les 4 plans (TRIAL, BRONZE, ARGENT, OR)
   - Champs : name, stripe_price_id, monthly_memories_limit, price_monthly, features

2. **user_subscriptions**
   - Abonnement actif par utilisateur
   - Champs : user_id, plan_id, stripe_customer_id, stripe_subscription_id, status, trial_end_date, has_trial_used

3. **monthly_memory_usage**
   - Compteur mensuel de mémoires techniques créées
   - Champs : user_id, memories_used, period_start, period_end

#### Fonctions RPC

1. **check_user_access(p_user_id)**
   - Vérifie si un utilisateur a accès à l'application
   - Retourne : has_access, reason, is_admin, needs_subscription

2. **start_trial(p_user_id)**
   - Démarre la période d'essai de 7 jours
   - Vérifie que l'utilisateur n'a pas déjà utilisé son essai

3. **increment_memory_usage(p_user_id)**
   - Incrémente le compteur de mémoires techniques
   - Vérifie la limite avant d'incrémenter

4. **get_user_memory_stats(p_user_id)**
   - Récupère les statistiques d'usage de mémoires techniques
   - Retourne : plan_name, limit, used, remaining

### Composants React

1. **SubscriptionGate** (`src/components/Auth/SubscriptionGate.tsx`)
   - Splash screen qui vérifie l'abonnement au chargement
   - Bloque l'accès si pas d'abonnement valide
   - Redirige vers /subscription si nécessaire

2. **SubscriptionSelection** (`src/components/Subscription/SubscriptionSelection.tsx`)
   - Page de sélection d'abonnement
   - Affiche les 3 plans payants
   - Bouton pour démarrer l'essai gratuit

3. **SubscriptionBadge** (`src/components/Subscription/SubscriptionBadge.tsx`)
   - Badge affichant le plan actuel et l'usage de mémoires
   - Peut être intégré dans la sidebar ou le header

### Services

1. **subscriptionService** (`src/services/subscriptionService.ts`)
   - Service pour gérer les abonnements
   - Méthodes : checkMemoryLimit, incrementMemoryUsage, getMemoryStats, checkUserAccess, startTrial

2. **useSubscription** (`src/hooks/useSubscription.ts`)
   - Hook React pour utiliser le service d'abonnement
   - Charge automatiquement les stats de mémoires
   - Méthodes : checkCanCreateMemory, incrementMemoryUsage, refreshStats

## Flux utilisateur

### Première connexion

1. L'utilisateur se connecte
2. SubscriptionGate vérifie l'abonnement
3. Pas d'abonnement → Redirection vers /subscription
4. L'utilisateur choisit de démarrer l'essai gratuit ou sélectionner un plan
5. Après le démarrage de l'essai, accès immédiat à l'application

### Création d'une mémoire technique

1. L'utilisateur clique sur "Créer une mémoire"
2. Le composant appelle `checkCanCreateMemory()`
3. Si limite atteinte → Message d'erreur
4. Si OK → Création de la mémoire + appel à `incrementMemoryUsage()`
5. Rafraîchissement des stats

### Fin de période d'essai

1. SubscriptionGate vérifie l'abonnement à chaque chargement
2. Si trial_end_date < now() ET pas de stripe_subscription_id → Pas d'accès
3. Redirection vers /subscription pour choisir un plan payant

## Intégration Stripe (À venir)

### Étapes à suivre

1. **Créer les produits dans Stripe**
   - Créer 3 produits (Bronze, Argent, Or)
   - Créer les prix mensuels (199€, 349€, 549€)
   - Récupérer les price_id

2. **Mettre à jour la base de données**
   ```sql
   UPDATE subscription_plans
   SET stripe_price_id = 'price_xxx'
   WHERE name = 'BRONZE';

   UPDATE subscription_plans
   SET stripe_price_id = 'price_yyy'
   WHERE name = 'ARGENT';

   UPDATE subscription_plans
   SET stripe_price_id = 'price_zzz'
   WHERE name = 'OR';
   ```

3. **Créer une edge function pour Stripe Checkout**
   - Fonction pour créer une session de paiement
   - Redirection vers Stripe Checkout

4. **Créer un webhook Stripe**
   - Écouter les événements : checkout.session.completed, customer.subscription.updated
   - Mettre à jour user_subscriptions avec stripe_customer_id et stripe_subscription_id
   - Appeler reset_monthly_usage() lors du renouvellement

5. **Mettre à jour SubscriptionSelection.tsx**
   - Remplacer l'alert par un appel à la edge function
   - Rediriger vers Stripe Checkout

## Utilisation pour les développeurs

### Vérifier si un utilisateur peut créer une mémoire

```typescript
import { useSubscription } from '../hooks/useSubscription';

const MyComponent = () => {
  const { memoryStats, checkCanCreateMemory, incrementMemoryUsage } = useSubscription();

  const handleCreateMemory = async () => {
    const canCreate = await checkCanCreateMemory();

    if (!canCreate) {
      alert(`Limite atteinte ! Vous avez utilisé ${memoryStats?.used}/${memoryStats?.limit} mémoires ce mois-ci.`);
      return;
    }

    // Créer la mémoire...

    // Incrémenter le compteur
    const result = await incrementMemoryUsage();

    if (!result.success) {
      console.error('Erreur:', result.message);
    }
  };

  return (
    <div>
      <p>Mémoires utilisées : {memoryStats?.used}/{memoryStats?.limit}</p>
      <button onClick={handleCreateMemory}>Créer une mémoire</button>
    </div>
  );
};
```

### Afficher le badge d'abonnement

```typescript
import { SubscriptionBadge } from '../components/Subscription/SubscriptionBadge';

const Sidebar = () => {
  return (
    <div>
      <SubscriptionBadge />
      {/* Reste de la sidebar */}
    </div>
  );
};
```

## Section Abonnement dans les Paramètres

### Fonctionnalités

Un nouvel onglet "Abonnement & Facturation" a été ajouté dans les Paramètres avec :

1. **Affichage du statut de l'abonnement**
   - Badge indiquant le statut actuel (Actif, Essai, Inactif, etc.)
   - Copywriting adapté selon le statut de l'utilisateur
   - Affichage du plan actuel avec son icône et couleur

2. **Détails de l'abonnement**
   - Plan actuel (TRIAL, BRONZE, ARGENT, OR)
   - Prix mensuel
   - Date de renouvellement
   - Nombre de mémoires techniques utilisées/disponibles avec barre de progression

3. **Messages contextuels selon le statut**
   - **Admin** : Confirmation de l'accès illimité sans abonnement
   - **Essai actif** : Nombre de jours restants + incitation à choisir un plan
   - **Abonnement actif** : Confirmation et date de renouvellement
   - **Paiement en attente** : Alerte pour mettre à jour le moyen de paiement
   - **Annulation prévue** : Information sur la date d'annulation + option de réactivation
   - **Aucun abonnement** : Incitation à souscrire

4. **Gestion des factures**
   - Liste de toutes les factures avec date, numéro et statut
   - Téléchargement du PDF de chaque facture
   - État vide avec message si aucune facture

5. **Liste des fonctionnalités du plan**
   - Affichage de toutes les fonctionnalités incluses dans le plan actuel

### Table invoices

Une nouvelle table `invoices` a été créée pour stocker les factures Stripe :
- Champs : user_id, stripe_invoice_id, subscription_id, amount, currency, status, invoice_pdf, invoice_number, invoice_date, period_start, period_end
- RLS activé : utilisateurs voient uniquement leurs factures, admins voient tout
- Prête pour l'intégration avec les webhooks Stripe

## Notes importantes

1. Les admins (is_admin = true dans user_profiles) ont toujours accès sans abonnement
2. La période d'essai ne peut être utilisée qu'une seule fois par utilisateur
3. Les compteurs de mémoires sont réinitialisés chaque mois via le webhook Stripe
4. L'intégration Stripe est préparée mais pas encore active (liens des price_id à mettre à jour)
5. Pour tester en local, vous pouvez manuellement créer des abonnements dans la table user_subscriptions
6. La gestion des abonnements et factures est accessible via Paramètres > Abonnement & Facturation

## Migrations appliquées

1. **update_subscription_plans_with_trial.sql**
   - Création des 4 plans (TRIAL, BRONZE, ARGENT, OR)
   - Ajout des champs trial_end_date et has_trial_used
   - Création des fonctions check_user_access() et start_trial()
   - Toutes les politiques RLS sont maintenues

2. **create_invoices_table.sql**
   - Création de la table invoices pour stocker les factures
   - RLS et politiques d'accès configurées
   - Indexes pour les performances
   - Trigger pour mettre à jour updated_at automatiquement
