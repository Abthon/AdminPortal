/* eslint-disable prettier/prettier */
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
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ModalVehicleTypeForm } from "@/partials/modals/vehicle-type";
import { DataGridLoader } from "@/components/data-grid";
import axiosInstance from "@/auth/_helpers";
import { Link } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IVehicleTypeData {
  id: string;
  user: string;
  image: string;
  name: string;
  baseFare: number;
  additionalFarePerKm: number;
  minWeightCapacity: number;
  maxWeightCapacity: number;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface VehicleTypeProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleVehicleTypeNum: (num: any) => void;
  searchInput?: string;
}

const VechileType = ({
  isAddOpen,
  _handleAddOpen,
  handleVehicleTypeNum,
  searchInput,
}: VehicleTypeProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVehicleData, setCurrentVehicleData] =
    useState<IVehicleTypeData | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: IVehicleTypeData | null = null
  ) => {
    setEditMode(isEdit);
    setCurrentVehicleData(rowData);
    console.log(rowData, "rowdata");
    setProfileModalOpen(true);
  };

  async function getVehicleType({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    const url = `/api/v1/vehicle-types?take=${pageSize}&page=${pageIndex}`;
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
    handleVehicleTypeNum(data.data.length);
    return data;
  }

  async function searchVehicleType({
    pageIndex,
    pageSize,
    search,
  }: {
    pageIndex: number;
    pageSize: number;
    search: any;
  }) {
    const url = `/api/v1/vehicle-types?filters=name=${search}&take=${pageSize}&page=${pageIndex}`;
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
    handleVehicleTypeNum(data.data.length);
    return data;
  }

  async function revalidateVehicleType() {
    const url = `/api/v1/vehicle-types`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  async function deleteVehicleType(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/vehicle-types/${id}`);
    return data;
  }

  const { isLoading: isVehicleLoading, data: VehicleData } = useQuery({
    queryKey: ["VehicleType", searchInput],
    queryFn: revalidateVehicleType,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<string, Error, string>({
    mutationFn: deleteVehicleType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["VehicleType"],
      });
      toast("Vehicle Type successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the vehicle type");
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

  const columns = useMemo<ColumnDef<IVehicleTypeData>[]>(
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
        // accessorFn: (row: IVehicleTypeData) => row.user,
        id: "users",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Member"
            column={column}
            // filter={<ColumnInputFilter column={column} />}
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <img
                src={`${BASE_URL}/vehicle-type/${row.original.image}`}
                className="rounded-full size-9 shrink-0"
                alt={`${row.original.image}`}
              />
              <div className="flex flex-col gap-0.5">
                {row.original.name}
                {/* <Link
                  to={`/vehicle-type/${row.original.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
                >
                  {row.original.name}
                </Link> */}
              </div>
            </div>
          );
        },
        meta: {
          className: "min-w-[300px]",
          cellClassName: "min-w-[250px] text-gray-800 font-normal",
        },
      },
      {
        // accessorFn: (row) => row.baseFare,
        id: "baseFare",
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Fare" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.baseFare;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.additionalFarePerKm,
        id: "additionalFarePerKm",
        header: ({ column }) => (
          <DataGridColumnHeader title="Additional Fare Per Km" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.additionalFarePerKm;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.minWeightCapacity,
        id: "minWeightCapacity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Min Weight Capacity" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.minWeightCapacity;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.maxWeightCapacity,
        id: "maxWeightCapacity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Max Weight Capacity" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.maxWeightCapacity;
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
          headerClassName: "w-[80px]",
        },
      },
    ],
    [mutate]
  );

  const data: IVehicleTypeData[] = useMemo(
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
          Showing {itemsOnPage} of {totalItems} vehicle types
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

  // if (isVehicleLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      <ModalVehicleTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        vehicleData={currentVehicleData}
      />
      <DataGrid
        onFetchData={getVehicleType}
        onSearchData={searchVehicleType}
        searchInput={searchInput}
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
export { VechileType };
