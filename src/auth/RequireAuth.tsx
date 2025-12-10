import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ScreenLoader } from "@/components/loaders";
import { useAuthContext } from "./useAuthContext";
import { useState, useEffect, ReactNode } from "react";
import { setAuth, getAuth } from "./_helpers";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const RequireAuth = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { auth, loading, getUserType } = useAuthContext();
  const location = useLocation();
  const [userRole, setUserRole] = useState(decodeJWT(auth?.accessToken || ""));
  const [userStatus, setUserStatus] = useState("");

  // Helper function to get cookie value by name
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  function decodeJWT(token: string) {
    if (token !== "") {
      const base64Url = token.split(".")[1]; // Get payload part of the JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      return { role: decoded.role, status: decoded.status };
    }
  }

  useEffect(() => {
    // Check if tokens exist in cookies but not in localStorage
    const storedAuth = getAuth();
    if (!storedAuth) {
      const accessToken = getCookie('accessToken');
      const refreshToken = getCookie('refreshToken');

      if (accessToken && refreshToken) {
        
        // Decode and set user type and status
        const decoded = decodeJWT(accessToken);
        setUserRole(decoded?.role);

        if(decoded?.status == "active"){
          setAuth({ accessToken, refreshToken });
        }

        setUserRole(decoded?.role);
      }
    }

    console.log(getUserType(auth?.accessToken || ""), "user type");
  }, []);

  if (loading) {
    return <ScreenLoader />;
  }

  // Check if user status is inactive
  if (userStatus === "inactive") {
    return <Navigate to="/auth/login" state={{ from: location, message: "Your account is inactive. Please wait for admin activation." }} replace />;
  }

  if (!allowedRoles.includes(userRole?.role)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return auth ? (
    children ? (
      children
    ) : (
      <Outlet />
    )
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export { RequireAuth };
