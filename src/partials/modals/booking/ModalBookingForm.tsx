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
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import axiosInstance from "@/auth/_helpers";
import { DataGridLoader, KeenIcon } from "@/components";
import { ModalSearchEmpty, ModalSearchNoResults } from "../search";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

const bookingSchema = Yup.object().shape({
  pickupName: Yup.string().required("Pick up is required."),
  dropOffName: Yup.string().required("Drop off is required."),
  vehicleTypeId: Yup.number().required("Vehicle type is required."),
  phoneNumber: Yup.string().matches(/^\d{9}$/, {
    message: "Invalid phone number.",
  }),
  driverId: Yup.number(),
  distance: Yup.number().when("isEndBooking", {
    is: true,
    then: (schema) =>
      schema
        .required("Distance is required")
        .min(0, "Distance must be positive"),
  }),
  duration: Yup.number().when("isEndBooking", {
    is: true,
    then: (schema) =>
      schema
        .required("Duration is required")
        .min(0, "Duration must be positive"),
  }),
});

interface IModalBookingFormProps {
  open: boolean;
  isEdit: boolean;
  isDelete?: boolean;
  isEndBooking: boolean;
  bookingData: any;
  isNotify?: boolean;
  onOpenChange: () => void;
}

const ModalBookingForm = ({
  open,
  onOpenChange,
  isEdit,
  isDelete,
  isEndBooking,
  isNotify,
  bookingData,
}: IModalBookingFormProps) => {
  /* importing booking */
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const [corporateSearchTerm, setCorporateSearchTerm] = useState("");
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [userType, setUserType] = useState<"user" | null>(null);
  const [notifyDrivers, setNotifyDrivers] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEndBooking ? editBooking : addBooking,
    onSuccess: () => {
      toast.success(
        `Booking ${isEndBooking ? "successfully Ended" : "Created"}`
      );
      queryClient.invalidateQueries({ queryKey: ["Bookings"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  console.log("isdelete", isDelete);

  const initialValues = {
    pickupName: "",
    pickupLat: "",
    pickupLng: "",
    dropOffName: "",
    dropOffLat: "",
    dropOffLng: "",
    driverId: "",
    vehicleTypeId: "",
    distance: "",
    duration: "",
    phoneNumber: "",
  };

  const calculateEstimatedPrice = async (
    pickupLat: string,
    pickupLng: string,
    dropOffLat: string,
    dropOffLng: string,
    vehicleTypeId: string
  ) => {
    if (pickupLat && pickupLng && dropOffLat && dropOffLng && vehicleTypeId) {
      try {
        const updatedFields = {
          lat1: Number(pickupLat),
          lng1: Number(pickupLng),
          lat2: Number(dropOffLat),
          lng2: Number(dropOffLng),
          vehicleTypeId: Number(vehicleTypeId),
        };
        try {
          const res = await axiosInstance.post(
            "api/v1/bookings/estimate/",
            updatedFields
          );

          if (
            res.status === 201 &&
            res.data?.data?.prices?.[0]?.estimatedPrice
          ) {
            const price = Math.floor(res.data.data.prices[0].estimatedPrice);
            console.log("Calculated price:", price); // Debug log
            setEstimatedPrice(price);
          } else {
            console.log("Invalid response structure:", res.data); // Debug log
            setEstimatedPrice(0);
          }
        } catch (e) {
          console.log("API Error:", e); // Debug log
          setEstimatedPrice(0);
        }
      } catch (err) {
        console.log("Error calculating estimate:", err);
        setEstimatedPrice(0);
      }
    } else {
      setEstimatedPrice(0);
    }
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
        phoneNumber,
      } = values;

      const finalReq = {
        pickupLat: Number(pickupLat),
        pickupLng: Number(pickupLng),
        dropOffLat: dropOffLat.toString(),
        dropOffLng: dropOffLng.toString(),
        pickupName,
        dropOffName,
        ...(driverId ? { driverId: Number(driverId) } : {}),
        ...(phoneNumber ? { contactPhoneNumber: phoneNumber } : {}),
        estimatedPrice: Number(estimatedPrice),
        estimatedTraveledDistance: 0,
        vehicleType: Number(vehicleTypeId),
        notifyNearbyDrivers: notifyDrivers,
      };

      console.log("Creating booking with data:", finalReq);
      const res = await axiosInstance.post("api/v1/bookings/admin", finalReq);
      if (res.status !== 201) {
        throw new Error(res.data.message || "Failed to create the booking.");
      }

      return res.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the booking.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editBooking(values: { [key: string]: any }) {
    try {
      const { id, distance, duration } = values;
      try {
        // Get the driver ID
        const res_primary = await axiosInstance.get(
          `/api/v1/bookings/${bookingData.id}?fields=driver.id`
        );
        const driverId = res_primary.data.data.driver.id;

        // End the booking with just the metrics
        const res = await axiosInstance.post(
          `api/v1/bookings/end/${bookingData.id}`,
          {
            distance: Number(distance) || bookingData.estimatedTraveledDistance,
            duration: Number(duration) || bookingData.estimatedDuration,
            driverId: Number(driverId),
          }
        );

        if (res.status !== 201) {
          throw new Error(res.data.message || "Failed to end the booking.");
        }

        return res.data;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while ending the booking.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.error("Error ending booking:", err);
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while ending the booking.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const {
    data: searchdDrivers,
    isLoading: isSearchingDrivers,
    error: driverSearchError,
  } = useQuery(
    ["searchDrivers", driverSearchTerm], // Query key includes search term
    async () => {
      const url = `/api/v1/drivers?filters=firstName=${driverSearchTerm}`; // Adjust the endpoint and filter key as needed
      const res = await axiosInstance.get(url);
      if (res.status !== 200) {
        throw new Error("Failed to fetch drivers");
      }
      return res.data.data; // Adjust based on your API response structure
    },
    {
      enabled: !!driverSearchTerm.trim(), // Only run the query if there's a search term
      staleTime: 0, // No caching for fresh searches
    }
  );

  const {
    data: searchedCorporates,
    isLoading: isSearchingCorporates,
    error: corporateSearchError,
  } = useQuery(
    ["searchCorporates", corporateSearchTerm], // Query key includes search term
    async () => {
      const url = `/api/v1/coorporate?filters=name=${corporateSearchTerm}`; // Adjust the endpoint and filter key as needed
      const res = await axiosInstance.get(url);
      if (res.status !== 200) {
        throw new Error("Failed to fetch corporates");
      }
      return res.data.data; // Adjust based on your API response structure
    },
    {
      enabled: !!corporateSearchTerm.trim(), // Only run the query if there's a search term
      staleTime: 0, // No caching for fresh searches
    }
  );

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

  const { data: searchResults, isLoading: isSearching } = useQuery(
    ["searchDrivers", searchInput], // Query key includes searchInput
    () => searchDriver(searchInput), // Fetch function
    {
      enabled: !!searchInput.trim(), // Only run query if input is not empty
      staleTime: 0, // No caching for fresh searches
      //keepPreviousData: true, // Keep previous results while fetching new data
    }
  );

  async function searchDriver(search: { search: any }) {
    // console.log(search, "search Input");
    const url = `/api/v1/drivers?filters=firstname=${search}`;
    const { data } = await axiosInstance.get(url);
    // setItemsOnPage(itemsOnPage);
    // setTotalItems(data.pagination.totalItems);
    // handleDriverNum(data.data.length);
    return data.data;
  }

  async function handleAssignBookingSubmit(driverId: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.post(
        `api/v1/bookings/accept/${bookingData.id}`,
        {
          driverId: driverId,
        }
      );
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(res_3.data.message || "Failed to assign the booking.");
      }
      toast.success(`Booking Assigned!`);
      queryClient.invalidateQueries({ queryKey: ["Bookings"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the booking.";
      toast.error(errorMessage || errorMessage);
    }
  }

  async function notifyDriver(driverId: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.post(
        `api/v1/bookings/notify-drivers/${bookingData.id}`,
        {
          drivers: [driverId],
        }
      );
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(res_3.data.message || "Failed to notify the driver.");
      }
      toast.success(`Driver Notified!`);
      queryClient.invalidateQueries({ queryKey: ["Bookings"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while notifying the driver.";
      toast.error(errorMessage || errorMessage);
    }
  }
  async function deleteBooking(id: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.delete(`/api/v1/bookings/${id}`);
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(res_3.data.message || "Failed to notify the booking.");
      }
      toast.success(`Booking Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Bookings"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while deleting the booking.";
      toast.error(errorMessage || errorMessage);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: !isEndBooking && bookingSchema,
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
    if (window.google && window.google.maps) {
      setIsGoogleLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    setEstimatedPrice(0);
    if (open) {
      if (isEdit) {
        formik.setValues(bookingData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, bookingData]);

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
                deleteBooking(bookingData.id);
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

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[600px] top-[5%] lg:top-[15%] translate-y-0 [&>button]:top-8 [&>button]:end-7">
          <DialogHeader className="py-4">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
            <KeenIcon icon="magnifier" className="text-gray-700 text-xl" />
            <input
              type="text"
              name="query"
              className="input px-0 border-none bg-transparent shadow-none ms-2.5"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Drivers"
            />
          </DialogHeader>
          <DialogBody className="p-0 pb-5">
            {/* <ModalSearchEmpty /> */}
            {isSearching && (
              <div className="menu menu-default p-0 flex-col">
                <div className="grid gap-1">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="menu-item animate-pulse">
                      <div className="menu-link flex justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-full size-9 shrink-0 bg-gray-300"></div>
                          <div className="flex flex-col gap-1">
                            <div className="h-4 bg-gray-300 rounded-md w-32"></div>
                            <div className="h-3 bg-gray-300 rounded-md w-20"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="badge badge-pill badge-outline gap-1.5 bg-gray-300 w-24 h-6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isSearching && searchResults?.length === 0 && (
              <ModalSearchNoResults />
            )}
            {searchResults?.length > 0 && (
              <div className="menu menu-default p-0 flex-col">
                <div className="grid gap-1">
                  {searchResults.map((driver: any, index: any) => (
                    <div
                      className="menu-item"
                      key={index}
                      onClick={() => {
                        if (isNotify) {
                          console.log("hi");
                          notifyDriver(driver.id);
                        } else {
                          handleAssignBookingSubmit(driver.id);
                        }
                      }}
                    >
                      <div className="menu-link flex justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`${BASE_URL}/profile/${driver.profilePhoto}`}
                            className="rounded-full size-9 shrink-0 object-cover"
                            alt={driver.name}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 hover:text-primary-active mb-px">
                              {driver.firstName} {driver.lastName}
                            </span>
                            <span className="text-2sm font-normal text-gray-500">
                              {driver.phoneNumber}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`badge badge-pill badge-outline ${driver.is_online ? "badge-success" : "badge-danger"} gap-1.5`}
                          >
                            <span
                              className={`badge badge-dot ${driver.is_online ? "badge-success" : "badge-danger"} size-1.5`}
                            ></span>
                            {driver.is_online ? "Online" : "Offline"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isSearching && !searchInput && !searchResults && (
              <ModalSearchEmpty />
            )}
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
          <h3 className="text-lg font-medium text-gray-900 text-center">
            {isEndBooking ? "Edit" : "Create"} a Booking
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            {!isEndBooking ? (
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
                  {isGoogleLoaded && (
                    <GooglePlacesAutocomplete
                      apiKey={
                        import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || ""
                      }
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
                            const service =
                              new google.maps.places.PlacesService(
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
                                calculateEstimatedPrice(
                                  place?.geometry?.location?.lat().toString() ||
                                    "",
                                  place?.geometry?.location?.lng().toString() ||
                                    "",
                                  formik.values.dropOffLat,
                                  formik.values.dropOffLng,
                                  formik.values.vehicleTypeId
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
                        placeholder: "Enter a dropOff location",
                      }}
                      autocompletionRequest={{
                        componentRestrictions: { country: "ET" }, // Restricting to Ethiopia
                      }}
                    />
                  )}
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
                  {isGoogleLoaded && (
                    <GooglePlacesAutocomplete
                      apiKey={
                        import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || ""
                      }
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
                            const service =
                              new google.maps.places.PlacesService(
                                document.createElement("div")
                              );
                            service.getDetails({ placeId }, (place, status) => {
                              if (
                                status ===
                                google.maps.places.PlacesServiceStatus.OK
                              ) {
                                formik.setFieldValue(
                                  "dropOffName",
                                  value.label
                                );
                                formik.setFieldValue(
                                  "dropOffLat",
                                  place?.geometry?.location?.lat()
                                );
                                formik.setFieldValue(
                                  "dropOffLng",
                                  place?.geometry?.location?.lng()
                                );
                                calculateEstimatedPrice(
                                  formik.values.pickupLat,
                                  formik.values.pickupLng,
                                  place?.geometry?.location?.lat().toString() ||
                                    "",
                                  place?.geometry?.location?.lng().toString() ||
                                    "",
                                  formik.values.vehicleTypeId
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
                        placeholder: "Enter a pickUp location",
                      }}
                      autocompletionRequest={{
                        componentRestrictions: { country: "ET" }, // Restricting to Ethiopia
                      }}
                    />
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
                        onChange={(e) => {
                          formik.handleChange(e);
                          calculateEstimatedPrice(
                            formik.values.pickupLat,
                            formik.values.pickupLng,
                            formik.values.dropOffLat,
                            formik.values.dropOffLng,
                            e.target.value
                          );
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

                <label className="form-label text-gray-900">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={notifyDrivers}
                    onChange={(e) => setNotifyDrivers(e.target.checked)}
                  />
                  Notify nearby drivers
                </label>
                <div>
                  <label className="form-label text-gray-900">
                    Estimated Price:{" "}
                    {estimatedPrice > 0
                      ? `${estimatedPrice} Birr`
                      : "Calculating..."}
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center grow"
                  disabled={
                    !formik.values.pickupName ||
                    !formik.values.dropOffName ||
                    !formik.values.vehicleTypeId ||
                    estimatedPrice === 0
                  }
                >
                  {isEdit ? "Edit" : "Create"}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Actual Distance (km)
                  </label>
                  {formik.touched.distance && formik.errors.distance ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.distance === "string"
                        ? formik.errors.distance
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      type="number"
                      step="0.1"
                      placeholder={`Estimated: ${bookingData?.estimatedTraveledDistance || 0} km`}
                      autoComplete="off"
                      {...formik.getFieldProps("distance")}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Actual Duration (minutes)
                  </label>
                  {formik.touched.duration && formik.errors.duration ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.duration === "string"
                        ? formik.errors.duration
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      type="number"
                      step="1"
                      placeholder={`Estimated: ${bookingData?.estimatedDuration || 0} min`}
                      autoComplete="off"
                      {...formik.getFieldProps("duration")}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center grow"
                  disabled={!formik.values.distance || !formik.values.duration}
                >
                  End Booking
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
