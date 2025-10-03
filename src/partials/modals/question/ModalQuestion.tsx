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
import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const QuestionSchema = Yup.object().shape({
  text: Yup.string().required("Question text is required."),
  type: Yup.string().oneOf(["single", "multiple", "open"]).required("Question type is required."),
  modalId: Yup.string().required("Therapy type is required."),
});

const QuestionSchemaForEdit = Yup.object().shape({
  text: Yup.string().required("Question text is required."),
  type: Yup.string().oneOf(["single", "multiple", "open"]).required("Question type is required."),
  modalId: Yup.string().required("Therapy type is required."),
});

interface IModalQuestionProps {
  open: boolean;
  isEdit: boolean;
  questionData: any;
  isDelete?: boolean;
  onOpenChange: () => void;
}

const ModalQuestion = ({
  open,
  onOpenChange,
  isDelete,
  isEdit,
  questionData,
}: IModalQuestionProps) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: isEdit ? editQuestion : addQuestion,
    onSuccess: () => {
      toast.success(`Question ${isEdit ? "Edited" : "Created"}`);
      queryClient.invalidateQueries({ queryKey: ["Question"] });
      onOpenChange();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const initialValues = isEdit
    ? {
        id: questionData?.id || "",
        text: questionData?.text || "",
        type: questionData?.type || "single",
        modalId: questionData?.modalId || "",
      }
    : {
        text: "",
        type: "single",
        modalId: "",
      };

  async function addQuestion(values: { [key: string]: any }) {
    try {
      console.log(values, "values");

      const questionPayload = {
        text: values.text,
        type: values.type,
        modalId: values.modalId,
      };

      const res = await axiosInstance.post(`/api/v1/question`, questionPayload);
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while creating the question.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  async function deleteQuestion(id: any) {
    try {
      const res = await axiosInstance.delete(`/api/v1/question/${id}`);
      console.log(res, "result");
      if (res.status !== 200) {
        throw new Error(res.data.message || "Failed to delete the question.");
      }
      toast.success(`Question Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["Question"] });
      onOpenChange();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while deleting the question.";
      toast.error(errorMessage || errorMessageAlt);
    }
  }

  async function editQuestion(values: any) {
    try {
      const { id, text, type, modalId } = values;

      const updatedValues: any = {
        text,
        type,
        modalId,
      };

      const res = await axiosInstance.patch(
        `/api/v1/question/${id}`,
        updatedValues
      );
      return res.data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while editing the question.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  // Fetch therapy types for the dropdown
  const {
    data: therapyTypes,
    isLoading: isTherapyTypesLoading,
    error: therapyTypesError,
  } = useQuery("therapy-types", async () => {
    const res = await axiosInstance.get("/api/v1/therapy-type");
    if (res.status !== 200) {
      throw new Error("Failed to fetch therapy types");
    }
    return res.data.data;
  });

  const formik = useFormik({
    initialValues,
    validationSchema: isEdit ? QuestionSchemaForEdit : QuestionSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      console.log(formik.errors, "err");
      try {
        mutate(values);
      } catch (err) {
        console.log(err, "error");
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit) {
        formik.setValues(initialValues); // Populate form with edit data
      } else {
        formik.resetForm(); // Reset form for add mode
      }
    }
  }, [isEdit, open, questionData]);

  if (isDelete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px] w-full">
          <DialogHeader className="py-4 text-center">
            <DialogTitle className="text-lg font-semibold text-gray-900"></DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2 pt-6">
              This action cannot be undone. Do you really want to delete this
              question?
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-0 pt-2 pb-5 flex justify-center gap-4">
            <button
              onClick={() => {
                deleteQuestion(questionData.id);
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
      <DialogContent className="max-w-[500px] w-full">
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
            {isEdit ? "Edit" : "Create"} a Question
          </h3>
          <form
            className="flex flex-col gap-5 pt-10 pb-10 pr-2 pl-2"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Question Text</label>
              <label className="input">
                <textarea
                  placeholder="Enter question text"
                  rows={3}
                  {...formik.getFieldProps("text")}
                  className={clsx(
                    "form-control bg-transparent resize-none",
                    {
                      "is-invalid":
                        formik.touched.text && formik.errors.text,
                    },
                    {
                      "is-valid":
                        formik.touched.text && !formik.errors.text,
                    }
                  )}
                />
              </label>
              {formik.touched.text && formik.errors.text && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.text === "string" &&
                    formik.errors.text}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Question Type</label>
              <label className="input">
                <select
                  {...formik.getFieldProps("type")}
                  className={clsx(
                    "form-control form-select w-full outline-none bg-transparent",
                    {
                      "is-invalid":
                        formik.touched.type && formik.errors.type,
                    },
                    {
                      "is-valid":
                        formik.touched.type && !formik.errors.type,
                    }
                  )}
                >
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="open">Open Text</option>
                </select>
              </label>
              {formik.touched.type && formik.errors.type && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.type === "string" &&
                    formik.errors.type}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Therapy Type</label>
              {isTherapyTypesLoading ? (
                <span>Loading therapy types...</span>
              ) : therapyTypesError ? (
                <span>Error loading therapy types</span>
              ) : (
                <label className="input">
                  <select
                    {...formik.getFieldProps("modalId")}
                    className={clsx(
                      "form-control form-select w-full outline-none bg-transparent",
                      {
                        "is-invalid":
                          formik.touched.modalId && formik.errors.modalId,
                      },
                      {
                        "is-valid":
                          formik.touched.modalId && !formik.errors.modalId,
                      }
                    )}
                  >
                    <option value="" disabled>
                      Select a therapy type
                    </option>
                    {therapyTypes?.map((type: { id: string; name: string }) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {formik.touched.modalId && formik.errors.modalId && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {typeof formik.errors.modalId === "string" &&
                    formik.errors.modalId}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary flex justify-center grow"
              disabled={isLoading}
            >
              {isEdit ? "Save Changes" : "Create Question"}
            </button>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalQuestion };
