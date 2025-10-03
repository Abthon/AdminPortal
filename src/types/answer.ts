export interface IQuestion {
  id: string;
  updatedAt: string;
  createdAt: string;
  text: string;
  type: "single" | "multiple" | "open";
  order: number;
}

export interface ISingleOption {
  id: string;
  updatedAt: string;
  createdAt: string;
  text: string;
  order: number;
}

export interface IMultiOption {
  id: string;
  updatedAt: string;
  createdAt: string;
  text: string;
  order: number;
}

export interface IAnswerClient {
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

export interface IAnswerData {
  id: string;
  text: string | null;
  question: IQuestion;
  singleOption: ISingleOption | null;
  multiOption: IMultiOption[];
  client: IAnswerClient;
}

export interface IAnswerResponse {
  data: IAnswerData[];
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
