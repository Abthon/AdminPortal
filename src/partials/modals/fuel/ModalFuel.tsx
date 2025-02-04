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

const FuelRecord = Yup.object().shape({
  fuelCost: Yup.number().required("Fuel Record is required."),
  fuelQuantity: Yup.number().required("Fuel Qty is required."),
  odometerValue: Yup.number().required("Odometer Value is required"),
  vehicleId: Yup.number().required("Vehicle is required."),
});

const FuelRecordForEdit = Yup.object().shape({
  fuelCost: Yup.number().required("Fuel Record is required."),
  fuelQuantity: Yup.number().required("Fuel Qty is required."),
  odometerValue: Yup.number().required("Odometer Value is required"),
});

interface IModalFuelProps {
  open: boolean;
  isEdit: boolean;
  fuelData: any;
  onOpenChange: () => void;
}

const ModalFuel = ({
  open,
  onOpenChange,
  isEdit,
  fuelData,
}: IModalFuelProps) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editFuelRecord : addFuelRecord,
    onSuccess: () => {
      toast.success(`Fuel record ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Fuel"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = isEdit
    ? fuelData
    : {
        fuelCost: "",
        fuelQuantity: "",
        odometerValue: "",
        vehicleId: "",
      };

  async function addFuelRecord(values: { [key: string]: any }) {
    try {
      // Convert `isapproved` to a boolean if it exists in `values`
      values.vehicleId = +values.vehicleId;
      console.log(values, "values");

      const res = await axiosInstance.post(`/api/v1/fuel`, values);
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while creating the fuel record.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editFuelRecord(values: any) {
    try {
      const { id, fuelCost, odometerValue } = values;

      // Convert `isApproved` to a boolean if it exists
      const updatedValues: any = {
        fuelCost,
        odometerValue,
      };

      try {
        const res = await axiosInstance.patch(
          `/api/v1/fuel/${id}`,
          updatedValues
        );
        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the fuel record.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while editing the fuel record.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const {
    data: Vehicle,
    isLoading: isVehicleLoading,
    error: VehicleError,
  } = useQuery("Vehicle", async () => {
    const res = await axiosInstance.get("api/v1/vehicles");
    console.log("the vehicle", res);
    if (res.status !== 200) {
      throw new Error("Failed to fetch vehicle");
    }
    const data = res.data;
    return data.data;
  });

  const formik = useFormik({
    initialValues,
    validationSchema: isEdit ? FuelRecordForEdit : FuelRecord,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      console.log(formik.errors, "err");
      console.log("here");
      try {
        mutate(values);
      } catch (err) {
        console.log(err, "error");
      }
    },
  });

  useEffect(() => {
    //console.log("there rh", isEdit);
    if (open) {
      if (isEdit) {
        formik.setValues(fuelData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, fuelData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            {isEdit ? "Edit" : "Create"} a Fuel Record
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Fuel Cost</label>
              <label className="input">
                <input
                  placeholder="Enter fuelCost"
                  autoComplete="off"
                  type="number"
                  {...formik.getFieldProps("fuelCost")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid":
                        formik.touched.fuelCost && formik.errors.fuelCost,
                    },
                    {
                      "is-valid":
                        formik.touched.fuelCost && !formik.errors.fuelCost,
                    }
                  )}

                  // className={clsx("form-control", {
                  //   "is-invalid": formik.touched.email && formik.errors.email,
                  // })}
                />
              </label>
              {formik.touched.fuelCost && formik.errors.fuelCost && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.fuelCost === "string" &&
                    formik.errors.fuelCost}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Odometer Value</label>
              <label className="input">
                <input
                  placeholder="Enter odometerValue"
                  autoComplete="off"
                  type="number"
                  {...formik.getFieldProps("odometerValue")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid":
                        formik.touched.odometerValue &&
                        formik.errors.odometerValue,
                    },
                    {
                      "is-valid":
                        formik.touched.odometerValue &&
                        !formik.errors.odometerValue,
                    }
                  )}
                />
              </label>
              {formik.touched.odometerValue && formik.errors.odometerValue && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.odometerValue === "string" &&
                    formik.errors.odometerValue}
                </span>
              )}
            </div>

            <div className={`flex flex-col gap-1 ${isEdit && "hidden"}`}>
              <label className="form-label text-gray-900">Vehicle</label>
              {isVehicleLoading ? (
                <span>Loading Vehicle ...</span>
              ) : VehicleError ? (
                <span>Error loading vehicle </span>
              ) : (
                <label className="input">
                  <select
                    {...formik.getFieldProps("vehicleId")}
                    disabled={isEdit}
                    className="form-control form-select w-full outline-none"
                  >
                    <option value="" disabled>
                      Select a vehicle
                    </option>
                    {Vehicle?.map((vehicle: { id: number; make: string }) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {`${vehicle?.make}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {formik.touched.vehicleId && formik.errors.vehicleId && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.vehicleId === "string" &&
                    formik.errors.vehicleId}
                </span>
              )}
            </div>

            <div className={`flex flex-col gap-1 ${isEdit && "hidden"}`}>
              <label className="form-label text-gray-900">Fuel Quantity</label>
              <label className="input">
                <input
                  placeholder="Enter fuelQuantity"
                  autoComplete="off"
                  type="number"
                  disabled={isEdit}
                  {...formik.getFieldProps("fuelQuantity")}
                  className={clsx(
                    "form-control bg-transparent",
                    {
                      "is-invalid":
                        formik.touched.fuelQuantity &&
                        formik.errors.fuelQuantity,
                    },
                    {
                      "is-valid":
                        formik.touched.fuelQuantity &&
                        !formik.errors.fuelQuantity,
                    }
                  )}
                />
              </label>
              {formik.touched.fuelQuantity && formik.errors.fuelQuantity && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.fuelQuantity === "string" &&
                    formik.errors.fuelQuantity}
                </span>
              )}
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

export { ModalFuel };
