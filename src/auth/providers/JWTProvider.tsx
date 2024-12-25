/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState,
  useContext
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type UserModel } from '@/auth';

const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/dev/api/v1/auth/admin/login`;
export const VARIFY_ACCOUNT_URL = `${API_URL}/dev/api/v1/auth/admin/verify`;
export const REGISTER_URL = `${API_URL}/dev/api/v1/auth/admin/signup`;
export const FORGOT_PASSWORD_URL = `${API_URL}/dev/api/v1/auth/admin/forgotPassword`;
export const RESET_PASSWORD_URL = `${API_URL}/dev/reset-password`;
export const GET_USER_URL = `${API_URL}/dev/api/v1/admin/1`;

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<AuthModel>;
  varifyAccount: (email: string, otp: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  requestPasswordResetLink?: (email: string) => Promise<void>;
  register: (firstname: string, lastname: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  useEffect(() => {
    setLoading(false);
  }, []);

  const verify = async () => {
    if (auth) {
      try {
        const { data: user } = await getUser();
        setCurrentUser(user);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string): Promise<AuthModel> => {
    try {
      const { data } = await axios.post<{ data: AuthModel }>(LOGIN_URL, {
        email,
        password,
        "firebaseToken": '1234567890'
      });
      saveAuth(data.data);
      return data.data;
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const varifyAccount = async (email: string, otp: string) => {
    try {
      const { data: auth } = await axios.post<AuthModel>(VARIFY_ACCOUNT_URL, {
        "email": email,
        "otp": otp
      });
      saveAuth(auth);
    } catch (error) {
      throw new Error(`Error ${error}`);
    }
  };

  const register = async (firstname: string, lastname: string, email: string, password: string) =>{ 
    try {
      const { data: auth } = await axios.post(REGISTER_URL, 
        {
          "email": email,
          "password": password,
          "firstName": firstname,
          "lastName": lastname, 
          "middleName": "MiddleName",
          "gender": "male",
          "firebaseToken": "1234567890",
        }
      );
      // saveAuth(auth);
      // const { data: user } = await getUser();
      // setCurrentUser(user);
    } catch (error) {
      console.log("error catched")
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const forgotPassword = async (email: string) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      "email": email
    });
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
  };

  const getUser = async () => {
    return await axios.get<UserModel>(GET_USER_URL);
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        varifyAccount,
        register,
        forgotPassword,
        changePassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
