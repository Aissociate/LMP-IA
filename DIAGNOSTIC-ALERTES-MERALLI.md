# Diagnostic des Alertes pour meralli.ballou.s@gmail.com

## Résumé du Problème

L'utilisateur a des alertes actives avec des détections, mais ne reçoit pas de digest email.

## État des Composants

### 1. Utilisateur
- **Email**: meralli.ballou.s@gmail.com
- **User ID**: 8cecd5ec-ac9f-41e9-b94c-7be05023ee0a
- **Créé le**: 2026-02-06 23:52:49

### 2. Alertes Configurées
- **Nombre d'alertes**: 1 alerte active
- **Nom**: "test"
- **Mots-clés**: ["construction"]
- **État**: Actif (is_active: true)
- **Notifications**: Activées (notification_enabled: true)
- **Dernière vérification**: 2026-02-09 20:18:17 (242 heures = 10 jours)

### 3. Détections
- **Nombre de détections**: 6 marchés détectés
- **Détections récentes**:
  1. Mission de maîtrise d'œuvre (POLICE MORNE VERGAIN)
  2. Construction 33 logements (RSMA St Jean)
  3. Travaux de dépollution des sols
  4. Pavillon 8c Oncologie (CHU Réunion)
  5. Accord-cadre Maîtrise d'oeuvre

### 4. Marchés Publics Disponibles
- **Total dans la base**: 308 marchés publics
- **Marchés récents**: 5 marchés ajoutés aujourd'hui (19 février 2026)

### 5. Cron Jobs pg_cron
- **check-market-alerts**: Actif, toutes les heures (0 * * * *)
- **send-market-digests-morning**: Actif, 8h00 (0 8 * * *)
- **send-market-digests-evening**: Actif, 18h00 (0 18 * * *)
- **État**: Jobs configurés et s'exécutent (2 exécutions récentes à 21h et 22h)

### 6. Logs d'Exécution
- **cron_execution_logs**: VIDE ❌
  - Aucun log d'exécution enregistré
  - Le test manuel crée bien des logs
  - Les appels via pg_cron ne créent pas de logs

### 7. Queue des Digests
- **email_digest_queue**: VIDE ❌
  - Aucun digest en attente
  - Aucun digest créé par le système

### 8. CRON_SECRET
- **État**: ✅ CONFIGURÉ (après correction)
- **Problème identifié**: Le secret n'était PAS configuré
- **Action**: Secret généré et configuré (44 caractères)

## Problèmes Identifiés

### Problème Principal: CRON_SECRET Manquant
Le `CRON_SECRET` n'était pas configuré dans `admin_secrets`, ce qui empêchait les edge functions d'accepter les appels des cron jobs.

**Impact**:
- Les cron jobs s'exécutent bien (pg_cron fonctionne)
- Mais les appels aux edge functions via `call_edge_function()` échouaient silencieusement
- Résultat: Aucune vérification d'alerte depuis 10 jours
- Résultat: Aucun digest créé

### Problème Secondaire: Logs Non Créés
Les logs `cron_execution_logs` ne sont pas créés lors des exécutions automatiques, bien qu'ils se créent lors des tests manuels.

**Hypothèse**:
- pg_net est peut-être désactivé ou mal configuré
- Les transactions ROLLBACK après l'appel
- Permissions insuffisantes pour la fonction

## Actions Correctives Effectuées

### 1. Configuration du CRON_SECRET ✅
```sql
UPDATE admin_secrets
SET secret_value = encode(gen_random_bytes(32), 'base64')
WHERE secret_key = 'CRON_SECRET';
```

### 2. Réinitialisation du Last Check ✅
```sql
UPDATE search_alerts
SET last_checked_at = now() - interval '2 hours'
WHERE user_id = '8cecd5ec-ac9f-41e9-b94c-7be05023ee0a';
```

### 3. Test de Force
Création d'un cron temporaire pour forcer l'exécution immédiate.

## Prochaines Étapes

### Test Immédiat
1. Attendre la prochaine exécution horaire (prochaine heure :00)
2. Vérifier si des logs sont créés dans `cron_execution_logs`
3. Vérifier si des entrées sont créées dans `email_digest_queue`

### Vérification pg_net
Si les logs ne sont toujours pas créés:
1. Vérifier que l'extension pg_net est activée
2. Vérifier les permissions de la fonction `call_edge_function`
3. Vérifier que les requêtes HTTP sont bien envoyées

### Alternative: Appel Direct
Si pg_net ne fonctionne pas, considérer:
1. Appeler directement les edge functions via HTTP depuis un service externe
2. Utiliser un webhook externe (GitHub Actions, cron-job.org)
3. Configurer des appels directs via Supabase Realtime

## Requêtes de Diagnostic Utiles

### Vérifier les prochaines exécutions
```sql
SELECT
  jobname,
  schedule,
  active,
  (SELECT MAX(start_time) FROM cron.job_run_details WHERE jobid = j.jobid) as last_run
FROM cron.job j
WHERE jobname LIKE '%alert%' OR jobname LIKE '%digest%';
```

### Vérifier les logs récents
```sql
SELECT * FROM cron_execution_logs
WHERE started_at > now() - interval '1 hour'
ORDER BY started_at DESC;
```

### Vérifier la queue
```sql
SELECT * FROM email_digest_queue
WHERE user_id = '8cecd5ec-ac9f-41e9-b94c-7be05023ee0a'
ORDER BY created_at DESC;
```

### Vérifier pg_net
```sql
SELECT id, status_code, error_msg, created
FROM net._http_response
WHERE created > now() - interval '1 hour'
ORDER BY created DESC;
```

## Conclusion Temporaire

Le problème principal (CRON_SECRET manquant) a été corrigé. Les alertes devraient maintenant fonctionner lors de la prochaine exécution horaire.

**Prochaine vérification**: Attendre jusqu'à la prochaine heure :00 et vérifier si:
1. Des logs sont créés dans `cron_execution_logs`
2. Des détections sont créées dans `market_alert_detections`
3. Un digest est créé dans `email_digest_queue`
4. Un email est envoyé à l'utilisateur
