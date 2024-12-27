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
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const Drivers = ({ isAddOpen, _handleAddOpen }: { isAddOpen: boolean; _handleAddOpen: (isOpen: boolean) => void; }) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [currentDriverData, setCurrentDriverData] = useState<IDriversData | null>(null);

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

  const handleApproval = (isEdit: boolean, rowData: IDriversData | null = null) => {
    setApprovalMode(isEdit);
    setCurrentDriverData(rowData);
    setProfileModalOpen(true);
  };

  async function getDrivers() {
    const { data } = await axiosInstance.get("/api/v1/drivers");
    console.log(data);
    return data.data;
  }

  async function deleteDriver(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/drivers/${id}`);
    return data;
  }

  const { isLoading: isDriverLoading, data: DriverData } = useQuery({
    queryKey: ["Drivers"],
    queryFn: getDrivers,
  });

  interface DeleteResponse {
  // Add your API response structure here
  data: any;
}

  const queryClient = useQueryClient();
  const { isLoading: isDeleting, mutate } = useMutation<DeleteResponse, Error, string>({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Drivers"]
      });
      toast("Driver successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the driver");
    }
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

  const columns = useMemo<ColumnDef<IDriversData>[]>(
    () => [
      {
        id: "ProfilePhoto",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="ProfilePicture"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          console.log(row.original, "the original")
          return (
            <div className="flex items-center">
              <img
                src={`${BASE_URL}/profile/${row.original.profilePhoto}`}
                className="rounded-full size-9 shrink-0"
                alt={`${row.original.profilePhoto}`}
              />
              {/* <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.name}
                </span>
              </div> */}
            </div>
          );
        },
        meta: {
          className: "min-w-[300px]",
          cellClassName: "min-w-[250px] text-gray-800 font-normal",
        },
      },
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
        id: "fName",
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
        id: "lName",
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
        id: "Phone Number",
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone Number" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.phoneNumber;
        },
        meta: {
          headerClassName: "min-w-[180px]",
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
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.status;
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

  if (isDriverLoading) {
    return <DataGridLoader message="Loading"/>;
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

export { Drivers };
