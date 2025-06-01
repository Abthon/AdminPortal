import { useMemo } from "react";
import { DataGrid, DataGridColumnHeader, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";

interface IRatingData {
  id: number;
  createdAt: string;
  score: number;
  comment: string;
}

interface DriverRatingsProps {
  data: IRatingData[];
}

const DriverRatings = ({ data }: DriverRatingsProps) => {
  const columns = useMemo<ColumnDef<IRatingData>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Rating ID" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                #{row.original.id}
              </span>
            </div>
          );
        },
        meta: {
          className: "min-w-[100px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        accessorFn: (row) => row.score,
        id: "score",
        header: ({ column }) => (
          <DataGridColumnHeader title="Rating" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const score = row.original.score;
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <KeenIcon
                    key={star}
                    icon="star"
                    className={`text-sm ${
                      star <= score
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                ({score}/5)
              </span>
            </div>
          );
        },
        meta: {
          className: "min-w-[150px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        accessorFn: (row) => row.comment,
        id: "comment",
        header: ({ column }) => (
          <DataGridColumnHeader title="Comment" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const comment = row.original.comment;
          const truncatedComment =
            comment.length > 50 ? `${comment.substring(0, 50)}...` : comment;

          return (
            <div className="flex items-center">
              <span
                className="text-sm text-gray-700 hover:text-primary cursor-pointer"
                title={comment} // Show full comment on hover
              >
                {truncatedComment}
              </span>
            </div>
          );
        },
        meta: {
          className: "min-w-[200px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900">
                {formattedDate}
              </span>
              <span className="text-xs text-gray-600">{formattedTime}</span>
            </div>
          );
        },
        meta: {
          className: "min-w-[120px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      //   {
      //     id: "actions",
      //     header: ({ column }) => (
      //       <DataGridColumnHeader title="Actions" column={column} />
      //     ),
      //     enableSorting: false,
      //     cell: ({ row }) => {
      //       return (
      //         <div className="flex items-center gap-2">
      //           <button
      //             className="btn btn-sm btn-icon btn-clear btn-primary"
      //             title="View Details"
      //             onClick={() => {
      //               // Handle view details action
      //               console.log("View rating details:", row.original);
      //             }}
      //           >
      //             <KeenIcon icon="eye" />
      //           </button>
      //         </div>
      //       );
      //     },
      //     meta: {
      //       className: "min-w-[80px]",
      //       cellClassName: "text-gray-800 font-normal",
      //     },
      //   },
    ],
    []
  );

  const ratingsData: IRatingData[] = useMemo(() => data || [], [data]);

  const Toolbar = () => {
    const averageRating =
      ratingsData.length > 0
        ? (
            ratingsData.reduce((sum, rating) => sum + rating.score, 0) /
            ratingsData.length
          ).toFixed(1)
        : "0.0";

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex items-center gap-4">
          <h3 className="card-title font-medium text-sm">
            Showing {ratingsData.length} rating
            {ratingsData.length !== 1 ? "s" : ""}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Average Rating:</span>
            <div className="flex items-center gap-1">
              <KeenIcon
                icon="star"
                className="text-yellow-400 fill-current text-sm"
              />
              <span className="text-sm font-semibold text-gray-900">
                {averageRating}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DataGrid
      data={ratingsData}
      columns={columns}
      rowSelection={false}
      pagination={{ size: 10 }}
      sorting={[{ id: "createdAt", desc: true }]} // Sort by newest first
      toolbar={<Toolbar />}
      layout={{ card: true }}
    />
  );
};

export { DriverRatings };
