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

const driverSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  middleName: Yup.string().required("Middle name is required."),
});

interface IModalDriverTypeFormProps {
  open: boolean;
  isEdit: boolean;
  driverData: any;
  onOpenChange: () => void;
}

const ModalDriverTypeForm = ({
  open,
  onOpenChange,
  isEdit,
  driverData,
}: IModalDriverTypeFormProps) => {
  // console.log(driverData, isEdit);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editDriver : addDriver,
    onSuccess: () => {
      toast.success(`Driver ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Drivers"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error("Err encountered");
    },
  });

  // const initialValues = isEdit ? driverData : {};
  const initialValues = isEdit
    ? driverData
    : {
        firstName: "",
        lastName: "",
        middleName: "",
        gender: "",
        phoneNumber: "",
      };

  async function addDriver(values: Object) {
    try {
      console.log(values);
      const res = await fetch(`http://195.201.134.129/test/api/v1/drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create the driver.");
      }

      const data = await res.json();

      console.log("success", data);
    } catch (err) {
      const errorMessage =
        (err as Error).message || "An error occurred while create the driver.";
      throw new Error(errorMessage);
    }
  }

  async function editDriver(values: Object) {
    try {
      // const { id, ...updatedFields } = values;
      const { id, firstName, lastName, gender } = values as {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
      };

      const updatedFields = {
        firstName,
        lastName,
        middleName: "A.",
        gender,
      };

      console.log(updatedFields);

      const res = await fetch(
        `http://195.201.134.129/test/api/v1/drivers/${id}`,
        {
          method: "PATCH", // Using PUT for editing
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFields),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update the driver.");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      const errorMessage =
        (err as Error).message || "An error occurred while editing the driver.";
      throw new Error(errorMessage);
    }
  }

  const formik = useFormik({
    initialValues,
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
        formik.setValues(driverData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, driverData]);

  // function onFormSubmit(data) {
  //   mutate(data);
  // }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            Create a driver
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
                  placeholder="Enter First name"
                  autoComplete="off"
                  {...formik.getFieldProps("firstName")}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Last Name</label>
              <label className="input">
                <input
                  placeholder="Enter Last name"
                  autoComplete="off"
                  {...formik.getFieldProps("lastName")}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Middle Name</label>
              <label className="input">
                <input
                  placeholder="Enter Middle name"
                  autoComplete="off"
                  {...formik.getFieldProps("middleName")}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Phone Number</label>
              <label className="input">
                <input
                  placeholder="Enter Phone number"
                  autoComplete="off"
                  {...formik.getFieldProps("phoneNumber")}
                  disabled={isEdit}
                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Gender</label>
              {/* <label className="input">
                <input
                  placeholder="Enter Gender"
                  autoComplete="off"
                  {...formik.getFieldProps("gender")}
                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label> */}
              <label className="input">
                <select
                  {...formik.getFieldProps("gender")}
                  className="form-control form-select w-full"
                >
                  <option value="" disabled>
                    Select a gender
                  </option>
                  <option value={"male"}>Male</option>
                  <option value={"female"}>Female</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary flex justify-center grow"
              disabled={isLoading}
            >
              {isEdit ? "Edit" : "Post"}
            </button>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalDriverTypeForm };
