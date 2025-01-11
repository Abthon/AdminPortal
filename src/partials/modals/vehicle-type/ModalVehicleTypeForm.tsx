import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import clsx from "clsx";
// import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";

interface IModalVehicleTypeFormProps {
  open: boolean;
  isEdit: boolean;
  vehicleData: any;
  onOpenChange: () => void;
}

const ModalVehicleTypeForm = ({
  open,
  onOpenChange,
  isEdit,
  vehicleData,
}: IModalVehicleTypeFormProps) => {
  // console.log(isEdit);
  // console.log(vehicleData, isEdit);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editVehicleType : addVehicleType,
    onSuccess: () => {
      toast.success(`Vehicle ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["VehicleType"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });
  // const initialValues = isEdit ? vehicleData : {};
  const initialValues = isEdit
    ? vehicleData
    : {
        name: "",
        baseFare: "",
        additionalFarePerKm: "",
        minWeightCapacity: "",
        maxWeightCapacity: "",
        file: null,
      };

  async function addVehicleType(values: { [key: string]: any }) {
    try {
      const { file, ...updatedFields } = values as {
        file: File;
        [key: string]: any;
      };
      const formData = new FormData();

      // Append form fields to FormData
      Object.keys(updatedFields).forEach((key) => {
        formData.append(key, updatedFields[key]);
      });

      if (file) {
        formData.append("file", file);
      }

      const res = await axiosInstance.post(
        `api/v1/file-upload/image/vehicle-type`,
        formData
      );

      const data = res.data;

      let finalData = { ...updatedFields, image: data.data.filename };

      await axiosInstance.post(`api/v1/vehicle-types`, finalData);
    } catch (err) {
      throw new Error(
        (err as Error).message ||
          "An error occurred while creating the vehicle type."
      );
    }
  }

  async function editVehicleType(values: { [key: string]: any }) {
    try {
      const { file, id, ...updatedFields } = values as {
        file: File;
        id: string;
        [key: string]: any;
      };
      const formData = new FormData();
      Object.keys(updatedFields).forEach((key) => {
        formData.append(key, updatedFields[key]);
      });
      if (file) {
        formData.append("file", file);
      }
      const res = await axiosInstance.post(
        `api/v1/file-upload/image/vehicle-type`,
        formData
      );
      const data = res.data;
      const { createdAt, ...filteredFields } = updatedFields;
      const finalData = { ...filteredFields, image: data.data.filename };
      await axiosInstance.patch(`api/v1/vehicle-types/${id}`, finalData);
    } catch (err) {
      throw new Error(
        (err as Error).message ||
          "An error occurred while editing the vehicle type."
      );
    }
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        mutate(values);
      } catch {
        // setStatus("The login details are incorrect");
        // setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(vehicleData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, vehicleData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            Create a vehicle type
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Name</label>
              <label className="input">
                <input
                  placeholder="Enter name"
                  autoComplete="off"
                  {...formik.getFieldProps("name")}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Base Fare</label>
              <label className="input">
                <input
                  placeholder="Enter Base fare"
                  autoComplete="off"
                  {...formik.getFieldProps("baseFare")}
                  type="number"
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Additional Fare Per Km
              </label>
              <label className="input">
                <input
                  placeholder="Enter Additional Fare Per Km"
                  autoComplete="off"
                  {...formik.getFieldProps("additionalFarePerKm")}
                  type="number"
                />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Min Weight Capacity
              </label>
              <label className="input">
                <input
                  placeholder="Enter Min Weight Capacity"
                  autoComplete="off"
                  {...formik.getFieldProps("minWeightCapacity")}
                  type="number"
                />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Max Weight Capacity
              </label>
              <label className="input">
                <input
                  placeholder="Enter Max Weight Capacity"
                  autoComplete="off"
                  {...formik.getFieldProps("maxWeightCapacity")}
                  type="number"
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Picture</label>
              <label className="input">
                <input
                  type="file"
                  name="file"
                  onChange={(event) => {
                    const file = event.target.files
                      ? event.target.files[0]
                      : null;
                    formik.setFieldValue("file", file);
                  }}
                />
              </label>
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

export { ModalVehicleTypeForm };
