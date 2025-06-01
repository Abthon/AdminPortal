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
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";

const vehicleSchema = Yup.object().shape({
  // name: Yup.string().required("name is required."),
  baseFare: Yup.number().required(
    "Base Fare is required and should be a number"
  ),
  additionalFarePerKm: Yup.number().required(
    "Additional Fare Per Km is required and should be a number"
  ),
  // minWeightCapacity: Yup.number().required(
  //   "Min Weight Capacity is required and should be a number"
  // ),
  maxWeightCapacity: Yup.number().required(
    "Max Weight Capacity is required and should be a number"
  ),
  //file: Yup.mixed().required("Picture is required."),
});

interface IModalVehicleTypeFormProps {
  open: boolean;
  isEdit: boolean;
  vehicleData: any;
  onOpenChange: () => void;
  isDelete?: boolean;
}

const ModalVehicleTypeForm = ({
  open,
  onOpenChange,
  isEdit,
  vehicleData,
  isDelete,
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
        // minWeightCapacity: "",
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
      let data = undefined;

      // Append form fields to FormData
      Object.keys(updatedFields).forEach((key) => {
        formData.append(key, updatedFields[key]);
      });

      if (file) {
        formData.append("file", file);

        const res = await axiosInstance.post(
          `api/v1/file-upload/image/vehicle-type`,
          formData
        );
        data = res.data;
      }

      let finalData = {
        ...updatedFields,
        ...(data !== undefined && { image: data.data.filename }),
        // image: data.data.filename,
      };

      await axiosInstance.post(`api/v1/vehicle-types`, finalData);
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the vehicle.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function deleteVehicleType(id: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.delete(`/api/v1/vehicle-types/${id}`);
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(
          res_3.data.message || "Failed to notify the vehicleType."
        );
      }
      toast.success(`VehicleType Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["VehicleType"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while deleting the vehicleType.";
      toast.error(errorMessage || errorMessage);
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
      if (file instanceof File) {
        formData.append("file", file);
        const res = await axiosInstance.post(
          `api/v1/file-upload/image/vehicle-type`,
          formData
        );
        const data = res.data;
        const { createdAt, ...filteredFields } = updatedFields;
        const finalData = { ...filteredFields, image: data.data.filename };
        await axiosInstance.patch(`api/v1/vehicle-types/${id}`, finalData);
      } else {
        const { createdAt, ...filteredFields } = updatedFields;
        await axiosInstance.patch(`api/v1/vehicle-types/${id}`, filteredFields);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while editing the vehicle.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: vehicleSchema,
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
        // Ensure vehicleType is populated correctly
        formik.setValues({
          ...(vehicleData || {}),
          // Assuming vehicleData contains a field like 'type' or 'vehicleType'
          // Adjust 'vehicleType' to the actual field name in your vehicleData
          name: vehicleData?.name || "", // Example: populating 'name'
          baseFare: vehicleData?.baseFare || "", // Example: populating 'baseFare'
          additionalFarePerKm: vehicleData?.additionalFarePerKm || "", // Example: populating 'additionalFarePerKm'
          // minWeightCapacity: vehicleData?.minWeightCapacity || "", // Example: populating 'minWeightCapacity'
          maxWeightCapacity: vehicleData?.maxWeightCapacity || "", // Example: populating 'maxWeightCapacity'
          // ... include other fields similarly
        });
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, vehicleData]);

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
                deleteVehicleType(vehicleData.id);
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
            {isEdit ? "Edit" : "Create"} a vehicle type
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
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Base Fare</label>
              {formik.touched.baseFare && formik.errors.baseFare ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.baseFare === "string"
                    ? formik.errors.baseFare
                    : null}
                </div>
              ) : null}
              <label className="input">
                <input
                  placeholder="Enter base fare"
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
              {formik.touched.additionalFarePerKm &&
              formik.errors.additionalFarePerKm ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.additionalFarePerKm === "string"
                    ? formik.errors.additionalFarePerKm
                    : null}
                </div>
              ) : null}
              <label className="input">
                <input
                  placeholder="Enter additional fare per km"
                  autoComplete="off"
                  {...formik.getFieldProps("additionalFarePerKm")}
                  type="number"
                />
              </label>
            </div>
            {/* <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Min Weight Capacity
              </label>
              {formik.touched.minWeightCapacity &&
              formik.errors.minWeightCapacity ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.minWeightCapacity === "string"
                    ? formik.errors.minWeightCapacity
                    : null}
                </div>
              ) : null}
              <label className="input">
                <input
                  placeholder="Enter min weight capacity"
                  autoComplete="off"
                  {...formik.getFieldProps("minWeightCapacity")}
                  type="number"
                />
              </label>
            </div> */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">
                Max Weight Capacity
              </label>
              {formik.touched.maxWeightCapacity &&
              formik.errors.maxWeightCapacity ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.maxWeightCapacity === "string"
                    ? formik.errors.maxWeightCapacity
                    : null}
                </div>
              ) : null}
              <label className="input">
                <input
                  placeholder="Enter max weight capacity"
                  autoComplete="off"
                  {...formik.getFieldProps("maxWeightCapacity")}
                  type="number"
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Picture</label>
              {formik.touched.file && formik.errors.file ? (
                <div className="text-red-500 text-sm">
                  {typeof formik.errors.file === "string"
                    ? formik.errors.file
                    : null}
                </div>
              ) : null}
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
