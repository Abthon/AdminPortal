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
//import { TherapistDetailContent } from "./blocks";
import { useLayout } from "@/providers";
import axiosInstance from "@/auth/_helpers";
import { DataGridLoader } from "@/components/data-grid";
import { toast } from "sonner";
import { SessionDetailContent } from "./blocks/SessionDetailContent";
import { SessionGroupDetailContent } from "./blocks/SessionGroupDetailContent";

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLayout } = useLayout();

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/session/${sessionId}?fields=therapist.*,client.*,hasTherapistAttended,group.*,groupAttendance.*,modal.*,duration`
      );
      console.log("here", data);
      return data;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch session details"
      );
      throw error;
    }
  };

  // Fetch therapist rating separately
  const fetchTherapistRating = async (therapistId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/therapist/${therapistId}?fields=rating.*`
      );
      return data?.data?.rating || [];
    } catch (error: any) {
      console.error("Failed to fetch therapist rating:", error);
      return [];
    }
  };

  const {
    data: sessionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session-detail", id],
    queryFn: () => fetchSessionDetail(id!),
    enabled: !!id,
    retry: 1,
  });

  // Fetch therapist rating data separately
  const {
    data: therapistRating,
    isLoading: ratingLoading,
  } = useQuery({
    queryKey: ["therapist-rating", sessionData?.data?.therapist?.id],
    queryFn: () => fetchTherapistRating(sessionData?.data?.therapist?.id!),
    enabled: !!sessionData?.data?.therapist?.id,
    retry: 1,
  });

  // Merge session data with therapist rating
  const enrichedSessionData = sessionData ? {
    ...sessionData,
    data: {
      ...sessionData.data,
      therapist: {
        ...sessionData.data.therapist,
        rating: therapistRating || []
      }
    }
  } : null;

  const handleBackToSession = () => {
    navigate("/sessions");
  };

  if (isLoading || ratingLoading) {
    return (
      <Container>
        <DataGridLoader message="Loading session details..." />
      </Container>
    );
  }

  if (error || !sessionData) {
    return (
      <Container>
        <div className="card">
          <div className="card-body text-center py-10">
            <KeenIcon
              icon="information-2"
              className="text-danger text-3xl mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Session Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The session you're looking for doesn't exist or has been removed.
            </p>
            <button onClick={handleBackToSession} className="btn btn-primary">
              <KeenIcon icon="arrow-left" />
              Back to Sessions
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      {/* {currentLayout?.name === "demo1-layout" && (
        <Container>
          <Toolbar>
            <ToolbarActions>
              <div className="flex items-center gap-2">
                {sessionData.data.isOnline && (
                  <span className="badge badge-success badge-outline">
                    <span className="size-1.5 rounded-full bg-success me-1.5"></span>
                    Online
                  </span>
                )}
              </div>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )} */}

      {enrichedSessionData?.data.group.length == 0 && (
        <Container>
          <SessionDetailContent sessionData={enrichedSessionData.data} />
        </Container>
      )}
      {enrichedSessionData?.data.group.length > 0 && (
        <Container>
          <SessionGroupDetailContent sessionData={enrichedSessionData.data} />
        </Container>
      )}
    </Fragment>
  );
};

export { SessionDetailPage };
