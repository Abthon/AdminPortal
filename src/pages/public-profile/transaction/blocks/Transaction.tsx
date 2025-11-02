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
import { ITherapistsData } from "@/types/therapist";
import { IClientDetailData, ISubscription } from "@/types/client";
import { IModal } from "@/types/subscription";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

// Component to handle async modal fetching for transaction
const TransactionModalCell = ({ client }: { client: IClientDetailData & { preference?: { id: string; }[]; } }) => {
  const [modalName, setModalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModal = async () => {
      if (!client.preference || client.preference.length === 0) {
        setModalName(null);
        return;
      }

      const preferenceId = client.preference[0].id;
      if (!preferenceId) {
        setModalName(null);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/api/v1/preference/${preferenceId}?fields=modal.*`
        );
        setModalName(data?.data?.modal?.name || null);
      } catch (error) {
        console.error("Error fetching preference modal:", error);
        setModalName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModal();
  }, [client.preference]);

  return (
    <div className="flex items-center">
      {modalName ? (
        <span className="badge badge-primary badge-outline rounded-[30px]">
          <span className="size-1.5 rounded-full bg-primary me-1.5"></span>
          {modalName}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Not Assigned</span>
      )}
    </div>
  );
};

interface ITransactionData {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  client: IClientDetailData & {
    preference?: {
      id: string;
    }[];
  };
  subscription: ISubscription;
  therapist: ITherapistsData
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
  const [modalFilter, setModalFilter] = useState("all");
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
    // Build query parameters
    let queryParams: string[] = [];
    
    // Add pagination and sorting
    queryParams.push(`take=${pageSize}`);
    queryParams.push(`page=${pageIndex}`);
    //queryParams.push(`sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}`);
    queryParams.push(`sort=createdAt=DESC`)
    queryParams.push(`fields=client.*,client.preference.*,status,subscription.*,start_date,end_date,createdAt`);
    
    // Add date parameters
    if (dateFilter.startDate) {
      queryParams.push(`startDate=${dateFilter.startDate}`);
    }
    if (dateFilter.endDate) {
      queryParams.push(`endDate=${dateFilter.endDate}`);
    }
    
    // Build remaining filters
    let remainingFilters: string[] = [];
    
    // Build status filter parameter
    if (statusFilter && statusFilter !== "all") {
      remainingFilters.push(`subscription.status:=${statusFilter}`);
    }
    
    // Build modal filter parameter
    if (modalFilter && modalFilter !== "all") {
      remainingFilters.push(`client.preference.modal.id:=${modalFilter}`);
    }
    
    // Add remaining filters if any
    if (remainingFilters.length > 0) {
      queryParams.push(`filters=${remainingFilters.join(',')}`);
    }
    
    const url = `/api/v1/subscription/user-sub?${queryParams.join('&')}`;
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
    // Build query parameters
    let queryParams: string[] = [];
    
    // Add pagination and sorting
    queryParams.push(`take=${pageSize}`);
    queryParams.push(`page=${pageIndex}`);
    //queryParams.push(`sort=createdAt=${sort[0].desc ? "DESC" : "ASC"}`);
    queryParams.push(`sort=createdAt=DESC`)
    queryParams.push(`fields=client.*,client.preference.*,status,subscription.*,start_date,end_date,createdAt`);
    
    // Add date parameters
    if (dateFilter.startDate) {
      queryParams.push(`startDate=${dateFilter.startDate}`);
    }
    if (dateFilter.endDate) {
      queryParams.push(`endDate=${dateFilter.endDate}`);
    }
    
    // Build remaining filters
    let remainingFilters: string[] = [];
    
    // Add search filter
    if (search) {
      remainingFilters.push(`client.firstName=${search}`);
    }
    
    // Add status filter
    if (statusFilter && statusFilter !== "all") {
      remainingFilters.push(`subscription.status:=${statusFilter}`);
    }
    
    // Add modal filter
    if (modalFilter && modalFilter !== "all") {
      remainingFilters.push(`client.preference.modal.id:=${modalFilter}`);
    }
    
    // Add remaining filters if any
    if (remainingFilters.length > 0) {
      queryParams.push(`filters=${remainingFilters.join(',')}`);
    }
    
    const url = `/api/v1/subscription/user-sub?${queryParams.join('&')}`;
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
    // Build query parameters
    let queryParams: string[] = [];
    
    // Add fields and sorting
    queryParams.push(`fields=client.*,client.preference.*,status,subscription.*,start_date,end_date,createdAt`);
    queryParams.push(`sort=createdAt=DESC`);
    
    // Add date parameters
    if (dateFilter.startDate) {
      queryParams.push(`startDate=${dateFilter.startDate}`);
    }
    if (dateFilter.endDate) {
      queryParams.push(`endDate=${dateFilter.endDate}`);
    }
    
    // Build remaining filters
    let remainingFilters: string[] = [];
    
    // Add search filter
    if (searchInput) {
      remainingFilters.push(`client.firstName=${searchInput}`);
    }
    
    // Add status filter
    if (statusFilter && statusFilter !== "all") {
      remainingFilters.push(`subscription.status:=${statusFilter}`);
    }
    
    // Add modal filter
    if (modalFilter && modalFilter !== "all") {
      remainingFilters.push(`client.preference.modal.id:=${modalFilter}`);
    }
    
    // Add remaining filters if any
    if (remainingFilters.length > 0) {
      queryParams.push(`filters=${remainingFilters.join(',')}`);
    }
    
    const url = `/api/v1/subscription/user-sub?${queryParams.join('&')}`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the data");
    handleTransactionNum(data.data.length);

    return data;
  }

  async function deleteTransaction(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/subscription/${id}`);
    return data;
  }

  // Fetch modals for filtering
  async function fetchModals() {
    const { data } = await axiosInstance.get("/api/v1/modal");
    return data;
  }

  const { isLoading: isTransactionLoading, data: TransactionData } = useQuery({
    queryKey: ["Transactions", searchInput, dateFilter, statusFilter, modalFilter],
    queryFn: revalidateTransaction,
    refetchInterval: 50000,
    refetchIntervalInBackground: true,
  });

  // Fetch modals query
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: fetchModals,
  });

  // Fetch config parameters
  async function getConfigParams() {
    const { data } = await axiosInstance.get("/api/v1/params?take=0");
    console.log("Raw API response:", data);
    console.log("Returning data.data:", data.data);
    return data.data;
  }

  const { data: configData, isLoading: isConfigLoading } = useQuery({
    queryKey: ["ConfigParams"],
    queryFn: getConfigParams,
    staleTime: 300000, // 5 minutes
  });

  // Helper function to get config value by name
  const getConfigValue = (name: string): number => {
    console.log("configData:", configData);
    console.log("Looking for config name:", name);
    if (!configData) {
      console.log("No config data available");
      return 0;
    }
    const config = configData.find((item: any) => item.name === name);
    console.log("Found config:", config);
    return config ? parseFloat(config.value) : 0;
  };

  // Helper function to get original price without VAT (price displayed includes VAT)
  const getOriginalPrice = (priceWithVat: number): number => {
    const vatRate = getConfigValue("vat");
    return priceWithVat / (1 + vatRate);
  };

  // Helper function to calculate VAT amount
  const calculateVAT = (priceWithVat: number): number => {
    const originalPrice = getOriginalPrice(priceWithVat);
    return priceWithVat - originalPrice;
  };

  // Helper function to calculate therapist part
  const calculateTherapistPart = (priceWithVat: number, levelType: string): number => {
    const originalPrice = getOriginalPrice(priceWithVat);
    const levelRate = getConfigValue(levelType?.toUpperCase());
    return originalPrice * levelRate;
  };

  // Helper function to calculate company part
  const calculateCompanyPart = (priceWithVat: number, levelType: string): number => {
    const originalPrice = getOriginalPrice(priceWithVat);
    const therapistPart = calculateTherapistPart(priceWithVat, levelType);
    return originalPrice - therapistPart;
  };

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
      //{
      //  accessorKey: "id",
      //  header: () => <DataGridRowSelectAll />,
      //  cell: ({ row }) => <DataGridRowSelect row={row} />,
      //  enableSorting: false,
      //  enableHiding: false,
      //  meta: {
      //    headerClassName: "w-0",
      //  },
      //},
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
        accessorFn: (row) => row.therapist?.firstName,
        id: "Therapist",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapist" column={column} className="min-w-[180px]"/>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.therapist?.profile ? `${BASE_URL}/${row.original.therapist?.profile}` : null;

          const handleImageClick = (e: React.MouseEvent) => {
            console.log(row.original.therapist, "Therapistooooo");
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            setSelectedImage({
              src: img ? img : avatar,
              name: `${row.original.therapist?.firstName} ${row.original.therapist?.lastName}`,
              phone: `+251${row.original.therapist?.phoneNumber}`,
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
                  alt={`${row.original.therapist?.firstName} ${row.original.therapist?.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>

                {/* Online status indicator */}
                {/*<div
                  className={`flex size-2 bg-${row.original.therapist?.isOnline ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>*/}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.therapist?.firstName} {row.original.therapist?.lastName}
                </span>
                <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                  +251{row.original.therapist?.phoneNumber}
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
          <DataGridColumnHeader title="Type" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const subscriptionType = info.row.original.subscription?.type;
          const typeLabels = {
            0: "Trial",
            1: "Monthly",
            2: "Quarterly", 
            3: "Semi Annual",
            4: "Yearly"
          };
          return typeLabels[subscriptionType as keyof typeof typeLabels] || "Unknown";
        },
        meta: {
          headerClassName: "min-w-[120px]",
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
        id: "therapyType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapy Type" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          return <TransactionModalCell client={row.original.client} />;
        },
        meta: {
          headerClassName: "min-w-[140px]",
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
      {
        id: "totalPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Price" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const price = info.row.original.subscription?.price || 0;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {price.toFixed(2)} Birr
              </span>
              <span className="text-xs text-gray-500">
                Total Amount
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "vat",
        header: ({ column }) => (
          <DataGridColumnHeader title="VAT" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const price = info.row.original.subscription?.price || 0;
          const vatAmount = calculateVAT(price);
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {vatAmount.toFixed(2)} Birr
              </span>
              <span className="text-xs text-gray-500">
                ({(getConfigValue("vat") * 100).toFixed(1)}%)
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "therapistPart",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapist Part" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const price = info.row.original.subscription?.price || 0;
          const levelType = info.row.original.subscription?.level?.type || "";
          const therapistAmount = calculateTherapistPart(price, levelType);
          const levelRate = getConfigValue(levelType?.toUpperCase());
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {therapistAmount.toFixed(2)} Birr
              </span>
              <span className="text-xs text-gray-500">
                ({(levelRate * 100).toFixed(1)}% of base)
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "companyPart",
        header: ({ column }) => (
          <DataGridColumnHeader title="Company Part" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const price = info.row.original.subscription?.price || 0;
          const levelType = info.row.original.subscription?.level?.type || "";
          const companyAmount = calculateCompanyPart(price, levelType);
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {companyAmount.toFixed(2)} Birr
              </span>
              <span className="text-xs text-gray-500">
                Remaining
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "dates",
        header: ({ column }) => (
          <DataGridColumnHeader title="Subscription Period" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const startDate = info.row.original.start_date;
          const endDate = info.row.original.end_date;
          console.log(startDate, endDate, "the datesssss");
          console.log(info.row.original, "the row");
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
        id: "subscriptionStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column}/>
        ),
        enableSorting: true,
        cell: (info) => {
          const status = info.row.original?.status;
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
    ],
    [mutate, configData, getConfigValue, calculateVAT, calculateTherapistPart, calculateCompanyPart]
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

  // Calculate totals from current filtered data
  const totals = useMemo(() => {
    // Check if we have TransactionData from the query
    const transactionList = TransactionData?.data || data;
    console.log("TransactionData:", TransactionData);
    console.log("data:", data);
    console.log("transactionList:", transactionList);
    
    if (!transactionList || !Array.isArray(transactionList)) {
      console.log("No valid transaction list found");
      return { totalCompanyPrice: 0, totalTherapistPrice: 0, totalPrice: 0, totalVAT: 0 };
    }
    
    let totalCompanyPrice = 0;
    let totalTherapistPrice = 0;
    let totalPrice = 0;
    let totalVAT = 0;
    
    transactionList.forEach((transaction: ITransactionData, index: number) => {
      const price = transaction.subscription?.price || 0;
      const levelType = transaction.subscription?.level?.type || "";
      
      console.log(`Transaction ${index}:`, {
        price,
        levelType,
        subscription: transaction.subscription
      });
      
      const companyAmount = calculateCompanyPart(price, levelType);
      const therapistAmount = calculateTherapistPart(price, levelType);
      
      console.log(`Amounts for transaction ${index}:`, {
        companyAmount,
        therapistAmount
      });
      
      const vatAmount = calculateVAT(price);
      
      totalCompanyPrice += companyAmount;
      totalTherapistPrice += therapistAmount;
      totalPrice += price;
      totalVAT += vatAmount;
    });
    
    console.log("Final totals:", { totalCompanyPrice, totalTherapistPrice, totalPrice, totalVAT });
    return { totalCompanyPrice, totalTherapistPrice, totalPrice, totalVAT };
  }, [TransactionData, data]);

  const Toolbar = useMemo(() => {
    //const handleFilterChange = (value: any) => {
    //  setFilterInput(value); // Update the state when the user selects an item
    //  console.log("Filter value changed to:", value); // Optional: log for debugging
    //};

    const handleModalFilterChange = (value: any) => {
      setModalFilter(value);
      console.log("Modal filter changed to:", value);
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title font-medium text-sm">
            Showing {itemsOnPage} of {totalItems} transactions
          </h3>
          
          {/* Total Prices */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-info/10 rounded-lg">
              <KeenIcon icon="chart-pie" className="text-info text-sm" />
              <div className="text-xs">
                <span className="text-gray-600">Total Revenue: </span>
                <span className="font-semibold text-info">
                  {totals.totalPrice.toFixed(2)} Birr
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-lg">
              <KeenIcon icon="percentage" className="text-warning text-sm" />
              <div className="text-xs">
                <span className="text-gray-600">Total VAT: </span>
                <span className="font-semibold text-warning">
                  {totals.totalVAT.toFixed(2)} Birr
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
              <KeenIcon icon="dollar" className="text-success text-sm" />
              <div className="text-xs">
                <span className="text-gray-600">Company Total: </span>
                <span className="font-semibold text-success">
                  {totals.totalCompanyPrice.toFixed(2)} Birr
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <KeenIcon icon="wallet" className="text-primary text-sm" />
              <div className="text-xs">
                <span className="text-gray-600">Therapist Total: </span>
                <span className="font-semibold text-primary">
                  {totals.totalTherapistPrice.toFixed(2)} Birr
                </span>
              </div>
            </div>
          </div>
        </div>

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

            {/* Modal Type Filter */}
            <Select
              value={modalFilter}
              onValueChange={handleModalFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-40" size="sm">
                <SelectValue placeholder="Therapy Type" />
              </SelectTrigger>
              <SelectContent className="w-48">
                <SelectItem value="all">All Types</SelectItem>
                {Array.isArray(modalsData?.data) && modalsData.data.map((modal: any) => (
                  <SelectItem key={modal.id} value={modal.id}>
                    {modal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
  }, [
    itemsOnPage,
    totalItems,
    totals,
    dateFilter,
    startDateOpen,
    endDateOpen,
    startDateMonth,
    endDateMonth,
    handleStartDateTextChange,
    handleEndDateTextChange,
    clearDateFilter,
    statusFilter,
    handleStatusFilterChange,
    modalFilter,
    modalsData,
  ]);

  // if (isDriverLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      <DataGrid
        onFetchData={getTransactions}
        onSearchData={searchTransaction}
        data={data}
        //link={"transactions"}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        searchInput={searchInput}
        pagination={{ size: 5 }}
        sorting={[{ id: "Client", desc: false }]}
        toolbar={Toolbar}
        layout={{ card: true }}
      />
    </>
  );
};

export { Transactions };
