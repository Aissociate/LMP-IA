export interface User {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  created_at: string;
}

export interface Market {
  id: string;
  title: string;
  reference: string;
  client: string;
  deadline: string;
  budget: number;
  status: 'en_cours' | 'soumis' | 'gagne' | 'perdu';
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  global_memory_prompt?: string;
  market_url?: string;
}

export interface BPU {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  user_id: string;
  created_at: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  category?: string;
  user_id: string;
  created_at: string;
  extracted_content?: string;
  extraction_status?: 'pending' | 'processing' | 'completed' | 'error';
  extraction_error?: string;
  updated_at?: string;
}

export interface MarketStats {
  total: number;
  en_cours: number;
  soumis: number;
  gagne: number;
  perdu: number;
  budget_total: number;
}

export interface MarketDocument {
  id: string;
  market_id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis_result?: string;
  user_id: string;
  created_at: string;
}

export interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPrompt {
  id: string;
  prompt_type: 'document_analysis';
  section_key?: string;
  prompt_content: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureComment {
  id: string;
  feature_request_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user_name: string;
}

export interface ReportAsset {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type?: string;
  ai_description?: string;
  created_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_free: boolean;
  credit_cost: number;
  is_active: boolean;
  created_at: string;
}

export interface ModelCredit {
  id: string;
  user_id: string;
  credits_remaining: number;
  credits_used: number;
  package_type: string;
  purchased_at: string;
  expires_at?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_unlimited: boolean;
  is_active: boolean;
}