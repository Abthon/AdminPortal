/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import { DataGridLoader } from "@/components/data-grid";

import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  useDataGrid,
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
import { ModalDriverTypeForm } from "@/partials/modals/driver";
import axiosInstance from "@/auth/_helpers";
import { ModalDispatcherForm } from "@/partials/modals/dispatcher";
import { Switch } from "@/components/ui/switch";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IDispatcherData {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  profilePhoto: string;
  type: string;
}

const Dispatcher = ({
  isAddOpen,
  _handleAddOpen,
  handleDispatcherNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleDispatcherNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [del, setDel] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [currentDispatcherData, setCurrentDispatcherData] =
    useState<IDispatcherData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
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
    rowData: IDispatcherData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentDispatcherData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: IDispatcherData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentDispatcherData(rowData);
    setProfileModalOpen(true);
  };

  async function getDispatchers({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const statusFilter =
      filterInput && filterInput !== "all" ? `status:=${filterInput}` : "";
    const url = `/api/v1/admin?take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}&filters=type=dispatch${statusFilter ? `,${statusFilter}` : ""}`;
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
    handleDispatcherNum(data.data.length);
    return data;
  }

  async function searchDispatchers({
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
    const statusFilter =
      filterInput && filterInput !== "all" ? `status:=${filterInput}` : "";
    const url = `/api/v1/admin?filters=firstName=${search},type=dispatch${statusFilter ? `,${statusFilter}` : ""}&take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}`;
    const { data } = await axiosInstance.get(url);
    console.log("hi", data);

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
    handleDispatcherNum(data.data.length);
    return data;
  }

  async function revalidateDispatcher() {
    const statusFilter =
      filterInput && filterInput !== "all" ? `status:=${filterInput}` : "";
    const url = `/api/v1/admin?filters=type=dispatch${statusFilter ? `,${statusFilter}` : ""}`;
    const { data } = await axiosInstance.get(url);
    handleDispatcherNum(data.data.length);
    return data;
  }

  async function deleteDispatcher(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/admin/${id}`);
    return data;
  }

  async function updateDispatcherStatus(id: string, status: string) {
    const { data } = await axiosInstance.patch(`/api/v1/admin/${id}`, {
      status: status,
    });
    return data;
  }

  const { isLoading: isDriverLoading, data: DispatcherData } = useQuery({
    queryKey: ["Dispatchers", searchInput, filterInput],
    queryFn: revalidateDispatcher,
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
    mutationFn: deleteDispatcher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Dispatchers"],
      });
      toast("Dispatcher successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the dispatcher");
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateDispatcherStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Dispatchers"],
      });
      toast("Status updated successfully!");
    },
    onError: (error) => {
      toast("Error updating status");
    },
  });

  useEffect(
    function () {
      isAddOpen && handleOpen(false);
    },
    [isAddOpen]
  );

  const columns = useMemo<ColumnDef<IDispatcherData>[]>(
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
        id: "Profile",
        header: ({ column }) => (
          <DataGridColumnHeader title="Profile" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          console.log(row.original.profilePhoto);

          // Handle cases where profilePhoto might be null/undefined
          const profilePhoto = row.original.profilePhoto;
          let img = "";

          if (profilePhoto) {
            img = !profilePhoto.startsWith("http")
              ? `${BASE_URL}/profile/${profilePhoto}`
              : profilePhoto;
          }

          console.log(img, "the img");

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            console.log("Image clicked!"); // Add this to debug

            setSelectedImage({
              src: img,
            });
          };

          return (
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={handleImageClick}
              >
                {profilePhoto ? (
                  <>
                    <img
                      src={img}
                      className="rounded-full size-9 shrink-0 object-cover transition-transform hover:scale-105"
                      alt={`${row.original.firstName} ${row.original.lastName}`}
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    {/* Fallback initials div (hidden by default) */}
                    <div
                      className="rounded-full size-9 shrink-0 bg-gray-200 flex items-center justify-center transition-transform hover:scale-105"
                      style={{ display: "none" }}
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {row.original.firstName?.charAt(0)?.toUpperCase()}
                        {row.original.lastName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    {/* Hover overlay with zoom icon */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <KeenIcon icon="eye" className="text-white text-xs" />
                    </div>
                  </>
                ) : (
                  // Show initials when no profile photo
                  <div className="rounded-full size-9 shrink-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {row.original.firstName?.charAt(0)?.toUpperCase()}
                      {row.original.lastName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.firstName} {row.original.lastName}
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

      // {
      //   accessorFn: (row) => row.firstName,
      //   id: "profile",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Dispatcher" column={column} />
      //   ),
      //   enableSorting: true,
      //   cell: ({ row }) => {
      //     // If you want to show the profile photo
      //     let img = !row.original.profilePhoto?.startsWith("http")
      //       ? `${BASE_URL}/profile/${row.original.profilePhoto}`
      //       : row.original.profilePhoto;

      //     return (
      //       <div className="flex items-center gap-4">
      //         <div className="flex items-center gap-3">
      //           {row.original.profilePhoto ? (
      //             <img
      //               src={img}
      //               alt={`${row.original.firstName} ${row.original.lastName}`}
      //               className="w-10 h-10 rounded-full object-cover"
      //               onError={(e) => {
      //                 // Fallback to initials if image fails to load
      //                 e.currentTarget.style.display = "none";
      //               }}
      //             />
      //           ) : (
      //             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
      //               <span className="text-sm font-medium text-gray-600">
      //                 {row.original.firstName?.charAt(0)}
      //                 {row.original.lastName?.charAt(0)}
      //               </span>
      //             </div>
      //           )}
      //           <div>
      //             <div className="font-medium text-gray-900">
      //               {row.original.firstName} {row.original.lastName}
      //             </div>
      //             <div className="text-sm text-gray-500">
      //               {row.original.type}
      //             </div>
      //           </div>
      //         </div>
      //       </div>
      //     );
      //   },
      //   meta: {
      //     className: "min-w-[150px]", // Even smaller
      //     cellClassName: "text-gray-800 font-normal",
      //   },
      // },
      // {
      //   accessorFn: (row) => row.firstName,
      //   id: "fname",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="First Name" column={column} />
      //   ),
      //   // enableSorting: true,
      //   cell: (info) => {
      //     return info.row.original.firstName;
      //   },
      //   meta: {
      //     headerClassName: "min-w-[180px]",
      //   },
      // },
      // {
      //   id: "lastName",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Last Name" column={column} />
      //   ),
      //   // enableSorting: true,
      //   cell: (info) => {
      //     return info.row.original.lastName;
      //   },
      //   meta: {
      //     headerClassName: "min-w-[180px]",
      //   },
      // },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const isActive = info.row.original.status === "active";
          return (
            <span
              className={`badge ${!isActive && "badge-danger"} ${isActive && "badge-success"} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full ${!isActive && "bg-danger"} ${isActive && "bg-success"} me-1.5`}
              ></span>
              {info.row.original.status}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.type;
        },
        meta: {
          headerClassName: "min-w-[200px]",
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
          headerClassName: "min-w-[100px]",
        },
      },
      // {
      //   id: "Delete",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Delete" column={column} />
      //   ),
      //   enableSorting: false,
      //   cell: (info) => {
      //     return (
      //       <button
      //         onClick={() => handleOpen(true, info.row.original, true)}
      //         className="btn btn-sm btn-icon btn-clear text-red-600 hover:bg-red-500 hover:text-white"
      //       >
      //         <KeenIcon icon="trash" />
      //       </button>
      //     );
      //   },
      //   meta: {
      //     headerClassName: "w-[80px]",
      //   },
      // },
      {
        id: "Toggle Status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Toggle Status" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const isActive = info.row.original.status === "active";
          return (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="pointer-events-auto"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateStatus({
                    id: info.row.original.id,
                    status: isActive ? "inactive" : "active",
                  });
                }}
                className={`btn btn-sm btn-icon btn-clear ${isActive ? "text-success" : "text-danger"}`}
              >
                <KeenIcon icon={isActive ? "check-circle" : "cross-circle"} />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[80px]",
          cellClassName: "pointer-events-none",
        },
      },
    ],
    [mutate, updateStatus]
  );

  const data: IDispatcherData[] = useMemo(
    () => DispatcherData ?? [],
    [DispatcherData]
  );

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
      setFilterInput(value);
      queryClient.invalidateQueries({
        queryKey: ["Dispatchers", searchInput, value],
      });
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} dispatchers
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
              </SelectContent>
            </Select>
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
              className="rounded-lg shadow-2xl h-80 sm:h-96 md:h-[500px] lg:h-[600px] w-auto object-cover bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <ModalDispatcherForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        dispatcherData={currentDispatcherData}
        isDelete={del}
      />
      <DataGrid
        onFetchData={getDispatchers}
        onSearchData={searchDispatchers}
        searchInput={searchInput}
        data={data}
        filterInput={filterInput}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        sorting={[{ id: "firstName", desc: true }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Dispatcher };
