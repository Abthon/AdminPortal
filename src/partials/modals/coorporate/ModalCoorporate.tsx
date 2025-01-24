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

const coorporateSchema = Yup.object().shape({
  name: Yup.string().required("name is required."),
  email: Yup.string().required("email is required."),
  password: Yup.string().required("password is required."),
  creditLimit: Yup.number().required("creditLimit is required"),
  contractLength: Yup.string().required("contractLength is required."),
  paymentPlan: Yup.number().required("payment Plan is required."),
  license: Yup.string().required("license is required."),
  tinNo: Yup.string().required("tin number is required."),
  address: Yup.string().required("address is required."),
  contactPhoneNumber: Yup.string().required(
    "Contact Phone number is required."
  ),
  backupContactPhoneNumber: Yup.string().required(
    "Backup Phone number is required."
  ),
  nationalId: Yup.number().required("nationalId is required."),
  officialStampedLetter: Yup.mixed().required("Stamped Letter is required."),
});

const approvalSchema = Yup.object().shape({
  status: Yup.string().required("Approval status is required."),
});

interface IModalCoorporateFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  CoorporateData: any;
  onOpenChange: () => void;
}

const ModalCoorporateForm = ({
  open,
  onOpenChange,
  isEdit,
  isApproved,
  CoorporateData,
}: IModalCoorporateFormProps) => {
  // console.log(isEdit);
  // console.log(CoorporateData, isEdit)
  // ;
  // console.log(isApproved);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isApproved
      ? approveCoorporate
      : isEdit
        ? editCoorporate
        : addCoorporate,
    // mutationFn: isEdit ? editCoorporate : addCoorporate,
    onSuccess: () => {
      toast.success(
        `Coorporate  ${isApproved ? "Approved" : isEdit ? "Edited" : "Created"}`
      );
      queryClient.invalidateQueries({ queryKey: ["Coorporate"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  async function approveCoorporate(values: Object) {
    // console.log("hi");
    // console.log(values);
    try {
      const { id, status } = values as {
        id: string;
        status: string;
      };
      const updatedFields = {
        status: status,
      };

      const res = await axiosInstance.patch(
        `/api/v1/coorporate/toggleStatus/${CoorporateData.id}`,
        updatedFields
      );
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while approving the coorporate.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }
  // const initialValues = isEdit ? CoorporateData : {};
  const initialValues = isEdit
    ? CoorporateData
    : {
        name: "",
        email: "",
        creditLimit: "",
        //contractLength: "2024-12-31T00:00:00.000Z",
        contractlength: "",
        paymentPlan: "",
        license: "",
        tinNo: "",
        address: "",
        contactPhoneNumber: "",
        backupContactPhoneNumber: "",
        nationalId: "",
      };

  async function addCoorporate(values: { [key: string]: any }) {
    try {
      const { officialStampedLetter, ...updatedFields } = values as {
        officialStampedLetter: File;
        [key: string]: any;
      };
      const formData = new FormData();
      if (officialStampedLetter) {
        formData.append("file", officialStampedLetter);
      }
      console.log(formData, "formdata");

      const res = await axiosInstance.post(
        `api/v1/file-upload/image/license`,
        formData
      );

      console.log(res, "res");

      //res.data.data.filename
      const officialStampedLetter_res = res.data.data.filename;

      if (res.status !== 201) {
        throw new Error(res.data.message || "Failed to add coorporate.");
      }

      console.log(officialStampedLetter_res, "officialStampedLetter_res");

      const lastData = {
        ...updatedFields,
        officialStampedLetter: officialStampedLetter_res,
      };

      console.log(lastData, "last data");

      const res_3 = await axiosInstance.post("api/v1/coorporate", lastData);

      console.log(res_3.status, "res_3"); //here

      if (res_3.status !== 201) {
        throw new Error(
          res_3.data.message || "Failed to create the coorporate."
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
        "An error occurred while adding the coorporate.";
      throw new Error(errorMessage || errorMessageAlt);
    }

    // //data.data.filename

    // console.log(data);
  }

  async function editCoorporate(values: { [key: string]: any }) {
    try {
      const { officialStampedLetter, id, ...updatedFields } = values as {
        officialStampedLetter: File;
        id: string;
        [key: string]: any;
      };
      let officialStampedLetter_res;
      const formData = new FormData();

      if (officialStampedLetter instanceof File) {
        formData.append("file", officialStampedLetter);
        const res = await axiosInstance.post(
          `api/v1/file-upload/image/license`,
          formData
        );

        console.log(res, "res");

        //res.data.data.filename
        officialStampedLetter_res = res.data.data.filename;

        if (res.status !== 201) {
          throw new Error(res.data.message || "Failed to edit the coorporate.");
        }
      }

      console.log(officialStampedLetter_res, "officialStampedLetter_res");

      const lastData = {
        name: updatedFields.name,
        email: updatedFields.email,
        creditLimit: updatedFields.creditLimit,
        contractLength: updatedFields.contractLength,
        paymentPlan: updatedFields.paymentPlan,
        license: updatedFields.license,
        tinNo: updatedFields.tinNo,
        address: updatedFields.address,
        contactPhoneNumber: updatedFields.contactPhoneNumber,
        backupContactPhoneNumber: updatedFields.backupContactPhoneNumber,
        nationalId: +updatedFields.nationalId,
        ...(officialStampedLetter_res !== undefined && {
          officialStampedLetter: officialStampedLetter_res,
        }),
      };

      console.log(lastData);

      const res_3 = await axiosInstance.patch(
        `api/v1/coorporate/${id}`,
        lastData
      );

      console.log(res_3);

      if (res_3.status !== 200) {
        throw new Error(
          res_3.data.message || "Failed to update the coorporate."
        );
      }

      const data_3 = res_3.data;
      return data_3;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while editing the coorporate.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: isApproved ? approvalSchema : coorporateSchema,
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
    //console.log("there rh", isEdit);
    if (open) {
      if (isEdit) {
        formik.setValues(CoorporateData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, CoorporateData]);

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
                Approve Coorporate
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
                      {...formik.getFieldProps("status")}
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    Approve
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
                {isEdit ? "Edit" : "Create"} a Coorporate
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
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.name && formik.errors.name,
                        },
                        {
                          "is-valid":
                            formik.touched.name && !formik.errors.name,
                        }
                      )}

                      // className={clsx("form-control", {
                      //   "is-invalid": formik.touched.email && formik.errors.email,
                      // })}
                    />
                  </label>
                  {formik.touched.name && formik.errors.name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.name === "string" &&
                        formik.errors.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Email</label>
                  <label className="input">
                    <input
                      placeholder="Enter email"
                      autoComplete="off"
                      {...formik.getFieldProps("email")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.email && formik.errors.email,
                        },
                        {
                          "is-valid":
                            formik.touched.email && !formik.errors.email,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.email && formik.errors.email && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.email === "string" &&
                        formik.errors.email}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Password</label>
                  <label className="input">
                    <input
                      placeholder="Enter password"
                      type="password"
                      autoComplete="off"
                      {...formik.getFieldProps("password")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.password && formik.errors.password,
                        },
                        {
                          "is-valid":
                            formik.touched.password && !formik.errors.password,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.password && formik.errors.password && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.password === "string" &&
                        formik.errors.password}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Credit Limit
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter creditLimit"
                      autoComplete="off"
                      {...formik.getFieldProps("creditLimit")}
                      type="number"
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.creditLimit &&
                            formik.errors.creditLimit,
                        },
                        {
                          "is-valid":
                            formik.touched.creditLimit &&
                            !formik.errors.creditLimit,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.creditLimit && formik.errors.creditLimit && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.creditLimit === "string" &&
                        formik.errors.creditLimit}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Contract Length
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter contractLength"
                      autoComplete="off"
                      {...formik.getFieldProps("contractLength")}
                      type="date"
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.contractLength &&
                            formik.errors.contractLength,
                        },
                        {
                          "is-valid":
                            formik.touched.contractLength &&
                            !formik.errors.contractLength,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.contractLength &&
                    formik.errors.contractLength && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {typeof formik.errors.contractLength === "string" &&
                          formik.errors.contractLength}
                      </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Payment Plan
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter paymentPlan"
                      autoComplete="off"
                      type="number"
                      {...formik.getFieldProps("paymentPlan")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.paymentPlan &&
                            formik.errors.paymentPlan,
                        },
                        {
                          "is-valid":
                            formik.touched.paymentPlan &&
                            !formik.errors.paymentPlan,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.paymentPlan && formik.errors.paymentPlan && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.paymentPlan === "string" &&
                        formik.errors.paymentPlan}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">License</label>
                  <label className="input">
                    <input
                      placeholder="Enter License"
                      autoComplete="off"
                      {...formik.getFieldProps("license")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.license && formik.errors.license,
                        },
                        {
                          "is-valid":
                            formik.touched.license && !formik.errors.license,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.license && formik.errors.license && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.license === "string" &&
                        formik.errors.license}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Tin No</label>
                  <label className="input">
                    <input
                      placeholder="Enter tinNo"
                      autoComplete="off"
                      {...formik.getFieldProps("tinNo")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.tinNo && formik.errors.tinNo,
                        },
                        {
                          "is-valid":
                            formik.touched.tinNo && !formik.errors.tinNo,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.tinNo && formik.errors.tinNo && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.tinNo === "string" &&
                        formik.errors.tinNo}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Address</label>
                  <label className="input">
                    <input
                      placeholder="Enter address"
                      autoComplete="off"
                      {...formik.getFieldProps("address")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.address && formik.errors.address,
                        },
                        {
                          "is-valid":
                            formik.touched.address && !formik.errors.address,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.address && formik.errors.address && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.address === "string" &&
                        formik.errors.address}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Contact Phone Number
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter contact phoneNumber"
                      autoComplete="off"
                      {...formik.getFieldProps("contactPhoneNumber")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.contactPhoneNumber &&
                            formik.errors.contactPhoneNumber,
                        },
                        {
                          "is-valid":
                            formik.touched.contactPhoneNumber &&
                            !formik.errors.contactPhoneNumber,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.contactPhoneNumber &&
                    formik.errors.contactPhoneNumber && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {typeof formik.errors.contactPhoneNumber === "string" &&
                          formik.errors.contactPhoneNumber}
                      </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    Backup Contact Phone Number
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter backup contact phoneNumber"
                      autoComplete="off"
                      {...formik.getFieldProps("backupContactPhoneNumber")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.backupContactPhoneNumber &&
                            formik.errors.backupContactPhoneNumber,
                        },
                        {
                          "is-valid":
                            formik.touched.backupContactPhoneNumber &&
                            !formik.errors.backupContactPhoneNumber,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.backupContactPhoneNumber &&
                    formik.errors.backupContactPhoneNumber && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {typeof formik.errors.backupContactPhoneNumber ===
                          "string" && formik.errors.backupContactPhoneNumber}
                      </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    National Id
                  </label>
                  <label className="input">
                    <input
                      placeholder="Enter nationalId"
                      autoComplete="off"
                      type="number"
                      {...formik.getFieldProps("nationalId")}
                      className={clsx(
                        "form-control bg-transparent",
                        {
                          "is-invalid":
                            formik.touched.nationalId &&
                            formik.errors.nationalId,
                        },
                        {
                          "is-valid":
                            formik.touched.nationalId &&
                            !formik.errors.nationalId,
                        }
                      )}
                    />
                  </label>
                  {formik.touched.nationalId && formik.errors.nationalId && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.nationalId === "string" &&
                        formik.errors.nationalId}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">
                    officialStampedLetter
                  </label>

                  <label className="input  max-w-[390px] overflow-hidden">
                    <input
                      type="file"
                      name="file"
                      onChange={(event) => {
                        const file = event.target.files
                          ? event.target.files[0]
                          : null;
                        formik.setFieldValue("officialStampedLetter", file);
                      }}
                    />
                  </label>
                  {formik.errors.officialStampedLetter && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {typeof formik.errors.officialStampedLetter ===
                        "string" && formik.errors.officialStampedLetter}
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
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalCoorporateForm };
