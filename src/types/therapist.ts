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
