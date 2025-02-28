import { Fragment, useState } from "react";
import { KeenIcon } from "@/components";
import { toAbsoluteUrl } from "@/utils";
import { NavbarDropdown } from "@/partials/navbar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  About,
  CommunityBadges,
  Connections,
  Contributions,
  Projects,
  WorkExperience,
} from "@/pages/public-profile/profiles/default";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";
import { useFormik } from "formik";

const bankSchema = Yup.object().shape({
  bankId: Yup.number().required("bankId is required."),
  coorId: Yup.number().required("Corporate is required."),
  type: Yup.string().required("type is required."),
  amount: Yup.number().required("amount is required."),
  receipt: Yup.string().required("receipt is required."),
  description: Yup.string().required("description is required."),
});

interface IModalPaymentProps {
  open: boolean;
  onOpenChange: () => void;
}

const ModalPayment = ({ open, onOpenChange }: IModalPaymentProps) => {
  const [activeTab, setActiveTab] = useState("Manual");
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: CreatePayment,
    onSuccess: () => {
      activeTab === "Manual" && toast.success(`Payment Completed`);
      queryClient.invalidateQueries({ queryKey: ["Deposit"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  async function CreatePayment(values: { [key: string]: any }) {
    try {
      if (activeTab === "Automatic") {
        const req_body = {
          amount: Number(values.amount),
        };
        const res = await axiosInstance.post(
          `/api/v1/payment/chapa/pay`,
          req_body
        );
        if (res.data.statusCode === 201) {
          window.open(res.data.data, "_blank");
        }
        return res.data;
      }

      values.bankId = Number(values.bankId);
      values.coorId = Number(values.coorId);

      const res = await axiosInstance.post(
        `/api/v1/payment/deposit/receipt`,
        values
      );
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while completing the Payment.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const initialValues = {
    bankId: 1,
    coorId: null,
    type: "bank",
    amount: 0,
    receipt: "receipt_12345",
    description: "Deposit made for invoice #123",
  };

  const {
    data: banks,
    isLoading: isbanksLoading,
    error: banksError,
  } = useQuery("banks", async () => {
    const res = await axiosInstance.get("api/v1/banks");
    if (res.status !== 200) {
      throw new Error("Failed to fetch banks");
    }
    const data = res.data;
    return data.data;
  });

  const {
    data: corporates,
    isLoading: isCorporateLoading,
    error: corporatesError,
  } = useQuery("corporates", async () => {
    const res = await axiosInstance.get("api/v1/coorporate");
    if (res.status !== 200) {
      throw new Error("Failed to fetch corporates");
    }
    const data = res.data;
    console.log("corporates list", data.data);
    return data.data;
  });

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-col justify-end border-b-0 grow px-9 bg-gradient-to-t from-light from-3% to-transparent">
            <div className="w-full flex justify-center items-center">
              <div className="flex items-center">
                <div className="flex flex-wrap justify-center gap-1 lg:gap-10 text-sm"></div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <form
            //className="flex flex-col items-center gap-6 pt-10 pb-10 pr-2 pl-2"
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            {activeTab === "Automatic" ? (
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Amount</label>
                {formik.touched.amount && formik.errors.amount ? (
                  <div className="text-red-500 text-sm">
                    {typeof formik.errors.amount === "string"
                      ? formik.errors.amount
                      : null}
                  </div>
                ) : null}
                <label className="input">
                  <input
                    placeholder="Enter Amount"
                    autoComplete="off"
                    {...formik.getFieldProps("amount")}
                  />
                </label>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">bank ID</label>
                  {isbanksLoading ? (
                    <span>Loading banks...</span>
                  ) : banksError ? (
                    <span>Error loading banks</span>
                  ) : (
                    <label className="input">
                      <select
                        {...formik.getFieldProps("bankId")}
                        className="form-control form-select w-full"
                        style={{
                          backgroundColor: "transparent",
                          outline: "none",
                          borderColor: "blue",
                        }}
                      >
                        <option value="" disabled>
                          Select a bank
                        </option>
                        {banks?.map((bank: { id: number; name: string }) => (
                          <option key={bank.id} value={bank.id}>
                            {`${bank.name}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {formik.touched?.bankId && formik.errors?.bankId && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors?.bankId}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Corporates</label>
                  {/* Your existing corporates dropdown code */}
                  <label className="input">
                    <select
                      {...formik.getFieldProps("coorId")}
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
                  {formik.touched?.coorId && formik.errors?.coorId && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors?.coorId}
                    </span>
                  )}
                </div>
                <div className="hidden">
                  <label className="form-label text-gray-900">type</label>

                  <label className="input">
                    <input
                      placeholder="Enter type"
                      autoComplete="off"
                      {...formik.getFieldProps("type")}
                    />
                  </label>
                  {formik.touched.type && formik.errors.type && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.type}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-3 ">
                  <label className="form-label text-gray-900">amount</label>

                  <label className="input">
                    <input
                      placeholder="Enter amount"
                      autoComplete="off"
                      type="number"
                      {...formik.getFieldProps("amount")}
                    />
                  </label>
                  {formik.touched?.amount && formik.errors?.amount && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors?.amount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-3 ">
                  <label className="form-label text-gray-900">receipt</label>

                  <label className="input">
                    <input
                      placeholder="Enter receipt"
                      autoComplete="off"
                      {...formik.getFieldProps("receipt")}
                    />
                  </label>
                  {formik.touched.receipt && formik.errors.receipt && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.receipt}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-3 ">
                  <label className="form-label text-gray-900">
                    description
                  </label>

                  <label className="input">
                    <input
                      placeholder="Enter description"
                      autoComplete="off"
                      {...formik.getFieldProps("description")}
                    />
                  </label>
                  {formik.touched.description && formik.errors.description && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.description}
                    </span>
                  )}
                </div>
              </>
            )}
            <button
              type="submit"
              className="btn btn-primary flex justify-center"
            >
              Pay
            </button>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalPayment };
