import { Fragment, useEffect, useState } from "react";

import { toAbsoluteUrl } from "@/utils/Assets";
import { ContentLoader, DataGridLoader, KeenIcon } from "@/components";
import { Container } from "@/components/container";

import { UserProfileHero } from "@/partials/heros";
import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";
import axiosInstance from "@/auth/_helpers";

import { DriverProfileContent } from ".";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "react-query";
import { ModalDriverTypeForm } from "@/partials/modals/driver";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IDriversData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profilePhoto: string;
  type: string;
}

const DriverProfilePage = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [assignMode, setAssignMode] = useState(false);
  const [isAddOpen, _handleAddOpen] = useState(false);
  const [currentDriverData, setCurrentDriverData] =
    useState<IDriversData | null>(null);

  async function getDriver(id: string) {
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/drivers/${id}?fields=id,createdAt,firstName,middleName,lastName,phoneNumber,isPhoneNumberAuthenticated,type,drivingLicense,gender,is_online,is_available,isBusy,lat,lng,status,profilePhoto,firebaseToken,averageRating,vehicle.*,bookings.*`
      );
      return data.data;
    } catch (error) {
      console.log(error);
    }
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

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);

    queryClient.invalidateQueries("Driver");
  };

  const handleApproval = (isEdit: boolean) => {
    setApprovalMode(isEdit);
    setCurrentDriverData(DriverData);
    setProfileModalOpen(true);
  };

  const handleAssign = (isEdit: boolean) => {
    setAssignMode(isEdit);
    setApprovalMode(false);
    setCurrentDriverData(DriverData);
    setProfileModalOpen(true);
  };

  const image = (
    <img
      src={`${BASE_URL}/profile/${DriverData?.profilePhoto}`}
      className={`rounded-full border-3 ${DriverData?.is_online ? "border-success" : "border-danger"} object-cover  size-[100px] shrink-0`}
    />
  );

  useEffect(
    function () {
      isAddOpen && handleApproval(true);
    },
    [isAddOpen]
  );

  if (isDriverLoading) return <DataGridLoader message="Loading" />;

  if (isError || !DriverData) {
    navigate("/error/404");
    return null; // Prevent rendering of the current component
  }

  console.log(DriverData, "data data");

  return (
    <>
      <ModalDriverTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={false}
        isApproved={approvalMode}
        isAssigned={assignMode}
        driverData={currentDriverData}
      />
      <Fragment>
        <UserProfileHero
          name={`${DriverData?.firstName} ${DriverData?.lastName}`}
          image={image}
          info={[
            // { stat: DriverData.status },
            { label: "Addis Ababa", icon: "geolocation" },
            { label: `+251${DriverData?.phoneNumber}`, icon: "sms" },
          ]}
        />

        <Container>
          <Navbar>
            <PageMenu />

            <NavbarActions>
              <button
                onClick={() => handleAssign(true)}
                type="button"
                className="btn btn-sm btn-primary"
              >
                <KeenIcon icon="car" /> Assign Vehicle
              </button>
              <button
                onClick={() => handleApproval(true)}
                type="button"
                className="btn btn-sm btn-primary"
              >
                <KeenIcon icon="users" /> Approve
              </button>
              {/* <button className="btn btn-sm btn-icon btn-light">
              <KeenIcon icon="messages" />
            </button>
            <NavbarDropdown /> */}
            </NavbarActions>
          </Navbar>
        </Container>

        <Container>
          <DriverProfileContent data={DriverData} />
        </Container>
      </Fragment>
    </>
  );
};

export { DriverProfilePage };
