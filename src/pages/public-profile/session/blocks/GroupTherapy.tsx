import { useEffect, useMemo, useState } from "react";
import { toAbsoluteUrl } from "@/utils";
import { DataGridLoader } from "@/components/data-grid";
import avatar from "@/media/avatars/blank.png";

import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  DataGridRowSelectAll,
  DataGridRowSelect,
} from "@/components";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/auth/_helpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IGroupTherapyCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profile: string | null;
  isInGroup: boolean;
  avatar: number;
  username: string;
  dob: string;
  isLinked: boolean;
  isOnline: boolean;
  lastSeenAt: string | null;
  emergencyContact: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ITherapist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profile: string | null;
}

interface ISessionForm {
  schedule: string;
  therapist: string;
  groupName: string;
}

const GroupTherapy = ({
  searchInput,
}: {
  searchInput?: string;
}) => {
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    phone: string;
  } | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [therapistSearch, setTherapistSearch] = useState("");
  const [sessionForm, setSessionForm] = useState<ISessionForm>({
    schedule: "",
    therapist: "",
    groupName: "",
  });

  async function getGroupTherapyCandidates({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const url = `/api/v1/answer/user-ans?take=${pageSize}&page=${pageIndex}&filters=isInGroup=0`;
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

  async function searchGroupTherapyCandidates({
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
    const url = `/api/v1/answer/user-ans?filters=isInGroup=0,firstName=${search}&take=${pageSize}&page=${pageIndex}`;
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

  async function revalidateGroupTherapyCandidates() {
    const url = `/api/v1/answer/user-ans?filters=isInGroup=0${searchInput ? `,firstName=${searchInput}` : ""}`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "revalidated group therapy data");
    return data;
  }

  const { isLoading: isGroupTherapyLoading, data: groupTherapyData } = useQuery({
    queryKey: ["GroupTherapyCandidates", searchInput],
    queryFn: revalidateGroupTherapyCandidates,
    //refetchInterval: 5000,
    //refetchIntervalInBackground: true,
  });

  async function getTherapists(search?: string) {
    const url = `/api/v1/therapist${search ? `?filters=firstName=${search}` : ""}`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  async function createGroupSession(sessionData: ISessionForm & { groupClients: string[] }) {
    // Parse the datetime-local input to extract day and time
    const scheduleDate = new Date(sessionData.schedule);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[scheduleDate.getDay()];
    const startTime = scheduleDate.toTimeString().slice(0, 5); // Format: "HH:MM"

    const payload = {
      note: "Group therapy session",
      groupName: sessionData.groupName,
      duration: 60,
      type: "video",
      modal: "d724ce6f-4f28-4406-8e67-d8f52afab561",
      groupClients: sessionData.groupClients,
      therapist: sessionData.therapist,
      date: {
        date: dayName,
        startTime: startTime
      }
    };
    const { data } = await axiosInstance.post('/api/v1/session/group', payload);
    return data;
  }

  const { data: therapistsData, isLoading: isLoadingTherapists } = useQuery({
    queryKey: ["Therapists", therapistSearch],
    queryFn: () => getTherapists(therapistSearch),
    enabled: isSessionModalOpen,
  });

  const queryClient = useQueryClient();
  const { isLoading: isCreatingSession, mutate: createSession } = useMutation({
    mutationFn: createGroupSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["GroupTherapyCandidates"],
      });
      setSelectedClients([]);
      setIsSessionModalOpen(false);
      setSessionForm({
        schedule: "",
        therapist: "",
        groupName: "",
      });
      toast("Group session successfully created!");
    },
    onError: (error: any) => {
      toast(error?.message || "Error creating group session");
    },
  });

  const columns = useMemo<ColumnDef<IGroupTherapyCandidate>[]>(
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
        accessorFn: (row) => row.firstName,
        id: "Client",
        header: ({ column }) => (
          <DataGridColumnHeader title="Client" column={column} className="min-w-[250px]"/>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const img = row.original.profile
            ? `${BASE_URL}/${row.original.profile}`
            : row.original.profile;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            setSelectedImage({
              src: img ? img : avatar,
              name: `${row.original.firstName} ${row.original.lastName}`,
              phone: `+251${row.original.phoneNumber}`,
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
                  alt={`${row.original.firstName} ${row.original.lastName}`}
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <KeenIcon icon="eye" className="text-white text-xs" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.firstName} {row.original.lastName}
                </span>
                <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
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
          return info.row.original.email;
        },
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        id: "gender",
        header: ({ column }) => (
          <DataGridColumnHeader title="Gender" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          return info.row.original.gender;
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const status = info.row.original.status;
          return (
            <div className="flex justify-start relative">
              <span
                className={`badge ${status === "suspended" && "badge-danger"} ${status === "inactive" && "badge-warning"} ${status === "active" && "badge-success"} ${status === "pending" && "badge-primary"} shrink-0 badge-outline rounded-[30px]`}
              >
                <span
                  className={`size-1.5 rounded-full ${status === "suspended" && "bg-danger"} ${status === "inactive" && "bg-warning"} ${status === "active" && "bg-success"} ${status === "pending" && "bg-primary"} me-1.5`}
                ></span>
                {status}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
    ],
    []
  );

  const data: IGroupTherapyCandidate[] = useMemo(() => {
    const rawData = groupTherapyData?.data ?? [];
    // Filter out duplicates based on id
    const uniqueData = rawData.filter((item: IGroupTherapyCandidate, index: number, self: IGroupTherapyCandidate[]) => 
      index === self.findIndex((t: IGroupTherapyCandidate) => t.id === item.id)
    );
    return uniqueData;
  }, [groupTherapyData]);

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);
    const selectedClientIds = selectedRowIds.map(rowId => {
      const rowIndex = parseInt(rowId);
      return data[rowIndex]?.id;
    }).filter(Boolean);
    
    setSelectedClients(selectedClientIds);

    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} clients selected.`, {
        description: `Selected clients: ${selectedClientIds.length}`,
      });
    }
  };

  const handleAddToGroup = () => {
    if (selectedClients.length === 0) {
      toast("Please select at least one client to add to the group session.");
      return;
    }

    setIsSessionModalOpen(true);
  };

  const handleCreateSession = () => {
    if (!sessionForm.therapist || !sessionForm.schedule || !sessionForm.groupName) {
      toast("Please select a therapist, schedule, and provide a group name.");
      return;
    }

    createSession({
      ...sessionForm,
      groupClients: selectedClients,
    });
  };

  const Toolbar = () => {
    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} group therapy candidates
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleAddToGroup}
              disabled={selectedClients.length === 0}
            >
              <KeenIcon icon="users" /> Create Group Session ({selectedClients.length})
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isGroupTherapyLoading) {
    return <DataGridLoader message="Loading group therapy candidates..." />;
  }

  return (
    <>
      {/* Session Creation Modal */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create Group Session
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 px-1 m-4">
            {/* Therapist Selection */}
            <div className="space-y-4">
              <Input
                placeholder="Search therapists by name..."
                value={therapistSearch}
                onChange={(e) => setTherapistSearch(e.target.value)}
                className="h-12 text-base"
              />
              
              {isLoadingTherapists ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
                  <KeenIcon icon="loading" className="animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600">Loading therapists...</span>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-white">
                  {therapistsData?.data?.length > 0 ? (
                    therapistsData.data.map((therapist: ITherapist) => (
                      <div
                        key={therapist.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                          sessionForm.therapist === therapist.id 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : ''
                        }`}
                        onClick={() => setSessionForm(prev => ({ ...prev, therapist: therapist.id }))}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={therapist.profile ? `${BASE_URL}/${therapist.profile}` : avatar}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            alt={`${therapist.firstName} ${therapist.lastName}`}
                          />
                          <div className="flex-1">
                            <p className="text-base font-medium text-gray-900">
                              {therapist.firstName} {therapist.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{therapist.email}</p>
                          </div>
                          {sessionForm.therapist === therapist.id && (
                            <KeenIcon icon="check-circle" className="text-blue-600 text-xl" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No therapists found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Group Name */}
            <div className="space-y-4">
              <label className="text-base font-semibold text-gray-900 block">
                Group Name
              </label>
              <Input
                placeholder="Enter group name (e.g., Anxiety Support Group)"
                value={sessionForm.groupName}
                onChange={(e) => setSessionForm(prev => ({ ...prev, groupName: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <label className="text-base font-semibold text-gray-900 block">
                Schedule Date & Time
              </label>
              <Input
                type="datetime-local"
                value={sessionForm.schedule}
                onChange={(e) => setSessionForm(prev => ({ ...prev, schedule: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsSessionModalOpen(false)}
                className="px-6 py-3 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={isCreatingSession || !sessionForm.therapist || !sessionForm.schedule || !sessionForm.groupName}
                className="px-6 py-3 text-base bg-blue-600 hover:bg-blue-700"
              >
                {isCreatingSession ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin mr-2" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="plus" className="mr-2" />
                    Create Session
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:bg-gray-100 z-10 transition-colors"
            >
              <KeenIcon icon="cross" className="text-gray-600 text-sm" />
            </button>

            {/* Image with responsive fixed height */}
            <img
              src={selectedImage.src}
              alt={selectedImage.name}
              className="rounded-lg shadow-2xl h-80 sm:h-96 md:h-[500px] lg:h-[600px] w-auto object-cover bg-white"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Info card */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-3 rounded-lg shadow-lg min-w-[200px] text-center">
              <p className="font-semibold text-sm">{selectedImage.name}</p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedImage.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      <DataGrid
        onFetchData={getGroupTherapyCandidates}
        onSearchData={searchGroupTherapyCandidates}
        data={data}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        searchInput={searchInput}
        pagination={{ size: 5 }}
        sorting={[]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { GroupTherapy };
