import { User as Auth0UserModel } from "@auth0/auth0-spa-js";
import axios from "axios";

import { getData, setData } from "@/utils";
import { type AuthModel } from "./_models";
const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}_admin_auth`;

const getAuth = (): AuthModel | undefined => {
  //console.log("getting auth");
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY) as AuthModel | undefined;
    //console.log(auth, "getting auth auth");
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

      // If the error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const auth = getAuth();

        if (auth?.refreshToken) {
          try {
            // Attempt to refresh the token
            const { data } = await axiosInstance.post(
              "/api/v1/auth/refresh",
              {},
              {
                headers: {
                  Authorization: `Bearer ${auth.refreshToken}`,
                },
              }
            );

            // Update the auth with new access token
            const newAuth = { ...auth, accessToken: data.data.accessToken };
            setAuth(newAuth);

            // Update the authorization header
            axiosInstance.defaults.headers.Authorization = `Bearer ${data.data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

            // Retry the original request
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear auth and redirect to login
            removeAuth();
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available, clear auth and redirect to login
          removeAuth();
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

setupAxios(axiosInstance);

// Add a function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const auth = getAuth();
  return !!auth?.accessToken;
};

export default axiosInstance;
export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };
