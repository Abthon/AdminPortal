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
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ModalBookingForm } from "@/partials/modals/booking";
import { Skeleton } from "@mui/material";
import { DataGridLoader } from "@/components/data-grid";
import axiosInstance from "@/auth/_helpers";
import { Link } from "react-router-dom";
import { set } from "date-fns";

interface IBookingData {
  id: string;
  pickupName: string;
  pickupLat: number;
  pickupLng: number;
  dropOffName: string;
  dropOffLat: number;
  dropOffLng: number;
  estimatedTraveledDistance: number;
  estimatedPrice: number;
  status: string;
}

const BaseURL = `http://195.201.134.129/test/static/vehicle-type/`;

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface BookingProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleBookingNum: (num: any) => void;
  searchInput?: string;
}

const Booking: React.FC<BookingProps> = ({
  isAddOpen,
  _handleAddOpen,
  handleBookingNum,
  searchInput,
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBookingData, setCurrentBookingData] =
    useState<IBookingData | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  async function getBookings({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    const url = `/api/v1/bookings?take=${pageSize}&page=${pageIndex}`;
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
    handleBookingNum(data.data.length);
    return data;
  }

  async function searchBooking({
    pageIndex,
    pageSize,
    search,
  }: {
    pageIndex: number;
    pageSize: number;
    search: any;
  }) {
    const url = `/api/v1/bookings?filters=pickupname=${search}&take=${pageSize}&page=${pageIndex}`;
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
    handleBookingNum(data.data.length);
    return data;
  }

  const handleOpen = (isEdit: boolean, rowData: IBookingData | null = null) => {
    setEditMode(isEdit);
    setCurrentBookingData(rowData);
    console.log(rowData, "rowdata");
    setProfileModalOpen(true);
  };

  async function revalidateBooking() {
    const url = `/api/v1/bookings`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // async function getBookings(): Promise<IBookingData[]> {
  //   const { data } = await axiosInstance.get("/api/v1/bookings");
  //   console.log(data.data);
  //   handleBookingNum(data.data.length);
  //   return data.data;
  // }

  async function deleteBooking(id: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/bookings/${id}`);
  }

  let { isLoading: isBookingLoading, data: BookingData } = useQuery({
    queryKey: ["Bookings", searchInput],
    queryFn: revalidateBooking,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Bookings"],
      });
      toast("Booking successfully deleted!");
    },
    onError: (error: unknown) => {
      toast("Error Encountered deleting the booking");
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

  const columns = useMemo<ColumnDef<IBookingData>[]>(
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
        // accessorFn: (row) => row.id,
        id: "booking_ID",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="ID"
            column={column}
            // filter={<ColumnInputFilter column={column} />}
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <div className="flex flex-col gap-0.5">
                <Link
                  to={`/public-profile/booking/${row.original.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
                >
                  {row.original.id}
                </Link>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: "w-0",
          className: "w-0",
          cellClassName: "w-0",
        },
      },
      {
        // accessorFn: (row) => row.pickupName,
        id: "pickupName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pickup Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.pickupName;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        // accessorFn: (row) => row.dropOffName,
        id: "dropOffName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Drop Off Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.dropOffName;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        // accessorFn: (row) => row.estimatedTraveledDistance,
        id: "estimatedTraveledDistance",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Estimated Traveled Distance"
            column={column}
          />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.estimatedTraveledDistance;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        // accessorFn: (row) => row.estimatedPrice,
        id: "estimatedPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Estimated Price" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.estimatedPrice;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        // accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span
              className={`badge badge-${
                info.row.original.status === "requested" ? "primary" : "default"
              } shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${
                  info.row.original.status === "requested"
                    ? "primary"
                    : "default"
                } me-1.5`}
              ></span>
              {info.row.original.status}
            </span>
          );
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

  const data: IBookingData[] = useMemo(() => BookingData ?? [], [BookingData]);

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
          Showing {itemsOnPage} of {totalItems} bookings
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

  // if (isBookingLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      <ModalBookingForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        bookingData={currentBookingData}
      />
      <DataGrid
        onFetchData={getBookings}
        onSearchData={searchBooking}
        searchInput={searchInput}
        columns={columns}
        data={data}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 20 }}
        sorting={[{ id: "users", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Booking };
