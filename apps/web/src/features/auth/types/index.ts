export interface AuthUser {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginResult =
  | { twoFactorRequired: true; twoFactorToken: string }
  | { twoFactorRequired: false; user: AuthUser };

export interface TwoFactorSetupResult {
  secret: string;
  qrCodeDataUrl: string;
}
