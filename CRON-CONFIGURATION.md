# Configuration CRON pour le Système d'Alertes Email

## Résumé des corrections appliquées

### Problème identifié
Le système d'alertes email ne fonctionnait pas car :
1. **Incohérence de nommage** : Le frontend utilisait `notifications_enabled` (avec 's') alors que la base de données et les Edge Functions utilisent `notification_enabled` (sans 's')
2. **Colonne manquante** : La colonne `notification_enabled` n'existait pas dans la table `search_alerts`
3. **CRON non configuré** : Les tâches automatiques n'étaient pas déclenchées

### Corrections appliquées
✅ Migration créée pour ajouter la colonne `notification_enabled` à la table `search_alerts`
✅ Frontend corrigé pour utiliser `notification_enabled` au lieu de `notifications_enabled`
✅ Toutes les alertes existantes ont `notification_enabled = true` par défaut
✅ Index créé pour optimiser les performances des requêtes

## Comment fonctionne le système

Le système d'alertes email fonctionne en 3 étapes automatiques :

### 1. Vérification des alertes (toutes les heures)
- **Edge Function** : `check-market-alerts`
- **Fréquence** : Toutes les heures (0 * * * *)
- **Rôle** :
  - Récupère toutes les alertes actives avec `is_active = true` ET `notification_enabled = true`
  - Recherche les nouveaux marchés correspondant aux critères
  - Crée des entrées dans `market_alert_detections`
  - Prépare les données pour les digests email

### 2. Envoi des digests (2 fois par jour)
- **Edge Function** : `send-market-digests`
- **Fréquence** :
  - Matin : 8h00 (0 8 * * *)
  - Soir : 18h00 (0 18 * * *)
- **Rôle** :
  - Récupère les détections en attente depuis la dernière vérification
  - Groupe les détections par utilisateur et par alerte
  - Envoie un email récapitulatif via Resend
  - Archive l'email dans `email_digest_history`

### 3. Test manuel
- **Edge Function** : `send-test-digest`
- **Déclenchement** : Manuel (via l'interface utilisateur)
- **Rôle** : Envoie un email de test avec les détections des dernières 24h

## Configuration CRON requise

### Variables d'environnement nécessaires

Avant de configurer les CRON, assurez-vous que ces variables sont définies dans Supabase :

```bash
# Dans Dashboard Supabase > Settings > Edge Functions > Secrets

CRON_SECRET=votre_secret_aleatoire_securise
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Le Marche Public <notifications@lemarchepublic.fr>
```

### Option 1 : Utiliser cron-job.org (Recommandé pour débuter)

**Avantages** : Gratuit, interface simple, monitoring inclus

1. Créez un compte sur https://cron-job.org
2. Ajoutez les 3 tâches suivantes :

#### Tâche 1 : Vérification des alertes
- **Titre** : Check Market Alerts (Hourly)
- **URL** : `https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts`
- **Méthode** : POST
- **Headers** :
  ```
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
  ```
- **Schedule** : Every hour (0 * * * *)
- **Notification** : Email en cas d'échec

#### Tâche 2 : Digest du matin
- **Titre** : Send Morning Digest
- **URL** : `https://[VOTRE_PROJECT].supabase.co/functions/v1/send-market-digests`
- **Méthode** : POST
- **Headers** :
  ```
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
  ```
- **Schedule** : Every day at 8:00 AM (0 8 * * *)
- **Notification** : Email en cas d'échec

#### Tâche 3 : Digest du soir
- **Titre** : Send Evening Digest
- **URL** : `https://[VOTRE_PROJECT].supabase.co/functions/v1/send-market-digests`
- **Méthode** : POST
- **Headers** :
  ```
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
  ```
- **Schedule** : Every day at 6:00 PM (0 18 * * *)
- **Notification** : Email en cas d'échec

### Option 2 : Utiliser GitHub Actions

**Avantages** : Gratuit pour projets publics, intégration Git, logs détaillés

Créez `.github/workflows/market-alerts-cron.yml` :

```yaml
name: Market Alerts CRON Jobs

on:
  schedule:
    # Vérification toutes les heures
    - cron: '0 * * * *'
    # Digest du matin à 8h UTC
    - cron: '0 8 * * *'
    # Digest du soir à 18h UTC
    - cron: '0 18 * * *'
  workflow_dispatch: # Permet l'exécution manuelle

jobs:
  check-alerts:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 * * * *'
    steps:
      - name: Check Market Alerts
        run: |
          curl -X POST \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://[VOTRE_PROJECT].supabase.co/functions/v1/check-market-alerts

  send-morning-digest:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 8 * * *'
    steps:
      - name: Send Morning Digest
        run: |
          curl -X POST \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://[VOTRE_PROJECT].supabase.co/functions/v1/send-market-digests

  send-evening-digest:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 18 * * *'
    steps:
      - name: Send Evening Digest
        run: |
          curl -X POST \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://[VOTRE_PROJECT].supabase.co/functions/v1/send-market-digests
```

**Configuration GitHub** :
1. Allez dans Settings > Secrets and variables > Actions
2. Ajoutez le secret `CRON_SECRET` avec la valeur de votre CRON_SECRET

### Option 3 : Utiliser EasyCron

**Avantages** : Interface simple, plan gratuit limité

1. Créez un compte sur https://www.easycron.com
2. Ajoutez les 3 tâches comme pour cron-job.org

### Option 4 : Serveur Linux avec crontab

**Avantages** : Contrôle total, aucune limite

Ajoutez ces lignes à votre crontab (`crontab -e`) :

```bash
# Vérification toutes les heures
0 * * * * curl -X POST -H "X-Cron-Secret: VOTRE_SECRET" https://[PROJECT].supabase.co/functions/v1/check-market-alerts

# Digest du matin à 8h
0 8 * * * curl -X POST -H "X-Cron-Secret: VOTRE_SECRET" https://[PROJECT].supabase.co/functions/v1/send-market-digests

# Digest du soir à 18h
0 18 * * * curl -X POST -H "X-Cron-Secret: VOTRE_SECRET" https://[PROJECT].supabase.co/functions/v1/send-market-digests
```

## Tests et validation

### 1. Tester manuellement les Edge Functions

```bash
# Remplacez [PROJECT] par votre ID de projet Supabase
# Remplacez [SECRET] par votre CRON_SECRET

# Test de vérification des alertes
curl -X POST \
  -H "X-Cron-Secret: [SECRET]" \
  -H "Content-Type: application/json" \
  https://[PROJECT].supabase.co/functions/v1/check-market-alerts

# Réponse attendue :
# {"success":true,"alerts_checked":1,"detections_created":3,"users_notified":1}

# Test d'envoi des digests
curl -X POST \
  -H "X-Cron-Secret: [SECRET]" \
  -H "Content-Type: application/json" \
  https://[PROJECT].supabase.co/functions/v1/send-market-digests

# Réponse attendue :
# {"success":true,"digests_sent":1,"total_recipients":1}
```

### 2. Vérifier dans l'interface utilisateur

1. Allez dans **Market Sentinel** > **Mes Alertes**
2. Vérifiez qu'au moins une alerte est :
   - **Active** (icône verte)
   - **Notifications activées** (icône cloche orange)
3. Cliquez sur l'icône Mail (enveloppe) pour activer/désactiver les notifications

### 3. Vérifier en base de données

```sql
-- Vérifier les alertes actives avec notifications
SELECT id, name, is_active, notification_enabled, last_checked_at
FROM search_alerts
WHERE is_active = true AND notification_enabled = true;

-- Vérifier les détections récentes
SELECT COUNT(*) as detections_count, alert_id
FROM market_alert_detections
WHERE detected_at > NOW() - INTERVAL '24 hours'
GROUP BY alert_id;

-- Vérifier l'historique des emails
SELECT
  digest_type,
  alerts_triggered,
  markets_included,
  sent_at
FROM email_digest_history
ORDER BY sent_at DESC
LIMIT 10;
```

### 4. Tester l'email de test

1. Connectez-vous à l'application
2. Allez dans **Paramètres** > **Notifications**
3. Cliquez sur **"Email de test"**
4. Vérifiez votre boîte mail (et les spams)

## Monitoring et dépannage

### Logs Supabase Edge Functions

1. Allez dans Dashboard Supabase > Edge Functions
2. Sélectionnez une fonction (`check-market-alerts` ou `send-market-digests`)
3. Consultez l'onglet **Logs** pour voir :
   - Les appels réussis (status 200)
   - Les erreurs éventuelles
   - Le nombre d'alertes vérifiées
   - Le nombre de détections créées

### Logs Resend (Email Provider)

1. Connectez-vous à https://resend.com
2. Allez dans **Emails**
3. Vérifiez :
   - Les emails envoyés
   - Le statut de livraison (delivered, bounced, etc.)
   - Les taux d'ouverture
   - Les erreurs d'envoi

### Problèmes courants

#### Aucun email reçu alors que les CRON fonctionnent

**Causes possibles** :
1. `notification_enabled = false` sur les alertes
2. Pas de nouvelles détections depuis le dernier digest
3. Email dans les spams
4. Configuration Resend incorrecte

**Solutions** :
```sql
-- Activer les notifications sur toutes les alertes actives
UPDATE search_alerts
SET notification_enabled = true
WHERE is_active = true;

-- Forcer l'envoi d'un digest avec les détections des 7 derniers jours
-- (modifier la fonction send-market-digests temporairement)
```

#### Les alertes ne détectent aucun marché

**Causes possibles** :
1. Critères d'alerte trop restrictifs
2. Aucun nouveau marché dans `public_markets`
3. Champ `last_checked_at` trop récent

**Solutions** :
```sql
-- Réinitialiser last_checked_at pour forcer une nouvelle vérification
UPDATE search_alerts
SET last_checked_at = NOW() - INTERVAL '7 days'
WHERE id = 'VOTRE_ALERT_ID';

-- Vérifier les marchés disponibles
SELECT COUNT(*) FROM public_markets WHERE is_public = true;
```

#### Erreur "Unauthorized" dans les logs

**Cause** : Le `CRON_SECRET` est incorrect ou manquant

**Solution** :
1. Vérifiez que `CRON_SECRET` est défini dans Supabase Edge Functions Secrets
2. Vérifiez que le header `X-Cron-Secret` dans le CRON correspond exactement

#### Les CRON ne se déclenchent pas

**Causes possibles** :
1. Service CRON en panne ou compte expiré
2. URL incorrecte
3. Fuseau horaire incorrect

**Solutions** :
1. Vérifiez les logs de votre service CRON (cron-job.org, GitHub Actions, etc.)
2. Testez manuellement l'URL avec curl
3. Vérifiez le fuseau horaire (UTC pour les CRON)

## Calendrier des vérifications

| Heure (UTC) | Action | Description |
|-------------|--------|-------------|
| 0h00 | Vérification | Check des alertes |
| 1h00 | Vérification | Check des alertes |
| ... | ... | ... |
| 8h00 | **Digest matin** | Envoi email si détections |
| 9h00 | Vérification | Check des alertes |
| ... | ... | ... |
| 18h00 | **Digest soir** | Envoi email si détections |
| 19h00 | Vérification | Check des alertes |
| ... | ... | ... |

**Note** : Adaptez les heures selon votre fuseau horaire. Pour La Réunion (UTC+4), programmez les CRON à 4h et 14h UTC.

## Coûts estimés

### Supabase
- Edge Functions : **Gratuit** jusqu'à 500K requêtes/mois
- Base de données : **Gratuit** jusqu'à 500 MB

### Resend
- **Gratuit** jusqu'à 3000 emails/mois
- Au-delà : $20/mois pour 50K emails

### Services CRON
- cron-job.org : **Gratuit** (limité à 50 tâches)
- GitHub Actions : **Gratuit** (2000 minutes/mois pour projets publics)
- EasyCron : **Gratuit** (limité à 20 tâches)

## Checklist finale

Avant de considérer le système comme opérationnel :

- [ ] Colonne `notification_enabled` ajoutée à la table `search_alerts` ✅
- [ ] Frontend corrigé pour utiliser `notification_enabled` ✅
- [ ] Variables d'environnement configurées dans Supabase (`CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`)
- [ ] Les 3 tâches CRON sont configurées et actives
- [ ] Test manuel de `check-market-alerts` réussi
- [ ] Test manuel de `send-market-digests` réussi
- [ ] Email de test reçu depuis l'interface
- [ ] Au moins une alerte est active avec notifications activées
- [ ] Monitoring configuré (Resend Dashboard + Supabase Logs)

## Support

En cas de problème :

1. Consultez les logs Supabase Edge Functions
2. Consultez les logs Resend
3. Vérifiez les données en base avec les requêtes SQL ci-dessus
4. Testez manuellement avec curl
5. Vérifiez que les variables d'environnement sont correctes

Le système est maintenant **prêt à fonctionner automatiquement** !
