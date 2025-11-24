import { supabase } from './supabase';

// Generate a unique visitor ID (stored in localStorage)
const getVisitorId = (): string => {
  const key = 'mpp_visitor_id';
  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
};

// Generate a session ID (stored in sessionStorage)
const getSessionId = (): string => {
  const key = 'mpp_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Track page visit
export const trackPageVisit = async (page: string) => {
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const deviceType = getDeviceType();
    const referrer = document.referrer || 'direct';

    const { data, error } = await supabase
      .from('page_visits')
      .insert({
        page,
        visitor_id: visitorId,
        session_id: sessionId,
        device_type: deviceType,
        referrer,
        entry_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking page visit:', error);
      return null;
    }

    // Store the visit ID to update it later with exit time
    sessionStorage.setItem(`mpp_visit_${page}`, data.id);

    // Track entry time
    sessionStorage.setItem(`mpp_entry_${page}`, Date.now().toString());

    return data.id;
  } catch (error) {
    console.error('Error in trackPageVisit:', error);
    return null;
  }
};

// Update page visit with exit time
export const trackPageExit = async (page: string) => {
  try {
    const visitId = sessionStorage.getItem(`mpp_visit_${page}`);
    const entryTime = sessionStorage.getItem(`mpp_entry_${page}`);

    if (!visitId || !entryTime) return;

    const timeSpent = Math.round((Date.now() - parseInt(entryTime)) / 1000); // in seconds

    await supabase
      .from('page_visits')
      .update({
        exit_time: new Date().toISOString(),
        time_spent: timeSpent
      })
      .eq('id', visitId);

    // Clean up
    sessionStorage.removeItem(`mpp_visit_${page}`);
    sessionStorage.removeItem(`mpp_entry_${page}`);
  } catch (error) {
    console.error('Error in trackPageExit:', error);
  }
};

// Track click event
export const trackClick = async (page: string, clickType: string, clickTarget: string) => {
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    await supabase
      .from('page_clicks')
      .insert({
        page,
        visitor_id: visitorId,
        session_id: sessionId,
        click_type: clickType,
        click_target: clickTarget
      });
  } catch (error) {
    console.error('Error in trackClick:', error);
  }
};

// Initialize analytics for a page
export const initAnalytics = (page: string) => {
  // Track page visit on mount
  trackPageVisit(page);

  // Track page exit on unmount or beforeunload
  const handleExit = () => trackPageExit(page);

  window.addEventListener('beforeunload', handleExit);

  return () => {
    handleExit();
    window.removeEventListener('beforeunload', handleExit);
  };
};
