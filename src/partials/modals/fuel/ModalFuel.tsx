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
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
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
  const [plateNumberSearchTerm, setPlateSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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
    data: searchedPlates,
    isLoading: isSearchingPlates,
    error: plateSearchError,
  } = useQuery(
    ["searchPlates", plateNumberSearchTerm], // Query key includes search term
    async () => {
      const url = `/api/v1/vehicles?filters=plate_number=${plateNumberSearchTerm}`; // Adjust the endpoint and filter key as needed
      const res = await axiosInstance.get(url);
      console.log(res, "THe respponse");
      if (res.status !== 200) {
        throw new Error("Failed to fetch vehicle");
      }
      return res.data.data; // Adjust based on your API response structure
    },
    {
      enabled: !!plateNumberSearchTerm.trim(), // Only run the query if there's a search term
      staleTime: 0, // No caching for fresh searches
    }
  );

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

            {/* <div className={`flex flex-col gap-1 ${isEdit && "hidden"}`}>
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
            </div> */}

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Plate number</label>
              <input
                type="text"
                placeholder="Search plates..."
                value={plateNumberSearchTerm}
                onChange={(e) => {
                  setPlateSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 ${
                  formik.values.vehicleId ? "bg-gray-100" : "bg-transparent"
                }`}
                style={{
                  backgroundColor: formik.values.vehicleId
                    ? "#f3f4f6"
                    : "transparent", // Light gray background when a vehicle is selected
                }}
              />
              {showDropdown && (
                <div className="mt-2 max-h-40 overflow-y-auto shadow-sm rounded-lg border border-gray-200 bg-white">
                  {isSearchingPlates ? (
                    <div className="p-3 text-gray-500 text-sm">Loading...</div>
                  ) : plateSearchError ? (
                    <div className="p-3 text-red-500 text-sm">
                      Error loading plate number
                    </div>
                  ) : searchedPlates?.length > 0 ? (
                    searchedPlates.map((vehicle: any) => (
                      <div
                        key={vehicle.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                        onClick={() => {
                          formik.setFieldValue(
                            "vehicleId",
                            vehicle.id.toString()
                          );
                          console.log(vehicle.plate_number, "the number");
                          setPlateSearchTerm(vehicle.plate_number);
                          setShowDropdown(false);
                        }}
                      >
                        <span className="text-gray-900 font-medium">
                          {vehicle.plate_number}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-sm">
                      No plate number found
                    </div>
                  )}
                </div>
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
