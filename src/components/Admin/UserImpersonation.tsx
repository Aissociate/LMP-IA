import React, { useState, useEffect } from 'react';
import { UserCheck, Search, AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface User {
  id: string;
  email: string;
  created_at: string;
  user_profiles?: {
    full_name: string | null;
    company_name: string | null;
    is_admin: boolean;
  };
}

export const UserImpersonation: React.FC = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    checkImpersonation();
  }, []);

  const checkImpersonation = () => {
    const impersonated = localStorage.getItem('impersonated_user');
    if (impersonated) {
      setImpersonatedUser(JSON.parse(impersonated));
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Aucune session active');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-impersonate`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'list_users' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du chargement des utilisateurs');
      }

      const { users: usersData } = await response.json();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (user: User) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { data: { session: originalSession } } = await supabase.auth.getSession();
      if (!originalSession) {
        throw new Error('Aucune session active');
      }

      localStorage.setItem('admin_original_session', JSON.stringify(originalSession));
      localStorage.setItem('impersonated_user', JSON.stringify(user));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-impersonate`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${originalSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_token',
          targetUserId: user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la prise de contrôle');
      }

      setImpersonatedUser(user);
      setSuccess(`Vous contrôlez maintenant le compte de ${user.email}`);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopImpersonation = async () => {
    try {
      setLoading(true);
      const originalSession = localStorage.getItem('admin_original_session');

      if (originalSession) {
        const session = JSON.parse(originalSession);
        await supabase.auth.setSession(session);
      }

      localStorage.removeItem('admin_original_session');
      localStorage.removeItem('impersonated_user');
      setImpersonatedUser(null);
      setSuccess('Vous avez repris le contrôle de votre compte administrateur');

      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_profiles?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Prise de contrôle de compte
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Connectez-vous en tant qu'utilisateur pour tester ou assister
            </p>
          </div>
        </div>
      </div>

      {impersonatedUser && (
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <span className={`font-medium ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                Vous contrôlez le compte de: {impersonatedUser.email}
              </span>
            </div>
            <button
              onClick={handleStopImpersonation}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              Reprendre mon compte
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border`}>
          <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {success && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border`}>
          <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{success}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur par email, nom ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chargement...</p>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Aucun utilisateur trouvé
            </p>
          </div>
        )}

        {!loading && filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`p-4 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user.user_profiles?.full_name || 'Nom non renseigné'}
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.email}
                </p>
                {user.user_profiles?.company_name && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {user.user_profiles.company_name}
                  </p>
                )}
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleImpersonate(user)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Prendre le contrôle
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
