import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';

export const ResetPasswordForm: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        setError('Le lien de réinitialisation est invalide ou a expiré.');
      }
    };

    checkSession();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login', {
          state: {
            message: 'Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.'
          }
        });
      }, 3000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError('Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession && error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl p-8 transition-colors duration-200`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Lien invalide
            </h1>

            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 leading-relaxed`}>
              Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
            </p>

            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Demander un nouveau lien
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl p-8 transition-colors duration-200`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Mot de passe réinitialisé !
            </h1>

            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 leading-relaxed`}>
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>

            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl p-8 transition-colors duration-200`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-16 w-auto" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Nouveau mot de passe
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    : 'border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={128}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    : 'border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className={`${isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl p-4 text-sm flex items-start gap-2`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Réinitialisation...
              </div>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
