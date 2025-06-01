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

interface ITransactionData {
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

interface TransactionProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleTransactionNum: (num: any) => void;
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

const Transaction: React.FC<TransactionProps> = ({
  isAddOpen,
  _handleAddOpen,
  handleTransactionNum,
  searchInput,
  activeTab,
}) => {
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");

  const handleClose = () => {
    _handleAddOpen(false);
  };

  async function getTransactions({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const sortOrder = sort[0].desc ? "DESC" : "ASC";
    const url = `/api/v1/transactions?take=${pageSize}&page=${pageIndex}&sort=createdAt=${sortOrder}`;
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
    handleTransactionNum(data.data.length);
    return data;
  }

  async function searchTransaction({
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
    const sortOrder = sort[0].desc ? "DESC" : "ASC";
    const url = `/api/v1/transactions?filters=description=${search}&take=${pageSize}&page=${pageIndex}&sort=createdAt=${sortOrder}`;
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
    handleTransactionNum(data.data.length);
    return data;
  }

  async function revalidateTransaction() {
    const url = `/api/v1/transactions`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  let { isLoading: isTransactionLoading, data: TransactionData } = useQuery({
    queryKey: ["Transactions", searchInput, activeTab],
    queryFn: revalidateTransaction,
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

  const columns = useMemo<ColumnDef<ITransactionData>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Transaction ID" column={column} />
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
      // {
      //   id: "actions",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Actions" column={column} />
      //   ),
      //   enableSorting: false,
      //   cell: (info) => {
      //     return (
      //       <div className="flex items-center gap-2">
      //         <button
      //           className="btn btn-sm btn-icon btn-clear btn-primary"
      //           title="View Details"
      //           onClick={() => {
      //             console.log("View transaction details:", info.row.original);
      //           }}
      //         >
      //           <KeenIcon icon="eye" />
      //         </button>
      //         {info.row.original.receipt && (
      //           <button
      //             className="btn btn-sm btn-icon btn-clear btn-secondary"
      //             title="View Receipt"
      //             onClick={() => {
      //               console.log("View receipt:", info.row.original.receipt);
      //             }}
      //           >
      //             <KeenIcon icon="document" />
      //           </button>
      //         )}
      //       </div>
      //     );
      //   },
      //   meta: {
      //     headerClassName: "min-w-[100px]",
      //   },
      // },
    ],
    []
  );

  const data: ITransactionData[] = useMemo(
    () => TransactionData?.data ?? [],
    [TransactionData]
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

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title font-medium text-sm">
            Showing {itemsOnPage} of {totalItems} transactions
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Deductions:</span>
              <span className="text-sm font-semibold text-red-600">
                -{totalDeductions} Birr
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Additions:</span>
              <span className="text-sm font-semibold text-green-600">
                +{totalAdditions} Birr
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Net Amount:</span>
              <span
                className={`text-sm font-semibold ${totalAmount >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {totalAmount >= 0 ? "+" : ""}
                {totalAmount} Birr
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <DataGrid
        onFetchData={getTransactions}
        onSearchData={searchTransaction}
        searchInput={searchInput}
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

export { Transaction };
