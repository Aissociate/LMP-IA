import { useState, useEffect } from 'react';
import { Bug, CheckCircle, Clock, AlertCircle, ExternalLink, User, Calendar, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type BugStatus = 'reported' | 'in_progress' | 'resolved';

interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string;
  screenshot_url: string | null;
  status: BugStatus;
  page_url: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

const statusConfig = {
  reported: {
    label: 'Déclaré',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  in_progress: {
    label: 'En cours',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  resolved: {
    label: 'Résolu',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

export function BugManager() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BugStatus | 'all'>('all');
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);

  useEffect(() => {
    loadBugs();
  }, []);

  const loadBugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bugsWithEmails = await Promise.all(
        (data || []).map(async (bug) => {
          const { data: userData } = await supabase.auth.admin.getUserById(bug.user_id);
          return {
            ...bug,
            user_email: userData?.user?.email || 'Inconnu',
          };
        })
      );

      setBugs(bugsWithEmails);
    } catch (error) {
      console.error('Error loading bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBugStatus = async (bugId: string, newStatus: BugStatus) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bugId);

      if (error) throw error;

      setBugs(bugs.map(bug =>
        bug.id === bugId ? { ...bug, status: newStatus, updated_at: new Date().toISOString() } : bug
      ));

      if (selectedBug?.id === bugId) {
        setSelectedBug({ ...selectedBug, status: newStatus, updated_at: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const filteredBugs = filterStatus === 'all'
    ? bugs
    : bugs.filter(bug => bug.status === filterStatus);

  const bugCounts = {
    all: bugs.length,
    reported: bugs.filter(b => b.status === 'reported').length,
    in_progress: bugs.filter(b => b.status === 'in_progress').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des bugs</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterStatus === 'all'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl font-bold text-gray-900">{bugCounts.all}</div>
          <div className="text-sm text-gray-600 mt-1">Total</div>
        </button>

        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as BugStatus)}
            className={`p-4 rounded-xl border-2 transition-all ${
              filterStatus === status
                ? `${config.borderColor} ${config.bgColor}`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`text-3xl font-bold ${config.color}`}>
              {bugCounts[status as keyof typeof bugCounts]}
            </div>
            <div className="text-sm text-gray-600 mt-1">{config.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des bugs ({filteredBugs.length})
          </h3>

          {filteredBugs.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Bug className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucun bug à afficher</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBugs.map((bug) => {
                const config = statusConfig[bug.status];
                const StatusIcon = config.icon;

                return (
                  <button
                    key={bug.id}
                    onClick={() => setSelectedBug(bug)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      selectedBug?.id === bug.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {bug.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {bug.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {bug.user_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(bug.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          {selectedBug ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {selectedBug.title}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedBug.status].bgColor} ${statusConfig[selectedBug.status].color}`}>
                    {statusConfig[selectedBug.status].label}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Utilisateur:</span>
                    <span>{selectedBug.user_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Créé le:</span>
                    <span>{new Date(selectedBug.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                  {selectedBug.page_url && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Monitor className="w-4 h-4" />
                      <span className="font-medium">Page:</span>
                      <a
                        href={selectedBug.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline flex items-center gap-1"
                      >
                        Voir la page
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedBug.description}</p>
                </div>

                {selectedBug.screenshot_url && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Capture d'écran</h4>
                    <a
                      href={selectedBug.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={selectedBug.screenshot_url}
                        alt="Screenshot"
                        className="w-full h-auto"
                      />
                    </a>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Changer le statut</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const StatusIcon = config.icon;
                      return (
                        <button
                          key={status}
                          onClick={() => updateBugStatus(selectedBug.id, status as BugStatus)}
                          disabled={selectedBug.status === status}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedBug.status === status
                              ? `${config.borderColor} ${config.bgColor} cursor-not-allowed`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <StatusIcon className={`w-5 h-5 ${config.color} mx-auto mb-1`} />
                          <div className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Sélectionnez un bug pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
