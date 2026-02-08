import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

interface AccessCheck {
  has_access: boolean;
  reason: string;
  is_admin: boolean;
  needs_subscription?: boolean;
  trial_end_date?: string;
  plan_name?: string;
  memories_limit?: number;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessData, setAccessData] = useState<AccessCheck | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 15;

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('check_user_access', {
        p_user_id: user.id
      });

      if (rpcError) {
        console.error('Error checking access:', rpcError);
        throw new Error('Erreur lors de la vérification de l\'accès');
      }

      const accessCheck = data as AccessCheck;
      setAccessData(accessCheck);

      if (accessCheck.has_access) {
        setHasAccess(true);
      } else {
        const isReturningFromStripe = searchParams.get('subscription') === 'success';

        if (isReturningFromStripe && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            checkAccess();
          }, 2000);
        } else if (accessCheck.needs_subscription) {
          setTimeout(() => {
            navigate('/subscription');
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('Error in checkAccess:', err);
      setError(err.message || 'Erreur lors de la vérification de l\'accès');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <Shield className={`w-24 h-24 ${isDark ? 'text-orange-400' : 'text-orange-600'} mx-auto animate-pulse`} />
            <Loader2 className="w-12 h-12 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Vérification de votre accès...
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Veuillez patienter
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Erreur d'accès
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={checkAccess}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess && accessData?.needs_subscription) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className={`w-16 h-16 ${isDark ? 'text-orange-400' : 'text-orange-600'} mx-auto mb-4`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Abonnement requis
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Vous devez souscrire à un abonnement pour accéder à l'application.
            <br />
            Redirection en cours...
          </p>
          <Loader2 className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'} mx-auto animate-spin`} />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Accès refusé
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Vous n'avez pas accès à cette application.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
