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
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";

const bankSchema = Yup.object().shape({
  name: Yup.string().required("name is required."),
  accountNumber: Yup.string().required("accountNumber is required."),
  accountName: Yup.string().required("accountName is required."),
  // isApproved: Yup.string()
  //   .oneOf(["true", "false"], "Invalid status")
  //   .required("Status is required"),
});

interface IModalBankFormProps {
  open: boolean;
  isEdit: boolean;
  isApproved: boolean;
  bankData: any;
  onOpenChange: () => void;
}

const ModalBankForm = ({
  open,
  onOpenChange,
  isEdit,
  bankData,
}: IModalBankFormProps) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: isEdit ? editBank : addBank,
    onSuccess: () => {
      toast.success(`Bank ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Banks"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = isEdit
    ? bankData
    : {
        name: "",
        accountNumber: "",
        accountName: "",
      };

  async function addBank(values: any) {
    try {
      // Convert `isapproved` to a boolean if it exists in `values`
      if (values.isApproved !== undefined) {
        values.isApproved = values.isApproved === "true";
      }

      console.log(values, "values");

      const res = await axiosInstance.post(`/api/v1/banks`, values);
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while adding the bank.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function editBank(values: any) {
    try {
      const { id, name, accountName, accountNumber, isApproved } = values;

      // Convert `isApproved` to a boolean if it exists
      const updatedValues: any = {
        name,
        accountName,
        accountNumber,
        isApproved: isApproved === "true",
      };

      try {
        const res = await axiosInstance.patch(
          `/api/v1/banks/${id}`,
          updatedValues
        );
        return res.data;
      } catch (err: any) {
        console.log(err, "The error");
        const errorMessage = err?.response?.data?.message;
        const errorMessageAlt =
          (err as Error).message || "An error occurred while editing the bank.";
        throw new Error(errorMessage || errorMessageAlt);
      }
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while editing the bank.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: bankSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        mutate(values);
      } catch {
        toast("There was an error! Try again");
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(bankData || {}); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, bankData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
              {isEdit ? "Edit" : "Create"} a Bank
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
                <label className="form-label text-gray-900">
                  Account Number
                </label>
                {formik.touched.accountNumber && formik.errors.accountNumber ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.accountNumber === "string"
                      ? formik.errors.accountNumber
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <input
                    placeholder="Enter accountNumber"
                    autoComplete="off"
                    {...formik.getFieldProps("accountNumber")}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Account Name</label>
                {formik.touched.accountName && formik.errors.accountName ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.accountName === "string"
                      ? formik.errors.accountName
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <input
                    placeholder="Enter accountName"
                    autoComplete="off"
                    {...formik.getFieldProps("accountName")}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Status</label>

                <select
                  {...formik.getFieldProps("isApproved")}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="true">Accept</option>
                  <option value="false">Reject</option>
                </select>
              </div>

              {/* <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">isApproved</label>
                {formik.touched.isApproved && formik.errors.isApproved ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.isApproved === "string"
                      ? formik.errors.isApproved
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <select
                    disabled={isEdit}
                    {...formik.getFieldProps("isApproved")}
                    className="form-control form-select w-full outline-none bg-transparent"
                  >
                    <option value="">Select isApproved</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
              </div> */}
              <button
                type="submit"
                className="btn btn-primary flex justify-center"
              >
                {isEdit ? "Save Changes" : "Create Bank"}
              </button>
            </form>
          </>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalBankForm };
