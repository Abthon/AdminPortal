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
import { ModalTherapistTypeForm } from "@/partials/modals/therapist";
import axiosInstance from "@/auth/_helpers";
import { ModalBankForm } from "@/partials/modals/bank";
import { timeAgo } from "@/utils/Time";
import { ModalUserForm } from "@/partials/modals/user";
import { Switch } from "@/components/ui/switch";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    inactive: "danger",
    active: "success",
  };

  return statusMap[status] || "default"; // Return "default" if the status is not found
}

interface IBankData {
  id: string;
  name: string;
  accountNumber: string;
  accountName: string;
  isApproved: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: string;
  type: string;
  balance: Number;
  isPhoneNumberAuthenticated: boolean;
  limitOver: boolean;
}

const Users = ({
  isAddOpen,
  _handleAddOpen,
  handleBankNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleBankNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<IBankData | null>(
    null
  );
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (isEdit: boolean, rowData: IBankData | null = null) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentUserData(rowData);
    setProfileModalOpen(true);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: IBankData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentUserData(rowData);
    setProfileModalOpen(true);
  };

  async function getUsers({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    console.log(filterInput, "right");
    const url = `/api/v1/users?take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0]?.desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" ? `&filters=status:=${filterInput}` : ""}`;
    console.log("url", url);
    const { data } = await axiosInstance.get(url);

    console.log(data, "data");

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
    handleBankNum(data.data.length);
    return data;
  }

  async function searchUsers({
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
    const url = `/api/v1/users?filters=firstName=${search}${filterInput && filterInput !== "all" ? `,status:=${filterInput}` : ""}&take=${pageSize}&page=${pageIndex}&sort=firstName=${sort[0].desc ? "DESC" : "ASC"}`;

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
    handleBankNum(data.data.length);
    return data;
  }

  async function revalidateUsers() {
    const url = `/api/v1/users?`;
    const { data } = await axiosInstance.get(url);
    handleBankNum(data.data.length);
    console.log(data.data, "driver data");
    return data;
  }

  async function deleteBank(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/drivers/${id}`);
    return data;
  }

  async function updateUserStatus(id: string, status: string) {
    const { data } = await axiosInstance.patch(`/api/v1/users/${id}`, {
      status: status,
    });
    return data;
  }

  const { isLoading: isDriverLoading, data: UserData } = useQuery({
    queryKey: ["Users", searchInput, filterInput],
    queryFn: revalidateUsers,
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
    mutationFn: deleteBank,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Users"],
      });
      toast("Bank successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the user");
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Users"],
      });
      toast("Status updated successfully!");
    },
    onError: (error) => {
      toast("Error updating status");
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

  const columns = useMemo<ColumnDef<IBankData>[]>(
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
          <DataGridColumnHeader title="Users" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          // 'row' argumentini cell funksiyasiga qo'shdik
          return (
            <div className="flex items-center gap-4">
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
          className: "min-w-[280px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span
              className={`badge badge-${getStatusColor(info.row.original.status)} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${getStatusColor(info.row.original.status)} me-1.5`}
              ></span>
              {info.row.original.status}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[130px]",
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created At" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return timeAgo(info.row.original.createdAt);
        },
        meta: {
          headerClassName: "min-w-[130px]",
        },
      },
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

  const data: IBankData[] = useMemo(() => UserData ?? [], [UserData]);

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
          Showing {itemsOnPage} of {totalItems} Users
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
      <ModalUserForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        bankData={currentUserData}
      />
      <DataGrid
        onFetchData={getUsers}
        onSearchData={searchUsers}
        searchInput={searchInput}
        data={data}
        filterInput={filterInput}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        link="users"
        sorting={[{ id: "firstName", desc: true }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Users };
