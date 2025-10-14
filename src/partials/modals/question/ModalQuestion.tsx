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
  options: Yup.array().when('type', {
    is: (val: string) => val === 'single' || val === 'multiple',
    then: (schema) => schema.of(Yup.string().required("Option cannot be empty")).min(2, "At least 2 options are required"),
    otherwise: (schema) => schema.notRequired()
  })
});

const QuestionSchemaForEdit = Yup.object().shape({
  text: Yup.string().required("Question text is required."),
  type: Yup.string().oneOf(["single", "multiple", "open"]).required("Question type is required."),
  modalId: Yup.string().required("Therapy type is required."),
  options: Yup.array().when('type', {
    is: (val: string) => val === 'single' || val === 'multiple',
    then: (schema) => schema.of(Yup.string().required("Option cannot be empty")).min(2, "At least 2 options are required"),
    otherwise: (schema) => schema.notRequired()
  })
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
        modalId: questionData?.modalId || questionData?.modal?.id || "",
        options: questionData?.option ? 
          questionData.option.sort((a: any, b: any) => a.order - b.order).map((opt: any) => opt.text) : 
          questionData?.options || ["", ""],
      }
    : {
        text: "",
        type: "single",
        modalId: "",
        options: ["", ""],
      };

  async function addQuestion(values: { [key: string]: any }) {
    try {
      console.log(values, "values");

      // Step 1: Create the question first
      const questionPayload = {
        text: values.text,
        type: values.type,
        modalId: values.modalId,
      };

      const questionRes = await axiosInstance.post(`/api/v1/question`, questionPayload);
      const createdQuestion = questionRes.data;
      console.log(createdQuestion, "created question");

      // Step 2: Create options if question type is single or multiple
      if (values.type !== 'open' && values.options && values.options.length > 0) {
        const validOptions = values.options.filter((opt: string) => opt.trim() !== '');
        
        // Create each option separately
        const optionPromises = validOptions.map((optionText: string) => {
          const optionPayload = {
            text: optionText,
            questionId: createdQuestion.data.id, // Use the created question's ID
          };
          return axiosInstance.post(`/api/v1/option`, optionPayload);
        });

        // Wait for all options to be created
        await Promise.all(optionPromises);
        console.log(`Created ${validOptions.length} options for question`);
      }

      return createdQuestion;
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
      // Step 1: Delete all options first to avoid orphaned data
      const existingOptions = questionData?.option || [];
      
      if (existingOptions.length > 0) {
        console.log(`Deleting ${existingOptions.length} options first...`);
        
        const deleteOptionPromises = existingOptions.map((option: any) => {
          return axiosInstance.delete(`/api/v1/option/${option.id}`);
        });
        
        // Wait for all options to be deleted
        await Promise.all(deleteOptionPromises);
        console.log(`Successfully deleted ${existingOptions.length} options`);
      }

      // Step 2: Delete the question
      const res = await axiosInstance.delete(`/api/v1/question/${id}`);
      console.log(res, "question deleted");
      
      if (res.status !== 200) {
        throw new Error(res.data.message || "Failed to delete the question.");
      }
      
      toast.success(`Question and all its options deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: ["Question"] });
      onOpenChange();
    } catch (err: any) {
      console.log(err, "Delete error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message || "An error occurred while deleting the question.";
      toast.error(errorMessage || errorMessageAlt);
    }
  }

  async function editQuestion(values: any) {
    try {
      const { id, text, type, modalId } = values;

      // Step 1: Update the question
      const updatedValues: any = {
        text,
        type,
        modalId,
      };

      const res = await axiosInstance.patch(
        `/api/v1/question/${id}`,
        updatedValues
      );

      // Step 2: Handle options for single/multiple choice questions
      if (type !== 'open' && values.options && values.options.length > 0) {
        const validOptions = values.options.filter((opt: string) => opt.trim() !== '');
        
        try {
          // Get existing options from questionData to update them
          const existingOptions = questionData?.option || [];
          
          const optionPromises = validOptions.map((optionText: string, index: number) => {
            if (existingOptions[index]) {
              // Update existing option using PATCH /api/v1/option/{id}
              const optionPayload = {
                text: optionText,
              };
              return axiosInstance.patch(`/api/v1/option/${existingOptions[index].id}`, optionPayload);
            } else {
              // Create new option if it doesn't exist
              const optionPayload = {
                text: optionText,
                questionId: id,
              };
              return axiosInstance.post(`/api/v1/option`, optionPayload);
            }
          });

          await Promise.all(optionPromises);
          console.log(`Updated ${validOptions.length} options for question`);
        } catch (optionError) {
          console.log("Error updating options:", optionError);
          // Continue even if options update fails
        }
      }

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
    const res = await axiosInstance.get("/api/v1/modal");
    console.log(res.data.data, "the modallllllllllllll");
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
      if (isEdit && questionData) {
        const editValues = {
          id: questionData.id || "",
          text: questionData.text || "",
          type: questionData.type || "single",
          modalId: questionData.modalId || questionData.modal?.id || "",
          options: questionData.option ? 
            questionData.option.sort((a: any, b: any) => a.order - b.order).map((opt: any) => opt.text) : 
            questionData.options || ["", ""],
        };
        formik.setValues(editValues);
      } else {
        formik.resetForm({
          values: {
            text: "",
            type: "single",
            modalId: "",
            options: ["", ""],
          }
        });
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
                <input
                  placeholder="Enter question text"
                  //rows={3}
                  {...formik.getFieldProps("text")}
                  className={clsx(
                    "form-control bg-transparent resize-none w-full",
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

            {/* Options for Single/Multiple Choice */}
            {(formik.values.type === "single" || formik.values.type === "multiple") && (
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">
                  Answer Options
                  <span className="text-sm text-gray-500 ml-2">
                    (Add at least 2 options)
                  </span>
                </label>
                <div className="space-y-2">
                  {formik.values.options.map((option: string, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <label className="input flex-1">
                        <input
                          type="text"
                          placeholder={`Enter option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formik.values.options];
                            newOptions[index] = e.target.value;
                            formik.setFieldValue("options", newOptions);
                          }}
                          className={clsx(
                            "form-control bg-transparent w-full",
                            {
                              "is-invalid":
                                formik.touched.options && 
                                formik.errors.options && 
                                Array.isArray(formik.errors.options) && 
                                formik.errors.options[index],
                            }
                          )}
                        />
                      </label>
                      {formik.values.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = formik.values.options.filter((_: any, i: number) => i !== index);
                            formik.setFieldValue("options", newOptions);
                          }}
                          className="btn btn-sm btn-icon btn-outline btn-danger"
                          title="Remove option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      formik.setFieldValue("options", [...formik.values.options, ""]);
                    }}
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    + Add Option
                  </button>
                </div>
                {formik.touched.options && formik.errors.options && typeof formik.errors.options === 'string' && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {formik.errors.options}
                  </span>
                )}
              </div>
            )}

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
