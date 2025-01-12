/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ColumnDef, Column, RowSelectionState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ModalConfigForm } from "@/partials/modals/config";
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  DataGridRowSelectAll,
  DataGridRowSelect,
} from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataGridLoader } from "@/components/data-grid";
import axiosInstance from "@/auth/_helpers";

const BaseURL = `http://195.201.134.129/test/static/vehicle-type/`;

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface ConfigProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleConfigNum: (num: any) => void;
  searchInput?: string;
}

interface IConfigData {
  id: string;
  name: string;
  value: string;
  permissions?: { type: string }[];
}

const Config = ({
  isAddOpen,
  _handleAddOpen,
  handleConfigNum,
  searchInput,
}: ConfigProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentConfigData, setcurrentConfigData] =
    useState<IConfigData | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (isEdit: boolean, rowData: IConfigData | null = null) => {
    setEditMode(isEdit);
    setcurrentConfigData(rowData);
    console.log(rowData, "rowdata");
    setProfileModalOpen(true);
  };

  async function getConfig({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    const url = `/api/v1/params?take=${pageSize}&page=${pageIndex}`;
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
    handleConfigNum(data.data.length);
    return data;
  }

  async function searchConfig({
    pageIndex,
    pageSize,
    search,
  }: {
    pageIndex: number;
    pageSize: number;
    search: any;
  }) {
    const url = `/api/v1/params?filters=name=${search}&take=${pageSize}&page=${pageIndex}`;
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
    handleConfigNum(data.data.length);
    return data;
  }

  async function revalidateConfig() {
    const url = `/api/v1/params`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  async function deleteConfig(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/params/${id}`);
    return data;
  }

  const { isLoading: isConfigLoading, data: configData } = useQuery<
    IConfigData[]
  >({
    queryKey: ["Config", searchInput],
    queryFn: revalidateConfig,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<
    string,
    unknown,
    string
  >({
    mutationFn: (id: string) => deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Config"],
      });
      toast("Config successfully deleted!");
    },
    onError: () => {
      toast("Error Encountered deleting the Config");
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

  const columns = useMemo<ColumnDef<IConfigData>[]>(
    () => [
      {
        accessorKey: "id",
        test: 4,
        header: () => <DataGridRowSelectAll />,
        cell: ({ row }) => <DataGridRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-0",
        },
      },
      {
        // accessorFn: (row) => row.name,
        id: "users",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.name;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        // accessorFn: (row) => row.name,
        id: "value",
        header: ({ column }) => (
          <DataGridColumnHeader title="Value" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.value;
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
      {
        id: "permission",
        header: ({ column }) => (
          <DataGridColumnHeader title="Permission" column={column} />
        ),
        cell: (info) => {
          return (
            <div>
              {info.row.original.permissions?.map((perm, index: number) => (
                <p key={index}>{perm.type}</p>
              ))}
            </div>
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
    []
  );

  const data: IConfigData[] = useMemo(() => configData || [], [configData]);

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
    const [searchInput, setSearchInput] = useState<string>("");

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} configs
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

  // if (isConfigLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      <ModalConfigForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        configData={currentConfigData}
      />
      <DataGrid
        onFetchData={getConfig}
        onSearchData={searchConfig}
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
export { Config };
