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
  corporateId: Yup.number(),
});

interface IModalBookingFormProps {
  open: boolean;
  isEdit: boolean;
  isEndBooking: boolean;
  bookingData: any;
  onOpenChange: () => void;
}

const ModalBookingForm = ({
  open,
  onOpenChange,
  isEdit,
  isEndBooking,
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
  const [bookingType, setBookingType] = useState<"user" | "corporate" | null>(
    null
  );
  const [notifyDrivers, setNotifyDrivers] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEndBooking ? editBooking : addBooking,
    onSuccess: () => {
      toast.success(`Booking ${isEndBooking ? "Completed" : "Created"}`);
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
    corporateId: "",
    vehicleTypeId: "",
    distance: "",
    duration: "",
    phoneNumber: "",
    // status: "",
    // remark: "",
    // traveledPath: "",
    // polyline: "",
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

          if (res.status === 200) {
            const price = Math.floor(res.data.data.prices[0].estimatedPrice);
            setEstimatedPrice(price);
          }
        } catch (e) {
          console.log(e, "the error");
        }
      } catch (err) {
        console.log("Error calculating estimate:", err);
      }
    }
  };

  async function addBooking(values: { [key: string]: any }) {
    console.log(values, "the values baby");
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
        corporateId,
        phoneNumber,
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
      const price = Math.floor(res.data.data.prices[0].estimatedPrice);

      const finalReq = {
        pickupLat: pickupLat.toString(),
        pickupLng: pickupLng.toString(),
        dropOffLat: dropOffLat.toString(),
        dropOffLng: dropOffLng.toString(),
        pickupName,
        dropOffName,
        ...(driverId ? { driverId: Number(driverId) } : {}),
        ...(corporateId ? { coorId: Number(corporateId) } : {}),
        ...(phoneNumber ? { contactPhoneNumber: phoneNumber } : {}),
        estimatedPrice: price,
        estimatedTraveledDistance: distance,
        vehicleType: Number(vehicleTypeId),
        notifyNearbyDrivers: notifyDrivers,
      };

      const res_3 = await axiosInstance.post("api/v1/bookings/admin", finalReq);
      if (res_3.status !== 201) {
        throw new Error(res_3.data.message || "Failed to create the booking.");
      }

      return res_3.data;
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
      // const updatedFields = {
      //   status,
      //   remark,
      //   traveledPath,
      //   polyline,
      // };
      // console.log(updatedFields, "the updated fields");
      try {
        const res_primary = await axiosInstance.get(
          `/api/v1/bookings/${bookingData.id}?fields=driver.id`
        );
        const res = await axiosInstance.post(
          `api/v1/bookings/end/${bookingData.id}`,
          {
            actualtraveledPath: "_p~iF~ps|U_ulLnnqC_mqNrxq1oK5bM",
            distance: distance,
            duration: duration,
            driverId: `${res_primary.data.data.driver.id}`,
          }
        );
        if (res.status !== 201) {
          throw new Error(res.data.message || "Failed to edit the booking.");
        }
        return res.data;
      } catch (err: any) {
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
  // const {
  //   data: corporates,
  //   isLoading: isCorporateLoading,
  //   error: corporatesError,
  // } = useQuery("corporates", async () => {
  //   const res = await axiosInstance.get("api/v1/coorporate");
  //   if (res.status !== 200) {
  //     throw new Error("Failed to fetch corporates");
  //   }
  //   const data = res.data;
  //   console.log("corporates list", data.data);
  //   return data.data;
  // });

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
                        handleAssignBookingSubmit(driver.id);
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
                      autocompletionRequest={{
                        componentRestrictions: { country: "ET" }, // Restricting to Ethiopia
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <label className="form-label text-gray-900">
                    Booking Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bookingType"
                        value="user"
                        checked={bookingType === "user"}
                        onChange={(e) => setBookingType("user")}
                        className="radio radio-primary"
                      />
                      <span>User</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bookingType"
                        value="corporate"
                        checked={bookingType === "corporate"}
                        onChange={(e) => setBookingType("corporate")}
                        className="radio radio-primary"
                      />
                      <span>Corporate</span>
                    </label>
                  </div>
                </div>

                {bookingType === "user" && (
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">
                      Phone Number
                    </label>
                    {/* Your existing phone number input code */}
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-gray-300 rounded px-2 py-2 text-gray-900"
                        disabled={isEdit}
                        defaultValue="+251"
                      >
                        <option value="+251">+251</option>
                      </select>
                      <label className="input flex-1">
                        <input
                          placeholder="Enter phone number"
                          autoComplete="off"
                          disabled={isEdit}
                          {...formik.getFieldProps("phoneNumber")}
                        />
                      </label>
                    </div>
                  </div>
                )}
                {bookingType === "corporate" && (
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">
                      Search for Corporate
                    </label>
                    <input
                      type="text"
                      placeholder="Search corporates..."
                      value={corporateSearchTerm}
                      onChange={(e) => {
                        setCorporateSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 ${
                        formik.values.corporateId
                          ? "bg-gray-100"
                          : "bg-transparent"
                      }`}
                      style={{
                        backgroundColor: formik.values.corporateId
                          ? "#f3f4f6"
                          : "transparent", // Light gray background when a corporate is selected
                      }}
                    />
                    {showDropdown && (
                      <div className="mt-2 max-h-40 overflow-y-auto shadow-sm rounded-lg border border-gray-200 bg-white">
                        {isSearchingCorporates ? (
                          <div className="p-3 text-gray-500 text-sm">
                            Loading...
                          </div>
                        ) : corporateSearchError ? (
                          <div className="p-3 text-red-500 text-sm">
                            Error loading corporates
                          </div>
                        ) : searchedCorporates?.length > 0 ? (
                          searchedCorporates.map((corporate: any) => (
                            <div
                              key={corporate.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                              onClick={() => {
                                console.log(corporate.id, "the corporate id");
                                formik.setFieldValue(
                                  "corporateId",
                                  corporate.id.toString()
                                );
                                setCorporateSearchTerm(corporate.name); // Update search term to show selected corporate
                                setShowDropdown(false); // Hide dropdown after selection
                              }}
                            >
                              <span className="text-gray-900 font-medium">
                                {corporate.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500 text-sm">
                            No corporates found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* {bookingType === "corporate" && (
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">
                      Search for Corporate
                    </label>
                    <input
                      type="text"
                      placeholder="Search corporates..."
                      value={corporateSearchTerm}
                      onChange={(e) => setCorporateSearchTerm(e.target.value)}
                      className="form-control w-full"
                      style={{
                        backgroundColor: "transparent",
                        outline: "none",
                        borderColor: "blue",
                      }}
                    />
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {isSearchingCorporates ? (
                        <div className="p-2 text-gray-500">Loading...</div>
                      ) : corporateSearchError ? (
                        <div className="p-2 text-red-500">
                          Error loading corporates
                        </div>
                      ) : searchedCorporates?.length > 0 ? (
                        searchedCorporates.map((corporate: any) => (
                          <div
                            key={corporate.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              formik.setFieldValue("corporateId", corporate.id);
                              setCorporateSearchTerm(corporate.name); // Update search term to show selected corporate
                            }}
                          >
                            {corporate.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">
                          No corporates found
                        </div>
                      )}
                    </div>
                  </div>
                )} */}
                {/* {bookingType === "corporate" && (
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">
                      Search for Corporate
                    </label>
                    <label className="input">
                      <select
                        {...formik.getFieldProps("corporateId")}
                        className="form-control form-select w-full"
                        style={{
                          backgroundColor: "transparent",
                          outline: "none",
                          borderColor: "blue",
                        }}
                      >
                        <option value="" disabled>
                          Select a Corporate
                        </option>
                        {corporates?.map(
                          (corporate: { id: number; name: string }) => (
                            <option key={corporate.id} value={corporate.id}>
                              {corporate.name}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>
                )} */}

                {/* <div className="flex flex-col gap-1">
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
                </div> */}
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Search for drivers
                  </label>
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={driverSearchTerm}
                    onChange={(e) => {
                      setDriverSearchTerm(e.target.value);
                      setShowDriverDropdown(true);
                    }}
                    onFocus={() => setShowDriverDropdown(true)}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 ${
                      formik.values.driverId ? "bg-gray-100" : "bg-transparent"
                    }`}
                    style={{
                      backgroundColor: formik.values.driverId
                        ? "#f3f4f6"
                        : "transparent", // Light gray background when a corporate is selected
                    }}
                  />
                  {showDriverDropdown && (
                    <div className="mt-2 max-h-40 overflow-y-auto shadow-sm rounded-lg border border-gray-200 bg-white">
                      {isSearchingDrivers ? (
                        <div className="p-3 text-gray-500 text-sm">
                          Loading...
                        </div>
                      ) : driverSearchError ? (
                        <div className="p-3 text-red-500 text-sm">
                          Error loading drivers
                        </div>
                      ) : searchdDrivers?.length > 0 ? (
                        searchdDrivers.map((driver: any) => (
                          <div
                            key={driver.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            onClick={() => {
                              formik.setFieldValue(
                                "driverId",
                                driver.id.toString()
                              );
                              setDriverSearchTerm(driver.firstName); // Update search term to show selected drivers
                              setShowDriverDropdown(false); // Hide dropdown after selection
                            }}
                          >
                            <span className="text-gray-900 font-medium">
                              {driver.firstName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-sm">
                          No driver found
                        </div>
                      )}
                    </div>
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
                    Estimated Price: {estimatedPrice} Birr
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center grow"
                  disabled={estimatedPrice === 0}
                >
                  {isEdit ? "Edit" : "Create"}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">duration</label>
                  <label className="input">
                    <input
                      placeholder="Enter duration"
                      autoComplete="off"
                      {...formik.getFieldProps("duration")}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">distance</label>
                  <label className="input">
                    <input
                      placeholder="Enter distance"
                      autoComplete="off"
                      {...formik.getFieldProps("distance")}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center grow"
                  // disabled={isLoading}
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
