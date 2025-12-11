import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthContext } from "@/auth";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const varificationMessage = location.state?.message;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (varificationMessage) {
      const timer = setTimeout(() => {
        toast.info(varificationMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [varificationMessage]);

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        await login(values.email, values.password);
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } catch (error: any) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Login failed. Please check your credentials.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="card max-w-[390px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Sign in
          </h3>
          <p className="text-sm text-gray-600">Enter your email and password to login</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              {...formik.getFieldProps("email")}
              className={`input ${
                formik.touched.email && formik.errors.email ? "input-error" : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-danger text-xs">{formik.errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...formik.getFieldProps("password")}
                className={`input ${
                  formik.touched.password && formik.errors.password ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-sm btn-icon btn-clear absolute right-0 top-1/2 -translate-y-1/2"
              >
                <KeenIcon icon={showPassword ? "eye-slash" : "eye"} />
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <span className="text-danger text-xs">{formik.errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={loading || formik.isSubmitting}
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export { Login };
