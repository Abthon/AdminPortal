import { ChangeEvent, Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useAuthContext } from "@/auth";
import { useLanguage } from "@/i18n";
import { toAbsoluteUrl } from "@/utils";
import { DropdownUserLanguages } from "./DropdownUserLanguages";
import { useSettings } from "@/providers/SettingsProvider";
import { DefaultTooltip, KeenIcon } from "@/components";
import axiosInstance from "@/auth/_helpers";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuArrow,
  MenuIcon,
} from "@/components/menu";
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@mui/material";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;
interface IDropdownUserProps {
  menuItemRef: any;
}

const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { settings, storeSettings } = useSettings();
  const { logout } = useAuthContext();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const { isRTL } = useLanguage();
  const [userData, setUserData] = useState<any>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  async function me() {
    const url = `/api/v1/admin/me`;
    const { data } = await axiosInstance.get(url);
    setUserData(data.data);
    return data;
  }

  const { isLoading, data } = useQuery({
    queryKey: ["me"],
    queryFn: me,
  });

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

  // Upload profile photo mutation
  const uploadPhotoMutation = useMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        "api/v1/file-upload/image/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: async (data) => {
        // Update local state
        setUserData((prev: any) => ({
          ...prev,
          profilePhoto: data.data.filename,
        }));

        const res = await axiosInstance.patch(`/api/v1/admin/${userData.id}`, {
          profilePhoto: data.data.filename,
        });
        console.log(`what exactly is ${data.data.filename}`);
        // Invalidate and refetch user data
        console.log(`${res.data} the result babiiii`);
        queryClient.invalidateQueries(["me"]);
      },
      onError: (error) => {
        console.error("Error uploading profile photo:", error);
        // You can add toast notification here
      },
    }
  );
  const handleThemeMode = (event: ChangeEvent<HTMLInputElement>) => {
    const newThemeMode = event.target.checked ? "dark" : "light";

    storeSettings({
      themeMode: newThemeMode,
    });
  };

  const handleEditPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("File size must be less than 5MB");
        return;
      }

      uploadPhotoMutation.mutate(file);
    }
  };

  useEffect(() => {
    me();
  }, []);

  const buildHeader = () => {
    if (isLoading || !userData) {
      return (
        <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-800 font-semibold leading-none">
                Loading...
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
          <div className="flex items-center gap-2">
            <div className="relative group">
              {userData?.profilePhoto ? (
                <img
                  className="size-9 rounded-full border-2 border-success"
                  src={`${BASE_URL}/profile/${userData?.profilePhoto}`}
                  alt=""
                />
              ) : (
                <img
                  className="size-9 rounded-full border-2 border-success shrink-0"
                  src={toAbsoluteUrl("/media/avatars/300-2.png")}
                  alt=""
                />
              )}

              {/* Edit overlay */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleEditPhotoClick}
              >
                {uploadPhotoMutation.isLoading ? (
                  <div className="animate-spin">
                    <KeenIcon icon="loading" className="text-white text-xs" />
                  </div>
                ) : (
                  <KeenIcon icon="pencil" className="text-white text-xs" />
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Link
                to="#"
                className="text-sm text-gray-800 hover:text-primary font-semibold leading-none"
              >
                {userData?.firstName || ""} {userData?.lastName || ""}
              </Link>
              <a
                href={`mailto:${userData?.email || ""}`}
                className="text-xs text-gray-600 hover:text-primary font-medium leading-none"
              >
                {userData?.email || "No email"}
              </a>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                className={`btn btn-sm`}
                onClick={() =>
                  handleImageClick(userData?.profilePhoto, "imageAlt")
                }
              >
                <KeenIcon icon="eye" />
              </button>
            </div>
          </div>
        </div>
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
      </>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">{/* Menu items remain the same */}</div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">
              <FormattedMessage id="USER.MENU.DARK_MODE" />
            </span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.themeMode === "dark"}
                onChange={handleThemeMode}
                value="1"
              />
            </label>
          </div>
        </div>

        <div className="menu-item px-4 py-1.5">
          <a onClick={logout} className="btn btn-sm btn-light justify-center">
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
