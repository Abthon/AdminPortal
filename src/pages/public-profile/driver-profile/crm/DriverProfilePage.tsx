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
import { ModalTherapistTypeForm } from "@/partials/modals/therapist";
import { Dialog, DialogContent } from "@mui/material";
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
  const [isAddOpen, _handleAddOpen] = useState(false);
  const [currentDriverData, setCurrentDriverData] =
    useState<IDriversData | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleImageClick = (imageSrc: string, imageAlt: string) => {
    const img = `${BASE_URL}/profile/${imageSrc}`;
    console.log("img", img);
    setSelectedImage({ src: img, alt: imageAlt });
    setImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  async function getDriver(id: string) {
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/drivers/${id}?fields=id,createdAt,firstName,middleName,lastName,phoneNumber,isPhoneNumberAuthenticated,type,drivingLicense,gender,is_online,is_available,isBusy,lat,lng,status,profilePhoto,firebaseToken,averageRating,vehicle.*,bookings.*,ratings.*`
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
    queryKey: ["Driver", id],
    queryFn: () => getDriver(id as string),
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
    setCurrentDriverData(DriverData);
    setProfileModalOpen(true);
  };

  const image = (
    <div
      className="relative group"
      // onClick={() => {
      //   handleImageClick(DriverData?.profilePhoto, "imageAlt");
      // }}
    >
      <img
        src={`${BASE_URL}/profile/${DriverData?.profilePhoto}`}
        className={`rounded-full border-3 ${DriverData?.is_online ? "border-success" : "border-danger"} object-cover  size-[100px] shrink-0`}
        // onClick={() => {}}
      />

      <div
        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => {
          handleImageClick(DriverData?.profilePhoto, "imageAlt");
        }}
      >
        <KeenIcon icon="eye" className="text-white text-xs" />
      </div>
    </div>
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
    return null;
  }

  return (
    <>
      <Dialog open={imageModalOpen} onChange={handleImageModalClose}>
        <DialogContent className="w-fit">
          {/* <DialogHeader>
                        <DialogTitle>Vehicle Type Image</DialogTitle>
                      </DialogHeader> */}
          <button
            onClick={handleImageModalClose}
            className="absolute -top-[-10px] -right-[-10px] bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:bg-gray-100 z-10 transition-colors"
          >
            <KeenIcon icon="cross" className="text-gray-600 text-sm" />
          </button>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ModalTherapistTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={false}
        isApproved={approvalMode}
        therapistData={currentDriverData}
      />
      <Fragment>
        <UserProfileHero
          name={`${DriverData?.firstName} ${DriverData?.lastName}`}
          image={image}
          info={[
            { label: "Addis Ababa", icon: "geolocation" },
            { label: `+251${DriverData?.phoneNumber}`, icon: "sms" },
          ]}
        />

        <Container>
          <Navbar>
            <div></div>

            <NavbarActions>
              <button
                onClick={() => handleApproval(true)}
                type="button"
                className="btn btn-sm btn-primary"
              >
                <KeenIcon icon="users" /> Approve
              </button>
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
