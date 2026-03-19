import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [assigningTherapistId, setAssigningTherapistId] = useState<string | null>(null);

  // Session scheduling states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [modalData, setModalData] = useState<any[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string[] }>({});
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
  const [isCreatingSessions, setIsCreatingSessions] = useState(false);

  // Track if time selection is complete
  const [hasSelectedTimes, setHasSelectedTimes] = useState(false);

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  // Fetch therapist candidates for assignment modal based on client preference
  const fetchTherapists = async (clientId: string) => {
    try {
      console.log('Fetching client data for:', clientId);

      // Step 1: Get client data to extract the active subscription modal
      const { data: clientData } = await axiosInstance.get(
        `/api/v1/client/${clientId}`
      );

      console.log('Client data:', clientData);
      const modalId = clientData?.data?.activeSubscription?.subscription?.modal?.id;
      if (!modalId) {
        console.warn('No active subscription modal found for client');
        toast.error('Client has no active subscription with a therapy type');
        setTherapists([]);
        return;
      }

      // Step 2: Fetch the preference that matches the active subscription modal
      const filters = `modal.id=${modalId},client.id=${clientId}`;
      const { data: preferenceData } = await axiosInstance.get(
        `/api/v1/preference?filters=${encodeURIComponent(filters)}`
      );

      console.log('Preference data:', preferenceData);
      const preference = preferenceData?.data?.[0];
      if (!preference || !preference.id) {
        console.warn('No preference found for client modal');
        toast.error('Client has no preference set for the current therapy type');
        setTherapists([]);
        return;
      }

      const preferenceId = preference.id;
      console.log('Fetching therapist candidates for preference:', preferenceId);

      // Step 3: Get therapist candidates using preference ID
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

  // Handle therapist assignment - only called after time selection
  const handleAssignTherapist = async (therapistId: string) => {
    console.log('Assigning therapist:', therapistId);
    if (!selectedMatch) return;

    setAssigningTherapistId(therapistId);
    try {
      // Step 1: Get client data to extract the active subscription modal
      const { data: clientData } = await axiosInstance.get(
        `/api/v1/client/${selectedMatch.client.id}`
      );
      const modalId = clientData?.data?.activeSubscription?.subscription?.modal?.id;
      if (!modalId) {
        toast.error('Client has no active subscription with a therapy type');
        return;
      }

      // Step 2: Fetch the preference matching the active subscription modal
      const filters = `modal.id=${modalId},client.id=${selectedMatch.client.id}`;
      const { data: preferenceData } = await axiosInstance.get(
        `/api/v1/preference?filters=${encodeURIComponent(filters)}`
      );
      const preferenceId = preferenceData?.data?.[0]?.id;

      if (!preferenceId) {
        toast.error('Client has no preference set for the current therapy type');
        return;
      }

      // Step 2: Patch the existing match with the therapist
      await axiosInstance.patch(`/api/v1/match/${selectedMatch.id}`, {
        preferenceId: preferenceId,
        accepted: therapistId,
      });

      toast.success('Therapist assigned successfully!');

      // Store therapist ID for session creation
      setSelectedTherapistId(therapistId);

      // Close therapist modal and proceed to create sessions
      setIsModalOpen(false);

      // Create sessions with the selected times
      await createSessionsWithTherapist(therapistId);

    } catch (error) {
      console.error('Error assigning therapist:', error);
      toast.error('Failed to assign therapist');
    } finally {
      setAssigningTherapistId(null);
    }
  };

  // Helper function to generate time slots based on day period
  const generateTimeSlots = (dayPeriod: string): string[] => {
    const timeSlots: string[] = [];

    switch (dayPeriod.toLowerCase()) {
      case 'morning':
        for (let hour = 8; hour <= 11; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        break;
      case 'afternoon':
        for (let hour = 12; hour <= 17; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        break;
      case 'evening':
        for (let hour = 18; hour <= 21; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        break;
      default:
        // Full day
        for (let hour = 8; hour <= 21; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    return timeSlots;
  };

  // Fetch client availability data
  const fetchClientAvailability = async (clientId: string) => {
    try {
      // Step 1: Get client data to extract the active subscription modal
      const { data: clientResponse } = await axiosInstance.get(
        `/api/v1/client/${clientId}`
      );

      const modalId = clientResponse?.data?.activeSubscription?.subscription?.modal?.id;
      if (!modalId) {
        toast.error("Client has no active subscription with a therapy type");
        return;
      }

      // Step 2: Fetch the preference matching the active subscription modal
      const filters = `modal.id=${modalId},client.id=${clientId}`;
      const { data: preferenceListData } = await axiosInstance.get(
        `/api/v1/preference?filters=${encodeURIComponent(filters)}`
      );

      const matchedPreference = preferenceListData?.data?.[0];
      if (!matchedPreference?.id) {
        toast.error("Client has no preference set for the current therapy type");
        return;
      }

      const preferenceId = matchedPreference.id;

      // Step 3: Get availability from the matched preference
      const { data: preferenceResponse } = await axiosInstance.get(
        `/api/v1/preference/${preferenceId}?fields=availability.*,modal.*`
      );

      if (!preferenceResponse.data.availability || preferenceResponse.data.availability.length === 0) {
        toast.error("Client has no availability set");
        return;
      }

      setAvailabilityData(preferenceResponse.data.availability);
      setModalData(preferenceResponse.data.modal.id);
      console.log("the modal yene qonjo", preferenceResponse.data.modal.id)
      setIsScheduleModalOpen(true);

    } catch (error) {
      console.error('Error fetching client availability:', error);
      toast.error('Failed to fetch client availability');
    }
  };

  async function createChat(therapistId: string) {
    const payload = {
      client: selectedMatch?.client?.id,
      therapist: therapistId,
    };

    console.log(payload, "My payload baby");
    console.log(payload, "created group chat payload");
    const { data } = await axiosInstance.post(`/api/v1/chat?mockId=${therapistId}`, payload);
    console.log(data, "the chat data baby");
    return data;
  }

  // Handle session creation with assigned therapist
  const createSessionsWithTherapist = async (therapistId: string) => {
    console.log(selectedMatch, "The selected match for session");
    if (!selectedMatch || !therapistId) return;

    setIsCreatingSessions(true);
    try {
      // Format selected times for API
      const dates = Object.entries(selectedTimes)
        .filter(([_, times]) => times.length > 0)
        .map(([date, startTimes]) => ({
          date,
          startTimes
        }));

      if (dates.length === 0) {
        toast.error("Please select at least one time slot");
        return;
      }

      const sessionData = {
        duration: 60,
        type: "video",
        modal: modalData,
        client: selectedMatch.client.id,
        dates
      };

      await axiosInstance.post(
        `/api/v1/session?mockId=${therapistId}`,
        sessionData
      );

      toast.success('Sessions created successfully!');
      // Creating chat for them
      await createChat(therapistId);
      toast.message("Created chat between them successfully");

      // Reset all states
      setIsScheduleModalOpen(false);
      setSelectedTimes({});
      setSelectedTherapistId("");
      setSelectedMatch(null);
      setHasSelectedTimes(false);

      // Refresh the data
      window.location.reload();

    } catch (error) {
      console.error('Error creating sessions:', error);
      toast.error('Failed to create sessions');
    } finally {
      setIsCreatingSessions(false);
    }
  };

  // Handle proceeding to therapist selection after time selection
  const proceedToTherapistSelection = () => {
    // Validate that at least one time slot is selected
    const dates = Object.entries(selectedTimes)
      .filter(([_, times]) => times.length > 0);

    if (dates.length === 0) {
      toast.error("Please select at least one time slot");
      return;
    }

    // Mark that times have been selected
    setHasSelectedTimes(true);

    // Close schedule modal and open therapist modal
    setIsScheduleModalOpen(false);
    setIsModalOpen(true);

    // Fetch therapist candidates if not already loaded
    if (selectedMatch?.client?.id && therapists.length === 0) {
      fetchTherapists(selectedMatch.client.id);
    }
  };

  // Start the assignment flow - opens time selection modal first
  const startMatchAssignment = async (match: IMatchData, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    setSelectedMatch(match);

    // If times are already selected, go directly to therapist selection
    if (hasSelectedTimes && Object.values(selectedTimes).some(times => times.length > 0)) {
      setIsModalOpen(true);
      if (therapists.length === 0) {
        fetchTherapists(match.client.id);
      }
    } else {
      // Otherwise, start with time selection
      await fetchClientAvailability(match.client.id);
    }
  };


  // Handle going back to time selection from therapist modal
  const goBackToTimeSelection = () => {
    setIsModalOpen(false);
    setIsScheduleModalOpen(true);
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
    const filters = "accepted:=null,client.preference.modal.id!=aa4c9839-e031-417a-b319-2da4bf1092c3";
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
                  to={`/clients/${client.id}`}
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
                  onClick={(event) => startMatchAssignment(row.original, event)}
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
                  to={`/therapists/${therapist.id}`}
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
                className={`size-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"
                  }`}
              />
              <span className={`text-sm ${isActive ? "text-green-600" : "text-red-600"
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
          //link={"matches"}
          columns={columns}
          rowSelection={true}
          onRowSelectionChange={handleRowSelection}
          searchInput={searchInput}
          pagination={{ size: 10 }}
          sorting={[{ id: "expiresAt", desc: true }]}
          layout={{ card: true }}
        />
      </div>

      {/* Session Scheduling Modal - Step 1 */}
      <Dialog open={isScheduleModalOpen} onOpenChange={(open) => {
        setIsScheduleModalOpen(open);
        // Preserve selected times when modal is closed
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto px-4">
          <DialogHeader>
            <DialogTitle>Schedule Sessions</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Available Time Slots</h3>
              {availabilityData.map((availability, index) => {
                const timeSlots = generateTimeSlots(availability.day_period);
                const dayKey = availability.day;

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">
                      {availability.day} - {availability.day_period}
                    </h4>

                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => {
                        const isSelected = selectedTimes[dayKey]?.includes(time) || false;

                        return (
                          <Button
                            key={time}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedTimes(prev => {
                                const dayTimes = prev[dayKey] || [];
                                const newDayTimes = isSelected
                                  ? dayTimes.filter(t => t !== time)
                                  : [...dayTimes, time];

                                return {
                                  ...prev,
                                  [dayKey]: newDayTimes
                                };
                              });
                            }}
                            className="text-xs"
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>

                    {selectedTimes[dayKey] && selectedTimes[dayKey].length > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        Selected: {selectedTimes[dayKey].join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  // Don't clear selected times - preserve them
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={proceedToTherapistSelection}
                disabled={Object.values(selectedTimes).every(times => times.length === 0)}
              >
                Next: Select Therapist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Therapist Assignment Modal - Step 2 */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        // Don't reset anything when closing - preserve state
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="mt-10">
            <DialogTitle>Assign Therapist to Match</DialogTitle>
            <p className="text-sm text-gray-600">
              {hasSelectedTimes && Object.values(selectedTimes).some(times => times.length > 0)
                ? `✓ Time slots selected (${Object.values(selectedTimes).flat().length} slots)`
                : 'Select time slots first'}
            </p>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select a Therapist</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={goBackToTimeSelection}
                className="text-xs"
              >
                <KeenIcon icon="arrow-left" className="mr-1" />
                Back to Time Selection
              </Button>
            </div>
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
                        <Link
                          to={`/therapists/${therapist.id}`}
                          className="font-medium text-gray-900 hover:text-primary-active transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {therapist.firstName} {therapist.lastName}
                        </Link>
                        <p className="text-sm text-gray-600">{therapist.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="size-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">{therapist.status}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAssignTherapist(therapist.id)}
                      disabled={assigningTherapistId !== null}
                      size="sm"
                      className="min-w-20"
                    >
                      {assigningTherapistId === therapist.id ? (
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
