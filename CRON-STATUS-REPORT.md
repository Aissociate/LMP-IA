# Rapport de Vérification CRON - 18 février 2026

## Statut: ⚠️ CRON INACTIFS DEPUIS 9 JOURS

---

## 1. Edge Functions (24 actives)

### ✅ Fonctions CRON déployées et opérationnelles

| Fonction | Statut | Sécurité | Usage |
|----------|--------|----------|-------|
| **check-market-alerts** | ACTIVE | CRON_SECRET | Vérification alertes (toutes les heures) |
| **send-market-digests** | ACTIVE | CRON_SECRET + RESEND_API_KEY | Envoi emails (8h + 18h) |
| **daily-reunion-markets-sync** | ACTIVE | CRON_SECRET | Sync marchés Réunion (6h) |
| **archive-expired-markets** | ACTIVE | CRON_SECRET | Archivage marchés (2h) |
| **generate-markets-sitemap** | ACTIVE | CRON_SECRET | Génération sitemap (3h) |
| **auto-publish-market** | ACTIVE | CRON_SECRET + RESEND_API_KEY | Publication auto marchés |
| **auto-publish-article** | ACTIVE | JWT + RESEND_API_KEY | Publication auto articles |

### Autres fonctions actives (17)
- ai-generation, document-analysis, generate-pdf
- market-sentinel-analysis, boamp-search
- stripe-checkout, stripe-webhook, stripe-cancel
- admin-impersonate, admin-users
- send-test-digest, send-test-email
- market-collector-save, init-database
- blotato-post, blotato-test

---

## 2. État de la Base de Données

### Données actuelles

| Métrique | Valeur | Commentaire |
|----------|--------|-------------|
| **Alertes actives** | 1 | Alerte "test" sur "construction" |
| **Notifications activées** | 1 | Email activé pour l'alerte |
| **Dernière vérification** | 09/02/2026 20:18 | ⚠️ Il y a 9 jours |
| **Marchés publics** | 126 | Base de données active |
| **Détections non lues** | 5 | En attente de traitement |
| **Digests en attente** | 0 | Aucun email en file |
| **Emails envoyés (7j)** | 0 | ⚠️ Aucun email envoyé |

### Analyse

**Situation:**
- Les alertes ne sont plus vérifiées depuis le 9 février
- Les détections existantes (5) datent d'avant l'arrêt des CRON
- Aucun email digest envoyé depuis 7+ jours
- Système fonctionnel mais inactif

**Impact:**
- Les utilisateurs ne reçoivent plus de notifications
- Les nouveaux marchés ne sont pas analysés
- Les alertes ne se déclenchent pas automatiquement

---

## 3. Secrets Requis

### Vérification Supabase Dashboard

**Aller à:** Project Settings > Edge Functions > Secrets

Vérifiez que ces 3 secrets existent:

```bash
# 1. Secret CRON (requis pour toutes les tâches CRON)
CRON_SECRET=votre-secret-securise-unique

# 2. API Resend (requis pour envoi emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# 3. Email expéditeur (requis pour envoi emails)
EMAIL_FROM=Le Marche Public <votre-email@resend.com>
```

**Important:**
- Ces secrets doivent exister dans Supabase (variables d'environnement Edge Functions)
- CRON_SECRET doit être un secret fort (32+ caractères)
- EMAIL_FROM doit être vérifié dans Resend

---

## 4. Test Manuel Immédiat

### Test 1: Vérifier les alertes maintenant

```bash
curl -X POST \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts \
  -H "X-Cron-Secret: VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Réponse attendue si fonctionne:**
```json
{
  "success": true,
  "alerts_checked": 1,
  "detections_created": X,
  "users_notified": 1,
  "digest_entries_created": X
}
```

**Erreurs possibles:**
- `401 Unauthorized` → CRON_SECRET incorrect
- `500 Error` → Problème serveur (voir logs)

### Test 2: Envoyer un digest test

```bash
curl -X POST \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-test-digest \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## 5. Configuration CRON (URGENTE)

### Option A: cron-job.org (Gratuit, recommandé)

**Étapes:**

1. **Inscription**
   - https://cron-job.org
   - Créer un compte gratuit
   - Confirmer l'email

2. **Créer les tâches CRON**

#### Job 1: Vérification alertes (PRIORITAIRE)
```
Titre: Check Market Alerts
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts
Méthode: POST
Schedule: 0 * * * * (toutes les heures)
Headers:
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
```

#### Job 2: Digest matin
```
Titre: Morning Digest
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-market-digests
Méthode: POST
Schedule: 0 8 * * * (8h00)
Headers:
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
```

#### Job 3: Digest soir
```
Titre: Evening Digest
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-market-digests
Méthode: POST
Schedule: 0 18 * * * (18h00)
Headers:
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
```

#### Job 4: Sync Réunion
```
Titre: Reunion Markets Sync
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/daily-reunion-markets-sync
Méthode: POST
Schedule: 0 6 * * * (6h00)
Headers:
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
```

#### Job 5: Archivage
```
Titre: Archive Expired Markets
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/archive-expired-markets
Méthode: POST
Schedule: 0 2 * * * (2h00)
Headers:
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
```

#### Job 6: Sitemap
```
Titre: Generate Sitemap
URL: https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/generate-markets-sitemap
Méthode: POST
Schedule: 0 3 * * * (3h00)
Headers:
  X-Cron-Secret: [VOTRE_CRON_SECRET]
  Content-Type: application/json
```

### Option B: EasyCron (Payant mais plus fiable)

- https://www.easycron.com
- $3.99/mois (1000 exécutions)
- Logs détaillés + alertes email
- Configuration identique

---

## 6. Vérification Post-Configuration

### Après 1 heure

```sql
-- Vérifier que les alertes sont vérifiées
SELECT
  name,
  last_checked_at,
  NOW() - last_checked_at as temps_ecoulement
FROM search_alerts
WHERE is_active = true;
```

**Attendu:** `last_checked_at` doit être < 1 heure

### Après la prochaine exécution (8h ou 18h)

```sql
-- Vérifier les emails envoyés
SELECT
  sent_at,
  digest_type,
  markets_included,
  recipient_email
FROM email_digest_history
ORDER BY sent_at DESC
LIMIT 1;
```

**Attendu:** Un nouvel email dans les dernières heures

---

## 7. Monitoring Continu

### Logs Supabase

**Accès:**
1. Dashboard Supabase
2. Edge Functions
3. Sélectionner la fonction
4. Onglet "Logs"

### Indicateurs à surveiller

| Indicateur | Valeur normale | Action si anormal |
|------------|----------------|-------------------|
| last_checked_at | < 2 heures | Vérifier CRON actif |
| Nouvelles détections | Variable | Normal si 0, sauf si marchés ajoutés |
| Emails envoyés | 2x/jour | Vérifier RESEND_API_KEY |
| Erreurs 401 | 0 | Vérifier CRON_SECRET |
| Erreurs 500 | 0 | Consulter logs fonction |

---

## 8. Checklist de Mise en Route

- [ ] Vérifier les 3 secrets dans Supabase Dashboard
- [ ] Créer un compte cron-job.org
- [ ] Configurer les 6 tâches CRON
- [ ] Tester manuellement avec curl (optionnel mais recommandé)
- [ ] Attendre 1 heure
- [ ] Vérifier `last_checked_at` dans la base
- [ ] Attendre le prochain digest (8h ou 18h)
- [ ] Vérifier réception email
- [ ] Consulter les logs Supabase régulièrement

---

## 9. Coûts Estimés

| Service | Plan | Coût mensuel |
|---------|------|--------------|
| **cron-job.org** | Gratuit | $0 |
| **Resend** | Gratuit (100 emails/jour) | $0 |
| **Resend** | Pro (50k emails) | $20 |
| **Supabase** | Free (inclus Edge Functions) | $0 |
| **EasyCron** | Pro (optionnel) | $3.99 |

**Total minimum:** $0/mois (tout gratuit)

---

## 10. Résumé Exécutif

### Situation actuelle
- ✅ Toutes les Edge Functions sont déployées et fonctionnelles
- ✅ La base de données contient 126 marchés publics
- ✅ 1 alerte est configurée avec notifications activées
- ❌ Les CRON ne sont pas configurés (inactifs depuis 9 jours)
- ❌ Aucun email envoyé depuis 7+ jours

### Action immédiate requise
**Configurer les CRON sur cron-job.org (5 minutes)**

Sans cette configuration, le système reste dormant et aucune notification ne sera envoyée automatiquement.

### Estimation temps de configuration
- **Configuration initiale:** 5-10 minutes
- **Test manuel (optionnel):** 5 minutes
- **Vérification complète:** 24 heures (attendre les cycles complets)

### Impact business
- **Utilisateurs impactés:** Tous (pas de notifications)
- **Fonctionnalités impactées:** Système d'alertes complet
- **Urgence:** Moyenne (système manuel fonctionne)
- **Complexité fix:** Faible (juste configuration externe)
