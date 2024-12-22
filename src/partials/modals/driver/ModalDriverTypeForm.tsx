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

const driverSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  middleName: Yup.string().required("Middle name is required."),
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
    onError: () => {
      toast.error("Err encountered");
    },
  });

  async function approveDriver(values: Object) {
    try {
      const { id, approvalStatus } = values as { id: string; approvalStatus: string };

      const updatedFields = {
        "status": approvalStatus,
      };

      const res = await fetch(`http://195.201.134.129/test/api/v1/drivers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to approve the driver.");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      const errorMessage =
        (err as Error).message || "An error occurred while approving the driver.";
      throw new Error(errorMessage);
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
        approvalStatus: "inactive",
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
    validationSchema: isApproved ? approvalSchema : driverSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        console.log(values, "the valueee");
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
                      className="form-control form-select w-full outline-none"
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
                  <label className="input">
                    <input
                      placeholder="Enter First name"
                      autoComplete="off"
                      {...formik.getFieldProps("firstName")}
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
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Middle Name
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter Middle name"
                      autoComplete="off"
                      {...formik.getFieldProps("middleName")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Gender</label>
                  <label className="input">
                    <input
                      placeholder="Enter Gender"
                      autoComplete="off"
                      {...formik.getFieldProps("gender")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Phone Number
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter Phone Number"
                      autoComplete="off"
                      {...formik.getFieldProps("phoneNumber")}
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
