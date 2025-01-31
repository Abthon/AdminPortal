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
import { timeAgo } from "@/utils/Time";

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
  createdAt: string;
}
interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface BookingProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleBookingNum: (num: any) => void;
  searchInput?: string;
}

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    driver_not_found: "danger",
    requested: "warning",
    assigned: "info",
    started: "primary",
    completed: "success",
  };

  return statusMap[status] || "default"; // Return "default" if the status is not found
}

const Booking: React.FC<BookingProps> = ({
  isAddOpen,
  _handleAddOpen,
  handleBookingNum,
  searchInput,
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isEndBooking, setIsEndBooking] = useState(false);
  const [currentBookingData, setCurrentBookingData] =
    useState<IBookingData | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  async function getBookings({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/bookings?take=${pageSize}&page=${pageIndex}&sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" ? `&filters=status=${filterInput}` : ""}`;
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
    handleBookingNum(data.data.length);
    return data;
  }

  async function searchBooking({
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
    const url = `/api/v1/bookings?filters=pickupname=${search}${filterInput && filterInput !== "all" ? `,status=${filterInput}` : ""}&take=${pageSize}&page=${pageIndex}&sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}`;
    console.log("url", url);
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

  const handleOpen = (
    isEdit: boolean,
    rowData: IBookingData | null = null,
    isEndBooking: boolean | null = null
  ) => {
    setEditMode(isEdit);
    setCurrentBookingData(rowData);
    setIsEndBooking(isEndBooking || false);
    console.log(rowData, "rowdata");
    setProfileModalOpen(true);
  };

  async function revalidateBooking() {
    const url = `/api/v1/bookings`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  async function startBooking(id: string) {
    const res = await axiosInstance.get(
      `/api/v1/bookings/${id}?fields=driver.id`
    );
    console.log(res, "driver Id");
    console.log(res.data.data.driver.id, "driver Id");
    const { data } = await axiosInstance.post(`/api/v1/bookings/start/${id}`, {
      driverId: res.data.data.driver.id,
    });
    console.log(data, "starting");
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
    queryKey: ["Bookings", searchInput, filterInput],
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
  const { isLoading: isStarting, mutate: mutateStart } = useMutation({
    mutationFn: startBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Bookings"],
      });
      toast("Booking successfully Started!");
    },
    onError: (error: unknown) => {
      toast("Error Encountered while starting the booking");
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
                  to={`/booking/${row.original.id}`}
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
          headerClassName: "min-w-[90px]",
        },
      },
      {
        // accessorFn: (row) => row.pickupName,
        id: "pickupName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pickup" column={column} />
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
          <DataGridColumnHeader title="Drop Off" column={column} />
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
          <DataGridColumnHeader title="Distance" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.estimatedTraveledDistance;
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
      {
        // accessorFn: (row) => row.estimatedPrice,
        id: "estimatedPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
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
          console.log("info", info.row.original.status);
          return (
            <span
              className={`badge badge-${getStatusColor(info.row.original.status)} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${getStatusColor(info.row.original.status)} me-1.5`}
              ></span>
              {info.row.original.status}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[160px]",
        },
      },
      {
        id: "Assign",
        header: ({ column }) => (
          <DataGridColumnHeader title="Assign" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <button
              onClick={() => handleOpen(true, info.row.original)}
              className="btn btn-sm btn-icon btn-clear btn-primary"
            >
              <KeenIcon icon="user-tick" />
            </button>
          );
        },
        meta: {
          headerClassName: "min-w-[75px]",
        },
      },
      {
        id: "Start",
        header: ({ column }) => (
          <DataGridColumnHeader title="Start" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <button
              onClick={() => mutateStart(info.row.original.id)}
              // onClick={() => handleOpen(true, info.row.original)}
              className="btn btn-sm btn-icon btn-clear btn-success"
            >
              <KeenIcon icon="to-right" />
            </button>
          );
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
      {
        id: "End",
        header: ({ column }) => (
          <DataGridColumnHeader title="End" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <button
              onClick={() => handleOpen(false, info.row.original, true)}
              className="btn btn-sm btn-icon btn-clear text-red-600 hover:bg-red-500 hover:text-white"
            >
              <KeenIcon icon="minus-circle" />
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
    const handleFilterChange = (value: any) => {
      setFilterInput(value); // Update the state when the user selects an item
      console.log("Filter value changed to:", value); // Optional: log for debugging
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} bookings
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
              value={filterInput}
              onValueChange={handleFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="driver_not_found">NotFound</SelectItem>
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

  return (
    <>
      <ModalBookingForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isEndBooking={isEndBooking}
        bookingData={currentBookingData}
      />
      <DataGrid
        onFetchData={getBookings}
        onSearchData={searchBooking}
        searchInput={searchInput}
        columns={columns}
        data={data}
        link={"booking"}
        filterInput={filterInput}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 20 }}
        sorting={[{ id: "createdAt", desc: true }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Booking };
