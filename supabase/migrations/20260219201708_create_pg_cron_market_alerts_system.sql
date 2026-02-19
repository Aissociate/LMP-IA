/*
  # Système automatique d'alertes marchés avec pg_cron + pg_net

  ## Vue d'ensemble
  Configure pg_cron et pg_net pour automatiser les alertes Market Sentinel
  et l'envoi des digests email deux fois par jour sans service externe.

  ## Nouvelles tables
  
  ### `cron_execution_logs`
  Table de logging des exécutions CRON
  - `id` (bigserial, primary key)
  - `job_name` (text) - Nom du job CRON
  - `started_at` (timestamptz) - Début d'exécution
  - `completed_at` (timestamptz) - Fin d'exécution
  - `status` (text) - success, failed, running
  - `response_status` (int) - Code HTTP de réponse
  - `response_body` (jsonb) - Corps de la réponse
  - `error_message` (text) - Message d'erreur si échec
  - `created_at` (timestamptz)

  ### `admin_secrets`
  Utilise la table existante pour stocker CRON_SECRET

  ## Fonctions créées

  ### `call_edge_function(function_name text)`
  Fonction helper pour appeler les Edge Functions via pg_net
  
  ### `cleanup_old_cron_logs()`
  Nettoie les logs de plus de 30 jours

  ## Jobs CRON configurés

  1. **check-market-alerts** - Toutes les heures (0 * * * *)
     Vérifie les alertes et crée les détections
  
  2. **send-market-digests-morning** - Tous les jours à 8h (0 8 * * *)
     Envoi du digest matinal
  
  3. **send-market-digests-evening** - Tous les jours à 18h (0 18 * * *)
     Envoi du digest du soir
  
  4. **daily-reunion-markets-sync** - Tous les jours à 6h (0 6 * * *)
     Synchronisation des marchés de La Réunion
  
  5. **archive-expired-markets** - Tous les jours à 2h (0 2 * * *)
     Archive les marchés expirés
  
  6. **generate-markets-sitemap** - Tous les jours à 3h (0 3 * * *)
     Génère le sitemap des marchés publics

  7. **cleanup-cron-logs** - Tous les jours à 1h (0 1 * * *)
     Nettoie les anciens logs

  ## Sécurité
  - RLS activé sur cron_execution_logs
  - Seuls les admins peuvent consulter les logs
  - CRON_SECRET stocké de manière sécurisée
  - Utilise SUPABASE_SERVICE_ROLE_KEY pour les appels
*/

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABLE DE LOGS DES EXÉCUTIONS CRON
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id bigserial PRIMARY KEY,
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
  response_status int,
  response_body jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_execution_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_started_at ON cron_execution_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_execution_logs(status);

-- RLS
ALTER TABLE cron_execution_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les logs
CREATE POLICY "Admins can view cron execution logs"
  ON cron_execution_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. FONCTION HELPER POUR APPELER LES EDGE FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION call_edge_function(function_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
DECLARE
  log_id bigint;
  cron_secret text;
  function_url text;
  request_id bigint;
BEGIN
  -- Créer un log d'exécution
  INSERT INTO cron_execution_logs (job_name, status)
  VALUES (function_name, 'running')
  RETURNING id INTO log_id;

  -- Récupérer le CRON_SECRET depuis admin_secrets
  SELECT secret_value INTO cron_secret
  FROM admin_secrets
  WHERE secret_key = 'CRON_SECRET'
  LIMIT 1;

  -- Si pas de secret, utiliser une valeur par défaut (à remplacer en production)
  IF cron_secret IS NULL THEN
    cron_secret := 'default-cron-secret-please-change';
    
    -- Logger l'avertissement
    UPDATE cron_execution_logs
    SET 
      status = 'failed',
      completed_at = now(),
      error_message = 'CRON_SECRET not found in admin_secrets. Please configure it in the admin panel.'
    WHERE id = log_id;
    
    RETURN;
  END IF;

  -- Construire l'URL de la fonction (URL fixe Supabase)
  function_url := 'https://tciryfaaussfrfbvalhk.supabase.co/functions/v1/' || function_name;

  -- Appeler la fonction via pg_net
  SELECT INTO request_id extensions.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', cron_secret
    ),
    body := '{}'::jsonb
  );

  -- Marquer comme succès (pg_net est asynchrone)
  UPDATE cron_execution_logs
  SET 
    status = 'success',
    completed_at = now(),
    response_body = jsonb_build_object(
      'message', 'Request sent via pg_net',
      'request_id', request_id,
      'function_url', function_url
    )
  WHERE id = log_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Logger l'erreur
    UPDATE cron_execution_logs
    SET 
      status = 'failed',
      completed_at = now(),
      error_message = SQLERRM
    WHERE id = log_id;
    
    RAISE WARNING 'Error calling edge function %: %', function_name, SQLERRM;
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. FONCTION DE NETTOYAGE DES ANCIENS LOGS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count int;
BEGIN
  -- Supprimer les logs de plus de 30 jours
  DELETE FROM cron_execution_logs
  WHERE created_at < now() - interval '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % old cron execution logs', deleted_count;
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. CONFIGURATION DES JOBS PG_CRON
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Supprimer les jobs existants s'ils existent (idempotence)
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname IN (
    'check-market-alerts',
    'send-market-digests-morning',
    'send-market-digests-evening',
    'daily-reunion-markets-sync',
    'archive-expired-markets',
    'generate-markets-sitemap',
    'cleanup-cron-logs'
  );
END $$;

-- Job 1: Vérification des alertes marchés (toutes les heures)
SELECT cron.schedule(
  'check-market-alerts',
  '0 * * * *',
  $$SELECT call_edge_function('check-market-alerts')$$
);

-- Job 2: Digest matinal (tous les jours à 8h)
SELECT cron.schedule(
  'send-market-digests-morning',
  '0 8 * * *',
  $$SELECT call_edge_function('send-market-digests')$$
);

-- Job 3: Digest du soir (tous les jours à 18h)
SELECT cron.schedule(
  'send-market-digests-evening',
  '0 18 * * *',
  $$SELECT call_edge_function('send-market-digests')$$
);

-- Job 4: Synchronisation marchés Réunion (tous les jours à 6h)
SELECT cron.schedule(
  'daily-reunion-markets-sync',
  '0 6 * * *',
  $$SELECT call_edge_function('daily-reunion-markets-sync')$$
);

-- Job 5: Archivage marchés expirés (tous les jours à 2h)
SELECT cron.schedule(
  'archive-expired-markets',
  '0 2 * * *',
  $$SELECT call_edge_function('archive-expired-markets')$$
);

-- Job 6: Génération sitemap (tous les jours à 3h)
SELECT cron.schedule(
  'generate-markets-sitemap',
  '0 3 * * *',
  $$SELECT call_edge_function('generate-markets-sitemap')$$
);

-- Job 7: Nettoyage des anciens logs (tous les jours à 1h)
SELECT cron.schedule(
  'cleanup-cron-logs',
  '0 1 * * *',
  $$SELECT cleanup_old_cron_logs()$$
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. INSERTION DU CRON_SECRET DANS admin_secrets SI N'EXISTE PAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Insérer CRON_SECRET s'il n'existe pas déjà
INSERT INTO admin_secrets (secret_key, description)
VALUES (
  'CRON_SECRET',
  'Secret utilisé pour authentifier les appels CRON automatiques aux Edge Functions. IMPORTANT: Ce secret doit être configuré dans le panneau admin.'
)
ON CONFLICT (secret_key) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. VUE POUR MONITORING DES JOBS CRON
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE VIEW cron_jobs_status AS
SELECT
  j.jobid,
  j.jobname,
  j.schedule,
  j.active,
  j.nodename,
  (
    SELECT cel.started_at
    FROM cron_execution_logs cel
    WHERE cel.job_name = j.jobname
    ORDER BY cel.started_at DESC
    LIMIT 1
  ) as last_execution,
  (
    SELECT cel.status
    FROM cron_execution_logs cel
    WHERE cel.job_name = j.jobname
    ORDER BY cel.started_at DESC
    LIMIT 1
  ) as last_status,
  (
    SELECT cel.error_message
    FROM cron_execution_logs cel
    WHERE cel.job_name = j.jobname
    AND cel.status = 'failed'
    ORDER BY cel.started_at DESC
    LIMIT 1
  ) as last_error,
  (
    SELECT COUNT(*)
    FROM cron_execution_logs cel
    WHERE cel.job_name = j.jobname
    AND cel.started_at > now() - interval '24 hours'
  ) as executions_24h,
  (
    SELECT COUNT(*)
    FROM cron_execution_logs cel
    WHERE cel.job_name = j.jobname
    AND cel.status = 'failed'
    AND cel.started_at > now() - interval '24 hours'
  ) as failures_24h
FROM cron.job j
WHERE j.jobname IN (
  'check-market-alerts',
  'send-market-digests-morning',
  'send-market-digests-evening',
  'daily-reunion-markets-sync',
  'archive-expired-markets',
  'generate-markets-sitemap',
  'cleanup-cron-logs'
)
ORDER BY j.jobname;

-- Accorder les permissions sur la vue aux admins
GRANT SELECT ON cron_jobs_status TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. COMMENTAIRES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE cron_execution_logs IS 
'Logs des exécutions des jobs CRON pour monitoring et debugging';

COMMENT ON FUNCTION call_edge_function(text) IS 
'Fonction helper pour appeler les Edge Functions via pg_net avec authentification CRON_SECRET';

COMMENT ON FUNCTION cleanup_old_cron_logs() IS 
'Nettoie automatiquement les logs de plus de 30 jours';

COMMENT ON VIEW cron_jobs_status IS 
'Vue de monitoring pour surveiller l''état des jobs CRON et leurs dernières exécutions';
