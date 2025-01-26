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
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import axiosInstance from "@/auth/_helpers";

const bookingSchema = Yup.object().shape({
  pickupName: Yup.string().required("Pick up is required."),
  dropOffName: Yup.string().required("Drop off is required."),
  vehicleTypeId: Yup.number().required("Vehicle type is required."),
  driverId: Yup.number().required("Driver is required."),
});

interface IModalBookingFormProps {
  open: boolean;
  isEdit: boolean;
  bookingData: any;
  onOpenChange: () => void;
}

const ModalBookingForm = ({
  open,
  onOpenChange,
  isEdit,
  bookingData,
}: IModalBookingFormProps) => {
  /* importing booking */
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editBooking : addBooking,
    onSuccess: () => {
      toast.success(`Booking ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Bookings"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = {
    pickupName: "",
    pickupLat: "",
    pickupLng: "",
    dropOffName: "",
    dropOffLat: "",
    dropOffLng: "",
    driverId: "",
    vehicleTypeId: "",
    status: "",
    remark: "",
    traveledPath: "",
    polyline: "",
  };

  async function addBooking(values: { [key: string]: any }) {
    try {
      const {
        pickupLat,
        pickupLng,
        dropOffLat,
        dropOffLng,
        vehicleTypeId,
        pickupName,
        dropOffName,
        driverId,
      } = values;

      const updatedFields = {
        lat1: pickupLat,
        lng1: pickupLng,
        lat2: dropOffLat,
        lng2: dropOffLng,
        vehicleTypeId: Number(vehicleTypeId),
      };

      const res = await axiosInstance.post(
        "api/v1/bookings/estimate/",
        updatedFields
      );

      if (res.status !== 200) {
        throw new Error(res.data.message || "Failed to create the booking.");
      }

      const data = res.data;
      const distance = Math.floor(data.data.estimatedDistance);
      const price = Math.floor(data.data.estimatedPrice);

      const finalReq = {
        pickupLat: pickupLat.toString(),
        pickupLng: pickupLng.toString(),
        dropOffLat: dropOffLat.toString(),
        dropOffLng: dropOffLng.toString(),
        pickupName,
        dropOffName,
        driverId,
        estimatedPrice: price,
        estimatedTraveledDistance: distance,
        vehicleType: Number(vehicleTypeId),
      };

      console.log(finalReq, "the final request");

      const res_3 = await axiosInstance.post("api/v1/bookings/admin", finalReq);
      if (res_3.status !== 201) {
        throw new Error(res_3.data.message || "Failed to create the booking.");
      }

      return res_3.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the booking.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editBooking(values: { [key: string]: any }) {
    try {
      const { id, status, remark, traveledPath, polyline } = values;

      const updatedFields = {
        status,
        remark,
        traveledPath,
        polyline,
      };

      console.log(updatedFields, "the updated fields");
      try {
        const res = await axiosInstance.patch(
          `api/v1/bookings/${id}`,
          updatedFields
        );

        if (res.status !== 200) {
          throw new Error(res.data.message || "Failed to edit the booking.");
        }

        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the booking.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while editing the booking.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const {
    data: drivers,
    isLoading: isDriversLoading,
    error: driversError,
  } = useQuery("drivers", async () => {
    const res = await axiosInstance.get("api/v1/drivers");
    if (res.status !== 200) {
      throw new Error("Failed to fetch drivers");
    }
    const data = res.data;
    // console.log("here", data.data);
    return data.data;
  });

  const {
    data: vehicleType,
    isLoading: isVehicleTypeLoading,
    error: vehicleTypeError,
  } = useQuery("VehicleType", async () => {
    const res = await axiosInstance.get("api/v1/vehicle-types");
    if (res.status !== 200) {
      throw new Error("Failed to fetch vehicle types");
    }
    const data = res.data;
    return data.data;
  });

  const formik = useFormik({
    initialValues,
    validationSchema: bookingSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        mutate(values);
      } catch {
        setStatus("An error occurred");
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(bookingData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, bookingData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            {isEdit ? "Edit" : "Create"} a Booking
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            {!isEdit ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Pickup Location
                  </label>
                  {formik.touched.pickupName && formik.errors.pickupName ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.pickupName === "string"
                        ? formik.errors.pickupName
                        : null}
                    </div>
                  ) : null}
                  <GooglePlacesAutocomplete
                    apiKey={import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || ""}
                    selectProps={{
                      value: formik.values.pickupName
                        ? {
                            label: formik.values.pickupName,
                            value: {
                              description: formik.values.pickupName,
                              geometry: {
                                location: {
                                  lat: formik.values.pickupLat,
                                  lng: formik.values.pickupLng,
                                },
                              },
                            },
                          }
                        : null,
                      onChange: async (value) => {
                        if (value && value.value && value.value.place_id) {
                          const placeId = value.value.place_id;

                          // Initialize Google Maps Places Service
                          const service = new google.maps.places.PlacesService(
                            document.createElement("div")
                          );
                          service.getDetails({ placeId }, (place, status) => {
                            if (
                              status ===
                              google.maps.places.PlacesServiceStatus.OK
                            ) {
                              formik.setFieldValue("pickupName", value.label);
                              formik.setFieldValue(
                                "pickupLat",
                                place?.geometry?.location?.lat()
                              );
                              formik.setFieldValue(
                                "pickupLng",
                                place?.geometry?.location?.lng()
                              );
                              console.log("Place:", value.label);
                              console.log(
                                "Lat: ",
                                place?.geometry?.location?.lat()
                              );
                              console.log(
                                "Lang: ",
                                place?.geometry?.location?.lng()
                              );
                            } else {
                              console.error(
                                "Failed to fetch place details:",
                                status
                              );
                            }
                          });
                        } else {
                          console.error("Invalid value:", value);
                        }
                      },
                      styles: {
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "transparent",
                          borderColor: "#3d3e46 !important",
                          boxShadow: "none !important",
                          outline: "none !important",
                          fontSize: ".85em",
                          paddingLeft: "5px",
                          maxWidth: "390px",
                          overflow: "hidden",
                        }),
                        input: (provided) => ({
                          ...provided,
                          color: "gray", // [ text color ]
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#9ca3af", // Optional: Customize placeholder text color
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#808290", // Optional: Customize selected value text color
                        }),
                      },
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    DropOff Location
                  </label>
                  {formik.touched.dropOffName && formik.errors.dropOffName ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.dropOffName === "string"
                        ? formik.errors.dropOffName
                        : null}
                    </div>
                  ) : null}
                  <GooglePlacesAutocomplete
                    apiKey={import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || ""}
                    selectProps={{
                      value: formik.values.dropOffName
                        ? {
                            label: formik.values.dropOffName,
                            value: {
                              description: formik.values.dropOffName,
                              geometry: {
                                location: {
                                  lat: formik.values.dropOffLat,
                                  lng: formik.values.dropOffLng,
                                },
                              },
                            },
                          }
                        : null,
                      onChange: async (value) => {
                        if (value && value.value && value.value.place_id) {
                          const placeId = value.value.place_id;

                          // Initialize Google Maps Places Service
                          const service = new google.maps.places.PlacesService(
                            document.createElement("div")
                          );
                          service.getDetails({ placeId }, (place, status) => {
                            if (
                              status ===
                              google.maps.places.PlacesServiceStatus.OK
                            ) {
                              formik.setFieldValue("dropOffName", value.label);
                              formik.setFieldValue(
                                "dropOffLat",
                                place?.geometry?.location?.lat()
                              );
                              formik.setFieldValue(
                                "dropOffLng",
                                place?.geometry?.location?.lng()
                              );
                              console.log("Place:", value.label);
                              console.log(
                                "Lat: ",
                                place?.geometry?.location?.lat()
                              );
                              console.log(
                                "Lang: ",
                                place?.geometry?.location?.lng()
                              );
                            } else {
                              console.error(
                                "Failed to fetch place details:",
                                status
                              );
                            }
                          });
                        } else {
                          console.error("Invalid value:", value);
                        }
                      },
                      styles: {
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "transparent",
                          borderColor: "#3d3e46 !important",
                          boxShadow: "none !important",
                          outline: "none !important",
                          fontSize: ".85em",
                          paddingLeft: "5px",
                          maxWidth: "390px",
                          overflow: "hidden",
                        }),
                        // menu: (provided) => ({
                        //   ...provided,
                        //   backgroundColor: '#3d3e46',
                        //   border: '1px solid #3d3e46',
                        //   borderRadius: '4px',
                        //   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        //   zIndex: 1000,
                        // }),
                        // menuList: (provided) => ({
                        //   ...provided,
                        //   padding: "0", // Remove additional padding
                        //   backgroundColor: '#3d3e46',
                        // }),
                        input: (provided) => ({
                          ...provided,
                          color: "gray", // [ text color ]
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#9ca3af", // Optional: Customize placeholder text color
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#808290", // Optional: Customize selected value text color
                        }),
                      },
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Driver</label>
                  {formik.touched.driverId && formik.errors.driverId ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.driverId === "string"
                        ? formik.errors.driverId
                        : null}
                    </div>
                  ) : null}
                  {isDriversLoading ? (
                    <span>Loading drivers...</span>
                  ) : driversError ? (
                    <span>Error loading drivers</span>
                  ) : (
                    <label className="input">
                      <select
                        {...formik.getFieldProps("driverId")}
                        className="form-control form-select w-full"
                        style={{
                          backgroundColor: "transparent",
                          outline: "none",
                          borderColor: "blue",
                        }}
                      >
                        <option value="" disabled>
                          Select a driver
                        </option>
                        {drivers?.map(
                          (driver: {
                            id: number;
                            firstName: string;
                            lastName: string;
                          }) => (
                            <option key={driver.id} value={driver.id}>
                              {`${driver.firstName} ${driver.lastName}`}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Vehicle Type
                  </label>
                  {formik.touched.vehicleTypeId &&
                  formik.errors.vehicleTypeId ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.vehicleTypeId === "string"
                        ? formik.errors.vehicleTypeId
                        : null}
                    </div>
                  ) : null}
                  {isVehicleTypeLoading ? (
                    <span>Loading Vehicle type...</span>
                  ) : vehicleTypeError ? (
                    <span>Error loading vehicle type</span>
                  ) : (
                    <label className="input">
                      <select
                        {...formik.getFieldProps("vehicleTypeId")}
                        className="form-control form-select w-full"
                        style={{
                          backgroundColor: "transparent",
                          outline: "none",
                          borderColor: "blue",
                        }}
                      >
                        <option value="" disabled>
                          Select a vehicle type
                        </option>
                        {Array.isArray(vehicleType) &&
                          vehicleType.map(
                            (vehicle: { id: number; name: string }) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.name}
                              </option>
                            )
                          )}
                      </select>
                    </label>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center grow"
                  disabled={isLoading}
                >
                  {isEdit ? "Edit" : "Create"}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Status</label>
                  <label className="input">
                    <select
                      {...formik.getFieldProps("status")}
                      className="form-control form-select w-full"
                      style={{
                        backgroundColor: "transparent",
                        outline: "none",
                        borderColor: "blue",
                      }}
                    >
                      <option value="requested">Requested</option>
                      <option value="assigned">Assigned</option>
                      <option value="canceled">Canceled</option>
                      <option value="timeout">timeout</option>
                      <option value="driver_not_found">driver_not_found</option>
                      <option value="completed">completed</option>
                      <option value="started">started</option>
                    </select>
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">remark</label>
                  <label className="input">
                    <input
                      placeholder="Enter remark"
                      autoComplete="off"
                      {...formik.getFieldProps("remark")}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    traveledPath
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter traveledPath"
                      autoComplete="off"
                      {...formik.getFieldProps("traveledPath")}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">polyline</label>
                  <label className="input">
                    <input
                      placeholder="Enter polyline"
                      autoComplete="off"
                      {...formik.getFieldProps("polyline")}
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
              </>
            )}
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalBookingForm };
