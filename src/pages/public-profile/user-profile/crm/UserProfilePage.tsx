import { Fragment, useEffect, useState } from "react";

import { toAbsoluteUrl } from "@/utils/Assets";
import { ContentLoader, DataGridLoader, KeenIcon } from "@/components";
import { Container } from "@/components/container";

import { UserProfileHero } from "@/partials/heros";
import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";
import axiosInstance from "@/auth/_helpers";

import { UserProfileContent } from ".";
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

const UserProfilePage = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [assignMode, setAssignMode] = useState(false);
  const [isAddOpen, _handleAddOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [currentDriverData, setCurrentDriverData] =
    useState<IDriversData | null>(null);

  async function getUser(id: string) {
    try {
      const url = `/api/v1/users/${id}`;
      const { data } = await axiosInstance.get(
        url
        //`/api/v1/drivers/${id}?fields=id,createdAt,firstName,middleName,lastName,phoneNumber,isPhoneNumberAuthenticated,type,drivingLicense,gender,is_online,is_available,isBusy,lat,lng,status,profilePhoto,firebaseToken,averageRating,vehicle.*,bookings.*`
      );
      console.log(data, "data");
      return data.data;
    } catch (error) {
      console.log(error);
    }
  }

  const {
    isLoading: isUserLoading,
    data: userData,
    isError: isUserError,
  } = useQuery({
    queryKey: ["User", id],
    queryFn: () => getUser(id as string),
    enabled: !!id,
  });

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);

    queryClient.invalidateQueries("Driver");
  };

  const handleApproval = (isEdit: boolean) => {
    setApprovalMode(isEdit);
    setCurrentDriverData(userData);
    setProfileModalOpen(true);
  };

  const handleAssign = (isEdit: boolean) => {
    setAssignMode(isEdit);
    setApprovalMode(false);
    setCurrentDriverData(userData);
    setProfileModalOpen(true);
  };

  useEffect(
    function () {
      isAddOpen && handleApproval(true);
    },
    [isAddOpen]
  );

  if (isUserLoading) return <DataGridLoader message="Loading" />;

  if (isUserError || !userData) {
    navigate("/error/404");
    return null; // Prevent rendering of the current component
  }

  return (
    <>
      <Fragment>
        <UserProfileHero
          name={`${userData?.firstName} ${userData?.lastName}`}
          image={""}
          info={[
            // { stat: userData.status },
            { label: `+251${userData?.phoneNumber}`, icon: "phone" },
            // { label: `${userData?.email}`, icon: "sms" },
          ]}
        />

        {/* <Container>
          <Navbar>
            <div></div>

            <NavbarActions>
              <span
                onClick={() => setActiveTab("bookings")}
                className="btn btn-sm btn-light"
              >
                See Bookings
              </span>
              <span
                onClick={() => setActiveTab("deposits")}
                className="btn btn-sm btn-primary"
              >
                See Deposits
              </span>
            </NavbarActions>
          </Navbar>
        </Container> */}

        <Container>
          <UserProfileContent
            isAddOpen={isAddOpen}
            _handleAddOpen={handleApproval}
            searchInput={searchInput}
            id={id}
            activeTab={activeTab}
            // coorData={userData}
          />
        </Container>
      </Fragment>
    </>
  );
};

export { UserProfilePage };
