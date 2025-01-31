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

const driverSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  middleName: Yup.string().required("Middle name is required."),
  gender: Yup.string().required("Gender is required."),
  phoneNumber: Yup.string().required("Phone number is required.").matches(/^\d{9}$/, {
    message: 'Invalid phone number.',
  }),
  type: Yup.string().required("Type is required."),
  drivingLicense: Yup.mixed().required("Driving license is required."),
  profilePhoto: Yup.mixed().required("Profile photo is required."),
});

const approvalSchema = Yup.object().shape({
  approvalStatus: Yup.string().required("Approval status is required."),
});

interface IModalDriverTypeFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  driverData: any;
  onOpenChange: () => void;
}

const ModalDriverTypeForm = ({
  open,
  onOpenChange,
  isEdit,
  isApproved,
  driverData,
}: IModalDriverTypeFormProps) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isApproved ? approveDriver : isEdit ? editDriver : addDriver,
    onSuccess: () => {
      toast.success(
        `Driver ${isApproved ? "Approved" : isEdit ? "Edited" : "Created"}`
      );
      queryClient.invalidateQueries({ queryKey: ["Drivers"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  async function approveDriver(values: Object) {
    try {
      const { id, approvalStatus } = values as {
        id: string;
        approvalStatus: string;
      };
      const updatedFields = {
        status: approvalStatus,
      };

      const res = await axiosInstance.patch(
        `/api/v1/drivers/toggleStatus/${driverData.id}`,
        updatedFields
      );
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while approving the driver.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const initialValues = isEdit
    ? driverData
    : {
        firstName: "",
        lastName: "",
        middleName: "",
        gender: "",
        phoneNumber: "",
        type: "",
        drivingLicense: "",
        profilePhoto: null,
        approvalStatus: "inactive",
      };

  async function addDriver(values: any) {
    try {
      const formData = new FormData();
      formData.append("file", values.profilePhoto);
      const res_1 = await axiosInstance.post(
        `/api/v1/file-upload/image/profile`,
        formData
      );
      
      const driverLicenseData = new FormData();
      driverLicenseData.append("file", values.drivingLicense);
      const res_2 = await axiosInstance.post(
        `/api/v1/file-upload/image/license`,
        driverLicenseData
      );

      if (res_1.status === 201 && res_2.status === 201) {
        const profile = res_1.data.data.filename;
        const license = res_2.data.data.filename;
        let { profilePhoto,drivingLicense, ...rest } = values;
        rest = { ...rest, profilePhoto: profile, drivingLicense: license};
        console.log(rest, "result to be sent");
        const res = await axiosInstance.post(`/api/v1/drivers`, rest);
        return res.data;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the driving.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editDriver(values: any) {
    try {
      const {
        id,
        firstName,
        lastName,
        middleName,
        gender,
        type,
        phoneNumber,
        drivingLicense,
        profilePhoto,
      } = values;
      let updatedValues: any = {
        firstName,
        lastName,
        middleName,
        gender,
        type,
        drivingLicense,
      };

      const formData = new FormData();
      if (profilePhoto instanceof File) {
        console.log("hi");
        formData.append("file", profilePhoto);

        const res_1 = await axiosInstance.post(
          `/api/v1/file-upload/image/profile`,
          formData
        );
        console.log("Profile edited!");
        if (res_1.status === 201) {
          const profile = res_1.data.data.filename;
          updatedValues = { ...updatedValues, profilePhoto: profile };
          // console.log(updatedValues, "result to be sent");
        }
      }
      try {
        const res = await axiosInstance.patch(
          `/api/v1/drivers/${id}`,
          updatedValues
        );
        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the driver.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while editing the driver.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: isApproved ? approvalSchema : driverSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      console.log(values, "initial values ");
      try {
        if (!isApproved) {
          const formData = new FormData();
          if (values.profilePhoto) {
            formData.append("profilePhoto", values.profilePhoto);
          }
          let { approvalStatus, ...updatedValues } = values;
          updatedValues = { ...updatedValues, firebaseToken: "testToken" };
          mutate(updatedValues);
        } else {
          console.log(values, "the values status");
          mutate(values);
        }
      } catch {
        toast("There was an error! Try again");
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(driverData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, driverData]);

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
                Approve Driver
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
                      defaultValue="inactive"
                    >
                      <option value="inactive">inactive</option>
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
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
                {isEdit ? "Edit" : "Create"} a Driver
              </h3>
              <form
                className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">First Name</label>
                  {formik.touched.firstName && formik.errors.firstName ? (
                    <div className="text-red-500 text-sm">
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
                  <label className="form-label text-gray-900">
                    Middle Name
                  </label>
                  {formik.touched.middleName && formik.errors.middleName ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.middleName === "string"
                        ? formik.errors.middleName
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter middle name"
                      autoComplete="off"
                      {...formik.getFieldProps("middleName")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Last Name</label>
                  {formik.touched.lastName && formik.errors.lastName ? (
                    <div className="text-red-500 text-sm">
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

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Gender</label>
                  {formik.touched.gender && formik.errors.gender ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.gender === "string"
                        ? formik.errors.gender
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <select
                      disabled={isEdit}
                      {...formik.getFieldProps("gender")}
                      className="form-control form-select w-full outline-none bg-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Phone Number
                  </label>
                  {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.phoneNumber === "string" ? formik.errors.phoneNumber : null}
                    </div>
                  ) : null}

                  {/* A row containing the dropdown (left) and input (right) */}
                  <div className="flex items-center gap-2">
                    {/* Country code dropdown */}
                    <select
                      className="border border-gray-300 rounded px-2 py-2 text-gray-900"
                      disabled={isEdit}
                      defaultValue="+251" // If you want to default to +251
                    >
                      <option value="+251">+251</option>
                    </select>

                    <label className="input flex-1">
                      <input
                        placeholder="Enter phone number"
                        autoComplete="off"
                        disabled={isEdit}
                        {...formik.getFieldProps("phoneNumber")}
                      />
                    </label>
                  </div>
                </div>

                {/* <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Phone Number
                  </label>
                  {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.phoneNumber === "string"
                        ? formik.errors.phoneNumber
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter phone number"
                      autoComplete="off"
                      disabled={isEdit}
                      {...formik.getFieldProps("phoneNumber")}
                    />
                  </label>
                </div> */}

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Type</label>
                  {formik.touched.type && formik.errors.type ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.type === "string"
                        ? formik.errors.type
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <select
                      {...formik.getFieldProps("type")}
                      className="form-control form-select w-full outline-none bg-transparent"
                    >
                      <option value="comission">Commission</option>
                      <option value="payroll">Payroll</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Driving License
                  </label>
                  {formik.touched.drivingLicense &&
                  formik.errors.drivingLicense ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.drivingLicense === "string"
                        ? formik.errors.drivingLicense
                        : null}
                    </div>
                  ) : null}
                  <label className="input max-w-[390px] overflow-hidden">
                    <input
                      type="file"
                      name="drivingLicense"
                      onChange={(event) => {
                        if (
                          event.currentTarget.files &&
                          event.currentTarget.files[0]
                        ) {
                          formik.setFieldValue(
                            "drivingLicense",
                            event.currentTarget.files[0]
                          )
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Profile Photo
                  </label>
                  {formik.touched.profilePhoto && formik.errors.profilePhoto ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.profilePhoto === "string"
                        ? formik.errors.profilePhoto
                        : null}
                    </div>
                  ) : null}
                  <label className="input  max-w-[390px] overflow-hidden">
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={(event) => {
                        if (
                          event.currentTarget.files &&
                          event.currentTarget.files[0]
                        ) {
                          formik.setFieldValue(
                            "profilePhoto",
                            event.currentTarget.files[0]
                          );
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary flex justify-center"
                >
                  {isEdit ? "Save Changes" : "Create Driver"}
                </button>
              </form>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalDriverTypeForm };
