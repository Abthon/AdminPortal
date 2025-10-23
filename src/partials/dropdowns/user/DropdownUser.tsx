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
import { toast } from "sonner";

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

  // Use React Query data as the primary source, fallback to local state
  const currentUserData = data?.data || userData;

  // Debug logging
  console.log("currentUserData:", currentUserData);
  console.log("profile:", currentUserData?.profile);

  const handleImageClick = (imageSrc: string, imageAlt: string) => {
    const img = `${BASE_URL}/${imageSrc}`;
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
        "/api/v1/admin/me/upload/profile",
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
        // Update local state with the filename from the response
        setUserData((prev: any) => ({
          ...prev,
          profile: data.data.filename,
        }));

        console.log("Profile uploaded successfully:", data.data.filename);
        toast.success("Profile photo updated successfully!");
        // Invalidate and refetch user data to get the updated profile
        queryClient.invalidateQueries(["me"]);
      },
      onError: (error: any) => {
        console.error("Error uploading profile photo:", error);
        const errorMessage = error?.response?.data?.message || "Failed to upload profile photo. Please try again.";
        toast.error(errorMessage);
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
        "image/webp"
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      uploadPhotoMutation.mutate(file);
    }
    
    // Clear the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  useEffect(() => {
    me();
  }, []);

  const buildHeader = () => {
    if (isLoading || !currentUserData) {
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
        <div className="flex items-center justify-between px-3 sm:px-5 py-1.5 gap-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative group flex-shrink-0">
              {currentUserData?.profile ? (
                <img
                  className="size-9 rounded-full border-2 border-success object-cover"
                  src={`${BASE_URL}/${currentUserData?.profile}`}
                  alt="Profile"
                />
              ) : (
                <img
                  className="size-9 rounded-full border-2 border-success shrink-0"
                  src={toAbsoluteUrl("/media/avatars/300-2.png")}
                  alt="Default Avatar"
                />
              )}

              {/* Edit overlay */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleEditPhotoClick}
                title="Click to change profile photo"
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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <Link
                to="#"
                className="text-sm text-gray-800 hover:text-primary font-semibold leading-none truncate"
              >
                {currentUserData?.firstName || ""} {currentUserData?.lastName || ""}
              </Link>
              <a
                href={`mailto:${currentUserData?.email || ""}`}
                className="text-xs text-gray-600 hover:text-primary font-medium leading-none truncate"
                title={currentUserData?.email || "No email"}
              >
                {currentUserData?.email || "No email"}
              </a>
            </div>
            
            {currentUserData?.profile && (
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-clear btn-primary"
                  onClick={() =>
                    handleImageClick(currentUserData?.profile, "Profile Image")
                  }
                  title="View profile image"
                >
                  <KeenIcon icon="eye" />
                </button>
              </div>
            )}
          </div>
        </div>
        <Dialog 
          open={imageModalOpen} 
          onClose={handleImageModalClose}
          maxWidth="md"
          fullWidth
        >
          <DialogContent className="relative p-4">
            <button
              onClick={handleImageModalClose}
              className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:bg-gray-100 z-10 transition-colors"
            >
              <KeenIcon icon="cross" className="text-gray-600 text-sm" />
            </button>
            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
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
