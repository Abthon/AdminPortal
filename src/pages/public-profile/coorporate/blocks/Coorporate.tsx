/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { toAbsoluteUrl } from "@/utils";
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
import { ModalCoorporateForm } from "@/partials/modals/coorporate/ModalCoorporate";
import axiosInstance from "@/auth/_helpers";

interface ICoorporateData {
  id: string;
  name: string;
  email: string;
  address: string;
  status: string;
  booking: string;
  creditLimit: string;
  paymentPlan: string;
  license: string;
  tinNo: string;
  contactPhoneNumber: string;
  backupContactPhoneNumber: string;
  nationalId: string;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface CoorporateProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
}

const Coorporate = ({ isAddOpen, _handleAddOpen }: CoorporateProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [currentCoorporateData, setCurrentCoorporateData] =
    useState<ICoorporateData | null>(null);

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: ICoorporateData | null = null
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentCoorporateData(rowData);
    setProfileModalOpen(true);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: ICoorporateData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentCoorporateData(rowData);
    setProfileModalOpen(true);
  };

  async function getCoorporates() {
    const { data } = await axiosInstance.get("/api/v1/coorporate");
    console.log("here", data.data);
    return data.data;
  }

  async function deleteCoorporates(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/coorporate/${id}`);
    console.log(data, "delete");
    return data;
  }

  const { isLoading: isCoorporateLoading, data: CoorporateData } = useQuery({
    queryKey: ["Coorporate"],
    queryFn: getCoorporates,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<string, Error, string>({
    mutationFn: deleteCoorporates,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Coorporate"],
      });
      toast("Coorporate successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the Coorporate");
      console.error(error);
    },
  });

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

  useEffect(
    function () {
      isAddOpen && handleOpen(false);
    },
    [isAddOpen]
  );

  const columns = useMemo<ColumnDef<ICoorporateData>[]>(
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
      // {
      //   accessorFn: (row: ICoorporateData) => row.user,
      //   id: "users",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //       title="Member"
      //       filter={<ColumnInputFilter column={column} />}
      //       column={column}
      //     />
      //   ),
      //   enableSorting: true,
      //   cell: ({ row }) => {
      //     return (
      //       <div className="flex items-center gap-4">
      //         <img
      //           src={`${BaseURL}${row.original.image}`}
      //           className="rounded-full size-9 shrink-0"
      //           alt={`${row.original.image}`}
      //         />
      //         <div className="flex flex-col gap-0.5">
      //           <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
      //             {row.original.name}
      //           </span>
      //         </div>
      //       </div>
      //     );
      //   },
      //   meta: {
      //     className: "min-w-[300px]",
      //     cellClassName: "min-w-[250px] text-gray-800 font-normal",
      //   },
      // },
      // {
      //   accessorFn: (row) => row.CoorporateType,
      //   id: "CoorporateType",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="CoorporateType ID" column={column} />
      //   ),
      //   enableSorting: true,
      //   cell: (info) => {
      //     return info.row.original.CoorporateType?.id;
      //   },
      //   meta: {
      //     headerClassName: "min-w-[180px]",
      //   },
      // },
      {
        accessorFn: (row) => row.name,
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
        accessorFn: (row) => row.email,
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="email" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.email;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.address,
        id: "address",
        header: ({ column }) => (
          <DataGridColumnHeader title="address" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.address;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="status" column={column} />
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
        accessorFn: (row) => row.email,
        id: "creditLimit",
        header: ({ column }) => (
          <DataGridColumnHeader title="creditLimit" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.creditLimit;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "paymentPlan",
        header: ({ column }) => (
          <DataGridColumnHeader title="paymentPlan" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.paymentPlan;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "license",
        header: ({ column }) => (
          <DataGridColumnHeader title="license" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.license;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "tinNo",
        header: ({ column }) => (
          <DataGridColumnHeader title="tinNo" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.tinNo;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "nationalId",
        header: ({ column }) => (
          <DataGridColumnHeader title="nationalId" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.nationalId;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "contactPhoneNumber",
        header: ({ column }) => (
          <DataGridColumnHeader title="contactPhoneNumber" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.contactPhoneNumber;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "backupContactPhoneNumber",
        header: ({ column }) => (
          <DataGridColumnHeader title="backupContactPhoneNumber" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.backupContactPhoneNumber;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      // {
      //   accessorFn: (row) => row.booking,
      //   id: "booking",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="booking" column={column} />
      //   ),
      //   enableSorting: true,
      //   cell: (info) => {
      //     return info.row.original.booking;
      //   },
      //   meta: {
      //     headerClassName: "min-w-[180px]",
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
          headerClassName: "w-[80px]",
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

  const data: ICoorporateData[] = useMemo(
    () => CoorporateData ?? [],
    [CoorporateData]
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
    const [searchInput, setSearchInput] = useState("");

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing 20 of 68 users
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search users"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
          </div>

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

  if (isCoorporateLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-muted-foreground bg-card  flex items-center gap-2 px-4 py-2 font-medium leading-none text-sm border shadow-sm rounded-md">
          <svg
            className="animate-spin -ml-1 h-5 w-5 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading
        </div>
      </div>
    );
  }

  return (
    <>
      <ModalCoorporateForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        CoorporateData={currentCoorporateData}
      />
      <DataGrid
        columns={columns}
        data={data}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        sorting={[{ id: "users", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};
export { Coorporate };
