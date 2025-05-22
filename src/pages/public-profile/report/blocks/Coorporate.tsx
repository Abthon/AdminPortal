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
import { ModalCoorporateForm } from "@/partials/modals/coorporate/ModalCoorporate";
import axiosInstance from "@/auth/_helpers";

interface ICoorporateData {
  id: string;
  name: string;
  email: string;
  address: string;
  status: string;
  booking: string;
  creditLimit: string;
  paymentPlan: string;
  license: string;
  tinNo: string;
  contactPhoneNumber: string;
  backupContactPhoneNumber: string;
  nationalId: string;
  currentCredit: string;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface CoorporateProps {
  // searchInput?: string;
}

const Coorporate = ({}: CoorporateProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [currentCoorporateData, setCurrentCoorporateData] =
    useState<ICoorporateData | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");

  // const handleClose = () => {
  //   setApprovalMode(false);
  //   setProfileModalOpen(false);
  //   _handleAddOpen(false);
  // };

  const handleOpen = (
    isEdit: boolean,
    rowData: ICoorporateData | null = null
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentCoorporateData(rowData);
    setProfileModalOpen(true);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: ICoorporateData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentCoorporateData(rowData);
    setProfileModalOpen(true);
  };

  async function getCoorporates({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/coorporate?take=${pageSize}&page=${pageIndex}&sort=name=${sort[0].desc ? "DESC" : "ASC"}${filterInput && filterInput !== "all" ? `&filters=status=${filterInput}` : ""}`;
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

    return data;
  }

  async function searchCoorporate({
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
    const url = `/api/v1/coorporate?filters=name=${search}${filterInput && filterInput !== "all" ? `,status=${filterInput}` : ""}&take=${pageSize}&page=${pageIndex}&sort=name=${sort[0].desc ? "DESC" : "ASC"}`;
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
    return data;
  }

  async function revalidateCoorporate() {
    const url = `/api/v1/coorporate?`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  async function deleteCoorporates(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/coorporate/${id}`);
    console.log(data, "delete");
    return data;
  }

  const queryClient = useQueryClient();

  const { isLoading: isCoorporateLoading, data: CoorporateData } = useQuery({
    queryKey: ["Coorporate", filterInput],
    queryFn: revalidateCoorporate,
  });

  const { isLoading: isDeleting, mutate } = useMutation<string, Error, string>({
    mutationFn: deleteCoorporates,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Coorporate"],
      });
      toast("Coorporate successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the Coorporate");
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

  // useEffect(
  //   function () {
  //     isAddOpen && handleOpen(false);
  //   },
  //   [isAddOpen]
  // );

  const columns = useMemo<ColumnDef<ICoorporateData>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.name;
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "creditLimit",
        header: ({ column }) => (
          <DataGridColumnHeader title="Credit Limit" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.creditLimit;
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "currentCredit",
        header: ({ column }) => (
          <DataGridColumnHeader title="Current Credit" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.currentCredit;
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const status = info.row.original.status;
          const getStatusColor = (status: string) => {
            switch (status) {
              case "active":
                return "badge-success";
              case "inactive":
                return "badge-warning";
              case "pending":
                return "badge-primary";
              case "suspended":
                return "badge-danger";
              default:
                return "badge-secondary";
            }
          };

          const getDotColor = (status: string) => {
            switch (status) {
              case "active":
                return "bg-success";
              case "inactive":
                return "bg-warning";
              case "pending":
                return "bg-primary";
              case "suspended":
                return "bg-danger";
              default:
                return "bg-secondary";
            }
          };

          return (
            <span
              className={`badge ${getStatusColor(status)} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full ${getDotColor(status)} me-1.5`}
              ></span>
              {status}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
    ],
    [mutate]
  );

  const data: ICoorporateData[] = useMemo(
    () => CoorporateData ?? [],
    [CoorporateData]
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
    const handleFilterChange = (value: string) => {
      setFilterInput(value);
      queryClient.invalidateQueries({ queryKey: ["Coorporate"] });
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} coorporates
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
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
            </Select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <DataGrid
        onFetchData={getCoorporates}
        onSearchData={searchCoorporate}
        columns={columns}
        data={data}
        link="coorporates"
        filterInput={filterInput}
        rowSelection={false}
        pagination={{ size: 5 }}
        sorting={[{ id: "name", desc: true }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};
export { Coorporate };
