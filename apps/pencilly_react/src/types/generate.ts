export interface GenerateResponse<T> {
  id: string;
  kind: string;
  status: string;
  result: T;
  error: any;
}

export interface AiResult {
  model: string;
  usage: Usage;
  billing: Billing;
}

export interface Usage {
  cost: number;
  latency: number;
  timestamp: string;
  tokens_total: number;
  request_count: number;
  tokens_prompt: number;
  cost_breakdown: CostBreakdown;
  reasoning_tokens: number;
  web_search_count: number;
  cache_read_tokens: number;
  tokens_completion: number;
  cache_write_tokens: number;
}

export interface CostBreakdown {
  request: number;
  reasoning: number;
  cache_read: number;
  web_search: number;
  cache_write: number;
  input_tokens: number;
  output_tokens: number;
}

export interface Billing {
  cost_usd: number;
  conversion_rate: number;
  credits_deducted: number;
}
