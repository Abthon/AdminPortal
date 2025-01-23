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
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const vehicleSchema = Yup.object().shape({
  make: Yup.string().required("Vehicle name is required."),
  model: Yup.string().required("Vehicle type is required."),
  year: Yup.number().required("Year is required"),
  plate_number: Yup.string().required("License plate is required."),
  color: Yup.string().required("Color is required."),
  vehicleTypeId: Yup.number().required("Vehicle type is required."),
});

interface IModalVehicleFormProps {
  open: boolean;
  isEdit: boolean;
  vehicleData: any;
  onOpenChange: () => void;
}

const ModalVehicleRegistrationForm = ({
  open,
  onOpenChange,
  isEdit,
  vehicleData,
}: IModalVehicleFormProps) => {
  // console.log(isEdit);
  // console.log(vehicleData, isEdit);
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

      try{
          const res_3 = await axiosInstance.post("api/v1/vehicles", lastData);
          if (res_3.status !== 201) {
            throw new Error(res_3.data.message || "Failed to create the vehicles.");
          }

          const data_3 = res_3.data;
          console.log(data_3, "data_3");
          return data_3;
      }catch(error){ 
        console.log(error, "The error.");
      }
    } catch (err) {
      throw new Error(
        (err as Error).message ||
          "An error occurred while create the vehicle type."
      );
    }

  }

  async function editVehicleType(values: any) {
    try {
      const { photo, librae, id, ...updatedFields } = values;
      const formData = new FormData();

      if (photo) {
        formData.append("file", photo);
      }

      const res = await axiosInstance.post(
        `api/v1/file-upload/image/vehicle`,
        formData
      );

      if (res.status !== 201) {
        throw new Error(res.data.message || "Failed to upload the photo.");
      }

      const photo_res = res.data.data.filename;
      const newFormData = new FormData();

      if (librae) {
        newFormData.append("file", librae);
      }

      const res_2 = await axiosInstance.post(
        `api/v1/file-upload/image/librae`,
        newFormData
      );

      if (res_2.status !== 201) {
        throw new Error(res_2.data.message || "Failed to upload the librae.");
      }

      const librae_res = res_2.data.data.filename;
      const lastData = {
        ...updatedFields,
        photo: photo_res,
        librae: librae_res,
      };

      try{
        let { owner, createdAt, driver, vehicleType, vehicleTypeId, ...rest } = lastData;
        rest = { ...rest, vehicleType: "comission", vehicleTypeId: Number(vehicleTypeId) };
        console.log(rest, "data without owner.");
        const res_3 = await axiosInstance.patch(`api/v1/vehicles/${id}`, rest);
        if (res_3.status !== 200) {
          throw new Error(res_3.data.message || "Failed to update the vehicle.");
        }

        const data_3 = res_3.data;
        return data_3;

      }catch(error){ 
        console.log(error, "The error!");
      }
    } catch (err) {
      throw new Error(
        (err as Error).message ||
          "An error occurred while editing the vehicle type."
      );
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
      try {
        // console.log(values);
        // const { file, ...updatedFields } = values;
        // const data = await addVehicle(values);
        mutate(values);
        // console.log(values, file);
      } catch {
        // setStatus("The login details are incorrect");
        // setSubmitting(false);
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
  useEffect(() => {
    //console.log("there rh", isEdit);
    if (open) {
      if (isEdit) {
        formik.setValues(vehicleData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, vehicleData]);

  // useEffect(() => {
  //   // Reset form when the modal is closed
  //   if (!isEdit) {
  //     formik.resetForm();
  //   }
  // }, [open]);

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
            Create a vehicle
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
                    <option value="" disabled>
                      Select a vehicle type
                    </option>
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

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Photo</label>
              <label className="input  max-w-[390px] overflow-hidden">
                <input
                  type="file"
                  name="file"
                  onChange={(event) => {
                    const file = event.target.files
                      ? event.target.files[0]
                      : null;
                    formik.setFieldValue("photo", file);
                  }}
                />
              </label>
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