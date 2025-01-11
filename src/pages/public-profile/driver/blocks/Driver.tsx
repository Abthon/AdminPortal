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
  const [currentDriverData, setCurrentDriverData] =
    useState<IDriversData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  const [sort, setSort] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (isEdit: boolean, rowData: IDriversData | null = null) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentDriverData(rowData);
    setProfileModalOpen(true);
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
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    const url = `/api/v1/drivers?take=${pageSize}&page=${pageIndex}`;
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
  }: {
    pageIndex: number;
    pageSize: number;
    search: any;
  }) {
    const url = `/api/v1/drivers?filters=firstname=${search}&take=${pageSize}&page=${pageIndex}`;
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
    const url = `/api/v1/drivers?filters=firstname=${searchInput}`;
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
    queryKey: ["Drivers", searchInput],
    queryFn: revalidateDriver,
  });

  useEffect(() => {
    console.log(sort, "sort is: ");
  }, [sort]);

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
      toast("Error Encountered deleting the driver");
    },
  });

  // const ColumnInputFilter = <TData, TValue>({
  //   column,
  // }: IColumnFilterProps<TData, TValue>) => {
  //   return (
  //     <Input
  //       placeholder="Filter..."
  //       value={(column.getFilterValue() as string) ?? ""}
  //       onChange={(event) => column.setFilterValue(event.target.value)}
  //       className="h-9 w-full max-w-40"
  //     />
  //   );
  // };

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
        // accessorFn: (row: IUsersData) => row.user,
        id: "users_2",
        header: ({ column }) => (
          <DataGridColumnHeader title="Driver" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          // 'row' argumentini cell funksiyasiga qo'shdik
          return (
            <div className="flex items-center gap-4">
              <img
                src={`${BASE_URL}/profile/${row.original.profilePhoto}`}
                className="rounded-full size-9 shrink-0"
                alt={`${row.original.profilePhoto}`}
              />

              <div className="flex flex-col gap-0.5">
                <Link
                  to={`/public-profile/driver/${row.original.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
                >
                  {row.original.firstName} {row.original.lastName}
                </Link>

                <Link
                  to="#"
                  className="text-2sm text-gray-700 font-normal hover:text-primary-active"
                >
                  {row.original.phoneNumber}
                </Link>
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
        enableSorting: true,
        cell: (info) => {
          return info.row.original.gender;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="status"
            handleServerSort={setSort}
            column={column}
          />
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
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader title="type" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.type;
        },
        meta: {
          headerClassName: "min-w-[180px]",
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
        id: "Delete",
        header: ({ column }) => (
          <DataGridColumnHeader title="Delete" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <button
              onClick={() => mutate(info.row.original.id)}
              className="btn btn-sm btn-icon btn-clear text-red-600 hover:bg-red-500 hover:text-white"
            >
              <KeenIcon icon="trash" />
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
              <KeenIcon icon="double-check" />
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
    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} configs
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select defaultValue="active">
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="latest">
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="older">Older</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
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

  if (isDriverLoading) {
    return <DataGridLoader message="Loading" />;
  }

  return (
    <>
      <ModalDriverTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        driverData={currentDriverData}
      />
      <DataGrid
        onFetchData={getDrivers}
        onSearchData={searchDriver}
        data={data}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        searchInput={searchInput}
        pagination={{ size: 2 }}
        sorting={[{ id: "users", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Drivers };
