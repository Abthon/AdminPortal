import { Fragment, useEffect } from 'react';
import axiosInstance from "@/auth/_helpers";
import { useQuery } from 'react-query';
import { toAbsoluteUrl } from '@/utils/Assets';

interface IChannelStatsItem {
  info: string;
  desc: string;
  path: string;
}
interface IChannelStatsItems extends Array<IChannelStatsItem> {}

async function fetchCorporateStats() {
  const response = await axiosInstance.get(`/api/v1/admin/sys/stats`);
  return response.data;
}

const useStats = () => {
  return useQuery(
    'stats',
    fetchCorporateStats,
  );
}

const ChannelStats = () => {
  const { data, isLoading, error } = useStats();

  const stats = data?.data
    ? Object.entries(data.data).map(([key, value]) => ({
        info: String(value),
        desc: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        path: '',
      }))
    : [];

  useEffect(() => {
    console.log(data, "corporate status");
  }, [data]);

  const renderItem = (item: IChannelStatsItem, index: number) => {
    return (
      <div
        key={index}
        className="card flex flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg w-full"
      >
        <div className="flex flex-col gap-1 pb-4 px-5">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">{item.info}</span>
          <span className="text-2sm font-normal text-gray-700 dark:text-gray-300">{item.desc}</span>
        </div>
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading stats</div>;

  return (
    <Fragment>
      <style>
        {`
          .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
          }
          .dark .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
          }
        `}
      </style>

      <div className="grid grid-cols-4 gap-4 w-full">
        {stats.map((item, index) => {
          return renderItem(item, index);
        })}
      </div>
    </Fragment>
  );
};

export { ChannelStats, type IChannelStatsItem, type IChannelStatsItems };