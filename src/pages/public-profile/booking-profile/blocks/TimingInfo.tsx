import React from "react";

interface TimingInfoProps {
  data: {
    createdAt: string; // Assuming ISO date string
    endTime: string; // Assuming ISO date string
  };
}

const TimingInfo: React.FC<TimingInfoProps> = ({ data }) => {
  // Helper function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="time-info">
        <h3 className="card-title">Timing Information</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Start Time:
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data?.createdAt ? formatDate(data?.createdAt) : "-"}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              End Time:
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data?.endTime ? formatDate(data?.endTime) : "-"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TimingInfo };
