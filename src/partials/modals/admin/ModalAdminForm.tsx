import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";

const adminSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{9}$/, "Phone number must be 9 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
      "Password must contain letters and numbers"
    ),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.string().required("Date of birth is required"),
});

interface IModalAdminFormProps {
  open: boolean;
  onOpenChange: () => void;
}

const ModalAdminForm = ({ open, onOpenChange }: IModalAdminFormProps) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: addAdmin,
    onSuccess: () => {
      toast.success("Admin created successfully");
      queryClient.invalidateQueries({ queryKey: ["Admins"] });
      onOpenChange();
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err.message;
      toast.error(errorMessage || "Failed to create admin");
    },
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "male",
    dob: "",
  };

  async function addAdmin(values: any) {
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: `251${values.phoneNumber}`, // Add country code
        password: values.password,
        gender: values.gender,
        dob: values.dob,
        firebaseToken: "hardcoded_firebase_token",
      };

      const res = await axiosInstance.post(`/api/v1/auth/signup/admin`, payload);
      return res.data;
    } catch (err: any) {
      console.error("Error creating admin:", err);
      throw err;
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: adminSchema,
    onSubmit: async (values) => {
      mutate(values);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-0">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            Create New Admin
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            className="flex flex-col gap-4 pt-4"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            {/* First Name */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                placeholder="Enter first name"
                autoComplete="off"
                className="input"
                {...formik.getFieldProps("firstName")}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-danger text-xs">
                  {formik.errors.firstName}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                placeholder="Enter last name"
                autoComplete="off"
                className="input"
                {...formik.getFieldProps("lastName")}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-danger text-xs">
                  {formik.errors.lastName}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                autoComplete="off"
                className="input"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-danger text-xs">{formik.errors.email}</div>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Phone Number <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="input w-20 flex items-center justify-center bg-gray-50">
                  +251
                </span>
                <input
                  type="text"
                  placeholder="912345678"
                  autoComplete="off"
                  className="input flex-1"
                  maxLength={9}
                  {...formik.getFieldProps("phoneNumber")}
                />
              </div>
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <div className="text-danger text-xs">
                  {formik.errors.phoneNumber}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                autoComplete="off"
                className="input"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-danger text-xs">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Gender <span className="text-danger">*</span>
              </label>
              <select
                className="form-select w-full"
                {...formik.getFieldProps("gender")}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <div className="text-danger text-xs">{formik.errors.gender}</div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Date of Birth <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="input"
                {...formik.getFieldProps("dob")}
              />
              {formik.touched.dob && formik.errors.dob && (
                <div className="text-danger text-xs">{formik.errors.dob}</div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 ">
              <button
                type="button"
                onClick={onOpenChange}
                className="btn btn-light flex-1 justify-between "
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalAdminForm };
