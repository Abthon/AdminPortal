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
} from "@/components";
import axiosInstance from "@/auth/_helpers";

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
}: ConfigProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentConfigData, setcurrentConfigData] = useState<IConfigData | null>(null);
  const [del, setDel] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [searchInput, setSearchInput] = useState<string>("");

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: IConfigData | null = null,
    isDelete?: boolean
  ) => {
    setEditMode(isEdit);
    setcurrentConfigData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  async function getConfig({ pageIndex, pageSize, sort }: { pageIndex: number; pageSize: number; sort: any; }) {
    const url = `/api/v1/params?take=${pageSize}&page=${pageIndex}&sort=name=${sort[0].desc ? "DESC" : "ASC"}`;
    const { data } = await axiosInstance.get(url);
    const startIndex = (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
    const endIndex = Math.min(data.pagination.currentPage * data.pagination.pageSize, data.pagination.totalItems);
    const itemsOnPage = endIndex - startIndex + 1;
    setItemsOnPage(itemsOnPage);
    setTotalItems(data.pagination.totalItems);
    handleConfigNum(data.data.length);
    return data;
  }

  async function searchConfig({ pageIndex, pageSize, search, sort }: { pageIndex: number; pageSize: number; search: any; sort: any; }) {
    const url = `/api/v1/params?filters=name=${search}&take=${pageSize}&page=${pageIndex}&sort=name=${sort[0].desc ? "DESC" : "ASC"}`;
    const { data } = await axiosInstance.get(url);
    const startIndex = (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
    const endIndex = Math.min(data.pagination.currentPage * data.pagination.pageSize, data.pagination.totalItems);
    const itemsOnPage = endIndex - startIndex + 1;
    setItemsOnPage(itemsOnPage);
    setTotalItems(data.pagination.totalItems);
    handleConfigNum(data.data.length);
    return data;
  }

  async function revalidateConfig() {
    const { data } = await axiosInstance.get(`/api/v1/params`);
    return data;
  }

  async function deleteConfig(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/params/${id}`);
    return data;
  }

  const { isLoading: isConfigLoading, data: configData } = useQuery<IConfigData[]>({
    queryKey: ["Config", searchInput],
    queryFn: revalidateConfig,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<string, unknown, string>({
    mutationFn: (id: string) => deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Config"] });
      toast("Config successfully deleted!");
    },
    onError: () => {
      toast("Error Encountered deleting the Config");
    },
  });


  useEffect(() => {
    if (isAddOpen) handleOpen(false);
  }, [isAddOpen]);

  const columns = useMemo<ColumnDef<IConfigData>[]>(() => [
    //{
    //  accessorKey: "id",
    //  header: () => <DataGridRowSelectAll />,
    //  cell: ({ row }) => <DataGridRowSelect row={row} />,
    //  enableSorting: false,
    //  enableHiding: false,
    //  meta: { headerClassName: "w-0" },
    //},
    {
      accessorFn: (row) => row.name,
      id: "name",
      header: ({ column }) => <DataGridColumnHeader title="Name" column={column} />,
      enableSorting: true,
      cell: (info) => info.row.original.name,
      meta: { headerClassName: "min-w-[180px]" },
    },
    {
      id: "value",
      header: ({ column }) => <DataGridColumnHeader title="Value" column={column} />,
      enableSorting: true,
      cell: (info) => info.row.original.value,
      meta: { headerClassName: "min-w-[180px]" },
    },
    {
      id: "Edit",
      header: ({ column }) => <DataGridColumnHeader title="Edit" column={column} />,
      enableSorting: false,
      cell: (info) => (
        <button onClick={() => handleOpen(true, info.row.original)} className="btn btn-sm btn-icon btn-clear btn-primary">
          <KeenIcon icon="notepad-edit" />
        </button>
      ),
      meta: { headerClassName: "min-w-[80px]" },
    },
    //{
    //  id: "Delete",
    //  header: ({ column }) => <DataGridColumnHeader title="Delete" column={column} />,
    //  enableSorting: false,
    //  cell: (info) => (
    //    <button onClick={() => handleOpen(true, info.row.original, true)} className="btn btn-sm btn-icon btn-clear text-red-600 hover:bg-red-500 hover:text-white">
    //      <KeenIcon icon="trash" />
    //    </button>
    //  ),
    //  meta: { headerClassName: "w-[80px]" },
    //},
  ], []);

  const data: IConfigData[] = useMemo(() => configData || [], [configData]);

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: { label: "Undo", onClick: () => console.log("Undo") },
      });
    }
  };

  return (
    <div className="mb-4">
      <ModalConfigForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        configData={currentConfigData}
        isDelete={del}
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
        sorting={[{ id: "name", desc: false }]}
        toolbar={
          <div className="card-header flex-wrap gap-2 border-b-0 px-5 flex justify-between items-center">
            <h3 className="card-title font-medium text-sm">Showing {itemsOnPage} of {totalItems} configs</h3>
            <div className="">
              <label className="input input-sm">
                <KeenIcon icon="magnifier" />
                <input type="text" placeholder="Search Config By Name" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              </label>
            </div>
          </div>
        }
        layout={{ card: true }}
      />
    </div>
  );
};

export { Config };
