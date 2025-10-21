import { useEffect, useMemo, useState, useCallback } from "react";
import { toAbsoluteUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { DataGridLoader } from "@/components/data-grid";
import avatar from "@/media/avatars/blank.png";

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
            
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseDate } from "chrono-node";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/auth/_helpers";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface ITransactionData {
  id: string;
  client: {
    id: string;
    updatedAt: string;
    createdAt: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: number;
    phoneNumber: string;
    isEmailAuthenticated: boolean;
    isPhoneNumberAuthenticated: boolean;
    firebaseToken: string | null;
    status: string;
    gender: string;
    dob: string;
    isLinked: boolean;
    isOnline: boolean;
    lastSeenAt: string;
    profile: string | null;
    username: string;
    emergencyContact: string | null;
    isVisible: boolean;
    isInGroup: boolean;
  };
  subscription: {
    id: string;
    updatedAt: string;
    createdAt: string;
    type: number;
    status: string;
    start_date: string;
    end_date: string;
    old_price: number;
    price: number;
    level: {
      id: string;
      updatedAt: string;
      createdAt: string;
      type: string;
      minXP: number;
      maxXP: number | null;
      price: number;
    };
  };
}

const Transactions = ({
  isAddOpen,
  _handleAddOpen,
  handleTransactionNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleTransactionNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [del, setDel] = useState(false);
  const [currentTransactionData, setCurrentTransactionData] =
    useState<ITransactionData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  // const [sort, setSort] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    startDateText: "",
    endDateText: "",
    startDateObj: undefined as Date | undefined,
    endDateObj: undefined as Date | undefined
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startDateMonth, setStartDateMonth] = useState<Date | undefined>(new Date());
  const [endDateMonth, setEndDateMonth] = useState<Date | undefined>(new Date());
  // In your parent component, add this state
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    phone: string;
  } | null>(null);
  const [transactionDetailModalOpen, setTransactionDetailModalOpen] = useState(false);
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState<ITransactionData | null>(null);

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleTransactionDetailClick = (transactionData: ITransactionData) => {
    setSelectedTransactionDetail(transactionData);
    setTransactionDetailModalOpen(true);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: ITransactionData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentTransactionData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: ITransactionData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentTransactionData(rowData);
    setProfileModalOpen(true);
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
    const dateFilterParam = (dateFilter.startDate || dateFilter.endDate) ? 
      `${dateFilter.startDate ? ` subscription.start_date>=${dateFilter.startDate}` : ""}${dateFilter.startDate && dateFilter.endDate ? "," : ""}${dateFilter.endDate ? ` subscription.end_date<=${dateFilter.endDate}` : ""}`  : "";
    const statusFilterParam = (statusFilter && statusFilter !== "all") ? 
      `${dateFilter.startDate || dateFilter.endDate ? "," : ""}subscription.status:=${statusFilter}` : "";
    const url = `/api/v1/subscription/user-sub?take=${pageSize}&page=${pageIndex}&sort=id=${sort[0].desc ? "DESC" : "ASC"}${dateFilter.startDate || dateFilter.endDate || statusFilter && statusFilter !== "all" ? ` &filters=` : ""}${dateFilterParam}${statusFilterParam}&fields=client.*`;
    console.log(url, "url");
    const { data } = await axiosInstance.get(url);

    console.log(data, "The data");
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
    const dateFilterParam = (dateFilter.startDate || dateFilter.endDate) ? 
      `,${dateFilter.startDate ? ` subscription.start_date>=${dateFilter.startDate}` : ""}${dateFilter.startDate && dateFilter.endDate ? "," : ""}${dateFilter.endDate ? ` subscription.end_date<=${dateFilter.endDate}` : ""}`  : "";
    const statusFilterParam = (statusFilter && statusFilter !== "all") ? `,subscription.status:=${statusFilter}` : "";
    const url = `/api/v1/subscription/user-sub?filters=client.firstName=${search}${dateFilterParam}${statusFilterParam}&take=${pageSize}&page=${pageIndex}&sort=id=${sort[0].desc ? "DESC" : "ASC"}&fields=client.*`;
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
    const dateFilterParam = (dateFilter.startDate || dateFilter.endDate) ? 
      `,${dateFilter.startDate ? ` subscription.start_date>=${dateFilter.startDate}` : ""}${dateFilter.startDate && dateFilter.endDate ? "," : ""}${dateFilter.endDate ? ` subscription.end_date<=${dateFilter.endDate}` : ""}`  : "";
    const statusFilterParam = (statusFilter && statusFilter !== "all") ? `,subscription.status:=${statusFilter}` : "";
    const url = `/api/v1/subscription/user-sub?filters=client.firstName=${searchInput}${dateFilterParam}${statusFilterParam}&fields=client.*`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the data");
    handleTransactionNum(data.data.length);
    console.log(data.data, "transaction data");
    return data;
  }

  async function deleteTransaction(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/subscription/${id}`);
    return data;
  }

  const { isLoading: isTransactionLoading, data: TransactionData } = useQuery({
    queryKey: ["Transactions", searchInput, dateFilter, statusFilter],
    queryFn: revalidateTransaction,
    refetchInterval: 50000,
    refetchIntervalInBackground: true,
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
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Transactions"],
      });
      toast("Transaction successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the transaction");
    },
  }); 


  const formatDate = (date: Date | undefined) => {
    if (!date) {
      return "";
    }
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const columns = useMemo<ColumnDef<ITransactionData>[]>(
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
        accessorFn: (row) => row.client?.firstName,
        id: "Client",
        header: ({ column }) => (
          <DataGridColumnHeader title="Client" column={column} className="min-w-[180px]"/>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.client?.profile ? `${BASE_URL}/${row.original.client?.profile}` : null;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            setSelectedImage({
              src: img ? img : avatar,
              name: `${row.original.client?.firstName} ${row.original.client?.lastName}`,
              phone: `+251${row.original.client?.phoneNumber}`,
            });
          };

          return (
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={handleImageClick}
              >
                <img
                  src={img ? img : avatar}
                  className="rounded-full size-9 shrink-0 object-cover transition-transform hover:scale-105"
                  alt={`${row.original.client?.firstName} ${row.original.client?.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>

                {/* Online status indicator */}
                <div
                  className={`flex size-2 bg-${row.original.client?.isOnline ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.client?.firstName} {row.original.client?.lastName}
                </span>
                <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                  +251{row.original.client?.phoneNumber}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          className: "min-w-[280px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        id: "subscriptionType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Subscription Type" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const subscriptionType = info.row.original.subscription?.type;
          const typeLabels = {
            0: "Free",
            1: "Basic",
            2: "Premium", 
            3: "Enterprise"
          };
          return typeLabels[subscriptionType as keyof typeof typeLabels] || "Unknown";
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "subscriptionStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column}/>
        ),
        enableSorting: true,
        cell: (info) => {
          const status = info.row.original.subscription?.status;
          return (
            <div className="flex justify-start relative">
              <span
                className={`badge ${status === "active" ? "badge-success" : status === "inactive" ? "badge-danger" : "badge-warning"} shrink-0 badge-outline rounded-[30px]`}
              >
                <span
                  className={`size-1.5 rounded-full ${status === "active" ? "bg-success" : status === "inactive" ? "bg-danger" : "bg-warning"} me-1.5`}
                ></span>
                {status}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const price = info.row.original.subscription?.price;
          const oldPrice = info.row.original.subscription?.old_price;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {price?.toFixed(2) || "0.00"} Birr
              </span>
              {oldPrice && oldPrice !== price && (
                <span className="text-xs text-gray-500 line-through">
                  {oldPrice.toFixed(2)} Birr
                </span>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "dates",
        header: ({ column }) => (
          <DataGridColumnHeader title="Subscription Period" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const startDate = info.row.original.subscription?.start_date;
          const endDate = info.row.original.subscription?.end_date;
          const formatDate = (dateString: string) => {
            try {
              const date = new Date(dateString);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            } catch {
              return dateString;
            }
          };
          return (
            <div className="flex flex-col text-xs">
              <span>From: {startDate ? formatDate(startDate) : "N/A"}</span>
              <span>To: {endDate ? formatDate(endDate) : "N/A"}</span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "level",
        header: ({ column }) => (
          <DataGridColumnHeader title="Level" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const level = info.row.original.subscription?.level;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium capitalize">{level?.type || "N/A"}</span>
              <span className="text-gray-500">
                XP: {level?.minXP}-{level?.maxXP || "∞"}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
    ],
    [mutate]
  );

  const data: ITransactionData[] = useMemo(() => TransactionData ?? [], [TransactionData]);

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);

    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected transaction IDs: ${selectedRowIds}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };

  const handleStartDateTextChange = useCallback((value: string) => {
    setDateFilter(prev => {
      const date = parseDate(value);
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        setStartDateMonth(date);
        return { ...prev, startDateText: value, startDate: dateStr, startDateObj: date };
      }
      return { ...prev, startDateText: value };
    });
  }, []);

  const handleEndDateTextChange = useCallback((value: string) => {
    setDateFilter(prev => {
      const date = parseDate(value);
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        setEndDateMonth(date);
        return { ...prev, endDateText: value, endDate: dateStr, endDateObj: date };
      }
      return { ...prev, endDateText: value };
    });
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter({ 
      startDate: "", 
      endDate: "",
      startDateText: "",
      endDateText: "",
      startDateObj: undefined,
      endDateObj: undefined
    });
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const Toolbar = useMemo(() => {
    //const handleFilterChange = (value: any) => {
    //  setFilterInput(value); // Update the state when the user selects an item
    //  console.log("Filter value changed to:", value); // Optional: log for debugging
    //};

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} transactions
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            {/*<Select
              value={filterInput}
              onValueChange={handleFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>*/}

            <div className="flex items-center gap-2">
              {/* Start Date Filter */}
              <div className="relative">
                <Input
                  value={dateFilter.startDateText}
                  placeholder="From: today..."
                  className="w-48 pr-8"
                  onChange={(e) => handleStartDateTextChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setStartDateOpen(true);
                    }
                  }}
                />
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Select start date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter.startDateObj}
                      captionLayout="dropdown"
                      month={startDateMonth}
                      onMonthChange={setStartDateMonth}
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = date.toISOString().split('T')[0];
                          setDateFilter(prev => ({ 
                            ...prev, 
                            startDate: dateStr, 
                            startDateObj: date,
                            startDateText: formatDate(date)
                          }));
                        }
                        setStartDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <span className="text-gray-500 text-sm">to</span>
              
              {/* End Date Filter */}
              <div className="relative">
                <Input
                  value={dateFilter.endDateText}
                  placeholder="To: next week..."
                  className="w-48 pr-8"
                  onChange={(e) => handleEndDateTextChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setEndDateOpen(true);
                    }
                  }}
                />
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Select end date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter.endDateObj}
                      captionLayout="dropdown"
                      month={endDateMonth}
                      onMonthChange={setEndDateMonth}
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = date.toISOString().split('T')[0];
                          setDateFilter(prev => ({ 
                            ...prev, 
                            endDate: dateStr, 
                            endDateObj: date,
                            endDateText: formatDate(date)
                          }));
                        }
                        setEndDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {(dateFilter.startDate || dateFilter.endDate) && (
                <button
                  onClick={clearDateFilter}
                  className="btn btn-sm btn-outline btn-secondary"
                  title="Clear date filter"
                >
                  <KeenIcon icon="cross" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [dateFilter.startDateText, dateFilter.endDateText, dateFilter.startDate, dateFilter.endDate, itemsOnPage, totalItems, startDateOpen, endDateOpen, startDateMonth, endDateMonth, handleStartDateTextChange, handleEndDateTextChange, clearDateFilter, statusFilter, handleStatusFilterChange]);

  // if (isDriverLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      <DataGrid
        onFetchData={getTransactions}
        onSearchData={searchTransaction}
        data={data}
        link={"transactions"}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        searchInput={searchInput}
        pagination={{ size: 5 }}
        sorting={[{ id: "id", desc: false }]}
        toolbar={Toolbar}
        layout={{ card: true }}
      />
    </>
  );
};

export { Transactions };
