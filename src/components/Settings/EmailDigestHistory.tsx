import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Bell, Eye, Clock, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';
import { Modal } from '../ui/Modal';

interface DigestHistory {
  id: string;
  sent_at: string;
  digest_type: string;
  alerts_triggered: number;
  markets_included: number;
  recipient_email: string;
  email_content: string | null;
}

export const EmailDigestHistory: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<DigestHistory[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<DigestHistory | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_digest_history')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDigestTypeLabel = (type: string) => {
    switch (type) {
      case 'morning':
        return 'Matin (8h)';
      case 'evening':
        return 'Soir (18h)';
      case 'test':
        return 'Test';
      default:
        return type;
    }
  };

  const getDigestTypeColor = (type: string) => {
    switch (type) {
      case 'morning':
        return 'bg-blue-100 text-blue-800';
      case 'evening':
        return 'bg-purple-100 text-purple-800';
      case 'test':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePreviewEmail = (email: DigestHistory) => {
    setSelectedEmail(email);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Historique des emails
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {history.length} email{history.length > 1 ? 's' : ''} envoyé{history.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Mail className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Aucun email envoyé
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              L'historique de vos emails apparaîtra ici une fois que vous recevrez vos premiers digests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700/50 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDigestTypeColor(item.digest_type)}`}>
                        <Clock className="w-3 h-3" />
                        {getDigestTypeLabel(item.digest_type)}
                      </span>
                      {item.digest_type !== 'test' && (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                            <Bell className="w-3 h-3" />
                            {item.alerts_triggered} alerte{item.alerts_triggered > 1 ? 's' : ''}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            <FileText className="w-3 h-3" />
                            {item.markets_included} marché{item.markets_included > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(item.sent_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.recipient_email}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.email_content && (
                    <button
                      onClick={() => handlePreviewEmail(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Prévisualiser
                    </button>
                  )}
                </div>

                {item.digest_type === 'test' && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Email de test envoyé avec succès
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPreview && selectedEmail && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={`Prévisualisation - ${getDigestTypeLabel(selectedEmail.digest_type)}`}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedEmail.email_content ? (
              <iframe
                srcDoc={selectedEmail.email_content}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            ) : (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Contenu de l'email non disponible
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
