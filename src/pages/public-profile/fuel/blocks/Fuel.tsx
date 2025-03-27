import { useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  DataGridRowSelectAll,
  DataGridRowSelect,
} from "@/components";
import { ColumnDef, Column, RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/auth/_helpers";
import { timeAgo } from "@/utils/Time";
import { ModalFuel } from "@/partials/modals/fuel";

interface IFuelData {
  id: string;
  createdAt: string;
  fuelCost: string;
  fuelQuantity: string;
  odometerValue: string;
  vehicle: any;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface FuelProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleVehicleNum: (num: any) => void;
  searchInput?: string;
}

const Fuel = ({
  isAddOpen,
  _handleAddOpen,
  handleVehicleNum,
  searchInput,
}: FuelProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFuelData, setCurrentFuelData] = useState<IFuelData | null>(
    null
  );
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (isEdit: boolean, rowData: IFuelData | null = null) => {
    setEditMode(isEdit);
    setCurrentFuelData(rowData);
    setProfileModalOpen(true);
  };

  async function getFuels({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/fuel?fields=vehicle.*,id,createdAt,fuelCost,fuelQuantity,odometerValue&take=${pageSize}&page=${pageIndex}&sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}`;
    console.log(url, "url");
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

  async function revalidateFuel() {
    const url = `/api/v1/fuel?`;
    const { data } = await axiosInstance.get(url);
    handleVehicleNum(data.data.length);
    console.log(data.data, "driver data");
    return data;
  }

  async function deleteFuel(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/fuel/${id}`);
    console.log(data, "delete");
    return data;
  }

  const { isLoading: isFuelLoading, data: FuelData } = useQuery({
    queryKey: ["Fuel"],
    queryFn: revalidateFuel,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<string, Error, string>({
    mutationFn: deleteFuel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Fuel"],
      });
      toast("Fuel record successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the fuel record");
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

  const columns = useMemo<ColumnDef<IFuelData>[]>(
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
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created At" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return timeAgo(info.row.original.createdAt);
          // <Link
          //   to={`/vehicle/${info.row.original.id}`}
          //   className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
          // >
          // </Link>
          //info.row.original.make
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.model,
        id: "plateNumber",
        header: ({ column }) => (
          <DataGridColumnHeader title="Plate Number" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.vehicle.plate_number;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.model,
        id: "fuelCost",
        header: ({ column }) => (
          <DataGridColumnHeader title="Fuel Cost" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.fuelCost;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.owner,
        id: "fuelQuantity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Fuel Quantity" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.fuelQuantity;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.plate_number,
        id: "odometerValue",
        header: ({ column }) => (
          <DataGridColumnHeader title="Odometer Value" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.odometerValue;
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

  const data: IFuelData[] = useMemo(() => FuelData ?? [], [FuelData]);

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
          Showing {itemsOnPage} of {totalItems} Fuels
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5"></div>
      </div>
    );
  };

  return (
    <>
      <ModalFuel
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        fuelData={currentFuelData}
      />
      <DataGrid
        onFetchData={getFuels}
        columns={columns}
        data={data}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        sorting={[{ id: "createdAt", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};
export { Fuel };
