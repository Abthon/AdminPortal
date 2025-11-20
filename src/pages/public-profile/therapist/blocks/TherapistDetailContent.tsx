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
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "MMM dd, yyyy 'at' HH:mm");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success";
      case "pending":
        return "text-primary";
      case "inactive":
        return "text-warning";
      case "suspended":
        return "text-danger";
      default:
        return "text-gray-600";
    }
  };

  const profileImage = therapistData.profile
    ? `${BASE_URL}/${therapistData.profile}`
    : avatar;

  const { data: licenseData, isLoading: licenseLoading } = useQuery({
    queryKey: ["therapist-license-details", therapistData.id],
    queryFn: () => fetchTherapistLicense(therapistData.id),
  });

  // Get the first license record (assuming one therapist has one license record)
  const licenseRecord = licenseData?.data?.[0];
  console.log(therapistData, "gow gow therapist");

  return (
    <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5 mb-4">
      {/* Statistics Header - Full Width */}
      <div className="col-span-1 lg:col-span-3 translate-y-[-70px]">
        <TherapistStatistics therapistData={therapistData} />
      </div>

      {/* Left Column - General Info */}
      <div className="col-span-1 w-full">
        <div className="w-full">
          <TherapistGeneralInfo therapistData={therapistData} />

          {/* License Information */}
          {licenseLoading ? (
            <div className="card mt-4">
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
            <div className="card mt-4">
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
      <div className="col-span-2 border-2 rounded-lg border-text-muted">
        <div className="flex flex-col gap-5 lg:gap-7.5 p-4">
          <TherapistTabbedContent therapistData={therapistData} />
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

// Statistics Component
const TherapistStatistics = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const profileImage = therapistData.profile
    ? `${BASE_URL}/${therapistData.profile}`
    : avatar;

  // Fetch therapist license data first, then get modal info
  const fetchTherapistLicense = async () => {
    const { data } = await axiosInstance.get(
      `/api/v1/license?filters=therapist.id=${therapistData.id}`
    );
    return data;
  };

  const { data: licenseData, isLoading: licenseLoading } = useQuery({
    queryKey: ["therapist-license", therapistData.id],
    queryFn: fetchTherapistLicense,
  });

  // Fetch modal data for each license
  const fetchLicenseModals = async () => {
    if (!licenseData?.data || licenseData.data.length === 0) return [];

    const modalPromises = licenseData.data.map(async (license: any) => {
      try {
        const { data } = await axiosInstance.get(
          `/api/v1/license/${license.id}?fields=modal.*`
        );
        return data?.data?.modal?.name || null;
      } catch (error) {
        console.error("Error fetching license modal:", error);
        return null;
      }
    });

    const modalNames = await Promise.all(modalPromises);
    return modalNames.filter((name) => name !== null);
  };

  const { data: modalNames = [], isLoading: modalLoading } = useQuery({
    queryKey: ["therapist-license-modals", therapistData.id, licenseData],
    queryFn: fetchLicenseModals,
    enabled: !!licenseData?.data && licenseData.data.length > 0,
  });

  const uniqueModalNames = [...new Set(modalNames)]; // Remove duplicates
  const displayModal =
    uniqueModalNames.length > 0 ? uniqueModalNames.join(", ") : "N/A";

  // Fetch therapist statistics - all time
  const fetchTherapistStats = async (): Promise<ITherapistStats> => {
    const { data } = await axiosInstance.get(
      `/api/v1/therapist/stats?mockId=${therapistData.id}`
    );
    console.log(data.data, "Total revenue data");
    return data.data;
  };

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["therapist-stats-all", therapistData.id],
    queryFn: fetchTherapistStats,
  });

  // Fetch therapist statistics - last 7 days
  // Fetch therapist statistics - last 7 days (fixed date calculation)
  // Fetch therapist statistics - last 7 days (past week)
  const fetchTherapistStatsWeek = async (): Promise<ITherapistStats> => {
    const endDate = new Date(); // Today
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 days ago

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    const { data } = await axiosInstance.get(
      `/api/v1/therapist/stats?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&mockId=${therapistData.id}`
    );

    console.log(data.data, "Last 7 days data");
    return data.data;
  };

  const { data: statsWeekData, isLoading: statsWeekLoading } = useQuery({
    queryKey: ["therapist-stats-week", therapistData.id],
    queryFn: fetchTherapistStatsWeek,
  });

  return (
    <div className="">
      <div className="">
        <div className="flex flex-col items-center text-center py-8">
          {/* Profile Image */}
          <div className="relative mb-6">
            <img
              src={profileImage}
              alt={`${therapistData.firstName} ${therapistData.lastName}`}
              className="rounded-full size-20 object-cover border-4 border-gray-200"
            />
            <div
              className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-white ${
                therapistData.status === "active" ? "bg-success" : "bg-danger"
              }`}
            ></div>
          </div>

          {/* Name and Verification */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {therapistData.firstName} {therapistData.lastName}
              </h2>
              {(therapistData.isEmailAuthenticated ||
                therapistData.isPhoneNumberAuthenticated) && (
                <KeenIcon icon="verify" className="text-primary text-lg" />
              )}
            </div>

            {/* Contact Info */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <KeenIcon icon="email" className="text-xs" />
                <span>{therapistData.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <KeenIcon icon="phone" className="text-xs" />
                <span>+251{therapistData.phoneNumber}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <span
                className={`badge ${
                  therapistData.status === "active"
                    ? "badge-success"
                    : therapistData.status === "pending"
                      ? "badge-primary"
                      : therapistData.status === "inactive"
                        ? "badge-warning"
                        : "badge-danger"
                } badge-outline`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    therapistData.status === "active"
                      ? "bg-success"
                      : therapistData.status === "pending"
                        ? "bg-primary"
                        : therapistData.status === "inactive"
                          ? "bg-warning"
                          : "bg-danger"
                  } me-1.5`}
                ></span>
                {therapistData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="space-y-6 py-4">
          <div className="pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              All-Time Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {statsLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-primary mx-auto"></div>
                  ) : (
                    statsData?.totalSessions || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-1">
                  {statsLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  ) : (
                    statsData?.totalHours || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-1">
                  {statsLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-primary mx-auto"></div>
                  ) : (
                    statsData?.totalRevenue || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Revenue (ETB)</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-info mb-1">
                  {statsLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  ) : (
                    statsData?.totalUsers || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </div>

          {/* Row 3: Weekly Statistics (Last 7 Days) */}
          <div className="pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Last 7 Days
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {statsWeekLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  ) : (
                    statsWeekData?.sessionsOverTime?.reduce(
                      (total: number, session: any) => {
                        return total + (parseInt(session.count) || 0);
                      },
                      0
                    ) || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Sessions/Week</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-1">
                  {statsWeekLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  ) : (
                    statsWeekData?.therapistHoursPerWeek
                      ?.reduce((total: number, week: any) => {
                        return total + (parseFloat(week.totalHours) || 0);
                      }, 0)
                      .toFixed(2) || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Hours/Week</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-1">
                  {statsWeekLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  ) : (
                    statsWeekData?.totalRevenue || "0"
                  )}
                </div>
                <div className="text-sm text-gray-600">Revenue/Week (ETB)</div>
              </div>

              {/*<div className="text-center">
      <div className="text-3xl font-bold text-info mb-1">
        {statsWeekLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        ) : (
          statsWeekData?.totalUsers || 0
        )}
      </div>
      <div className="text-sm text-gray-600">Users/Week</div>
    </div>*/}
            </div>
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
      label: "Hours Dedicated Per Week:",
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

        <div className="flex flex-col">
          {/* Languages Section */}
          <div className="mt-4 border-gray-200">
            <h4 className="text-sm text-gray-600 mb-2">Languages</h4>
            {languagesLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-600">
                  Loading languages...
                </span>
              </div>
            ) : languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languages.map((language: any) => (
                  <span
                    key={language.id}
                    className="badge badge-primary badge-outline"
                  >
                    {language.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No languages specified</p>
            )}
          </div>

          {/* Bio Section */}
          {therapistData.bio && (
            <div className="mt-4 border-gray-200">
              <h4 className="text-sm text-gray-600 mb-2">Bio</h4>
              <p className="text-sm text-gray-700">{therapistData.bio}</p>
            </div>
          )}

          {/* Expertise Section */}
          {therapistData.expertise && therapistData.expertise.length > 0 && (
            <div className="mt-4 border-gray-200">
              <h4 className="text-sm text-gray-600 mb-2">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {therapistData.expertise.map((exp) => (
                  <span
                    key={exp.id}
                    className="badge badge-primary badge-outline"
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
              <div className="mt-4 border-gray-200">
                <h4 className="text-sm text-gray-600 mb-2">
                  Bank Account Details
                </h4>
                <div className="space-y-2">
                  {therapistData.therapistBank.map((bank) => (
                    <div
                      key={bank.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-gray-600">Account:</span>
                      <span className="font-medium text-gray-900">
                        {bank.accountNumber}
                      </span>
                      {bank.branch && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">Branch:</span>
                          <span className="text-gray-900">{bank.branch}</span>
                        </>
                      )}
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
      `/api/v1/session?fields=client.*,hasTherapistAttended,schedule&filters=therapist.id=${therapistData.id}&take=0`
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
                            alt={`${session.client?.firstName || 'Unknown'} ${session.client?.lastName || 'Client'}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
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
