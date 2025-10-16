export interface ITherapistRating {
  id: string;
  updatedAt: string;
  createdAt: string;
  value: number;
  comment: string;
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
}
