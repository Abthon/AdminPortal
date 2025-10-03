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
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ModalTherapistTypeForm } from "@/partials/modals/therapist";
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
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface ITherapistsData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profile: string;
  //is_online: boolean;
  license?: {
    id: string;
    modalId?: string;
    [key: string]: any;
  };
}

const Therapists = ({
  isAddOpen,
  _handleAddOpen,
  handleTherapistNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleTherapistNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [del, setDel] = useState(false);
  const [currentTherapistData, setCurrentTherapistData] =
    useState<ITherapistsData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  // const [sort, setSort] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  // In your parent component, add this state
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    phone: string;
  } | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<ITherapistsData | null>(null);
  const [selectedModalId, setSelectedModalId] = useState("");

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
    rowData: ITherapistsData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentTherapistData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: ITherapistsData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentTherapistData(rowData);
    setProfileModalOpen(true);
  };

  async function getTherapists({
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
    const url = `/api/v1/therapist?take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" ? `&filters=status:=${filterInput}` : ""}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,dob,license.*`;
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
    handleTherapistNum(data.data.length);
    return data;
  }

  async function searchTherapist({
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
    const url = `/api/v1/therapist?filters=firstName=${search}${filterInput && filterInput !== "all" ? `,status:=${filterInput}` : ""}&take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,dob,license.*`;
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
    handleTherapistNum(data.data.length);
    return data;
  }

  async function revalidateTherapist() {
    const url = `/api/v1/therapist?filters=firstName=${searchInput}${filterInput && filterInput !== "all" ? `,status:=${filterInput}` : ""}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,dob,license.*`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the data");
    handleTherapistNum(data.data.length);
    console.log(data.data, "therapist data");
    return data;
  }

  async function fetchModals() {
    const { data } = await axiosInstance.get("/api/v1/modal");
    return data;
  }

  async function deleteTherapist(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/therapist/${id}`);
    return data;
  }

  const { isLoading: isTherapistLoading, data: TherapistData } = useQuery({
    queryKey: ["Therapists", searchInput, filterInput],
    queryFn: revalidateTherapist,
    //refetchInterval: 5000,
    //refetchIntervalInBackground: true,
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
    mutationFn: deleteTherapist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist"],
      });
      toast("Therapist successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the therapist");
      //toast("Error Encountered deleting the driver");
    },
  });

  // Fetch modals query
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: fetchModals,
  });

  // Assign modal to therapist mutation
  const { isLoading: isAssigning, mutate: assignModalMutation } = useMutation({
    mutationFn: async ({ licenseId, modalId }: { licenseId: string; modalId: string }) => {
      const { data } = await axiosInstance.patch(`/api/v1/license/${licenseId}`, {
        modalId: modalId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Therapists"],
      });
      toast("Modal assigned successfully!");
      setAssignModalOpen(false);
      setSelectedTherapist(null);
      setSelectedModalId("");
    },
    onError: (error: any) => {
      toast(error?.message || "Error assigning modal");
    },
  });

  useEffect(
    function () {
      isAddOpen && handleOpen(false);
    },
    [isAddOpen]
  );

  const columns = useMemo<ColumnDef<ITherapistsData>[]>(
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
        accessorFn: (row) => row.firstName,
        id: "Therapist",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapist" column={column} />
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
                {/*<div
                  className={`flex size-2 bg-${row.original.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>*/}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.firstName} {row.original.lastName}
                </span>
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
        accessorKey: "assign",
        header: ({ column }) => (
          <DataGridColumnHeader title="Assign Modal" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const therapist = row.original;
          const currentModal = therapist.license?.[0]?.id;
          console.log(currentModal, "currentModal");
          console.log(therapist.license, "the license");

          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedTherapist(therapist);
                setSelectedModalId(currentModal || "");
                setAssignModalOpen(true);
              }}
            >
              {currentModal ? "Reassign" : "Assign"}
            </Button>
          );
        },
        meta: {
          headerClassName: "w-32",
        },
      },
    ],
    []
  );

  const handleAssignModal = () => {
    console.log("Selected therapist:", selectedTherapist);
    console.log("Selected modal ID:", selectedModalId);
    console.log("License ID:", selectedTherapist?.license?.[0]?.id);
    
    if (!selectedModalId) {
      toast("Please select a therapy type");
      return;
    }
    
    if (!selectedTherapist?.license?.[0]?.id) {
      toast("Therapist license information not found. Please contact support.");
      return;
    }

    assignModalMutation({
      licenseId: selectedTherapist?.license?.[0]?.id,
      modalId: selectedModalId
    });
  };

  const data: ITherapistsData[] = useMemo(() => TherapistData ?? [], [TherapistData]);

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

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} therapists
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
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
      {/* Assign Modal Dialog */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign Therapy Type to {selectedTherapist?.firstName} {selectedTherapist?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Therapy Type</label>
              <Select
                value={selectedModalId}
                onValueChange={setSelectedModalId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a modal type" />
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
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setAssignModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignModal}
                disabled={isAssigning || !selectedModalId}
                className="flex-1"
              >
                {isAssigning ? "Assigning..." : "Assign Modal"}
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

      <ModalTherapistTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        therapistData={currentTherapistData}
        isDelete={del}
      />
      <DataGrid
        onFetchData={getTherapists}
        onSearchData={searchTherapist}
        data={data}
        link={"therapists"}
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

export { Therapists };