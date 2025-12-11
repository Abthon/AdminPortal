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
  const [isDecodingRole, setIsDecodingRole] = useState(true);

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
        console.log(decoded, decoded.role, "Whatttt");
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
      console.log(decoded.role, "user role");
      setIsDecodingRole(false);
    } else {
      setIsDecodingRole(false);
    }
  }, [auth?.accessToken]);

  if (loading || isDecodingRole) {
    return <ScreenLoader />;
  }

  // Check if user status is inactive
  if (userStatus === "inactive") {
    console.log("Yayyyy");
    return <Navigate to="/auth/login" state={{ from: location, message: "Your account is inactive. Please wait for admin activation." }} replace />;
  }

  console.log(allowedRoles.includes(userRole), allowedRoles, "My user role");
  if (!allowedRoles.includes(userRole)) {
    console.log(allowedRoles, userRole, "ke wusttt");
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
