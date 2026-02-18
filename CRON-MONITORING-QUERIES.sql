-- ═══════════════════════════════════════════════════════════════════════════
-- Requêtes SQL de Monitoring CRON
-- À exécuter dans Supabase SQL Editor pour surveiller le système
-- ═══════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. DASHBOARD GLOBAL - Vue d'ensemble du système
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  'Alertes actives' as metrique,
  COUNT(*) as valeur,
  MAX(last_checked_at) as derniere_maj
FROM search_alerts
WHERE is_active = true

UNION ALL

SELECT
  'Alertes avec notifications',
  COUNT(*),
  NULL
FROM search_alerts
WHERE is_active = true AND notification_enabled = true

UNION ALL

SELECT
  'Détections non lues',
  COUNT(*),
  MAX(created_at)
FROM market_alert_detections
WHERE is_read = false

UNION ALL

SELECT
  'Marchés publics totaux',
  COUNT(*),
  MAX(created_at)
FROM manual_markets

UNION ALL

SELECT
  'Digests en attente',
  COUNT(*),
  MAX(created_at)
FROM email_digest_queue
WHERE status = 'pending'

UNION ALL

SELECT
  'Emails envoyés (24h)',
  COUNT(*),
  MAX(sent_at)
FROM email_digest_history
WHERE sent_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
  'Emails envoyés (7j)',
  COUNT(*),
  MAX(sent_at)
FROM email_digest_history
WHERE sent_at > NOW() - INTERVAL '7 days';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. VÉRIFICATION ALERTES - Détail des alertes actives
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  sa.id,
  sa.name,
  sa.keywords,
  sa.notification_enabled,
  sa.last_checked_at,
  NOW() - sa.last_checked_at as temps_depuis_verification,
  CASE
    WHEN sa.last_checked_at > NOW() - INTERVAL '2 hours' THEN '✅ OK'
    WHEN sa.last_checked_at > NOW() - INTERVAL '24 hours' THEN '⚠️ ANCIEN'
    ELSE '❌ TRÈS ANCIEN'
  END as statut,
  COUNT(DISTINCT mad.id) as detections_totales,
  COUNT(DISTINCT CASE WHEN mad.is_read = false THEN mad.id END) as detections_non_lues
FROM search_alerts sa
LEFT JOIN market_alert_detections mad ON mad.alert_id = sa.id
WHERE sa.is_active = true
GROUP BY sa.id, sa.name, sa.keywords, sa.notification_enabled, sa.last_checked_at
ORDER BY sa.last_checked_at DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. DÉTECTIONS RÉCENTES - Nouvelles détections dans les dernières 24h
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  mad.created_at,
  sa.name as alerte,
  mm.title as marche,
  mm.client,
  mm.amount,
  mm.deadline,
  mad.is_read
FROM market_alert_detections mad
JOIN search_alerts sa ON sa.id = mad.alert_id
JOIN manual_markets mm ON mm.id = mad.market_id
WHERE mad.created_at > NOW() - INTERVAL '24 hours'
ORDER BY mad.created_at DESC
LIMIT 20;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. FILE DIGEST - Digests en attente d'envoi
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  edq.id,
  edq.created_at,
  edq.scheduled_for,
  edq.digest_type,
  edq.status,
  edq.total_markets_count,
  CASE
    WHEN edq.scheduled_for <= NOW() THEN '⚠️ EN RETARD'
    ELSE '⏳ PROGRAMMÉ'
  END as urgence,
  NOW() - edq.scheduled_for as retard
FROM email_digest_queue edq
WHERE edq.status = 'pending'
ORDER BY edq.scheduled_for ASC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. HISTORIQUE EMAILS - Derniers emails envoyés
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  edh.sent_at,
  edh.digest_type,
  edh.alerts_triggered,
  edh.markets_included,
  edh.recipient_email
FROM email_digest_history edh
ORDER BY edh.sent_at DESC
LIMIT 10;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. STATISTIQUES EMAILS PAR JOUR - Tendance des envois
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  DATE(sent_at) as date,
  COUNT(*) as emails_envoyes,
  SUM(markets_included) as marches_envoyes_total,
  COUNT(DISTINCT user_id) as utilisateurs_distincts,
  COUNT(CASE WHEN digest_type = 'morning' THEN 1 END) as digests_matin,
  COUNT(CASE WHEN digest_type = 'evening' THEN 1 END) as digests_soir
FROM email_digest_history
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. MARCHÉS RÉCENTS - Nouveaux marchés ajoutés
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  mm.created_at,
  mm.reference,
  mm.title,
  mm.client,
  mm.amount,
  mm.deadline,
  mm.service_type,
  CASE
    WHEN mm.deadline < NOW() THEN '❌ EXPIRÉ'
    WHEN mm.deadline < NOW() + INTERVAL '7 days' THEN '⚠️ URGENT'
    ELSE '✅ OK'
  END as urgence_deadline
FROM manual_markets mm
ORDER BY mm.created_at DESC
LIMIT 20;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. PERFORMANCE ALERTES - Combien de détections par alerte
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  sa.name as alerte,
  sa.keywords,
  COUNT(DISTINCT mad.id) as detections_totales,
  COUNT(DISTINCT CASE WHEN mad.created_at > NOW() - INTERVAL '7 days' THEN mad.id END) as detections_7j,
  COUNT(DISTINCT CASE WHEN mad.created_at > NOW() - INTERVAL '24 hours' THEN mad.id END) as detections_24h,
  COUNT(DISTINCT CASE WHEN mad.is_read = false THEN mad.id END) as non_lues
FROM search_alerts sa
LEFT JOIN market_alert_detections mad ON mad.alert_id = sa.id
WHERE sa.is_active = true
GROUP BY sa.id, sa.name, sa.keywords
ORDER BY detections_totales DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9. ÉCHECS DIGEST - Digests qui ont échoué
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  edq.id,
  edq.created_at,
  edq.scheduled_for,
  edq.sent_at,
  edq.digest_type,
  edq.total_markets_count,
  edq.error_message
FROM email_digest_queue edq
WHERE edq.status = 'failed'
ORDER BY edq.sent_at DESC
LIMIT 20;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 10. SANTÉ SYSTÈME - Indicateurs de santé globale
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WITH health_metrics AS (
  SELECT
    -- Dernière vérification d'alerte
    EXTRACT(EPOCH FROM (NOW() - MAX(last_checked_at))) / 3600 as heures_depuis_derniere_verification,

    -- Alertes actives
    COUNT(*) as alertes_actives
  FROM search_alerts
  WHERE is_active = true
),
email_metrics AS (
  SELECT
    -- Emails envoyés récemment
    COUNT(*) as emails_24h
  FROM email_digest_history
  WHERE sent_at > NOW() - INTERVAL '24 hours'
),
digest_metrics AS (
  SELECT
    -- Digests en retard
    COUNT(*) as digests_en_retard
  FROM email_digest_queue
  WHERE status = 'pending'
    AND scheduled_for < NOW()
)

SELECT
  CASE
    WHEN hm.heures_depuis_derniere_verification < 2 THEN '✅ EXCELLENT'
    WHEN hm.heures_depuis_derniere_verification < 24 THEN '⚠️ ATTENTION'
    ELSE '❌ CRITIQUE'
  END as statut_verification,

  ROUND(hm.heures_depuis_derniere_verification::numeric, 1) || 'h' as derniere_verification,

  hm.alertes_actives,

  em.emails_24h as emails_envoyes_24h,

  CASE
    WHEN dm.digests_en_retard = 0 THEN '✅ OK'
    WHEN dm.digests_en_retard < 5 THEN '⚠️ RETARDS'
    ELSE '❌ PROBLÈME'
  END as statut_digests,

  dm.digests_en_retard,

  CASE
    WHEN hm.heures_depuis_derniere_verification < 2
      AND dm.digests_en_retard = 0
    THEN '✅ SYSTÈME OPÉRATIONNEL'
    WHEN hm.heures_depuis_derniere_verification < 24
    THEN '⚠️ SYSTÈME DÉGRADÉ'
    ELSE '❌ SYSTÈME HORS LIGNE'
  END as statut_global

FROM health_metrics hm
CROSS JOIN email_metrics em
CROSS JOIN digest_metrics dm;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 11. RÉINITIALISER last_checked_at (UTILISER AVEC PRÉCAUTION)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Cette requête force une nouvelle vérification immédiate de toutes les alertes

-- DÉCOMMENTEZ POUR EXÉCUTER:
-- UPDATE search_alerts
-- SET last_checked_at = NOW() - INTERVAL '2 hours'
-- WHERE is_active = true;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 12. NETTOYER DÉTECTIONS ANCIENNES (UTILISER AVEC PRÉCAUTION)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Supprime les détections de plus de 30 jours déjà lues

-- DÉCOMMENTEZ POUR EXÉCUTER:
-- DELETE FROM market_alert_detections
-- WHERE is_read = true
--   AND created_at < NOW() - INTERVAL '30 days';
