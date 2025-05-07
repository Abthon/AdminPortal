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
import { ModalVehicleRegistrationForm } from "@/partials/modals/vechicle-registration";
import axiosInstance from "@/auth/_helpers";
import { Link } from "react-router-dom";

interface IVehicleRegistrationData {
  id: string;
  color: string;
  make: string;
  model: string;
  owner: string;
  plate_number: number;
  year: number;
  vehicleType: number;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface VehicleRegistrationProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleVehicleNum: (num: any) => void;
  searchInput?: string;
}

const VehicleRegistration = ({
  isAddOpen,
  _handleAddOpen,
  handleVehicleNum,
  searchInput,
}: VehicleRegistrationProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVehicleData, setCurrentVehicleData] =
    useState<IVehicleRegistrationData | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [del, setDel] = useState(false);

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: IVehicleRegistrationData | null = null,
    isDelete?: boolean
  ) => {
    setEditMode(isEdit);
    setCurrentVehicleData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  async function getVehicle({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/vehicles?take=${pageSize}&page=${pageIndex}&sort=make=${sort[0].desc ? "DESC" : "ASC"}`;
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
    handleVehicleNum(data.data.length);
    return data;
  }

  async function searchVehicle({
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
    const url = `/api/v1/vehicles?filters=model=${search}&take=${pageSize}&page=${pageIndex}&sort=make=${sort[0].desc ? "DESC" : "ASC"}`;
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
    handleVehicleNum(data.data.length);
    return data;
  }

  async function revalidateVehicle() {
    const url = `/api/v1/vehicles?`;
    const { data } = await axiosInstance.get(url);
    handleVehicleNum(data.data.length);
    console.log(data.data, "driver data");
    return data;
  }

  async function deleteVehicle(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/vehicles/${id}`);
    console.log(data, "delete");
    return data;
  }

  const { isLoading: isVehicleLoading, data: VehicleData } = useQuery({
    queryKey: ["Vehicle", searchInput],
    queryFn: revalidateVehicle,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<string, Error, string>({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Vehicle"],
      });
      toast("Vehicle successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the vehicle");
      console.error(error?.message);
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

  const columns = useMemo<ColumnDef<IVehicleRegistrationData>[]>(
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
        accessorFn: (row) => row.make,
        id: "make",
        header: ({ column }) => (
          <DataGridColumnHeader title="Make" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.make;
          //info.row.original.make
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.model,
        id: "model",
        header: ({ column }) => (
          <DataGridColumnHeader title="Model" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.model;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.owner,
        id: "owner",
        header: ({ column }) => (
          <DataGridColumnHeader title="Owner" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.owner;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.plate_number,
        id: "plate_number",
        header: ({ column }) => (
          <DataGridColumnHeader title="Plate Number" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.plate_number;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.year,
        id: "year",
        header: ({ column }) => (
          <DataGridColumnHeader title="Year" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.year;
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
              // onClick={() => mutate(info.row.original.id)}
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
    ],
    [mutate]
  );

  const data: IVehicleRegistrationData[] = useMemo(
    () => VehicleData ?? [],
    [VehicleData]
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
          Showing {itemsOnPage} of {totalItems} vehicles
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5"></div>
      </div>
    );
  };

  // if (isVehicleLoading) {
  //   return (
  //     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  //       <div className="text-muted-foreground bg-card  flex items-center gap-2 px-4 py-2 font-medium leading-none text-sm border shadow-sm rounded-md">
  //         <svg
  //           className="animate-spin -ml-1 h-5 w-5 text-muted-foreground"
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //         >
  //           <circle
  //             className="opacity-25"
  //             cx="12"
  //             cy="12"
  //             r="10"
  //             stroke="currentColor"
  //             strokeWidth="3"
  //           ></circle>
  //           <path
  //             className="opacity-75"
  //             fill="currentColor"
  //             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //           ></path>
  //         </svg>
  //         Loading
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <ModalVehicleRegistrationForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        vehicleData={currentVehicleData}
        isDelete={del}
      />
      <DataGrid
        onFetchData={getVehicle}
        columns={columns}
        onSearchData={searchVehicle}
        data={data}
        link={"vehicle"}
        searchInput={searchInput}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        sorting={[{ id: "make", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};
export { VehicleRegistration };
