# Guide de configuration Stripe - Liaison dynamique des offres

Ce guide vous explique comment configurer la liaison entre vos produits Stripe et votre application.

## Étape 1: Créer vos produits dans Stripe Dashboard

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com/)
2. Allez dans **Produits** → **Créer un produit**
3. Créez les produits suivants:

### Plans d'abonnement (Recurring)

**Plan SOLO**
- Nom: `Solo`
- Description: `Plan pour les structures qui se lancent`
- Prix: `199 EUR/mois`
- Type: Récurrent
- Notez le **Product ID** (commence par `prod_`) et le **Price ID** (commence par `price_`)

**Plan PME**
- Nom: `PME`
- Description: `Plan pour les PME`
- Prix: `349 EUR/mois`
- Type: Récurrent
- Notez le **Product ID** et le **Price ID**

**Plan PROJETEUR**
- Nom: `Projeteur`
- Description: `Plan pour les professionnels`
- Prix: `849 EUR/mois`
- Type: Récurrent
- Notez le **Product ID** et le **Price ID**

### Addons

**Market Pro (Recurring)**
- Nom: `Market Pro`
- Description: `IA Premium pour mémoires techniques`
- Prix: `99 EUR/mois`
- Type: Récurrent
- Notez le **Product ID** et le **Price ID**

**Mémoire supplémentaire (One-time)**
- Nom: `Mémoire supplémentaire`
- Description: `Ajoutez une mémoire IA supplémentaire`
- Prix: `299 EUR`
- Type: Paiement unique
- Notez le **Product ID** et le **Price ID**

**Booster Expert 4h (One-time)**
- Nom: `Booster Expert 4h`
- Description: `Expert dédié 4h`
- Prix: `590 EUR`
- Type: Paiement unique
- Notez le **Product ID** et le **Price ID**

**Booster Expert Senior 3 jours (One-time)**
- Nom: `Booster Expert Senior 3 jours`
- Description: `Expert dédié 3 jours`
- Prix: `2490 EUR`
- Type: Paiement unique
- Notez le **Product ID** et le **Price ID**

## Étape 2: Configurer le webhook Stripe

1. Allez dans **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL du webhook: `https://[VOTRE-PROJET].supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez les événements suivants:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
5. Notez le **Signing Secret** (commence par `whsec_`)
6. Ajoutez-le à vos variables d'environnement Supabase sous le nom `STRIPE_WEBHOOK_SECRET`

## Étape 3: Configurer les Price IDs dans l'application

1. Connectez-vous en tant qu'administrateur
2. Allez dans **Administration** → **Catalogue Stripe**
3. Pour chaque plan et addon, cliquez sur le bouton d'édition
4. Entrez le **Stripe Price ID** et le **Stripe Product ID** correspondants
5. Cliquez sur le bouton de sauvegarde (icône ✓)

### Exemple de configuration:

**Plan SOLO:**
- Stripe Product ID: `prod_xxxxxxxxxxxxx`
- Stripe Price ID: `price_xxxxxxxxxxxxx`

**Addon Market Pro:**
- Stripe Product ID: `prod_yyyyyyyyyyyyy`
- Stripe Price ID: `price_yyyyyyyyyyyyy`

## Étape 4: Vérifier la configuration

### Test 1: Affichage des plans
1. Déconnectez-vous et reconnectez-vous avec un compte non-admin
2. Allez dans **Paramètres** → **Abonnement**
3. Cliquez sur **Changer de plan**
4. Vérifiez que les 3 plans s'affichent correctement avec les bons prix

### Test 2: Marketplace des options
1. Cliquez sur le bouton **Options**
2. Vérifiez que tous les addons s'affichent avec les bons prix

### Test 3: Checkout Stripe (Mode Test)
1. Sélectionnez un plan et cliquez sur **Continuer vers le paiement**
2. Vous devriez être redirigé vers la page de paiement Stripe
3. Utilisez une carte de test: `4242 4242 4242 4242`
4. Date d'expiration: n'importe quelle date future
5. CVC: n'importe quel 3 chiffres
6. Complétez le paiement

### Test 4: Webhook
1. Après le paiement test, retournez sur l'application
2. Allez dans **Paramètres** → **Abonnement**
3. Vérifiez que votre plan a bien été mis à jour
4. Si vous avez acheté des addons, vérifiez qu'ils apparaissent dans la section "Options actives"

## Étape 5: Passer en mode Production

Une fois tous les tests validés:

1. Dans Stripe Dashboard, activez votre compte en mode Production
2. Recréez les mêmes produits en mode Production (les IDs seront différents)
3. Recréez le webhook en mode Production
4. Mettez à jour les Price IDs dans l'interface admin avec les nouveaux IDs de production
5. Mettez à jour les variables d'environnement Supabase:
   - `STRIPE_SECRET_KEY`: votre clé secrète de production
   - `STRIPE_WEBHOOK_SECRET`: le secret du webhook de production

## Flux de fonctionnement

### Achat d'un plan + addons

1. L'utilisateur sélectionne un plan et des addons
2. L'application récupère les `stripe_price_id` depuis la base de données
3. Une session Stripe Checkout est créée avec des métadonnées:
   - `plan_id`: ID du plan Supabase
   - `addon_types`: Liste des addons séparés par des virgules
   - `user_id`: ID de l'utilisateur
4. L'utilisateur est redirigé vers Stripe pour le paiement
5. Après paiement, le webhook `checkout.session.completed` est déclenché
6. Le webhook:
   - Met à jour `user_subscriptions` avec le nouveau plan
   - Insère les addons dans `subscription_addons`
   - Met à jour `monthly_memory_usage` si nécessaire
   - Active les fonctionnalités associées (market_pro, extra_memories, etc.)

### Achat d'addons seuls

1. L'utilisateur clique sur **Options** dans les paramètres
2. Il sélectionne des addons dans le marketplace
3. Une session Stripe est créée en mode `payment`
4. Après paiement, le webhook traite les addons de la même manière

## Dépannage

### Les plans ne s'affichent pas
- Vérifiez que les `stripe_price_id` sont bien configurés dans la table `subscription_plans`
- Vérifiez que `is_active = true` pour les plans concernés

### L'addon n'apparaît pas après l'achat
- Vérifiez les logs du webhook dans Stripe Dashboard → Développeurs → Webhooks
- Vérifiez que les métadonnées sont bien passées dans la session Checkout
- Vérifiez la table `subscription_addons` dans Supabase

### Erreur lors du checkout
- Vérifiez que le `stripe_price_id` existe bien dans Stripe
- Vérifiez que le mode (payment/subscription) correspond au type de prix dans Stripe
- Vérifiez les logs de la fonction Edge `stripe-checkout`

## Support

Pour toute question, consultez:
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- Logs des fonctions Edge dans le dashboard Supabase
