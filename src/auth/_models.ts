import { type TLanguageCode } from '@/i18n';

export interface AuthModel {
  id: number;
  createdAt: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  isEmailAuthenticated: boolean;
  type: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserModel {
  id: number;
  createdAt: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  isEmailAuthenticated: boolean;
  type: string;
}
