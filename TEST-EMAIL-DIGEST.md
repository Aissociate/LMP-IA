# Test du Système d'Envoi d'Emails - Guide Complet

Ce guide explique comment tester et valider le système d'alertes email avant les envois automatiques.

## Vue d'ensemble

Le système d'alertes email fonctionne en 2 temps :
1. **Vérification des alertes** : Toutes les heures, le système vérifie si de nouveaux marchés correspondent à vos critères
2. **Envoi des digests** : 2 fois par jour (8h et 18h), un email consolidé est envoyé avec toutes les détections

## Fonction de Test Améliorée

La fonction `send-test-digest` a été mise à jour pour :
- ✅ Envoyer un email avec les **vraies détections** des dernières 24h
- ✅ Grouper les détections par alerte (comme le vrai digest)
- ✅ Afficher le format exact que vous recevrez automatiquement
- ✅ Indiquer le nombre de détections trouvées
- ✅ Montrer un aperçu même s'il n'y a pas de détections

## Comment Tester

### Méthode 1 : Via l'Interface (Recommandé)

1. **Connectez-vous** à votre compte
2. Allez dans **Paramètres** > **Notifications**
3. Vérifiez que les notifications email sont **activées**
4. Cliquez sur le bouton **"Email de test"**
5. Vous verrez un message de confirmation avec :
   - L'email destinataire
   - Le nombre de détections envoyées
   - Exemple : "Email envoyé avec 5 détections des dernières 24h à user@example.com"

### Méthode 2 : Via CURL (Pour les tests techniques)

```bash
# Récupérer votre token d'authentification depuis la console navigateur
# (Inspection > Application > Local Storage > supabase.auth.token)

curl -X POST \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-test-digest
```

## Ce que Vous Verrez dans l'Email

### Si vous avez des détections récentes (dernières 24h) :

```
Email de test - Vos détections
Aperçu du format des notifications - [Date]

✅ Email de test envoyé avec succès
5 détections récentes (dernières 24h)

[Alerte 1 : Marchés BTP La Réunion]
3 marchés détectés
  - Marché 1 (détails complets)
  - Marché 2 (détails complets)
  - Marché 3 (détails complets)

[Alerte 2 : Marchés Informatique]
2 marchés détectés
  - Marché 4 (détails complets)
  - Marché 5 (détails complets)

Horaires des digests automatiques
• Digest du matin : 8h00 (UTC+4)
• Digest du soir : 18h00 (UTC+4)
• Les emails sont envoyés uniquement s'il y a de nouvelles détections
```

### Si vous n'avez pas de détections récentes :

```
Email de test - Format des notifications
Aperçu du format des notifications - [Date]

⚠️ Aucune détection récente
Aucun marché n'a été détecté récemment pour vos alertes actives.
Cet email de test montre le format que vous recevrez lorsque des
marchés correspondront à vos critères.

Horaires des digests automatiques
• Digest du matin : 8h00 (UTC+4)
• Digest du soir : 18h00 (UTC+4)
```

## Scénarios de Test

### Scénario 1 : Test Basique
**Objectif** : Vérifier que l'email arrive

1. Créez une alerte simple avec des critères larges
2. Attendez 1-2 heures (ou vérifiez les marchés manuellement)
3. Cliquez sur "Email de test"
4. Vérifiez votre boîte mail

**Résultat attendu** : Email reçu dans les 30 secondes

### Scénario 2 : Test avec Plusieurs Alertes
**Objectif** : Vérifier le groupement par alerte

1. Créez 2-3 alertes avec des critères différents
2. Attendez quelques heures pour avoir des détections
3. Cliquez sur "Email de test"
4. Vérifiez que l'email groupe bien les marchés par alerte

**Résultat attendu** : Un seul email avec plusieurs sections (une par alerte)

### Scénario 3 : Test Sans Détections
**Objectif** : Vérifier l'email informatif

1. Créez une alerte avec des critères très spécifiques (aucune détection attendue)
2. Cliquez sur "Email de test"
3. Vérifiez l'email informatif

**Résultat attendu** : Email expliquant le format et les horaires

### Scénario 4 : Test du Système Complet
**Objectif** : Valider le flux end-to-end

1. **Matin (avant 8h)** : Vérifiez qu'il n'y a pas d'email automatique
2. **8h00** : Attendez l'email automatique du matin
3. **Midi** : Cliquez sur "Email de test" pour voir les détections du matin
4. **18h00** : Attendez l'email automatique du soir
5. **Soir** : Cliquez sur "Email de test" pour voir toutes les détections de la journée

**Résultat attendu** :
- 2 emails automatiques (si détections)
- Emails de test montrant les détections récentes

## Vérifications à Faire

### ✅ Avant le test :
- [ ] Les notifications email sont activées
- [ ] Au moins une alerte est active
- [ ] L'alerte a `notifications_enabled = true`
- [ ] Votre email est correct dans votre profil

### ✅ Pendant le test :
- [ ] Le message de confirmation apparaît
- [ ] Il indique le bon nombre de détections
- [ ] L'email destinataire est correct

### ✅ Après le test :
- [ ] L'email arrive dans votre boîte (vérifiez les spams)
- [ ] Le format est correct et professionnel
- [ ] Les liens vers les marchés fonctionnent
- [ ] Les détections correspondent à vos alertes

## Vérification en Base de Données

Pour vérifier que les emails sont bien enregistrés :

```sql
-- Voir l'historique des emails envoyés
SELECT
  digest_type,
  alerts_triggered,
  markets_included,
  recipient_email,
  sent_at
FROM email_digest_history
WHERE user_id = 'VOTRE_USER_ID'
ORDER BY sent_at DESC
LIMIT 10;

-- Voir les détections des dernières 24h
SELECT
  COUNT(*) as total_detections,
  alert_id
FROM market_alert_detections
WHERE user_id = 'VOTRE_USER_ID'
  AND detected_at > NOW() - INTERVAL '24 hours'
GROUP BY alert_id;

-- Voir les emails en attente d'envoi
SELECT *
FROM email_digest_queue
WHERE user_id = 'VOTRE_USER_ID'
  AND status = 'pending'
ORDER BY scheduled_for ASC;
```

## Dépannage

### L'email de test ne part pas

**Solutions** :
1. Vérifier que les notifications email sont activées
2. Vérifier que `RESEND_API_KEY` est configuré dans Supabase
3. Vérifier les logs de la fonction Edge : Dashboard Supabase > Edge Functions > send-test-digest
4. Tester avec curl pour voir l'erreur exacte

### L'email arrive mais est vide

**Solutions** :
1. Vérifier qu'il y a des détections dans `market_alert_detections` (dernières 24h)
2. Vérifier que vos alertes sont actives et ont `notifications_enabled = true`
3. Lancer manuellement la vérification des alertes :
   ```bash
   curl -X POST \
     -H "X-Cron-Secret: VOTRE_SECRET" \
     https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts
   ```

### L'email n'arrive pas (mais l'envoi est confirmé)

**Solutions** :
1. Vérifier les spams/courrier indésirable
2. Vérifier que l'email dans `notification_email` est correct
3. Vérifier les logs Resend : https://resend.com/emails
4. Attendre 2-3 minutes (délais possibles)

### Les détections ne sont pas à jour

**Solutions** :
1. La fonction de test montre les détections des **dernières 24h uniquement**
2. Lancer manuellement la vérification des alertes (voir ci-dessus)
3. Vérifier que vos alertes sont actives
4. Vérifier qu'il y a des marchés publics correspondants dans `public_markets`

## Configuration Resend (Email Provider)

Pour que les emails fonctionnent, Resend doit être configuré :

### Variables d'environnement requises :
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Le Marche Public <notifications@lemarchepublic.fr>
```

### Vérifier la configuration :
1. Dashboard Supabase > Edge Functions > Secrets
2. Vérifier que `RESEND_API_KEY` existe
3. Vérifier que `EMAIL_FROM` est au bon format

### Format de EMAIL_FROM :
```
Correct : "Le Marche Public <notifications@lemarchepublic.fr>"
Correct : "notifications@lemarchepublic.fr"
Incorrect : "Le Marche Public notifications@lemarchepublic.fr"
```

## Monitoring des Emails

### Dashboard Resend
https://resend.com/emails
- Voir tous les emails envoyés
- Statut de livraison
- Taux d'ouverture
- Bounces et plaintes

### Logs Supabase
Dashboard Supabase > Edge Functions > send-test-digest
- Erreurs d'envoi
- Temps de réponse
- Détails des appels

### Base de données
Table `email_digest_history` :
- Historique complet
- Contenu des emails
- Statistiques par utilisateur

## Tests Automatisés

Pour tester automatiquement le système complet :

```bash
#!/bin/bash
# Script de test complet

echo "1. Test de vérification des alertes"
curl -X POST \
  -H "X-Cron-Secret: $CRON_SECRET" \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/check-market-alerts

echo "\n2. Attendre 5 secondes..."
sleep 5

echo "3. Test d'envoi des digests"
curl -X POST \
  -H "X-Cron-Secret: $CRON_SECRET" \
  https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/send-market-digests

echo "\n4. Test terminé - Vérifiez vos emails"
```

## Résumé des Endpoints

| Endpoint | Authentification | Description | Fréquence |
|----------|-----------------|-------------|-----------|
| `check-market-alerts` | CRON_SECRET | Vérifie les alertes et crée les détections | Toutes les heures |
| `send-market-digests` | CRON_SECRET | Envoie les emails en attente | 2x/jour (8h, 18h) |
| `send-test-digest` | User Token | Envoie un email de test avec détections réelles | Manuel |

## Checklist de Validation

Avant de considérer le système comme validé :

- [ ] Email de test reçu avec détections
- [ ] Email de test reçu sans détections (format informatif)
- [ ] Email automatique du matin reçu (8h)
- [ ] Email automatique du soir reçu (18h)
- [ ] Les détections correspondent aux critères d'alerte
- [ ] Les liens vers les marchés fonctionnent
- [ ] Le groupement par alerte est correct
- [ ] Pas d'email envoyé quand il n'y a pas de détections
- [ ] Les emails sont enregistrés dans `email_digest_history`
- [ ] Les logs Supabase ne montrent pas d'erreurs

## Support

En cas de problème persistant :

1. Vérifier les logs Supabase Edge Functions
2. Vérifier les logs Resend
3. Vérifier les données en base de données (requêtes SQL ci-dessus)
4. Tester avec curl pour voir les erreurs détaillées
5. Vérifier la configuration des secrets (CRON_SECRET, RESEND_API_KEY)

Le système est conçu pour être robuste et fournir des logs détaillés à chaque étape.
