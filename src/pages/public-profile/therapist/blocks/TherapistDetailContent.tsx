import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ITherapistDetailData,
  ITherapistRating,
  IMatchResponse,
  IMatchData,
} from "@/types/therapist";
import { ISessionData, ISessionResponse } from "@/types/session";
import { KeenIcon, DataGrid, DataGridColumnHeader } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useQuery, useMutation, useQueryClient } from "react-query";
import axiosInstance from "@/auth/_helpers";
import { toast } from "sonner";
import avatar from "@/media/avatars/blank.png";
import { LicenseInfo } from "./GeneralInfo";
//gov_id,licence,degree
const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface TherapistDetailContentProps {
  therapistData: ITherapistDetailData;
}

// Add this query function to fetch license data in the parent component
const fetchTherapistLicense = async (therapistId: string) => {
  const { data } = await axiosInstance.get(
    `/api/v1/license?filters=therapist.id=${therapistId}`
  );
  return data;
};

const timeAgo = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return formatDistanceToNow(date, { addSuffix: true });
};

const TherapistDetailContent = ({
  therapistData,
}: TherapistDetailContentProps) => {
  const { data: licenseData, isLoading: licenseLoading } = useQuery({
    queryKey: ["therapist-license-details", therapistData.id],
    queryFn: () => fetchTherapistLicense(therapistData.id),
  });

  // Get the first license record
  const licenseRecord = licenseData?.data?.[0];

  return (
    <div className="mb-4">
      {/* Profile Header - Full Width (Overlapping cover) */}
      <div className="translate-y-[-70px]">
        <TherapistProfileHeader therapistData={therapistData} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5 -mt-8">
        {/* Full Width Stats */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <TherapistStatsOverview therapistData={therapistData} />
          <TherapistWeeklyStats therapistData={therapistData} />
        </div>

        {/* Left Column - General Info */}
        <div className="col-span-1 w-full">
          <div className="sticky top-5 space-y-5">
            <TherapistGeneralInfo therapistData={therapistData} />
            
            {/* License Information */}
            {licenseLoading ? (
              <div className="card">
                <div className="card-body">
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">
                      Loading documents...
                    </span>
                  </div>
                </div>
              </div>
            ) : licenseRecord ? (
              <LicenseInfo data={licenseRecord} layout="horizontal" />
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="text-center py-4 text-gray-600">
                    No professional documents found
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="col-span-1 lg:col-span-2">
          <div className="card border-2 border-gray-200">
            <div className="card-body p-6">
              <TherapistTabbedContent therapistData={therapistData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function removeTherapy(text: string): string {
  return text.replace(/therapy/gi, "");
}

// Therapist Stats Interface
interface ITherapistStats {
  period: {
    start: string;
    end: string;
  };
  totalSessions: number;
  totalUsers: number;
  totalRevenue: string; // Changed to string as backend returns "N/A" or string values
  totalHours: number;
  sessionsOverTime: Array<{ date: string; count: string }>;
  usersTreatedOverTime: Array<{ date: string; treatedUsers: string }>;
  revenueOverTime: Array<{ date: string; revenueOverTime: string }>; // Changed property name and type
  therapistWorkload: Array<{
    therapistId: string;
    therapistName: string;
    sessionCount: string;
    revenue: string;
  }>;
  therapistHoursPerWeek: Array<{
    year: number;
    week: number;
    totalHours: string;
  }>;
}

// Profile Header Component
const TherapistProfileHeader = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const profileImage = therapistData.profile
    ? `${BASE_URL}/${therapistData.profile}`
    : avatar;

  return (
    <div className="relative group mb-6">
      {/* Animated White Glow Background */}
      {/*<div className="absolute -inset-0.5 bg-white rounded-2xl opacity-50 blur-lg transition duration-1000 group-hover:opacity-100 group-hover:duration-200 shadow-[0_0_30px_rgba(255,255,255,0.8)]"></div>*/}
      
      {/* Main Card Content */}
      <div className="relative card bg-transparent rounded-xl overflow-hidden transition-transform duration-300">
        
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
                  alt={`${therapistData.firstName} ${therapistData.lastName}`}
                  className="rounded-full size-32 object-cover"
                />
              </div>

              {/* Status Indicator - Heartbeat */}
              <div className="absolute bottom-2 right-2">
                <span className="relative flex h-6 w-6">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    therapistData.status === "active" ? "bg-success" : "bg-danger"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-6 w-6 border-2 border-white shadow-sm ${
                     therapistData.status === "active" ? "bg-success" : "bg-danger"
                  }`}></span>
                </span>
              </div>
            </div>

            {/* Name Section */}
            <div className="mb-6 relative animate-fade-in-up">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {therapistData.firstName} {therapistData.lastName}
                </h2>
                {(therapistData.isEmailAuthenticated ||
                  therapistData.isPhoneNumberAuthenticated) && (
                  <div className="p-1 bg-blue-50 rounded-full text-blue-500 animate-bounce duration-[2000ms]">
                     <KeenIcon icon="verify" className="text-xl" />
                  </div>
                )}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Professional Therapist
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              </div>
            </div>

            {/* Info Pills - Animated */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 group/pill">
                <div className="cursor-pointer bg-gray-50 rounded-full text-gray-500 group-hover/pill:text-gray-900 group-hover/pill:bg-gray-100 transition-colors">
                  <KeenIcon icon="sms" className="text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover/pill:text-gray-900">{therapistData.email}</span>
              </div>
              
              <div className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 group/pill">
                 <div className="cursor-pointer bg-gray-50 rounded-full text-gray-500 group-hover/pill:text-gray-900 group-hover/pill:bg-gray-100 transition-colors">
                  <KeenIcon icon="phone" className="text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover/pill:text-gray-900">+251{therapistData.phoneNumber}</span>
              </div>
            </div>

            {/* Status Badge - Tech Style */}
            <div className="flex justify-center cursor-pointer">
              <div className={`
                px-6 py-2 rounded-full border shadow-sm font-mono text-xs tracking-wider uppercase flex items-center gap-3 transition-all duration-300 hover:shadow-md
                ${therapistData.status === "active" 
                  ? "bg-white border-green-200 text-green-700" 
                  : "bg-white border-gray-200 text-gray-500"}
              `}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    therapistData.status === "active" ? "bg-green-500" : "bg-gray-400"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    therapistData.status === "active" ? "bg-green-500" : "bg-gray-400"
                  }`}></span>
                </span>
                Account Status: {therapistData.status}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Overview Component
const TherapistStatsOverview = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  // Fetch therapist statistics
  const fetchTherapistStats = async (): Promise<ITherapistStats> => {
    const { data } = await axiosInstance.get(
      `/api/v1/therapist/stats?mockId=${therapistData.id}`
    );
    return data.data;
  };

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["therapist-stats-all", therapistData.id],
    queryFn: fetchTherapistStats,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5 mb-6">
      {/* Sessions Card */}
      <div className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white">
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <KeenIcon icon="calendar-tick" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Total Sessions</div>
              <div className="text-xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  statsData?.totalSessions || 0
                )}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </div>
      </div>

      {/* Hours Card */}
      <div className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white">
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/10 text-success">
              <KeenIcon icon="time" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Total Hours</div>
              <div className="text-xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-success"></div>
                ) : (
                  statsData?.totalHours || 0
                )}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-success w-full"></div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white">
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
              <KeenIcon icon="wallet" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
              <div className="text-xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning"></div>
                ) : (
                  statsData?.totalRevenue || "0 ETB"
                )}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-warning w-full"></div>
          </div>
        </div>
      </div>

      {/* Users Card */}
      <div className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white">
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-info/10 text-info">
              <KeenIcon icon="people" className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Total Clients</div>
              <div className="text-xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info"></div>
                ) : (
                  statsData?.totalUsers || 0
                )}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-info w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weekly Stats Component
const TherapistWeeklyStats = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const queryClient = useQueryClient();

  // Calculate week dates (Monday to Sunday)
  const getWeekDates = () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    const day = startDate.getDay();
    const diff = day === 0 ? 6 : day - 1; // Calculate days to subtract to get to Monday
    startDate.setDate(startDate.getDate() - diff);
    startDate.setHours(0, 0, 0, 0);
    
    // Set end date to Sunday of the current week
    const sundayDate = new Date(startDate);
    sundayDate.setDate(startDate.getDate() + 6);
    sundayDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate: sundayDate };
  };

  const { startDate: weekStart, endDate: weekEnd } = getWeekDates();

  // Fetch therapist statistics - current week (starting Monday)
  const fetchTherapistStatsWeek = async (): Promise<ITherapistStats> => {
    const endDate = new Date(); // Today
    const startDate = new Date(endDate);
    const day = startDate.getDay();
    const diff = day === 0 ? 6 : day - 1; // Calculate days to subtract to get to Monday
    startDate.setDate(startDate.getDate() - diff);
    startDate.setHours(0, 0, 0, 0); // Set to start of the day

    const formatDateTime = (date: Date) => {
      return date.toISOString();
    };

    const { data } = await axiosInstance.get(
      `/api/v1/therapist/stats?startDate=${formatDateTime(startDate)}&endDate=${formatDateTime(endDate)}&mockId=${therapistData.id}`
    );

    console.log(formatDateTime(startDate), formatDateTime(endDate), "Therapist stat date");
    return data.data;
  };

  const { data: statsWeekData, isLoading: statsWeekLoading } = useQuery({
    queryKey: ["therapist-stats-week", therapistData.id],
    queryFn: fetchTherapistStatsWeek,
  });

  // Mark as Paid mutation
  const { mutate: markAsPaid, isLoading: isMarkingPaid } = useMutation({
    mutationFn: async () => {
      const totalRevenue = parseFloat(statsWeekData?.revenueOverTime?.[0]?.revenueOverTime || "0");
      
      const payload = {
        therapist: therapistData.id,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        totalRevenue: totalRevenue,
        sessionIds: [], // Empty array as per user's instruction
      };

      const { data } = await axiosInstance.post('/api/v1/therapist-payment-period', payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully!");
      queryClient.invalidateQueries(["therapist-stats-week", therapistData.id]);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error.message || "Failed to record payment";
      toast.error(errorMessage);
    },
  });

  // Check if today is Sunday
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="card bg-gray-50 border border-gray-200">
      <div className="card-header border-b border-gray-200 flex justify-between items-center">
        <h3 className="card-title text-gray-900">Last 7 Days Performance</h3>
        <button
          className="btn btn-success btn-sm flex items-center gap-2"
          onClick={() => markAsPaid()}
          disabled={isMarkingPaid || statsWeekLoading}
        >
          <KeenIcon icon="dollar" className="text-sm" />
          {isMarkingPaid ? "Processing..." : "Mark as Paid"}
        </button>
      </div>
      <div className="card-body p-6">
        {/* Week Date Range Display */}
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-600">
            Week: {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weekly Sessions */}
          <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <KeenIcon icon="calendar-tick" className="text-xl" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {statsWeekLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
              ) : (
                statsWeekData?.sessionsOverTime?.reduce(
                  (total: number, session: any) => {
                    return total + (parseInt(session.count) || 0);
                  },
                  0
                ) || 0
              )}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sessions</div>
          </div>

          {/* Weekly Hours */}
          <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-3 text-success">
              <KeenIcon icon="time" className="text-xl" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {statsWeekLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-success mx-auto"></div>
              ) : (
                statsWeekData?.therapistHoursPerWeek
                  ?.reduce((total: number, week: any) => {
                    return total + (parseFloat(week.totalHours) || 0);
                  }, 0)
                  .toFixed(2) || 0
              )}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hours</div>
          </div>

          {/* Weekly Revenue */}
          <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mb-3 text-warning">
              <KeenIcon icon="wallet" className="text-xl" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {statsWeekLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-warning mx-auto"></div>
              ) : (
                statsWeekData?.revenueOverTime?.[0]?.revenueOverTime || "0"
              )}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (ETB)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Info Component
// General Info Component
const TherapistGeneralInfo = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  console.log(therapistData, "The therapist Data");

  const fetchTherapistLanguages = async (therapistId: string) => {
    const { data } = await axiosInstance.get(
      `/api/v1/therapist/${therapistId}?fields=language.*`
    );

    console.log("Language Data:", data);
    return data;
  };

  // Fetch therapist languages
  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ["therapist-languages", therapistData.id],
    queryFn: () => fetchTherapistLanguages(therapistData.id),
  });

  const languages = languagesData?.data?.language || [];

  const items = [
    { label: "Phone:", info: `+251 ${therapistData.phoneNumber}` },
    { label: "Email:", info: therapistData.email },
    {
      label: "Status:",
      info: `<span class="badge badge-sm ${
        therapistData.status === "suspended"
          ? "badge-danger"
          : therapistData.status === "inactive"
            ? "badge-warning"
            : therapistData.status === "active"
              ? "badge-success"
              : "badge-primary"
      } badge-outline">${therapistData.status}</span>`,
    },
    { label: "Gender:", info: therapistData.gender },
    {
      label: "Weekly Hours:",
      info: `${therapistData.hoursDedicatedPerWeek}`,
    },
    { label: "Created at:", info: timeAgo(therapistData.createdAt) },
  ];

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">General Info</h3>
      </div>
      <div className="card-body pt-3.5">
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

        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-100">
          {/* Languages Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Languages</h4>
            {languagesLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-600">
                  Loading...
                </span>
              </div>
            ) : languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languages.map((language: any) => (
                  <span
                    key={language.id}
                    className="badge badge-sm badge-primary badge-outline"
                  >
                    {language.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No languages specified</p>
            )}
          </div>

          {/* Bio Section */}
          {therapistData.bio && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{therapistData.bio}</p>
            </div>
          )}

          {/* Expertise Section */}
          {therapistData.expertise && therapistData.expertise.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {therapistData.expertise.map((exp) => (
                  <span
                    key={exp.id}
                    className="badge badge-sm badge-outline badge-success"
                  >
                    {exp.expertise}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bank Information Section */}
          {therapistData.therapistBank &&
            therapistData.therapistBank.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Bank Details
                </h4>
                <div className="space-y-2">
                  {therapistData.therapistBank.map((bank) => (
                    <div
                      key={bank.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">Account</span>
                           <span className="text-sm font-medium text-gray-900 font-mono">
                            {bank.accountNumber}
                          </span>
                        </div>
                        {bank.branch && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Branch</span>
                            <span className="text-sm text-gray-700">{bank.branch}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Account Info Component
const TherapistAccountInfo = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const items = [
    { label: "User ID:", info: therapistData.id },
    {
      label: "Date of Birth:",
      info: therapistData.dob
        ? (() => {
            const date = new Date(therapistData.dob);
            return isNaN(date.getTime())
              ? "Invalid date"
              : format(date, "MMM dd, yyyy");
          })()
        : "N/A",
    },
    {
      label: "Email Verified:",
      info: therapistData.isEmailAuthenticated ? "✅ Yes" : "❌ No",
    },
    {
      label: "Phone Verified:",
      info: therapistData.isPhoneNumberAuthenticated ? "✅ Yes" : "❌ No",
    },
    {
      label: "Visibility:",
      info: therapistData.isVisible ? "Visible" : "Hidden",
    },
    { label: "In Group:", info: therapistData.isInGroup ? "Yes" : "No" },
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

// Tabbed Content Component
const TherapistTabbedContent = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const [activeView, setActiveView] = useState<
    "sessions" | "activity" | "ratings" | "clients"
  >("sessions");

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      {/* Tab Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          className={`btn btn-sm ${activeView === "clients" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("clients")}
        >
          <KeenIcon icon="people" /> Client List
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeView === "sessions" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("sessions")}
        >
          <KeenIcon icon="calendar" /> Session Calendar
        </button>
        {/*<button
          type="button"
          className={`btn btn-sm ${activeView === "activity" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("activity")}
        >
          <KeenIcon icon="chart-line" /> Activity Log
        </button>*/}
        <button
          type="button"
          className={`btn btn-sm ${activeView === "ratings" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("ratings")}
        >
          <KeenIcon icon="star" /> Client Ratings
        </button>
      </div>

      {/* Tab Content */}
      {activeView === "sessions" && (
        <TherapistSessions therapistData={therapistData} />
      )}
      {activeView === "activity" && (
        <TherapistActivity therapistData={therapistData} />
      )}
      {activeView === "ratings" && (
        <TherapistRatings therapistData={therapistData} />
      )}
      {activeView === "clients" && (
        <TherapistClients therapistData={therapistData} />
      )}
    </div>
  );
};

// Sessions Component
// Sessions Component - Fixed Calendar Logic
const TherapistSessions = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSessions, setSelectedSessions] = useState<ISessionData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch sessions for the therapist
  const fetchSessions = async (): Promise<ISessionResponse> => {
    const { data } = await axiosInstance.get(
      `/api/v1/session?fields=client.*,hasTherapistAttended,schedule,groupName&filters=therapist.id=${therapistData.id}&take=0`
    );
    return data;
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["therapist-sessions", therapistData.id],
    queryFn: fetchSessions,
  });

  const sessions = sessionsData?.data || [];

  // Group sessions by date using the schedule field
  const sessionsByDate = sessions.reduce(
    (acc: { [key: string]: ISessionData[] }, session) => {
      const date = session.schedule.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    },
    {}
  );

  console.log(sessionsByDate, "Sessions by date");

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
      setSelectedSessions(daySessions);
      setSelectedDate(day);
    } else {
      setSelectedSessions([]);
      setSelectedDate(null);
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
                This therapist hasn't scheduled any therapy sessions.
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
                  const daySessions = sessionsByDate[dateKey];
                  const hasSessions = daySessions && daySessions.length > 0;
                  const sessionCount = daySessions?.length || 0;
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        p-2 text-sm rounded-lg transition-colors relative min-h-12 flex flex-col items-center justify-center
                        ${
                          !isCurrentMonth
                            ? "text-gray-300 bg-gray-50 cursor-default hover:bg-gray-50"
                            : isSelected
                              ? "bg-primary text-white ring-2 ring-primary-dark cursor-pointer"
                              : hasSessions
                                ? "bg-primary text-white hover:bg-primary-dark cursor-pointer"
                                : isDayToday
                                  ? "bg-gray-100 text-primary font-semibold hover:bg-gray-200 cursor-pointer"
                                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }
                      `}
                      disabled={!isCurrentMonth}
                    >
                      <span>{format(day, "d")}</span>
                      {hasSessions && isCurrentMonth && sessionCount > 0 && (
                        <span className="text-[10px] mt-0.5 font-semibold">
                          {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
                        </span>
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
      {selectedSessions.length > 0 && selectedDate && (
        <TherapistSessionsDetailCard
          sessions={selectedSessions}
          selectedDate={selectedDate}
          onClose={() => {
            setSelectedSessions([]);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};
// Activity Component
const TherapistActivity = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
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
                {timeAgo(therapistData.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <KeenIcon icon="edit" className="text-warning" />
            <div>
              <div className="text-sm font-medium">Profile Updated</div>
              <div className="text-xs text-gray-600">
                {timeAgo(therapistData.updatedAt)}
              </div>
            </div>
          </div>
          {therapistData.lastSeenAt && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <KeenIcon icon="eye" className="text-success" />
              <div>
                <div className="text-sm font-medium">Last Seen</div>
                <div className="text-xs text-gray-600">
                  {timeAgo(therapistData.lastSeenAt)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Ratings Component
const TherapistRatings = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const ratings = therapistData.rating || [];

  const calculateAverageRating = () => {
    if (ratings.length === 0) return "0.0";
    const sum = ratings.reduce(
      (acc: number, rating: ITherapistRating) => acc + rating.value,
      0
    );
    return (sum / ratings.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating: ITherapistRating) => {
      distribution[rating.value as keyof typeof distribution]++;
    });
    return distribution;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <KeenIcon
        key={index}
        icon="star"
        className={`text-sm ${index < rating ? "text-warning" : "text-gray-300"}`}
      />
    ));
  };

  const distribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Therapist Ratings</h3>
      </div>
      <div className="card-body">
        {ratings.length === 0 ? (
          <div className="text-center py-8">
            <KeenIcon icon="star" className="text-4xl text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Ratings Yet
            </h4>
            <p className="text-gray-600">
              This therapist hasn't received any ratings.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {averageRating}
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(parseFloat(averageRating)))}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Based on {ratings.length} rating
                  {ratings.length !== 1 ? "s" : ""}
                </div>
                {Object.entries(distribution)
                  .reverse()
                  .map(([star, count]) => (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-sm w-2">{star}</span>
                      <KeenIcon icon="star" className="text-warning text-xs" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-warning rounded-full h-2"
                          style={{
                            width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ratings Table */}
            <RatingsTable
              ratings={ratings}
              renderStars={renderStars}
              timeAgo={timeAgo}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Rating interface with client data
interface IEnhancedRating extends ITherapistRating {
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: number;
    email: string;
    username: string;
  };
}

// Ratings Table Component with Pagination
const RatingsTable = ({
  ratings,
  renderStars,
  timeAgo,
}: {
  ratings: ITherapistRating[];
  renderStars: (rating: number) => JSX.Element[];
  timeAgo: (dateString: string | null) => string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [enhancedRatings, setEnhancedRatings] = useState<IEnhancedRating[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  // Fetch enhanced ratings with client data
  useEffect(() => {
    const fetchEnhancedRatings = async () => {
      setLoading(true);
      try {
        const enhancedData = await Promise.all(
          ratings.map(async (rating) => {
            try {
              const { data } = await axiosInstance.get(
                `/api/v1/ratings/${rating.id}?fields=client.*`
              );
              return {
                ...rating,
                client: data.data.client,
              };
            } catch (error) {
              console.error(`Error fetching rating ${rating.id}:`, error);
              return rating;
            }
          })
        );
        setEnhancedRatings(enhancedData);
      } catch (error) {
        console.error("Error fetching enhanced ratings:", error);
        setEnhancedRatings(ratings);
      } finally {
        setLoading(false);
      }
    };

    if (ratings.length > 0) {
      fetchEnhancedRatings();
    } else {
      setEnhancedRatings([]);
      setLoading(false);
    }
  }, [ratings]);

  const totalPages = Math.ceil(enhancedRatings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRatings = enhancedRatings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Individual Ratings</h4>
        <span className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, enhancedRatings.length)}{" "}
          of {enhancedRatings.length} ratings
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">
            Loading client information...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Client
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Rating
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Comment
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRatings.map((rating, index) => (
                <tr
                  key={rating.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          rating.client?.avatar
                            ? `${BASE_URL}/avatars/${rating.client.avatar}.png`
                            : avatar
                        }
                        alt={
                          rating.client
                            ? `${rating.client.firstName} ${rating.client.lastName}`
                            : "Client"
                        }
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {rating.client
                            ? `${rating.client.firstName} ${rating.client.lastName}`
                            : "Unknown Client"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {rating.client?.username
                            ? `@${rating.client.username}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(rating.value)}</div>
                      <span className="text-sm font-medium">
                        {rating.value}/5
                      </span>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="text-sm text-gray-700 max-w-xs">
                      {rating.comment || (
                        <span className="text-gray-400 italic">No comment</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="text-sm text-gray-500">
                      {timeAgo(rating.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && renderPagination()}
    </div>
  );
};

// Therapist Sessions Detail Card Component - Shows multiple sessions in a scrollable table
const TherapistSessionsDetailCard = ({
  sessions,
  selectedDate,
  onClose,
}: {
  sessions: ISessionData[];
  selectedDate: Date;
  onClose: () => void;
}) => {
  const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  const sortedSessions = sessions.sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime());
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = sortedSessions.slice(startIndex, endIndex);

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title">
            Sessions on {format(selectedDate, "MMMM dd, yyyy")} ({sessions.length} {sessions.length === 1 ? 'session' : 'sessions'})
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-icon btn-clear btn-primary"
          >
            <KeenIcon icon="cross" />
          </button>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <table className="table table-auto table-border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left min-w-20">Time</th>
                <th className="text-left min-w-48">Therapist</th>
                <th className="text-left min-w-48">Client</th>
                <th className="text-left min-w-32">Status</th>
                <th className="text-left min-w-32">Client Status</th>
              </tr>
            </thead>
            <tbody>
              {currentSessions.map((session, index) => {
                  const therapistImage = session.therapist?.profile
                    ? `${BASE_URL}/${session.therapist.profile}`
                    : avatar;

                  const clientImage = session.client?.profile
                    ? `${BASE_URL}/${session.client.profile}`
                    : avatar;

                  return (
                    <tr key={session.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {/* Time Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <KeenIcon icon="time" className="text-primary text-lg relative z-0" />
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {format(new Date(session.schedule), "HH:mm")}
                            </div>
                            <div className="text-xs text-gray-500">
                              Session {startIndex + index + 1}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Therapist Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={therapistImage}
                            alt={`${session.therapist?.firstName || 'Unknown'} ${session.therapist?.lastName || 'Therapist'}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {session.therapist?.firstName || 'Unknown'} {session.therapist?.lastName || 'Therapist'}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {session.therapist?.email || 'No email'}
                            </div>
                            <div className="text-xs text-gray-500">
                              +251{session.therapist?.phoneNumber || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Client Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={clientImage}
                            alt={`${session.client?.firstName || 'Unknown'} ${session.groupName || 'Client'}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            {
                              session.group ? session.groupName : (
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 truncate">
                                      {session.client?.firstName || 'Unknown'} {session.client?.lastName || 'Client'}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                      @{session.client?.username || 'no-username'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      +251{session.client?.phoneNumber || 'No phone'}
                                    </div>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </td>

                      {/* Session Status Column */}
                      <td className="py-4 px-4">
                        <span className={`badge ${session.hasTherapistAttended ? 'badge-success' : 'badge-warning'} badge-outline`}>
                          {session.hasTherapistAttended ? "Attended" : "Not Attended"}
                        </span>
                      </td>

                      {/* Client Status Column */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`badge badge-sm ${
                              session.client?.status === "active"
                                ? "badge-success"
                                : session.client?.status === "pending"
                                  ? "badge-primary"
                                  : session.client?.status === "inactive"
                                    ? "badge-warning"
                                    : "badge-danger"
                            } badge-outline`}
                          >
                            {session.client?.status || 'unknown'}
                          </span>
                          {session.client?.isOnline && (
                            <span className="badge badge-xs badge-success badge-outline">
                              Online
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="card-footer">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 mr-2">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedSessions.length)} of {sortedSessions.length} sessions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeenIcon icon="left" />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <KeenIcon icon="right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clients Component
const TherapistClients = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const [filterInput, setFilterInput] = useState("all");
  const [totalItems, setTotalItems] = useState(0);
  const [itemsOnPage, setItemsOnPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch clients with pagination and search
  async function getTherapistClients({
    pageIndex,
    pageSize,
    sort,
  }: {
    pageIndex: number;
    pageSize: number;
    sort: any;
  }) {
    const statusFilter =
      filterInput && filterInput !== "all"
        ? `client.status:=${filterInput}`
        : "";
    const filters = statusFilter ? `&filters=${statusFilter}` : "";
    const url = `/api/v1/match?fields=client.*&filters=accepted.id=${therapistData.id}${statusFilter ? `,${statusFilter}` : ""}&take=${pageSize}&page=${pageIndex}`;

    const { data } = await axiosInstance.get(url);

    // Calculate items on current page
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

  // Search clients
  async function searchTherapistClients({
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
    const statusFilter =
      filterInput && filterInput !== "all"
        ? `,client.status:=${filterInput}`
        : "";

    // Handle search input - API supports comma separation
    const searchTerm = search.trim();
    let searchFilters = `accepted.id=${therapistData.id}`;

    if (searchTerm) {
      // Check if search contains space (likely full name)
      if (searchTerm.includes(" ")) {
        const searchParts = searchTerm.split(/\s+/);
        // Search for first name and last name matching the parts
        //searchFilters += `,client.firstName=${searchParts[0]},client.lastName=${searchParts[1]}`;
        searchFilters += `,client.firstName=${searchParts[0]},client.lastName=${searchParts[1]}`;
      } else {
        // Single word - search both firstName and lastName
        searchFilters += `,client.firstName=${searchTerm}`;
      }
    }

    const url = `/api/v1/match?fields=client.*&filters=${searchFilters}${statusFilter}&take=${pageSize}&page=${pageIndex}`;

    const { data } = await axiosInstance.get(url);

    // Calculate items on current page
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

  // Revalidate clients for filtering
  async function revalidateTherapistClients() {
    const statusFilter =
      filterInput && filterInput !== "all"
        ? `,client.status:=${filterInput}`
        : "";

    // Handle search input using debounced value
    let searchFilters = `accepted.id=${therapistData.id}`;
    if (debouncedSearchInput && debouncedSearchInput.trim()) {
      const searchTerm = debouncedSearchInput.trim();
      // Check if search contains space (likely full name)
      if (searchTerm.includes(" ")) {
        const searchParts = searchTerm.split(/\s+/);
        // Search for first name and last name matching the parts
        searchFilters += `,client.firstName=${searchParts[0]},client.lastName=${searchParts[1]}`;
      } else {
        // Single word - search firstName
        searchFilters += `,client.firstName=${searchTerm}`;
      }
    }

    const url = `/api/v1/match?fields=client.*&filters=${searchFilters}${statusFilter}`;

    const { data } = await axiosInstance.get(url);
    setTotalItems(data.pagination?.totalItems || data.data.length);
    return data;
  }

  // Use query for revalidation when filters change
  const { data: clientsData } = useQuery({
    queryKey: [
      "therapist-clients",
      therapistData.id,
      filterInput,
      debouncedSearchInput,
    ],
    queryFn: revalidateTherapistClients,
  });

  // Define columns for DataGrid
  const columns = useMemo<ColumnDef<IMatchData>[]>(
    () => [
      {
        accessorFn: (row) => row.client.firstName,
        id: "client",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Client"
            column={column}
            className="min-w-[200px]"
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const client = row.original.client;
          const clientImage = client.profile
            ? `${BASE_URL}/${client.profile}`
            : avatar;

          return (
            <div className="flex items-center gap-3">
              <img
                src={clientImage}
                alt={`${client.firstName} ${client.lastName}`}
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {client.firstName} {client.lastName}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>@{client.username}</span>
                  <div className="flex items-center gap-1">
                    <KeenIcon icon="email" className="text-xs" />
                    <span>{client.email}</span>
                    {client.isEmailAuthenticated && (
                      <KeenIcon
                        icon="verify"
                        className="text-primary text-xs"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <KeenIcon icon="phone" className="text-xs" />
                    <span>+251{client.phoneNumber}</span>
                    {client.isPhoneNumberAuthenticated && (
                      <KeenIcon
                        icon="verify"
                        className="text-primary text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        },
        meta: {
          className: "min-w-[400px]",
        },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original.client;
          return (
            <span
              className={`badge badge-sm ${
                client.status === "active"
                  ? "badge-success"
                  : client.status === "pending"
                    ? "badge-primary"
                    : client.status === "inactive"
                      ? "badge-warning"
                      : "badge-danger"
              } badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  client.status === "active"
                    ? "bg-success"
                    : client.status === "pending"
                      ? "bg-primary"
                      : client.status === "inactive"
                        ? "bg-warning"
                        : "bg-danger"
                } me-1.5`}
              ></span>
              {client.status}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        id: "onlineStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Online Status" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original.client;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  client.isOnline ? "bg-success" : "bg-gray-400"
                }`}
              ></span>
              <span className="text-sm text-gray-600">
                {client.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
    ],
    []
  );

  const data: IMatchData[] = useMemo(
    () => clientsData?.data ?? [],
    [clientsData]
  );

  // Toolbar - memoized with React.memo to prevent re-renders
  const Toolbar = useMemo(
    () => (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} clients
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 w-64"
                size="sm"
              />
            </div>

            <Select
              value={filterInput}
              onValueChange={(value) => setFilterInput(value)}
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

            <button className="btn btn-sm btn-outline btn-primary">
              <KeenIcon icon="setting-4" /> Filters
            </button>
          </div>
        </div>
      </div>
    ),
    [itemsOnPage, totalItems, searchInput, filterInput]
  );

  return (
    <DataGrid
      onFetchData={getTherapistClients}
      onSearchData={searchTherapistClients}
      data={data}
      columns={columns}
      filterInput={filterInput}
      searchInput={debouncedSearchInput}
      rowSelection={false}
      pagination={{ size: 5 }}
      sorting={[{ id: "client", desc: false }]}
      toolbar={Toolbar}
      layout={{ card: true }}
    />
  );
};

export { TherapistDetailContent };
