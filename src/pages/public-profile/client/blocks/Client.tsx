import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import { DataGridLoader } from "@/components/data-grid";
import avatar from "@/media/avatars/blank.png";

import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  DataGridRowSelectAll,
  DataGridRowSelect,
} from "@/components";
import { ColumnDef, Column, RowSelectionState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ModalClientTypeForm } from "@/partials/modals/client";
import axiosInstance from "@/auth/_helpers";
import ClassNameGenerator from "@mui/utils/ClassNameGenerator";
import { Row } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ISubscriptionData, IClientSubscriptionResponse, IActiveSubscription } from "@/types/client";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

// Component to handle async modal fetching for client
const ClientModalCell = ({ client }: { client: IClientsData }) => {
  const [modalName, setModalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModal = async () => {
      if (!client.preference || client.preference.length === 0) {
        setModalName(null);
        return;
      }

      console.log(client, "client.preferenceeeee");
      const preferenceId = client.preference[0].id;
      if (!preferenceId) {
        setModalName(null);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/api/v1/preference/${preferenceId}?fields=modal.*`
        );
        setModalName(data?.data?.modal?.name || null);
      } catch (error) {
        console.error("Error fetching preference modal:", error);
        setModalName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModal();
  }, [client.preference]);

  //if (loading) {
  //  return (
  //    <div className="flex items-center">
  //      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
  //    </div>
  //  );
  //}

  return (
    <div className="flex items-center">
      {modalName ? (
        <span className="badge badge-primary badge-outline rounded-[30px]">
          <span className="size-1.5 rounded-full bg-primary me-1.5"></span>
          {modalName}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Not Assigned</span>
      )}
    </div>
  );
};

// Component to handle async level fetching for client
const ClientLevelCell = ({ client }: { client: IClientsData }) => {
  const [levelData, setLevelData] = useState<any>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!client?.id) {
        setLevelData(null);
        setModalData(null);
        return;
      }

      setLoading(true);
      try {
        // Step 1: Get client with preference data
        const { data: clientData } = await axiosInstance.get(
          `/api/v1/client/${client.id}?fields=preference.*`
        );

        const preferences = clientData?.data?.preference;
        if (!preferences || preferences.length === 0) {
          setLevelData(null);
          setModalData(null);
          return;
        }

        const preferenceId = preferences[0].id;
        if (!preferenceId) {
          setLevelData(null);
          setModalData(null);
          return;
        }

        // Step 2: Get preference with modal and level data
        const { data: preferenceData } = await axiosInstance.get(
          `/api/v1/preference/${preferenceId}?fields=modal.*,level.*`
        );

        setModalData(preferenceData?.data?.modal || null);
        setLevelData(preferenceData?.data?.level || null);
      } catch (error) {
        console.error("Error fetching client data:", error);
        setLevelData(null);
        setModalData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if client has group or couple therapy
  const modalName = modalData?.name?.toLowerCase();
  if (modalName && (modalName.includes('group') || modalName.includes('couple'))) {
    console.log(modalName, "The modal nameeeeee!", modalName.includes('couple'))
    return (
      <span className="text-gray-400 text-sm italic">
        N/A for {modalName.includes('group') ? 'Group' : 'Couple'}
      </span>
    );
  }

  return (
    <div className="flex flex-col text-xs">
      {levelData ? (
        <>
          <span className="font-medium capitalize">{levelData.type}</span>
          <span className="text-gray-500">
            XP: {levelData.minXP}-{levelData.maxXP || "∞"}
          </span>
        </>
      ) : (
        <span className="text-gray-400 text-sm">Not Assigned</span>
      )}
    </div>
  );
};

interface IClientsData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profile: string;
  email: string;
  avatar: number;
  isEmailAuthenticated: boolean;
  isPhoneNumberAuthenticated: boolean;
  firebaseToken: string | null;
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string | null;
  username: string;
  emergencyContact: string | null;
  isVisible: boolean;
  isInGroup: boolean;
  createdAt: string;
  updatedAt: string;
  activeSubscription: IActiveSubscription;
  preference?: {
    id: string;
  }[];
}

const Clients = ({
  isAddOpen,
  _handleAddOpen,
  handleClientNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleClientNum: (num: any) => void;
  searchInput?: string;
}) => {
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [del, setDel] = useState(false);
  const [currentClientData, setCurrentClientData] =
    useState<IClientsData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  // const [sort, setSort] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [modalFilter, setModalFilter] = useState("all");
  // In your parent component, add this state
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    phone: string;
  } | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClientsData | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<IActiveSubscription | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    url: string;
    filename: string;
    clientName: string;
  } | null>(null);

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: IClientsData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentClientData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: IClientsData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentClientData(rowData);
    setProfileModalOpen(true);
  };

  // async function getDrivers() {
  //   const { data } = await axiosInstance.get("/api/v1/drivers");
  //   console.log(data);
  //   console.log(data.data.length, "length");
  //   handleDriverNum(data.data.length);
  //   return data.data;
  // }
  async function getClients({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    // if (sort.length === 1) {
    //   console.log(sort[0].id, "here");
    //   console.log(sort, "sorting is finally here");
    // }
    // [Todo: refactor url]
    const statusFilter = filterInput && filterInput !== "all" ? `activeSubscription.status:=${filterInput}` : "";
    const modalFilterParam = modalFilter && modalFilter !== "all" ? `preference.modal.id:=${modalFilter}` : "";
    const filters = [statusFilter, modalFilterParam].filter(Boolean).join(",");
    const url = `/api/v1/client?take=${pageSize}&page=${pageIndex}&sort=createdAt=DESC,firstName=${sort[0].desc ? "DESC" : "ASC"}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,email,avatar,isEmailAuthenticated,isPhoneNumberAuthenticated,firebaseToken,dob,isLinked,isOnline,lastSeenAt,username,emergencyContact,isVisible,isInGroup,createdAt,updatedAt,activeSubscription.*,preference.*${filters ? `&filters=${filters}` : ""}`;
    console.log(url, "url");
    const { data } = await axiosInstance.get(url);

    console.log(data, "The data");
    // calculating how many items are there on the current page
    const startIndex =
      (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
    const endIndex = Math.min(
      data.pagination.currentPage * data.pagination.pageSize,
      data.pagination.totalItems
    );
    const itemsOnPage = endIndex - startIndex + 1;

    setItemsOnPage(itemsOnPage);
    setTotalItems(data.pagination.totalItems);
    handleClientNum(data.data.length);
    return data;
  }

  async function searchClient({
    pageIndex,
    pageSize,
    search,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    search: any;
    sort: any;
  }) {
    const statusFilter = filterInput && filterInput !== "all" ? `,activeSubscription.status:=${filterInput}` : "";
    const modalFilterParam = modalFilter && modalFilter !== "all" ? `,preference.id:=${modalFilter}` : "";
    const url = `/api/v1/client?filters=firstName=${search}${statusFilter}${modalFilterParam}&take=${pageSize}&page=${pageIndex}&sort=createdAt=DESC,firstName=${sort[0].desc ? "DESC" : "ASC"}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,email,avatar,isEmailAuthenticated,isPhoneNumberAuthenticated,firebaseToken,dob,isLinked,isOnline,lastSeenAt,username,emergencyContact,isVisible,isInGroup,createdAt,updatedAt,activeSubscription.*,preference.*`;
    const { data } = await axiosInstance.get(url);

    // calculating how many items are there on the current page
    const startIndex =
      (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
    const endIndex = Math.min(
      data.pagination.currentPage * data.pagination.pageSize,
      data.pagination.totalItems
    );
    const itemsOnPage = endIndex - startIndex + 1;
    setItemsOnPage(itemsOnPage);
    setTotalItems(data.pagination.totalItems);
    handleClientNum(data.data.length);
    return data;
  }

  async function revalidateClient() {
    const statusFilter = filterInput && filterInput !== "all" ? `,activeSubscription.status:=${filterInput}` : "";
    const modalFilterParam = modalFilter && modalFilter !== "all" ? `,preference.id:=${modalFilter}` : "";
    const url = `/api/v1/client?filters=firstName=${searchInput}${statusFilter}${modalFilterParam}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,email,avatar,isEmailAuthenticated,isPhoneNumberAuthenticated,firebaseToken,dob,isLinked,isOnline,lastSeenAt,username,emergencyContact,isVisible,isInGroup,createdAt,updatedAt,activeSubscription.*,preference.*&sort=createdAt=DESC`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the data");
    handleClientNum(data.data.length);
    console.log(data.data, "client data");
    return data;
  }

  async function deleteClient(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/client/${id}`);
    return data;
  }

  // Fetch modals for filtering
  async function fetchModals() {
    const { data } = await axiosInstance.get("/api/v1/modal");
    return data;
  }

  // Fetch payment receipt data
  async function fetchPaymentReceipt(subscriptionId: string) {
    const { data } = await axiosInstance.get(`/api/v1/subscription/user-sub?fields=payment.*&ids=${subscriptionId}`);
    return data;
  }

  async function updateSubscriptionStatus(subscriptionId: string, status: string) {
    console.log(subscriptionId, "subscriptionId, check it!!");
    const { data } = await axiosInstance.patch(`/api/v1/subscription/${subscriptionId}`, {
      status: status
    });
    return data;
  }

  const getReadablePeriod = (type: number): string => {
    switch (type) {
      case 0:
        return "Trial";
      case 1:
        return "Monthly";
      case 3:
        return "Quarterly";
      case 6:
        return "Semi-Annual";
      case 12:
        return "Yearly";
      default:
        return "Invalid type";
    }
  }
  //const getReadablePeriod = (startDate: string, endDate: string): string => {
  //  const start = new Date(startDate);
  //  const end = new Date(endDate);
  //  const diffTime = Math.abs(end.getTime() - start.getTime());
  //  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //  if (diffDays === 1) {
  //    return "1 day";
  //  } else if (diffDays < 7) {
  //    return `${diffDays} days`;
  //  } else if (diffDays === 7) {
  //    return "1 week";
  //  } else if (diffDays < 30) {
  //    const weeks = Math.floor(diffDays / 7);
  //    const remainingDays = diffDays % 7;
  //    if (remainingDays === 0) {
  //      return weeks === 1 ? "1 week" : `${weeks} weeks`;
  //    } else {
  //      return weeks === 1 ? `1 week ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${weeks} weeks ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  //    }
  //  } else if (diffDays < 365) {
  //    const months = Math.floor(diffDays / 30);
  //    const remainingDays = diffDays % 30;
  //    if (remainingDays === 0) {
  //      return months === 1 ? "1 month" : `${months} months`;
  //    } else if (remainingDays < 7) {
  //      return months === 1 ? `1 month ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${months} months ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  //    } else {
  //      const weeks = Math.floor(remainingDays / 7);
  //      const days = remainingDays % 7;
  //      if (days === 0) {
  //        return months === 1 ? `1 month ${weeks} week${weeks > 1 ? 's' : ''}` : `${months} months ${weeks} week${weeks > 1 ? 's' : ''}`;
  //      } else {
  //        return months === 1 ? `1 month ${weeks} week${weeks > 1 ? 's' : ''} ${days} day${days > 1 ? 's' : ''}` : `${months} months ${weeks} week${weeks > 1 ? 's' : ''} ${days} day${days > 1 ? 's' : ''}`;
  //      }
  //    }
  //  } else {
  //    const years = Math.floor(diffDays / 365);
  //    const remainingDays = diffDays % 365;
  //    const months = Math.floor(remainingDays / 30);
  //    if (months === 0) {
  //      return years === 1 ? "1 year" : `${years} years`;
  //    } else {
  //      return years === 1 ? `1 year ${months} month${months > 1 ? 's' : ''}` : `${years} years ${months} month${months > 1 ? 's' : ''}`;
  //    }
  //  }
  //};

  const { isLoading: isClientLoading, data: ClientData } = useQuery({
    queryKey: ["Clients", searchInput, filterInput, modalFilter],
    queryFn: revalidateClient,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Fetch modals query
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: fetchModals,
  });

  interface DeleteResponse {
    // Add your API response structure here
    data: any;
  }

  const queryClient = useQueryClient();
  const { isLoading: isDeleting, mutate } = useMutation<
    DeleteResponse,
    Error,
    string
  >({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client"],
      });
      toast("Client successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the client");
      //toast("Error Encountered deleting the driver");
    },
  });

  // Update subscription status mutation
  const { isLoading: isUpdatingStatus, mutate: updateStatusMutation } = useMutation({
    mutationFn: async ({ subscriptionId, status }: { subscriptionId: string; status: string }) => {
      console.log("Updating subscription:", subscriptionId, "to status:", status);
      const data = await updateSubscriptionStatus(subscriptionId, status);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Clients"],
      });
      toast("Subscription status updated successfully!");
      setPaymentModalOpen(false);
      setSelectedClient(null);
      setSelectedSubscription(null);
      setSelectedStatus("");
    },
    onError: (error: any) => {
      toast(error?.message || "Error updating subscription status");
    },
  });

  const handleUpdatePaymentStatus = () => {
    if (!selectedStatus) {
      toast("Please select a status");
      return;
    }

    if (!selectedSubscription?.id) {
      toast("Subscription information not found");
      return;
    }

    updateStatusMutation({
      subscriptionId: selectedSubscription.id,
      status: selectedStatus
    });
  };

  useEffect(
    function () {
      isAddOpen && handleOpen(false);
    },
    [isAddOpen]
  );

  const columns = useMemo<ColumnDef<IClientsData>[]>(
    () => [
      //{
      //  accessorKey: "id",
      //  header: () => <DataGridRowSelectAll />,
      //  cell: ({ row }) => <DataGridRowSelect row={row} />,
      //  enableSorting: false,
      //  enableHiding: false,
      //  meta: {
      //    headerClassName: "w-0",
      //  },
      //},
      {
        accessorFn: (row) => row.firstName,
        id: "Client",
        header: ({ column }) => (
          <DataGridColumnHeader title="Client" column={column} className="min-w-[180px]" />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.profile ? `${BASE_URL}/${row.original.profile}` : row.original.profile;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            console.log("Image clicked!"); // Add this to debug

            setSelectedImage({
              src: img ? img : avatar,
              name: `${row.original.firstName} ${row.original.lastName}`,
              phone: `+251${row.original.phoneNumber}`,
            });
          };

          return (
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={handleImageClick}
              >
                <img
                  src={img ? img : avatar}
                  className="rounded-full size-9 shrink-0 object-cover transition-transform hover:scale-105"
                  alt={`${row.original.firstName} ${row.original.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>

                {/* Online status indicator */}
                <div
                  className={`flex size-2 bg-${row.original.isOnline ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>
              </div>

              <div className="flex flex-col gap-0.5">
                <Link
                  to={`/clients/${row.original.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px text-left"
                >
                  {row.original.firstName} {row.original.lastName}
                </Link>
                <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                  +251{row.original.phoneNumber}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          className: "min-w-[300px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        id: "gender",
        header: ({ column }) => (
          <DataGridColumnHeader title="Gender" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return info.row.original.gender;
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        // accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Approval Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <div className="flex justify-between relative">
              <span
                className={`badge ${info.row.original.status === "suspended" && "badge-danger"} ${info.row.original.status === "inactive" && "badge-warning"} ${info.row.original.status === "active" && "badge-success"} ${info.row.original.status === "pending" && "badge-primary"} shrink-0 badge-outline rounded-[30px]`}
              >
                <span
                  className={`size-1.5 rounded-full ${info.row.original.status === "suspended" && "bg-danger"} ${info.row.original.status === "inactive" && "bg-warning"} ${info.row.original.status === "active" && "bg-success"} ${info.row.original.status === "pending" && "bg-primary"} me-1.5`}
                ></span>
                {info.row.original.status}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "subscriptionStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Subscription Status" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;
          const subscriptionStatus = client.activeSubscription?.status;

          if (!subscriptionStatus) {
            return (
              <span className="badge badge-gray shrink-0 badge-outline rounded-[30px]">
                <span className="size-1.5 rounded-full bg-gray-400 me-1.5"></span>
                No Subscription
              </span>
            );
          }

          return (
            <span
              className={`badge ${subscriptionStatus === "active" ? "badge-success" :
                subscriptionStatus === "pending" ? "badge-warning" :
                  subscriptionStatus === "canceled" ? "badge-danger" :
                    subscriptionStatus === "paused" ? "badge-info" :
                      subscriptionStatus === "inactive" ? "badge-secondary" :
                        "badge-secondary"
                } shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full ${subscriptionStatus === "active" ? "bg-success" :
                  subscriptionStatus === "pending" ? "bg-warning" :
                    subscriptionStatus === "canceled" ? "bg-danger" :
                      subscriptionStatus === "paused" ? "bg-info" :
                        subscriptionStatus === "inactive" ? "bg-secondary" :
                          "bg-secondary"
                  } me-1.5`}
              ></span>
              {subscriptionStatus}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[160px]",
        },
      },
      {
        id: "modalType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapy Type" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          return <ClientModalCell client={row.original} />;
        },
        meta: {
          headerClassName: "min-w-[140px]",
        },
      },
      {
        id: "level",
        header: ({ column }) => (
          <DataGridColumnHeader title="Level" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          return <ClientLevelCell client={row.original} />;
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "Edit",
        header: ({ column }) => (
          <DataGridColumnHeader title="Edit" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <button
              onClick={() => handleOpen(true, info.row.original)}
              className="btn btn-sm btn-icon btn-clear btn-primary"
            >
              <KeenIcon icon="notepad-edit" />
            </button>
          );
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
      {
        id: "Approve",
        header: ({ column }) => (
          <DataGridColumnHeader title="Approve" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <button
              onClick={() => handleApproval(true, info.row.original)}
              className="btn btn-sm btn-icon btn-clear btn-primary hover:text-white"
            >
              <KeenIcon icon="dots-square-vertical" />
            </button>
          );
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
      {
        id: "approvePayment",
        header: ({ column }) => (
          <DataGridColumnHeader title="Approve Payment" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;

          const handlePaymentClick = async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (client.activeSubscription) {
              setSelectedClient(client);
              setSelectedSubscription(client.activeSubscription);
              setSelectedStatus(client.activeSubscription.status);
              setPaymentModalOpen(true);
            } else {
              toast("No active subscription found for this client");
            }
          };

          return (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaymentClick}
            >
              Manage Payment
            </Button>
          );
        },
        meta: {
          headerClassName: "w-32",
        },
      },
      {
        id: "receipt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Receipt" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const handleReceiptClick = async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            const activeSubscription = row.original.activeSubscription;
            if (!activeSubscription?.id) {
              toast.error("No active subscription found");
              return;
            }

            try {
              const receiptData = await fetchPaymentReceipt(activeSubscription.id);
              const payment = receiptData?.data?.[0]?.payment?.[0];

              if (!payment?.filename) {
                toast.error("No receipt found for this client");
                return;
              }

              const receiptUrl = `${BASE_URL}/payment/${payment.filename}`;
              setSelectedReceipt({
                url: receiptUrl,
                filename: payment.filename,
                clientName: `${row.original.firstName} ${row.original.lastName}`,
              });
              setReceiptModalOpen(true);
            } catch (error) {
              console.error("Error fetching receipt:", error);
              toast.error("Failed to load receipt");
            }
          };

          // Check if client has active subscription
          const hasActiveSubscription = row.original.activeSubscription?.id;

          if (!hasActiveSubscription) {
            return (
              <span className="text-xs text-gray-400 italic">
                No Subscription
              </span>
            );
          }

          return (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReceiptClick}
              className="h-8 px-3"
            >
              <KeenIcon icon="file-down" className="mr-1" />
              View Receipt
            </Button>
          );
        },
        meta: {
          headerClassName: "w-32",
        },
      },
    ],
    [mutate]
  );

  const data: IClientsData[] = useMemo(() => ClientData ?? [], [ClientData]);

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);

    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };

  const Toolbar = () => {
    const handleFilterChange = (value: any) => {
      setFilterInput(value); // Update the state when the user selects an item
      console.log("Filter value changed to:", value); // Optional: log for debugging
    };

    const handleModalFilterChange = (value: any) => {
      setModalFilter(value);
      console.log("Modal filter changed to:", value);
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} clients
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
              value={filterInput}
              onValueChange={handleFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            {/* Modal Type Filter */}
            <Select
              value={modalFilter}
              onValueChange={handleModalFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-40" size="sm">
                <SelectValue placeholder="Therapy Type" />
              </SelectTrigger>
              <SelectContent className="w-48">
                <SelectItem value="all">All Types</SelectItem>
                {modalsData?.data?.map((modal: any) => (
                  <SelectItem key={modal.id} value={modal.id}>
                    {modal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button className="btn btn-sm btn-outline btn-primary">
              <KeenIcon icon="setting-4" /> Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  // if (isDriverLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      {/* Payment Approval Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Manage Payment for {selectedClient?.firstName} {selectedClient?.lastName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-6">
            {/* Show current subscription info */}
            {selectedSubscription && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Current Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedSubscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSubscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                        selectedSubscription.status === 'paused' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedSubscription.status}
                  </span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Period:</strong> {getReadablePeriod(selectedSubscription.subscription.type)}
                </p>
                {
                  selectedSubscription.start_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({selectedSubscription.start_date} to {selectedSubscription.end_date})
                    </p>
                  )
                }
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Update Status</label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setPaymentModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePaymentStatus}
                disabled={isUpdatingStatus || !selectedStatus}
                className="flex-1"
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:bg-gray-100 z-10 transition-colors"
            >
              <KeenIcon icon="cross" className="text-gray-600 text-sm" />
            </button>

            {/* Image with responsive fixed height */}
            <img
              src={selectedImage.src}
              alt={selectedImage.name}
              className="rounded-lg shadow-2xl h-80 sm:h-96 md:h-[500px] lg:h-[600px] w-auto object-cover bg-white"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Info card */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-3 rounded-lg shadow-lg min-w-[200px] text-center">
              <p className="font-semibold text-sm">{selectedImage.name}</p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedImage.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl flex flex-col"
            style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with title and close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <h3 className="font-semibold text-gray-900 text-lg">
                Receipt for {selectedReceipt.clientName}
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <KeenIcon icon="cross" className="text-gray-600 text-sm" />
              </button>
            </div>

            {/* Scrollable image container */}
            <div className="flex-1 overflow-auto p-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <img
                src={selectedReceipt.url}
                alt={`Receipt for ${selectedReceipt.clientName}`}
                className="rounded-lg shadow-md w-auto h-auto max-w-full mx-auto"
                style={{ maxHeight: 'calc(90vh - 180px)', objectFit: 'contain' }}
                onError={(e) => {
                  console.error("Failed to load receipt image");
                  toast.error("Failed to load receipt image");
                  setSelectedReceipt(null);
                }}
              />
            </div>

            {/* Footer with download buttons */}
            <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    // Extract the path from the URL to go through the local proxy
                    // This bypasses CORS by treating it as a same-origin request
                    const urlObj = new URL(selectedReceipt.url);
                    const localPath = urlObj.pathname + urlObj.search; // e.g. /dev/static/...

                    const response = await axiosInstance.get(localPath, {
                      responseType: 'blob',
                      baseURL: '', // Override baseURL to use current origin (localhost)
                    });

                    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
                    const url = window.URL.createObjectURL(blob);

                    // Create temporary link and trigger download
                    const link = document.createElement('a');
                    link.href = url;
                    const extension = selectedReceipt.filename.split('.').pop() || 'png';
                    link.download = `receipt_${selectedReceipt.clientName.replace(/\s+/g, '_')}.${extension}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    toast.success("Receipt downloaded successfully!");
                  } catch (error) {
                    console.error("Error downloading receipt:", error);
                    // Fallback: open in new tab
                    window.open(selectedReceipt.url, '_blank');
                    toast.info("Opening receipt in new tab as fallback.");
                  }
                }}
                className="gap-2"
              >
                <KeenIcon icon="file-down" />
                Download Image
              </Button>

            </div>
          </div>
        </div>
      )}

      <ModalClientTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        clientData={currentClientData}
        isDelete={del}
      />
      <DataGrid
        onFetchData={getClients}
        onSearchData={searchClient}
        data={data}
        link={"clients"}
        columns={columns}
        filterInput={filterInput}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        searchInput={searchInput}
        pagination={{ size: 5 }}
        sorting={[{ id: "firstName", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Clients };