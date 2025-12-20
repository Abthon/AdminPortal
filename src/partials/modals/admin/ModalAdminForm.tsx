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
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";

const createAdminSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[97][0-9]{8}$/, "Phone number must start with 9 or 7 and be exactly 9 digits")
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

const editAdminSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[97][0-9]{8}$/, "Phone number must start with 9 or 7 and be exactly 9 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
      "Password must contain letters and numbers"
    ),
});

interface IAdminData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface IModalAdminFormProps {
  open: boolean;
  onOpenChange: () => void;
  adminData?: IAdminData | null;
}

const ModalAdminForm = ({ open, onOpenChange, adminData }: IModalAdminFormProps) => {
  const isEditMode = !!adminData;
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: isEditMode ? updateAdmin : addAdmin,
    onSuccess: () => {
      toast.success(isEditMode ? "Admin updated successfully" : "Admin created successfully");
      queryClient.invalidateQueries({ queryKey: ["Admins"] });
      onOpenChange();
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err.message;
      toast.error(errorMessage || (isEditMode ? "Failed to update admin" : "Failed to create admin"));
    },
  });

  const getInitialValues = () => {
    if (isEditMode && adminData) {
      return {
        firstName: adminData.firstName || "",
        lastName: adminData.lastName || "",
        email: adminData.email || "",
        phoneNumber: adminData.phoneNumber?.replace(/^251/, "") || "",
        password: "",
      };
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      gender: "male",
      dob: "",
    };
  };

  async function addAdmin(values: any) {
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
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

  async function updateAdmin(values: any) {
    try {
      const payload: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: `${values.phoneNumber}`,
      };

      if (values.password) {
        payload.password = values.password;
      }

      const res = await axiosInstance.patch(`/api/v1/admin/${adminData?.id}`, payload);
      return res.data;
    } catch (err: any) {
      console.error("Error updating admin:", err);
      throw err;
    }
  }

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: isEditMode ? editAdminSchema : createAdminSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      mutate(values);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
      setShowPassword(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-0">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            {isEditMode ? "Edit Admin" : "Create New Admin"}
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
              <input
                type="text"
                placeholder="912345678"
                autoComplete="off"
                className="input"
                maxLength={9}
                {...formik.getFieldProps("phoneNumber")}
              />
              <p className="text-xs text-gray-500">Must start with 9 or 7 and be 9 digits</p>
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <div className="text-danger text-xs">
                  {formik.errors.phoneNumber}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Password {!isEditMode && <span className="text-danger">*</span>}
                {isEditMode && <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                  autoComplete="off"
                  className="input pr-10"
                  {...formik.getFieldProps("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <KeenIcon icon={showPassword ? "eye-slash" : "eye"} className="text-lg" />
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-danger text-xs">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Gender - Only for Create Mode */}
            {!isEditMode && (
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
            )}

            {/* Date of Birth - Only for Create Mode */}
            {!isEditMode && (
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
            )}

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
                {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Admin" : "Create Admin")}
              </button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalAdminForm };
