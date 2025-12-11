import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ScreenLoader } from "@/components/loaders";
import { useAuthContext } from "./useAuthContext";
import { useState, useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const RequireAuth = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { auth, loading, getUserType } = useAuthContext();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");
  const [userStatus, setUserStatus] = useState("");

  function decodeJWT(token: string) {
    if (token !== "") {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join("")
        );

        const decoded = JSON.parse(jsonPayload);
        return { role: decoded.role, status: decoded.status };
      } catch (error) {
        console.error("Error decoding JWT:", error);
        return { role: "", status: "" };
      }
    }
    return { type: "", status: "" };
  }

  useEffect(() => {
    if (auth?.accessToken) {
      const decoded = decodeJWT(auth.accessToken);
      setUserRole(decoded.role);
      setUserStatus(decoded.status);
      console.log(getUserType(auth.accessToken), "user type");
    }
  }, [auth?.accessToken]);

  if (loading) {
    return <ScreenLoader />;
  }

  // Check if user status is inactive
  if (userStatus === "inactive") {
    return <Navigate to="/auth/login" state={{ from: location, message: "Your account is inactive. Please wait for admin activation." }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
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
