import { useState } from "react";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";
import { CardConnection, CardConnectionRow } from "@/partials/cards";
import avatar from "@/media/avatars/blank.png";

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
  //   team: {
  //     size?: string;
  //     group: Array<{ filename?: string; variant?: string; fallback?: string }>;
  //     more?: {
  //       number: number;
  //       variant: string;
  //     };
  //   };
  statistics: Array<{ total: string; description: string }>;
  //   connected: boolean;
}
interface INetworkItems extends Array<INetworkItem> {}

const SessionDetailContent = ({ sessionData }: any) => {
  const [activeView, setActiveView] = useState("cards");

  // Transform session data into the expected format
  const getSessionItems = () => {
    if (!sessionData) return [];

    const { therapist, client } = sessionData;

    const therapistItem: INetworkItem = {
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
      //   team: {
      //     size: "size-7",
      //     group: [
      //       { filename: "300-4.png" },
      //       { filename: "300-1.png" },
      //       { filename: "300-2.png" },
      //     ],
      //     more: {
      //       number: 10,
      //       variant: "text-success-inverse ring-success-light bg-success size-7",
      //     },
      //   },
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
          total: therapist.experience || "N/A",
          description: "Experience",
        },
      ],
      //   connected: sessionData.hasTherapistAttended || false,
    };

    const clientItem: INetworkItem = {
      name: `${client.firstName} ${client.lastName}`,
      info: client.username ? `@${client.username}` : "Client",
      avatar: {
        className: "size-20 relative",
        image: client.avatar || undefined,
        imageClass: "rounded-full",
        badgeClass: client.isOnline
          ? "flex size-2.5 bg-success rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2"
          : "flex size-2.5 bg-gray-400 rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2",
      },
      email: client.email,
      //   team: {
      //     size: "size-7",
      //     group: [
      //       { filename: "300-4.png" },
      //       { filename: "300-5.png" },
      //       { filename: "300-11.png" },
      //     ],
      //     more: {
      //       number: 5,
      //       variant: "text-primary-inverse ring-primary-light bg-primary size-7",
      //     },
      //   },
      statistics: [
        {
          total: client.isVisible ? "Visible" : "Private",
          description: "Profile",
        },
        {
          total: client.isInGroup ? "In Group" : "Individual",
          description: "Type",
        },
        {
          total: new Date(client.lastSeenAt).toLocaleDateString(),
          description: "Last Seen",
        },
      ],
      //connected: true, // Client is always connected to their own session
    };

    return [therapistItem, clientItem];
  };

  const items = getSessionItems();

  const renderItem = (item: INetworkItem, index: number) => {
    return (
      <CardConnection
        name={item.name}
        info={item.info}
        avatar={item.avatar}
        email={item.email}
        // team={item.team}
        // statistics={item.statistics}
        // connected={item.connected}
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
        //team={data.team}
        //statistics={data.statistics}
        // connected={data.connected}
        key={index}
      />
    );
  };

  return (
    <div className="flex flex-col items-stretch px-8 gap-5 lg:gap-7.5">
      <div className="flex flex-wrap items-center gap-5 justify-between">
        <h3 className="text-lg text-gray-900 font-semibold">
          Session Participants ({items.length})
        </h3>

        <div className="btn-tabs" data-tabs="true">
          <a
            href="#"
            className={`btn btn-icon btn-sm ${activeView === "cards" ? "active" : ""}`}
            data-tab-toggle="#network_cards"
            onClick={() => {
              setActiveView("cards");
            }}
          >
            <KeenIcon icon="category" />
          </a>
          <a
            href="#"
            className={`btn btn-icon btn-sm ${activeView === "list" ? "active" : ""}`}
            data-tab-toggle="#network_list"
            onClick={() => {
              setActiveView("list");
            }}
          >
            <KeenIcon icon="row-horizontal" />
          </a>
        </div>
      </div>

      {activeView === "cards" && (
        <div id="network_cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
            {items.map((item, index) => {
              return renderItem(item, index);
            })}
          </div>
        </div>
      )}

      {activeView === "list" && (
        <div id="network_list">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {items.map((data, index) => {
              return renderData(data, index);
            })}
          </div>

          <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <Link to="/sessions" className="btn btn-link">
              Back to Sessions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export { SessionDetailContent, type INetworkItem, type INetworkItems };
