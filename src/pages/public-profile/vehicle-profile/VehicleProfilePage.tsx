import { Fragment } from "react";
import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { PageNavbar } from "@/pages/account";

import { VehicleProfileContent } from ".";
import { useLayout } from "@/providers";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { DataGridLoader } from "@/components";

const VehicleProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  async function getVehicle(id: string) {
    console.log("hi");
    const { data } = await axiosInstance.get(`/api/v1/vehicles/${id}`);
    console.log(data);
    return data.data;
  }

  const {
    isLoading: isVehicleLoading,
    data: VehicleData,
    isError,
  } = useQuery({
    queryKey: ["Vehicle", id], // Include the ID in the query key
    queryFn: () => getVehicle(id as string), // Cast `id` to string (safe due to `enabled`)
    enabled: !!id, // Ensure the query only runs if ID is defined
  });

  if (isVehicleLoading) return <DataGridLoader message="Loading" />;

  if (isError || !VehicleData) {
    navigate("/error/404");
    return null; // Prevent rendering of the current component
  }

  const { currentLayout } = useLayout();

  return (
    <Fragment>
      <PageNavbar />

      {currentLayout?.name === "demo1-layout" && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                Intuitive Access to In-Depth Customization
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <a href="#" className="btn btn-sm btn-light">
                Public Profile
              </a>
              <a href="#" className="btn btn-sm btn-primary">
                Get Started
              </a>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <VehicleProfileContent data={VehicleData} />
      </Container>
    </Fragment>
  );
};

export { VehicleProfilePage };
