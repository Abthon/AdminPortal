import { useEffect, useMemo, useState } from "react";
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
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Skeleton } from "@mui/material";
import { DataGridLoader } from "@/components/data-grid";
import axiosInstance from "@/auth/_helpers";
import { Link } from "react-router-dom";
import { timeAgo } from "@/utils/Time";
import { DatePicker } from "@/components/ui/date-picker";

interface IDriverTransactionData {
  id: number;
  createdAt: string;
  type: string | null;
  action: string;
  amount: number;
  balanceAfter: number;
  isApproved: boolean;
  receipt: string | null;
  description: string;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface DriverTransactionProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleDriverTransactionNum: (num: any) => void;
  searchInput?: string;
  activeTab?: string;
}

function getActionColor(action: string): string {
  const actionMap: Record<string, string> = {
    deduct: "danger",
    add: "success",
    credit: "success",
    debit: "danger",
    topup: "primary",
    withdraw: "warning",
  };

  return actionMap[action] || "default";
}

function getApprovalColor(isApproved: boolean): string {
  return isApproved ? "success" : "warning";
}

const DriverTransaction = ({ driverId }: any) => {
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  async function getDriverTransactions({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const sortOrder = sort[0].desc ? "DESC" : "ASC";

    // Build date filter string
    let dateFilter = "";
    if (startDate && endDate) {
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];
      dateFilter = `,createdAt>=${startDateStr},createdAt<=${endDateStr}`;
    } else if (startDate) {
      const startDateStr = startDate.toISOString().split("T")[0];
      dateFilter = `,createdAt>=${startDateStr}`;
    } else if (endDate) {
      const endDateStr = endDate.toISOString().split("T")[0];
      dateFilter = `,createdAt<=${endDateStr}`;
    }

    const url = `/api/v1/transactions?filters=driver.id=${driverId}${dateFilter}&take=${pageSize}&page=${pageIndex}&sort=createdAt=${sortOrder}`;

    try {
      const { data } = await axiosInstance.get(url);
      console.log(data, "transaction data");

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

      return data; // Make sure this returns the full response
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        data: [],
        pagination: { totalItems: 0, currentPage: 1, pageSize: pageSize },
      };
    }
  }

  // async function searchDriverTransaction({
  //   pageIndex,
  //   pageSize,
  //   search,
  //   sort,
  // }: {
  //   pageIndex: number;
  //   pageSize: number;
  //   search: any;
  //   sort: any;
  // }) {
  //   const sortOrder = sort[0].desc ? "DESC" : "ASC";

  //   // Build date filter string
  //   let dateFilter = "";
  //   if (startDate && endDate) {
  //     const startDateStr = startDate.toISOString().split("T")[0];
  //     const endDateStr = endDate.toISOString().split("T")[0];
  //     dateFilter = `,createdAt>=${startDateStr},createdAt<=${endDateStr}`;
  //   } else if (startDate) {
  //     const startDateStr = startDate.toISOString().split("T")[0];
  //     dateFilter = `,createdAt>=${startDateStr}`;
  //   } else if (endDate) {
  //     const endDateStr = endDate.toISOString().split("T")[0];
  //     dateFilter = `,createdAt<=${endDateStr}`;
  //   }

  //   const url = `/api/v1/transactions?filters=driver.id&description=${search}${dateFilter}&take=${pageSize}&page=${pageIndex}&sort=createdAt=${sortOrder}`;

  //   try {
  //     const { data } = await axiosInstance.get(url);

  //     // calculating how many items are there on the current page
  //     const startIndex =
  //       (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
  //     const endIndex = Math.min(
  //       data.pagination.currentPage * data.pagination.pageSize,
  //       data.pagination.totalItems
  //     );
  //     const itemsOnPage = endIndex - startIndex + 1;
  //     setItemsOnPage(itemsOnPage);
  //     setTotalItems(data.pagination.totalItems);

  //     return data; // Make sure this returns the full response
  //   } catch (error) {
  //     console.error("Error searching transactions:", error);
  //     return {
  //       data: [],
  //       pagination: { totalItems: 0, currentPage: 1, pageSize: pageSize },
  //     };
  //   }
  // }

  async function revalidateDriverTransaction() {
    const url = `/api/v1/transactions`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  let { isLoading: isDriverTransactionLoading, data: DriverTransactionData } =
    useQuery({
      queryKey: ["DriverTransactions", startDate, endDate],
      queryFn: revalidateDriverTransaction,
    });

  const queryClient = useQueryClient();

  const ColumnInputFilter = <TData, TValue>({
    column,
  }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };

  const columns = useMemo<ColumnDef<IDriverTransactionData>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="DriverTransaction ID" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span className="text-sm font-medium text-gray-900">
              #{info.row.original.id}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const date = new Date(info.row.original.createdAt);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900">
                {formattedDate}
              </span>
              <span className="text-xs text-gray-600">{formattedTime}</span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.action,
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const action = info.row.original.action;
          return (
            <span
              className={`badge badge-${getActionColor(action)} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${getActionColor(action)} me-1.5`}
              ></span>
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        accessorFn: (row) => row.amount,
        id: "amount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const amount = info.row.original.amount;
          const action = info.row.original.action;
          return (
            <div className="flex items-center gap-2">
              <KeenIcon
                icon={action === "deduct" ? "minus-circle" : "plus-circle"}
                className={`text-sm ${action === "deduct" ? "text-red-500" : "text-green-500"}`}
              />
              <span
                className={`text-sm font-semibold ${action === "deduct" ? "text-red-600" : "text-green-600"}`}
              >
                {action === "deduct" ? "-" : "+"}
                {amount} Birr
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.balanceAfter,
        id: "balanceAfter",
        header: ({ column }) => (
          <DataGridColumnHeader title="Balance After" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span className="text-sm font-medium text-gray-900">
              {info.row.original.balanceAfter} Birr
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <span className="text-sm text-gray-700">
              {info.row.original.description}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        accessorFn: (row) => row.isApproved,
        id: "isApproved",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const isApproved = info.row.original.isApproved;
          return (
            <span
              className={`badge badge-${getApprovalColor(isApproved)} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${getApprovalColor(isApproved)} me-1.5`}
              ></span>
              {isApproved ? "Approved" : "Pending"}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
    ],
    []
  );

  const data: IDriverTransactionData[] = useMemo(
    () => DriverTransactionData?.data ?? [],
    [DriverTransactionData]
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
    const totalAmount = data.reduce((sum, transaction) => {
      return transaction.action === "deduct"
        ? sum - transaction.amount
        : sum + transaction.amount;
    }, 0);

    const totalDeductions = data
      .filter((t) => t.action === "deduct")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAdditions = data
      .filter((t) => t.action === "add" || t.action === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const clearDateFilters = () => {
      setStartDate(null);
      setEndDate(null);
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title font-medium text-sm">
            Showing {itemsOnPage} of {totalItems} transactions
          </h3>
        </div>

        {/* Date Filter Section */}
        <div className="flex items-center gap-4 mt-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">From:</span>
            <DatePicker
              value={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              className="w-[180px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">To:</span>
            <DatePicker
              value={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              className="w-[180px]"
            />
          </div>
          {(startDate || endDate) && (
            <button onClick={clearDateFilters} className="btn btn-sm btn-light">
              <KeenIcon icon="cross" className="text-sm" />
              Clear Dates
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <DataGrid
        onFetchData={getDriverTransactions}
        // onSearchData={searchDriverTransaction}
        columns={columns}
        data={data}
        filterInput={filterInput}
        // link={"transaction"} This line is what makes row clicable
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        sorting={[{ id: "createdAt", desc: true }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { DriverTransaction };
