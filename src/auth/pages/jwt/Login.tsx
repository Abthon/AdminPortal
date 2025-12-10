import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { KeenIcon } from "@/components";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_APP_API_URL;

const Login = () => {
  const location = useLocation();
  const varificationMessage = location.state?.message;
  const [inactiveMessage, setInactiveMessage] = useState(false);

  useEffect(() => {
    if (varificationMessage) {
      toast(`Info`, {
        description: varificationMessage,
        action: {
          label: "Ok",
          onClick: () => console.log("Ok"),
        },
      });
    }
  }, []);

  return (
    <div className="card max-w-[390px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Sign in
          </h3>
          <p className="text-sm text-gray-600">Sign in with your Google account</p>
        </div>

        {inactiveMessage && (
          <div className="alert alert-warning">
            <div className="flex items-center gap-2">
              <KeenIcon icon="information-2" className="text-warning text-xl" />
              <div>
                <h4 className="font-semibold">Account Pending Activation</h4>
                <p className="text-sm">
                  Your account is currently inactive. Please wait for a super admin to activate your account before you can log in.
                </p>
              </div>
            </div>
          </div>
        )}

        <form method="POST" action={`${API_URL}/dev/api/v1/auth/google/admin?client=web`}>
          <input type="hidden" name="firebaseToken" value="abc123" required />
          <button
            type="submit"
            className="btn btn-primary flex justify-center gap-2 w-full"
          >
            <KeenIcon icon="google" className="text-lg" />
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export { Login };
