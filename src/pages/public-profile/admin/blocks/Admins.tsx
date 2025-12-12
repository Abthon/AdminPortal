import { useEffect, useMemo, useState } from "react";
import avatar from "@/media/avatars/blank.png";

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
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "react-query";
import axiosInstance from "@/auth/_helpers";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

enum AdminRoles {
  SUPER = "super",
  DISPATCH = "dispatch",
  SUPPORT = "support"
}

interface IAdminData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profile: string | null;
  email: string;
  avatar: number;
  isEmailAuthenticated: boolean;
  isPhoneNumberAuthenticated: boolean;
  firebaseToken: string | null;
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const Admins = ({
  isAddOpen,
  _handleAddOpen,
  handleAdminNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleAdminNum: (num: any) => void;
  searchInput?: string;
}) => {
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  async function getAdmins({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {

	console.log(pageIndex, pageSize, sort, "the page index");
    // Build filters - always exclude super admins
    const filters: string[] = ["role!=super"];
    
    // Add status filter
    if (filterInput && filterInput !== "all") {
      filters.push(`status:=${filterInput}`);
    }
    
    // Add role filter
    if (roleFilter && roleFilter !== "all") {
      filters.push(`role:=${roleFilter}`);
    }
    
    const filterString = filters.length > 0 ? `&filters=${filters.join(',')}` : "";
    const url = `/api/v1/admin?take=${pageSize}&page=${pageIndex}&sort=createdAt=DESC,firstName=${sort[0].desc ? "DESC" : "ASC"}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,email,avatar,isEmailAuthenticated,isPhoneNumberAuthenticated,firebaseToken,dob,isLinked,isOnline,lastSeenAt,role,createdAt,updatedAt${filterString}`;
    
    console.log(url, "url");
    const { data } = await axiosInstance.get(url);

    console.log(data, "The admin data - full response");
    
    // Check if pagination exists in response
    if (!data.pagination) {
      console.error("No pagination data in response:", data);
      // Handle case where API doesn't return pagination
      const itemCount = data.data?.length || 0;
      setItemsOnPage(itemCount);
      setTotalItems(itemCount);
      handleAdminNum(itemCount);
      return data;
    }
    
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
    handleAdminNum(data.data?.length || 0);
    return data;
  }

  async function searchAdmin({
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
    // Build filters - always exclude super admins
    const filters: string[] = ["role!=super"];
    
    // Add search filter
    filters.push(`firstName=${search}`);
    
    // Add status filter
    if (filterInput && filterInput !== "all") {
      filters.push(`status:=${filterInput}`);
    }
    
    // Add role filter
    if (roleFilter && roleFilter !== "all") {
      filters.push(`role:=${roleFilter}`);
    }
    
    const url = `/api/v1/admin?filters=${filters.join(',')}&take=${pageSize}&page=${pageIndex}&sort=createdAt=DESC,firstName=${sort[0].desc ? "DESC" : "ASC"}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,email,avatar,isEmailAuthenticated,isPhoneNumberAuthenticated,firebaseToken,dob,isLinked,isOnline,lastSeenAt,role,createdAt,updatedAt`;
    const { data } = await axiosInstance.get(url);

    // Check if pagination exists in response
    if (!data.pagination) {
      console.error("No pagination data in search response:", data);
      const itemCount = data.data?.length || 0;
      setItemsOnPage(itemCount);
      setTotalItems(itemCount);
      handleAdminNum(itemCount);
      return data;
    }

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
    handleAdminNum(data.data?.length || 0);
    return data;
  }

  async function revalidateAdmin() {
    // Build filters - always exclude super admins
    const filters: string[] = ["role!=super"];
    
    // Add search filter if exists
    if (searchInput && searchInput.trim()) {
      filters.push(`firstName=${searchInput}`);
    }
    
    // Add status filter
    if (filterInput && filterInput !== "all") {
      filters.push(`status:=${filterInput}`);
    }
    
    // Add role filter
    if (roleFilter && roleFilter !== "all") {
      filters.push(`role:=${roleFilter}`);
    }
    
    const url = `/api/v1/admin?filters=${filters.join(',')}&fields=id,firstName,lastName,phoneNumber,gender,status,profile,email,avatar,isEmailAuthenticated,isPhoneNumberAuthenticated,firebaseToken,dob,isLinked,isOnline,lastSeenAt,role,createdAt,updatedAt&sort=createdAt=DESC`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the admin data - revalidate");
    handleAdminNum(data.data?.length || 0);
    console.log(data.data, "admin data");
    return data;
  }

  const { isLoading: isAdminLoading, data: AdminData } = useQuery({
    queryKey: ["Admins", searchInput, filterInput, roleFilter],
    queryFn: revalidateAdmin,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Update admin status mutation
  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: async ({ adminId, status }: { adminId: string; status: string }) => {
      const { data } = await axiosInstance.patch(`/api/v1/admin/${adminId}`, {
        status
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Admins"],
      });
      toast.success("Status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error updating status");
    },
  });

  // Update admin role mutation
  const { mutate: updateRoleMutation } = useMutation({
    mutationFn: async ({ adminId, role }: { adminId: string; role: string }) => {
      const { data } = await axiosInstance.patch(`/api/v1/admin/${adminId}`, {
        role
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Admins"],
      });
      toast.success("Role updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error updating role");
    },
  });

  const handleStatusUpdate = (adminId: string, newStatus: string) => {
    updateStatusMutation({ adminId, status: newStatus });
  };

  const handleRoleUpdate = (adminId: string, newRole: string) => {
    updateRoleMutation({ adminId, role: newRole });
  };

  const columns = useMemo<ColumnDef<IAdminData>[]>(
    () => [
      {
        accessorFn: (row) => row.firstName,
        id: "Admin",
        header: ({ column }) => (
          <DataGridColumnHeader title="Admin" column={column} className="min-w-[180px]"/>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.profile ? `${BASE_URL}/${row.original.profile}` : avatar;

          return (
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={img}
                  className="rounded-full size-9 shrink-0 object-cover"
                  alt={`${row.original.firstName} ${row.original.lastName}`}
                />
                <div
                  className={`flex size-2 bg-${row.original.isOnline ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform`}
                ></div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 mb-px text-left">
                  {row.original.firstName} {row.original.lastName}
                </span>
                <span className="text-2sm text-gray-700 font-normal">
                  +251{row.original.phoneNumber}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          className: "min-w-[300px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <span className="text-sm text-gray-700">
              {info.row.original.email}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        id: "role",
        header: ({ column }) => (
          <DataGridColumnHeader title="Role" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const admin = info.row.original;
          return (
            <select 
              className="form-select form-select-sm w-auto"
              value={admin.role}
              onChange={(e) => handleRoleUpdate(admin.id, e.target.value)}
            >
              <option value={AdminRoles.DISPATCH}>
                🚀 Dispatch
              </option>
              <option value={AdminRoles.SUPPORT}>
                💬 Support
              </option>
            </select>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const admin = info.row.original;
          return (
            <select 
              className={`form-select form-select-sm w-auto ${
                admin.status === 'active' ? 'text-success' : 'text-danger'
              }`}
              value={admin.status}
              onChange={(e) => handleStatusUpdate(admin.id, e.target.value)}
            >
              <option value="active" className="text-success">
                ✓ Active
              </option>
              <option value="inactive" className="text-danger">
                ✗ Inactive
              </option>
            </select>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "gender",
        header: ({ column }) => (
          <DataGridColumnHeader title="Gender" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return (
            <span className="text-sm text-gray-700 capitalize">
              {info.row.original.gender}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
    ],
    []
  );

  const data: IAdminData[] = useMemo(() => AdminData ?? [], [AdminData]);

  const handleRowSelection = (updaterOrValue: any) => {
    // Handle row selection if needed
  };

  const Toolbar = useMemo(() => {
    const handleFilterChange = (value: any) => {
      setFilterInput(value);
      console.log("Filter value changed to:", value);
    };

    const handleRoleFilterChange = (value: any) => {
      setRoleFilter(value);
      console.log("Role filter changed to:", value);
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} admins
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            {/* Status Filter */}
            <Select
              value={filterInput}
              onValueChange={handleFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={handleRoleFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="dispatch">Dispatch</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }, [itemsOnPage, totalItems, filterInput, roleFilter]);

  return (
    <div className="card card-grid min-w-full">
      {Toolbar}
      <div className="card-body">
        <DataGrid
          onFetchData={getAdmins}
          onSearchData={searchAdmin}
          data={data}
          columns={columns}
          rowSelection={true}
          onRowSelectionChange={handleRowSelection}
          searchInput={searchInput}
          pagination={{ size: 10 }}
          sorting={[{ id: "Admin", desc: false }]}
          layout={{ card: true }}
        />
      </div>
    </div>
  );
};

export { Admins };
