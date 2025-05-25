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
import { useMutation, useQueryClient, useQuery } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";
import clsx from "clsx";

const driverSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  middleName: Yup.string().required("Middle name is required."),
  gender: Yup.string().required("Gender is required."),
  phoneNumber: Yup.string()
    .required("Phone number is required.")
    .matches(/^\d{9}$/, {
      message: "Invalid phone number.",
    }),
  drivingLicense: Yup.mixed().required("Driving license is required."),
  profilePhoto: Yup.mixed().required("Profile photo is required."),
});

const VehicleAssignSchema = Yup.object().shape({
  vehicleId: Yup.number().required("Vehicle is required."),
});

const approvalSchema = Yup.object().shape({
  approvalStatus: Yup.string().required("Approval status is required."),
});

interface IModalDriverTypeFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  isDelete?: boolean;
  isAssigned?: boolean;
  driverData: any;
  onOpenChange: () => void;
}

const ModalDriverTypeForm = ({
  open,
  onOpenChange,
  isEdit,
  isApproved,
  isDelete,
  isAssigned,
  driverData,
}: IModalDriverTypeFormProps) => {
  const [plateNumberSearchTerm, setPlateSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [vehicleName, setVehicleName] = useState("");
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isApproved
      ? approveDriver
      : isEdit
        ? editDriver
        : isAssigned
          ? assignVehicleDriver
          : addDriver,
    onSuccess: () => {
      toast.success(
        `${isApproved ? "Driver Approved" : isEdit ? "Driver Edited" : isAssigned ? "Vehicle Assigned" : "Driver Created"}`
      );
      queryClient.invalidateQueries({ queryKey: ["Drivers"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const {
    data: searchedPlates,
    isLoading: isSearchingPlates,
    error: plateSearchError,
  } = useQuery(
    ["searchPlates", plateNumberSearchTerm], // Query key includes search term
    async () => {
      const url = `/api/v1/vehicles?filters=plate_number=${plateNumberSearchTerm}`; // Adjust the endpoint and filter key as needed
      const res = await axiosInstance.get(url);
      console.log(res.data.data[0].make, "THe respponse");
      if (res?.status !== 200) {
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
    if (res.status !== 200) {
      throw new Error("Failed to fetch vehicle");
    }
    const data = res.data;
    return data.data;
  });

  useEffect(() => {
    setVehicleName("");
  }, []);

  async function assignVehicleDriver(values: any) {
    try {
      const updatedFields = {
        driverId: +driverData.id,
        vehicleId: +values.vehicleId,
      };
      console.log(updatedFields, "updated fields");
      const res = await axiosInstance.patch(
        `/api/v1/drivers/assign-vehicle/`,
        updatedFields
      );

      console.log(res, "returned");
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while assigning the driver.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function approveDriver(values: Object) {
    try {
      const { id, approvalStatus } = values as {
        id: string;
        approvalStatus: string;
      };
      const updatedFields = {
        status: approvalStatus,
      };

      const res = await axiosInstance.patch(
        `/api/v1/drivers/toggleStatus/${driverData.id}`,
        updatedFields
      );
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while approving the driver.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function deleteDriver(id: any) {
    try {
      // console.log("booking id", bookingData.id);
      // console.log("driver id", driverId);

      const res_3 = await axiosInstance.delete(`/api/v1/drivers/${id}`);
      console.log(res_3, "result");
      if (res_3.status !== 200) {
        throw new Error(res_3.data.message || "Failed to notify the Driver.");
      }
      toast.success(`Driver Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Drivers"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while deleting the Driver.";
      toast.error(errorMessage || errorMessage);
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
        type: "",
        drivingLicense: "",
        profilePhoto: null,
        approvalStatus: "inactive",
        vehicleId: "",
      };

  async function addDriver(values: any) {
    try {
      const formData = new FormData();
      formData.append("file", values.profilePhoto);
      const res_1 = await axiosInstance.post(
        `/api/v1/file-upload/image/profile`,
        formData
      );

      const driverLicenseData = new FormData();
      driverLicenseData.append("file", values.drivingLicense);
      const res_2 = await axiosInstance.post(
        `/api/v1/file-upload/image/license`,
        driverLicenseData
      );

      if (res_1?.status === 201 && res_2?.status === 201) {
        const profile = res_1.data.data.filename;
        const license = res_2.data.data.filename;
        let { profilePhoto, drivingLicense, vehicleId, ...rest } = values;
        rest = { ...rest, profilePhoto: profile, drivingLicense: license };
        console.log(rest, "result to be sent");
        const res = await axiosInstance.post(`/api/v1/drivers`, rest);
        return res.data;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the driving.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editDriver(values: any) {
    try {
      const {
        id,
        firstName,
        lastName,
        middleName,
        gender,
        type,
        phoneNumber,
        drivingLicense,
        profilePhoto,
      } = values;
      let updatedValues: any = {
        firstName,
        lastName,
        middleName,
        gender,
        type,
        phoneNumber,
        drivingLicense,
      };

      const formData = new FormData();
      if (profilePhoto instanceof File) {
        formData.append("file", profilePhoto);

        const res_1 = await axiosInstance.post(
          `/api/v1/file-upload/image/profile`,
          formData
        );
        console.log("Profile edited!");
        if (res_1?.status === 201) {
          const profile = res_1.data.data.filename;
          updatedValues = { ...updatedValues, profilePhoto: profile };
          // console.log(updatedValues, "result to be sent");
        }
      }
      try {
        const res = await axiosInstance.patch(
          `/api/v1/drivers/${id}`,
          updatedValues
        );
        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message ||
          "An error occurred while editing the driver.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while editing the driver.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: isApproved
      ? approvalSchema
      : isAssigned
        ? VehicleAssignSchema
        : driverSchema,
    // [Todo ] : The try catch logic must be moved out of this.
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        if (!isApproved) {
          const formData = new FormData();
          if (values.profilePhoto) {
            formData.append("profilePhoto", values.profilePhoto);
          }
          let { approvalStatus, ...updatedValues } = values;
          updatedValues = { ...updatedValues, firebaseToken: "testToken" };
          mutate(updatedValues);
        } else {
          mutate(values);
        }
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
                deleteDriver(driverData.id);
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
                      className="form-control form-select w-full outline-none bg-transparent"
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
          ) : isAssigned ? (
            // New assigned form content - initially same as approval
            <>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
                Assign Vehicle
              </h3>
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-5"
              >
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
                        <option value="Select a vehicle">
                          Select a vehicle
                        </option>
                        {Vehicle?.map(
                          (vehicle: { id: number; make: string }) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {`${vehicle?.make}`}
                            </option>
                          )
                        )}
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
                  <label className="form-label text-gray-900">
                    Plate number
                  </label>
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
                        <div className="p-3 text-gray-500 text-sm">
                          Loading...
                        </div>
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
                              console.log("vehicle", vehicle.make);
                              setVehicleName(vehicle.make);
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
                  <span className="my-4 form-label text-gray-900">
                    Make: {vehicleName && !showDropdown ? vehicleName : ""}
                  </span>
                </div>
                <div className="flex justify-center mt-4">
                  <button type="submit" className="btn btn-primary">
                    Assign
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
                  {formik.touched.firstName && formik.errors.firstName ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.firstName === "string"
                        ? formik.errors.firstName
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter first name"
                      autoComplete="off"
                      {...formik.getFieldProps("firstName")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Middle Name
                  </label>
                  {formik.touched.middleName && formik.errors.middleName ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.middleName === "string"
                        ? formik.errors.middleName
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter middle name"
                      autoComplete="off"
                      {...formik.getFieldProps("middleName")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Last Name</label>
                  {formik.touched.lastName && formik.errors.lastName ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.lastName === "string"
                        ? formik.errors.lastName
                        : null}
                    </div>
                  ) : null}
                  <label className="input">
                    <input
                      placeholder="Enter last name"
                      autoComplete="off"
                      {...formik.getFieldProps("lastName")}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Gender</label>
                  <label className="input">
                    <select
                      {...formik.getFieldProps("gender")}
                      className={clsx(
                        "form-control form-select w-full outline-none",
                        {
                          "is-invalid":
                            formik.touched.gender && formik.errors.gender,
                        },
                        {
                          "is-valid":
                            formik.touched.gender && !formik.errors.gender,
                        }
                      )}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  {formik.touched.gender && formik.errors.gender && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.gender === "string" &&
                        formik.errors.gender}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Phone Number
                  </label>
                  {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.phoneNumber === "string"
                        ? formik.errors.phoneNumber
                        : null}
                    </div>
                  ) : null}

                  {/* A row containing the dropdown (left) and input (right) */}
                  <div className="flex items-center gap-2">
                    {/* Country code dropdown */}
                    <select
                      className="border border-gray-300 rounded px-2 py-2 text-gray-900"
                      disabled={isEdit}
                      defaultValue="+251" // If you want to default to +251
                    >
                      <option value="+251">+251</option>
                    </select>

                    <label className="input flex-1">
                      <input
                        placeholder="Enter phone number"
                        autoComplete="off"
                        // disabled={isEdit}
                        {...formik.getFieldProps("phoneNumber")}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Driving License
                  </label>
                  {formik.touched.drivingLicense &&
                  formik.errors.drivingLicense ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.drivingLicense === "string"
                        ? formik.errors.drivingLicense
                        : null}
                    </div>
                  ) : null}
                  <label className="input max-w-[390px] overflow-hidden">
                    <input
                      type="file"
                      name="drivingLicense"
                      onChange={(event) => {
                        if (
                          event.currentTarget.files &&
                          event.currentTarget.files[0]
                        ) {
                          formik.setFieldValue(
                            "drivingLicense",
                            event.currentTarget.files[0]
                          );
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Profile Photo
                  </label>
                  {formik.touched.profilePhoto && formik.errors.profilePhoto ? (
                    <div className="text-red-500 text-sm">
                      {typeof formik.errors.profilePhoto === "string"
                        ? formik.errors.profilePhoto
                        : null}
                    </div>
                  ) : null}
                  <label className="input  max-w-[390px] overflow-hidden">
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={(event) => {
                        if (
                          event.currentTarget.files &&
                          event.currentTarget.files[0]
                        ) {
                          formik.setFieldValue(
                            "profilePhoto",
                            event.currentTarget.files[0]
                          );
                        }
                      }}
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
