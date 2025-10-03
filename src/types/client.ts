export interface IClientRating {
  id: string;
  updatedAt: string;
  createdAt: string;
  value: number;
  comment: string;
}

export interface IClientDetailData {
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
  rating?: IClientRating[];
}

export interface IClientDetailResponse {
  data: IClientDetailData;
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}
