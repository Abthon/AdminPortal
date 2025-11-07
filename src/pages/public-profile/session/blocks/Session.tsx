import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ModalClientTypeForm } from "@/partials/modals/client";
import axiosInstance from "@/auth/_helpers";
import ClassNameGenerator from "@mui/utils/ClassNameGenerator";
import { GroupTherapy } from "./GroupTherapy";
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

// Component to handle async level fetching for session client
const SessionLevelCell = ({ client }: { client: any }) => {
  const [levelData, setLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLevelData = async () => {
      if (!client?.id) {
        setLevelData(null);
        return;
      }

      setLoading(true);
      try {
        // Step 1: Get client with preference data
        const { data: clientData } = await axiosInstance.get(
          `/api/v1/client/${client.id}?fields=preference.*`
        );
        
        const preferences = clientData?.data?.preference;
        if (!preferences || preferences.length === 0) {
          setLevelData(null);
          return;
        }

        const preferenceId = preferences[0].id;
        if (!preferenceId) {
          setLevelData(null);
          return;
        }

        // Step 2: Get preference with level data
        const { data: preferenceData } = await axiosInstance.get(
          `/api/v1/preference/${preferenceId}?fields=level.*`
        );
        
        setLevelData(preferenceData?.data?.level || null);
      } catch (error) {
        console.error("Error fetching client level:", error);
        setLevelData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLevelData();

  }, [client?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-xs">
      {levelData ? (
        <>
          <span className="font-medium capitalize">{levelData.type}</span>
          <span className="text-gray-500">
            XP: {levelData.minXP}-{levelData.maxXP || "∞"}
          </span>
        </>
      ) : (
        <span className="text-gray-400 text-sm">Not Assigned</span>
      )}
    </div>
  );
};

interface ISessionsData {
  id: string;
  hasclientAttended: boolean;
  hasTherapistAttended: boolean;
  schedule: string;
  groupName: string;
  duration: number;
  therapist: any;
  client: any;
  group?: any[];
  createdAt: string;
  modal?: {
    id: string;
    name: string;
    description: string;
    order: number;
    updatedAt: string;
    createdAt: string;
  };
  subscription?: {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
    old_price: number | null;
    price: number | null;
  };
}

const Sessions = ({
  isAddOpen,
  _handleAddOpen,
  handleSessionNum,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleSessionNum: (num: any) => void;
  searchInput?: string;
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sessions" | "group-therapy">(
    "sessions"
  );
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [del, setDel] = useState(false);
  const [currentSessionData, setCurrentSessionData] =
    useState<ISessionsData | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [pageIndex, setPageIndex] = useState({ index: 0 });
  // const [sort, setSort] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [filterInput, setFilterInput] = useState("all");
  const [modalFilter, setModalFilter] = useState("all");
  const [searchType, setSearchType] = useState<"therapist" | "client">("therapist");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    startDateText: "",
    endDateText: "",
    startDateObj: undefined as Date | undefined,
    endDateObj: undefined as Date | undefined,
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startDateMonth, setStartDateMonth] = useState<Date | undefined>(
    new Date()
  );
  const [endDateMonth, setEndDateMonth] = useState<Date | undefined>(
    new Date()
  );
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    scheduleText: "",
    scheduleDate: undefined as Date | undefined,
    time: "",
    modalId: "",
    therapistId: "",
    clientId: "",
  });
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleMonth, setScheduleMonth] = useState<Date | undefined>(
    new Date()
  );
  const [therapistSearch, setTherapistSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  // In your parent component, add this state
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    phone: string;
  } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    url: string;
    filename: string;
    clientName: string;
  } | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [sessionDetailModalOpen, setSessionDetailModalOpen] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] =
    useState<ISessionsData | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [isAddToSessionModalOpen, setIsAddToSessionModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignSessionData, setReassignSessionData] = useState<ISessionsData | null>(null);
  const [subscriptionSessions, setSubscriptionSessions] = useState<any[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [newTherapistId, setNewTherapistId] = useState<string>("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isRemoveFromSessionModalOpen, setIsRemoveFromSessionModalOpen] = useState(false);
  const [removeSessionData, setRemoveSessionData] = useState<ISessionsData | null>(null);
  const [selectedUsersToRemove, setSelectedUsersToRemove] = useState<string[]>([]);

  useEffect(() => {
    console.log(pageIndex, "current page Index is: ");
  }, [pageIndex]);

  const handleClose = () => {
    setApprovalMode(false);
    setProfileModalOpen(false);
    _handleAddOpen(false);
  };

  const handleSessionDetailClick = (sessionData: ISessionsData) => {
    setSelectedSessionDetail(sessionData);
    setSessionDetailModalOpen(true);
  };

  const handleOpen = (
    isEdit: boolean,
    rowData: ISessionsData | null = null,
    isDelete?: boolean
  ) => {
    setApprovalMode(false);
    setEditMode(isEdit);
    setCurrentSessionData(rowData);
    setProfileModalOpen(true);
    setDel(isDelete || false);
  };

  const handleApproval = (
    isEdit: boolean,
    rowData: ISessionsData | null = null
  ) => {
    setApprovalMode(isEdit);
    setCurrentSessionData(rowData);
    setProfileModalOpen(true);
  };

  // async function getDrivers() {
  //   const { data } = await axiosInstance.get("/api/v1/drivers");
  //   console.log(data);
  //   console.log(data.data.length, "length");
  //   handleDriverNum(data.data.length);
  //   return data.data;
  // }
  async function getSessions({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    // if (sort.length === 1) {
    //   console.log(sort[0].id, "here");
    //   console.log(sort, "sorting is finally here");
    // }
    // Build query parameters
    let queryParams: string[] = [];
    
    // Add pagination and sorting
    queryParams.push(`take=${pageSize}`);
    queryParams.push(`page=${pageIndex}`);
    queryParams.push(`sort=createdAt=DESC`);
    queryParams.push(`fields=therapist.*,modal.*,client.*,client.preference.*,group.*,subscription.*,id,hasclientAttended,hasTherapistAttended,schedule,duration,createdAt,groupName`);
    
    // Add date parameters (backend should filter by createdAt, not schedule)
    if (dateFilter.startDate) {
      queryParams.push(`startDate=${dateFilter.startDate}`);
    }
    if (dateFilter.endDate) {
      queryParams.push(`endDate=${dateFilter.endDate}`);
    }
    
    // Build remaining filters
    let remainingFilters: string[] = [];
    
    // Add modal filter
    if (modalFilter && modalFilter !== "all") {
      remainingFilters.push(`modal.id:=${modalFilter}`);
    }
    
    // Add remaining filters if any
    if (remainingFilters.length > 0) {
      queryParams.push(`filters=${remainingFilters.join(',')}`);
    }
    
    const url = `/api/v1/session?${queryParams.join('&')}`;
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
    handleSessionNum(data.data.length);
    return data;
  }

  async function searchSession({
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
    queryParams.push(`sort=createdAt=DESC`);
    queryParams.push(`fields=therapist.*,modal.*,client.*,client.preference.*,group.*,subscription.*,id,hasclientAttended,hasTherapistAttended,schedule,duration,createdAt,groupName`);
    
    // Add date parameters (backend should filter by createdAt, not schedule)
    if (dateFilter.startDate) {
      queryParams.push(`startDate=${dateFilter.startDate}`);
    }
    if (dateFilter.endDate) {
      queryParams.push(`endDate=${dateFilter.endDate}`);
    }
    
    // Build remaining filters
    let remainingFilters: string[] = [];
    
    // Add modal filter
    if (modalFilter && modalFilter !== "all") {
      remainingFilters.push(`modal.id:=${modalFilter}`);
    }
    
    // Handle search input based on search type (therapist or client)
    const searchTerm = search.trim();
    if (searchTerm) {
      const searchPrefix = searchType === "therapist" ? "therapist" : "client";
      
      if (searchTerm.includes(' ')) {
        const searchParts = searchTerm.split(/\s+/);
        // Search for first name and last name matching the parts
        remainingFilters.push(`${searchPrefix}.firstName=${searchParts[0]}`);
        remainingFilters.push(`${searchPrefix}.lastName=${searchParts[1]}`);
      } else {
        // Single word - search only firstName
        remainingFilters.push(`${searchPrefix}.firstName=${searchTerm}`);
      }
    }
    
    // Add remaining filters if any
    if (remainingFilters.length > 0) {
      queryParams.push(`filters=${remainingFilters.join(',')}`);
    }
    
    const url = `/api/v1/session?${queryParams.join('&')}`;
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
    handleSessionNum(data.data.length);
    return data;
  }

  async function revalidateSession() {
    // Build query parameters
    let queryParams: string[] = [];
    
    // Add fields and sorting
    queryParams.push(`fields=therapist.*,modal.*,client.*,client.preference.*,group.*,subscription.*,id,hasclientAttended,hasTherapistAttended,schedule,duration,createdAt`);
    queryParams.push(`sort=createdAt=DESC`);
    
    // Add date parameters (backend should filter by createdAt, not schedule)
    if (dateFilter.startDate) {
      queryParams.push(`startDate=${dateFilter.startDate}`);
    }
    if (dateFilter.endDate) {
      queryParams.push(`endDate=${dateFilter.endDate}`);
    }
    
    // Build remaining filters
    let remainingFilters: string[] = [];
    
    // Add modal filter
    if (modalFilter && modalFilter !== "all") {
      remainingFilters.push(`modal.id:=${modalFilter}`);
    }
    
    // Handle search input based on search type (therapist or client)
    if (searchInput && searchInput.trim()) {
      const searchTerm = searchInput.trim();
      const searchPrefix = searchType === "therapist" ? "therapist" : "client";
      
      if (searchTerm.includes(' ')) {
        const searchParts = searchTerm.split(/\s+/);
        // Search for first name and last name matching the parts
        remainingFilters.push(`${searchPrefix}.firstName=${searchParts[0]}`);
        remainingFilters.push(`${searchPrefix}.lastName=${searchParts[1]}`);
      } else {
        // Single word - search only firstName
        remainingFilters.push(`${searchPrefix}.firstName=${searchTerm}`);
      }
    }
    
    // Add remaining filters if any
    if (remainingFilters.length > 0) {
      queryParams.push(`filters=${remainingFilters.join(',')}`);
    }
    
    const url = `/api/v1/session?${queryParams.join('&')}`;
    const { data } = await axiosInstance.get(url);
    console.log(data, "the data");
    handleSessionNum(data.data.length);
    console.log(data.data, "session data");
    return data;
  }

  async function deleteSession(id: string) {
    const { data } = await axiosInstance.delete(`/api/v1/session/${id}`);
    return data;
  }

  // Fetch modals for session creation
  async function fetchModals() {
    const { data } = await axiosInstance.get("/api/v1/modal");
    return data;
  }

  // Fetch therapists for session creation
  async function fetchTherapists(search: string = "") {
    const url = search
      ? `/api/v1/therapist?filters=firstName=${search}&fields=id,firstName,lastName,profile`
      : `/api/v1/therapist?fields=id,firstName,lastName,profile`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // Create session
  async function createSession(sessionData: any) {
    const { data } = await axiosInstance.post("/api/v1/session", sessionData);
    return data;
  }

  // Add users to session
  async function addUsersToSession(sessionId: string, userIds: string[]) {
    const { data } = await axiosInstance.post(
      `/api/v1/session/${sessionId}/add-to-session`,
      {
        groupClients: userIds,
      }
    );
    return data;
  }

  // Remove users from session
  async function removeUsersFromSession(sessionId: string, userIds: string[]) {
    const { data } = await axiosInstance.post(
      `/api/v1/session/${sessionId}/remove-from-session`,
      {
        groupClients: userIds,
      }
    );
    return data;
  }

  // Fetch users for adding to session
  async function fetchUsers(search: string = "") {
    const url = search
      ? `/api/v1/client?filters=firstName=${search}&fields=id,firstName,lastName,profile,email`
      : `/api/v1/client?fields=id,firstName,lastName,profile,email`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  const { isLoading: isSessionLoading, data: SessionData } = useQuery({
    queryKey: ["Sessions", searchInput, dateFilter, modalFilter, searchType],
    queryFn: revalidateSession,
    refetchInterval: 50000,
    refetchIntervalInBackground: true,
  });

  // Fetch modals query
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: fetchModals,
  });

  // Fetch therapists query
  const { data: therapistsData } = useQuery({
    queryKey: ["therapists", therapistSearch],
    queryFn: () => fetchTherapists(therapistSearch),
    enabled: isAddSessionOpen || reassignModalOpen,
  });

  // Fetch clients for session creation
  async function fetchClients(search: string = "") {
    const url = search
      ? `/api/v1/client?filters=firstName=${search}&fields=id,firstName,lastName,profile`
      : `/api/v1/client?fields=id,firstName,lastName,profile`;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // Fetch clients query
  const { data: clientsData } = useQuery({
    queryKey: ["clients", clientSearch],
    queryFn: () => fetchClients(clientSearch),
    enabled: isAddSessionOpen,
  });

  // Fetch users for adding to session
  const { data: usersData } = useQuery({
    queryKey: ["users", userSearch],
    queryFn: () => fetchUsers(userSearch),
    enabled: isAddToSessionModalOpen,
  });

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
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
      toast("Client successfully deleted!");
    },
    onError: (error) => {
      toast(error?.message || "Error Encountered deleting the session");
      //toast("Error Encountered deleting the driver");
    },
  });

  // Create session mutation
  const { isLoading: isCreatingSession, mutate: createSessionMutation } =
    useMutation({
      mutationFn: createSession,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Sessions"],
        });
        toast("Session created successfully!");
        setIsAddSessionOpen(false);
        setSessionForm({
          scheduleText: "",
          scheduleDate: undefined,
          time: "",
          modalId: "",
          therapistId: "",
          clientId: "",
        });
        setTherapistSearch("");
        setClientSearch("");
      },
      onError: (error: any) => {
        toast(error?.message || "Error creating session");
      },
    });

  // Add users to session mutation
  const { isLoading: isAddingUsers, mutate: addUsersToSessionMutation } =
    useMutation({
      mutationFn: ({
        sessionId,
        userIds,
      }: {
        sessionId: string;
        userIds: string[];
      }) => addUsersToSession(sessionId, userIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Sessions"],
        });
        toast(`Successfully added ${selectedUsers.length} user(s) to session!`);
        setIsAddToSessionModalOpen(false);
        setSelectedUsers([]);
        setUserSearch("");
        setCurrentSessionId(null);
      },
      onError: (error: any) => {
        toast(error?.message || "Error adding users to session");
      },
    });

  // Remove users from session mutation
  const { isLoading: isRemovingUsers, mutate: removeUsersFromSessionMutation } =
    useMutation({
      mutationFn: ({
        sessionId,
        userIds,
      }: {
        sessionId: string;
        userIds: string[];
      }) => removeUsersFromSession(sessionId, userIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Sessions"],
        });
        toast(`Successfully removed ${selectedUsersToRemove.length} user(s) from session!`);
        setIsRemoveFromSessionModalOpen(false);
        setSelectedUsersToRemove([]);
        setRemoveSessionData(null);
      },
      onError: (error: any) => {
        toast(error?.message || "Error removing users from session");
      },
    });

  useEffect(
    function () {
      isAddOpen && setIsAddSessionOpen(true);
    },
    [isAddOpen]
  );

  const handleCreateSession = () => {
    console.log("Session form data:", sessionForm);

    // Check each field individually for better debugging
    const missingFields = [];
    if (!sessionForm.scheduleDate) missingFields.push("Schedule Date");
    if (!sessionForm.time) missingFields.push("Time");
    if (!sessionForm.modalId) missingFields.push("Therapy Type");
    if (!sessionForm.therapistId) missingFields.push("Therapist");
    if (!sessionForm.clientId) missingFields.push("Client");

    if (missingFields.length > 0) {
      toast(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    const [hours, minutes] = sessionForm.time.split(":").map(Number);
    const schedule = new Date(sessionForm.scheduleDate!); // We already validated it exists
    schedule.setHours(hours);
    schedule.setMinutes(minutes);

    const sessionData = {
      date: schedule.toISOString().split("T")[0], // Format as YYYY-MM-DD
      therapist: sessionForm.therapistId,
      duration: 60, // Hardcoded
      type: "video", // Hardcoded
      modal: sessionForm.modalId,
      client: sessionForm.clientId,
    };

    console.log("Session data to be sent:", sessionData);
    createSessionMutation(sessionData);
  };

  const handleOpenAddToSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsAddToSessionModalOpen(true);
  }, []);

  const handleAddUsersToSession = () => {
    if (!currentSessionId || selectedUsers.length === 0) {
      toast("Please select at least one user to add to the session.");
      return;
    }

    addUsersToSessionMutation({
      sessionId: currentSessionId,
      userIds: selectedUsers,
    });
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleOpenRemoveFromSession = useCallback((sessionData: ISessionsData) => {
    setRemoveSessionData(sessionData);
    setIsRemoveFromSessionModalOpen(true);
    setSelectedUsersToRemove([]);
  }, []);

  const handleRemoveUsersFromSession = () => {
    if (!removeSessionData?.id || selectedUsersToRemove.length === 0) {
      toast("Please select at least one user to remove from the session.");
      return;
    }

    removeUsersFromSessionMutation({
      sessionId: removeSessionData.id,
      userIds: selectedUsersToRemove,
    });
  };

  const handleUserToRemoveToggle = (userId: string) => {
    setSelectedUsersToRemove((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

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

  // Handle opening reassign therapist modal
  const handleOpenReassignModal = async (sessionData: ISessionsData) => {
    if (!sessionData.subscription?.id) {
      toast("No subscription found for this session");
      return;
    }

    setReassignSessionData(sessionData);
    setReassignModalOpen(true);
    setLoadingSessions(true);
    setSelectedSessionIds([]);
    setNewTherapistId("");

    try {
      // Fetch all sessions for this subscription
      const { data } = await axiosInstance.get(
        `/api/v1/subscription/user-sub?ids=${sessionData.subscription.id}`
      );

      if (data?.data?.[0]?.session) {
        setSubscriptionSessions(data.data[0].session);
      } else {
        setSubscriptionSessions([]);
        toast("No sessions found for this subscription");
      }
    } catch (error) {
      console.error("Error fetching subscription sessions:", error);
      toast("Failed to fetch subscription sessions");
      setSubscriptionSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Toggle session selection
  const handleToggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Reassign therapist mutation
  const reassignTherapistMutation = useMutation(
    async ({ sessionIds, therapistId }: { sessionIds: string[]; therapistId: string }) => {
      // Patch each selected session with the new therapist
      const promises = sessionIds.map((sessionId) =>
        axiosInstance.patch(`/api/v1/session/${sessionId}`, {
          therapist: therapistId,
        })
      );
      await Promise.all(promises);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["Sessions"]);
        toast("Therapist reassigned successfully!");
        setReassignModalOpen(false);
        setSelectedSessionIds([]);
        setNewTherapistId("");
      },
      onError: (error: any) => {
        console.error("Error reassigning therapist:", error);
        toast(error?.message || "Failed to reassign therapist");
      },
    }
  );

  // Handle reassigning therapist
  const handleReassignTherapist = () => {
    if (selectedSessionIds.length === 0) {
      toast("Please select at least one session");
      return;
    }

    if (!newTherapistId) {
      toast("Please select a therapist");
      return;
    }

    reassignTherapistMutation.mutate({
      sessionIds: selectedSessionIds,
      therapistId: newTherapistId,
    });
  };

  const columns = useMemo<ColumnDef<ISessionsData>[]>(
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
        accessorFn: (row) => row.therapist?.firstName,
        id: "Client",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Client"
            column={column}
            className="min-w-[200px]"
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          // Check if this is a group therapy session
          const isGroupTherapy =
            row.original.group && row.original.group.length > 0;
          const client = row.original.client;
          const group = row.original.group;

          if (isGroupTherapy && group) {
            const clientCount = group.length;
            return (
              <div className="flex items-center gap-4">
                <div className="relative flex">
                  {/* First client avatar */}
                  <div
                    className="relative group cursor-pointer"
                    //onClick={handleGroupImageClick}
                  >
                    <img
                      src={avatar}
                      className="rounded-full size-9 shrink-0 object-cover transition-transform hover:scale-105 border-2 border-white"
                      alt={`Group therapy session`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <KeenIcon icon="eye" className="text-white text-xs" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                    #{row.original.groupName}
                  </div>
                  <span className="text-2sm text-gray-700 font-normal">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                      <KeenIcon icon="users" className="text-xs" />
                      Group ({clientCount} {clientCount === 1 ? "member" : "members"})
                    </span>
                  </span>
                </div>
              </div>
            );
          } else if (client) {
            // Display individual client
            const img = client?.profile
              ? `${BASE_URL}/${client.profile}`
              : null;

            const handleImageClick = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();

              setSelectedImage({
                src: img ? img : avatar,
                name: `${client?.firstName} ${client?.lastName}`,
                phone: `+251${client?.phoneNumber}`,
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
                    alt={`${client?.firstName} ${client?.lastName}`}
                  />

                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <KeenIcon icon="eye" className="text-white text-xs" />
                  </div>

                  {/* Online status indicator */}
                  <div
                    className={`flex size-2 bg-${client?.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                  ></div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      navigate(`/clients/${client?.id}`);
                    }}
                    className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px text-left"
                  >
                    {client?.firstName} {client?.lastName}
                  </button>
                  <span className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                    +251{client?.phoneNumber}
                  </span>
                </div>
              </div>
            );
          } else {
            // No client data available
            return (
              <div className="flex items-center gap-4">
                <div className="size-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <KeenIcon icon="user" className="text-gray-400 text-sm" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">
                    No client assigned
                  </span>
                </div>
              </div>
            );
          }
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
          const img = row.original.therapist?.profile ? `${BASE_URL}/${row.original.therapist?.profile}` : row.original.therapist?.profile;

          const handleImageClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            console.log("Image clicked!"); // Add this to debug

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
                <div
                  className={`flex size-2 bg-${row.original.therapist?.is_online ? "success" : "gray-400"} rounded-full absolute bottom-0.5 start-7.5 transform pointer-events-none`}
                ></div>
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
        id: "schedule",
        header: ({ column }) => (
          <DataGridColumnHeader title="Schedule" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          // Format schedule (datetime string) for display in 24-hour format
          const schedule = info.row.original.schedule;
          const formatSchedule = (dateTimeString: string | number) => {
            try {
              const date = new Date(dateTimeString);
              const options: Intl.DateTimeFormatOptions = {
                month: "long",
                weekday: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // Changed to 24-hour format
              };
              return date.toLocaleDateString("en-US", options);
            } catch {
              return dateTimeString?.toString() || "N/A";
            }
          };
          return formatSchedule(schedule);
        },
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created At" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const createdAt = info.row.original.createdAt;
          if (!createdAt) return "N/A";
          
          try {
            const date = new Date(createdAt);
            const options: Intl.DateTimeFormatOptions = {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            };
            return date.toLocaleDateString("en-US", options);
          } catch {
            return "Invalid Date";
          }
        },
        meta: {
          headerClassName: "min-w-[140px]",
        },
      },
      {
        id: "therapyType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Therapy Type" column={column} />
        ),
        enableSorting: false,
        cell: (info) => {
          const modalName = info.row.original.modal?.name;
          return modalName || "N/A";
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "Level",
        header: ({ column }) => (
          <DataGridColumnHeader title= "Level" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const modalName = row.original.modal?.name?.toLowerCase();
          
          // Don't show levels for group and couple therapy
          if (modalName && (modalName.includes('group') || modalName.includes('couple'))) {
            return (
              <span className="text-gray-400 text-sm italic">
                N/A for {modalName.includes('group') ? 'Group' : 'Couple'} Therapy
              </span>
            );
          }
          
          // For individual therapy, show client level
          const client = row.original.client;
          return client ? <SessionLevelCell client={client} /> : (
            <span className="text-gray-400 text-sm">No Client</span>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "receipt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Receipt" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const handleReceiptClick = async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            // For group therapy, we need to handle multiple clients
            const isGroupTherapy = row.original.group && row.original.group.length > 0;
            
            if (isGroupTherapy) {
              toast.info("Group therapy sessions have multiple receipts. Please check individual client details.");
              return;
            }

            const client = row.original.client;
            if (!client) {
              toast.error("No client found for this session");
              return;
            }

            try {
              // Fetch client's active subscription to get payment receipt
              const { data: clientData } = await axiosInstance.get(`/api/v1/client/${client.id}?fields=activeSubscription.*`);
              const activeSubscription = clientData?.data?.activeSubscription;
              
              if (!activeSubscription?.id) {
                toast.error("No active subscription found for this client");
                return;
              }

              const { data: receiptData } = await axiosInstance.get(`/api/v1/subscription/user-sub?fields=payment.*&ids=${activeSubscription.id}`);
              const payment = receiptData?.data?.[0]?.payment?.[0];
              
              if (!payment?.filename) {
                toast.error("No receipt found for this client");
                return;
              }

              const receiptUrl = `${BASE_URL}/payment/${payment.filename}`;
              setSelectedReceipt({
                url: receiptUrl,
                filename: payment.filename,
                clientName: `${client.firstName} ${client.lastName}`,
              });
              setReceiptModalOpen(true);
            } catch (error) {
              console.error("Error fetching receipt:", error);
              toast.error("Failed to load receipt");
            }
          };

          // Check if it's a group therapy or individual session
          const isGroupTherapy = row.original.group && row.original.group.length > 0;
          const hasClient = row.original.client;

          if (isGroupTherapy) {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReceiptClick}
                className="h-8 px-3"
              >
                <KeenIcon icon="users" className="mr-1" />
                Group Receipts
              </Button>
            );
          } else if (hasClient) {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReceiptClick}
                className="h-8 px-3"
              >
                <KeenIcon icon="file-down" className="mr-1" />
                View Receipt
              </Button>
            );
          } else {
            return (
              <span className="text-xs text-gray-400 italic">
                No Client
              </span>
            );
          }
        },
        meta: {
          headerClassName: "min-w-[140px]",
        },
      },
      {
        id: "hasTherapistAttended",
        header: ({ column }) => (
          <DataGridColumnHeader title="Attended" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const hasAttended = info.row.original.hasTherapistAttended;
          return (
            <div className="flex justify-start relative">
              <span
                className={`badge ${hasAttended ? "badge-success" : "badge-danger"} shrink-0 badge-outline rounded-[30px]`}
              >
                <span
                  className={`size-1.5 rounded-full ${hasAttended ? "bg-success" : "bg-danger"} me-1.5`}
                ></span>
                {hasAttended ? "Yes" : "No"}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        id: "addToSession",
        header: ({ column }) => (
          <DataGridColumnHeader title="Add to Session" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          // Check if this is a group therapy session
          const isGroupTherapy = row.original.group && row.original.group.length > 0;
          
          // Only show the button for group therapy sessions
          if (!isGroupTherapy) {
            return (
              <span className="text-xs text-gray-400 italic">
                Individual Session
              </span>
            );
          }

          return (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                handleOpenAddToSession(row.original.id);
              }}
              size="sm"
              variant="outline"
              className="h-8 px-3"
            >
              <KeenIcon icon="plus" className="mr-1" />
              Add Users
            </Button>
          );
        },
        meta: {
          headerClassName: "min-w-[140px]",
        },
      },
      {
        id: "removeFromSession",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remove from Session" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          // Check if this is a group therapy session
          const isGroupTherapy = row.original.group && row.original.group.length > 0;
          
          // Only show the button for group therapy sessions
          if (!isGroupTherapy) {
            return (
              <span className="text-xs text-gray-400 italic">
                Individual Session
              </span>
            );
          }

          return (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                handleOpenRemoveFromSession(row.original);
              }}
              size="sm"
              variant="outline"
              className="h-8 px-3"
            >
              <KeenIcon icon="minus-circle" className="mr-1" />
              Remove Users
            </Button>
          );
        },
        meta: {
          headerClassName: "min-w-[160px]",
        },
      },
      {
        id: "reassignTherapist",
        header: () => <span>Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                handleOpenReassignModal(row.original);
              }}
              size="sm"
              variant="outline"
              className="h-8 px-3"
            >
              <KeenIcon icon="arrows-circle" className="mr-1" />
              Re-assign Therapist
            </Button>
          );
        },
        meta: {
          headerClassName: "min-w-[180px]",
        },
      },
    ],
    [mutate, handleOpenReassignModal, handleOpenRemoveFromSession]
  );

  const data: ISessionsData[] = useMemo(() => SessionData ?? [], [SessionData]);

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

  const handleStartDateTextChange = useCallback((value: string) => {
    setDateFilter((prev) => {
      const date = parseDate(value);
      if (date) {
        const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        setStartDateMonth(date);
        return {
          ...prev,
          startDateText: value,
          startDate: dateStr,
          startDateObj: date,
        };
      }
      return { ...prev, startDateText: value };
    });
  }, []);

  const handleEndDateTextChange = useCallback((value: string) => {
    setDateFilter((prev) => {
      const date = parseDate(value);
      if (date) {
        const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        setEndDateMonth(date);
        return {
          ...prev,
          endDateText: value,
          endDate: dateStr,
          endDateObj: date,
        };
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
      endDateObj: undefined,
    });
  }, []);

  const handleModalFilterChange = useCallback((value: string) => {
    setModalFilter(value);
  }, []);

  const Toolbar = useMemo(() => {
    //const handleFilterChange = (value: any) => {
    //  setFilterInput(value); // Update the state when the user selects an item
    //  console.log("Filter value changed to:", value); // Optional: log for debugging
    //};

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} sessions
        </h3>

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
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateFilter.startDateObj}
                      captionLayout="dropdown"
                      month={startDateMonth}
                      onMonthChange={setStartDateMonth}
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: dateStr,
                            startDateObj: date,
                            startDateText: formatDate(date),
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
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateFilter.endDateObj}
                      captionLayout="dropdown"
                      month={endDateMonth}
                      onMonthChange={setEndDateMonth}
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: dateStr,
                            endDateObj: date,
                            endDateText: formatDate(date),
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

            {/* Modal Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Therapy Type:
              </label>
              <Select
                value={modalFilter}
                onValueChange={handleModalFilterChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Array.isArray(modalsData?.data) && modalsData.data.map((modal: any) => (
                    <SelectItem key={modal.id} value={modal.id}>
                      {modal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Search By:
              </label>
              <Select
                value={searchType}
                onValueChange={(value: "therapist" | "client") => setSearchType(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    dateFilter.startDateText,
    dateFilter.endDateText,
    dateFilter.startDate,
    dateFilter.endDate,
    itemsOnPage,
    totalItems,
    startDateOpen,
    endDateOpen,
    startDateMonth,
    endDateMonth,
    handleStartDateTextChange,
    handleEndDateTextChange,
    clearDateFilter,
    modalFilter,
    handleModalFilterChange,
    modalsData,
    searchType,
  ]);

  // if (isDriverLoading) {
  //   return <DataGridLoader message="Loading" />;
  // }

  return (
    <>
      {/* Tab Navigation */}
      <div className="card-header border-b-0 px-5 pb-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`btn btn-sm ${
              activeTab === "sessions" ? "btn-primary" : "btn-light btn-outline"
            }`}
          >
            <KeenIcon icon="calendar" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("group-therapy")}
            className={`btn btn-sm ${
              activeTab === "group-therapy"
                ? "btn-primary"
                : "btn-light btn-outline"
            }`}
          >
            <KeenIcon icon="users" />
            Group Therapy
          </button>
        </div>
      </div>

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

      <ModalClientTypeForm
        open={profileModalOpen}
        onOpenChange={handleClose}
        isEdit={editMode}
        isApproved={approvalMode}
        clientData={currentSessionData}
        isDelete={del}
      />

      {/* Add Session Modal */}
      <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {/* Therapy Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Therapy Type
              </label>
              <Select
                value={sessionForm.modalId}
                onValueChange={(value) =>
                  setSessionForm((prev) => ({ ...prev, modalId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select therapy type" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(modalsData?.data) && modalsData.data.map((modal: any) => (
                    <SelectItem key={modal.id} value={modal.id}>
                      {modal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Therapist Search and Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Therapist
              </label>
              <Input
                type="text"
                placeholder="Search therapist..."
                value={therapistSearch}
                onChange={(e) => setTherapistSearch(e.target.value)}
                className="mb-2"
              />
              {therapistsData?.data && therapistsData.data.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {therapistsData.data.map((therapist: any) => (
                    <div
                      key={therapist.id}
                      onClick={() => {
                        setSessionForm((prev) => ({
                          ...prev,
                          therapistId: therapist.id,
                        }));
                        setTherapistSearch(
                          `${therapist.firstName} ${therapist.lastName}`
                        );
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 ${
                        sessionForm.therapistId === therapist.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          therapist.profile
                            ? `${BASE_URL}/${therapist.profile}`
                            : avatar
                        }
                        alt={`${therapist.firstName} ${therapist.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {therapist.firstName} {therapist.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Therapist</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Search and Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <Input
                type="text"
                placeholder="Search client..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="mb-2"
              />
              {clientsData?.data && clientsData.data.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {clientsData.data.map((client: any) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSessionForm((prev) => ({
                          ...prev,
                          clientId: client.id,
                        }));
                        setClientSearch(
                          `${client.firstName} ${client.lastName}`
                        );
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 ${
                        sessionForm.clientId === client.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          client.profile
                            ? `${BASE_URL}/${client.profile}`
                            : avatar
                        }
                        alt={`${client.firstName} ${client.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Client</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="flex flex-col gap-3">
              <label htmlFor="schedule-date" className="px-1">
                Schedule Date & Time
              </label>
              <div className="relative flex gap-2">
                <Input
                  id="schedule-date"
                  value={sessionForm.scheduleText}
                  placeholder="Tomorrow, next week, or specific date"
                  className="bg-background pr-10"
                  onChange={(e) => {
                    const value = e.target.value;
                    setSessionForm((prev) => ({
                      ...prev,
                      scheduleText: value,
                    }));
                    const date = parseDate(value);
                    if (date) {
                      setSessionForm((prev) => ({
                        ...prev,
                        scheduleDate: date,
                      }));
                      setScheduleMonth(date);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setScheduleOpen(true);
                    }
                  }}
                />
                <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Select date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                  >
                    <Calendar
                      mode="single"
                      selected={sessionForm.scheduleDate}
                      captionLayout="dropdown"
                      month={scheduleMonth}
                      onMonthChange={setScheduleMonth}
                      onSelect={(date) => {
                        setSessionForm((prev) => ({
                          ...prev,
                          scheduleDate: date,
                          scheduleText: formatDate(date),
                        }));
                        setScheduleOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                type="time"
                value={sessionForm.time}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, time: e.target.value }))
                }
                placeholder="Select time"
                className="w-full"
              />
              {sessionForm.scheduleDate && (
                <div className="text-muted-foreground px-1 text-sm">
                  Session scheduled for{" "}
                  <span className="font-medium">
                    {formatDate(sessionForm.scheduleDate)}
                    {sessionForm.time && ` at ${sessionForm.time}`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setIsAddSessionOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={isCreatingSession}
                className="flex-1"
              >
                {isCreatingSession ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Session Modal */}
      <Dialog
        open={isAddToSessionModalOpen}
        onOpenChange={setIsAddToSessionModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add Users to Session
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-1 m-4">
            {/* User Search */}
            <div className="space-y-4">
              <Input
                placeholder="Search users by name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-12 text-base"
              />

              {usersData?.data && usersData.data.length > 0 ? (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl bg-white">
                  {usersData.data.map((user: any) => (
                    <div
                      key={user.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                        selectedUsers.includes(user.id)
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : ""
                      }`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              user.profile
                                ? `${BASE_URL}/${user.profile}`
                                : avatar
                            }
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          {selectedUsers.includes(user.id) && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full w-5 h-5 flex">
                              <KeenIcon
                                icon="check"
                                className="text-white text-xs m-1"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl">
                  {userSearch
                    ? "No users found matching your search"
                    : "No users available"}
                </div>
              )}
            </div>

            {/* Selected Users Summary */}
            {/*{selectedUsers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Selected Users ({selectedUsers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = usersData?.data?.find((u: any) => u.id === userId);
                    return user ? (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {user.firstName} {user.lastName}
                        <button
                          onClick={() => handleUserToggle(userId)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <KeenIcon icon="cross" className="text-xs" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}*/}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsAddToSessionModalOpen(false)}
                className="px-6 py-3 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUsersToSession}
                disabled={isAddingUsers || selectedUsers.length === 0}
                className="px-6 py-3 text-base bg-blue-600 hover:bg-blue-700"
              >
                {isAddingUsers ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin mr-2" />
                    Adding Users...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="plus" className="mr-2" />
                    Add {selectedUsers.length} User
                    {selectedUsers.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove from Session Modal */}
      <Dialog
        open={isRemoveFromSessionModalOpen}
        onOpenChange={setIsRemoveFromSessionModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Remove Users from Session
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-1 m-4">
            {/* Session Info */}
            {removeSessionData && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-1">
                  Session: {removeSessionData.groupName || "Group Session"}
                </p>
                <p className="text-sm text-orange-700">
                  {removeSessionData.group?.length || 0} member(s) in this group
                </p>
              </div>
            )}

            {/* Group Members List */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-900">
                Select users to remove:
              </h4>

              {removeSessionData?.group && removeSessionData.group.length > 0 ? (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl bg-white">
                  {removeSessionData.group.map((user: any) => (
                    <div
                      key={user.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                        selectedUsersToRemove.includes(user.id)
                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                          : ""
                      }`}
                      onClick={() => handleUserToRemoveToggle(user.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              user.profile
                                ? `${BASE_URL}/${user.profile}`
                                : avatar
                            }
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          {selectedUsersToRemove.includes(user.id) && (
                            <div className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 flex">
                              <KeenIcon
                                icon="check"
                                className="text-white text-xs m-1"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">+251{user.phoneNumber}</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsersToRemove.includes(user.id)}
                            onChange={() => handleUserToRemoveToggle(user.id)}
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl">
                  No users in this group session
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsRemoveFromSessionModalOpen(false)}
                className="px-6 py-3 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveUsersFromSession}
                disabled={isRemovingUsers || selectedUsersToRemove.length === 0}
                className="px-6 py-3 text-base bg-red-600 hover:bg-red-700"
              >
                {isRemovingUsers ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin mr-2" />
                    Removing Users...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="minus-circle" className="mr-2" />
                    Remove {selectedUsersToRemove.length} User
                    {selectedUsersToRemove.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Detail Modal */}
      <Dialog
        open={sessionDetailModalOpen}
        onOpenChange={setSessionDetailModalOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Session Details
            </DialogTitle>
          </DialogHeader>

          {selectedSessionDetail && (
            <div className="space-y-6 px-1">
              {/* Session Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Session Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Session ID
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSessionDetail.id}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Schedule
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(
                          selectedSessionDetail.schedule
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Duration
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSessionDetail.duration} minutes
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Therapy Type
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSessionDetail.modal?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Client Attended
                      </label>
                      <span
                        className={`badge ${selectedSessionDetail.hasclientAttended ? "badge-success" : "badge-danger"} badge-outline`}
                      >
                        {selectedSessionDetail.hasclientAttended ? "Yes" : "No"}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Therapist Attended
                      </label>
                      <span
                        className={`badge ${selectedSessionDetail.hasTherapistAttended ? "badge-success" : "badge-danger"} badge-outline`}
                      >
                        {selectedSessionDetail.hasTherapistAttended
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Therapist Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Therapist
                  </h3>

                  {selectedSessionDetail.therapist && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={
                          selectedSessionDetail.therapist.profile
                            ? `${BASE_URL}/${selectedSessionDetail.therapist.profile}`
                            : avatar
                        }
                        className="rounded-full size-12 object-cover"
                        alt={`${selectedSessionDetail.therapist.firstName} ${selectedSessionDetail.therapist.lastName}`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedSessionDetail.therapist.firstName}{" "}
                          {selectedSessionDetail.therapist.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedSessionDetail.therapist.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          +251{selectedSessionDetail.therapist.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Client(s) Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedSessionDetail.group &&
                  selectedSessionDetail.group.length > 0
                    ? "Group Clients"
                    : "Client"}
                </h3>

                {selectedSessionDetail.group &&
                selectedSessionDetail.group.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSessionDetail.group.map(
                      (client: any, index: number) => (
                        <div
                          key={client.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={
                              client.profile
                                ? `${BASE_URL}/${client.profile}`
                                : avatar
                            }
                            className="rounded-full size-12 object-cover"
                            alt={`${client.firstName} ${client.lastName}`}
                          />
                          <div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/clients/${client.id}`);
                              }}
                              className="font-medium text-gray-900 hover:text-primary-active text-left"
                            >
                              {client.firstName} {client.lastName}
                            </button>
                            <p className="text-sm text-gray-500">
                              {client.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              +251{client.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : selectedSessionDetail.client ? (
                  <div className="space-y-4">
                    {/* Client Profile Header */}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <img
                        src={
                          selectedSessionDetail.client.profile
                            ? `${BASE_URL}/${selectedSessionDetail.client.profile}`
                            : avatar
                        }
                        className="rounded-full size-16 object-cover border-2 border-blue-200"
                        alt={`${selectedSessionDetail.client.firstName} ${selectedSessionDetail.client.lastName}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {selectedSessionDetail.client.firstName} {selectedSessionDetail.client.lastName}
                          </h4>
                          {(selectedSessionDetail.client.isEmailAuthenticated || selectedSessionDetail.client.isPhoneNumberAuthenticated) && (
                            <KeenIcon icon="verify" className="text-primary text-sm" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <KeenIcon icon="email" className="text-xs" />
                            <span>{selectedSessionDetail.client.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <KeenIcon icon="phone" className="text-xs" />
                            <span>+251{selectedSessionDetail.client.phoneNumber}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`badge ${
                              selectedSessionDetail.client.status === "active"
                                ? "badge-success"
                                : selectedSessionDetail.client.status === "pending"
                                ? "badge-primary"
                                : selectedSessionDetail.client.status === "inactive"
                                ? "badge-warning"
                                : "badge-danger"
                            } badge-outline badge-sm`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                selectedSessionDetail.client.status === "active"
                                  ? "bg-success"
                                  : selectedSessionDetail.client.status === "pending"
                                  ? "bg-primary"
                                  : selectedSessionDetail.client.status === "inactive"
                                  ? "bg-warning"
                                  : "bg-danger"
                              } me-1.5`}
                            ></span>
                            {selectedSessionDetail.client.status}
                          </span>
                          {selectedSessionDetail.client.isOnline && (
                            <span className="badge badge-sm badge-success badge-outline">
                              Online
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Username</label>
                          <p className="text-sm text-gray-900">@{selectedSessionDetail.client.username}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Gender</label>
                          <p className="text-sm text-gray-900">{selectedSessionDetail.client.gender}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email Verified</label>
                          <p className="text-sm text-gray-900">
                            {selectedSessionDetail.client.isEmailAuthenticated ? "✅ Yes" : "❌ No"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Verified</label>
                          <p className="text-sm text-gray-900">
                            {selectedSessionDetail.client.isPhoneNumberAuthenticated ? "✅ Yes" : "❌ No"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Seen</label>
                          <p className="text-sm text-gray-900">
                            {selectedSessionDetail.client.lastSeenAt 
                              ? new Date(selectedSessionDetail.client.lastSeenAt).toLocaleString()
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Member Since</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedSessionDetail.client.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No client information available
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Re-assign Therapist Modal */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Select New Therapist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Therapist
              </label>
              <div className="relative w-full">
                <Input
                  value={therapistSearch}
                  onChange={(e) => setTherapistSearch(e.target.value)}
                  placeholder="Search therapist by name..."
                  className="w-full"
                />
                {therapistSearch && (
                  <button
                    onClick={() => {
                      setTherapistSearch("");
                      setNewTherapistId("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <KeenIcon icon="cross" className="text-sm" />
                  </button>
                )}
              </div>
              
              {/* Therapist Results */}
              {therapistsData?.data && therapistsData.data.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-64 overflow-y-auto w-full">
                  {therapistsData.data.map((therapist: any) => (
                    <div
                      key={therapist.id}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50",
                        newTherapistId === therapist.id && "bg-blue-50 border-l-4 border-blue-500"
                      )}
                      onClick={() => {
                        setNewTherapistId(therapist.id);
                        setTherapistSearch(`${therapist.firstName} ${therapist.lastName}`);
                      }}
                    >
                      <img
                        src={therapist.profile ? `${BASE_URL}/${therapist.profile}` : avatar}
                        className="rounded-full size-10 object-cover border"
                        alt={therapist.firstName}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {therapist.firstName} {therapist.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          +251{therapist.phoneNumber}
                        </p>
                      </div>
                      {newTherapistId === therapist.id && (
                        <KeenIcon icon="check" className="text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Selected Therapist Display */}
              {newTherapistId && !therapistSearch && (
                <div className="mt-2 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 w-80">
                  <img
                    src={
                      therapistsData?.data?.find((t: any) => t.id === newTherapistId)?.profile
                        ? `${BASE_URL}/${therapistsData.data.find((t: any) => t.id === newTherapistId).profile}`
                        : avatar
                    }
                    className="rounded-full size-10 object-cover"
                    alt="Selected therapist"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {therapistsData?.data?.find((t: any) => t.id === newTherapistId)?.firstName}{" "}
                      {therapistsData?.data?.find((t: any) => t.id === newTherapistId)?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">Selected Therapist</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewTherapistId("");
                      setTherapistSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <KeenIcon icon="cross" />
                  </button>
                </div>
              )}
            </div>

            {/* Sessions List */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Select Sessions to Re-assign ({subscriptionSessions.length} sessions)
              </h4>
              
              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : subscriptionSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sessions found</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subscriptionSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                      )}
                      onClick={() => handleToggleSessionSelection(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSessionIds.includes(session.id)}
                              onChange={() => handleToggleSessionSelection(session.id)}
                              className="rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <p className="font-medium">{session.groupName || "Session"}</p>
                              <p className="text-sm text-gray-600">
                                Schedule: {new Date(session.schedule).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "badge badge-sm",
                              session.approvalStatus === "confirmed"
                                ? "badge-success"
                                : session.approvalStatus === "pending"
                                ? "badge-warning"
                                : "badge-danger"
                            )}
                          >
                            {session.approvalStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                {selectedSessionIds.length} session(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReassignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReassignTherapist}
                  disabled={selectedSessionIds.length === 0 || !newTherapistId || reassignTherapistMutation.isLoading}
                >
                  {reassignTherapistMutation.isLoading ? "Reassigning..." : "Re-assign Therapist"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:bg-gray-100 z-10 transition-colors"
            >
              <KeenIcon icon="cross" className="text-gray-600 text-sm" />
            </button>

            {/* Receipt Image */}
            <img
              src={selectedReceipt.url}
              alt={`Receipt for ${selectedReceipt.clientName}`}
              className="rounded-lg shadow-2xl max-h-[80vh] w-auto object-contain bg-white"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error("Failed to load receipt image");
                toast.error("Failed to load receipt image");
                setSelectedReceipt(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Conditional Content Based on Active Tab */}
      {activeTab === "sessions" ? (
        <DataGrid
          onFetchData={getSessions}
          onSearchData={searchSession}
          data={data}
          link={"sessions"}
          columns={columns}
          //filterInput={filterInput}
          rowSelection={true}
          onRowSelectionChange={handleRowSelection}
          searchInput={searchInput}
          pagination={{ size: 5 }}
          sorting={[{ id: "createdAt", desc: true }]}
          toolbar={Toolbar}
          layout={{ card: true }}
        />
      ) : (
        <GroupTherapy searchInput={searchInput} />
      )}
    </>
  );
};

export { Sessions };