declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

export const trackFacebookEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

export const trackFacebookCustomEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, data);
  }
};

export const FacebookPixelEvents = {
  ViewContent: (contentName: string, contentCategory?: string) => {
    trackFacebookEvent('ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
    });
  },

  Lead: (data?: { content_name?: string; value?: number; currency?: string }) => {
    trackFacebookEvent('Lead', data);
  },

  CompleteRegistration: (data?: { content_name?: string; status?: string }) => {
    trackFacebookEvent('CompleteRegistration', data);
  },

  InitiateCheckout: (data?: { content_name?: string; value?: number; currency?: string }) => {
    trackFacebookEvent('InitiateCheckout', data);
  },

  Purchase: (value: number, currency: string = 'EUR', data?: Record<string, any>) => {
    trackFacebookEvent('Purchase', {
      value,
      currency,
      ...data,
    });
  },

  AddToCart: (contentName: string, value?: number, currency: string = 'EUR') => {
    trackFacebookEvent('AddToCart', {
      content_name: contentName,
      value,
      currency,
    });
  },

  Search: (searchString: string) => {
    trackFacebookEvent('Search', {
      search_string: searchString,
    });
  },

  Contact: (contactMethod?: string) => {
    trackFacebookEvent('Contact', {
      contact_method: contactMethod,
    });
  },

  SubmitApplication: (applicationName: string, data?: Record<string, any>) => {
    trackFacebookCustomEvent('SubmitApplication', {
      application_name: applicationName,
      ...data,
    });
  },

  GenerateLead: (leadType: string, data?: Record<string, any>) => {
    trackFacebookCustomEvent('GenerateLead', {
      lead_type: leadType,
      ...data,
    });
  },

  StartTrial: (trialType: string) => {
    trackFacebookCustomEvent('StartTrial', {
      trial_type: trialType,
    });
  },

  ViewPricing: () => {
    trackFacebookCustomEvent('ViewPricing');
  },

  RequestDemo: (pageUrl?: string) => {
    trackFacebookCustomEvent('RequestDemo', {
      page_url: pageUrl || window.location.href,
    });
  },

  GenerateMemoire: (marketType?: string) => {
    trackFacebookCustomEvent('GenerateMemoire', {
      market_type: marketType,
    });
  },

  SearchMarket: (searchTerm?: string) => {
    trackFacebookCustomEvent('SearchMarket', {
      search_term: searchTerm,
    });
  },
};
