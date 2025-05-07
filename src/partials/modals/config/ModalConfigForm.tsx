import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Yup from "yup";
// import clsx from "clsx";
// import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";

const configSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  value: Yup.string().required("Value is required."),
});

interface IModalConfigFormProps {
  open: boolean;
  isEdit: boolean;
  configData: any;
  isDelete?: boolean;
  onOpenChange: () => void;
}

const ModalConfigForm = ({
  open,
  onOpenChange,
  isEdit,
  isDelete,
  configData,
}: IModalConfigFormProps) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editConfig : addConfig,
    onSuccess: () => {
      toast.success(`Config ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Config"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });
  // const initialValues = isEdit ? configData : {};
  const initialValues = isEdit
    ? configData
    : {
        name: "",
        value: "",
      };

  async function deleteConfig(id: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.delete(`/api/v1/params/${id}`);
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(res_3.data.message || "Failed to notify the Config.");
      }
      toast.success(`Config Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Config"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while deleting the Config.";
      toast.error(errorMessage || errorMessage);
    }
  }

  async function addConfig(values: { [key: string]: any }) {
    try {
      const { name, value } = values;
      let permissions: string[] = [];
      let updatedvalues: {
        name: string;
        value: string;
        permissions?: string[];
      } = { name, value };

      if (values.isAdmin) {
        permissions.push("admin");
      }
      if (values.isUser) {
        permissions.push("user");
      }
      updatedvalues = { ...updatedvalues, permissions };

      console.log(updatedvalues);

      const res = await axiosInstance.post(`/api/v1/params`, updatedvalues);

      console.log("success", res.data);
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the config.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editConfig(values: { [key: string]: any }) {
    try {
      let permissions: string[] = [];
      const { id, value, isUser, isAdmin } = values;

      let updatedvalues: { value: any; permissions?: string[] } = {
        value,
      };

      if (isAdmin) {
        permissions.push("admin");
      }
      if (isUser) {
        permissions.push("user");
      }
      updatedvalues = { ...updatedvalues, permissions };

      console.log(updatedvalues);
      try {
        const res = await axiosInstance.patch(
          `/api/v1/params/${id}`,
          updatedvalues
        );
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the config.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the config.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: configSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        mutate(values);
      } catch {}
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(configData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, configData]);

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
                deleteConfig(configData.id);
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
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            {isEdit ? "Edit" : "Create"} a Config
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Name</label>
              {formik.touched.name && formik.errors.name ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.name === "string"
                    ? formik.errors.name
                    : null}
                </div>
              ) : null}
              <label className="input">
                <input
                  placeholder="Enter name"
                  autoComplete="off"
                  {...formik.getFieldProps("name")}
                  disabled={isEdit}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">value</label>
              {formik.touched.value && formik.errors.value ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.value === "string"
                    ? formik.errors.value
                    : null}
                </div>
              ) : null}
              <label className="input">
                <input
                  placeholder="Enter value"
                  autoComplete="off"
                  {...formik.getFieldProps("value")}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>
            {/* <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Permission</label>
              <label className="input">
                <select
                  {...formik.getFieldProps("permission")}
                  className="form-control"
                >
                  <option value="" disabled>
                    Select Permission
                  </option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div> */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Permission</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps("isAdmin")}
                    className="form-checkbox"
                  />
                  <span>Admin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps("isUser")}
                    className="form-checkbox"
                  />
                  <span>User</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary flex justify-center grow"
              disabled={isLoading}
            >
              {isEdit ? "Edit" : "Create"}
            </button>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalConfigForm };
