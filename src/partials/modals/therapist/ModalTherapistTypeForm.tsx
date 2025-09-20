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
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";
import clsx from "clsx";
import { KeenIcon } from "@/components";

// Validation schema for create mode (all fields required)
const createTherapistSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  email: Yup.string()
    .email()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required.")
    .matches(/^\d{9}$/, { message: "Invalid phone number." }),
  gender: Yup.string().required("Gender is required."),
  dob: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required."),
  firebaseToken: Yup.string().default("123456"),
  bio: Yup.string(),
});

// Validation schema for edit mode (all fields except password required)
const editTherapistSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  gender: Yup.string().required("Gender is required."),
  dob: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required."),
});

// Validation schema for approval mode
const approvalTherapistSchema = Yup.object().shape({
  approvalStatus: Yup.string().required("Approval status is required."),
});

interface IModalTherapistTypeFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  isDelete?: boolean;
  therapistData: any;
  onOpenChange: () => void;
}

const ModalTherapistTypeForm = ({
  open,
  onOpenChange,
  isEdit,
  isApproved,
  isDelete,
  therapistData,
}: IModalTherapistTypeFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isApproved
      ? approveTherapist
      : isEdit
        ? editTherapist
        : addTherapist,
    onSuccess: () => {
      console.log("Mutation called with:", { isEdit, isApproved });
      toast.success(
        `${isApproved ? "Therapist Approved" : isEdit ? "Therapist Edited" : "Therapist Created"}`
      );
      queryClient.invalidateQueries({ queryKey: ["Therapists"] });
      onOpenChange();
    },
    onError: (err: any) => {
      console.error("Mutation error:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    },
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  async function approveTherapist(values: Object) {
    console.log("Approve therapist values:", values, "is called!");
    try {
      const { approvalStatus } = values as {
        approvalStatus: string;
      };
      const updatedFields = {
        status: approvalStatus,
      };

      const res = await axiosInstance.patch(
        `/api/v1/therapist/toggleStatus/${therapistData.id}`,
        updatedFields
      );
      return res.data;
    } catch (err: any) {
      console.error("Approve therapist error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "An error occurred while approving the therapist.";
      throw new Error(errorMessage);
    }
  }

  async function deleteTherapist(id: any) {
    try {
      const res = await axiosInstance.delete(`/api/v1/therapist/${id}`);
      if (res.status !== 200) {
        throw new Error(res.data.message || "Failed to delete the therapist.");
      }
      toast.success(`Therapist Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Therapists"] });
      onOpenChange();
    } catch (err: any) {
      console.error("Delete therapist error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "An error occurred while deleting the therapist.";
      toast.error(errorMessage);
    }
  }

  async function addTherapist(values: any) {
    try {
      console.log("Adding therapist with values:", values);
      // Convert dob string to Date object if it exists
      const updatedValues = {
        ...values,
        dob: values.dob ? new Date(values.dob) : null,
      };
      
      const res = await axiosInstance.post(
        `/api/v1/auth/signup/therapist`,
        updatedValues
      );
      return res.data;
    } catch (err: any) {
      console.error("Add therapist error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "An error occurred while adding the therapist.";
      throw new Error(errorMessage);
    }
  }

  async function editTherapist(values: any) {
    try {
      const { id, firstName, lastName, gender, dob } =
        values;
      console.log("The values of the edit form are:", values);
      const updatedValues = {
        firstName,
        lastName,
        gender,
        dob: dob ? new Date(dob) : null, // Convert string to Date object
      };

      console.log("Sending patch request with values:", updatedValues);
      const res = await axiosInstance.patch(
        `/api/v1/therapist/${id}`,
        updatedValues
      );
      return res.data;
    } catch (err: any) {
      console.error("Edit therapist error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "An error occurred while editing the therapist.";
      throw new Error(errorMessage);
    }
  }

  const initialValues = isApproved
    ? { approvalStatus: therapistData?.status || "pending" }
    : isEdit
      ? {
          ...therapistData,
          gender: therapistData.gender || "",
          dob: therapistData.dob
            ? new Date(therapistData.dob).toISOString().split("T")[0]
            : "",
        } // Ensure all fields are present
      : {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          gender: "",
          dob: "",
        };

  console.log("Initial values:", initialValues);
  console.log("Is edit mode:", isEdit);
  console.log("Therapist data:", therapistData);

  const formik = useFormik({
    initialValues,
    validationSchema: isApproved
      ? approvalTherapistSchema
      : isEdit
        ? editTherapistSchema
        : createTherapistSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        console.log("Submitting form with values:", values);
        if (!isApproved) {
          let { approvalStatus, ...updatedValues } = values;
          updatedValues = { ...updatedValues, firebaseToken: "testToken" };
          mutate(updatedValues);
        } else {
          mutate(values);
        }
      } catch (err: any) {
        console.error("Form submission error:", err);
        toast.error("There was an error! Try again");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isApproved) {
        console.log("Setting form values for approval:", therapistData);
        formik.setValues({
          approvalStatus: therapistData?.status || "pending",
        });
      } else if (isEdit) {
        console.log("Setting form values for edit:", therapistData);
        console.log("Original dob:", therapistData.dob);
        const formattedDob = therapistData.dob
          ? new Date(therapistData.dob).toISOString().split("T")[0]
          : "";
        console.log("Formatted dob:", formattedDob);
        
        formik.setValues({
          ...therapistData,
          gender: therapistData.gender || "",
          dob: formattedDob,
        });
        
        // Clear any validation errors
        formik.setErrors({});
        formik.setTouched({});
      } else {
        formik.resetForm();
      }
    }
  }, [isEdit, isApproved, open, therapistData]);

  if (isDelete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px] w-full">
          <DialogHeader className="py-4 text-center">
            <DialogTitle className="text-lg font-semibold text-gray-900"></DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2 pt-6">
              This action cannot be undone. Do you really want to delete this
              therapist?
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-0 pt-2 pb-5 flex justify-center gap-4">
            <button
              onClick={() => {
                deleteTherapist(therapistData.id);
              }}
              className="btn btn-danger btn-md min-w-[100px] rounded-lg"
            >
              Yes, Delete
            </button>
            <button
              onClick={onOpenChange}
              className="btn btn-outline btn-md min-w-[100px] rounded-lg"
            >
              Cancel
            </button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isApproved ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
                Approve A Therapist
              </h3>
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Approval Status
                  </label>
                  <label className="input">
                    <select
                      {...formik.getFieldProps("approvalStatus")}
                      className="form-control form-select w-full outline-none bg-transparent"
                      value={formik.values.approvalStatus}
                    >
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </label>
                </div>
                <div className="flex justify-center mt-4">
                  <button type="submit" className="btn btn-primary">
                    Approve
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
                {isEdit ? "Edit" : "Create"} A Therapist
              </h3>
              <form
                className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">First Name</label>
                  {formik.touched.firstName && formik.errors.firstName ? (
                    <div className="text-red-500 text-xs">
                      {typeof formik.errors.firstName === "string"
                        ? formik.errors.firstName
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter first name"
                      autoComplete="off"
                      {...formik.getFieldProps("firstName")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Last Name</label>
                  {formik.touched.lastName && formik.errors.lastName ? (
                    <div className="text-red-500 text-xs">
                      {typeof formik.errors.lastName === "string"
                        ? formik.errors.lastName
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter last name"
                      autoComplete="off"
                      {...formik.getFieldProps("lastName")}
                    />
                  </label>
                </div>

                {!isEdit && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="form-label text-gray-900">Email</label>
                      {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500 text-xs">
                          {typeof formik.errors.email === "string"
                            ? formik.errors.email
                            : null}
                        </div>
                      ) : null}
                      <label className="input">
                        <input
                          placeholder="Enter your Email"
                          autoComplete="off"
                          {...formik.getFieldProps("email")}
                        />
                      </label>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="form-label text-gray-900">Password</label>
                      {formik.touched.password && formik.errors.password ? (
                        <div className="text-red-500 text-xs">
                          {typeof formik.errors.password === "string"
                            ? formik.errors.password
                            : null}
                        </div>
                      ) : null}
                      <label className="input">
                        <input
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          {...formik.getFieldProps("password")}
                        />
                        <button type="button" onClick={() => togglePassword()}>
                          <KeenIcon
                            icon="eye"
                            className={clsx(
                              "text-gray-500",
                              showPassword ? "hidden" : ""
                            )}
                          />
                          <KeenIcon
                            icon="eye-slash"
                            className={clsx(
                              "text-gray-500",
                              !showPassword ? "hidden" : ""
                            )}
                          />
                        </button>
                      </label>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="form-label text-gray-900">
                        Phone Number
                      </label>
                      {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                        <div className="text-red-500 text-xs">
                          {typeof formik.errors.phoneNumber === "string"
                            ? formik.errors.phoneNumber
                            : null}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <select
                          className="border border-gray-300 rounded px-2 py-2 text-gray-900"
                          disabled
                          defaultValue="+251"
                        >
                          <option value="+251">+251</option>
                        </select>
                        <label className="input flex-1">
                          <input
                            placeholder="Enter phone number"
                            autoComplete="off"
                            {...formik.getFieldProps("phoneNumber")}
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Gender</label>
                  <label className="input">
                    <select
                      {...formik.getFieldProps("gender")}
                      className="form-control form-select w-full outline-none"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  {formik.touched.gender && formik.errors.gender && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.gender === "string" &&
                        formik.errors.gender}
                    </span>
                  )}
                </div>


                <div className="flex flex-col gap-1">
                  <label htmlFor="dob" className="form-label text-gray-900">
                    Date of Birth
                  </label>
                  {formik.touched.dob && formik.errors.dob ? (
                    <div className="text-red-500 text-xs">
                      {typeof formik.errors.dob === "string"
                        ? formik.errors.dob
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      type="date"
                      id="dob"
                      {...formik.getFieldProps("dob")}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary flex justify-center"
                  disabled={formik.isSubmitting}
                >
                  {isEdit ? "Save Changes" : "Create Therapist"}
                </button>
              </form>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalTherapistTypeForm };
