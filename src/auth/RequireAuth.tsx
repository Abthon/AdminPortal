import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ScreenLoader } from "@/components/loaders";
import { useAuthContext } from "./useAuthContext";
import { useState, useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const RequireAuth = ({allowedRoles, children}: ProtectedRouteProps) => {
  const { auth, loading, getUserType } = useAuthContext();
  const location = useLocation();
  const [ userType, setUserType ] = useState(decodeJWT(auth?.accessToken || ""))

  function decodeJWT(token: string) {
    if(token !== ""){
      const base64Url = token.split(".")[1]; // Get payload part of the JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );

      return JSON.parse(jsonPayload).type;
    }
  }

  useEffect(()=> {
    console.log(getUserType(auth?.accessToken || ""), "user type");
  }, [])

  if (loading) {
    return <ScreenLoader />;
  }

  if(!allowedRoles.includes(userType)){
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return auth ? (
    children ? children : <Outlet />
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export { RequireAuth };
