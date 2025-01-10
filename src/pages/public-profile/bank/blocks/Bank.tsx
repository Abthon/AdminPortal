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
import { ModalBankForm } from "@/partials/modals/bank";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IBankData {
  id: string;
  name: string;
  accountNumber: string;
  accountName: string;
  isApproved: boolean;
}

const Bank = ({
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
  const [currentBankData, setCurrentBankData] = useState<IBankData | null>(
    null
  );
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });

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
    setCurrentBankData(rowData);
    setProfileModalOpen(true);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: IBankData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentBankData(rowData);
    setProfileModalOpen(true);
  };

  // async function getBanks() {
  //   const { data } = await axiosInstance.get("/api/v1/drivers");
  //   console.log(data);
  //   console.log(data.data.length, "length");
  //   handleDriverNum(data.data.length);
  //   return data.data;
  // }
  async function getBanks({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    const url = searchInput
      ? `/api/v1/banks?filters=firstname=${searchInput}`
      : `/api/v1/banks?take=${pageSize}&page=${pageIndex}`;
    const { data } = await axiosInstance.get(url);
    handleDriverNum(data.data.length);
    return data;
  }

  async function SearchBanks() {
    const url = `/api/v1/banks?filters=name=${searchInput}`;
    const { data } = await axiosInstance.get(url);
    handleDriverNum(data.data.length);
    return data;
  }

  async function deleteBank(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/drivers/${id}`);
    return data;
  }

  const { isLoading: isDriverLoading, data: BankData } = useQuery({
    queryKey: ["Banks"],
    queryFn: SearchBanks,
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
        queryKey: ["Banks"],
      });
      toast("Bank successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the bank");
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
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.name;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "accountNumber",
        header: ({ column }) => (
          <DataGridColumnHeader title="accountNumber" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.accountNumber;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "accountName",
        header: ({ column }) => (
          <DataGridColumnHeader title="accountName" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.accountName;
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
              disabled={true}
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
              disabled={true}
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

  const data: IBankData[] = useMemo(() => BankData ?? [], [BankData]);

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
      <ModalBankForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        bankData={currentBankData}
      />
      <DataGrid
        onFetchData={getBanks}
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

export { Bank };
