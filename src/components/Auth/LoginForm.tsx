import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { SecurityValidation } from '../../lib/securityValidation';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!SecurityValidation.validateEmail(email)) {
      setError('Format d\'email invalide');
      return;
    }
    
    if (password.length < 6) {
      setError('Mot de passe trop court (minimum 6 caractères)');
      return;
    }
    
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      // Ne pas exposer les détails techniques
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl p-8 transition-colors duration-200`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-16 w-auto" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Bienvenue sur <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Le Marché Public.fr</span>
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Accédez à votre espace de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
               maxLength={254}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500' 
                    : 'border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                }`}
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Mot de passe
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
          </div>

          {error && (
            <div className={`${isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl p-4 text-sm`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Pas encore de compte ?{' '}
            <button
              onClick={onToggleMode}
              className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              Créer un compte
            </button>
          </p>
          <p className={`text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'} leading-relaxed`}>
            Le Marché Public.fr est une IA conforme aux dispositions de l'IA Act et du RGPD
          </p>
        </div>
      </div>
    </div>
  );
};