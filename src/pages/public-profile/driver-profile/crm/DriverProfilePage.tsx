import { Fragment } from "react";

import { toAbsoluteUrl } from "@/utils/Assets";
import { ContentLoader, DataGridLoader, KeenIcon } from "@/components";
import { Container } from "@/components/container";

import { UserProfileHero } from "@/partials/heros";
import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";
import axiosInstance from "@/auth/_helpers";

import { DriverProfileContent } from ".";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "react-query";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

const DriverProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  async function getDriver(id: string) {
    console.log("hi");
    const { data } = await axiosInstance.get(`/api/v1/drivers/${id}`);
    console.log(data);
    return data.data;
  }

  const {
    isLoading: isDriverLoading,
    data: DriverData,
    isError,
  } = useQuery({
    queryKey: ["Driver", id], // Include the ID in the query key
    queryFn: () => getDriver(id as string), // Cast `id` to string (safe due to `enabled`)
    enabled: !!id, // Ensure the query only runs if ID is defined
  });

  if (isDriverLoading) return <DataGridLoader message="Loading" />;

  if (isError || !DriverData) {
    navigate("/error/404");
    return null; // Prevent rendering of the current component
  }

  const image = (
    <img
      src={`${BASE_URL}/profile/${DriverData.profilePhoto}`}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );

  return (
    <Fragment>
      <UserProfileHero
        name={`${DriverData.firstName} ${DriverData.lastName}`}
        image={image}
        info={[
          // { stat: DriverData.status },
          { label: "SF, Bay Area", icon: "geolocation" },
          { label: `+251${DriverData.phoneNumber}`, icon: "sms" },
        ]}
      />

      <Container>
        <Navbar>
          <PageMenu />

          <NavbarActions>
            <button type="button" className="btn btn-sm btn-primary">
              <KeenIcon icon="users" /> Connect
            </button>
            <button className="btn btn-sm btn-icon btn-light">
              <KeenIcon icon="messages" />
            </button>
            <NavbarDropdown />
          </NavbarActions>
        </Navbar>
      </Container>

      <Container>
        <DriverProfileContent data={DriverData} />
      </Container>
    </Fragment>
  );
};

export { DriverProfilePage };
