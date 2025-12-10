import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth } from "@/auth/_helpers";
import { toast } from "sonner";
import { ScreenLoader } from "@/components";

const GoogleCallback = () => {
  const navigate = useNavigate();

//  useEffect(() => {
//    // The backend returns JSON with the auth data
//    // We need to extract it from the current page
//    const extractAuthData = () => {
//      try {
//        // Get the entire page text content
//        const pageText = document.body.innerText || document.body.textContent || "";
        
//        // Try to parse the JSON response
//        // The backend returns: {"data":{"user":{...},"accessToken":"...","refreshToken":"..."},...}
//        const jsonMatch = pageText.match(/\{[\s\S]*\}/);
//        if (!jsonMatch) {
//          throw new Error("No JSON data found");
//        }

//        const response = JSON.parse(jsonMatch[0]);
        
//        // Extract tokens from the response
//        // They can be at response.data.accessToken or response.data.data.accessToken
//        let accessToken = response.data?.accessToken || response.data?.data?.accessToken;
//        let refreshToken = response.data?.refreshToken || response.data?.data?.refreshToken;

//        if (!accessToken || !refreshToken) {
//          console.error("Response structure:", response);
//          throw new Error("Missing tokens in response");
//        }

//        // Decode the access token to check status
//        const base64Url = accessToken.split('.')[1];
//        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//        const jsonPayload = decodeURIComponent(
//          atob(base64)
//            .split('')
//            .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
//            .join('')
//        );
//        const decoded = JSON.parse(jsonPayload);

//        console.log("Decoded token:", decoded);

//        // Check if admin status is inactive
//        if (decoded.status === 'inactive') {
//          navigate('/auth/login', { 
//            state: { 
//              message: "Your account is currently inactive. Please wait for a super admin to activate your account before you can log in." 
//            },
//            replace: true 
//          });
//          return;
//        }

//        // Store tokens in localStorage
//        setAuth({ accessToken, refreshToken });

//        // Navigate to dashboard
//        toast.success(`Welcome back, ${decoded.name}!`);
//        navigate('/', { replace: true });
//      } catch (error) {
//        console.error('Callback error:', error);
//        toast.error("Login failed. Please try again.");
//        navigate('/auth/login', { replace: true });
//      }
//    };

//    // Small delay to ensure page is fully loaded
//    setTimeout(extractAuthData, 500);
//  }, [navigate]);

//  return <ScreenLoader />;
return <h1>Hello World</h1>
};

export { GoogleCallback };
