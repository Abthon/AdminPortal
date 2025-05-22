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
      filterInput && filterInput !== "all" ? `status=${filterInput}` : "";
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
      filterInput && filterInput !== "all" ? `status=${filterInput}` : "";
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
      filterInput && filterInput !== "all" ? `status=${filterInput}` : "";
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
        id: "fname",
        header: ({ column }) => (
          <DataGridColumnHeader title="First Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.firstName;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "lastName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.lastName;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
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
          headerClassName: "min-w-[100px]",
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
          headerClassName: "min-w-[100px]",
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
              onClick={() => handleOpen(true, info.row.original, true)}
              className="btn btn-sm btn-icon btn-clear text-red-600 hover:bg-red-500 hover:text-white"
            >
              <KeenIcon icon="trash" />
            </button>
          );
        },
        meta: {
          headerClassName: "w-[80px]",
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
