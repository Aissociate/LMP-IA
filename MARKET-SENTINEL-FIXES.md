# Corrections Market Sentinel - Emails et Suppression

## Problèmes Résolus

### 1. Impossibilité de supprimer les marchés détectés
**Problème**: Les utilisateurs ne pouvaient pas supprimer les détections de marchés depuis l'interface Market Sentinel.

**Cause**: Politique RLS (Row Level Security) DELETE manquante sur la table `market_alert_detections`.

**Solution**: Ajout d'une politique DELETE permettant aux utilisateurs de supprimer leurs propres détections.

**Fichier**: `supabase/migrations/*_fix_market_alert_detections_delete_policy.sql`

```sql
CREATE POLICY "Users can delete own market detections"
  ON market_alert_detections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

### 2. Non-réception des emails d'alerte
**Problème**: Les utilisateurs ne recevaient pas les emails de notification pour les nouveaux marchés détectés.

**Cause**: La fonction Edge qui vérifie les alertes et crée les détections n'existait pas. Sans détections, aucun email n'était généré.

**Solution**: Création de la fonction `check-market-alerts` qui:
- Vérifie toutes les alertes actives avec notifications activées
- Recherche les nouveaux marchés correspondant aux critères
- Crée les détections dans `market_alert_detections`
- Prépare les emails digest dans `email_digest_queue`
- Met à jour la date de dernière vérification

**Fichier**: `supabase/functions/check-market-alerts/index.ts`

## Architecture du Système d'Alertes

### Flux Complet

```
1. [CRON] Déclenche check-market-alerts toutes les heures
   ↓
2. [check-market-alerts] Vérifie les alertes actives
   ↓
3. [check-market-alerts] Recherche les nouveaux marchés
   ↓
4. [check-market-alerts] Crée les détections dans market_alert_detections
   ↓
5. [check-market-alerts] Crée les digest dans email_digest_queue
   ↓
6. [CRON] Déclenche send-market-digests à 8h et 18h
   ↓
7. [send-market-digests] Envoie les emails via Resend
   ↓
8. [send-market-digests] Archive dans email_digest_history
```

### Tables Impliquées

#### search_alerts
Contient les alertes configurées par les utilisateurs:
- `keywords`: Mots-clés à rechercher
- `location`: Zones géographiques
- `service_types`: Types de services
- `notification_enabled`: Active/désactive les notifications
- `is_active`: Active/désactive l'alerte
- `last_checked_at`: Date de dernière vérification

#### market_alert_detections
Contient les marchés détectés pour chaque alerte:
- `user_id`: Utilisateur propriétaire
- `alert_id`: Alerte qui a déclenché la détection
- `market_reference`: Référence du marché
- `market_title`, `market_client`, etc.: Données du marché
- `is_read`: Lu/non lu
- `is_favorited`: Marché favori

#### email_digest_queue
File d'attente des emails à envoyer:
- `user_id`: Destinataire
- `digest_type`: "morning" (8h) ou "evening" (18h)
- `alert_results`: Détails des alertes et marchés
- `status`: "pending", "sent", "failed"
- `scheduled_for`: Heure d'envoi programmée

#### email_digest_history
Historique des emails envoyés:
- `sent_at`: Date d'envoi
- `alerts_triggered`: Nombre d'alertes déclenchées
- `markets_included`: Nombre de marchés inclus
- `email_content`: HTML de l'email

## Configuration CRON

### Variables d'Environnement Requises

Ces variables sont déjà configurées automatiquement:
- `SUPABASE_URL`: URL du projet Supabase
- `SUPABASE_ANON_KEY`: Clé anonyme
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service role
- `CRON_SECRET`: Secret pour authentifier les appels CRON
- `RESEND_API_KEY`: Clé API Resend pour l'envoi d'emails
- `EMAIL_FROM`: Adresse d'expéditeur (ex: "Le Marché Public <noreply@lemarchepublic.fr>")

### Tâches CRON à Configurer

#### 1. Vérification des alertes (toutes les heures)
```bash
# URL à appeler
POST https://[VOTRE_PROJET].supabase.co/functions/v1/check-market-alerts

# Headers
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json

# Fréquence recommandée
Toutes les heures (0 * * * *)
```

#### 2. Envoi des digests du matin (8h)
```bash
# URL à appeler
POST https://[VOTRE_PROJET].supabase.co/functions/v1/send-market-digests

# Headers
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json

# Fréquence
Tous les jours à 8h00 (0 8 * * *)
```

#### 3. Envoi des digests du soir (18h)
```bash
# URL à appeler
POST https://[VOTRE_PROJET].supabase.co/functions/v1/send-market-digests

# Headers
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json

# Fréquence
Tous les jours à 18h00 (0 18 * * *)
```

### Configuration avec un Service CRON Externe

#### Option 1: cron-job.org (Gratuit)
1. Créer un compte sur https://cron-job.org
2. Créer 3 nouveaux cronjobs
3. Configurer les URLs et headers ci-dessus
4. Activer les jobs

#### Option 2: EasyCron (Gratuit avec limites)
1. Créer un compte sur https://www.easycron.com
2. Ajouter les 3 tâches CRON
3. Configurer les URLs et custom headers

#### Option 3: GitHub Actions (Recommandé pour production)
Créer `.github/workflows/market-alerts.yml`:

```yaml
name: Market Alerts CRON

on:
  schedule:
    # Vérification des alertes toutes les heures
    - cron: '0 * * * *'
    # Digest du matin à 8h
    - cron: '0 8 * * *'
    # Digest du soir à 18h
    - cron: '0 18 * * *'
  workflow_dispatch:

jobs:
  check-alerts:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 * * * *' || github.event_name == 'workflow_dispatch'
    steps:
      - name: Check Market Alerts
        run: |
          curl -X POST \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://[VOTRE_PROJET].supabase.co/functions/v1/check-market-alerts

  send-morning-digest:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 8 * * *'
    steps:
      - name: Send Morning Digest
        run: |
          curl -X POST \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://[VOTRE_PROJET].supabase.co/functions/v1/send-market-digests

  send-evening-digest:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 18 * * *'
    steps:
      - name: Send Evening Digest
        run: |
          curl -X POST \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://[VOTRE_PROJET].supabase.co/functions/v1/send-market-digests
```

## Test Manuel

### Tester la vérification des alertes
```bash
curl -X POST \
  -H "X-Cron-Secret: VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://VOTRE_PROJET.supabase.co/functions/v1/check-market-alerts
```

Réponse attendue:
```json
{
  "success": true,
  "alerts_checked": 5,
  "detections_created": 12,
  "users_notified": 3
}
```

### Tester l'envoi des digests
```bash
curl -X POST \
  -H "X-Cron-Secret: VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://VOTRE_PROJET.supabase.co/functions/v1/send-market-digests
```

Réponse attendue:
```json
{
  "success": true,
  "digests_processed": 3,
  "emails_sent": 3,
  "emails_failed": 0
}
```

### Vérifier les détections dans la base de données
```sql
-- Voir les détections récentes
SELECT
  mad.*,
  sa.name as alert_name
FROM market_alert_detections mad
LEFT JOIN search_alerts sa ON sa.id = mad.alert_id
WHERE mad.detected_at > NOW() - INTERVAL '24 hours'
ORDER BY mad.detected_at DESC;

-- Voir la file d'attente des emails
SELECT * FROM email_digest_queue
WHERE status = 'pending'
ORDER BY scheduled_for;

-- Voir l'historique des emails envoyés
SELECT
  user_id,
  sent_at,
  digest_type,
  alerts_triggered,
  markets_included,
  recipient_email
FROM email_digest_history
ORDER BY sent_at DESC
LIMIT 10;
```

## Fonctionnalités Utilisateur

### Interface Market Sentinel

#### Détections de Marchés
- **Filtres**: Tous / Non lus / Favoris
- **Par alerte**: Filtrer par alerte spécifique
- **Actions disponibles**:
  - ✅ Marquer comme lu
  - ⭐ Ajouter aux favoris / Retirer des favoris
  - 🔗 Consulter le marché
  - 🗑️ **NOUVEAU**: Supprimer la détection

#### Paramètres de Notification
Dans Paramètres > Notifications:
- Activer/désactiver les notifications par email
- Choisir l'email de réception
- Activer le digest du matin (8h)
- Activer le digest du soir (18h)
- Configurer les préférences par alerte

## Dépannage

### Les emails ne sont pas envoyés

1. **Vérifier que RESEND_API_KEY est configuré**
```sql
-- Cette requête ne fonctionnera pas car les secrets ne sont pas exposés
-- Vérifiez dans le dashboard Supabase > Edge Functions > Secrets
```

2. **Vérifier les digests en attente**
```sql
SELECT * FROM email_digest_queue
WHERE status = 'pending';
```

3. **Vérifier les erreurs d'envoi**
```sql
SELECT * FROM email_digest_queue
WHERE status = 'failed'
ORDER BY created_at DESC;
```

4. **Vérifier les logs de la fonction**
Dans le dashboard Supabase > Edge Functions > send-market-digests > Logs

### Aucune détection n'est créée

1. **Vérifier les alertes actives**
```sql
SELECT * FROM search_alerts
WHERE is_active = true
AND notification_enabled = true;
```

2. **Vérifier la dernière vérification**
```sql
SELECT
  name,
  last_checked_at,
  NOW() - last_checked_at as time_since_check
FROM search_alerts
WHERE is_active = true
ORDER BY last_checked_at DESC;
```

3. **Tester manuellement la recherche**
```sql
-- Exemple pour une alerte spécifique
SELECT * FROM public_markets
WHERE is_public = true
AND created_at > NOW() - INTERVAL '24 hours'
AND title ILIKE '%travaux%'
ORDER BY created_at DESC;
```

### Les détections ne peuvent pas être supprimées

1. **Vérifier la politique RLS**
```sql
SELECT * FROM pg_policies
WHERE tablename = 'market_alert_detections'
AND cmd = 'DELETE';
```

Doit retourner la politique "Users can delete own market detections".

2. **Vérifier l'authentification**
Assurez-vous que l'utilisateur est bien authentifié avant de tenter la suppression.

## Maintenance

### Nettoyage des anciennes détections
Optionnel - supprimer les détections lues de plus de 30 jours:

```sql
DELETE FROM market_alert_detections
WHERE is_read = true
AND detected_at < NOW() - INTERVAL '30 days';
```

### Nettoyage de l'historique des emails
Optionnel - supprimer l'historique de plus de 90 jours:

```sql
DELETE FROM email_digest_history
WHERE sent_at < NOW() - INTERVAL '90 days';
```

### Monitoring

Requête utile pour surveiller le système:

```sql
-- Vue d'ensemble des alertes et détections
SELECT
  u.email,
  sa.name as alert_name,
  sa.is_active,
  sa.notification_enabled,
  sa.last_checked_at,
  COUNT(mad.id) as total_detections,
  COUNT(CASE WHEN mad.is_read = false THEN 1 END) as unread_detections,
  MAX(mad.detected_at) as last_detection
FROM search_alerts sa
LEFT JOIN market_alert_detections mad ON mad.alert_id = sa.id
LEFT JOIN auth.users u ON u.id = sa.user_id
GROUP BY u.email, sa.name, sa.is_active, sa.notification_enabled, sa.last_checked_at
ORDER BY last_detection DESC NULLS LAST;
```

## Support

Pour toute question ou problème:
1. Vérifier les logs dans Supabase Dashboard > Edge Functions > Logs
2. Consulter cette documentation
3. Vérifier les politiques RLS et les permissions
