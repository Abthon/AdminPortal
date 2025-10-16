import { useState } from "react";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";
import { CardConnection, CardConnectionRow } from "@/partials/cards";
import avatar from "@/media/avatars/blank.png";
import { formatDistanceToNow } from "date-fns";

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

const GeneralInfo: React.FC<GeneralInfoProps> = ({ data }) => {
  const items: IGeneralInfoItem[] = [
    {
      label: "Phone:",
      info: `+251 ${data.phoneNumber}`,
      type: 1,
    },
    {
      label: "Email:",
      info: data.email,
      type: 1,
    },
    {
      label: "Status:",
      info: `<span class="badge badge-sm ${data.status === "active" ? "badge-success" : data.status === "inactive" ? "badge-warning" : "badge-danger"} badge-outline">${capitalizeFirstLetter(data.status)}</span>`,
    },
    {
      label: "Gender:",
      info: capitalizeFirstLetter(data.gender),
    },
    {
      label: "Date of Birth:",
      info: data.dob ? new Date(data.dob).toLocaleDateString() : "N/A",
    },
    {
      label: "Last Seen:",
      info: data.lastSeenAt ? timeAgo(data.lastSeenAt) : "Never",
    },
    {
      label: "Created at:",
      info: timeAgo(data.createdAt),
    },
    {
      label: "Bio:",
      info: data.bio || "No bio available",
    },
    {
      label: "Hours/Week:",
      info: data.hoursDedicatedPerWeek?.toString() || "0",
    },
  ];

  const renderItems = (item: IGeneralInfoItem, index: number) => {
    return (
      <tr key={index}>
        <td className="text-sm text-gray-600 pb-3 pe-4 lg:pe-8">
          {item.label}
        </td>
        <td className="text-sm text-gray-900 pb-3">
          {item.type === 1 ? (
            <span>{item.info}</span>
          ) : (
            <span
              dangerouslySetInnerHTML={{ __html: item.info as string }}
            ></span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Therapist Information</h3>
      </div>
      <div className="card-body pt-3.5 pb-3.5">
        <table className="table-auto">
          <tbody>{items.map((item, index) => renderItems(item, index))}</tbody>
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
      <tr key={index} className="hover:bg-gray-50 cursor-pointer">
        <td className="text-start text-sm text-gray-800">
          {member.firstName} {member.lastName}
        </td>
        <td className="text-start text-sm text-gray-800">{member.email}</td>
        <td className="text-start text-sm text-gray-800">
          +251 {member.phoneNumber}
        </td>
        <td className="text-start text-sm text-gray-800">
          {member.username || "N/A"}
        </td>
        <td>
          <div
            className={`badge badge-sm ${member.status === "active" ? "badge-success" : "badge-warning"} badge-outline`}
          >
            {capitalizeFirstLetter(member.status)}
          </div>
        </td>
        {/* <td>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openMemberModal(member)}
              className="btn btn-sm btn-icon btn-clear btn-primary"
              title="View Details"
            >
              <KeenIcon icon="eye" />
            </button>
          </div>
        </td> */}
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
              <th className="text-start min-w-[120px] !text-gray-700">Name</th>
              <th className="text-start min-w-[150px] !text-gray-700">Email</th>
              <th className="text-start min-w-[120px] !text-gray-700">Phone</th>
              <th className="text-start min-w-[100px] !text-gray-700">
                Username
              </th>
              <th className="min-w-[100px] !text-gray-700">Status</th>
              {/* <th className="min-w-[80px] !text-gray-700">Actions</th> */}
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
                  colSpan={6}
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
        {/* Left Column - Therapist Info Only */}
        <div className="col-span-1">
          <GeneralInfo data={sessionData.therapist} />
        </div>

        {/* Right Column - Group Members Table and Participants */}
        <div className="col-span-2">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {/* Group Members Table */}
            <GroupMembersTable data={sessionData.group || []} />

            {/* Participants View Toggle */}
            {/* <div className="card">
              <div className="card-header">
                <div className="flex flex-wrap items-center gap-5 justify-between">
                  <h3 className="card-title">
                    Session Participants ({items.length})
                  </h3>

                  <div className="btn-tabs" data-tabs="true">
                    <button
                      className={`btn btn-icon btn-sm ${activeView === "cards" ? "active" : ""}`}
                      onClick={() => setActiveView("cards")}
                    >
                      <KeenIcon icon="category" />
                    </button>
                    <button
                      className={`btn btn-icon btn-sm ${activeView === "list" ? "active" : ""}`}
                      onClick={() => setActiveView("list")}
                    >
                      <KeenIcon icon="row-horizontal" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {activeView === "cards" && (
                  <div id="network_cards">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                      {items.map((item, index) => renderItem(item, index))}
                    </div>
                  </div>
                )}

                {activeView === "list" && (
                  <div id="network_list">
                    <div className="flex flex-col gap-5 lg:gap-7.5">
                      {items.map((data, index) => renderData(data, index))}
                    </div>
                  </div>
                )}
              </div>
            </div> */}
          </div>
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

export { SessionGroupDetailContent, type INetworkItem, type INetworkItems };
