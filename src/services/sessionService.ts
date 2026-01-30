import { supabase } from '../lib/supabase';

export interface DonneurOrdre {
  id: string;
  name: string;
  markets_url: string | null;
  special_notes: string | null;
  display_order: number;
  department: string | null;
  is_active: boolean;
}

export interface Session {
  id: string;
  operator_email: string;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'paused';
  total_donneurs_ordre: number;
  completed_donneurs_ordre: number;
  total_markets_added: number;
  notes: string | null;
}

export interface SessionProgress {
  id: string;
  session_id: string;
  donneur_ordre_id: string;
  is_completed: boolean;
  markets_added_count: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface SessionWithProgress extends Session {
  progress: SessionProgress[];
  remaining_donneurs_ordre: DonneurOrdre[];
}

export interface Market {
  id: string;
  reference: string | null;
  title: string;
  client: string;
  amount: number | null;
  deadline: string | null;
  created_at: string;
}

export interface ProgressWithDonneur {
  donneur_name: string;
  markets_count: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  is_completed: boolean;
}

export interface SessionSummaryData extends Session {
  duration_minutes: number;
  markets: Market[];
  progress_with_donneurs: ProgressWithDonneur[];
}

class SessionService {
  async getDonneursOrdre(): Promise<DonneurOrdre[]> {
    const { data, error } = await supabase
      .from('manual_markets_donneurs_ordre')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching donneurs ordre:', error);
      throw error;
    }

    return data || [];
  }

  async createSession(operatorEmail: string): Promise<Session> {
    const donneursOrdre = await this.getDonneursOrdre();

    const { data, error } = await supabase
      .from('manual_markets_sessions')
      .insert({
        operator_email: operatorEmail,
        status: 'in_progress',
        total_donneurs_ordre: donneursOrdre.length,
        completed_donneurs_ordre: 0,
        total_markets_added: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    for (const donneur of donneursOrdre) {
      await supabase
        .from('manual_markets_session_progress')
        .insert({
          session_id: data.id,
          donneur_ordre_id: donneur.id,
          is_completed: false,
          markets_added_count: 0,
        });
    }

    return data;
  }

  async getSession(sessionId: string): Promise<SessionWithProgress | null> {
    const { data: session, error: sessionError } = await supabase
      .from('manual_markets_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return null;
    }

    const { data: progress, error: progressError } = await supabase
      .from('manual_markets_session_progress')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return null;
    }

    const completedIds = progress
      .filter(p => p.is_completed)
      .map(p => p.donneur_ordre_id);

    const allDonneurs = await this.getDonneursOrdre();
    const remaining = allDonneurs.filter(d => !completedIds.includes(d.id));

    return {
      ...session,
      progress: progress || [],
      remaining_donneurs_ordre: remaining,
    };
  }

  async getActiveSessions(operatorEmail: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('manual_markets_sessions')
      .select('*')
      .eq('operator_email', operatorEmail)
      .in('status', ['in_progress', 'paused'])
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }

    return data || [];
  }

  async markDonneurOrdreCompleted(
    sessionId: string,
    donneurOrdreId: string,
    marketsAddedCount: number,
    notes?: string
  ): Promise<void> {
    const { error: progressError } = await supabase
      .from('manual_markets_session_progress')
      .update({
        is_completed: true,
        markets_added_count: marketsAddedCount,
        notes: notes || null,
        completed_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('donneur_ordre_id', donneurOrdreId);

    if (progressError) {
      console.error('Error updating progress:', progressError);
      throw progressError;
    }

    const { data: session, error: fetchError } = await supabase
      .from('manual_markets_sessions')
      .select('total_markets_added')
      .eq('id', sessionId)
      .single();

    if (fetchError) {
      console.error('Error fetching session:', fetchError);
      throw fetchError;
    }

    const { error: sessionError } = await supabase
      .from('manual_markets_sessions')
      .update({
        total_markets_added: (session.total_markets_added || 0) + marketsAddedCount,
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error('Error updating session:', sessionError);
      throw sessionError;
    }
  }

  async startDonneurOrdre(sessionId: string, donneurOrdreId: string): Promise<void> {
    const { error } = await supabase
      .from('manual_markets_session_progress')
      .update({
        started_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('donneur_ordre_id', donneurOrdreId);

    if (error) {
      console.error('Error starting donneur ordre:', error);
      throw error;
    }
  }

  async updateSessionStatus(
    sessionId: string,
    status: 'in_progress' | 'completed' | 'paused'
  ): Promise<void> {
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('manual_markets_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  async incrementSessionMarkets(sessionId: string, count: number = 1): Promise<void> {
    const { data: session } = await supabase
      .from('manual_markets_sessions')
      .select('total_markets_added')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    const { error } = await supabase
      .from('manual_markets_sessions')
      .update({
        total_markets_added: (session.total_markets_added || 0) + count,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error incrementing session markets:', error);
    }
  }

  async getRemainingDonneursOrdre(sessionId: string): Promise<DonneurOrdre[]> {
    const { data: progress } = await supabase
      .from('manual_markets_session_progress')
      .select('donneur_ordre_id, is_completed')
      .eq('session_id', sessionId);

    if (!progress) return [];

    const completedIds = progress
      .filter(p => p.is_completed)
      .map(p => p.donneur_ordre_id);

    const allDonneurs = await this.getDonneursOrdre();
    return allDonneurs.filter(d => !completedIds.includes(d.id));
  }

  async getDonneurOrdreById(id: string): Promise<DonneurOrdre | null> {
    const { data, error } = await supabase
      .from('manual_markets_donneurs_ordre')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching donneur ordre:', error);
      return null;
    }

    return data;
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummaryData | null> {
    const { data: session, error: sessionError } = await supabase
      .from('manual_markets_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return null;
    }

    const { data: progress, error: progressError } = await supabase
      .from('manual_markets_session_progress')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return null;
    }

    const { data: markets, error: marketsError } = await supabase
      .from('manual_markets')
      .select('id, reference, title, client, amount, deadline, created_at')
      .eq('created_by', sessionId)
      .order('created_at', { ascending: false });

    if (marketsError) {
      console.error('Error fetching markets:', marketsError);
    }

    const progressWithDonneurs: ProgressWithDonneur[] = [];
    for (const prog of progress || []) {
      const donneur = await this.getDonneurOrdreById(prog.donneur_ordre_id);
      if (donneur) {
        progressWithDonneurs.push({
          donneur_name: donneur.name,
          markets_count: prog.markets_added_count,
          notes: prog.notes,
          started_at: prog.started_at,
          completed_at: prog.completed_at,
          is_completed: prog.is_completed,
        });
      }
    }

    const startDate = new Date(session.started_at);
    const endDate = session.completed_at ? new Date(session.completed_at) : new Date();
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    return {
      ...session,
      duration_minutes: durationMinutes,
      markets: markets || [],
      progress_with_donneurs: progressWithDonneurs,
    };
  }
}

export const sessionService = new SessionService();
