import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export async function validateAuth(req: Request, supabase: SupabaseClient): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return { userId: user.id };
}

export async function requireAuth(req: Request, supabase: SupabaseClient): Promise<{ userId: string }> {
  const auth = await validateAuth(req, supabase);

  if (!auth) {
    throw new Error('Unauthorized');
  }

  return auth;
}

export async function validateAdminAuth(req: Request, supabase: SupabaseClient): Promise<{ userId: string; isAdmin: boolean } | null> {
  const auth = await validateAuth(req, supabase);

  if (!auth) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', auth.userId)
    .single();

  if (error || !profile?.is_admin) {
    return null;
  }

  return { ...auth, isAdmin: true };
}
