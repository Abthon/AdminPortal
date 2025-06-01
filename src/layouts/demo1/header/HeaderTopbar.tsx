import { useRef, useState, useEffect } from "react";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import { Menu, MenuItem, MenuToggle } from "@/components";
import { DropdownUser } from "@/partials/dropdowns/user";
import { DropdownNotifications } from "@/partials/dropdowns/notifications";
import { DropdownApps } from "@/partials/dropdowns/apps";
import { DropdownChat } from "@/partials/dropdowns/chat";
import { ModalSearch } from "@/partials/modals/search/ModalSearch";
import { useLanguage } from "@/i18n";
import axiosInstance from "@/auth/_helpers";
import { useMutation, useQuery, useQueryClient } from "react-query";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;
const HeaderTopbar = () => {
  const { isRTL } = useLanguage();
  const itemUserRef = useRef<any>(null);
  const [userData, setUserData] = useState<any>("");

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

  useEffect(() => {
    me();
  }, []);

  return (
    <div className="flex items-center gap-2 lg:gap-3.5">
      <Menu>
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? "bottom-start" : "bottom-end",
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: isRTL() ? [-20, 10] : [20, 10], // [skid, distance]
                },
              },
            ],
          }}
        >
          <MenuToggle className="btn btn-icon rounded-full">
            {isLoading ? (
              <div className="animate-spin size-9 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <KeenIcon icon="loading" className="text-gray-500 text-sm" />
              </div>
            ) : userData?.profilePhoto ? (
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
          </MenuToggle>

          {/* <MenuToggle className="btn btn-icon rounded-full">
            {userData?.profilePhoto ? (
              <img
                className="size-9 rounded-full border-2 border-success"
                src={`${BASE_URL}/profile/${userData?.profilePhoto}`}
                alt=""
              />
            ) : (
              <h1>hello</h1>
              // <img
              //   className="size-9 rounded-full border-2 border-success shrink-0"
              //   src={toAbsoluteUrl("/media/avatars/300-2.png")}
              //   alt=""
              // />
            )}
          </MenuToggle> */}
          {DropdownUser({ menuItemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };
