export interface IModal {
  id: string;
  updatedAt: string;
  createdAt: string;
  name: string;
  order: number;
  code: string | null;
  description: string;
}

export interface ILevel {
  id: string;
  updatedAt: string;
  createdAt: string;
  type: string;
  minXP: number;
  maxXP: number | null;
  price: number;
}

export interface ITherapyType {
  id: string;
  updatedAt: string;
  createdAt: string;
  name: string;
  order: number;
  description: string;
}

export interface IAdminSubscription {
  id: string;
  updatedAt: string;
  createdAt: string;
  type: number; // 0=trial, 1=monthly, 3=quarterly, 6=semi-annual, 12=yearly
  old_price: number | null;
  price: number;
  is_admin_created: boolean;
  modal: IModal;
  level: ILevel | null;
}

export interface ISubscriptionUpdatePayload {
  type: number;
  old_price?: number;
  price: number;
  modal: string; // ID
  level?: string; // ID - optional since some subscriptions might not have a level
}

export interface ISubscriptionResponse {
  data: IAdminSubscription[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}

export interface ILevelResponse {
  data: ILevel[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}

export interface IModalResponse {
  data: IModal[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}

export interface ITherapyTypeResponse {
  data: ITherapyType[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}

// Type mapping for display
export const SUBSCRIPTION_TYPES = {
  0: 'Trial',
  1: 'Monthly', 
  3: 'Quarterly',
  6: 'Semi-Annual',
  12: 'Yearly'
} as const;

export type SubscriptionTypeKey = keyof typeof SUBSCRIPTION_TYPES;
