export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  invalidated_at: string | null;
  created_at: string;
}

export interface OTPChallenge {
  id: string;
  user_id: string;
  email: string;
  otp_hash: string;
  expires_at: string;
  used_at: string | null;
  attempt_count: number;
  superseded_at: string | null;
  created_at: string;
}