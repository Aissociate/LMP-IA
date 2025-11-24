import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { AIModel, ModelCredit, SubscriptionPlan } from '../types';

interface UserSubscription {
  plan_id: string;
  technical_memories_used: number;
  technical_memories_limit: number;
  monthly_tokens_used: number;
  monthly_tokens_limit: number;
  is_active: boolean;
  expires_at?: string;
}

interface MonthlyUsage {
  memories_included: number;
  memories_used: number;
  extra_memories_purchased: number;
  market_pro_enabled: boolean;
}

interface SubscriptionAddon {
  addon_type: string;
  addon_name: string;
  price_cents: number;
  is_recurring: boolean;
  quantity: number;
  status: string;
}

export const useSubscription = () => {
  const { user, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage | null>(null);
  const [addons, setAddons] = useState<SubscriptionAddon[]>([]);
  const [modelCredits, setModelCredits] = useState<ModelCredit[]>([]);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      let { data: userSub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userSub) {
        const defaultPlanId = isAdmin ? 'projeteur' : 'freemium_unlimited';
        const defaultMemoriesLimit = isAdmin ? -1 : 0;
        const defaultTokensLimit = isAdmin ? -1 : 999999;

        const { data: newSub } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_id: defaultPlanId,
            technical_memories_used: 0,
            technical_memories_limit: defaultMemoriesLimit,
            monthly_tokens_used: 0,
            monthly_tokens_limit: defaultTokensLimit,
            is_active: true
          })
          .select()
          .single();
        userSub = newSub;
      } else if (isAdmin && userSub.technical_memories_limit !== -1) {
        const { data: updatedSub } = await supabase
          .from('user_subscriptions')
          .update({
            technical_memories_limit: -1,
            monthly_tokens_limit: -1,
            is_active: true
          })
          .eq('user_id', user.id)
          .select()
          .single();
        userSub = updatedSub;
      }

      const monthYear = new Date().toISOString().slice(0, 7);

      if (userSub.plan_id !== 'freemium_unlimited') {
        const { data: usage } = await supabase
          .from('monthly_memory_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('month_year', monthYear)
          .maybeSingle();

        if (!usage) {
          await supabase.rpc('init_monthly_usage', {
            p_user_id: user.id,
            p_plan_id: userSub.plan_id
          });

          const { data: newUsage } = await supabase
            .from('monthly_memory_usage')
            .select('*')
            .eq('user_id', user.id)
            .eq('month_year', monthYear)
            .maybeSingle();

          setMonthlyUsage(newUsage);
        } else {
          setMonthlyUsage(usage);
        }
      }

      const { data: userAddons } = await supabase
        .from('subscription_addons')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      setAddons(userAddons || []);

      let currentSubscription: UserSubscription | null = null;
      let currentPlan: SubscriptionPlan | null = null;

      if (userSub) {
        currentSubscription = userSub;

        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', currentSubscription.plan_id)
          .maybeSingle();

        if (planData) {
          currentPlan = planData;
        }
      }

      setSubscription(currentSubscription);
      setPlan(currentPlan);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateTechnicalMemory = (): boolean => {
    if (!subscription || !plan) return false;

    if (plan.id === 'freemium_unlimited') return false;

    const remaining = getRemainingMemories();
    return remaining === -1 || remaining > 0;
  };

  const canGenerateSection = (): boolean => {
    return true;
  };

  const getAvailableCredits = (): number => {
    if (!subscription) return 0;
    if (subscription.technical_memories_limit === -1) return -1;
    return 0;
  };

  const getFreeSectionsRemaining = (): number => {
    if (!subscription) return 0;
    if (subscription.technical_memories_limit === -1) return -1;
    return 0;
  };

  const incrementSectionUsage = async (): Promise<boolean> => {
    return true;
  };

  const useMemoryCredit = async (): Promise<boolean> => {
    return incrementMemoryUsage();
  };

  const canUseTokens = (): boolean => {
    return true;
  };

  const getRemainingTokens = (): number => {
    return -1;
  };

  const getRemainingMemories = (): number => {
    if (!subscription || !plan) return 0;

    if (subscription.technical_memories_limit === -1 || plan.is_unlimited) return -1;

    if (!monthlyUsage) {
      return Math.max(0, subscription.technical_memories_limit - subscription.technical_memories_used);
    }

    const totalAvailable = monthlyUsage.memories_included + monthlyUsage.extra_memories_purchased;
    return Math.max(0, totalAvailable - monthlyUsage.memories_used);
  };

  const hasMarketPro = (): boolean => {
    if (subscription?.technical_memories_limit === -1) return true;
    if (monthlyUsage?.market_pro_enabled) return true;
    return addons.some(a => a.addon_type === 'market_pro' && a.status === 'active');
  };

  const isFreemium = (): boolean => {
    return plan?.id === 'freemium_unlimited' || !plan;
  };

  const incrementMemoryUsage = async (): Promise<boolean> => {
    if (!subscription || !user) return true;

    if (subscription.technical_memories_limit === -1) return true;

    try {
      if (monthlyUsage) {
        const { data, error } = await supabase.rpc('increment_memory_usage', {
          p_user_id: user.id
        });

        if (error) throw error;

        if (data) {
          await fetchSubscription();
          return true;
        }
        return false;
      } else {
        const newUsed = subscription.technical_memories_used + 1;

        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            plan_id: subscription.plan_id,
            technical_memories_used: newUsed,
            technical_memories_limit: subscription.technical_memories_limit,
            monthly_tokens_used: subscription.monthly_tokens_used,
            monthly_tokens_limit: subscription.monthly_tokens_limit,
            is_active: subscription.is_active,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        setSubscription({
          ...subscription,
          technical_memories_used: newUsed
        });

        return true;
      }
    } catch (error) {
      console.error('Error incrementing memory usage:', error);
      return false;
    }
  };

  const purchaseExtraMemory = async (quantity: number = 1): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      const { error } = await supabase
        .from('subscription_addons')
        .insert({
          user_id: user.id,
          addon_type: 'extra_memory',
          addon_name: 'Mémoire supplémentaire',
          price_cents: 29900 * quantity,
          is_recurring: false,
          quantity,
          status: 'active'
        });

      if (error) throw error;

      const monthYear = new Date().toISOString().slice(0, 7);
      const { error: updateError } = await supabase
        .from('monthly_memory_usage')
        .update({
          extra_memories_purchased: (monthlyUsage?.extra_memories_purchased || 0) + quantity
        })
        .eq('user_id', user.id)
        .eq('month_year', monthYear);

      if (updateError) throw updateError;

      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error purchasing extra memory:', error);
      return false;
    }
  };

  const enableMarketPro = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('subscription_addons')
        .insert({
          user_id: user.id,
          addon_type: 'market_pro',
          addon_name: 'Market Pro',
          price_cents: 9900,
          is_recurring: true,
          quantity: 1,
          status: 'active'
        });

      if (error) throw error;

      const monthYear = new Date().toISOString().slice(0, 7);
      await supabase
        .from('monthly_memory_usage')
        .update({ market_pro_enabled: true })
        .eq('user_id', user.id)
        .eq('month_year', monthYear);

      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error enabling Market Pro:', error);
      return false;
    }
  };

  return {
    subscription,
    plan,
    monthlyUsage,
    addons,
    loading,
    canCreateTechnicalMemory,
    canGenerateSection,
    getAvailableCredits,
    getFreeSectionsRemaining,
    incrementSectionUsage,
    useMemoryCredit,
    canUseTokens,
    getRemainingTokens,
    getRemainingMemories,
    hasMarketPro,
    isFreemium,
    incrementMemoryUsage,
    purchaseExtraMemory,
    enableMarketPro,
    refetch: fetchSubscription
  };
};
