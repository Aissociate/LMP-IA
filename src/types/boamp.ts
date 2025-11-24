export interface BOAMPSearchParams {
  query?: string;
  reference?: string;
  keywords?: string;
  searchInDCE?: boolean;
  location?: string[];
  serviceTypes?: string[];
  publicBuyer?: string;
  cpvCode?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  publicationDateFrom?: string;
  publicationDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  procedureType?: string;
  contractForm?: string;
  page?: number;
  limit?: number;
  sortBy?: 'publication_date' | 'deadline' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface BOAMPMarket {
  id: string;
  reference: string;
  title: string;
  client: string;
  description: string;
  deadline: string;
  amount?: number;
  location: string;
  publicationDate: string;
  procedureType: string;
  serviceType: string;
  cpvCode?: string;
  url: string;
  dceUrl?: string;
  rawData?: any;
}

export interface BOAMPFavorite {
  id: string;
  user_id: string;
  boamp_reference: string;
  title: string;
  client: string;
  description?: string;
  deadline?: string;
  amount?: number;
  location?: string;
  publication_date?: string;
  procedure_type?: string;
  service_type?: string;
  cpv_code?: string;
  url?: string;
  raw_data?: any;
  is_imported_to_markets: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  search_params: BOAMPSearchParams;
  created_at: string;
  updated_at: string;
}

export interface SearchAlert {
  id: string;
  user_id: string;
  saved_search_id?: string;
  name: string;
  search_params: BOAMPSearchParams;
  frequency: 'realtime' | 'daily' | 'weekly';
  is_active: boolean;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BOAMPSearchResult {
  markets: BOAMPMarket[];
  total: number;
  page: number;
  totalPages: number;
}

export type ScoreCategory = 'go' | 'conditional' | 'no_go';
export type AIRecommendation = 'respond' | 'ignore' | 'request_expert' | 'order_memory';

export interface MarketRelevanceScore {
  id: string;
  user_id: string;
  market_id: string;
  alert_id?: string;

  market_title: string;
  market_reference?: string;
  market_description?: string;
  market_amount?: number;
  market_location?: string;
  market_deadline?: string;
  market_url?: string;

  relevance_score: number;
  score_category: ScoreCategory;

  ai_recommendation: AIRecommendation;
  ai_reasoning?: string;
  key_strengths: string[];
  key_risks: string[];

  analyzed_at: string;
  is_read: boolean;
  is_archived: boolean;
  user_action?: string;
  action_taken_at?: string;

  created_at: string;
  updated_at: string;
}

export interface MarketSentinelStats {
  total_markets: number;
  go_count: number;
  conditional_count: number;
  no_go_count: number;
  markets_responded: number;
  markets_ignored: number;
  expert_requested: number;
  memory_ordered: number;
  avg_score: number;
}
