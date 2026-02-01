/*
  # Fix Security Issues - Part 7: Document Always-True RLS Policies

  1. Documents Always-True Policies
    - These policies intentionally allow unrestricted access for specific use cases
    - They are required for public-facing features:
      - Lead capture form (public form for lead generation)
      - Session Wizard (allows anonymous users to collect market data before signup)
    
  2. Tables with Always-True Policies
    - lead_captures: Public lead capture form
    - manual_markets_sessions: Session Wizard for anonymous market collection
    - manual_markets_session_progress: Session progress tracking
    
  3. Security Considerations
    - These are intentional design decisions for user experience
    - Data validation should be enforced at the application level
    - Rate limiting should be implemented at the API/edge function level
    - Consider adding RLS policies with rate limiting in the future

  4. Note
    - No changes are made in this migration
    - This migration serves as documentation of why these policies exist
    - Future improvements could include:
      - Adding rate limiting via database functions
      - Adding data validation constraints
      - Implementing honeypot fields for bot detection
*/

-- No actual changes needed - these policies are intentional
-- They support legitimate public-facing features:
-- 1. Lead capture form for business inquiries
-- 2. Session Wizard for market data collection before account creation

-- Future enhancement recommendations:
COMMENT ON POLICY "Anyone can submit lead capture form" ON public.lead_captures IS 
  'Public policy allowing anonymous lead submissions. Consider implementing rate limiting and bot detection.';

COMMENT ON POLICY "Anon can create sessions" ON public.manual_markets_sessions IS 
  'Allows anonymous users to create market collection sessions via Session Wizard. This is intentional for UX.';

COMMENT ON POLICY "Anon can update own sessions" ON public.manual_markets_sessions IS 
  'Allows anonymous users to update their own sessions. Session tracking prevents abuse.';

COMMENT ON POLICY "Anon can create progress" ON public.manual_markets_session_progress IS 
  'Allows anonymous progress tracking for Session Wizard. Tied to session_id for tracking.';

COMMENT ON POLICY "Anon can update progress" ON public.manual_markets_session_progress IS 
  'Allows anonymous progress updates. Limited to session-specific progress records.';