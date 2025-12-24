export interface ISessionTherapist {
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
  firebaseToken: string;
  status: "active" | "inactive" | "pending" | "suspended";
  gender: "male" | "female" | "other";
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string;
  profile: string | null;
  bio: string | null;
  verified: boolean;
  hoursDedicatedPerWeek: number;
}

export interface ISessionClient {
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
  firebaseToken: string;
  status: "active" | "inactive" | "pending" | "suspended";
  gender: "male" | "female" | "other";
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string;
  profile: string | null;
  username: string;
  emergencyContact: string;
  isVisible: boolean;
  isInGroup: boolean;
}

export interface ISessionData {
  id: string;
  schedule: string;
  hasTherapistAttended: boolean;
  therapist: ISessionTherapist;
  client: ISessionClient;
  status?: "scheduled" | "completed" | "cancelled" | "in_progress";
  duration?: number;
  notes?: string;
  groupName?: string;
  group: [];
}

export interface ISessionResponse {
  data: ISessionData[];
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
