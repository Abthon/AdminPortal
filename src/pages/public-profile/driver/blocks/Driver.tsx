/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { toAbsoluteUrl } from "@/utils";
import { DataGridLoader } from "@/components/data-grid";

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
import { ModalDriverTypeForm } from "@/partials/modals/driver";
import axiosInstance from "@/auth/_helpers";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IDriversData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profilePhoto: string;
  is_online: boolean;
}

const Drivers = ({
  isAddOpen,
  _handleAddOpen,
  handleDriverNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleDriverNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [del, setDel] = useState(false);
  const [currentDriverData, setCurrentDriverData] =
    useState<IDriversData | null>(null);
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
    rowData: IDriversData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentDriverData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: IDriversData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentDriverData(rowData);
    setProfileModalOpen(true);
  };

  // async function getDrivers() {
  //   const { data } = await axiosInstance.get("/api/v1/drivers");
  //   console.log(data);
  //   console.log(data.data.length, "length");
  //   handleDriverNum(data.data.length);
  //   return data.data;
  // }
  async function getDrivers({
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
    const url = `/api/v1/drivers?take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" ? `&filters=status:=${filterInput}` : ""}`;
    console.log(url, "url");
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
    handleDriverNum(data.data.length);
    return data;
  }

  async function searchDriver({
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
    const url = `/api/v1/drivers?filters=firstname=${search}${filterInput && filterInput !== "all" ? `,status:=${filterInput}` : ""}&take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}`;
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
    handleDriverNum(data.data.length);
    return data;
  }

  async function revalidateDriver() {
    const url = `/api/v1/drivers?filters=firstname=${searchInput}${filterInput && filterInput !== "all" ? `,status:=${filterInput}` : ""}`;
    const { data } = await axiosInstance.get(url);
    handleDriverNum(data.data.length);
    console.log(data.data, "driver data");
    return data;
  }

  async function deleteDriver(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/drivers/${id}`);
    return data;
  }

  const { isLoading: isDriverLoading, data: DriverData } = useQuery({
    queryKey: ["Drivers", searchInput, filterInput],
    queryFn: revalidateDriver,
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
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Drivers"],
      });
      toast("Driver successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the driver");
      //toast("Error Encountered deleting the driver");
    },
  });

  useEffect(
    function () {
      isAddOpen && handleOpen(false);
    },
    [isAddOpen]
  );

  const columns = useMemo<ColumnDef<IDriversData>[]>(
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
        id: "firstName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Driver" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          console.log(row.original.profilePhoto);
          let img = !row.original.profilePhoto.startsWith("http")
            ? `${BASE_URL}/profile/${row.original.profilePhoto}`
            : row.original.profilePhoto;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            console.log("Image clicked!"); // Add this to debug

            setSelectedImage({
              src: img,
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
                  src={img}
                  className="rounded-full size-9 shrink-0 object-cover transition-transform hover:scale-105"
                  alt={`${row.original.firstName} ${row.original.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>

                {/* Online status indicator */}
                <div
                  className={`flex size-2 bg-${row.original.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>
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
      // {
      //   accessorFn: (row) => row.firstName,
      //   id: "firstName",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Driver" column={column} />
      //   ),
      //   enableSorting: true,
      //   cell: ({ row }) => {
      //     console.log(row.original.profilePhoto);
      //     let img = !row.original.profilePhoto.startsWith("http")
      //       ? `${BASE_URL}/profile/${row.original.profilePhoto}`
      //       : row.original.profilePhoto;
      //     // 'row' argumentini cell funksiyasiga qo'shdik
      //     return (
      //       <div className="flex items-center gap-4">
      //         {/* <img
      //           src={img}
      //           className="rounded-full size-9 shrink-0"
      //           // alt={`${row.original.profilePhoto}`}
      //         /> */}
      //         <div className="relative">
      //           <img
      //             src={img}
      //             className="rounded-full size-9 shrink-0 object-cover"
      //           />
      //           <div
      //             className={`flex size-2 bg-${row.original.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform`}
      //           ></div>
      //         </div>

      //         <div className="flex flex-col gap-0.5">
      //           <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
      //             {row.original.firstName} {row.original.lastName}
      //           </span>

      //           <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
      //             +251{row.original.phoneNumber}
      //           </span>
      //         </div>
      //       </div>
      //     );
      //   },
      //   meta: {
      //     className: "min-w-[300px]",
      //     cellClassName: "text-gray-800 font-normal",
      //   },
      // },

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
      // {
      //   // accessorFn: (row) => row.status,
      //   id: "isOnline",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Availability" column={column} />
      //   ),
      //   enableSorting: true,
      //   cell: (info) => {
      //     console.log(info.row.original, "original");
      //     return (
      //       <div className="flex justify-between relative">
      //         <span
      //           className={`badge ${info.row.original.is_online ? "badge-success" : "badge-danger"} shrink-0 badge-outline rounded-[30px]`}
      //         >
      //           <span
      //             className={`size-1.5 rounded-full ${info.row.original.is_online ? "bg-success" : "bg-danger"}  me-1.5`}
      //           ></span>
      //           {info.row.original.is_online ? "Online" : "Offline"}
      //         </span>
      //       </div>
      //     );
      //   },
      //   meta: {
      //     headerClassName: "min-w-[150px]",
      //   },
      // },
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
      // {
      //   id: "Delete",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Delete" column={column} />
      //   ),
      //   enableSorting: false,
      //   cell: (info) => {
      //     return (
      //       <button
      //         //onClick={() => mutate(info.row.original.id)}
      //         onClick={() => handleOpen(true, info.row.original, true)}
      //         className="btn btn-sm btn-icon btn-clear text-red-600 hover:bg-red-500 hover:text-white"
      //       >
      //         <KeenIcon icon="trash" />
      //       </button>
      //     );
      //   },
      //   meta: {
      //     headerClassName: "min-w-[80px]",
      //   },
      // },
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
    ],
    [mutate]
  );

  const data: IDriversData[] = useMemo(() => DriverData ?? [], [DriverData]);

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
          Showing {itemsOnPage} of {totalItems} drivers
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

      <ModalDriverTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        driverData={currentDriverData}
        isDelete={del}
      />
      <DataGrid
        onFetchData={getDrivers}
        onSearchData={searchDriver}
        data={data}
        link={"driver"}
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

export { Drivers };
