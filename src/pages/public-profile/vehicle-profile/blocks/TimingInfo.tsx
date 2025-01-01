interface TimingInfoProps {
  data: any;
}

const TimingInfo: React.FC<TimingInfoProps> = ({ data }) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="time-info">
        <h3 className="card-title">Timing Information</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              startTime
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.startTime}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              endTime
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.endTime}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TimingInfo };
