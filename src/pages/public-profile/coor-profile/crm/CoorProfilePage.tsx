import { Fragment, useEffect, useState } from "react";

import { toAbsoluteUrl } from "@/utils/Assets";
import { ContentLoader, DataGridLoader, KeenIcon } from "@/components";
import { Container } from "@/components/container";

import { UserProfileHero } from "@/partials/heros";
import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";
import axiosInstance from "@/auth/_helpers";

import { CoorProfileContent } from ".";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "react-query";
import { ModalDriverTypeForm } from "@/partials/modals/therapist";
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

const CoorProfilePage = () => {
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

  async function getCoor(id: string) {
    try {
      //const url = `/api/v1/bookings?filters=coor.id=${getDecodedTokenData()}${filterInput && filterInput !== "all" ? `,status=${filterInput}` : ""}&take=${pageSize}&page=${pageIndex}&sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}`;
      const url = `/api/v1/coorporate/${id}`;
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
    isLoading: isCoorLoading,
    data: coorData,
    isError: isCoorError,
  } = useQuery({
    queryKey: ["Coor", id],
    queryFn: () => getCoor(id as string),
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
    setCurrentDriverData(coorData);
    setProfileModalOpen(true);
  };

  const handleAssign = (isEdit: boolean) => {
    setAssignMode(isEdit);
    setApprovalMode(false);
    setCurrentDriverData(coorData);
    setProfileModalOpen(true);
  };

  useEffect(
    function () {
      isAddOpen && handleApproval(true);
    },
    [isAddOpen]
  );

  if (isCoorLoading) return <DataGridLoader message="Loading" />;

  if (isCoorError || !coorData) {
    navigate("/error/404");
    return null; // Prevent rendering of the current component
  }

  return (
    <>
      <Fragment>
        <UserProfileHero
          name={`${coorData?.name}`}
          image={""}
          info={[
            // { stat: coorData.status },
            { label: `+251${coorData?.contactPhoneNumber}`, icon: "phone" },
            { label: `${coorData?.email}`, icon: "sms" },
          ]}
        />

        <Container>
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
        </Container>

        <Container>
          <CoorProfileContent
            isAddOpen={isAddOpen}
            _handleAddOpen={handleApproval}
            searchInput={searchInput}
            id={id}
            activeTab={activeTab}
            coorData={coorData}
          />
        </Container>
      </Fragment>
    </>
  );
};

export { CoorProfilePage };
