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

const dispatcherEditSchema = Yup.object().shape({
  email: Yup.string().email("invalid email"),
});

const dispatcherPostSchema = Yup.object().shape({
  firstName: Yup.string().required("first name is required"),
  middleName: Yup.string().required("middle name is required"),
  lastName: Yup.string().required("lastname is required"),
  email: Yup.string().email("invalid email").required("email is required"),
  password: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*\d)[A-Za-z\d]{8,}$/,
      "Your password must contain both letters and numbers and the Minimum length should be 8 characters."
    ),
  gender: Yup.string().required("gender is required."),
});

interface IModalBankFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  dispatcherData: any;
  isDelete?: boolean;
  onOpenChange: () => void;
}

const ModalDispatcherForm = ({
  open,
  onOpenChange,
  isDelete,
  isEdit,
  dispatcherData,
}: IModalBankFormProps) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isEdit ? editDispatcher : addDispatcher,
    onSuccess: () => {
      toast.success(`Dispatcher ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Dispatchers"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = isEdit
    ? dispatcherData
    : {
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        gender: "",
        profilePhoto: null,
      };

  async function addDispatcher(values: any) {
    try {
      const formData = new FormData();
      formData.append("file", values.profilePhoto);
      const res_1 = await axiosInstance.post(
        `/api/v1/file-upload/image/profile`,
        formData
      );

      if (res_1?.status === 201) {
        const profile = res_1.data.data.filename;
        let { profilePhoto, ...rest } = values;
        rest = { ...rest, profilePhoto: profile };
        console.log(rest, "result to be sent");
        const res = await axiosInstance.post(`/api/v1/admin`, rest);
        return res.data;
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while adding the dispatcher.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function deleteDispatcher(id: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.delete(`/api/v1/admin/${id}`);
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(
          res_3.data.message || "Failed to notify the Dispatcher."
        );
      }
      toast.success(`Dispatcher Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Dispatchers"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while deleting the Dispatcher.";
      toast.error(errorMessage || errorMessage);
    }
  }

  async function editDispatcher(values: any) {
    try {
      const { id, ...otherValues } = values;
      let updatedValues = { ...otherValues };

      if (values.profilePhoto instanceof File) {
        const formData = new FormData();
        formData.append("file", values.profilePhoto);
        const res_1 = await axiosInstance.post(
          `/api/v1/file-upload/image/profile`,
          formData
        );
        if (res_1?.status === 201) {
          const profile = res_1.data.data.filename;
          updatedValues = { ...updatedValues, profilePhoto: profile };
        }
      }

      try {
        const res = await axiosInstance.patch(
          `/api/v1/admin/${id}`,
          updatedValues
        );
        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the dispatcher.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while editing the dispatcher.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: isEdit ? dispatcherEditSchema : dispatcherPostSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      console.log("silke bilble");
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
        formik.setValues(dispatcherData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, dispatcherData]);

  if (isDelete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px] w-full">
          <DialogHeader className="py-4 text-center">
            <DialogTitle className="text-lg font-semibold text-gray-900"></DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2 pt-6">
              This action cannot be undone. Do you really want to delete this
              item?
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-0 pt-2 pb-5 flex justify-center gap-4">
            <button
              onClick={() => {
                deleteDispatcher(dispatcherData.id);
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
          <>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
              {isEdit ? "Edit" : "Create"} a Dispatcher
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
                <label className="form-label text-gray-900">Middle Name</label>
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
                <label className="form-label text-gray-900">Email</label>
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.email === "string"
                      ? formik.errors.email
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <input
                    placeholder="Enter email"
                    autoComplete="off"
                    {...formik.getFieldProps("email")}
                  />
                </label>
              </div>

              {!isEdit && (
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Password</label>
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.password === "string"
                        ? formik.errors.password
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter password"
                      autoComplete="off"
                      {...formik.getFieldProps("password")}
                    />
                  </label>
                </div>
              )}
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
                    {...formik.getFieldProps("gender")}
                    className="form-control form-select w-full outline-none bg-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
              </div>

              {isEdit ? (
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
                      {/* <option value="">Select Type</option> */}
                      <option value="admin">Admin</option>
                      <option value="dispatch">Dispatcher</option>
                    </select>
                  </label>
                </div>
              ) : (
                ""
              )}

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
                {isEdit ? "Save Changes" : "Create Dispatcher"}
              </button>
            </form>
          </>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalDispatcherForm };
