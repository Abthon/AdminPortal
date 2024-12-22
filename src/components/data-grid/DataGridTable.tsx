// import { DataGridEmpty, TDataGridLayoutCellSpacing } from ".";
// import { flexRender, HeaderGroup, Row, Cell } from "@tanstack/react-table";
// import { useDataGrid } from ".";
// import { cn } from "@/lib/utils";

// const DataGridTable = <TData,>({ isOpen }) => {
//   const { table, props } = useDataGrid();
//   const headCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
//     xs: "px-2.5",
//     sm: "px-3",
//     md: "px-4",
//     lg: "px-6",
//   };
//   const bodyCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
//     xs: "p-2.5",
//     sm: "p-3",
//     md: "p-4",
//     lg: "p-6",
//   };

//   const headCellSpacing = props.layout?.cellSpacing
//     ? headCellSpacingOptions[props.layout?.cellSpacing]
//     : headCellSpacingOptions["md"];
//   const bodyCellSpacing = props.layout?.cellSpacing
//     ? bodyCellSpacingOptions[props.layout?.cellSpacing]
//     : bodyCellSpacingOptions["md"];
//   const cellBorder = props.layout?.cellBorder ?? false;

//   return (
//     <table
//       className={cn(
//         "w-full align-middle text-left rtl:text-right caption-bottom text-sm",
//         props.layout?.classes?.table
//       )}
//       data-table
//     >
//       <thead className="[&_tr]:border-b">
//         {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
//           <tr
//             key={headerGroup.id}
//             className={cn(
//               "border-b bg-muted/30 data-[state=selected]:bg-muted",
//               cellBorder && "[&_>:last-child]:border-e-0"
//             )}
//           >
//             {headerGroup.headers.map((header) => (
//               <th
//                 key={header.id}
//                 colSpan={header.colSpan}
//                 className={cn(
//                   headCellSpacing,
//                   cellBorder && "border-e",
//                   "h-12 text-left rtl:text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pe-0",
//                   header.column.columnDef.meta?.headerClassName
//                 )}
//               >
//                 {header.isPlaceholder
//                   ? null
//                   : flexRender(
//                       header.column.columnDef.header,
//                       header.getContext()
//                     )}
//               </th>
//             ))}
//           </tr>
//         ))}
//       </thead>
//       <tbody className="[&_tr:last-child]:border-0">
//         {table.getRowModel().rows.length ? (
//           table.getRowModel().rows.map((row: Row<TData>) => (
//             <tr
//               key={row.id}
//               data-state={row.getIsSelected() ? "selected" : undefined}
//               className={cn(
//                 "border-b hover:bg-muted/30 data-[state=selected]:bg-muted/50",
//                 cellBorder && "[&_>:last-child]:border-e-0"
//               )}
//             >
//               {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
//                 <td
//                   key={cell.id}
//                   className={cn(
//                     bodyCellSpacing,
//                     cellBorder && "border-e",
//                     "align-middle [&:has([role=checkbox])]:pe-0",
//                     cell.column.columnDef.meta?.cellClassName
//                   )}
//                 >
//                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                 </td>
//               ))}
//             </tr>
//           ))
//         ) : (
//           <DataGridEmpty />
//         )}
//         {isOpen && (
//           <tr className="border-b bg-muted/10">
//             {table.getAllColumns().map((column, i) => {
//               let cellContent;

//               if (i === table.getAllColumns().length - 1) {
//                 // If it's the first column, render a button
//                 cellContent = (
//                   <button
//                     onClick={() =>
//                       console.log(`Button clicked for column: ${column.id}`)
//                     }
//                     className="w-full border rounded px-2 py-1 outline-none btn-primary"
//                   >
//                     +
//                   </button>
//                 );
//               } else if (i !== 0) {
//                 // For other columns (except the last), render an input
//                 cellContent = (
//                   <input
//                     type="text"
//                     placeholder={`Enter ${column.id}`}
//                     className="w-full border rounded px-2 py-1 outline-none"
//                   />
//                 );
//               }

//               // Render the `td` with the prepared content
//               return (
//                 <td
//                   key={column.id}
//                   className={cn(bodyCellSpacing, cellBorder && "border-e")}
//                 >
//                   {cellContent}
//                 </td>
//               );
//             })}
//           </tr>
//         )}
//       </tbody>
//     </table>
//   );
// };

// export { DataGridTable };
import React, { useState } from "react";
import { DataGridEmpty, TDataGridLayoutCellSpacing } from ".";
import { flexRender, HeaderGroup, Row, Cell } from "@tanstack/react-table";
import { useDataGrid } from ".";
import { cn } from "@/lib/utils";

const DataGridTable = <TData,>() => {
  const { table, props } = useDataGrid();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const headCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
    xs: "px-2.5",
    sm: "px-3",
    md: "px-4",
    lg: "px-6",
  };
  const bodyCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
    xs: "p-2.5",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const headCellSpacing = props.layout?.cellSpacing
    ? headCellSpacingOptions[props.layout?.cellSpacing]
    : headCellSpacingOptions["md"];
  const bodyCellSpacing = props.layout?.cellSpacing
    ? bodyCellSpacingOptions[props.layout?.cellSpacing]
    : bodyCellSpacingOptions["md"];
  const cellBorder = props.layout?.cellBorder ?? false;

  const handleInputChange = (columnId: string, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [columnId]: value,
    }));
  };

  return (
    <table
      className={cn(
        "w-full align-middle text-left rtl:text-right caption-bottom text-sm",
        props.layout?.classes?.table
      )}
      data-table
    >
      <thead className="[&_tr]:border-b">
        {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
          <tr
            key={headerGroup.id}
            className={cn(
              "border-b bg-muted/30 data-[state=selected]:bg-muted",
              cellBorder && "[&_>:last-child]:border-e-0"
            )}
          >
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className={cn(
                  headCellSpacing,
                  cellBorder && "border-e",
                  "h-12 text-left rtl:text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pe-0",
                  header.column.columnDef.meta?.headerClassName
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row: Row<TData>) => (
            <tr
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className={cn(
                "border-b hover:bg-muted/30 data-[state=selected]:bg-muted/50",
                cellBorder && "[&_>:last-child]:border-e-0"
              )}
            >
              {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                <td
                  key={cell.id}
                  className={cn(
                    bodyCellSpacing,
                    cellBorder && "border-e",
                    "align-middle [&:has([role=checkbox])]:pe-0",
                    cell.column.columnDef.meta?.cellClassName
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <DataGridEmpty />
        )}
        {/* {isOpen && (
          <tr className="border-b bg-muted/10">
            {table.getAllColumns().map((column, i) => {
              let cellContent;

              if (i === table.getAllColumns().length - 1) {
                cellContent = (
                  <button
                    onClick={() => console.log(inputValues)}
                    className="w-full border rounded px-2 py-1 outline-none btn-primary"
                  >
                    +
                  </button>
                );
              } else if (i !== 0) {
                cellContent = (
                  <input
                    type="text"
                    placeholder={`Enter ${column.id}`}
                    value={inputValues[column.id] || ""}
                    onChange={(e) =>
                      handleInputChange(column.id, e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 outline-none"
                  />
                );
              }

              return (
                <td
                  key={column.id}
                  className={cn(bodyCellSpacing, cellBorder && "border-e")}
                >
                  {cellContent}
                </td>
              );
            })}
          </tr>
        )} */}
      </tbody>
    </table>
  );
};

export { DataGridTable };
