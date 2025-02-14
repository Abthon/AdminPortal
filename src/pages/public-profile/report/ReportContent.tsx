import {
  About,
  CommunityBadges,
  Connections,
  Contributions,
  DriverDeliveryChart,
  MediaUploads,
  Projects,
  RecentUploads,
  Tags,
  UnlockPartnerships,
  WorkExperience,
} from "./blocks";

const ReportContent = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <MediaUploads />
          {/* <CommunityBadges title="Community Badges" />
          <About />
          <WorkExperience />
          <Tags title="Skills" />
          <RecentUploads title="Recent Uploads" /> */}
        </div>
      </div>

      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          {/* <UnlockPartnerships /> */}
          <DriverDeliveryChart />
          {/* <WorkExperience />
          <Tags title="Skills" />
          <RecentUploads title="Recent Uploads" /> */}
        </div>
      </div>
    </div>

    //   </div>

    //   <div className="col-span-1">
    //     <div className="flex flex-col gap-5 lg:gap-7.5">
    //       <div className="flex flex-col gap-5 lg:gap-7.5">
    //         <UnlockPartnerships />

    //         <MediaUploads />
    //       </div>

    //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
    //         <Connections title="Contributors" />

    //         <Contributions title="Assistance" />
    //       </div>

    //       <Projects />
    //     </div>
    //   </div>
    // </div>
  );
};

export { ReportContent };
