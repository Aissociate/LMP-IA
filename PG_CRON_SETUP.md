# Système d'Alertes Automatiques avec pg_cron + pg_net

## Vue d'ensemble

Votre système Market Sentinel est maintenant configuré avec **pg_cron** et **pg_net** directement dans Supabase. Plus besoin de service externe comme cron-job.org !

## Architecture

```
PostgreSQL (Supabase)
    |
    +-- pg_cron (Planificateur de tâches)
    |
    +-- pg_net (Client HTTP)
    |
    +-- Edge Functions (Logique métier)
         |
         +-- check-market-alerts
         +-- send-market-digests
         +-- daily-reunion-markets-sync
         +-- archive-expired-markets
         +-- generate-markets-sitemap
```

## Tâches CRON Configurées

| Tâche | Fréquence | Description |
|-------|-----------|-------------|
| **check-market-alerts** | Toutes les heures | Vérifie les alertes et crée les détections |
| **send-market-digests-morning** | 8h00 tous les jours | Envoi du digest matinal |
| **send-market-digests-evening** | 18h00 tous les jours | Envoi du digest du soir |
| **daily-reunion-markets-sync** | 6h00 tous les jours | Synchronise les marchés de La Réunion |
| **archive-expired-markets** | 2h00 tous les jours | Archive les marchés expirés |
| **generate-markets-sitemap** | 3h00 tous les jours | Génère le sitemap |
| **cleanup-cron-logs** | 1h00 tous les jours | Nettoie les logs de +30 jours |

## Configuration Initiale (Étape unique)

### 1. Configurer le CRON_SECRET

Dans le panneau admin de votre application:

1. Aller dans **Administration** > **Secrets Admin**
2. Cliquer sur "Nouveau secret"
3. Remplir:
   - **Nom**: `CRON_SECRET`
   - **Valeur**: Un secret fort (ex: `cron_2026_secure_lmp_kd8fh3kjh4k5jh`)
   - **Description**: Secret pour authentifier les appels CRON automatiques
4. Cliquer sur "Créer"

### 2. Vérifier que les tâches sont actives

1. Aller dans **Administration** > **Monitoring CRON**
2. Vous devriez voir 7 tâches actives
3. Cliquer sur "Tester maintenant" sur la tâche `check-market-alerts`
4. Si le test réussit, tout est configuré !

## Monitoring en Temps Réel

### Via l'interface Admin

Le composant **Monitoring CRON** vous permet de:
- Voir l'état de toutes les tâches en temps réel
- Consulter les logs des dernières exécutions
- Tester manuellement chaque tâche
- Détecter les erreurs rapidement

### Indicateurs à surveiller

- **Dernière exécution**: Doit être < 2 heures pour les tâches horaires
- **Exécutions (24h)**: Nombre d'exécutions dans les dernières 24h
- **Échecs (24h)**: Doit être 0 (ou très faible)
- **Statut**: Succès (vert), Échec (rouge), ou En cours (bleu)

## Comment ça fonctionne ?

### 1. pg_cron planifie les tâches

```sql
-- Exemple: Vérification des alertes toutes les heures
SELECT cron.schedule(
  'check-market-alerts',
  '0 * * * *',  -- Cron expression: minute heure jour mois jour_semaine
  $$SELECT call_edge_function('check-market-alerts')$$
);
```

### 2. La fonction helper appelle l'Edge Function

```sql
CREATE FUNCTION call_edge_function(function_name text)
  -- 1. Récupère le CRON_SECRET depuis admin_secrets
  -- 2. Construit l'URL de l'Edge Function
  -- 3. Fait un appel HTTP POST via pg_net
  -- 4. Enregistre le résultat dans cron_execution_logs
```

### 3. L'Edge Function traite la requête

L'Edge Function vérifie le header `X-Cron-Secret` et exécute la logique métier.

### 4. Les logs sont enregistrés

Tout est tracé dans la table `cron_execution_logs` pour monitoring.

## Résolution des Problèmes

### Problème: "CRON_SECRET not found"

**Solution:**
1. Aller dans Admin > Secrets Admin
2. Vérifier que `CRON_SECRET` existe
3. S'assurer qu'il a une valeur configurée

### Problème: "Unauthorized 401"

**Cause:** Le CRON_SECRET ne correspond pas

**Solution:**
1. Vérifier que le secret dans `admin_secrets` est identique à celui dans Edge Functions
2. Attendre quelques secondes pour la propagation

### Problème: Aucune exécution depuis longtemps

**Solution:**
1. Vérifier que pg_cron est actif:
   ```sql
   SELECT * FROM cron.job WHERE active = true;
   ```
2. Consulter les logs Supabase
3. Tester manuellement depuis l'interface Admin

### Problème: Erreurs dans les logs

**Solution:**
1. Consulter le détail de l'erreur dans Monitoring CRON
2. Vérifier les logs de l'Edge Function concernée
3. S'assurer que tous les secrets nécessaires sont configurés (RESEND_API_KEY, etc.)

## Requêtes SQL Utiles

### Voir toutes les tâches actives

```sql
SELECT * FROM cron_jobs_status;
```

### Voir les derniers logs

```sql
SELECT *
FROM cron_execution_logs
ORDER BY started_at DESC
LIMIT 20;
```

### Voir les échecs récents

```sql
SELECT *
FROM cron_execution_logs
WHERE status = 'failed'
  AND started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;
```

### Réinitialiser une tâche bloquée

```sql
-- Si une tâche est en statut "running" depuis trop longtemps
UPDATE cron_execution_logs
SET status = 'failed',
    error_message = 'Timeout - reset manually',
    completed_at = NOW()
WHERE status = 'running'
  AND started_at < NOW() - INTERVAL '1 hour';
```

## Désactiver/Réactiver les CRON

### Désactiver une tâche

```sql
-- Trouver l'ID de la tâche
SELECT jobid, jobname FROM cron.job WHERE jobname = 'check-market-alerts';

-- Désactiver
UPDATE cron.job SET active = false WHERE jobname = 'check-market-alerts';
```

### Réactiver une tâche

```sql
UPDATE cron.job SET active = true WHERE jobname = 'check-market-alerts';
```

### Supprimer définitivement une tâche

```sql
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'check-market-alerts';
```

## Modifier les Horaires

Si vous voulez changer les horaires des digests (par exemple):

```sql
-- Modifier le digest du matin pour 7h au lieu de 8h
UPDATE cron.job
SET schedule = '0 7 * * *'
WHERE jobname = 'send-market-digests-morning';

-- Modifier le digest du soir pour 19h au lieu de 18h
UPDATE cron.job
SET schedule = '0 19 * * *'
WHERE jobname = 'send-market-digests-evening';
```

### Format des expressions CRON

```
┌───────────── minute (0 - 59)
│ ┌───────────── heure (0 - 23)
│ │ ┌───────────── jour du mois (1 - 31)
│ │ │ ┌───────────── mois (1 - 12)
│ │ │ │ ┌───────────── jour de la semaine (0 - 6) (Dimanche = 0)
│ │ │ │ │
* * * * *
```

Exemples:
- `0 * * * *` = Toutes les heures
- `0 8 * * *` = Tous les jours à 8h
- `0 8,18 * * *` = Tous les jours à 8h et 18h
- `0 8 * * 1` = Tous les lundis à 8h
- `*/15 * * * *` = Toutes les 15 minutes

## Avantages de pg_cron vs Service Externe

| Critère | pg_cron | cron-job.org |
|---------|---------|--------------|
| **Configuration** | Une seule migration SQL | Compte + 6 jobs manuels |
| **Coût** | Inclus dans Supabase | Gratuit ou $3.99/mois |
| **Sécurité** | Tout dans Supabase | Headers HTTP publics |
| **Monitoring** | Interface admin intégrée | Interface externe |
| **Logs** | Base de données locale | Logs externes |
| **Maintenance** | Automatique | Manuelle |
| **Latence** | Minimale (interne) | Variable (externe) |

## Backup et Restauration

Les tâches CRON sont définies dans la migration:
```
supabase/migrations/[timestamp]_create_pg_cron_market_alerts_system.sql
```

Si vous devez réinitialiser:
1. Supprimer toutes les tâches
2. Réappliquer la migration

## Support

Pour toute question ou problème:
1. Consulter les logs dans Admin > Monitoring CRON
2. Vérifier la configuration des secrets
3. Tester manuellement les Edge Functions
4. Consulter la documentation Supabase pg_cron

## Ressources

- [Documentation pg_cron](https://github.com/citusdata/pg_cron)
- [Documentation pg_net](https://github.com/supabase/pg_net)
- [Cron Expression Generator](https://crontab.guru/)
