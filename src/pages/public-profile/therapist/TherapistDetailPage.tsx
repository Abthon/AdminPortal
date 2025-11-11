import { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Container } from "@/components/container";
import { KeenIcon } from "@/components";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { TherapistDetailContent } from "./blocks";
import { useLayout } from "@/providers";
import axiosInstance from "@/auth/_helpers";
import { ITherapistDetailResponse } from "@/types/therapist";
import { DataGridLoader } from "@/components/data-grid";
import { toast } from "sonner";

const TherapistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLayout } = useLayout();

  const fetchTherapistDetail = async (therapistId: string): Promise<ITherapistDetailResponse> => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/therapist/${therapistId}?fields=rating.*,email,gender,createdAt,phoneNumber,status,profile,hoursDedicatedPerWeek,bio,expertise.*,therapistBank.*`);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch therapist details");
      throw error;
    }
  };

  const {
    data: therapistData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["therapist-detail", id],
    queryFn: () => fetchTherapistDetail(id!),
    enabled: !!id,
    retry: 1,
  });

  const handleBackToTherapists = () => {
    navigate("/therapists");
  };

  if (isLoading) {
    return (
      <Container>
        <DataGridLoader message="Loading therapist details..." />
      </Container>
    );
  }

  if (error || !therapistData) {
    return (
      <Container>
        <div className="card">
          <div className="card-body text-center py-10">
            <KeenIcon icon="information-2" className="text-danger text-3xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Therapist Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The therapist you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBackToTherapists}
              className="btn btn-primary"
            >
              <KeenIcon icon="arrow-left" />
              Back to Therapists
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      {currentLayout?.name === "demo1-layout" && (
        <Container>
          <Toolbar>
            <ToolbarActions>
              <div className="flex items-center gap-2">
                {therapistData.data.isOnline && (
                  <span className="badge badge-success badge-outline">
                    <span className="size-1.5 rounded-full bg-success me-1.5"></span>
                    Online
                  </span>
                )}
              </div>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <TherapistDetailContent therapistData={therapistData.data} />
      </Container>
    </Fragment>
  );
};

export { TherapistDetailPage };