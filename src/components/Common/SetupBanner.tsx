import React, { useState, useEffect } from 'react';
import { AlertTriangle, Building2, BookOpen, X, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface SetupStatus {
  profileComplete: boolean;
  knowledgeBaseComplete: boolean;
  loading: boolean;
}

interface SetupBannerProps {
  onNavigate: (tab: string) => void;
}

export const SetupBanner: React.FC<SetupBannerProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [status, setStatus] = useState<SetupStatus>({
    profileComplete: true,
    knowledgeBaseComplete: true,
    loading: true,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSetup = async () => {
      const [profileRes, knowledgeRes] = await Promise.all([
        supabase
          .from('company_profiles')
          .select('company_name, main_activity, presentation')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('knowledge_files')
          .select('id')
          .eq('user_id', user.id)
          .eq('extraction_status', 'completed')
          .limit(1),
      ]);

      const profile = profileRes.data;
      const profileComplete = !!(
        profile &&
        profile.company_name?.trim() &&
        profile.main_activity?.trim() &&
        profile.presentation?.trim()
      );

      const knowledgeBaseComplete = !!(knowledgeRes.data && knowledgeRes.data.length > 0);

      setStatus({ profileComplete, knowledgeBaseComplete, loading: false });
    };

    checkSetup();
  }, [user]);

  if (status.loading || (status.profileComplete && status.knowledgeBaseComplete) || dismissed) {
    return null;
  }

  const missingItems: { icon: React.ReactNode; label: string; tab: string }[] = [];

  if (!status.profileComplete) {
    missingItems.push({
      icon: <Building2 className="w-4 h-4" />,
      label: 'Fiche entreprise',
      tab: 'parametres',
    });
  }

  if (!status.knowledgeBaseComplete) {
    missingItems.push({
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Base de connaissances',
      tab: 'parametres',
    });
  }

  return (
    <div
      className={`relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-amber-900/40 border-b border-amber-700/40'
          : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200'
      }`}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 11px
            )`,
          }}
        />
      </div>

      <div className="relative px-4 py-3 flex items-center gap-3">
        <div
          className={`flex-shrink-0 p-1.5 rounded-lg ${
            isDark ? 'bg-amber-500/20' : 'bg-amber-100'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
          />
        </div>

        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              isDark ? 'text-amber-200' : 'text-amber-900'
            }`}
          >
            Completez votre profil pour ameliorer les analyses IA :
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {missingItems.map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.tab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900'
                }`}
              >
                {item.icon}
                {item.label}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className={`flex-shrink-0 p-1 rounded-md transition-colors ${
            isDark
              ? 'text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/20'
              : 'text-amber-400 hover:text-amber-600 hover:bg-amber-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
