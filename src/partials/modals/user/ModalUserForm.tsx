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

const userSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required."),
  middleName: Yup.string().required("Middle Name is required."),
  lastName: Yup.string().required("Last Name is required."),
  phoneNumber: Yup.string().required("Phone Number is required."),
  gender: Yup.string().required("gender is required."),
  type: Yup.string().required("type is required."),
});

interface IModalUserFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  bankData: any;
  onOpenChange: () => void;
}

const ModalUserForm = ({
  open,
  onOpenChange,
  isEdit,
  bankData,
}: IModalUserFormProps) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isEdit ? editBank : addUser,
    onSuccess: () => {
      toast.success(`User ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = isEdit
    ? bankData
    : {
        firstName: "",
        middleName: "",
        lastName: "",
        phoneNumber: "",
        gender: "",
        type: "",
      };

  async function addUser(values: any) {
    try {
      // Convert `isapproved` to a boolean if it exists in `values`

      console.log(values, "values");

      const res = await axiosInstance.post(`/api/v1/users`, values);
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the user.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editBank(values: any) {
    try {
      const { id, name, accountName, accountNumber, isApproved } = values;

      // Convert `isApproved` to a boolean if it exists
      const updatedValues: any = {
        name,
        accountName,
        accountNumber,
        isApproved: isApproved === "true",
      };

      try {
        const res = await axiosInstance.patch(
          `/api/v1/banks/${id}`,
          updatedValues
        );
        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message || "An error occurred while editing the user.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while editing the user.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: userSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        mutate(values);
      } catch {
        toast("There was an error! Try again");
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(bankData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, bankData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
              {isEdit ? "Edit" : "Create"} a User
            </h3>
            <form
              className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
              onSubmit={formik.handleSubmit}
              noValidate
            >
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">First Name</label>
                <label className="input">
                  <input
                    placeholder="Enter first name"
                    autoComplete="off"
                    {...formik.getFieldProps("firstName")}
                  />
                </label>
                {formik.touched.firstName && formik.errors.firstName && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {typeof formik.errors.firstName === "string" &&
                      formik.errors.firstName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Middle Name</label>

                <label className="input">
                  <input
                    placeholder="Enter middle name"
                    autoComplete="off"
                    {...formik.getFieldProps("middleName")}
                  />
                </label>
                {formik.touched.middleName && formik.errors.middleName && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {typeof formik.errors.middleName === "string" &&
                      formik.errors.middleName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Last Name</label>

                <label className="input">
                  <input
                    placeholder="Enter last name"
                    autoComplete="off"
                    {...formik.getFieldProps("lastName")}
                  />
                </label>
                {formik.touched.lastName && formik.errors.lastName && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {typeof formik.errors.lastName === "string" &&
                      formik.errors.lastName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Gender</label>

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
                {formik.touched.gender && formik.errors.gender && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {typeof formik.errors.gender === "string" &&
                      formik.errors.gender}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Phone Number</label>

                {/* A row containing the dropdown (left) and input (right) */}
                <div className="flex items-center gap-2">
                  {/* Country code dropdown */}
                  <select
                    className="border border-gray-300 rounded px-2 py-2 text-sm text-gray-900 dark:text-gray-100 dark:bg-secondary-clarity dark:text-white"
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
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {typeof formik.errors.phoneNumber === "string" &&
                      formik.errors.phoneNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Type</label>
                {formik.touched.Type && formik.errors.Type ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.Type === "string"
                      ? formik.errors.Type
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <select
                    disabled={isEdit}
                    {...formik.getFieldProps("type")}
                    className="form-control form-select w-full outline-none bg-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="user">user</option>
                    <option value="business">business</option>
                  </select>
                </label>
                {formik.touched.type && formik.errors.type && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {typeof formik.errors.type === "string" &&
                      formik.errors.type}
                  </span>
                )}
              </div>

              {/* <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">isApproved</label>
                {formik.touched.isApproved && formik.errors.isApproved ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.isApproved === "string"
                      ? formik.errors.isApproved
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <select
                    disabled={isEdit}
                    {...formik.getFieldProps("isApproved")}
                    className="form-control form-select w-full outline-none bg-transparent"
                  >
                    <option value="">Select isApproved</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
              </div> */}

              <button
                type="submit"
                className="btn btn-primary flex justify-center"
              >
                {isEdit ? "Save Changes" : "Create User"}
              </button>
            </form>
          </>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalUserForm };
