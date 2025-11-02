import { useState, useEffect, useMemo } from "react";
import { ITherapistDetailData, ITherapistRating, IMatchResponse, IMatchData } from "@/types/therapist";
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5 mb-4">
      {/* Statistics Header - Full Width */}
      <div className="col-span-1 lg:col-span-3 translate-y-[-70px]">
        <TherapistStatistics therapistData={therapistData} />
      </div>

      {/* Left Column - General Info */}
      <div className="col-span-1 w-full">
        <div className="w-full">
          <TherapistGeneralInfo therapistData={therapistData} />
          {/* <LicenseInfo data={therapistData} /> */}

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
  );
};

function removeTherapy(text: string): string {
  return text.replace(/therapy/gi, "");
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
    return modalNames.filter(name => name !== null);
  };

  const { data: modalNames = [], isLoading: modalLoading } = useQuery({
    queryKey: ["therapist-license-modals", therapistData.id, licenseData],
    queryFn: fetchLicenseModals,
    enabled: !!licenseData?.data && licenseData.data.length > 0,
  });

  const uniqueModalNames = [...new Set(modalNames)]; // Remove duplicates
  const displayModal =
    uniqueModalNames.length > 0 ? uniqueModalNames.join(", ") : "N/A";

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-t">
          {/* Replace Age with Modal Type */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {licenseLoading || modalLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              ) : (
                removeTherapy(displayModal)
              )}
            </div>
            <div className="text-sm text-gray-600">Modal Type</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {therapistData.isEmailAuthenticated &&
              therapistData.isPhoneNumberAuthenticated
                ? "2"
                : therapistData.isEmailAuthenticated ||
                    therapistData.isPhoneNumberAuthenticated
                  ? "1"
                  : "0"}
            </div>
            <div className="text-sm text-gray-600">Verified Contacts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(() => {
                if (!therapistData.createdAt) return "N/A";
                const createdDate = new Date(therapistData.createdAt);
                if (isNaN(createdDate.getTime())) return "N/A";
                return Math.floor(
                  (new Date().getTime() - createdDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
              })()}
            </div>
            <div className="text-sm text-gray-600">Days Since Registration</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Info Component
const TherapistGeneralInfo = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  console.log(therapistData, "The therapist Data");
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
const TherapistSessions = ({
  therapistData,
}: {
  therapistData: ITherapistDetailData;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<ISessionData | null>(
    null
  );

  // Fetch sessions for the therapist
  const fetchSessions = async (): Promise<ISessionResponse> => {
    const { data } = await axiosInstance.get(
      `/api/v1/session?fields=client.*,schedule&filters=therapist.id=${therapistData.id}`
    );
    return data;
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["therapist-sessions", therapistData.id],
    queryFn: fetchSessions,
  });

  const sessions = sessionsData?.data || [];

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const daySessions = sessionsByDate[dateKey];
    if (daySessions && daySessions.length > 0) {
      setSelectedSession(daySessions[0]); // Show first session for that day
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
                  const hasSessions = sessionsByDate[dateKey]?.length > 0;
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        p-2 text-sm rounded-lg transition-colors relative
                        ${
                          !isCurrentMonth
                            ? "text-gray-300 cursor-default"
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
                      {hasSessions && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Details Card */}
      {selectedSession && (
        <TherapistSessionDetailCard
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
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
          Showing {startIndex + 1}-{Math.min(endIndex, enhancedRatings.length)} of{" "}
          {enhancedRatings.length} ratings
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading client information...</span>
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
                        src={rating.client?.avatar ? `${BASE_URL}/avatars/${rating.client.avatar}.png` : avatar}
                        alt={rating.client ? `${rating.client.firstName} ${rating.client.lastName}` : "Client"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {rating.client ? `${rating.client.firstName} ${rating.client.lastName}` : "Unknown Client"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {rating.client?.username ? `@${rating.client.username}` : ""}
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

// Therapist Session Detail Card Component
const TherapistSessionDetailCard = ({
  session,
  onClose,
}: {
  session: ISessionData;
  onClose: () => void;
}) => {
  const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

  const therapistImage = session.therapist.profile
    ? `${BASE_URL}/${session.therapist.profile}`
    : avatar;

  const clientImage = session.client.profile
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
          {/* Therapist Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Therapist
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

          {/* Client Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Matched Client
            </h4>
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
                Client Last Seen
              </label>
              <p className="text-sm text-gray-900">
                {timeAgo(session.client.lastSeenAt)}
              </p>
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
    const statusFilter = filterInput && filterInput !== "all" ? `client.status:=${filterInput}` : "";
    const filters = statusFilter ? `&filters=${statusFilter}` : "";
    const url = `/api/v1/match?fields=client.*&filters=accepted.id=${therapistData.id}${statusFilter ? `,${statusFilter}` : ""}&take=${pageSize}&page=${pageIndex}`;
    
    const { data } = await axiosInstance.get(url);
    
    // Calculate items on current page
    const startIndex = (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
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
    const statusFilter = filterInput && filterInput !== "all" ? `,client.status:=${filterInput}` : "";
    const url = `/api/v1/match?fields=client.*&filters=accepted.id=${therapistData.id},client.firstName=${search}${statusFilter}&take=${pageSize}&page=${pageIndex}&sort=client.firstName=${sort[0].desc ? "DESC" : "ASC"}`;
    
    const { data } = await axiosInstance.get(url);
    
    // Calculate items on current page
    const startIndex = (data.pagination.currentPage - 1) * data.pagination.pageSize + 1;
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
    const statusFilter = filterInput && filterInput !== "all" ? `,client.status:=${filterInput}` : "";
    const url = `/api/v1/match?fields=client.*&filters=accepted.id=${therapistData.id}${statusFilter}&sort=client.firstName=ASC`;
    
    const { data } = await axiosInstance.get(url);
    setTotalItems(data.pagination?.totalItems || data.data.length);
    return data;
  }

  // Use query for revalidation when filters change
  const { data: clientsData } = useQuery({
    queryKey: ["therapist-clients", therapistData.id, filterInput],
    queryFn: revalidateTherapistClients,
  });

  // Define columns for DataGrid
  const columns = useMemo<ColumnDef<IMatchData>[]>(
    () => [
      {
        accessorFn: (row) => row.client.firstName,
        id: "client",
        header: ({ column }) => (
          <DataGridColumnHeader title="Client" column={column} className="min-w-[200px]"/>
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
                      <KeenIcon icon="verify" className="text-primary text-xs" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <KeenIcon icon="phone" className="text-xs" />
                    <span>+251{client.phoneNumber}</span>
                    {client.isPhoneNumberAuthenticated && (
                      <KeenIcon icon="verify" className="text-primary text-xs" />
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
                client.status === "active" ? "badge-success" :
                client.status === "pending" ? "badge-primary" :
                client.status === "inactive" ? "badge-warning" :
                "badge-danger"
              } badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  client.status === "active" ? "bg-success" :
                  client.status === "pending" ? "bg-primary" :
                  client.status === "inactive" ? "bg-warning" :
                  "bg-danger"
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

  const data: IMatchData[] = useMemo(() => clientsData?.data ?? [], [clientsData]);

  // Toolbar component
  const Toolbar = () => {
    const handleFilterChange = (value: any) => {
      setFilterInput(value);
    };

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          Showing {itemsOnPage} of {totalItems} clients
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Select
              value={filterInput}
              onValueChange={handleFilterChange}
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
    );
  };

  return (
    <DataGrid
      onFetchData={getTherapistClients}
      onSearchData={searchTherapistClients}
      data={data}
      columns={columns}
      filterInput={filterInput}
      rowSelection={false}
      pagination={{ size: 5 }}
      sorting={[{ id: "client", desc: false }]}
      toolbar={<Toolbar />}
      layout={{ card: true }}
    />
  );
};

export { TherapistDetailContent };
