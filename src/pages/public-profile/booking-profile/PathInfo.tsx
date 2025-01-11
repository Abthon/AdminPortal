// import { formatDistanceToNow } from "date-fns";
// import { decode, encode } from "@googlemaps/polyline-codec";
// import { useEffect,useState } from "react";
// import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';

// export function timeAgo(dateISO: string): string {
//   const date = new Date(dateISO);
//   return formatDistanceToNow(date, { addSuffix: true });
// }

// export function decodePolyline(encodedStr: string) {
//   if(encodedStr){
//     let decodedPolyline = decode(encodedStr);
//     console.log(decodedPolyline, "decoded polylines");
//     return decodedPolyline;
//   }
// }

// interface PathInfoProps {
//   data: any;
// }

// const PathInfo: React.FC<PathInfoProps> = ({ data }) => {
//   const [cordinates, setCordinates] = useState([])
//   useEffect(() => {
//     decodePolyline(data.estimatedTraveledPath);
//   }, []);


//   return (
//     <div className="card pb-2.5">
//       <div className="card-header" id="path-info">
//         <h3 className="card-title">Path Information</h3>
//       </div>
//       <div className="card-body grid gap-5">
//         <div className="w-full">
//           {/* <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
//             <label className="form-label flex items-center gap-1 max-w-56">
//               polyline
//             </label>
//             <label className="form-label flex items-center gap-1 max-w-56">
//               {data.polyline}
//             </label>
//           </div> */}
//         </div>

//         <div className="w-full">
//           <MapContainer zoom={13} style={{ height: '500px', width: '100%' }}>
//             {/* OpenStreetMap Tile Layer */}
//             <TileLayer
//               attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />

//             {/* Plot Markers */}
//             {cordinates.map((position, idx) => (
//               <Marker key={idx} position={position}>
//                 <Popup>
//                   <span>
//                     Point {idx + 1}: [{position[0]}, {position[1]}]
//                   </span>
//                 </Popup>
//               </Marker>
//             ))}

//             {/* Draw Polyline */}
//             <Polyline positions={cordinates} color="blue" />
//           </MapContainer>
//           {/* <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
//             <label className="form-label flex items-center gap-1 max-w-56">
//               estimatedTraveledPath
//             </label>
//             <label className="form-label flex items-center gap-1 max-w-56">
//               {data.estimatedTraveledPath}
//             </label>
//           </div> */}
//         </div>
//         <div className="w-full">
//           {/* <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
//             <label className="form-label flex items-center gap-1 max-w-56">
//               actualTraveledPath
//             </label>
//             <label className="form-label flex items-center gap-1 max-w-56">
//               {data.actualTraveledPath}
//             </label>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export { PathInfo };

// src/pages/public-profile/booking-profile/blocks/PathInfo.tsx

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { decode, encode } from "@googlemaps/polyline-codec";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Type definitions for coordinates
type Coordinates = [number, number][];

// Type definitions for PathInfo props
interface PathInfoProps {
  data: {
    estimatedTraveledPath: string;
    // Add other relevant fields if necessary
  };
}

// Utility function to format time ago
export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

// Utility function to decode polyline
export function decodePolyline(encodedStr: string): Coordinates | undefined {
  if (encodedStr) {
    const decodedPolyline = decode(encodedStr);
    console.log(decodedPolyline, "decoded polylines");
    return decodedPolyline;
  }
  return undefined;
}

// Custom component to fit map bounds to polyline
const FitBounds: React.FC<{ coordinates: Coordinates }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
};

const PathInfo: React.FC<PathInfoProps> = ({ data }) => {
  const [coordinates, setCoordinates] = useState<Coordinates>([]);

  useEffect(() => {
    try {
      const decoded = decodePolyline(data.estimatedTraveledPath);
      if (decoded) {
        setCoordinates(decoded);
      } else {
        console.error("Failed to decode polyline.");
      }
    } catch (error) {
      console.error("Error decoding polyline:", error);
    }
  }, [data.estimatedTraveledPath]);

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="path-info">
        <h3 className="card-title">Path Information</h3>
      </div>
      <div className="card-body grid gap-5">
        {/* Optional: Display raw polyline strings */}
        {/* <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Polyline
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.polyline}
            </label>
          </div>
        </div> */}

        <div className="w-full">
          <MapContainer
            center={coordinates[0] || [0, 0]}
            zoom={13}
            style={{ height: "500px", width: "100%" }}
          >
            {/* Automatically fit map bounds */}
            <FitBounds coordinates={coordinates} />

            {/* OpenStreetMap Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Plot Markers */}
            {coordinates.map((position, idx) => (
              <Marker key={idx} position={position}>
                <Popup>
                  <span>
                    Point {idx + 1}: [{position[0]}, {position[1]}]
                  </span>
                </Popup>
              </Marker>
            ))}

            {/* Draw Polyline */}
            {coordinates.length > 1 && (
              <Polyline positions={coordinates} color="blue" weight={4} />
            )}
          </MapContainer>

          {/* Optional: Display raw polyline strings */}
          {/* <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Estimated Traveled Path
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.estimatedTraveledPath}
            </label>
          </div> */}
        </div>

        {/* Optional: Display actualTraveledPath */}
        {/* <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Actual Traveled Path
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.actualTraveledPath}
            </label>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export { PathInfo };
