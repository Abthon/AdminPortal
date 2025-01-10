// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// interface IProfileRow {
//   icon: string;
//   text: string;
//   info: boolean;
// }
// interface IProfileRows extends Array<IProfileRow> {}

// interface DriverLocationProps {
//   data: any;
// }

// interface IProfileProduct {
//   label: string;
// }
// interface IProfileProducts extends Array<IProfileProduct> {}

// const DriverLocation: React.FC<DriverLocationProps> = ({ data }) => {
//   console.log(data, "new data");
//   const lat = data?.lat || 40.724716;
//   const lng = data?.lng || -73.984789;

//   const validDrivers = data?.filter((driver: any) => driver.lat && driver.lng);

//   const customIcon = L.divIcon({
//     html: `<i class="ki-solid ki-geolocation text-3xl text-success"></i>`,
//     className: "leaflet-marker",
//     bgPos: [10, 10],
//     iconAnchor: [20, 37],
//     popupAnchor: [0, -37],
//   });

//   const mapCenter =
//     validDrivers?.length > 0
//       ? [parseFloat(validDrivers[0]?.lat!), parseFloat(validDrivers[0]?.lng!)]
//       : [40.724716, -73.984789];

//   console.log(mapCenter, "here");

//   return (
//     <div className="card">
//       <div className="card-header">
//         <h3 className="card-title">Driver Location</h3>
//       </div>
//       <div className="card-body">
//         <div className="flex flex-wrap items-center gap-5 mb-10">
//           <MapContainer
//             center={[lat, lng]}
//             zoom={30}
//             className="rounded-xl w-full md:w-80 min-h-52"
//             style={{ width: "100%" }}
//           >
//             <TileLayer
//               attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//             {validDrivers?.map((driver: any) => (
//               <Marker
//                 key={driver?.id}
//                 position={[parseFloat(driver?.lat!), parseFloat(driver?.lng!)]}
//                 icon={customIcon}
//               >
//                 <Popup>
//                   {driver?.firstName} {driver?.lastName}
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export {
//   DriverLocation,
//   type IProfileRow,
//   type IProfileRows,
//   type IProfileProduct,
//   type IProfileProducts,
// };

// // import axiosInstance from "@/auth/_helpers";
// // import {
// //   ChannelStats,
// //   EarningsChart,
// //   EntryCallout,
// //   Highlights,
// //   TeamMeeting,
// //   Teams,
// // } from "./blocks";
// // import { DriverLocation } from "./blocks/DriverLocation";
// // import { useQuery } from "react-query";

// // const obj = {
// //   id: 25,
// //   createdAt: "2024-12-30T02:48:28.000Z",
// //   firstName: "Jhon",
// //   middleName: null,
// //   lastName: "Doee",
// //   phoneNumber: "911094668",
// //   isPhoneNumberAuthenticated: false,
// //   type: "payroll",
// //   drivingLicense: "abc123",
// //   gender: "male",
// //   is_online: false,
// //   is_available: false,
// //   isBusy: false,
// //   lat: null,
// //   lng: null,
// //   averageRating: 0,
// //   status: "pending",
// //   profilePhoto: "1735526907796-photo_2023-10-28_09-45-14.jpg",
// //   firebaseToken: "string",
// //   vehicle: null,
// //   bookings: [],
// // };

// // interface IDriversData {
// //   id: string;
// //   firstName: string;
// //   lastName: string;
// //   phoneNumber: string;
// //   gender: string;
// //   status: string;
// //   profilePhoto: string;
// //   type: string;
// // }

// // // const Demo1LightSidebarContent = () => {
// // //   async function getDrivers() {
// // //     const url = `/api/v1/drivers`;
// // //     const { data } = await axiosInstance.get(url);
// // //     return data.data;
// // //   }

// // //   let { isLoading: isDriverLoading, data: DriverData } = useQuery<
// // //     IDriversData[]
// // //   >({
// // //     queryKey: ["Bookings"],
// // //     queryFn: getDrivers,
// // //   });

// //   return (
// //     <div className="grid gap-5 lg:gap-7.5">
// //       <div className="grid lg:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">
// //         <div className="lg:col-span-1">
// //           <div className="grid grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
// //             <ChannelStats />
// //           </div>
// //         </div>

// //         <div className="lg:col-span-2">
// //           <EntryCallout className="h-full" />
// //         </div>
// //       </div>

// //       <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
// //         <div className="lg:col-span-1">
// //           <Highlights limit={3} />
// //         </div>

// //         <div className="lg:col-span-2">
// //           {/* <DriverLocation data={DriverData} /> */}
// //         </div>
// //       </div>

// //       <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
// //         <div className="lg:col-span-1">
// //           <TeamMeeting />
// //         </div>

// //         <div className="lg:col-span-2">
// //           <Teams />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export { Demo1LightSidebarContent };
