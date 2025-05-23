import axiosInstance from "@/auth/_helpers";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Yup from "yup";
import clsx from "clsx";
// import { Link } from "react-router-dom";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const vehicleSchema = Yup.object().shape({
  make: Yup.string().required("Vehicle name is required."),
  model: Yup.string().required("Vehicle type is required."),
  year: Yup.number().required("Year is required"),
  plate_number: Yup.string().required("License plate is required."),
  color: Yup.string().required("Color is required."),
  vehicleTypeId: Yup.number().required("Vehicle type is required."),
  photo: Yup.mixed().required("Picture is required."),
});

interface IModalVehicleFormProps {
  open: boolean;
  isEdit: boolean;
  vehicleData: any;
  isDelete?: boolean;
  onOpenChange: () => void;
}

const ModalVehicleRegistrationForm = ({
  open,
  onOpenChange,
  isEdit,
  isDelete,
  vehicleData,
}: IModalVehicleFormProps) => {
  // console.log(isEdit);
  console.log(vehicleData, "isEdit");
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editVehicleType : addVehicle,
    onSuccess: () => {
      toast.success(`Vehicle ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Vehicle"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = isEdit
    ? vehicleData
    : {
        make: "",
        model: "",
        year: "",
        vehicleTypeId: "",
        plate_number: "",
        color: "",
        photo: null,
      };

  async function addVehicle(values: { [key: string]: any }) {
    try {
      console.log(values);
      const { photo, librae, ...updatedFields } = values as {
        photo: File;
        librae: File;
        [key: string]: any;
      };
      const formData = new FormData();
      if (photo) {
        formData.append("file", photo);
      }
      console.log(formData, "formdata");

      const res = await axiosInstance.post(
        `api/v1/file-upload/image/vehicle`,
        formData
      );

      const photo_res = res.data.data.filename;
      if (res.status !== 201) {
        throw new Error(res.data.message || "Failed to edit the booking.");
      }

      console.log("here");

      const newFormData = new FormData();

      if (librae) {
        newFormData.append("librae", librae);
      }

      const res_2 = await axiosInstance.post(
        `api/v1/file-upload/image/librae`,
        formData
      );

      if (res_2.status !== 201) {
        throw new Error(res.data.message || "Failed to edit the booking.");
      }

      const librae_res = res_2.data.data.filename;

      let lastData = {
        ...updatedFields,
        vehicleTypeId: Number(updatedFields.vehicleTypeId),
        photo: photo_res,
        librae: librae_res,
      };

      try {
        const res_3 = await axiosInstance.post("api/v1/vehicles", lastData);
        if (res_3.status !== 201) {
          throw new Error(
            res_3.data.message || "Failed to create the vehicles."
          );
        }

        const data_3 = res_3.data;
        console.log(data_3, "data_3");
        return data_3;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while adding the vehicle.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the vehicle.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function deleteVehicle(id: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.delete(`/api/v1/vehicles/${id}`);
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(res_3.data.message || "Failed to notify the Vehicle.");
      }
      toast.success(`Vehicle Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Vehicle"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while deleting the Vehicle.";
      toast.error(errorMessage || errorMessage);
    }
  }

  async function editVehicleType(values: any) {
    try {
      const { photo, librae, id, vehicleTypeId, ...updatedFields } = values;
      const formData = new FormData();
      const newFormData = new FormData();
      let photo_res;
      let librae_res;

      console.log("photo", values);
      if (photo instanceof File) {
        console.log("here", photo);
        formData.append("file", photo);
        const res = await axiosInstance.post(
          `api/v1/file-upload/image/vehicle`,
          formData
        );

        if (res.status !== 201) {
          throw new Error(res.data.message || "Failed to upload the photo.");
        }

        photo_res = res.data.data.filename;
      }

      if (librae instanceof File) {
        newFormData.append("file", librae);

        const res_2 = await axiosInstance.post(
          `api/v1/file-upload/image/librae`,
          newFormData
        );

        if (res_2.status !== 201) {
          throw new Error(res_2.data.message || "Failed to upload the librae.");
        }

        librae_res = res_2.data.data.filename;
      }

      const finalDataToSend = {
        ...updatedFields,
        vehicleTypeId: Number(vehicleTypeId),
        ...(photo_res !== undefined && { photo: photo_res }),
        ...(librae_res !== undefined && { librae: librae_res }),
      };

      try {
        // Exclude properties that should not be sent to the backend
        const { createdAt, owner, driver, vehicleType, ...restOfData } =
          finalDataToSend;

        const res_3 = await axiosInstance.patch(
          `api/v1/vehicles/${id}`,
          restOfData
        );
        if (res_3.status !== 200) {
          throw new Error(
            res_3.data.message || "Failed to update the vehicle."
          );
        }

        const data_3 = res_3.data;
        return data_3;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the vehicle.";
        throw new Error(errorMessage || errorMessageAlt);
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

  const {
    data: vehicleType,
    isLoading: isVehicleTypeLoading,
    error: vehicleTypeError,
  } = useQuery("VehicleType", async () => {
    const res = await axiosInstance.get("api/v1/vehicle-types");
    console.log("the vehicle types", res.data);
    if (res.status !== 200) {
      throw new Error("Failed to fetch vehicle types");
    }
    const data = res.data;
    return data.data;
  });

  const formik = useFormik({
    initialValues,
    validationSchema: vehicleSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      console.log(formik.errors, "err");
      console.log("Values on submit:", values);
      console.log("here");
      try {
        mutate(values);
      } catch (err) {
        console.log(err, "error");
      }
    },
  });

  // useEffect(() => {
  //   if (isEdit) {
  //     formik.setValues(vehicleData); // Manually update Formik's values
  //   } else {
  //     formik.resetForm();
  //   }
  // }, [vehicleData, isEdit]);
  // useEffect(() => {
  //   //console.log("there rh", isEdit);
  //   if (open) {
  //     if (isEdit) {
  //       formik.setValues(vehicleData || {}); // Populate form with edit data
  //     } else {
  //       formik.resetForm(); // Reset form for add mode
  //     }
  //   }
  // }, [isEdit, open, vehicleData]);
  useEffect(() => {
    if (open) {
      if (isEdit && vehicleData) {
        // Ensure vehicleTypeId is a number when setting form values
        console.log("Vehicle Data in Edit Mode:", vehicleData);
        const formattedData = {
          ...vehicleData,
          // Assuming vehicleData contains a field like 'type' or 'vehicleType' or 'vehicleTypeId'
          // Adjust 'vehicleTypeId' to the actual field name in your vehicleData
          vehicleTypeId: Number(
            vehicleData.vehicleType?.id || vehicleData.vehicleTypeId || ""
          ), // Try accessing through vehicleType.id or vehicleTypeId
        };
        console.log("Formatted Data for Formik:", formattedData);
        formik.setValues(formattedData);
        console.log("Formik values after setValues:", formik.values);
      } else {
        formik.resetForm();
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
                deleteVehicle(vehicleData.id);
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
            {isEdit ? "Edit" : "Create"} a vehicle
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Make</label>
              <label className="input">
                <input
                  placeholder="Enter make"
                  autoComplete="off"
                  {...formik.getFieldProps("make")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid": formik.touched.make && formik.errors.make,
                    },
                    {
                      "is-valid": formik.touched.make && !formik.errors.make,
                    }
                  )}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
              {formik.touched.make && formik.errors.make && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.make === "string" && formik.errors.make}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Model</label>
              <label className="input">
                <input
                  placeholder="Enter model"
                  autoComplete="off"
                  {...formik.getFieldProps("model")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid": formik.touched.model && formik.errors.model,
                    },
                    {
                      "is-valid": formik.touched.model && !formik.errors.model,
                    }
                  )}
                />
              </label>
              {formik.touched.model && formik.errors.model && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.model === "string" &&
                    formik.errors.model}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Year</label>
              <label className="input">
                <input
                  placeholder="Enter year"
                  autoComplete="off"
                  {...formik.getFieldProps("year")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid": formik.touched.year && formik.errors.year,
                    },
                    {
                      "is-valid": formik.touched.year && !formik.errors.year,
                    }
                  )}
                />
              </label>
              {formik.touched.year && formik.errors.year && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.year === "string" && formik.errors.year}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Vehicle Type</label>
              {isVehicleTypeLoading ? (
                <span>Loading Vehicle type...</span>
              ) : vehicleTypeError ? (
                <span>Error loading vehicle type</span>
              ) : (
                <label className="input">
                  <select
                    {...formik.getFieldProps("vehicleTypeId")}
                    className="form-control form-select w-full outline-none"
                  >
                    <option value="">Select a vehicle type</option>
                    {vehicleType?.map(
                      (vehicle: { id: number; name: string }) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {`${vehicle.name}`}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}
              {formik.touched.vehicleTypeId && formik.errors.vehicleTypeId && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.vehicleTypeId === "string" &&
                    formik.errors.vehicleTypeId}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Plate Number</label>
              <label className="input">
                <input
                  placeholder="Enter plate number"
                  autoComplete="off"
                  {...formik.getFieldProps("plate_number")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid":
                        formik.touched.plate_number &&
                        formik.errors.plate_number,
                    },
                    {
                      "is-valid":
                        formik.touched.plate_number &&
                        !formik.errors.plate_number,
                    }
                  )}
                />
              </label>
              {formik.touched.plate_number && formik.errors.plate_number && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.plate_number === "string" &&
                    formik.errors.plate_number}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Color</label>
              <label className="input">
                <input
                  placeholder="Enter color"
                  autoComplete="off"
                  {...formik.getFieldProps("color")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid": formik.touched.color && formik.errors.color,
                    },
                    {
                      "is-valid": formik.touched.color && !formik.errors.color,
                    }
                  )}
                />
              </label>
              {formik.touched.color && formik.errors.color && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.color === "string" &&
                    formik.errors.color}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Photo</label>
              <label className="input  max-w-[390px] overflow-hidden">
                <input
                  type="file"
                  name="photo"
                  onChange={(event) => {
                    const file = event.target.files
                      ? event.target.files[0]
                      : null;
                    formik.setFieldValue("photo", file);
                  }}
                />
              </label>
              {formik.errors.photo && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.photo === "string" &&
                    formik.errors.photo}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Librae</label>
              <label className="input max-w-[390px] overflow-hidden">
                <input
                  type="file"
                  name="file2"
                  onChange={(event) => {
                    const file = event.target.files
                      ? event.target.files[0]
                      : null;
                    formik.setFieldValue("librae", file);
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

export { ModalVehicleRegistrationForm };
