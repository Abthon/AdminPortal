import { useEffect, useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ModalClientTypeForm } from "@/partials/modals/client";
import axiosInstance from "@/auth/_helpers";
import ClassNameGenerator from "@mui/utils/ClassNameGenerator";
import { Row } from "react-day-picker";
import { GroupTherapy } from "./GroupTherapy";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface ISessionsData {
  id: string;
  hasclientAttended: boolean;
  schedule: string;
  duration: number;
  therapist: any;
  client: any;
  modal?: {
    id: string;
    name: string;
    description: string;
    order: number;
    updatedAt: string;
    createdAt: string;
  };
}

const Sessions = ({
  isAddOpen,
  _handleAddOpen,
  handleSessionNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleSessionNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [activeTab, setActiveTab] = useState<"sessions" | "group-therapy">("sessions");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [del, setDel] = useState(false);
  const [currentSessionData, setCurrentSessionData] =
    useState<ISessionsData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  // const [sort, setSort] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    schedule: "",
    duration: 60,
    modalId: "",
    therapistId: "",
  });
  const [therapistSearch, setTherapistSearch] = useState("");
  // In your parent component, add this state
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    phone: string;
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
    rowData: ISessionsData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentSessionData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: ISessionsData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentSessionData(rowData);
    setProfileModalOpen(true);
  };

  // async function getDrivers() {
  //   const { data } = await axiosInstance.get("/api/v1/drivers");
  //   console.log(data);
  //   console.log(data.data.length, "length");
  //   handleDriverNum(data.data.length);
  //   return data.data;
  // }
  async function getSessions({
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
    const dateFilterParam = (dateFilter.startDate || dateFilter.endDate) ? 
      `${filterInput && filterInput !== "all" ? "," : ""}${dateFilter.startDate ? `schedule>=${dateFilter.startDate}T00:00:00.000Z` : ""}${dateFilter.startDate && dateFilter.endDate ? "," : ""}${dateFilter.endDate ? `schedule<=${dateFilter.endDate}T23:59:59.999Z` : ""}` : "";
    const url = `/api/v1/session?take=${pageSize}&page=${pageIndex}&sort=id=${sort[0].desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" || dateFilter.startDate || dateFilter.endDate ? `&filters=` : ""}${filterInput && filterInput !== "all" ? `hasclientAttended:=${filterInput}` : ""}${dateFilterParam}&fields=therapist.*,modal.*,client.*,id,hasclientAttended,schedule,duration`;
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
    handleSessionNum(data.data.length);
    return data;
  }

  async function searchSession({
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
    const dateFilterParam = (dateFilter.startDate || dateFilter.endDate) ? 
      `,${dateFilter.startDate ? `schedule>=${dateFilter.startDate}T00:00:00.000Z` : ""}${dateFilter.startDate && dateFilter.endDate ? "," : ""}${dateFilter.endDate ? `schedule<=${dateFilter.endDate}T23:59:59.999Z` : ""}` : "";
    const url = `/api/v1/session?filters=therapist.firstName=${search}${filterInput && filterInput !== "all" ? `,hasclientAttended:=${filterInput}` : ""}${dateFilterParam}&take=${pageSize}&page=${pageIndex}&sort=id=${sort[0].desc ? "DESC" : "ASC"}&fields=therapist.*,modal.*,client.*,id,hasclientAttended,schedule,duration`;
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
    handleSessionNum(data.data.length);
    return data;
  }

  async function revalidateSession() {
    const dateFilterParam = (dateFilter.startDate || dateFilter.endDate) ? 
      `,${dateFilter.startDate ? `schedule>=${dateFilter.startDate}T00:00:00.000Z` : ""}${dateFilter.startDate && dateFilter.endDate ? "," : ""}${dateFilter.endDate ? `schedule<=${dateFilter.endDate}T23:59:59.999Z` : ""}` : "";
    const url = `/api/v1/session?filters=therapist.firstName=${searchInput}${filterInput && filterInput !== "all" ? `,hasclientAttended:=${filterInput}` : ""}${dateFilterParam}&fields=therapist.*,modal.*,client.*,id,hasclientAttended,schedule,duration`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the data");
    handleSessionNum(data.data.length);
    console.log(data.data, "session data");
    return data;
  }

  async function deleteSession(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/session/${id}`);
    return data;
  }

  // Fetch modals for session creation
  async function fetchModals() {
    const { data } = await axiosInstance.get("/api/v1/modal");
    return data;
  }

  // Fetch therapists for session creation
  async function fetchTherapists(search: string = "") {
    const url = search 
      ? `/api/v1/therapist?filters=firstName=${search}&fields=id,firstName,lastName,profile`
      : `/api/v1/therapist?fields=id,firstName,lastName,profile`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // Create session
  async function createSession(sessionData: any) {
    const { data } = await axiosInstance.post("/api/v1/session", sessionData);
    return data;
  }

  const { isLoading: isSessionLoading, data: SessionData } = useQuery({
    queryKey: ["Sessions", searchInput, filterInput, dateFilter],
    queryFn: revalidateSession,
    refetchInterval: 50000,
    refetchIntervalInBackground: true,
  });

  // Fetch modals query
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: fetchModals,
  });

  // Fetch therapists query
  const { data: therapistsData } = useQuery({
    queryKey: ["therapists", therapistSearch],
    queryFn: () => fetchTherapists(therapistSearch),
    enabled: isAddSessionOpen,
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
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
      toast("Client successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the session");
      //toast("Error Encountered deleting the driver");
    },
  });

  // Create session mutation
  const { isLoading: isCreatingSession, mutate: createSessionMutation } = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Sessions"],
      });
      toast("Session created successfully!");
      setIsAddSessionOpen(false);
      setSessionForm({
        schedule: "",
        duration: 60,
        modalId: "",
        therapistId: "",
      });
      setTherapistSearch("");
    },
    onError: (error: any) => {
      toast(error?.message || "Error creating session");
    },
  }); 

  useEffect(
    function () {
      isAddOpen && setIsAddSessionOpen(true);
    },
    [isAddOpen]
  );

  const handleCreateSession = () => {
    if (!sessionForm.schedule || !sessionForm.modalId || !sessionForm.therapistId) {
      toast("Please fill in all required fields");
      return;
    }

    const sessionData = {
      schedule: sessionForm.schedule,
      duration: sessionForm.duration,
      modalId: sessionForm.modalId,
      therapistId: sessionForm.therapistId,
    };

    createSessionMutation(sessionData);
  };

  const columns = useMemo<ColumnDef<ISessionsData>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => <DataGridRowSelectAll />,
        cell: ({ row }) => <DataGridRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-0",
        },
      },
      {
        accessorFn: (row) => row.therapist?.firstName,
        id: "Therapist",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapist" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.therapist?.profile ? `${BASE_URL}/${row.original.therapist?.profile}` : row.original.therapist?.profile;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            console.log("Image clicked!"); // Add this to debug

            setSelectedImage({
              src: img ? img : avatar,
              name: `${row.original.therapist?.firstName} ${row.original.therapist?.lastName}`,
              phone: `+251${row.original.therapist?.phoneNumber}`,
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
                  alt={`${row.original.therapist?.firstName} ${row.original.therapist?.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>

                {/* Online status indicator */}
                <div
                  className={`flex size-2 bg-${row.original.therapist?.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.therapist?.firstName} {row.original.therapist?.lastName}
                </span>
                <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                  +251{row.original.therapist?.phoneNumber}
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
        accessorFn: (row) => row.therapist?.firstName,
        id: "Client",
        header: ({ column }) => (
          <DataGridColumnHeader title="Client" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.client?.profile ? `${BASE_URL}/${row.original.client?.profile}` : row.original.client?.profile;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            console.log("Image clicked!"); // Add this to debug

            setSelectedImage({
              src: img ? img : avatar,
              name: `${row.original.client?.firstName} ${row.original.client?.lastName}`,
              phone: `+251${row.original.client?.phoneNumber}`,
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
                  alt={`${row.original.client?.firstName} ${row.original.client?.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>

                {/* Online status indicator */}
                <div
                  className={`flex size-2 bg-${row.original.client?.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.client?.firstName} {row.original.client?.lastName}
                </span>
                <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                  +251{row.original.client?.phoneNumber}
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
      //{
      //  accessorFn: (row) => row.client?.firstName,
      //  id: "Client",
      //  header: ({ column }) => (
      //    <DataGridColumnHeader title="Client" column={column} />
      //  ),
      //  enableSorting: true,
      //  cell: ({ row }) => {
      //    const img = row.original.client?.profile ? `${BASE_URL}/${row.original.client?.profile}` : row.original.client?.profile;

      //    const handleImageClick = (e: React.MouseEvent) => {
      //      e.preventDefault();
      //      e.stopPropagation();
      //      e.nativeEvent.stopImmediatePropagation();

      //      console.log("Client Image clicked!"); // Add this to debug
      //      if (row.original.client) {
      //        setSelectedImage({
      //          src: img || avatar,
      //          name: `${row.original.client.firstName || ""} ${row.original.client.lastName || ""}`.trim(),
      //          phone: row.original.client.phone || "N/A",
      //        });
      //      }
      //    };

      //    return (
      //      <div className="flex items-center gap-2.5">
      //        <div className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 size-9">
      //          <img
      //            className="size-7 rounded-full cursor-pointer"
      //            src={img || avatar}
      //            alt=""
      //            onClick={handleImageClick}
      //          />
      //        </div>
      //        <div className="flex flex-col gap-0.5">
      //          <span className="leading-none font-medium text-sm text-gray-900">
      //            {row.original.client?.firstName} {row.original.client?.lastName}
      //          </span>
      //          <span className="text-2sm text-gray-700 font-normal">
      //            {row.original.client?.phone}
      //          </span>
      //        </div>
      //      </div>
      //    );
      //  },
      //  meta: {
      //    headerClassName: "min-w-[165px]",
      //  },
      //},
      {
        id: "duration",
        header: ({ column }) => (
          <DataGridColumnHeader title="Duration" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return info.row.original.duration + " minutes";
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
      {
        id: "schedule",
        header: ({ column }) => (
          <DataGridColumnHeader title="Schedule" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          // Format schedule (datetime string) for display
          const schedule = info.row.original.schedule;
          const formatSchedule = (dateTimeString: string | number) => {
            try {
              const date = new Date(dateTimeString);
              const options: Intl.DateTimeFormatOptions = {
                month: 'long',
                weekday: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              };
              return date.toLocaleDateString('en-US', options);
            } catch {
              return dateTimeString?.toString() || 'N/A';
            }
          };
          return formatSchedule(schedule);
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "therapyType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapy Type" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const modalName = info.row.original.modal?.name;
          console.log("Modal data:", info.row.original.modal); // Debug log
          return modalName || "N/A";
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "hasClientAttended",
        header: ({ column }) => (
          <DataGridColumnHeader title="Client Attended" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const hasAttended = info.row.original.hasclientAttended;
          return (
            <div className="flex justify-start relative">
              <span
                className={`badge ${hasAttended ? "badge-success" : "badge-danger"} shrink-0 badge-outline rounded-[30px]`}
              >
                <span
                  className={`size-1.5 rounded-full ${hasAttended ? "bg-success" : "bg-danger"} me-1.5`}
                ></span>
                {hasAttended ? "Yes" : "No"}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
    ],
    [mutate]
  );

  const data: ISessionsData[] = useMemo(() => SessionData ?? [], [SessionData]);

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
    //const handleFilterChange = (value: any) => {
    //  setFilterInput(value); // Update the state when the user selects an item
    //  console.log("Filter value changed to:", value); // Optional: log for debugging
    //};

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateFilter(prev => ({ ...prev, startDate: e.target.value }));
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateFilter(prev => ({ ...prev, endDate: e.target.value }));
    };

    const clearDateFilter = () => {
      setDateFilter({ startDate: "", endDate: "" });
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} sessions
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            {/*<Select
              value={filterInput}
              onValueChange={handleFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>*/}

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFilter.startDate}
                onChange={handleStartDateChange}
                placeholder="Start date"
                className="w-36"
              />
              <span className="text-gray-500 text-sm">to</span>
              <Input
                type="date"
                value={dateFilter.endDate}
                onChange={handleEndDateChange}
                placeholder="End date"
                className="w-36"
              />
              {(dateFilter.startDate || dateFilter.endDate) && (
                <button
                  onClick={clearDateFilter}
                  className="btn btn-sm btn-outline btn-secondary"
                  title="Clear date filter"
                >
                  <KeenIcon icon="cross" />
                </button>
              )}
            </div>
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
      {/* Tab Navigation */}
      <div className="card-header border-b-0 px-5 pb-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`btn btn-sm ${
              activeTab === "sessions" 
                ? "btn-primary" 
                : "btn-light btn-outline"
            }`}
          >
            <KeenIcon icon="calendar" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("group-therapy")}
            className={`btn btn-sm ${
              activeTab === "group-therapy" 
                ? "btn-primary" 
                : "btn-light btn-outline"
            }`}
          >
            <KeenIcon icon="users" />
            Group Therapy
          </button>
        </div>
      </div>

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

      <ModalClientTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        clientData={currentSessionData}
        isDelete={del}
      />

      {/* Add Session Modal */}
      <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Therapy Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Therapy Type</label>
              <Select
                value={sessionForm.modalId}
                onValueChange={(value) => setSessionForm(prev => ({ ...prev, modalId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select therapy type" />
                </SelectTrigger>
                <SelectContent>
                  {modalsData?.data?.map((modal: any) => (
                    <SelectItem key={modal.id} value={modal.id}>
                      {modal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Therapist Search and Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Therapist</label>
              <Input
                type="text"
                placeholder="Search therapist..."
                value={therapistSearch}
                onChange={(e) => setTherapistSearch(e.target.value)}
                className="mb-2"
              />
              <Select
                value={sessionForm.therapistId}
                onValueChange={(value) => setSessionForm(prev => ({ ...prev, therapistId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select therapist" />
                </SelectTrigger>
                <SelectContent>
                  {therapistsData?.data?.map((therapist: any) => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.firstName} {therapist.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium mb-2">Schedule</label>
              <Input
                type="datetime-local"
                value={sessionForm.schedule}
                onChange={(e) => setSessionForm(prev => ({ ...prev, schedule: e.target.value }))}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                min="15"
                max="180"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setIsAddSessionOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={isCreatingSession}
                className="flex-1"
              >
                {isCreatingSession ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === "sessions" ? (
        <DataGrid
          onFetchData={getSessions}
          onSearchData={searchSession}
          data={data}
          link={"session"}
          columns={columns}
          //filterInput={filterInput}
          rowSelection={true}
          onRowSelectionChange={handleRowSelection}
          searchInput={searchInput}
          pagination={{ size: 5 }}
          sorting={[{ id: "id", desc: false }]}
          toolbar={<Toolbar />}
          layout={{ card: true }}
        />
      ) : (
        <GroupTherapy searchInput={searchInput} />
      )}
    </>
  );
};

export { Sessions };
