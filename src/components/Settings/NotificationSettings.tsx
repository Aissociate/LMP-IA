import React, { useState, useEffect } from 'react';
import { Bell, Mail, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface NotificationPreferences {
  email_notifications_enabled: boolean;
  notification_email: string | null;
  morning_digest_enabled: boolean;
  evening_digest_enabled: boolean;
}

export const NotificationSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications_enabled: true,
    notification_email: null,
    morning_digest_enabled: true,
    evening_digest_enabled: true,
  });
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  useEffect(() => {
    loadPreferences();
    loadActiveAlertsCount();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des préférences' });
    } finally {
      setLoading(false);
    }
  };

  const loadActiveAlertsCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('search_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('notifications_enabled', true);

      setActiveAlertsCount(count || 0);
    } catch (error) {
      console.error('Error loading alerts count:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Préférences enregistrées avec succès' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setSaving(true);
      setMessage({ type: 'success', text: 'Envoi de l\'email de test avec vos détections récentes...' });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-test-digest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send test email');
      }

      const detectionMessage = result.detections_count > 0
        ? `Email envoyé avec ${result.detections_count} détection${result.detections_count > 1 ? 's' : ''} des dernières 24h`
        : 'Email de test envoyé (aucune détection récente)';

      setMessage({
        type: 'success',
        text: `${detectionMessage} à ${result.recipient}`
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'email de test' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 space-y-6`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications Email
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Configurez vos préférences de notification pour les alertes marchés
          </p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className={`${isDark ? 'bg-gray-700/50' : 'bg-orange-50'} border ${isDark ? 'border-gray-600' : 'border-orange-200'} rounded-lg p-4`}>
        <div className="flex items-start gap-3">
          <Mail className={`w-5 h-5 mt-0.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email de notification
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email utilisé: <span className="font-medium">{preferences.notification_email || userEmail}</span>
            </p>
            {activeAlertsCount > 0 && (
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Vous avez <span className="font-semibold text-orange-500">{activeAlertsCount}</span> alerte{activeAlertsCount > 1 ? 's' : ''} active{activeAlertsCount > 1 ? 's' : ''} avec notifications activées
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <Bell className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Activer les notifications email
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Recevoir des emails pour les nouveaux marchés détectés
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_notifications_enabled}
              onChange={(e) => setPreferences({ ...preferences, email_notifications_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        {preferences.email_notifications_enabled && (
          <>
            <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Digest du matin (8h00)
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Recevoir un email récapitulatif à 8h00
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.morning_digest_enabled}
                  onChange={(e) => setPreferences({ ...preferences, morning_digest_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Digest du soir (18h00)
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Recevoir un email récapitulatif à 18h00
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.evening_digest_enabled}
                  onChange={(e) => setPreferences({ ...preferences, evening_digest_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={savePreferences}
          disabled={saving}
          className={`flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
        </button>
        <button
          onClick={sendTestEmail}
          disabled={saving || !preferences.email_notifications_enabled}
          className={`px-6 py-3 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold`}
        >
          Email de test
        </button>
      </div>

      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
              Comment fonctionnent les alertes email ?
            </h4>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              <li>• Les marchés sont vérifiés <strong>toutes les heures</strong> automatiquement</li>
              <li>• Les emails sont envoyés <strong>2 fois par jour</strong> : à 8h00 et 18h00</li>
              <li>• Vous recevez UN SEUL email consolidé par période s'il y a de nouveaux marchés</li>
              <li>• L'email regroupe tous les marchés détectés par vos alertes actives</li>
              <li>• Aucun email n'est envoyé s'il n'y a pas de nouveau marché</li>
              <li>• Le bouton "Email de test" envoie les détections des <strong>dernières 24h</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
