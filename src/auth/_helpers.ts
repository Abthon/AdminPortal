import { User as Auth0UserModel } from "@auth0/auth0-spa-js";
import axios from "axios";

import { getData, setData } from "@/utils";
import { type AuthModel } from "./_models";

const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}_auth`;

const getAuth = (): AuthModel | undefined => {
  console.log("getting auth");
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY) as AuthModel | undefined;
    console.log(auth, "getting auth auth");
    if (auth) {
      return auth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};

const setAuth = (auth: AuthModel | Auth0UserModel) => {
  setData(AUTH_LOCAL_STORAGE_KEY, auth);
};

const removeAuth = () => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
  }
};

export function setupAxios(axiosInstance: any) {
  axiosInstance.defaults.headers.Accept = "application/json";
  axiosInstance.interceptors.request.use(
    (config: { headers: { Authorization: string } }) => {
      const auth = getAuth();

      if (auth?.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
      }

      return config;
    },
    async (err: any) => await Promise.reject(err)
  );

  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;
      if (
        (error.response && error.response.status === 401) ||
        (error.response.status === 403 && !originalRequest._retry)
      ) {
        originalRequest._retry = true;
        const auth = getAuth();
        console.log(auth?.refreshToken, "the refresh token");
        if (auth?.refreshToken) {
          try {
            const { data } = await axios.post(
              "https://static.129.134.201.195.clients.your-server.de/prod/api/v1/auth/refresh",
              {
                firebaseToken: "1234",
              },
              {
                headers: {
                  Authorization: `Bearer ${auth?.refreshToken}`,
                },
              }
            );
            const newAuth = { ...auth, accessToken: data.data.accessToken };
            // console.log(newAuth, "access");
            setAuth(newAuth);
            axiosInstance.defaults.headers.Authorization = `Bearer ${data.data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            // return axiosInstance(originalRequest);
          } catch (refreshError) {
            // console.log(refreshError, "refresh error");
            // removeAuth();
            // window.location.href = "/auth/login"; // Redirect to login page
          }
        } else {
          removeAuth();
          window.location.href = "/auth/login"; // Redirect to login page
        }
      }
      return Promise.reject(error);
    }
  );
}

const axiosInstance = axios.create({
  baseURL: "https://static.129.134.201.195.clients.your-server.de/prod",
  // baseURL: 'https://static.129.134.201.195.clients.your-server.de/dev'
  // baseURL: 'http://195.201.134.129/prod', // This is the base URL
});

setupAxios(axiosInstance);
export default axiosInstance;
export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };
