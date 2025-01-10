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
import { timeAgo } from "@/utils/Time";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IDriversData {
  id: string;
  type: string;
  bankId: number;
  amount: number;
  receipt: string;
  description: string;
  createdAt: string;
  isApproved: boolean;
}

const Deposit = ({
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

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  const handleOpen = (isEdit: boolean, rowData: IDriversData | null = null) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentDriverData(rowData);
    setProfileModalOpen(true);
  };

  // async const handleApproval = (id: boolean) => {
  //   const { data } = await axiosInstance.delete(`/api/v1/drivers/${id}`);
  //   return data;
  // };

  // async function getDeposits() {
  //   const { data } = await axiosInstance.get("/api/v1/drivers");
  //   console.log(data);
  //   console.log(data.data.length, "length");
  //   handleDriverNum(data.data.length);
  //   return data.data;
  // }
  async function getDeposits({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    const url = searchInput
      ? `/api/v1/deposit?filters=firstname=${searchInput}`
      : `/api/v1/deposit?take=${pageSize}&page=${pageIndex}`;
    const { data } = await axiosInstance.get(url);
    handleDriverNum(data.data.length);
    return data;
  }

  async function searchDrivers() {
    const url = `/api/v1/drivers?filters=firstname=${searchInput}`;
    const { data } = await axiosInstance.get(url);
    handleDriverNum(data.data.length);
    return data;
  }

  async function handleApprovalDeposit(id: string) {
    try {
      const values = { depositId: id, isApproved: true };
      console.log(values, "values");
      const { data } = await axiosInstance.post(
        `/api/v1/payment/deposit/approve`,
        values
      );
      return data;
    } catch (err) {
      console.log(err, "The error");
      const errorMessage =
        (err as Error).message ||
        "An error occurred while approving the deposit.";
      throw new Error(errorMessage);
    }
  }

  const { isLoading: isDriverLoading, data: DriverData } = useQuery({
    queryKey: ["Deposits"],
    queryFn: searchDrivers,
  });

  interface ApprovalResponse {
    // Add your API response structure here
    data: any;
  }

  const queryClient = useQueryClient();
  const { isLoading: isApproving, mutate } = useMutation<
    ApprovalResponse,
    Error,
    string
  >({
    mutationFn: handleApprovalDeposit,
    onSuccess: () => {
      console.log("hi");
      toast("Deposit successfully Approved!");
      queryClient.invalidateQueries({
        queryKey: ["Deposits"],
      });
    },
    onError: (error) => {
      toast("Error Encountered Approving the Deposit");
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
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="createdAt" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return timeAgo(info.row.original.createdAt);
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
        id: "amount",
        header: ({ column }) => (
          <DataGridColumnHeader title="amount" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.amount;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "receipt",
        header: ({ column }) => (
          <DataGridColumnHeader title="receipt" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.receipt;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="description" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.description;
        },
        meta: {
          headerClassName: "min-w-[250px]",
        },
      },
      {
        id: "isApproved",
        header: ({ column }) => (
          <DataGridColumnHeader title="isApproved" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return `${info.row.original.isApproved}`;
        },
        meta: {
          headerClassName: "min-w-[250px]",
        },
      },
      // {
      //   id: "Edit",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Edit" column={column} />
      //   ),
      //   enableSorting: false,
      //   cell: (info) => {
      //     return (
      //       <button
      //         disabled={true}
      //         onClick={() => handleOpen(true, info.row.original)}
      //         className="btn btn-sm btn-icon btn-clear btn-primary"
      //       >
      //         <KeenIcon icon="notepad-edit" />
      //       </button>
      //     );
      //   },
      //   meta: {
      //     headerClassName: "min-w-[80px]",
      //   },
      // },
      // {
      //   id: "Delete",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Delete" column={column} />
      //   ),
      //   enableSorting: false,
      //   cell: (info) => {
      //     return (
      //       <button
      //         disabled={true}
      //         onClick={() => mutate(info.row.original.id)}
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
              onClick={() => handleApprovalDeposit(info.row.original.id)}
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
          Showing 20 of 68 users
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

  // if (isDriverLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      <DataGrid
        onFetchData={getDeposits}
        data={data}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 2 }}
        sorting={[{ id: "users", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Deposit };
