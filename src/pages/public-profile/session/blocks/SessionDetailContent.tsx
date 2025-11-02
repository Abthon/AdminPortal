import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";
import avatar from "@/media/avatars/blank.png";
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
import { 
  formatDistanceToNow, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { LicenseInfo } from "../../therapist/blocks/GeneralInfo";

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

const timeAgo = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return formatDistanceToNow(date, { addSuffix: true });
};

const SessionDetailContent = ({ sessionData }: any) => {
  const [activeTab, setActiveTab] = useState<"overview" | "client" | "therapist">("overview");

  if (!sessionData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No session data available</p>
      </div>
    );
  }

  const { therapist, client } = sessionData;

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      {/* Session Overview */}
      <SessionOverview sessionData={sessionData} />

      {/* Tab Navigation */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveTab("overview")}
        >
          <KeenIcon icon="abstract-26" /> Session Overview
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === "client" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveTab("client")}
        >
          <KeenIcon icon="profile-circle" /> Client Details
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === "therapist" ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={() => setActiveTab("therapist")}
        >
          <KeenIcon icon="badge" /> Therapist Details
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
          <div className="col-span-1">
            <TherapistGeneralInfo therapistData={therapist} />
          </div>
          <div className="col-span-1">
            <ClientGeneralInfo clientData={client} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">

        {activeTab === "client" && (
          <>
            <div className="col-span-1 lg:col-span-3">
              <ClientSessionCalendar clientData={client} />
            </div>
            <div className="col-span-1 lg:col-span-3">
              <ClientOnboardingQuestions clientData={client} />
            </div>
          </>
        )}

        {activeTab === "therapist" && (
          <>
            <div className="col-span-1">
              <TherapistGeneralInfo therapistData={therapist} />
            </div>
            <div className="col-span-2">
              <div className="flex flex-col gap-5 lg:gap-7.5">
                <TherapistDocuments therapistData={therapist} />
                <TherapistRatings therapistData={therapist} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Session Overview Component
const SessionOverview = ({ sessionData }: { sessionData: any }) => {
  const stats = [
    {
      label: "Session Type",
      value: "Individual Session",
      icon: "user",
      color: "text-primary",
    },
    {
      label: "Schedule",
      value: sessionData.schedule
        ? format(new Date(sessionData.schedule), "MMM dd, yyyy 'at' HH:mm")
        : "No schedule provided",
      icon: "calendar",
      color: "text-success",
    },
    //{
    //  label: "Schedule",
    //  value: format(new Date(sessionData.schedule), "MMM dd, yyyy 'at' HH:mm"),
    //  icon: "calendar",
    //  color: "text-success",
    //},
    {
      label: "Duration",
      value: `${sessionData.duration || 60} minutes`,
      icon: "time",
      color: "text-warning",
    },
    {
      label: "Status",
      value: sessionData.hasTherapistAttended ? "Completed" : "Pending",
      icon: sessionData.hasTherapistAttended ? "check-circle" : "time",
      color: sessionData.hasTherapistAttended ? "text-success" : "text-warning",
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Session Information</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`${stat.color} mb-2`}>
                <KeenIcon icon={stat.icon} className="text-2xl" />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
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

// Therapist General Info Component
const TherapistGeneralInfo = ({ therapistData }: { therapistData: any }) => {
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
      info: `${therapistData.hoursDedicatedPerWeek || 0}`,
    },
    { label: "Created at:", info: timeAgo(therapistData.createdAt) },
  ];

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Therapist Info</h3>
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

// Client General Info Component
const ClientGeneralInfo = ({ clientData }: { clientData: any }) => {
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
        <h3 className="card-title">Client Info</h3>
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

// Client Session Calendar Component
const ClientSessionCalendar = ({ clientData }: { clientData: any }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Fetch client sessions
  const fetchClientSessions = async () => {
    const { data } = await axiosInstance.get(`/api/v1/session?fields=client.*,schedule&filters=client.id=${clientData.id}`);
    return data;
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["client-sessions", clientData.id],
    queryFn: fetchClientSessions,
  });

  const sessions = sessionsData?.data || [];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session: any) => 
      isSameDay(new Date(session.schedule), day)
    );
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Client Session Calendar</h3>
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
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Client Session Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="btn btn-sm btn-icon btn-clear btn-primary"
            >
              <KeenIcon icon="left" />
            </button>
            <span className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="btn btn-sm btn-icon btn-clear btn-primary"
            >
              <KeenIcon icon="right" />
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map(day => {
            const daySessions = getSessionsForDay(day);
            const hasSession = daySessions.length > 0;
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  relative p-2 text-center text-sm cursor-pointer rounded hover:bg-gray-50
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-400' : 'text-gray-900'}
                  ${isToday(day) ? 'bg-primary text-white' : ''}
                  ${hasSession ? 'bg-blue-50 border border-blue-200' : ''}
                `}
                onClick={() => hasSession && setSelectedSession(daySessions[0])}
              >
                {format(day, 'd')}
                {hasSession && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Client Onboarding Questions Component
const ClientOnboardingQuestions = ({ clientData }: { clientData: any }) => {
  // Fetch answers for the client
  const fetchAnswers = async () => {
    const { data } = await axiosInstance.get(`/api/v1/answer?fields=question.*,singleOption.*,multiOption.*,text&filters=client.id=${clientData.id}`);
    return data;
  };

  const { data: answersData, isLoading } = useQuery({
    queryKey: ["client-answers", clientData.id],
    queryFn: fetchAnswers,
  });

  const answers = answersData?.data || [];
  
  // Sort answers by question order
  const sortedAnswers = answers.sort((a: any, b: any) => a.question.order - b.question.order);

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
          <div className="flex items-center gap-1">
            <KeenIcon icon="check-circle" className="text-primary text-xs" />
            <span className="text-xs text-gray-900">{answer.singleOption?.text || "No answer"}</span>
          </div>
        );
      case "multiple":
        return (
          <div className="space-y-1">
            {answer.multiOption.length > 0 ? (
              answer.multiOption.slice(0, 2).map((option: any, index: number) => (
                <div key={option.id} className="flex items-center gap-1">
                  <KeenIcon icon="check-circle" className="text-warning text-xs" />
                  <span className="text-xs text-gray-900">{option.text}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">No options selected</span>
            )}
            {answer.multiOption.length > 2 && (
              <span className="text-xs text-gray-500">+{answer.multiOption.length - 2} more</span>
            )}
          </div>
        );
      case "open":
        return (
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-900 line-clamp-2">
              {answer.text || <span className="text-gray-500 italic">No text provided</span>}
            </p>
          </div>
        );
      default:
        return <span className="text-xs text-gray-500">Unknown answer type</span>;
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAnswers.slice(0, 6).map((answer: any, index: number) => (
                <div key={answer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900 leading-relaxed line-clamp-2">
                            {answer.question.text}
                          </h4>
                          <span className={`badge badge-xs ${getQuestionTypeColor(answer.question.type)} badge-outline flex-shrink-0`}>
                            {answer.question.type}
                          </span>
                        </div>
                        
                        <div className="ml-0 text-xs">
                          {renderAnswer(answer)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {answers.length > 6 && (
              <div className="text-center pt-4">
                <Link 
                  to={`/clients/${clientData.id}`}
                  className="btn btn-sm btn-outline btn-primary"
                >
                  View All {answers.length} Questions
                </Link>
              </div>
            )}
          </>
        )}
      </div>
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
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h4>
          <p className="text-gray-600">No professional documents have been uploaded yet.</p>
        </div>
      </div>
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ratings...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8">
            <KeenIcon icon="star" className="text-4xl text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Ratings Yet
            </h4>
            <p className="text-gray-600">
              This therapist hasn't received any ratings from clients.
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
                      <span className="text-sm text-gray-600 w-3">{star}</span>
                      <KeenIcon icon="star" className="text-xs text-warning" />
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
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Client Ratings</h4>
              <div className="overflow-x-auto">
                <table className="table table-auto">
                  <thead>
                    <tr>
                      <th className="text-left">Client</th>
                      <th className="text-center">Rating</th>
                      <th className="text-left">Comment</th>
                      <th className="text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enhancedRatings.slice(0, 5).map((rating: any, index: number) => (
                      <tr key={rating.id || index}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {rating.client?.firstName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {rating.client?.firstName || 'Unknown'} {rating.client?.lastName || 'Client'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {rating.client?.email || 'No email available'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {renderStars(rating.value)}
                            <span className="text-sm font-medium text-gray-900 ml-2">
                              {rating.value}/5
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="max-w-xs">
                            {rating.comment ? (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                "{rating.comment}"
                              </p>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No comment</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-gray-600">
                            {rating.createdAt ? timeAgo(rating.createdAt) : 'Recently'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {enhancedRatings.length > 5 && (
                <div className="text-center mt-4">
                  <button className="btn btn-sm btn-outline btn-primary">
                    View All {enhancedRatings.length} Ratings
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

export { SessionDetailContent };
