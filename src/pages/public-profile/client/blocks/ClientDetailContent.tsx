import { useState } from "react";
import { IClientDetailData, IClientRating } from "@/types/client";
import { ISessionData, ISessionResponse } from "@/types/session";
import { IAnswerData, IAnswerResponse } from "@/types/answer";
import { KeenIcon } from "@/components";
import { formatDistanceToNow, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
import avatar from "@/media/avatars/blank.png";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

interface ClientDetailContentProps {
  clientData: IClientDetailData;
}

const timeAgo = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return formatDistanceToNow(date, { addSuffix: true });
};

const ClientDetailContent = ({ clientData }: ClientDetailContentProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, "MMM dd, yyyy 'at' HH:mm");
  };


  const profileImage = clientData.profile 
    ? `${BASE_URL}/${clientData.profile}` 
    : avatar;

    console.log(clientData.rating, "gow gow rating");

  return (
    //<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5 mb-4">
      {/* Statistics Header - Full Width */}
      <div className="col-span-1 lg:col-span-3 translate-y-[-70px]">
        <ClientStatistics clientData={clientData} />
      </div>

      {/* Left Column - General Info */}
      <div className="col-span-1 w-full">
        <div className="w-full">
          <ClientGeneralInfo clientData={clientData} />
          {/*<ClientAccountInfo clientData={clientData} />*/}
        </div>
      </div>

      {/* Right Column - Tabbed Content */}
      <div className="col-span-2 border-2 rounded-lg border-text-muted">
        <div className="flex flex-col gap-5 lg:gap-7.5 p-4">
          <ClientTabbedContent clientData={clientData} />
        </div>
      </div>
    </div>
  );
};

// Statistics Component
const ClientStatistics = ({ clientData }: { clientData: IClientDetailData }) => {
  const profileImage = clientData.profile 
    ? `${BASE_URL}/${clientData.profile}` 
    : avatar;

  return (
    <div className="">
      <div className="">
        <div className="flex flex-col items-center text-center py-8">
          {/* Profile Image */}
          <div className="relative mb-6">
            <img
              src={profileImage}
              alt={`${clientData.firstName} ${clientData.lastName}`}
              className="rounded-full size-20 object-cover border-4 border-gray-200"
            />
            <div
              className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-white ${
                clientData.status === "active" ? "bg-success" : "bg-danger"
              }`}
            ></div>
          </div>

          {/* Name and Verification */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {clientData.firstName} {clientData.lastName}
              </h2>
              {(clientData.isEmailAuthenticated || clientData.isPhoneNumberAuthenticated) && (
                <KeenIcon icon="verify" className="text-primary text-lg" />
              )}
            </div>
            
            {/* Contact Info */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <KeenIcon icon="email" className="text-xs" />
                <span>{clientData.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <KeenIcon icon="phone" className="text-xs" />
                <span>+251{clientData.phoneNumber}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <span
                className={`badge ${
                  clientData.status === "active"
                    ? "badge-success"
                    : clientData.status === "pending"
                    ? "badge-primary"
                    : clientData.status === "inactive"
                    ? "badge-warning"
                    : "badge-danger"
                } badge-outline`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    clientData.status === "active"
                      ? "bg-success"
                      : clientData.status === "pending"
                      ? "bg-primary"
                      : clientData.status === "inactive"
                      ? "bg-warning"
                      : "bg-danger"
                  } me-1.5`}
                ></span>
                {clientData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-t">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(() => {
                const subscription = clientData.activeSubscription?.subscription;
                if (!subscription) return 'No Subscription';
                
                const type = subscription.type;
                if (type === undefined || type === null) return 'N/A';
                
                const subscriptionTypes = ['Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Yearly'];
                return subscriptionTypes[type] || `Type ${type}`;
              })()}
            </div>
            <div className="text-sm text-gray-600">Subscription Type</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(() => {
                const subscription = clientData.activeSubscription?.subscription;
                if (!subscription) return 'N/A';
                
                const price = subscription.price;
                if (price === undefined || price === null) return 'N/A';
                
                return `${price.toLocaleString()} Birr`;
              })()}
            </div>
            <div className="text-sm text-gray-600">Subscription Price</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(() => {
                const subscription = clientData.activeSubscription?.subscription;
                if (!subscription) return 'N/A';
                
                const type = subscription.type;
                if (type === undefined || type === null) return 'N/A';
                
                const sessionsPerType = [1, 4, 12, 24, 48]; // weekly=1, monthly=4, quarterly=12, semi-annual=24, yearly=48
                return sessionsPerType[type] || 'N/A';
              })()}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Info Component
const ClientGeneralInfo = ({ clientData }: { clientData: IClientDetailData }) => {
  console.log(clientData, "The client Data");
  const items = [
    { label: "Phone:", info: `+251 ${clientData.phoneNumber}` },
    { label: "Email:", info: clientData.email },
    { 
      label: "Status:", 
      info: `<span class="badge badge-sm ${
        clientData.status === "suspended" ? "badge-danger" : 
        clientData.status === "inactive" ? "badge-warning" : 
        clientData.status === "active" ? "badge-success" : 
        "badge-primary"
      } badge-outline">${clientData.status}</span>` 
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
const ClientAccountInfo = ({ clientData }: { clientData: IClientDetailData }) => {
  const items = [
    { label: "User ID:", info: clientData.id },
    { label: "Date of Birth:", info: clientData.dob ? (() => {
      const date = new Date(clientData.dob);
      return isNaN(date.getTime()) ? 'Invalid date' : format(date, "MMM dd, yyyy");
    })() : 'N/A' },
    { 
      label: "Email Verified:", 
      info: clientData.isEmailAuthenticated ? "✅ Yes" : "❌ No" 
    },
    { 
      label: "Phone Verified:", 
      info: clientData.isPhoneNumberAuthenticated ? "✅ Yes" : "❌ No" 
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
                <td className="text-sm text-gray-900 pb-3">
                  {item.info}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Tabbed Content Component
const ClientTabbedContent = ({ clientData }: { clientData: IClientDetailData }) => {
  const [activeView, setActiveView] = useState<"sessions" | "activity" | "ratings">("sessions");

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      {/* Tab Buttons */}
      <div className="flex gap-3 justify-center">
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
          <KeenIcon icon="chart-line" /> A
        </button>*/}
        <button
          type="button"
          className={`btn btn-sm ${activeView === "ratings" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveView("ratings")}
        >
          <KeenIcon icon="star" /> Onboarding Questions
        </button>
      </div>

      {/* Tab Content */}
      {activeView === "sessions" && <ClientSessions clientData={clientData} />}
      {activeView === "activity" && <ClientActivity clientData={clientData} />}
      {activeView === "ratings" && <ClientOnboardingQuestions clientData={clientData} />}
    </div>
  );
};

// Sessions Component
const ClientSessions = ({ clientData }: { clientData: IClientDetailData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<ISessionData | null>(null);

  // Fetch sessions for the client
  const fetchSessions = async (): Promise<ISessionResponse> => {
    const { data } = await axiosInstance.get(`/api/v1/session?fields=therapist.*,schedule&filters=client.id=${clientData.id}`);
    return data;
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["client-sessions", clientData.id],
    queryFn: fetchSessions,
  });

  const sessions = sessionsData?.data || [];

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group sessions by date using the schedule field
  const sessionsByDate = sessions.reduce((acc: { [key: string]: ISessionData[] }, session) => {
    const date = format(new Date(session.schedule), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
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
              <KeenIcon icon="calendar" className="text-4xl text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h4>
              <p className="text-gray-600">This client hasn't scheduled any therapy sessions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="btn btn-sm btn-icon btn-clear btn-primary"
                >
                  <KeenIcon icon="arrow-left" />
                </button>
                <h4 className="text-lg font-semibold text-gray-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="btn btn-sm btn-icon btn-clear btn-primary"
                >
                  <KeenIcon icon="arrow-right" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
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
                            ? 'text-gray-300 cursor-default'
                            : hasSessions
                            ? 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                            : isDayToday
                            ? 'bg-gray-100 text-primary font-semibold hover:bg-gray-200 cursor-pointer'
                            : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                        }
                      `}
                      disabled={!isCurrentMonth}
                    >
                      {format(day, 'd')}
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
              <div className="text-xs text-gray-600">{timeAgo(clientData.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <KeenIcon icon="edit" className="text-warning" />
            <div>
              <div className="text-sm font-medium">Profile Updated</div>
              <div className="text-xs text-gray-600">{timeAgo(clientData.updatedAt)}</div>
            </div>
          </div>
          {clientData.lastSeenAt && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <KeenIcon icon="eye" className="text-success" />
              <div>
                <div className="text-sm font-medium">Last Seen</div>
                <div className="text-xs text-gray-600">{timeAgo(clientData.lastSeenAt)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Onboarding Questions Component
const ClientOnboardingQuestions = ({ clientData }: { clientData: IClientDetailData }) => {
  // Fetch answers for the client
  const fetchAnswers = async (): Promise<IAnswerResponse> => {
    const { data } = await axiosInstance.get(`/api/v1/answer?fields=question.*,singleOption.*,multiOption.*,text&filters=client.id=${clientData.id}`);
    return data;
  };

  const { data: answersData, isLoading } = useQuery({
    queryKey: ["client-answers", clientData.id],
    queryFn: fetchAnswers,
  });

  const answers = answersData?.data || [];
  
  // Sort answers by question order
  const sortedAnswers = answers.sort((a, b) => a.question.order - b.question.order);

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
            <span className="text-sm text-gray-900">{answer.singleOption?.text || "No answer"}</span>
          </div>
        );
      case "multiple":
        return (
          <div className="space-y-1">
            {answer.multiOption.length > 0 ? (
              answer.multiOption.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <KeenIcon icon="check-circle" className="text-warning text-sm" />
                  <span className="text-sm text-gray-900">{option.text}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-500 italic">No options selected</span>
            )}
          </div>
        );
      case "open":
        return (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-900">
              {answer.text || <span className="text-gray-500 italic">No text provided</span>}
            </p>
          </div>
        );
      default:
        return <span className="text-sm text-gray-500">Unknown answer type</span>;
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
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title">Onboarding Questions</h3>
          <span className="badge badge-sm badge-outline">
            {answers.length} Question{answers.length !== 1 ? 's' : ''} Answered
          </span>
        </div>
      </div>
      <div className="card-body">
        {answers.length === 0 ? (
          <div className="text-center py-8">
            <KeenIcon icon="questionnaire-tablet" className="text-4xl text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Questions Answered</h4>
            <p className="text-gray-600">This client hasn't completed the onboarding questionnaire yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedAnswers.map((answer, index) => (
              <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
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
                      <span className={`badge badge-sm ${getQuestionTypeColor(answer.question.type)} badge-outline flex-shrink-0`}>
                        {answer.question.type}
                      </span>
                    </div>
                    
                    {/* Answer */}
                    <div className="ml-0">
                      {renderAnswer(answer)}
                    </div>
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


// Session Detail Card Component
const SessionDetailCard = ({ 
  session, 
  onClose 
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
          {/* Client Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Client</h4>
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
                <p className="text-sm text-gray-600">@{session.client.username}</p>
                <p className="text-sm text-gray-600">+251{session.client.phoneNumber}</p>
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

          {/* Therapist Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Matched Therapist</h4>
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
                <p className="text-sm text-gray-600">{session.therapist.email}</p>
                <p className="text-sm text-gray-600">+251{session.therapist.phoneNumber}</p>
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
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Session Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Session Status</label>
              <span className="badge badge-sm badge-primary badge-outline w-fit">{session.hasTherapistAttended ? "Attended" : "Not Attended"}</span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
              <p className="text-sm text-gray-900">{format(new Date(session.schedule), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
              <p className="text-sm text-gray-900">{format(new Date(session.schedule), 'HH:mm')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Therapist Last Seen</label>
              <p className="text-sm text-gray-900">{timeAgo(session.therapist.lastSeenAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ClientDetailContent };
