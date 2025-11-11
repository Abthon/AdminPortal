export interface ITherapistRating {
  id: string;
  updatedAt: string;
  createdAt: string;
  value: number;
  comment: string;
}

export interface IExpertiseData {
  id: string;
  updatedAt: string;
  createdAt: string;
  expertise: string;
}

export interface ITherapistBankData {
  id: string;
  updatedAt: string;
  createdAt: string;
  accountNumber: string;
  branch: string;
}

export interface ITherapistDetailData {
  id: string;
  updatedAt: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: number;
  group: ITherapistsData[];
  hoursDedicatedPerWeek: number;
  phoneNumber: string;
  isEmailAuthenticated: boolean;
  isPhoneNumberAuthenticated: boolean;
  firebaseToken: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  gender: "male" | "female" | "other";
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string | null;
  profile: string | null;
  username: string;
  emergencyContact: string | null;
  isVisible: boolean;
  isInGroup: boolean;
  rating?: ITherapistRating[];
  bio?: string | null;
  expertise?: IExpertiseData[];
  therapistBank?: ITherapistBankData[];
}

export interface ITherapistDetailResponse {
  data: ITherapistDetailData;
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}

export interface IModalData {
  id: string;
  name: string;
  order: number;
  description: string;
  updatedAt: string;
  createdAt: string;
}

export interface ILevelData {
  id: string;
  type: "associate" | "moderate" | "advanced";
  minXP: number;
  maxXP: number | null;
  price: number;
  updatedAt: string;
  createdAt: string;
}

export interface ILicenseData {
  id: string;
  license_number?: string;
  region?: string;
  expiration_date?: string;
  verified: boolean;
  filename?: string;
  degree_certificate?: string;
  government_id?: string;
  professional_license?: string;
  work_experience?: string;
  special_training?: string;
  modal?: IModalData;
  updatedAt: string;
  createdAt: string;
}

export interface ITherapistsData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profile: string;
  license?: ILicenseData[];
  level?: ILevelData;
}

export interface IMatchClientData {
  id: string;
  updatedAt: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: number;
  phoneNumber: string;
  isEmailAuthenticated: boolean;
  isPhoneNumberAuthenticated: boolean;
  firebaseToken: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  gender: "male" | "female" | "other";
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string | null;
  profile: string | null;
  username: string;
  emergencyContact: string | null;
  isVisible: boolean;
  isInGroup: boolean;
}

export interface IMatchData {
  id: string;
  client: IMatchClientData;
  accepted: ITherapistDetailData;
}

export interface IMatchResponse {
  data: IMatchData[];
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
