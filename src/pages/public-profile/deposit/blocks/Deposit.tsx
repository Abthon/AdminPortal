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
import { ModalPayment } from "@/partials/modals/payment";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IDriversData {
  id: string;
  type: string;
  bankId: number;
  amount: number;
  receipt: string;
  description: string;
  createdAt: string;
  coor: any;
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
  const [currentDepositData, setCurrentDepositData] =
    useState<IDriversData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (isEdit: boolean, rowData: IDriversData | null = null) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentDepositData(rowData);
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
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/deposit?take=${pageSize}&page=${pageIndex}&sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" ? `&filters=isApproved=${filterInput == "accepted" ? "1" : "0"}` : ""}&fields=coor.*,createdAt,type,amount,receipt,description,isApproved`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "deposit data");

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

  async function revalidateDeposit() {
    const url = `/api/v1/drivers?filters=firstname=${searchInput}`;
    const { data } = await axiosInstance.get(url);
    handleDriverNum(data.data.length);
    return data;
  }

  async function handleApprovalDeposit({
    id,
    value,
  }: {
    id: string;
    value: boolean;
  }) {
    try {
      const values = { depositId: id, isApproved: !value }; // Flip the approval status
      console.log("hi", values);
      const { data } = await axiosInstance.post(
        "/api/v1/payment/deposit/approve",
        values
      );
      console.log(data, "data");
      return data;
    } catch (err: any) {
      console.log(err, "The error");
      const errorMessage = err?.response?.data?.message;
      const errorMessageAlt =
        (err as Error).message ||
        "An error occurred while approving the deposit.";
      throw new Error(errorMessage || errorMessageAlt);
    }
  }

  const { isLoading: isDriverLoading, data: DepositData } = useQuery({
    queryKey: ["Deposits", filterInput],
    queryFn: revalidateDeposit,
  });

  interface ApprovalResponse {
    // Add your API response structure here
    data: any;
  }

  const queryClient = useQueryClient();

  const { isLoading: isApproving, mutate } = useMutation<
    string,
    Error,
    { id: string; value: boolean }
  >(handleApprovalDeposit, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Deposits"],
      });
      toast("Deposit successfully Approved!");
    },
    onError: (err) => {
      //toast("Error Encountered Approving the Deposit");
      toast.error((err as Error).message);
    },
  });

  // const approveDeposit = (obj: { id: string; value: boolean }) => {
  //   mutate(obj); // Pass the object directly to `mutate`
  // };

  useEffect(
    function () {
      isAddOpen && handleOpen(false);
    },
    [isAddOpen]
  );

  const columns = useMemo<ColumnDef<IDriversData>[]>(
    () => [
      // {
      //   accessorKey: "id",
      //   header: () => <DataGridRowSelectAll />,
      //   cell: ({ row }) => <DataGridRowSelect row={row} />,
      //   enableSorting: false,
      //   enableHiding: false,
      //   meta: {
      //     headerClassName: "w-0",
      //   },
      // },
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
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.estimatedPrice,
        id: "corporatename",
        header: ({ column }) => (
          <DataGridColumnHeader title="Corporate" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.coor?.name;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "Type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.type;
        },
        meta: {
          headerClassName: "min-w-[130px]",
        },
      },
      {
        id: "Amount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.amount;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "Reciept",
        header: ({ column }) => (
          <DataGridColumnHeader title="Receipt" column={column} />
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
        id: "Description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
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
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <div className="flex justify-between relative">
              <span
                className={`badge ${info.row.original.isApproved === false && "badge-danger"} ${info.row.original.isApproved === true && "badge-success"} shrink-0 badge-outline rounded-[30px]`}
              >
                <span
                  className={`size-1.5 rounded-full ${info.row.original.isApproved === false && "bg-danger"} ${info.row.original.isApproved === true && "bg-success"} me-1.5`}
                ></span>
                {info.row.original.isApproved ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
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
          const obj = {
            id: info.row.original.id,
            value: info.row.original.isApproved,
          };
          //console.log(info.row.original.isApproved);
          return (
            // <button
            //   onClick={() => mutate(info.row.original.id)}
            //   className="btn btn-sm btn-icon btn-clear btn-primary hover:text-white"
            // >
            //   <KeenIcon icon="double-check" />
            // </button>

            <div className="flex items-center gap-2">
              <label className="switch switch-sm">
                <input
                  onClick={() => mutate(obj)}
                  type="checkbox"
                  checked={info.row.original.isApproved}
                  name="check"
                  disabled={isApproving}
                />
              </label>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
    ],
    [mutate]
  );

  const data: IDriversData[] = useMemo(() => DepositData ?? [], [DepositData]);

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
          Showing {itemsOnPage} of {totalItems} deposits
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
                <SelectItem value="accepted">Active</SelectItem>
                <SelectItem value="rejected">InActive</SelectItem>
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
      <ModalPayment open={profileModalOpen} onOpenChange={handleClose} />
      <DataGrid
        onFetchData={getDeposits}
        data={data}
        filterInput={filterInput}
        columns={columns}
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

export { Deposit };
