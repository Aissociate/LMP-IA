# Guide de Configuration des CRON

## État actuel du système

✅ **Edge Functions déployées** (24 fonctions actives)
✅ **Code prêt** - Toutes les fonctions CRON sont opérationnelles
❌ **CRON non configurés** - Dernière exécution: 9 février 2026
✅ **Base de données** - 278 marchés publics disponibles
✅ **1 alerte active** avec notifications activées

---

## Configuration requise (5 minutes)

### 1. Secrets Supabase à vérifier

Connectez-vous à votre Dashboard Supabase et vérifiez que ces secrets existent:

**Dashboard > Project Settings > Edge Functions > Secrets**

```bash
CRON_SECRET=votre-secret-securise
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Le Marche Public <votre-email@resend.com>
```

Si ces secrets n'existent pas, créez-les maintenant.

---

## Option 1 : cron-job.org (Recommandé - Gratuit)

### Inscription
1. Allez sur https://cron-job.org
2. Créez un compte gratuit
3. Confirmez votre email

### Configuration des tâches CRON

#### CRON 1: Vérification des alertes (Toutes les heures)

```
Titre: Check Market Alerts Hourly
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts
Méthode: POST
Schedule: 0 * * * * (Every hour)

Headers:
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

**Ce que fait cette fonction:**
- Vérifie toutes les alertes actives
- Compare avec les nouveaux marchés publics
- Crée des détections pour les marchés correspondants
- Prépare les digests email

#### CRON 2: Digest matin (8h00)

```
Titre: Morning Market Digest
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-market-digests
Méthode: POST
Schedule: 0 8 * * * (Every day at 8:00 AM)

Headers:
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

**Ce que fait cette fonction:**
- Envoie les digests email du matin
- Récupère tous les digests en attente
- Envoie les emails via Resend
- Archive dans l'historique

#### CRON 3: Digest soir (18h00)

```
Titre: Evening Market Digest
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-market-digests
Méthode: POST
Schedule: 0 18 * * * (Every day at 6:00 PM)

Headers:
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

#### CRON 4: Sync marchés La Réunion (Quotidien 6h00)

```
Titre: Daily Reunion Markets Sync
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/daily-reunion-markets-sync
Méthode: POST
Schedule: 0 6 * * * (Every day at 6:00 AM)

Headers:
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

**Ce que fait cette fonction:**
- Synchronise les marchés publics de La Réunion
- Détecte les doublons automatiquement
- Publie les nouveaux marchés

#### CRON 5: Archivage marchés expirés (Quotidien 2h00)

```
Titre: Archive Expired Markets
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/archive-expired-markets
Méthode: POST
Schedule: 0 2 * * * (Every day at 2:00 AM)

Headers:
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

**Ce que fait cette fonction:**
- Archive les marchés dont la date limite est dépassée
- Nettoie la base de données

#### CRON 6: Génération sitemap (Quotidien 3h00)

```
Titre: Generate Markets Sitemap
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/generate-markets-sitemap
Méthode: POST
Schedule: 0 3 * * * (Every day at 3:00 AM)

Headers:
X-Cron-Secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

**Ce que fait cette fonction:**
- Génère le sitemap XML des marchés publics
- Améliore le SEO

---

## Option 2 : EasyCron (Payant - Plus fiable)

Si vous voulez plus de fiabilité et de logs détaillés:

1. https://www.easycron.com
2. Plan Pro: $3.99/mois pour 1000 exécutions
3. Configuration identique à cron-job.org

---

## Test manuel des fonctions

Vous pouvez tester les fonctions maintenant avec curl:

### Test 1: Check Market Alerts

```bash
curl -X POST \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts \
  -H "X-Cron-Secret: VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Réponse attendue:**
```json
{
  "success": true,
  "alerts_checked": 1,
  "detections_created": 5,
  "users_notified": 1
}
```

### Test 2: Send Digests

```bash
curl -X POST \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-market-digests \
  -H "X-Cron-Secret: VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Réponse attendue:**
```json
{
  "success": true,
  "digests_processed": 1,
  "emails_sent": 1,
  "emails_failed": 0
}
```

---

## Vérification que tout fonctionne

### 1. Après configuration des CRON

Attendez 1 heure puis vérifiez:

```sql
-- Vérifier la dernière vérification des alertes
SELECT
  name,
  last_checked_at,
  NOW() - last_checked_at as temps_depuis_derniere_verification
FROM search_alerts
WHERE is_active = true;
```

**Attendu:** `last_checked_at` doit être récent (< 1 heure)

### 2. Vérifier les détections

```sql
-- Nouvelles détections créées
SELECT COUNT(*) as nouvelles_detections
FROM market_alert_detections
WHERE created_at > NOW() - INTERVAL '1 hour';
```

### 3. Vérifier les emails envoyés

```sql
-- Historique des emails
SELECT
  sent_at,
  digest_type,
  markets_included,
  recipient_email
FROM email_digest_history
ORDER BY sent_at DESC
LIMIT 5;
```

---

## Monitoring

### Logs Supabase

Pour voir les logs des exécutions:
1. Dashboard Supabase
2. Edge Functions
3. Sélectionnez la fonction
4. Onglet "Logs"

### Alertes à surveiller

- ⚠️ Erreur 401: CRON_SECRET incorrect
- ⚠️ Erreur 500: Problème serveur (vérifier les logs)
- ⚠️ Aucun email envoyé: Vérifier RESEND_API_KEY

---

## Fréquence des CRON

| Fonction | Fréquence | Horaire |
|----------|-----------|---------|
| check-market-alerts | Toutes les heures | 0 * * * * |
| send-market-digests | 2x/jour | 8h00 + 18h00 |
| daily-reunion-markets-sync | 1x/jour | 6h00 |
| archive-expired-markets | 1x/jour | 2h00 |
| generate-markets-sitemap | 1x/jour | 3h00 |

---

## Résolution des problèmes

### Aucune détection créée

**Cause possible:** Pas de nouveaux marchés correspondant aux critères d'alerte

**Solution:**
- Vérifiez que de nouveaux marchés ont été ajoutés
- Élargissez les critères de l'alerte de test

### Emails non reçus

**Cause possible:** RESEND_API_KEY invalide ou EMAIL_FROM incorrect

**Solution:**
1. Vérifiez RESEND_API_KEY dans Supabase Secrets
2. Vérifiez que EMAIL_FROM est un email vérifié dans Resend
3. Consultez les logs de send-market-digests

### Erreur 401 Unauthorized

**Cause:** CRON_SECRET incorrect ou manquant

**Solution:**
1. Vérifiez que CRON_SECRET existe dans Supabase Secrets
2. Vérifiez que vous utilisez exactement le même secret dans cron-job.org

---

## Configuration minimale pour démarrer

Si vous voulez juste tester rapidement, configurez uniquement:

1. **check-market-alerts** (toutes les heures)
2. **send-market-digests** (8h00)

Les autres CRON peuvent être ajoutés plus tard.

---

## Coûts

- **cron-job.org:** Gratuit (jusqu'à 30 jobs)
- **Resend:** Gratuit (100 emails/jour), puis $20/mois (50k emails)
- **Supabase:** Inclus dans le plan gratuit

---

## Prochaines étapes

1. ✅ Configurer les secrets Supabase
2. ✅ Créer un compte cron-job.org
3. ✅ Ajouter les 6 tâches CRON
4. ✅ Tester manuellement avec curl
5. ✅ Attendre 1 heure et vérifier les logs
6. ✅ Vérifier la réception d'un email à 8h00 le lendemain

---

## Support

Si vous rencontrez des problèmes:
1. Consultez les logs Supabase
2. Vérifiez que tous les secrets sont configurés
3. Testez manuellement avec curl
