import { useState, useEffect } from "react";
import { IClientDetailData, IClientRating } from "@/types/client";
import { ISessionData, ISessionResponse } from "@/types/session";
import { IAnswerData, IAnswerResponse } from "@/types/answer";
import { KeenIcon } from "@/components";
import {
  formatDistanceToNow,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
import avatar from "@/media/avatars/blank.png";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

// User Subscription Interface
interface IUserSubscription {
  id: string;
  updatedAt: string;
  createdAt: string;
  therapistPercentage: number | null;
  status: string;
  start_date: string;
  end_date: string;
  old_price: number | null;
  price: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  subscription: {
    id: string;
    type: number;
    old_price: number;
    price: number;
    is_admin_created: boolean;
    modal: {
      id: string;
      name: string;
      order: number;
      code: string | null;
      description: string;
    };
    level: {
      id: string;
      type: string;
      minXP: number;
      maxXP: number | null;
      price: number;
    } | null;
  };
  session: any[];
}

interface IUserSubscriptionResponse {
  data: IUserSubscription[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message: string;
  statusCode: number;
  method: string;
  path: string;
  timestamp: string;
}

interface ClientDetailContentProps {
  clientData: IClientDetailData;
}

const timeAgo = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return formatDistanceToNow(date, { addSuffix: true });
};

const ClientDetailContent = ({ clientData }: ClientDetailContentProps) => {
  const [selectedSubscription, setSelectedSubscription] = useState<IUserSubscription | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "MMM dd, yyyy 'at' HH:mm");
  };

  const profileImage = clientData.profile
    ? `${BASE_URL}/${clientData.profile}`
    : avatar;

  // Fetch all user subscriptions
  const fetchUserSubscriptions = async (): Promise<IUserSubscriptionResponse> => {
    const { data } = await axiosInstance.get(
      `/api/v1/subscription/user-sub?filters=client.id=${clientData.id}&take=0`
    );
    return data;
  };

  const { data: userSubscriptionsData, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["user-subscriptions", clientData.id],
    queryFn: fetchUserSubscriptions,
  });

  const userSubscriptions = userSubscriptionsData?.data || [];

  // Set initial selected subscription to active one or most recent
  useEffect(() => {
    if (userSubscriptions.length > 0 && !selectedSubscription) {
      const activeSubscription = userSubscriptions.find(sub => sub.status === "active");
      setSelectedSubscription(activeSubscription || userSubscriptions[0]);
    }
  }, [userSubscriptions, selectedSubscription]);

  console.log(clientData.rating, "gow gow rating");

  return (
    <div className="mb-4">
      {/* Profile Header - Full Width (Overlapping cover) */}
      <div className="translate-y-[-70px]">
        <ClientProfileHeader clientData={clientData} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5 -mt-8">
        {/* Full Width Subscription Stats */}
        <div className="col-span-1 lg:col-span-3">
          <ClientSubscriptionStats 
            clientData={clientData}
            selectedSubscription={selectedSubscription}
          />
        </div>

        {/* Full Width Timeline */}
        <div className="col-span-1 lg:col-span-3">
          <SubscriptionHistoryTimeline 
            subscriptions={userSubscriptions}
            selectedSubscription={selectedSubscription}
            onSelectSubscription={setSelectedSubscription}
            isLoading={isLoadingSubscriptions}
          />
        </div>

        {/* Left Column - General Info */}
        <div className="col-span-1 w-full">
          <div className="sticky top-5">
            <ClientGeneralInfo clientData={clientData} />
          </div>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="col-span-1 lg:col-span-2">
          <div className="card border-2 border-gray-200">
            <div className="card-body p-6">
              <ClientTabbedContent 
                clientData={clientData} 
                selectedSubscription={selectedSubscription}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subscription History Timeline Component
const SubscriptionHistoryTimeline = ({
  subscriptions,
  selectedSubscription,
  onSelectSubscription,
  isLoading,
}: {
  subscriptions: IUserSubscription[];
  selectedSubscription: IUserSubscription | null;
  onSelectSubscription: (subscription: IUserSubscription) => void;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading subscription history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-4">
            <KeenIcon icon="information" className="text-2xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No subscription history available</p>
          </div>
        </div>
      </div>
    );
  }

  // Group subscriptions by modal
  const groupedByModal = subscriptions.reduce((acc, sub) => {
    const modalName = sub.subscription.modal.name;
    if (!acc[modalName]) {
      acc[modalName] = [];
    }
    acc[modalName].push(sub);
    return acc;
  }, {} as Record<string, IUserSubscription[]>);

  return (
    <div className="card h-full">
      <div className="card-header border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeenIcon icon="calendar-tick" className="text-primary text-xl" />
            </div>
            <div>
              <h3 className="card-title text-gray-900 font-bold">Subscription History</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {subscriptions.length} Total Record{subscriptions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body p-6">
        <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 before:content-['']">
          {Object.entries(groupedByModal).map(([modalName, modalSubs], groupIndex) => (
            <div key={modalName} className="relative pl-12">
              {/* Timeline Node */}
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white bg-primary/10 flex items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              </div>

              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <h4 className="text-lg font-bold text-gray-900">{modalName}</h4>
                <span className="badge badge-xs badge-secondary badge-outline">
                  {modalSubs.length} period{modalSubs.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Subscription Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {modalSubs.map((sub) => {

                  console.log(sub, "What is this sub");
                  const isSelected = selectedSubscription?.id === sub.id;
                  const isActive = sub.status === "active";
                  const subscriptionTypes: Record<number, string> = {
                    0: "Trial",
                    1: "Monthly",
                    3: "Quarterly",
                    6: "Semi-Annual",
                    12: "Yearly",
                  };
                  const typeName = subscriptionTypes[sub.subscription.type] || `Type ${sub.subscription.type}`;
                  
                  // Safe date formatting with validation
                  const formatSafeDate = (dateString: string) => {
                    try {
                      const date = new Date(dateString);
                      if (isNaN(date.getTime())) return "N/A";
                      return format(date, "MMM dd, yyyy");
                    } catch {
                      return "N/A";
                    }
                  };
                  
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubscription(sub)}
                      className={`
                        relative group cursor-pointer rounded-xl border-2 transition-all duration-300 p-4
                        hover:shadow-lg hover:border-primary/50 hover:-translate-y-1
                        ${isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-gray-200 bg-white hover:bg-gray-50"
                        }
                      `}
                    >
                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute -top-3 -right-2">
                          <span className="badge badge-success shadow-sm border-2 border-white">
                            Active
                          </span>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-primary">
                          <KeenIcon icon="check-circle" className="text-xl" />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                            ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"}
                          `}>
                            <KeenIcon icon="calendar" className="text-lg" />
                          </div>
                          <div>
                            <h5 className={`font-bold text-sm ${isSelected ? "text-primary" : "text-gray-900"}`}>
                              {typeName} Plan
                            </h5>
                            <p className="text-xs text-gray-500 font-medium">
                              {(sub.subscription.price ?? 0).toLocaleString()} Birr
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-dashed border-gray-200">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Start Date</span>
                              <span className="font-medium text-gray-700">{formatSafeDate(sub.start_date)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">End Date</span>
                              <span className="font-medium text-gray-700">{formatSafeDate(sub.end_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Profile Header Component
const ClientProfileHeader = ({
  clientData,
}: {
  clientData: IClientDetailData;
}) => {
  const profileImage = clientData.profile
    ? `${BASE_URL}/${clientData.profile}`
    : avatar;

  return (
    <div className="relative group mb-6">
      {/* Main Card Content */}
      <div className="relative card overflow-hidden">
        
        {/* Decorative Background Elements - Subtle Grays */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent opacity-60"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="card-body pt-10 pb-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* Profile Image Container with Animations */}
            <div className="relative mb-6 group/avatar">
              {/* Rotating outer ring */}
              <div className="absolute inset-[-12px] rounded-full border border-dashed border-gray-300 animate-[spin_12s_linear_infinite] opacity-60 group-hover/avatar:opacity-100 transition-opacity"></div>
              {/* Counter-rotating inner ring */}
              <div className="absolute inset-[-6px] rounded-full border border-dotted border-gray-300 animate-[spin_8s_linear_infinite_reverse] opacity-60 group-hover/avatar:opacity-100 transition-opacity"></div>
              
              {/* Pulse Effect behind image */}
              <div className="absolute inset-0 rounded-full bg-gray-100 animate-ping opacity-20 duration-1000"></div>
              
              {/* Image */}
              <div className="relative rounded-full p-1.5 bg-white ring-1 ring-gray-100 shadow-2xl">
                <img
                  src={profileImage}
                  alt={`${clientData.firstName} ${clientData.lastName}`}
                  className="rounded-full size-32 object-cover"
                />
              </div>

              {/* Status Indicator - Heartbeat */}
              <div className="absolute bottom-2 right-2">
                <span className="relative flex h-6 w-6">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    clientData.status === "active" ? "bg-success" : "bg-danger"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-6 w-6 border-2 border-white shadow-sm ${
                     clientData.status === "active" ? "bg-success" : "bg-danger"
                  }`}></span>
                </span>
              </div>
            </div>

            {/* Name Section */}
            <div className="mb-6 relative animate-fade-in-up">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {clientData.firstName} {clientData.lastName}
                </h2>
                {(clientData.isEmailAuthenticated ||
                  clientData.isPhoneNumberAuthenticated) && (
                  <div className="p-1 bg-blue-50 rounded-full text-blue-500 animate-bounce duration-[2000ms]">
                     <KeenIcon icon="verify" className="text-xl" />
                  </div>
                )}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Valued Client
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              </div>
            </div>

            {/* Info Pills - Animated */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 group/pill">
                <div className="p-bg-gray-50 text-gray-500 group-hover/pill:text-gray-900 group-hover/pill:bg-gray-100 transition-colors">
                  <KeenIcon icon="sms" className="text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover/pill:text-gray-900">{clientData.email}</span>
              </div>
              
              <div className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 group/pill">
                 <div className="bg-gray-50 rounded-full text-gray-500 group-hover/pill:text-gray-900 group-hover/pill:bg-gray-100 transition-colors">
                  <KeenIcon icon="phone" className="text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover/pill:text-gray-900">+251{clientData.phoneNumber}</span>
              </div>
              
              <div className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 group/pill">
                 <div className="bg-gray-50 rounded-full text-gray-500 group-hover/pill:text-gray-900 group-hover/pill:bg-gray-100 transition-colors">
                  <KeenIcon icon="profile-circle" className="text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover/pill:text-gray-900">@{clientData.username}</span>
              </div>
            </div>

            {/* Status Badge - Tech Style */}
            <div className="flex justify-center">
              <div className={`
                px-6 py-2 rounded-full cursor-pointer border shadow-sm font-mono text-xs tracking-wider uppercase flex items-center gap-3 transition-all duration-300 hover:shadow-md
                ${clientData.status === "active" 
                  ? "bg-white border-green-200 text-green-700" 
                  : "bg-white border-gray-200 text-gray-500"}
              `}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    clientData.status === "active" ? "bg-green-500" : "bg-gray-400"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    clientData.status === "active" ? "bg-green-500" : "bg-gray-400"
                  }`}></span>
                </span>
                System Status: {clientData.status}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Subscription Stats Component
const ClientSubscriptionStats = ({
  clientData,
  selectedSubscription,
}: {
  clientData: IClientDetailData;
  selectedSubscription: IUserSubscription | null;
}) => {
  // Use selected subscription if available, otherwise fall back to activeSubscription
  const displaySubscription = selectedSubscription || clientData.activeSubscription;
  const isActive = displaySubscription?.status === "active";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7.5 mb-6">
      {/* Type Card */}
      <div className={`card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isActive ? "bg-primary/5 border-primary/20" : "bg-white"}`}>
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
              <KeenIcon icon="category" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Plan Type</div>
              <div className="text-xl font-bold text-gray-900">
                {(() => {
                  const subscription = displaySubscription?.subscription;
                  if (!subscription) return "No Subscription";

                  const type = subscription.type;
                  if (type === undefined || type === null) return "N/A";

                  const subscriptionTypes: Record<number, string> = {
                    0: "Trial",
                    1: "Monthly",
                    3: "Quarterly",
                    6: "Semi-Annual",
                    12: "Yearly",
                  };
                  return subscriptionTypes[type] || `Type ${type}`;
                })()}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${isActive ? "bg-primary" : "bg-gray-400"} w-full`}></div>
          </div>
        </div>
      </div>

      {/* Price Card */}
      <div className={`card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isActive ? "bg-primary/5 border-primary/20" : "bg-white"}`}>
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
              <KeenIcon icon="wallet" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Plan Price</div>
              <div className="text-xl font-bold text-gray-900">
                {(() => {
                  if (!displaySubscription) return "N/A";
                  const price = displaySubscription.price ?? displaySubscription.subscription?.price;
                  if (price === undefined || price === null) return "N/A";
                  return `${price.toLocaleString()} Birr`;
                })()}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${isActive ? "bg-primary" : "bg-gray-400"} w-full`}></div>
          </div>
        </div>
      </div>

      {/* Sessions Card */}
      <div className={`card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isActive ? "bg-primary/5 border-primary/20" : "bg-white"}`}>
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
              <KeenIcon icon="calendar-tick" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Total Sessions</div>
              <div className="text-xl font-bold text-gray-900">
                {(() => {
                  const subscription = displaySubscription?.subscription;
                  if (!subscription) return "N/A";
                  const type = subscription.type;
                  if (type === undefined || type === null) return "N/A";
                  const sessionsPerType: Record<number, number> = {
                    0: 1, 1: 4, 3: 12, 6: 24, 12: 48
                  };
                  return sessionsPerType[type] || "N/A";
                })()}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${isActive ? "bg-primary" : "bg-gray-400"} w-full`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Info Component
const ClientGeneralInfo = ({
  clientData,
}: {
  clientData: IClientDetailData;
}) => {
  console.log(clientData, "The client Data");
  const items = [
    { label: "Phone:", info: `+251 ${clientData.phoneNumber}` },
    { label: "Email:", info: clientData.email },
    {
      label: "Status:",
      info: `<span class="badge badge-sm ${
        clientData.status === "suspended"
          ? "badge-danger"
          : clientData.status === "inactive"
            ? "badge-warning"
            : clientData.status === "active"
              ? "badge-success"
              : "badge-primary"
      } badge-outline">${clientData.status}</span>`,
    },
    { label: "Gender:", info: clientData.gender },
    { label: "Username:", info: `@${clientData.username}` },
    { label: "Created at:", info: timeAgo(clientData.createdAt) },
  ];

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">General Info</h3>
      </div>
      <div className="card-body pt-3.5 pb-3.5">
        <table className="table-auto">
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="text-sm text-gray-600 pb-3 pe-4 lg:pe-8">
                  {item.label}
                </td>
                <td className="text-sm text-gray-900 pb-3">
                  <span dangerouslySetInnerHTML={{ __html: item.info }}></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Account Info Component
const ClientAccountInfo = ({
  clientData,
}: {
  clientData: IClientDetailData;
}) => {
  const items = [
    { label: "User ID:", info: clientData.id },
    {
      label: "Date of Birth:",
      info: clientData.dob
        ? (() => {
            const date = new Date(clientData.dob);
            return isNaN(date.getTime())
              ? "Invalid date"
              : format(date, "MMM dd, yyyy");
          })()
        : "N/A",
    },
    {
      label: "Email Verified:",
      info: clientData.isEmailAuthenticated ? "✅ Yes" : "❌ No",
    },
    {
      label: "Phone Verified:",
      info: clientData.isPhoneNumberAuthenticated ? "✅ Yes" : "❌ No",
    },
    { label: "Visibility:", info: clientData.isVisible ? "Visible" : "Hidden" },
    { label: "In Group:", info: clientData.isInGroup ? "Yes" : "No" },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Account Details</h3>
      </div>
      <div className="card-body pt-3.5 pb-3.5">
        <table className="table-auto">
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="text-sm text-gray-600 pb-3 pe-4 lg:pe-8">
                  {item.label}
                </td>
                <td className="text-sm text-gray-900 pb-3">{item.info}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Preference Data Interface
interface IPreferenceData {
  id: string;
  gender: string | null;
  otherLang: string | null;
  goal: string | null;
  level: {
    id: string;
    type: string;
    minXP: number;
    maxXP: number;
    price: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  language: {
    id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
  }[];
  availability: {
    day: string;
    day_period: string;
  }[];
}

// Tabbed Content Component with Preference-based Tabs
const ClientTabbedContent = ({
  clientData,
  selectedSubscription,
}: {
  clientData: IClientDetailData;
  selectedSubscription: IUserSubscription | null;
}) => {
  const [activeView, setActiveView] = useState<"sessions" | "preferences">("sessions");
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string | null>(null);
  const [selectedModalId, setSelectedModalId] = useState<string | null>(null);

  // Fetch modal information for each preference
  const fetchPreferenceModals = async () => {
    if (!clientData.preference || clientData.preference.length === 0) return [];
    
    const modalPromises = clientData.preference.map(async (pref) => {
      try {
        const { data } = await axiosInstance.get(
          `/api/v1/preference/${pref.id}?fields=modal.*`
        );
        return {
          preferenceId: pref.id,
          modalName: data?.data?.modal?.name || "Unknown Modal",
          modalId: data?.data?.modal?.id || null,
        };
      } catch (error) {
        console.error(`Error fetching modal for preference ${pref.id}:`, error);
        return {
          preferenceId: pref.id,
          modalName: "Unknown Modal",
          modalId: null,
        };
      }
    });

    return Promise.all(modalPromises);
  };

  const { data: preferenceModals, isLoading: isLoadingModals } = useQuery({
    queryKey: ["client-preference-modals", clientData.id],
    queryFn: fetchPreferenceModals,
    enabled: !!clientData.preference && clientData.preference.length > 0,
  });

  // Initialize selectedModalId and preferenceId based on selected subscription
  useEffect(() => {
    if (selectedSubscription && preferenceModals && preferenceModals.length > 0) {
      const modalId = selectedSubscription.subscription.modal.id;
      const matchingPreference = preferenceModals.find(pm => pm.modalId === modalId);
      
      if (matchingPreference) {
        setSelectedModalId(matchingPreference.modalId);
        setSelectedPreferenceId(matchingPreference.preferenceId);
      } else if (!selectedModalId) {
        // Fallback to first preference if no match
        setSelectedModalId(preferenceModals[0].modalId);
        setSelectedPreferenceId(preferenceModals[0].preferenceId);
      }
    } else if (preferenceModals && preferenceModals.length > 0 && !selectedModalId) {
      setSelectedModalId(preferenceModals[0].modalId);
      setSelectedPreferenceId(preferenceModals[0].preferenceId);
    }
  }, [preferenceModals, selectedSubscription, selectedModalId]);

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      {/* Main Tab Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          className={`btn btn-sm ${activeView === "sessions" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("sessions")}
        >
          <KeenIcon icon="calendar" /> Session Calendar
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeView === "preferences" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("preferences")}
        >
          <KeenIcon icon="setting-2" /> Preferences & Questions
        </button>
      </div>

      {/* Preference Sub-tabs (only show when Preferences tab is active) */}
      {activeView === "preferences" && preferenceModals && preferenceModals.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap border-b pb-3">
          {preferenceModals.map((prefModal) => (
            <button
              key={prefModal.preferenceId}
              type="button"
              className={`btn btn-xs ${
                selectedPreferenceId === prefModal.preferenceId
                  ? "btn-secondary"
                  : "btn-outline btn-secondary"
              }`}
              onClick={() => {
                setSelectedPreferenceId(prefModal.preferenceId);
                setSelectedModalId(prefModal.modalId);
              }}
            >
              <KeenIcon icon="abstract-26" className="text-xs" />
              {prefModal.modalName}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {activeView === "sessions" && <ClientSessions clientData={clientData} />}
      {activeView === "preferences" && selectedPreferenceId && selectedModalId && (
        <div className="space-y-6">
          <ClientPreferenceDetails 
            clientData={clientData} 
            preferenceId={selectedPreferenceId}
          />
          <ClientOnboardingQuestions 
            clientData={clientData} 
            modalId={selectedModalId}
          />
        </div>
      )}
    </div>
  );
};

// Sessions Component
// Sessions Component - Updated Calendar Logic
const ClientSessions = ({ clientData }: { clientData: IClientDetailData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<ISessionData | null>(
    null
  );

  // Fetch sessions for the client (both individual and group sessions)
  const fetchSessions = async (): Promise<ISessionResponse> => {
    try {
      // Fetch individual sessions
      const individualResponse = await axiosInstance.get(
        `/api/v1/session?fields=therapist.*,hasTherapistAttended,schedule,client.*&filters=client.id=${clientData.id}&take=0`
      );
      
      // Fetch group sessions where this client is a member
      const groupResponse = await axiosInstance.get(
        `/api/v1/session?fields=therapist.*,hasTherapistAttended,schedule,group.*,groupName&filters=group.id=${clientData.id}&take=0`
      );
      
      // Combine both types of sessions
      const individualSessions = individualResponse.data?.data || [];
      const groupSessions = groupResponse.data?.data || [];
      
      return {
        ...individualResponse.data,
        data: [...individualSessions, ...groupSessions]
      };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { 
        data: [],
        pagination: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
        message: "Error fetching sessions",
        statusCode: 500,
        method: "GET",
        path: "",
        timestamp: new Date().toISOString()
      };
    }
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["client-sessions", clientData.id],
    queryFn: fetchSessions,
  });

  const sessions = sessionsData?.data || [];

  // Group sessions by date using the schedule field
  const sessionsByDate = sessions.reduce(
    (acc: { [key: string]: ISessionData[] }, session) => {
      const date = format(new Date(session.schedule), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    },
    {}
  );

  // Fixed calendar logic
  const getCalendarDays = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Get the start day of the week (0 = Sunday, 1 = Monday, etc.)
    const startDay = monthStart.getDay();

    // Get the end day of the week
    const endDay = monthEnd.getDay();

    // Calculate days from previous month to show
    const prevMonthDays = startDay;
    const prevMonth = new Date(monthStart);
    prevMonth.setDate(prevMonth.getDate() - prevMonthDays);

    // Calculate days from next month to show
    const nextMonthDays = 6 - endDay;
    const nextMonth = new Date(monthEnd);
    nextMonth.setDate(nextMonth.getDate() + 1);

    // Create array of all days to display
    const calendarStart = new Date(prevMonth);
    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(calendarEnd.getDate() + nextMonthDays);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const calendarDays = getCalendarDays(currentDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentDate)) return;

    const dateKey = format(day, "yyyy-MM-dd");
    const daySessions = sessionsByDate[dateKey];
    if (daySessions && daySessions.length > 0) {
      setSelectedSession(daySessions[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Therapy Sessions</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Therapy Sessions Calendar</h3>
        </div>
        <div className="card-body">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <KeenIcon
                icon="calendar"
                className="text-4xl text-gray-400 mb-4"
              />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Sessions Yet
              </h4>
              <p className="text-gray-600">
                This client hasn't scheduled any therapy sessions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="btn btn-sm btn-icon btn-clear btn-primary"
                >
                  <KeenIcon icon="arrow-left" />
                </button>
                <h4 className="text-lg font-semibold text-gray-900">
                  {format(currentDate, "MMMM yyyy")}
                </h4>
                <button
                  onClick={() => navigateMonth("next")}
                  className="btn btn-sm btn-icon btn-clear btn-primary"
                >
                  <KeenIcon icon="arrow-right" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-gray-600"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar days */}
                {calendarDays.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const hasSessions = sessionsByDate[dateKey]?.length > 0;
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        p-2 text-sm rounded-lg transition-colors relative min-h-12
                        ${
                          !isCurrentMonth
                            ? "text-gray-300 bg-gray-50 cursor-default hover:bg-gray-50"
                            : hasSessions
                              ? "bg-primary text-white hover:bg-primary-dark cursor-pointer"
                              : isDayToday
                                ? "bg-gray-100 text-primary font-semibold hover:bg-gray-200 cursor-pointer"
                                : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }
                      `}
                      disabled={!isCurrentMonth}
                    >
                      {format(day, "d")}
                      {hasSessions && isCurrentMonth && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Has Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Session Indicator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded border"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 rounded"></div>
                  <span>Other Month</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Details Card */}
      {selectedSession && (
        <SessionDetailCard
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

// Activity Component
const ClientActivity = ({ clientData }: { clientData: IClientDetailData }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <KeenIcon icon="user" className="text-primary" />
            <div>
              <div className="text-sm font-medium">Account Created</div>
              <div className="text-xs text-gray-600">
                {timeAgo(clientData.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <KeenIcon icon="edit" className="text-warning" />
            <div>
              <div className="text-sm font-medium">Profile Updated</div>
              <div className="text-xs text-gray-600">
                {timeAgo(clientData.updatedAt)}
              </div>
            </div>
          </div>
          {clientData.lastSeenAt && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <KeenIcon icon="eye" className="text-success" />
              <div>
                <div className="text-sm font-medium">Last Seen</div>
                <div className="text-xs text-gray-600">
                  {timeAgo(clientData.lastSeenAt)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Client Preference Details Component (for specific preference)
const ClientPreferenceDetails = ({
  clientData,
  preferenceId,
}: {
  clientData: IClientDetailData;
  preferenceId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch preference details
  const fetchPreference = async (): Promise<IPreferenceData> => {
    const { data } = await axiosInstance.get(
      `/api/v1/preference/${preferenceId}?fields=otherLang,language.*,gender,goal,availability.*,modal.*`
    );
    return data.data;
  };

  const {
    data: preferenceData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client-preference-details", preferenceId],
    queryFn: fetchPreference,
    enabled: !!preferenceId,
  });

  // Hardcoded questions with dynamic answers
  const preferenceQuestions = [
    {
      id: 1,
      question: "What is your preferred therapist gender?",
      answer: preferenceData?.gender || "Not specified",
      icon: "profile-circle",
      color: "text-primary",
    },
    {
      id: 2,
      question: "Do you speak any other languages?",
      answer: preferenceData?.language && preferenceData.language.length > 0
          ? preferenceData.language.map((lang) => lang.name).join(", ") + ( preferenceData.otherLang ? preferenceData.otherLang : "" )
          : "Not specified",
      
      icon: "message-text",
      color: "text-success",
    },
    {
      id: 3,
      question: "What is your therapy goal?",
      answer: preferenceData?.goal || "Not specified",
      icon: "setting",
      color: "text-warning",
    },
    {
      id: 4,
      question: "What level of therapist expertise do you prefer?",
      answer: preferenceData?.level
        ? `${preferenceData.level.type.charAt(0).toUpperCase() + preferenceData.level.type.slice(1)}`
        : "Not specified",
      icon: "medal-star",
      color: "text-info",
    },
    {
      id: 5,
      question: "What is your availability?",
      answer: preferenceData?.availability
        ? preferenceData?.availability && preferenceData.availability.length > 0
          ? preferenceData.availability
              .map((lang) => `${lang.day} ${lang.day_period}`)
              .join(", ")
          : "Not specified"
        : "Not specified",
      icon: "message-text",
      color: "text-success",
    },
  ];

  if (!preferenceId) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Client Preferences</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <KeenIcon
              icon="information"
              className="text-4xl text-gray-400 mb-4"
            />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Preferences Found
            </h4>
            <p className="text-gray-600">
              This client hasn't set up their preferences yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Client Preferences</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Client Preferences</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <KeenIcon
              icon="information-2"
              className="text-4xl text-danger mb-4"
            />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Preferences
            </h4>
            <p className="text-gray-600">
              Could not load preference data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div 
        className="card-header cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <KeenIcon 
              icon={isExpanded ? "down" : "right"} 
              className="text-gray-600"
            />
            <h3 className="card-title">Client Preferences</h3>
            <span className="badge badge-sm badge-primary badge-outline">
              Therapist Matching Criteria
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {isExpanded ? "Click to collapse" : "Click to expand"}
          </span>
        </div>
      </div>
      {isExpanded && (
        <div className="card-body">
          <div className="space-y-2">
            {preferenceQuestions.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  {/* Question Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center ${item.color}`}
                    >
                      <KeenIcon icon={item.icon} className="text-xl" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Question */}
                    <h4 className="text-base font-semibold text-gray-900">
                      {item.question}
                    </h4>

                    {/* Answer */}
                    <div className="p-4 rounded-lg">
                      <p className="text-base text-gray-900 font-medium">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Onboarding Questions Component
const ClientOnboardingQuestions = ({
  clientData,
  modalId,
}: {
  clientData: IClientDetailData;
  modalId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch answers for the client filtered by modal
  const fetchAnswers = async (): Promise<IAnswerResponse> => {
    const url = `/api/v1/answer?fields=question.*,singleOption.*,multiOption.*,text&filters=client.id:=${clientData.id},question.modal.id:=${modalId}&take=0`;
    console.log('Fetching answers with URL:', url);
    console.log('Client ID:', clientData.id, 'Modal ID:', modalId);
    
    const { data } = await axiosInstance.get(url);
    console.log('Answers response:', data);
    console.log('Number of answers returned:', data?.data?.length || 0);
    return data;
  };

  const { data: answersData, isLoading } = useQuery({
    queryKey: ["client-answers", clientData.id, modalId],
    queryFn: fetchAnswers,
  });

  const answers = answersData?.data || [];
  console.log('Filtered answers for modal:', modalId, 'Count:', answers.length);

  // Sort answers by question order
  const sortedAnswers = answers.sort(
    (a, b) => a.question.order - b.question.order
  );

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "single":
        return "badge-primary";
      case "multiple":
        return "badge-warning";
      case "open":
        return "badge-success";
      default:
        return "badge-secondary";
    }
  };

  const renderAnswer = (answer: IAnswerData) => {
    switch (answer.question.type) {
      case "single":
        return (
          <div className="flex items-center gap-2">
            <KeenIcon icon="check-circle" className="text-primary text-sm" />
            <span className="text-sm text-gray-900">
              {answer.singleOption?.text === "Other" && answer.text
                ? answer.text // Show custom text when "Other" is selected
                : answer.singleOption?.text || "No answer"}
            </span>
          </div>
        );
      case "multiple":
        return (
          <div className="space-y-1">
            {answer.multiOption.length > 0 ? (
              <>
                {answer.multiOption.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <KeenIcon
                      icon="check-circle"
                      className="text-warning text-sm"
                    />
                    <span className="text-sm text-gray-900">
                      {option.text === "Other" && answer.text
                        ? answer.text // Show custom text when "Other" is selected
                        : option.text}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <span className="text-sm text-gray-500 italic">
                No options selected
              </span>
            )}
          </div>
        );
      case "open":
        return (
          <div className="p-3 rounded-lg">
            <p className="text-sm text-gray-900">
              {answer.text || (
                <span className="text-gray-500 italic">No text provided</span>
              )}
            </p>
          </div>
        );
      default:
        return (
          <span className="text-sm text-gray-500">Unknown answer type</span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Onboarding Questions</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div 
        className="card-header cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <KeenIcon 
              icon={isExpanded ? "down" : "right"} 
              className="text-gray-600"
            />
            <h3 className="card-title">Onboarding Questions</h3>
            <span className="badge badge-sm badge-outline">
              {answers.length} Question{answers.length !== 1 ? "s" : ""} Answered
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {isExpanded ? "Click to collapse" : "Click to expand"}
          </span>
        </div>
      </div>
      {isExpanded && (
        <div className="card-body">
          {answers.length === 0 ? (
            <div className="text-center py-8">
              <KeenIcon
                icon="questionnaire-tablet"
                className="text-4xl text-gray-400 mb-4"
              />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Questions Answered
              </h4>
              <p className="text-gray-600">
                This client hasn't completed the onboarding questionnaire yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedAnswers.map((answer, index) => (
              <div
                key={answer.id}
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  {/* Question Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-base font-medium text-gray-900 leading-relaxed">
                        {answer.question.text}
                      </h4>
                      <span
                        className={`badge badge-sm ${getQuestionTypeColor(answer.question.type)} badge-outline flex-shrink-0`}
                      >
                        {answer.question.type}
                      </span>
                    </div>

                    {/* Answer */}
                    <div className="ml-0">{renderAnswer(answer)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

// Extended session type to handle group sessions
interface ExtendedSessionData extends ISessionData {
  group?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
    status: string;
    isOnline: boolean;
    profile: string | null;
  }>;
  groupName?: string;
}

// Session Detail Card Component
const SessionDetailCard = ({
  session,
  onClose,
}: {
  session: ISessionData;
  onClose: () => void;
}) => {
  const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;
  
  // Cast to extended type to access group properties
  const extendedSession = session as ExtendedSessionData;

  const therapistImage = session.therapist?.profile
    ? `${BASE_URL}/${session.therapist.profile}`
    : avatar;

  // Check if this is a group session
  const isGroupSession = extendedSession.group && Array.isArray(extendedSession.group);
  
  const clientImage = session.client?.profile
    ? `${BASE_URL}/${session.client.profile}`
    : avatar;

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Session Details</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-icon btn-clear btn-primary"
          >
            <KeenIcon icon="cross" />
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client/Group Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {isGroupSession ? "Group Name" : "Client"}
            </h4>
            
            {isGroupSession ? (
              <div className="p-4 bg-gray-50 h-[130px] rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <KeenIcon icon="users" className="text-primary text-lg" />
                  <h5 className="font-semibold text-gray-900">
                    {extendedSession.groupName || "Group Therapy Session"}
                  </h5>
                </div>
                {/*<p className="text-sm text-gray-600 mb-3">
                  {extendedSession.group?.length || 0} member{(extendedSession.group?.length || 0) !== 1 ? 's' : ''} in this group
                </p>*/}
                {/*<div className="space-y-2">
                  {extendedSession.group?.slice(0, 3).map((member: any, index: number) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                        {member.firstName?.[0] || 'M'}
                      </div>
                      <span className="text-gray-700">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  ))}
                  {(extendedSession.group?.length || 0) > 3 && (
                    <p className="text-xs text-gray-500 ml-8">
                      +{(extendedSession.group?.length || 0) - 3} more members
                    </p>
                  )}
                </div>*/}
              </div>
            ) : session.client ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={clientImage}
                  alt={`${session.client.firstName} ${session.client.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    {session.client.firstName} {session.client.lastName}
                  </h5>
                  <p className="text-sm text-gray-600">
                    @{session.client.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    +251{session.client.phoneNumber}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`badge badge-sm ${
                        session.client.status === "active"
                          ? "badge-success"
                          : session.client.status === "pending"
                            ? "badge-primary"
                            : session.client.status === "inactive"
                              ? "badge-warning"
                              : "badge-danger"
                      } badge-outline`}
                    >
                      {session.client.status}
                    </span>
                    {session.client.isOnline && (
                      <span className="badge badge-sm badge-success badge-outline">
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No client information available</p>
              </div>
            )}
          </div>

          {/* Therapist Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Matched Therapist
            </h4>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <img
                src={therapistImage}
                alt={`${session.therapist.firstName} ${session.therapist.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">
                  {session.therapist.firstName} {session.therapist.lastName}
                </h5>
                <p className="text-sm text-gray-600">
                  {session.therapist.email}
                </p>
                <p className="text-sm text-gray-600">
                  +251{session.therapist.phoneNumber}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`badge badge-sm ${
                      session.therapist.status === "active"
                        ? "badge-success"
                        : session.therapist.status === "pending"
                          ? "badge-primary"
                          : session.therapist.status === "inactive"
                            ? "badge-warning"
                            : "badge-danger"
                    } badge-outline`}
                  >
                    {session.therapist.status}
                  </span>
                  {session.therapist.verified && (
                    <span className="badge badge-sm badge-primary badge-outline">
                      <KeenIcon icon="verify" className="text-xs me-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Session Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Session Status
              </label>
              <span className="badge badge-sm badge-primary badge-outline w-fit">
                {session.hasTherapistAttended ? "Attended" : "Not Attended"}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Scheduled Date
              </label>
              <p className="text-sm text-gray-900">
                {format(new Date(session.schedule), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Scheduled Time
              </label>
              <p className="text-sm text-gray-900">
                {format(new Date(session.schedule), "HH:mm")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Therapist Last Seen
              </label>
              <p className="text-sm text-gray-900">
                {timeAgo(session.therapist.lastSeenAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ClientDetailContent };
