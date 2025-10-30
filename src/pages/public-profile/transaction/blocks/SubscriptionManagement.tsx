import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DataGridLoader } from "@/components/data-grid";
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalSubscriptionForm } from "@/partials/modals/subscription/ModalSubscriptionForm";
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
import {
  IAdminSubscription,
  SUBSCRIPTION_TYPES,
  SubscriptionTypeKey
} from "@/types/subscription";

const SubscriptionManagement = ({
  searchInput,
}: {
  searchInput?: string;
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<IAdminSubscription | null>(null);
  const [therapyTypeFilter, setTherapyTypeFilter] = useState("all");

  // Fetch admin subscriptions
  async function getAdminSubscriptions({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const therapyTypeParam = therapyTypeFilter !== "all" ? `,modal.id=${therapyTypeFilter}` : "";
    const url = `/api/v1/subscription?filters=is_admin_created=1${therapyTypeParam}&take=${pageSize}&page=${pageIndex}&sort=id=${sort[0].desc ? "DESC" : "ASC"}&fields=modal.*,level.*,price,old_price,type`;
    
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // Search admin subscriptions
  async function searchAdminSubscriptions({
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
    const therapyTypeParam = therapyTypeFilter !== "all" ? `,modal.id=${therapyTypeFilter}` : "";
    const url = `/api/v1/subscription?filters=is_admin_created=1,modal.name=${search}${therapyTypeParam}&take=${pageSize}&page=${pageIndex}&sort=id=${sort[0].desc ? "DESC" : "ASC"}&fields=modal.*,level.*,price,old_price,type`;
    
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // Fetch modals for filtering
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/modal");
      return data.data;
    },
  });

  // Revalidate subscriptions for real-time updates
  async function revalidateSubscriptions() {
    const therapyTypeParam = therapyTypeFilter !== "all" ? `,modal.id=${therapyTypeFilter}` : "";
    const searchParam = searchInput ? `,modal.name=${searchInput}` : "";
    const url = `/api/v1/subscription?filters=is_admin_created=1${searchParam}${therapyTypeParam}&fields=modal.*,level.*,price,old_price,type`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  const { isLoading: isSubscriptionLoading, data: SubscriptionData } = useQuery({
    queryKey: ["adminSubscriptions", searchInput, therapyTypeFilter],
    queryFn: revalidateSubscriptions,
    refetchInterval: 50000,
    refetchIntervalInBackground: true,
  });

  const data: IAdminSubscription[] = useMemo(() => SubscriptionData?.data ?? [], [SubscriptionData]);

  const handleEdit = (subscription: IAdminSubscription) => {
    setCurrentSubscription(subscription);
    setEditModalOpen(true);
  };

  const columns = useMemo<ColumnDef<IAdminSubscription>[]>(
    () => [
      {
        accessorFn: (row) => row.modal?.name,
        id: "Modal",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapy Type" column={column} className="min-w-[180px]"/>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <span className="text-sm font-medium text-gray-900">
              {row.original.modal?.name || "N/A"}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.type,
        id: "Type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Subscription Type" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const typeKey = row.original.type as SubscriptionTypeKey;
          return (
            <span className={cn(
              "badge badge-sm",
              typeKey === 0 && "badge-success",
              typeKey === 1 && "badge-primary", 
              typeKey === 3 && "badge-warning",
              typeKey === 6 && "badge-info",
              typeKey === 12 && "badge-secondary"
            )}>
              {SUBSCRIPTION_TYPES[typeKey]}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.level?.type,
        id: "Level",
        header: ({ column }) => (
          <DataGridColumnHeader title="Level" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const level = row.original.level;
          const modalName = row.original.modal?.name?.toLowerCase();
          
          // Don't show level for Couple and Group therapy
          if (modalName?.includes('couple') || modalName?.includes('group')) {
            return <span className="text-sm text-gray-400">-</span>;
          }
          
          if (!level) {
            return <span className="text-sm text-gray-400">-</span>;
          }
          
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium capitalize">
                {level.type}
              </span>
              <span className="text-xs text-gray-600">
                XP: {level.minXP}-{level.maxXP || "∞"}
              </span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.price,
        id: "Price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                ${row.original.price}
              </span>
              {row.original.old_price && (
                <span className="text-xs text-gray-500 line-through">
                  ${row.original.old_price}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(row.original)}
                className="btn btn-sm btn-icon btn-clear btn-primary"
                title="Edit subscription"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleEdit]
  );

  const ToolbarComponent = useMemo(() => {
    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {data.length} admin subscriptions
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
              value={therapyTypeFilter}
              onValueChange={setTherapyTypeFilter}
              defaultValue="all"
            >
              <SelectTrigger className="w-48" size="sm">
                <SelectValue placeholder="Filter by therapy type" />
              </SelectTrigger>
              <SelectContent className="w-48">
                <SelectItem value="all">All Therapy Types</SelectItem>
                {modalsData?.map((modal: any) => (
                  <SelectItem key={modal.id} value={modal.id}>
                    {modal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }, [data.length, therapyTypeFilter, modalsData]);

  return (
    <>
      <DataGrid
        onFetchData={getAdminSubscriptions}
        onSearchData={searchAdminSubscriptions}
        data={data}
        columns={columns}
        link=""
        searchInput={searchInput}
        pagination={{ size: 10 }}
        sorting={[{ id: "id", desc: false }]}
        toolbar={ToolbarComponent}
        layout={{ card: true }}
      />

      <ModalSubscriptionForm
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        subscription={currentSubscription}
      />
    </>
  );
};

export { SubscriptionManagement };
