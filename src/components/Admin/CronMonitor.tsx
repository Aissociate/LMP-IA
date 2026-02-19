import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Clock, RefreshCw, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  nodename: string;
  last_execution: string | null;
  last_status: 'success' | 'failed' | 'running' | null;
  last_error: string | null;
  executions_24h: number;
  failures_24h: number;
}

interface CronLog {
  id: number;
  job_name: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'failed';
  response_status: number | null;
  response_body: any;
  error_message: string | null;
}

export function CronMonitor() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [testingJob, setTestingJob] = useState<string | null>(null);

  useEffect(() => {
    loadCronStatus();
    const interval = setInterval(loadCronStatus, 30000); // Rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadJobLogs(selectedJob);
    }
  }, [selectedJob]);

  const loadCronStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('cron_jobs_status')
        .select('*')
        .order('jobname');

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading cron status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobLogs = async (jobName: string) => {
    try {
      const { data, error } = await supabase
        .from('cron_execution_logs')
        .select('*')
        .eq('job_name', jobName)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading job logs:', error);
    }
  };

  const testJob = async (jobName: string) => {
    setTestingJob(jobName);
    try {
      const { error } = await supabase.rpc('call_edge_function', {
        function_name: jobName
      });

      if (error) throw error;

      alert(`Job ${jobName} déclenché avec succès. Consultez les logs dans quelques secondes.`);

      // Rafraîchir les données après 2 secondes
      setTimeout(() => {
        loadCronStatus();
        if (selectedJob) loadJobLogs(selectedJob);
      }, 2000);
    } catch (error: any) {
      console.error('Error testing job:', error);
      alert(`Erreur lors du déclenchement du job: ${error.message}`);
    } finally {
      setTestingJob(null);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJobDisplayName = (jobName: string) => {
    const names: Record<string, string> = {
      'check-market-alerts': 'Vérification des alertes',
      'send-market-digests-morning': 'Digest matinal',
      'send-market-digests-evening': 'Digest du soir',
      'daily-reunion-markets-sync': 'Sync marchés Réunion',
      'archive-expired-markets': 'Archivage marchés',
      'generate-markets-sitemap': 'Génération sitemap',
      'cleanup-cron-logs': 'Nettoyage logs'
    };
    return names[jobName] || jobName;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Monitoring CRON (pg_cron + pg_net)
          </h2>
          <p className="text-gray-600 mt-1">
            Surveillance automatique des tâches planifiées
          </p>
        </div>
        <button
          onClick={loadCronStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card
            key={job.jobid}
            className={`cursor-pointer transition-all ${
              selectedJob === job.jobname
                ? 'ring-2 ring-blue-500'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedJob(job.jobname)}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {getJobDisplayName(job.jobname)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{job.schedule}</p>
                </div>
                {getStatusIcon(job.last_status)}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière exécution:</span>
                  <span className="font-medium">
                    {formatDate(job.last_execution)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exécutions (24h):</span>
                  <span className="font-medium">{job.executions_24h}</span>
                </div>
                {job.failures_24h > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Échecs (24h):</span>
                    <span className="font-medium">{job.failures_24h}</span>
                  </div>
                )}
              </div>

              {job.last_error && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-700 line-clamp-2">
                    {job.last_error}
                  </p>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  testJob(job.jobname);
                }}
                disabled={testingJob === job.jobname}
                className="w-full px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testingJob === job.jobname ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Tester maintenant
                  </>
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {selectedJob && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Logs: {getJobDisplayName(selectedJob)}
            </h3>

            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun log disponible pour ce job
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${
                      log.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : log.status === 'failed'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm font-medium">
                          {log.status === 'success' ? 'Succès' :
                           log.status === 'failed' ? 'Échec' :
                           'En cours'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {formatDate(log.started_at)}
                      </span>
                    </div>

                    {log.error_message && (
                      <p className="text-sm text-red-700 mb-2">
                        {log.error_message}
                      </p>
                    )}

                    {log.response_body && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Détails de la réponse
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded border overflow-x-auto">
                          {JSON.stringify(log.response_body, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.completed_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Durée: {Math.round(
                          (new Date(log.completed_at).getTime() -
                           new Date(log.started_at).getTime()) / 1000
                        )}s
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Configuration CRON_SECRET
          </h3>
          <p className="text-sm text-blue-800">
            Pour que les CRON fonctionnent, vous devez configurer le{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">CRON_SECRET</code>{' '}
            dans la section "Secrets Admin" de ce panneau.
          </p>
          <p className="text-sm text-blue-800 mt-2">
            Ce secret doit être identique à celui configuré dans vos Edge Functions.
          </p>
        </div>
      </Card>
    </div>
  );
}
