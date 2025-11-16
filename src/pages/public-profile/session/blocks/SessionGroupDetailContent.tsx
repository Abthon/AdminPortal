import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";
import { CardConnection, CardConnectionRow } from "@/partials/cards";
import avatar from "@/media/avatars/blank.png";
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
import { LicenseInfo } from "../../therapist/blocks/GeneralInfo";
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

// Import TherapistGeneralInfa from therapist detail content
// We'll use this component instead of our custom GeneralInfo
// Note: We need to create a wrapper since TherapistGeneralInfo expects therapistData prop

// General Info Component (Therapist Info)
interface IGeneralInfoItem {
  label: string;
  info: string | React.ReactNode;
  type?: number;
}

interface GeneralInfoProps {
  data: any;
}

export function timeAgo(dateISO: string): string {
  if (!dateISO) return "N/A";
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function capitalizeFirstLetter(input: string): string {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}

// TherapistInfo component that matches the structure from TherapistDetailContent
const TherapistInfo: React.FC<GeneralInfoProps> = ({ data }) => {
  const items = [
    { label: "Phone:", info: `+251 ${data.phoneNumber}` },
    { label: "Email:", info: data.email },
    {
      label: "Status:",
      info: `<span class="badge badge-sm ${
        data.status === "suspended"
          ? "badge-danger"
          : data.status === "inactive"
            ? "badge-warning"
            : data.status === "active"
              ? "badge-success"
              : "badge-primary"
      } badge-outline">${data.status}</span>`,
    },
    { label: "Gender:", info: data.gender },
    {
      label: "Hours Dedicated Per Week:",
      info: `${data.hoursDedicatedPerWeek || 0}`,
    },
    { label: "Created at:", info: timeAgo(data.createdAt) },
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

// Group Members Table Component (Similar to DriverBooking)
interface GroupMembersTableProps {
  data: any[];
}

const GroupMembersTable: React.FC<GroupMembersTableProps> = ({ data }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const openMemberModal = (member: any) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const renderItem = (member: any, index: number) => {
    return (
      <tr key={index} className="hover:bg-gray-50">
        <td className="text-start text-sm text-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={
                member.profile
                  ? `${import.meta.env.VITE_APP_STATIC_URL}/${member.profile}`
                  : avatar
              }
              className="rounded-full size-8 object-cover"
              alt={`${member.firstName} ${member.lastName}`}
            />
            <div>
              <Link
                to={`/clients/${member.id}`}
                className="font-medium text-gray-900 hover:text-primary-active"
              >
                {member.firstName} {member.lastName}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                {member.isEmailAuthenticated && (
                  <KeenIcon icon="verify" className="text-primary text-xs" />
                )}
                {member.isPhoneNumberAuthenticated && (
                  <KeenIcon
                    icon="shield-check"
                    className="text-success text-xs"
                  />
                )}
                {member.isOnline && (
                  <span className="size-2 bg-success rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="text-start text-sm text-gray-800">{member.email}</td>
        <td className="text-start text-sm text-gray-800">
          +251 {member.phoneNumber}
        </td>
        <td className="text-start text-sm text-gray-800">
          @{member.username || "N/A"}
        </td>
        <td className="text-start text-sm text-gray-800">
          {member.gender ? capitalizeFirstLetter(member.gender) : "N/A"}
        </td>
        <td className="text-start text-sm text-gray-800">
          {member.lastSeenAt ? timeAgo(member.lastSeenAt) : "Never"}
        </td>
        <td>
          <div
            className={`badge badge-sm ${member.status === "active" ? "badge-success" : member.status === "pending" ? "badge-primary" : member.status === "inactive" ? "badge-warning" : "badge-danger"} badge-outline`}
          >
            {capitalizeFirstLetter(member.status)}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-2">
            <Link
              to={`/clients/${member.id}`}
              className="btn btn-sm btn-icon btn-clear btn-primary"
              title="View Client Details"
            >
              <KeenIcon icon="eye" />
            </Link>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Group Members ({data.length})</h3>
      </div>
      <div className="card-table scrollable-x-auto">
        <table className="table text-end">
          <thead>
            <tr>
              <th className="text-start min-w-[200px] !text-gray-700">
                Client
              </th>
              <th className="text-start min-w-[150px] !text-gray-700">Email</th>
              <th className="text-start min-w-[120px] !text-gray-700">Phone</th>
              <th className="text-start min-w-[100px] !text-gray-700">
                Username
              </th>
              <th className="text-start min-w-[80px] !text-gray-700">Gender</th>
              <th className="text-start min-w-[100px] !text-gray-700">
                Last Seen
              </th>
              <th className="min-w-[100px] !text-gray-700">Status</th>
              <th className="min-w-[80px] !text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data
                .slice(0, showAll ? data.length : 5)
                .map((member: any, index: number) => renderItem(member, index))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-muted-foreground"
                  style={{ padding: "2rem 0" }}
                >
                  No group members available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data.length > 5 && (
        <div className="card-footer justify-center">
          <button onClick={() => setShowAll(!showAll)} className="btn btn-link">
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}

      {/* Member Detail Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedMember.firstName} {selectedMember.lastName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <KeenIcon icon="cross" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMember.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone:
                  </label>
                  <p className="text-sm text-gray-900">
                    +251 {selectedMember.phoneNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Username:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMember.username || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Gender:
                  </label>
                  <p className="text-sm text-gray-900">
                    {capitalizeFirstLetter(selectedMember.gender)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status:
                  </label>
                  <span
                    className={`badge badge-sm ${selectedMember.status === "active" ? "badge-success" : "badge-warning"} badge-outline`}
                  >
                    {capitalizeFirstLetter(selectedMember.status)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Profile Visible:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMember.isVisible ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600">
                  Last Seen:
                </label>
                <p className="text-sm text-gray-900">
                  {selectedMember.lastSeenAt
                    ? timeAgo(selectedMember.lastSeenAt)
                    : "Never"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Date of Birth:
                </label>
                <p className="text-sm text-gray-900">
                  {selectedMember.dob
                    ? new Date(selectedMember.dob).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Therapist Documents Component
const TherapistDocuments = ({ therapistData }: { therapistData: any }) => {
  // Fetch therapist license data like in TherapistDetailContent
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

  const licenseRecord = licenseData?.data?.[0];

  if (licenseLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Professional Documents</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return licenseRecord ? (
    <LicenseInfo data={licenseRecord} layout="grid" />
  ) : (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Professional Documents</h3>
      </div>
      <div className="card-body">
        <div className="text-center py-8">
          <KeenIcon icon="document" className="text-4xl text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Documents Found
          </h4>
          <p className="text-gray-600">
            No professional documents have been uploaded yet.
          </p>
        </div>
      </div>
    </div>
  );
};

// Client Onboarding Questions Component for Individual Sessions
const ClientOnboardingQuestions = ({ clientData }: { clientData: any }) => {
  // Fetch answers for the client
  const fetchAnswers = async () => {
    const { data } = await axiosInstance.get(
      `/api/v1/answer?fields=question.*,singleOption.*,multiOption.*,text&filters=client.id=${clientData.id}`
    );
    return data;
  };

  const { data: answersData, isLoading } = useQuery({
    queryKey: ["client-answers", clientData.id],
    queryFn: fetchAnswers,
  });

  const answers = answersData?.data || [];

  // Sort answers by question order
  const sortedAnswers = answers.sort(
    (a: any, b: any) => a.question.order - b.question.order
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

  const renderAnswer = (answer: any) => {
    switch (answer.question.type) {
      case "single":
        return (
          <div className="flex items-center gap-2">
            <KeenIcon icon="check-circle" className="text-primary text-sm" />
            <span className="text-sm text-gray-900">
              {answer.singleOption?.text || "No answer"}
            </span>
          </div>
        );
      case "multiple":
        return (
          <div className="space-y-1">
            {answer.multiOption.length > 0 ? (
              answer.multiOption.map((option: any, index: number) => (
                <div key={option.id} className="flex items-center gap-2">
                  <KeenIcon
                    icon="check-circle"
                    className="text-warning text-sm"
                  />
                  <span className="text-sm text-gray-900">{option.text}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-500 italic">
                No options selected
              </span>
            )}
          </div>
        );
      case "open":
        return (
          <div className="p-3 bg-gray-50 rounded-lg">
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
          <h3 className="card-title">Client Onboarding Questions</h3>
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
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title">Client Onboarding Questions</h3>
          <span className="badge badge-sm badge-outline">
            {answers.length} Question{answers.length !== 1 ? "s" : ""} Answered
          </span>
        </div>
      </div>
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
            {sortedAnswers.map((answer: any, index: number) => (
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
    </div>
  );
};

// Session Statistics Component
const SessionStatistics = ({ sessionData }: { sessionData: any }) => {
  const stats = [
    {
      label: "Session Type",
      value:
        sessionData.group?.length > 0 ? "Group Session" : "Individual Session",
      icon: "users",
      color: "text-primary",
    },
    {
      label: "Therapist Status",
      value: sessionData.therapist?.isOnline ? "Online" : "Offline",
      icon: sessionData.therapist?.isOnline ? "check-circle" : "clock",
      color: sessionData.therapist?.isOnline ? "text-success" : "text-warning",
    },
    {
      label: "Therapist Attendance",
      value: sessionData.hasTherapistAttended ? "Attended" : "Not Attended",
      icon: sessionData.hasTherapistAttended ? "check" : "cross",
      color: sessionData.hasTherapistAttended ? "text-success" : "text-danger",
    },
    {
      label: "Group Size",
      value: sessionData.group?.length || 0,
      icon: "user",
      color: "text-info",
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Session Overview</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-semibold mb-1 ${stat.color}`}>
                <KeenIcon icon={stat.icon} className="me-2" />
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TherapistSessionCalendar = ({
  therapistData,
  groupMembers,
}: {
  therapistData: any;
  groupMembers: any[];
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  console.log(groupMembers, "the members");

  // Fetch sessions for group members only
  const fetchTherapistSessions = async () => {
    if (!groupMembers || groupMembers.length === 0) {
      return { data: [] };
    }

    try {
      // Get client IDs from group members
      const clientIds = groupMembers.map((member) => member.id);
      console.log(clientIds, "The ids");
      // Fetch sessions for each group client with this therapist
      const sessionPromises = clientIds.map((clientId) =>
        axiosInstance.get(
          `/api/v1/session?fields=client.*,therapist.*,schedule,hasTherapistAttended,hasclientAttended&filters=group.id=${clientId}&take=0`
        )
      );

      const sessionResponses = await Promise.all(sessionPromises);

      console.log(sessionResponses, "the responses");
      // Merge all sessions from different clients
      const allSessions = sessionResponses.reduce((acc, response) => {
        return acc.concat(response.data.data || []);
      }, []);

      return { data: allSessions };
    } catch (error) {
      console.error("Error fetching group sessions:", error);
      return { data: [] };
    }
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: [
      "therapist-group-sessions",
      therapistData.id,
      groupMembers?.map((m) => m.id).join(","),
    ],
    queryFn: fetchTherapistSessions,
  });

  const sessions = sessionsData?.data || [];

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

  const calendarDays = getCalendarDays(currentMonth);

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc: any, session: any) => {
    const dateKey = format(new Date(session.schedule), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {});

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentMonth)) return;

    const dateKey = format(day, "yyyy-MM-dd");
    const daySessions = sessionsByDate[dateKey];
    if (daySessions && daySessions.length > 0) {
      setSelectedSession(daySessions[0]); // Show first session of the day
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Group Session Calendar</h3>
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
    <div className="space-y-5 pt-2">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Group Session Calendar</h3>
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
                  {format(currentMonth, "MMMM yyyy")}
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
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isDayToday = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {}}
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
        <TherapistSessionDetailCard
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

// Therapist Session Detail Card Component
const TherapistSessionDetailCard = ({
  session,
  onClose,
}: {
  session: any;
  onClose: () => void;
}) => {
  const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

  const therapistImage = session.therapist?.profile
    ? `${BASE_URL}/${session.therapist.profile}`
    : avatar;

  const clientImage = session.group?.[0]?.profile
    ? `${BASE_URL}/${session.group?.[0]?.profile}`
    : avatar;

  const timeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  console.log("session", session.group);

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
                alt={`${session.therapist?.firstName} ${session.therapist?.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">
                  {session.therapist?.firstName} {session.therapist?.lastName}
                </h5>
                <p className="text-sm text-gray-600">
                  {session.therapist?.email}
                </p>
                <p className="text-sm text-gray-600">
                  +251{session.therapist?.phoneNumber}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`badge badge-sm ${
                      session.therapist?.status === "active"
                        ? "badge-success"
                        : session.therapist?.status === "pending"
                          ? "badge-primary"
                          : session.therapist?.status === "inactive"
                            ? "badge-warning"
                            : "badge-danger"
                    } badge-outline`}
                  >
                    {session.therapist?.status}
                  </span>
                  {session.therapist?.verified && (
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
                // alt={`${session.client?.firstName} ${session.client?.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              {session.group.map((member: any) => (
                <div key={member.id} className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h5>
                </div>
              ))}

              {/* <div className="flex-1">
                <h5 className="font-semibold text-gray-900">
                  {session.group?.[0]?.firstName} {session.group?.[0]?.lastName}
                </h5>
                <p className="text-sm text-gray-600">
                  @{session.group?.[0]?.username}
                </p>
                <p className="text-sm text-gray-600">
                  +251{session.group?.[0]?.phoneNumber}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`badge badge-sm ${
                      session.group?.[0]?.status === "active"
                        ? "badge-success"
                        : session.group?.[0]?.status === "pending"
                          ? "badge-primary"
                          : session.group?.[0]?.status === "inactive"
                            ? "badge-warning"
                            : "badge-danger"
                    } badge-outline`}
                  >
                    {session.group?.[0]?.status}
                  </span>
                  {session.group?.[0]?.isOnline && (
                    <span className="badge badge-sm badge-success badge-outline">
                      Online
                    </span>
                  )}
                </div>
              </div> */}
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
                Therapist Attendance
              </label>
              <span
                className={`badge badge-sm w-fit ${session.hasTherapistAttended ? "badge-success" : "badge-warning"} badge-outline`}
              >
                {session.hasTherapistAttended ? "Attended" : "Not Attended"}
              </span>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Client Attendance
              </label>
              <span
                className={`badge badge-sm w-fit ${session.hasclientAttended ? "badge-success" : "badge-warning"} badge-outline`}
              >
                {session.hasclientAttended ? "Attended" : "Not Attended"}
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
interface INetworkItem {
  name: string;
  info: string;
  avatar: {
    className: string;
    fallback?: string;
    image?: string;
    imageClass?: string;
    badgeClass: string;
  };
  email: string;
  statistics: Array<{ total: string; description: string }>;
}

interface INetworkItems extends Array<INetworkItem> {}

const SessionGroupDetailContent = ({ sessionData }: any) => {
  const [activeView, setActiveView] = useState("cards");

  // Transform session data into card format
  const getSessionItems = () => {
    if (!sessionData) return [];

    const { therapist, group } = sessionData;
    const items: INetworkItem[] = [];

    // Add therapist
    if (therapist) {
      items.push({
        name: `${therapist.firstName} ${therapist.lastName}`,
        info: therapist.bio || "Therapist",
        avatar: {
          className: "size-20 relative",
          image: therapist.avatar || avatar,
          imageClass: "rounded-full",
          badgeClass: therapist.isOnline
            ? "flex size-2.5 bg-success rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2"
            : "flex size-2.5 bg-gray-400 rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2",
        },
        email: therapist.email,
        statistics: [
          {
            total: therapist.hoursDedicatedPerWeek?.toString() || "0",
            description: "Hours/Week",
          },
          {
            total: therapist.isOnline ? "Online" : "Offline",
            description: "Status",
          },
          {
            total: therapist.verified ? "Verified" : "Not Verified",
            description: "Verification",
          },
        ],
      });
    }

    // Add group members
    if (group && group.length > 0) {
      group.forEach((member: any) => {
        items.push({
          name: `${member.firstName} ${member.lastName}`,
          info: member.username ? `@${member.username}` : "Client",
          avatar: {
            className: "size-20 relative",
            image: member.avatar || avatar,
            imageClass: "rounded-full",
            badgeClass: member.isOnline
              ? "flex size-2.5 bg-success rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2"
              : "flex size-2.5 bg-gray-400 rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2",
          },
          email: member.email,
          statistics: [
            {
              total: member.isVisible ? "Visible" : "Private",
              description: "Profile",
            },
            {
              total: member.isInGroup ? "In Group" : "Individual",
              description: "Type",
            },
            {
              total: member.lastSeenAt
                ? new Date(member.lastSeenAt).toLocaleDateString()
                : "Never",
              description: "Last Seen",
            },
          ],
        });
      });
    }

    return items;
  };

  const items = getSessionItems();

  const renderItem = (item: INetworkItem, index: number) => {
    return (
      <CardConnection
        name={item.name}
        info={item.info}
        avatar={item.avatar}
        email={item.email}
        //statistics={item.statistics}
        key={index}
      />
    );
  };

  const renderData = (data: INetworkItem, index: number) => {
    return (
      <CardConnectionRow
        name={data.name}
        info={data.info}
        avatar={data.avatar}
        email={data.email}
        //={data.statistics}
        key={index}
      />
    );
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      {/* Session Overview */}
      <SessionStatistics sessionData={sessionData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
        {/* Left Column - Therapist Info, Documents, and Ratings */}
        <div className="col-span-1">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            <TherapistInfo data={sessionData.therapist} />
            <TherapistRatings therapistData={sessionData.therapist} />
          </div>
        </div>

        {/* Right Column - Group Members Table or Client Questions */}
        <div className="col-span-2">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {/* Show Group Members Table for group sessions, Client Questions for individual sessions */}
            {sessionData.group && sessionData.group.length > 0 ? (
              <div>
                <GroupMembersTable data={sessionData.group} />
                <TherapistDocuments therapistData={sessionData.therapist} />
              </div>
            ) : sessionData.client ? (
              <ClientOnboardingQuestions clientData={sessionData.client} />
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="text-center py-8 text-gray-500">
                    No client or group information available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-3 mb-4">
          <TherapistSessionCalendar
            therapistData={sessionData.therapist}
            groupMembers={sessionData.group}
          />
        </div>
      </div>

      {/* Back to Sessions Link */}
      {/* <div className="flex justify-center pt-5 lg:pt-7.5">
        <Link to="/sessions" className="btn btn-link">
          <KeenIcon icon="arrow-left" className="me-2" />
          Back to Sessions
        </Link>
      </div> */}
    </div>
  );
};

// Therapist Ratings Component
const TherapistRatings = ({ therapistData }: { therapistData: any }) => {
  const ratings = therapistData.rating || [];
  const [enhancedRatings, setEnhancedRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enhanced ratings with client data
  useEffect(() => {
    const fetchEnhancedRatings = async () => {
      if (ratings.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const enhancedData = await Promise.all(
          ratings.map(async (rating: any) => {
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

    fetchEnhancedRatings();
  }, [ratings]);

  const calculateAverageRating = () => {
    if (ratings.length === 0) return "0.0";
    const sum = ratings.reduce(
      (acc: number, rating: any) => acc + rating.value,
      0
    );
    return (sum / ratings.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating: any) => {
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
        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-xs text-gray-600">Loading ratings...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-6">
            <KeenIcon icon="star" className="text-3xl text-gray-400 mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              No Ratings Yet
            </h4>
            <p className="text-xs text-gray-600">
              This therapist hasn't received any ratings from clients.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compact Rating Summary */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {averageRating}
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(parseFloat(averageRating)))}
                </div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-900 mb-2">
                  {ratings.length} rating{ratings.length !== 1 ? "s" : ""}
                </div>
                {Object.entries(distribution)
                  .reverse()
                  .slice(0, 3) // Show only top 3 rating levels for compact view
                  .map(([star, count]) => (
                    <div key={star} className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-gray-600 w-2">{star}</span>
                      <KeenIcon icon="star" className="text-xs text-warning" />
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-warning rounded-full h-1"
                          style={{
                            width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-4">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ratings Table - Compact */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2">
                Client Ratings
              </h4>
              <div className="overflow-x-auto">
                <table className="table table-auto">
                  <thead>
                    <tr>
                      <th className="text-left text-xs">Client</th>
                      <th className="text-center text-xs">Rating</th>
                      <th className="text-left text-xs">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enhancedRatings
                      .slice(0, 3)
                      .map((rating: any, index: number) => (
                        <tr key={rating.id || index}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {rating.client?.firstName?.charAt(0) || "C"}
                              </div>
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {rating.client?.firstName || "Unknown"}{" "}
                                {rating.client?.lastName || "Client"}
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {renderStars(rating.value)}
                              <span className="text-xs font-medium text-gray-900 ml-1">
                                {rating.value}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="max-w-24">
                              {rating.comment ? (
                                <p className="text-xs text-gray-600 line-clamp-1">
                                  "{rating.comment}"
                                </p>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  -
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {enhancedRatings.length > 3 && (
                <div className="text-center mt-3">
                  <button className="btn btn-xs btn-outline btn-primary">
                    View All {enhancedRatings.length}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { SessionGroupDetailContent, type INetworkItem, type INetworkItems };
