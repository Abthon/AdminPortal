import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { ColumnDef, Column } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/auth/_helpers";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface IExpertise {
  id: string;
  expertise: string;
  createdAt: string;
  updatedAt: string;
}

interface IClient {
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
  username: string;
  emergencyContact: string | null;
  isVisible: boolean;
  isInGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ITherapist {
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
  bio: string;
  verified: boolean;
  hoursDedicatedPerWeek: number;
  expertise: IExpertise[];
  createdAt: string;
  updatedAt: string;
}

interface IMatchData {
  id: string;
  expiresAt: string;
  client: IClient;
  accepted: ITherapist | null;
}

const Matches = ({
  handleMatchNum,
  searchInput,
}: {
  handleMatchNum: (num: any) => void;
  searchInput?: string;
}) => {
  const navigate = useNavigate();
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [therapists, setTherapists] = useState<ITherapist[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<IMatchData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  // Fetch therapist candidates for assignment modal based on client preference
  const fetchTherapists = async (clientId: string) => {
    try {
      console.log('Fetching client preference for client:', clientId);
      
      // Step 1: Get client preference
      const { data: clientData } = await axiosInstance.get(
        `/api/v1/client/${clientId}?fields=preference.*`
      );
      console.log('Client data with preference:', clientData);
      
      const preference = clientData?.data?.preference?.[0];
      
      if (!preference || !preference.id) {
        console.warn('No preference found for client');
        toast.error('Client has no preference set');
        setTherapists([]);
        return;
      }
      
      const preferenceId = preference.id;
      console.log('Fetching therapist candidates for preference:', preferenceId);
      
      // Step 2: Get therapist candidates using preference ID
      const { data: therapistData } = await axiosInstance.get(
        `/api/v1/therapist/candidates/${preferenceId}?take=0`
      );
      console.log('Therapist candidates response:', therapistData);
      
      const therapistList = therapistData.data || [];
      console.log('Therapist candidate list:', therapistList);
      setTherapists(therapistList);
      
      if (therapistList.length === 0) {
        toast.info('No matching therapist candidates found');
      }
    } catch (error) {
      console.error('Error fetching therapist candidates:', error);
      toast.error('Failed to load therapist candidates');
      setTherapists([]);
    }
  };

  // Handle therapist assignment
  const handleAssignTherapist = async (therapistId: string) => {
    console.log('Assigning therapist:', therapistId);
    if (!selectedMatch) return;
    
    setIsAssigning(true);
    try {
      await axiosInstance.post(
        `/api/v1/match/accept?mockId=${therapistId}`,
        { matchId: selectedMatch.id }
      );
      
      toast.success('Therapist assigned successfully!');
      setIsModalOpen(false);
      setSelectedMatch(null);
      
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error assigning therapist:', error);
      toast.error('Failed to assign therapist');
    } finally {
      setIsAssigning(false);
    }
  };

  // Open assignment modal
  const openAssignmentModal = (match: IMatchData, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    
    setSelectedMatch(match);
    setIsModalOpen(true);
    
    // Fetch therapist candidates based on client preference
    if (match.client?.id) {
      fetchTherapists(match.client.id);
    } else {
      toast.error('Client ID not found');
    }
  };

  async function getMatches({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    // Filter for non-accepted matches (accepted=null) as requested by user
    const filters = "accepted:=null";
    const url = `/api/v1/match?take=${pageSize}&page=${pageIndex}&sort=expiresAt=${sort[0].desc ? "DESC" : "ASC"}&fields=client.*,expiresAt&filters=${filters}`;
    console.log(url, "url");
    const { data } = await axiosInstance.get(url);

    console.log(data, "The match data");
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
    handleMatchNum(data.data.length);
    return data;
  }

  async function searchMatch({
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
    const filters = `client.firstName=${search},accepted:=null`;
    const url = `/api/v1/match?filters=${filters}&take=${pageSize}&page=${pageIndex}&sort=expiresAt=${sort[0].desc ? "DESC" : "ASC"}&fields=client.*,expiresAt`;
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
    handleMatchNum(data.data.length);
    return data;
  }

  async function revalidateMatch() {
    const filters = searchInput ? `client.firstName=${searchInput},accepted:=null` : "accepted:=null";
    const url = `/api/v1/match?filters=${filters}&fields=client.*,expiresAt&sort=expiresAt=DESC`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the match data");
    handleMatchNum(data.data.length);
    console.log(data.data, "match data");
    return data;
  }

  const data = useMemo(() => [], []);

  // Helper function to check if match is still active
  const isMatchActive = (expiresAt: string) => {
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    return expiryDate > now;
  };

  const columns = useMemo<ColumnDef<IMatchData>[]>(
    () => [
      {
        accessorFn: (row) => row.client,
        id: "client",
        header: ({ column }: { column: Column<IMatchData, unknown> }) => (
          <DataGridColumnHeader title="Client" column={column} />
        ),
        cell: ({ row }) => {
          const client = row.original.client;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 border border-gray-200 size-9">
                {client.profile ? (
                  <img
                    className="rounded-full size-7"
                    src={`${BASE_URL}/${client.profile}`}
                    alt={`${client.firstName} ${client.lastName}`}
                  />
                ) : (
                  <img
                    className="rounded-full size-7"
                    src={avatar}
                    alt={`${client.firstName} ${client.lastName}`}
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <Link
                  className="text-sm font-medium text-gray-900 hover:text-primary-active"
                  to={`/public-profile/client-detail/${client.id}`}
                >
                  {client.firstName} {client.lastName}
                </Link>
                <span className="text-xs text-gray-600">{client.email}</span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        meta: {
          headerClassName: "min-w-[250px]",
        },
      },
      {
        accessorFn: (row) => row.accepted,
        id: "therapist",
        header: ({ column }: { column: Column<IMatchData, unknown> }) => (
          <DataGridColumnHeader title="Therapist" column={column} />
        ),
        cell: ({ row }) => {
          const therapist = row.original.accepted;
          if (!therapist) {
            return (
              <div className="flex items-center gap-2">
                {/*<span className="text-gray-400 text-sm">Not Assigned</span>*/}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.nativeEvent.stopImmediatePropagation();
                    openAssignmentModal(row.original, event);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <KeenIcon icon="user-plus" className="mr-1" />
                  Assign
                </Button>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 border border-gray-200 size-9">
                {therapist.profile ? (
                  <img
                    className="rounded-full size-7"
                    src={`${BASE_URL}/${therapist.profile}`}
                    alt={`${therapist.firstName} ${therapist.lastName}`}
                  />
                ) : (
                  <img
                    className="rounded-full size-7"
                    src={avatar}
                    alt={`${therapist.firstName} ${therapist.lastName}`}
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <Link
                  className="text-sm font-medium text-gray-900 hover:text-primary-active"
                  to={`/public-profile/therapist-detail/${therapist.id}`}
                >
                  {therapist.firstName} {therapist.lastName}
                </Link>
                <span className="text-xs text-gray-600">{therapist.email}</span>
              </div>
            </div>
          );
        },
        enableSorting: false,
        meta: {
          headerClassName: "min-w-[250px]",
        },
      },
      {
        accessorKey: "isMatched",
        header: ({ column }: { column: Column<IMatchData, unknown> }) => (
          <DataGridColumnHeader title="Match Status" column={column} />
        ),
        cell: ({ row }) => {
          const isActive = isMatchActive(row.original.expiresAt);
          return (
            <div className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full ${
                  isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className={`text-sm ${
                isActive ? "text-green-600" : "text-red-600"
              }`}>
                {isActive ? "Active" : "Expired"}
              </span>
            </div>
          );
        },
        enableSorting: false,
        meta: {
          headerClassName: "w-[150px]",
        },
      },
      {
        accessorKey: "expiresAt",
        header: ({ column }: { column: Column<IMatchData, unknown> }) => (
          <DataGridColumnHeader title="Expires At" column={column} />
        ),
        cell: ({ row }) => {
          const expiresAt = new Date(row.original.expiresAt);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-900">
                {expiresAt.toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-600">
                {expiresAt.toLocaleTimeString()}
              </span>
            </div>
          );
        },
        enableSorting: true,
        meta: {
          headerClassName: "w-[150px]",
        },
      },
    ],
    []
  );

  const handleRowSelection = (updaterOrValue: any) => {
    // Handle row selection
  };

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header py-5 flex-wrap">
        <h3 className="card-title">Matches</h3>
        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search matches"
                className="placeholder:text-gray-500"
                value={searchInput || ""}
                readOnly
              />
            </label>
          </div>
        </div>
      </div>
      <div className="card-body">
        <DataGrid
          onFetchData={getMatches}
          onSearchData={searchMatch}
          data={data}
          link={"matches"}
          columns={columns}
          rowSelection={true}
          onRowSelectionChange={handleRowSelection}
          searchInput={searchInput}
          pagination={{ size: 10 }}
          sorting={[{ id: "expiresAt", desc: true }]}
          layout={{ card: true }}
        />
      </div>
      
      {/* Therapist Assignment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Therapist to Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <h4 className="font-medium">Select a Therapist</h4>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {therapists.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-gray-500">No verified therapists available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => selectedMatch?.client?.id && fetchTherapists(selectedMatch.client.id)}
                    className="mx-auto"
                  >
                    <KeenIcon icon="refresh" className="mr-2" />
                    Refresh List
                  </Button>
                </div>
              ) : (
                therapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 border border-gray-200 size-10">
                        {therapist.profile ? (
                          <img
                            className="rounded-full size-8"
                            src={`${BASE_URL}/${therapist.profile}`}
                            alt={`${therapist.firstName} ${therapist.lastName}`}
                          />
                        ) : (
                          <img
                            className="rounded-full size-8"
                            src={avatar}
                            alt={`${therapist.firstName} ${therapist.lastName}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{therapist.firstName} {therapist.lastName}</p>
                        <p className="text-sm text-gray-600">{therapist.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="size-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">{therapist.status}</span>
                        </div>
                        </div>
                    </div>
                    <Button
                      onClick={() => handleAssignTherapist(therapist.id)}
                      disabled={isAssigning}
                      size="sm"
                      className="min-w-20"
                    >
                      {isAssigning ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Assigning...
                        </div>
                      ) : (
                        'Assign'
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { Matches };
