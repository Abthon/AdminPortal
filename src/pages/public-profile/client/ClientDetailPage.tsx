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
import { ClientDetailContent } from "./blocks";
import { useLayout } from "@/providers";
import axiosInstance from "@/auth/_helpers";
import { IClientDetailResponse } from "@/types/client";
import { DataGridLoader } from "@/components/data-grid";
import { toast } from "sonner";

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLayout } = useLayout();

  const fetchClientDetail = async (clientId: string): Promise<IClientDetailResponse> => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/client/${clientId}?fields=rating.*,username,email,gender,createdAt,phoneNumber,status,profile`);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch client details");
      throw error;
    }
  };

  const {
    data: clientData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client-detail", id],
    queryFn: () => fetchClientDetail(id!),
    enabled: !!id,
    retry: 1,
  });

  const handleBackToClients = () => {
    navigate("/clients");
  };

  if (isLoading) {
    return (
      <Container>
        <DataGridLoader message="Loading client details..." />
      </Container>
    );
  }

  if (error || !clientData) {
    return (
      <Container>
        <div className="card">
          <div className="card-body text-center py-10">
            <KeenIcon icon="information-2" className="text-danger text-3xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Client Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The client you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBackToClients}
              className="btn btn-primary"
            >
              <KeenIcon icon="arrow-left" />
              Back to Clients
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
                {clientData.data.isOnline && (
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
        <ClientDetailContent clientData={clientData.data} />
      </Container>
    </Fragment>
  );
};

export { ClientDetailPage };