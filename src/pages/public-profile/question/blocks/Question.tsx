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
import { ModalQuestion } from "@/partials/modals/question/ModalQuestion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IQuestionData {
  id: string;
  createdAt: string;
  updatedAt: string;
  text: string;
  type: "single" | "multiple" | "open";
  order: number;
  modalId?: string;
  modal?: {
    id: string;
    name: string;
    description: string;
    order: number;
    updatedAt: string;
    createdAt: string;
  };
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface QuestionProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleQuestionNum: (num: any) => void;
  searchInput?: string;
}

const Question = ({
  isAddOpen,
  _handleAddOpen,
  handleQuestionNum,
  searchInput,
}: QuestionProps) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState<IQuestionData | null>(
    null
  );
  const [therapyTypeFilter, setTherapyTypeFilter] = useState("all");
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [del, setDel] = useState(false);

  const handleClose = () => {
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: IQuestionData | null = null,
    isDelete?: boolean
  ) => {
    setEditMode(isEdit);
    setCurrentQuestionData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  async function getQuestions({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/question?take=${pageSize}&page=${pageIndex}&sort=order=${sort[0].desc ? "DESC" : "ASC"}${therapyTypeFilter && therapyTypeFilter !== "all" ? `&filters=modalId=${therapyTypeFilter}` : ""}${searchInput ? `${therapyTypeFilter && therapyTypeFilter !== "all" ? "," : "&filters="}text=${searchInput}` : ""}&fields=modal.*,id,text,type,order,modalId,createdAt,updatedAt`;
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
    handleQuestionNum(data.data.length);
    return data;
  }

  async function revalidateQuestion() {
    const url = `/api/v1/question?${therapyTypeFilter && therapyTypeFilter !== "all" ? `filters=modalId=${therapyTypeFilter}` : ""}${searchInput ? `${therapyTypeFilter && therapyTypeFilter !== "all" ? "," : "filters="}text=${searchInput}` : ""}&fields=modal.*,id,text,type,order,modalId,createdAt,updatedAt`;
    const { data } = await axiosInstance.get(url);
    handleQuestionNum(data.data.length);
    console.log(data.data, "question data");
    return data;
  }

  async function deleteQuestion(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/question/${id}`);
    console.log(data, "delete");
    return data;
  }

  const { isLoading: isQuestionLoading, data: QuestionData } = useQuery({
    queryKey: ["Question", searchInput, therapyTypeFilter],
    queryFn: revalidateQuestion,
  });

  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate } = useMutation<string, Error, string>({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Question"],
      });
      toast("Question successfully deleted!");
    },
    onError: (error) => {
      toast("Error Encountered deleting the question");
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

  const columns = useMemo<ColumnDef<IQuestionData>[]>(
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
        accessorFn: (row) => row.order,
        id: "order",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span className="badge badge-primary badge-outline">
              #{info.row.original.order}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[80px]",
        },
      },
      {
        accessorFn: (row) => row.text,
        id: "text",
        header: ({ column }) => (
          <DataGridColumnHeader title="Question Text" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <div className="max-w-md">
              <p className="text-sm text-gray-900 truncate" title={info.row.original.text}>
                {info.row.original.text}
              </p>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[300px]",
        },
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Question Type" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const type = info.row.original.type;
          const badgeClass = 
            type === "single" ? "badge-primary" :
            type === "multiple" ? "badge-warning" :
            "badge-success";
          
          return (
            <span className={`badge ${badgeClass} badge-outline`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.modal?.name,
        id: "therapyType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapy Type" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const modalName = info.row.original.modal?.name;
          return (
            <span className="text-sm text-gray-700">
              {modalName || "N/A"}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span className="text-sm text-gray-600">
              {timeAgo(info.row.original.createdAt)}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
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
              onClick={() => handleOpen(true, info.row.original, true)}
              //  onClick={() => mutate(info.row.original.id)}
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

  const data: IQuestionData[] = useMemo(() => QuestionData ?? [], [QuestionData]);

  // Fetch therapy types for filter
  const { data: therapyTypes } = useQuery(
    "therapy-types",
    async () => {
      const response = await axiosInstance.get("/api/v1/modal");
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
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
    const handleTherapyTypeChange = (value: string) => {
      setTherapyTypeFilter(value);
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} Questions
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
              value={therapyTypeFilter}
              onValueChange={handleTherapyTypeChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-40" size="sm">
                <SelectValue placeholder="Therapy Type" />
              </SelectTrigger>
              <SelectContent className="w-40">
                <SelectItem value="all">All Types</SelectItem>
                {therapyTypes?.map((type: any) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
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
      <ModalQuestion
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        questionData={currentQuestionData}
        isDelete={del}
      />
      <DataGrid
        onFetchData={getQuestions}
        columns={columns}
        data={data}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        searchInput={searchInput}
        pagination={{ size: 5 }}
        sorting={[{ id: "order", desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};
export { Question };
