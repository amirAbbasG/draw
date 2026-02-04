export type Provider = "google" | "apple";

export interface RegisterParams {
  email: string;
  username: string;
  password: string;
  terms_accepted: boolean;
  first_name?: string;
  last_name?: string;
}

export interface LoginParams {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface OAuthResponse {
  auth_url: string
  state: string
  provider: string
  message: string
}
